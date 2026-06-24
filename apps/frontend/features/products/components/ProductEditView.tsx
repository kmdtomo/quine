import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { ProductEditContent } from "./ProductEditContent";

type ProductEditViewProps = {
  productId?: Id<"products">;
};

export async function ProductEditView({ productId }: ProductEditViewProps) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/signin");
  }

  const args = productId === undefined ? {} : { productId };
  const preloadedProduct = await preloadQuery(
    api.products.getForEdit,
    args,
    { token },
  );

  return <ProductEditContent preloadedProduct={preloadedProduct} />;
}
