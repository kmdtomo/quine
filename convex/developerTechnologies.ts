import { ConvexError, v } from "convex/values";

import {
  getTechnologyByKey,
  isTechnologyKey,
} from "../data/tech-stack";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import {
  MAX_DEVELOPER_TECHNOLOGIES,
  normalizeDeveloperYears,
} from "./application/developerTechnologies/technologyRules";
import {
  reorder as reorderUseCase,
} from "./application/developerTechnologies/reorder";
import {
  saveDetected as saveDetectedUseCase,
} from "./application/developerTechnologies/saveDetected";
import {
  setManyYears as setManyYearsUseCase,
} from "./application/developerTechnologies/setManyYears";
import { getCurrentUser } from "./lib/auth";

const listMineValidator = v.union(
  v.null(),
  v.object({
    technologies: v.array(
      v.object({
        _id: v.id("developerTechnologies"),
        categoryName: v.string(),
        description: v.string(),
        name: v.string(),
        order: v.number(),
        technologyKey: v.string(),
        years: v.optional(v.number()),
      }),
    ),
    user: v.object({
      _id: v.id("users"),
      image: v.optional(v.string()),
      name: v.optional(v.string()),
      profileOnboardingCompletedAt: v.optional(v.number()),
      techStackOnboardingCompletedAt: v.optional(v.number()),
      username: v.optional(v.string()),
    }),
  }),
);

export const listMine = query({
  args: {},
  returns: listMineValidator,
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const rows = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer_order", (q) => q.eq("developerId", user._id))
      .take(MAX_DEVELOPER_TECHNOLOGIES);

    const technologies = rows.flatMap((row) => {
      const technology = getTechnologyByKey(row.technologyKey);
      if (!technology) {
        return [];
      }

      return [
        {
          _id: row._id,
          technologyKey: row.technologyKey,
          years: row.years,
          order: row.order,
          name: technology.name,
          categoryName: technology.categoryName,
          description: technology.description,
        },
      ];
    });

    return {
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        image: user.image,
        profileOnboardingCompletedAt: user.profileOnboardingCompletedAt,
        techStackOnboardingCompletedAt: user.techStackOnboardingCompletedAt,
      },
      technologies,
    };
  },
});

export const saveDetected = internalMutation({
  args: {
    technologyKeys: v.array(v.string()),
    userId: v.id("users"),
  },
  returns: v.object({
    detectedCount: v.number(),
    insertedCount: v.number(),
  }),
  handler: async (ctx, args) => await saveDetectedUseCase(ctx, args),
});

export const add = mutation({
  args: {
    technologyKey: v.string(),
  },
  returns: v.id("developerTechnologies"),
  handler: async (ctx, { technologyKey }) => {
    const user = await requireDeveloperTechnologyUser(ctx);
    if (!isTechnologyKey(technologyKey)) {
      throw new ConvexError({
        code: "UNKNOWN_TECHNOLOGY",
        message: "Unknown technology.",
      });
    }

    const current = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer_technology", (q) =>
        q.eq("developerId", user._id).eq("technologyKey", technologyKey),
      )
      .first();
    if (current) {
      return current._id;
    }

    const existing = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer", (q) => q.eq("developerId", user._id))
      .take(MAX_DEVELOPER_TECHNOLOGIES);
    const nextOrder =
      existing.reduce((currentMax, row) => Math.max(currentMax, row.order), 0) +
      1;

    return await ctx.db.insert("developerTechnologies", {
      developerId: user._id,
      technologyKey,
      order: nextOrder,
    });
  },
});

export const remove = mutation({
  args: {
    technologyKey: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, { technologyKey }) => {
    const user = await requireDeveloperTechnologyUser(ctx);
    const current = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer_technology", (q) =>
        q.eq("developerId", user._id).eq("technologyKey", technologyKey),
      )
      .first();
    if (!current) {
      return null;
    }
    await ctx.db.delete("developerTechnologies", current._id);
    return null;
  },
});

export const setYears = mutation({
  args: {
    technologyKey: v.string(),
    years: v.union(v.number(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, { technologyKey, years }) => {
    const user = await requireDeveloperTechnologyUser(ctx);
    const normalizedYears = normalizeDeveloperYears(years);
    const current = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer_technology", (q) =>
        q.eq("developerId", user._id).eq("technologyKey", technologyKey),
      )
      .first();
    if (!current) {
      throw new ConvexError({
        code: "TECHNOLOGY_NOT_SELECTED",
        message: "Technology is not selected.",
      });
    }

    await ctx.db.patch("developerTechnologies", current._id, {
      years: normalizedYears,
    });
    return null;
  },
});

export const setManyYears = mutation({
  args: {
    technologyKeys: v.array(v.string()),
    years: v.union(v.number(), v.null()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireDeveloperTechnologyUser(ctx);
    return await setManyYearsUseCase(ctx, args, user._id);
  },
});

export const reorder = mutation({
  args: {
    technologyKeys: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireDeveloperTechnologyUser(ctx);
    return await reorderUseCase(ctx, args, user._id);
  },
});

async function requireDeveloperTechnologyUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (user === null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Authentication is required.",
    });
  }

  return user;
}
