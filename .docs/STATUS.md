# 実装ステータス

> セッションを跨いでの進捗追跡。**新しいセッション開始時はこのファイルを最初に読む**。  
> 区切りごとに更新。チェック済みはコードの実装・接続を示し、実機検証まで済んだとは限らない。

最終更新: 2026-08-01

## 状態の読み方

- **実装済み**: 対象コードが存在する。
- **接続済み**: routeや利用側から実装が呼ばれている。
- **検証済み**: typecheck、lint、Convex Cloud確認、browser smokeなど、実施した検証を項目内に明記している。
- `[x]`だけの項目は実装・接続状況を表す。検証の記載がなければ、実機検証済みとは扱わない。

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
- [x] `convex/schema.ts`（auth 6 + Quine 18 = 24 テーブル）Cloud devへpush・Convex typecheck済み（GitHub Installation / Analysis Run、Product asset / AI、Upload Intent系テーブル含む）
- [x] `convex/auth.ts`, `convex/auth.config.ts`
- [x] `apps/frontend/proxy.ts`（Next.js 16 Node Proxy。`/signin` redirect、`/(app)` `/settings`保護、GitHub App OAuth callback例外）
- [x] `apps/frontend/app/providers.tsx`（`ConvexAuthNextjsProvider`）
- [x] `apps/frontend/app/layout.tsx` で provider wrap
- [x] Convex MCP server を `.mcp.json` に登録（接続可否は利用セッションごとに確認し、未接続時はCLIで代替）
- [x] `convex/tsconfig.json` + root TypeScript / Node型を追加し、Convex CLIの関数typecheckを有効化
- [x] root `check` / `verify`でsecret scan、frontend / Convex typecheck、frontend / Convex lint、Convex Cloud確認を集約。2026-08-01に`pnpm verify`と`pnpm build`成功（lint error 0、既存`<img>`warning 23件）
- [x] `.github/workflows/ci.yml`でPR/main pushのsecretless CIを接続。Node 22 / pnpm 11.18.0 / frozen lockfileで`pnpm check`を実行し、Cloud pushを伴う`verify:convex`は保護された別jobまで保留
- [x] `data/tech-stack.ts`（457 件 / 26 カテゴリ）frontend / convex 共有。`data/technologies.ts` は互換 re-export
- [x] Product Writing Agent: Strands + OpenAI Responses provider をscheduled internal actionで実行。`productAiRuns`をsource of truthとしてqueued / running / succeeded / failed、retry、idempotency、多重実行防止を管理する。`productAiThreads` / `productAiMessages` / `productAiProposals` / `productRepoContexts` / `productAiAttachmentContexts` にrepo context、会話履歴、画像analysis text、Markdown / form proposalを保持し、proposal確定とRun成功は同一transactionでcommitする。画像本体はConvex File Storage、公開mutation/actionにはStorage IDだけを渡す。
- [x] Product作成・更新はRHF + Zodの単一form contractから`products.saveForm`へ保存。新規Product作成、developer / technology / screenshot関連、Product AI draft関連付けを単一transactionに統合し、`creationKey`で再送時の重複作成を防止する。
- [x] RF-017 expand: `uploadIntents`と`files.createUploadIntent` / `files.finalizeUpload`をadditiveに導入。owner・用途・期限・未完了数・Storage metadataを検査するが、既存`generateUploadUrl`とProfile / Product / Product AI consumerは未切替のため、まだresource ownershipの最終根拠とは扱わない。Cloud schema/index/function typecheck済み
- [x] Product AI editor初期状態をboundedな`getEditorState` queryへ統合し、Server `ProductEditView`でpreload。新規draft keyはServer生成のURL queryへ固定し、既存・新規ともreload後に履歴とRunを復元する。
- [x] 2026-07-30 browser smoke: `/`、`/products`、`/@smoke-profile`はconsole errorなし。未認証`/products/new`は`/signin`へredirect。認証済みGitHub / Product AI / 保存操作のE2Eは未実施

### docs / skill

- [x] 2026-08-01 [quine-implement](../.agents/skills/quine-implement/SKILL.md)を再設計。独立`domain/`を置かず、`features`をUI/任意Next adapter、Convex rootをregistered adapter、`convex/application`を複雑なquery/mutationのDB use case、`convex/workflows`をAI/Action固有フロー、`convex/infra`を外部provider接続とする責務境界へ統一
- [x] 実装referenceを[project structure](../.agents/skills/quine-implement/references/project-structure.md)、[frontend](../.agents/skills/quine-implement/references/frontend.md)、[Convex](../.agents/skills/quine-implement/references/convex.md)、[data flows](../.agents/skills/quine-implement/references/data-flows.md)、[external services](../.agents/skills/quine-implement/references/external-services.md)、[security](../.agents/skills/quine-implement/references/security.md)、[code rules](../.agents/skills/quine-implement/references/code-rules.md)、[verification](../.agents/skills/quine-implement/references/verification.md)へ再編
- [x] 通常更新はConvex mutationを直接呼び、Next Server Actionはnative form/cookie/redirect/revalidate等が必要な場合だけ置く方針を明文化
- [x] architecture境界を挙動不変でrefactor。Product AI prompt/tool/contextを`convex/workflows/productAi/`、GitHub detection/repository変換を`convex/workflows/githubAnalysis/`、GitHub provider client/typeを`convex/infra/github/`、Product media read/writeを`convex/application/products/`へ移動。registered path/export、validator、query/index/take/fallback、request上限、hash、Storage更新順は維持し、Convex Cloud codegen済み
- [x] Next.js 16のroute auth境界をbyte-identicalな`middleware.ts`→`proxy.ts`移行で更新。ProxyはNode runtime固定、Convex Auth API名とmatcher/callback例外は維持。実装referenceも`proxy.ts`とlocal/Cloud verification境界へ同期
- [x] [INDEX.md](INDEX.md) キーワード索引更新
- [x] 技術スタック key 方針を docs / skill に反映（`data/tech-stack.ts` を canonical catalog、alias / ロゴ / DB / 解析は同じ key に正規化）
- [x] 技術スタック catalog を再設計（Languages → Runtimes → Frontend/Mobile/Backend → DB/Data → Cloud/AWS/GCP/Azure → AI → Product APIs → DevOps/Observability/Testing/Design の順）
- [x] AWS / Google Cloud / Azure の主要リソースを追加（AWS 42件 / Google Cloud 31件 / Azure 29件）
- [x] 公式クラウドロゴをSVG優先に整理（AWS / Google Cloud / Azure の公式SVG 111件を `apps/frontend/public/tech_stack_logo/*.svg` としてアプリ表示用に追加。元アイコンパック丸ごとは保持しない）
- [x] simple-icons に存在する技術ロゴは `simple-icons` package import で解決し、`public/` には複製しない方針へ整理
- [x] [REFACTORING.md](REFACTORING.md) に`quine-implement`準拠監査、実施状況、外部・移行残件を集約

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
- [x] mockup `lp.html` を `app/(public)/page.tsx` に移植
- [x] mockup `signup-github-app.html` を `/signup/github-app` に移植（`features/auth/auth.module.css` にauth系CSSを移植。旧detecting / tech-stack / profile routeは現在canonical導線へredirect）
- [x] **GitHub App 登録**（`quine-app`、callback: `http://localhost:3000/signup/github-app/callback`、Permissions: Contents Read-only + Metadata Read-only、Webhook OFF）→ Convex env に `GITHUB_APP_ID=3701030` / `GITHUB_APP_CLIENT_ID=Iv23lidP6p9FmGzLnm5x` / `GITHUB_APP_CLIENT_SECRET` / `GITHUB_APP_PRIVATE_KEY`（**base64 エンコード済み**、デコードは Action 側で `Buffer.from(..., "base64").toString("utf8")`）、frontend `.env.local` に `NEXT_PUBLIC_GITHUB_APP_SLUG=quine-app` 投入済み
- [x] GitHub App 解析をRun化: 検証済みInstallation → `githubAnalysisRuns.startTechnologyAnalysis` → scheduled `internalAction` → 永続Run / repository結果 / 技術スタック保存 → `/tech-stack/edit`のmodalで購読。`git tree`起点のallowlist manifestとIaC resource typeを`data/tech-stack.ts`のkeyへルールベースで紐付ける。**AI APIは使わない方針**。Cloud typecheck済み、GitHub接続を含むbrowser E2E smokeは未実施
- [x] GitHub App 解析の rate limit 対策: 1解析あたり GitHub API request budget を 95 に制限。最大30 repo、1 repo あたり manifest 最大2ファイル。repo metadata の primary language は補助として使い、GitHub Languages API は初回解析から外した。実測: 25 repo / 67 requests / 約15秒 / 43 technologies detected。
- [x] `/tech-stack/edit`の解析modalにAnalysis log UIを接続。`githubAnalysisLogs`を永続Runへ関連付け、進捗・warning・errorをrealtime表示
- [x] ログイン → `tech-stack/edit` → GitHub App install / 既存 installation 検出 → 自動解析 → `developerTechnologies` 保存 → 編集画面に反映、の主動線を実装。LP の signup modal / 解析 modal / tech-stack edit は mockup の glass UI を基準に寄せた。
- [x] `afterUserCreatedOrUpdated` callback で GitHub プロフィール → users カラム反映（githubId, username, name, image）
- [x] `users.username` の `@` prefix 互換対応（保存時は `@` なしへ正規化、既存 `@username` 行も `/@username` で公開 profile query が拾える）
- [x] Next.js 16 の dynamic route param が `%40username` になるケースを decode し、`/@username` profile route が 404 にならないよう修正
- [x] users に `techStackOnboardingCompletedAt` / `profileOnboardingCompletedAt` を追加し、初回フロー完了を明示イベントで永続化
- [x] 初回 tech-stack 後のプロフィール誘導を mockup 準拠の guided header に戻し、Home に `Next` 表示・他ヘッダー操作 disabled に統一
- [x] mockup `user-profile.html` を `/@username` に再移植（左 UserCard / 中央 TechStack + Product / 右 Connections、`?onboarding=1` は初回編集状態として表示、route layout で viewport 固定 + カラム内スクロール、SNS link modal / banner image menu / banner gallery modal）
- [x] user-profile の画像選択で async 後に file input を reset して落ちる runtime error を修正
- [x] ログイン / 再ログイン後のcanonical `/home` resolverを追加し、永続フラグに応じてtech-stack / profile onboarding / 通常プロフィールへ復帰。`/onboarding`は互換入口
- [x] LP の signup CTA はログイン済みなら modal を開かず `/onboarding` へ即遷移
- [x] mockup `signup-detecting.html` の主動線を `/tech-stack/edit` 上の解析 modal に統合（精度検証ページではなく、高速 repo ticker + 保存完了 modal として実装）
- [x] mockup `tech-stack-edit.html` の再移植（Workbench / category rail / search / Selected & Sort / drag reorder / years toast panel を Tailwind + 共通 components 化。技術選択 / 追加削除 / years 更新 / GitHub 解析結果の DB 反映）
- [x] mockup `users.html` を `/users` に移植（公開ユーザー一覧、name / handle検索、Role、技術スタックAND filter、draft→Apply dialog、Cmd/Ctrl+K、Header Search導線）
- [x] mockup `tech-stack-detail.html` を `/tech-stack/[technologyKey]` に移植（canonical key、公開Product / Engineer件数、2列Product grid、404、プロフィール技術カード導線）
- [x] `product/new` / product edit の Product AI chat 実装。Strands tools は `read_repo_context` / `read_attachment_context` / `propose_markdown_edit` / `propose_form_update`。`product_context` / `current_markdown` / `selection_context` / `repo_context_summary` / `conversation_history` は毎回 agent input に注入。Markdown proposal kind は `replace_all` / `replace_selection` / `insert` / `patch` / `outline` / `comment_only` に対応。form proposal は `name` / `tagline` / `projectType` / `teamSize` / `productUrl` / `githubUrl` / `roles` に対応。proposal UI は assistant message 直下に表示し、適用済み / 破棄済みは compact history 行へ畳む。AI message は Markdown / GFM として render する。画像添付は OpenAI vision 解析結果のみ永続化。
- [x] AppHeader の Home / Quine ロゴ遷移を `/home` resolver に統一。`loading.tsx` で遷移先を即表示し、ログインユーザーと onboarding 状態の解決後に本人の `/@username` または未完了ステップへリダイレクト。
- [ ] mockup `signup-profile.html` 移植

---

## 📌 実装カバレッジ / 残作業

### Convex 関数

- [x] `convex/users.ts`（query: `getProfile`, `getMe`, `listPublic`、mutation: tech-stack/profile onboarding 完了）
- [x] `convex/products.ts`（query: `getBySlug`, `listByAuthor`, `listPublic`, `getForEdit`、mutation: `create`, `update`, `delete`, `saveForm`）
- [x] `convex/productDevelopers.ts` API実装済み。Product detailの参加申請は接続済み。招待 / 承認 / 辞退 / 個人レイヤー編集UIは未接続、browser smoke未実施
- [x] `convex/connections.ts` API実装済み。公開プロフィールの一覧表示と追加操作は接続済み。`listMine` / `listByDeveloper`は`by_from` index + cursor paginationへ移行済み。プロフィール本体は表示上限12件を明示する。承認 / 解除UIは未接続、browser smoke未実施
- [x] `convex/developerTechnologies.ts`（技術スタック編集 - listMine / saveDetected / add / remove / setYears）
- [x] `convex/productTechnologies.ts`（Product技術編集 + 公開技術詳細 `getPublicDetail`）
- [x] `convex/githubAction.ts`（"use node"）— GitHub App 経由でリポ解析（技術検出は AI なし。Product import では README / dependency summary を `productRepoContexts` に保存）。registered entrypointはroot、provider client/typeは`infra/github/`、detection/repository変換は`workflows/githubAnalysis/`へ分割済み
- [x] `convex/githubAnalysisLogs.ts` — GitHub App 解析 action の realtime log 表示用 query / internal mutation
- [x] `convex/productAi.ts` / `convex/productAiAction.ts` / `convex/productRepoContexts.ts` — Product Writing Agent の thread/message/proposal/repo/attachment context API と Strands 実行 action。prompt/tool/context/agentは`workflows/productAi/`、Run DB use caseとMarkdown hashは`application/productAi/`へ配置
- [ ] `convex/aiAction.ts`（"use node"）— **当面使わない**。技術スタック検出は deterministic rule + ユーザー編集を主経路にする。AI は将来、未対応 dependency の分類・README 要約・説明文生成を任意補助として検討。

### features 実装

- [x] `features/auth/`（signin、GitHub App install UI / callbackを実装・route接続済み。GitHub OAuthを含む認証E2E smokeは未実施）
- [x] `features/profile/`（プロフィール表示・初回編集、`@username` ルート）。Profile基本項目とsocial linksはRHF + Zod、avatar / bannerはConvex File Storageへ接続。`ProfileContent`を画面controllerへ縮小し、Identity / TechStack / Products / Connections / DialogをSectionへ分割
- [x] `features/products/`（products ページ、product-detail、product-edit。Header create modal は mockup の UploadModal 準拠。product-edit UI は mockup の ProductEditHero / ProductEditForm / ProductTechPanel 構造へ再移植し、hero title / subtitle の横並び調整、Project Type / Team Size は共通 `DropdownSelect`、Role は同じ見た目の複数選択用 `DropdownMultiSelect` に統一し dropdown 選択状態は neutral tone に調整、`ProductEdit*Section` / modal / shell コンポーネントへ分離。右側 tech stack パネルは見出しなし・枠なし icon-only edit で上詰めし、カテゴリー名は white、tech-stack/edit と同じ `techStackCategories` のカテゴリー順で表示。新規 product 作成時は GitHub App の repo 選択 modal を自動表示し、選択 repo から name / URL / project type / tech stack をフォームへ反映（tagline / role / content は自動入力しない）。repo 選択 modal は共通 `GlassModal` 土台へ統一し、右上 close は非表示。repo list は主要技術スタックロゴ表示、未検出時は黒背景の Quine mark fallback、loading stuck 対策済み。AI shell は real chat / image attach / proposal card / Apply-Discard / selection rewrite / stale hash guard / profile Product link 接続まで）
- [x] `features/users/`（users一覧route / query / View / Contentと、検索・Role・技術スタックAND filterを接続済み。browser smoke未実施）
- [x] `features/tech-stack/`（tech-stack-edit + `/tech-stack/[technologyKey]` 公開詳細）
- [x] `features/onboarding/`（`/home` resolverと旧signup routeからcanonical導線へのredirectを実装・接続済み。`signup-profile.html`の独立ページ移植は未実施、認証済みbrowser smokeは未実施）
- [ ] 専用`features/connections/`は未作成。プロフィール内の追加操作は接続済みだが、承認 / 解除UIは未実装

### 認証 / ユーザー

- [ ] `username` 同期ロジック（GitHub 側で username 変更時の追従、旧 URL の 301）
- [x] GitHub Appインストールフローを検証付き`githubInstallations`へ接続済み。Setup URLの`installation_id`はpending入力としてのみ扱い、GitHub App user OAuth + PKCE後の`/user/installations`で個人Installationを検証する。旧`users.githubInstallationId`は権限根拠にしない。認証済みbrowser E2E smokeは未実施
- [ ] private リポへのスコープ追加フロー

### 周辺

- [x] root `.gitignore`確認済み（root / frontendの`.env.local`と`.cursor/mcp.json`をignore、current treeのcredential scanは成功）
- [ ] Tailwind theme の本番化（mockup のフォント / カラー / spacing 完全移植）
- [ ] 本番デプロイ準備（`convex deploy`、Vercel など）

---

## 既知の課題 / メモ

- **Next.js 16 Proxy**: `proxy.ts`移行、production build、未認証redirect、公開route、静的assetのsmokeは成功。認証済みsessionの`/signin` redirect、cookie refresh、実GitHub OAuth callbackは未実施
- **`form.tsx`**: shadcn の `base-nova` style に form primitive がなく、標準テンプレートを手動配置
- **Supabase credential**: `.cursor/mcp.json`はcurrent treeから削除・ignore済み。漏えい済みcredentialの外部revokeとGit履歴からの除去は未実施
- **Convex MCP**: `.mcp.json`の設定は存在する。利用セッションで接続できない場合はConvex CLIで代替する
- **Storage ownership**: upload intent schema/APIのexpandは完了。consumer切替、既存Storage参照のbackfill、attach時consume、全参照cleanup、旧`generateUploadUrl`廃止は未実施
- **GitHub App 解析方針**: 現時点では AI を使わない。package / language / manifest / config / workflow / IaC resource type 由来の確定情報を `data/tech-stack.ts` の key にマッピングし、残りはユーザー編集で補う。AI による長いローディングや推測混入は避ける。
- **GitHub App rate limit 方針**: 初回解析は精度60〜70%でよく、後でユーザー編集する前提。全 repo 完全解析ではなく、95 requests 上限で tree 起点の軽量 breadth-first scan を行う。production 前には installation 単位のキュー制御（同時解析1本）を追加する。
- **GitHub Organization Installation**: 個人Installationは検証済み。OrganizationはGitHub user tokenの安全な暗号化保存・refresh・membership再検証の運用が未設計のため、現時点では安全側に拒否する
- **File Storage cleanup**: Product / Profile / Product AIの主要画像経路はConvex File Storageへ移行済み。置換・削除時cleanupは実装済みだが、upload後に保存せず画面を離れたobjectの期限付きcleanupは未実装
- **Product Storage ownership**: 現行`requireProductStorageOwnership`は`productAssets.by_storage`のrelation衝突だけを確認し、uploadしたuser/intentのownershipと`products.logoStorageId`参照は保証しない。挙動不変refactorでは変更せず、upload intent・期限・消費状態を設計する別security taskとして追跡する
- **Product repository import**: Installationはserverで検証済みresourceから解決するが、repository import自体は現在public Action。永続Run化は残作業
- **公開一覧検索**: Product / Users一覧はindexと明示的truncation contractを持つが、初回上限外を含む全文検索・複合filterのcursor paginationは未実装
- **Product AI chat**: scheduled internalAction + 永続Runへの切替、Storage添付、transaction、preload/reload復元まで接続済み。認証済みセッションでのprovider実行browser smokeは未実施

---

## 更新ルール

- 1 タスク完了したら **その場で `[ ]` → `[x]` に変更**し、実装 / 接続 / 検証のどこまで済んだかを書く
- 大きなフェーズ（例: signin 動作確認まで完了）が終わったら **「最終更新」を更新**
- ✅ 完了セクションが膨大になってきたら、過去分は `STATUS_archive.md` に切り出し
- AI 側ルール: セッション開始時にこのファイルを最初に読む（`CLAUDE.md` で指示）
