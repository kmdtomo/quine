import { ConvexError } from "convex/values";

export const MAX_ATTACHMENTS = 4;

export type ProductAiErrorCode =
  | "ACTIVE_RUN_EXISTS"
  | "ATTACHMENT_NOT_FOUND"
  | "ATTACHMENT_TOO_LARGE"
  | "DUPLICATE_ATTACHMENT"
  | "FORBIDDEN"
  | "INVALID_DRAFT_KEY"
  | "INVALID_IDEMPOTENCY_KEY"
  | "INVALID_LOCATOR"
  | "MARKDOWN_TOO_LONG"
  | "MESSAGE_REQUIRED"
  | "MESSAGE_TOO_LONG"
  | "PRODUCT_NOT_FOUND"
  | "PROPOSAL_ALREADY_RESOLVED"
  | "PROPOSAL_NOT_FOUND"
  | "RUN_NOT_FOUND"
  | "RUN_NOT_RETRYABLE"
  | "THREAD_NOT_FOUND"
  | "TOO_MANY_ATTACHMENTS"
  | "UNSUPPORTED_ATTACHMENT";

export function productAiError(code: ProductAiErrorCode) {
  const messages: Record<ProductAiErrorCode, string> = {
    ACTIVE_RUN_EXISTS: "Another Product AI request is already running.",
    ATTACHMENT_NOT_FOUND: "An uploaded attachment could not be found.",
    ATTACHMENT_TOO_LARGE: "Image attachments must be 6MB or smaller.",
    DUPLICATE_ATTACHMENT: "The same attachment was included more than once.",
    FORBIDDEN: "You do not have permission to use Product AI for this product.",
    INVALID_DRAFT_KEY: "The Product AI draft key is invalid.",
    INVALID_IDEMPOTENCY_KEY: "The request idempotency key is invalid.",
    INVALID_LOCATOR: "Provide exactly one product or draft context.",
    MARKDOWN_TOO_LONG: "The product content is too long for this AI request.",
    MESSAGE_REQUIRED: "A message is required.",
    MESSAGE_TOO_LONG: "The message is too long.",
    PRODUCT_NOT_FOUND: "The product could not be found.",
    PROPOSAL_ALREADY_RESOLVED: "This proposal was already resolved.",
    PROPOSAL_NOT_FOUND: "The proposal could not be found.",
    RUN_NOT_FOUND: "The Product AI run could not be found.",
    RUN_NOT_RETRYABLE: "This Product AI run cannot be retried.",
    THREAD_NOT_FOUND: "The Product AI thread could not be found.",
    TOO_MANY_ATTACHMENTS: `Attach at most ${MAX_ATTACHMENTS} images.`,
    UNSUPPORTED_ATTACHMENT: "Only image attachments are supported.",
  };
  return new ConvexError({ code, message: messages[code] });
}
