import { randomBytes } from "node:crypto";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ProductEditView } from "@/features/products/components/ProductEditView";

export const metadata: Metadata = {
  title: "Create product — Quine",
};

type SearchParams = Promise<{
  draft?: string | string[];
}>;

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { draft } = await searchParams;
  if (!isProductDraftKey(draft)) {
    redirect(`/products/new?draft=${randomBytes(12).toString("hex")}`);
  }

  return <ProductEditView draftKey={draft} mode="create" />;
}

function isProductDraftKey(value: string | string[] | undefined): value is string {
  return typeof value === "string" && /^[a-f0-9]{24}$/.test(value);
}
