"use client";

import { useMemo, useState } from "react";
import { CheckIcon, SearchIcon, XIcon } from "lucide-react";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { allTechnologies, techStackCategories } from "@data/tech-stack";
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
  const [search, setSearch] = useState("");
  const [draftTechKeys, setDraftTechKeys] = useState(selectedTechKeys);
  const selectedSet = useMemo(() => new Set(draftTechKeys), [draftTechKeys]);
  const visibleTechnologies = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (normalizedSearch.length > 0) {
      return allTechnologies.filter(
        (technology) =>
          technology.name.toLowerCase().includes(normalizedSearch) ||
          technology.key.toLowerCase().includes(normalizedSearch),
      );
    }

    const category = techStackCategories.find(
      (item) => item.key === activeCategoryKey,
    );
    return category?.technologies ?? [];
  }, [activeCategoryKey, search]);

  function toggleTechnology(technologyKey: string) {
    setDraftTechKeys((current) =>
      current.includes(technologyKey)
        ? current.filter((currentKey) => currentKey !== technologyKey)
        : [...current, technologyKey],
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
      <section className="relative flex max-h-[90vh] w-full max-w-[1040px] flex-col overflow-hidden rounded-[8px] border border-[#2A2A2A] bg-[#1A1A1A] shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)]">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center gap-3 border-b border-white/[0.05] px-5 py-4">
            <label className="relative min-w-0 flex-1">
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#999999]"
                aria-hidden="true"
              />
              <input
                type="text"
                className="h-10 w-full rounded-[8px] border border-white/[0.06] bg-black/30 pr-10 pl-10 text-sm text-white outline-none transition placeholder:text-[#999999] focus:border-[#07DE81]/40 focus:bg-black/45 focus:shadow-[0_0_0_3px_rgba(7,222,129,0.08)]"
                placeholder="Search technologies..."
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
              {search.length > 0 ? (
                <button
                  type="button"
                  className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[#999999] transition hover:bg-white/[0.08] hover:text-white"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <XIcon className="size-3" aria-hidden="true" />
                </button>
              ) : null}
            </label>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)] max-sm:grid-cols-1 max-sm:grid-rows-[auto_minmax(0,1fr)]">
            <nav className="flex flex-col gap-0.5 overflow-y-auto border-r border-white/[0.05] bg-black/15 px-2 py-3 max-sm:flex-row max-sm:overflow-x-auto max-sm:border-r-0 max-sm:border-b max-sm:py-2">
              {techStackCategories.map((category) => {
                const selectedCount = category.technologies.filter((technology) =>
                  selectedSet.has(technology.key),
                ).length;
                const active =
                  search.trim().length === 0 && category.key === activeCategoryKey;

                return (
                  <button
                    key={category.key}
                    type="button"
                    className={cn(
                      "relative flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[13px] font-medium text-[#999999] transition hover:bg-white/[0.03] hover:text-[#D0D0D0] max-sm:w-auto max-sm:shrink-0",
                      active && "text-white before:absolute before:top-[20%] before:bottom-[20%] before:left-0 before:w-[3px] before:rounded-r-[3px] before:bg-[#07DE81]",
                    )}
                    onClick={() => {
                      setSearch("");
                      setActiveCategoryKey(category.key);
                    }}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full bg-white/15",
                        active && "bg-[#07DE81]",
                      )}
                    />
                    <span className="min-w-0 flex-1 truncate">{category.name}</span>
                    <span className="inline-flex items-baseline gap-px text-[11px] text-[#999999]">
                      {selectedCount > 0 ? (
                        <>
                          <strong className="font-bold text-[#07DE81]">
                            {selectedCount}
                          </strong>
                          <span className="opacity-50">/{category.technologies.length}</span>
                        </>
                      ) : (
                        category.technologies.length
                      )}
                    </span>
                  </button>
                );
              })}
            </nav>

            <div className="flex min-h-0 flex-col overflow-hidden">
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/[0.04] px-5 py-4">
                <div className="inline-flex items-baseline gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {search.trim().length > 0
                      ? "Search results"
                      : techStackCategories.find(
                          (category) => category.key === activeCategoryKey,
                        )?.name ?? "Technologies"}
                  </h3>
                  <span className="text-[#999999]">-</span>
                  <span className="text-[11px] text-[#999999]">
                    {visibleTechnologies.length} technologies
                  </span>
                </div>
              </div>

              <div className="grid min-h-0 flex-1 content-start gap-4 overflow-y-auto px-5 pt-4 pb-6 [grid-template-columns:repeat(4,minmax(0,1fr))] max-xl:[grid-template-columns:repeat(3,minmax(0,1fr))] max-lg:[grid-template-columns:repeat(2,minmax(0,1fr))] max-sm:[grid-template-columns:1fr]">
                {visibleTechnologies.length === 0 ? (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-sm text-[#A0A0A0]">No technologies found</p>
                    <p className="mt-2 text-xs text-[#707070]">
                      Nothing matched your search.
                    </p>
                  </div>
                ) : (
                  visibleTechnologies.map((technology) => {
                    const selected = selectedSet.has(technology.key);
                    return (
                      <button
                        key={technology.key}
                        type="button"
                        className={cn(
                          "relative flex flex-col items-center gap-1.5 rounded-[8px] border border-white/[0.06] bg-white/[0.02] px-2 py-3 text-center transition hover:-translate-y-px hover:border-white/[0.14] hover:bg-white/[0.04]",
                          selected && "border-[#07DE81]/35 bg-[#07DE81]/[0.06]",
                        )}
                        onClick={() => toggleTechnology(technology.key)}
                      >
                        <TechnologyLogo
                          name={technology.name}
                          className="size-10 rounded-none border-0 bg-transparent"
                          imageClassName="size-full"
                          fallbackClassName="text-xs text-white"
                        />
                        <span className="text-[11px] leading-[1.25] break-words text-white">
                          {technology.name}
                        </span>
                        <span
                          className={cn(
                            "absolute top-1.5 right-1.5 grid size-4 place-items-center text-[#07DE81] opacity-0 transition",
                            selected && "opacity-100",
                          )}
                        >
                          <CheckIcon className="size-3.5" aria-hidden="true" />
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-[#2A2A2A] px-6 py-5 max-sm:flex-col max-sm:items-stretch">
          <span className="text-[13px] text-[#A0A0A0]">
            {draftTechKeys.length} tech stack{draftTechKeys.length === 1 ? "" : "s"} selected
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
              onClick={() => {
                onApply(draftTechKeys);
                onClose();
              }}
            >
              Done
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
