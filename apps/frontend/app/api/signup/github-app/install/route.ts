import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

const STATE_COOKIE_NAME = "quine_github_app_state";
const RETURN_TO_COOKIE_NAME = "quine_github_app_return_to";
const DEFAULT_RETURN_TO = "/tech-stack/edit?onboarding=1";

export function GET(request: NextRequest) {
  const returnTo = getSafeReturnTo(request.nextUrl.searchParams.get("return_to"));
  const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
  if (!appSlug) {
    return NextResponse.redirect(
      new URL(withGithubAppError(returnTo, "missing_config"), request.url),
    );
  }

  const state = randomUUID();
  const installUrl = new URL(
    `https://github.com/apps/${appSlug}/installations/new`,
  );
  installUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(installUrl);
  response.cookies.set(STATE_COOKIE_NAME, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });
  response.cookies.set(RETURN_TO_COOKIE_NAME, returnTo, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10,
    path: "/",
  });
  return response;
}

function getSafeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_RETURN_TO;
  }

  const url = new URL(value, "https://quine.local");
  if (url.pathname !== "/tech-stack/edit" && url.pathname !== "/products/new") {
    return DEFAULT_RETURN_TO;
  }

  return `${url.pathname}${url.search}`;
}

function withGithubAppError(returnTo: string, error: string) {
  const url = new URL(returnTo, "https://quine.local");
  url.searchParams.set("github_app_error", error);
  return `${url.pathname}${url.search}`;
}
