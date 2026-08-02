import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { resolveDeveloper } from "./resolveDeveloper";

type AddConnectionArgs = {
  toDeveloperId?: Id<"users">;
  username?: string;
};

export async function addConnection(
  ctx: MutationCtx,
  user: Doc<"users">,
  args: AddConnectionArgs,
) {
  const target = await resolveDeveloper(ctx, {
    developerId: args.toDeveloperId,
    username: args.username,
  });
  if (!target) {
    throw new ConvexError({
      code: "CONNECTION_USER_NOT_FOUND",
      message: "Connection user not found.",
    });
  }
  if (target._id === user._id) {
    throw new ConvexError({
      code: "SELF_CONNECTION_NOT_ALLOWED",
      message: "You cannot connect to yourself.",
    });
  }

  const current = await ctx.db
    .query("connections")
    .withIndex("by_pair", (q) =>
      q.eq("fromDeveloperId", user._id).eq("toDeveloperId", target._id),
    )
    .first();
  if (current) {
    return current._id;
  }

  return await ctx.db.insert("connections", {
    fromDeveloperId: user._id,
    toDeveloperId: target._id,
  });
}
