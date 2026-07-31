import { PencilIcon } from "lucide-react";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";

export type ProductEditTechnology = {
  categoryName?: string;
  key: string;
  name: string;
};

type ProductTechGroup = {
  categoryName: string;
  technologies: ProductEditTechnology[];
};

export function ProductTechPanelSection({
  groups,
  onEdit,
}: {
  groups: ProductTechGroup[];
  onEdit: () => void;
}) {
  return (
    <aside className="sticky top-4 relative flex max-h-[calc(100vh-56px-32px)] flex-col overflow-y-auto rounded-[8px] border border-white/[0.04] bg-[#212121] p-4 max-lg:static max-lg:max-h-none">
      <button
        type="button"
        aria-label="Edit product technologies"
        title="Edit technologies"
        className="absolute top-4 right-4 z-10 grid size-6 place-items-center text-[#8A8A8A] transition hover:text-white focus-visible:text-white focus-visible:outline-none"
        onClick={onEdit}
      >
        <PencilIcon className="size-3.5" aria-hidden="true" />
      </button>

      <div className="flex flex-col gap-[18px]">
        {groups.length === 0 ? (
          <button
            type="button"
            className="flex items-center justify-center py-12 text-sm text-[#A0A0A0] transition hover:text-white"
            onClick={onEdit}
          >
            No technologies selected
          </button>
        ) : (
          groups.map((group) => (
            <section key={group.categoryName} className="flex flex-col gap-1.5">
              <h4 className="text-xs leading-none font-medium tracking-[0.02em] text-white">
                {group.categoryName}
              </h4>
              <div className="grid grid-cols-3 gap-x-1 gap-y-2">
                {group.technologies.map((technology) => (
                  <div
                    key={technology.key}
                    className="flex min-w-0 flex-col items-center gap-1 rounded-[6px] px-1 py-1.5 transition hover:bg-white/[0.03]"
                  >
                    <TechnologyLogo
                      name={technology.name}
                      backdrop="auto"
                      className="size-8 rounded-none border-0 bg-transparent"
                      imageClassName="size-full"
                      fallbackClassName="text-[10px] text-white"
                      logoColor="auto"
                    />
                    <span className="max-w-full truncate text-center text-[10px] leading-[1.25] text-[#D0D0D0]">
                      {technology.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </aside>
  );
}
