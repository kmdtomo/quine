# Quine プロジェクトルール

## 現在のフェーズ: 実装（mockup → Next.js + Convex）

`mockup/` で完成済みのデザインを、Next.js 16 / Convex / Tailwind v4 / shadcn/ui で実装する。

## Stack

- **Next.js 16** App Router / TypeScript
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
pnpm --filter frontend lint
pnpm exec convex dev --once --typecheck enable  # Convex 変更時
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
詳細は [architecture reference](.agents/skills/quine-implement/references/architecture.md) を参照。

## Hard Rules

- **IMPORTANT**: 実装前に[quine-implement](.agents/skills/quine-implement/SKILL.md)のroutingに従って必要なreferenceを読む。要件確認時だけ[product docs](.docs/INDEX.md)を追加で読む
- **IMPORTANT**: コード変更後に必ず `pnpm typecheck` を実行。エラー 0 にする
- **IMPORTANT**: Convex 変更時は `pnpm exec convex dev --once --typecheck enable` も実行する。root の `pnpm typecheck` だけでは `convex/*.ts` の検証にならない
- **`any` / `!`（non-null assertion）/ `as` キャスト禁止**（Convex `Id<>` 等の安全なキャスト除く）
- **mutation の最初で `requireUser(ctx)` を呼ぶ**。所有者限定なら `authorId` チェックも
- **client 由来の `userId` / `authorId` / GitHub `installationId` を権限の根拠にしない**。認証ユーザーと DB の関連から導出する
- **画像・添付は Convex File Storage を使う**。data URL や巨大 string を document / Action 引数に保存しない
- **長時間の外部 API 処理は public mutation → Run 作成 → scheduled internalAction を基本にする**
- **`*View` は Server Component、`*Content` は Client Component**。`useEffect + fetch` 禁止（`preloadQuery` を使う）
- **mockup を直接編集しない**: mockup は read-only の参照元。実装は `app/` `features/` 側に作る
- **test file は作成・追記しない**。typecheck / lint / Convex 実行確認 / ブラウザ smoke で検証する

## Workflow

- 着手前: 関連 docs 読む → 既存類似コード探す → 設計提示 → 承認後に実装
- 最小限の変更のみ。無関係コードのリファクタ禁止
- 論理単位ごとに分けてコミット
- 2 案で迷ったら両方説明してユーザーに選ばせる
- 完了報告前に `pnpm typecheck`。Convex 変更時は Convex typecheck、UI 変更時はブラウザ smoke も行う

## ディレクトリ概要

- `mockup/` — **デザインの真理値（read-only）**。詳細は [mockup reference](.agents/skills/migrate-page-from-mockup/references/mockup.md)
- `app/` `features/` `components/` `lib/` `convex/` — 実装本体
- `.docs/` — プロダクト仕様、進捗、仕様索引
- `.agents/skills/` — 実装workflowと実装referenceの正規ソース
- `.claude/skills/` — `.agents/skills/`を参照する互換入口

## 情報の正規ソース

**新規セッション開始時は [.docs/STATUS.md](.docs/STATUS.md) を最初に読む**（進捗状況・次のタスク・既知課題）。  
**実装着手時は [reference index](.agents/skills/quine-implement/references/index.md) から必要なreferenceを選ぶ**。

実装ルール:

| ファイル | 内容 |
|---|---|
| `.agents/skills/quine-implement/references/core-rules.md` | 共通責務、identity、trust boundary |
| `.agents/skills/quine-implement/references/architecture.md` | 配置、依存方向、View / Content |
| `.agents/skills/quine-implement/references/frontend-rules.md` | 型、命名、Tailwind、フォーム |
| `.agents/skills/quine-implement/references/convex-design.md` | Convex、auth、Action、Run、Storage、migration |
| `.agents/skills/quine-implement/references/gotchas.md` | 過去に踏んだ罠と対処 |
| `.agents/skills/quine-implement/references/verification.md` | 完了前検証 |
| `.agents/skills/migrate-page-from-mockup/references/mockup.md` | mockupの構成と移植方針 |

プロダクト仕様（`.docs/00_manifesto.md`〜`04_login.md`）は要件確認が必要な時だけ参照する。

## Skills

- **`migrate-page-from-mockup`** — mockup の 1 ページを Next.js + Tailwind に移植
- **`quine-implement`** — 機能実装全般（references → 設計 → 実装 → 検証）
- **`quine-init`** — 初期セットアップ（一回限り）

## Out of scope

- mockup の HTML / CSS の編集（デザイン変更は mockup 側を直してから移植）
- Convex 以外の DB / バックエンド（Supabase, Prisma 等を持ち込まない）
- 認証ライブラリの追加（Convex Auth 一本）
