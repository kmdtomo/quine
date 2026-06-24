import type { Metadata } from "next";

import { ProductListView } from "@/features/products/components/ProductListView";

export const metadata: Metadata = {
  title: "Products — Quine",
};

export default function ProductsPage() {
  return <ProductListView />;
}
