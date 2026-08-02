import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { commitRun as commitRunUseCase } from "./application/productAi/commitRun";
import { productAiError } from "./application/productAi/productAiError";
import { retryRun as retryRunUseCase } from "./application/productAi/retryRun";
import { startRun as startRunUseCase } from "./application/productAi/startRun";
import {
  findLatestRepoContext,
  findReadableThread,
  normalizeLocator,
  requireOwnedThread,
} from "./application/productAi/threadAccess";
import { requireUser } from "./lib/auth";

const MAX_AGENT_MESSAGES = 24;
const MAX_THREAD_ATTACHMENTS = 20;
const MAX_THREAD_MESSAGES = 80;
const MAX_THREAD_PROPOSALS = 50;
const MAX_THREAD_RUNS = 20;

const productProjectType = v.union(
  v.literal("personal"),
  v.literal("work"),
  v.literal("open_source"),
);

const productTeamSize = v.union(
  v.literal("solo"),
  v.literal("2-5"),
  v.literal("6-10"),
  v.literal("11-30"),
  v.literal("31+"),
);

const productAiMessageRole = v.union(
  v.literal("user"),
  v.literal("assistant"),
);

const productAiProposalTransition = v.union(
  v.literal("applied"),
  v.literal("discarded"),
);

const productAiProposalStatus = v.union(
  v.literal("pending"),
  v.literal("applied"),
  v.literal("discarded"),
);

const productAiRunStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
);

const productAiRunPhase = v.union(
  v.literal("queued"),
  v.literal("loading_context"),
  v.literal("running_agent"),
  v.literal("persisting_results"),
  v.literal("completed"),
);

const productAiActivePhase = v.union(
  v.literal("loading_context"),
  v.literal("running_agent"),
  v.literal("persisting_results"),
);

const productAiMarkdownEditKind = v.union(
  v.literal("replace_all"),
  v.literal("replace_selection"),
  v.literal("insert"),
  v.literal("patch"),
  v.literal("outline"),
  v.literal("comment_only"),
);

const productAiProposalKind = v.union(
  v.literal("replace_all"),
  v.literal("replace_selection"),
  v.literal("insert"),
  v.literal("patch"),
  v.literal("outline"),
  v.literal("comment_only"),
  v.literal("form_update"),
);

const productAiInsertPosition = v.union(
  v.literal("start"),
  v.literal("end"),
  v.literal("before_selection"),
  v.literal("after_selection"),
  v.literal("after_heading"),
);

const productAiMarkdownEdit = v.object({
  end: v.optional(v.number()),
  insertPosition: v.optional(productAiInsertPosition),
  kind: productAiMarkdownEditKind,
  markdown: v.optional(v.string()),
  start: v.optional(v.number()),
  targetHeading: v.optional(v.string()),
});

const productAiFormField = v.union(
  v.literal("name"),
  v.literal("tagline"),
  v.literal("projectType"),
  v.literal("teamSize"),
  v.literal("productUrl"),
  v.literal("githubUrl"),
  v.literal("roles"),
);

const productAiFormEdit = v.object({
  field: productAiFormField,
  label: v.optional(v.string()),
  value: v.union(v.string(), v.array(v.string())),
});

const productAiProductContext = v.object({
  githubUrl: v.optional(v.string()),
  name: v.optional(v.string()),
  productUrl: v.optional(v.string()),
  projectType: v.optional(productProjectType),
  roles: v.array(v.string()),
  tagline: v.optional(v.string()),
  teamSize: v.optional(productTeamSize),
  technologyKeys: v.array(v.string()),
});

const productAiSelectionContext = v.object({
  end: v.number(),
  start: v.number(),
  text: v.string(),
});

const productAiAttachmentInput = v.object({
  mimeType: v.string(),
  name: v.string(),
  size: v.number(),
  storageId: v.id("_storage"),
});

const productAiAttachmentResult = v.object({
  analysisText: v.optional(v.string()),
  error: v.optional(v.string()),
  kind: v.union(
    v.literal("image"),
    v.literal("audio"),
    v.literal("pdf"),
    v.literal("other"),
  ),
  mimeType: v.optional(v.string()),
  name: v.optional(v.string()),
  status: v.union(v.literal("ready"), v.literal("error")),
  storageId: v.optional(v.id("_storage")),
});

const productAiProposalResult = v.object({
  baseContentHash: v.string(),
  edits: v.array(productAiMarkdownEdit),
  formEdits: v.optional(v.array(productAiFormEdit)),
  kind: productAiProposalKind,
  summary: v.string(),
  title: v.string(),
});

const publicThread = v.object({
  _id: v.id("productAiThreads"),
  draftKey: v.optional(v.string()),
  productId: v.optional(v.id("products")),
  updatedAt: v.number(),
});

const publicRepoContext = v.object({
  _id: v.id("productRepoContexts"),
  repositoryFullName: v.string(),
  updatedAt: v.number(),
});

const publicMessage = v.object({
  _id: v.id("productAiMessages"),
  content: v.string(),
  createdAt: v.number(),
  role: productAiMessageRole,
});

const publicProposal = v.object({
  _id: v.id("productAiProposals"),
  appliedAt: v.optional(v.number()),
  assistantMessageId: v.optional(v.id("productAiMessages")),
  baseContentHash: v.string(),
  createdAt: v.number(),
  discardedAt: v.optional(v.number()),
  edits: v.array(productAiMarkdownEdit),
  formEdits: v.optional(v.array(productAiFormEdit)),
  kind: productAiProposalKind,
  status: productAiProposalStatus,
  summary: v.string(),
  title: v.string(),
  updatedAt: v.number(),
});

const publicRun = v.object({
  _id: v.id("productAiRuns"),
  attempt: v.number(),
  completedAt: v.optional(v.number()),
  createdAt: v.number(),
  errorCode: v.optional(v.string()),
  maxAttempts: v.number(),
  phase: productAiRunPhase,
  status: productAiRunStatus,
  updatedAt: v.number(),
});

const repoContextForAgent = v.object({
  defaultBranch: v.optional(v.string()),
  dependencySummary: v.string(),
  description: v.optional(v.string()),
  detectedTechnologyKeys: v.array(v.string()),
  filesRead: v.array(v.string()),
  githubUrl: v.string(),
  primaryLanguage: v.optional(v.string()),
  readmePath: v.optional(v.string()),
  readmeText: v.optional(v.string()),
  repositoryFullName: v.string(),
});

const attachmentContextForAgent = v.object({
  analysisText: v.optional(v.string()),
  error: v.optional(v.string()),
  kind: v.union(
    v.literal("image"),
    v.literal("audio"),
    v.literal("pdf"),
    v.literal("other"),
  ),
  mimeType: v.optional(v.string()),
  name: v.optional(v.string()),
  status: v.union(v.literal("ready"), v.literal("error")),
  storageId: v.optional(v.id("_storage")),
});

export const getEditorState = query({
  args: {
    draftKey: v.optional(v.string()),
    productId: v.optional(v.id("products")),
    threadId: v.optional(v.id("productAiThreads")),
  },
  returns: v.object({
    messages: v.array(publicMessage),
    proposals: v.array(publicProposal),
    repoContext: v.union(v.null(), publicRepoContext),
    runs: v.array(publicRun),
    thread: v.union(v.null(), publicThread),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const locatorCount = [
      args.draftKey,
      args.productId,
      args.threadId,
    ].filter((value) => value !== undefined).length;
    if (locatorCount !== 1) {
      throw productAiError("INVALID_LOCATOR");
    }

    let thread: Doc<"productAiThreads"> | null;
    if (args.productId !== undefined) {
      thread = await findReadableThread(ctx, user, {
        productId: args.productId,
      });
    } else if (args.draftKey !== undefined) {
      thread = await findReadableThread(
        ctx,
        user,
        normalizeLocator({ draftKey: args.draftKey }),
      );
    } else if (args.threadId !== undefined) {
      thread = await requireOwnedThread(ctx, args.threadId, user._id);
    } else {
      thread = null;
    }
    if (thread === null) {
      return {
        messages: [],
        proposals: [],
        repoContext: null,
        runs: [],
        thread: null,
      };
    }

    const [messages, proposals, repoContext, runs] = await Promise.all([
      ctx.db
        .query("productAiMessages")
        .withIndex("by_thread_created", (q) => q.eq("threadId", thread._id))
        .order("desc")
        .take(MAX_THREAD_MESSAGES),
      ctx.db
        .query("productAiProposals")
        .withIndex("by_thread_created", (q) => q.eq("threadId", thread._id))
        .order("desc")
        .take(MAX_THREAD_PROPOSALS),
      findLatestRepoContext(ctx, user._id, thread),
      ctx.db
        .query("productAiRuns")
        .withIndex("by_thread_created", (q) => q.eq("threadId", thread._id))
        .order("desc")
        .take(MAX_THREAD_RUNS),
    ]);

    return {
      messages: messages.reverse().map(toPublicMessage),
      proposals: proposals.map(toPublicProposal),
      repoContext: toPublicRepoContext(repoContext),
      runs: runs.map(toPublicRun),
      thread: {
        _id: thread._id,
        draftKey: thread.draftKey,
        productId: thread.productId,
        updatedAt: thread.updatedAt,
      },
    };
  },
});

export const startRun = mutation({
  args: {
    attachments: v.optional(v.array(productAiAttachmentInput)),
    currentMarkdown: v.string(),
    draftKey: v.optional(v.string()),
    idempotencyKey: v.string(),
    message: v.string(),
    productContext: productAiProductContext,
    productId: v.optional(v.id("products")),
    selectionContext: v.optional(productAiSelectionContext),
  },
  returns: v.object({
    runId: v.id("productAiRuns"),
    threadId: v.id("productAiThreads"),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await startRunUseCase(ctx, user, args);
  },
});

export const retryRun = mutation({
  args: {
    runId: v.id("productAiRuns"),
  },
  returns: v.object({
    runId: v.id("productAiRuns"),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await retryRunUseCase(ctx, user._id, args);
  },
});

export const setProposalStatus = mutation({
  args: {
    proposalId: v.id("productAiProposals"),
    status: productAiProposalTransition,
  },
  returns: v.object({
    proposalId: v.id("productAiProposals"),
    status: productAiProposalTransition,
  }),
  handler: async (ctx, { proposalId, status }) => {
    const user = await requireUser(ctx);
    const proposal = await ctx.db.get("productAiProposals", proposalId);
    if (proposal === null || proposal.userId !== user._id) {
      throw productAiError("PROPOSAL_NOT_FOUND");
    }
    await requireOwnedThread(ctx, proposal.threadId, user._id);
    if (proposal.status !== "pending") {
      throw productAiError("PROPOSAL_ALREADY_RESOLVED");
    }

    const now = Date.now();
    await ctx.db.patch("productAiProposals", proposal._id, {
      appliedAt: status === "applied" ? now : undefined,
      discardedAt: status === "discarded" ? now : undefined,
      status,
      updatedAt: now,
    });
    return {
      proposalId: proposal._id,
      status,
    };
  },
});

export const beginRun = internalMutation({
  args: {
    runId: v.id("productAiRuns"),
  },
  returns: v.object({
    started: v.boolean(),
  }),
  handler: async (ctx, { runId }) => {
    const run = await ctx.db.get("productAiRuns", runId);
    if (
      run === null ||
      run.status !== "queued" ||
      run.attempt >= run.maxAttempts
    ) {
      return { started: false };
    }

    const now = Date.now();
    await ctx.db.patch("productAiRuns", run._id, {
      attempt: run.attempt + 1,
      completedAt: undefined,
      errorCode: undefined,
      nextRetryAt: undefined,
      phase: "loading_context",
      startedAt: now,
      status: "running",
      updatedAt: now,
    });
    return { started: true };
  },
});

export const updateRunPhase = internalMutation({
  args: {
    phase: productAiActivePhase,
    runId: v.id("productAiRuns"),
  },
  returns: v.null(),
  handler: async (ctx, { phase, runId }) => {
    const run = await ctx.db.get("productAiRuns", runId);
    if (run === null || run.status !== "running") {
      return null;
    }
    await ctx.db.patch("productAiRuns", run._id, {
      phase,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const getRunContext = internalQuery({
  args: {
    runId: v.id("productAiRuns"),
  },
  returns: v.union(
    v.null(),
    v.object({
      attachmentContexts: v.array(attachmentContextForAgent),
      conversationMessages: v.array(
        v.object({
          _id: v.id("productAiMessages"),
          content: v.string(),
          createdAt: v.number(),
          role: productAiMessageRole,
        }),
      ),
      repoContext: v.union(v.null(), repoContextForAgent),
      run: v.object({
        attachments: v.array(productAiAttachmentInput),
        currentMarkdown: v.string(),
        currentMarkdownHash: v.string(),
        productContext: productAiProductContext,
        selectionContext: v.optional(productAiSelectionContext),
        threadId: v.id("productAiThreads"),
        userId: v.id("users"),
        userMessageId: v.id("productAiMessages"),
      }),
      userMessage: v.string(),
    }),
  ),
  handler: async (ctx, { runId }) => {
    const run = await ctx.db.get("productAiRuns", runId);
    if (run === null || run.status !== "running") {
      return null;
    }
    const thread = await ctx.db.get("productAiThreads", run.threadId);
    const userMessage = await ctx.db.get("productAiMessages", run.userMessageId);
    if (
      thread === null ||
      thread.userId !== run.userId ||
      userMessage === null ||
      userMessage.threadId !== run.threadId ||
      userMessage.userId !== run.userId ||
      userMessage.role !== "user"
    ) {
      return null;
    }

    const [messages, attachmentContexts, repoContext] = await Promise.all([
      ctx.db
        .query("productAiMessages")
        .withIndex("by_thread_created", (q) => q.eq("threadId", run.threadId))
        .order("desc")
        .take(MAX_AGENT_MESSAGES + 1),
      ctx.db
        .query("productAiAttachmentContexts")
        .withIndex("by_thread_created", (q) => q.eq("threadId", run.threadId))
        .order("desc")
        .take(MAX_THREAD_ATTACHMENTS),
      findLatestRepoContext(ctx, run.userId, {
        draftKey: run.draftKey,
        productId: run.productId,
      }),
    ]);

    return {
      attachmentContexts: attachmentContexts.reverse().map((context) => ({
        analysisText: context.analysisText,
        error: context.error,
        kind: context.kind,
        mimeType: context.mimeType,
        name: context.name,
        status: context.status,
        storageId: context.storageId,
      })),
      conversationMessages: messages
        .reverse()
        .filter((message) => message._id !== userMessage._id)
        .map((message) => ({
          _id: message._id,
          content: message.content,
          createdAt: message.createdAt,
          role: message.role,
        })),
      repoContext:
        repoContext === null
          ? null
          : {
              defaultBranch: repoContext.defaultBranch,
              dependencySummary: repoContext.dependencySummary,
              description: repoContext.description,
              detectedTechnologyKeys: repoContext.detectedTechnologyKeys,
              filesRead: repoContext.filesRead,
              githubUrl: repoContext.githubUrl,
              primaryLanguage: repoContext.primaryLanguage,
              readmePath: repoContext.readmePath,
              readmeText: repoContext.readmeText,
              repositoryFullName: repoContext.repositoryFullName,
            },
      run: {
        attachments: run.attachments,
        currentMarkdown: run.currentMarkdown,
        currentMarkdownHash: run.currentMarkdownHash,
        productContext: run.productContext,
        selectionContext: run.selectionContext,
        threadId: run.threadId,
        userId: run.userId,
        userMessageId: run.userMessageId,
      },
      userMessage: userMessage.content,
    };
  },
});

export const commitRun = internalMutation({
  args: {
    assistantText: v.string(),
    attachmentContexts: v.array(productAiAttachmentResult),
    baseContentHash: v.string(),
    proposals: v.array(productAiProposalResult),
    runId: v.id("productAiRuns"),
    stopReason: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    return await commitRunUseCase(ctx, args);
  },
});

export const failRun = internalMutation({
  args: {
    errorCode: v.string(),
    runId: v.id("productAiRuns"),
  },
  returns: v.null(),
  handler: async (ctx, { errorCode, runId }) => {
    const run = await ctx.db.get("productAiRuns", runId);
    if (
      run === null ||
      (run.status !== "running" && run.status !== "queued")
    ) {
      return null;
    }

    const now = Date.now();
    await ctx.db.patch("productAiRuns", run._id, {
      completedAt: now,
      errorCode: normalizeInternalErrorCode(errorCode),
      nextRetryAt: run.attempt < run.maxAttempts ? now : undefined,
      phase: "completed",
      scheduledFunctionId: undefined,
      status: "failed",
      updatedAt: now,
    });
    return null;
  },
});

function normalizeInternalErrorCode(errorCode: string) {
  const normalized = errorCode.trim().toUpperCase();
  return /^[A-Z0-9_]{1,80}$/.test(normalized)
    ? normalized
    : "PRODUCT_AI_EXECUTION_FAILED";
}

function toPublicMessage(message: Doc<"productAiMessages">) {
  return {
    _id: message._id,
    content: message.content,
    createdAt: message.createdAt,
    role: message.role,
  };
}

function toPublicProposal(proposal: Doc<"productAiProposals">) {
  return {
    _id: proposal._id,
    appliedAt: proposal.appliedAt,
    assistantMessageId: proposal.assistantMessageId,
    baseContentHash: proposal.baseContentHash,
    createdAt: proposal.createdAt,
    discardedAt: proposal.discardedAt,
    edits: proposal.edits,
    formEdits: proposal.formEdits,
    kind: proposal.kind,
    status: proposal.status,
    summary: proposal.summary,
    title: proposal.title,
    updatedAt: proposal.updatedAt,
  };
}

function toPublicRepoContext(
  repoContext: Doc<"productRepoContexts"> | null,
) {
  return repoContext === null
    ? null
    : {
        _id: repoContext._id,
        repositoryFullName: repoContext.repositoryFullName,
        updatedAt: repoContext.updatedAt,
      };
}

function toPublicRun(run: Doc<"productAiRuns">) {
  return {
    _id: run._id,
    attempt: run.attempt,
    completedAt: run.completedAt,
    createdAt: run.createdAt,
    errorCode: run.errorCode,
    maxAttempts: run.maxAttempts,
    phase: run.phase,
    status: run.status,
    updatedAt: run.updatedAt,
  };
}
