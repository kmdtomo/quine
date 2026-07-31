import type { ReactNode } from "react";
import { LinkIcon, PlusIcon } from "lucide-react";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { cn } from "@/lib/utils";

import type { ProductTechnology } from "../types";

export function EmptyState({
  actionLabel,
  icon,
  onAction,
  title,
}: {
  actionLabel?: string;
  icon?: ReactNode;
  onAction?: () => void;
  title: string;
}) {
  return (
    <div className="grid h-full min-h-48 place-items-center text-center">
      <div>
        <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full border border-white/10 text-white/35">
          {icon ?? <LinkIcon className="size-7" aria-hidden="true" />}
        </div>
        <p className="text-sm font-bold text-white/60">{title}</p>
        {actionLabel && onAction ? (
          <button
            type="button"
            className="mx-auto mt-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-bold text-white/50 transition hover:border-primary/50 hover:text-primary"
            onClick={onAction}
          >
            <PlusIcon className="size-3.5" aria-hidden="true" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function ProductLogo({
  logo,
  name,
}: {
  logo: string | undefined;
  name: string;
}) {
  return (
    <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-md bg-[#333] text-sm font-bold text-white">
      {logo ? (
        <img src={logo} alt="" className="size-full object-cover" />
      ) : (
        name[0]
      )}
    </div>
  );
}

export function TechBadges({
  compact = false,
  technologies,
}: {
  compact?: boolean;
  technologies: ProductTechnology[];
}) {
  const visibleTechnologies = technologies.slice(0, compact ? 5 : 4);
  const hiddenCount = Math.max(
    technologies.length - visibleTechnologies.length,
    0,
  );

  if (visibleTechnologies.length === 0) {
    return <span className="text-xs text-white/30">No stack</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {visibleTechnologies.map((technology) => (
        <TechnologyLogo
          key={technology.technologyKey}
          name={technology.name}
          className={cn(
            "rounded border-0 bg-white",
            compact ? "size-5" : "size-[22px]",
          )}
          imageClassName="size-[78%]"
          fallbackClassName="text-[9px]"
        />
      ))}
      {hiddenCount > 0 ? (
        <span className="ml-0.5 text-xs text-white/35">
          +{hiddenCount}
        </span>
      ) : null}
    </div>
  );
}

export function getInitials(value: string) {
  const initials = value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1))
    .join("")
    .toUpperCase();
  return initials || "Q";
}
