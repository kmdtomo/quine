import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";

import { ProductEditContent } from "./ProductEditContent";

type ProductEditViewProps =
  | {
      draftKey: string;
      mode: "create";
    }
  | {
      mode: "edit";
      productId: Id<"products">;
    };

export async function ProductEditView(props: ProductEditViewProps) {
  const token = await convexAuthNextjsToken();
  if (!token) {
    redirect("/signin");
  }

  const productArgs = props.mode === "create" ? {} : { productId: props.productId };
  const productAiArgs =
    props.mode === "create"
      ? { draftKey: props.draftKey }
      : { productId: props.productId };
  const [preloadedProduct, preloadedProductAiState] = await Promise.all([
    preloadQuery(api.products.getForEdit, productArgs, { token }),
    preloadQuery(api.productAi.getEditorState, productAiArgs, { token }),
  ]);

  return (
    <ProductEditContent
      draftKey={props.mode === "create" ? props.draftKey : undefined}
      preloadedProduct={preloadedProduct}
      preloadedProductAiState={preloadedProductAiState}
    />
  );
}
