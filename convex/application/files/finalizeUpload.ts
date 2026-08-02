import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  isAllowedUploadContentType,
  MAX_UPLOAD_BYTES,
  UPLOADED_INTENT_TTL_MS,
} from "../../lib/uploadIntents";

type FinalizeUploadArgs = {
  storageId: Id<"_storage">;
  uploadIntentId: Id<"uploadIntents">;
  userId: Id<"users">;
};

export async function finalizeUpload(
  ctx: MutationCtx,
  args: FinalizeUploadArgs,
): Promise<null> {
  const uploadIntent = await ctx.db.get(
    "uploadIntents",
    args.uploadIntentId,
  );
  if (uploadIntent === null || uploadIntent.userId !== args.userId) {
    throw new ConvexError({ code: "UPLOAD_INTENT_NOT_FOUND" });
  }

  if (uploadIntent.status !== "pending") {
    if (uploadIntent.storageId === args.storageId) {
      return null;
    }
    throw new ConvexError({ code: "UPLOAD_INTENT_ALREADY_FINALIZED" });
  }

  const now = Date.now();
  if (uploadIntent.expiresAt <= now) {
    throw new ConvexError({ code: "UPLOAD_INTENT_EXPIRED" });
  }

  const registeredUploads = await ctx.db
    .query("uploadIntents")
    .withIndex("by_storage", (q) => q.eq("storageId", args.storageId))
    .take(2);
  if (
    registeredUploads.some(
      (registeredUpload) => registeredUpload._id !== uploadIntent._id,
    )
  ) {
    throw new ConvexError({ code: "UPLOAD_FILE_ALREADY_REGISTERED" });
  }

  const metadata = await ctx.db.system.get("_storage", args.storageId);
  if (metadata === null) {
    throw new ConvexError({ code: "UPLOAD_FILE_NOT_FOUND" });
  }
  if (metadata._creationTime < uploadIntent._creationTime) {
    throw new ConvexError({ code: "UPLOAD_FILE_PREDATES_INTENT" });
  }
  if (
    metadata.contentType === undefined ||
    !isAllowedUploadContentType(uploadIntent.purpose, metadata.contentType)
  ) {
    throw new ConvexError({ code: "UPLOAD_INVALID_FILE_TYPE" });
  }
  if (metadata.size > MAX_UPLOAD_BYTES) {
    throw new ConvexError({ code: "UPLOAD_FILE_TOO_LARGE" });
  }

  await ctx.db.patch("uploadIntents", uploadIntent._id, {
    expiresAt: now + UPLOADED_INTENT_TTL_MS,
    status: "uploaded",
    storageId: args.storageId,
    uploadedAt: now,
  });
  return null;
}
