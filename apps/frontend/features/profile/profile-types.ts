export type ProfileTechnology = {
  _id?: string;
  categoryName: string;
  name: string;
  technologyKey: string;
  years?: number;
};

export type ProductTechnology = {
  name: string;
  technologyKey: string;
};

export type ProductProjectType = "personal" | "work" | "open_source";

export type ProfileProduct = {
  _id: string;
  content: string;
  isPublic: boolean;
  logo: string | undefined;
  name: string;
  projectType: ProductProjectType;
  slug: string;
  tagline: string;
  technologies: ProductTechnology[];
};

export type ProfileConnection = {
  _id: string;
  company: string | undefined;
  image: string | undefined;
  name: string | undefined;
  role: string | undefined;
  technologies: ProductTechnology[];
  username: string | undefined;
};

export type StackSummary = {
  backend: number;
  frontend: number;
  infra: number;
  mobile: number;
  other: number;
};
