import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { normalizeUsername } from "./username";

export async function getUserByUsername(
  ctx: QueryCtx | MutationCtx,
  username: string,
): Promise<Doc<"users"> | null> {
  const normalizedUsername = normalizeUsername(username);
  if (normalizedUsername === undefined) {
    return null;
  }

  const normalizedUser = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", normalizedUsername))
    .first();
  if (normalizedUser) {
    return normalizedUser;
  }

  return await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", `@${normalizedUsername}`))
    .first();
}
