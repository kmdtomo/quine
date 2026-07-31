import { ConvexError, v } from "convex/values";

import {
  getTechnologyByKey,
  technologyKeys as canonicalTechnologyKeys,
} from "../data/tech-stack";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { canEditProduct, canViewProduct } from "./lib/products";
import { uniqueValidTechnologyKeys } from "./lib/technologyKeys";
import { normalizeUsername } from "./lib/username";

const MAX_PUBLIC_PRODUCTS = 60;
const MAX_PRODUCT_RELATIONSHIPS_TO_SCAN = 240;
const MAX_ENGINEER_RELATIONSHIPS_TO_SCAN = 500;
const MAX_PRODUCT_TECHNOLOGIES = 7;
const MAX_PRODUCT_TECHNOLOGY_RELATIONS = canonicalTechnologyKeys.length;

const projectTypeValidator = v.union(
  v.literal("personal"),
  v.literal("work"),
  v.literal("open_source"),
);

const publicTechnologyValidator = v.object({
  categoryName: v.string(),
  name: v.string(),
  order: v.number(),
  technologyKey: v.string(),
});

const productTechnologyValidator = v.object({
  _id: v.id("productTechnologies"),
  categoryName: v.string(),
  name: v.string(),
  order: v.number(),
  technologyKey: v.string(),
});

const publicProductValidator = v.object({
  _id: v.id("products"),
  author: v.object({
    _id: v.id("users"),
    company: v.optional(v.string()),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.string(),
  }),
  content: v.string(),
  logo: v.optional(v.string()),
  name: v.string(),
  projectType: projectTypeValidator,
  slug: v.string(),
  tagline: v.string(),
  technologies: v.array(publicTechnologyValidator),
});

type PublicProduct = {
  _id: Id<"products">;
  author: {
    _id: Id<"users">;
    company: string | undefined;
    image: string | undefined;
    name: string | undefined;
    username: string;
  };
  content: string;
  logo: string | undefined;
  name: string;
  projectType: Doc<"products">["projectType"];
  slug: string;
  tagline: string;
  technologies: PublicTechnology[];
};

type PublicTechnology = {
  categoryName: string;
  name: string;
  order: number;
  technologyKey: string;
};

export const getPublicDetail = query({
  args: {
    technologyKey: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      engineerCount: v.number(),
      engineerCountIsTruncated: v.boolean(),
      productCount: v.number(),
      productCountIsTruncated: v.boolean(),
      productListIsTruncated: v.boolean(),
      products: v.array(publicProductValidator),
      technology: v.object({
        categoryKey: v.string(),
        categoryName: v.string(),
        description: v.string(),
        key: v.string(),
        name: v.string(),
      }),
    }),
  ),
  handler: async (ctx, { technologyKey }) => {
    const technology = getTechnologyByKey(technologyKey);
    if (!technology) {
      return null;
    }

    const productRelationships = await ctx.db
      .query("productTechnologies")
      .withIndex("by_technology", (q) =>
        q.eq("technologyKey", technology.key),
      )
      .order("desc")
      .take(MAX_PRODUCT_RELATIONSHIPS_TO_SCAN + 1);
    const productCountIsTruncated =
      productRelationships.length > MAX_PRODUCT_RELATIONSHIPS_TO_SCAN;
    const seenProductIds = new Set<Id<"products">>();
    const productIds: Id<"products">[] = [];

    for (const relationship of productRelationships.slice(
      0,
      MAX_PRODUCT_RELATIONSHIPS_TO_SCAN,
    )) {
      if (seenProductIds.has(relationship.productId)) {
        continue;
      }
      seenProductIds.add(relationship.productId);
      productIds.push(relationship.productId);
    }

    const productSources = await Promise.all(
      productIds.map(async (productId) => {
        const product = await ctx.db.get("products", productId);
        if (!product || !product.isPublic) {
          return null;
        }

        const author = await ctx.db.get("users", product.authorId);
        if (!author || author.isPublic === false) {
          return null;
        }
        const username = normalizeUsername(author.username);
        if (!username) {
          return null;
        }

        return {
          author,
          product,
          username,
        };
      }),
    );
    const publicProductSources = productSources.flatMap((source) =>
      source === null ? [] : [source],
    );
    const productCount = publicProductSources.length;
    const products: PublicProduct[] = await Promise.all(
      publicProductSources
        .slice(0, MAX_PUBLIC_PRODUCTS)
        .map(async ({ author, product, username }) => ({
          _id: product._id,
          author: {
            _id: author._id,
            company: author.company,
            image: author.image,
            name: author.name,
            username,
          },
          content: product.content,
          logo: product.logo,
          name: product.name,
          projectType: product.projectType,
          slug: product.slug,
          tagline: product.tagline,
          technologies: await getPublicProductTechnologies(ctx, product._id),
        })),
    );

    const engineerRelationships = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_technology", (q) =>
        q.eq("technologyKey", technology.key),
      )
      .order("desc")
      .take(MAX_ENGINEER_RELATIONSHIPS_TO_SCAN + 1);
    const engineerCountIsTruncated =
      engineerRelationships.length > MAX_ENGINEER_RELATIONSHIPS_TO_SCAN;
    const seenEngineerIds = new Set<Id<"users">>();
    const engineerIds: Id<"users">[] = [];

    for (const relationship of engineerRelationships.slice(
      0,
      MAX_ENGINEER_RELATIONSHIPS_TO_SCAN,
    )) {
      if (seenEngineerIds.has(relationship.developerId)) {
        continue;
      }
      seenEngineerIds.add(relationship.developerId);
      engineerIds.push(relationship.developerId);
    }

    const engineers = await Promise.all(
      engineerIds.map(
        async (engineerId) => await ctx.db.get("users", engineerId),
      ),
    );
    let engineerCount = 0;
    for (const engineer of engineers) {
      if (!engineer) {
        continue;
      }
      if (engineer.isPublic === false) {
        continue;
      }
      if (!normalizeUsername(engineer.username)) {
        continue;
      }
      engineerCount += 1;
    }

    return {
      engineerCount,
      engineerCountIsTruncated,
      productCount,
      productCountIsTruncated,
      productListIsTruncated:
        productCountIsTruncated || productCount > products.length,
      products,
      technology: {
        categoryKey: technology.categoryKey,
        categoryName: technology.categoryName,
        description: technology.description,
        key: technology.key,
        name: technology.name,
      },
    };
  },
});

export const listByProduct = query({
  args: {
    productId: v.id("products"),
  },
  returns: v.union(v.null(), v.array(productTechnologyValidator)),
  handler: async (ctx, { productId }) => {
    const product = await ctx.db.get("products", productId);
    if (!product) {
      return null;
    }

    const viewer = await getCurrentUser(ctx);
    if (!(await canViewProduct(ctx, product, viewer))) {
      return null;
    }

    return await getTechnologyRows(ctx, productId);
  },
});

export const setMany = mutation({
  args: {
    productId: v.id("products"),
    technologyKeys: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { productId, technologyKeys }) => {
    const user = await requireProductTechnologyUser(ctx);
    await requireProductTechnologyEditor(ctx, productId, user);
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
  },
});

export const add = mutation({
  args: {
    productId: v.id("products"),
    technologyKey: v.string(),
  },
  returns: v.id("productTechnologies"),
  handler: async (ctx, { productId, technologyKey }) => {
    const user = await requireProductTechnologyUser(ctx);
    await requireProductTechnologyEditor(ctx, productId, user);
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
  },
});

export const remove = mutation({
  args: {
    productId: v.id("products"),
    technologyKey: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { productId, technologyKey }) => {
    const user = await requireProductTechnologyUser(ctx);
    await requireProductTechnologyEditor(ctx, productId, user);
    const row = await ctx.db
      .query("productTechnologies")
      .withIndex("by_product_technology", (q) =>
        q.eq("productId", productId).eq("technologyKey", technologyKey),
      )
      .first();
    if (!row) {
      return null;
    }

    await ctx.db.delete("productTechnologies", row._id);
    return null;
  },
});

export const reorder = mutation({
  args: {
    productId: v.id("products"),
    technologyKeys: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { productId, technologyKeys }) => {
    const user = await requireProductTechnologyUser(ctx);
    await requireProductTechnologyEditor(ctx, productId, user);
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
  },
});

async function getTechnologyRows(
  ctx: Parameters<typeof getCurrentUser>[0],
  productId: Id<"products">,
) {
  const rows = await ctx.db
    .query("productTechnologies")
    .withIndex("by_product_order", (q) => q.eq("productId", productId))
    .take(MAX_PRODUCT_TECHNOLOGY_RELATIONS);

  return rows.flatMap((row) => {
    const technology = getTechnologyByKey(row.technologyKey);
    if (!technology) {
      return [];
    }

    return [
      {
        _id: row._id,
        categoryName: technology.categoryName,
        name: technology.name,
        order: row.order,
        technologyKey: row.technologyKey,
      },
    ];
  });
}

async function requireProductTechnologyUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (user === null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Authentication is required.",
    });
  }

  return user;
}

async function requireProductTechnologyEditor(
  ctx: MutationCtx,
  productId: Id<"products">,
  user: Doc<"users">,
) {
  const product = await ctx.db.get("products", productId);
  if (product === null) {
    throw new ConvexError({
      code: "PRODUCT_NOT_FOUND",
      message: "Product not found.",
    });
  }
  if (!(await canEditProduct(ctx, product, user))) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "You do not have permission to edit this product.",
    });
  }

  return product;
}

async function getPublicProductTechnologies(
  ctx: QueryCtx,
  productId: Id<"products">,
): Promise<PublicTechnology[]> {
  const rows = await ctx.db
    .query("productTechnologies")
    .withIndex("by_product_order", (q) => q.eq("productId", productId))
    .take(MAX_PRODUCT_TECHNOLOGIES);

  return rows.flatMap((row) => {
    const technology = getTechnologyByKey(row.technologyKey);
    if (!technology) {
      return [];
    }

    return [
      {
        categoryName: technology.categoryName,
        name: technology.name,
        order: row.order,
        technologyKey: technology.key,
      },
    ];
  });
}
