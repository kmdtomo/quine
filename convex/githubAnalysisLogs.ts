import { v } from "convex/values";

import { internalMutation, query } from "./_generated/server";
import { requireUser } from "./lib/auth";

const logValidator = v.object({
  _id: v.id("githubAnalysisLogs"),
  _creationTime: v.number(),
  analysisRunId: v.optional(v.id("githubAnalysisRuns")),
  createdAt: v.number(),
  level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
  message: v.string(),
  repository: v.optional(v.string()),
  runId: v.string(),
  userId: v.id("users"),
});

export const listByAnalysisRun = query({
  args: {
    runId: v.id("githubAnalysisRuns"),
  },
  returns: v.array(logValidator),
  handler: async (ctx, { runId }) => {
    const user = await requireUser(ctx);
    const run = await ctx.db.get("githubAnalysisRuns", runId);
    if (!run || run.userId !== user._id) {
      return [];
    }

    return await ctx.db
      .query("githubAnalysisLogs")
      .withIndex("by_analysis_run_created", (q) =>
        q.eq("analysisRunId", runId),
      )
      .order("asc")
      .take(200);
  },
});

export const append = internalMutation({
  args: {
    analysisRunId: v.id("githubAnalysisRuns"),
    userId: v.id("users"),
    createdAt: v.number(),
    level: v.union(v.literal("info"), v.literal("warn"), v.literal("error")),
    message: v.string(),
    repository: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("githubAnalysisLogs", {
      ...args,
      runId: args.analysisRunId,
    });
    return null;
  },
});
