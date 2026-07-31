import type { Metadata } from "next";
import type { Id } from "@convex/_generated/dataModel";

import { TechStackEditView } from "@/features/tech-stack/components/TechStackEditView";

export const metadata: Metadata = {
  title: "Edit tech stack — Quine",
};

type SearchParams = Promise<{
  onboarding?: string;
  manual?: string;
  github_app_connected?: string;
  github_app_error?: string;
  github_installation?: string;
  github_run?: string;
}>;

export default async function TechStackEditPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const githubInstallationId = params.github_installation
    ? (params.github_installation as Id<"githubInstallations">)
    : null;
  const runId = params.github_run
    ? (params.github_run as Id<"githubAnalysisRuns">)
    : null;

  return (
    <TechStackEditView
      githubAppError={params.github_app_error ?? null}
      githubAppConnected={params.github_app_connected === "1"}
      githubInstallationId={githubInstallationId}
      manual={params.manual === "1"}
      onboarding={params.onboarding === "1"}
      runId={runId}
    />
  );
}
