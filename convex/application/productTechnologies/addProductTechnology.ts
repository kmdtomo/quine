import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { uniqueValidTechnologyKeys } from "../../lib/technologyKeys";
import { requireProductEditor } from "../products/productAccess";
import { MAX_PRODUCT_TECHNOLOGY_RELATIONS } from "./productTechnologyLimits";

type AddProductTechnologyArgs = {
  productId: Id<"products">;
  technologyKey: string;
};

export async function addProductTechnology(
  ctx: MutationCtx,
  user: Doc<"users">,
  { productId, technologyKey }: AddProductTechnologyArgs,
) {
  await requireProductEditor(ctx, productId, user);
  const validKeys = uniqueValidTechnologyKeys([technologyKey]);
  const validKey = validKeys[0];
  if (validKey === undefined) {
    throw new ConvexError({
      code: "UNKNOWN_TECHNOLOGY",
      message: "Unknown technology.",
    });
  }

  const current = await ctx.db
    .query("productTechnologies")
    .withIndex("by_product_technology", (q) =>
      q.eq("productId", productId).eq("technologyKey", validKey),
    )
    .first();
  if (current) {
    return current._id;
  }

  const rows = await ctx.db
    .query("productTechnologies")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .take(MAX_PRODUCT_TECHNOLOGY_RELATIONS);
  const nextOrder =
    rows.reduce((currentMax, row) => Math.max(currentMax, row.order), 0) + 1;

  return await ctx.db.insert("productTechnologies", {
    order: nextOrder,
    productId,
    technologyKey: validKey,
  });
}
