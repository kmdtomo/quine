import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

import {
  uploadIntentConsumptionTarget,
  uploadIntentPurpose,
  uploadIntentStatus,
} from "./lib/uploadIntents";

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

const githubAnalysisLogLevel = v.union(
  v.literal("info"),
  v.literal("warn"),
  v.literal("error"),
);

const githubInstallationAccountType = v.union(
  v.literal("User"),
  v.literal("Organization"),
);

const githubInstallationStatus = v.union(
  v.literal("pending"),
  v.literal("active"),
  v.literal("revoked"),
);

const githubRepositorySelection = v.union(
  v.literal("all"),
  v.literal("selected"),
);

const externalRunStatus = v.union(
  v.literal("queued"),
  v.literal("running"),
  v.literal("succeeded"),
  v.literal("failed"),
);

const githubAnalysisRunKind = v.union(
  v.literal("technology_analysis"),
  v.literal("product_repository_import"),
);

const githubAnalysisRunPhase = v.union(
  v.literal("queued"),
  v.literal("authorizing"),
  v.literal("loading_repositories"),
  v.literal("analyzing_repositories"),
  v.literal("persisting_results"),
  v.literal("completed"),
);

const githubDetectedTechnologyResult = v.object({
  technologyKey: v.string(),
  confidence: v.number(),
  score: v.number(),
});

const productAiMessageRole = v.union(
  v.literal("user"),
  v.literal("assistant"),
);

const productAiProposalStatus = v.union(
  v.literal("pending"),
  v.literal("applied"),
  v.literal("discarded"),
);

const productAiMarkdownEditKind = v.union(
  v.literal("replace_all"),
  v.literal("replace_selection"),
  v.literal("insert"),
  v.literal("patch"),
  v.literal("outline"),
  v.literal("comment_only"),
);

const productAiProposalKind = v.union(
  v.literal("replace_all"),
  v.literal("replace_selection"),
  v.literal("insert"),
  v.literal("patch"),
  v.literal("outline"),
  v.literal("comment_only"),
  v.literal("form_update"),
);

const productAiInsertPosition = v.union(
  v.literal("start"),
  v.literal("end"),
  v.literal("before_selection"),
  v.literal("after_selection"),
  v.literal("after_heading"),
);

const productAiAttachmentKind = v.union(
  v.literal("image"),
  v.literal("audio"),
  v.literal("pdf"),
  v.literal("other"),
);

const productAiAttachmentStatus = v.union(
  v.literal("ready"),
  v.literal("error"),
);

const productAiRunPhase = v.union(
  v.literal("queued"),
  v.literal("loading_context"),
  v.literal("running_agent"),
  v.literal("persisting_results"),
  v.literal("completed"),
);

const productAiRunProductContext = v.object({
  githubUrl: v.optional(v.string()),
  name: v.optional(v.string()),
  productUrl: v.optional(v.string()),
  projectType: v.optional(projectType),
  roles: v.array(v.string()),
  tagline: v.optional(v.string()),
  teamSize: v.optional(teamSize),
  technologyKeys: v.array(v.string()),
});

const productAiRunSelectionContext = v.object({
  end: v.number(),
  start: v.number(),
  text: v.string(),
});

const productAiRunAttachment = v.object({
  storageId: v.id("_storage"),
  mimeType: v.string(),
  name: v.string(),
  size: v.number(),
});

const productAssetKind = v.literal("screenshot");

const productAiMarkdownEdit = v.object({
  kind: productAiMarkdownEditKind,
  markdown: v.optional(v.string()),
  start: v.optional(v.number()),
  end: v.optional(v.number()),
  targetHeading: v.optional(v.string()),
  insertPosition: v.optional(productAiInsertPosition),
});

const productAiFormField = v.union(
  v.literal("name"),
  v.literal("tagline"),
  v.literal("projectType"),
  v.literal("teamSize"),
  v.literal("productUrl"),
  v.literal("githubUrl"),
  v.literal("roles"),
);

const productAiFormEdit = v.object({
  field: productAiFormField,
  label: v.optional(v.string()),
  value: v.union(v.string(), v.array(v.string())),
});

export default defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    profileImageStorageId: v.optional(v.id("_storage")),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),

    githubId: v.optional(v.number()),
    username: v.optional(v.string()),
    githubName: v.optional(v.string()),
    githubBio: v.optional(v.string()),
    githubCompany: v.optional(v.string()),
    banner: v.optional(v.string()),
    bannerStorageId: v.optional(v.id("_storage")),
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
    techStackOnboardingCompletedAt: v.optional(v.number()),
    profileOnboardingCompletedAt: v.optional(v.number()),
    isPublic: v.optional(v.boolean()),
  })
    .index("email", ["email"])
    .index("by_github_id", ["githubId"])
    .index("by_username", ["username"])
    .index("by_public_username", ["isPublic", "username"]),

  uploadIntents: defineTable({
    userId: v.id("users"),
    purpose: uploadIntentPurpose,
    status: uploadIntentStatus,
    storageId: v.optional(v.id("_storage")),
    expiresAt: v.number(),
    uploadedAt: v.optional(v.number()),
    consumedAt: v.optional(v.number()),
    consumptionTarget: v.optional(uploadIntentConsumptionTarget),
  })
    .index("by_storage", ["storageId"])
    .index("by_user_status_expiry", ["userId", "status", "expiresAt"])
    .index("by_status_expiry", ["status", "expiresAt"]),

  githubInstallations: defineTable({
    userId: v.id("users"),
    installationId: v.number(),
    status: githubInstallationStatus,
    verificationStateHash: v.string(),
    verificationExpiresAt: v.number(),
    accountId: v.optional(v.number()),
    accountLogin: v.optional(v.string()),
    accountType: v.optional(githubInstallationAccountType),
    repositorySelection: v.optional(githubRepositorySelection),
    verifiedByGithubId: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_installation_id", ["installationId"])
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_account", ["userId", "accountId"])
    .index("by_verification_state_hash", ["verificationStateHash"]),

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
    creationKey: v.optional(v.string()),
    slug: v.string(),
    name: v.string(),
    tagline: v.string(),
    logo: v.optional(v.string()),
    logoStorageId: v.optional(v.id("_storage")),
    projectType: projectType,
    teamSize: v.optional(teamSize),
    productUrl: v.optional(v.string()),
    githubUrl: v.optional(v.string()),
    content: v.string(),
    screenshots: v.array(v.string()),
    isPublic: v.boolean(),
  })
    .index("by_author", ["authorId"])
    .index("by_author_creation_key", ["authorId", "creationKey"])
    .index("by_author_public", ["authorId", "isPublic", "slug"])
    .index("by_author_slug", ["authorId", "slug"])
    .index("by_public", ["isPublic", "slug"])
    .index("by_slug", ["slug"]),

  productAssets: defineTable({
    productId: v.id("products"),
    createdBy: v.id("users"),
    kind: productAssetKind,
    storageId: v.id("_storage"),
    mimeType: v.optional(v.string()),
    name: v.optional(v.string()),
    order: v.number(),
    createdAt: v.number(),
  })
    .index("by_product_kind_order", ["productId", "kind", "order"])
    .index("by_storage", ["storageId"]),

  productDevelopers: defineTable({
    productId: v.id("products"),
    developerId: v.id("users"),
    roles: v.array(v.string()),
    status: developerStatus,
    invitedBy: v.optional(v.id("users")),
    joinedAt: v.optional(v.number()),
  })
    .index("by_product", ["productId"])
    .index("by_product_status", ["productId", "status"])
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

  githubAnalysisLogs: defineTable({
    runId: v.string(),
    analysisRunId: v.optional(v.id("githubAnalysisRuns")),
    userId: v.id("users"),
    createdAt: v.number(),
    level: githubAnalysisLogLevel,
    message: v.string(),
    repository: v.optional(v.string()),
  })
    .index("by_user_run", ["userId", "runId"])
    .index("by_analysis_run_created", ["analysisRunId", "createdAt"])
    .index("by_run", ["runId"]),

  githubAnalysisRuns: defineTable({
    userId: v.id("users"),
    githubInstallationId: v.id("githubInstallations"),
    kind: githubAnalysisRunKind,
    status: externalRunStatus,
    phase: githubAnalysisRunPhase,
    attempt: v.number(),
    maxAttempts: v.number(),
    idempotencyKey: v.string(),
    repositoryFullName: v.optional(v.string()),
    productId: v.optional(v.id("products")),
    draftKey: v.optional(v.string()),
    scheduledFunctionId: v.optional(v.id("_scheduled_functions")),
    repositoryCount: v.number(),
    analyzedRepositoryCount: v.number(),
    requestCount: v.number(),
    requestLimit: v.number(),
    detectedTechnologies: v.array(githubDetectedTechnologyResult),
    warningCodes: v.array(v.string()),
    importedRepoContextId: v.optional(v.id("productRepoContexts")),
    errorCode: v.optional(v.string()),
    nextRetryAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_user_idempotency", ["userId", "idempotencyKey"])
    .index("by_installation_created", ["githubInstallationId", "createdAt"])
    .index("by_installation_status", ["githubInstallationId", "status"])
    .index("by_product_status", ["productId", "status"])
    .index("by_user_draft_status", ["userId", "draftKey", "status"]),

  githubAnalysisRunRepositories: defineTable({
    runId: v.id("githubAnalysisRuns"),
    repositoryFullName: v.string(),
    repositoryName: v.string(),
    htmlUrl: v.string(),
    description: v.optional(v.string()),
    private: v.boolean(),
    fork: v.boolean(),
    stargazersCount: v.number(),
    githubUpdatedAt: v.optional(v.string()),
    languages: v.array(v.string()),
    filesRead: v.array(v.string()),
    detectedTechnologyKeys: v.array(v.string()),
    warningCodes: v.array(v.string()),
    createdAt: v.number(),
  })
    .index("by_run", ["runId"])
    .index("by_run_repository", ["runId", "repositoryFullName"]),

  productRepoContexts: defineTable({
    userId: v.id("users"),
    productId: v.optional(v.id("products")),
    draftKey: v.optional(v.string()),
    repositoryFullName: v.string(),
    githubUrl: v.string(),
    description: v.optional(v.string()),
    defaultBranch: v.optional(v.string()),
    primaryLanguage: v.optional(v.string()),
    readmePath: v.optional(v.string()),
    readmeText: v.optional(v.string()),
    dependencySummary: v.string(),
    filesRead: v.array(v.string()),
    detectedTechnologyKeys: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_draft", ["userId", "draftKey"])
    .index("by_user_draft_updated", ["userId", "draftKey", "updatedAt"])
    .index("by_user_draft_repository", [
      "userId",
      "draftKey",
      "repositoryFullName",
    ])
    .index("by_product", ["productId"])
    .index("by_product_user_updated", ["productId", "userId", "updatedAt"])
    .index("by_product_repository", ["productId", "repositoryFullName"])
    .index("by_user_repository", ["userId", "repositoryFullName"]),

  productAiThreads: defineTable({
    userId: v.id("users"),
    productId: v.optional(v.id("products")),
    draftKey: v.optional(v.string()),
    repoContextId: v.optional(v.id("productRepoContexts")),
    conversationSummary: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_draft", ["userId", "draftKey"])
    .index("by_user_product", ["userId", "productId"])
    .index("by_product", ["productId"]),

  productAiRuns: defineTable({
    userId: v.id("users"),
    threadId: v.id("productAiThreads"),
    userMessageId: v.id("productAiMessages"),
    productId: v.optional(v.id("products")),
    draftKey: v.optional(v.string()),
    status: externalRunStatus,
    phase: productAiRunPhase,
    attempt: v.number(),
    maxAttempts: v.number(),
    idempotencyKey: v.string(),
    currentMarkdown: v.string(),
    currentMarkdownHash: v.string(),
    productContext: productAiRunProductContext,
    selectionContext: v.optional(productAiRunSelectionContext),
    attachments: v.array(productAiRunAttachment),
    scheduledFunctionId: v.optional(v.id("_scheduled_functions")),
    assistantMessageId: v.optional(v.id("productAiMessages")),
    proposalIds: v.array(v.id("productAiProposals")),
    baseContentHash: v.optional(v.string()),
    stopReason: v.optional(v.string()),
    errorCode: v.optional(v.string()),
    nextRetryAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_user_idempotency", ["userId", "idempotencyKey"])
    .index("by_thread_created", ["threadId", "createdAt"])
    .index("by_thread_status", ["threadId", "status"])
    .index("by_product_status", ["productId", "status"])
    .index("by_user_draft_status", ["userId", "draftKey", "status"]),

  productAiMessages: defineTable({
    threadId: v.id("productAiThreads"),
    userId: v.id("users"),
    role: productAiMessageRole,
    content: v.string(),
    createdAt: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_thread_created", ["threadId", "createdAt"]),

  productAiProposals: defineTable({
    threadId: v.id("productAiThreads"),
    userId: v.id("users"),
    assistantMessageId: v.optional(v.id("productAiMessages")),
    status: productAiProposalStatus,
    kind: productAiProposalKind,
    title: v.string(),
    summary: v.string(),
    baseContentHash: v.string(),
    edits: v.array(productAiMarkdownEdit),
    formEdits: v.optional(v.array(productAiFormEdit)),
    createdAt: v.number(),
    updatedAt: v.number(),
    appliedAt: v.optional(v.number()),
    discardedAt: v.optional(v.number()),
  })
    .index("by_thread", ["threadId"])
    .index("by_thread_created", ["threadId", "createdAt"])
    .index("by_thread_status", ["threadId", "status"]),

  productAiAttachmentContexts: defineTable({
    threadId: v.id("productAiThreads"),
    userId: v.id("users"),
    storageId: v.optional(v.id("_storage")),
    kind: productAiAttachmentKind,
    name: v.optional(v.string()),
    mimeType: v.optional(v.string()),
    status: productAiAttachmentStatus,
    analysisText: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_thread_created", ["threadId", "createdAt"]),
});
