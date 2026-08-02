import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { addConnection } from "./addConnection";
import { resolveDeveloper } from "./resolveDeveloper";

type ApproveConnectionArgs = {
  fromDeveloperId?: Id<"users">;
  username?: string;
};

export async function approveConnection(
  ctx: MutationCtx,
  user: Doc<"users">,
  args: ApproveConnectionArgs,
) {
  const source = await resolveDeveloper(ctx, {
    developerId: args.fromDeveloperId,
    username: args.username,
  });
  if (!source) {
    throw new ConvexError({
      code: "CONNECTION_USER_NOT_FOUND",
      message: "Connection user not found.",
    });
  }

  const incoming = await ctx.db
    .query("connections")
    .withIndex("by_pair", (q) =>
      q.eq("fromDeveloperId", source._id).eq("toDeveloperId", user._id),
    )
    .first();
  if (!incoming) {
    throw new ConvexError({
      code: "CONNECTION_REQUEST_NOT_FOUND",
      message: "Connection request not found.",
    });
  }

  return await addConnection(ctx, user, { toDeveloperId: source._id });
}
