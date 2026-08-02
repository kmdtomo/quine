import { internal } from "../../_generated/api";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { githubError } from "../../lib/githubErrors";

const MAX_ATTEMPTS = 3;

type StartTechnologyAnalysisArgs = {
  githubInstallationId?: Id<"githubInstallations">;
};

export async function startTechnologyAnalysis(
  ctx: MutationCtx,
  userId: Id<"users">,
  args: StartTechnologyAnalysisArgs,
) {
  const installation =
    args.githubInstallationId === undefined
      ? await ctx.db
          .query("githubInstallations")
          .withIndex("by_user_status", (q) =>
            q.eq("userId", userId).eq("status", "active"),
          )
          .order("desc")
          .first()
      : await ctx.db.get(
          "githubInstallations",
          args.githubInstallationId,
        );
  if (!installation) {
    throw githubError("GITHUB_INSTALLATION_NOT_FOUND");
  }
  if (
    installation.userId !== userId ||
    installation.status !== "active" ||
    installation.accountType !== "User" ||
    installation.accountId !== installation.verifiedByGithubId
  ) {
    throw githubError("GITHUB_INSTALLATION_NOT_FOUND");
  }

  const [queued, running] = await Promise.all([
    ctx.db
      .query("githubAnalysisRuns")
      .withIndex("by_installation_status", (q) =>
        q
          .eq("githubInstallationId", installation._id)
          .eq("status", "queued"),
      )
      .first(),
    ctx.db
      .query("githubAnalysisRuns")
      .withIndex("by_installation_status", (q) =>
        q
          .eq("githubInstallationId", installation._id)
          .eq("status", "running"),
      )
      .first(),
  ]);
  const activeRun = running ?? queued;
  if (activeRun) {
    return { runId: activeRun._id };
  }

  const now = Date.now();
  const runId = await ctx.db.insert("githubAnalysisRuns", {
    analyzedRepositoryCount: 0,
    attempt: 0,
    createdAt: now,
    detectedTechnologies: [],
    githubInstallationId: installation._id,
    idempotencyKey: `${userId}:technology:${installation._id}:${now}`,
    kind: "technology_analysis",
    maxAttempts: MAX_ATTEMPTS,
    phase: "queued",
    repositoryCount: 0,
    requestCount: 0,
    requestLimit: 0,
    status: "queued",
    updatedAt: now,
    userId: userId,
    warningCodes: [],
  });
  const scheduledFunctionId = await ctx.scheduler.runAfter(
    0,
    internal.githubAction.analyzeRepos,
    { runId },
  );
  await ctx.db.patch("githubAnalysisRuns", runId, {
    scheduledFunctionId,
  });
  return { runId };
}
