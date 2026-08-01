"use node";

import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { auth } from "./auth";
import { GitHubIntegrationError } from "./infra/github/githubError";
import {
  type AccessibleInstallation,
  exchangeCode,
  findAccessibleInstallation,
  getGithubUserId,
} from "./infra/github/oauth";
import { githubError } from "./lib/githubErrors";

type InstallationAuthorizationResult = {
  accountLogin: string;
  githubInstallationId: Id<"githubInstallations">;
};

export const completeInstallationAuthorization = action({
  args: {
    code: v.string(),
    codeVerifier: v.string(),
    stateHash: v.string(),
  },
  returns: v.object({
    accountLogin: v.string(),
    githubInstallationId: v.id("githubInstallations"),
  }),
  handler: async (ctx, args): Promise<InstallationAuthorizationResult> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw githubError("GITHUB_AUTHORIZATION_MISMATCH");
    }
    if (
      args.code.length < 8 ||
      args.code.length > 512 ||
      args.codeVerifier.length < 43 ||
      args.codeVerifier.length > 128 ||
      !/^[a-f0-9]{64}$/.test(args.stateHash)
    ) {
      throw githubError("GITHUB_INVALID_CALLBACK");
    }

    const pending: {
      _id: Id<"githubInstallations">;
      installationId: number;
      verificationExpiresAt: number;
    } | null = await ctx.runQuery(
      internal.githubInstallations.getPendingForVerification,
      {
        stateHash: args.stateHash,
        userId,
      },
    );
    if (!pending) {
      throw githubError("GITHUB_AUTHORIZATION_MISMATCH");
    }
    if (pending.verificationExpiresAt <= Date.now()) {
      throw githubError("GITHUB_AUTHORIZATION_EXPIRED");
    }

    try {
      const accessToken = await exchangeCode(
        args.code,
        args.codeVerifier,
      );
      const githubUserId: number = await getGithubUserId(accessToken);
      const installation: AccessibleInstallation | null =
        await findAccessibleInstallation(
          accessToken,
          (candidate) => candidate.id === pending.installationId,
        );
      if (!installation) {
        throw new GitHubIntegrationError(
          "GITHUB_INSTALLATION_NOT_ACCESSIBLE",
        );
      }
      if (
        installation.account.type !== "User" ||
        installation.account.id !== githubUserId
      ) {
        throw new GitHubIntegrationError(
          "GITHUB_ORGANIZATION_REQUIRES_SECURE_TOKEN_STORAGE",
        );
      }

      const githubInstallationId: Id<"githubInstallations"> =
        await ctx.runMutation(
        internal.githubInstallations.activateVerified,
        {
          accountId: installation.account.id,
          accountLogin: installation.account.login,
          accountType: installation.account.type,
          installationId: pending._id,
          repositorySelection: installation.repositorySelection,
          userId,
          verifiedGithubUserId: githubUserId,
        },
      );
      return {
        accountLogin: installation.account.login,
        githubInstallationId,
      };
    } catch (error) {
      if (error instanceof GitHubIntegrationError) {
        throw githubError(error.code);
      }
      console.error("GitHub authorization failed with an unexpected error");
      throw githubError("GITHUB_AUTHORIZATION_FAILED");
    }
  },
});

export const completeExistingInstallationAuthorization = action({
  args: {
    code: v.string(),
    codeVerifier: v.string(),
  },
  returns: v.object({
    accountLogin: v.string(),
    githubInstallationId: v.id("githubInstallations"),
  }),
  handler: async (ctx, args): Promise<InstallationAuthorizationResult> => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      throw githubError("GITHUB_AUTHORIZATION_MISMATCH");
    }
    if (
      args.code.length < 8 ||
      args.code.length > 512 ||
      args.codeVerifier.length < 43 ||
      args.codeVerifier.length > 128
    ) {
      throw githubError("GITHUB_INVALID_CALLBACK");
    }

    try {
      const accessToken = await exchangeCode(
        args.code,
        args.codeVerifier,
      );
      const githubUserId = await getGithubUserId(accessToken);
      const installation = await findAccessibleInstallation(
        accessToken,
        (candidate) =>
          candidate.account.type === "User" &&
          candidate.account.id === githubUserId,
      );
      if (!installation) {
        throw new GitHubIntegrationError(
          "GITHUB_INSTALLATION_NOT_ACCESSIBLE",
        );
      }

      const githubInstallationId: Id<"githubInstallations"> =
        await ctx.runMutation(
          internal.githubInstallations.activateDiscovered,
          {
            accountId: installation.account.id,
            accountLogin: installation.account.login,
            accountType: installation.account.type,
            githubInstallationId: installation.id,
            repositorySelection: installation.repositorySelection,
            userId,
            verifiedGithubUserId: githubUserId,
          },
        );
      return {
        accountLogin: installation.account.login,
        githubInstallationId,
      };
    } catch (error) {
      if (error instanceof GitHubIntegrationError) {
        throw githubError(error.code);
      }
      console.error("GitHub authorization failed with an unexpected error");
      throw githubError("GITHUB_AUTHORIZATION_FAILED");
    }
  },
});
