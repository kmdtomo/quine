import type { Metadata } from "next";

import { ProductEditView } from "@/features/products/components/ProductEditView";

export const metadata: Metadata = {
  title: "Create product — Quine",
};

export default function NewProductPage() {
  return <ProductEditView />;
}
