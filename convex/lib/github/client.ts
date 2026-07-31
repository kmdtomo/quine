"use node";

import { createSign } from "node:crypto";

import { GitHubIntegrationError } from "../githubErrors";
import {
  compareNullableDates,
  getPrimaryTechnologyFromLanguage,
  isRecord,
  readString,
  trimContextText,
} from "./detection";
import type {
  DirectoryEntry,
  FileReadResult,
  GitHubRequestBudget,
  ProductRepository,
  RepositoryReadme,
  RepositorySummary,
} from "./types";

const GITHUB_API_URL = "https://api.github.com";
const MAX_REPOSITORY_LIST_PAGES = 5;
const GITHUB_FETCH_TIMEOUT_MS = 15_000;
const MAX_PRODUCT_REPO_README_CHARS = 20_000;
const COMMON_README_PATHS = [
  "README.md",
  "README.mdx",
  "README",
  "Readme.md",
  "readme.md",
  "docs/README.md",
];

export function createGitHubRequestBudget(limit: number): GitHubRequestBudget {
  return {
    limit,
    used: 0,
    exhausted: false,
    warnings: [],
  };
}

function spendGitHubRequest(
  requestBudget: GitHubRequestBudget,
  url: string,
): boolean {
  if (requestBudget.used >= requestBudget.limit) {
    if (!requestBudget.exhausted) {
      const endpoint = new URL(url);
      requestBudget.warnings.push(
        `GitHub API request budget reached before ${endpoint.pathname}.`,
      );
    }
    requestBudget.exhausted = true;
    return false;
  }

  requestBudget.used += 1;
  return true;
}

export async function createInstallationToken(
  installationId: number,
  requestBudget: GitHubRequestBudget,
): Promise<string> {
  const jwt = createGitHubAppJwt();
  const response = await githubJson(
    `${GITHUB_API_URL}/app/installations/${installationId}/access_tokens`,
    jwt,
    "POST",
    requestBudget,
  );

  if (!isRecord(response.data)) {
    throw new GitHubIntegrationError("GITHUB_ANALYSIS_REQUEST_FAILED");
  }

  const token = readString(response.data, "token");
  if (!token) {
    throw new GitHubIntegrationError("GITHUB_ANALYSIS_REQUEST_FAILED");
  }
  return token;
}

function createGitHubAppJwt(): string {
  const appId = process.env.GITHUB_APP_ID;
  const privateKeyBase64 = process.env.GITHUB_APP_PRIVATE_KEY;
  if (!appId || !privateKeyBase64) {
    throw new GitHubIntegrationError("GITHUB_APP_NOT_CONFIGURED");
  }

  const privateKey = Buffer.from(privateKeyBase64, "base64").toString("utf8");
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      iat: now - 60,
      exp: now + 9 * 60,
      iss: appId,
    }),
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(privateKey, "base64url");
  return `${unsignedToken}.${signature}`;
}

function encodeBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

export async function listInstallationRepositories(
  token: string,
  requestBudget: GitHubRequestBudget,
): Promise<RepositorySummary[]> {
  const repositories: RepositorySummary[] = [];
  let page = 1;
  while (page <= MAX_REPOSITORY_LIST_PAGES && !requestBudget.exhausted) {
    const response = await githubJson(
      `${GITHUB_API_URL}/installation/repositories?per_page=100&page=${page}`,
      token,
      "GET",
      requestBudget,
    );
    if (!isRecord(response.data)) {
      break;
    }

    const repositoriesValue = response.data.repositories;
    if (!Array.isArray(repositoriesValue)) {
      break;
    }

    for (const item of repositoriesValue) {
      const repository = parseRepository(item);
      if (repository) {
        repositories.push(repository);
      }
    }
    if (repositoriesValue.length < 100) {
      break;
    }
    page += 1;
  }
  if (page > MAX_REPOSITORY_LIST_PAGES) {
    requestBudget.warnings.push(
      `Repository listing stopped after ${MAX_REPOSITORY_LIST_PAGES} pages to stay within the request budget.`,
    );
  }
  return repositories;
}

async function readLanguages(
  token: string,
  repositoryFullName: string,
  warnings: string[],
  requestBudget: GitHubRequestBudget,
): Promise<string[]> {
  const response = await githubJson(
    `${GITHUB_API_URL}/repos/${repositoryFullName}/languages`,
    token,
    "GET",
    requestBudget,
  );
  if (response.status === 409) {
    warnings.push(`${repositoryFullName} is empty.`);
    return [];
  }
  if (!isRecord(response.data)) {
    warnings.push(`Could not read languages for ${repositoryFullName}.`);
    return [];
  }

  return Object.entries(response.data)
    .filter(([, bytes]) => typeof bytes === "number" && bytes > 0)
    .sort(([, a], [, b]) => {
      const aValue = typeof a === "number" ? a : 0;
      const bValue = typeof b === "number" ? b : 0;
      return bValue - aValue;
    })
    .map(([language]) => language);
}

async function readDirectory(
  token: string,
  repositoryFullName: string,
  path: string,
  requestBudget: GitHubRequestBudget,
): Promise<DirectoryEntry[]> {
  const encodedPath = encodeRepositoryPath(path);
  const response = await githubJson(
    `${GITHUB_API_URL}/repos/${repositoryFullName}/contents/${encodedPath}`,
    token,
    "GET",
    requestBudget,
  );
  if (
    response.status === 404 ||
    response.status === 409 ||
    !Array.isArray(response.data)
  ) {
    return [];
  }

  const entries: DirectoryEntry[] = [];
  for (const item of response.data) {
    if (!isRecord(item)) {
      continue;
    }
    const name = readString(item, "name");
    const itemPath = readString(item, "path");
    const type = readString(item, "type");
    if (!name || !itemPath) {
      continue;
    }
    entries.push({
      name,
      path: itemPath,
      type: type === "file" || type === "dir" ? type : "other",
    });
  }
  return entries;
}

export async function readRepositoryTree(
  token: string,
  repositoryFullName: string,
  defaultBranch: string,
  requestBudget: GitHubRequestBudget,
): Promise<string[]> {
  const encodedBranch = encodeURIComponent(defaultBranch);
  const response = await githubJson(
    `${GITHUB_API_URL}/repos/${repositoryFullName}/git/trees/${encodedBranch}?recursive=1`,
    token,
    "GET",
    requestBudget,
  );
  if (response.status === 409) {
    return [];
  }
  if (!isRecord(response.data)) {
    return [];
  }

  const tree = response.data.tree;
  if (!Array.isArray(tree)) {
    return [];
  }

  const paths: string[] = [];
  for (const item of tree) {
    if (!isRecord(item)) {
      continue;
    }
    const type = readString(item, "type");
    const path = readString(item, "path");
    if (type === "blob" && path) {
      paths.push(path);
    }
  }
  return paths.sort();
}

export async function readFile(
  token: string,
  repositoryFullName: string,
  path: string,
  requestBudget: GitHubRequestBudget,
): Promise<FileReadResult> {
  const encodedPath = encodeRepositoryPath(path);
  const response = await githubJson(
    `${GITHUB_API_URL}/repos/${repositoryFullName}/contents/${encodedPath}`,
    token,
    "GET",
    requestBudget,
  );
  if (response.status === 404 || response.status === 409) {
    return { exists: false, text: null };
  }

  if (!isRecord(response.data)) {
    return { exists: true, text: null };
  }

  const encoding = readString(response.data, "encoding");
  const content = readString(response.data, "content");
  if (encoding !== "base64" || !content) {
    return { exists: true, text: null };
  }

  return {
    exists: true,
    text: Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf8"),
  };
}

export async function readRepositoryReadme(
  token: string,
  repository: RepositorySummary,
  requestBudget: GitHubRequestBudget,
): Promise<RepositoryReadme | null> {
  for (const path of COMMON_README_PATHS) {
    if (requestBudget.exhausted) {
      return null;
    }

    const content = await readFile(
      token,
      repository.fullName,
      path,
      requestBudget,
    );
    if (!content.exists || !content.text) {
      continue;
    }

    return {
      path,
      text: trimContextText(content.text, MAX_PRODUCT_REPO_README_CHARS),
    };
  }

  return null;
}


function encodeRepositoryPath(path: string): string {
  return path
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function githubJson(
  url: string,
  token: string,
  method: "GET" | "POST",
  requestBudget: GitHubRequestBudget,
): Promise<{ status: number; data: unknown }> {
  if (!spendGitHubRequest(requestBudget, url)) {
    return { status: 0, data: null };
  }

  const response = await fetch(url, {
    method,
    signal: AbortSignal.timeout(GITHUB_FETCH_TIMEOUT_MS),
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (response.status === 404 || response.status === 409) {
    return { status: response.status, data: null };
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new GitHubIntegrationError("GITHUB_ANALYSIS_REQUEST_FAILED");
    }
  }
  if (!response.ok) {
    console.error("GitHub API request failed", {
      pathname: getSafeGitHubPathname(url),
      status: response.status,
    });
    throw new GitHubIntegrationError("GITHUB_ANALYSIS_REQUEST_FAILED");
  }
  return { status: response.status, data };
}

function getSafeGitHubPathname(url: string): string {
  const pathname = new URL(url).pathname;
  if (pathname.startsWith("/repos/")) {
    return "/repos/:owner/:repository/:endpoint";
  }
  if (pathname.startsWith("/app/installations/")) {
    return "/app/installations/:installation/:endpoint";
  }
  return pathname;
}

function parseRepository(value: unknown): RepositorySummary | null {
  if (!isRecord(value)) {
    return null;
  }

  const fullName = readString(value, "full_name");
  const name = readString(value, "name");
  const htmlUrl = readString(value, "html_url");
  const homepage = readString(value, "homepage");
  const defaultBranch = readString(value, "default_branch");
  if (!fullName || !name || !htmlUrl || !defaultBranch) {
    return null;
  }

  const description = readString(value, "description");
  const updatedAt = readString(value, "updated_at");
  const primaryLanguage = readString(value, "language");
  const primaryTechnology = getPrimaryTechnologyFromLanguage(primaryLanguage);
  const privateValue = value.private;
  const forkValue = value.fork;
  const starsValue = value.stargazers_count;

  return {
    fullName,
    name,
    description,
    htmlUrl,
    homepage: homepage && homepage.trim().length > 0 ? homepage : null,
    defaultBranch,
    primaryLanguage,
    primaryTechnologyKey: primaryTechnology?.key ?? null,
    primaryTechnologyName: primaryTechnology?.name ?? null,
    private: typeof privateValue === "boolean" ? privateValue : false,
    fork: typeof forkValue === "boolean" ? forkValue : false,
    stargazersCount: typeof starsValue === "number" ? starsValue : 0,
    updatedAt,
  };
}

export function sortRepositoriesForSelection(
  repositories: RepositorySummary[],
): RepositorySummary[] {
  return [...repositories].sort((a, b) => {
    if (a.fork !== b.fork) {
      return a.fork ? 1 : -1;
    }
    const stars = b.stargazersCount - a.stargazersCount;
    if (stars !== 0) {
      return stars;
    }
    return compareNullableDates(b.updatedAt, a.updatedAt);
  });
}

export function toProductRepository(repository: RepositorySummary): ProductRepository {
  return {
    fullName: repository.fullName,
    name: repository.name,
    description: repository.description,
    htmlUrl: repository.htmlUrl,
    homepage: repository.homepage,
    primaryLanguage: repository.primaryLanguage,
    primaryTechnologyKey: repository.primaryTechnologyKey,
    primaryTechnologyName: repository.primaryTechnologyName,
    private: repository.private,
    fork: repository.fork,
    stargazersCount: repository.stargazersCount,
    updatedAt: repository.updatedAt,
  };
}
