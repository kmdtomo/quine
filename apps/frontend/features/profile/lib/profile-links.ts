export function getProfileHref(username: string | undefined) {
  const normalizedUsername = normalizeUsername(username);
  return normalizedUsername
    ? `/@${encodeURIComponent(normalizedUsername)}`
    : "/tech-stack/edit";
}

export function getProductHref(
  username: string | undefined,
  slug: string,
) {
  const normalizedUsername = normalizeUsername(username);
  return normalizedUsername
    ? `/@${encodeURIComponent(normalizedUsername)}/${encodeURIComponent(slug)}`
    : "/products";
}

export function normalizeUsername(username: string | undefined) {
  if (!username) {
    return undefined;
  }

  const normalizedUsername = username.startsWith("@")
    ? username.slice(1)
    : username;
  return normalizedUsername.length > 0 ? normalizedUsername : undefined;
}
