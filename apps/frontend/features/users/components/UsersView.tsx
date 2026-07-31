import { preloadQuery } from "convex/nextjs";

import { api } from "@convex/_generated/api";

import { UsersContent } from "./UsersContent";

export async function UsersView() {
  const preloadedUsers = await preloadQuery(api.users.listPublic, {});

  return <UsersContent preloadedUsers={preloadedUsers} />;
}
