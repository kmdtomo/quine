import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

export async function requireProductAuthorWithCode(
  ctx: MutationCtx,
  productId: Id<"products">,
  userId: Id<"users">,
) {
  const product = await ctx.db.get("products", productId);
  if (product === null) {
    throw new ConvexError({
      code: "PRODUCT_NOT_FOUND",
      message: "Product not found.",
    });
  }
  if (product.authorId !== userId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Only the product author can manage developers.",
    });
  }

  return product;
}
