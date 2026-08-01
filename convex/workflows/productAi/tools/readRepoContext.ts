"use node";

import { tool } from "@strands-agents/sdk";
import { z } from "zod";

import {
  formatRepoContextForTool,
  type ProductAgentRepoContext,
} from "../productWritingContext";

const readRepoContextInputSchema = z.object({
  includeReadme: z.boolean().optional(),
});

export function createReadRepoContextTool(
  repoContext: ProductAgentRepoContext | null,
) {
  return tool({
    name: "read_repo_context",
    description:
      "Read the imported repository context: README text, dependency/config summary, and detected technology keys. It cannot read source code.",
    inputSchema: readRepoContextInputSchema,
    callback: (input) => {
      if (!repoContext) {
        return {
          available: false,
          message: "No repository context is attached.",
        };
      }

      const context = formatRepoContextForTool(repoContext);
      if (input.includeReadme === false) {
        return {
          ...context,
          readmeText: "(omitted by request)",
        };
      }

      return context;
    },
  });
}
