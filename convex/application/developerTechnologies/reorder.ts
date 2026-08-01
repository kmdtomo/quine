import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  MAX_DEVELOPER_TECHNOLOGIES,
  uniqueValidTechnologyKeys,
} from "./technologyRules";

type ReorderArgs = {
  technologyKeys: string[];
};

export async function reorder(
  ctx: MutationCtx,
  args: ReorderArgs,
  userId: Id<"users">,
): Promise<null> {
  const validKeys = uniqueValidTechnologyKeys(args.technologyKeys);
  const requestedKeys = new Set<string>(validKeys);
  const rows = await ctx.db
    .query("developerTechnologies")
    .withIndex("by_developer", (q) => q.eq("developerId", userId))
    .take(MAX_DEVELOPER_TECHNOLOGIES);
  const rowsByKey = new Map(rows.map((row) => [row.technologyKey, row]));

  let order = 1;
  for (const technologyKey of validKeys) {
    const row = rowsByKey.get(technologyKey);
    if (!row) {
      continue;
    }
    await ctx.db.patch("developerTechnologies", row._id, { order });
    order += 1;
  }

  const remainingRows = rows
    .filter((row) => !requestedKeys.has(row.technologyKey))
    .sort((a, b) => a.order - b.order);
  for (const row of remainingRows) {
    await ctx.db.patch("developerTechnologies", row._id, { order });
    order += 1;
  }
  return null;
}
