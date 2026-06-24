"use client";

import type { ReactNode } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type DropdownMultiSelectOption = {
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

type DropdownMultiSelectProps = {
  ariaLabel: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  itemClassName?: string;
  onValueChange: (value: string[]) => void;
  options: readonly DropdownMultiSelectOption[];
  placeholder?: string;
  triggerClassName?: string;
  value: readonly string[];
  valueClassName?: string;
};

export function DropdownMultiSelect({
  ariaLabel,
  className,
  contentClassName,
  disabled = false,
  itemClassName,
  onValueChange,
  options,
  placeholder = "Select",
  triggerClassName,
  value,
  valueClassName,
}: DropdownMultiSelectProps) {
  const selectedLabels = value.map((selectedValue) => {
    const option = options.find((item) => item.value === selectedValue);
    return option?.label ?? selectedValue;
  });
  const selectedValueSet = new Set(value);

  function toggleValue(optionValue: string) {
    const nextValue = selectedValueSet.has(optionValue)
      ? value.filter((selectedValue) => selectedValue !== optionValue)
      : [...value, optionValue];
    onValueChange(nextValue);
  }

  return (
    <div className={cn("min-w-0", className)}>
      <Popover>
        <PopoverTrigger
          type="button"
          aria-label={ariaLabel}
          className={cn(
            "flex h-8 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30 dark:hover:bg-input/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            triggerClassName,
          )}
          disabled={disabled}
        >
          <span className={cn("min-w-0 truncate text-left", valueClassName)}>
            {selectedLabels.length === 0 ? (
              placeholder
            ) : selectedLabels.length === 1 ? (
              selectedLabels[0]
            ) : (
              <>
                {selectedLabels[0]}
                <span className="ml-1 text-white/45">
                  +{selectedLabels.length - 1}
                </span>
              </>
            )}
          </span>
          <ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(
            "max-h-64 w-(--anchor-width) min-w-56 gap-0 overflow-y-auto rounded-xl border border-white/10 bg-[#1E1E1E]/95 p-1 text-[#D0D0D0] shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)] ring-0 backdrop-blur-xl",
            contentClassName,
          )}
          sideOffset={6}
        >
          {options.map((option) => {
            const selected = selectedValueSet.has(option.value);
            return (
              <button
                key={option.value}
                type="button"
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-[#D0D0D0] outline-none transition hover:bg-white/[0.06] hover:text-white focus:bg-white/[0.06] focus:text-white disabled:cursor-not-allowed disabled:opacity-45",
                  itemClassName,
                )}
                aria-pressed={selected}
                disabled={option.disabled}
                onClick={() => toggleValue(option.value)}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-[4px] border border-white/15 text-transparent transition",
                    selected &&
                      "border-white/30 bg-white/[0.14] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
                  )}
                >
                  <CheckIcon className="size-3" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
              </button>
            );
          })}
        </PopoverContent>
      </Popover>
    </div>
  );
}
