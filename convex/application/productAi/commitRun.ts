import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { productAiError } from "./productAiError";

type MarkdownEdit = {
  end?: number;
  insertPosition?:
    | "start"
    | "end"
    | "before_selection"
    | "after_selection"
    | "after_heading";
  kind:
    | "replace_all"
    | "replace_selection"
    | "insert"
    | "patch"
    | "outline"
    | "comment_only";
  markdown?: string;
  start?: number;
  targetHeading?: string;
};

type FormEdit = {
  field:
    | "name"
    | "tagline"
    | "projectType"
    | "teamSize"
    | "productUrl"
    | "githubUrl"
    | "roles";
  label?: string;
  value: string | string[];
};

type CommitRunArgs = {
  assistantText: string;
  attachmentContexts: Array<{
    analysisText?: string;
    error?: string;
    kind: "image" | "audio" | "pdf" | "other";
    mimeType?: string;
    name?: string;
    status: "ready" | "error";
    storageId?: Id<"_storage">;
  }>;
  baseContentHash: string;
  proposals: Array<{
    baseContentHash: string;
    edits: MarkdownEdit[];
    formEdits?: FormEdit[];
    kind:
      | "replace_all"
      | "replace_selection"
      | "insert"
      | "patch"
      | "outline"
      | "comment_only"
      | "form_update";
    summary: string;
    title: string;
  }>;
  runId: Id<"productAiRuns">;
  stopReason: string;
};

export async function commitRun(ctx: MutationCtx, args: CommitRunArgs) {
  const run = await ctx.db.get("productAiRuns", args.runId);
  if (run === null || run.status !== "running") {
    return null;
  }
  const thread = await ctx.db.get("productAiThreads", run.threadId);
  if (thread === null || thread.userId !== run.userId) {
    throw productAiError("THREAD_NOT_FOUND");
  }

  const now = Date.now();
  const assistantMessageId = await ctx.db.insert("productAiMessages", {
    content: args.assistantText,
    createdAt: now,
    role: "assistant",
    threadId: run.threadId,
    userId: run.userId,
  });
  const proposalIds: Id<"productAiProposals">[] = [];
  for (const proposal of args.proposals) {
    const proposalId = await ctx.db.insert("productAiProposals", {
      assistantMessageId,
      baseContentHash: proposal.baseContentHash,
      createdAt: now,
      edits: proposal.edits,
      formEdits: proposal.formEdits,
      kind: proposal.kind,
      status: "pending",
      summary: proposal.summary,
      threadId: run.threadId,
      title: proposal.title,
      updatedAt: now,
      userId: run.userId,
    });
    proposalIds.push(proposalId);
  }
  for (const attachmentContext of args.attachmentContexts) {
    await ctx.db.insert("productAiAttachmentContexts", {
      analysisText: attachmentContext.analysisText,
      createdAt: now,
      error: attachmentContext.error,
      kind: attachmentContext.kind,
      mimeType: attachmentContext.mimeType,
      name: attachmentContext.name,
      status: attachmentContext.status,
      storageId: attachmentContext.storageId,
      threadId: run.threadId,
      updatedAt: now,
      userId: run.userId,
    });
  }

  await ctx.db.patch("productAiRuns", run._id, {
    assistantMessageId,
    baseContentHash: args.baseContentHash,
    completedAt: now,
    errorCode: undefined,
    nextRetryAt: undefined,
    phase: "completed",
    proposalIds,
    scheduledFunctionId: undefined,
    status: "succeeded",
    stopReason: args.stopReason,
    updatedAt: now,
  });
  await ctx.db.patch("productAiThreads", thread._id, { updatedAt: now });
  return null;
}
