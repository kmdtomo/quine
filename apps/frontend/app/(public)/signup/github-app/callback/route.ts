import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import { fetchMutation } from "convex/nextjs";
import { NextRequest, NextResponse } from "next/server";

import {
  createCodeChallenge,
  createFlowSecret,
  flowSecretsMatch,
  getSafeGithubAppReturnTo,
  GITHUB_APP_CODE_VERIFIER_COOKIE,
  GITHUB_APP_COOKIE_MAX_AGE_SECONDS,
  GITHUB_APP_OAUTH_STATE_COOKIE,
  GITHUB_APP_RETURN_TO_COOKIE,
  GITHUB_APP_SETUP_STATE_COOKIE,
  hashFlowSecret,
  withGithubAppError,
} from "@/features/auth/lib/githubAppFlow";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const installationId = params.get("installation_id");
  const receivedState = params.get("state");
  const setupState =
    request.cookies.get(GITHUB_APP_SETUP_STATE_COOKIE)?.value ?? null;
  const returnTo = getSafeGithubAppReturnTo(
    request.cookies.get(GITHUB_APP_RETURN_TO_COOKIE)?.value ?? null,
  );

  if (
    !flowSecretsMatch(setupState, receivedState) ||
    !installationId ||
    !/^\d+$/.test(installationId)
  ) {
    return redirectWithClearedFlow(
      request,
      withGithubAppError(returnTo, "invalid_setup_callback"),
    );
  }

  const numericInstallationId = Number(installationId);
  if (
    !Number.isSafeInteger(numericInstallationId) ||
    numericInstallationId <= 0
  ) {
    return redirectWithClearedFlow(
      request,
      withGithubAppError(returnTo, "invalid_setup_callback"),
    );
  }

  const token = await convexAuthNextjsToken();
  if (!token) {
    return redirectWithClearedFlow(request, "/signin");
  }

  const oauthState = createFlowSecret();
  const codeVerifier = createFlowSecret();
  try {
    const verification = await fetchMutation(
      api.githubInstallations.beginVerification,
      {
        codeChallenge: createCodeChallenge(codeVerifier),
        installationId: numericInstallationId,
        stateHash: hashFlowSecret(oauthState),
      },
      { token },
    );
    const authorizationUrl = new URL(verification.authorizationUrl);
    authorizationUrl.searchParams.set("state", oauthState);

    const response = NextResponse.redirect(authorizationUrl);
    response.headers.set("Cache-Control", "no-store");
    response.cookies.delete(GITHUB_APP_SETUP_STATE_COOKIE);
    setFlowCookie(response, GITHUB_APP_OAUTH_STATE_COOKIE, oauthState);
    setFlowCookie(
      response,
      GITHUB_APP_CODE_VERIFIER_COOKIE,
      codeVerifier,
    );
    return response;
  } catch {
    return redirectWithClearedFlow(
      request,
      withGithubAppError(returnTo, "authorization_start_failed"),
    );
  }
}

function setFlowCookie(
  response: NextResponse,
  name: string,
  value: string,
) {
  response.cookies.set(name, value, {
    httpOnly: true,
    maxAge: GITHUB_APP_COOKIE_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

function redirectWithClearedFlow(
  request: NextRequest,
  target: string,
): NextResponse {
  const response = NextResponse.redirect(new URL(target, request.url));
  response.headers.set("Cache-Control", "no-store");
  response.cookies.delete(GITHUB_APP_SETUP_STATE_COOKIE);
  response.cookies.delete(GITHUB_APP_OAUTH_STATE_COOKIE);
  response.cookies.delete(GITHUB_APP_CODE_VERIFIER_COOKIE);
  response.cookies.delete(GITHUB_APP_RETURN_TO_COOKIE);
  return response;
}
