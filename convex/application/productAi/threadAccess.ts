import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { canEditProduct } from "../products/productAccess";
import { productAiError } from "./productAiError";

const MAX_DRAFT_KEY_LENGTH = 200;

export type ThreadLocator = {
  draftKey?: string;
  productId?: Id<"products">;
};

export async function findReadableThread(
  ctx: QueryCtx,
  user: Doc<"users">,
  locator: ThreadLocator,
) {
  if (locator.productId !== undefined) {
    await requireEditableProduct(ctx, locator.productId, user);
  }
  return await findThreadForUser(ctx, user._id, locator);
}

export async function findThreadForUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  locator: ThreadLocator,
) {
  if (locator.productId !== undefined) {
    return await ctx.db
      .query("productAiThreads")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", userId).eq("productId", locator.productId),
      )
      .first();
  }
  if (locator.draftKey !== undefined) {
    return await ctx.db
      .query("productAiThreads")
      .withIndex("by_user_draft", (q) =>
        q.eq("userId", userId).eq("draftKey", locator.draftKey),
      )
      .first();
  }
  return null;
}

export async function findLatestRepoContext(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  locator: ThreadLocator,
) {
  if (locator.productId !== undefined) {
    return await ctx.db
      .query("productRepoContexts")
      .withIndex("by_product_user_updated", (q) =>
        q.eq("productId", locator.productId).eq("userId", userId),
      )
      .order("desc")
      .first();
  }
  if (locator.draftKey !== undefined) {
    return await ctx.db
      .query("productRepoContexts")
      .withIndex("by_user_draft_updated", (q) =>
        q.eq("userId", userId).eq("draftKey", locator.draftKey),
      )
      .order("desc")
      .first();
  }
  return null;
}

export async function requireOwnedThread(
  ctx: QueryCtx | MutationCtx,
  threadId: Id<"productAiThreads">,
  userId: Id<"users">,
) {
  const thread = await ctx.db.get("productAiThreads", threadId);
  if (thread === null || thread.userId !== userId) {
    throw productAiError("THREAD_NOT_FOUND");
  }
  return thread;
}

export async function requireEditableProduct(
  ctx: QueryCtx | MutationCtx,
  productId: Id<"products">,
  user: Doc<"users">,
) {
  const product = await ctx.db.get("products", productId);
  if (product === null) {
    throw productAiError("PRODUCT_NOT_FOUND");
  }
  if (!(await canEditProduct(ctx, product, user))) {
    throw productAiError("FORBIDDEN");
  }
  return product;
}

export function normalizeLocator(locator: ThreadLocator): ThreadLocator {
  const draftKey =
    locator.draftKey === undefined
      ? undefined
      : normalizeDraftKey(locator.draftKey);
  const hasDraft = draftKey !== undefined;
  const hasProduct = locator.productId !== undefined;
  if (hasDraft === hasProduct) {
    throw productAiError("INVALID_LOCATOR");
  }
  return hasProduct ? { productId: locator.productId } : { draftKey };
}

function normalizeDraftKey(draftKey: string) {
  const normalized = draftKey.trim();
  if (
    normalized.length === 0 ||
    normalized.length > MAX_DRAFT_KEY_LENGTH
  ) {
    throw productAiError("INVALID_DRAFT_KEY");
  }
  return normalized;
}
