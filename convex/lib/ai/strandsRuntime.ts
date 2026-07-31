"use node";

import {
  Agent,
  NullConversationManager,
  type AgentResult,
  type ToolList,
} from "@strands-agents/sdk";

import { createOpenAiResponsesModel } from "./openaiResponses";

type RunStrandsAgentArgs = {
  input: string;
  systemPrompt: string;
  tools: ToolList;
};

export async function runStrandsAgent({
  input,
  systemPrompt,
  tools,
}: RunStrandsAgentArgs) {
  const agent = new Agent({
    conversationManager: new NullConversationManager(),
    model: createOpenAiResponsesModel(),
    printer: false,
    systemPrompt,
    tools,
  });

  const result = await agent.invoke(input, {
    limits: {
      outputTokens: 6000,
      totalTokens: 60000,
      turns: 8,
    },
  });

  return {
    text: extractAssistantText(result),
    stopReason: result.stopReason,
  };
}

function extractAssistantText(result: AgentResult) {
  const parts = [];
  for (const block of result.lastMessage.content) {
    if (block.type === "textBlock") {
      parts.push(block.text);
    }
  }

  return parts.join("\n").trim();
}
