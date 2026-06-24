import { v } from "convex/values";

import { getTechnologyByKey } from "../data/tech-stack";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";
import {
  canEditProduct,
  canViewProduct,
  normalizeOptionalText,
  normalizeProductSlug,
  requireProductAuthor,
  requireProductEditor,
} from "./lib/products";
import { uniqueValidTechnologyKeys } from "./lib/technologyKeys";
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

const MAX_PRODUCT_NAME_LENGTH = 80;
const MAX_PRODUCT_TAGLINE_LENGTH = 140;
const MAX_PRODUCT_CONTENT_LENGTH = 4000;
const MAX_PRODUCT_IMAGE_DATA_URL_LENGTH = 900_000;
const MAX_PRODUCT_SCREENSHOTS = 8;
const MAX_PRODUCT_SCREENSHOT_DATA_URL_LENGTH = 900_000;
const MAX_LIST_PRODUCTS = 50;
const MAX_LIST_PUBLIC_PRODUCTS = 120;
const MAX_PRODUCT_TECHNOLOGIES = 40;
const MAX_PRODUCT_DEVELOPERS = 30;
const MAX_PRODUCT_ROLE_LENGTH = 48;
const MAX_PRODUCT_ROLES = 8;

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
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("products")
      .withIndex("by_slug")
      .take(MAX_LIST_PUBLIC_PRODUCTS);
    const products = [];

    for (const product of rows) {
      if (!product.isPublic) {
        continue;
      }

      const author = await ctx.db.get(product.authorId);
      if (!author || author.isPublic === false) {
        continue;
      }

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
        logo: product.logo,
        name: product.name,
        productUrl: product.productUrl,
        projectType: product.projectType,
        screenshots: product.screenshots,
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
  handler: async (ctx, { authorId, username }) => {
    const author =
      authorId === undefined
        ? username === undefined
          ? null
          : await getUserByUsername(ctx, username)
        : await ctx.db.get(authorId);
    if (!author) {
      return [];
    }

    const viewer = await getCurrentUser(ctx);
    const isOwner = viewer?._id === author._id;
    const rows = await ctx.db
      .query("products")
      .withIndex("by_author", (q) => q.eq("authorId", author._id))
      .take(MAX_LIST_PRODUCTS);
    const products = [];

    for (const product of rows) {
      if (!isOwner && !product.isPublic) {
        continue;
      }

      products.push({
        ...product,
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

    const author = await ctx.db.get(product.authorId);
    return {
      ...product,
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
      viewerCanEdit: viewer === null ? false : await canEditProduct(ctx, product, viewer),
    };
  },
});

export const getForEdit = query({
  args: {
    productId: v.optional(v.id("products")),
  },
  handler: async (ctx, { productId }) => {
    const user = await requireUser(ctx);
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

    const product = await ctx.db.get(productId);
    if (!product || !(await canEditProduct(ctx, product, user))) {
      return null;
    }

    const developer = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", product._id).eq("developerId", user._id),
      )
      .first();

    return {
      product: {
        _id: product._id,
        content: product.content,
        githubUrl: product.githubUrl,
        isPublic: product.isPublic,
        logo: product.logo,
        name: product.name,
        productUrl: product.productUrl,
        projectType: product.projectType,
        roles: developer?.roles ?? [],
        screenshots: product.screenshots,
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
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const input = normalizeProductInput(args);
    const requestedSlug = args.slug ?? input.name;
    const slug = normalizeProductSlug(requestedSlug);
    if (!slug) {
      throw new Error("Product slug is required.");
    }

    const existing = await ctx.db
      .query("products")
      .withIndex("by_author_slug", (q) =>
        q.eq("authorId", user._id).eq("slug", slug),
      )
      .first();
    if (existing) {
      throw new Error("You already have a product with that slug.");
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
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const product = await requireProductEditor(ctx, args.productId, user);
    let nextSlug: string | undefined;
    if (args.slug !== undefined) {
      const normalizedSlug = normalizeProductSlug(args.slug);
      if (!normalizedSlug) {
        throw new Error("Product slug is required.");
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
        throw new Error("That product slug is already used.");
      }
    }

    await ctx.db.patch(args.productId, {
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
  },
});

export const saveForm = mutation({
  args: {
    content: v.string(),
    githubUrl: v.optional(v.string()),
    isPublic: v.boolean(),
    logo: v.optional(v.string()),
    name: v.string(),
    productId: v.optional(v.id("products")),
    productUrl: v.optional(v.string()),
    projectType,
    roles: v.array(v.string()),
    screenshots: v.array(v.string()),
    tagline: v.string(),
    teamSize: v.optional(teamSize),
    technologyKeys: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const input = normalizeProductInput(args);
    const roles = normalizeProductRoles(args.roles);
    const technologyKeys = uniqueValidTechnologyKeys(args.technologyKeys).slice(
      0,
      MAX_PRODUCT_TECHNOLOGIES,
    );

    if (args.productId === undefined) {
      const slug = normalizeProductSlug(input.name);
      if (!slug) {
        throw new Error("Product slug is required.");
      }

      const existing = await ctx.db
        .query("products")
        .withIndex("by_author_slug", (q) =>
          q.eq("authorId", user._id).eq("slug", slug),
        )
        .first();
      if (existing) {
        throw new Error("You already have a product with that slug.");
      }

      const productId = await ctx.db.insert("products", {
        authorId: user._id,
        content: input.content,
        githubUrl: input.githubUrl,
        isPublic: args.isPublic,
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
        roles: roles.length > 0 ? roles : ["Creator"],
        status: "active",
      });
      await syncProductTechnologies(ctx, productId, technologyKeys);

      return {
        productId,
        slug,
      };
    }

    const product = await requireProductEditor(ctx, args.productId, user);
    await ctx.db.patch(product._id, {
      content: input.content,
      githubUrl: input.githubUrl,
      isPublic: args.isPublic,
      logo: input.logo,
      name: input.name,
      productUrl: input.productUrl,
      projectType: args.projectType,
      screenshots: input.screenshots,
      tagline: input.tagline,
      teamSize: args.teamSize,
    });

    const developer = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product_developer", (q) =>
        q.eq("productId", product._id).eq("developerId", user._id),
      )
      .first();
    if (developer) {
      await ctx.db.patch(developer._id, {
        roles: roles.length > 0 ? roles : developer.roles,
      });
    } else {
      await ctx.db.insert("productDevelopers", {
        developerId: user._id,
        joinedAt: Date.now(),
        productId: product._id,
        roles: roles.length > 0 ? roles : ["Contributor"],
        status: "active",
      });
    }

    await syncProductTechnologies(ctx, product._id, technologyKeys);

    return {
      productId: product._id,
      slug: product.slug,
    };
  },
});

export const remove = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, { productId }) => {
    const user = await requireUser(ctx);
    await requireProductAuthor(ctx, productId, user);

    const technologyRows = await ctx.db
      .query("productTechnologies")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    for (const row of technologyRows) {
      await ctx.db.delete(row._id);
    }

    const developerRows = await ctx.db
      .query("productDevelopers")
      .withIndex("by_product", (q) => q.eq("productId", productId))
      .collect();
    for (const row of developerRows) {
      await ctx.db.delete(row._id);
    }

    await ctx.db.delete(productId);
  },
});

export const deleteProduct = remove;

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

    const developer = await ctx.db.get(row.developerId);
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

function normalizeName(value: string) {
  const name = value.trim();
  if (!name) {
    throw new Error("Product name is required.");
  }
  if (name.length > MAX_PRODUCT_NAME_LENGTH) {
    throw new Error(`Product name must be ${MAX_PRODUCT_NAME_LENGTH} characters or fewer.`);
  }
  return name;
}

function normalizeTagline(value: string) {
  const tagline = value.trim();
  if (!tagline) {
    throw new Error("Product tagline is required.");
  }
  if (tagline.length > MAX_PRODUCT_TAGLINE_LENGTH) {
    throw new Error(
      `Product tagline must be ${MAX_PRODUCT_TAGLINE_LENGTH} characters or fewer.`,
    );
  }
  return tagline;
}

function normalizeContent(value: string) {
  const content = value.trim();
  if (content.length > MAX_PRODUCT_CONTENT_LENGTH) {
    throw new Error(
      `Product content must be ${MAX_PRODUCT_CONTENT_LENGTH} characters or fewer.`,
    );
  }
  return content;
}

function normalizeLogo(value: string | undefined) {
  const logo = normalizeOptionalText(value);
  if (logo !== undefined && logo.length > MAX_PRODUCT_IMAGE_DATA_URL_LENGTH) {
    throw new Error("Product logo is too large.");
  }
  return logo;
}

function normalizeScreenshots(values: string[]) {
  return values.slice(0, MAX_PRODUCT_SCREENSHOTS).map((value) => {
    const screenshot = value.trim();
    if (screenshot.length > MAX_PRODUCT_SCREENSHOT_DATA_URL_LENGTH) {
      throw new Error("Product screenshot is too large.");
    }
    return screenshot;
  }).filter((value) => value.length > 0);
}

function normalizeProductRoles(roles: string[]) {
  const uniqueRoles = [];
  const seen = new Set<string>();

  for (const role of roles) {
    const normalizedRole = role.trim();
    if (
      normalizedRole.length === 0 ||
      normalizedRole.length > MAX_PRODUCT_ROLE_LENGTH ||
      seen.has(normalizedRole)
    ) {
      continue;
    }

    seen.add(normalizedRole);
    uniqueRoles.push(normalizedRole);
  }

  return uniqueRoles.slice(0, MAX_PRODUCT_ROLES);
}

async function syncProductTechnologies(
  ctx: MutationCtx,
  productId: Id<"products">,
  technologyKeys: string[],
) {
  const rows = await ctx.db
    .query("productTechnologies")
    .withIndex("by_product", (q) => q.eq("productId", productId))
    .collect();
  const rowsByKey = new Map(rows.map((row) => [row.technologyKey, row]));
  const requestedKeys = new Set<string>(technologyKeys);

  let order = 1;
  for (const technologyKey of technologyKeys) {
    const current = rowsByKey.get(technologyKey);
    if (current) {
      await ctx.db.patch(current._id, { order });
    } else {
      await ctx.db.insert("productTechnologies", {
        order,
        productId,
        technologyKey,
      });
    }
    order += 1;
  }

  for (const row of rows) {
    if (!requestedKeys.has(row.technologyKey)) {
      await ctx.db.delete(row._id);
    }
  }
}
