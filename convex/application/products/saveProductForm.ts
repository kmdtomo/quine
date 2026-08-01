import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  deleteProductStorageIfUnreferenced,
  requireProductImageStorage,
  requireProductStorageOwnership,
  syncProductScreenshots,
} from "../../lib/productAssets";
import { uniqueValidTechnologyKeys } from "../../lib/technologyKeys";
import {
  assertProductAiDraftIsUnsaved,
  attachProductAiDraftToProduct,
} from "../productAi/attachDraftToProduct";
import { requireProductEditor } from "./productAccess";
import {
  MAX_PRODUCT_TECHNOLOGIES,
  normalizeContent,
  normalizeName,
  normalizeOptionalText,
  normalizeProductSlug,
  normalizeTagline,
} from "./productInput";

const MAX_PRODUCT_ROLE_LENGTH = 48;
const MAX_PRODUCT_ROLES = 8;

type SaveProductFormArgs = {
  content: string;
  draftKey?: string;
  githubUrl?: string;
  isPublic: boolean;
  logoStorageId?: Id<"_storage"> | null;
  name: string;
  productId?: Id<"products">;
  productUrl?: string;
  projectType: Doc<"products">["projectType"];
  roles: string[];
  screenshotStorageIds?: Id<"_storage">[];
  tagline: string;
  teamSize?: Doc<"products">["teamSize"];
  technologyKeys: string[];
};

export async function saveProductForm(
  ctx: MutationCtx,
  user: Doc<"users">,
  args: SaveProductFormArgs,
) {
  if (args.productId !== undefined && args.draftKey !== undefined) {
    throw new ConvexError({
      code: "INVALID_INPUT",
      message: "A draft key can only be used when creating a product.",
    });
  }
  const input = normalizeProductTextInput(args);
  const roles = normalizeProductRoles(args.roles);
  const technologyKeys = uniqueValidTechnologyKeys(args.technologyKeys).slice(
    0,
    MAX_PRODUCT_TECHNOLOGIES,
  );

  if (args.productId === undefined) {
    const draftKey =
      args.draftKey === undefined
        ? undefined
        : await assertProductAiDraftIsUnsaved(ctx, user._id, args.draftKey);
    if (draftKey !== undefined) {
      const existingDraftProduct = await ctx.db
        .query("products")
        .withIndex("by_author_creation_key", (q) =>
          q.eq("authorId", user._id).eq("creationKey", draftKey),
        )
        .first();
      if (existingDraftProduct !== null) {
        throw new ConvexError({
          code: "DRAFT_ALREADY_SAVED",
          message: "This draft has already been saved as a product.",
        });
      }
    }
    const slug = normalizeProductSlug(input.name);
    if (!slug) {
      throw new ConvexError({
        code: "INVALID_INPUT",
        message: "Product slug is required.",
      });
    }

    const existing = await ctx.db
      .query("products")
      .withIndex("by_author_slug", (q) =>
        q.eq("authorId", user._id).eq("slug", slug),
      )
      .first();
    if (existing) {
      throw new ConvexError({
        code: "SLUG_CONFLICT",
        message: "You already have a product with that slug.",
      });
    }
    if (args.logoStorageId !== undefined && args.logoStorageId !== null) {
      await requireProductImageStorage(ctx, args.logoStorageId);
    }

    const productId = await ctx.db.insert("products", {
      authorId: user._id,
      content: input.content,
      ...(draftKey === undefined ? {} : { creationKey: draftKey }),
      githubUrl: input.githubUrl,
      isPublic: args.isPublic,
      ...(args.logoStorageId === undefined || args.logoStorageId === null
        ? {}
        : { logoStorageId: args.logoStorageId }),
      name: input.name,
      productUrl: input.productUrl,
      projectType: args.projectType,
      screenshots: [],
      slug,
      tagline: input.tagline,
      teamSize: args.teamSize,
    });
    if (args.logoStorageId !== undefined && args.logoStorageId !== null) {
      await requireProductStorageOwnership(
        ctx,
        productId,
        args.logoStorageId,
      );
    }

    await ctx.db.insert("productDevelopers", {
      developerId: user._id,
      joinedAt: Date.now(),
      productId,
      roles: roles.length > 0 ? roles : ["Creator"],
      status: "active",
    });
    await syncProductTechnologies(ctx, productId, technologyKeys);
    if (args.screenshotStorageIds !== undefined) {
      await syncProductScreenshots(
        ctx,
        productId,
        user._id,
        args.screenshotStorageIds,
      );
    }
    if (draftKey !== undefined) {
      await attachProductAiDraftToProduct(
        ctx,
        user._id,
        draftKey,
        productId,
      );
    }

    return {
      productId,
      slug,
    };
  }

  const product = await requireProductEditor(
    ctx,
    args.productId,
    user,
  );
  if (args.logoStorageId !== undefined && args.logoStorageId !== null) {
    await requireProductImageStorage(ctx, args.logoStorageId);
    await requireProductStorageOwnership(
      ctx,
      product._id,
      args.logoStorageId,
    );
  }
  await ctx.db.patch("products", product._id, {
    content: input.content,
    githubUrl: input.githubUrl,
    isPublic: args.isPublic,
    ...(args.logoStorageId === undefined
      ? {}
      : args.logoStorageId === null
        ? { logo: undefined, logoStorageId: undefined }
        : { logoStorageId: args.logoStorageId }),
    name: input.name,
    productUrl: input.productUrl,
    projectType: args.projectType,
    ...(args.screenshotStorageIds === undefined ? {} : { screenshots: [] }),
    tagline: input.tagline,
    teamSize: args.teamSize,
  });
  if (args.screenshotStorageIds !== undefined) {
    await syncProductScreenshots(
      ctx,
      product._id,
      user._id,
      args.screenshotStorageIds,
    );
  }
  if (
    args.logoStorageId !== undefined &&
    product.logoStorageId !== undefined &&
    args.logoStorageId !== product.logoStorageId
  ) {
    await deleteProductStorageIfUnreferenced(ctx, product.logoStorageId);
  }

  const developer = await ctx.db
    .query("productDevelopers")
    .withIndex("by_product_developer", (q) =>
      q.eq("productId", product._id).eq("developerId", user._id),
    )
    .first();
  if (developer) {
    await ctx.db.patch("productDevelopers", developer._id, {
      roles: roles.length > 0 ? roles : developer.roles,
    });
  } else {
    await ctx.db.insert("productDevelopers", {
      developerId: user._id,
      joinedAt: Date.now(),
      productId: product._id,
      roles: roles.length > 0 ? roles : ["Contributor"],
      status: "active",
    });
  }

  await syncProductTechnologies(ctx, product._id, technologyKeys);

  return {
    productId: product._id,
    slug: product.slug,
  };
}

function normalizeProductTextInput(args: {
  content: string;
  githubUrl?: string;
  name: string;
  productUrl?: string;
  tagline: string;
}) {
  return {
    content: normalizeContent(args.content),
    githubUrl: normalizeOptionalText(args.githubUrl),
    name: normalizeName(args.name),
    productUrl: normalizeOptionalText(args.productUrl),
    tagline: normalizeTagline(args.tagline),
  };
}

function normalizeProductRoles(roles: string[]) {
  const uniqueRoles = [];
  const seen = new Set<string>();

  for (const role of roles) {
    const normalizedRole = role.trim();
    if (
      normalizedRole.length === 0 ||
      normalizedRole.length > MAX_PRODUCT_ROLE_LENGTH ||
      seen.has(normalizedRole)
    ) {
      continue;
    }

    seen.add(normalizedRole);
    uniqueRoles.push(normalizedRole);
  }

  return uniqueRoles.slice(0, MAX_PRODUCT_ROLES);
}

async function syncProductTechnologies(
  ctx: MutationCtx,
  productId: Id<"products">,
  technologyKeys: string[],
) {
  const rows = await ctx.db
    .query("productTechnologies")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
  const rowsByKey = new Map(rows.map((row) => [row.technologyKey, row]));
  const requestedKeys = new Set<string>(technologyKeys);

  let order = 1;
  for (const technologyKey of technologyKeys) {
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
}
