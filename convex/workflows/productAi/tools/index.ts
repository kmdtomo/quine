"use node";

import type { ToolList } from "@strands-agents/sdk";

import type { ActionCtx } from "../../../_generated/server";
import type {
  ProductAgentAttachmentContext,
  ProductAgentRepoContext,
  ProductIncomingAttachment,
} from "../productWritingContext";
import type { ProductAiProposal } from "../toolSchemas";
import { createProposeFormUpdateTool } from "./proposeFormUpdate";
import { createProposeMarkdownEditTool } from "./proposeMarkdownEdit";
import { createReadAttachmentContextTool } from "./readAttachmentContext";
import { createReadRepoContextTool } from "./readRepoContext";

type CreateProductWritingToolsArgs = {
  attachmentContexts: ProductAgentAttachmentContext[];
  baseContentHash: string;
  ctx: ActionCtx;
  incomingAttachments: ProductIncomingAttachment[];
  onAttachmentContext: (context: ProductAgentAttachmentContext) => void;
  onProposal: (proposal: ProductAiProposal) => void;
  repoContext: ProductAgentRepoContext | null;
};

export function createProductWritingTools({
  attachmentContexts,
  baseContentHash,
  ctx,
  incomingAttachments,
  onAttachmentContext,
  onProposal,
  repoContext,
}: CreateProductWritingToolsArgs): ToolList {
  return [
    createReadRepoContextTool(repoContext),
    createReadAttachmentContextTool({
      attachmentContexts,
      ctx,
      incomingAttachments,
      onAttachmentContext,
    }),
    createProposeMarkdownEditTool({
      baseContentHash,
      onProposal,
    }),
    createProposeFormUpdateTool({
      baseContentHash,
      onProposal,
    }),
  ];
}
