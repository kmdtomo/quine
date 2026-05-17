import { v } from "convex/values";

import { auth } from "./auth";
import { internalMutation, query } from "./_generated/server";

export const listByRun = query({
  args: {
    runId: v.string(),
  },
  handler: async (ctx, { runId }) => {
    const userId = await auth.getUserId(ctx);
    if (!userId) {
      return [];
    }

    return await ctx.db
      .query("githubAnalysisLogs")
      .withIndex("by_user_run", (q) =>
        q.eq("userId", userId).eq("runId", runId),
      )
      .order("asc")
      .collect();
  },
});

export const append = internalMutation({
  args: {
    runId: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
    message: v.string(),
    repository: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("githubAnalysisLogs", args);
  },
});
