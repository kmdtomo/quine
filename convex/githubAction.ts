"use node";

import { ConvexError, v } from "convex/values";

import type { TechnologyKey } from "../data/tech-stack";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  action,
  type ActionCtx,
  internalAction,
} from "./_generated/server";
import { auth } from "./auth";
import { githubErrorCodeFromUnknown } from "./infra/github/githubError";
import {
  buildDependencySummary,
  addTreePathTarget,
  compareManifestTargets,
  compareRepositoriesForSampling,
  getTechnologyKeysForLanguage,
  inferTechnologiesFromManifest,
  recordTechnology,
  selectRepositoriesForBudget,
} from "./lib/github/detection";
import {
  createGitHubRequestBudget,
  createInstallationToken,
  listInstallationRepositories,
  readFile,
  readRepositoryReadme,
  readRepositoryTree,
  sortRepositoriesForSelection,
  toProductRepository,
} from "./lib/github/client";
import type {
  AnalysisLogContext,
  DetectedTechnology,
  GitHubRequestBudget,
  ImportProductRepositoryResult,
  ListProductRepositoriesResult,
  ManifestTarget,
  RepositoryAnalysis,
  RepositorySummary,
} from "./lib/github/types";

const MAX_GITHUB_API_REQUESTS = 95;
const MAX_MANIFEST_FILES_PER_REPOSITORY = 2;
const MAX_RECURSIVE_MANIFEST_TARGETS = 120;
const MAX_PRODUCT_IMPORT_REQUESTS = 35;

export const analyzeRepos = internalAction({
  args: {
    runId: v.id("githubAnalysisRuns"),
  },
  returns: v.null(),
  handler: async (ctx, { runId }) => {
    const requestBudget = createGitHubRequestBudget(MAX_GITHUB_API_REQUESTS);
    let userId: Id<"users"> | undefined;

    try {
      const execution = await ctx.runMutation(
        internal.githubAnalysisRuns.beginExecution,
        { runId },
      );
      if (execution.status === "rejected") {
        return null;
      }
      userId = execution.userId;
      await appendAnalysisLog(
        ctx,
        execution.userId,
        runId,
        "info",
        "GitHub repository analysis started.",
      );
      const token = await createInstallationToken(
        execution.installationId,
        requestBudget,
      );
      await ctx.runMutation(internal.githubAnalysisRuns.updateProgress, {
        phase: "loading_repositories",
        requestCount: requestBudget.used,
        requestLimit: requestBudget.limit,
        runId,
      });

      const repositories = await listInstallationRepositories(
        token,
        requestBudget,
      );
      await appendAnalysisLog(
        ctx,
        execution.userId,
        runId,
        "info",
        `Loaded ${repositories.length} repositories from the installation.`,
      );

      const visibleRepositories = repositories
        .filter((repository) => !repository.fork)
        .sort(compareRepositoriesForSampling);
      const selectedRepositories =
        selectRepositoriesForBudget(visibleRepositories);
      await ctx.runMutation(internal.githubAnalysisRuns.updateProgress, {
        phase: "analyzing_repositories",
        repositoryCount: repositories.length,
        requestCount: requestBudget.used,
        requestLimit: requestBudget.limit,
        runId,
      });

      const detections = new Map<TechnologyKey, DetectedTechnology>();
      const analyses: RepositoryAnalysis[] = [];
      for (const repository of selectedRepositories) {
        if (requestBudget.exhausted) {
          break;
        }
        analyses.push(
          await analyzeRepository(
            ctx,
            { runId, userId: execution.userId },
            token,
            repository,
            detections,
            requestBudget,
          ),
        );
      }

      const detectedTechnologies = Array.from(detections.values()).sort(
        (left, right) => right.score - left.score,
      );
      const hasWarnings =
        requestBudget.warnings.length > 0 ||
        visibleRepositories.length > selectedRepositories.length ||
        repositories.length === 0;
      if (hasWarnings) {
        await appendAnalysisLog(
          ctx,
          execution.userId,
          runId,
          "warn",
          "The analysis completed with repository or request-budget warnings.",
        );
      }
      await ctx.runMutation(internal.githubAnalysisRuns.updateProgress, {
        analyzedRepositoryCount: analyses.length,
        phase: "persisting_results",
        repositoryCount: repositories.length,
        requestCount: requestBudget.used,
        requestLimit: requestBudget.limit,
        runId,
      });
      await ctx.runMutation(
        internal.githubAnalysisRuns.commitTechnologyAnalysis,
        {
          analyzedRepositoryCount: analyses.length,
          detectedTechnologies: detectedTechnologies.map((technology) => ({
            confidence: technology.confidence,
            score: technology.score,
            technologyKey: technology.key,
          })),
          repositories: analyses.map((analysis) => ({
            ...(analysis.repository.description === null
              ? {}
              : { description: analysis.repository.description }),
            detectedTechnologyKeys: analysis.detectedTechnologyKeys,
            filesRead: analysis.filesRead,
            fork: analysis.repository.fork,
            ...(analysis.repository.updatedAt === null
              ? {}
              : { githubUpdatedAt: analysis.repository.updatedAt }),
            htmlUrl: analysis.repository.htmlUrl,
            languages: analysis.languages,
            private: analysis.repository.private,
            repositoryFullName: analysis.repository.fullName,
            repositoryName: analysis.repository.name,
            stargazersCount: analysis.repository.stargazersCount,
            warningCodes:
              analysis.warnings.length === 0
                ? []
                : ["GITHUB_REPOSITORY_ANALYSIS_WARNING"],
          })),
          repositoryCount: repositories.length,
          requestCount: requestBudget.used,
          requestLimit: requestBudget.limit,
          runId,
          warningCodes: hasWarnings ? ["GITHUB_ANALYSIS_PARTIAL"] : [],
        },
      );
      await appendAnalysisLog(
        ctx,
        execution.userId,
        runId,
        "info",
        "Detected technologies were saved to your stack.",
      );
      return null;
    } catch (error: unknown) {
      const errorCode = githubErrorCodeFromUnknown(
        error,
        "GITHUB_ANALYSIS_REQUEST_FAILED",
      );
      if (userId !== undefined) {
        await appendAnalysisLog(
          ctx,
          userId,
          runId,
          "error",
          "GitHub repository analysis failed.",
        );
      }
      if (userId !== undefined) {
        await ctx.runMutation(internal.githubAnalysisRuns.fail, {
          errorCode,
          requestCount: requestBudget.used,
          requestLimit: requestBudget.limit,
          runId,
        });
      }
      return null;
    }
  },
});

const productRepositoryValidator = v.object({
  description: v.union(v.string(), v.null()),
  fork: v.boolean(),
  fullName: v.string(),
  homepage: v.union(v.string(), v.null()),
  htmlUrl: v.string(),
  name: v.string(),
  primaryLanguage: v.union(v.string(), v.null()),
  primaryTechnologyKey: v.union(v.string(), v.null()),
  primaryTechnologyName: v.union(v.string(), v.null()),
  private: v.boolean(),
  stargazersCount: v.number(),
  updatedAt: v.union(v.string(), v.null()),
});

const repositoryAnalysisValidator = v.object({
  detectedTechnologyKeys: v.array(v.string()),
  filesRead: v.array(v.string()),
  languages: v.array(v.string()),
  repository: v.object({
    defaultBranch: v.string(),
    description: v.union(v.string(), v.null()),
    fork: v.boolean(),
    fullName: v.string(),
    homepage: v.union(v.string(), v.null()),
    htmlUrl: v.string(),
    name: v.string(),
    primaryLanguage: v.union(v.string(), v.null()),
    primaryTechnologyKey: v.union(v.string(), v.null()),
    primaryTechnologyName: v.union(v.string(), v.null()),
    private: v.boolean(),
    stargazersCount: v.number(),
    updatedAt: v.union(v.string(), v.null()),
  }),
  warnings: v.array(v.string()),
});

export const listProductRepositories = action({
  args: {},
  returns: v.union(
    v.object({
      repositories: v.array(productRepositoryValidator),
      status: v.literal("not_installed"),
    }),
    v.object({
      repositories: v.array(productRepositoryValidator),
      requestCount: v.number(),
      requestLimit: v.number(),
      status: v.literal("ready"),
      warnings: v.array(v.string()),
    }),
  ),
  handler: async (ctx): Promise<ListProductRepositoriesResult> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new ConvexError({ code: "UNAUTHORIZED" });
    }

    const installation = await ctx.runQuery(
      internal.githubInstallations.getActiveForUser,
      { userId },
    );
    if (!installation) {
      return {
        status: "not_installed",
        repositories: [],
      };
    }

    const requestBudget = createGitHubRequestBudget(12);
    try {
      const token = await createInstallationToken(
        installation.installationId,
        requestBudget,
      );
      const repositories = await listInstallationRepositories(
        token,
        requestBudget,
      );

      return {
        status: "ready",
        requestCount: requestBudget.used,
        requestLimit: requestBudget.limit,
        repositories: sortRepositoriesForSelection(repositories).map(
          toProductRepository,
        ),
        warnings: requestBudget.warnings,
      };
    } catch {
      throw new ConvexError({ code: "GITHUB_ANALYSIS_REQUEST_FAILED" });
    }
  },
});

export const importProductRepository = action({
  args: {
    draftKey: v.optional(v.string()),
    productId: v.optional(v.id("products")),
    repositoryFullName: v.string(),
  },
  returns: v.object({
    analysis: repositoryAnalysisValidator,
    draft: v.object({
      githubUrl: v.string(),
      name: v.string(),
      productUrl: v.optional(v.string()),
      projectType: v.union(v.literal("open_source"), v.literal("work")),
      technologyKeys: v.array(v.string()),
    }),
    repoContextId: v.id("productRepoContexts"),
    repository: productRepositoryValidator,
    requestCount: v.number(),
    requestLimit: v.number(),
    warnings: v.array(v.string()),
  }),
  handler: async (
    ctx,
    { draftKey, productId, repositoryFullName },
  ): Promise<ImportProductRepositoryResult> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw new ConvexError({ code: "UNAUTHORIZED" });
    }

    const normalizedRepositoryFullName = repositoryFullName.trim();
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(normalizedRepositoryFullName)) {
      throw new ConvexError({ code: "GITHUB_INVALID_REPOSITORY" });
    }

    const installation = await ctx.runQuery(
      internal.githubInstallations.getActiveForUser,
      { userId },
    );
    if (!installation) {
      throw new ConvexError({ code: "GITHUB_INSTALLATION_NOT_FOUND" });
    }

    const requestBudget = createGitHubRequestBudget(MAX_PRODUCT_IMPORT_REQUESTS);
    const token = await createInstallationToken(
      installation.installationId,
      requestBudget,
    );
    const repositories = await listInstallationRepositories(token, requestBudget);
    const repository = repositories.find(
      (item) => item.fullName === normalizedRepositoryFullName,
    );
    if (!repository) {
      throw new ConvexError({ code: "GITHUB_REPOSITORY_NOT_ACCESSIBLE" });
    }

    const detections = new Map<TechnologyKey, DetectedTechnology>();
    const analysis = await analyzeRepository(
      ctx,
      null,
      token,
      repository,
      detections,
      requestBudget,
    );
    const technologyKeys = Array.from(detections.values())
      .sort((a, b) => b.score - a.score)
      .map((technology) => technology.key);
    const readme = await readRepositoryReadme(token, repository, requestBudget);
    const repoContextId: Id<"productRepoContexts"> = await ctx.runMutation(
      internal.productRepoContexts.upsertImported,
      {
        defaultBranch: repository.defaultBranch,
        dependencySummary: buildDependencySummary(analysis, technologyKeys),
        detectedTechnologyKeys: technologyKeys,
        filesRead: analysis.filesRead,
        githubUrl: repository.htmlUrl,
        repositoryFullName: repository.fullName,
        userId,
        ...(draftKey === undefined ? {} : { draftKey }),
        ...(productId === undefined ? {} : { productId }),
        ...(repository.description === null
          ? {}
          : { description: repository.description }),
        ...(repository.primaryLanguage === null
          ? {}
          : { primaryLanguage: repository.primaryLanguage }),
        ...(readme === null
          ? {}
          : { readmePath: readme.path, readmeText: readme.text }),
      },
    );

    return {
      repository: toProductRepository(repository),
      repoContextId,
      requestCount: requestBudget.used,
      requestLimit: requestBudget.limit,
      draft: {
        githubUrl: repository.htmlUrl,
        name: repository.name,
        ...(repository.homepage ? { productUrl: repository.homepage } : {}),
        projectType: repository.private ? "work" : "open_source",
        technologyKeys,
      },
      analysis,
      warnings: requestBudget.warnings,
    };
  },
});

async function analyzeRepository(
  ctx: ActionCtx,
  logContext: AnalysisLogContext | null,
  token: string,
  repository: RepositorySummary,
  detections: Map<TechnologyKey, DetectedTechnology>,
  requestBudget: GitHubRequestBudget,
): Promise<RepositoryAnalysis> {
  if (logContext) {
    await appendAnalysisLog(
      ctx,
      logContext.userId,
      logContext.runId,
      "info",
      "Reading repository tree.",
      repository.fullName,
    );
  }

  const filesRead: string[] = [];
  const warnings: string[] = [];
  const repoTechnologyKeys = new Set<TechnologyKey>();
  const languageNames = repository.primaryLanguage ? [repository.primaryLanguage] : [];

  for (const languageName of languageNames) {
    for (const technologyKey of getTechnologyKeysForLanguage(languageName)) {
      recordTechnology(detections, repoTechnologyKeys, technologyKey, 4, {
        repository: repository.fullName,
        path: "repository.language",
        detail: `${languageName} appears as the repository primary language`,
      });
    }
  }

  const manifestTargets = await discoverManifestTargets(
    token,
    repository,
    requestBudget,
  );
  const limitedManifestTargets = manifestTargets.slice(
    0,
    MAX_MANIFEST_FILES_PER_REPOSITORY,
  );
  if (logContext) {
    await appendAnalysisLog(
      ctx,
      logContext.userId,
      logContext.runId,
      "info",
      `Found ${manifestTargets.length} matching files; reading ${limitedManifestTargets.length}.`,
      repository.fullName,
    );
  }
  for (const manifestTarget of limitedManifestTargets) {
    if (requestBudget.exhausted) {
      break;
    }

    const content = await readFile(
      token,
      repository.fullName,
      manifestTarget.path,
      requestBudget,
    );
    if (!content.exists) {
      continue;
    }

    filesRead.push(manifestTarget.path);
    for (const technologyKey of manifestTarget.baselineKeys) {
      recordTechnology(detections, repoTechnologyKeys, technologyKey, 5, {
        repository: repository.fullName,
        path: manifestTarget.path,
        detail: `${manifestTarget.path} exists`,
      });
    }

    if (!content.text) {
      continue;
    }

    const inferredKeys = inferTechnologiesFromManifest(
      manifestTarget,
      content.text,
    );
    for (const technologyKey of inferredKeys) {
      recordTechnology(detections, repoTechnologyKeys, technologyKey, 8, {
        repository: repository.fullName,
        path: manifestTarget.path,
        detail: `${technologyKey} detected from ${manifestTarget.path}`,
      });
    }
  }

  if (logContext) {
    await appendAnalysisLog(
      ctx,
      logContext.userId,
      logContext.runId,
      "info",
      `Detected ${repoTechnologyKeys.size} technology keys.`,
      repository.fullName,
    );
  }

  return {
    repository,
    languages: languageNames,
    filesRead: filesRead.sort(),
    detectedTechnologyKeys: Array.from(repoTechnologyKeys).sort(),
    warnings,
  };
}

async function discoverManifestTargets(
  token: string,
  repository: RepositorySummary,
  requestBudget: GitHubRequestBudget,
): Promise<ManifestTarget[]> {
  const targetsByPath = new Map<string, ManifestTarget>();
  const treePaths = await readRepositoryTree(
    token,
    repository.fullName,
    repository.defaultBranch,
    requestBudget,
  );
  for (const path of treePaths) {
    addTreePathTarget(targetsByPath, path);
    if (targetsByPath.size >= MAX_RECURSIVE_MANIFEST_TARGETS) {
      break;
    }
  }

  return Array.from(targetsByPath.values()).sort(compareManifestTargets);
}


async function appendAnalysisLog(
  ctx: ActionCtx,
  userId: Id<"users">,
  runId: Id<"githubAnalysisRuns">,
  level: "info" | "warn" | "error",
  message: string,
  repository?: string,
) {
  await ctx.runMutation(internal.githubAnalysisLogs.append, {
    analysisRunId: runId,
    userId,
    createdAt: Date.now(),
    level,
    message,
    ...(repository ? { repository } : {}),
  });
}
