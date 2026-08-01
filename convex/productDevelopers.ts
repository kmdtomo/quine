import { ConvexError, v } from "convex/values";

import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  canEditProduct,
  canViewProduct,
} from "./application/products/productAccess";
import { getCurrentUser } from "./lib/auth";
import { getUserByUsername } from "./lib/users";

const MAX_PRODUCT_DEVELOPERS = 100;
const MAX_ROLE_LENGTH = 48;
const MAX_ROLES = 8;

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
  handler: async (ctx, { productId, roles, username }) => {
    const user = await requireProductDeveloperUser(ctx);
    await requireProductAuthorWithCode(ctx, productId, user._id);
    const developer = await getUserByUsername(ctx, username);
    if (!developer) {
      throw new ConvexError({
        code: "DEVELOPER_NOT_FOUND",
        message: "Developer not found.",
      });
    }

    const normalizedRoles = normalizeRoles(roles);
    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", developer._id),
      )
      .first();
    if (current) {
      await ctx.db.patch("productDevelopers", current._id, {
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
  returns: v.id("productDevelopers"),
  handler: async (ctx, { productId, roles }) => {
    const user = await requireProductDeveloperUser(ctx);
    const product = await ctx.db.get("products", productId);
    if (!product || !product.isPublic) {
      throw new ConvexError({
        code: "PRODUCT_NOT_FOUND",
        message: "Product not found.",
      });
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
  returns: v.null(),
  handler: async (ctx, { developerId, productId }) => {
    const user = await requireProductDeveloperUser(ctx);
    await requireProductAuthorWithCode(ctx, productId, user._id);
    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", developerId),
      )
      .first();
    if (!current) {
      throw new ConvexError({
        code: "DEVELOPER_INVITE_NOT_FOUND",
        message: "Developer invite not found.",
      });
    }

    await ctx.db.patch("productDevelopers", current._id, {
      joinedAt: current.joinedAt ?? Date.now(),
      status: "active",
    });
    return null;
  },
});

export const decline = mutation({
  args: {
    productId: v.id("products"),
  },
  returns: v.null(),
  handler: async (ctx, { productId }) => {
    const user = await requireProductDeveloperUser(ctx);
    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", user._id),
      )
      .first();
    if (!current) {
      return null;
    }
    if (current.status === "active") {
      throw new ConvexError({
        code: "ACTIVE_DEVELOPER_CANNOT_DECLINE",
        message: "Active developers must be removed by the product owner.",
      });
    }

    await ctx.db.patch("productDevelopers", current._id, {
      status: "declined",
    });
    return null;
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
      roles: normalizeRoles(roles),
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
  handler: async (ctx, { developerId, productId }) => {
    const user = await requireProductDeveloperUser(ctx);
    const product = await ctx.db.get("products", productId);
    if (!product) {
      throw new ConvexError({
        code: "PRODUCT_NOT_FOUND",
        message: "Product not found.",
      });
    }
    if (product.authorId !== user._id && developerId !== user._id) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "You do not have permission to remove this developer.",
      });
    }
    if (developerId === product.authorId) {
      throw new ConvexError({
        code: "PRODUCT_AUTHOR_CANNOT_BE_REMOVED",
        message: "Product owner cannot be removed.",
      });
    }

    const current = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", productId).eq("developerId", developerId),
      )
      .first();
    if (!current) {
      return null;
    }

    await ctx.db.delete("productDevelopers", current._id);
    return null;
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

async function requireProductAuthorWithCode(
  ctx: MutationCtx,
  productId: Id<"products">,
  userId: Id<"users">,
) {
  const product = await ctx.db.get("products", productId);
  if (product === null) {
    throw new ConvexError({
      code: "PRODUCT_NOT_FOUND",
      message: "Product not found.",
    });
  }
  if (product.authorId !== userId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Only the product author can manage developers.",
    });
  }

  return product;
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
