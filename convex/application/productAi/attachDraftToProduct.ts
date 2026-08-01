import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

const MAX_DRAFT_KEY_LENGTH = 200;
const MAX_DRAFT_REPO_CONTEXTS = 100;
const MAX_DRAFT_RUNS = 100;

export async function assertProductAiDraftIsUnsaved(
  ctx: MutationCtx,
  userId: Id<"users">,
  draftKey: string,
) {
  const draft = await loadDraftResources(ctx, userId, draftKey);
  const linkedProductIds = collectLinkedProductIds(draft);
  if (linkedProductIds.size > 1) {
    throw draftAttachmentError("DRAFT_CONTEXT_CONFLICT");
  }
  if (linkedProductIds.size === 1) {
    throw draftAttachmentError("DRAFT_ALREADY_SAVED");
  }
  return draft.draftKey;
}

export async function attachProductAiDraftToProduct(
  ctx: MutationCtx,
  userId: Id<"users">,
  draftKey: string,
  productId: Id<"products">,
) {
  const draft = await loadDraftResources(ctx, userId, draftKey);
  const linkedProductIds = collectLinkedProductIds(draft);
  for (const linkedProductId of linkedProductIds) {
    if (linkedProductId !== productId) {
      throw draftAttachmentError("DRAFT_CONTEXT_CONFLICT");
    }
  }

  const now = Date.now();
  if (draft.thread === null) {
    await ctx.db.insert("productAiThreads", {
      createdAt: now,
      draftKey: draft.draftKey,
      productId,
      repoContextId: draft.repoContexts[0]?._id,
      updatedAt: now,
      userId,
    });
  } else {
    await ctx.db.patch("productAiThreads", draft.thread._id, {
      productId,
      updatedAt: now,
    });
  }
  for (const run of draft.runs) {
    await ctx.db.patch("productAiRuns", run._id, {
      productId,
      updatedAt: now,
    });
  }
  for (const repoContext of draft.repoContexts) {
    await ctx.db.patch("productRepoContexts", repoContext._id, {
      productId,
      updatedAt: now,
    });
  }
}

async function loadDraftResources(
  ctx: MutationCtx,
  userId: Id<"users">,
  draftKey: string,
) {
  const normalizedDraftKey = normalizeDraftKey(draftKey);
  const threads = await ctx.db
    .query("productAiThreads")
    .withIndex("by_user_draft", (q) =>
      q.eq("userId", userId).eq("draftKey", normalizedDraftKey),
    )
    .take(2);
  if (threads.length > 1) {
    throw draftAttachmentError("DRAFT_CONTEXT_CONFLICT");
  }
  const thread = threads[0] ?? null;
  const runs =
    thread === null
      ? []
      : await ctx.db
          .query("productAiRuns")
          .withIndex("by_thread_created", (q) => q.eq("threadId", thread._id))
          .order("desc")
          .take(MAX_DRAFT_RUNS + 1);
  if (runs.length > MAX_DRAFT_RUNS) {
    throw draftAttachmentError("DRAFT_TOO_LARGE");
  }
  if (runs.some((run) => run.userId !== userId)) {
    throw draftAttachmentError("DRAFT_CONTEXT_CONFLICT");
  }

  const repoContexts = await ctx.db
    .query("productRepoContexts")
    .withIndex("by_user_draft_updated", (q) =>
      q.eq("userId", userId).eq("draftKey", normalizedDraftKey),
    )
    .order("desc")
    .take(MAX_DRAFT_REPO_CONTEXTS + 1);
  if (repoContexts.length > MAX_DRAFT_REPO_CONTEXTS) {
    throw draftAttachmentError("DRAFT_TOO_LARGE");
  }

  return {
    draftKey: normalizedDraftKey,
    repoContexts,
    runs,
    thread,
  };
}

function collectLinkedProductIds(
  draft: Awaited<ReturnType<typeof loadDraftResources>>,
) {
  const productIds = new Set<Id<"products">>();
  if (draft.thread?.productId !== undefined) {
    productIds.add(draft.thread.productId);
  }
  for (const run of draft.runs) {
    if (run.productId !== undefined) {
      productIds.add(run.productId);
    }
  }
  for (const repoContext of draft.repoContexts) {
    if (repoContext.productId !== undefined) {
      productIds.add(repoContext.productId);
    }
  }
  return productIds;
}

function normalizeDraftKey(draftKey: string) {
  const normalized = draftKey.trim();
  if (
    normalized.length === 0 ||
    normalized.length > MAX_DRAFT_KEY_LENGTH
  ) {
    throw draftAttachmentError("INVALID_DRAFT_KEY");
  }
  return normalized;
}

type DraftAttachmentErrorCode =
  | "DRAFT_ALREADY_SAVED"
  | "DRAFT_CONTEXT_CONFLICT"
  | "DRAFT_TOO_LARGE"
  | "INVALID_DRAFT_KEY";

function draftAttachmentError(code: DraftAttachmentErrorCode) {
  const messages: Record<DraftAttachmentErrorCode, string> = {
    DRAFT_ALREADY_SAVED: "This draft has already been saved as a product.",
    DRAFT_CONTEXT_CONFLICT:
      "The Product AI draft is linked to conflicting product data.",
    DRAFT_TOO_LARGE: "The Product AI draft is too large to attach safely.",
    INVALID_DRAFT_KEY: "The Product AI draft key is invalid.",
  };
  return new ConvexError({ code, message: messages[code] });
}
