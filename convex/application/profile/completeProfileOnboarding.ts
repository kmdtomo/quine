import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { normalizeSocialLinks } from "./socialLinks";

const MAX_PROFILE_IMAGE_BYTES = 6 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_MIME_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_BIO_LENGTH = 120;
const MAX_COMPANY_LENGTH = 100;
const MAX_NAME_LENGTH = 80;
const MAX_ROLE_LENGTH = 80;
const ALLOWED_GALLERY_BANNERS = new Set([
  "/background/drew-beamer-pek8uLQauMk-unsplash.jpg",
  "/background/ivan-bandura-WhIff5iuW-E-unsplash.jpg",
  "/lp/tech_stack_bg.jpg",
  "/profile/banner-aurora.jpg",
  "/profile/banner-city.jpg",
  "/profile/banner-field.jpg",
]);

type CompleteProfileOnboardingArgs = {
  banner?: string | null;
  bannerStorageId?: Id<"_storage"> | null;
  bio: string;
  company: string;
  name: string;
  profileImageStorageId?: Id<"_storage"> | null;
  role: string;
  socialLinks?: Array<{ platform: string; url: string }>;
};

export async function completeProfileOnboarding(
  ctx: MutationCtx,
  args: CompleteProfileOnboardingArgs,
  user: Doc<"users">,
): Promise<null> {
  const name = args.name.trim();
  const role = args.role.trim();
  const company = args.company.trim();
  const bio = args.bio.trim();
  const banner = normalizeGalleryBanner(args.banner);
  const socialLinks =
    args.socialLinks === undefined
      ? user.socialLinks
      : normalizeSocialLinks(args.socialLinks);

  if (!name) {
    throw new ConvexError({ code: "PROFILE_NAME_REQUIRED" });
  }
  if (name.length > MAX_NAME_LENGTH) {
    throw new ConvexError({ code: "PROFILE_NAME_TOO_LONG" });
  }
  if (!role) {
    throw new ConvexError({ code: "PROFILE_ROLE_REQUIRED" });
  }
  if (role.length > MAX_ROLE_LENGTH) {
    throw new ConvexError({ code: "PROFILE_ROLE_TOO_LONG" });
  }
  if (!company) {
    throw new ConvexError({ code: "PROFILE_COMPANY_REQUIRED" });
  }
  if (company.length > MAX_COMPANY_LENGTH) {
    throw new ConvexError({ code: "PROFILE_COMPANY_TOO_LONG" });
  }
  if (bio.length > MAX_BIO_LENGTH) {
    throw new ConvexError({ code: "PROFILE_BIO_TOO_LONG" });
  }

  const profileImageStorageId =
    args.profileImageStorageId === undefined
      ? user.profileImageStorageId
      : (args.profileImageStorageId ?? undefined);
  const bannerStorageId =
    args.bannerStorageId === undefined
      ? user.bannerStorageId
      : (args.bannerStorageId ?? undefined);
  if (
    profileImageStorageId !== undefined &&
    profileImageStorageId !== user.profileImageStorageId
  ) {
    await requireProfileImageStorage(ctx, profileImageStorageId);
  }
  if (
    bannerStorageId !== undefined &&
    bannerStorageId !== user.bannerStorageId
  ) {
    await requireProfileImageStorage(ctx, bannerStorageId);
  }

  await ctx.db.patch("users", user._id, {
    ...(args.banner === undefined ? {} : { banner }),
    bannerStorageId,
    bio: bio.length > 0 ? bio : undefined,
    company,
    isPublic: true,
    name,
    profileImageStorageId,
    profileOnboardingCompletedAt:
      user.profileOnboardingCompletedAt ?? Date.now(),
    role,
    socialLinks,
  });
  await deleteReplacedProfileStorage(
    ctx,
    [user.profileImageStorageId, user.bannerStorageId],
    [profileImageStorageId, bannerStorageId],
  );
  return null;
}

function normalizeGalleryBanner(
  value: string | null | undefined,
): string | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || value.trim().length === 0) {
    return undefined;
  }
  const banner = value.trim();
  if (!ALLOWED_GALLERY_BANNERS.has(banner)) {
    throw new ConvexError({ code: "PROFILE_INVALID_BANNER" });
  }
  return banner;
}

async function requireProfileImageStorage(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
) {
  const metadata = await ctx.db.system.get("_storage", storageId);
  if (metadata === null) {
    throw new ConvexError({ code: "PROFILE_FILE_NOT_FOUND" });
  }
  if (
    metadata.contentType === undefined ||
    !ALLOWED_PROFILE_IMAGE_MIME_TYPES.has(metadata.contentType)
  ) {
    throw new ConvexError({ code: "PROFILE_INVALID_FILE_TYPE" });
  }
  if (metadata.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new ConvexError({ code: "PROFILE_FILE_TOO_LARGE" });
  }
}

async function deleteReplacedProfileStorage(
  ctx: MutationCtx,
  previousStorageIds: Array<Id<"_storage"> | undefined>,
  retainedStorageIds: Array<Id<"_storage"> | undefined>,
) {
  const retained = new Set(
    retainedStorageIds.filter(
      (storageId): storageId is Id<"_storage"> =>
        storageId !== undefined,
    ),
  );
  const deleted = new Set<Id<"_storage">>();

  for (const storageId of previousStorageIds) {
    if (
      storageId === undefined ||
      retained.has(storageId) ||
      deleted.has(storageId)
    ) {
      continue;
    }
    await ctx.storage.delete(storageId);
    deleted.add(storageId);
  }
}
