import Link from "next/link";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";

type TechStackDetailProduct = {
  _id: string;
  author: {
    company: string | undefined;
    image: string | undefined;
    name: string | undefined;
    username: string;
  };
  content: string;
  logo: string | undefined;
  name: string;
  projectType: "personal" | "work" | "open_source";
  slug: string;
  tagline: string;
  technologies: {
    name: string;
    technologyKey: string;
  }[];
};

type TechStackDetailProductsSectionProps = {
  isTruncated: boolean;
  products: TechStackDetailProduct[];
};

export function TechStackDetailProductsSection({
  isTruncated,
  products,
}: TechStackDetailProductsSectionProps) {
  if (products.length === 0) {
    return (
      <section className="grid min-h-64 place-items-center text-center">
        <div>
          <h2 className="text-lg font-bold text-white/70">
            {isTruncated
              ? "No products in the loaded results"
              : "No public products yet"}
          </h2>
          <p className="mt-2 text-sm text-white/35">
            {isTruncated
              ? "Additional matching products may exist beyond this bounded scan."
              : "Products using this technology will appear here."}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="grid grid-cols-2 gap-4 max-[960px]:grid-cols-1">
      {products.map((product) => (
        <Link
          key={product._id}
          href={getProductHref(product.author.username, product.slug)}
          className="group relative rounded-lg border border-[#3A3A3A] bg-[#1E1E1E] p-4 transition duration-200 hover:border-primary/70"
        >
          <header className="mb-3 flex items-start gap-3">
            <ProductLogo logo={product.logo} name={product.name} />

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-baseline gap-2">
                  <h2 className="truncate text-lg font-bold text-white">
                    {product.name}
                  </h2>
                  <span className="text-lg text-[#999]">·</span>
                  <span className="shrink-0 text-xs text-[#D0D0D0]">
                    {getProjectTypeLabel(product.projectType)}
                  </span>
                </div>
                <ProductTechnologyBadges technologies={product.technologies} />
              </div>

              <p className="mb-2 flex items-center gap-2 text-xs text-[#999] before:block before:h-0.5 before:w-4 before:shrink-0 before:bg-[#999]">
                <span className="truncate">{product.tagline}</span>
              </p>
            </div>
          </header>

          <p className="line-clamp-2 text-xs leading-[1.6] text-[#D0D0D0]">
            {product.content || "No description yet."}
          </p>

          <div className="mt-3 flex min-w-0 items-center gap-2 border-t border-[#3A3A3A] pt-3 text-xs leading-none">
            <AuthorAvatar
              image={product.author.image}
              label={getAuthorLabel(product)}
            />
            <span className="truncate font-medium text-white">
              {getAuthorLabel(product)}
            </span>
            <span className="shrink-0 text-[#999]">·</span>
            <span className="min-w-0 truncate text-[#999]">
              {product.author.company ?? "Independent"}
            </span>
          </div>
        </Link>
      ))}
      {isTruncated ? (
        <p className="col-span-full py-2 text-center text-xs text-white/35">
          Additional matching products may not be shown.
        </p>
      ) : null}
    </section>
  );
}

function ProductLogo({
  logo,
  name,
}: {
  logo: string | undefined;
  name: string;
}) {
  return (
    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#333] text-sm font-bold text-white">
      {logo ? (
        // Product images may use arbitrary user-configured origins.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logo} alt="" className="size-full object-cover" />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

function ProductTechnologyBadges({
  technologies,
}: {
  technologies: TechStackDetailProduct["technologies"];
}) {
  const visibleTechnologies = technologies.slice(0, 6);
  const hasHiddenTechnologies = technologies.length > visibleTechnologies.length;

  if (visibleTechnologies.length === 0) {
    return null;
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      {visibleTechnologies.map((technology) => (
        <TechnologyLogo
          key={technology.technologyKey}
          name={technology.name}
          className="size-[22px] rounded-lg border-0 bg-white"
          fallbackClassName="text-[9px]"
          imageClassName="size-[78%]"
        />
      ))}
      {hasHiddenTechnologies ? (
        <span className="ml-0.5 text-xs text-[#999]">...</span>
      ) : null}
    </div>
  );
}

function AuthorAvatar({
  image,
  label,
}: {
  image: string | undefined;
  label: string;
}) {
  return (
    <span className="grid size-[22px] shrink-0 place-items-center overflow-hidden rounded-full bg-[#333] text-[9px] font-bold text-white">
      {image ? (
        // Profile images may use arbitrary OAuth or user-configured origins.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt="" className="size-full object-cover" />
      ) : (
        label.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

function getAuthorLabel(product: TechStackDetailProduct) {
  return product.author.name ?? product.author.username;
}

function getProductHref(username: string, slug: string) {
  return `/@${encodeURIComponent(username)}/${encodeURIComponent(slug)}`;
}

function getProjectTypeLabel(projectType: TechStackDetailProduct["projectType"]) {
  if (projectType === "open_source") {
    return "Open Source";
  }
  if (projectType === "work") {
    return "Work";
  }
  return "Personal";
}
