import { v } from "convex/values";

import { mutation } from "./_generated/server";
import { createUploadIntent as createUploadIntentUseCase } from "./application/files/createUploadIntent";
import { finalizeUpload as finalizeUploadUseCase } from "./application/files/finalizeUpload";
import { requireUser } from "./lib/auth";
import { uploadIntentPurpose } from "./lib/uploadIntents";

export const createUploadIntent = mutation({
  args: {
    purpose: uploadIntentPurpose,
  },
  returns: v.object({
    expiresAt: v.number(),
    uploadIntentId: v.id("uploadIntents"),
    uploadUrl: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await createUploadIntentUseCase(ctx, {
      purpose: args.purpose,
      userId: user._id,
    });
  },
});

export const finalizeUpload = mutation({
  args: {
    storageId: v.id("_storage"),
    uploadIntentId: v.id("uploadIntents"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await finalizeUploadUseCase(ctx, {
      storageId: args.storageId,
      uploadIntentId: args.uploadIntentId,
      userId: user._id,
    });
  },
});
