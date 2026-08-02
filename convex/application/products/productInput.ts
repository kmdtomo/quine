import { ConvexError } from "convex/values";

const MAX_PRODUCT_NAME_LENGTH = 80;
const MAX_PRODUCT_TAGLINE_LENGTH = 140;
const MAX_PRODUCT_CONTENT_LENGTH = 4000;
export const MAX_PRODUCT_TECHNOLOGIES = 40;

export function normalizeProductSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : null;
}

export function normalizeOptionalText(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const text = value.trim();
  return text.length > 0 ? text : undefined;
}

export function normalizeName(value: string) {
  const name = value.trim();
  if (!name) {
    throw new ConvexError({
      code: "INVALID_INPUT",
      message: "Product name is required.",
    });
  }
  if (name.length > MAX_PRODUCT_NAME_LENGTH) {
    throw new ConvexError({
      code: "INVALID_INPUT",
      message: `Product name must be ${MAX_PRODUCT_NAME_LENGTH} characters or fewer.`,
    });
  }
  return name;
}

export function normalizeTagline(value: string) {
  const tagline = value.trim();
  if (!tagline) {
    throw new ConvexError({
      code: "INVALID_INPUT",
      message: "Product tagline is required.",
    });
  }
  if (tagline.length > MAX_PRODUCT_TAGLINE_LENGTH) {
    throw new ConvexError({
      code: "INVALID_INPUT",
      message: `Product tagline must be ${MAX_PRODUCT_TAGLINE_LENGTH} characters or fewer.`,
    });
  }
  return tagline;
}

export function normalizeContent(value: string) {
  const content = value.trim();
  if (content.length > MAX_PRODUCT_CONTENT_LENGTH) {
    throw new ConvexError({
      code: "INVALID_INPUT",
      message: `Product content must be ${MAX_PRODUCT_CONTENT_LENGTH} characters or fewer.`,
    });
  }
  return content;
}
