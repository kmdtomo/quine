import { ConvexError } from "convex/values";

import {
  isTechnologyKey,
  technologyKeys as canonicalTechnologyKeys,
  type TechnologyKey,
} from "../../../data/tech-stack";

export const MAX_DEVELOPER_TECHNOLOGIES = canonicalTechnologyKeys.length;

export function uniqueValidTechnologyKeys(keys: string[]): TechnologyKey[] {
  const seen = new Set<TechnologyKey>();
  const result: TechnologyKey[] = [];

  for (const key of keys) {
    if (!isTechnologyKey(key) || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(key);
  }

  return result;
}

export function normalizeDeveloperYears(years: number | null) {
  if (years === null) {
    return undefined;
  }
  if (!Number.isInteger(years) || years < 1 || years > 11) {
    throw new ConvexError({
      code: "INVALID_YEARS",
      message: "Years must be an integer between 1 and 11.",
    });
  }

  return years;
}
