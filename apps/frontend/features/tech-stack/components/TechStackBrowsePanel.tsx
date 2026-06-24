"use client";

import { useEffect, useRef } from "react";
import { ListFilterIcon, SearchIcon, XIcon } from "lucide-react";

import type { TechnologyCategory } from "@data/tech-stack";

import { cn } from "@/lib/utils";

import { TechStackCategoryList } from "./TechStackCategoryList";
import { TechStackGrid } from "./TechStackGrid";
import { TechStackSortView } from "./TechStackSortView";
import type {
  FilterMode,
  SelectedTechnology,
  SelectedTechnologyGroup,
  TechnologyGridItem,
} from "./types";

type TechStackBrowsePanelProps = {
  activeCategoryKey: string;
  categories: readonly TechnologyCategory[];
  emptyText: string;
  emptyTitle: string;
  filterMode: FilterMode;
  groupedSelected: SelectedTechnologyGroup[];
  onCategoryChange: (categoryKey: string) => void;
  onClearSearch: () => void;
  onFilterModeChange: (mode: FilterMode) => void;
  onRemoveTechnology: (technologyKey: string) => void;
  onReorderTechnologies: (technologyKeys: string[]) => void;
  onSearchChange: (value: string) => void;
  onTechnologyYearsChange: (technologyKey: string, years: number | null) => void;
  onToggleTechnology: (technologyKey: string) => void;
  search: string;
  selectedKeys: Set<string>;
  selectedTechnologies: SelectedTechnology[];
  technologies: readonly TechnologyGridItem[];
};

export function TechStackBrowsePanel({
  activeCategoryKey,
  categories,
  emptyText,
  emptyTitle,
  filterMode,
  groupedSelected,
  onCategoryChange,
  onClearSearch,
  onFilterModeChange,
  onRemoveTechnology,
  onReorderTechnologies,
  onSearchChange,
  onTechnologyYearsChange,
  onToggleTechnology,
  search,
  selectedKeys,
  selectedTechnologies,
  technologies,
}: TechStackBrowsePanelProps) {
  const sortMode = filterMode === "selected" && search.length === 0;
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[linear-gradient(180deg,rgba(39,39,39,0.6),rgba(33,33,33,0.6))] backdrop-blur-[20px]">
      <div className="flex items-center gap-3 border-b border-white/[0.05] px-5 py-4 max-md:flex-col max-md:items-stretch">
        <div className="relative min-w-0 flex-1">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#999] transition"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search 140+ technologies..."
            autoComplete="off"
            spellCheck={false}
            className="h-10 w-full rounded-lg border border-white/[0.06] bg-black/30 pr-20 pl-10 text-sm text-white outline-none transition placeholder:text-[#999] focus:border-primary/40 focus:bg-black/45 focus:ring-3 focus:ring-primary/10"
          />
          {search.length > 0 ? (
            <button
              type="button"
              className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[#999] transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Clear search"
              onClick={onClearSearch}
            >
              <XIcon className="size-3" aria-hidden="true" />
            </button>
          ) : (
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 font-mono text-[10px] text-[#999]">
              ⌘ K
            </span>
          )}
        </div>

        <div
          className="flex shrink-0 gap-0.5 rounded-full border border-white/[0.06] bg-black/30 p-[3px]"
          role="tablist"
          aria-label="Filter"
        >
          <button
            type="button"
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[#999] transition hover:text-[#D0D0D0]",
              filterMode === "all" &&
                "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.2)]",
            )}
            role="tab"
            aria-selected={filterMode === "all"}
            onClick={() => onFilterModeChange("all")}
          >
            All
          </button>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap text-[#999] transition hover:text-[#D0D0D0]",
              filterMode === "selected" &&
                "bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06),0_1px_2px_rgba(0,0,0,0.2)]",
            )}
            role="tab"
            aria-selected={filterMode === "selected"}
            onClick={() => onFilterModeChange("selected")}
          >
            <ListFilterIcon
              className={cn(
                "size-[13px] opacity-70",
                filterMode === "selected" && "text-primary opacity-100",
              )}
              aria-hidden="true"
            />
            Selected & Sort
            <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary tabular-nums">
              {selectedTechnologies.length}
            </span>
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)]",
          sortMode
            ? "grid-cols-1"
            : "grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)]",
        )}
      >
        {sortMode ? null : (
          <TechStackCategoryList
            activeCategoryKey={activeCategoryKey}
            categories={categories}
            onCategoryChange={onCategoryChange}
            selectedKeys={selectedKeys}
          />
        )}

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {sortMode ? (
            <TechStackSortView
              groupedSelected={groupedSelected}
              onRemoveTechnology={onRemoveTechnology}
              onReorderTechnologies={onReorderTechnologies}
              onTechnologyYearsChange={onTechnologyYearsChange}
              selectedTechnologies={selectedTechnologies}
            />
          ) : (
            <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-1 content-start gap-4 overflow-y-auto px-5 py-4 pb-6 sm:grid-cols-2 lg:grid-cols-4">
              <TechStackGrid
                emptyText={emptyText}
                emptyTitle={emptyTitle}
                onToggleTechnology={onToggleTechnology}
                selectedKeys={selectedKeys}
                technologies={technologies}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
