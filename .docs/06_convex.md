# Convex データ層 / 認証 / 権限

> Convex の使い方、認証フロー、公開 / 認証必須 / 所有者限定の権限分岐を定義する。

**関連ドキュメント:** [04_login.md](./04_login.md), [05_directory-structure.md](./05_directory-structure.md)

---

## 1. Convex とは

- BaaS。スキーマ定義 + query / mutation / action を TypeScript で書くだけで DB + リアルタイム同期 + 認証が動く
- `convex/` ディレクトリが必須構造。ここに schema と関数を置く
- クライアントから `useQuery` で購読すると、データ変更が即時に全クライアントへ反映される
- Supabase の RLS のような複雑なポリシー言語は不要。**関数内で `if` を書くだけで権限制御**できる

## 2. 関数の3種類

| 種類 | 用途 | 副作用 | 外部 API |
|---|---|---|---|
| `query` | 読み取り。リアルタイム購読対象 | 不可 | 不可 |
| `mutation` | DB 書き込み。トランザクショナル | 可 | 不可 |
| `action` | 外部 API 呼び出し（GitHub, OpenAI など） | DB は mutation 経由 | 可 |

### 使い分け

- 一覧表示、詳細取得 → **query**
- データ更新、削除、作成 → **mutation**
- GitHub API でリポ解析、OpenAI で要約生成 → **action**（内部から mutation を呼んで DB に書く）

## 3. スキーマ

### 配置ルール（必読）

- **schema は `convex/schema.ts` に 1 ファイル集約**。テーブル単位でファイル分割しない（`convex/users.schema.ts` のような分け方は禁止）
- **理由**: Convex は `defineSchema()` を単一エントリポイントとして読み取る仕様。複数ファイルで `defineSchema` を呼ぶことはできない。型生成（`_generated/dataModel.ts` の `Doc<"users">` 等）も schema.ts から自動生成される
- **機能（query / mutation / action）はテーブル単位で分割**: `convex/users.ts`, `convex/products.ts` のように 1 テーブル 1 ファイル
- **スキーマと機能の分割粒度は別物**: schema は 1 ファイル、機能はテーブル単位、と覚える

```
convex/
├── schema.ts            ← 全テーブル定義（1 ファイル集約）
├── auth.ts              ← Convex Auth セットアップ
├── auth.config.ts
├── users.ts             ← users テーブルの query/mutation
├── products.ts          ← products テーブルの query/mutation
├── productDevelopers.ts
└── ...
```

`convex/schema.ts` の中身:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,  // Convex Auth が必要とするテーブル

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

  products: defineTable({
    authorId: v.id("users"),
    slug: v.string(),
    name: v.string(),
    description: v.string(),
    repoUrl: v.optional(v.string()),
    isPublic: v.boolean(),
  })
    .index("by_author", ["authorId"])
    .index("by_author_slug", ["authorId", "slug"]),

  // ...他のテーブル
});
```

### スキーマ設計ルール

- すべてのテーブルに **`isPublic`** 等の公開フラグを持たせるか、`authorId` を持たせる
- 検索系 query は **必ず `index` を引く**（`withIndex`）。`filter` だけで全件走査しない
- 文字列 ID は使わない。Convex の `v.id("table")` を使う

## 3.5 Convex への接続（環境変数 / Deploy Key / MCP）

Quine では **Cloud dev deployment** に繋ぐのが標準。anonymous local（`127.0.0.1:3210`）は OAuth callback / GitHub webhook が届かないため使わない。

### 環境変数の二重管理

| ファイル | 役割 | 主な変数 |
|---|---|---|
| **root `.env.local`** | Convex CLI / MCP 用 | `CONVEX_DEPLOYMENT`, `CONVEX_URL`, `CONVEX_SITE_URL`, `CONVEX_DEPLOY_KEY` |
| **`apps/frontend/.env.local`** | Next.js client 用 | `NEXT_PUBLIC_CONVEX_URL` |

⚠️ **同じ Cloud URL を 2 箇所で管理する**。Cloud 移行 / 本番切替時は両方更新。

### Deploy Key で非対話接続

`convex login` の対話を回避するため、**Development Deploy Key** を使う。dashboard → project → Settings → URL & Deploy Key で発行し、root `.env.local` に:

```bash
CONVEX_DEPLOY_KEY="dev:<project-name>|<token>"
```

これがあれば CLI / MCP は完全非対話で動く。schema push / env set / data 操作すべて Deploy Key 経由可能。

### URL の使い分け

| URL | 用途 |
|---|---|
| `https://<project>.convex.cloud` | client SDK の API endpoint。frontend が叩く |
| `https://<project>.convex.site` | HTTP actions / OAuth callback。**GitHub OAuth App の callback URL はこちら** |

### MCP server

`.mcp.json` に Convex MCP server を登録すれば、Claude Code から `mcp__convex__*` ツール経由でスキーマ確認 / data 閲覧 / env set / function 実行が可能。詳細は `quine-init` skill §6.5。

`.mcp.json` の変更は **セッション再起動後に反映**。

## 4. 認証

### 4.1 セットアップ

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

### 4.2 Next.js 側の middleware

`middleware.ts`:

```typescript
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
} from "@convex-dev/auth/nextjs/server";

const isProtected = createRouteMatcher(["/settings", "/(app)/:path*"]);

export default convexAuthNextjsMiddleware((req, { isAuthenticated }) => {
  if (isProtected(req) && !isAuthenticated) {
    return Response.redirect(new URL("/signin", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 4.3 ヘルパ

```typescript
// convex/lib/getCurrentUser.ts
import { QueryCtx } from "../_generated/server";

export async function getCurrentUser(ctx: QueryCtx) {
  const userId = await auth.getUserId(ctx);
  if (!userId) return null;
  return await ctx.db.get(userId);
}

export async function requireUser(ctx: QueryCtx) {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Unauthorized");
  return user;
}
```

## 5. 権限分岐パターン

Quine では公開度合いに 3 段階ある:

| 公開度 | 例 | 実装 |
|---|---|---|
| **公開** | プロフィール、プロダクト詳細 | query で auth チェックせずに `isPublic` フィールドだけ返す |
| **認証必須** | フォロー、お気に入り、通知 | `requireUser(ctx)` を最初に呼ぶ |
| **所有者限定** | 編集、削除 | `requireUser(ctx)` + `authorId === user._id` チェック |

### 公開 query

```typescript
export const getProfile = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db.query("users")
      .withIndex("by_username", q => q.eq("username", username))
      .first();
    if (!user || !user.isPublic) return null;

    // 公開フィールドのみ返す
    return {
      _id: user._id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
    };
  },
});
```

### ログインユーザーへの追加情報

公開 query 内で `auth.getUserIdentity()` が null かどうかで分岐できる。

```typescript
export const getProfile = query({
  args: { username: v.string() },
  handler: async (ctx, { username }) => {
    const user = await ctx.db.query("users")
      .withIndex("by_username", q => q.eq("username", username))
      .first();
    if (!user || !user.isPublic) return null;

    const viewer = await getCurrentUser(ctx);  // null OK

    return {
      ...publicFields(user),
      // ログインユーザーだけに追加情報
      isFollowing: viewer
        ? await isFollowing(ctx, viewer._id, user._id)
        : false,
    };
  },
});
```

### 所有者限定の mutation

```typescript
export const updateProduct = mutation({
  args: { productId: v.id("products"), name: v.string() },
  handler: async (ctx, { productId, name }) => {
    const user = await requireUser(ctx);  // 認証必須
    const product = await ctx.db.get(productId);
    if (!product) throw new Error("Not found");
    if (product.authorId !== user._id) {
      throw new Error("Forbidden: not the owner");
    }
    await ctx.db.patch(productId, { name });
  },
});
```

### 絶対ルール

- **mutation / action では必ず `requireUser` を最初に呼ぶ**（公開書き込みはない）
- **所有者チェックを忘れない**。UI でボタン非表示にしても DB 側で守る
- query で auth が任意なら `getCurrentUser`（null 返却）、必須なら `requireUser`

## 6. クライアントから呼ぶ

### Server Component（preload）

```tsx
// apps/frontend/features/products/components/ProductView.tsx (Server)
import { preloadQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";

export async function ProductView({ slug }: { slug: string }) {
  const preloaded = await preloadQuery(api.products.getBySlug, { slug });
  return <ProductContent preloaded={preloaded} />;
}
```

### Client Component（query / mutation）

```tsx
"use client";
import { usePreloadedQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";

export function ProductContent({ preloaded }) {
  const product = usePreloadedQuery(preloaded);  // リアルタイム購読
  const update = useMutation(api.products.updateProduct);

  return (
    <button onClick={() => update({ productId: product._id, name: "..." })}>
      更新
    </button>
  );
}
```

## 7. action（外部 API）

GitHub App でリポ解析、OpenAI で要約など。

```typescript
"use node";  // node ランタイム必須

import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";
import { Octokit } from "@octokit/rest";

export const detectTechStack = action({
  args: { installationId: v.number(), repoFullName: v.string() },
  handler: async (ctx, args) => {
    const octokit = new Octokit({ auth: await getInstallationToken(args.installationId) });
    const { data } = await octokit.repos.getContent({
      owner: args.repoFullName.split("/")[0],
      repo: args.repoFullName.split("/")[1],
      path: "package.json",
    });
    // 解析...

    // mutation を呼んで DB に書く
    await ctx.runMutation(api.products.saveDetectedStack, {
      productId: ...,
      stack: ...,
    });
  },
});
```

### 絶対ルール

- action からは `ctx.db` を直接触らない。**必ず `ctx.runMutation` 経由で書く**
- `"use node"` を冒頭に書く（外部 SDK を使うため）
- secret は `process.env` から。Convex CLI で環境変数を設定する

## 8. チェックリスト

- [ ] テーブルに `index` を必ず張った
- [ ] mutation の最初で `requireUser(ctx)` を呼んでいる
- [ ] 所有者限定 mutation で `authorId === user._id` チェックがある
- [ ] 公開 query が未ログインでも動く（auth 必須にしていない）
- [ ] action から DB を直接触らず、`runMutation` 経由で書いている
- [ ] preload は `*View`（Server）でやり、`*Content`（Client）に渡している
