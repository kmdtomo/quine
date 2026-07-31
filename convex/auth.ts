import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

import { normalizeUsername } from "./lib/username";

declare module "@auth/core/types" {
  interface User {
    githubBio?: string;
    githubCompany?: string;
    githubId?: number;
    githubName?: string;
    username?: string;
  }
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      profile(profile) {
        return {
          id: profile.id.toString(),
          email: profile.email,
          image: profile.avatar_url,
          githubBio: profile.bio ?? undefined,
          githubCompany: profile.company ?? undefined,
          githubId: profile.id,
          githubName: profile.name ?? profile.login,
          username: profile.login,
        };
      },
    }),
  ],
  callbacks: {
    async afterUserCreatedOrUpdated(ctx, { profile, userId }) {
      const user = await ctx.db.get("users", userId);
      if (!user) {
        return;
      }

      const githubId = readNumber(profile.githubId);
      const username = normalizeUsername(readString(profile.username));
      const image = readString(profile.image);
      const email = readString(profile.email);
      const githubName = readString(profile.githubName);
      const githubBio = readString(profile.githubBio);
      const githubCompany = readString(profile.githubCompany);
      const patch: {
        bio?: string;
        company?: string;
        email?: string;
        githubBio?: string;
        githubCompany?: string;
        githubId?: number;
        githubName?: string;
        image?: string;
        isPublic?: boolean;
        name?: string;
        username?: string;
      } = {};

      if (githubId !== undefined && user.githubId !== githubId) {
        patch.githubId = githubId;
      }
      if (username !== undefined && user.username !== username) {
        patch.username = username;
      }
      if (image !== undefined && user.image !== image) {
        patch.image = image;
      }
      if (email !== undefined && user.email !== email) {
        patch.email = email;
      }
      if (githubName !== undefined && user.githubName !== githubName) {
        patch.githubName = githubName;
      }
      if (githubBio !== undefined && user.githubBio !== githubBio) {
        patch.githubBio = githubBio;
      }
      if (
        githubCompany !== undefined &&
        user.githubCompany !== githubCompany
      ) {
        patch.githubCompany = githubCompany;
      }
      if (!hasText(user.name) && githubName !== undefined) {
        patch.name = githubName;
      }
      if (!hasText(user.bio) && githubBio !== undefined) {
        patch.bio = githubBio;
      }
      if (!hasText(user.company) && githubCompany !== undefined) {
        patch.company = githubCompany;
      }
      if (user.isPublic === undefined) {
        patch.isPublic = true;
      }

      if (Object.keys(patch).length > 0) {
        await ctx.db.patch("users", userId, patch);
      }
    },
  },
});

function hasText(value: string | undefined) {
  return value !== undefined && value.trim().length > 0;
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined;
}
