import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { TechStackEditContent } from "./TechStackEditContent";

type TechStackEditViewProps = {
  githubAppError: string | null;
  githubAppConnected: boolean;
  githubInstallationId: Id<"githubInstallations"> | null;
  manual: boolean;
  onboarding: boolean;
  runId: Id<"githubAnalysisRuns"> | null;
};

export async function TechStackEditView({
  githubAppError,
  githubAppConnected,
  githubInstallationId,
  manual,
  onboarding,
  runId,
}: TechStackEditViewProps) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/signin");
  }

  const [preloadedInstallations, preloadedStack] = await Promise.all([
    preloadQuery(api.githubInstallations.listMine, {}, { token }),
    preloadQuery(api.developerTechnologies.listMine, {}, { token }),
  ]);

  return (
    <TechStackEditContent
      githubAppError={githubAppError}
      githubAppConnected={githubAppConnected}
      githubInstallationId={githubInstallationId}
      manual={manual}
      onboarding={onboarding}
      preloadedInstallations={preloadedInstallations}
      preloadedStack={preloadedStack}
      runId={runId}
    />
  );
}
