import type { Metadata } from "next";

import { SignupGithubAppView } from "@/features/auth/components/SignupGithubAppView";

export const metadata: Metadata = {
  title: "Connect your GitHub — Quine",
};

export default function SignupGithubAppPage() {
  return <SignupGithubAppView />;
}
