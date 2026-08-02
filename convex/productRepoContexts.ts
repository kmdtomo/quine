import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { upsertRepoContext } from "./application/productAi/upsertRepoContext";

export const upsertImported = internalMutation({
  args: {
    defaultBranch: v.optional(v.string()),
    dependencySummary: v.string(),
    description: v.optional(v.string()),
    detectedTechnologyKeys: v.array(v.string()),
    draftKey: v.optional(v.string()),
    filesRead: v.array(v.string()),
    githubUrl: v.string(),
    primaryLanguage: v.optional(v.string()),
    productId: v.optional(v.id("products")),
    readmePath: v.optional(v.string()),
    readmeText: v.optional(v.string()),
    repositoryFullName: v.string(),
    userId: v.id("users"),
  },
  returns: v.id("productRepoContexts"),
  handler: async (ctx, args) => upsertRepoContext(ctx, args),
});
