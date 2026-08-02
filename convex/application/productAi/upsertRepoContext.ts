import { ConvexError } from "convex/values";

import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { canEditProduct } from "../products/productAccess";

type UpsertRepoContextArgs = {
  defaultBranch?: string;
  dependencySummary: string;
  description?: string;
  detectedTechnologyKeys: string[];
  draftKey?: string;
  filesRead: string[];
  githubUrl: string;
  primaryLanguage?: string;
  productId?: Id<"products">;
  readmePath?: string;
  readmeText?: string;
  repositoryFullName: string;
  userId: Id<"users">;
};

export async function upsertRepoContext(
  ctx: MutationCtx,
  args: UpsertRepoContextArgs,
) {
  const user = await requireUserDoc(ctx, args.userId);
  if (args.productId !== undefined) {
    await requireEditableProduct(ctx, args.productId, user);
  }

  const now = Date.now();
  const existing = await findExistingRepoContext(ctx, args);
  if (existing) {
    await ctx.db.patch("productRepoContexts", existing._id, {
      defaultBranch: args.defaultBranch,
      dependencySummary: args.dependencySummary,
      description: args.description,
      detectedTechnologyKeys: args.detectedTechnologyKeys,
      draftKey: args.draftKey,
      filesRead: args.filesRead,
      githubUrl: args.githubUrl,
      primaryLanguage: args.primaryLanguage,
      productId: args.productId,
      readmePath: args.readmePath,
      readmeText: args.readmeText,
      updatedAt: now,
    });
    await attachExistingThread(ctx, args, existing._id, now);
    return existing._id;
  }

  const repoContextId = await ctx.db.insert("productRepoContexts", {
    createdAt: now,
    defaultBranch: args.defaultBranch,
    dependencySummary: args.dependencySummary,
    description: args.description,
    detectedTechnologyKeys: args.detectedTechnologyKeys,
    draftKey: args.draftKey,
    filesRead: args.filesRead,
    githubUrl: args.githubUrl,
    primaryLanguage: args.primaryLanguage,
    productId: args.productId,
    readmePath: args.readmePath,
    readmeText: args.readmeText,
    repositoryFullName: args.repositoryFullName,
    updatedAt: now,
    userId: args.userId,
  });

  await attachExistingThread(ctx, args, repoContextId, now);
  return repoContextId;
}

async function findExistingRepoContext(
  ctx: MutationCtx,
  args: {
    draftKey?: string;
    productId?: Id<"products">;
    repositoryFullName: string;
    userId: Id<"users">;
  },
) {
  if (args.productId !== undefined) {
    const byProduct = await ctx.db
      .query("productRepoContexts")
      .withIndex("by_product_repository", (q) =>
        q.eq("productId", args.productId).eq(
          "repositoryFullName",
          args.repositoryFullName,
        ),
      )
      .first();
    if (byProduct && byProduct.userId === args.userId) {
      return byProduct;
    }
  }

  if (args.draftKey !== undefined) {
    return await ctx.db
      .query("productRepoContexts")
      .withIndex("by_user_draft_repository", (q) =>
        q
          .eq("userId", args.userId)
          .eq("draftKey", args.draftKey)
          .eq("repositoryFullName", args.repositoryFullName),
      )
      .first();
  }

  return await ctx.db
    .query("productRepoContexts")
    .withIndex("by_user_repository", (q) =>
      q.eq("userId", args.userId).eq("repositoryFullName", args.repositoryFullName),
    )
    .first();
}

async function attachExistingThread(
  ctx: MutationCtx,
  args: {
    draftKey?: string;
    productId?: Id<"products">;
    userId: Id<"users">;
  },
  repoContextId: Id<"productRepoContexts">,
  now: number,
) {
  const thread =
    args.productId === undefined
      ? args.draftKey === undefined
        ? null
        : await ctx.db
            .query("productAiThreads")
            .withIndex("by_user_draft", (q) =>
              q.eq("userId", args.userId).eq("draftKey", args.draftKey),
            )
            .first()
      : await ctx.db
          .query("productAiThreads")
          .withIndex("by_user_product", (q) =>
            q.eq("userId", args.userId).eq("productId", args.productId),
          )
          .first();

  if (!thread) {
    return;
  }

  await ctx.db.patch("productAiThreads", thread._id, {
    repoContextId,
    updatedAt: now,
  });
}

async function requireEditableProduct(
  ctx: MutationCtx,
  productId: Id<"products">,
  user: Doc<"users">,
) {
  const product = await ctx.db.get("products", productId);
  if (!product) {
    throw repoContextError("PRODUCT_NOT_FOUND");
  }
  if (!(await canEditProduct(ctx, product, user))) {
    throw repoContextError("FORBIDDEN");
  }
  return product;
}

async function requireUserDoc(ctx: MutationCtx, userId: Id<"users">) {
  const user = await ctx.db.get("users", userId);
  if (!user) {
    throw repoContextError("USER_NOT_FOUND");
  }
  return user;
}

type RepoContextErrorCode = "FORBIDDEN" | "PRODUCT_NOT_FOUND" | "USER_NOT_FOUND";

function repoContextError(code: RepoContextErrorCode) {
  const messages: Record<RepoContextErrorCode, string> = {
    FORBIDDEN: "The user cannot attach repository context to this product.",
    PRODUCT_NOT_FOUND: "The product could not be found.",
    USER_NOT_FOUND: "The repository context user could not be found.",
  };
  return new ConvexError({ code, message: messages[code] });
}
