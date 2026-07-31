# Gotchas（実装中にハマった / ハマる罠）

> 過去のセッションで実際に踏んだ落とし穴。**新しい問題を踏んだら追記する**。

## 目次

- [React / Frontend](#react--frontend)
- [Next.js 16](#nextjs-16)
- [Convex](#convex)
- [Convex Auth](#convex-auth)
- [shadcn / UI](#shadcn--ui)
- [Frontend ↔ Convex](#frontend--convex-接続)
- [Routing / URL](#routing--url)
- [追記方法](#追記時の作法)

---

## React / Frontend

### ファイル入力イベントは async 後に `event.currentTarget` を触らない
症状: 画像 resize / FileReader の `await` 後に `event.currentTarget.value = ""` を実行すると `Cannot set properties of null` で落ちる。

原因: React のイベントオブジェクト上の `currentTarget` はイベントハンドラの同期実行中だけを前提に扱う。非同期処理をまたぐ場合は参照が null になることがある。

対処: handler 冒頭で `const input = event.currentTarget` と DOM 要素を退避し、非同期後は `input.value = ""` を使う。

---

### `useEffect` の async request を state guard + cleanup でキャンセルしない
症状: modal 初回表示で action を呼び出す UI が `Loading...` のまま止まる。

原因: effect 内で `setLoading(true)` した再レンダーや hook 参照の変化により cleanup が走り、進行中 request が `canceled = true` 扱いになる。その後 `loading === true` の guard で次の request も開始されず、永久 loading になる。

対処: 「request 開始済み」は `useRef` で管理し、単なる再レンダーでは進行中 request をキャンセルしない。外部 API 側は action / fetch に timeout を付けて、返らない時は error UI へ落とす。

---

## Next.js 16

### `lucide-react` にブランドアイコン（`Github`, `Twitter` 等）が無い
バージョン 1.x でブランドアイコン群が削除された（ライセンス上の理由）。

**対処**: SVGをインライン定義する。例[SigninContent.tsx](../../../../apps/frontend/features/auth/components/SigninContent.tsx)の`GithubIcon`。または`simple-icons`を使う。

### `next lint` が廃止された
v16 で removed。`package.json` の lint script は `eslint` 直叩き（create-next-app 16 のデフォルト）。

### Turbopack はデフォルト
`next dev` で自動有効。`--turbopack` フラグは不要（付けても無害）。

### `apps/frontend/AGENTS.md` の警告
create-next-app 16 が生成: "This is NOT the Next.js you know"。API / 規約に breaking changes あり。実装前に `node_modules/next/dist/docs/` を読むか、エラーが出たら 16 用の解決策を探す。

### Convex Auth middleware の Next 16 動作未検証
`convexAuthNextjsMiddleware`とNext.jsの組み合わせはversion依存。redirectが効かない場合は、まずinstalled versionの公式docsと実際のrequest / responseを確認する。検証せず手書きmiddlewareへ置き換えない。

---

## Convex

### anonymous local の罠
未ログイン状態で `convex dev` を叩くと **`127.0.0.1:3210` の anonymous local backend** に勝手にリンクされる。

**問題**:
- GitHub OAuth callback が届かない（127.0.0.1 は外部から到達不能）
- GitHub App webhook が届かない
- 別端末から触れない
- プロセス維持が必要

**対処**: 必ずCloudへ繋ぐ。`.env.local`に`CONVEX_DEPLOY_KEY`を入れて`pnpm exec convex dev --once --until-success --typecheck enable`で非対話接続（[Convex設計](convex-design.md#cloud-dev環境変数mcp)）。

### `schema.ts` は 1 ファイル必須
`defineSchema` は単一エントリポイント。`convex/users.schema.ts` のような分割は不可。**機能（query / mutation / action）はテーブル単位で分割、schema は 1 ファイル集約**。

### `convex/` 内から外部を import できない（`data/` は OK）
frontendやapp/をimportしない。共有データは`data/<name>.ts`に置き、frontend / convexの両方からimportする（[architecture](architecture.md#3-依存方向)）。

### frontend は `convex/_generated/` か `data/` のみ参照可
`convex/seeds/` 等への直接 import は禁止。共有静的データは `data/` 経由に。

### Convexリージョンを記憶で決めない
利用可能リージョンは変わり得る。新規project作成時はdashboardの現在の選択肢を確認する。既存Quine projectはUS Eastを前提とし、明示的なmigration taskなしに変更しない。

### MCP server は `.mcp.json` 追加直後は使えない
agent clientはセッション開始時にtoolをsnapshotするため、`.mcp.json`の変更は次のセッションから有効。利用中のclientで接続状態を確認し、現セッションにtoolが無ければCLIで代替する。

### 関数追加後に Cloud へ push しないと `Could not find public function` になる
症状: Next.js から新しい Convex query / mutation を呼ぶと `Could not find public function for 'products:getForEdit'` のような Server Error になる。

原因: frontend のコードと `convex/products.ts` は更新済みでも、Cloud dev deployment 側の関数 bundle が古いままになっている。

対処: Cloud 接続時は `pnpm exec convex dev --once --typecheck enable` を実行して push + codegen + Convex typecheck を行う。実装後の `pnpm typecheck` だけでは Cloud 側の関数は更新されない。

### root の `pnpm typecheck` は `convex/*.ts` を検査しない
症状: `pnpm typecheck` が成功しても、Convex push時にrootの`convex/*.ts`で型エラーが見つかる。

原因: root scriptは`pnpm -r typecheck`で、現在`typecheck` scriptを持つのはfrontend workspaceだけ。frontendの`tsconfig.json`は`apps/frontend/`配下を対象にしており、rootのConvex関数本体を直接検査しない。

対処: Convex変更時は`pnpm typecheck`に加えて`pnpm exec convex dev --once --typecheck enable`を必須にする。後者を実行できなかった場合は、Convex検証済みと報告しない。

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

**対処**: 標準テンプレート（`new-york` style互換）を[components/ui/form.tsx](../../../../apps/frontend/components/ui/form.tsx)に手動配置。依存も自分でinstall:
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
ローカル backend と違い、cloud に繋いでる時はschema変更の度に`pnpm exec convex dev --once --typecheck enable`を1回叩けば済む。立てっぱなしでもいいが必須ではない。**anonymous local の時だけ立てっぱなしが必須**。

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

### `users.username` に `@` を保存すると `/@username` が 404 になる
症状: `/@kmdtomo` の URL で profile route には入るが、公開プロフィール query が `null` を返して 404 表示になる。

原因: URL は先頭の `@` を strip して `username` index を引くため、DB に `@kmdtomo` と保存されている既存行と一致しない。

対処: GitHub login 由来の `username` は DB 保存前に `@` なしへ正規化する。既存データ互換のため、`getProfile` は `kmdtomo` を先に検索し、見つからない場合だけ `@kmdtomo` も index で検索する。

### Next.js 16 の dynamic segment は `@` を `%40` のまま渡すことがある
症状: `/@kmdtomo` が `app/(public)/[username]/page.tsx` には入るが、`params.username.startsWith("@")` が false になって 404 になる。

原因: route param が `@kmdtomo` ではなく `%40kmdtomo` として渡るケースがある。

対処: `params.username` は `decodeURIComponent` してから `@` prefix を判定する。`decodeURIComponent` は例外を投げるので、try/catch で不正値を 404 に落とす。

---

## 追記時の作法

新しい罠を踏んだら:
1. 該当カテゴリに追加（無ければ新カテゴリ）
2. **症状 → 原因 → 対処** の 3 行構成で書く
3. 関連コード / docs へのリンクを貼る
4. [STATUS.md](../../../../.docs/STATUS.md)の「既知の課題」から該当項目を削除（解決済みでこちらに移動した場合）
