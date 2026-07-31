import { v } from "convex/values";

import { getTechnologyByKey, isTechnologyKey } from "../data/tech-stack";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { requireUser } from "./lib/auth";
import { githubError } from "./lib/githubErrors";

const MAX_ATTEMPTS = 3;
const MAX_REPOSITORIES_PER_RUN = 30;
const MAX_TECHNOLOGIES_PER_RUN = 100;

type BeginExecutionResult =
  | {
      status: "rejected";
    }
  | {
      installationId: number;
      status: "ready";
      userId: Id<"users">;
    };

const runStatusValidator = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
);
const runPhaseValidator = v.union(
  v.literal("queued"),
  v.literal("authorizing"),
  v.literal("loading_repositories"),
  v.literal("analyzing_repositories"),
  v.literal("persisting_results"),
  v.literal("completed"),
);
const detectedTechnologyValidator = v.object({
  confidence: v.number(),
  score: v.number(),
  technologyKey: v.string(),
});
const repositoryResultValidator = v.object({
  description: v.optional(v.string()),
  detectedTechnologyKeys: v.array(v.string()),
  filesRead: v.array(v.string()),
  fork: v.boolean(),
  githubUpdatedAt: v.optional(v.string()),
  htmlUrl: v.string(),
  languages: v.array(v.string()),
  private: v.boolean(),
  repositoryFullName: v.string(),
  repositoryName: v.string(),
  stargazersCount: v.number(),
  warningCodes: v.array(v.string()),
});

const runResultValidator = v.object({
  accountLogin: v.string(),
  analyzedRepositoryCount: v.number(),
  errorCode: v.optional(v.string()),
  githubInstallationId: v.id("githubInstallations"),
  phase: runPhaseValidator,
  repositoryCount: v.number(),
  requestCount: v.number(),
  requestLimit: v.number(),
  runId: v.id("githubAnalysisRuns"),
  status: runStatusValidator,
  technologies: v.array(
    v.object({
      category: v.string(),
      confidence: v.number(),
      key: v.string(),
      name: v.string(),
      score: v.number(),
    }),
  ),
  warningCodes: v.array(v.string()),
});

export const startTechnologyAnalysis = mutation({
  args: {
    githubInstallationId: v.optional(v.id("githubInstallations")),
  },
  returns: v.object({
    runId: v.id("githubAnalysisRuns"),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const installation =
      args.githubInstallationId === undefined
        ? await ctx.db
            .query("githubInstallations")
            .withIndex("by_user_status", (q) =>
              q.eq("userId", user._id).eq("status", "active"),
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
      installation.userId !== user._id ||
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
      idempotencyKey: `${user._id}:technology:${installation._id}:${now}`,
      kind: "technology_analysis",
      maxAttempts: MAX_ATTEMPTS,
      phase: "queued",
      repositoryCount: 0,
      requestCount: 0,
      requestLimit: 0,
      status: "queued",
      updatedAt: now,
      userId: user._id,
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
  },
});

export const retryTechnologyAnalysis = mutation({
  args: {
    runId: v.id("githubAnalysisRuns"),
  },
  returns: v.object({
    runId: v.id("githubAnalysisRuns"),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const run = await ctx.db.get("githubAnalysisRuns", args.runId);
    if (!run || run.userId !== user._id || run.kind !== "technology_analysis") {
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
      installation.userId !== user._id ||
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
  },
});

export const getMine = query({
  args: {
    runId: v.id("githubAnalysisRuns"),
  },
  returns: v.union(v.null(), runResultValidator),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const run = await ctx.db.get("githubAnalysisRuns", args.runId);
    if (!run || run.userId !== user._id || run.kind !== "technology_analysis") {
      return null;
    }
    const installation = await ctx.db.get(
      "githubInstallations",
      run.githubInstallationId,
    );
    if (!installation || installation.userId !== user._id) {
      return null;
    }

    const technologies = run.detectedTechnologies.flatMap((result) => {
      const technology = getTechnologyByKey(result.technologyKey);
      if (!technology) {
        return [];
      }
      return [
        {
          category: technology.categoryName,
          confidence: result.confidence,
          key: technology.key,
          name: technology.name,
          score: result.score,
        },
      ];
    });

    return {
      accountLogin: installation.accountLogin ?? "GitHub",
      analyzedRepositoryCount: run.analyzedRepositoryCount,
      errorCode: run.errorCode,
      githubInstallationId: installation._id,
      phase: run.phase,
      repositoryCount: run.repositoryCount,
      requestCount: run.requestCount,
      requestLimit: run.requestLimit,
      runId: run._id,
      status: run.status,
      technologies,
      warningCodes: run.warningCodes,
    };
  },
});

export const beginExecution = internalMutation({
  args: {
    runId: v.id("githubAnalysisRuns"),
  },
  returns: v.union(
    v.object({
      status: v.literal("rejected"),
    }),
    v.object({
      installationId: v.number(),
      status: v.literal("ready"),
      userId: v.id("users"),
    }),
  ),
  handler: async (ctx, args): Promise<BeginExecutionResult> => {
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
  },
});

export const updateProgress = internalMutation({
  args: {
    analyzedRepositoryCount: v.optional(v.number()),
    phase: runPhaseValidator,
    repositoryCount: v.optional(v.number()),
    requestCount: v.optional(v.number()),
    requestLimit: v.optional(v.number()),
    runId: v.id("githubAnalysisRuns"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("githubAnalysisRuns", args.runId);
    if (!run || run.status !== "running") {
      return null;
    }
    await ctx.db.patch("githubAnalysisRuns", run._id, {
      ...(args.analyzedRepositoryCount === undefined
        ? {}
        : { analyzedRepositoryCount: args.analyzedRepositoryCount }),
      phase: args.phase,
      ...(args.repositoryCount === undefined
        ? {}
        : { repositoryCount: args.repositoryCount }),
      ...(args.requestCount === undefined
        ? {}
        : { requestCount: args.requestCount }),
      ...(args.requestLimit === undefined
        ? {}
        : { requestLimit: args.requestLimit }),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const commitTechnologyAnalysis = internalMutation({
  args: {
    analyzedRepositoryCount: v.number(),
    detectedTechnologies: v.array(detectedTechnologyValidator),
    repositories: v.array(repositoryResultValidator),
    repositoryCount: v.number(),
    requestCount: v.number(),
    requestLimit: v.number(),
    runId: v.id("githubAnalysisRuns"),
    warningCodes: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
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
  },
});

export const fail = internalMutation({
  args: {
    errorCode: v.string(),
    requestCount: v.number(),
    requestLimit: v.number(),
    runId: v.id("githubAnalysisRuns"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get("githubAnalysisRuns", args.runId);
    if (!run || run.status === "succeeded") {
      return null;
    }
    const now = Date.now();
    await ctx.db.patch("githubAnalysisRuns", run._id, {
      completedAt: now,
      errorCode: args.errorCode,
      phase: "completed",
      requestCount: args.requestCount,
      requestLimit: args.requestLimit,
      status: "failed",
      updatedAt: now,
    });
    return null;
  },
});
