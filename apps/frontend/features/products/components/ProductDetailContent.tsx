"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckIcon,
  GitBranchIcon,
  PencilIcon,
  PlusIcon,
  UsersIcon,
  XIcon,
} from "lucide-react";

import { api } from "@convex/_generated/api";
import {
  useMutation,
  usePreloadedQuery,
  type Preloaded,
} from "convex/react";

import { AppHeader } from "@/components/app/AppHeader";
import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getProductErrorMessage } from "../product-error";
import {
  AuthorLink,
  getProjectTypeLabel,
  getTeamSizeLabel,
  ProductExternalLink,
  ProductLogoMark,
  ProductTechBadges,
  ProductTypeIcon,
} from "./product-ui";
import type { ProductTechnology } from "./product-ui";

type ProductDetailContentProps = {
  preloadedProduct: Preloaded<typeof api.products.getBySlug>;
};

type DetailDeveloper = {
  _id: string;
  company: string | undefined;
  image: string | undefined;
  name: string | undefined;
  roles: string[];
  status: "invited" | "active" | "declined";
  username: string | undefined;
};

export function ProductDetailContent({
  preloadedProduct,
}: ProductDetailContentProps) {
  const product = usePreloadedQuery(preloadedProduct);
  const requestToJoin = useMutation(api.productDevelopers.requestToJoin);
  const [developerModalOpen, setDeveloperModalOpen] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState<string | null>(null);

  const groupedTechnologies = useMemo(
    () => groupTechnologies(product?.technologies ?? []),
    [product?.technologies],
  );

  async function handleJoinRequest() {
    if (!product || joining) {
      return;
    }

    setJoining(true);
    setJoinMessage(null);
    try {
      await requestToJoin({
        productId: product._id,
        roles: ["Contributor"],
      });
      setJoinMessage("Request sent.");
    } catch (unknownError: unknown) {
      setJoinMessage(
        getProductErrorMessage(unknownError, "Could not send request."),
      );
    } finally {
      setJoining(false);
    }
  }

  if (!product) {
    return (
      <div className="min-h-svh bg-[#1A1A1A] text-white">
        <AppHeader />
        <main className="grid min-h-svh place-items-center px-6 text-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.14em] text-primary uppercase">
              Quine
            </p>
            <h1 className="mt-3 text-2xl font-semibold">Product not found</h1>
          </div>
        </main>
      </div>
    );
  }

  const productUrlLabel = getExternalLabel(product.productUrl);
  const githubUrlLabel = getExternalLabel(product.githubUrl);

  return (
    <div className="min-h-svh bg-[#1A1A1A] text-white">
      <AppHeader />

      <main className="mx-auto grid min-h-svh w-full max-w-7xl grid-cols-[minmax(0,1fr)_340px] gap-5 px-6 pt-[92px] pb-10 max-lg:grid-cols-1">
        <section className="min-w-0 rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]">
          <header className="mb-6 flex items-start gap-4">
            <ProductLogoMark
              className="size-[76px] rounded-[18px] text-2xl"
              logo={product.logo}
              name={product.name}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <h1 className="truncate text-3xl font-bold tracking-tight text-white">
                      {product.name}
                    </h1>
                    <button
                      type="button"
                      className="flex shrink-0 -space-x-2 rounded-full border border-white/10 bg-[#1E1E1E] p-1 transition hover:border-primary/60"
                      aria-label="View developers"
                      onClick={() => setDeveloperModalOpen(true)}
                    >
                      {product.developers
                        .slice(0, 4)
                        .map((developer: DetailDeveloper) => (
                          <DeveloperAvatar
                            key={developer._id}
                            developer={developer}
                          />
                        ))}
                      <span className="grid size-8 place-items-center rounded-full border border-[#272727] bg-primary text-[#111]">
                        <PlusIcon className="size-4" aria-hidden="true" />
                      </span>
                    </button>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[#D0D0D0]">
                    {product.tagline}
                  </p>
                </div>

                {product.viewerCanEdit ? (
                  <Link
                    href={`/products/${product._id}/edit`}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 text-sm font-bold text-primary transition hover:bg-primary/15"
                  >
                    <PencilIcon className="size-4" aria-hidden="true" />
                    Edit
                  </Link>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3A3A3A] bg-[#1E1E1E] px-3 py-1.5 text-xs text-[#D0D0D0]">
                  <ProductTypeIcon
                    className="size-3.5"
                    projectType={product.projectType}
                  />
                  {getProjectTypeLabel(product.projectType)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3A3A3A] bg-[#1E1E1E] px-3 py-1.5 text-xs text-[#D0D0D0]">
                  <UsersIcon className="size-3.5" aria-hidden="true" />
                  {getTeamSizeLabel(product.teamSize)}
                </span>
                <ProductExternalLink
                  href={product.productUrl}
                  label={productUrlLabel}
                />
                {product.githubUrl ? (
                  <a
                    href={product.githubUrl}
                    className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#3A3A3A] bg-[#1E1E1E] px-3 py-1.5 text-xs text-[#D0D0D0] transition hover:border-primary/60 hover:text-white"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <GitBranchIcon className="size-3.5 shrink-0" aria-hidden="true" />
                    <span className="truncate">{githubUrlLabel}</span>
                  </a>
                ) : null}
              </div>
            </div>
          </header>

          <section className="border-t border-[#3A3A3A] pt-6">
            <h2 className="mb-3 text-sm font-bold text-white/65">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-7 text-[#D0D0D0]">
              {product.content || "No description yet."}
            </p>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-sm font-bold text-white/65">Screenshots</h2>
            {product.screenshots.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                {product.screenshots.map(
                  (screenshot: string, index: number) => (
                    <div
                      key={`${screenshot}-${index}`}
                      className="aspect-video overflow-hidden rounded-xl border border-[#3A3A3A] bg-[#1E1E1E]"
                    >
                      <img
                        src={screenshot}
                        alt=""
                        className="size-full object-cover"
                      />
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="grid min-h-36 place-items-center rounded-xl border border-dashed border-white/15 bg-[#1E1E1E] text-sm text-white/35">
                No screenshots yet
              </div>
            )}
          </section>
        </section>

        <aside className="min-w-0 space-y-5">
          <section className="rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]">
            <h2 className="mb-4 text-sm font-bold text-white/65">Creator</h2>
            <AuthorLink
              company={product.author?.company}
              image={product.author?.image}
              name={product.author?.name}
              username={product.author?.username}
            />
          </section>

          <section className="rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-white/65">
                Product Tech Stack
              </h2>
              <ProductTechBadges compact technologies={product.technologies} />
            </div>
            <div className="space-y-5">
              {groupedTechnologies.length > 0 ? (
                groupedTechnologies.map((group) => (
                  <div key={group.categoryName}>
                    <h3 className="mb-2 text-xs font-bold text-white/35">
                      {group.categoryName}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {group.items.map((technology) => (
                        <div
                          key={technology.technologyKey}
                          className="flex min-w-0 items-center gap-2 rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] p-2"
                        >
                          <TechnologyLogo
                            name={technology.name}
                            className="size-8 rounded-lg border-0 bg-white"
                            imageClassName="size-[76%]"
                          />
                          <span className="truncate text-xs font-bold text-[#D0D0D0]">
                            {technology.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-white/10 bg-[#1E1E1E] p-4 text-center text-sm text-white/35">
                  No tech stacks selected
                </p>
              )}
            </div>
          </section>
        </aside>
      </main>

      {developerModalOpen ? (
        <DevelopersModal
          developers={product.developers}
          joinMessage={joinMessage}
          joining={joining}
          productName={product.name}
          onClose={() => setDeveloperModalOpen(false)}
          onJoin={handleJoinRequest}
        />
      ) : null}
    </div>
  );
}

function DevelopersModal({
  developers,
  joinMessage,
  joining,
  onClose,
  onJoin,
  productName,
}: {
  developers: DetailDeveloper[];
  joinMessage: string | null;
  joining: boolean;
  productName: string;
  onClose: () => void;
  onJoin: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur"
        aria-label="Close developers modal"
        onClick={onClose}
      />
      <section className="relative flex max-h-[calc(100vh-48px)] w-[760px] max-w-[calc(100vw-32px)] flex-col rounded-[18px] border border-[#3A3A3A] bg-[#272727] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.4),0_4px_8px_rgba(0,0,0,0.2)]">
        <button
          type="button"
          className="absolute top-4 right-4 grid size-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
          onClick={onClose}
        >
          <XIcon className="size-4" aria-hidden="true" />
        </button>
        <header className="pr-10">
          <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
            Developers
          </p>
          <h2 className="mt-2 text-2xl font-bold text-white">
            Meet the Engineers
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/45">
            {developers.length} engineers are shipping {productName}. Open a
            profile to read their story, or join the team and add yours.
          </p>
        </header>

        <div className="mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {developers.length > 0 ? (
            developers.map((developer) => (
              <div
                key={developer._id}
                className="rounded-xl border border-[#3A3A3A] bg-[#1E1E1E] p-4"
              >
                <AuthorLink
                  company={developer.roles.join(" · ") || developer.company}
                  image={developer.image}
                  name={developer.name}
                  username={developer.username}
                />
              </div>
            ))
          ) : (
            <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-white/10 bg-[#1E1E1E] text-center text-sm text-white/35">
              No active developers yet
            </div>
          )}
        </div>

        <footer className="mt-6 flex items-center justify-between gap-3 border-t border-[#3A3A3A] pt-4">
          <span
            className={cn(
              "text-xs text-white/35",
              joinMessage?.includes("sent") && "text-primary",
            )}
          >
            {joinMessage ?? "Become part of this product's story."}
          </span>
          <Button
            type="button"
            className="h-10 rounded-full bg-[linear-gradient(135deg,#11998E_0%,#07DE81_100%)] px-4 font-bold text-white hover:opacity-90"
            disabled={joining}
            onClick={onJoin}
          >
            {joining ? (
              "Sending..."
            ) : (
              <>
                <CheckIcon className="size-4" aria-hidden="true" />
                Join as Developer
              </>
            )}
          </Button>
        </footer>
      </section>
    </div>
  );
}

function DeveloperAvatar({ developer }: { developer: DetailDeveloper }) {
  const label = developer.name ?? developer.username ?? "Q";

  return (
    <span className="grid size-8 place-items-center overflow-hidden rounded-full border border-[#272727] bg-[#333] text-xs font-bold text-white">
      {developer.image ? (
        <img src={developer.image} alt="" className="size-full object-cover" />
      ) : (
        label.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

function groupTechnologies(technologies: ProductTechnology[]) {
  const categoryNames = Array.from(
    new Set(
      technologies.map(
        (technology) => technology.categoryName ?? "Other",
      ),
    ),
  );

  return categoryNames.map((categoryName) => ({
    categoryName,
    items: technologies.filter(
      (technology) => (technology.categoryName ?? "Other") === categoryName,
    ),
  }));
}

function getExternalLabel(value: string | undefined) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return url.hostname.replace(/^www\./, "") + url.pathname.replace(/\/$/, "");
  } catch {
    return value;
  }
}
