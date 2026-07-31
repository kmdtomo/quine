import { ConvexError, v } from "convex/values";

import {
  getTechnologyByKey,
  isTechnologyKey,
  technologyKeys as canonicalTechnologyKeys,
  type TechnologyKey,
} from "../data/tech-stack";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { internalMutation, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";

const MAX_DEVELOPER_TECHNOLOGIES = canonicalTechnologyKeys.length;
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

function uniqueValidTechnologyKeys(keys: string[]): TechnologyKey[] {
  const seen = new Set<TechnologyKey>();
  const result: TechnologyKey[] = [];

  for (const key of keys) {
    if (!isTechnologyKey(key) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(key);
  }

  return result;
}

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
  handler: async (ctx, args) => {
    const technologyKeys = uniqueValidTechnologyKeys(args.technologyKeys);

    const existing = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer", (q) => q.eq("developerId", args.userId))
      .take(MAX_DEVELOPER_TECHNOLOGIES);

    const existingByKey = new Map(
      existing.map((row) => [row.technologyKey, row]),
    );
    const maxOrder = existing.reduce(
      (currentMax, row) => Math.max(currentMax, row.order),
      0,
    );
    let nextOrder = maxOrder + 1;
    let insertedCount = 0;

    for (const technologyKey of technologyKeys) {
      const current = existingByKey.get(technologyKey);
      if (current) {
        continue;
      }

      await ctx.db.insert("developerTechnologies", {
        developerId: args.userId,
        technologyKey,
        order: nextOrder,
      });
      nextOrder += 1;
      insertedCount += 1;
    }

    return {
      detectedCount: technologyKeys.length,
      insertedCount,
    };
  },
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
  handler: async (ctx, { technologyKeys, years }) => {
    const user = await requireDeveloperTechnologyUser(ctx);
    const normalizedYears = normalizeDeveloperYears(years);

    const validKeys = uniqueValidTechnologyKeys(technologyKeys);
    for (const technologyKey of validKeys) {
      const current = await ctx.db
        .query("developerTechnologies")
        .withIndex("by_developer_technology", (q) =>
          q.eq("developerId", user._id).eq("technologyKey", technologyKey),
        )
        .first();
      if (!current) {
        continue;
      }

      await ctx.db.patch("developerTechnologies", current._id, {
        years: normalizedYears,
      });
    }
    return null;
  },
});

export const reorder = mutation({
  args: {
    technologyKeys: v.array(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { technologyKeys }) => {
    const user = await requireDeveloperTechnologyUser(ctx);
    const validKeys = uniqueValidTechnologyKeys(technologyKeys);
    const requestedKeys = new Set<string>(validKeys);
    const rows = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer", (q) => q.eq("developerId", user._id))
      .take(MAX_DEVELOPER_TECHNOLOGIES);
    const rowsByKey = new Map(rows.map((row) => [row.technologyKey, row]));

    let order = 1;
    for (const technologyKey of validKeys) {
      const row = rowsByKey.get(technologyKey);
      if (!row) {
        continue;
      }
      await ctx.db.patch("developerTechnologies", row._id, { order });
      order += 1;
    }

    const remainingRows = rows
      .filter((row) => !requestedKeys.has(row.technologyKey))
      .sort((a, b) => a.order - b.order);
    for (const row of remainingRows) {
      await ctx.db.patch("developerTechnologies", row._id, { order });
      order += 1;
    }
    return null;
  },
});

function normalizeDeveloperYears(years: number | null) {
  if (years === null) {
    return undefined;
  }
  if (!Number.isInteger(years) || years < 1 || years > 11) {
    throw new ConvexError({
      code: "INVALID_YEARS",
      message: "Years must be an integer between 1 and 11.",
    });
  }

  return years;
}

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
