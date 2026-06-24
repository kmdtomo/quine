import type { Metadata } from "next";
import type { Id } from "@convex/_generated/dataModel";

import { ProductEditView } from "@/features/products/components/ProductEditView";

export const metadata: Metadata = {
  title: "Edit product — Quine",
};

type Params = Promise<{
  productId: string;
}>;

export default async function EditProductPage({
  params,
}: {
  params: Params;
}) {
  const { productId } = await params;
  return <ProductEditView productId={productId as Id<"products">} />;
}
