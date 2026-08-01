import type { GitHubErrorCode } from "../../lib/githubErrors";

export class GitHubIntegrationError extends Error {
  constructor(readonly code: GitHubErrorCode) {
    super(code);
    this.name = "GitHubIntegrationError";
  }
}

export function githubErrorCodeFromUnknown(
  error: unknown,
  fallback: GitHubErrorCode,
): GitHubErrorCode {
  return error instanceof GitHubIntegrationError ? error.code : fallback;
}
