import type { Metadata } from "next";

import { SignupGithubAppView } from "@/features/auth/components/SignupGithubAppView";

export const metadata: Metadata = {
  title: "Connect your GitHub — Quine",
};

type SearchParams = Promise<{
  error?: string;
}>;

export default async function SignupGithubAppPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return <SignupGithubAppView error={params.error} />;
}
