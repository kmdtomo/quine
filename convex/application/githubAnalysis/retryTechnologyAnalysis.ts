import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { githubError } from "../../lib/githubErrors";

type RetryTechnologyAnalysisArgs = {
  runId: Id<"githubAnalysisRuns">;
};

export async function retryTechnologyAnalysis(
  ctx: MutationCtx,
  userId: Id<"users">,
  args: RetryTechnologyAnalysisArgs,
) {
  const run = await ctx.db.get("githubAnalysisRuns", args.runId);
  if (!run || run.userId !== userId || run.kind !== "technology_analysis") {
    throw githubError("GITHUB_ANALYSIS_NOT_FOUND");
  }
  if (run.status !== "failed" || run.attempt >= run.maxAttempts) {
    throw githubError("GITHUB_ANALYSIS_NOT_RETRYABLE");
  }

  const installation = await ctx.db.get(
    "githubInstallations",
    run.githubInstallationId,
  );
  if (
    !installation ||
    installation.userId !== userId ||
    installation.status !== "active" ||
    installation.accountType !== "User" ||
    installation.accountId !== installation.verifiedByGithubId
  ) {
    throw githubError("GITHUB_INSTALLATION_NOT_FOUND");
  }

  const now = Date.now();
  const scheduledFunctionId = await ctx.scheduler.runAfter(
    0,
    internal.githubAction.analyzeRepos,
    { runId: run._id },
  );
  await ctx.db.patch("githubAnalysisRuns", run._id, {
    completedAt: undefined,
    errorCode: undefined,
    nextRetryAt: undefined,
    phase: "queued",
    scheduledFunctionId,
    status: "queued",
    updatedAt: now,
  });
  return { runId: run._id };
}
