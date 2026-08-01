import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { MAX_PRODUCT_SCREENSHOTS } from "../application/products/productAssetLimits";

type ProductMediaCtx = QueryCtx | MutationCtx;

export type ResolvedProductScreenshot = {
  order: number;
  storageId: Id<"_storage">;
  url: string;
};

export async function resolveProductLogo(
  ctx: ProductMediaCtx,
  product: Doc<"products">,
) {
  const logoUrl =
    product.logoStorageId === undefined
      ? null
      : await ctx.storage.getUrl(product.logoStorageId);
  return logoUrl ?? product.logo;
}

export async function resolveProductMedia(
  ctx: ProductMediaCtx,
  product: Doc<"products">,
) {
  const logo = await resolveProductLogo(ctx, product);
  const screenshotRows = await ctx.db
    .query("productAssets")
    .withIndex("by_product_kind_order", (q) =>
      q.eq("productId", product._id).eq("kind", "screenshot"),
    )
    .take(MAX_PRODUCT_SCREENSHOTS);
  const screenshotAssets: ResolvedProductScreenshot[] = [];

  for (const row of screenshotRows) {
    const url = await ctx.storage.getUrl(row.storageId);
    if (url !== null) {
      screenshotAssets.push({
        order: row.order,
        storageId: row.storageId,
        url,
      });
    }
  }

  return {
    logo,
    screenshotAssets,
    screenshots:
      screenshotAssets.length > 0
        ? screenshotAssets.map((asset) => asset.url)
        : product.screenshots,
  };
}
