"use client";

import type { ReactNode } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type DropdownSelectOption = {
  disabled?: boolean;
  label: ReactNode;
  value: string;
};

type DropdownSelectProps = {
  ariaLabel: string;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
  itemClassName?: string;
  onValueChange: (value: string) => void;
  options: readonly DropdownSelectOption[];
  placeholder?: string;
  triggerClassName?: string;
  value: string;
  valueClassName?: string;
};

export function DropdownSelect({
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
}: DropdownSelectProps) {
  const selectedOption = options.find((option) => option.value === value);
  const label = selectedOption?.label ?? placeholder;

  return (
    <div className={cn("min-w-0", className)}>
      <Select
        disabled={disabled}
        items={options}
        value={value}
        onValueChange={(nextValue) => {
          if (typeof nextValue === "string") {
            onValueChange(nextValue);
          }
        }}
      >
        <SelectTrigger
          aria-label={ariaLabel}
          className={cn("w-full", triggerClassName)}
        >
          <span className={cn("min-w-0 truncate text-left", valueClassName)}>
            {label}
          </span>
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger={false}
          className={cn(
            "max-h-64 min-w-56 rounded-xl border border-white/10 bg-[#1E1E1E]/95 p-1 text-[#D0D0D0] shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)] ring-0 backdrop-blur-xl",
            contentClassName,
          )}
          sideOffset={6}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              className={cn(
                "cursor-pointer rounded-lg px-2 py-2 text-xs text-[#D0D0D0] focus:bg-white/[0.06] focus:text-white",
                itemClassName,
              )}
              disabled={option.disabled}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
