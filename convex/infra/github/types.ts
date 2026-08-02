export type GitHubRepository = {
  fullName: string;
  name: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  defaultBranch: string;
  primaryLanguage: string | null;
  private: boolean;
  fork: boolean;
  stargazersCount: number;
  updatedAt: string | null;
};

export type DirectoryEntry = {
  name: string;
  path: string;
  type: "file" | "dir" | "other";
};

export type FileReadResult = {
  exists: boolean;
  text: string | null;
};

export type RepositoryReadme = {
  path: string;
  text: string;
};

export type GitHubRequestBudget = {
  limit: number;
  used: number;
  exhausted: boolean;
  warnings: string[];
};
