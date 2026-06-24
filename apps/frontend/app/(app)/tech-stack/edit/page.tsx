import type { Metadata } from "next";

import { TechStackEditView } from "@/features/tech-stack/components/TechStackEditView";

export const metadata: Metadata = {
  title: "Edit tech stack — Quine",
};

type SearchParams = Promise<{
  onboarding?: string;
  manual?: string;
  installation_id?: string;
  github_app_error?: string;
}>;

export default async function TechStackEditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const installationId =
    params.installation_id && /^\d+$/.test(params.installation_id)
      ? Number(params.installation_id)
      : null;

  return (
    <TechStackEditView
      githubAppError={params.github_app_error ?? null}
      installationId={installationId}
      manual={params.manual === "1"}
      onboarding={params.onboarding === "1"}
    />
  );
}
