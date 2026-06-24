import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

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

export async function canEditProduct(
  ctx: QueryCtx | MutationCtx,
  product: Doc<"products">,
  user: Doc<"users">,
) {
  if (product.authorId === user._id) {
    return true;
  }

  const developer = await ctx.db
    .query("productDevelopers")
    .withIndex("by_product_developer", (q) =>
      q.eq("productId", product._id).eq("developerId", user._id),
    )
    .first();
  return developer?.status === "active";
}

export async function canViewProduct(
  ctx: QueryCtx | MutationCtx,
  product: Doc<"products">,
  user: Doc<"users"> | null,
) {
  if (product.isPublic) {
    return true;
  }
  if (!user) {
    return false;
  }
  return await canEditProduct(ctx, product, user);
}

export async function requireProductEditor(
  ctx: MutationCtx,
  productId: Doc<"products">["_id"],
  user: Doc<"users">,
) {
  const product = await ctx.db.get(productId);
  if (!product) {
    throw new Error("Product not found.");
  }

  if (!(await canEditProduct(ctx, product, user))) {
    throw new Error("Forbidden.");
  }

  return product;
}

export async function requireProductAuthor(
  ctx: MutationCtx,
  productId: Doc<"products">["_id"],
  user: Doc<"users">,
) {
  const product = await ctx.db.get(productId);
  if (!product) {
    throw new Error("Product not found.");
  }

  if (product.authorId !== user._id) {
    throw new Error("Forbidden.");
  }

  return product;
}
