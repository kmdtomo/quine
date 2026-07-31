import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTechnologyByKey } from "@data/tech-stack";
import { TechStackDetailView } from "@/features/tech-stack/components/TechStackDetailView";

type Params = Promise<{
  technologyKey: string;
}>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { technologyKey: technologyKeyParam } = await params;
  const technologyKey = decodeRouteSegment(technologyKeyParam);
  const technology =
    technologyKey === null ? null : getTechnologyByKey(technologyKey);

  return {
    title: technology ? `${technology.name} — Quine` : "Technology — Quine",
  };
}

export default async function TechStackDetailPage({
  params,
}: {
  params: Params;
}) {
  const { technologyKey: technologyKeyParam } = await params;
  const technologyKey = decodeRouteSegment(technologyKeyParam);
  const technology =
    technologyKey === null ? null : getTechnologyByKey(technologyKey);
  if (!technology) {
    notFound();
  }

  return <TechStackDetailView technologyKey={technology.key} />;
}

function decodeRouteSegment(value: string) {
  try {
    const decodedValue = decodeURIComponent(value).trim();
    return decodedValue.length > 0 ? decodedValue : null;
  } catch {
    return null;
  }
}
