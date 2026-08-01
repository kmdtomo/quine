import { internal } from "../../_generated/api";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { createMarkdownContentHash } from "../../lib/productAi/hash";
import { MAX_ATTACHMENTS, productAiError } from "./productAiError";
import { findActiveRun } from "./runState";
import {
  findLatestRepoContext,
  findThreadForUser,
  normalizeLocator,
  requireEditableProduct,
  type ThreadLocator,
} from "./threadAccess";

const MAX_ATTACHMENT_BYTES = 6 * 1024 * 1024;
const MAX_IDEMPOTENCY_KEY_LENGTH = 160;
const MAX_PRODUCT_AI_ATTEMPTS = 3;
const MAX_USER_MESSAGE_LENGTH = 4000;
const MAX_CURRENT_MARKDOWN_LENGTH = 40000;

type StartRunArgs = {
  attachments?: Array<{
    mimeType: string;
    name: string;
    size: number;
    storageId: Id<"_storage">;
  }>;
  currentMarkdown: string;
  draftKey?: string;
  idempotencyKey: string;
  message: string;
  productContext: {
    githubUrl?: string;
    name?: string;
    productUrl?: string;
    projectType?: "personal" | "work" | "open_source";
    roles: string[];
    tagline?: string;
    teamSize?: "solo" | "2-5" | "6-10" | "11-30" | "31+";
    technologyKeys: string[];
  };
  productId?: Id<"products">;
  selectionContext?: {
    end: number;
    start: number;
    text: string;
  };
};

export async function startRun(
  ctx: MutationCtx,
  user: Doc<"users">,
  args: StartRunArgs,
) {
  const locator = normalizeLocator(args);
  if (locator.productId !== undefined) {
    await requireEditableProduct(ctx, locator.productId, user);
  }

  const idempotencyKey = normalizeIdempotencyKey(args.idempotencyKey);
  const existingRun = await ctx.db
    .query("productAiRuns")
    .withIndex("by_user_idempotency", (q) =>
      q.eq("userId", user._id).eq("idempotencyKey", idempotencyKey),
    )
    .first();
  if (existingRun !== null) {
    return {
      runId: existingRun._id,
      threadId: existingRun.threadId,
    };
  }

  const message = normalizeMessage(args.message);
  if (args.currentMarkdown.length > MAX_CURRENT_MARKDOWN_LENGTH) {
    throw productAiError("MARKDOWN_TOO_LONG");
  }
  const attachments = await validateAttachments(ctx, args.attachments ?? []);
  const thread = await ensureThread(ctx, user._id, locator);
  const activeRun = await findActiveRun(ctx, thread._id);
  if (activeRun !== null) {
    throw productAiError("ACTIVE_RUN_EXISTS");
  }

  const now = Date.now();
  const userMessageId = await ctx.db.insert("productAiMessages", {
    content: message,
    createdAt: now,
    role: "user",
    threadId: thread._id,
    userId: user._id,
  });
  const runId = await ctx.db.insert("productAiRuns", {
    attachments,
    attempt: 0,
    createdAt: now,
    currentMarkdown: args.currentMarkdown,
    currentMarkdownHash: createMarkdownContentHash(args.currentMarkdown),
    draftKey: locator.draftKey,
    idempotencyKey,
    maxAttempts: MAX_PRODUCT_AI_ATTEMPTS,
    phase: "queued",
    productContext: args.productContext,
    productId: locator.productId,
    proposalIds: [],
    selectionContext: args.selectionContext,
    status: "queued",
    threadId: thread._id,
    updatedAt: now,
    userId: user._id,
    userMessageId,
  });
  const scheduledFunctionId = await ctx.scheduler.runAfter(
    0,
    internal.productAiAction.run,
    { runId },
  );
  await ctx.db.patch("productAiRuns", runId, { scheduledFunctionId });
  await ctx.db.patch("productAiThreads", thread._id, {
    updatedAt: now,
  });

  return {
    runId,
    threadId: thread._id,
  };
}

async function validateAttachments(
  ctx: MutationCtx,
  attachments: {
    mimeType: string;
    name: string;
    size: number;
    storageId: Id<"_storage">;
  }[],
) {
  if (attachments.length > MAX_ATTACHMENTS) {
    throw productAiError("TOO_MANY_ATTACHMENTS");
  }

  const validated = [];
  const storageIds = new Set<Id<"_storage">>();
  for (const attachment of attachments) {
    if (storageIds.has(attachment.storageId)) {
      throw productAiError("DUPLICATE_ATTACHMENT");
    }
    storageIds.add(attachment.storageId);

    const metadata = await ctx.db.system.get("_storage", attachment.storageId);
    if (metadata === null) {
      throw productAiError("ATTACHMENT_NOT_FOUND");
    }
    if (
      metadata.contentType === undefined ||
      !metadata.contentType.startsWith("image/")
    ) {
      throw productAiError("UNSUPPORTED_ATTACHMENT");
    }
    if (metadata.size > MAX_ATTACHMENT_BYTES) {
      throw productAiError("ATTACHMENT_TOO_LARGE");
    }
    validated.push({
      mimeType: metadata.contentType,
      name: normalizeAttachmentName(attachment.name),
      size: metadata.size,
      storageId: attachment.storageId,
    });
  }
  return validated;
}

async function ensureThread(
  ctx: MutationCtx,
  userId: Id<"users">,
  locator: ThreadLocator,
) {
  const existing = await findThreadForUser(ctx, userId, locator);
  const now = Date.now();
  const repoContext = await findLatestRepoContext(ctx, userId, locator);
  if (existing !== null) {
    await ctx.db.patch("productAiThreads", existing._id, {
      ...(repoContext === null ? {} : { repoContextId: repoContext._id }),
      updatedAt: now,
    });
    return existing;
  }

  const threadId = await ctx.db.insert("productAiThreads", {
    createdAt: now,
    draftKey: locator.draftKey,
    productId: locator.productId,
    repoContextId: repoContext?._id,
    updatedAt: now,
    userId,
  });
  const thread = await ctx.db.get("productAiThreads", threadId);
  if (thread === null) {
    throw productAiError("THREAD_NOT_FOUND");
  }
  return thread;
}

function normalizeIdempotencyKey(idempotencyKey: string) {
  const normalized = idempotencyKey.trim();
  if (
    normalized.length === 0 ||
    normalized.length > MAX_IDEMPOTENCY_KEY_LENGTH
  ) {
    throw productAiError("INVALID_IDEMPOTENCY_KEY");
  }
  return normalized;
}

function normalizeMessage(message: string) {
  const normalized = message.trim();
  if (
    normalized.length === 0 ||
    normalized.length > MAX_USER_MESSAGE_LENGTH
  ) {
    throw productAiError(
      normalized.length === 0 ? "MESSAGE_REQUIRED" : "MESSAGE_TOO_LONG",
    );
  }
  return normalized;
}

function normalizeAttachmentName(name: string) {
  const normalized = name.trim();
  return (normalized.length === 0 ? "attachment" : normalized).slice(0, 160);
}
