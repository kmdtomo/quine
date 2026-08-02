import { ConvexError } from "convex/values";

import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { getUserByUsername } from "../../lib/users";
import { requireProductAuthorWithCode } from "./productDeveloperAccess";
import { normalizeProductDeveloperRoles } from "./productDeveloperRoles";

type InviteDeveloperArgs = {
  productId: Id<"products">;
  roles: string[];
  username: string;
};

export async function inviteDeveloper(
  ctx: MutationCtx,
  userId: Id<"users">,
  { productId, roles, username }: InviteDeveloperArgs,
) {
  await requireProductAuthorWithCode(ctx, productId, userId);
  const developer = await getUserByUsername(ctx, username);
  if (!developer) {
    throw new ConvexError({
      code: "DEVELOPER_NOT_FOUND",
      message: "Developer not found.",
    });
  }

  const normalizedRoles = normalizeProductDeveloperRoles(roles);
  const current = await ctx.db
    .query("productDevelopers")
    .withIndex("by_product_developer", (q) =>
      q.eq("productId", productId).eq("developerId", developer._id),
    )
    .first();
  if (current) {
    await ctx.db.patch("productDevelopers", current._id, {
      invitedBy: userId,
      roles: normalizedRoles,
      status: current.status === "active" ? "active" : "invited",
    });
    return current._id;
  }

  return await ctx.db.insert("productDevelopers", {
    developerId: developer._id,
    invitedBy: userId,
    productId,
    roles: normalizedRoles,
    status: "invited",
  });
}
