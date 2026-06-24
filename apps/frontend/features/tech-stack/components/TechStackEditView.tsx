import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { TechStackEditContent } from "./TechStackEditContent";

type TechStackEditViewProps = {
  githubAppError: string | null;
  installationId: number | null;
  manual: boolean;
  onboarding: boolean;
};

export async function TechStackEditView({
  githubAppError,
  installationId,
  manual,
  onboarding,
}: TechStackEditViewProps) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/signin");
  }

  const preloadedStack = await preloadQuery(
    api.developerTechnologies.listMine,
    {},
    { token },
  );

  return (
    <TechStackEditContent
      githubAppError={githubAppError}
      installationId={installationId}
      manual={manual}
      onboarding={onboarding}
      preloadedStack={preloadedStack}
    />
  );
}
