import { NextRequest, NextResponse } from "next/server";

const STATE_COOKIE_NAME = "quine_github_app_state";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const installationId = params.get("installation_id");
  const state = params.get("state");
  const cookieState = request.cookies.get(STATE_COOKIE_NAME)?.value ?? null;

  let target = "/signup/github-app?error=invalid_state";

  if (!installationId) {
    target = "/signup/github-app?error=missing_installation";
  } else if (
    state &&
    cookieState &&
    state === cookieState &&
    /^\d+$/.test(installationId)
  ) {
    target = `/signup/detecting?installation_id=${encodeURIComponent(
      installationId,
    )}`;
  }

  const response = NextResponse.redirect(new URL(target, request.url));
  response.cookies.delete(STATE_COOKIE_NAME);
  return response;
}
