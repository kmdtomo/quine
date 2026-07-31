"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  ArrowDownUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { TechStackItemCard } from "@/components/tech-stack/TechStackItemCard";
import { cn } from "@/lib/utils";

import type { SelectedTechnology, SelectedTechnologyGroup } from "./types";

type TechStackSortSectionProps = {
  groupedSelected: SelectedTechnologyGroup[];
  onRemoveTechnology: (technologyKey: string) => void;
  onReorderTechnologies: (technologyKeys: string[]) => void;
  onTechnologyYearsChange: (technologyKey: string, years: number | null) => void;
  selectedTechnologies: SelectedTechnology[];
};

export function TechStackSortSection({
  groupedSelected,
  onRemoveTechnology,
  onReorderTechnologies,
  onTechnologyYearsChange,
  selectedTechnologies,
}: TechStackSortSectionProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<{
    before: boolean;
    key: string;
  } | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const list = listRef.current;
    if (!list) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScroll = list.scrollWidth - list.clientWidth;
    setCanScrollLeft(list.scrollLeft > 2);
    setCanScrollRight(maxScroll > 0 && list.scrollLeft < maxScroll - 2);
  };

  useEffect(() => {
    updateScrollButtons();
  }, [selectedTechnologies.length]);

  const scrollBy = (left: number) => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    list.scrollBy({ behavior: "smooth", left });
  };

  const moveTechnology = (targetKey: string, before: boolean) => {
    if (!draggingKey || draggingKey === targetKey) {
      return;
    }

    const currentKeys = selectedTechnologies.map(
      (technology) => technology.technologyKey,
    );
    const withoutDragging = currentKeys.filter((key) => key !== draggingKey);
    const targetIndex = withoutDragging.findIndex((key) => key === targetKey);
    if (targetIndex < 0) {
      return;
    }

    const nextKeys = [...withoutDragging];
    nextKeys.splice(before ? targetIndex : targetIndex + 1, 0, draggingKey);
    onReorderTechnologies(nextKeys);
  };

  const handleDragOver = (
    event: DragEvent<HTMLDivElement>,
    targetKey: string,
  ) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const before = event.clientX < rect.left + rect.width / 2;
    setDropTarget({ before, key: targetKey });
  };

  if (selectedTechnologies.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-12 text-center text-[#999]">
        <div>
          <div className="mx-auto mb-3 grid size-10 place-items-center rounded-full border border-white/[0.06] bg-white/[0.03]">
            <SearchIcon className="size-5" aria-hidden="true" />
          </div>
          <div className="mb-1 text-sm font-medium text-[#D0D0D0]">
            No selections yet
          </div>
          <p className="max-w-[280px] text-xs leading-5">
            Switch to All and pick technologies to build your stack.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-5 py-5 pb-6">
      <div className="flex items-baseline gap-2.5 px-5 pb-1">
        <ArrowDownUpIcon
          className="size-3.5 shrink-0 self-center text-primary opacity-85"
          aria-hidden="true"
        />
        <span className="text-[13px] font-bold tracking-[0.3px] text-white">
          Display order
        </span>
        <span className="text-[11px] text-[#999] italic before:mr-1.5 before:not-italic before:text-[#999] before:opacity-60 before:content-['·']">
          Drag a card to rearrange
        </span>
      </div>

      <div className="relative shrink-0">
        {canScrollLeft ? (
          <button
            type="button"
            className="absolute top-1/2 left-2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-[#444] bg-[#272727] p-2 text-[#D0D0D0] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] transition hover:scale-[1.08] hover:bg-[#1E1E1E] hover:text-white"
            aria-label="Scroll left"
            onClick={() => scrollBy(-240)}
          >
            <ChevronLeftIcon className="size-5" aria-hidden="true" />
          </button>
        ) : null}

        <div
          ref={listRef}
          className="flex gap-3 overflow-x-auto overflow-y-hidden px-12 pt-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          onScroll={updateScrollButtons}
        >
          {selectedTechnologies.map((technology) => {
            const years = formatYears(technology.years);
            const unset = technology.years === undefined;
            const dropBefore =
              dropTarget?.key === technology.technologyKey && dropTarget.before;
            const dropAfter =
              dropTarget?.key === technology.technologyKey && !dropTarget.before;

            return (
              <div
                key={technology.technologyKey}
                className={cn(
                  "group relative mt-0 ml-0 flex shrink-0 cursor-grab select-none flex-col items-center transition active:cursor-grabbing",
                  draggingKey === technology.technologyKey && "opacity-35",
                  dropBefore &&
                    "rounded-sm shadow-[-3px_0_0_0_#07DE81]",
                  dropAfter && "rounded-sm shadow-[3px_0_0_0_#07DE81]",
                )}
                draggable
                onDragStart={() => {
                  setDraggingKey(technology.technologyKey);
                }}
                onDragOver={(event) =>
                  handleDragOver(event, technology.technologyKey)
                }
                onDragLeave={() => {
                  setDropTarget(null);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  moveTechnology(technology.technologyKey, Boolean(dropTarget?.before));
                  setDraggingKey(null);
                  setDropTarget(null);
                }}
                onDragEnd={() => {
                  setDraggingKey(null);
                  setDropTarget(null);
                }}
              >
                <div className="relative w-24">
                  <TechStackItemCard name={technology.name} />
                  <button
                    type="button"
                    className="absolute -top-1.5 -right-1.5 z-10 grid size-[18px] scale-[0.7] place-items-center rounded-full border border-white/20 bg-[#1a1a1a] p-0 text-[#D0D0D0] opacity-0 shadow-[0_3px_8px_rgba(0,0,0,0.35)] transition hover:scale-[1.12] hover:border-[#ff6b6b] hover:bg-[#2a1414] hover:text-[#ff8a8a] group-hover:scale-100 group-hover:opacity-100"
                    aria-label={`Remove ${technology.name}`}
                    onClick={() => onRemoveTechnology(technology.technologyKey)}
                  >
                    <XIcon className="size-[9px]" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-2 inline-flex items-center justify-center gap-1 text-xs text-[#999] transition hover:text-[#D0D0D0]">
                  <button
                    type="button"
                    className="grid size-4 scale-[0.7] place-items-center rounded-full border border-white/10 bg-white/[0.04] p-0 text-[#D0D0D0] opacity-0 transition hover:scale-[1.08] hover:border-transparent hover:bg-[linear-gradient(135deg,#11998E,#07DE81)] hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-25 group-hover:scale-100 group-hover:opacity-100"
                    aria-label={`Decrease years for ${technology.name}`}
                    disabled={technology.years === undefined || technology.years <= 1}
                    onClick={() =>
                      onTechnologyYearsChange(
                        technology.technologyKey,
                        technology.years === undefined
                          ? null
                          : Math.max(1, technology.years - 1),
                      )
                    }
                  >
                    <MinusIcon className="size-2" aria-hidden="true" />
                  </button>
                  <span
                    className={cn(
                      "min-w-[52px] text-center tabular-nums",
                      unset && "text-[#999] italic",
                    )}
                  >
                    {years}
                  </span>
                  <button
                    type="button"
                    className="grid size-4 scale-[0.7] place-items-center rounded-full border border-white/10 bg-white/[0.04] p-0 text-[#D0D0D0] opacity-0 transition hover:scale-[1.08] hover:border-transparent hover:bg-[linear-gradient(135deg,#11998E,#07DE81)] hover:text-[#0a0a0a] disabled:cursor-not-allowed disabled:opacity-25 group-hover:scale-100 group-hover:opacity-100"
                    aria-label={`Increase years for ${technology.name}`}
                    disabled={technology.years !== undefined && technology.years >= 11}
                    onClick={() =>
                      onTechnologyYearsChange(
                        technology.technologyKey,
                        technology.years === undefined
                          ? 1
                          : Math.min(11, technology.years + 1),
                      )
                    }
                  >
                    <PlusIcon className="size-2" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {canScrollRight ? (
          <button
            type="button"
            className="absolute top-1/2 right-2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-[#444] bg-[#272727] p-2 text-[#D0D0D0] shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] transition hover:scale-[1.08] hover:bg-[#1E1E1E] hover:text-white"
            aria-label="Scroll right"
            onClick={() => scrollBy(240)}
          >
            <ChevronRightIcon className="size-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-6 border-t border-white/[0.05] px-5 pt-6 pl-12">
        {groupedSelected.map((group) => (
          <div key={group.category.key} className="flex flex-col gap-3">
            <h4 className="inline-flex items-center gap-2 text-sm font-bold tracking-[0.5px] text-[#D0D0D0]">
              {group.category.name}
              <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-white/[0.06] px-1.5 text-[10px] font-bold text-[#999] tabular-nums">
                {group.items.length}
              </span>
            </h4>
            <div className="flex flex-wrap gap-3">
              {group.items.map((technology) => (
                <div
                  key={technology.technologyKey}
                  className="flex shrink-0 flex-col items-center"
                >
                  <TechStackItemCard name={technology.name} />
                  <div className="mt-2 text-center text-xs text-[#999]">
                    {formatYears(technology.years)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatYears(years: number | undefined): string {
  if (years === undefined) {
    return "- year";
  }
  return years >= 11 ? "10+ year" : `${years} year`;
}
