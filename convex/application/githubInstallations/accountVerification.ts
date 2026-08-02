import { githubError } from "../../lib/githubErrors";

export function assertVerifiedPersonalAccount(
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
