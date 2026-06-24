import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetailView } from "@/features/products/components/ProductDetailView";

export const metadata: Metadata = {
  title: "Product — Quine",
};

type Params = Promise<{
  productSlug: string;
  username: string;
}>;

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { productSlug, username: usernameParam } = await params;
  const username = getUsernameFromRouteParam(usernameParam);
  const slug = decodeRouteSegment(productSlug);
  if (!username || !slug) {
    notFound();
  }

  return <ProductDetailView slug={slug} username={username} />;
}

function getUsernameFromRouteParam(usernameParam: string) {
  const decodedUsernameParam = decodeRouteSegment(usernameParam);
  if (!decodedUsernameParam?.startsWith("@")) {
    return null;
  }

  const username = decodedUsernameParam.slice(1).trim();
  return username.length > 0 ? username : null;
}

function decodeRouteSegment(value: string) {
  try {
    const decodedValue = decodeURIComponent(value).trim();
    return decodedValue.length > 0 ? decodedValue : null;
  } catch {
    return null;
  }
}
