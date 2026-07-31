import { redirect } from "next/navigation";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

const TECH_STACK_EDIT_HREF = "/tech-stack/edit";

export async function HomeRedirectView() {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/signin");
  }

  const me = await fetchQuery(api.users.getMe, {}, { token });
  if (!me) {
    redirect("/signin");
  }

  const profileHref = getProfileHref(me.username);
  if (me.techStackOnboardingCompletedAt === undefined) {
    redirect(TECH_STACK_EDIT_HREF);
  }

  if (me.profileOnboardingCompletedAt === undefined) {
    redirect(
      profileHref ? `${profileHref}?onboarding=1` : TECH_STACK_EDIT_HREF,
    );
  }

  redirect(profileHref ?? TECH_STACK_EDIT_HREF);
  return null;
}

function getProfileHref(username: string | undefined) {
  const normalizedUsername = normalizeUsername(username);
  return normalizedUsername
    ? `/@${encodeURIComponent(normalizedUsername)}`
    : null;
}

function normalizeUsername(username: string | undefined) {
  if (!username) {
    return undefined;
  }

  const normalizedUsername = username.startsWith("@")
    ? username.slice(1)
    : username;
  return normalizedUsername.length > 0 ? normalizedUsername : undefined;
}
