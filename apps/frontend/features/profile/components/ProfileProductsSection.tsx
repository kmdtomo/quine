import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { getProductHref } from "../profile-links";
import type { ProfileProduct } from "../profile-types";
import {
  EmptyState,
  ProductLogo,
  TechBadges,
} from "./profile-ui";

export function ProfileProductsSection({
  onCreate,
  products,
  username,
}: {
  onCreate?: () => void;
  products: ProfileProduct[];
  username: string | undefined;
}) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-[#3A3A3A] bg-[#272727] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.3),0_1px_2px_rgba(0,0,0,0.2)] max-[1024px]:p-3">
      <div className="mb-4 flex shrink-0 items-center gap-5">
        <span className="relative py-1 text-sm font-bold text-white after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-3/5 after:-translate-x-1/2 after:rounded-full after:bg-gradient-to-r after:from-primary after:to-[#11998E]">
          Product
        </span>
        <span className="py-1 text-sm font-bold text-white/25">
          Blogs
        </span>
      </div>

      <div className="-m-1 min-h-0 flex-1 space-y-3 overflow-y-auto p-1 pr-3">
        {products.length > 0 ? (
          products.map((product) => (
            <Link
              key={product._id}
              href={getProductHref(username, product.slug)}
              className="rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] p-4 transition hover:border-primary/50 max-[1024px]:p-3"
            >
              <header className="mb-3 flex items-start gap-3">
                <ProductLogo
                  logo={product.logo}
                  name={product.name}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-baseline gap-2">
                        <h3 className="truncate text-sm font-bold text-white">
                          {product.name}
                        </h3>
                        <span className="text-sm text-white/30">/</span>
                        <span className="shrink-0 text-xs text-white/50">
                          {getProjectTypeLabel(product.projectType)}
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-2 text-xs text-white/35 before:block before:h-0.5 before:w-4 before:bg-white/30">
                        {product.tagline}
                      </p>
                    </div>
                    <TechBadges
                      technologies={product.technologies}
                    />
                  </div>
                </div>
              </header>
              <p className="max-h-10 overflow-hidden text-xs leading-5 text-white/55">
                {product.content}
              </p>
            </Link>
          ))
        ) : (
          <EmptyState
            actionLabel="Create"
            icon={<PlusIcon className="size-7" aria-hidden="true" />}
            onAction={onCreate}
            title="No products yet"
          />
        )}
      </div>
    </section>
  );
}

export function getProjectSummary(products: ProfileProduct[]) {
  return products.reduce(
    (summary, product) => {
      if (product.projectType === "open_source") {
        summary.openSource += 1;
      } else if (product.projectType === "personal") {
        summary.personal += 1;
      } else {
        summary.work += 1;
      }
      return summary;
    },
    { openSource: 0, personal: 0, work: 0 },
  );
}

function getProjectTypeLabel(projectType: string) {
  if (projectType === "open_source") {
    return "OSS";
  }
  if (projectType === "personal") {
    return "Personal";
  }
  return "Work";
}
