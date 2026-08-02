import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { normalizeProductDeveloperRoles } from "./productDeveloperRoles";

type RequestToJoinProductArgs = {
  productId: Id<"products">;
  roles: string[];
};

export async function requestToJoinProduct(
  ctx: MutationCtx,
  userId: Id<"users">,
  { productId, roles }: RequestToJoinProductArgs,
) {
  const product = await ctx.db.get("products", productId);
  if (!product || !product.isPublic) {
    throw new ConvexError({
      code: "PRODUCT_NOT_FOUND",
      message: "Product not found.",
    });
  }

  const current = await ctx.db
    .query("productDevelopers")
    .withIndex("by_product_developer", (q) =>
      q.eq("productId", productId).eq("developerId", userId),
    )
    .first();
  if (current) {
    return current._id;
  }

  return await ctx.db.insert("productDevelopers", {
    developerId: userId,
    productId,
    roles: normalizeProductDeveloperRoles(roles),
    status: "invited",
  });
}
