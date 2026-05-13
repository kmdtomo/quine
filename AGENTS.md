# Quine プロジェクトルール

## 現在のフェーズ: 実装（mockup → Next.js + Convex）

`mockup/` で完成済みのデザインを、Next.js 15 / Convex / Tailwind v4 / shadcn/ui で実装する。

## Stack

- **Next.js 15** App Router / TypeScript
- **Convex** （DB + 関数 + リアルタイム + 認証）
- **Convex Auth** + GitHub OAuth（ログイン用）
- **GitHub App** 別途インストール（リポ解析用）
- **Tailwind CSS v4** + **shadcn/ui**（primitive のみ採用、固有 UI は自前 Tailwind）
- **pnpm**

## Commands（実装着手後に確定）

```bash
pnpm dev              # Next.js dev server
pnpm convex:dev       # Convex dev（別ターミナル）
pnpm build
pnpm typecheck        # tsc --noEmit
pnpm lint
```

## Architecture（要点）

monorepo。将来 iOS を追加できるよう Convex は root に置く。

```
apps/frontend/
  ├── app/        → routing のみ。(public)/ と (app)/ で auth 境界を分ける
  ├── features/   → UI + Convex 呼び出し。*View（Server）/ *Content（Client）/ *Section
  ├── components/ → 複数 feature で再利用する純 UI（shadcn は components/ui/）
  ├── lib/        → auth ヘルパ、env、cn() などの横断関心事
  ├── hooks/, contexts/, public/
  └── middleware.ts
convex/           → schema.ts と <table>.ts に query / mutation / action（全クライアント共有）
```

import alias: `@/*` = `apps/frontend/*`、`@convex/*` = `convex/*`。
詳細は `.docs/05_directory-structure.md` を参照。

## Hard Rules

- **IMPORTANT**: 実装前に必ず該当 docs を読む（[02_account.md](.docs/02_account.md), [05_directory-structure.md](.docs/05_directory-structure.md), [06_convex.md](.docs/06_convex.md), [07_coding-guidelines.md](.docs/07_coding-guidelines.md) の中から関連するもの）
- **IMPORTANT**: コード変更後に必ず `pnpm typecheck` を実行。エラー 0 にする
- **`any` / `!`（non-null assertion）/ `as` キャスト禁止**（Convex `Id<>` 等の安全なキャスト除く）
- **mutation の最初で `requireUser(ctx)` を呼ぶ**。所有者限定なら `authorId` チェックも
- **`*View` は Server Component、`*Content` は Client Component**。`useEffect + fetch` 禁止（`preloadQuery` を使う）
- **mockup を直接編集しない**: mockup は read-only の参照元。実装は `app/` `features/` 側に作る

## Workflow

- 着手前: 関連 docs 読む → 既存類似コード探す → 設計提示 → 承認後に実装
- 最小限の変更のみ。無関係コードのリファクタ禁止
- 論理単位ごとに分けてコミット
- 2 案で迷ったら両方説明してユーザーに選ばせる
- 完了報告前に `pnpm typecheck`

## ディレクトリ概要

- `mockup/` — **デザインの真理値（read-only）**。詳細は [.docs/08_mockup.md](.docs/08_mockup.md)
- `app/` `features/` `components/` `lib/` `convex/` — 実装本体
- `.docs/` — 設計ドキュメント
- `.Codex/skills/` — タスク特化スキル

## 設計ドキュメント

**新規セッション開始時は [.docs/STATUS.md](.docs/STATUS.md) を最初に読む**（進捗状況・次のタスク・既知課題）。  
**実装着手時は [.docs/INDEX.md](.docs/INDEX.md) も読む**。タスク種別から必要な docs を絞り込む。

実装タスクの基本セットは `05`〜`08`:

| ファイル | 内容 |
|---|---|
| `.docs/05_directory-structure.md` | 配置ルール / 依存方向 / View・Content パターン |
| `.docs/06_convex.md` | Convex スキーマ / 認証 / 権限分岐 / 接続セットアップ |
| `.docs/07_coding-guidelines.md` | 型安全 / 命名 / import 順 / Server-Client |
| `.docs/08_mockup.md` | mockup の構成と移植方針 |
| `.docs/09_gotchas.md` | 過去にハマった罠と対処（実装前にざっと眺める） |

プロダクト仕様（`00_manifesto.md` 〜 `04_login.md`）は要件確認が必要な時のみ参照。

## Skills

- **`migrate-page-from-mockup`** — mockup の 1 ページを Next.js + Tailwind に移植
- **`quine-implement`** — 機能実装全般（docs 読む → 設計 → 実装 → typecheck）
- **`quine-init`** — 初期セットアップ（一回限り）

## Out of scope

- mockup の HTML / CSS の編集（デザイン変更は mockup 側を直してから移植）
- Convex 以外の DB / バックエンド（Supabase, Prisma 等を持ち込まない）
- 認証ライブラリの追加（Convex Auth 一本）
