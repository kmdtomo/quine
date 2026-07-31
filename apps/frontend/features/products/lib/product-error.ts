const PRODUCT_ERROR_MESSAGES: Record<string, string> = {
  ACTIVE_RUN_EXISTS: "Another Product AI request is already running.",
  ATTACHMENT_NOT_FOUND: "An uploaded attachment could not be found.",
  ATTACHMENT_TOO_LARGE: "An uploaded image is too large.",
  DRAFT_ALREADY_SAVED:
    "This draft was already saved. Open the existing product before editing it again.",
  DRAFT_CONTEXT_CONFLICT:
    "This draft is linked to conflicting product data. Reload before trying again.",
  DRAFT_TOO_LARGE: "This draft contains too much history to attach safely.",
  FILE_NOT_FOUND: "An uploaded image could not be found.",
  FILE_NOT_OWNED: "An uploaded image is not available for this product.",
  FILE_TOO_LARGE: "An uploaded image is too large.",
  FORBIDDEN: "You do not have permission to perform this action.",
  INVALID_DRAFT_KEY: "The product draft is invalid. Reload before trying again.",
  INVALID_FILE_TYPE: "Only supported image files can be uploaded.",
  INVALID_INPUT: "Check the product fields and try again.",
  PRODUCT_NOT_FOUND: "The product could not be found.",
  PROPOSAL_ALREADY_RESOLVED: "This proposal was already resolved.",
  PROPOSAL_NOT_FOUND: "The proposal could not be found.",
  RUN_NOT_RETRYABLE: "This Product AI request cannot be retried.",
  SLUG_CONFLICT: "A product with this name already exists.",
  TOO_MANY_ATTACHMENTS: "Too many attachments were selected.",
  TOO_MANY_FILES: "Too many images were selected.",
  UNAUTHORIZED: "Sign in before continuing.",
  UNSUPPORTED_ATTACHMENT: "Only image attachments are supported.",
};

export function getProductErrorMessage(
  unknownError: unknown,
  fallback: string,
) {
  const code = readErrorCode(unknownError);
  return code === undefined ? fallback : PRODUCT_ERROR_MESSAGES[code] ?? fallback;
}

function readErrorCode(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) {
    return undefined;
  }
  if ("code" in value && typeof value.code === "string") {
    return value.code;
  }
  if ("data" in value) {
    return readErrorCode(value.data);
  }
  return undefined;
}
