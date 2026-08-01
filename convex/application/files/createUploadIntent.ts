import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  MAX_OPEN_UPLOAD_INTENTS,
  UPLOAD_INTENT_TTL_MS,
  type UploadIntentPurpose,
} from "../../lib/uploadIntents";

type CreateUploadIntentArgs = {
  purpose: UploadIntentPurpose;
  userId: Id<"users">;
};

export async function createUploadIntent(
  ctx: MutationCtx,
  args: CreateUploadIntentArgs,
) {
  const now = Date.now();
  const expiresAt = now + UPLOAD_INTENT_TTL_MS;
  const [pendingIntents, uploadedIntents] = await Promise.all([
    ctx.db
      .query("uploadIntents")
      .withIndex("by_user_status_expiry", (q) =>
        q
          .eq("userId", args.userId)
          .eq("status", "pending")
          .gt("expiresAt", now),
      )
      .take(MAX_OPEN_UPLOAD_INTENTS),
    ctx.db
      .query("uploadIntents")
      .withIndex("by_user_status_expiry", (q) =>
        q
          .eq("userId", args.userId)
          .eq("status", "uploaded")
          .gt("expiresAt", now),
      )
      .take(MAX_OPEN_UPLOAD_INTENTS),
  ]);
  if (
    pendingIntents.length + uploadedIntents.length >=
    MAX_OPEN_UPLOAD_INTENTS
  ) {
    throw new ConvexError({ code: "UPLOAD_INTENT_LIMIT_REACHED" });
  }

  const uploadUrl = await ctx.storage.generateUploadUrl();
  const uploadIntentId = await ctx.db.insert("uploadIntents", {
    expiresAt,
    purpose: args.purpose,
    status: "pending",
    userId: args.userId,
  });

  return {
    expiresAt,
    uploadIntentId,
    uploadUrl,
  };
}
