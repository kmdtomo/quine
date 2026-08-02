import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { uniqueValidTechnologyKeys } from "../../lib/technologyKeys";
import { requireProductEditor } from "../products/productAccess";
import { MAX_PRODUCT_TECHNOLOGY_RELATIONS } from "./productTechnologyLimits";

type SetManyProductTechnologiesArgs = {
  productId: Id<"products">;
  technologyKeys: string[];
};

export async function setManyProductTechnologies(
  ctx: MutationCtx,
  user: Doc<"users">,
  { productId, technologyKeys }: SetManyProductTechnologiesArgs,
) {
  await requireProductEditor(ctx, productId, user);
  const validKeys = uniqueValidTechnologyKeys(technologyKeys);
  const rows = await ctx.db
    .query("productTechnologies")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .take(MAX_PRODUCT_TECHNOLOGY_RELATIONS);
  const rowsByKey = new Map(rows.map((row) => [row.technologyKey, row]));
  const requestedKeys = new Set<string>(validKeys);

  let order = 1;
  for (const technologyKey of validKeys) {
    const current = rowsByKey.get(technologyKey);
    if (current) {
      await ctx.db.patch("productTechnologies", current._id, { order });
    } else {
      await ctx.db.insert("productTechnologies", {
        order,
        productId,
        technologyKey,
      });
    }
    order += 1;
  }

  for (const row of rows) {
    if (!requestedKeys.has(row.technologyKey)) {
      await ctx.db.delete("productTechnologies", row._id);
    }
  }
  return null;
}
