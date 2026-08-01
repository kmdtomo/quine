import { v } from "convex/values";

import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import {
  activateDiscovered as activateDiscoveredUseCase,
} from "./application/githubInstallations/activateDiscovered";
import {
  activateVerified as activateVerifiedUseCase,
} from "./application/githubInstallations/activateVerified";
import {
  beginVerification as beginVerificationUseCase,
} from "./application/githubInstallations/beginVerification";
import { MAX_INSTALLATIONS_PER_USER } from "./application/githubInstallations/installationLimit";
import { getAuthorizationUrl } from "./infra/github/authorization";
import { GitHubIntegrationError } from "./infra/github/githubError";
import { getCurrentUser, requireUser } from "./lib/auth";
import { githubError } from "./lib/githubErrors";

const accountTypeValidator = v.union(
  v.literal("User"),
  v.literal("Organization"),
);
const repositorySelectionValidator = v.union(
  v.literal("all"),
  v.literal("selected"),
);
const installationStatusValidator = v.union(
  v.literal("pending"),
  v.literal("active"),
  v.literal("revoked"),
);

const installationSummaryValidator = v.object({
  _id: v.id("githubInstallations"),
  accountLogin: v.optional(v.string()),
  accountType: v.optional(accountTypeValidator),
  status: installationStatusValidator,
  updatedAt: v.number(),
});

const activeInstallationValidator = v.object({
  _id: v.id("githubInstallations"),
  accountId: v.number(),
  accountLogin: v.string(),
  accountType: accountTypeValidator,
  installationId: v.number(),
  repositorySelection: repositorySelectionValidator,
  userId: v.id("users"),
});

function isValidStateHash(stateHash: string): boolean {
  return /^[a-f0-9]{64}$/.test(stateHash);
}

function isValidCodeChallenge(codeChallenge: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(codeChallenge);
}

function getPublicAuthorizationUrl(codeChallenge: string): string {
  try {
    return getAuthorizationUrl(codeChallenge);
  } catch (error) {
    if (error instanceof GitHubIntegrationError) {
      throw githubError(error.code);
    }
    throw error;
  }
}

export const listMine = query({
  args: {},
  returns: v.array(installationSummaryValidator),
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return [];
    }
    const installations = await ctx.db
      .query("githubInstallations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(MAX_INSTALLATIONS_PER_USER);

    return installations
      .filter(
        (installation) =>
          installation.status === "active" ||
          (installation.status === "pending" &&
            installation.verificationExpiresAt > Date.now()),
      )
      .map((installation) => ({
        _id: installation._id,
        accountLogin: installation.accountLogin,
        accountType: installation.accountType,
        status: installation.status,
        updatedAt: installation.updatedAt,
      }));
  },
});

export const beginVerification = mutation({
  args: {
    installationId: v.number(),
    codeChallenge: v.string(),
    stateHash: v.string(),
  },
  returns: v.object({
    authorizationUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (
      !Number.isSafeInteger(args.installationId) ||
      args.installationId <= 0
    ) {
      throw githubError("GITHUB_INVALID_INSTALLATION");
    }
    if (
      !isValidStateHash(args.stateHash) ||
      !isValidCodeChallenge(args.codeChallenge)
    ) {
      throw githubError("GITHUB_INVALID_STATE");
    }

    await beginVerificationUseCase(ctx, args, user._id);

    return {
      authorizationUrl: getPublicAuthorizationUrl(args.codeChallenge),
    };
  },
});

export const beginExistingVerification = mutation({
  args: {
    codeChallenge: v.string(),
  },
  returns: v.object({
    authorizationUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    await requireUser(ctx);
    if (!isValidCodeChallenge(args.codeChallenge)) {
      throw githubError("GITHUB_INVALID_STATE");
    }

    return {
      authorizationUrl: getPublicAuthorizationUrl(args.codeChallenge),
    };
  },
});

export const getPendingForVerification = internalQuery({
  args: {
    stateHash: v.string(),
    userId: v.id("users"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("githubInstallations"),
      installationId: v.number(),
      verificationExpiresAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("githubInstallations")
      .withIndex("by_verification_state_hash", (q) =>
        q.eq("verificationStateHash", args.stateHash),
      )
      .unique();
    if (!row || row.userId !== args.userId || row.status !== "pending") {
      return null;
    }

    return {
      _id: row._id,
      installationId: row.installationId,
      verificationExpiresAt: row.verificationExpiresAt,
    };
  },
});

export const activateVerified = internalMutation({
  args: {
    accountId: v.number(),
    accountLogin: v.string(),
    accountType: accountTypeValidator,
    installationId: v.id("githubInstallations"),
    repositorySelection: repositorySelectionValidator,
    userId: v.id("users"),
    verifiedGithubUserId: v.number(),
  },
  returns: v.id("githubInstallations"),
  handler: async (ctx, args) =>
    await activateVerifiedUseCase(ctx, args),
});

export const activateDiscovered = internalMutation({
  args: {
    accountId: v.number(),
    accountLogin: v.string(),
    accountType: accountTypeValidator,
    githubInstallationId: v.number(),
    repositorySelection: repositorySelectionValidator,
    userId: v.id("users"),
    verifiedGithubUserId: v.number(),
  },
  returns: v.id("githubInstallations"),
  handler: async (ctx, args) => {
    if (
      !Number.isSafeInteger(args.githubInstallationId) ||
      args.githubInstallationId <= 0
    ) {
      throw githubError("GITHUB_INVALID_INSTALLATION");
    }

    return await activateDiscoveredUseCase(ctx, args);
  },
});

export const getActiveForUser = internalQuery({
  args: {
    githubInstallationId: v.optional(v.id("githubInstallations")),
    userId: v.id("users"),
  },
  returns: v.union(v.null(), activeInstallationValidator),
  handler: async (ctx, args) => {
    const installation =
      args.githubInstallationId === undefined
        ? await ctx.db
            .query("githubInstallations")
            .withIndex("by_user_status", (q) =>
              q.eq("userId", args.userId).eq("status", "active"),
            )
            .order("desc")
            .first()
        : await ctx.db.get(
            "githubInstallations",
            args.githubInstallationId,
          );

    if (
      !installation ||
      installation.userId !== args.userId ||
      installation.status !== "active" ||
      installation.accountId === undefined ||
      installation.accountLogin === undefined ||
      installation.accountType !== "User" ||
      installation.verifiedByGithubId !== installation.accountId ||
      installation.repositorySelection === undefined
    ) {
      return null;
    }

    return {
      _id: installation._id,
      accountId: installation.accountId,
      accountLogin: installation.accountLogin,
      accountType: installation.accountType,
      installationId: installation.installationId,
      repositorySelection: installation.repositorySelection,
      userId: installation.userId,
    };
  },
});
