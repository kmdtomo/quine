import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { requireProductAuthorWithCode } from "./productDeveloperAccess";

type ApproveDeveloperArgs = {
  developerId: Id<"users">;
  productId: Id<"products">;
};

export async function approveDeveloper(
  ctx: MutationCtx,
  userId: Id<"users">,
  { developerId, productId }: ApproveDeveloperArgs,
) {
  await requireProductAuthorWithCode(ctx, productId, userId);
  const current = await ctx.db
    .query("productDevelopers")
    .withIndex("by_product_developer", (q) =>
      q.eq("productId", productId).eq("developerId", developerId),
    )
    .first();
  if (!current) {
    throw new ConvexError({
      code: "DEVELOPER_INVITE_NOT_FOUND",
      message: "Developer invite not found.",
    });
  }

  await ctx.db.patch("productDevelopers", current._id, {
    joinedAt: current.joinedAt ?? Date.now(),
    status: "active",
  });
  return null;
}
