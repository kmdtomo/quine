import type { ChangeEvent } from "react";
import { UploadIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  fieldClass,
  fieldFrameClass,
} from "./ProductEditPrimitives";

type ProductEditProjectHeaderSectionProps = {
  logo: string | undefined;
  name: string;
  onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onNameChange: (value: string) => void;
  onTaglineChange: (value: string) => void;
  tagline: string;
};

export function ProductEditProjectHeaderSection({
  logo,
  name,
  onLogoChange,
  onNameChange,
  onTaglineChange,
  tagline,
}: ProductEditProjectHeaderSectionProps) {
  return (
    <div className="flex items-start gap-6 max-sm:flex-col">
      <label className="relative block size-28 shrink-0 cursor-pointer overflow-hidden rounded-[14px] bg-[#2A2A2A] p-px transition hover:bg-[linear-gradient(135deg,#11998E_0%,#07DE81_100%)]">
        <input type="file" accept="image/*" hidden onChange={onLogoChange} />
        <span className="flex size-full flex-col items-center justify-center gap-1.5 rounded-[13px] bg-[#0D0D0D] text-[#7A7A7A]">
          {logo ? (
            <img src={logo} alt="" className="size-full rounded-[13px] object-cover" />
          ) : (
            <>
              <UploadIcon className="size-7" aria-hidden="true" />
              <span className="text-[11px]">Upload Logo</span>
            </>
          )}
        </span>
      </label>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label className={fieldFrameClass}>
          <span className="sr-only">Project Title</span>
          <input
            type="text"
            className={cn(fieldClass, "px-4 py-3 text-2xl font-bold")}
            placeholder="Project Title"
            maxLength={50}
            required
            value={name}
            onChange={(event) => onNameChange(event.currentTarget.value)}
          />
        </label>
        <label className={fieldFrameClass}>
          <span className="sr-only">Product tagline</span>
          <input
            type="text"
            className={fieldClass}
            placeholder="A short catchphrase that describes your product"
            maxLength={100}
            required
            value={tagline}
            onChange={(event) => onTaglineChange(event.currentTarget.value)}
          />
        </label>
      </div>
    </div>
  );
}
