"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BellIcon,
  Grid2X2Icon,
  HomeIcon,
  LinkIcon,
  PencilIcon,
  SearchIcon,
} from "lucide-react";

import { CreateItemDialog } from "@/components/app/CreateItemDialog";
import { QuineLogo } from "@/components/brand/QuineLogo";
import { cn } from "@/lib/utils";

type AppHeaderItem = "home" | "products" | "search" | "create";

type AppHeaderProps = {
  activeItem?: AppHeaderItem;
  createProductHref?: string;
  createTechStackHref?: string;
  fixed?: boolean;
  guided?: boolean;
  guideHref?: string;
  homeHref?: string;
};

const navItems = [
  {
    key: "home",
    label: "Home",
    icon: HomeIcon,
  },
  {
    key: "products",
    label: "Products",
    href: "/products",
    icon: Grid2X2Icon,
  },
  {
    key: "search",
    label: "Search",
    href: "/products",
    icon: SearchIcon,
  },
  {
    key: "create",
    label: "Create new",
    icon: PencilIcon,
  },
] satisfies {
  href?: string;
  key: AppHeaderItem;
  label: string;
  icon: typeof HomeIcon;
}[];

export function AppHeader({
  activeItem = "home",
  createProductHref = "/products/new",
  createTechStackHref = "/tech-stack/edit",
  fixed = true,
  guided = false,
  guideHref = "/",
  homeHref = "/",
}: AppHeaderProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyProfileLink() {
    const url = new URL(homeHref, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <header
        className={cn(
          "pointer-events-none right-0 left-0 z-[60] h-14",
          fixed ? "fixed top-3" : "relative",
        )}
      >
        <div className="mx-auto grid h-full max-w-[1400px] grid-cols-[1fr_auto_1fr] items-center gap-5 px-10">
          <div
            className={cn(
              "pointer-events-auto flex items-center justify-self-start transition",
              guided &&
                "pointer-events-none cursor-not-allowed opacity-35 grayscale",
            )}
          >
            <QuineLogo href={homeHref} priority />
          </div>

          <nav className="pointer-events-auto flex items-center justify-center">
            <ul className="flex items-center gap-10">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = !guided && item.key === activeItem;
                const guide = guided && item.key === "home";
                const disabled = guided && !guide;
                const className = cn(
                  "relative flex rounded-lg p-2 text-[#6A6A6A] transition hover:text-white",
                  active && "text-primary",
                  disabled && "pointer-events-none",
                  guide && "text-primary",
                );

                const content = (
                  <>
                    <Icon className="size-5" aria-hidden="true" />
                    {active ? (
                      <span className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-gradient-to-b from-primary to-[#11998E]" />
                    ) : null}
                    {guide ? (
                      <span className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 rounded-full bg-white px-5 py-1 text-[11px] font-bold tracking-[0.08em] whitespace-nowrap text-[#0d0d0d] shadow-[0_4px_16px_rgba(0,0,0,0.35)] before:absolute before:-top-1 before:left-1/2 before:size-2 before:-translate-x-1/2 before:rotate-45 before:bg-white">
                        Next
                      </span>
                    ) : null}
                  </>
                );

                if (item.key === "home") {
                  return (
                    <li key={item.key}>
                      <Link href={guided ? guideHref : homeHref} className={className} aria-label={item.label}>
                        {content}
                      </Link>
                    </li>
                  );
                }

                if (item.key === "create") {
                  return (
                    <li key={item.key}>
                      <button
                        type="button"
                        className={className}
                        aria-label={item.label}
                        onClick={() => {
                          if (!disabled) {
                            setCreateOpen(true);
                          }
                        }}
                      >
                        {content}
                      </button>
                    </li>
                  );
                }

                if (item.href) {
                  return (
                    <li key={item.key}>
                      <Link href={item.href} className={className} aria-label={item.label}>
                        {content}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.key}>
                    <button type="button" className={className} aria-label={item.label}>
                      {content}
                    </button>
                  </li>
                );
              })}

              <li>
                <button
                  type="button"
                  className={cn(
                    "relative flex rounded-lg p-2 text-[#6A6A6A] transition hover:text-white",
                    guided && "pointer-events-none",
                  )}
                  aria-label="Copy profile link"
                  onClick={copyProfileLink}
                >
                  <LinkIcon className="size-5" aria-hidden="true" />
                  {copied ? (
                    <span className="absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[11px] font-bold whitespace-nowrap text-[#0d0d0d] shadow-[0_4px_16px_rgba(0,0,0,0.35)]">
                      Copied
                    </span>
                  ) : null}
                </button>
              </li>
            </ul>
          </nav>

          <div className="pointer-events-auto inline-flex items-center gap-3 justify-self-end">
            <button
              type="button"
              className={cn(
                "relative grid size-9 place-items-center rounded-full text-[#999] transition hover:bg-white/[0.06] hover:text-white",
                guided && "pointer-events-none",
              )}
              aria-label="Notifications"
            >
              <BellIcon className="size-5" aria-hidden="true" />
              <span className="absolute top-2 right-2 size-[7px] rounded-full bg-primary shadow-[0_0_6px_rgba(7,222,129,0.6)]" />
            </button>
          </div>
        </div>
      </header>

      <CreateItemDialog
        open={createOpen}
        productHref={createProductHref}
        techStackHref={createTechStackHref}
        onOpenChange={setCreateOpen}
      />
    </>
  );
}
