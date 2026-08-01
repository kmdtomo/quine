"use node";

import { tool, type JSONValue } from "@strands-agents/sdk";
import { z } from "zod";

import type { ActionCtx } from "../../../_generated/server";
import {
  createOpenAiClient,
  getOpenAiVisionModelId,
} from "../../../infra/openai/client";
import type {
  ProductAgentAttachmentContext,
  ProductIncomingAttachment,
} from "../context";

const MAX_PRODUCT_AI_IMAGE_BYTES = 6 * 1024 * 1024;

const readAttachmentContextInputSchema = z.object({
  reason: z.string().max(240).optional(),
});

type CreateReadAttachmentContextToolArgs = {
  attachmentContexts: ProductAgentAttachmentContext[];
  ctx: ActionCtx;
  incomingAttachments: ProductIncomingAttachment[];
  onAttachmentContext: (context: ProductAgentAttachmentContext) => void;
};

export function createReadAttachmentContextTool({
  attachmentContexts,
  ctx,
  incomingAttachments,
  onAttachmentContext,
}: CreateReadAttachmentContextToolArgs) {
  let analyzed = false;
  const contexts = [...attachmentContexts];

  return tool({
    name: "read_attachment_context",
    description:
      "Analyze and read image attachment context. Attachments are loaded from protected server storage for this run.",
    inputSchema: readAttachmentContextInputSchema,
    callback: async (): Promise<JSONValue> => {
      if (!analyzed) {
        analyzed = true;
        for (const attachment of incomingAttachments) {
          const context = await analyzeAttachment({ attachment, ctx });
          contexts.push(context);
          onAttachmentContext(context);
        }
      }

      if (contexts.length === 0) {
        return {
          available: false,
          message: "No attachments are available.",
        };
      }
      return {
        attachments: contexts.map(toToolAttachmentContext),
        available: true,
      };
    },
  });
}

async function analyzeAttachment({
  attachment,
  ctx,
}: {
  attachment: ProductIncomingAttachment;
  ctx: ActionCtx;
}): Promise<ProductAgentAttachmentContext> {
  const baseContext: Pick<
    ProductAgentAttachmentContext,
    "kind" | "mimeType" | "name" | "storageId"
  > = {
    kind: "image",
    mimeType: attachment.mimeType,
    name: attachment.name,
    storageId: attachment.storageId,
  };
  if (
    !attachment.mimeType.startsWith("image/") ||
    !attachment.dataUrl.startsWith("data:image/")
  ) {
    return {
      ...baseContext,
      error: "ATTACHMENT_UNSUPPORTED",
      status: "error",
    };
  }
  if (attachment.size > MAX_PRODUCT_AI_IMAGE_BYTES) {
    return {
      ...baseContext,
      error: "ATTACHMENT_TOO_LARGE",
      status: "error",
    };
  }

  try {
    const client = createOpenAiClient();
    const response = await client.responses.create({
      input: [
        {
          content: [
            {
              text: "Analyze this image for a product Markdown writing assistant. Describe visible UI, content, diagrams, product cues, and text worth referencing. Be concise and factual.",
              type: "input_text",
            },
            {
              detail: "low",
              image_url: attachment.dataUrl,
              type: "input_image",
            },
          ],
          role: "user",
        },
      ],
      max_output_tokens: 900,
      model: getOpenAiVisionModelId(),
    });
    return {
      ...baseContext,
      analysisText:
        response.output_text.trim() || "No useful visual details were detected.",
      status: "ready",
    };
  } catch {
    return {
      ...baseContext,
      error: "ATTACHMENT_ANALYSIS_FAILED",
      status: "error",
    };
  }
}

function toToolAttachmentContext(context: ProductAgentAttachmentContext) {
  return {
    kind: context.kind,
    status: context.status,
    ...(context.analysisText === undefined
      ? {}
      : { analysisText: context.analysisText }),
    ...(context.error === undefined ? {} : { error: context.error }),
    ...(context.mimeType === undefined ? {} : { mimeType: context.mimeType }),
    ...(context.name === undefined ? {} : { name: context.name }),
  };
}
