"use node";

import type { ActionCtx } from "../../_generated/server";
import { runStrandsAgent } from "../ai/strandsRuntime";
import {
  createMarkdownContentHash,
  formatProductWritingInput,
  type ProductAgentAttachmentContext,
  type ProductAgentConversationMessage,
  type ProductAgentProductContext,
  type ProductAgentRepoContext,
  type ProductAgentSelectionContext,
  type ProductIncomingAttachment,
} from "./context";
import { PRODUCT_WRITING_SYSTEM_PROMPT } from "./prompts";
import type { ProductAiProposal } from "./schemas";
import { createProductWritingTools } from "./tools";

type RunProductWritingAgentArgs = {
  attachmentContexts: ProductAgentAttachmentContext[];
  conversationHistory: ProductAgentConversationMessage[];
  ctx: ActionCtx;
  currentMarkdown: string;
  incomingAttachments: ProductIncomingAttachment[];
  productContext: ProductAgentProductContext;
  repoContext: ProductAgentRepoContext | null;
  selectionContext: ProductAgentSelectionContext | null;
  userMessage: string;
};

export async function runProductWritingAgent({
  attachmentContexts,
  conversationHistory,
  ctx,
  currentMarkdown,
  incomingAttachments,
  productContext,
  repoContext,
  selectionContext,
  userMessage,
}: RunProductWritingAgentArgs) {
  const baseContentHash = createMarkdownContentHash(currentMarkdown);
  const proposals: ProductAiProposal[] = [];
  const newAttachmentContexts: ProductAgentAttachmentContext[] = [];
  const tools = createProductWritingTools({
    attachmentContexts,
    baseContentHash,
    ctx,
    incomingAttachments,
    onAttachmentContext: (context) => newAttachmentContexts.push(context),
    onProposal: (proposal) => proposals.push(proposal),
    repoContext,
  });

  const input = formatProductWritingInput({
    attachmentContexts,
    conversationHistory,
    currentMarkdown,
    currentMarkdownHash: baseContentHash,
    incomingAttachments,
    productContext,
    repoContext,
    selectionContext,
    userMessage,
  });

  const result = await runStrandsAgent({
    input,
    systemPrompt: PRODUCT_WRITING_SYSTEM_PROMPT,
    tools,
  });

  return {
    assistantText:
      result.text ||
      (proposals.length > 0
        ? "Proposal created."
        : "I reviewed the context, but did not create a proposal."),
    baseContentHash,
    newAttachmentContexts,
    proposals,
    stopReason: result.stopReason,
  };
}
