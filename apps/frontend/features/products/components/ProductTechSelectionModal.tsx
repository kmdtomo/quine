"use client";

import { useMemo, useState } from "react";

import { allTechnologies, techStackCategories } from "@data/tech-stack";

import {
  TechStackBrowsePanel,
  type FilterMode,
  type SelectedTechnology,
  type SelectedTechnologyGroup,
} from "@/features/tech-stack";
import { cn } from "@/lib/utils";

import {
  buttonBaseClass,
  ghostButtonClass,
  gradientButtonClass,
} from "./ProductEditPrimitives";

export function ProductTechSelectionModal({
  onApply,
  onClose,
  selectedTechKeys,
}: {
  onApply: (technologyKeys: string[]) => void;
  onClose: () => void;
  selectedTechKeys: string[];
}) {
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>(
    techStackCategories[0]?.key ?? "",
  );
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();

  const selectedKeys = useMemo(
    () => new Set(selectedTechKeys),
    [selectedTechKeys],
  );

  const activeCategory = techStackCategories.find(
    (category) => category.key === activeCategoryKey,
  );

  const visibleTechnologies = useMemo(() => {
    if (normalizedSearch.length > 0) {
      return allTechnologies.filter((technology) => {
        const values = [
          technology.key,
          technology.name,
          ...(technology.aliases ?? []),
        ];
        return values.some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );
      });
    }

    if (!activeCategory) {
      return allTechnologies;
    }

    const activeKeys = new Set<string>(
      activeCategory.technologies.map((technology) => technology.key),
    );
    return allTechnologies.filter((technology) => activeKeys.has(technology.key));
  }, [activeCategory, normalizedSearch]);

  const selectedTechnologies = useMemo<SelectedTechnology[]>(
    () =>
      selectedTechKeys.flatMap((technologyKey, index) => {
        const technology = allTechnologies.find(
          (item) => item.key === technologyKey,
        );
        if (!technology) {
          return [];
        }

        return [
          {
            categoryName: technology.categoryName,
            description: technology.description,
            name: technology.name,
            order: index + 1,
            technologyKey: technology.key,
          },
        ];
      }),
    [selectedTechKeys],
  );

  const groupedSelected = useMemo<SelectedTechnologyGroup[]>(
    () =>
      techStackCategories.flatMap((category) => {
        const categoryKeys = new Set<string>(
          category.technologies.map((technology) => technology.key),
        );
        const items = selectedTechnologies.filter((technology) =>
          categoryKeys.has(technology.technologyKey),
        );
        if (items.length === 0) {
          return [];
        }
        return [{ category, items }];
      }),
    [selectedTechnologies],
  );

  const emptyTitle = normalizedSearch ? "No technologies found" : "Empty category";
  const emptyText = normalizedSearch
    ? `Nothing matched "${search.trim()}". Try a different keyword.`
    : "This category has no registered technologies.";

  function handleCategoryChange(categoryKey: string) {
    setActiveCategoryKey(categoryKey);
    setFilterMode("all");
    setSearch("");
  }

  function handleFilterModeChange(mode: FilterMode) {
    setFilterMode(mode);
    setSearch("");
  }

  function handleRemoveTechnology(technologyKey: string) {
    onApply(
      selectedTechKeys.filter((currentKey) => currentKey !== technologyKey),
    );
  }

  function handleToggleTechnology(technologyKey: string) {
    onApply(
      selectedTechKeys.includes(technologyKey)
        ? selectedTechKeys.filter((currentKey) => currentKey !== technologyKey)
        : [...selectedTechKeys, technologyKey],
    );
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-[4px]"
        aria-label="Close tech stack selector"
        onClick={onClose}
      />
      <section className="relative flex h-[min(760px,90vh)] w-full max-w-[1040px] flex-col overflow-hidden rounded-2xl bg-[#1A1A1A] shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)]">
        <div className="min-h-0 flex-1">
          <TechStackBrowsePanel
            activeCategoryKey={activeCategoryKey}
            categories={techStackCategories}
            emptyText={emptyText}
            emptyTitle={emptyTitle}
            filterMode={filterMode}
            groupedSelected={groupedSelected}
            onCategoryChange={handleCategoryChange}
            onClearSearch={() => setSearch("")}
            onFilterModeChange={handleFilterModeChange}
            onRemoveTechnology={handleRemoveTechnology}
            onReorderTechnologies={onApply}
            onSearchChange={setSearch}
            onTechnologyYearsChange={() => undefined}
            onToggleTechnology={handleToggleTechnology}
            search={search}
            selectedKeys={selectedKeys}
            selectedTechnologies={selectedTechnologies}
            showFilterControls={false}
            technologies={visibleTechnologies}
          />
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-[#2A2A2A] px-6 py-5 max-sm:flex-col max-sm:items-stretch">
          <span className="text-[13px] text-[#A0A0A0]">
            {selectedTechKeys.length} tech stack{selectedTechKeys.length === 1 ? "" : "s"} selected
          </span>
          <div className="flex gap-3 max-sm:justify-end">
            <button
              type="button"
              className={cn(buttonBaseClass, ghostButtonClass)}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={cn(buttonBaseClass, gradientButtonClass)}
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
