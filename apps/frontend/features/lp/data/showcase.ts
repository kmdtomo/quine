export type MarqueeIcon = {
  key: string;
  name: string;
};

export type ProfileTechItem = {
  key: string;
  name: string;
  years: number;
};

export type ProductMeta = {
  iconSrc: string;
  title: string;
  tagline: string;
  badges: { label: string; icon: "fork" | "team" | "tag" }[];
  links: { label: string; icon: "link" | "github" }[];
  description: string;
  stacks: { key: string; name: string }[];
};

export type DiscoveryProduct = {
  iconSrc: string;
  title: string;
  tag: string;
  catchphrase: string;
  description: string;
  stacks: string[];
  author: { name: string; avatarSrc: string; meta: string };
};

export type HubData = {
  centerKey: string;
  centerName: string;
  orbitKeys: string[];
  productCount: number;
  engineerCount: number;
};

export const MARQUEE_TECHNOLOGIES: MarqueeIcon[] = [
  { key: "python", name: "Python" },
  { key: "typescript", name: "TypeScript" },
  { key: "javascript", name: "JavaScript" },
  { key: "go", name: "Go" },
  { key: "rust", name: "Rust" },
  { key: "java", name: "Java" },
  { key: "swift", name: "Swift" },
  { key: "ruby", name: "Ruby" },
  { key: "react", name: "React" },
  { key: "nextjs", name: "Next.js" },
  { key: "vuejs", name: "Vue.js" },
  { key: "tailwind_css", name: "Tailwind CSS" },
  { key: "nodejs", name: "Node.js" },
  { key: "django", name: "Django" },
  { key: "graphql", name: "GraphQL" },
  { key: "postgresql", name: "PostgreSQL" },
  { key: "mongodb", name: "MongoDB" },
  { key: "redis", name: "Redis" },
  { key: "docker", name: "Docker" },
  { key: "kubernetes", name: "Kubernetes" },
  { key: "vercel", name: "Vercel" },
  { key: "tensorflow", name: "TensorFlow" },
  { key: "github", name: "GitHub" },
  { key: "figma", name: "Figma" },
];

export const PROFILE_IDENTITY = {
  name: "Evgen Ledo",
  handle: "@ledoteam",
  role: "Full-Stack Engineer",
  avatarSrc: "/lp/avatar-evgen.jpg",
};

export const PROFILE_TECH_RAIL: ProfileTechItem[] = [
  { key: "python", name: "Python", years: 5 },
  { key: "typescript", name: "Type Script", years: 5 },
  { key: "javascript", name: "Java Script", years: 5 },
  { key: "react", name: "React", years: 3 },
  { key: "nextjs", name: "Next.js", years: 5 },
  { key: "nodejs", name: "Node.js", years: 5 },
  { key: "graphql", name: "GraphQL", years: 2 },
  { key: "postgresql", name: "PostgreSQL", years: 5 },
  { key: "redis", name: "Redis", years: 3 },
  { key: "docker", name: "Docker", years: 4 },
  { key: "tailwind_css", name: "Tailwind", years: 3 },
  { key: "go", name: "Go", years: 4 },
  { key: "swift", name: "Swift", years: 2 },
  { key: "ruby", name: "Ruby", years: 3 },
  { key: "mongodb", name: "MongoDB", years: 2 },
  { key: "kotlin", name: "Kotlin", years: 1 },
];

export const PRODUCT_SHOWCASE: ProductMeta = {
  iconSrc: "/lp/product-mintlify.png",
  title: "Mintlify",
  tagline: "Modern standard for documentation",
  badges: [
    { label: "Open Source", icon: "fork" },
    { label: "6–10 people", icon: "team" },
    { label: "Full Stack", icon: "tag" },
  ],
  links: [
    { label: "mintlify.com", icon: "link" },
    { label: "github.com/mintlify/mint", icon: "github" },
  ],
  description:
    "The modern standard for public facing documentation. Beautiful out of the box, optimized for engagement.",
  stacks: [
    { key: "typescript", name: "TypeScript" },
    { key: "react", name: "React" },
    { key: "nextjs", name: "Next.js" },
    { key: "nodejs", name: "Node.js" },
    { key: "tailwind_css", name: "Tailwind" },
    { key: "postgresql", name: "PostgreSQL" },
    { key: "redis", name: "Redis" },
    { key: "vercel", name: "Vercel" },
    { key: "docker", name: "Docker" },
    { key: "github_actions", name: "GH Actions" },
  ],
};

export const DISCOVERY_FILTER_CHIPS = [
  { key: "react", name: "React" },
  { key: "nextjs", name: "Next.js" },
  { key: "postgresql", name: "PostgreSQL" },
];

export const DISCOVERY_PRODUCTS: DiscoveryProduct[] = [
  {
    iconSrc: "/lp/product-mintlify.png",
    title: "Mintlify",
    tag: "Open Source",
    catchphrase: "Modern standard for documentation",
    description:
      "The modern standard for public facing documentation. Beautiful out of the box, easy to maintain, and optimized for user engagement.",
    stacks: ["react", "nextjs", "typescript", "nodejs", "tailwind_css", "postgresql"],
    author: {
      name: "Evgen Ledo",
      avatarSrc: "/lp/avatar-evgen.jpg",
      meta: "Techno Chain Co., Ltd",
    },
  },
  {
    iconSrc: "/lp/product-pulse.jpg",
    title: "Pulse Analytics",
    tag: "Work",
    catchphrase: "Product analytics in real time",
    description:
      "Real-time product analytics built for engineers. Ship with confidence using live event streams, funnels, and cohort analysis.",
    stacks: ["typescript", "nextjs", "postgresql", "tailwind_css", "graphql", "docker"],
    author: {
      name: "Evgeniy Alexandrov",
      avatarSrc: "/lp/avatar-evgen.jpg",
      meta: "Google Japan",
    },
  },
];

export const HUB_SHOWCASE: HubData = {
  centerKey: "react",
  centerName: "React",
  orbitKeys: ["typescript", "nextjs", "postgresql", "docker", "tailwind_css", "nodejs"],
  productCount: 234,
  engineerCount: 89,
};

export const techLogoSrc = (key: string): string => `/tech_stack_logo/${key}.png`;
