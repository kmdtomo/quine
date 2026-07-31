"use client";

import { api } from "@convex/_generated/api";
import { usePreloadedQuery, type Preloaded } from "convex/react";

import { AppHeader } from "@/components/app/AppHeader";

import { TechStackDetailHeroSection } from "./TechStackDetailHeroSection";
import { TechStackDetailProductsSection } from "./TechStackDetailProductsSection";

type TechStackDetailContentProps = {
  preloadedDetail: Preloaded<typeof api.productTechnologies.getPublicDetail>;
};

export function TechStackDetailContent({
  preloadedDetail,
}: TechStackDetailContentProps) {
  const detail = usePreloadedQuery(preloadedDetail);

  if (!detail) {
    return (
      <div className="grid min-h-svh place-items-center bg-[#1A1A1A] px-6 text-center text-white">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-primary uppercase">
            Technology
          </p>
          <h1 className="mt-3 text-2xl font-bold">Technology not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-[#1A1A1A] text-white">
      <AppHeader activeItem={null} />

      <main className="h-svh overflow-y-auto pt-[68px]">
        <div className="mx-auto w-full max-w-7xl px-4 pb-12">
          <TechStackDetailHeroSection
            engineerCount={detail.engineerCount}
            engineerCountIsTruncated={detail.engineerCountIsTruncated}
            productCount={detail.productCount}
            productCountIsTruncated={detail.productCountIsTruncated}
            technologyName={detail.technology.name}
          />

          <div className="mb-6 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08)_20%,rgba(255,255,255,0.08)_80%,transparent)]" />

          <TechStackDetailProductsSection
            isTruncated={detail.productListIsTruncated}
            products={detail.products}
          />
        </div>
      </main>
    </div>
  );
}
