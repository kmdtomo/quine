import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import { preloadQuery } from "convex/nextjs";

import { ProfileContent } from "./ProfileContent";

type ProfileViewProps = {
  onboarding: boolean;
  username: string;
};

export async function ProfileView({ onboarding, username }: ProfileViewProps) {
  const token = await convexAuthNextjsToken();
  const preloadedProfile = token
    ? await preloadQuery(api.users.getProfile, { username }, { token })
    : await preloadQuery(api.users.getProfile, { username });

  return (
    <ProfileContent
      onboarding={onboarding}
      preloadedProfile={preloadedProfile}
    />
  );
}
