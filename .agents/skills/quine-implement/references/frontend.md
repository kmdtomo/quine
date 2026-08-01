# Frontend

Next.js の request、Server Component、Client Component、Server Action の境界を定義する。ファイルの配置は [project structure](project-structure.md) を参照する。

## Contents

- [Rendering model](#rendering-model)
- [Page](#page)
- [View](#view)
- [Content](#content)
- [Section and shared UI](#section-and-shared-ui)
- [Feature-local files](#feature-local-files)
- [Data loading](#data-loading)
- [Mutations and Server Actions](#mutations-and-server-actions)
- [Forms](#forms)
- [Route Handlers](#route-handlers)
- [Next.js and browser constraints](#nextjs-and-browser-constraints)
- [Frontend checklist](#frontend-checklist)

## Rendering model

Quine の標準画面は次の順で組み立てる。

```text
page.tsx (Server)
  -> <Feature>View (Server: auth、preload、redirect)
    -> <Feature>Content (Client: reactive data、form、event)
      -> <Feature>Section / shared UI
```

directive は実行場所ではなく module boundary を宣言する。

| File | Default | Directive |
|---|---|---|
| `page.tsx`, `layout.tsx`, `*View.tsx` | Server Component | 書かない |
| hookやeventを持つ`*Content.tsx` | Client Component | `"use client"` |
| Server Actionだけをexportする`actions.ts` | Server Action module | `"use server"` |
| server専用helper | Server module | 必要なら`import "server-only"` |

Server Componentへ`"use server"`を書かない。`"use server"`は「サーバーでrenderする」の意味ではない。

## Page

pageはroute固有情報をfeatureへ接続するだけにする。

```tsx
import { ProductEditView } from "@/features/products/components/ProductEditView";

export default async function Page({ params }: PageProps) {
  const { productId } = await params;
  return <ProductEditView productId={productId} />;
}
```

pageに置いてよいもの:

- `params` / `searchParams`の取得。
- URL segmentのdecodeとrouteとしての形式確認。
- metadata。
- 1つ以上のfeature Viewのcomposition。

認証、queryのpreload、redirect / not-found、フォーム、Convex hook、業務状態遷移、外部API接続は置かない。

## View

`*View`は画面のServer Component入口である。

```tsx
import { preloadQuery } from "convex/nextjs";

import { api } from "@convex/_generated/api";
import { getAuthToken } from "@/lib/auth-server";

import { ProductEditContent } from "./ProductEditContent";

export async function ProductEditView({ productId }: Props) {
  const token = await getAuthToken();
  const preloadedProduct = await preloadQuery(
    api.products.getEditable,
    { productId },
    { token },
  );

  return <ProductEditContent preloadedProduct={preloadedProduct} />;
}
```

Viewの責務:

- 認証tokenを取得する。
- 初期queryをpreloadする。
- 認証・取得結果からserverで確定できるredirect / not-foundを処理する。
- Client Componentへserializableなpropsを渡す。

Viewでmutationや外部副作用を起こさない。renderは再実行されうるため、副作用の入口にしない。

## Content

`*Content`は画面のclient controllerである。UI stateをすべて抱える巨大componentではなく、画面全体のデータとeventを意味のあるSectionへ配る。

```tsx
"use client";

import { useMutation, usePreloadedQuery } from "convex/react";

import { api } from "@convex/_generated/api";

export function ProductEditContent({ preloadedProduct }: Props) {
  const product = usePreloadedQuery(preloadedProduct);
  const saveProduct = useMutation(api.products.save);

  async function handleSave(values: ProductFormValues) {
    await saveProduct({ productId: product._id, ...values });
  }

  return <ProductForm product={product} onSave={handleSave} />;
}
```

Contentに置くもの:

- `usePreloadedQuery`、`useQuery`、`useMutation`、`useAction`。
- form、dialog、tab、selection、optimistic UI。
- event handlerとexpected errorのUI変換。

Contentに置かないもの:

- owner確認や状態遷移の最終判断。
- provider SDK、secret、server-only API。
- 大きな決定的変換。同じfeature rootの名前付きmoduleへ切り出す。

`"use client"`はhookやeventが必要な最小の境界まで下げる。

## Section and shared UI

`*Section`はページ内の意味のあるまとまりで、再利用回数ではなく責務で切る。

- hookやeventを持たないSectionはServer Componentのままでよい。
- client親から渡される表示だけのcomponentに、機械的に`"use client"`を書かない。
- 複数featureで使う純UIだけを`apps/frontend/components/`へ昇格する。
- Convex API、feature error、業務語彙を持つcomponentはfeature内に残す。

## Feature-local files

feature内のdirectoryは原則`components/`だけにし、form contract、error、型、helper、feature固有React Hookはfeature rootへ具体名で置く。`lib/`、`hooks/`、`types/`、`schema/`のような役割directoryを増やさない。

React Hookが必要な場合は`use-*.ts`としてfeature rootへ置く。Reactのstate、effect、context、他hookのcompositionを持たない純粋helperを、再利用目的だけでhookにしない。

## Data loading

初期表示はServer Componentで`preloadQuery`または`fetchQuery`を使う。

- 初期値をclientの`useEffect + fetch`で取得しない。
- preloadしたqueryをContentで`usePreloadedQuery`へ渡し、以後のreactive更新を受ける。
- browserだけで決まる任意情報はclient queryにしてよい。
- 独立して更新されるSectionは巨大queryへ統合せず、bounded queryへ分ける。
- loading、empty、not-found、forbiddenを混同しない。

認証が必要なSSR queryにはtokenを明示的に渡す。未認証を許す公開画面では、tokenなしの場合も成立するquery contractにする。

## Mutations and Server Actions

通常の保存・削除・followなどはClient ComponentからConvex mutationを直接呼ぶ。Convexが認証、transaction、reactive updateの境界になるため、Next Server Actionで包む必要はない。

```text
button / form event
  -> useMutation(api.products.save)
  -> Convex public mutation
  -> auth + transaction
  -> query subscriptionがUIを更新
```

`actions.ts`を作るのはNext runtimeの機能がuse caseに必要な場合だけ:

- native `<form action={...}>`を使う。
- server-only cookieやheaderを扱う。
- `redirect`、`revalidatePath`、`revalidateTag`を同じ入口で行う。
- Next側だけにあるserver credentialやrequest contextが必要。

```ts
"use server";

import { redirect } from "next/navigation";
import { fetchMutation } from "convex/nextjs";

import { api } from "@convex/_generated/api";
import { getAuthToken } from "@/lib/auth-server";

import { productFormSchema } from "./product-form-schema";

export async function createProductAction(formData: FormData): Promise<void> {
  const input = productFormSchema.parse(Object.fromEntries(formData));
  const token = await getAuthToken();
  const productId = await fetchMutation(api.products.create, input, { token });
  redirect(`/products/${productId}`);
}
```

Server Actionは薄いNext adapterであり、次を最終決定しない:

- resourceのowner。
- 許可された状態遷移。
- 複数tableの整合性。
- client由来IDに基づく権限。

これらはConvex mutation transactionで確定する。長時間外部処理をServer Action内で待たない。

## Forms

共有するUI入力contractが必要な場合だけ、feature rootのpurpose-specificな`<purpose>-form-schema.ts`へ置く。form schema fileは全feature必須のtemplateではない。

- React Hook FormとZod resolverを標準にする。
- 空文字、checkbox、入力途中の値などUI表現を扱う。
- default valueと送信用値の変換を名前付き関数にする。
- DB document schemaを再現しない。
- Convex mutationにも独立したargs validatorを置く。client validationをtrust boundaryにしない。

同じZod schemaをclient bundleとserver-only moduleの両方からimportする場合、そのschema moduleへsecretやserver-only dependencyを混ぜない。

## Route Handlers

Route HandlerはHTTP protocolが要件の時だけ使う。

適切な例:

- webhook callback。
- OAuth callback。
- request header / cookie / status code自体がcontract。
- file downloadやstreaming response。

不適切な例:

- Convex query / mutationをHTTPで包み直すだけのCRUD API。
- Client Componentから内部API routeへfetchして初期表示する。
- 長時間処理をrequest完了まで保持する。

Route Handlerでは署名、state、content type、inputを検証し、処理本体を適切なConvex関数へ渡す。

## Next.js and browser constraints

### `@username` route

`app/(public)/@[username]/`はNext.jsのparallel route記法と衝突する。`app/(public)/[username]/page.tsx`で受け、dynamic paramをdecodeして`@`を確認する。

```ts
function parseProfileUsername(segment: string): string | null {
  try {
    const decoded = decodeURIComponent(segment);
    return decoded.startsWith("@") ? decoded.slice(1) : null;
  } catch {
    return null;
  }
}
```

Next.js 16では`@`が`%40`のままparamへ渡る場合があるため、prefix確認より先にdecodeする。不正percent encodingはnot-foundへ落とす。

DBのcanonical usernameは`@`なしにする。legacy `@username`を読む互換処理はquery境界へ閉じ、new writeへ広げない。

### Async file input

React eventの`currentTarget`を`await`後に参照しない。handler冒頭でDOM elementを退避する。

```ts
async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const file = input.files?.[0];
  if (!file) return;

  await uploadFile(file);
  input.value = "";
}
```

### Effect-started requests

modal open等をtriggerにeffectからrequestを始める場合、renderごとのstate guardとcleanupの組合せで進行中requestを永久loadingにしない。開始済みidentityは必要なら`useRef`で管理し、requestにはtimeoutとerror UIを持たせる。ユーザーeventから開始できる処理はeffectではなくevent handlerを使う。

### Installed Next.js behavior

- Next.js 16のlintは`next lint`ではなくprojectの`eslint` scriptを使う。
- Turbopackは`next dev`のdefaultであり、専用flagを前提にしない。
- middleware/proxy等version依存APIは、既存実装とinstalled packageのdocsを確認してから変更する。

## Frontend checklist

- pageはrouteとcompositionだけか。
- ViewはdirectiveなしのServer Componentか。
- Contentのclient boundaryは必要最小限か。
- 初期queryはpreload/fetchされているか。
- 通常mutationを不要なServer Actionで包んでいないか。
- Server Actionを使う理由がNext runtimeにあるか。
- form schemaとDB schemaを混同していないか。
- dynamic route paramを必要に応じて安全にdecodeしたか。
- async event後にevent objectの`currentTarget`へ依存していないか。
- loading、empty、success、expected errorを表示できるか。
- 権限をbutton非表示だけに依存していないか。
