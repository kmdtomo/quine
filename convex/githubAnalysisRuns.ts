import { v } from "convex/values";

import { getTechnologyByKey } from "../data/tech-stack";
import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import {
  beginExecution as beginExecutionUseCase,
  type BeginExecutionResult,
} from "./application/githubAnalysis/beginExecution";
import {
  commitTechnologyAnalysis as commitTechnologyAnalysisUseCase,
} from "./application/githubAnalysis/commitTechnologyAnalysis";
import {
  retryTechnologyAnalysis as retryTechnologyAnalysisUseCase,
} from "./application/githubAnalysis/retryTechnologyAnalysis";
import {
  startTechnologyAnalysis as startTechnologyAnalysisUseCase,
} from "./application/githubAnalysis/startTechnologyAnalysis";
import { requireUser } from "./lib/auth";

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
    return await startTechnologyAnalysisUseCase(ctx, user._id, args);
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
    return await retryTechnologyAnalysisUseCase(ctx, user._id, args);
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
    return await beginExecutionUseCase(ctx, args);
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
    return await commitTechnologyAnalysisUseCase(ctx, args);
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
