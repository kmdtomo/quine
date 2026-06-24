import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { preloadQuery } from "convex/nextjs";

import { api } from "@convex/_generated/api";

import { ProductDetailContent } from "./ProductDetailContent";

type ProductDetailViewProps = {
  slug: string;
  username: string;
};

export async function ProductDetailView({
  slug,
  username,
}: ProductDetailViewProps) {
  const token = await convexAuthNextjsToken();
  const args = { slug, username };
  const preloadedProduct = token
    ? await preloadQuery(api.products.getBySlug, args, { token })
    : await preloadQuery(api.products.getBySlug, args);

  return <ProductDetailContent preloadedProduct={preloadedProduct} />;
}
