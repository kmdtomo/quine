import { CheckIcon, SearchIcon } from "lucide-react";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { cn } from "@/lib/utils";

import type { TechnologyGridItem } from "./types";

type TechStackGridProps = {
  emptyText: string;
  emptyTitle: string;
  onToggleTechnology: (technologyKey: string) => void;
  selectedKeys: Set<string>;
  technologies: readonly TechnologyGridItem[];
};

export function TechStackGrid({
  emptyText,
  emptyTitle,
  onToggleTechnology,
  selectedKeys,
  technologies,
}: TechStackGridProps) {
  if (technologies.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-[#999]">
        <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full border border-white/[0.06] bg-white/[0.03] text-[#999]">
          <SearchIcon className="size-5" aria-hidden="true" />
        </div>
        <div className="mb-1 text-sm font-medium text-[#D0D0D0]">
          {emptyTitle}
        </div>
        <p className="mx-auto max-w-[280px] text-xs leading-5">{emptyText}</p>
      </div>
    );
  }

  return (
    <>
      {technologies.map((technology) => {
        const selected = selectedKeys.has(technology.key);

        return (
          <button
            key={technology.key}
            type="button"
            className={cn(
              "relative flex h-16 items-center gap-3 overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.015] p-3 text-left transition before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_30%_0%,rgba(7,222,129,0.15),transparent_60%)] before:opacity-0 before:transition hover:-translate-y-px hover:border-white/15 hover:bg-white/[0.035] hover:before:opacity-100",
              selected && "border-primary/30 bg-primary/[0.045] before:opacity-100 hover:border-primary/40",
            )}
            onClick={() => onToggleTechnology(technology.key)}
          >
            <TechnologyLogo
              name={technology.name}
              className="relative size-10 transition"
            />
            <span className="relative flex min-w-0 flex-1 flex-col gap-0.5 pr-4">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[13px] font-bold tracking-[-0.005em] text-white">
                {technology.name}
              </span>
            </span>
            <span
              className={cn(
                "absolute top-2 right-2 grid size-4 scale-[0.6] place-items-center text-primary opacity-0 transition",
                selected && "scale-100 opacity-100",
              )}
              aria-hidden="true"
            >
              <CheckIcon className="size-3.5 stroke-[3]" />
            </span>
          </button>
        );
      })}
    </>
  );
}
