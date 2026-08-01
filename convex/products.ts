import { ConvexError, v } from "convex/values";

import { getTechnologyByKey } from "../data/tech-stack";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import {
  canEditProduct,
  canViewProduct,
  requireProductEditor,
} from "./application/products/productAccess";
import {
  MAX_PRODUCT_TECHNOLOGIES,
  normalizeContent,
  normalizeName,
  normalizeOptionalText,
  normalizeProductSlug,
  normalizeTagline,
} from "./application/products/productInput";
import { saveProductForm } from "./application/products/saveProductForm";
import { getCurrentUser } from "./lib/auth";
import {
  deleteProductMedia,
  resolveProductLogo,
  resolveProductMedia,
} from "./lib/productAssets";
import { getUserByUsername } from "./lib/users";

const projectType = v.union(
  v.literal("personal"),
  v.literal("work"),
  v.literal("open_source"),
);

const teamSize = v.union(
  v.literal("solo"),
  v.literal("2-5"),
  v.literal("6-10"),
  v.literal("11-30"),
  v.literal("31+"),
);

const MAX_PRODUCT_IMAGE_DATA_URL_LENGTH = 900_000;
const MAX_PRODUCT_SCREENSHOTS = 8;
const MAX_PRODUCT_SCREENSHOT_DATA_URL_LENGTH = 900_000;
const MAX_LIST_PRODUCTS = 50;
const MAX_LIST_PUBLIC_PRODUCTS = 120;
const MAX_PRODUCT_DEVELOPERS = 30;

const publicTechnologyValue = v.object({
  categoryName: v.string(),
  name: v.string(),
  order: v.number(),
  technologyKey: v.string(),
});

const publicDeveloperValue = v.object({
  _id: v.id("productDevelopers"),
  company: v.optional(v.string()),
  developerId: v.id("users"),
  image: v.optional(v.string()),
  name: v.optional(v.string()),
  roles: v.array(v.string()),
  status: v.union(
    v.literal("invited"),
    v.literal("active"),
    v.literal("declined"),
  ),
  username: v.optional(v.string()),
});

const publicAuthorValue = v.object({
  _id: v.id("users"),
  company: v.optional(v.string()),
  image: v.optional(v.string()),
  name: v.optional(v.string()),
  username: v.optional(v.string()),
});

const screenshotAssetValue = v.object({
  order: v.number(),
  storageId: v.id("_storage"),
  url: v.string(),
});

const publicProductRecordValue = v.object({
  _id: v.id("products"),
  content: v.string(),
  githubUrl: v.optional(v.string()),
  isPublic: v.boolean(),
  logo: v.optional(v.string()),
  name: v.string(),
  productUrl: v.optional(v.string()),
  projectType,
  screenshots: v.array(v.string()),
  slug: v.string(),
  tagline: v.string(),
  teamSize: v.optional(teamSize),
});

type PublicTechnology = {
  categoryName: string;
  name: string;
  order: number;
  technologyKey: string;
};

type PublicDeveloper = {
  _id: Id<"productDevelopers">;
  company: string | undefined;
  developerId: Id<"users">;
  image: string | undefined;
  name: string | undefined;
  roles: string[];
  status: "invited" | "active" | "declined";
  username: string | undefined;
};

export const listPublic = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("products"),
      author: publicAuthorValue,
      content: v.string(),
      githubUrl: v.optional(v.string()),
      logo: v.optional(v.string()),
      name: v.string(),
      productUrl: v.optional(v.string()),
      projectType,
      slug: v.string(),
      tagline: v.string(),
      teamSize: v.optional(teamSize),
      technologies: v.array(publicTechnologyValue),
    }),
  ),
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("products")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .take(MAX_LIST_PUBLIC_PRODUCTS);
    const products = [];

    for (const product of rows) {
      const author = await ctx.db.get("users", product.authorId);
      if (!author || author.isPublic === false) {
        continue;
      }
      const logo = await resolveProductLogo(ctx, product);

      products.push({
        _id: product._id,
        author: {
          _id: author._id,
          company: author.company,
          image: author.image,
          name: author.name,
          username: author.username,
        },
        content: product.content,
        githubUrl: product.githubUrl,
        logo,
        name: product.name,
        productUrl: product.productUrl,
        projectType: product.projectType,
        slug: product.slug,
        tagline: product.tagline,
        teamSize: product.teamSize,
        technologies: await getProductTechnologies(ctx, product._id),
      });
    }

    return products;
  },
});

export const listByAuthor = query({
  args: {
    authorId: v.optional(v.id("users")),
    username: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      ...publicProductRecordValue.fields,
      technologies: v.array(publicTechnologyValue),
    }),
  ),
  handler: async (ctx, { authorId, username }) => {
    const author =
      authorId === undefined
        ? username === undefined
          ? null
          : await getUserByUsername(ctx, username)
        : await ctx.db.get("users", authorId);
    if (!author) {
      return [];
    }

    const viewer = await getCurrentUser(ctx);
    const isOwner = viewer?._id === author._id;
    const rows = isOwner
      ? await ctx.db
          .query("products")
          .withIndex("by_author", (q) => q.eq("authorId", author._id))
          .take(MAX_LIST_PRODUCTS)
      : await ctx.db
          .query("products")
          .withIndex("by_author_public", (q) =>
            q.eq("authorId", author._id).eq("isPublic", true),
          )
          .take(MAX_LIST_PRODUCTS);
    const products = [];

    for (const product of rows) {
      const media = await resolveProductMedia(ctx, product);

      products.push({
        _id: product._id,
        content: product.content,
        githubUrl: product.githubUrl,
        isPublic: product.isPublic,
        logo: media.logo,
        name: product.name,
        productUrl: product.productUrl,
        projectType: product.projectType,
        screenshots: media.screenshots,
        slug: product.slug,
        tagline: product.tagline,
        teamSize: product.teamSize,
        technologies: await getProductTechnologies(ctx, product._id),
      });
    }

    return products;
  },
});

export const getBySlug = query({
  args: {
    slug: v.string(),
    username: v.optional(v.string()),
  },
  returns: v.union(
    v.null(),
    v.object({
      ...publicProductRecordValue.fields,
      author: v.union(v.null(), publicAuthorValue),
      developers: v.array(publicDeveloperValue),
      technologies: v.array(publicTechnologyValue),
      viewerCanEdit: v.boolean(),
    }),
  ),
  handler: async (ctx, { slug, username }) => {
    const normalizedSlug = normalizeProductSlug(slug);
    if (!normalizedSlug) {
      return null;
    }

    const product =
      username === undefined
        ? await ctx.db
            .query("products")
            .withIndex("by_slug", (q) => q.eq("slug", normalizedSlug))
            .first()
        : await getProductByAuthorSlug(ctx, username, normalizedSlug);
    if (!product) {
      return null;
    }

    const viewer = await getCurrentUser(ctx);
    if (!(await canViewProduct(ctx, product, viewer))) {
      return null;
    }

    const author = await ctx.db.get("users", product.authorId);
    const media = await resolveProductMedia(ctx, product);
    return {
      _id: product._id,
      content: product.content,
      githubUrl: product.githubUrl,
      isPublic: product.isPublic,
      logo: media.logo,
      name: product.name,
      productUrl: product.productUrl,
      projectType: product.projectType,
      screenshots: media.screenshots,
      slug: product.slug,
      tagline: product.tagline,
      teamSize: product.teamSize,
      author:
        author === null
          ? null
          : {
              _id: author._id,
              company: author.company,
              image: author.image,
              name: author.name,
              username: author.username,
            },
      developers: await getProductDevelopers(
        ctx,
        product._id,
        viewer === null ? false : await canEditProduct(ctx, product, viewer),
      ),
      technologies: await getProductTechnologies(ctx, product._id),
      viewerCanEdit:
        viewer === null ? false : await canEditProduct(ctx, product, viewer),
    };
  },
});

export const getForEdit = query({
  args: {
    productId: v.optional(v.id("products")),
  },
  returns: v.union(
    v.null(),
    v.object({
      product: v.union(
        v.null(),
        v.object({
          _id: v.id("products"),
          content: v.string(),
          githubUrl: v.optional(v.string()),
          isPublic: v.boolean(),
          logo: v.optional(v.string()),
          logoStorageId: v.optional(v.id("_storage")),
          name: v.string(),
          productUrl: v.optional(v.string()),
          projectType,
          roles: v.array(v.string()),
          screenshotAssets: v.array(screenshotAssetValue),
          screenshots: v.array(v.string()),
          slug: v.string(),
          tagline: v.string(),
          teamSize: v.optional(teamSize),
          technologies: v.array(publicTechnologyValue),
        }),
      ),
      viewer: v.object({
        _id: v.id("users"),
        image: v.optional(v.string()),
        name: v.optional(v.string()),
        username: v.optional(v.string()),
      }),
    }),
  ),
  handler: async (ctx, { productId }) => {
    const user = await requireProductUser(ctx);
    const viewer = {
      _id: user._id,
      image: user.image,
      name: user.name,
      username: user.username,
    };

    if (productId === undefined) {
      return {
        product: null,
        viewer,
      };
    }

    const product = await ctx.db.get("products", productId);
    if (!product || !(await canEditProduct(ctx, product, user))) {
      return null;
    }

    const developer = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", product._id).eq("developerId", user._id),
      )
      .first();
    const media = await resolveProductMedia(ctx, product);

    return {
      product: {
        _id: product._id,
        content: product.content,
        githubUrl: product.githubUrl,
        isPublic: product.isPublic,
        logo: media.logo,
        logoStorageId: product.logoStorageId,
        name: product.name,
        productUrl: product.productUrl,
        projectType: product.projectType,
        roles: developer?.roles ?? [],
        screenshotAssets: media.screenshotAssets,
        screenshots: media.screenshots,
        slug: product.slug,
        tagline: product.tagline,
        teamSize: product.teamSize,
        technologies: await getProductTechnologies(ctx, product._id),
      },
      viewer,
    };
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    githubUrl: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    logo: v.optional(v.string()),
    name: v.string(),
    productUrl: v.optional(v.string()),
    projectType,
    screenshots: v.optional(v.array(v.string())),
    slug: v.optional(v.string()),
    tagline: v.string(),
    teamSize: v.optional(teamSize),
  },
  returns: v.object({
    productId: v.id("products"),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await requireProductUser(ctx);
    const input = normalizeProductInput(args);
    const requestedSlug = args.slug ?? input.name;
    const slug = normalizeProductSlug(requestedSlug);
    if (!slug) {
      throw new ConvexError({
        code: "INVALID_INPUT",
        message: "Product slug is required.",
      });
    }

    const existing = await ctx.db
      .query("products")
      .withIndex("by_author_slug", (q) =>
        q.eq("authorId", user._id).eq("slug", slug),
      )
      .first();
    if (existing) {
      throw new ConvexError({
        code: "SLUG_CONFLICT",
        message: "You already have a product with that slug.",
      });
    }

    const productId = await ctx.db.insert("products", {
      authorId: user._id,
      content: input.content,
      githubUrl: input.githubUrl,
      isPublic: args.isPublic ?? true,
      logo: input.logo,
      name: input.name,
      productUrl: input.productUrl,
      projectType: args.projectType,
      screenshots: input.screenshots,
      slug,
      tagline: input.tagline,
      teamSize: args.teamSize,
    });

    await ctx.db.insert("productDevelopers", {
      developerId: user._id,
      joinedAt: Date.now(),
      productId,
      roles: ["Creator"],
      status: "active",
    });

    return {
      productId,
      slug,
    };
  },
});

export const update = mutation({
  args: {
    content: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    isPublic: v.optional(v.boolean()),
    logo: v.optional(v.string()),
    name: v.optional(v.string()),
    productId: v.id("products"),
    productUrl: v.optional(v.string()),
    projectType: v.optional(projectType),
    screenshots: v.optional(v.array(v.string())),
    slug: v.optional(v.string()),
    tagline: v.optional(v.string()),
    teamSize: v.optional(v.union(teamSize, v.null())),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireProductUser(ctx);
    const product = await requireProductEditor(
      ctx,
      args.productId,
      user,
    );
    let nextSlug: string | undefined;
    if (args.slug !== undefined) {
      const normalizedSlug = normalizeProductSlug(args.slug);
      if (!normalizedSlug) {
        throw new ConvexError({
          code: "INVALID_INPUT",
          message: "Product slug is required.",
        });
      }
      nextSlug = normalizedSlug;
    }
    if (nextSlug !== undefined && nextSlug !== product.slug) {
      const existing = await ctx.db
        .query("products")
        .withIndex("by_author_slug", (q) =>
          q.eq("authorId", product.authorId).eq("slug", nextSlug),
        )
        .first();
      if (existing) {
        throw new ConvexError({
          code: "SLUG_CONFLICT",
          message: "That product slug is already used.",
        });
      }
    }

    await ctx.db.patch("products", args.productId, {
      ...(args.content === undefined
        ? {}
        : { content: normalizeContent(args.content) }),
      ...(args.githubUrl === undefined
        ? {}
        : { githubUrl: normalizeOptionalText(args.githubUrl) }),
      ...(args.isPublic === undefined ? {} : { isPublic: args.isPublic }),
      ...(args.logo === undefined ? {} : { logo: normalizeLogo(args.logo) }),
      ...(args.name === undefined ? {} : { name: normalizeName(args.name) }),
      ...(args.productUrl === undefined
        ? {}
        : { productUrl: normalizeOptionalText(args.productUrl) }),
      ...(args.projectType === undefined ? {} : { projectType: args.projectType }),
      ...(args.screenshots === undefined
        ? {}
        : { screenshots: normalizeScreenshots(args.screenshots) }),
      ...(nextSlug === undefined ? {} : { slug: nextSlug }),
      ...(args.tagline === undefined
        ? {}
        : { tagline: normalizeTagline(args.tagline) }),
      ...(args.teamSize === undefined
        ? {}
        : { teamSize: args.teamSize === null ? undefined : args.teamSize }),
    });
    return null;
  },
});

export const saveForm = mutation({
  args: {
    content: v.string(),
    draftKey: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    isPublic: v.boolean(),
    logoStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    name: v.string(),
    productId: v.optional(v.id("products")),
    productUrl: v.optional(v.string()),
    projectType,
    roles: v.array(v.string()),
    screenshotStorageIds: v.optional(v.array(v.id("_storage"))),
    tagline: v.string(),
    teamSize: v.optional(teamSize),
    technologyKeys: v.array(v.string()),
  },
  returns: v.object({
    productId: v.id("products"),
    slug: v.string(),
  }),
  handler: async (ctx, args) => {
    const user = await requireProductUser(ctx);
    return await saveProductForm(ctx, user, args);
  },
});

export const remove = mutation({
  args: {
    productId: v.id("products"),
  },
  returns: v.null(),
  handler: async (ctx, { productId }) => {
    const user = await requireProductUser(ctx);
    const product = await requireProductAuthorWithCode(
      ctx,
      productId,
      user._id,
    );

    const technologyRows = await ctx.db
      .query("productTechnologies")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    for (const row of technologyRows) {
      await ctx.db.delete("productTechnologies", row._id);
    }

    const developerRows = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    for (const row of developerRows) {
      await ctx.db.delete("productDevelopers", row._id);
    }

    await deleteProductMedia(ctx, product);
    await ctx.db.delete("products", productId);
    return null;
  },
});

async function requireProductUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (user === null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Authentication is required.",
    });
  }

  return user;
}

async function requireProductAuthorWithCode(
  ctx: MutationCtx,
  productId: Id<"products">,
  userId: Id<"users">,
) {
  const product = await ctx.db.get("products", productId);
  if (product === null) {
    throw new ConvexError({
      code: "PRODUCT_NOT_FOUND",
      message: "Product not found.",
    });
  }
  if (product.authorId !== userId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Only the product author can delete this product.",
    });
  }

  return product;
}

async function getProductByAuthorSlug(
  ctx: Parameters<typeof getUserByUsername>[0],
  username: string,
  slug: string,
) {
  const author = await getUserByUsername(ctx, username);
  if (!author) {
    return null;
  }

  return await ctx.db
    .query("products")
    .withIndex("by_author_slug", (q) =>
      q.eq("authorId", author._id).eq("slug", slug),
    )
    .first();
}

async function getProductTechnologies(
  ctx: Parameters<typeof getUserByUsername>[0],
  productId: Id<"products">,
): Promise<PublicTechnology[]> {
  const rows = await ctx.db
    .query("productTechnologies")
    .withIndex("by_product_order", (q) => q.eq("productId", productId))
    .take(MAX_PRODUCT_TECHNOLOGIES);

  return rows.flatMap((row) => {
    const technology = getTechnologyByKey(row.technologyKey);
    if (!technology) {
      return [];
    }

    return [
      {
        name: technology.name,
        order: row.order,
        technologyKey: row.technologyKey,
        categoryName: technology.categoryName,
      },
    ];
  });
}

async function getProductDevelopers(
  ctx: Parameters<typeof getUserByUsername>[0],
  productId: Id<"products">,
  includePrivate: boolean,
): Promise<PublicDeveloper[]> {
  const rows = await ctx.db
    .query("productDevelopers")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .take(MAX_PRODUCT_DEVELOPERS);
  const developers = [];

  for (const row of rows) {
    if (!includePrivate && row.status !== "active") {
      continue;
    }

    const developer = await ctx.db.get("users", row.developerId);
    if (!developer || (!includePrivate && developer.isPublic === false)) {
      continue;
    }

    developers.push({
      _id: row._id,
      company: developer.company,
      developerId: developer._id,
      image: developer.image,
      name: developer.name,
      roles: row.roles,
      status: row.status,
      username: developer.username,
    });
  }

  return developers;
}

function normalizeProductInput(args: {
  content: string;
  githubUrl?: string;
  logo?: string;
  name: string;
  productUrl?: string;
  screenshots?: string[];
  tagline: string;
}) {
  return {
    content: normalizeContent(args.content),
    githubUrl: normalizeOptionalText(args.githubUrl),
    logo: normalizeLogo(args.logo),
    name: normalizeName(args.name),
    productUrl: normalizeOptionalText(args.productUrl),
    screenshots: normalizeScreenshots(args.screenshots ?? []),
    tagline: normalizeTagline(args.tagline),
  };
}

function normalizeLogo(value: string | undefined) {
  const logo = normalizeOptionalText(value);
  if (logo !== undefined && logo.length > MAX_PRODUCT_IMAGE_DATA_URL_LENGTH) {
    throw new ConvexError({
      code: "FILE_TOO_LARGE",
      message: "Product logo is too large.",
    });
  }
  return logo;
}

function normalizeScreenshots(values: string[]) {
  return values.slice(0, MAX_PRODUCT_SCREENSHOTS).map((value) => {
    const screenshot = value.trim();
    if (screenshot.length > MAX_PRODUCT_SCREENSHOT_DATA_URL_LENGTH) {
      throw new ConvexError({
        code: "FILE_TOO_LARGE",
        message: "Product screenshot is too large.",
      });
    }
    return screenshot;
  }).filter((value) => value.length > 0);
}
