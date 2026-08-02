"use node";

import { GitHubIntegrationError } from "./githubError";

const GITHUB_API_VERSION = "2022-11-28";
const MAX_INSTALLATION_PAGES = 20;
const REQUEST_TIMEOUT_MS = 15_000;

type GitHubAccount = {
  id: number;
  login: string;
  type: "Organization" | "User";
};

export type AccessibleInstallation = {
  account: GitHubAccount;
  id: number;
  repositorySelection: "all" | "selected";
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

export async function exchangeCode(
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

export async function getGithubUserId(accessToken: string): Promise<number> {
  const payload = await fetchJson("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
    },
  });
  return parseGithubUserId(payload);
}

export async function findAccessibleInstallation(
  accessToken: string,
  matches: (installation: AccessibleInstallation) => boolean,
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
      if (installation && matches(installation)) {
        return installation;
      }
    }
    if (payload.installations.length < 100) {
      return null;
    }
  }

  return null;
}
