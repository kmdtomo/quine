import {
  isTechnologyKey,
  type TechnologyKey,
} from "../../data/tech-stack";

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
