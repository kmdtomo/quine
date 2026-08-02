import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  MAX_DEVELOPER_TECHNOLOGIES,
  uniqueValidTechnologyKeys,
} from "./technologyRules";

type SaveDetectedArgs = {
  technologyKeys: string[];
  userId: Id<"users">;
};

export async function saveDetected(
  ctx: MutationCtx,
  args: SaveDetectedArgs,
): Promise<{ detectedCount: number; insertedCount: number }> {
  const technologyKeys = uniqueValidTechnologyKeys(args.technologyKeys);

  const existing = await ctx.db
    .query("developerTechnologies")
    .withIndex("by_developer", (q) => q.eq("developerId", args.userId))
    .take(MAX_DEVELOPER_TECHNOLOGIES);

  const existingByKey = new Map(
    existing.map((row) => [row.technologyKey, row]),
  );
  const maxOrder = existing.reduce(
    (currentMax, row) => Math.max(currentMax, row.order),
    0,
  );
  let nextOrder = maxOrder + 1;
  let insertedCount = 0;

  for (const technologyKey of technologyKeys) {
    const current = existingByKey.get(technologyKey);
    if (current) {
      continue;
    }

    await ctx.db.insert("developerTechnologies", {
      developerId: args.userId,
      technologyKey,
      order: nextOrder,
    });
    nextOrder += 1;
    insertedCount += 1;
  }

  return {
    detectedCount: technologyKeys.length,
    insertedCount,
  };
}
