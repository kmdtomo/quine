# 実装ステータス

> セッションを跨いでの進捗追跡。**新しいセッション開始時はこのファイルを最初に読む**。  
> 区切りごとに更新。形式: ✅ 完了 / 🚧 進行中 / 📋 次やる / 🔮 未着手（将来）

最終更新: 2026-05-01

---

## ✅ 完了

### インフラ / セットアップ

- [x] monorepo scaffold（pnpm-workspace、root package.json）
- [x] Next.js **16** + Tailwind v4 + ESLint + Turbopack を `apps/frontend/` に init
- [x] tsconfig paths: `@/*`, `@convex/*`, `@data/*`
- [x] shadcn/ui init（style: `base-nova`, baseColor: `neutral`, iconLibrary: `lucide`）
- [x] shadcn primitives 13 個（button, dialog, dropdown-menu, popover, tabs, tooltip, sonner, form, input, label, textarea, select, avatar）
- [x] react-hook-form + zod + @hookform/resolvers
- [x] @convex-dev/auth + @auth/core@^0.37（root と frontend 両方）

### Convex

- [x] Convex Cloud dev deployment（`colorful-meerkat-738`）作成
- [x] root `.env.local`: `CONVEX_DEPLOYMENT` / `CONVEX_URL` / `CONVEX_SITE_URL` / `CONVEX_DEPLOY_KEY`
- [x] frontend `.env.local`: `NEXT_PUBLIC_CONVEX_URL`
- [x] `convex/schema.ts`（auth 6 + Quine 6 = 12 テーブル）Cloud に push 済み（28 indexes）
- [x] `convex/auth.ts`, `convex/auth.config.ts`
- [x] `apps/frontend/middleware.ts`（`/signin` redirect, `/(app)` `/settings` 保護）
- [x] `apps/frontend/app/providers.tsx`（`ConvexAuthNextjsProvider`）
- [x] `apps/frontend/app/layout.tsx` で provider wrap
- [x] Convex MCP server を `.mcp.json` に登録（**次回セッションから利用可**）
- [x] `data/technologies.ts`（580 件 / 18 カテゴリ）frontend / convex 共有

### docs / skill

- [x] [05_directory-structure.md](05_directory-structure.md) `data/` 追加 + 依存方向更新
- [x] [06_convex.md](06_convex.md) §3 schema 単一ファイル必須を明記、§3.5 接続セットアップ新設
- [x] [INDEX.md](INDEX.md) キーワード索引更新
- [x] [09_gotchas.md](09_gotchas.md) 新設（Next 16 / Convex / Convex Auth / shadcn / Routing の罠）
- [x] [quine-init/SKILL.md](../.claude/skills/quine-init/SKILL.md) Cloud 前提 + Deploy Key + MCP 設定にスリム化
- [x] [quine-implement/SKILL.md](../.claude/skills/quine-implement/SKILL.md) MCP 利用 + STATUS 更新 step 追加にリライト
- [x] [migrate-page-from-mockup/SKILL.md](../.claude/skills/migrate-page-from-mockup/SKILL.md) what 中心にスリム化、DB 連携必須を明文化

---

## 🚧 進行中

なし

---

## 📋 次やる（優先順）

### あなた作業（環境設定）

- [x] **GitHub OAuth App 作成**（callback: `https://colorful-meerkat-738.convex.site/api/auth/callback/github`）
- [x] Convex env: `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` 投入済み
- [ ] Convex MCP を有効化するため、Claude Code セッション再起動
- [ ] **動作確認**: `pnpm convex:dev` + `pnpm dev` 起動 → `http://localhost:3000/signin` で GitHub ログイン → dashboard で `users` / `authAccounts` / `authSessions` に行が増えるか確認

### 実装（短いものから）

- [x] `/signin` ページ実装（GitHub ログインボタン、`@/features/auth/components/SigninContent`）
- [x] Tailwind theme を mockup から `app/globals.css` へ移植（dark palette、accent gradient、radius、surface variants）
- [ ] `afterUserCreatedOrUpdated` callback で GitHub プロフィール → users カラム反映（githubId, username, name, image）
- [ ] mockup `lp.html` を `app/(public)/page.tsx` に移植（`migrate-page-from-mockup` skill）

---

## 🔮 未着手（将来）

### Convex 関数

- [ ] `convex/users.ts`（query: `getProfile`, `getMe`、mutation: `updateProfile`）
- [ ] `convex/products.ts`（query: `getBySlug`, `listByAuthor`、mutation: `create`, `update`, `delete`）
- [ ] `convex/productDevelopers.ts`（招待 / 承認 / 個人レイヤー編集）
- [ ] `convex/connections.ts`（フォロー / フォロー解除）
- [ ] `convex/developerTechnologies.ts`（技術スタック編集 - years / order）
- [ ] `convex/productTechnologies.ts`
- [ ] `convex/githubAction.ts`（"use node"）— GitHub App 経由でリポ解析
- [ ] `convex/aiAction.ts`（"use node"）— 軽量 AI で技術キー正規化 + 説明文生成

### features 実装

- [ ] `features/auth/`（signin フロー）
- [ ] `features/profile/`（プロフィール表示・編集、`@username` ルート）
- [ ] `features/products/`（products ページ、product-detail、product-edit）
- [ ] `features/users/`（users 一覧、検索、フィルタ）
- [ ] `features/tech-stack/`（tech-stack-detail、tech-stack-edit）
- [ ] `features/onboarding/`（signup-profile、signup-github-app、signup-detecting）
- [ ] `features/connections/`（フォロー UI）

### 認証 / ユーザー

- [ ] `username` 同期ロジック（GitHub 側で username 変更時の追従、旧 URL の 301）
- [ ] GitHub App インストールフロー（`installation_id` 保存）
- [ ] private リポへのスコープ追加フロー

### 周辺

- [ ] root `.gitignore` の確認（`.env.local` 等が ignore されてるか）
- [ ] Tailwind theme の本番化（mockup のフォント / カラー / spacing 完全移植）
- [ ] 本番デプロイ準備（`convex deploy`、Vercel など）

---

## 既知の課題 / メモ

- **Next.js 16 対応**: Convex Auth の middleware が Next 16 で動くか実機確認していない（書いてはいる）
- **`form.tsx`**: shadcn の `base-nova` style に form primitive がなく、標準テンプレートを手動配置
- **`.cursor/mcp.json`**: 古い Supabase MCP 設定が残っている（Cursor IDE 用、Claude Code には無関係）。secret も hardcoded されてるので revoke 推奨
- **Convex MCP**: セッション再起動まで `mcp__convex__*` ツールは現セッションで使えない

---

## 更新ルール

- 1 タスク完了したら **その場で `[ ]` → `[x]` に変更**
- 大きなフェーズ（例: signin 動作確認まで完了）が終わったら **「最終更新」を更新**
- ✅ 完了セクションが膨大になってきたら、過去分は `STATUS_archive.md` に切り出し
- AI 側ルール: セッション開始時にこのファイルを最初に読む（`CLAUDE.md` で指示）
