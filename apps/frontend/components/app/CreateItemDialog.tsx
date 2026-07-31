"use client";

import Image from "next/image";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

type CreateItemDialogProps = {
  open: boolean;
  productHref?: string;
  techStackHref?: string;
  onOpenChange: (open: boolean) => void;
};

export function CreateItemDialog({
  open,
  productHref = "/products/new",
  techStackHref = "/tech-stack/edit",
  onOpenChange,
}: CreateItemDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className="fixed inset-0 z-[70] cursor-pointer bg-black/80 backdrop-blur-[4px] duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          onClick={() => onOpenChange(false)}
        />
        <Dialog.Popup
          aria-describedby="create-item-description"
          aria-labelledby="create-item-title"
          className="pointer-events-none fixed inset-0 z-[71] flex items-center justify-center overflow-y-auto px-6 py-10 outline-none"
        >
          <div className="pointer-events-auto relative z-[1] mx-auto w-full max-w-[1152px]">
            <div className="mb-12 text-center max-sm:mb-8">
              <h1
                className="mb-6 flex items-center justify-center gap-4 text-[48px] leading-[1.2] font-bold text-white max-sm:text-4xl"
                id="create-item-title"
              >
                <span className="motion-safe:animate-in motion-safe:slide-in-from-left-24 motion-safe:fade-in-0 motion-safe:duration-[400ms]">
                  Upload
                </span>
                <span className="motion-safe:animate-in motion-safe:slide-in-from-right-24 motion-safe:fade-in-0 motion-safe:duration-[400ms]">
                  item
                </span>
              </h1>
              <div
                className="motion-safe:animate-in motion-safe:slide-in-from-bottom-8 motion-safe:fade-in-0 motion-safe:duration-500 motion-safe:delay-100"
                id="create-item-description"
              >
                <p className="text-sm leading-[1.6] text-[#D0D0D0]">
                  Visualize your <strong className="font-bold text-[#07DE81]">tech stack</strong>,{" "}
                  <strong className="font-bold text-[#07DE81]">projects</strong>, and{" "}
                  <strong className="font-bold text-[#07DE81]">blog posts</strong> to showcase your engineering
                  skills to the world.
                </p>
                <p className="mt-2 text-sm leading-[1.6] text-[#D0D0D0]">
                  Share your value, expand your network, and accelerate your career.
                </p>
              </div>
            </div>

            <div className="mx-auto grid max-w-[640px] grid-cols-2 gap-12 max-sm:grid-cols-1 max-sm:gap-6">
              <CreateCard
                description="Add or edit your tech stack"
                href={techStackHref}
                imageAlt="TechStack"
                imageSrc="/lp/tech_stack_bg.jpg"
                title="TechStack"
                tone="left"
                onNavigate={() => onOpenChange(false)}
              />
              <CreateCard
                description="Create or edit your products"
                href={productHref}
                imageAlt="Product"
                imageSrc="/profile/banner-aurora.jpg"
                title="Product"
                tone="right"
                onNavigate={() => onOpenChange(false)}
              />
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CreateCard({
  description,
  href,
  imageAlt,
  imageSrc,
  onNavigate,
  title,
  tone,
}: {
  description: string;
  href: string;
  imageAlt: string;
  imageSrc: string;
  title: string;
  tone: "left" | "right";
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group block cursor-pointer overflow-hidden rounded-[8px] bg-white p-px transition-colors duration-200 hover:bg-[linear-gradient(135deg,#11998E_0%,#07DE81_100%)]",
        tone === "left"
          ? "motion-safe:animate-in motion-safe:slide-in-from-left-24 motion-safe:fade-in-0 motion-safe:duration-[400ms]"
          : "motion-safe:animate-in motion-safe:slide-in-from-right-24 motion-safe:fade-in-0 motion-safe:duration-[400ms]",
      )}
      onClick={onNavigate}
    >
      <span className="block overflow-hidden rounded-[7px] bg-[#272727]">
        <span className="relative block h-40 w-full overflow-hidden">
          <Image
            alt={imageAlt}
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            fill
            sizes="(max-width: 640px) calc(100vw - 48px), 296px"
            src={imageSrc}
          />
          <span className="absolute inset-0 bg-black/40 transition-colors duration-200 group-hover:bg-black/20" />
        </span>
        <span className="block p-4">
          <span className="mb-1 block text-lg font-bold text-white">{title}</span>
          <span className="flex items-center justify-between gap-3">
            <span className="min-w-0 flex-1 text-sm text-[#999999]">{description}</span>
            <span className="inline-flex size-6 shrink-0 items-center justify-center text-white transition duration-200 group-hover:scale-110 group-hover:text-[#07DE81] group-hover:drop-shadow-[0_0_8px_rgba(7,222,129,0.5)]">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 fill-current">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </span>
      </span>
    </Link>
  );
}
