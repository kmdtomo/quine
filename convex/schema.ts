import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

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

const developerStatus = v.union(
  v.literal("invited"),
  v.literal("active"),
  v.literal("declined"),
);

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    githubId: v.optional(v.number()),
    username: v.optional(v.string()),
    banner: v.optional(v.string()),
    bio: v.optional(v.string()),
    role: v.optional(v.string()),
    company: v.optional(v.string()),
    socialLinks: v.optional(
      v.array(
        v.object({
          platform: v.string(),
          url: v.string(),
        }),
      ),
    ),
    githubInstallationId: v.optional(v.number()),
    isPublic: v.boolean(),
  })
    .index("email", ["email"])
    .index("by_github_id", ["githubId"])
    .index("by_username", ["username"]),

  developerTechnologies: defineTable({
    developerId: v.id("users"),
    technologyKey: v.string(),
    years: v.optional(v.number()),
    order: v.number(),
  })
    .index("by_developer", ["developerId"])
    .index("by_developer_order", ["developerId", "order"])
    .index("by_developer_technology", ["developerId", "technologyKey"])
    .index("by_technology", ["technologyKey"]),

  connections: defineTable({
    fromDeveloperId: v.id("users"),
    toDeveloperId: v.id("users"),
  })
    .index("by_from", ["fromDeveloperId"])
    .index("by_to", ["toDeveloperId"])
    .index("by_pair", ["fromDeveloperId", "toDeveloperId"]),

  products: defineTable({
    authorId: v.id("users"),
    slug: v.string(),
    name: v.string(),
    tagline: v.string(),
    logo: v.optional(v.string()),
    projectType: projectType,
    teamSize: v.optional(teamSize),
    productUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    content: v.string(),
    screenshots: v.array(v.string()),
    isPublic: v.boolean(),
  })
    .index("by_author", ["authorId"])
    .index("by_author_slug", ["authorId", "slug"])
    .index("by_slug", ["slug"]),

  productDevelopers: defineTable({
    productId: v.id("products"),
    developerId: v.id("users"),
    roles: v.array(v.string()),
    status: developerStatus,
    invitedBy: v.optional(v.id("users")),
    joinedAt: v.optional(v.number()),
  })
    .index("by_product", ["productId"])
    .index("by_developer", ["developerId"])
    .index("by_product_developer", ["productId", "developerId"]),

  productTechnologies: defineTable({
    productId: v.id("products"),
    technologyKey: v.string(),
    order: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_product_order", ["productId", "order"])
    .index("by_product_technology", ["productId", "technologyKey"])
    .index("by_technology", ["technologyKey"]),
});
