import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  buttonBaseClass,
  ghostButtonClass,
  gradientButtonClass,
} from "./ProductEditPrimitives";

type ProductEditActionsSectionProps = {
  error: string | null;
  isEditing: boolean;
  onCancel: () => void;
  saving: boolean;
};

export function ProductEditActionsSection({
  error,
  isEditing,
  onCancel,
  saving,
}: ProductEditActionsSectionProps) {
  return (
    <>
      {error ? (
        <p className="rounded-[8px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-100">
          {error}
        </p>
      ) : null}

      <section className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          className={cn(buttonBaseClass, ghostButtonClass)}
          disabled={saving}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={cn(buttonBaseClass, gradientButtonClass)}
          disabled={saving}
        >
          {saving ? (
            "Saving..."
          ) : (
            <>
              <CheckIcon className="size-3.5" aria-hidden="true" />
              {isEditing ? "Save Product" : "Create Product"}
            </>
          )}
        </button>
      </section>
    </>
  );
}
