# Gotchas（実装中にハマった / ハマる罠）

> 過去のセッションで実際に踏んだ落とし穴。**新しい問題を踏んだら追記する**。skills が「とりあえずこの doc を読んでおく」で済むのが目的。

---

## Next.js 16

### `lucide-react` にブランドアイコン（`Github`, `Twitter` 等）が無い
バージョン 1.x でブランドアイコン群が削除された（ライセンス上の理由）。

**対処**: SVG をインライン定義する。例 [SigninContent.tsx](../apps/frontend/features/auth/components/SigninContent.tsx) の `GithubIcon`。または `simple-icons` を別途追加。

### `next lint` が廃止された
v16 で removed。`package.json` の lint script は `eslint` 直叩き（create-next-app 16 のデフォルト）。

### Turbopack はデフォルト
`next dev` で自動有効。`--turbopack` フラグは不要（付けても無害）。

### `apps/frontend/AGENTS.md` の警告
create-next-app 16 が生成: "This is NOT the Next.js you know"。API / 規約に breaking changes あり。実装前に `node_modules/next/dist/docs/` を読むか、エラーが出たら 16 用の解決策を探す。

### Convex Auth middleware の Next 16 動作未検証
`convexAuthNextjsMiddleware` を中で使ってる Next の API（`NextResponse` 等）が 16 で変わってる可能性あり。**動作確認時に redirect が効かなかったら、`@convex-dev/auth` の Next 16 対応 release 待ちか手書き middleware に切替**。

---

## Convex

### anonymous local の罠
未ログイン状態で `convex dev` を叩くと **`127.0.0.1:3210` の anonymous local backend** に勝手にリンクされる。

**問題**:
- GitHub OAuth callback が届かない（127.0.0.1 は外部から到達不能）
- GitHub App webhook が届かない
- 別端末から触れない
- プロセス維持が必要

**対処**: 必ず Cloud に繋ぐ。`.env.local` に `CONVEX_DEPLOY_KEY` を入れて `pnpm dlx convex dev --once --until-success` で非対話接続（[06_convex.md §3.5](06_convex.md)）。

### `schema.ts` は 1 ファイル必須
`defineSchema` は単一エントリポイント。`convex/users.schema.ts` のような分割は不可。**機能（query / mutation / action）はテーブル単位で分割、schema は 1 ファイル集約**。

### `convex/` 内から外部を import できない（`data/` は OK）
frontend や app/ を import しちゃダメ。共有データは `data/<name>.ts` に置いて、frontend / convex 両方から import する（[05_directory-structure.md §3](05_directory-structure.md)）。

### frontend は `convex/_generated/` か `data/` のみ参照可
`convex/seeds/` 等への直接 import は禁止。共有静的データは `data/` 経由に。

### Tokyo / Asia リージョンはまだない
2026 年 5 月時点で利用可能リージョン: US East, EU West。Canada / Australia rolling out 中。**Quine は US East で運用**。Asia 追加されたらマイグレーション検討。

### MCP server は `.mcp.json` 追加直後は使えない
Claude Code はセッション開始時にツールを snapshot するので、`.mcp.json` の変更は **次のセッションから有効**。`claude mcp list` で `convex - ✓ Connected` を確認できれば次回起動で `mcp__convex__*` が使える。

---

## Convex Auth

### auth テーブル 6 個増える
`...authTables` を spread すると authAccounts / authSessions / authRefreshTokens / authVerificationCodes / authVerifiers / authRateLimits の 6 テーブルが自動生成される。これは Convex Auth が DB に状態を持つ設計なので避けられない（NextAuth と同じ思想）。dashboard で見えるが触らない。

### OAuth callback は `.convex.site`、`.convex.cloud` ではない
GitHub OAuth App の Authorization callback URL は **`https://<project>.convex.site/api/auth/callback/github`**。`.convex.cloud` は client SDK 用。混同すると `redirect_uri_mismatch` で詰む。

### env は Convex backend に投入（ローカルファイルじゃない）
`AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` は `pnpm dlx convex env set ...` で Convex backend に保存。`.env.local` に書いても効かない。

### Device Flow は OFF で OK
GitHub OAuth App 作成画面の "Enable Device Flow" は CLI / IoT 向け。Web アプリには不要。チェックしない。

---

## shadcn / UI

### `base-nova` style に `form` primitive が無い
最新スタイル `base-nova` で `pnpm dlx shadcn@latest add form` がサイレント失敗（"Checking registry" で止まる）。

**対処**: 標準テンプレート（`new-york` style 互換）を [components/ui/form.tsx](../apps/frontend/components/ui/form.tsx) に手動配置。依存も自分で install:
```bash
pnpm --filter frontend add react-hook-form @hookform/resolvers zod @radix-ui/react-label @radix-ui/react-slot
```

### shadcn init は `--yes --defaults` で非対話
`--base-color` フラグは存在しない（`components.json` で後から指定可）。

### Tailwind v4 の theme は CSS-first
`tailwind.config.ts` ではなく `app/globals.css` の `@theme inline` ブロックに書く。shadcn も対応済み。

---

## Frontend ↔ Convex 接続

### 同じ Cloud URL を 2 ファイルで管理
- root `.env.local`: `CONVEX_URL=https://<project>.convex.cloud`（CLI / MCP 用）
- `apps/frontend/.env.local`: `NEXT_PUBLIC_CONVEX_URL=https://<project>.convex.cloud`（client SDK 用）

Cloud 移行時 / production 切替時は **両方更新**。1 つだけ更新して詰むケース多発。

### `pnpm convex:dev` を立て続けない方が楽（cloud 接続時）
ローカル backend と違い、cloud に繋いでる時は schema 変更の度に `pnpm dlx convex dev --once --until-success` を 1 回叩けば済む。立てっぱなしでもいいが必須ではない。**anonymous local の時だけ立てっぱなしが必須**。

---

## Routing / URL

### Next.js で `@username` ディレクトリは parallel route と衝突
`app/(public)/@[username]/page.tsx` と書くと Next.js が `@[username]` を parallel route として解釈してしまう。

**対処**: `app/(public)/[username]/page.tsx` で受けて、`params.username` の先頭 `@` を strip して Convex に渡す:

```tsx
const username = params.username.startsWith("@")
  ? params.username.slice(1)
  : null;
if (!username) notFound();
```

URL 上は `/@kmdtomo` のまま機能する（Next.js の動的 route が `@kmdtomo` を `[username]` にバインドする）。

---

## 追記時の作法

新しい罠を踏んだら:
1. 該当カテゴリに追加（無ければ新カテゴリ）
2. **症状 → 原因 → 対処** の 3 行構成で書く
3. 関連コード / docs へのリンクを貼る
4. STATUS.md の「既知の課題」から該当項目を削除（解決済みでこちらに移動した場合）
