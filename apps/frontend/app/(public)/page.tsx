import type { Metadata } from "next";

import { LpView } from "@/features/lp/components/LpView";

export const metadata: Metadata = {
  title: "Quine — Built in stack. Found by stack.",
  description: "Show what you ship. Discover who's shipping it.",
};

export default function LandingPage() {
  return <LpView />;
}
