"use client";

import type { ReactNode } from "react";

import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type GlassModalProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  closeLabel?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showCloseButton?: boolean;
  titleId: string;
};

export function GlassModal({
  children,
  className,
  contentClassName,
  closeLabel = "Close",
  open,
  onOpenChange,
  showCloseButton = true,
  titleId,
}: GlassModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-100 bg-black/55 backdrop-blur-2xl duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup
          aria-labelledby={titleId}
          className={cn(
            "fixed top-1/2 left-1/2 z-100 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/70 p-8 text-center shadow-2xl backdrop-blur-3xl duration-200 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-open:slide-in-from-bottom-2 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-transparent" />
          <div className="pointer-events-none absolute inset-x-10 -bottom-28 h-52 rounded-full bg-primary/10 blur-3xl" />
          {showCloseButton ? (
            <Dialog.Close
              type="button"
              className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
              aria-label={closeLabel}
              onClick={() => onOpenChange(false)}
            >
              <XIcon className="size-4" />
            </Dialog.Close>
          ) : null}
          <div className={cn("relative", contentClassName)}>{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
