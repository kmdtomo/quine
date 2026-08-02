import { isTechnologyKey } from "../../../data/tech-stack";
import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { githubError } from "../../lib/githubErrors";

const MAX_REPOSITORIES_PER_RUN = 30;
const MAX_TECHNOLOGIES_PER_RUN = 100;

type CommitTechnologyAnalysisArgs = {
  analyzedRepositoryCount: number;
  detectedTechnologies: Array<{
    confidence: number;
    score: number;
    technologyKey: string;
  }>;
  repositories: Array<{
    description?: string;
    detectedTechnologyKeys: string[];
    filesRead: string[];
    fork: boolean;
    githubUpdatedAt?: string;
    htmlUrl: string;
    languages: string[];
    private: boolean;
    repositoryFullName: string;
    repositoryName: string;
    stargazersCount: number;
    warningCodes: string[];
  }>;
  repositoryCount: number;
  requestCount: number;
  requestLimit: number;
  runId: Id<"githubAnalysisRuns">;
  warningCodes: string[];
};

export async function commitTechnologyAnalysis(
  ctx: MutationCtx,
  args: CommitTechnologyAnalysisArgs,
) {
  const run = await ctx.db.get("githubAnalysisRuns", args.runId);
  if (!run || run.kind !== "technology_analysis" || run.status !== "running") {
    throw githubError("GITHUB_ANALYSIS_NOT_FOUND");
  }
  if (
    args.repositories.length > MAX_REPOSITORIES_PER_RUN ||
    args.detectedTechnologies.length > MAX_TECHNOLOGIES_PER_RUN
  ) {
    throw githubError("GITHUB_ANALYSIS_REQUEST_FAILED");
  }

  const technologyKeys = args.detectedTechnologies
    .map((technology) => technology.technologyKey)
    .filter(isTechnologyKey);
  const existingTechnologies = await ctx.db
    .query("developerTechnologies")
    .withIndex("by_developer", (q) => q.eq("developerId", run.userId))
    .collect();
  const existingKeys = new Set(
    existingTechnologies.map((row) => row.technologyKey),
  );
  let nextOrder =
    existingTechnologies.reduce(
      (maximum, row) => Math.max(maximum, row.order),
      0,
    ) + 1;
  for (const technologyKey of new Set(technologyKeys)) {
    if (existingKeys.has(technologyKey)) {
      continue;
    }
    await ctx.db.insert("developerTechnologies", {
      developerId: run.userId,
      order: nextOrder,
      technologyKey,
    });
    nextOrder += 1;
  }

  const previousRepositoryResults = await ctx.db
    .query("githubAnalysisRunRepositories")
    .withIndex("by_run", (q) => q.eq("runId", run._id))
    .take(MAX_REPOSITORIES_PER_RUN + 1);
  for (const row of previousRepositoryResults) {
    await ctx.db.delete("githubAnalysisRunRepositories", row._id);
  }
  const now = Date.now();
  for (const repository of args.repositories) {
    await ctx.db.insert("githubAnalysisRunRepositories", {
      createdAt: now,
      description: repository.description,
      detectedTechnologyKeys: repository.detectedTechnologyKeys,
      filesRead: repository.filesRead,
      fork: repository.fork,
      githubUpdatedAt: repository.githubUpdatedAt,
      htmlUrl: repository.htmlUrl,
      languages: repository.languages,
      private: repository.private,
      repositoryFullName: repository.repositoryFullName,
      repositoryName: repository.repositoryName,
      runId: run._id,
      stargazersCount: repository.stargazersCount,
      warningCodes: repository.warningCodes,
    });
  }

  await ctx.db.patch("githubAnalysisRuns", run._id, {
    analyzedRepositoryCount: args.analyzedRepositoryCount,
    completedAt: now,
    detectedTechnologies: args.detectedTechnologies,
    errorCode: undefined,
    phase: "completed",
    repositoryCount: args.repositoryCount,
    requestCount: args.requestCount,
    requestLimit: args.requestLimit,
    status: "succeeded",
    updatedAt: now,
    warningCodes: args.warningCodes,
  });
  return null;
}
