import { ConvexError } from "convex/values";

export type GitHubErrorCode =
  | "GITHUB_ANALYSIS_ALREADY_RUNNING"
  | "GITHUB_ANALYSIS_NOT_FOUND"
  | "GITHUB_ANALYSIS_NOT_RETRYABLE"
  | "GITHUB_ANALYSIS_REQUEST_FAILED"
  | "GITHUB_APP_NOT_CONFIGURED"
  | "GITHUB_AUTHORIZATION_EXPIRED"
  | "GITHUB_AUTHORIZATION_FAILED"
  | "GITHUB_AUTHORIZATION_MISMATCH"
  | "GITHUB_INSTALLATION_NOT_ACCESSIBLE"
  | "GITHUB_INSTALLATION_NOT_FOUND"
  | "GITHUB_INVALID_CALLBACK"
  | "GITHUB_INVALID_INSTALLATION"
  | "GITHUB_INVALID_STATE"
  | "GITHUB_ORGANIZATION_REQUIRES_SECURE_TOKEN_STORAGE";

export function githubError(code: GitHubErrorCode): ConvexError<{
  code: GitHubErrorCode;
}> {
  return new ConvexError({ code });
}

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
