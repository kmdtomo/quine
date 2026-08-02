import type { TechnologyKey } from "../../../data/tech-stack";
import type { Id } from "../../_generated/dataModel";
import type { GitHubRepository } from "../../infra/github/types";

export type DetectionSource = {
  repository: string;
  path: string;
  detail: string;
};

export type DetectedTechnology = {
  key: TechnologyKey;
  name: string;
  category: string;
  confidence: number;
  score: number;
  sources: DetectionSource[];
};

export type RepositorySummary = GitHubRepository & {
  primaryTechnologyKey: TechnologyKey | null;
  primaryTechnologyName: string | null;
};

export type ProductRepository = {
  description: string | null;
  fork: boolean;
  fullName: string;
  homepage: string | null;
  htmlUrl: string;
  name: string;
  primaryLanguage: string | null;
  primaryTechnologyKey: TechnologyKey | null;
  primaryTechnologyName: string | null;
  private: boolean;
  stargazersCount: number;
  updatedAt: string | null;
};

export type RepositoryAnalysis = {
  repository: RepositorySummary;
  languages: string[];
  filesRead: string[];
  detectedTechnologyKeys: string[];
  warnings: string[];
};

export type ImportProductRepositoryResult = {
  analysis: RepositoryAnalysis;
  draft: {
    githubUrl: string;
    name: string;
    productUrl?: string;
    projectType: "open_source" | "work";
    technologyKeys: TechnologyKey[];
  };
  repoContextId: Id<"productRepoContexts">;
  repository: ProductRepository;
  requestCount: number;
  requestLimit: number;
  warnings: string[];
};

export type ListProductRepositoriesResult =
  | {
      repositories: ProductRepository[];
      status: "not_installed";
    }
  | {
      repositories: ProductRepository[];
      requestCount: number;
      requestLimit: number;
      status: "ready";
      warnings: string[];
    };

export type ManifestKind =
  | "packageJson"
  | "python"
  | "ruby"
  | "go"
  | "rust"
  | "php"
  | "dart"
  | "swift"
  | "java"
  | "docker"
  | "githubWorkflow"
  | "terraform"
  | "cloudFormation"
  | "pulumi"
  | "config"
  | "unknown";

export type ManifestTarget = {
  path: string;
  kind: ManifestKind;
  baselineKeys: TechnologyKey[];
};

export type AnalysisLogContext = {
  runId: Id<"githubAnalysisRuns">;
  userId: Id<"users">;
};

export type DetectionMaps = {
  languages: Map<string, TechnologyKey[]>;
  npm: Map<string, TechnologyKey[]>;
  python: Map<string, TechnologyKey[]>;
  ruby: Map<string, TechnologyKey[]>;
  go: Map<string, TechnologyKey[]>;
  rust: Map<string, TechnologyKey[]>;
  php: Map<string, TechnologyKey[]>;
  dart: Map<string, TechnologyKey[]>;
  swift: Map<string, TechnologyKey[]>;
  java: Map<string, TechnologyKey[]>;
  files: Map<string, TechnologyKey[]>;
  dockerImages: Map<string, TechnologyKey[]>;
  workflowUses: Map<string, TechnologyKey[]>;
  envVars: Map<string, TechnologyKey[]>;
  text: Map<string, TechnologyKey[]>;
};
