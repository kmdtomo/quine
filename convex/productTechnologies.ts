import { v } from "convex/values";

import { getTechnologyByKey } from "../data/tech-stack";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";
import { requireProductEditor, canViewProduct } from "./lib/products";
import { uniqueValidTechnologyKeys } from "./lib/technologyKeys";

export const listByProduct = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, { productId }) => {
    const product = await ctx.db.get(productId);
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
  handler: async (ctx, { productId, technologyKeys }) => {
    const user = await requireUser(ctx);
    await requireProductEditor(ctx, productId, user);
    const validKeys = uniqueValidTechnologyKeys(technologyKeys);
    const rows = await ctx.db
      .query("productTechnologies")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    const rowsByKey = new Map(rows.map((row) => [row.technologyKey, row]));
    const requestedKeys = new Set<string>(validKeys);

    let order = 1;
    for (const technologyKey of validKeys) {
      const current = rowsByKey.get(technologyKey);
      if (current) {
        await ctx.db.patch(current._id, { order });
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
        await ctx.db.delete(row._id);
      }
    }
  },
});

export const add = mutation({
  args: {
    productId: v.id("products"),
    technologyKey: v.string(),
  },
  handler: async (ctx, { productId, technologyKey }) => {
    const user = await requireUser(ctx);
    await requireProductEditor(ctx, productId, user);
    const validKeys = uniqueValidTechnologyKeys([technologyKey]);
    const validKey = validKeys[0];
    if (validKey === undefined) {
      throw new Error("Unknown technology.");
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
      .collect();
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
  handler: async (ctx, { productId, technologyKey }) => {
    const user = await requireUser(ctx);
    await requireProductEditor(ctx, productId, user);
    const row = await ctx.db
      .query("productTechnologies")
      .withIndex("by_product_technology", (q) =>
        q.eq("productId", productId).eq("technologyKey", technologyKey),
      )
      .first();
    if (!row) {
      return;
    }

    await ctx.db.delete(row._id);
  },
});

export const reorder = mutation({
  args: {
    productId: v.id("products"),
    technologyKeys: v.array(v.string()),
  },
  handler: async (ctx, { productId, technologyKeys }) => {
    const user = await requireUser(ctx);
    await requireProductEditor(ctx, productId, user);
    const validKeys = uniqueValidTechnologyKeys(technologyKeys);
    const requestedKeys = new Set<string>(validKeys);
    const rows = await ctx.db
      .query("productTechnologies")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    const rowsByKey = new Map(rows.map((row) => [row.technologyKey, row]));

    let order = 1;
    for (const technologyKey of validKeys) {
      const row = rowsByKey.get(technologyKey);
      if (!row) {
        continue;
      }
      await ctx.db.patch(row._id, { order });
      order += 1;
    }

    const remainingRows = rows
      .filter((row) => !requestedKeys.has(row.technologyKey))
      .sort((a, b) => a.order - b.order);
    for (const row of remainingRows) {
      await ctx.db.patch(row._id, { order });
      order += 1;
    }
  },
});

async function getTechnologyRows(
  ctx: Parameters<typeof getCurrentUser>[0],
  productId: Parameters<typeof requireProductEditor>[1],
) {
  const rows = await ctx.db
    .query("productTechnologies")
    .withIndex("by_product_order", (q) => q.eq("productId", productId))
    .collect();

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
