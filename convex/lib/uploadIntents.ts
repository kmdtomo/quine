import type { Infer } from "convex/values";
import { v } from "convex/values";

export const MAX_OPEN_UPLOAD_INTENTS = 20;
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
export const UPLOAD_INTENT_TTL_MS = 60 * 60 * 1000;
export const UPLOADED_INTENT_TTL_MS = 24 * 60 * 60 * 1000;

export const uploadIntentPurpose = v.union(
  v.literal("profile_avatar"),
  v.literal("profile_banner"),
  v.literal("product_logo"),
  v.literal("product_screenshot"),
  v.literal("product_ai_attachment"),
);

export type UploadIntentPurpose = Infer<typeof uploadIntentPurpose>;

export const uploadIntentStatus = v.union(
  v.literal("pending"),
  v.literal("uploaded"),
  v.literal("consumed"),
);

export const uploadIntentConsumptionTarget = v.union(
  v.object({
    kind: v.literal("profile"),
    userId: v.id("users"),
  }),
  v.object({
    kind: v.literal("product"),
    productId: v.id("products"),
  }),
  v.object({
    kind: v.literal("product_ai_run"),
    runId: v.id("productAiRuns"),
  }),
);

export type UploadIntentConsumptionTarget = Infer<
  typeof uploadIntentConsumptionTarget
>;

export function isAllowedUploadContentType(
  purpose: UploadIntentPurpose,
  contentType: string,
) {
  switch (purpose) {
    case "profile_avatar":
    case "profile_banner":
      return (
        contentType === "image/gif" ||
        contentType === "image/jpeg" ||
        contentType === "image/png" ||
        contentType === "image/webp"
      );
    case "product_logo":
    case "product_screenshot":
    case "product_ai_attachment":
      return contentType.startsWith("image/");
  }
}
