import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";
import { canEditProduct, canViewProduct, requireProductAuthor } from "./lib/products";
import { getUserByUsername } from "./lib/users";

const MAX_PRODUCT_DEVELOPERS = 100;
const MAX_ROLE_LENGTH = 48;
const MAX_ROLES = 8;

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

    const includePrivate =
      viewer === null ? false : await canEditProduct(ctx, product, viewer);
    return await listDevelopers(ctx, productId, includePrivate);
  },
});

export const invite = mutation({
  args: {
    productId: v.id("products"),
    roles: v.array(v.string()),
    username: v.string(),
  },
  handler: async (ctx, { productId, roles, username }) => {
    const user = await requireUser(ctx);
    await requireProductAuthor(ctx, productId, user);
    const developer = await getUserByUsername(ctx, username);
    if (!developer) {
      throw new Error("Developer not found.");
    }

    const normalizedRoles = normalizeRoles(roles);
    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", developer._id),
      )
      .first();
    if (current) {
      await ctx.db.patch(current._id, {
        invitedBy: user._id,
        roles: normalizedRoles,
        status: current.status === "active" ? "active" : "invited",
      });
      return current._id;
    }

    return await ctx.db.insert("productDevelopers", {
      developerId: developer._id,
      invitedBy: user._id,
      productId,
      roles: normalizedRoles,
      status: "invited",
    });
  },
});

export const requestToJoin = mutation({
  args: {
    productId: v.id("products"),
    roles: v.array(v.string()),
  },
  handler: async (ctx, { productId, roles }) => {
    const user = await requireUser(ctx);
    const product = await ctx.db.get(productId);
    if (!product || !product.isPublic) {
      throw new Error("Product not found.");
    }

    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", user._id),
      )
      .first();
    if (current) {
      return current._id;
    }

    return await ctx.db.insert("productDevelopers", {
      developerId: user._id,
      productId,
      roles: normalizeRoles(roles),
      status: "invited",
    });
  },
});

export const approve = mutation({
  args: {
    developerId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, { developerId, productId }) => {
    const user = await requireUser(ctx);
    await requireProductAuthor(ctx, productId, user);
    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", developerId),
      )
      .first();
    if (!current) {
      throw new Error("Developer invite not found.");
    }

    await ctx.db.patch(current._id, {
      joinedAt: current.joinedAt ?? Date.now(),
      status: "active",
    });
  },
});

export const decline = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, { productId }) => {
    const user = await requireUser(ctx);
    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", user._id),
      )
      .first();
    if (!current) {
      return;
    }
    if (current.status === "active") {
      throw new Error("Active developers must be removed by the product owner.");
    }

    await ctx.db.patch(current._id, { status: "declined" });
  },
});

export const updateMine = mutation({
  args: {
    productId: v.id("products"),
    roles: v.array(v.string()),
  },
  handler: async (ctx, { productId, roles }) => {
    const user = await requireUser(ctx);
    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", user._id),
      )
      .first();
    if (!current || current.status !== "active") {
      throw new Error("Active product developer record not found.");
    }

    await ctx.db.patch(current._id, { roles: normalizeRoles(roles) });
  },
});

export const remove = mutation({
  args: {
    developerId: v.id("users"),
    productId: v.id("products"),
  },
  handler: async (ctx, { developerId, productId }) => {
    const user = await requireUser(ctx);
    const product = await ctx.db.get(productId);
    if (!product) {
      throw new Error("Product not found.");
    }
    if (product.authorId !== user._id && developerId !== user._id) {
      throw new Error("Forbidden.");
    }
    if (developerId === product.authorId) {
      throw new Error("Product owner cannot be removed.");
    }

    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", developerId),
      )
      .first();
    if (!current) {
      return;
    }

    await ctx.db.delete(current._id);
  },
});

async function listDevelopers(
  ctx: Parameters<typeof getCurrentUser>[0],
  productId: Parameters<typeof requireProductAuthor>[1],
  includePrivate: boolean,
) {
  const rows = await ctx.db
    .query("productDevelopers")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .take(MAX_PRODUCT_DEVELOPERS);
  const developers = [];

  for (const row of rows) {
    if (!includePrivate && row.status !== "active") {
      continue;
    }

    const developer = await ctx.db.get(row.developerId);
    if (!developer || (!includePrivate && developer.isPublic === false)) {
      continue;
    }

    developers.push({
      _id: row._id,
      company: developer.company,
      developerId: developer._id,
      image: developer.image,
      invitedBy: row.invitedBy,
      joinedAt: row.joinedAt,
      name: developer.name,
      roles: row.roles,
      status: row.status,
      username: developer.username,
    });
  }

  return developers;
}

function normalizeRoles(roles: string[]) {
  const uniqueRoles = [];
  const seen = new Set<string>();

  for (const role of roles) {
    const normalizedRole = role.trim();
    if (
      normalizedRole.length === 0 ||
      normalizedRole.length > MAX_ROLE_LENGTH ||
      seen.has(normalizedRole)
    ) {
      continue;
    }

    seen.add(normalizedRole);
    uniqueRoles.push(normalizedRole);
  }

  return uniqueRoles.slice(0, MAX_ROLES);
}
