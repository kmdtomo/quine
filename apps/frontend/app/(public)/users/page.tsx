import type { Metadata } from "next";

import { UsersView } from "@/features/users/components/UsersView";

export const metadata: Metadata = {
  title: "Discover Engineers — Quine",
  description:
    "Find engineers to work with by role and the technologies they use.",
};

export default function UsersPage() {
  return <UsersView />;
}
