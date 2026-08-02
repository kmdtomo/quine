import { GitHubIntegrationError } from "./githubError";

export function getAuthorizationUrl(codeChallenge: string): string {
  const clientId = process.env.GITHUB_APP_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_APP_USER_OAUTH_CALLBACK_URL;
  if (!clientId || !callbackUrl) {
    throw new GitHubIntegrationError("GITHUB_APP_NOT_CONFIGURED");
  }

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackUrl);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}
