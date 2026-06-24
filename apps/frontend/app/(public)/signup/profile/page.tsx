import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export const metadata: Metadata = {
  title: "Complete your profile — Quine",
};

export default async function SignupProfilePage() {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/signin");
  }

  const me = await fetchQuery(api.users.getMe, {}, { token });
  if (me?.username) {
    redirect(getProfileOnboardingHref(me.username));
  }

  redirect("/tech-stack/edit");
}

function getProfileOnboardingHref(username: string) {
  const normalizedUsername = username.startsWith("@")
    ? username.slice(1)
    : username;
  return `/@${encodeURIComponent(normalizedUsername)}?onboarding=1`;
}
