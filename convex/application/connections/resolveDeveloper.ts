import type { Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { getUserByUsername } from "../../lib/users";

type ResolveDeveloperArgs = {
  developerId?: Id<"users">;
  username?: string;
};

export async function resolveDeveloper(
  ctx: QueryCtx | MutationCtx,
  { developerId, username }: ResolveDeveloperArgs,
) {
  if (developerId !== undefined) {
    return await ctx.db.get("users", developerId);
  }
  if (username !== undefined) {
    return await getUserByUsername(ctx, username);
  }
  return null;
}
