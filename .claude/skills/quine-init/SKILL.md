---
name: quine-init
description: Quine リポジトリの初期セットアップを一回限り実行する。Next.js 15 + Tailwind v4 + Convex + shadcn/ui の雛形を作り、mockup から assets を移行し、Convex Auth + GitHub Provider を設定する。既に初期化済みのリポジトリでは使わない。
---

あなたは Quine の初期セットアップ担当として、まっさらな状態から実装環境を立ち上げる。

このスキルは **一回限り** の実行を想定している。`apps/frontend/package.json` が既にある場合は、ユーザーに「再初期化していいか」を確認してから進む。

## 絶対ルール

- **IMPORTANT**: 既存ファイルを上書きしない。必ず初期状態を確認してから着手する
- **mockup を変更しない**。mockup は read-only で、assets を `apps/frontend/public/` にコピーするだけ
- **secret を git にコミットしない**。`.env.local` を作る際は `.gitignore` 確認
- **CLAUDE.md / .docs/ / mockup/ は触らない**。それらは既に確定済み
- **monorepo 構造を維持する**: frontend は `apps/frontend/`、Convex は root の `convex/`

## 1. 前提確認（スキップ厳禁）

```bash
ls apps/frontend/package.json convex/schema.ts 2>&1
ls apps/frontend/        # 既存ディレクトリ確認
node --version           # 20 以上
pnpm --version           # 9 以上
```

- `apps/frontend/package.json` が既にあれば、ユーザーに上書き可否を確認
- ディレクトリ（app/, features/, components/, lib/, hooks/, contexts/, public/）は既に作成済みのはずなので、ファイルだけ追加する
- node / pnpm が古ければ更新を促す

## 2. workspace ルートをセットアップ

root に `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
```

root の `package.json`:

```json
{
  "name": "quine",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter frontend dev",
    "convex:dev": "convex dev",
    "build": "pnpm --filter frontend build",
    "typecheck": "pnpm -r typecheck"
  },
  "devDependencies": {
    "convex": "latest"
  }
}
```

## 3. Next.js 15 プロジェクトを `apps/frontend/` に初期化

```bash
cd apps/frontend && pnpm create next-app@latest . --typescript --tailwind --app --import-alias "@/*" --no-src-dir --turbopack
```

- App Router（必須）
- TypeScript（必須）
- Tailwind v4
- src/ なし
- import alias `@/*` → `apps/frontend/*`

既存の空ディレクトリ（`app/(public)/` 等の `.gitkeep`）と衝突する場合は、`.gitkeep` を削除してから create-next-app を走らせる。

`apps/frontend/tsconfig.json` の `paths` に Convex / data のエイリアスを追加:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@convex/*": ["../../convex/*"],
      "@data/*": ["../../data/*"]
    }
  }
}
```

## 4. shadcn/ui を初期化

`apps/frontend/` 内で実行:

```bash
cd apps/frontend && pnpm dlx shadcn@latest init
```

- スタイル: New York
- ベースカラー: Neutral
- CSS 変数を使う: Yes
- `components.json` が生成される

最初に入れるべき primitive を一括追加:

```bash
pnpm dlx shadcn@latest add button dialog dropdown-menu popover tabs toast tooltip form input label textarea select avatar
```

## 5. Convex を Cloud に接続

**Cloud dev deployment が前提**。anonymous local は GitHub OAuth callback が届かず、GitHub App webhook も受けられないので Quine では実質使えない。AI / 自動化からは **Deploy Key** で非対話接続するのが標準。

### 5.1 install と project 作成

```bash
cd <repo-root>
pnpm add -D -w convex
```

ユーザーに以下を依頼:
1. https://dashboard.convex.dev で **New Project** → 名前は `quine`
2. **Settings → URL & Deploy Key → Generate Development Deploy Key**
3. 発行された key を渡す（または `.env.local` に貼ってもらう）

### 5.2 Deploy Key で link + schema push（非対話）

ユーザーが root の `.env.local` に `CONVEX_DEPLOY_KEY=dev:<project>|<token>` を貼った前提で:

```bash
pnpm dlx convex dev --once --until-success
```

- `convex/_generated/` が生成される
- schema が cloud dev backend に push される
- 完了後 exit（`--until-success` で初回 push 失敗時は自動リトライ）

### 5.3 root の `.env.local` を整える

Deploy Key 経由 link 後、root `.env.local` を **cloud URL に揃える**（CLI 自身は deploy key で動くが、可読性と他ツールのために統一）:

```bash
# root .env.local
CONVEX_DEPLOYMENT=dev:<project-name>
CONVEX_URL=https://<project-name>.convex.cloud
CONVEX_SITE_URL=https://<project-name>.convex.site
CONVEX_DEPLOY_KEY="dev:<project-name>|<token>"
```

### 5.4 frontend の `.env.local` に NEXT_PUBLIC_CONVEX_URL を出す

frontend client は `NEXT_PUBLIC_*` プレフィクスを要求。`apps/frontend/.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://<project-name>.convex.cloud
```

⚠️ 同じ URL を 2 ファイルで管理することになる。Cloud 移行時は両方更新。

### 5.5 anonymous local は使わない

Convex CLI を未ログイン + Deploy Key なしで実行すると **anonymous local backend**（127.0.0.1:3210）に勝手にリンクされる。これは:
- GitHub OAuth callback が届かない（127.0.0.1 は外部から到達不能）
- 別端末から触れない
- プロセス維持が必要（`convex dev` を立てっぱなしにしないと frontend から繋がらない）

Quine では避ける。もし anonymous で動いていることに気づいたら、上記 5.1〜5.4 のフローで cloud に切り替える。

### 5.6 schema 例（最小）

`convex/schema.ts` の最小例。実際の Quine schema は別途設計する（[`06_convex.md`](../../../.docs/06_convex.md) §3 参照）:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  // Quine 固有テーブルを追加
});
```

`convex/schema.ts` を作成（最小例、`06_convex.md` §3 を参照）:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    githubId: v.number(),
    username: v.string(),
    name: v.optional(v.string()),
    avatar: v.optional(v.string()),
    bio: v.optional(v.string()),
    isPublic: v.boolean(),
  })
    .index("by_username", ["username"])
    .index("by_github_id", ["githubId"]),
});
```

## 6. Convex Auth + GitHub Provider をセットアップ

```bash
# frontend 側 + Convex 側で必要
cd apps/frontend && pnpm add @convex-dev/auth @auth/core
cd <repo-root> && pnpm add @convex-dev/auth @auth/core
```

`convex/auth.ts`:

```typescript
import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub],
});
```

`convex/auth.config.ts`:

```typescript
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
};
```

`apps/frontend/middleware.ts`:

```typescript
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from "@convex-dev/auth/nextjs/server";

const isProtected = createRouteMatcher(["/(app)/:path*", "/settings"]);

export default convexAuthNextjsMiddleware((req, { isAuthenticated }) => {
  if (isProtected(req) && !isAuthenticated) {
    return Response.redirect(new URL("/signin", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

GitHub OAuth App を **GitHub の dev settings** で作成:

- **Homepage URL**: `http://localhost:3000`（本番化時に置換）
- **Authorization callback URL**: `https://<project-name>.convex.site/api/auth/callback/github` ⚠️ `.convex.cloud` ではなく **`.convex.site`** を使う

Client ID / Secret を Convex backend env に設定（`CONVEX_DEPLOY_KEY` が `.env.local` にあれば非対話で実行可能）:

```bash
pnpm dlx convex env set AUTH_GITHUB_ID <client-id>
pnpm dlx convex env set AUTH_GITHUB_SECRET <client-secret>
```

## 6.5 Convex MCP server を Claude Code に登録

AI / Claude Code から Convex を直接操作するため、project-level MCP を `.mcp.json` に追加:

```json
// .mcp.json
{
  "mcpServers": {
    "convex": {
      "command": "npx",
      "args": [
        "-y",
        "convex@latest",
        "mcp",
        "start",
        "--project-dir",
        "/absolute/path/to/repo"
      ]
    }
  }
}
```

`.claude/settings.local.json` に承認設定を追加:

```json
{
  "enableAllProjectMcpServers": true,
  ...
}
```

⚠️ **MCP server を追加した直後は現セッションで使えない**。Claude Code はセッション開始時にツールを snapshot するため、`.mcp.json` の変更は **セッション再起動後に有効** になる。`claude mcp list` で `convex - ✓ Connected` を確認できれば OK、再起動すれば `mcp__convex__*` ツール群が利用可能になる。

MCP は `.env.local` の `CONVEX_DEPLOYMENT` / `CONVEX_DEPLOY_KEY` を読んで動くので、Cloud 接続済み（§5）が前提。

## 7. assets 移行

mockup の画像 / ロゴを `apps/frontend/public/` にコピー。

```bash
mkdir -p apps/frontend/public/assets
cp -r mockup/assets/* apps/frontend/public/assets/
```

### 既に揃っている資産（コピー不要）

- **技術スタックロゴ 628 ファイル**: `apps/frontend/public/tech_stack_logo/*.png` に既存
- **技術カタログ**: `data/technologies.ts`（2955 行）に既存。frontend / convex 両方から `@data/technologies` で import する共有データ。DB に seed しない（静的マスタとして TS で持つ）
- **ロゴパス helper**: `apps/frontend/lib/technology-logo.ts` に既存（`getTechnologyLogo(techName)`）

これらは新規生成しない。Convex 側で技術キーを参照する場合は `data/technologies.ts` を相対 import する。

## 8. Tailwind 設定

`apps/frontend/tailwind.config.ts` で mockup の `:root` 変数（カラー、スペーシング、フォント）を `theme.extend` に移植する。

```bash
grep -A 50 ":root" mockup/common.css
```

抽出した変数を `apps/frontend/tailwind.config.ts` の `theme.extend` に反映。

## 9. package.json の scripts

`apps/frontend/package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint"
  }
}
```

root の scripts は §2 で設定済み。

## 10. .env.local テンプレート

`apps/frontend/.env.local.example`:

```bash
NEXT_PUBLIC_CONVEX_URL=
CONVEX_SITE_URL=
```

`.env.local` は root の `.gitignore` で ignore されていることを確認。

## 11. 動作確認

```bash
# root から
pnpm convex:dev &  # 別ターミナル想定
pnpm dev
```

- http://localhost:3000 が表示される
- `apps/frontend/app/page.tsx` のデフォルトページが表示される
- `pnpm typecheck` がエラー 0

## 12. レポート

- 作成したディレクトリ / ファイル一覧
- インストールしたパッケージ
- 設定した環境変数（key のみ、値は出さない）
- 次のステップ（推奨: `migrate-page-from-mockup` で `lp` から始める）

## 禁止

- 既存の `package.json` / `next.config.ts` 等を確認なしに上書きすること
- mockup を編集すること
- secret を git にコミットすること
- このスキルを 2 回目以降に呼ばれた時に黙って初期化を進めること
