const MAX_ROLE_LENGTH = 48;
const MAX_ROLES = 8;

export function normalizeProductDeveloperRoles(roles: string[]) {
  const uniqueRoles = [];
  const seen = new Set<string>();

  for (const role of roles) {
    const normalizedRole = role.trim();
    if (
      normalizedRole.length === 0 ||
      normalizedRole.length > MAX_ROLE_LENGTH ||
      seen.has(normalizedRole)
    ) {
      continue;
    }

    seen.add(normalizedRole);
    uniqueRoles.push(normalizedRole);
  }

  return uniqueRoles.slice(0, MAX_ROLES);
}
