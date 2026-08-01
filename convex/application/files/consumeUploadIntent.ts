import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import type {
  UploadIntentConsumptionTarget,
  UploadIntentPurpose,
} from "../../lib/uploadIntents";

type ConsumeUploadIntentArgs = {
  consumptionTarget: UploadIntentConsumptionTarget;
  purpose: UploadIntentPurpose;
  storageId: Id<"_storage">;
  userId: Id<"users">;
};

export async function consumeUploadIntent(
  ctx: MutationCtx,
  args: ConsumeUploadIntentArgs,
): Promise<null> {
  const [uploadIntent, duplicateUploadIntent] = await ctx.db
    .query("uploadIntents")
    .withIndex("by_storage", (q) => q.eq("storageId", args.storageId))
    .take(2);
  if (uploadIntent === undefined || duplicateUploadIntent !== undefined) {
    throw new ConvexError({ code: "UPLOAD_INTENT_NOT_FOUND" });
  }

  if (uploadIntent.status === "consumed") {
    if (
      uploadIntent.purpose === args.purpose &&
      uploadIntent.consumptionTarget !== undefined &&
      hasSameConsumptionTarget(
        uploadIntent.consumptionTarget,
        args.consumptionTarget,
      )
    ) {
      return null;
    }
    throw new ConvexError({ code: "UPLOAD_INTENT_ALREADY_CONSUMED" });
  }

  if (uploadIntent.userId !== args.userId) {
    throw new ConvexError({ code: "UPLOAD_INTENT_NOT_FOUND" });
  }
  if (uploadIntent.status !== "uploaded") {
    throw new ConvexError({ code: "UPLOAD_INTENT_NOT_UPLOADED" });
  }
  if (uploadIntent.purpose !== args.purpose) {
    throw new ConvexError({ code: "UPLOAD_INTENT_PURPOSE_MISMATCH" });
  }

  const now = Date.now();
  if (uploadIntent.expiresAt <= now) {
    throw new ConvexError({ code: "UPLOAD_INTENT_EXPIRED" });
  }

  await ctx.db.patch("uploadIntents", uploadIntent._id, {
    consumedAt: now,
    consumptionTarget: args.consumptionTarget,
    status: "consumed",
  });
  return null;
}

function hasSameConsumptionTarget(
  current: UploadIntentConsumptionTarget,
  expected: UploadIntentConsumptionTarget,
): boolean {
  if (current.kind !== expected.kind) {
    return false;
  }

  switch (current.kind) {
    case "profile":
      return expected.kind === "profile" && current.userId === expected.userId;
    case "product":
      return (
        expected.kind === "product" && current.productId === expected.productId
      );
    case "product_ai_run":
      return (
        expected.kind === "product_ai_run" && current.runId === expected.runId
      );
  }
}
