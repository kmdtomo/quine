"use client";

import { useMemo, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { CheckIcon, SearchIcon, XIcon } from "lucide-react";

import {
  allTechnologies,
  techStackCategories,
  type TechnologyCategoryKey,
  type TechnologyKey,
} from "@data/tech-stack";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import {
  PRESENCE_FADE_MOTION,
  PRESENCE_ZOOM_MOTION,
} from "@/lib/motion/presence";
import { cn } from "@/lib/utils";

type UsersTechFilterDialogProps = {
  onApply: (technologyKeys: TechnologyKey[]) => void;
  onClose: () => void;
  selectedTechnologyKeys: readonly TechnologyKey[];
};

const DEFAULT_CATEGORY_KEY: TechnologyCategoryKey = "languages";

export function UsersTechFilterDialog({
  onApply,
  onClose,
  selectedTechnologyKeys,
}: UsersTechFilterDialogProps) {
  const [draftKeys, setDraftKeys] = useState<TechnologyKey[]>([
    ...selectedTechnologyKeys,
  ]);
  const [activeCategoryKey, setActiveCategoryKey] =
    useState<TechnologyCategoryKey>(DEFAULT_CATEGORY_KEY);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const selectedSet = useMemo(() => new Set(draftKeys), [draftKeys]);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleTechnologies = useMemo(() => {
    if (normalizedSearch.length > 0) {
      return allTechnologies.filter(
        (technology) =>
          technology.name.toLowerCase().includes(normalizedSearch) ||
          technology.key.toLowerCase().includes(normalizedSearch),
      );
    }

    return (
      techStackCategories.find(
        (category) => category.key === activeCategoryKey,
      )?.technologies ?? []
    );
  }, [activeCategoryKey, normalizedSearch]);
  const activeCategoryName =
    techStackCategories.find(
      (category) => category.key === activeCategoryKey,
    )?.name ?? "Technologies";

  useKeyboardShortcut({
    key: "k",
    metaOrControl: true,
    onTrigger: () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    },
  });

  function toggleTechnology(technologyKey: TechnologyKey) {
    setDraftKeys((current) =>
      current.includes(technologyKey)
        ? current.filter((currentKey) => currentKey !== technologyKey)
        : [...current, technologyKey],
    );
  }

  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[80] bg-black/80 backdrop-blur-[4px] duration-150",
            PRESENCE_FADE_MOTION,
          )}
        />
        <Dialog.Popup
          aria-describedby="users-tech-filter-description"
          aria-labelledby="users-tech-filter-title"
          className={cn(
            "fixed top-1/2 left-1/2 z-[81] flex h-[min(760px,90vh)] w-[min(1040px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-lg border border-[#2A2A2A] bg-[#1A1A1A] text-white shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)] outline-none duration-150",
            PRESENCE_FADE_MOTION,
            PRESENCE_ZOOM_MOTION,
          )}
        >
          <Dialog.Title id="users-tech-filter-title" className="sr-only">
            Filter engineers by tech stack
          </Dialog.Title>
          <Dialog.Description
            id="users-tech-filter-description"
            className="sr-only"
          >
            Select every technology that an engineer must use.
          </Dialog.Description>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center gap-3 border-b border-white/[0.05] px-5 py-4">
              <label className="relative min-w-0 flex-1">
                <span className="sr-only">Search technologies</span>
                <SearchIcon
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#999]"
                  aria-hidden="true"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  className="h-10 w-full rounded-lg border border-white/[0.06] bg-black/30 pr-10 pl-10 text-sm text-white outline-none transition placeholder:text-[#999] focus:border-primary/40 focus:bg-black/45 focus:ring-3 focus:ring-primary/10"
                  autoComplete="off"
                  placeholder="Search technologies..."
                  spellCheck={false}
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                />
                {search.length > 0 ? (
                  <button
                    type="button"
                    className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[#999] transition hover:bg-white/[0.08] hover:text-white"
                    aria-label="Clear technology search"
                    onClick={() => {
                      setSearch("");
                      searchInputRef.current?.focus();
                    }}
                  >
                    <XIcon className="size-3" aria-hidden="true" />
                  </button>
                ) : null}
              </label>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] md:grid-cols-[220px_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]">
              <nav
                className="flex min-h-0 gap-0.5 overflow-x-auto border-b border-white/[0.05] bg-black/15 px-2 py-3 md:flex-col md:overflow-x-hidden md:overflow-y-auto md:border-r md:border-b-0"
                aria-label="Technology categories"
              >
                {techStackCategories.map((category) => {
                  const selectedCount = category.technologies.filter(
                    (technology) => selectedSet.has(technology.key),
                  ).length;
                  const active =
                    normalizedSearch.length === 0 &&
                    category.key === activeCategoryKey;

                  return (
                    <button
                      key={category.key}
                      type="button"
                      className={cn(
                        "relative flex w-auto shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium whitespace-nowrap text-[#999] transition hover:bg-white/[0.03] hover:text-[#D0D0D0] md:w-full",
                        active &&
                          "text-white before:absolute before:top-[20%] before:bottom-[20%] before:left-0 before:w-[3px] before:rounded-r before:bg-primary",
                      )}
                      onClick={() => {
                        setActiveCategoryKey(category.key);
                        setSearch("");
                      }}
                    >
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full bg-white/15",
                          active && "bg-primary",
                        )}
                      />
                      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis">
                        {category.name}
                      </span>
                      <span className="inline-flex items-baseline gap-px text-[11px] font-normal text-[#999] tabular-nums">
                        {selectedCount > 0 ? (
                          <strong className="font-bold text-primary">
                            {selectedCount}
                          </strong>
                        ) : null}
                        <span className="opacity-50">
                          {selectedCount > 0 ? "/" : ""}
                          {category.technologies.length}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
                <div className="flex shrink-0 items-baseline gap-2 border-b border-white/[0.04] px-5 py-4">
                  <h3 className="text-sm font-bold text-white after:ml-2 after:font-normal after:text-[#999] after:content-['-']">
                    {normalizedSearch.length > 0
                      ? "Search results"
                      : activeCategoryName}
                  </h3>
                  <span className="text-[11px] text-[#999]">
                    {visibleTechnologies.length}{" "}
                    {visibleTechnologies.length === 1
                      ? "technology"
                      : "technologies"}
                  </span>
                </div>

                {visibleTechnologies.length > 0 ? (
                  <div className="grid min-h-0 flex-1 auto-rows-min grid-cols-1 content-start gap-4 overflow-y-auto px-5 py-4 pb-6 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleTechnologies.map((technology) => {
                      const selected = selectedSet.has(technology.key);

                      return (
                        <button
                          key={technology.key}
                          type="button"
                          aria-pressed={selected}
                          className={cn(
                            "relative flex h-16 min-w-0 items-center gap-3 overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.015] p-3 text-left transition before:absolute before:inset-0 before:rounded-[inherit] before:bg-[radial-gradient(circle_at_30%_0%,rgba(7,222,129,0.15),transparent_60%)] before:opacity-0 before:transition hover:-translate-y-px hover:border-white/15 hover:bg-white/[0.035] hover:before:opacity-100",
                            selected &&
                              "border-primary/30 bg-primary/[0.045] before:opacity-100 hover:border-primary/40",
                          )}
                          onClick={() => toggleTechnology(technology.key)}
                        >
                          <TechnologyLogo
                            name={technology.name}
                            className="relative size-10"
                          />
                          <span className="relative min-w-0 flex-1 overflow-hidden text-ellipsis pr-4 text-[13px] font-bold tracking-[-0.005em] whitespace-nowrap text-white">
                            {technology.name}
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
                  </div>
                ) : (
                  <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 text-center text-[#999]">
                    <div className="mb-3 grid size-10 place-items-center rounded-full border border-white/[0.06] bg-white/[0.03]">
                      <SearchIcon className="size-5" aria-hidden="true" />
                    </div>
                    <h3 className="mb-1 text-sm font-medium text-[#D0D0D0]">
                      No technologies found
                    </h3>
                    <p className="max-w-[280px] text-xs leading-5">
                      Nothing matched &quot;{search.trim()}&quot;.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <footer className="flex items-center justify-between gap-4 border-t border-[#2A2A2A] px-6 py-5 max-sm:flex-col max-sm:items-stretch">
            <span className="text-[13px] text-[#A0A0A0]">
              {draftKeys.length} tech stack
              {draftKeys.length === 1 ? "" : "s"} selected
            </span>
            <div className="flex gap-3 max-sm:justify-end">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-lg px-5 text-sm font-bold text-[#D0D0D0] transition hover:bg-white/[0.06] hover:text-white"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#11998E] to-primary px-5 text-sm font-bold text-[#0D0D0D] transition hover:brightness-105"
                onClick={() => {
                  onApply(draftKeys);
                  onClose();
                }}
              >
                Apply filter
              </button>
            </div>
          </footer>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
