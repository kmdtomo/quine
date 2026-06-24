import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProfileView } from "@/features/profile/components/ProfileView";

export const metadata: Metadata = {
  title: "Profile — Quine",
};

type Params = Promise<{
  username: string;
}>;

type SearchParams = Promise<{
  onboarding?: string;
}>;

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const [{ username: usernameParam }, search] = await Promise.all([
    params,
    searchParams,
  ]);
  const username = getUsernameFromRouteParam(usernameParam);
  if (!username) {
    notFound();
  }

  return (
    <ProfileView
      onboarding={search.onboarding === "1"}
      username={username}
    />
  );
}

function getUsernameFromRouteParam(usernameParam: string) {
  const decodedUsernameParam = decodeRouteSegment(usernameParam);
  if (!decodedUsernameParam?.startsWith("@")) {
    return null;
  }

  const username = decodedUsernameParam.slice(1).trim();
  return username.length > 0 ? username : null;
}

function decodeRouteSegment(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}
