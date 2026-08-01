import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { uniqueValidTechnologyKeys } from "../../lib/technologyKeys";
import { requireProductEditor } from "../products/productAccess";
import { MAX_PRODUCT_TECHNOLOGY_RELATIONS } from "./productTechnologyLimits";

type ReorderProductTechnologiesArgs = {
  productId: Id<"products">;
  technologyKeys: string[];
};

export async function reorderProductTechnologies(
  ctx: MutationCtx,
  user: Doc<"users">,
  { productId, technologyKeys }: ReorderProductTechnologiesArgs,
) {
  await requireProductEditor(ctx, productId, user);
  const validKeys = uniqueValidTechnologyKeys(technologyKeys);
  const requestedKeys = new Set<string>(validKeys);
  const rows = await ctx.db
    .query("productTechnologies")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .take(MAX_PRODUCT_TECHNOLOGY_RELATIONS);
  const rowsByKey = new Map(rows.map((row) => [row.technologyKey, row]));

  let order = 1;
  for (const technologyKey of validKeys) {
    const row = rowsByKey.get(technologyKey);
    if (!row) {
      continue;
    }
    await ctx.db.patch("productTechnologies", row._id, { order });
    order += 1;
  }

  const remainingRows = rows
    .filter((row) => !requestedKeys.has(row.technologyKey))
    .sort((a, b) => a.order - b.order);
  for (const row of remainingRows) {
    await ctx.db.patch("productTechnologies", row._id, { order });
    order += 1;
  }
  return null;
}
