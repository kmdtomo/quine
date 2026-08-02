import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import {
  createFlowSecret,
  getSafeGithubAppReturnTo,
  GITHUB_APP_COOKIE_MAX_AGE_SECONDS,
  GITHUB_APP_CONNECTION_MODE_COOKIE,
  GITHUB_APP_RETURN_TO_COOKIE,
  GITHUB_APP_SETUP_STATE_COOKIE,
  withGithubAppError,
} from "@/features/auth/github-app-flow";

export async function GET(request: NextRequest) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }
  const returnTo = getSafeGithubAppReturnTo(
    request.nextUrl.searchParams.get("return_to"),
  );
  const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
  if (!appSlug) {
    return NextResponse.redirect(
      new URL(withGithubAppError(returnTo, "missing_config"), request.url),
    );
  }

  const state = createFlowSecret();
  const installUrl = new URL(
    `https://github.com/apps/${appSlug}/installations/new`,
  );
  installUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(installUrl);
  response.headers.set("Cache-Control", "no-store");
  response.cookies.set(GITHUB_APP_SETUP_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: GITHUB_APP_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
  response.cookies.set(GITHUB_APP_RETURN_TO_COOKIE, returnTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: GITHUB_APP_COOKIE_MAX_AGE_SECONDS,
    path: "/",
  });
  response.cookies.delete(GITHUB_APP_CONNECTION_MODE_COOKIE);
  return response;
}
