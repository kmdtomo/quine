import { NextRequest, NextResponse } from "next/server";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

const STATE_COOKIE_NAME = "quine_github_app_state";
const RETURN_TO_COOKIE_NAME = "quine_github_app_return_to";
const DEFAULT_RETURN_TO = "/tech-stack/edit?onboarding=1";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const installationId = params.get("installation_id");
  const state = params.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE_NAME)?.value ?? null;
  const returnTo =
    request.cookies.get(RETURN_TO_COOKIE_NAME)?.value ?? DEFAULT_RETURN_TO;

  let target = withGithubAppError(returnTo, "invalid_state");

  if (!installationId) {
    target = withGithubAppError(returnTo, "missing_installation");
  } else if (
    state &&
    cookieState &&
    state === cookieState &&
    /^\d+$/.test(installationId)
  ) {
    const token = await convexAuthNextjsToken();
    if (!token) {
      target = "/signin";
    } else {
      try {
        await fetchMutation(
          api.users.setGithubInstallationId,
          { installationId: Number(installationId) },
          { token },
        );
        target = withInstallationId(returnTo, installationId);
      } catch {
        target = withGithubAppError(returnTo, "invalid_state");
      }
    }
  }

  const response = NextResponse.redirect(new URL(target, request.url));
  response.cookies.delete(STATE_COOKIE_NAME);
  response.cookies.delete(RETURN_TO_COOKIE_NAME);
  return response;
}

function withGithubAppError(returnTo: string, error: string) {
  const url = new URL(returnTo, "https://quine.local");
  url.searchParams.set("github_app_error", error);
  return `${url.pathname}${url.search}`;
}

function withInstallationId(returnTo: string, installationId: string) {
  const url = new URL(returnTo, "https://quine.local");
  url.searchParams.set("installation_id", installationId);
  url.searchParams.delete("github_app_error");
  return `${url.pathname}${url.search}`;
}
