"use node";

import { tool } from "@strands-agents/sdk";

import {
  productMarkdownProposalInputSchema,
  type ProductMarkdownProposal,
} from "../toolSchemas";

type CreateProposeMarkdownEditToolArgs = {
  baseContentHash: string;
  onProposal: (proposal: ProductMarkdownProposal) => void;
};

export function createProposeMarkdownEditTool({
  baseContentHash,
  onProposal,
}: CreateProposeMarkdownEditToolArgs) {
  return tool({
    name: "propose_markdown_edit",
    description:
      "Create a Markdown edit proposal for the article/body content. Do not use this for structured product fields such as name, tagline, project type, team size, URLs, or roles. This does not save content; the user must apply it.",
    inputSchema: productMarkdownProposalInputSchema,
    callback: (input) => {
      onProposal({
        baseContentHash,
        edits: input.edits,
        kind: input.kind,
        summary: input.summary,
        title: input.title,
      });

      return {
        ok: true,
        proposalKind: input.kind,
        title: input.title,
      };
    },
  });
}
