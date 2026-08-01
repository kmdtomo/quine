import { v } from "convex/values";

import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";
import { githubError } from "./lib/githubErrors";

const VERIFICATION_TTL_MS = 10 * 60 * 1000;
const MAX_INSTALLATIONS_PER_USER = 100;

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

function assertVerifiedPersonalAccount(
  accountId: number,
  accountType: "Organization" | "User",
  githubUserId: number | undefined,
  verifiedGithubUserId: number,
): void {
  if (
    githubUserId === undefined ||
    githubUserId !== verifiedGithubUserId
  ) {
    throw githubError("GITHUB_AUTHORIZATION_MISMATCH");
  }
  if (accountType !== "User") {
    throw githubError(
      "GITHUB_ORGANIZATION_REQUIRES_SECURE_TOKEN_STORAGE",
    );
  }
  if (accountId !== verifiedGithubUserId) {
    throw githubError("GITHUB_AUTHORIZATION_MISMATCH");
  }
}

function getAuthorizationUrl(codeChallenge: string): string {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_APP_USER_OAUTH_CALLBACK_URL;
  if (!clientId || !callbackUrl) {
    throw githubError("GITHUB_APP_NOT_CONFIGURED");
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
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

    const now = Date.now();
    const rows = await ctx.db
      .query("githubInstallations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(MAX_INSTALLATIONS_PER_USER);
    const pending = rows.find(
      (row) =>
        row.installationId === args.installationId &&
        row.status === "pending",
    );

    if (pending) {
      await ctx.db.patch("githubInstallations", pending._id, {
        verificationExpiresAt: now + VERIFICATION_TTL_MS,
        verificationStateHash: args.stateHash,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("githubInstallations", {
        createdAt: now,
        installationId: args.installationId,
        status: "pending",
        updatedAt: now,
        userId: user._id,
        verificationExpiresAt: now + VERIFICATION_TTL_MS,
        verificationStateHash: args.stateHash,
      });
    }

    return {
      authorizationUrl: getAuthorizationUrl(args.codeChallenge),
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
      authorizationUrl: getAuthorizationUrl(args.codeChallenge),
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
  handler: async (ctx, args) => {
    const [pending, user] = await Promise.all([
      ctx.db.get("githubInstallations", args.installationId),
      ctx.db.get("users", args.userId),
    ]);
    if (
      !pending ||
      pending.userId !== args.userId ||
      pending.status !== "pending"
    ) {
      throw githubError("GITHUB_AUTHORIZATION_MISMATCH");
    }
    if (pending.verificationExpiresAt <= Date.now()) {
      throw githubError("GITHUB_AUTHORIZATION_EXPIRED");
    }
    assertVerifiedPersonalAccount(
      args.accountId,
      args.accountType,
      user?.githubId,
      args.verifiedGithubUserId,
    );

    const now = Date.now();
    const userInstallations = await ctx.db
      .query("githubInstallations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(MAX_INSTALLATIONS_PER_USER);
    for (const installation of userInstallations) {
      if (
        installation._id !== pending._id &&
        installation.installationId === pending.installationId &&
        installation.status === "active"
      ) {
        await ctx.db.patch("githubInstallations", installation._id, {
          revokedAt: now,
          status: "revoked",
          updatedAt: now,
        });
      }
    }

    await ctx.db.patch("githubInstallations", pending._id, {
      accountId: args.accountId,
      accountLogin: args.accountLogin,
      accountType: args.accountType,
      repositorySelection: args.repositorySelection,
      status: "active",
      updatedAt: now,
      verifiedAt: now,
      verifiedByGithubId: args.verifiedGithubUserId,
      verificationExpiresAt: now,
      verificationStateHash: "",
    });
    return pending._id;
  },
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

    const user = await ctx.db.get("users", args.userId);
    assertVerifiedPersonalAccount(
      args.accountId,
      args.accountType,
      user?.githubId,
      args.verifiedGithubUserId,
    );

    const now = Date.now();
    const userInstallations = await ctx.db
      .query("githubInstallations")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(MAX_INSTALLATIONS_PER_USER);
    const existing = userInstallations.find(
      (installation) =>
        installation.installationId === args.githubInstallationId,
    );
    const installationId =
      existing?._id ??
      (await ctx.db.insert("githubInstallations", {
        accountId: args.accountId,
        accountLogin: args.accountLogin,
        accountType: args.accountType,
        createdAt: now,
        installationId: args.githubInstallationId,
        repositorySelection: args.repositorySelection,
        status: "active",
        updatedAt: now,
        userId: args.userId,
        verifiedAt: now,
        verifiedByGithubId: args.verifiedGithubUserId,
        verificationExpiresAt: now,
        verificationStateHash: "",
      }));

    if (existing) {
      await ctx.db.patch("githubInstallations", existing._id, {
        accountId: args.accountId,
        accountLogin: args.accountLogin,
        accountType: args.accountType,
        repositorySelection: args.repositorySelection,
        revokedAt: undefined,
        status: "active",
        updatedAt: now,
        verifiedAt: now,
        verifiedByGithubId: args.verifiedGithubUserId,
        verificationExpiresAt: now,
        verificationStateHash: "",
      });
    }

    for (const installation of userInstallations) {
      if (
        installation._id !== installationId &&
        installation.installationId === args.githubInstallationId &&
        installation.status === "active"
      ) {
        await ctx.db.patch("githubInstallations", installation._id, {
          revokedAt: now,
          status: "revoked",
          updatedAt: now,
        });
      }
    }

    return installationId;
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
