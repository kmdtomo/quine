# 実装ステータス

> セッションを跨いでの進捗追跡。**新しいセッション開始時はこのファイルを最初に読む**。  
> 区切りごとに更新。形式: ✅ 完了 / 🚧 進行中 / 📋 次やる / 🔮 未着手（将来）

最終更新: 2026-06-22

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
- [x] `convex/schema.ts`（auth 6 + Quine 7 = 13 テーブル）Cloud に push 済み（`githubAnalysisLogs` 含む）
- [x] `convex/auth.ts`, `convex/auth.config.ts`
- [x] `apps/frontend/middleware.ts`（`/signin` redirect, `/(app)` `/settings` 保護）
- [x] `apps/frontend/app/providers.tsx`（`ConvexAuthNextjsProvider`）
- [x] `apps/frontend/app/layout.tsx` で provider wrap
- [x] Convex MCP server を `.mcp.json` に登録（**次回セッションから利用可**）
- [x] `data/tech-stack.ts`（457 件 / 26 カテゴリ）frontend / convex 共有。`data/technologies.ts` は互換 re-export

### docs / skill

- [x] [05_directory-structure.md](05_directory-structure.md) `data/` 追加 + 依存方向更新
- [x] [06_convex.md](06_convex.md) §3 schema 単一ファイル必須を明記、§3.5 接続セットアップ新設
- [x] [INDEX.md](INDEX.md) キーワード索引更新
- [x] [09_gotchas.md](09_gotchas.md) 新設（Next 16 / Convex / Convex Auth / shadcn / Routing の罠）
- [x] [quine-init/SKILL.md](../.claude/skills/quine-init/SKILL.md) Cloud 前提 + Deploy Key + MCP 設定にスリム化
- [x] [quine-implement/SKILL.md](../.claude/skills/quine-implement/SKILL.md) MCP 利用 + STATUS 更新 step 追加にリライト
- [x] [migrate-page-from-mockup/SKILL.md](../.claude/skills/migrate-page-from-mockup/SKILL.md) what 中心にスリム化、DB 連携必須を明文化
- [x] 技術スタック key 方針を docs / skill に反映（`data/tech-stack.ts` を canonical catalog、alias / ロゴ / DB / 解析は同じ key に正規化）
- [x] 技術スタック catalog を再設計（Languages → Runtimes → Frontend/Mobile/Backend → DB/Data → Cloud/AWS/GCP/Azure → AI → Product APIs → DevOps/Observability/Testing/Design の順）
- [x] AWS / Google Cloud / Azure の主要リソースを追加（AWS 42件 / Google Cloud 31件 / Azure 29件）
- [x] 公式クラウドロゴをSVG優先に整理（AWS / Google Cloud / Azure の公式SVG 111件を `apps/frontend/public/tech_stack_logo/*.svg` としてアプリ表示用に追加。元アイコンパック丸ごとは保持しない）
- [x] simple-icons に存在する技術ロゴは `simple-icons` package import で解決し、`public/` には複製しない方針へ整理

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
- [x] mockup `lp.html` を `app/(public)/page.tsx` に移植（`migrate-page-from-mockup` skill）
- [x] mockup `signup-github-app.html` を `/signup/github-app` に移植（`features/auth/auth.module.css` に auth-* 系 CSS 移植、stub: `/signup/{detecting,tech-stack,profile}`、callback receiver `/signup/github-app/callback`）
- [x] **GitHub App 登録**（`quine-app`、callback: `http://localhost:3000/signup/github-app/callback`、Permissions: Contents Read-only + Metadata Read-only、Webhook OFF）→ Convex env に `GITHUB_APP_ID=3701030` / `GITHUB_APP_CLIENT_ID=Iv23lidP6p9FmGzLnm5x` / `GITHUB_APP_CLIENT_SECRET` / `GITHUB_APP_PRIVATE_KEY`（**base64 エンコード済み**、デコードは Action 側で `Buffer.from(..., "base64").toString("utf8")`）、frontend `.env.local` に `NEXT_PUBLIC_GITHUB_APP_SLUG=quine-app` 投入済み
- [x] GitHub App 解析 MVP（DB保存なし / AIなし）: 既存 installation 検出 → `Analyze` → `convex/githubAction.ts` の `analyzeRepos` で fork 除外 repo を budget 内で解析 → `/signup/detecting` に結果表示。`git tree` 起点で実在ファイルを確認し、allowlist manifest（package.json, requirements.txt, pyproject.toml, Gemfile, go.mod, Cargo.toml, composer.json, pubspec.yaml, Package.swift, pom.xml, build.gradle, Dockerfile, docker-compose, GitHub Actions workflows）と Terraform / CloudFormation / Pulumi の IaC resource type を `data/tech-stack.ts` の key にルールベースで紐付ける。**AI API は使わない方針**。
- [x] GitHub App 解析の rate limit 対策: 1解析あたり GitHub API request budget を 95 に制限。最大30 repo、1 repo あたり manifest 最大2ファイル。repo metadata の primary language は補助として使い、GitHub Languages API は初回解析から外した。実測: 25 repo / 67 requests / 約15秒 / 43 technologies detected。
- [x] `/signup/detecting` に Analysis log UI を追加。`githubAnalysisLogs` テーブル + `convex/githubAnalysisLogs.ts` query/internal mutation で、Action の実進捗（token作成、repo一覧、repo tree、matching files、detected keys、warning/error）を realtime 表示。
- [x] ログイン → `tech-stack/edit` → GitHub App install / 既存 installation 検出 → 自動解析 → `developerTechnologies` 保存 → 編集画面に反映、の主動線を実装。LP の signup modal / 解析 modal / tech-stack edit は mockup の glass UI を基準に寄せた。
- [x] `afterUserCreatedOrUpdated` callback で GitHub プロフィール → users カラム反映（githubId, username, name, image）
- [x] `users.username` の `@` prefix 互換対応（保存時は `@` なしへ正規化、既存 `@username` 行も `/@username` で公開 profile query が拾える）
- [x] Next.js 16 の dynamic route param が `%40username` になるケースを decode し、`/@username` profile route が 404 にならないよう修正
- [x] users に `techStackOnboardingCompletedAt` / `profileOnboardingCompletedAt` を追加し、初回フロー完了を明示イベントで永続化
- [x] 初回 tech-stack 後のプロフィール誘導を mockup 準拠の guided header に戻し、Home に `Next` 表示・他ヘッダー操作 disabled に統一
- [x] mockup `user-profile.html` を `/@username` に再移植（左 UserCard / 中央 TechStack + Product / 右 Connections、`?onboarding=1` は初回編集状態として表示、route layout で viewport 固定 + カラム内スクロール、SNS link modal / banner image menu / banner gallery modal）
- [x] user-profile の画像選択で async 後に file input を reset して落ちる runtime error を修正
- [x] ログイン / 再ログイン後の `/onboarding` resolver を追加し、永続フラグに応じて tech-stack / profile onboarding / 通常プロフィールへ復帰
- [x] LP の signup CTA はログイン済みなら modal を開かず `/onboarding` へ即遷移
- [x] mockup `signup-detecting.html` の主動線を `/tech-stack/edit` 上の解析 modal に統合（精度検証ページではなく、高速 repo ticker + 保存完了 modal として実装）
- [x] mockup `tech-stack-edit.html` の再移植（Workbench / category rail / search / Selected & Sort / drag reorder / years toast panel を Tailwind + 共通 components 化。技術選択 / 追加削除 / years 更新 / GitHub 解析結果の DB 反映）
- [ ] mockup `signup-profile.html` 移植

---

## 🔮 未着手（将来）

### Convex 関数

- [x] `convex/users.ts`（query: `getProfile`, `getMe`、mutation: tech-stack/profile onboarding 完了）
- [x] `convex/products.ts`（query: `getBySlug`, `listByAuthor`, `listPublic`, `getForEdit`、mutation: `create`, `update`, `delete`, `saveForm`）
- [ ] `convex/productDevelopers.ts`（招待 / 承認 / 個人レイヤー編集）
- [ ] `convex/connections.ts`（フォロー / フォロー解除）
- [x] `convex/developerTechnologies.ts`（技術スタック編集 - listMine / saveDetected / add / remove / setYears）
- [x] `convex/productTechnologies.ts`
- [x] `convex/githubAction.ts`（"use node"）— GitHub App 経由でリポ解析（DB保存なし / AIなし）
- [x] `convex/githubAnalysisLogs.ts` — GitHub App 解析 action の realtime log 表示用 query / internal mutation
- [ ] `convex/aiAction.ts`（"use node"）— **当面使わない**。技術スタック検出は deterministic rule + ユーザー編集を主経路にする。AI は将来、未対応 dependency の分類・README 要約・説明文生成を任意補助として検討。

### features 実装

- [ ] `features/auth/`（signin フロー）
- [x] `features/profile/`（プロフィール表示・初回編集、`@username` ルート）
- [x] `features/products/`（products ページ、product-detail、product-edit。Header create modal は mockup の UploadModal 準拠。product-edit UI は mockup の ProductEditHero / ProductEditForm / ProductTechPanel 構造へ再移植し、hero title / subtitle の横並び調整、Project Type / Team Size は共通 `DropdownSelect`、Role は同じ見た目の複数選択用 `DropdownMultiSelect` に統一し dropdown 選択状態は neutral tone に調整、`ProductEdit*Section` / modal / shell コンポーネントへ分離。新規 product 作成時は GitHub App の repo 選択 modal を自動表示し、選択 repo から name / URL / project type / tech stack をフォームへ反映（tagline / role / content は自動入力しない）。repo 選択 modal は共通 `GlassModal` 土台へ統一し、右上 close は非表示。repo list は主要技術スタックロゴ表示、未検出時は黒背景の Quine mark fallback、loading stuck 対策済み。AI shell は minimize / FAB reopen 対応 / profile Product link 接続まで）
- [ ] `features/users/`（users 一覧、検索、フィルタ）
- [x] `features/tech-stack/`（tech-stack-edit: onboarding 解析 modal + mockup 準拠の編集 UI）
- [ ] `features/onboarding/`（signup-profile、signup-github-app、signup-detecting）
- [ ] `features/connections/`（フォロー UI）

### 認証 / ユーザー

- [ ] `username` 同期ロジック（GitHub 側で username 変更時の追従、旧 URL の 301）
- [x] GitHub App インストールフロー（`installation_id` 保存）
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
- **GitHub App 解析方針**: 現時点では AI を使わない。package / language / manifest / config / workflow / IaC resource type 由来の確定情報を `data/tech-stack.ts` の key にマッピングし、残りはユーザー編集で補う。AI による長いローディングや推測混入は避ける。
- **GitHub App rate limit 方針**: 初回解析は精度60〜70%でよく、後でユーザー編集する前提。全 repo 完全解析ではなく、95 requests 上限で tree 起点の軽量 breadth-first scan を行う。production 前には installation 単位のキュー制御（同時解析1本）を追加する。
- **Product AI chat**: `product-edit` の手動作成・編集・tech stack 保存、GitHub App repo 選択からの基本情報 import は実装済み。AI chat は UI shell のみで、README 要約や会話型補完は既存 GitHub 解析 action / 将来の AI action との責務整理をしてから別タスクでつなぐ。

---

## 更新ルール

- 1 タスク完了したら **その場で `[ ]` → `[x]` に変更**
- 大きなフェーズ（例: signin 動作確認まで完了）が終わったら **「最終更新」を更新**
- ✅ 完了セクションが膨大になってきたら、過去分は `STATUS_archive.md` に切り出し
- AI 側ルール: セッション開始時にこのファイルを最初に読む（`CLAUDE.md` で指示）
