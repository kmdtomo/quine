import { preloadQuery } from "convex/nextjs";

import { api } from "@convex/_generated/api";
import type { TechnologyKey } from "@data/tech-stack";

import { TechStackDetailContent } from "./TechStackDetailContent";

type TechStackDetailViewProps = {
  technologyKey: TechnologyKey;
};

export async function TechStackDetailView({
  technologyKey,
}: TechStackDetailViewProps) {
  const preloadedDetail = await preloadQuery(
    api.productTechnologies.getPublicDetail,
    { technologyKey },
  );

  return <TechStackDetailContent preloadedDetail={preloadedDetail} />;
}
