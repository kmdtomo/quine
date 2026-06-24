import { v } from "convex/values";

import { getTechnologyByKey } from "../data/tech-stack";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";
import { normalizeUsername } from "./lib/username";

const MAX_PROFILE_TECHNOLOGIES = 60;
const MAX_PROFILE_PRODUCTS = 6;
const MAX_PROFILE_CONNECTIONS = 12;
const MAX_PRODUCT_TECHNOLOGIES = 6;
const MAX_CONNECTION_TECHNOLOGIES = 6;
const MAX_BIO_LENGTH = 120;
const MAX_PROFILE_SOCIAL_LINKS = 4;
const MAX_PROFILE_IMAGE_DATA_URL_LENGTH = 900_000;

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
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    return {
      _id: user._id,
      name: user.name,
      username: normalizeUsername(user.username),
      image: user.image,
      techStackOnboardingCompletedAt: user.techStackOnboardingCompletedAt,
      profileOnboardingCompletedAt: user.profileOnboardingCompletedAt,
    };
  },
});

export const getGithubInstallationForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    return {
      githubInstallationId: user.githubInstallationId,
    };
  },
});

export const setGithubInstallationId = mutation({
  args: {
    installationId: v.number(),
  },
  handler: async (ctx, { installationId }) => {
    const user = await requireUser(ctx);
    if (!Number.isInteger(installationId) || installationId <= 0) {
      throw new Error("Invalid GitHub installation id.");
    }

    if (user.githubInstallationId !== installationId) {
      await ctx.db.patch(user._id, {
        githubInstallationId: installationId,
      });
    }

    return installationId;
  },
});

export const getProfile = query({
  args: {
    username: v.string(),
  },
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
    const productRows = await ctx.db
      .query("products")
      .withIndex("by_author", (q) => q.eq("authorId", user._id))
      .take(MAX_PROFILE_PRODUCTS);
    const visibleProductRows = productRows.filter(
      (product) => isOwner || product.isPublic,
    );
    const products: PublicProduct[] = [];
    for (const product of visibleProductRows) {
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
        logo: product.logo,
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
      const connectedUser = await ctx.db.get(connection.toDeveloperId);
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

      connections.push({
        _id: connection._id,
        company: connectedUser.company,
        image: connectedUser.image,
        name: connectedUser.name,
        role: connectedUser.role,
        technologies: connectionTechnologies,
        username: normalizeUsername(connectedUser.username),
      });
    }

    return {
      connectionLimit: MAX_PROFILE_CONNECTIONS,
      connections,
      isOwner,
      needsProfileOnboarding:
        isOwner && user.profileOnboardingCompletedAt === undefined,
      products,
      user: {
        _id: user._id,
        banner: user.banner,
        bio: user.bio,
        company: user.company,
        image: user.image,
        isPublic: user.isPublic ?? true,
        name: user.name,
        role: user.role,
        socialLinks: user.socialLinks ?? [],
        username: normalizeUsername(user.username),
      },
      technologies,
    };
  },
});

export const completeTechStackOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    if (user.techStackOnboardingCompletedAt !== undefined) {
      return user.techStackOnboardingCompletedAt;
    }

    const completedAt = Date.now();
    await ctx.db.patch(user._id, {
      techStackOnboardingCompletedAt: completedAt,
    });
    return completedAt;
  },
});

export const completeProfileOnboarding = mutation({
  args: {
    bio: v.string(),
    banner: v.optional(v.string()),
    company: v.string(),
    image: v.optional(v.string()),
    name: v.string(),
    role: v.string(),
    socialLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
        }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const name = args.name.trim();
    const role = args.role.trim();
    const company = args.company.trim();
    const bio = args.bio.trim();
    const banner = normalizeProfileImage(args.banner, "Banner");
    const image = normalizeProfileImage(args.image, "Profile photo");
    const socialLinks = args.socialLinks
      ?.map((link) => ({
        platform: link.platform.trim() || "website",
        url: link.url.trim(),
      }))
      .filter((link) => link.url.length > 0)
      .slice(0, MAX_PROFILE_SOCIAL_LINKS);

    if (!name) {
      throw new Error("Display name is required.");
    }
    if (!role) {
      throw new Error("Role is required.");
    }
    if (!company) {
      throw new Error("Company is required.");
    }
    if (bio.length > MAX_BIO_LENGTH) {
      throw new Error(`Bio must be ${MAX_BIO_LENGTH} characters or fewer.`);
    }

    await ctx.db.patch(user._id, {
      bio: bio.length > 0 ? bio : undefined,
      company,
      name,
      profileOnboardingCompletedAt:
        user.profileOnboardingCompletedAt ?? Date.now(),
      role,
      isPublic: true,
      ...(banner === undefined ? {} : { banner }),
      ...(image === undefined ? {} : { image }),
      ...(socialLinks === undefined ? {} : { socialLinks }),
    });
  },
});

function normalizeProfileImage(value: string | undefined, label: string) {
  if (value === undefined) {
    return undefined;
  }

  const image = value.trim();
  if (image.length === 0) {
    return undefined;
  }
  if (image.length > MAX_PROFILE_IMAGE_DATA_URL_LENGTH) {
    throw new Error(`${label} image is too large.`);
  }

  return image;
}
