import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

export const GITHUB_APP_SETUP_STATE_COOKIE =
  "quine_github_app_setup_state";
export const GITHUB_APP_OAUTH_STATE_COOKIE =
  "quine_github_app_oauth_state";
export const GITHUB_APP_CODE_VERIFIER_COOKIE =
  "quine_github_app_code_verifier";
export const GITHUB_APP_RETURN_TO_COOKIE =
  "quine_github_app_return_to";
export const GITHUB_APP_DEFAULT_RETURN_TO =
  "/tech-stack/edit?onboarding=1";
export const GITHUB_APP_COOKIE_MAX_AGE_SECONDS = 10 * 60;

export function createFlowSecret(): string {
  return randomBytes(32).toString("base64url");
}

export function hashFlowSecret(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function flowSecretsMatch(
  expected: string | null,
  received: string | null,
): boolean {
  if (!expected || !received) {
    return false;
  }
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function getSafeGithubAppReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return GITHUB_APP_DEFAULT_RETURN_TO;
  }

  const url = new URL(value, "https://quine.local");
  if (
    url.pathname !== "/tech-stack/edit" &&
    url.pathname !== "/products/new"
  ) {
    return GITHUB_APP_DEFAULT_RETURN_TO;
  }
  return `${url.pathname}${url.search}`;
}

export function withGithubAppError(
  returnTo: string,
  error: string,
): string {
  const url = new URL(returnTo, "https://quine.local");
  url.searchParams.set("github_app_error", error);
  url.searchParams.delete("github_app_connected");
  url.searchParams.delete("github_installation");
  return `${url.pathname}${url.search}`;
}

export function withGithubAppConnected(
  returnTo: string,
  githubInstallationId: string,
): string {
  const url = new URL(returnTo, "https://quine.local");
  url.searchParams.delete("github_app_error");
  url.searchParams.set("github_app_connected", "1");
  url.searchParams.set("github_installation", githubInstallationId);
  return `${url.pathname}${url.search}`;
}
