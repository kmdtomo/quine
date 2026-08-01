"use node";

import type { Id } from "../../_generated/dataModel";
import { createMarkdownContentHash } from "../../application/productAi/markdownContentHash";

export { createMarkdownContentHash };

export type ProductAgentProductContext = {
  githubUrl?: string;
  name?: string;
  productUrl?: string;
  projectType?: string;
  roles: string[];
  tagline?: string;
  teamSize?: string;
  technologyKeys: string[];
};

export type ProductAgentSelectionContext = {
  end: number;
  start: number;
  text: string;
};

export type ProductAgentConversationMessage = {
  content: string;
  createdAt: number;
  role: "user" | "assistant";
};

export type ProductAgentRepoContext = {
  defaultBranch?: string;
  dependencySummary: string;
  description?: string;
  detectedTechnologyKeys: string[];
  filesRead: string[];
  githubUrl: string;
  primaryLanguage?: string;
  readmePath?: string;
  readmeText?: string;
  repositoryFullName: string;
};

export type ProductAgentAttachmentContext = {
  analysisText?: string;
  error?: string;
  kind: "image" | "audio" | "pdf" | "other";
  mimeType?: string;
  name?: string;
  status: "ready" | "error";
  storageId?: Id<"_storage">;
};

export type ProductIncomingAttachment = {
  dataUrl: string;
  mimeType: string;
  name: string;
  size: number;
  storageId: Id<"_storage">;
};

type FormatProductWritingInputArgs = {
  attachmentContexts: ProductAgentAttachmentContext[];
  conversationHistory: ProductAgentConversationMessage[];
  currentMarkdown: string;
  currentMarkdownHash: string;
  incomingAttachments: ProductIncomingAttachment[];
  productContext: ProductAgentProductContext;
  repoContext: ProductAgentRepoContext | null;
  selectionContext: ProductAgentSelectionContext | null;
  userMessage: string;
};

const MAX_CONTEXT_TEXT = 18000;
const MAX_REPO_SUMMARY_README = 900;
const MAX_HISTORY_MESSAGE = 1200;

export function formatProductWritingInput({
  attachmentContexts,
  conversationHistory,
  currentMarkdown,
  currentMarkdownHash,
  incomingAttachments,
  productContext,
  repoContext,
  selectionContext,
  userMessage,
}: FormatProductWritingInputArgs) {
  return [
    "# User request",
    userMessage,
    "",
    "# Product context",
    formatProductContext(productContext),
    "",
    "# Current Markdown",
    `baseContentHash: ${currentMarkdownHash}`,
    "```markdown",
    truncateForPrompt(currentMarkdown || "(empty)", MAX_CONTEXT_TEXT),
    "```",
    "",
    "# Selection context",
    formatSelectionContext(selectionContext),
    "",
    "# Repository context summary",
    formatRepoContextSummary(repoContext),
    "",
    "# Attachment context summary",
    formatAttachmentContextSummary(attachmentContexts),
    "",
    "# Attachments uploaded for this request",
    formatIncomingAttachments(incomingAttachments),
    "",
    "# Conversation history",
    formatConversationHistory(conversationHistory),
  ].join("\n");
}

function formatIncomingAttachments(
  incomingAttachments: ProductIncomingAttachment[],
) {
  if (incomingAttachments.length === 0) {
    return "No new attachments.";
  }
  return [
    ...incomingAttachments.map(
      (attachment) =>
        `- ${attachment.name} (${attachment.mimeType}, ${attachment.size} bytes)`,
    ),
    "Call read_attachment_context before making claims about these images.",
  ].join("\n");
}

export function formatRepoContextForTool(repoContext: ProductAgentRepoContext) {
  return {
    available: true,
    dependencySummary: repoContext.dependencySummary,
    detectedTechnologyKeys: repoContext.detectedTechnologyKeys,
    filesRead: repoContext.filesRead,
    githubUrl: repoContext.githubUrl,
    repositoryFullName: repoContext.repositoryFullName,
    ...(repoContext.defaultBranch === undefined
      ? {}
      : { defaultBranch: repoContext.defaultBranch }),
    ...(repoContext.description === undefined
      ? {}
      : { description: repoContext.description }),
    ...(repoContext.primaryLanguage === undefined
      ? {}
      : { primaryLanguage: repoContext.primaryLanguage }),
    ...(repoContext.readmePath === undefined
      ? {}
      : { readmePath: repoContext.readmePath }),
    ...(repoContext.readmeText === undefined
      ? {}
      : { readmeText: repoContext.readmeText }),
  };
}

function formatProductContext(productContext: ProductAgentProductContext) {
  const lines = [
    `name: ${productContext.name?.trim() || "(unset)"}`,
    `tagline: ${productContext.tagline?.trim() || "(unset)"}`,
    `projectType: ${productContext.projectType ?? "(unset)"}`,
    `teamSize: ${productContext.teamSize ?? "(unset)"}`,
    `roles: ${
      productContext.roles.length === 0 ? "(none)" : productContext.roles.join(", ")
    }`,
    `githubUrl: ${productContext.githubUrl?.trim() || "(unset)"}`,
    `productUrl: ${productContext.productUrl?.trim() || "(unset)"}`,
    `technologyKeys: ${
      productContext.technologyKeys.length === 0
        ? "(none)"
        : productContext.technologyKeys.join(", ")
    }`,
  ];

  return lines.join("\n");
}

function formatSelectionContext(selectionContext: ProductAgentSelectionContext | null) {
  if (!selectionContext || selectionContext.start === selectionContext.end) {
    return "No active selection.";
  }

  return [
    `start: ${selectionContext.start}`,
    `end: ${selectionContext.end}`,
    "```markdown",
    truncateForPrompt(selectionContext.text, 4000),
    "```",
  ].join("\n");
}

function formatRepoContextSummary(repoContext: ProductAgentRepoContext | null) {
  if (!repoContext) {
    return "No repository context is attached. If repository context would help, say what is missing instead of pretending to know it.";
  }

  const lines = [
    `repositoryFullName: ${repoContext.repositoryFullName}`,
    `githubUrl: ${repoContext.githubUrl}`,
    `dependencySummary:\n${repoContext.dependencySummary}`,
  ];
  if (repoContext.readmePath !== undefined) {
    lines.push(`readmePath: ${repoContext.readmePath}`);
  }
  if (repoContext.readmeText !== undefined) {
    lines.push(
      `readmeExcerpt:\n${truncateForPrompt(repoContext.readmeText, MAX_REPO_SUMMARY_README)}`,
    );
  }

  return lines.join("\n");
}

function formatAttachmentContextSummary(
  attachmentContexts: ProductAgentAttachmentContext[],
) {
  if (attachmentContexts.length === 0) {
    return "No analyzed attachments yet.";
  }

  return attachmentContexts
    .map((context, index) => {
      const label = context.name ?? `attachment ${index + 1}`;
      if (context.status === "error") {
        return `- ${label}: analysis failed (${context.error ?? "unknown error"})`;
      }
      return `- ${label}: ${context.analysisText ?? "(no analysis text)"}`;
    })
    .join("\n");
}

function formatConversationHistory(
  conversationHistory: ProductAgentConversationMessage[],
) {
  if (conversationHistory.length === 0) {
    return "No prior messages.";
  }

  return conversationHistory
    .map((message) => {
      const date = new Date(message.createdAt).toISOString();
      return `[${date}] ${message.role}: ${truncateForPrompt(
        message.content,
        MAX_HISTORY_MESSAGE,
      )}`;
    })
    .join("\n\n");
}

function truncateForPrompt(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }
  return `${value.slice(0, limit)}\n\n[Trimmed for prompt]`;
}
