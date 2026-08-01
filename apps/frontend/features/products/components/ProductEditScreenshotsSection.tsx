import type { ChangeEvent } from "react";
import { ArrowLeftIcon, ArrowRightIcon, ImagePlusIcon, XIcon } from "lucide-react";

import type { ProductScreenshotDraft } from "../product-screenshot-draft";

type ProductEditScreenshotsSectionProps = {
  disabled: boolean;
  onAdd: (event: ChangeEvent<HTMLInputElement>) => void;
  onMove: (index: number, direction: -1 | 1) => void;
  onRemove: (index: number) => void;
  screenshots: ProductScreenshotDraft[];
};

export function ProductEditScreenshotsSection({
  disabled,
  onAdd,
  onMove,
  onRemove,
  screenshots,
}: ProductEditScreenshotsSectionProps) {
  return (
    <section className="rounded-[8px] border border-white/[0.04] bg-[#212121] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-white">Screenshots</h2>
          <p className="mt-1 text-xs text-[#7A7A7A]">
            Up to 8 images. The order below is used on the product page.
          </p>
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-white/10 px-3 py-2 text-xs font-medium text-white transition hover:border-primary/60 disabled:pointer-events-none">
          <ImagePlusIcon className="size-4" aria-hidden="true" />
          Add images
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={disabled || screenshots.length >= 8}
            hidden
            onChange={onAdd}
          />
        </label>
      </div>

      {screenshots.length === 0 ? (
        <div className="mt-4 grid min-h-28 place-items-center rounded-lg border border-dashed border-white/10 text-xs text-[#686868]">
          No screenshots selected
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {screenshots.map((screenshot, index) => (
            <div
              key={screenshot.storageId}
              className="overflow-hidden rounded-lg border border-white/10 bg-[#171717]"
            >
              <img
                src={screenshot.previewUrl}
                alt={`Screenshot ${index + 1}`}
                className="aspect-video w-full object-cover"
              />
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="text-[11px] text-[#8A8A8A]">{index + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Move screenshot ${index + 1} left`}
                    className="rounded p-1 text-[#8A8A8A] hover:bg-white/5 hover:text-white disabled:opacity-30"
                    disabled={disabled || index === 0}
                    onClick={() => onMove(index, -1)}
                  >
                    <ArrowLeftIcon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move screenshot ${index + 1} right`}
                    className="rounded p-1 text-[#8A8A8A] hover:bg-white/5 hover:text-white disabled:opacity-30"
                    disabled={disabled || index === screenshots.length - 1}
                    onClick={() => onMove(index, 1)}
                  >
                    <ArrowRightIcon className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove screenshot ${index + 1}`}
                    className="rounded p-1 text-[#8A8A8A] hover:bg-red-500/10 hover:text-red-300 disabled:opacity-30"
                    disabled={disabled}
                    onClick={() => onRemove(index)}
                  >
                    <XIcon className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
