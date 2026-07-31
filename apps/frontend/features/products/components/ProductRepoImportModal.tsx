"use client";

import { useState } from "react";
import {
  ChevronDownIcon,
  GitForkIcon,
  LockIcon,
  SearchIcon,
  StarIcon,
} from "lucide-react";

import { QuineMark } from "@/components/brand/QuineLogo";
import { GlassModal } from "@/components/glass-modal";
import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { cn } from "@/lib/utils";

export type ProductImportRepository = {
  description: string | null;
  fork: boolean;
  fullName: string;
  htmlUrl: string;
  name: string;
  primaryLanguage: string | null;
  primaryTechnologyKey: string | null;
  primaryTechnologyName: string | null;
  private: boolean;
  stargazersCount: number;
  updatedAt: string | null;
};

type ProductRepoImportModalProps = {
  error: string | null;
  importingRepository: string | null;
  installHref: string;
  loading: boolean;
  notInstalled: boolean;
  onClose: () => void;
  onImport: (repositoryFullName: string) => void;
  repositories: ProductImportRepository[];
};

export function ProductRepoImportModal({
  error,
  importingRepository,
  installHref,
  loading,
  notInstalled,
  onClose,
  onImport,
  repositories,
}: ProductRepoImportModalProps) {
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim().toLowerCase();
  const visibleRepositories =
    normalizedSearch.length === 0
      ? repositories
      : repositories.filter((repository) => {
          const haystack = [
            repository.fullName,
            repository.description ?? "",
            repository.primaryLanguage ?? "",
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedSearch);
        });

  return (
    <GlassModal
      className="max-h-[88svh] max-w-[640px] rounded-[20px] p-0 text-left"
      contentClassName="flex max-h-[88svh] min-h-0 flex-col"
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      showCloseButton={false}
      titleId="product-repo-import-modal-title"
    >
      <header className="flex items-start gap-4 px-6 pt-[22px] pb-[18px]">
        <div>
          <h2
            className="text-lg font-bold tracking-normal text-white"
            id="product-repo-import-modal-title"
          >
            Select GitHub Repository
          </h2>
          <p className="mt-1 text-[13px] leading-[1.5] text-[#888888]">
            Pick a repository and Quine will fill the basics from GitHub.
          </p>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-6 pb-5">
        {notInstalled ? (
          <GitHubInstallState installHref={installHref} />
        ) : (
          <>
            <div className="grid grid-cols-[190px_1fr] gap-2 max-sm:grid-cols-1">
              <button
                type="button"
                className="flex h-9 items-center gap-2 rounded-[8px] border border-white/[0.08] bg-white/[0.02] px-2.5 text-[13px] text-white"
                disabled
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/[0.08] text-[10px] font-bold">
                  GH
                </span>
                <span className="min-w-0 flex-1 truncate text-left">
                  GitHub App
                </span>
                <ChevronDownIcon className="size-3 text-[#888888]" aria-hidden="true" />
              </button>
              <label className="flex h-9 items-center gap-2 rounded-[8px] border border-white/[0.08] bg-white/[0.02] px-3 transition focus-within:border-white/20">
                <SearchIcon className="size-3.5 shrink-0 text-[#888888]" aria-hidden="true" />
                <input
                  type="search"
                  className="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-[#666666]"
                  placeholder="Search repositories..."
                  value={search}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                />
              </label>
            </div>

            <div className="flex max-h-96 min-h-56 flex-col overflow-y-auto rounded-[8px] border border-white/[0.08] bg-white/[0.01]">
              {loading ? (
                <RepositoryStatus
                  title="Loading repositories..."
                  text="Reading repositories available to your GitHub App installation."
                />
              ) : error ? (
                <RepositoryStatus title="Could not load repositories" text={error} />
              ) : visibleRepositories.length === 0 ? (
                <RepositoryStatus
                  title="No repositories found"
                  text={
                    repositories.length === 0
                      ? "This GitHub App installation does not expose any repositories yet."
                      : "No repositories matched your search."
                  }
                />
              ) : (
                visibleRepositories.map((repository) => (
                  <RepositoryButton
                    key={repository.fullName}
                    importing={importingRepository === repository.fullName}
                    repository={repository}
                    selectionLocked={importingRepository !== null}
                    onImport={onImport}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-white/[0.06] px-6 py-3.5 max-sm:flex-col-reverse max-sm:items-stretch max-sm:text-center">
        <span className="text-[11px] text-[#666666]">
          Reads README and dependency files only - never writes to GitHub.
        </span>
        <button
          type="button"
          className="rounded-[4px] px-2 py-1 text-[13px] text-[#888888] transition hover:text-white"
          onClick={onClose}
        >
          Skip
        </button>
      </footer>
    </GlassModal>
  );
}

function GitHubInstallState({ installHref }: { installHref: string }) {
  return (
    <div className="rounded-[10px] border border-white/[0.08] bg-white/[0.02] px-6 py-8 text-center">
      <div className="mx-auto grid size-11 place-items-center rounded-[12px] bg-white/[0.06] text-white">
        <LockIcon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-bold text-white">
        Connect GitHub App
      </h3>
      <p className="mx-auto mt-2 max-w-[44ch] text-sm leading-6 text-[#888888]">
        Quine needs a read-only GitHub App installation before it can list your repositories.
      </p>
      <a
        href={installHref}
        className="mt-5 inline-flex h-10 items-center justify-center rounded-[8px] border border-[#d1d5db] bg-[#191918] px-5 text-[13px] font-bold text-white transition hover:border-white hover:bg-white hover:text-[#0A0A0A]"
      >
        Install Quine on GitHub
      </a>
    </div>
  );
}

function RepositoryStatus({ text, title }: { text: string; title: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-6 py-9 text-center">
      <p className="text-sm font-medium text-white">{title}</p>
      <p className="max-w-[44ch] text-xs leading-[1.55] text-[#888888]">
        {text}
      </p>
    </div>
  );
}

function RepositoryButton({
  importing,
  onImport,
  repository,
  selectionLocked,
}: {
  importing: boolean;
  onImport: (repositoryFullName: string) => void;
  repository: ProductImportRepository;
  selectionLocked: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-start gap-3 border-b border-white/[0.05] px-4 py-3.5 text-left transition last:border-b-0 hover:bg-white/[0.04] disabled:cursor-wait disabled:opacity-60",
        importing && "bg-[#07DE81]/10",
      )}
      disabled={selectionLocked}
      onClick={() => onImport(repository.fullName)}
    >
      {repository.primaryTechnologyName ? (
        <TechnologyLogo
          name={repository.primaryTechnologyName}
          backdrop="auto"
          logoColor="auto"
          className="mt-0.5 size-9 rounded-[9px] border-white/[0.08] bg-white"
          fallbackClassName="text-[11px]"
        />
      ) : (
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center overflow-hidden rounded-[9px] border border-white/[0.08] bg-black">
          <QuineMark className="size-[23px]" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-2">
          <span className="truncate text-sm font-semibold text-white">
            {repository.fullName}
          </span>
          {repository.private ? (
            <span className="shrink-0 rounded-[4px] border border-white/[0.08] px-1.5 py-0.5 text-[10px] font-medium text-[#A0A0A0]">
              Private
            </span>
          ) : null}
        </span>
        {repository.description ? (
          <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[#888888]">
            {repository.description}
          </span>
        ) : null}
        <span className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#666666]">
          {repository.primaryLanguage ? (
            <span>{repository.primaryLanguage}</span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <StarIcon className="size-3" aria-hidden="true" />
            {repository.stargazersCount}
          </span>
          {repository.fork ? (
            <span className="inline-flex items-center gap-1">
              <GitForkIcon className="size-3" aria-hidden="true" />
              Fork
            </span>
          ) : null}
          {repository.updatedAt ? <span>{formatUpdatedAt(repository.updatedAt)}</span> : null}
        </span>
      </span>
      <span className="mt-1 shrink-0 rounded-[6px] border border-white/[0.08] px-3 py-1.5 text-[12px] font-medium text-white">
        {importing ? "Importing..." : "Select"}
      </span>
    </button>
  );
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `Updated ${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}
