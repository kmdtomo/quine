import { getOptionalPublicEnv } from "@/lib/env";

import { SignupGithubAppContent } from "./SignupGithubAppContent";

type SignupGithubAppViewProps = {
  error?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_config: "GitHub App の slug が未設定です。",
  invalid_state: "GitHub App の戻り値を検証できませんでした。もう一度試してください。",
  missing_installation: "GitHub App の installation_id を受け取れませんでした。",
};

export function SignupGithubAppView({ error }: SignupGithubAppViewProps) {
  const appConfigured = getOptionalPublicEnv("NEXT_PUBLIC_GITHUB_APP_SLUG") !== null;
  const errorMessage = error ? ERROR_MESSAGES[error] ?? ERROR_MESSAGES.invalid_state : null;

  return (
    <SignupGithubAppContent
      appConfigured={appConfigured}
      error={errorMessage}
    />
  );
}
