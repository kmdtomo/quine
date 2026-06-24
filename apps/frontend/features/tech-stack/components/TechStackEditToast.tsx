import { CheckIcon, XIcon } from "lucide-react";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { cn } from "@/lib/utils";

import type { SelectedTechnology, ToastState } from "./types";

type TechStackEditToastProps = {
  onApplyYears: () => void;
  onHide: () => void;
  onOpenPanel: () => void;
  onPanelYearChange: (year: number) => void;
  onTogglePanelTechnology: (technologyKey: string) => void;
  onUndoRemove: () => void;
  panelCheckedKeys: Set<string>;
  panelYear: number | null;
  toast: ToastState;
  unsetYearTechnologies: SelectedTechnology[];
};

const yearOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export function TechStackEditToast({
  onApplyYears,
  onHide,
  onOpenPanel,
  onPanelYearChange,
  onTogglePanelTechnology,
  onUndoRemove,
  panelCheckedKeys,
  panelYear,
  toast,
  unsetYearTechnologies,
}: TechStackEditToastProps) {
  if (toast.mode === "hidden") {
    return null;
  }

  const panel = toast.mode === "panel";
  const actionDisabled = panelCheckedKeys.size === 0 || panelYear === null;

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 z-[100] min-w-[320px] max-w-[520px] -translate-x-1/2 rounded-full border border-white/10 bg-[#1E1E1E]/95 text-[13px] text-white opacity-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition",
        panel && "min-w-[420px] max-w-[560px] rounded-2xl",
      )}
      role="status"
      aria-live="polite"
    >
      {panel ? (
        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 font-bold">
              <span>Set years of experience</span>
              <span className="inline-flex h-5 min-w-[22px] items-center justify-center rounded-full bg-primary/15 px-2 text-[11px] font-bold text-primary">
                {panelCheckedKeys.size}
              </span>
            </div>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-full text-[#999] transition hover:bg-white/[0.05] hover:text-white"
              aria-label="Close"
              onClick={onHide}
            >
              <XIcon className="size-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="-mx-0.5 flex max-h-[238px] flex-col gap-0.5 overflow-y-auto p-0.5">
            {unsetYearTechnologies.map((technology) => {
              const checked = panelCheckedKeys.has(technology.technologyKey);

              return (
                <button
                  key={technology.technologyKey}
                  type="button"
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-white/[0.03]",
                    checked && "text-white",
                  )}
                  onClick={() =>
                    onTogglePanelTechnology(technology.technologyKey)
                  }
                >
                  <span
                    className={cn(
                      "grid size-4 shrink-0 place-items-center rounded border border-white/20 text-transparent transition",
                      checked && "border-primary bg-primary text-[#0A1F14]",
                    )}
                    aria-hidden="true"
                  >
                    <CheckIcon className="size-3 stroke-[3]" />
                  </span>
                  <TechnologyLogo
                    name={technology.name}
                    className="size-[22px] rounded-[5px]"
                  />
                  <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[#D0D0D0]">
                    {technology.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-2">
            <div className="flex min-w-0 flex-[0_1_240px] gap-1.5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {yearOptions.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={cn(
                    "shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-[#D0D0D0] transition hover:bg-white/[0.08] hover:text-white",
                    panelYear === year &&
                      "border-primary/40 bg-primary/10 text-primary",
                  )}
                  onClick={() => onPanelYearChange(year)}
                >
                  {year >= 11 ? "10+" : `${year}y`}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full bg-[linear-gradient(90deg,#11998E,#07DE81)] px-3.5 py-1.5 text-xs font-bold text-[#0A1F14] transition disabled:cursor-not-allowed disabled:opacity-35"
              disabled={actionDisabled}
              onClick={onApplyYears}
            >
              Apply
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 px-3.5 py-2.5 pr-3">
          <span
            className={cn(
              "grid size-[22px] shrink-0 place-items-center rounded-full",
              toast.mode === "prompt" && toast.tone === "success"
                ? "bg-[linear-gradient(90deg,#11998E,#07DE81)] text-[#0A1F14]"
                : "bg-white/10 text-[#D0D0D0]",
            )}
          >
            <CheckIcon className="size-3 stroke-[2.5]" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">{toast.message}</span>
          {toast.mode === "prompt" && toast.tone === "info" && unsetYearTechnologies.length > 0 ? (
            <button
              type="button"
              className="rounded-full border border-primary/20 bg-primary/[0.08] px-2.5 py-1 text-xs font-bold text-primary transition hover:bg-primary/15"
              onClick={onOpenPanel}
            >
              {unsetYearTechnologies.length > 1
                ? `Set years (${unsetYearTechnologies.length})`
                : "Set years"}
            </button>
          ) : null}
          {toast.mode === "undo" ? (
            <button
              type="button"
              className="rounded-full border border-primary/20 bg-primary/[0.08] px-2.5 py-1 text-xs font-bold text-primary transition hover:bg-primary/15"
              onClick={onUndoRemove}
            >
              Undo
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
