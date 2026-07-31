import { preloadQuery } from "convex/nextjs";

import { api } from "@convex/_generated/api";

import { ProductListContent } from "./ProductListContent";

export async function ProductListView() {
  const preloadedProducts = await preloadQuery(api.products.listPublic, {});
  return <ProductListContent preloadedProducts={preloadedProducts} />;
}
