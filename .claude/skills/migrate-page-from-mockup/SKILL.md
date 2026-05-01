---
name: migrate-page-from-mockup
description: mockup/ の HTML 1 ページを Next.js + Tailwind + Convex の構成に移植する。CSS の Tailwind 化、shadcn primitive 適用、`*View` / `*Content` 分割、ハードコードデータの Convex query 置換、必要なら schema 追加までを行い、**動くアプリの一部として完成させる**。
---

あなたは Quine の UI 移植エンジニアとして $ARGUMENTS のページを mockup から実装側に移植する。

$ARGUMENTS が空、またはページ名が不明確な場合は、対象ページ（例: `lp`, `users`, `user-profile`, `products`, `product-detail`, `product-edit`, `tech-stack-detail`, `tech-stack-edit`, `signup-*`）をユーザーに確認してから進む。

## ゴール

**「mockup と見た目が同じで、データが Convex から流れ、ボタンを押すと実際に動くページ」を 1 枚成立させる**。

「見た目だけの移植」「ハードコードのモック」「TODO だらけ」は不可。最小でも:
- 公開ページなら → 必要な query を Convex に追加し、レコードがあれば表示できる状態
- 認証ページなら → mutation も含めて、フォーム送信が DB に書き込まれる状態
- ボタン / リンクの遷移先が存在しないなら、せめて空ページを置く（404 にしない）

## 必読 docs

実装に入る前に必ず:

- [`.docs/INDEX.md`](../../../.docs/INDEX.md) — タスク種別から関連 docs を絞る
- [`.docs/08_mockup.md`](../../../.docs/08_mockup.md) — mockup の構造と移植方針
- [`.docs/05_directory-structure.md`](../../../.docs/05_directory-structure.md) — 配置、依存方向、View/Content
- [`.docs/06_convex.md`](../../../.docs/06_convex.md) — schema、query/mutation、権限分岐
- [`.docs/07_coding-guidelines.md`](../../../.docs/07_coding-guidelines.md) — Tailwind の書き方、Server/Client

要件確認が必要な場合のみ `01_product.md` `02_account.md` `04_login.md` 等を追加で読む。

## 絶対ルール（破ったらやり直し）

- **mockup を直接編集しない**（read-only 参照元）
- **デザインを勝手に簡素化しない**（mockup の見た目を 100% 再現、崩す前にユーザーに確認）
- **モックデータを残さない**: HTML 内のハードコード配列、`mockup/data/*.js` 等は Convex query 経由に置換。空なら EmptyState を表示。「TODO: 後で繋ぐ」は不可
- **必要なら schema を増やす**: query が無くて諦めない。`convex/schema.ts` への追加が必要なら追加する（破壊的変更だけはユーザーに確認）
- **`useEffect + fetch` 禁止**（`*View` で `preloadQuery`）
- **`components.css` を import しない**（必要なクラスだけ Tailwind 化）
- **shadcn primitive で代替できるものは shadcn を使う**（Dialog / Popover / DropdownMenu / Tabs / Tooltip / Sonner）

## 既に揃っているリソース（再生成しない）

- `data/technologies.ts` — 技術カタログ（580 件、`@data/technologies` で import）
- `apps/frontend/public/tech_stack_logo/<key>.png` — ロゴ画像 628 ファイル
- `apps/frontend/lib/technology-logo.ts` — 技術名 → ロゴパス helper
- shadcn primitive 13 種（`apps/frontend/components/ui/`）
- Tailwind theme（`apps/frontend/app/globals.css` に Quine dark palette 反映済み）

mockup 側の `mockup/data/technologies.js` と `mockup/assets/tech_stack_logo/` は同じ内容のサブセット。**実装側ではこれらを使わない**。

## 手順

### 1. mockup を読む
- 対象 HTML を全文読み、`<!-- ========== Section ========== -->` でセクション分割の単位を把握
- 使われている class、依存 JS（`header.js`, `lp.js`, `notion-editor.js` 等）、ハードコードデータを列挙
- 該当 class の CSS 定義を `mockup/components.css` から `grep` で抽出

### 2. ルートと feature ディレクトリを決める
- ルート: `05_directory-structure.md` §2（公開は `app/(public)/`、認証は `app/(app)/`、`/@username` 形式は `04_login.md` §4）
- feature: `apps/frontend/features/<feature>/components/{<Feature>View,<Feature>Content,<Section>...}.tsx`

### 3. データ層を整える
- 必要なテーブルが [`convex/schema.ts`](../../../convex/schema.ts) にあるか確認。なければ追加（schema は **1 ファイル集約**、テーブルごとに分割しない）
- query / mutation / action が `convex/<table>.ts` にあるか確認。なければ追加
- 公開度に応じた権限分岐（`06_convex.md` §5）
  - 公開: auth チェックなし
  - 認証必須: `requireUser(ctx)`
  - 所有者限定: `requireUser` + `authorId === user._id`
- schema 変更後は `pnpm dlx convex dev --once --until-success` を叩いて push + codegen 更新

### 4. View / Content を実装
- `*View` (Server): `preloadQuery` で初期データ取得
- `*Content` (Client): `usePreloadedQuery` でリアルタイム購読、`useMutation` で更新
- 例は `06_convex.md` §6

### 5. HTML → JSX に変換
- 構造はそのまま、class → className、for → htmlFor
- CSS クラスを Tailwind utility に置換（`mockup/components.css` で定義を確認しながら）
- インライン style も Tailwind に
- shadcn で代替できる UI（modal, dropdown, tabs, tooltip 等）は置換
- mockup の JS インタラクションは React state / hook に

### 6. ボタン / リンクの遷移先
- 遷移先が未実装でも 404 にしない。最低限 `app/<route>/page.tsx` を空ページで作る、または disabled にして TODO コメント残す（ただし**主要導線**は disabled で済ませない）

### 7. 確認

```bash
pnpm typecheck   # エラー 0 になるまで
pnpm dev         # ブラウザで mockup と並べて見比べる
```

ブラウザ確認項目:
- レイアウト / 色 / 余白 / ホバー状態が mockup と一致
- mutation 実行で dashboard.convex.dev のデータが実際に変わる
- 公開 / 認証必須 / 所有者限定の出し分けが効く

### 8. レポート
- 追加・変更したファイル
- 追加した schema / query / mutation
- shadcn で追加した primitive
- mockup と差異がある箇所（あれば理由付き）
- 動作確認結果（query / mutation が DB に反映されたか）

## 禁止

- mockup を直接編集する
- `components.css` を直接 import する
- **ハードコードモックデータを残す**（必ず Convex query 経由）
- デザインを勝手に簡素化する
- `useEffect + fetch` で初期取得する
- 公開ページの query で auth 必須にする
- 型チェック未実施 / ブラウザ確認未実施で完了報告する
- 「データ繋ぎは別タスク」として分離する（このスキルの範囲）
