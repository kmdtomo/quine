"use client";

import type { RefObject } from "react";
import { Grid2X2Icon, SearchIcon, XIcon } from "lucide-react";

import type {
  CanonicalTechnology,
  TechnologyKey,
} from "@data/tech-stack";

import { DropdownSelect } from "@/components/controls/DropdownSelect";
import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";

type RoleOption = {
  label: string;
  value: string;
};

type UsersFilterSectionProps = {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onOpenTechnologyDialog: () => void;
  onRemoveTechnology: (technologyKey: TechnologyKey) => void;
  onRoleChange: (role: string) => void;
  onSearchChange: (search: string) => void;
  role: string;
  roleOptions: readonly RoleOption[];
  search: string;
  searchInputRef: RefObject<HTMLInputElement | null>;
  selectedTechnologies: readonly CanonicalTechnology[];
};

export function UsersFilterSection({
  hasActiveFilters,
  onClearFilters,
  onOpenTechnologyDialog,
  onRemoveTechnology,
  onRoleChange,
  onSearchChange,
  role,
  roleOptions,
  search,
  searchInputRef,
  selectedTechnologies,
}: UsersFilterSectionProps) {
  return (
    <section className="mb-5 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="group relative min-w-64 flex-1">
          <span className="sr-only">Search engineers</span>
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#999] transition group-focus-within:text-primary"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="text"
            className="h-10 w-full rounded-lg border border-[#3A3A3A] bg-black/30 pr-20 pl-10 text-sm text-white outline-none transition placeholder:text-[#999] focus:border-primary/40 focus:bg-black/45 focus:ring-3 focus:ring-primary/10"
            autoComplete="off"
            placeholder="Search engineers"
            spellCheck={false}
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
          />
          {search.length > 0 ? (
            <button
              type="button"
              className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[#999] transition hover:bg-white/[0.08] hover:text-white"
              aria-label="Clear search"
              onClick={() => {
                onSearchChange("");
                searchInputRef.current?.focus();
              }}
            >
              <XIcon className="size-3" aria-hidden="true" />
            </button>
          ) : (
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-1 font-mono text-[10px] text-[#999] transition group-focus-within:opacity-0">
              ⌘ K
            </span>
          )}
        </label>

        <DropdownSelect
          ariaLabel="Role"
          className="w-48 max-[520px]:w-full"
          contentClassName="min-w-48"
          options={roleOptions}
          triggerClassName="h-10 rounded-lg border-[#3A3A3A] bg-black/30 px-3.5 text-[13px] text-[#E0E0E0] hover:border-primary/40"
          value={role}
          onValueChange={onRoleChange}
        />

        <button
          type="button"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#3A3A3A] bg-black/30 px-3.5 text-[13px] text-[#E0E0E0] transition hover:border-primary/40 hover:bg-black/45 max-[520px]:flex-1 max-[520px]:justify-center"
          onClick={onOpenTechnologyDialog}
        >
          <Grid2X2Icon
            className="size-3.5 text-[#D0D0D0]"
            aria-hidden="true"
          />
          <span>Stacks</span>
          {selectedTechnologies.length > 0 ? (
            <span className="inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-[#0D0D0D] tabular-nums">
              {selectedTechnologies.length}
            </span>
          ) : null}
        </button>

        {hasActiveFilters ? (
          <button
            type="button"
            className="h-10 shrink-0 rounded-lg px-3 text-[13px] text-[#999] transition hover:bg-white/[0.04] hover:text-white"
            onClick={onClearFilters}
          >
            Clear
          </button>
        ) : null}
      </div>

      {selectedTechnologies.length > 0 ? (
        <div className="flex flex-nowrap gap-1.5 overflow-x-auto overflow-y-hidden pb-0.5">
          {selectedTechnologies.map((technology) => (
            <button
              key={technology.key}
              type="button"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#3A3A3A] bg-[#272727] py-1 pr-2 pl-1.5 text-xs leading-none text-white transition hover:border-primary hover:bg-[#323232]"
              aria-label={`Remove ${technology.name}`}
              onClick={() => onRemoveTechnology(technology.key)}
            >
              <TechnologyLogo
                name={technology.name}
                className="size-4 rounded-[3px] border-0"
                fallbackClassName="text-[8px]"
                imageClassName="size-[78%]"
              />
              <span className="font-medium">{technology.name}</span>
              <XIcon className="size-3 text-[#999]" aria-hidden="true" />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
