import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const fieldFrameClass =
  "block rounded-[8px] bg-[#2A2A2A] p-px transition focus-within:bg-[linear-gradient(135deg,#11998E_0%,#07DE81_100%)] hover:bg-[linear-gradient(135deg,#11998E_0%,#07DE81_100%)]";
export const fieldClass =
  "w-full rounded-[7px] bg-[#0D0D0D] px-4 py-2.5 text-sm text-white outline-none placeholder:text-[#7A7A7A]";
export const buttonBaseClass =
  "inline-flex items-center justify-center gap-2 rounded-[8px] text-[13px] font-bold transition disabled:pointer-events-none disabled:opacity-50";
export const gradientButtonClass =
  "border border-[#d1d5db] bg-[#191918] px-6 py-2 text-white hover:border-white hover:bg-white hover:text-[#0A0A0A]";
export const ghostButtonClass =
  "border border-[#2A2A2A] bg-transparent px-5 py-2 text-white hover:border-[#3A3A3A] hover:bg-[#1A1A1A]";

export function FieldGroup({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[11px] font-medium tracking-[0.06em] text-[#999999] uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

export function UrlField({
  icon,
  label,
  onChange,
  placeholder,
  value,
}: {
  icon: ReactNode;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <FieldGroup label={label}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-5 shrink-0 place-items-center text-white">
          {icon}
        </span>
        <label className={cn(fieldFrameClass, "min-w-0 flex-1")}>
          <span className="sr-only">{label}</span>
          <input
            type="url"
            className={cn(fieldClass, "px-3.5 py-2 text-[13px]")}
            placeholder={placeholder}
            value={value}
            onChange={(event) => onChange(event.currentTarget.value)}
          />
        </label>
      </div>
    </FieldGroup>
  );
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.65 5.58.65 11.85c0 5.01 3.25 9.26 7.76 10.76.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.16.69-3.83-1.34-3.83-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.71.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.66 1.24 3.31.95.1-.74.4-1.24.72-1.53-2.52-.29-5.18-1.26-5.18-5.62 0-1.24.44-2.26 1.17-3.06-.12-.29-.51-1.45.11-3.02 0 0 .95-.31 3.12 1.17.91-.25 1.88-.38 2.84-.39.96.01 1.93.13 2.84.39 2.17-1.47 3.12-1.17 3.12-1.17.62 1.57.23 2.73.11 3.02.73.8 1.17 1.82 1.17 3.06 0 4.37-2.67 5.33-5.2 5.61.41.35.77 1.04.77 2.1 0 1.51-.01 2.73-.01 3.1 0 .3.21.66.79.55 4.5-1.5 7.75-5.75 7.75-10.76C23.35 5.58 18.27.5 12 .5z" />
    </svg>
  );
}

export function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" />
    </svg>
  );
}

export function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

export function AttachIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

export function MicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10v2a7 7 0 0014 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}
