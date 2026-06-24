import { v } from "convex/values";

import {
  getTechnologyByKey,
  isTechnologyKey,
  type TechnologyKey,
} from "../data/tech-stack";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";

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
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    const rows = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer_order", (q) => q.eq("developerId", user._id))
      .collect();

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
        githubInstallationId: user.githubInstallationId,
        profileOnboardingCompletedAt: user.profileOnboardingCompletedAt,
        techStackOnboardingCompletedAt: user.techStackOnboardingCompletedAt,
      },
      technologies,
    };
  },
});

export const saveDetected = mutation({
  args: {
    technologyKeys: v.array(v.string()),
    installationId: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const technologyKeys = uniqueValidTechnologyKeys(args.technologyKeys);

    const existing = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer", (q) => q.eq("developerId", user._id))
      .collect();

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
        developerId: user._id,
        technologyKey,
        order: nextOrder,
      });
      nextOrder += 1;
      insertedCount += 1;
    }

    if (
      args.installationId !== undefined &&
      user.githubInstallationId !== args.installationId
    ) {
      await ctx.db.patch(user._id, {
        githubInstallationId: args.installationId,
      });
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
  handler: async (ctx, { technologyKey }) => {
    const user = await requireUser(ctx);
    if (!isTechnologyKey(technologyKey)) {
      throw new Error("Unknown technology");
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
      .collect();
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
  handler: async (ctx, { technologyKey }) => {
    const user = await requireUser(ctx);
    const current = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer_technology", (q) =>
        q.eq("developerId", user._id).eq("technologyKey", technologyKey),
      )
      .first();
    if (!current) {
      return;
    }
    await ctx.db.delete(current._id);
  },
});

export const setYears = mutation({
  args: {
    technologyKey: v.string(),
    years: v.union(v.number(), v.null()),
  },
  handler: async (ctx, { technologyKey, years }) => {
    const user = await requireUser(ctx);
    const current = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer_technology", (q) =>
        q.eq("developerId", user._id).eq("technologyKey", technologyKey),
      )
      .first();
    if (!current) {
      throw new Error("Technology is not selected");
    }

    await ctx.db.patch(current._id, {
      years: years === null ? undefined : years,
    });
  },
});

export const setManyYears = mutation({
  args: {
    technologyKeys: v.array(v.string()),
    years: v.union(v.number(), v.null()),
  },
  handler: async (ctx, { technologyKeys, years }) => {
    const user = await requireUser(ctx);
    if (
      years !== null &&
      (!Number.isInteger(years) || years < 1 || years > 11)
    ) {
      throw new Error("Years must be between 1 and 11.");
    }

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

      await ctx.db.patch(current._id, {
        years: years === null ? undefined : years,
      });
    }
  },
});

export const reorder = mutation({
  args: {
    technologyKeys: v.array(v.string()),
  },
  handler: async (ctx, { technologyKeys }) => {
    const user = await requireUser(ctx);
    const validKeys = uniqueValidTechnologyKeys(technologyKeys);
    const requestedKeys = new Set<string>(validKeys);
    const rows = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer", (q) => q.eq("developerId", user._id))
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
