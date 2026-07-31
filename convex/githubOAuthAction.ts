"use node";

import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action } from "./_generated/server";
import { auth } from "./auth";
import { githubError, GitHubIntegrationError } from "./lib/githubErrors";

const GITHUB_API_VERSION = "2022-11-28";
const MAX_INSTALLATION_PAGES = 20;
const REQUEST_TIMEOUT_MS = 15_000;

type GitHubAccount = {
  id: number;
  login: string;
  type: "Organization" | "User";
};

type AccessibleInstallation = {
  account: GitHubAccount;
  id: number;
  repositorySelection: "all" | "selected";
};

type InstallationAuthorizationResult = {
  accountLogin: string;
  githubInstallationId: Id<"githubInstallations">;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseAccessToken(value: unknown): string {
  if (!isRecord(value) || typeof value.access_token !== "string") {
    throw new GitHubIntegrationError("GITHUB_AUTHORIZATION_FAILED");
  }
  return value.access_token;
}

function parseGithubUserId(value: unknown): number {
  if (!isRecord(value) || !Number.isSafeInteger(value.id)) {
    throw new GitHubIntegrationError("GITHUB_AUTHORIZATION_FAILED");
  }
  return typeof value.id === "number" ? value.id : 0;
}

function parseInstallation(value: unknown): AccessibleInstallation | null {
  if (
    !isRecord(value) ||
    !Number.isSafeInteger(value.id) ||
    !isRecord(value.account) ||
    !Number.isSafeInteger(value.account.id) ||
    typeof value.account.login !== "string" ||
    (value.account.type !== "User" &&
      value.account.type !== "Organization") ||
    (value.repository_selection !== "all" &&
      value.repository_selection !== "selected")
  ) {
    return null;
  }

  return {
    account: {
      id: typeof value.account.id === "number" ? value.account.id : 0,
      login: value.account.login,
      type: value.account.type,
    },
    id: typeof value.id === "number" ? value.id : 0,
    repositorySelection: value.repository_selection,
  };
}

async function fetchJson(
  url: string,
  init: RequestInit,
): Promise<unknown> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) {
    console.error("GitHub authorization request failed", {
      pathname: new URL(url).pathname,
      status: response.status,
    });
    throw new GitHubIntegrationError("GITHUB_AUTHORIZATION_FAILED");
  }
  return await response.json();
}

async function exchangeCode(
  code: string,
  codeVerifier: string,
): Promise<string> {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const clientSecret = process.env.GITHUB_APP_CLIENT_SECRET;
  const callbackUrl = process.env.GITHUB_APP_USER_OAUTH_CALLBACK_URL;
  if (!clientId || !clientSecret || !callbackUrl) {
    throw new GitHubIntegrationError("GITHUB_APP_NOT_CONFIGURED");
  }

  const payload = await fetchJson(
    "https://github.com/login/oauth/access_token",
    {
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        code_verifier: codeVerifier,
        redirect_uri: callbackUrl,
      }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
    },
  );
  return parseAccessToken(payload);
}

async function getGithubUserId(accessToken: string): Promise<number> {
  const payload = await fetchJson("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
    },
  });
  return parseGithubUserId(payload);
}

async function findAccessibleInstallation(
  accessToken: string,
  installationId: number,
): Promise<AccessibleInstallation | null> {
  for (let page = 1; page <= MAX_INSTALLATION_PAGES; page += 1) {
    const payload = await fetchJson(
      `https://api.github.com/user/installations?per_page=100&page=${page}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${accessToken}`,
          "X-GitHub-Api-Version": GITHUB_API_VERSION,
        },
      },
    );
    if (!isRecord(payload) || !Array.isArray(payload.installations)) {
      throw new GitHubIntegrationError("GITHUB_AUTHORIZATION_FAILED");
    }

    for (const value of payload.installations) {
      const installation = parseInstallation(value);
      if (installation?.id === installationId) {
        return installation;
      }
    }
    if (payload.installations.length < 100) {
      return null;
    }
  }

  return null;
}

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
          pending.installationId,
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
