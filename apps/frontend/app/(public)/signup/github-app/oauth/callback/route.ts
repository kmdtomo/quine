import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import { fetchAction } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { NextRequest, NextResponse } from "next/server";

import {
  flowSecretsMatch,
  getSafeGithubAppReturnTo,
  GITHUB_APP_CODE_VERIFIER_COOKIE,
  GITHUB_APP_CONNECTION_MODE_COOKIE,
  GITHUB_APP_EXISTING_CONNECTION_MODE,
  GITHUB_APP_OAUTH_STATE_COOKIE,
  GITHUB_APP_RETURN_TO_COOKIE,
  hashFlowSecret,
  withGithubAppConnected,
  withGithubAppError,
} from "@/features/auth/github-app-flow";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const receivedState = request.nextUrl.searchParams.get("state");
  const oauthState =
    request.cookies.get(GITHUB_APP_OAUTH_STATE_COOKIE)?.value ?? null;
  const codeVerifier =
    request.cookies.get(GITHUB_APP_CODE_VERIFIER_COOKIE)?.value ?? null;
  const returnTo = getSafeGithubAppReturnTo(
    request.cookies.get(GITHUB_APP_RETURN_TO_COOKIE)?.value ?? null,
  );
  const connectionMode =
    request.cookies.get(GITHUB_APP_CONNECTION_MODE_COOKIE)?.value ??
    null;

  if (
    !code ||
    !oauthState ||
    !codeVerifier ||
    !flowSecretsMatch(oauthState, receivedState)
  ) {
    return redirectWithClearedOauth(
      request,
      withGithubAppError(returnTo, "invalid_oauth_callback"),
    );
  }

  const token = await convexAuthNextjsToken();
  if (!token) {
    return redirectWithClearedOauth(request, "/signin");
  }

  try {
    const verification =
      connectionMode === GITHUB_APP_EXISTING_CONNECTION_MODE
        ? await fetchAction(
            api.githubOAuthAction
              .completeExistingInstallationAuthorization,
            {
              code,
              codeVerifier,
            },
            { token },
          )
        : await fetchAction(
            api.githubOAuthAction.completeInstallationAuthorization,
            {
              code,
              codeVerifier,
              stateHash: hashFlowSecret(oauthState),
            },
            { token },
          );
    return redirectWithClearedOauth(
      request,
      withGithubAppConnected(
        returnTo,
        verification.githubInstallationId,
      ),
    );
  } catch (error: unknown) {
    const errorCode = readConvexErrorCode(error);
    return redirectWithClearedOauth(
      request,
      withGithubAppError(
        returnTo,
        mapAuthorizationError(errorCode),
      ),
    );
  }
}

function mapAuthorizationError(errorCode: string | null): string {
  if (
    errorCode ===
    "GITHUB_ORGANIZATION_REQUIRES_SECURE_TOKEN_STORAGE"
  ) {
    return "organization_not_supported";
  }
  if (errorCode === "GITHUB_INSTALLATION_NOT_ACCESSIBLE") {
    return "installation_not_found";
  }
  return "authorization_failed";
}

function readConvexErrorCode(error: unknown): string | null {
  if (
    !(error instanceof ConvexError) ||
    typeof error.data !== "object" ||
    error.data === null ||
    !("code" in error.data) ||
    typeof error.data.code !== "string"
  ) {
    return null;
  }
  return error.data.code;
}

function redirectWithClearedOauth(
  request: NextRequest,
  target: string,
): NextResponse {
  const response = NextResponse.redirect(new URL(target, request.url));
  response.headers.set("Cache-Control", "no-store");
  response.cookies.delete(GITHUB_APP_OAUTH_STATE_COOKIE);
  response.cookies.delete(GITHUB_APP_CODE_VERIFIER_COOKIE);
  response.cookies.delete(GITHUB_APP_RETURN_TO_COOKIE);
  response.cookies.delete(GITHUB_APP_CONNECTION_MODE_COOKIE);
  return response;
}
