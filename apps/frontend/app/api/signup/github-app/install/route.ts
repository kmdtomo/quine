import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

const STATE_COOKIE_NAME = "quine_github_app_state";

export function GET(request: Request) {
  const appSlug = process.env.NEXT_PUBLIC_GITHUB_APP_SLUG;
  if (!appSlug) {
    return NextResponse.redirect(
      new URL("/signup/github-app?error=missing_config", request.url),
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
  return response;
}
