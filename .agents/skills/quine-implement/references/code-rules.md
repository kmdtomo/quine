# Code rules

QuineのTypeScript、命名、validation、error、UI実装の共通ルールを定義する。配置は [project structure](project-structure.md)、実行境界は [frontend](frontend.md) と [Convex](convex.md) を参照する。

## Contents

- [Type safety](#type-safety)
- [Naming](#naming)
- [Cross-runtime data and shared code](#cross-runtime-data-and-shared-code)
- [Validation boundaries](#validation-boundaries)
- [Imports and dependencies](#imports-and-dependencies)
- [Errors](#errors)
- [Logging and secrets](#logging-and-secrets)
- [React and forms](#react-and-forms)
- [Tailwind and UI](#tailwind-and-ui)
- [Comments and cleanup](#comments-and-cleanup)
- [Code checklist](#code-checklist)

## Type safety

- `any`を使わない。不明な外部値は`unknown`からvalidatorやtype guardで絞る。
- non-null assertion (`!`)を使わない。存在しないcaseを明示的に処理する。
- `as` castを型設計の代わりに使わない。Convexの検証済みstringを`Id<>`へ狭めるなど、runtime contractが確認済みの局所用途だけ許容する。
- `@ts-ignore`を使わない。回避不能な外部型の不整合だけ、理由付き`@ts-expect-error`を局所使用する。
- broadな`string`より、validatorから導出したunion、`Id<"table">`、branded valueを使う。
- nullableとoptionalを区別する。値がない状態を1つに決める。
- public functionのreturn typeを明確にし、内部document全体を偶然公開しない。

型エラーをcastで消す前に、入力の検証場所、返却contract、既存データの互換性を確認する。

## Naming

| Target | Rule | Example |
|---|---|---|
| React component file | exportと同じPascalCase | `ProductCard.tsx` |
| View / Content / Section | role suffix | `ProductEditView.tsx` |
| frontend非component file | kebab-case、責務を含める | `product-form-schema.ts`, `product-error.ts`, `use-product-draft.ts` |
| Next.js予約file | framework規定名 | `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx` |
| `convex/`配下のfile/directory | camelCase、hyphen禁止 | `saveProduct.ts`, `productAi/`, `responseSchema.ts` |
| Convex registered function | camelCase verb | `getEditable`, `save`, `remove` |
| application use case/function | camelCase verb-object | `saveProduct` |
| hook | `use*` | `useProductDraft` |
| Zod schema | `*Schema` | `productFormSchema` |
| type | PascalCase | `ProductFormValues` |
| constant | SCREAMING_SNAKE_CASE | `MAX_SCREENSHOTS` |
| DB table | plural camelCase | `productAiRuns` |

`utils.ts`、`helpers.ts`、`validators.ts`、`services.ts`、曖昧な`schema.ts`や`types.ts`のような範囲不明の名前を新設しない。何を扱うかを名前に含める。plainな`schema.ts`はDB schemaのentrypointである`convex/schema.ts`だけに使う。

`convex/`配下はregistered functionだけでなく、`application/`、`infra/`、Action companionを含むすべてのmodule path componentでcamelCaseを使う。Convexが認識しないhyphenをfile名やdirectory名へ含めない。`_generated/`、`auth.config.ts`などframeworkが規定する名前は例外とする。

よい例:

```text
product-error.ts
markdown-edit.ts
infra/github/responseSchema.ts
lib/githubErrors.ts
application/products/saveProduct.ts
workflows/productAi/toolSchemas.ts
```

1ファイルの主目的が変わったら名前も変える。単なる内部実装detailのためにdirectoryを増やさない。

### Technology keys

`data/tech-stack.ts`の`technology.key`をQuine全体のcanonical IDにする。

- lowercase ASCIIの安定slugを使う。
- 表示名やpackage名をIDとして流用しない。
- 外部aliasは境界でcanonical keyへ変換する。
- featureやConvexへ生の対応表を複製しない。

`data/tech-stack.ts`はcross-runtimeで使うcanonical static catalogであり、同fileのhelperはcatalogだけを読むdeterministicな処理に限定する。I/O、environment、時刻、random、mutable state、feature固有DB判断を持ち込まない。

## Cross-runtime data and shared code

`data/`にはstatic data、そのdataの型、そのdataだけを読むdeterministic helperを置く。一般的な業務algorithmや、単にfrontendとConvexで似ているhelperを`data/`へ置かない。

`shared/`は標準directoryとして先に作らない。次の条件をすべて満たす実際のcontractが生じた時だけ、`shared/<feature>/<specific-file>.ts`を検討する。

- frontendとConvexの両runtimeが同じ意味で同じ実装を必要とする。
- featureの片側だけをownerにするとcontract driftが起きる。
- React、Next、Convex、Node固有APIへ依存しない純粋な実装にできる。
- I/O、environment、時刻、random、mutable stateを持たない。

`shared/`を第二の`lib/`、共通type置き場、早期抽象化の置き場にしない。導入時だけ必要なimport aliasとfrontend/Convex双方の検証を追加する。`shared/`は`convex/`配下ではないため、非component fileと同じkebab-caseを使う。

同じConvex featureのapplicationとAction workflowだけが共有するruntime非依存の純粋ruleは、`shared/`ではなく`convex/application/<feature>/<specificRule>.ts`へ置く。workflowからそのruleはimportしてよいが、`QueryCtx` / `MutationCtx`を受けるDB use caseはroot/internal adapter経由で呼ぶ。

## Validation boundaries

「schema」という名前は対象contractが明確な場所で使う。

| Input / data | Validation owner | Typical file |
|---|---|---|
| DB document、index、relation | Convex DB | `convex/schema.ts` |
| public Convex args / returns | registered adapter | `convex/products.ts` |
| form入力、default values | frontend feature | `product-form-schema.ts` |
| GitHub/OpenAI response | provider infra | `infra/<provider>/responseSchema.ts` |
| Action tool input/output | Action workflow owner | `workflows/productAi/toolSchemas.ts`等の具体名 |
| URL param / webhook body | HTTP/route boundary | 対象routeまたは固有schema |
| application internal input | TypeScript type + caller contract | use case file |

`validators.ts`という箱に異なる境界を集めない。DB schema、form schema、外部response schema、Action tool schemaは目的も変更理由も異なる。

業務rule、正規化、状態遷移を`schema`と呼ばない。applicationでは責務に応じて`productInput.ts`、`productRules.ts`、`runState.ts`のように命名し、曖昧な`schema.ts`や`types.ts`へ集約しない。型は原則として所有fileへ置き、複数fileで同じ概念を共有する場合だけ`productEditorTypes.ts`のような具体名へ切り出す。

外部値は入口でparseし、内部では検証済み型として扱う。castしただけの値を保存しない。既存DBにlegacy値がありうる場合は、migrationまたは境界の互換parserで扱う。

## Imports and dependencies

importは次のgroup順にし、group間へ空行を1つ入れる。

```ts
// React / Next
import { useState } from "react";
import Link from "next/link";

// external packages
import { z } from "zod";

// Convex
import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";

// shared frontend foundation and UI
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// feature absolute imports
import { ProductCard } from "@/features/products/components/ProductCard";

// same-directory relatives
import { ProductMenu } from "./ProductMenu";
```

- `@/*`は`apps/frontend/*`、`@convex/*`は`convex/*`を指す。
- Convexからfrontendをimportしない。
- frontendは`@convex/_generated/api`を通じて登録関数を参照する。
- feature間importは公開component/typeなど、意図したsurfaceに限定する。
- cyclic dependencyをbarrel exportで隠さない。
- 1ファイル内だけで使うものをindex exportしない。

## Errors

expected errorとunexpected errorを分ける。

expected errorの例:

- 未認証、権限不足。
- input不正。
- resource不存在。
- 許可されない状態遷移。
- active Runとの競合。

expected errorは安定したcodeを持つ`ConvexError`で返し、frontendで日本語表示へ変換する。providerのraw messageをそのままclientへ返さない。

unexpected errorは内部detailをclientに露出せず、調査可能なserver logを残す。失敗をcatchして成功扱いにしない。

```ts
try {
  await saveProduct(values);
  showSuccess("保存しました");
} catch (error: unknown) {
  showProductError(error);
}
```

error mappingはfeature固有ならfeature root、複数flowで同じprovider codeを共有する場合だけConvex/frontendの基盤へ置く。

## Logging and secrets

- token、cookie、secret、raw prompt、raw AI output、個人情報をlogへ出さない。
- clientへ内部stackやprovider response bodyを返さない。
- debug用`console.log`は完了前に削除する。
- unexpected failureはcontextを絞った`console.error`または既存loggerで記録する。
- document全体をlogせず、必要なRun IDやresource IDと安全なerror codeを記録する。
- environment variableの存在確認と値の表示を混同しない。

## React and forms

- render中にstate更新や副作用を起こさない。
- derived stateを`useEffect`で同期せず、render時に導出する。
- user actionに伴う処理はevent handlerへ置く。
- stateは必要な最小componentへ置き、Convexのserver stateを別global storeへ複製しない。
- formはReact Hook Form + Zod resolverを標準にする。
- submit中の二重送信を防ぎ、成功後と失敗後のstateを明示する。
- input途中の値と保存contractの変換を名前付き関数にする。
- mutation failureを握りつぶさず、ユーザーへ再試行可能な表示を出す。

## Tailwind and UI

- mockupをdesignの真理値として参照し、mockup自体は編集しない。
- 固有UIはTailwindで実装し、shadcn/uiはprimitiveとして使う。
- Tailwind v4のthemeは`tailwind.config.ts`ではなく`app/globals.css`のCSS-first設定へ置く。
- 条件classは`cn()`を使い、外から受ける`className`は最後に置く。
- dynamicな数値等で必要な場合を除きinline styleを使わない。
- `!important`とTailwindの`!` prefixを常用しない。
- `globals.css`へfeature固有styleを追加しない。
- class順の機械的な全体変更を機能変更へ混ぜない。
- accessibility name、label、focus、keyboard操作を保つ。

`lucide-react`にGitHub等のbrand iconがない場合、存在しないexportを推測しない。既存inline SVGまたはinstalled `simple-icons`を使う。canonical technology logoは`data/tech-stack.ts`の方針へ従う。

Quineのshadcn `base-nova`でform primitiveのregistry追加が成立しない場合、既存`components/ui/form.tsx`を正にする。機能実装中に別styleのprimitiveで全面置換しない。

```tsx
<div
  className={cn(
    "rounded-md border px-4 py-2",
    isActive && "border-primary bg-primary/10",
    disabled && "pointer-events-none opacity-50",
    className,
  )}
/>
```

## Comments and cleanup

- WHATを説明するcommentより、識別子と小さい関数で表現する。
- commentは外部制約、security理由、非自明な互換性などWHYに限定する。
- TODOには残す理由と解消条件を書く。担当者名だけのTODOにしない。
- dead code、不要import、debug log、使われないexportを残さない。
- 無関係なformat、rename、refactorを同じ変更へ混ぜない。
- test fileは作成も追記もしない。Quine指定の静的検証とsmoke checkを使う。

## Code checklist

- `any`、non-null assertion、unsafe castがないか。
- 名前から対象と役割が分かるか。
- validationが正しいtrust boundaryにあるか。
- provider errorやsecretがclient/logへ漏れないか。
- server stateをclient stateへ不要に複製していないか。
- formのsubmit、success、expected errorが扱われているか。
- mockupとaccessibilityを保っているか。
- unrelated cleanupを混ぜていないか。
