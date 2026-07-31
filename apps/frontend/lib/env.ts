type PublicEnvName = "NEXT_PUBLIC_CONVEX_URL" | "NEXT_PUBLIC_GITHUB_APP_SLUG";

export function getRequiredPublicEnv(name: PublicEnvName): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getOptionalPublicEnv(name: PublicEnvName): string | null {
  return process.env[name] ?? null;
}
