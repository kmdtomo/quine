import type { GitHubRepository } from "../../infra/github/types";
import {
  compareNullableDates,
  getPrimaryTechnologyFromLanguage,
} from "./detection";
import type { ProductRepository, RepositorySummary } from "./types";

export function toRepositorySummary(
  repository: GitHubRepository,
): RepositorySummary {
  const primaryTechnology = getPrimaryTechnologyFromLanguage(
    repository.primaryLanguage,
  );

  return {
    fullName: repository.fullName,
    name: repository.name,
    description: repository.description,
    htmlUrl: repository.htmlUrl,
    homepage: repository.homepage,
    defaultBranch: repository.defaultBranch,
    primaryLanguage: repository.primaryLanguage,
    primaryTechnologyKey: primaryTechnology?.key ?? null,
    primaryTechnologyName: primaryTechnology?.name ?? null,
    private: repository.private,
    fork: repository.fork,
    stargazersCount: repository.stargazersCount,
    updatedAt: repository.updatedAt,
  };
}

export function sortRepositoriesForSelection(
  repositories: RepositorySummary[],
): RepositorySummary[] {
  return [...repositories].sort((a, b) => {
    if (a.fork !== b.fork) {
      return a.fork ? 1 : -1;
    }
    const stars = b.stargazersCount - a.stargazersCount;
    if (stars !== 0) {
      return stars;
    }
    return compareNullableDates(b.updatedAt, a.updatedAt);
  });
}

export function toProductRepository(repository: RepositorySummary): ProductRepository {
  return {
    fullName: repository.fullName,
    name: repository.name,
    description: repository.description,
    htmlUrl: repository.htmlUrl,
    homepage: repository.homepage,
    primaryLanguage: repository.primaryLanguage,
    primaryTechnologyKey: repository.primaryTechnologyKey,
    primaryTechnologyName: repository.primaryTechnologyName,
    private: repository.private,
    fork: repository.fork,
    stargazersCount: repository.stargazersCount,
    updatedAt: repository.updatedAt,
  };
}
