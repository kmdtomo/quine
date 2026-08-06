"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchIcon, SlidersHorizontalIcon, XIcon } from "lucide-react";

import { api } from "@convex/_generated/api";
import { usePreloadedQuery, type Preloaded } from "convex/react";

import { AppHeader } from "@/components/app/AppHeader";
import { DropdownSelect } from "@/components/controls/DropdownSelect";
import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { Button } from "@/components/ui/button";
import { allTechnologies, getTechnologyByKey, techStackCategories } from "@data/tech-stack";
import { cn } from "@/lib/utils";

import {
  AuthorLink,
  getCompactProjectTypeLabel,
  getProductHref,
  getProjectTypeLabel,
  ProductLogoMark,
  ProductTechBadges,
  ProductTypeIcon,
  type ProductProjectType,
  type ProductTechnology,
} from "./product-ui";

type ProductListContentProps = {
  preloadedProducts: Preloaded<typeof api.products.listPublic>;
};

type ProductListProduct = {
  _id: string;
  author: {
    company: string | undefined;
    image: string | undefined;
    name: string | undefined;
    username: string | undefined;
  };
  content: string;
  logo: string | undefined;
  name: string;
  projectType: ProductProjectType;
  slug: string;
  tagline: string;
  technologies: ProductTechnology[];
};

const PRODUCT_TYPE_FILTERS = [
  { label: "All types", value: "all" },
  { label: "Personal", value: "personal" },
  { label: "Work", value: "work" },
  { label: "Open Source", value: "open_source" },
];

export function ProductListContent({
  preloadedProducts,
}: ProductListContentProps) {
  const products = usePreloadedQuery(preloadedProducts);
  const [search, setSearch] = useState("");
  const [projectTypeFilter, setProjectTypeFilter] = useState("all");
  const [selectedTechKeys, setSelectedTechKeys] = useState<string[]>([]);
  const [techModalOpen, setTechModalOpen] = useState(false);

  const filteredProducts = useMemo<ProductListProduct[]>(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return products.filter((product: ProductListProduct) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.tagline.toLowerCase().includes(normalizedSearch) ||
        product.content.toLowerCase().includes(normalizedSearch) ||
        (product.author.name ?? "").toLowerCase().includes(normalizedSearch) ||
        (product.author.company ?? "").toLowerCase().includes(normalizedSearch);
      const matchesType =
        projectTypeFilter === "all" ||
        product.projectType === projectTypeFilter;
      const matchesTech =
        selectedTechKeys.length === 0 ||
          selectedTechKeys.every((selectedKey) =>
            product.technologies.some(
              (technology: ProductTechnology) =>
                technology.technologyKey === selectedKey,
            ),
          );

      return matchesSearch && matchesType && matchesTech;
    });
  }, [products, projectTypeFilter, search, selectedTechKeys]);

  const selectedTechnologies = selectedTechKeys.flatMap((technologyKey) => {
    const technology = getTechnologyByKey(technologyKey);
    return technology ? [technology] : [];
  });

  function clearFilters() {
    setSearch("");
    setProjectTypeFilter("all");
    setSelectedTechKeys([]);
  }

  function removeSelectedTech(technologyKey: string) {
    setSelectedTechKeys((current) =>
      current.filter((currentKey) => currentKey !== technologyKey),
    );
  }

  function toggleSelectedTech(technologyKey: string) {
    setSelectedTechKeys((current) =>
      current.includes(technologyKey)
        ? current.filter((currentKey) => currentKey !== technologyKey)
        : [...current, technologyKey],
    );
  }

  return (
    <div className="min-h-svh bg-[#1A1A1A] text-white">
      <AppHeader />

      <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col px-6 pt-[92px] pb-10">
        <section className="mb-8">
          <span className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Products
          </span>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white">
            Discover products by stack
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#999]">
            Explore products through the technologies, engineers, and context
            behind them.
          </p>
        </section>

        <section className="mb-5 rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative min-w-64 flex-1">
              <span className="sr-only">Search products</span>
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#777]"
                aria-hidden="true"
              />
              <input
                type="search"
                className="h-11 w-full rounded-xl border border-[#3A3A3A] bg-[#1E1E1E] pr-10 pl-10 text-sm text-white outline-none transition placeholder:text-[#777] focus:border-primary/70"
                placeholder="Search products"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
              {search.trim().length > 0 ? (
                <button
                  type="button"
                  className="absolute top-1/2 right-3 grid size-6 -translate-y-1/2 place-items-center rounded-full text-[#777] transition hover:bg-white/10 hover:text-white"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <XIcon className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </label>

            <DropdownSelect
              ariaLabel="Project type"
              className="w-44"
              options={PRODUCT_TYPE_FILTERS}
              triggerClassName="h-11 rounded-xl border-[#3A3A3A] bg-[#1E1E1E] text-sm text-[#D0D0D0]"
              value={projectTypeFilter}
              onValueChange={setProjectTypeFilter}
            />

            <Button
              type="button"
              className="h-11 rounded-xl border border-[#3A3A3A] bg-[#1E1E1E] px-4 text-sm font-semibold text-[#D0D0D0] hover:border-primary/60 hover:bg-[#1E1E1E] hover:text-white"
              variant="outline"
              onClick={() => setTechModalOpen(true)}
            >
              <SlidersHorizontalIcon className="size-4" aria-hidden="true" />
              Stacks
              {selectedTechKeys.length > 0 ? (
                <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-[#111]">
                  {selectedTechKeys.length}
                </span>
              ) : null}
            </Button>

            {search.trim().length > 0 ||
            projectTypeFilter !== "all" ||
            selectedTechKeys.length > 0 ? (
              <button
                type="button"
                className="ml-auto h-9 rounded-full px-3 text-xs font-bold text-white/45 transition hover:text-white"
                onClick={clearFilters}
              >
                Clear
              </button>
            ) : null}
          </div>

          {selectedTechnologies.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedTechnologies.map((technology) => (
                <button
                  key={technology.key}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#1E1E1E] px-2.5 py-1.5 text-xs text-[#D0D0D0] transition hover:border-primary/50 hover:text-white"
                  onClick={() => removeSelectedTech(technology.key)}
                >
                  <TechnologyLogo
                    name={technology.name}
                    className="size-5 rounded border-0 bg-white"
                    imageClassName="size-[78%]"
                    fallbackClassName="text-[9px]"
                  />
                  {technology.name}
                  <XIcon className="size-3 text-white/35" aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        {filteredProducts.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                href={getProductHref(product.author.username, product.slug)}
                className="group rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] transition hover:border-primary/60"
              >
                <header className="mb-4 flex items-start gap-3">
                  <ProductLogoMark logo={product.logo} name={product.name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-baseline gap-2">
                          <h2 className="truncate text-base font-bold text-white">
                            {product.name}
                          </h2>
                          <span className="text-white/25">·</span>
                          <span className="shrink-0 text-xs text-white/50">
                            {getCompactProjectTypeLabel(product.projectType)}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-2 text-xs text-white/40 before:block before:h-0.5 before:w-4 before:bg-white/30">
                          {product.tagline}
                        </p>
                      </div>
                      <ProductTechBadges technologies={product.technologies} />
                    </div>
                  </div>
                </header>

                <p className="mb-5 line-clamp-2 min-h-10 text-xs leading-5 text-[#999]">
                  {product.content || "No description yet."}
                </p>

                <div className="flex items-center justify-between gap-3 border-t border-[#3A3A3A] pt-4">
                  <AuthorLink
                    company={product.author.company}
                    image={product.author.image}
                    name={product.author.name}
                    username={product.author.username}
                  />
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-[#1E1E1E] px-2.5 py-1.5 text-xs text-white/45">
                    <ProductTypeIcon
                      className="size-3.5"
                      projectType={product.projectType}
                    />
                    {getProjectTypeLabel(product.projectType)}
                  </span>
                </div>
              </Link>
            ))}
          </section>
        ) : (
          <section className="grid min-h-80 place-items-center rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-8 text-center">
            <div>
              <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full border border-white/10 text-white/35">
                <SearchIcon className="size-7" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-white/70">
                No products match your filters
              </h2>
              <p className="mt-2 text-sm text-white/35">
                Try removing a stack or broadening your search.
              </p>
            </div>
          </section>
        )}
      </main>

      {techModalOpen ? (
        <TechFilterModal
          selectedTechKeys={selectedTechKeys}
          onClose={() => setTechModalOpen(false)}
          onToggle={toggleSelectedTech}
        />
      ) : null}
    </div>
  );
}

function TechFilterModal({
  onClose,
  onToggle,
  selectedTechKeys,
}: {
  onClose: () => void;
  onToggle: (technologyKey: string) => void;
  selectedTechKeys: string[];
}) {
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>(
    techStackCategories[0]?.key ?? "",
  );
  const [search, setSearch] = useState("");
  const selectedSet = useMemo(() => new Set(selectedTechKeys), [selectedTechKeys]);
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur"
        aria-label="Close stack filter"
        onClick={onClose}
      />
      <section className="relative grid h-[min(760px,calc(100vh-48px))] w-[min(1040px,calc(100vw-32px))] grid-cols-[250px_minmax(0,1fr)] overflow-hidden rounded-[18px] border border-[#3A3A3A] bg-[#272727] shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)]">
        <aside className="min-h-0 border-r border-[#3A3A3A] p-4">
          <h2 className="px-2 text-sm font-bold text-white">Tech stacks</h2>
          <p className="mt-1 px-2 text-xs text-white/35">
            {selectedTechKeys.length} selected
          </p>
          <div className="mt-4 space-y-1 overflow-y-auto">
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
                    "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-[#999] transition hover:bg-white/[0.04] hover:text-white",
                    active && "bg-white/[0.06] text-white",
                  )}
                  onClick={() => {
                    setSearch("");
                    setActiveCategoryKey(category.key);
                  }}
                >
                  <span
                    className={cn(
                      "size-1.5 rounded-full bg-white/25",
                      active && "bg-primary",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{category.name}</span>
                  <span className="shrink-0 text-white/35">
                    {selectedCount > 0
                      ? `${selectedCount}/${category.technologies.length}`
                      : category.technologies.length}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex min-h-0 flex-col p-4">
          <div className="mb-4 flex items-center gap-3">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search technologies</span>
              <SearchIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#777]"
                aria-hidden="true"
              />
              <input
                type="search"
                className="h-11 w-full rounded-xl border border-[#3A3A3A] bg-[#1E1E1E] pr-10 pl-10 text-sm text-white outline-none transition placeholder:text-[#777] focus:border-primary/70"
                placeholder="Search technologies..."
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
            </label>
            <Button
              type="button"
              className="h-11 rounded-xl bg-white px-5 font-bold text-zinc-950 hover:bg-zinc-100"
              onClick={onClose}
            >
              Apply filter
            </Button>
          </div>

          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-bold text-white">
              {search.trim().length > 0
                ? "Search results"
                : techStackCategories.find(
                    (category) => category.key === activeCategoryKey,
                  )?.name ?? "Technologies"}
            </h3>
            <span className="text-xs text-white/35">
              {visibleTechnologies.length} technologies
            </span>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pr-2 md:grid-cols-3">
            {visibleTechnologies.map((technology) => {
              const selected = selectedSet.has(technology.key);
              return (
                <button
                  key={technology.key}
                  type="button"
                  className={cn(
                    "flex min-w-0 items-center gap-3 rounded-xl border border-[#3A3A3A] bg-[#1E1E1E] p-3 text-left transition hover:border-primary/50",
                    selected && "border-primary/70 bg-primary/10",
                  )}
                  onClick={() => onToggle(technology.key)}
                >
                  <TechnologyLogo
                    name={technology.name}
                    className="size-10 rounded-lg border-0 bg-white"
                    imageClassName="size-[76%]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-white">
                      {technology.name}
                    </span>
                    <span className="block truncate text-xs text-white/35">
                      {getTechnologyCategoryName(technology.key)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border border-white/15 text-[10px] text-transparent",
                      selected && "border-primary bg-primary text-[#111]",
                    )}
                  >
                    ✓
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function getTechnologyCategoryName(technologyKey: string) {
  return getTechnologyByKey(technologyKey)?.categoryName ?? "Technology";
}
