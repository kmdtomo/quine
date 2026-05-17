import type { Metadata } from "next";

import { SignupDetectingView } from "@/features/auth/components/SignupDetectingView";

export const metadata: Metadata = {
  title: "Reading your repositories — Quine",
};

type SearchParams = Promise<{
  installation_id?: string;
}>;

export default async function SignupDetectingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const installationId =
    params.installation_id && /^\d+$/.test(params.installation_id)
      ? Number(params.installation_id)
      : null;

  return <SignupDetectingView installationId={installationId} />;
}
