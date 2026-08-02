import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import {
  normalizeDeveloperYears,
  uniqueValidTechnologyKeys,
} from "./technologyRules";

type SetManyYearsArgs = {
  technologyKeys: string[];
  years: number | null;
};

export async function setManyYears(
  ctx: MutationCtx,
  args: SetManyYearsArgs,
  userId: Id<"users">,
): Promise<null> {
  const normalizedYears = normalizeDeveloperYears(args.years);

  const validKeys = uniqueValidTechnologyKeys(args.technologyKeys);
  for (const technologyKey of validKeys) {
    const current = await ctx.db
      .query("developerTechnologies")
      .withIndex("by_developer_technology", (q) =>
        q.eq("developerId", userId).eq("technologyKey", technologyKey),
      )
      .first();
    if (!current) {
      continue;
    }

    await ctx.db.patch("developerTechnologies", current._id, {
      years: normalizedYears,
    });
  }
  return null;
}
