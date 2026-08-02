"use client";

import { useMemo, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeftIcon,
  Grid2X2Icon,
  XIcon,
} from "lucide-react";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { cn } from "@/lib/utils";

import type { ProfileTechnology, StackSummary } from "../profile-types";
import { EmptyState } from "./profile-ui";

export function ProfileTechStackSection({
  categoryPreview,
  onCategoryPreviewChange,
  technologies,
}: {
  categoryPreview: boolean;
  onCategoryPreviewChange: (value: boolean) => void;
  technologies: ProfileTechnology[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const groups = useMemo(
    () => groupTechnologies(technologies),
    [technologies],
  );

  if (categoryPreview) {
    return (
      <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <button
          type="button"
          className="absolute top-0 right-8 z-10 grid size-7 place-items-center text-white/55 transition hover:text-white"
          aria-label="Close tech stack categories"
          onClick={() => onCategoryPreviewChange(false)}
        >
          <XIcon className="size-5" aria-hidden="true" />
        </button>

        <div className="min-h-0 flex-1 space-y-8 overflow-y-auto py-1 pr-3 pl-1">
          {groups.length > 0 ? (
            groups.map((group) => (
              <div key={group.categoryName}>
                <h3 className="mb-3 text-sm font-bold text-white/60">
                  {group.categoryName}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {group.items.map((technology) => (
                    <TechItem
                      key={technology.technologyKey}
                      categoryView
                      technology={technology}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No stacks yet" />
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="relative mt-[-17px] shrink-0">
      <div className="relative">
        <button
          type="button"
          className="absolute top-1/2 left-2 z-10 hidden size-9 -translate-y-1/2 place-items-center rounded-full border border-[#444] bg-[#272727] text-[#D0D0D0] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] transition hover:bg-[#1E1E1E] hover:text-white sm:grid"
          aria-label="Scroll stack left"
          onClick={() =>
            scrollRef.current?.scrollBy({
              behavior: "smooth",
              left: -280,
            })
          }
        >
          <ChevronLeftIcon className="size-5" aria-hidden="true" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pr-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {technologies.length > 0 ? (
            technologies.map((technology) => (
              <TechItem
                key={technology.technologyKey}
                technology={technology}
              />
            ))
          ) : (
            <div className="mt-8 w-full rounded-[16px] border border-[#3A3A3A] bg-[#272727] px-5 py-8">
              <EmptyState title="No stacks yet" />
            </div>
          )}
        </div>

        <button
          type="button"
          className="absolute top-1/2 right-2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-[#444] bg-[#272727] text-[#D0D0D0] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] transition hover:scale-105 hover:bg-[#1E1E1E] hover:text-white"
          aria-label="Show stacks by category"
          title="Show stacks by category"
          onClick={() => onCategoryPreviewChange(true)}
        >
          <Grid2X2Icon className="size-5" aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function TechItem({
  categoryView = false,
  technology,
}: {
  categoryView?: boolean;
  technology: ProfileTechnology;
}) {
  return (
    <Link
      href={`/tech-stack/${encodeURIComponent(technology.technologyKey)}`}
      className={cn(
        "ml-1 flex w-24 shrink-0 flex-col items-center text-center",
        categoryView ? "mt-0" : "mt-8",
      )}
    >
      <div className="relative grid size-24 place-items-center overflow-hidden rounded-xl border border-[#4D494A] bg-[#111] bg-[url('/lp/tech_stack_bg.jpg')] bg-cover bg-center p-2 transition hover:border-primary/70">
        <div className="absolute inset-0 bg-black/5" />
        <TechnologyLogo
          name={technology.name}
          backdrop="auto"
          className="relative z-10 mb-2 size-10 border-0 bg-transparent"
          imageClassName="size-full"
          fallbackClassName="text-white"
          logoColor="auto"
        />
        <span className="relative z-10 max-w-full truncate text-xs font-medium text-white">
          {technology.name}
        </span>
      </div>
      <span className="mt-2 text-xs text-white/35">
        {formatYears(technology.years)}
      </span>
    </Link>
  );
}

export function getStackSummary(
  technologies: ProfileTechnology[],
): StackSummary {
  const summary: StackSummary = {
    backend: 0,
    frontend: 0,
    infra: 0,
    mobile: 0,
    other: 0,
  };

  for (const technology of technologies) {
    const category = technology.categoryName.toLowerCase();
    if (category.includes("frontend")) {
      summary.frontend += 1;
    } else if (category.includes("backend")) {
      summary.backend += 1;
    } else if (category.includes("mobile")) {
      summary.mobile += 1;
    } else if (
      category.includes("cloud") ||
      category.includes("devops") ||
      category.includes("infra")
    ) {
      summary.infra += 1;
    } else {
      summary.other += 1;
    }
  }
  return summary;
}

function groupTechnologies(technologies: ProfileTechnology[]) {
  const groups = new Map<string, ProfileTechnology[]>();
  for (const technology of technologies) {
    const current = groups.get(technology.categoryName) ?? [];
    current.push(technology);
    groups.set(technology.categoryName, current);
  }
  return Array.from(groups, ([categoryName, items]) => ({
    categoryName,
    items,
  }));
}

function formatYears(years: number | undefined) {
  if (years === undefined) {
    return "Years not set";
  }
  return years >= 11 ? "10+ years" : `${years} years`;
}
