import { PencilIcon } from "lucide-react";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { cn } from "@/lib/utils";

import {
  buttonBaseClass,
  gradientButtonClass,
} from "./ProductEditPrimitives";

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
    <aside className="sticky top-4 flex max-h-[calc(100vh-56px-32px)] flex-col gap-4 overflow-y-auto rounded-[8px] border border-white/[0.04] bg-[#212121] p-5 max-lg:static max-lg:max-h-none">
      <header className="flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-white">Product Tech Stack</h3>
        <button
          type="button"
          className={cn(buttonBaseClass, gradientButtonClass, "px-3.5 py-1.5 text-xs")}
          onClick={onEdit}
        >
          <PencilIcon className="size-3" aria-hidden="true" />
          Edit
        </button>
      </header>

      <div className="flex flex-col gap-5">
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
            <section key={group.categoryName} className="flex flex-col gap-2">
              <h4 className="text-[11px] font-medium tracking-[0.02em] text-[#D0D0D0]">
                {group.categoryName}
              </h4>
              <div className="grid grid-cols-3 gap-1">
                {group.technologies.map((technology) => (
                  <div
                    key={technology.key}
                    className="flex flex-col items-center gap-1 rounded-[6px] px-1 py-2 transition hover:bg-white/[0.03]"
                  >
                    <TechnologyLogo
                      name={technology.name}
                      className="size-8 rounded-none border-0 bg-transparent"
                      imageClassName="size-full"
                      fallbackClassName="text-[10px] text-white"
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
