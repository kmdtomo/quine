import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type RemoveDeveloperArgs = {
  developerId: Id<"users">;
  productId: Id<"products">;
};

export async function removeDeveloper(
  ctx: MutationCtx,
  userId: Id<"users">,
  { developerId, productId }: RemoveDeveloperArgs,
) {
  const product = await ctx.db.get("products", productId);
  if (!product) {
    throw new ConvexError({
      code: "PRODUCT_NOT_FOUND",
      message: "Product not found.",
    });
  }
  if (product.authorId !== userId && developerId !== userId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "You do not have permission to remove this developer.",
    });
  }
  if (developerId === product.authorId) {
    throw new ConvexError({
      code: "PRODUCT_AUTHOR_CANNOT_BE_REMOVED",
      message: "Product owner cannot be removed.",
    });
  }

  const current = await ctx.db
    .query("productDevelopers")
    .withIndex("by_product_developer", (q) =>
      q.eq("productId", productId).eq("developerId", developerId),
    )
    .first();
  if (!current) {
    return null;
  }

  await ctx.db.delete("productDevelopers", current._id);
  return null;
}
