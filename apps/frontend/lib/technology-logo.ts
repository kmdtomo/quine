import {
  allTechnologies,
  techStackCategories,
  type CanonicalTechnology,
} from "@data/tech-stack";
import * as simpleIcons from "simple-icons";

const normalizeString = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();

const escapeSvgText = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const buildSimpleIconSvg = (slug: string): string | null => {
  const icon = Object.values(simpleIcons).find(
    (candidate) => candidate.slug === slug,
  );
  if (!icon) {
    return null;
  }

  return [
    '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">',
    `<title>${escapeSvgText(icon.title)}</title>`,
    `<path fill="#${icon.hex}" d="${icon.path}"/>`,
    "</svg>",
  ].join("");
};

const toSvgDataUrl = (svg: string): string =>
  `data:image/svg+xml,${encodeURIComponent(svg)}`;

export const getTechnologyLogo = (techName: string): string | null => {
  const technology = getTechnologyInfo(techName);
  if (!technology) {
    return null;
  }

  if (technology.logo?.source === "simple-icons") {
    const svg = buildSimpleIconSvg(technology.logo.slug);
    return svg ? toSvgDataUrl(svg) : null;
  }

  if (
    technology.logo?.source === "manual" &&
    technology.logo.path.endsWith(".svg")
  ) {
    return technology.logo.path;
  }

  if (
    technology.logo?.source === "aws-icons" ||
    technology.logo?.source === "google-cloud-icons" ||
    technology.logo?.source === "azure-icons"
  ) {
    return `/tech_stack_logo/${technology.logoKey ?? technology.key}.svg`;
  }

  return null;
};

export const getTechnologyInfo = (
  techName: string,
): CanonicalTechnology | null => {
  const normalizedInput = normalizeString(techName);
  const lowerInput = techName.toLowerCase();

  const exact = allTechnologies.find(
    (technology) =>
      technology.key.toLowerCase() === lowerInput ||
      technology.name.toLowerCase() === lowerInput ||
      technology.aliases?.some((alias) => alias.toLowerCase() === lowerInput),
  );
  if (exact) {
    return exact;
  }

  const normalized = allTechnologies.find((technology) => {
    const values = [
      technology.key,
      technology.name,
      ...(technology.aliases ?? []),
    ];
    return values.some((value) => normalizeString(value) === normalizedInput);
  });
  if (normalized) {
    return normalized;
  }

  return (
    allTechnologies.find((technology) => {
      const values = [
        technology.key,
        technology.name,
        ...(technology.aliases ?? []),
      ].map(normalizeString);

      return values.some(
        (value) => value.includes(normalizedInput) || normalizedInput.includes(value),
      );
    }) ?? null
  );
};

export const getTechnologyLogos = (techNames: string[]) =>
  techNames.map((techName) => ({
    name: techName,
    logoPath: getTechnologyLogo(techName),
    info: getTechnologyInfo(techName),
  }));

export const categoryEnglishMap: Record<string, string> = Object.fromEntries(
  techStackCategories.map((category) => [category.name, category.name]),
);

export const getTechnologyCategory = (stackName: string): string => {
  const technology = getTechnologyInfo(stackName);
  return technology?.categoryName ?? "Other";
};

type TechnologyStackLike = {
  stack_name: string;
};

export const aggregateTechStacksByCategory = (
  techStacks: TechnologyStackLike[],
) => {
  const categoryCount: Record<string, number> = {};

  techStacks.forEach((stack) => {
    const category = getTechnologyCategory(stack.stack_name);
    categoryCount[category] = (categoryCount[category] ?? 0) + 1;
  });

  const result = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([categoryName, count]) => ({
      category: categoryEnglishMap[categoryName] ?? categoryName,
      count,
    }));

  const languageIndex = result.findIndex(
    (item) => item.category === "Languages",
  );
  if (languageIndex > 0) {
    const languageItem = result.splice(languageIndex, 1)[0];
    if (languageItem) {
      result.unshift(languageItem);
    }
  }

  return result;
};
