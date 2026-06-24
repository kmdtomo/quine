export function normalizeUsername(value: string | undefined) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value.trim();
  const normalized = trimmed.startsWith("@") ? trimmed.slice(1) : trimmed;
  return normalized.length > 0 ? normalized : undefined;
}
