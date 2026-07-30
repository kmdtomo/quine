# ディレクトリ構造と配置ルール

> 新しいファイルをどこに置くか、どこから何を import してよいかを定義する。GENSEKI のレイヤー分離を踏襲しつつ、Convex に合わせて簡略化している。

**関連reference:** [Convex設計](convex-design.md), [Frontend規約](frontend-rules.md)

## 目次

- [基本原則](#1-基本原則)
- [全体構造](#2-全体構造)
- [依存方向](#3-依存方向)
- [配置ルール](#4-配置ルール)
- [View / Content / Section](#5-view--content--section)
- [featureとshared](#6-feature-と-shared-の判断基準)
- [チェックリスト](#7-チェックリスト)

---

## 1. 基本原則

1. `app/` は routing に限定する
2. `features/` は UI と Convex 呼び出しの入口を持つ
3. `convex/` は DB スキーマと query / mutation / action の単一ソース
4. `components/` は複数 feature で再利用する UI のみ置く
5. `lib/` は認証ヘルパ、env、logger など横断関心事を持つ

## 2. 全体構造

monorepo 構成。将来 iOS / 他クライアントを `apps/` 配下に追加できるよう、Convex は root に置く。

```
quine/
├── apps/
│   └── frontend/                   # Next.js App Router
│       ├── app/                    # routing のみ
│       │   ├── (public)/           # 未ログインでもアクセス可
│       │   │   ├── page.tsx        # LP
│       │   │   ├── [username]/
│       │   │   │   ├── page.tsx                # 公開プロフィール
│       │   │   │   └── [productSlug]/page.tsx  # 公開プロダクト詳細
│       │   │   └── explore/page.tsx
│       │   ├── (app)/              # ログイン必須（middleware で保護）
│       │   │   ├── settings/page.tsx
│       │   │   └── @[username]/edit/page.tsx
│       │   ├── api/                # 外部 webhook（GitHub App 等）
│       │   │   └── webhooks/github/route.ts
│       │   ├── signin/page.tsx
│       │   ├── signup/page.tsx
│       │   ├── layout.tsx
│       │   └── globals.css
│       ├── features/               # 機能別モジュール
│       │   └── <feature>/
│       │       ├── components/
│       │       │   ├── <Feature>View.tsx     # Server: preloadQuery + Content
│       │       │   ├── <Feature>Content.tsx  # Client: useQuery + useMutation
│       │       │   └── <Feature>Section.tsx  # 部分 UI
│       │       ├── lib/            # feature 内 helper / 定数
│       │       └── schema.ts       # フォーム用 Zod（必要時）
│       ├── components/             # 複数 feature で再利用する UI
│       │   └── ui/                 # shadcn/ui 由来の primitive
│       ├── lib/                    # 横断関心事
│       │   ├── auth.ts             # Convex Auth ヘルパのラッパ
│       │   ├── env.ts
│       │   └── utils.ts            # cn() など
│       ├── hooks/                  # 共通 React hooks
│       ├── contexts/               # 共通 Context
│       ├── public/                 # 静的アセット
│       ├── middleware.ts           # ルート保護
│       ├── next.config.ts
│       ├── tsconfig.json
│       └── package.json
├── convex/                         # Convex 必須構造（全クライアント共有）
│   ├── schema.ts                   # DB テーブル定義
│   ├── auth.config.ts
│   ├── auth.ts                     # Convex Auth セットアップ
│   ├── _generated/                 # Convex codegen（gitignore しない）
│   ├── <resource>.ts               # query / mutation / internal function
│   ├── <feature>Action.ts          # Node action（必要な場合）
│   └── lib/<feature>/              # 純粋ロジック、外部応答のparse
├── data/                           # frontend / convex 共有の静的データ
│   ├── tech-stack.ts               # 技術スタックの正規カタログ + 型 + 検出 alias
│   └── technologies.ts             # 互換 re-export（新規実装では tech-stack.ts を使う）
├── mockup/                         # デザインの真理値（read-only）
├── .docs/                           # プロダクト仕様、STATUS、索引
├── .agents/skills/                  # 実装ルールとtask workflowの正規ソース
├── .claude/skills/                  # .agents/skillsを参照する互換入口
├── package.json                    # workspace root
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

### `apps/frontend/` 内の import alias

`tsconfig.json` の `paths` で以下のエイリアスを設定する:

| エイリアス | 指す先 |
|---|---|
| `@/*` | `apps/frontend/*`（自身） |
| `@convex/*` | `convex/*`（root の Convex。frontend からは `_generated/` のみ import 可） |
| `@data/*` | `data/*`（共有静的データ） |

例:
- `import { api } from "@convex/_generated/api"`
- `import { techStackCategories } from "@data/tech-stack"`

## 3. 依存方向

```
apps/frontend/app/        → apps/frontend/features/, components/, lib/, data/
apps/frontend/features/   → convex/_generated/, apps/frontend/components/, lib/, data/
apps/frontend/components/ → apps/frontend/lib/, data/
convex/                   → convex/ 内 + data/ のみ（features/ や app/ を import しない）
data/                     → 外を import しない（純データのみ）
```

### 禁止

- `app/` から `convex/` の関数を直接呼ぶ（必ず `*View` 経由）
- `convex/_generated/` 以外を features から import する（`convex/seeds/` 等への直接 import は禁止 → 共有データは `data/` に置く）
- `convex/` 内から `features/` や `app/` を import する（`data/` の import は OK）
- `components/` に feature 固有のロジック・文言を置く
- `data/` に動的処理（関数）を置く（純データ・型のみ）

## 4. 配置ルール

パスは frontend アプリの場合、`apps/frontend/` を前置する。Convex のみ root。

| 作るもの | 配置先 | ルール |
|---|---|---|
| ページ route | `apps/frontend/app/**/page.tsx` | params を受けて `*View` を呼ぶだけにする |
| API Route | `apps/frontend/app/api/**/route.ts` | webhook など Convex の外から来るリクエスト専用 |
| feature の UI | `apps/frontend/features/<feature>/components/` | View / Content / Section を分ける |
| 共有 UI | `apps/frontend/components/` | 複数 feature で再利用する純 UI のみ |
| shadcn primitive | `apps/frontend/components/ui/` | shadcn CLI が出力する場所 |
| Convex schema | `convex/schema.ts` | **1 ファイル集約。テーブル単位で分割しない**（`defineSchema` は単一エントリポイント） |
| query / mutation | `convex/<resource>.ts` | resource責務で分け、public入口を薄くする |
| Node action | `convex/<feature>Action.ts` | 外部I/Oだけを置き、DB処理はinternal functionへ戻す |
| Convex helper | `convex/lib/<feature>/` | 純粋ロジック、parser、feature固有helper |
| 共有静的データ | `data/<name>.ts` | frontend / convex 両方から参照する純データ（技術カタログ等）。関数を含めない |
| 認証ロジック | `convex/auth.ts` + `apps/frontend/lib/auth.ts` | Convex 側と Next.js 側のヘルパを分離 |
| フォーム validation | `apps/frontend/features/<feature>/schema.ts` | Zod。Convex の `v.*` とは別物 |
| 横断 helper | `apps/frontend/lib/` | UI / feature 業務に依存しない |

### 技術スタックカタログ

`data/tech-stack.ts` は Quine 内で扱う技術スタックの **canonical catalog**。`technology.key` は DB / UI / URL / GitHub 解析 / 編集フォームで共通利用する唯一の正規 ID とする。`data/technologies.ts` は既存 import 互換の re-export であり、新規実装では使わない。

- key は lowercase ASCII の安定 slug。表示名や依存パッケージ名をそのまま key にしない
- key はリリース後に変更しない前提で扱う。リリース前に命名を整える
- 表示名、説明、カテゴリ、検出 alias は `data/tech-stack.ts` に集約する
- npm / pip / gem / crate / GitHub Languages などの検出 alias は key に寄せるための別レイヤーとして扱う
- 検出 alias / ロゴ / DB 保存値など、key を参照するデータは `TechnologyKey` 型で縛り、存在しない key を typecheck で落とす
- ロゴはSVGのみを基本とする。simple-icons にあるものは `simple-icons` package から直接 import し、`public/` に複製しない
- AWS / Google Cloud / Azure など公式SVGを取得できるものは、公式アイコンパックから必要な `<key>.svg` だけを `apps/frontend/public/tech_stack_logo/` に置く。元パック丸ごとはコミットしない
- SVGで正しく取得できないものは無理に表示しない。PNG/WebPは新規の技術スタックアイコンとして使わない

例: `Next.js` は表示名、`next` は npm package 名、`nextjs` が Quine の canonical key。

## 5. View / Content / Section

Convex を使う場合の役割分担。

| 種別 | 役割 | Server / Client | 必須ルール |
|---|---|---|---|
| `*View` | Loader。`preloadQuery` で初期データを取り、`*Content` に渡す | Server | client hook を使わない |
| `*Content` | 表示 / 操作 / 状態。`usePreloadedQuery` でリアルタイム購読、更新は `useMutation` | Client | 初期取得の `useEffect + fetch` を書かない |
| `*Section` | UI のまとまり | Server / Client | 編集を含むなら Client にする |

### 必須ルール

- `*View` は server component として `preloadQuery` を呼ぶ
- `*Content` は `Preloaded<typeof api.x.y>` を Props で受け取る
- 更新系（mutation 呼び出し）は `*Content` から行う
- 公開ページ（未ログイン可）の `*View` は auth チェックを行わない。query 側で公開フィールドだけ返す
- 認証必須ページの `*View` は `auth.getUserId()` でチェックし、null ならリダイレクト

### canonical 例

```tsx
// apps/frontend/app/(public)/[username]/page.tsx
export default function Page({ params }) {
  return <ProfileView username={params.username} />;
}

// apps/frontend/features/profile/components/ProfileView.tsx (Server)
import { preloadQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export async function ProfileView({ username }: { username: string }) {
  const preloaded = await preloadQuery(api.users.getProfile, { username });
  return <ProfileContent preloaded={preloaded} />;
}

// apps/frontend/features/profile/components/ProfileContent.tsx (Client)
"use client";
import { usePreloadedQuery, useMutation } from "convex/react";

export function ProfileContent({ preloaded }) {
  const profile = usePreloadedQuery(preloaded);
  const update = useMutation(api.users.updateProfile);
  return <div>...</div>;
}
```

## 6. feature と shared の判断基準

| ケース | 配置先 |
|---|---|
| 1 つの feature でしか使わない UI / helper | `features/<feature>/...` |
| 2 箇所目で同じものが必要になった | まだ feature 内に残す（DRY 化を急がない） |
| 3 箇所以上で同じ責務・同じ入出力契約 | `components/` または `lib/` に昇格 |
| feature 固有語彙を含まない純 UI | `components/` |
| 認証 / env / logger などの横断関心事 | `lib/` |

### 迷ったときのデフォルト

- まず `features/<feature>/` に置く
- 共通化を急がない。差を観察する
- 3 箇所目で同じパターンが確認できたら昇格

## 7. チェックリスト

- [ ] `app/` にビジネスロジックを書いていない（`*View` 呼ぶだけ）
- [ ] `*View` が server component で `preloadQuery` を使っている
- [ ] `*Content` が `"use client"` で `usePreloadedQuery` を使っている
- [ ] 公開ページの query が auth チェックなしで動く（あるいは null を許容している）
- [ ] feature 固有の UI が `components/` に漏れていない
- [ ] `convex/` 内から外部 import していない
