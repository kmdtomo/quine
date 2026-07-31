"use node";

import { tool } from "@strands-agents/sdk";

import {
  productFormProposalInputSchema,
  type ProductFormProposal,
} from "../schemas";

type CreateProposeFormUpdateToolArgs = {
  baseContentHash: string;
  onProposal: (proposal: ProductFormProposal) => void;
};

export function createProposeFormUpdateTool({
  baseContentHash,
  onProposal,
}: CreateProposeFormUpdateToolArgs) {
  return tool({
    name: "propose_form_update",
    description:
      "Create a proposal to update structured product form fields: name, tagline, project type, team size, product URL, GitHub URL, or roles. Use this instead of Markdown when the user corrects a form field. This does not save the product; the user must apply it.",
    inputSchema: productFormProposalInputSchema,
    callback: (input) => {
      onProposal({
        baseContentHash,
        edits: [],
        formEdits: input.formEdits,
        kind: "form_update",
        summary: input.summary,
        title: input.title,
      });

      return {
        fields: input.formEdits.map((edit) => edit.field),
        ok: true,
        proposalKind: "form_update",
        title: input.title,
      };
    },
  });
}
