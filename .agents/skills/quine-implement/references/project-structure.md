# Project structure

Quine の正規ディレクトリ構造、各ファイルの責務、依存方向を定義する。新規ファイルの配置はこの reference を正にする。

## Contents

- [Canonical tree](#canonical-tree)
- [Frontend](#frontend)
- [Convex](#convex)
- [Shared data and project files](#shared-data-and-project-files)
- [Dependency direction](#dependency-direction)
- [Placement decisions](#placement-decisions)

## Canonical tree

```text
quine/
├── apps/
│   └── frontend/
│       ├── app/                         # Next.js route と composition
│       │   ├── (public)/
│       │   ├── (app)/
│       │   ├── api/                     # HTTP boundary が必要な処理
│       │   ├── layout.tsx
│       │   ├── providers.tsx
│       │   └── globals.css
│       ├── features/                    # feature 単位の UI と Next adapter
│       │   └── <feature>/
│       │       ├── components/
│       │       │   ├── <Feature>View.tsx
│       │       │   ├── <Feature>Content.tsx
│       │       │   └── <Feature>Section.tsx
│       │       ├── actions.ts           # 必要な場合だけ
│       │       ├── <feature>-form-schema.ts
│       │       └── <specific-helper>.ts
│       ├── components/                  # 複数 feature で使う純 UI
│       │   └── ui/                      # shadcn primitive
│       ├── lib/                         # frontend 横断基盤
│       ├── hooks/                       # 複数 feature で使う hook
│       ├── contexts/                    # 複数 feature で使う Context
│       ├── public/                      # 静的 asset
│       └── middleware.ts                # route auth境界
├── convex/
│   ├── schema.ts                        # DB schema の単一 entrypoint
│   ├── auth.ts
│   ├── auth.config.ts
│   ├── http.ts
│   ├── <resource>.ts                    # public/internal Convex adapter
│   ├── <feature>Action.ts               # Node action entrypoint
│   ├── application/
│   │   └── <feature>/
│   │       └── <verb-object>.ts         # 複雑な transaction use case
│   ├── infra/
│   │   └── <provider>/                  # GitHub/OpenAI 等の外部接続
│   ├── lib/                             # Convex 横断基盤
│   └── _generated/                      # Convex codegen
├── data/                                # frontend/Convex 共有 canonical data
├── mockup/                              # design source、read-only
├── .docs/                               # product docs と進捗
├── .agents/skills/                      # 実装 workflow の正規ソース
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

独立した `domain/` 層は作らない。業務ルールは最初に該当 use case 内へ置き、複数 use case で同じ純粋ルールが必要になった時だけ `convex/application/<feature>/` 内の明確な名前のファイルへ切り出す。

## Frontend

### `apps/frontend/app/**/page.tsx`

**Responsibility**

- URL params / searchParams を読む。
- metadata を定義する。
- feature の `*View` を配置する。

**Do not place**

- Convex の直接呼び出し。
- フォーム、client state、業務判断。
- 長い正規化や resource 操作。
- `"use server"`。page は directive なしで Server Component になる。

```tsx
import { ProductEditView } from "@/features/products/components/ProductEditView";

export default async function Page({ params }: PageProps) {
  const { productId } = await params;
  return <ProductEditView productId={productId} />;
}
```

URL segment の decode や route としての妥当性確認は page に置いてよい。feature の business input へ変換する長い処理は feature の名前付き helper へ移す。

### `apps/frontend/app/layout.tsx`

document shell、global CSS、font、metadata、`providers.tsx`の配置だけを置く。feature query、画面固有layout、user別redirectをroot layoutへ集約しない。

route group固有のlayoutは、そのgroupで共有するnavigationとauth-aware shellを組み立てる。DB authorization自体はConvex functionで行う。

### `apps/frontend/app/providers.tsx`

Convex Auth、theme、toast等、app全体のReact providerをまとめるClient Component。feature固有Contextや画面data取得を置かない。providerの追加は全routeへclient boundaryとruntime costを広げるため、feature内で閉じられない場合だけ行う。

### `apps/frontend/app/globals.css`

Tailwind v4 theme token、font、reset、app全体のbase styleだけを置く。feature固有classや特定pageだけのlayoutを追加しない。

### `apps/frontend/app/api/**/route.ts`

HTTP method、cookie、header、redirect、webhook、streaming が必要な入口だけを置く。通常 CRUD のために Route Handler を作らない。

Route Handler は request を検証し、認証を確定して Convex 関数を呼ぶ薄い adapter にする。GitHub OAuth callback のような HTTP protocol helper は該当 feature の server-only module または明確な共通基盤へ置く。

### `apps/frontend/middleware.ts`

route単位の認証有無、session更新、早いredirectだけを扱う。resource owner、onboarding完了状態、DB上のroleをmiddlewareだけで確定しない。Next.js/Convex Authのversion依存があるため、既存contractを確認せず独自middlewareへ置き換えない。

### `apps/frontend/features/<feature>/`

ユーザーの作業単位でまとめる。UI、UI input、表示用変換、任意の Next Server Action を置く。

feature 固有コードを `features/<feature>/lib/` へまとめない。役割が分かるファイル名で feature root に置く。

```text
features/products/
├── components/
├── actions.ts                  # optional
├── product-form-schema.ts
├── markdown-edit.ts
├── product-error.ts
└── product-screenshot-draft.ts
```

`actions.ts` は native form、cookie、redirect、`revalidatePath` など Next runtime が必要な場合だけ作る。通常の Convex mutation を包むためだけには作らない。

### `components/*View.tsx`

Server Component の画面集約。認証済みtokenの取得、`preloadQuery` / `fetchQuery`、redirect、`*Content` の composition を担当する。

- `"use server"` を書かない。
- React client hook を使わない。
- DB更新や外部副作用を行わない。

### `components/*Content.tsx`

`"use client"` を持つ画面 controller。`usePreloadedQuery`、`useQuery`、`useMutation`、`useAction`、フォーム、UI state、event handler を担当する。

- 初期取得に `useEffect + fetch` を使わない。
- owner/authをUI表示だけで守らない。
- 大きな純粋変換は feature root の名前付き module へ移す。

### `components/*Section.tsx`

画面内の意味のあるまとまり。表示だけなら Server/Client どちらでもよい。hook、event、formを持つ場合だけ `"use client"` にする。

### `features/<feature>/actions.ts`

任意の Next Server Action adapter。

- 先頭に `"use server"` を書く。
- auth、input parse、Next固有処理、Convex呼び出しだけにする。
- owner/state transition/DB整合性をここだけで守らない。
- async function 以外を export しない。

### `features/<feature>/<feature>-form-schema.ts`

React Hook Form が扱う入力schema、default value、UI固有の変換を置く。DB document schemaやConvex public validatorを置かない。

### `apps/frontend/components/`

複数 feature で再利用する純 UI だけを置く。feature固有語彙、Convex hook、業務error codeを持たせない。shadcn由来primitiveは `components/ui/` に限定する。

### `apps/frontend/lib/`

env、`cn()`、server/client foundation、provider設定など複数featureが同じ理由で依存する基盤だけを置く。feature固有helper、error mapping、form logicを置かない。

共有化は3箇所目を目安にし、単にコードが似ているだけで昇格しない。

### `apps/frontend/hooks/`

複数featureが同じ意味で使うclient hookだけを置く。feature固有hookはfeature rootまたは該当componentの近くに置く。server stateを独自storeへ複製するhookや、名前だけ汎用の`useData`を作らない。

### `apps/frontend/contexts/`

app全体または複数featureにまたがる一時的なclient UI stateだけを置く。Convex document/query結果、認証source of truth、server永続stateをContextへ複製しない。

### `apps/frontend/public/`

build時に同梱する静的assetだけを置く。user upload、AI生成画像、private fileはConvex File Storageへ置く。既存icon systemや`simple-icons`で解決できるassetを重複保存しない。

## Convex

### `convex/auth.ts` and `convex/auth.config.ts`

Convex Auth provider、callback、認証設定だけを置く。profile onboardingやfeature mutationを認証設定へ混ぜない。auth libraryが管理するtable/dataをapplication codeから直接変更しない。

### `convex/http.ts`

Convex HTTP Actionのroute登録entrypoint。OAuth callback、webhook等、`.convex.site`上のHTTP contractが必要な処理だけを接続する。通常query/mutationの代替HTTP APIを作らない。

### `convex/schema.ts`

DB table、field、index、relationを定義する唯一のschema entrypoint。フォームschema、外部API schema、業務用の別 `domain/schema.ts` を作らない。

table定義を責務別ファイルへ分けて `defineSchema` を複数作らない。schema変更は migration 順序と一緒に設計する。

### `convex/<resource>.ts`

Convexが公開・登録する query / mutation / internal function の adapter。API名を `api.products.saveForm` のようにresource単位で安定させる。

**Place here**

- args / returns validator。
- `requireUser(ctx)` と公開範囲の確定。
- 単純な1回のread/write。
- application use case の呼び出し。

**Move to application when**

- owner/access確認と更新を組み合わせる。
- 状態遷移を検証する。
- 複数tableを1 transactionで更新する。
- retry/idempotency/競合制御を行う。
- 同じuse caseを複数entrypointから呼ぶ。

public adapterを別directoryへ移すと generated API path が変わるため、root resource fileは薄い入口として維持する。

### `convex/application/<feature>/<verb-object>.ts`

複雑なtransaction use caseを置く。原則1 exported use case / fileとする。

- adapterで確定済みのuser/resource IDと `QueryCtx` / `MutationCtx` を受け取る。
- current state、owner、状態遷移、複数table更新を扱う。
- `ctx.db` を直接使い、同一transactionを維持する。
- `requireUser`、HTTP、React、Next API、外部SDKを持たない。
- applicationを単純なDB helperのwrapperにしない。

```ts
export async function saveProduct(
  ctx: MutationCtx,
  input: SaveProductInput,
): Promise<Id<"products">> {
  const product = await loadEditableProduct(ctx, input.productId, input.userId);
  // validate transition and update related tables in this transaction
  return product._id;
}
```

### `convex/infra/<provider>/`

Convexの外側にあるGitHub、OpenAIなどとの接続だけを置く。

```text
infra/github/client.ts
infra/github/response-schema.ts
infra/openai/client.ts
infra/openai/response-schema.ts
```

- SDK/fetch、provider request/response、timeout、provider error変換を置く。
- owner判断、Run状態遷移、DB更新を置かない。
- Convex DBをrepositoryで包まない。

### `convex/lib/`

認証、共通error factory、storage ownershipなど複数featureが依存するConvex基盤だけを置く。

```text
lib/auth.ts
lib/github-errors.ts       # 複数GitHub flowが共有する場合
lib/storage.ts             # 複数resourceが共有する場合
```

feature固有use case、外部client、表示変換を置かない。

### `convex/<feature>Action.ts`

`"use node"` が必要な外部I/Oの登録entrypoint。Node action fileにはaction/internalActionだけを置く。DBは `ctx.runQuery` / `ctx.runMutation` 経由で触り、外部接続の詳細は `infra/` へ移す。

### `convex/_generated/`

Convex codegen。手動編集しない。version controlへ含める。

## Shared data and project files

### `data/`

frontendとConvexが同じ値を参照するcanonical static data、型、そのdataだけを読む決定的helperを置く。

- I/O、環境変数、時刻、random、mutable stateを持たない。
- DB/feature/UIに依存しない。
- Quineの技術stack keyは `data/tech-stack.ts` を唯一の正規ソースにする。

### `mockup/`

designの真理値。read-only。実装コードからimportせず、直接編集しない。

### `.docs/`

product requirementと進捗を置く。

- `.docs/STATUS.md`: 実装・接続・検証・残作業。
- `.docs/INDEX.md`: product docsの索引。
- architectureやコード規約を複製しない。

### `.agents/skills/`

実装workflowと配置ルールの正規ソース。AGENTS.mdは入口だけを持ち、詳細はskillへ委譲する。

## Dependency direction

```text
apps/frontend/app
  -> features, shared components, frontend lib, data

apps/frontend/features
  -> convex/_generated, shared components, frontend lib, data

apps/frontend/components
  -> frontend lib, data

convex/<resource>.ts
  -> application, convex lib, data, _generated

convex/application
  -> convex lib, data, _generated types

convex/*Action.ts
  -> infra, convex lib, data, _generated/internal API

convex/infra
  -> convex lib, data, external SDK

data
  -> no project layer
```

禁止方向:

- `convex/` から `apps/frontend/`。
- `application/` から Next/React/UI。
- `infra/` から application/feature。
- shared `components/` から feature。
- feature A から feature B のprivate module。共通責務ならsharedへ昇格する。

frontendからroot Convex実装をimportせず、`@convex/_generated/*` だけを使う。

## Placement decisions

| Question | Placement |
|---|---|
| URLと画面配置か | `app/**/page.tsx` |
| HTTP/cookie/webhook/redirectか | `app/api/**/route.ts` または必要なcallback `route.ts` |
| 1 featureだけのUI/表示変換か | `features/<feature>/` |
| native formやNext固有mutationか | `features/<feature>/actions.ts` |
| 3 feature以上で同じ純UIか | `components/` |
| frontend全体の基盤か | `apps/frontend/lib/` |
| DB table/indexか | `convex/schema.ts` |
| public Convex APIか | `convex/<resource>.ts` |
| 複雑なtransaction use caseか | `convex/application/<feature>/` |
| GitHub/OpenAIなど外部接続か | `convex/infra/<provider>/` |
| Convex横断の基盤か | `convex/lib/` |
| frontend/Convex共有の静的正規データか | `data/` |

迷う場合は、最も狭い責務の場所へ置く。汎用名の `utils.ts`、`helpers.ts`、`validators.ts`、`services.ts` を新設せず、目的が分かる名前を付ける。
