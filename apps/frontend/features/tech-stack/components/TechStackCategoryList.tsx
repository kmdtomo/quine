import type { TechnologyCategory } from "@data/tech-stack";

import { cn } from "@/lib/utils";

type TechStackCategoryListProps = {
  activeCategoryKey: string;
  categories: readonly TechnologyCategory[];
  onCategoryChange: (categoryKey: string) => void;
  selectedKeys: Set<string>;
};

export function TechStackCategoryList({
  activeCategoryKey,
  categories,
  onCategoryChange,
  selectedKeys,
}: TechStackCategoryListProps) {
  return (
    <nav
      className="flex min-h-0 flex-col gap-0.5 overflow-y-auto border-r border-white/[0.05] bg-black/15 px-2 py-3 max-md:flex-row max-md:overflow-x-auto max-md:border-r-0 max-md:border-b"
      aria-label="Categories"
    >
      {categories.map((category) => {
        const selectedCount = category.technologies.filter((technology) =>
          selectedKeys.has(technology.key),
        ).length;
        const active = category.key === activeCategoryKey;

        return (
          <button
            key={category.key}
            type="button"
            className={cn(
              "relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium whitespace-nowrap text-[#999] transition hover:bg-white/[0.03] hover:text-[#D0D0D0] max-md:w-auto max-md:shrink-0",
              active && "text-white before:absolute before:top-[20%] before:bottom-[20%] before:left-0 before:w-[3px] before:rounded-r before:bg-primary",
            )}
            onClick={() => onCategoryChange(category.key)}
          >
            <span
              className={cn(
                "size-1.5 shrink-0 rounded-full bg-white/15 transition",
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
  );
}
