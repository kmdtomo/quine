import { ConvexError } from "convex/values";

import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

const MAX_PROFILE_IMAGE_BYTES = 6 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_MIME_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

type ProfileMediaCtx = MutationCtx | QueryCtx;

export async function resolveProfileMedia(
  ctx: ProfileMediaCtx,
  user: Doc<"users">,
) {
  const [bannerUrl, profileImageUrl] = await Promise.all([
    user.bannerStorageId === undefined
      ? null
      : ctx.storage.getUrl(user.bannerStorageId),
    user.profileImageStorageId === undefined
      ? null
      : ctx.storage.getUrl(user.profileImageStorageId),
  ]);

  return {
    banner: bannerUrl ?? user.banner,
    image: profileImageUrl ?? user.image,
  };
}

export async function requireProfileImageStorage(
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

export async function deleteReplacedProfileStorage(
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
