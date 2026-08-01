import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  canEditProduct,
  canViewProduct,
} from "./application/products/productAccess";
import { approveDeveloper } from "./application/productDevelopers/approveDeveloper";
import { declineInvitation } from "./application/productDevelopers/declineInvitation";
import { inviteDeveloper } from "./application/productDevelopers/inviteDeveloper";
import { normalizeProductDeveloperRoles } from "./application/productDevelopers/productDeveloperRoles";
import { removeDeveloper } from "./application/productDevelopers/removeDeveloper";
import { requestToJoinProduct } from "./application/productDevelopers/requestToJoinProduct";
import { getCurrentUser } from "./lib/auth";

const MAX_PRODUCT_DEVELOPERS = 100;

const developerStatusValue = v.union(
  v.literal("invited"),
  v.literal("active"),
  v.literal("declined"),
);

const productDeveloperValue = v.object({
  _id: v.id("productDevelopers"),
  company: v.optional(v.string()),
  developerId: v.id("users"),
  image: v.optional(v.string()),
  invitedBy: v.optional(v.id("users")),
  joinedAt: v.optional(v.number()),
  name: v.optional(v.string()),
  roles: v.array(v.string()),
  status: developerStatusValue,
  username: v.optional(v.string()),
});

export const listByProduct = query({
  args: {
    productId: v.id("products"),
  },
  returns: v.union(v.null(), v.array(productDeveloperValue)),
  handler: async (ctx, { productId }) => {
    const product = await ctx.db.get("products", productId);
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
  returns: v.id("productDevelopers"),
  handler: async (ctx, args) => {
    const user = await requireProductDeveloperUser(ctx);
    return await inviteDeveloper(ctx, user._id, args);
  },
});

export const requestToJoin = mutation({
  args: {
    productId: v.id("products"),
    roles: v.array(v.string()),
  },
  returns: v.id("productDevelopers"),
  handler: async (ctx, args) => {
    const user = await requireProductDeveloperUser(ctx);
    return await requestToJoinProduct(ctx, user._id, args);
  },
});

export const approve = mutation({
  args: {
    developerId: v.id("users"),
    productId: v.id("products"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireProductDeveloperUser(ctx);
    return await approveDeveloper(ctx, user._id, args);
  },
});

export const decline = mutation({
  args: {
    productId: v.id("products"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireProductDeveloperUser(ctx);
    return await declineInvitation(ctx, user._id, args);
  },
});

export const updateMine = mutation({
  args: {
    productId: v.id("products"),
    roles: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { productId, roles }) => {
    const user = await requireProductDeveloperUser(ctx);
    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", user._id),
      )
      .first();
    if (!current || current.status !== "active") {
      throw new ConvexError({
        code: "ACTIVE_DEVELOPER_NOT_FOUND",
        message: "Active product developer record not found.",
      });
    }

    await ctx.db.patch("productDevelopers", current._id, {
      roles: normalizeProductDeveloperRoles(roles),
    });
    return null;
  },
});

export const remove = mutation({
  args: {
    developerId: v.id("users"),
    productId: v.id("products"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireProductDeveloperUser(ctx);
    return await removeDeveloper(ctx, user._id, args);
  },
});

async function listDevelopers(
  ctx: QueryCtx,
  productId: Id<"products">,
  includePrivate: boolean,
) {
  const rows = includePrivate
    ? await ctx.db
        .query("productDevelopers")
        .withIndex("by_product", (q) => q.eq("productId", productId))
        .take(MAX_PRODUCT_DEVELOPERS)
    : await ctx.db
        .query("productDevelopers")
        .withIndex("by_product_status", (q) =>
          q.eq("productId", productId).eq("status", "active"),
        )
        .take(MAX_PRODUCT_DEVELOPERS);
  const developers = [];

  for (const row of rows) {
    const developer = await ctx.db.get("users", row.developerId);
    if (!developer || (!includePrivate && developer.isPublic === false)) {
      continue;
    }

    developers.push({
      _id: row._id,
      company: developer.company,
      developerId: developer._id,
      image: developer.image,
      ...(includePrivate && row.invitedBy !== undefined
        ? { invitedBy: row.invitedBy }
        : {}),
      joinedAt: row.joinedAt,
      name: developer.name,
      roles: row.roles,
      status: row.status,
      username: developer.username,
    });
  }

  return developers;
}

async function requireProductDeveloperUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (user === null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Authentication is required.",
    });
  }

  return user;
}
