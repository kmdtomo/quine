import Link from "next/link";
import {
  BriefcaseBusinessIcon,
  GitForkIcon,
  LinkIcon,
  UserIcon,
} from "lucide-react";

import { TechnologyLogo } from "@/components/tech-stack/TechnologyLogo";
import { cn } from "@/lib/utils";

export type ProductProjectType = "personal" | "work" | "open_source";
export type ProductTeamSize = "solo" | "2-5" | "6-10" | "11-30" | "31+";

export type ProductTechnology = {
  categoryName?: string;
  name: string;
  order?: number;
  technologyKey: string;
};

export const PROJECT_TYPE_OPTIONS: {
  label: string;
  value: ProductProjectType;
}[] = [
  { label: "Personal", value: "personal" },
  { label: "Work", value: "work" },
  { label: "Open Source", value: "open_source" },
];

export const TEAM_SIZE_OPTIONS: {
  label: string;
  value: ProductTeamSize;
}[] = [
  { label: "1 person", value: "solo" },
  { label: "2-5 people", value: "2-5" },
  { label: "6-10 people", value: "6-10" },
  { label: "11-30 people", value: "11-30" },
  { label: "31+ people", value: "31+" },
];

export const PRODUCT_ROLE_OPTIONS = [
  "Creator",
  "Founder",
  "Tech Lead",
  "Full Stack Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Mobile Engineer",
  "SRE",
  "DevOps Engineer",
  "Data Engineer",
  "ML Engineer",
  "Product Designer",
  "Product Manager",
];

export function getProjectTypeLabel(projectType: string) {
  if (projectType === "open_source") {
    return "Open Source";
  }
  if (projectType === "work") {
    return "Work";
  }
  return "Personal";
}

export function getCompactProjectTypeLabel(projectType: string) {
  if (projectType === "open_source") {
    return "OSS";
  }
  if (projectType === "work") {
    return "Work";
  }
  return "Personal";
}

export function getTeamSizeLabel(teamSize: string | undefined) {
  if (teamSize === undefined) {
    return "Team size not set";
  }

  const option = TEAM_SIZE_OPTIONS.find((item) => item.value === teamSize);
  return option?.label ?? teamSize;
}

export function isProductProjectType(value: string): value is ProductProjectType {
  return PROJECT_TYPE_OPTIONS.some((option) => option.value === value);
}

export function isProductTeamSize(value: string): value is ProductTeamSize {
  return TEAM_SIZE_OPTIONS.some((option) => option.value === value);
}

export function getProfileHref(username: string | undefined) {
  const normalizedUsername = normalizeUsername(username);
  return normalizedUsername
    ? `/@${encodeURIComponent(normalizedUsername)}`
    : "/products";
}

export function getProductHref(username: string | undefined, slug: string) {
  const normalizedUsername = normalizeUsername(username);
  return normalizedUsername
    ? `/@${encodeURIComponent(normalizedUsername)}/${encodeURIComponent(slug)}`
    : "/products";
}

export function normalizeUsername(username: string | undefined) {
  if (!username) {
    return undefined;
  }

  const normalizedUsername = username.startsWith("@")
    ? username.slice(1)
    : username;
  return normalizedUsername.length > 0 ? normalizedUsername : undefined;
}

export function ProductLogoMark({
  className,
  logo,
  name,
}: {
  className?: string;
  logo: string | undefined;
  name: string;
}) {
  return (
    <span
      className={cn(
        "grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#333] text-sm font-bold text-white",
        className,
      )}
    >
      {logo ? (
        <img src={logo} alt="" className="size-full object-cover" />
      ) : (
        name.slice(0, 1).toUpperCase()
      )}
    </span>
  );
}

export function ProductTypeIcon({
  className,
  projectType,
}: {
  className?: string;
  projectType: string;
}) {
  const Icon =
    projectType === "open_source"
      ? GitForkIcon
      : projectType === "work"
        ? BriefcaseBusinessIcon
        : UserIcon;
  return <Icon className={className} aria-hidden="true" />;
}

export function ProductExternalLink({
  href,
  label,
}: {
  href: string | undefined;
  label: string;
}) {
  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-[#3A3A3A] bg-[#1E1E1E] px-3 py-1.5 text-xs text-[#D0D0D0] transition hover:border-primary/60 hover:text-white"
      target="_blank"
      rel="noreferrer"
    >
      <LinkIcon className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </a>
  );
}

export function ProductTechBadges({
  compact = false,
  technologies,
}: {
  compact?: boolean;
  technologies: ProductTechnology[];
}) {
  const visibleTechnologies = technologies.slice(0, compact ? 5 : 6);
  const hiddenCount = Math.max(
    technologies.length - visibleTechnologies.length,
    0,
  );

  if (visibleTechnologies.length === 0) {
    return <span className="text-xs text-white/30">No stack</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {visibleTechnologies.map((technology) => (
        <TechnologyLogo
          key={technology.technologyKey}
          name={technology.name}
          className={cn(
            "rounded border-0 bg-white",
            compact ? "size-5" : "size-[22px]",
          )}
          imageClassName="size-[78%]"
          fallbackClassName="text-[9px]"
        />
      ))}
      {hiddenCount > 0 ? (
        <span className="ml-0.5 text-xs text-white/35">+{hiddenCount}</span>
      ) : null}
    </div>
  );
}

export function AuthorLink({
  company,
  image,
  name,
  username,
}: {
  company: string | undefined;
  image: string | undefined;
  name: string | undefined;
  username: string | undefined;
}) {
  const href = getProfileHref(username);
  const label = name ?? normalizeUsername(username) ?? "Quine user";

  return (
    <Link
      href={href}
      className="flex min-w-0 items-center gap-2 rounded-lg text-[#D0D0D0] transition hover:text-white"
    >
      <span className="grid size-8 shrink-0 place-items-center overflow-hidden rounded-md bg-[#333] text-xs font-bold text-white">
        {image ? (
          <img src={image} alt="" className="size-full object-cover" />
        ) : (
          label.slice(0, 1).toUpperCase()
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-bold">{label}</span>
        <span className="block truncate text-[11px] text-white/35">
          {company ?? "Independent"}
        </span>
      </span>
    </Link>
  );
}
