import type { Id } from "@convex/_generated/dataModel";

export type UsersListTechnology = {
  name: string;
  technologyKey: string;
};

export type UsersListItem = {
  _id: Id<"users">;
  banner?: string;
  bio?: string;
  company?: string;
  image?: string;
  name?: string;
  role?: string;
  technologies: UsersListTechnology[];
  username: string;
};
