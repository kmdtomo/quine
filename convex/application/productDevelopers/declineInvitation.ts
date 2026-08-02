import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

type DeclineInvitationArgs = {
  productId: Id<"products">;
};

export async function declineInvitation(
  ctx: MutationCtx,
  userId: Id<"users">,
  { productId }: DeclineInvitationArgs,
) {
  const current = await ctx.db
    .query("productDevelopers")
    .withIndex("by_product_developer", (q) =>
      q.eq("productId", productId).eq("developerId", userId),
    )
    .first();
  if (!current) {
    return null;
  }
  if (current.status === "active") {
    throw new ConvexError({
      code: "ACTIVE_DEVELOPER_CANNOT_DECLINE",
      message: "Active developers must be removed by the product owner.",
    });
  }

  await ctx.db.patch("productDevelopers", current._id, {
    status: "declined",
  });
  return null;
}
