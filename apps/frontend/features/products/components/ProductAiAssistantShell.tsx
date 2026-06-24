"use client";

import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import {
  ArrowUpIcon,
  AttachIcon,
  ExpandIcon,
  MicIcon,
  SparkleIcon,
} from "./ProductEditPrimitives";

export function ProductAiAssistantShell() {
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(false);

  function closeAssistant() {
    setExpanded(false);
    setOpen(false);
  }

  return (
    <div className="fixed right-5 bottom-5 z-[65] max-sm:right-3 max-sm:bottom-3 max-sm:left-3">
      <button
        type="button"
        className={cn(
          "grid size-14 place-items-center rounded-full bg-[linear-gradient(180deg,#07DE81_0%,#11998E_100%)] text-[#06140F] shadow-[0_12px_40px_rgba(7,222,129,0.24),0_20px_70px_rgba(0,0,0,0.45)] transition hover:scale-105 max-sm:ml-auto",
          open && "hidden",
        )}
        aria-label="Open AI assistant"
        onClick={() => setOpen(true)}
      >
        <SparkleIcon className="size-6" />
      </button>

      <section
        className={cn(
          "relative flex flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-[#101010]/95 shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-[22px] transition-[width,height] duration-200 max-sm:h-[calc(100vh-24px)] max-sm:w-auto",
          expanded
            ? "h-[min(780px,calc(100vh-100px))] w-[min(720px,calc(100vw-40px))]"
            : "h-[520px] w-[360px]",
          !open && "hidden",
        )}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[18px] bg-[radial-gradient(circle_at_20%_0%,rgba(7,222,129,0.16),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_24%)]" />
        <header className="relative flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-[9px] bg-[linear-gradient(180deg,#07DE81_0%,#11998E_100%)] text-[#06140F]">
              <SparkleIcon className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">Quine AI</h3>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="grid size-7 place-items-center rounded-[6px] text-[#888888] transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Expand"
              aria-pressed={expanded}
              onClick={() => setExpanded((current) => !current)}
            >
              <ExpandIcon className="size-3.5" />
            </button>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-[6px] text-[#888888] transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Minimize"
              onClick={closeAssistant}
            >
              <ChevronDownIcon className="size-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="relative flex-1 overflow-y-auto px-4 py-4" aria-live="polite" />

        <form
          className="relative border-t border-white/[0.08] p-3"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="rounded-[14px] border border-white/[0.08] bg-black/30 p-2 transition focus-within:border-[#07DE81]/40">
            <textarea
              className="min-h-10 w-full resize-none bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-[#777777]"
              placeholder="Send a message..."
              rows={1}
            />
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-[7px] text-[#888888] transition hover:bg-white/[0.06] hover:text-white"
                  aria-label="Attach file"
                >
                  <AttachIcon className="size-3.5" />
                </button>
                <button
                  type="button"
                  className="grid size-7 place-items-center rounded-[7px] text-[#888888] transition hover:bg-white/[0.06] hover:text-white"
                  aria-label="Voice input"
                >
                  <MicIcon className="size-3.5" />
                </button>
              </div>
              <button
                type="submit"
                className="grid size-8 place-items-center rounded-[9px] bg-white text-black transition hover:bg-[#07DE81]"
                aria-label="Send"
              >
                <ArrowUpIcon className="size-4" />
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
