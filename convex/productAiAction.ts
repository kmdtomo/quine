"use node";

import { v } from "convex/values";

import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import type {
  ProductAgentAttachmentContext,
  ProductAgentConversationMessage,
  ProductAgentProductContext,
  ProductAgentRepoContext,
  ProductAgentSelectionContext,
  ProductIncomingAttachment,
} from "./lib/productAi/context";
import { runProductWritingAgent } from "./lib/productAi/productWritingAgent";

const MAX_ASSISTANT_TEXT_LENGTH = 30000;
const MAX_STOP_REASON_LENGTH = 160;

export const run = internalAction({
  args: {
    runId: v.id("productAiRuns"),
  },
  returns: v.null(),
  handler: async (ctx, { runId }) => {
    const begin = await ctx.runMutation(internal.productAi.beginRun, { runId });
    if (!begin.started) {
      return null;
    }

    try {
      const context = await ctx.runQuery(internal.productAi.getRunContext, {
        runId,
      });
      if (context === null) {
        throw new ProductAiExecutionError("PRODUCT_AI_CONTEXT_UNAVAILABLE");
      }
      const incomingAttachments = await loadAttachments(
        ctx,
        context.run.attachments,
      );
      await ctx.runMutation(internal.productAi.updateRunPhase, {
        phase: "running_agent",
        runId,
      });

      const agentResult = await runProductWritingAgent({
        attachmentContexts: mapAttachmentContexts(context.attachmentContexts),
        conversationHistory: mapConversationHistory(
          context.conversationMessages,
        ),
        ctx,
        currentMarkdown: context.run.currentMarkdown,
        incomingAttachments,
        productContext: mapProductContext(context.run.productContext),
        repoContext:
          context.repoContext === null
            ? null
            : mapRepoContext(context.repoContext),
        selectionContext:
          context.run.selectionContext === undefined
            ? null
            : mapSelectionContext(context.run.selectionContext),
        userMessage: context.userMessage,
      });

      await ctx.runMutation(internal.productAi.updateRunPhase, {
        phase: "persisting_results",
        runId,
      });
      await ctx.runMutation(internal.productAi.commitRun, {
        assistantText: normalizeAssistantText(agentResult.assistantText),
        attachmentContexts: agentResult.newAttachmentContexts,
        baseContentHash: agentResult.baseContentHash,
        proposals: agentResult.proposals,
        runId,
        stopReason: agentResult.stopReason.slice(0, MAX_STOP_REASON_LENGTH),
      });
    } catch (unknownError: unknown) {
      await ctx.runMutation(internal.productAi.failRun, {
        errorCode: getSafeExecutionErrorCode(unknownError),
        runId,
      });
    }
    return null;
  },
});

async function loadAttachments(
  ctx: Parameters<typeof runProductWritingAgent>[0]["ctx"],
  attachments: {
    mimeType: string;
    name: string;
    size: number;
    storageId: Id<"_storage">;
  }[],
): Promise<ProductIncomingAttachment[]> {
  const loaded: ProductIncomingAttachment[] = [];
  for (const attachment of attachments) {
    const blob = await ctx.storage.get(attachment.storageId);
    if (blob === null) {
      throw new ProductAiExecutionError("PRODUCT_AI_ATTACHMENT_UNAVAILABLE");
    }
    const mimeType = blob.type || attachment.mimeType;
    if (!mimeType.startsWith("image/")) {
      throw new ProductAiExecutionError("PRODUCT_AI_ATTACHMENT_UNSUPPORTED");
    }
    const bytes = Buffer.from(await blob.arrayBuffer());
    loaded.push({
      dataUrl: `data:${mimeType};base64,${bytes.toString("base64")}`,
      mimeType,
      name: attachment.name,
      size: bytes.byteLength,
      storageId: attachment.storageId,
    });
  }
  return loaded;
}

function mapProductContext(productContext: {
  githubUrl?: string;
  name?: string;
  productUrl?: string;
  projectType?: "personal" | "work" | "open_source";
  roles: string[];
  tagline?: string;
  teamSize?: "solo" | "2-5" | "6-10" | "11-30" | "31+";
  technologyKeys: string[];
}): ProductAgentProductContext {
  return {
    githubUrl: productContext.githubUrl,
    name: productContext.name,
    productUrl: productContext.productUrl,
    projectType: productContext.projectType,
    roles: productContext.roles,
    tagline: productContext.tagline,
    teamSize: productContext.teamSize,
    technologyKeys: productContext.technologyKeys,
  };
}

function mapSelectionContext(selectionContext: {
  end: number;
  start: number;
  text: string;
}): ProductAgentSelectionContext {
  return {
    end: selectionContext.end,
    start: selectionContext.start,
    text: selectionContext.text,
  };
}

function mapConversationHistory(
  messages: {
    content: string;
    createdAt: number;
    role: "user" | "assistant";
  }[],
): ProductAgentConversationMessage[] {
  return messages.map((message) => ({
    content: message.content,
    createdAt: message.createdAt,
    role: message.role,
  }));
}

function mapRepoContext(repoContext: {
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
}): ProductAgentRepoContext {
  return {
    defaultBranch: repoContext.defaultBranch,
    dependencySummary: repoContext.dependencySummary,
    description: repoContext.description,
    detectedTechnologyKeys: repoContext.detectedTechnologyKeys,
    filesRead: repoContext.filesRead,
    githubUrl: repoContext.githubUrl,
    primaryLanguage: repoContext.primaryLanguage,
    readmePath: repoContext.readmePath,
    readmeText: repoContext.readmeText,
    repositoryFullName: repoContext.repositoryFullName,
  };
}

function mapAttachmentContexts(
  contexts: {
    analysisText?: string;
    error?: string;
    kind: "image" | "audio" | "pdf" | "other";
    mimeType?: string;
    name?: string;
    status: "ready" | "error";
    storageId?: Id<"_storage">;
  }[],
): ProductAgentAttachmentContext[] {
  return contexts.map((context) => ({
    analysisText: context.analysisText,
    error: context.error,
    kind: context.kind,
    mimeType: context.mimeType,
    name: context.name,
    status: context.status,
    storageId: context.storageId,
  }));
}

function normalizeAssistantText(text: string) {
  const normalized = text.trim();
  if (normalized.length === 0) {
    return "I reviewed the request, but no response was generated.";
  }
  return normalized.slice(0, MAX_ASSISTANT_TEXT_LENGTH);
}

function getSafeExecutionErrorCode(unknownError: unknown) {
  if (unknownError instanceof ProductAiExecutionError) {
    return unknownError.code;
  }
  if (
    unknownError instanceof Error &&
    unknownError.message.includes("OPENAI_API_KEY")
  ) {
    return "PRODUCT_AI_CONFIGURATION_ERROR";
  }
  return "PRODUCT_AI_EXECUTION_FAILED";
}

class ProductAiExecutionError extends Error {
  constructor(readonly code: string) {
    super(code);
  }
}
