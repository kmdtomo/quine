import { ConvexError } from "convex/values";

const MAX_PROFILE_SOCIAL_LINKS = 4;
const MAX_SOCIAL_URL_LENGTH = 2_048;
const ALLOWED_SOCIAL_PLATFORMS = new Set([
  "facebook",
  "github",
  "instagram",
  "linkedin",
  "website",
  "x",
  "youtube",
]);

export function normalizeSocialLinks(
  socialLinks: Array<{ platform: string; url: string }>,
) {
  const populatedLinks = socialLinks.filter(
    (link) => link.url.trim().length > 0,
  );
  if (populatedLinks.length > MAX_PROFILE_SOCIAL_LINKS) {
    throw new ConvexError({ code: "PROFILE_TOO_MANY_SOCIAL_LINKS" });
  }

  const normalizedLinks: Array<{ platform: string; url: string }> = [];
  const seenPlatforms = new Set<string>();
  for (const link of populatedLinks) {
    const platform =
      link.platform.trim().toLowerCase() === "twitter"
        ? "x"
        : link.platform.trim().toLowerCase();
    if (
      !ALLOWED_SOCIAL_PLATFORMS.has(platform) ||
      seenPlatforms.has(platform)
    ) {
      throw new ConvexError({ code: "PROFILE_INVALID_SOCIAL_PLATFORM" });
    }

    const url = link.url.trim();
    if (url.length > MAX_SOCIAL_URL_LENGTH || !isSafeHttpUrl(url)) {
      throw new ConvexError({ code: "PROFILE_INVALID_SOCIAL_URL" });
    }
    normalizedLinks.push({ platform, url });
    seenPlatforms.add(platform);
  }
  return normalizedLinks;
}

export function getSafeStoredSocialLinks(
  socialLinks: Array<{ platform: string; url: string }>,
) {
  const safeLinks: Array<{ platform: string; url: string }> = [];
  const seenPlatforms = new Set<string>();
  for (const link of socialLinks) {
    if (safeLinks.length >= MAX_PROFILE_SOCIAL_LINKS) {
      break;
    }
    const platform =
      link.platform.trim().toLowerCase() === "twitter"
        ? "x"
        : link.platform.trim().toLowerCase();
    const url = link.url.trim();
    if (
      !ALLOWED_SOCIAL_PLATFORMS.has(platform) ||
      seenPlatforms.has(platform) ||
      url.length > MAX_SOCIAL_URL_LENGTH ||
      !isSafeHttpUrl(url)
    ) {
      continue;
    }
    safeLinks.push({ platform, url });
    seenPlatforms.add(platform);
  }
  return safeLinks;
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      url.username.length === 0 &&
      url.password.length === 0
    );
  } catch {
    return false;
  }
}
