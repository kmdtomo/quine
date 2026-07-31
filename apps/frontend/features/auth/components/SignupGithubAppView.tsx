import { getOptionalPublicEnv } from "@/lib/env";

import { SignupGithubAppContent } from "./SignupGithubAppContent";

type SignupGithubAppViewProps = {
  error?: string;
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_config: "GitHub App の slug が未設定です。",
  invalid_state: "GitHub App の戻り値を検証できませんでした。もう一度試してください。",
  missing_installation: "GitHub App の installation_id を受け取れませんでした。",
  invalid_setup_callback:
    "GitHub App のインストール結果を検証できませんでした。もう一度試してください。",
  authorization_start_failed:
    "GitHub の本人確認を開始できませんでした。設定を確認してください。",
  invalid_oauth_callback:
    "GitHub の本人確認結果を検証できませんでした。もう一度試してください。",
  authorization_failed:
    "GitHub アカウントまたはインストールを確認できませんでした。",
  organization_not_supported:
    "Organization 連携は安全な継続認可を準備中です。現在は個人アカウントへのインストールを選択してください。",
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
