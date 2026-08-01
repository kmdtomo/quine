import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { MAX_PRODUCT_SCREENSHOTS } from "./productAssetLimits";

const MAX_PRODUCT_IMAGE_BYTES = 6 * 1024 * 1024;

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

export async function requireProductImageStorage(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
) {
  const metadata = await ctx.db.system.get("_storage", storageId);
  if (metadata === null) {
    throw new ConvexError({
      code: "FILE_NOT_FOUND",
      message: "The uploaded image could not be found.",
    });
  }
  if (
    metadata.contentType === undefined ||
    !metadata.contentType.startsWith("image/")
  ) {
    throw new ConvexError({
      code: "INVALID_FILE_TYPE",
      message: "Only image files can be used for product media.",
    });
  }
  if (metadata.size > MAX_PRODUCT_IMAGE_BYTES) {
    throw new ConvexError({
      code: "FILE_TOO_LARGE",
      message: "Product images must be 6MB or smaller.",
    });
  }

  return metadata;
}

export async function requireProductStorageOwnership(
  ctx: MutationCtx,
  productId: Id<"products">,
  storageId: Id<"_storage">,
) {
  const [existingAsset, duplicateAsset] = await ctx.db
    .query("productAssets")
    .withIndex("by_storage", (q) => q.eq("storageId", storageId))
    .take(2);
  if (
    duplicateAsset !== undefined ||
    (existingAsset !== undefined && existingAsset.productId !== productId)
  ) {
    throw new ConvexError({
      code: "PRODUCT_ASSET_IN_USE",
      message: "This image is already attached to another product.",
    });
  }
}

export async function deleteProductStorageIfUnreferenced(
  ctx: MutationCtx,
  storageId: Id<"_storage">,
) {
  const existingReference = await ctx.db
    .query("productAssets")
    .withIndex("by_storage", (q) => q.eq("storageId", storageId))
    .first();
  if (existingReference === null) {
    await ctx.storage.delete(storageId);
  }
}

export async function syncProductScreenshots(
  ctx: MutationCtx,
  productId: Id<"products">,
  userId: Id<"users">,
  requestedStorageIds: Id<"_storage">[],
) {
  if (requestedStorageIds.length > MAX_PRODUCT_SCREENSHOTS) {
    throw new ConvexError({
      code: "TOO_MANY_FILES",
      message: `A product can have at most ${MAX_PRODUCT_SCREENSHOTS} screenshots.`,
    });
  }

  const uniqueStorageIds: Id<"_storage">[] = [];
  const seenStorageIds = new Set<Id<"_storage">>();
  for (const storageId of requestedStorageIds) {
    if (!seenStorageIds.has(storageId)) {
      seenStorageIds.add(storageId);
      uniqueStorageIds.push(storageId);
    }
  }

  const metadataByStorageId = new Map<
    Id<"_storage">,
    Awaited<ReturnType<typeof requireProductImageStorage>>
  >();
  for (const storageId of uniqueStorageIds) {
    await requireProductStorageOwnership(ctx, productId, storageId);
    const metadata = await requireProductImageStorage(ctx, storageId);
    metadataByStorageId.set(storageId, metadata);
  }

  const currentRows = await ctx.db
    .query("productAssets")
    .withIndex("by_product_kind_order", (q) =>
      q.eq("productId", productId).eq("kind", "screenshot"),
    )
    .take(MAX_PRODUCT_SCREENSHOTS + 1);
  const currentByStorageId = new Map(
    currentRows.map((row) => [row.storageId, row]),
  );
  const requestedSet = new Set(uniqueStorageIds);

  for (const row of currentRows) {
    if (!requestedSet.has(row.storageId)) {
      await ctx.db.delete("productAssets", row._id);
      await deleteProductStorageIfUnreferenced(ctx, row.storageId);
    }
  }

  for (const [index, storageId] of uniqueStorageIds.entries()) {
    const order = index + 1;
    const current = currentByStorageId.get(storageId);
    if (current !== undefined) {
      if (current.order !== order) {
        await ctx.db.patch("productAssets", current._id, { order });
      }
      continue;
    }

    const metadata = metadataByStorageId.get(storageId);
    if (metadata === undefined) {
      throw new ConvexError({
        code: "FILE_NOT_FOUND",
        message: "The uploaded screenshot could not be found.",
      });
    }
    await ctx.db.insert("productAssets", {
      createdAt: Date.now(),
      createdBy: userId,
      kind: "screenshot",
      mimeType: metadata.contentType,
      order,
      productId,
      storageId,
    });
  }
}

export async function deleteProductMedia(
  ctx: MutationCtx,
  product: Doc<"products">,
) {
  const storageIds = new Set<Id<"_storage">>();
  if (product.logoStorageId !== undefined) {
    storageIds.add(product.logoStorageId);
  }

  const screenshotRows = await ctx.db
    .query("productAssets")
    .withIndex("by_product_kind_order", (q) =>
      q.eq("productId", product._id).eq("kind", "screenshot"),
    )
    .take(MAX_PRODUCT_SCREENSHOTS + 1);
  for (const row of screenshotRows) {
    storageIds.add(row.storageId);
    await ctx.db.delete("productAssets", row._id);
  }
  for (const storageId of storageIds) {
    await deleteProductStorageIfUnreferenced(ctx, storageId);
  }
}
