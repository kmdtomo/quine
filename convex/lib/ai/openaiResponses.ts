"use node";

import OpenAI from "openai";
import { OpenAIModel } from "@strands-agents/sdk/models/openai";

const DEFAULT_PRODUCT_AI_MODEL = "gpt-5.4-mini";
const DEFAULT_PRODUCT_AI_VISION_MODEL = "gpt-5.4-mini";

export function getOpenAiApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  return apiKey;
}

export function createOpenAiResponsesModel() {
  return new OpenAIModel({
    api: "responses",
    apiKey: getOpenAiApiKey(),
    modelId: process.env.PRODUCT_AI_MODEL ?? DEFAULT_PRODUCT_AI_MODEL,
    stateful: false,
  });
}

export function createOpenAiClient() {
  return new OpenAI({
    apiKey: getOpenAiApiKey(),
  });
}

export function getOpenAiVisionModelId() {
  return process.env.PRODUCT_AI_VISION_MODEL ?? DEFAULT_PRODUCT_AI_VISION_MODEL;
}
