---
name: quine-init
description: Quine リポジトリの初期セットアップを一回限り実行する。Next.js + Tailwind v4 + Convex + shadcn/ui の雛形を作り、Convex Cloud に接続し、Convex Auth + GitHub Provider を設定する。既に初期化済みのリポジトリでは使わない。
---

あなたは Quine の初期セットアップ担当。**まっさらな状態から「`pnpm dev` でログイン画面まで動く」状態まで持ち上げる**。一回限りの実行を想定。

`apps/frontend/package.json` が既にある場合は **再初期化していいかユーザーに確認**してから進む。

## ゴール

セットアップ完了の定義:
- `pnpm typecheck` がエラー 0
- `pnpm dev` で localhost:3000 が表示される
- Convex **Cloud dev deployment** に schema が push されている（anonymous local ではない）
- GitHub OAuth で `/signin` からログインできる
- Convex MCP が `claude mcp list` で `✓ Connected`

## 必読 docs

- [`.docs/05_directory-structure.md`](../../../.docs/05_directory-structure.md) — 配置ルール
- [`.docs/06_convex.md`](../../../.docs/06_convex.md) §3.5 — Convex 接続パターン（Deploy Key / .env.local 二重管理 / MCP）
- [`.docs/09_gotchas.md`](../../../.docs/09_gotchas.md) — Next 16 / shadcn / Convex の罠（必ず眺める）

## 絶対ルール

- **既存ファイルを上書きしない**（必ず初期状態を確認してから着手）
- **mockup / CLAUDE.md / .docs/ を変更しない**（確定済み）
- **secret を git にコミットしない**（`.env.local` が `.gitignore` されてるか確認）
- **anonymous local に逃げない**（Cloud dev deployment が前提。9 の罠参照）
- **monorepo 構造を維持**（frontend は `apps/frontend/`、Convex は root）

## 手順（ステップ順）

### 1. 前提確認
```bash
ls apps/frontend/package.json convex/schema.ts 2>&1
node --version    # 20 以上
pnpm --version    # 9 以上
```
既存 `package.json` があれば再初期化可否をユーザーに確認。

### 2. workspace ルート
- root に `pnpm-workspace.yaml`（`packages: ["apps/*"]`）
- root `package.json` に scripts: `dev`, `convex:dev`, `build`, `typecheck`

### 3. Next.js を `apps/frontend/` に init
```bash
cd apps/frontend
pnpm create next-app@latest . --typescript --tailwind --eslint --app --import-alias "@/*" --no-src-dir --turbopack --use-pnpm --yes
```
**既存ディレクトリと衝突する場合**: 一時的に `apps/frontend-init` で生成 → `rsync -a --ignore-existing frontend-init/ frontend/` でマージ → `frontend-init` 削除。

`tsconfig.json` の `paths` に追加:
```json
"@/*": ["./*"],
"@convex/*": ["../../convex/*"],
"@data/*": ["../../data/*"]
```

### 4. shadcn/ui init
```bash
cd apps/frontend
pnpm dlx shadcn@latest init --yes --defaults
pnpm dlx shadcn@latest add button dialog dropdown-menu popover tabs sonner tooltip input label textarea select avatar --yes
```
**`form` primitive は `base-nova` style に存在しない** → 標準テンプレートを手動配置（[09_gotchas.md](../../../.docs/09_gotchas.md) 参照）。`react-hook-form @hookform/resolvers zod @radix-ui/react-label @radix-ui/react-slot` も install。

### 5. Convex Cloud に接続
**ユーザーに依頼**:
1. https://dashboard.convex.dev で New Project（名前: `quine`、Region: US East）
2. Settings → URL & Deploy Key → **Generate Development Deploy Key**
3. root `.env.local` に `CONVEX_DEPLOY_KEY="dev:<project>|<token>"` を貼る

その後:
```bash
pnpm add -D -w convex
pnpm dlx convex dev --once --until-success    # cloud 接続 + schema push
```

`.env.local` を整える（root と frontend で同じ Cloud URL を 2 重管理）:
- root `.env.local`: `CONVEX_DEPLOYMENT` / `CONVEX_URL` / `CONVEX_SITE_URL` / `CONVEX_DEPLOY_KEY`
- `apps/frontend/.env.local`: `NEXT_PUBLIC_CONVEX_URL=https://<project>.convex.cloud`

詳細は [`06_convex.md` §3.5](../../../.docs/06_convex.md)。

### 6. Convex Auth + GitHub Provider
```bash
pnpm --filter frontend add @convex-dev/auth @auth/core@^0.37
pnpm add -w @convex-dev/auth @auth/core@^0.37
```

書くファイル:
- `convex/auth.ts` — `convexAuth({ providers: [GitHub] })`
- `convex/auth.config.ts` — `process.env.CONVEX_SITE_URL` を domain に
- `apps/frontend/middleware.ts` — `convexAuthNextjsMiddleware` で `/(app)`, `/settings` 保護、`/signin` redirect
- `apps/frontend/app/providers.tsx` — `ConvexAuthNextjsProvider` で wrap
- `apps/frontend/app/layout.tsx` を更新して provider を適用

雛形コードは [`06_convex.md` §4](../../../.docs/06_convex.md)。

**ユーザーに依頼**:
- GitHub OAuth App 作成
  - Homepage URL: `http://localhost:3000`
  - **Authorization callback URL: `https://<project>.convex.site/api/auth/callback/github`** ⚠️ `.convex.cloud` ではなく `.convex.site`
- Client ID / Secret を Convex backend env に投入:
```bash
pnpm dlx convex env set AUTH_GITHUB_ID <id>
pnpm dlx convex env set AUTH_GITHUB_SECRET <secret>
```

### 7. Convex MCP 登録
`.mcp.json` に追加:
```json
{
  "mcpServers": {
    "convex": {
      "command": "npx",
      "args": ["-y", "convex@latest", "mcp", "start", "--project-dir", "<absolute-repo-path>"]
    }
  }
}
```

`.claude/settings.local.json` に `"enableAllProjectMcpServers": true` を追加。

⚠️ **MCP は次のセッションから利用可能**（現セッションでは使えない）。`claude mcp list` で `convex - ✓ Connected` を確認できれば OK。

### 8. assets / theme
- 既存資産を確認（再生成しない）:
  - `apps/frontend/public/tech_stack_logo/*.png` 628 ファイル
  - `data/technologies.ts` 580 件
  - `apps/frontend/lib/technology-logo.ts`
- mockup の他 assets を `apps/frontend/public/` にコピー
- mockup の `:root` 変数を `app/globals.css` の `@theme inline` に移植（dark palette、accent gradient、surface variants）

### 9. 動作確認
```bash
pnpm typecheck    # エラー 0
pnpm dev          # http://localhost:3000 でデフォルトページ
# /signin で GitHub ログインボタンが表示される（実装済みなら）
```

### 10. STATUS.md を作る
`.docs/STATUS.md` に:
- ✅ 完了したセットアップ項目
- 📋 次やる作業（最初は mockup 移植）
- 🔮 未着手の機能リスト
- 既知課題（このセッションで踏んだ罠）

### 11. レポート
- 作成・変更ファイル一覧
- install したパッケージ
- 設定した環境変数（key のみ、値は出さない）
- 次のステップ（推奨: `/migrate-page-from-mockup lp` から開始）

## 禁止

- 既存 `package.json` / `next.config.ts` を確認なしに上書き
- mockup を編集
- secret を git にコミット
- 2 回目以降の呼び出しで黙って初期化を進める
- anonymous local backend で済ませる（Cloud 接続必須）
