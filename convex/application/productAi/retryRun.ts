import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { productAiError } from "./productAiError";
import { findActiveRun } from "./runState";
import { requireOwnedThread } from "./threadAccess";

type RetryRunArgs = {
  runId: Id<"productAiRuns">;
};

export async function retryRun(
  ctx: MutationCtx,
  userId: Id<"users">,
  { runId }: RetryRunArgs,
) {
  const run = await ctx.db.get("productAiRuns", runId);
  if (run === null || run.userId !== userId) {
    throw productAiError("RUN_NOT_FOUND");
  }
  await requireOwnedThread(ctx, run.threadId, userId);
  if (run.status !== "failed" || run.attempt >= run.maxAttempts) {
    throw productAiError("RUN_NOT_RETRYABLE");
  }
  const activeRun = await findActiveRun(ctx, run.threadId);
  if (activeRun !== null) {
    throw productAiError("ACTIVE_RUN_EXISTS");
  }

  const scheduledFunctionId = await ctx.scheduler.runAfter(
    0,
    internal.productAiAction.run,
    { runId: run._id },
  );
  await ctx.db.patch("productAiRuns", run._id, {
    completedAt: undefined,
    errorCode: undefined,
    nextRetryAt: undefined,
    phase: "queued",
    scheduledFunctionId,
    status: "queued",
    updatedAt: Date.now(),
  });
  return { runId: run._id };
}
