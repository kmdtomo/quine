import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

export type BeginExecutionResult =
  | {
      status: "rejected";
    }
  | {
      installationId: number;
      status: "ready";
      userId: Id<"users">;
    };

type BeginExecutionArgs = {
  runId: Id<"githubAnalysisRuns">;
};

export async function beginExecution(
  ctx: MutationCtx,
  args: BeginExecutionArgs,
): Promise<BeginExecutionResult> {
  const run = await ctx.db.get("githubAnalysisRuns", args.runId);
  if (
    !run ||
    run.kind !== "technology_analysis" ||
    run.status !== "queued" ||
    run.attempt >= run.maxAttempts
  ) {
    return { status: "rejected" };
  }
  const installation = await ctx.db.get(
    "githubInstallations",
    run.githubInstallationId,
  );
  if (
    !installation ||
    installation.userId !== run.userId ||
    installation.status !== "active" ||
    installation.accountType !== "User" ||
    installation.accountId !== installation.verifiedByGithubId
  ) {
    const now = Date.now();
    await ctx.db.patch("githubAnalysisRuns", run._id, {
      completedAt: now,
      errorCode: "GITHUB_INSTALLATION_NOT_FOUND",
      phase: "completed",
      status: "failed",
      updatedAt: now,
    });
    return { status: "rejected" };
  }

  const now = Date.now();
  await ctx.db.patch("githubAnalysisRuns", run._id, {
    attempt: run.attempt + 1,
    errorCode: undefined,
    phase: "authorizing",
    startedAt: run.startedAt ?? now,
    status: "running",
    updatedAt: now,
  });
  return {
    installationId: installation.installationId,
    status: "ready",
    userId: run.userId,
  };
}
