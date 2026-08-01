import { v } from "convex/values";

import { getTechnologyByKey } from "../data/tech-stack";
import type { Doc, Id } from "./_generated/dataModel";
import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  completeProfileOnboarding as completeProfileOnboardingUseCase,
} from "./application/profile/completeProfileOnboarding";
import { getSafeStoredSocialLinks } from "./application/profile/socialLinks";
import { getCurrentUser, requireUser } from "./lib/auth";
import { resolveProductLogo } from "./lib/productAssets";
import { normalizeUsername } from "./lib/username";

const MAX_PROFILE_TECHNOLOGIES = 60;
const MAX_PROFILE_PRODUCTS = 6;
const MAX_PROFILE_CONNECTIONS = 12;
const MAX_PRODUCT_TECHNOLOGIES = 6;
const MAX_CONNECTION_TECHNOLOGIES = 6;
const MAX_PUBLIC_USERS = 60;
const MAX_PUBLIC_USER_TECHNOLOGIES = 60;

const socialLinkValidator = v.object({
  platform: v.string(),
  url: v.string(),
});

const getMeValidator = v.union(
  v.null(),
  v.object({
    _id: v.id("users"),
    image: v.optional(v.string()),
    name: v.optional(v.string()),
    profileOnboardingCompletedAt: v.optional(v.number()),
    techStackOnboardingCompletedAt: v.optional(v.number()),
    username: v.optional(v.string()),
  }),
);

const publicUserTechnologyValidator = v.object({
  name: v.string(),
  technologyKey: v.string(),
});

const publicUserListItemValidator = v.object({
  _id: v.id("users"),
  banner: v.optional(v.string()),
  bio: v.optional(v.string()),
  company: v.optional(v.string()),
  image: v.optional(v.string()),
  name: v.optional(v.string()),
  role: v.optional(v.string()),
  technologies: v.array(publicUserTechnologyValidator),
  username: v.string(),
});

const publicUserListValidator = v.object({
  isTruncated: v.boolean(),
  users: v.array(publicUserListItemValidator),
});

const profileTechnologyValidator = v.object({
  _id: v.id("developerTechnologies"),
  categoryName: v.string(),
  name: v.string(),
  order: v.number(),
  technologyKey: v.string(),
  years: v.optional(v.number()),
});

const profileProductValidator = v.object({
  _id: v.id("products"),
  content: v.string(),
  isPublic: v.boolean(),
  logo: v.optional(v.string()),
  name: v.string(),
  projectType: v.union(
    v.literal("personal"),
    v.literal("work"),
    v.literal("open_source"),
  ),
  slug: v.string(),
  tagline: v.string(),
  technologies: v.array(publicUserTechnologyValidator),
});

const profileConnectionValidator = v.object({
  _id: v.id("connections"),
  company: v.optional(v.string()),
  image: v.optional(v.string()),
  name: v.optional(v.string()),
  role: v.optional(v.string()),
  technologies: v.array(publicUserTechnologyValidator),
  username: v.optional(v.string()),
});

const profileValidator = v.union(
  v.null(),
  v.object({
    connectionLimit: v.number(),
    connections: v.array(profileConnectionValidator),
    isOwner: v.boolean(),
    needsProfileOnboarding: v.boolean(),
    products: v.array(profileProductValidator),
    technologies: v.array(profileTechnologyValidator),
    user: v.object({
      _id: v.id("users"),
      banner: v.optional(v.string()),
      bio: v.optional(v.string()),
      company: v.optional(v.string()),
      image: v.optional(v.string()),
      isPublic: v.boolean(),
      name: v.optional(v.string()),
      role: v.optional(v.string()),
      socialLinks: v.array(socialLinkValidator),
      username: v.optional(v.string()),
    }),
  }),
);

type PublicTechnology = {
  name: string;
  technologyKey: string;
};

type PublicProduct = {
  _id: Id<"products">;
  content: string;
  isPublic: boolean;
  logo: string | undefined;
  name: string;
  projectType: "personal" | "work" | "open_source";
  slug: string;
  tagline: string;
  technologies: PublicTechnology[];
};

type PublicConnection = {
  _id: Id<"connections">;
  company: string | undefined;
  image: string | undefined;
  name: string | undefined;
  role: string | undefined;
  technologies: PublicTechnology[];
  username: string | undefined;
};

export const getMe = query({
  args: {},
  returns: getMeValidator,
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }
    const media = await resolveProfileMedia(ctx, user);

    return {
      _id: user._id,
      name: user.name,
      username: normalizeUsername(user.username),
      image: media.image,
      techStackOnboardingCompletedAt: user.techStackOnboardingCompletedAt,
      profileOnboardingCompletedAt: user.profileOnboardingCompletedAt,
    };
  },
});

export const listPublic = query({
  args: {},
  returns: publicUserListValidator,
  handler: async (ctx) => {
    const rangeLimit = MAX_PUBLIC_USERS + 1;
    const [explicitPublicRows, legacyPublicRows] = await Promise.all([
      ctx.db
        .query("users")
        .withIndex("by_public_username", (q) =>
          q.eq("isPublic", true).gt("username", ""),
        )
        .take(rangeLimit),
      ctx.db
        .query("users")
        .withIndex("by_public_username", (q) =>
          q.eq("isPublic", undefined).gt("username", ""),
        )
        .take(rangeLimit),
    ]);

    const candidates = [...explicitPublicRows, ...legacyPublicRows]
      .flatMap((user) => {
        const username = normalizeUsername(user.username);
        return username === undefined ? [] : [{ user, username }];
      })
      .sort((left, right) => left.username.localeCompare(right.username));
    const isTruncated =
      explicitPublicRows.length > MAX_PUBLIC_USERS ||
      legacyPublicRows.length > MAX_PUBLIC_USERS ||
      explicitPublicRows.length + legacyPublicRows.length > MAX_PUBLIC_USERS;
    const users = [];

    for (const { user, username } of candidates.slice(0, MAX_PUBLIC_USERS)) {
      const media = await resolveProfileMedia(ctx, user);
      const technologyRows = await ctx.db
        .query("developerTechnologies")
        .withIndex("by_developer_order", (q) =>
          q.eq("developerId", user._id),
        )
        .take(MAX_PUBLIC_USER_TECHNOLOGIES);
      const technologies = technologyRows.flatMap((row) => {
        const technology = getTechnologyByKey(row.technologyKey);
        return !technology
          ? []
          : [
              {
                name: technology.name,
                technologyKey: technology.key,
              },
            ];
      });

      users.push({
        _id: user._id,
        banner: media.banner,
        bio: user.bio,
        company: user.company,
        image: media.image,
        name: user.name,
        role: user.role,
        technologies,
        username,
      });
    }

    return {
      isTruncated,
      users,
    };
  },
});

export const getProfile = query({
  args: {
    username: v.string(),
  },
  returns: profileValidator,
  handler: async (ctx, { username }) => {
    const normalizedUsername = normalizeUsername(username);
    if (normalizedUsername === undefined) {
      return null;
    }

    const normalizedUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", normalizedUsername))
      .first();
    const user =
      normalizedUser ??
      (await ctx.db
        .query("users")
        .withIndex("by_username", (q) => q.eq("username", `@${normalizedUsername}`))
        .first());
    if (!user) {
      return null;
    }

    const viewer = await getCurrentUser(ctx);
    const isOwner = viewer?._id === user._id;
    if (user.isPublic === false && !isOwner) {
      return null;
    }

    const rows = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer_order", (q) => q.eq("developerId", user._id))
      .take(MAX_PROFILE_TECHNOLOGIES);
    const technologies = rows.flatMap((row) => {
      const technology = getTechnologyByKey(row.technologyKey);
      if (!technology) {
        return [];
      }

      return [
        {
          _id: row._id,
          categoryName: technology.categoryName,
          name: technology.name,
          order: row.order,
          technologyKey: row.technologyKey,
          ...(row.years === undefined ? {} : { years: row.years }),
        },
      ];
    });
    const productRows = isOwner
      ? await ctx.db
          .query("products")
          .withIndex("by_author", (q) => q.eq("authorId", user._id))
          .take(MAX_PROFILE_PRODUCTS)
      : await ctx.db
          .query("products")
          .withIndex("by_author_public", (q) =>
            q.eq("authorId", user._id).eq("isPublic", true),
          )
          .take(MAX_PROFILE_PRODUCTS);
    const products: PublicProduct[] = [];
    for (const product of productRows) {
      const technologyRows = await ctx.db
        .query("productTechnologies")
        .withIndex("by_product_order", (q) => q.eq("productId", product._id))
        .take(MAX_PRODUCT_TECHNOLOGIES);
      const productTechnologies = technologyRows.flatMap((row) => {
        const technology = getTechnologyByKey(row.technologyKey);
        if (!technology) {
          return [];
        }

        return [
          {
            name: technology.name,
            technologyKey: row.technologyKey,
          },
        ];
      });

      products.push({
        _id: product._id,
        content: product.content,
        isPublic: product.isPublic,
        logo: (await resolveProductLogo(ctx, product)) ?? undefined,
        name: product.name,
        projectType: product.projectType,
        slug: product.slug,
        tagline: product.tagline,
        technologies: productTechnologies,
      });
    }

    const connectionRows = await ctx.db
      .query("connections")
      .withIndex("by_from", (q) => q.eq("fromDeveloperId", user._id))
      .take(MAX_PROFILE_CONNECTIONS);
    const connections: PublicConnection[] = [];
    for (const connection of connectionRows) {
      const connectedUser = await ctx.db.get(
        "users",
        connection.toDeveloperId,
      );
      if (!connectedUser || connectedUser.isPublic === false) {
        continue;
      }

      const connectionTechnologyRows = await ctx.db
        .query("developerTechnologies")
        .withIndex("by_developer_order", (q) =>
          q.eq("developerId", connectedUser._id),
        )
        .take(MAX_CONNECTION_TECHNOLOGIES);
      const connectionTechnologies = connectionTechnologyRows.flatMap((row) => {
        const technology = getTechnologyByKey(row.technologyKey);
        if (!technology) {
          return [];
        }

        return [
          {
            name: technology.name,
            technologyKey: row.technologyKey,
          },
        ];
      });

      const connectedUserMedia = await resolveProfileMedia(
        ctx,
        connectedUser,
      );
      connections.push({
        _id: connection._id,
        company: connectedUser.company,
        image: connectedUserMedia.image,
        name: connectedUser.name,
        role: connectedUser.role,
        technologies: connectionTechnologies,
        username: normalizeUsername(connectedUser.username),
      });
    }

    const userMedia = await resolveProfileMedia(ctx, user);
    return {
      connectionLimit: MAX_PROFILE_CONNECTIONS,
      connections,
      isOwner,
      needsProfileOnboarding:
        isOwner && user.profileOnboardingCompletedAt === undefined,
      products,
      user: {
        _id: user._id,
        banner: userMedia.banner,
        bio: user.bio,
        company: user.company,
        image: userMedia.image,
        isPublic: user.isPublic ?? true,
        name: user.name,
        role: user.role,
        socialLinks: getSafeStoredSocialLinks(user.socialLinks ?? []),
        username: normalizeUsername(user.username),
      },
      technologies,
    };
  },
});

export const completeTechStackOnboarding = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (user.techStackOnboardingCompletedAt !== undefined) {
      return user.techStackOnboardingCompletedAt;
    }

    const completedAt = Date.now();
    await ctx.db.patch("users", user._id, {
      techStackOnboardingCompletedAt: completedAt,
    });
    return completedAt;
  },
});

export const completeProfileOnboarding = mutation({
  args: {
    banner: v.optional(v.union(v.string(), v.null())),
    bannerStorageId: v.optional(
      v.union(v.id("_storage"), v.null()),
    ),
    bio: v.string(),
    company: v.string(),
    name: v.string(),
    profileImageStorageId: v.optional(
      v.union(v.id("_storage"), v.null()),
    ),
    role: v.string(),
    socialLinks: v.optional(v.array(socialLinkValidator)),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await completeProfileOnboardingUseCase(ctx, args, user);
  },
});

type ProfileMediaCtx = MutationCtx | QueryCtx;

async function resolveProfileMedia(
  ctx: ProfileMediaCtx,
  user: Doc<"users">,
) {
  const [bannerUrl, profileImageUrl] = await Promise.all([
    user.bannerStorageId === undefined
      ? null
      : ctx.storage.getUrl(user.bannerStorageId),
    user.profileImageStorageId === undefined
      ? null
      : ctx.storage.getUrl(user.profileImageStorageId),
  ]);

  return {
    banner: bannerUrl ?? user.banner,
    image: profileImageUrl ?? user.image,
  };
}
