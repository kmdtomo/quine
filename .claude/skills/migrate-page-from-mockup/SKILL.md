---
name: migrate-page-from-mockup
description: mockup/ の HTML 1 ページを Next.js + Tailwind + Convex の構成に移植する。CSS の Tailwind 化、shadcn primitive 適用、`*View` / `*Content` 分割、ハードコードデータの Convex query 置換までを行う。
---

あなたは Quine の UI 移植エンジニアとして $ARGUMENTS のページを mockup から実装側に移植する。

$ARGUMENTS が空、またはページ名が不明確な場合は、対象ページ（例: `user-profile`, `product-detail`, `products`, `lp`）をユーザーに確認してから進む。

## 0. 前提 docs を確認（スキップ厳禁）

**最初に必ず [`.docs/INDEX.md`](../../../.docs/INDEX.md) を読む**。本スキルで参照する基本 docs:

- `08_mockup.md` — mockup の役割・構造・移植方針
- `05_directory-structure.md` — ルート構造、View/Content の分割ルール
- `06_convex.md` — query / mutation / 権限分岐（公開・認証・所有者）
- `07_coding-guidelines.md` — Tailwind の書き方、Server/Client の使い分け

要件確認が必要な場合のみ `01_product.md` `02_account.md` 等を追加で読む。

## パスの前提

- mockup 側: `mockup/<page-name>.html` + `mockup/components.css` + `mockup/common.css`
- 実装側: `apps/frontend/app/`, `apps/frontend/features/`, `apps/frontend/components/` 配下
- Convex: root の `convex/`

### 技術スタック関連で既に揃っているリソース

技術スタック系のページ（`tech-stack-detail`, `tech-stack-edit`, `user-profile` の TechStack 部分など）を移植する際は **新規作成せず** 以下を使う:

| リソース | 場所 |
|---|---|
| 技術カタログ（key / name / description / category） | `convex/seeds/technologies.ts` |
| ロゴ画像 628 ファイル | `apps/frontend/public/tech_stack_logo/<key>.png` |
| 技術名 → ロゴパス変換 helper | `apps/frontend/lib/technology-logo.ts` |

mockup 側の `mockup/data/technologies.js` と `mockup/assets/tech_stack_logo/` は同じ内容のサブセットなので、実装側ではこちらは使わない。

## 絶対ルール

- **IMPORTANT**: mockup を直接編集しない。mockup は read-only の参照元
- **デザインを勝手に簡素化しない**。mockup の見た目を 100% 再現する。崩したい場合はユーザーに確認
- **`useEffect + fetch` で初期データを取らない**。`*View` で `preloadQuery` する
- **components.css 全体を import しない**。必要なクラスだけ Tailwind 化していく
- **shadcn primitive で代替できるものは shadcn を使う**（Dialog / Popover / DropdownMenu / Tabs / Toast / Tooltip）

## 1. mockup を読み込む（スキップ厳禁）

対象ページの mockup を構造的に読む。

```bash
cat mockup/<page-name>.html
```

- HTML 内の `<!-- ========== ComponentName ========== -->` 区切りを抽出 → コンポーネント分割の単位とする
- 使われている class を全て列挙
- 使われている JS 機能（state, dropdown 開閉, タブ切替など）を洗い出す
- `mockup/data/technologies.js` 等のモックデータ参照を確認

該当する CSS クラスの定義を `mockup/components.css` から `grep` で抽出する。

```bash
grep -n "\.<class-name>" mockup/components.css
```

## 2. ルート（route）を決める

`05_directory-structure.md` の §2 に従う。

| ページ | ルート | 公開度 |
|---|---|---|
| LP | `app/(public)/page.tsx` | 公開 |
| プロフィール | `apps/frontend/app/(public)/@[username]/page.tsx` | 公開 |
| プロダクト詳細 | `apps/frontend/app/(public)/@[username]/[productSlug]/page.tsx` | 公開 |
| プロダクト一覧 | `apps/frontend/app/(public)/products/page.tsx` | 公開 |
| プロダクト編集 | `apps/frontend/app/(app)/@[username]/[productSlug]/edit/page.tsx` | 所有者のみ |
| プロフィール編集 | `apps/frontend/app/(app)/@[username]/edit/page.tsx` | 所有者のみ |
| 設定 | `apps/frontend/app/(app)/settings/page.tsx` | 認証必須 |
| サインアップ各ステップ | `apps/frontend/app/signup/<step>/page.tsx` | 認証 |

## 3. feature ディレクトリを作る

```
apps/frontend/features/<feature>/
├── components/
│   ├── <Feature>View.tsx       # Server: preloadQuery
│   ├── <Feature>Content.tsx    # Client: usePreloadedQuery
│   ├── <Section1>.tsx          # mockup の <!-- ========== Section1 ========== --> ごとに分割
│   └── <Section2>.tsx
├── lib/                        # 必要な定数・helper
└── schema.ts                   # フォーム validation（編集ページ）
```

セクション分割の判断基準は `08_mockup.md` §5 の表を参照。

## 4. Convex スキーマと query を確認 / 追加

このページで必要なデータが Convex 側にあるか確認。なければ追加。

```bash
ls convex/
```

- 必要なテーブルが `convex/schema.ts` にあるか
- query / mutation が `convex/<table>.ts` にあるか
- 公開ページは auth チェックなし、認証必須は `requireUser`、所有者限定は `authorId` チェック（`06_convex.md` §5）

不足があれば追加するが、**スキーマの破壊的変更が必要な場合は先にユーザーに確認**する。

## 5. View / Content を実装

### View（Server Component）

```tsx
// apps/frontend/features/<feature>/components/<Feature>View.tsx
import { preloadQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { <Feature>Content } from "./<Feature>Content";

export async function <Feature>View({ ...params }: Props) {
  const preloaded = await preloadQuery(api.<table>.<query>, { ...params });
  return <<Feature>Content preloaded={preloaded} />;
}
```

### Content（Client Component）

```tsx
"use client";
import { usePreloadedQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

export function <Feature>Content({ preloaded }: Props) {
  const data = usePreloadedQuery(preloaded);
  // 状態管理 / ハンドラ
  return <>...</>;
}
```

## 6. mockup の HTML を JSX に変換

機械的に変換していく。

### 6-1. 構造はそのまま JSX に

mockup の HTML タグ構造をそのまま JSX に。class → className、`for` → `htmlFor` など。

### 6-2. CSS クラスを Tailwind に置換

各クラスを `mockup/components.css` で確認 → Tailwind utility に置換 → JSX の `className` に書く。

```bash
# クラス定義を引く
grep -A 20 "^\.<class-name>" mockup/components.css
```

- 共通トークン（カラー、スペーシング）は `tailwind.config.ts` の `theme.extend` に移し、Tailwind 経由で参照
- 複雑な複合スタイルは `cn()` で組み立てる
- ホバー / focus 等の状態は Tailwind の `hover:` `focus:` で表現

### 6-3. インライン style を Tailwind に

```html
<!-- mockup -->
<div style="margin-top: 20px; color: #666;">

<!-- → -->
<div className="mt-5 text-gray-600">
```

dynamic な値（progress bar の幅など）でやむを得ない場合のみ `style={{ ... }}` を残す。

### 6-4. shadcn primitive 適用

mockup で実装されている UI のうち、shadcn で代替できるものは置換する。

| mockup | shadcn |
|---|---|
| `.modal`, `.modal__overlay` | `<Dialog>` |
| `.popover`, `.dropdown` | `<Popover>`, `<DropdownMenu>` |
| `.tab`, `.tab--active` | `<Tabs>` |
| `.toast` | `<Toaster>` + `useToast()` |
| `.tooltip` | `<Tooltip>` |
| `.btn`（汎用ボタン） | `<Button>` |

未インストールなら `pnpm dlx shadcn@latest add <component>` で追加。

### 6-5. インタラクション JS を React state / hook に

mockup の `header.js` `lp.js` などの DOM 操作を、React の `useState` / `useEffect` / カスタムフックに変換する。

## 7. モックデータを Convex に置換

mockup でハードコードされていた配列・オブジェクトを、Convex query 経由に置き換える。

- `data/technologies.js` の参照 → `convex/techStacks.ts` の query 経由
- HTML 内ベタ書き（ユーザー一覧、プロダクト一覧）→ `usePreloadedQuery` 経由

ハードコードを残してはいけない。空の場合は EmptyState コンポーネントを表示。

## 8. 型チェック（スキップ厳禁）

```bash
pnpm typecheck
```

- エラー 0 まで完了ではない
- Convex の型が変わった場合は `pnpm convex:dev` で codegen 更新

## 9. ブラウザ確認（スキップ厳禁）

`pnpm dev` を起動して該当ページにアクセスし、mockup と並べて見比べる。

- レイアウト一致
- 色・余白一致
- ホバー / アクティブ状態一致
- インタラクション動作（モーダル開閉、タブ切替等）
- 公開 / 認証必須 / 所有者限定の出し分けが正しい

## 10. レポート

以下を簡潔にユーザーへ報告。

- 追加・変更したファイル一覧
- 移植元 mockup ファイルとの対応関係
- 追加した Convex スキーマ / query / mutation
- shadcn で導入した primitive 一覧
- mockup と差異がある箇所（あれば理由付きで）
- 型チェック結果
- ブラウザ確認の結果

## 禁止

- mockup の HTML / CSS を直接書き換えること
- `components.css` を直接 import すること
- ハードコードのモックデータを残すこと
- デザインを勝手に簡素化すること
- `useEffect + fetch` で初期取得すること
- 公開ページの query で auth を必須にすること
- 型チェック未実施で完了報告すること
