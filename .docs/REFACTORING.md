# Quine リファクタリング事項一覧

監査日: 2026-07-30
最終更新: 2026-08-01
対象: `feature/refactor-architecture-boundaries` の2026-08-01統合差分
判定基準: [quine-implement](../.agents/skills/quine-implement/SKILL.md) とtask別routing先のreference

> このファイルは「今の実装をどの順で直すか」の作業一覧です。プロダクト仕様の正規ソースではありません。
> 行番号は監査時点の目安です。実装開始時に対象コードを再確認してください。

## 先に結論

最優先は、GitHub App の Installation 所有権です。現状は認証ユーザーが App 全体の Installation を取得でき、client が指定した Installation ID で解析を開始できます。ここを閉じるまでは GitHub 解析機能を本番利用しないでください。

その後は、次の順で進めます。

1. 漏えい済みcredentialの失効とGitHub Installation境界の修正
2. Convex File Storageへ移行できるschemaのexpand
3. GitHub解析・Product AIをRun + scheduled internalActionへ移行
4. transaction、index、pagination、validator、error契約の修正
5. form、View/Content、巨大component、旧導線の整理
6. lint・Convex typecheckをまとめた検証ゲートの整備

## 優先度

| 優先度 | 意味 |
|---|---|
| P0 | セキュリティ事故につながる。ほかの作業より先に対応する |
| P1 | データ欠損・不整合・本番失敗につながる |
| P2 | 保守性、責務境界、ユーザー体験を継続的に悪化させる |
| P3 | ルールと実態のずれ。再発防止として整える |

## 一覧

| ID | 優先度 | 状態 | 項目 | 主な対象 |
|---|---:|---|---|---|
| RF-001 | P0 | 一部完了（外部対応待ち） | Supabase credentialを失効し履歴から除去する | `.cursor/mcp.json` |
| RF-002 | P0 | 一部完了（個人対応済み） | GitHub Installationの所有権境界を作り直す | `githubAction.ts`, `users.ts` |
| RF-003 | P1 | 一部完了（主要経路切替済み） | 画像・添付をConvex File Storageへ移行する | `schema.ts`, profile, products, Product AI |
| RF-004 | P1 | 一部完了（解析・AI切替済み） | GitHub解析・Product AIを永続Runへ移行する | `githubAction.ts`, `productAiAction.ts` |
| RF-005 | P1 | 完了 | 複数Mutationに分かれた状態確定を原子的にする | products, Product AI |
| RF-006 | P1 | 一部完了（主要query修正済み） | 一覧・最新データ取得をindexとpaginationで正しくする | products, users, connections, Product AI |
| RF-007 | P1 | 完了 | 全Convex登録関数の入出力contractを固定する | `convex/**/*.ts` |
| RF-008 | P1 | 完了 | error codeと安全な表示メッセージを統一する | Convex共通lib, frontend |
| RF-009 | P1 | 完了 | 現在のfrontend lint errorを解消する | LP, auth, tech-stack |
| RF-010 | P2 | 完了 | domain invariantとURL検証をserverで統一する | technologies, Product AI, users |
| RF-011 | P2 | 完了 | Product/Profile formをRHF + Zodへ統一する | products, profile |
| RF-012 | P2 | 完了 | Contentの責務、View境界、初期preloadを整理する | profile, products, LP, tech-stack |
| RF-013 | P2 | 完了 | 旧onboarding導線・stub・不要な公開aliasを撤去する | signup routes, Convex aliases |
| RF-014 | P2 | 一部完了（PR CI接続済み） | frontend/Convexを一括検証するcommandを作る | root scripts, ESLint, GitHub Actions |
| RF-015 | P3 | 完了 | STATUSとarchitecture referenceを実装へ同期する | `.docs/STATUS.md`, skill references |
| RF-016 | P3 | 完了 | feature/application/workflow/infra/libの配置境界を統一する | frontend features, `convex/application`, `convex/workflows`, `convex/infra` |
| RF-017 | P1 | 完了 | Product Storageにupload ownership contractを追加する | `files.ts`, Product assets/logo, schema |

## 今回の実装結果

サブエージェントによる領域別実装と統合監督を行い、P0/P1のコード上の危険経路と主要な責務違反を修正した。`完了`はコード・型・lint・Convex contractまで確認済み、`一部完了`は外部操作、移行cleanup、互換契約の整理が残る項目を示す。

残作業は次の5群に限定される。

1. 漏えい済みSupabase credentialの外部revokeとGit履歴からの除去
2. Organization Installation向けの安全なGitHub user token更新・再検証設計
3. 保存前に放棄されたFile Storage objectの期限付きcleanup
4. Product repository importのRun化、公開Users/Products検索の全件pagination、外部contract未確認public APIのdeprecation設計
5. 保護されたConvex Cloud CI jobと必要なsecret / Environment設定

### 統合検証実績

- `pnpm run verify`: 成功（secret scan、frontend / Convex typecheck、frontend / Convex lint、Convex Cloud functions確認）
- `pnpm build`: 成功（Next.js 16.2.4 production build、19 static page生成、`proxy.ts`を認識、middleware非推奨warningなし）
- Proxy smoke: `/`と`/signin`は200、未認証`/products/new`は`/signin`へ307、`/file.svg`は200。認証済みsession/cookie refreshと実GitHub OAuth callbackは未実施
- frontend ESLint: error 0、既存を含む`<img>`最適化warning 23件
- mockup変更なし、新規test fileなし
- 未実施: 認証済みGitHub OAuth / Installation、Product AI provider実行、Product/Profile保存のbrowser E2E

---

## RF-001 Supabase credentialを失効し履歴から除去する

- 優先度: **P0**
- 状態: **一部完了（外部対応待ち）**
- 種別: セキュリティ / 運用

### 問題

追跡中の `.cursor/mcp.json` に、現在のQuineでは不要なSupabase MCP設定と平文credentialが含まれています。過去commitにも残っているため、現行ファイルを削除するだけでは解決しません。

### 根拠

- `.cursor/mcp.json:3`
- `.docs/STATUS.md` の「既知の課題 / メモ」
- `git log --all -- .cursor/mcp.json` で複数commitへの混入を確認

### 対応

1. credentialを即時revoke/rotateする
2. `.cursor/mcp.json`を追跡対象から外すか、secretを含まないtemplateへ置き換える
3. repositoryの共有範囲に応じて履歴からcredentialを除去する
4. secret scanを完了ゲートへ追加する

### 完了条件

- [ ] 旧credentialが無効になっている
- [x] current treeに平文secretがない
- [ ] repository履歴のsecret scanが成功する
- [x] `.docs/STATUS.md`の既知課題が更新されている

> credentialの失効はコード変更だけでは完了しません。管理画面側での操作が必要です。

---

## RF-002 GitHub Installationの所有権境界を作り直す

- 優先度: **P0**
- 状態: **一部完了（個人Installation対応済み、Organization保留）**
- 種別: 認証 / 認可 / GitHub App
- 依存: RF-001とは独立して即時着手可能

### 問題

client由来の`installationId`を信頼して保存・解析しており、認証済みユーザーへGitHub App全体のInstallation一覧を返しています。別ユーザーやOrganizationのprivate repositoryへアクセスできる可能性があります。

### 根拠

- `convex/githubAction.ts:447` — client指定`installationId`で解析
- `convex/githubAction.ts:577` — App全体のInstallation一覧を返す
- `convex/users.ts:169` — 任意の正整数をInstallation IDとして保存
- `convex/developerTechnologies.ts:73` — public mutationからInstallation IDを保存
- `apps/frontend/features/tech-stack/components/TechStackEditContent.tsx:294` — 一覧の先頭を本人のInstallationとして利用
- `apps/frontend/app/(public)/signup/github-app/callback/route.ts:12` — URL由来のIDを保存

### 対応

1. `githubInstallations`テーブルを追加し、検証済みの`userId`、GitHub account、Installation、statusを保持する
2. callbackまたはGitHub user-to-server認証で、個人・Organizationそれぞれの所有権を検証する
3. clientには内部IDだけを渡し、GitHubの`installationId`を権限入力として受けない
4. `listInstallations`と`setGithubInstallationId`を廃止する
5. GitHub処理は認証ユーザーに紐づく検証済みInstallationをDBから解決する
6. `developerTechnologies.saveDetected`をinternal mutationへ閉じる
7. 既存の未検証`users.githubInstallationId`は、信頼せず再接続対象にする

### 完了条件

- [x] 任意の`installationId`を受けるpublic APIがない
- [x] App全体のInstallation一覧を返すpublic APIがない
- [x] token発行前に認証ユーザーとの所有関係をserverで検証する
- [ ] 個人・Organizationの両ケースで権限確認が成立する
- [x] 既存の未検証IDを自動で「検証済み」扱いしていない

---

## RF-003 画像・添付をConvex File Storageへ移行する

- 優先度: **P1**
- 状態: **一部完了（主要経路切替済み、放棄upload cleanup保留）**
- 種別: Schema / Storage / Frontend
- 依存: RF-004のProduct AI Run化より先にschemaをexpandする

### 問題

profile画像、banner、product logo、screenshots、Product AI添付をdata URLとしてdocumentまたはAction引数へ流しています。Convexのdocument・引数上限を超えやすく、送信と保存のコストも大きくなります。

### 根拠

- `convex/schema.ts:109` — user画像・bannerがstring
- `convex/schema.ts:164` — product logo・screenshotsがstring
- `convex/products.ts:36` — 大きなdata URLを許容
- `convex/productAiAction.ts:47` — Action引数が`dataUrl`
- `apps/frontend/features/profile/components/ProfileContent.tsx:1782`
- `apps/frontend/features/products/components/ProductEditContent.tsx:244`
- `apps/frontend/features/products/components/ProductAiAssistantShell.tsx:147`

### 対応

1. upload URL発行mutationを追加する
2. clientからConvex File Storageへ直接uploadする
3. 保存mutationとRunには`Id<"_storage">`だけを渡す
4. 外部URLとの互換が必要なら、storage IDとはfieldを分ける
5. screenshotsを複数保持する場合は`productAssets`等への分離も検討する
6. 置換・削除時の旧object削除とorphan cleanupを定義する
7. `expand → backfill → reader切替 → contract`の順で移行する

### 完了条件

- [x] binary本体がConvex documentやAction引数を通らない
- [x] profile、product、Product AI添付がstorage ID経由で動く
- [x] data URLは必要な場合でもclient内previewだけに限定される
- [x] 既存Storage参照を棚卸しし、対象0件のためmigration不要と確認する
- [x] resource削除・画像置換時のStorage cleanupがある
- [ ] upload後にresource保存せず離脱したobjectの期限付きcleanupがある

---

## RF-004 GitHub解析・Product AIを永続Runへ移行する

- 優先度: **P1**
- 状態: **一部完了（GitHub解析・Product AI切替済み、repository import保留）**
- 種別: Action / 非同期処理 / 状態管理
- 依存: RF-002、Product AI添付部分はRF-003

### 問題

長時間の外部API処理をclientからpublic Actionとして直接起動し、結果や進行状態の一部をclient stateまたはclient生成`runId`へ依存しています。reload、retry、同時実行、失敗復旧のsource of truthがありません。

### 根拠

- `convex/githubAction.ts:447` — GitHub解析のpublic Action
- `convex/githubAction.ts:644` — repository importのpublic Action
- `convex/productAiAction.ts:54` — Product AIのpublic Action
- `apps/frontend/features/auth/components/SignupDetectingContent.tsx:71`
- `apps/frontend/features/tech-stack/components/TechStackEditContent.tsx:245`
- `apps/frontend/features/products/components/ProductAiAssistantShell.tsx:110`
- `convex/githubAnalysisLogs.ts:6` — Run本体ではなくlogだけを保持

### 対応

1. `githubAnalysisRuns`と`productAiRuns`を追加する
2. public mutationで認証・権限確認後に`queued` Runを作る
3. `ctx.scheduler.runAfter`からinternalActionを起動する
4. internalActionはRunから認証済みresourceを解決する
5. `queued → running → succeeded | failed`を永続化する
6. retry、attempt、idempotency、同一resourceの同時実行制御を定義する
7. UIはRunと結果をqueryで購読し、reload後も復元する
8. logはRun IDへ関連付け、paginationまたは上限を設ける

### 完了条件

- [x] GitHub解析・Product AIを直接起動するfrontendの`useAction`がない
- [x] GitHub解析・Product AIの外部処理Actionがinternalへ閉じている
- [x] reload後も同じRun状態と結果を復元できる
- [x] retryと多重実行防止がserverで成立する
- [x] failure時に中途半端な成功状態を残さない

---

## RF-005 複数Mutationに分かれた状態確定を原子的にする

- 優先度: **P1**
- 状態: **完了**
- 種別: Transaction / Idempotency
- 依存: RF-004と同時設計

### 問題

1つの操作として成功・失敗すべき更新が複数Mutationに分かれています。途中失敗により、Productだけが作成されたり、AI messageとproposalが部分保存されたりします。

### 根拠

- `apps/frontend/features/products/components/ProductEditContent.tsx:272` — Product保存後にAI threadを別Mutationで関連付け
- `convex/productAiAction.ts:86` — thread、user message、assistant message、proposal群を別transactionで保存
- `apps/frontend/features/products/components/ProductAiAssistantShell.tsx:177` — Apply/Discard失敗時の状態復旧が未定義

### 対応

1. Product作成・更新とdraft thread関連付けを1つのmutationへ統合する
2. AIのassistant message、proposal群、Run成功状態を1つのinternal mutationで確定する
3. client再送に備えてdraft/run単位のidempotencyを持つ
4. proposal Apply/Discardの許可遷移と失敗時UIを定義する

### 完了条件

- [x] thread関連付け失敗でProductだけが残らない
- [x] 同じdraftの再送でProductが重複しない
- [x] AI失敗時に一部proposalだけが残らない
- [x] Apply/Discard失敗がUIに表示され、未処理Promise rejectionがない

---

## RF-006 一覧・最新データ取得をindexとpaginationで正しくする

- 優先度: **P1**
- 状態: **一部完了（主要index・cursor pagination・最新context修正済み）**
- 種別: Query / Index / Pagination

### 問題

`.take()`で先頭だけ取得した後に公開状態やstatusをfilterしているため、本来表示すべき行が上限の後ろにあると欠落します。また「最新repo context」も、先頭10件の中から選んでおり最新性を保証できません。frontend検索も、初回取得上限内だけを検索しています。

### 根拠

- `convex/products.ts:67` — 120件取得後に`isPublic`をfilter
- `convex/products.ts:128` — author商品を50件取得後に公開filter
- `convex/users.ts:240` — profile商品を6件取得後に公開filter
- `convex/productDevelopers.ts:210` — 100件取得後にactive filter
- `convex/connections.ts:176` — 100件取得後に公開ユーザーfilter
- `convex/productAi.ts:453` — 先頭10 contextから`updatedAt`最大を選択
- `apps/frontend/features/users/components/UsersContent.tsx:27` — 取得済み60件だけを検索
- `apps/frontend/features/products/components/ProductListContent.tsx:60` — 取得済み一覧だけを検索

### 対応

1. `by_public`、`by_author_public`など絞り込み順に合うindexを追加する
2. 件数が増える一覧はConvex paginationへ変更する
3. search/filter条件をquery argsへ移し、serverで正しい集合を作る
4. repo contextは`updatedAt`を含むindexから`order("desc").first()`で取得する
5. relation先の公開状態が必要なら、bounded queryまたは明示的なdenormalizationを設計する

### 完了条件

- [x] limit前にindexで正しい集合を確定する
- [ ] 初回取得上限外のデータも検索・filterで取得できる
- [x] 増加一覧にpaginationまたは明示的なtruncation契約がある
- [x] context件数に関係なく正しい最新または明示選択contextを返す

---

## RF-007 全Convex登録関数の入出力contractを固定する

- 優先度: **P1**
- 状態: **完了**
- 種別: Convex API / Validator

### 問題

監査時点の登録関数58件中、`returns` validatorがあるのは2件だけです。generated typeの推論だけでは、意図しないfield公開や返却shapeの変更をdeployment時に止められません。

### 根拠

- `convex/products.ts:64`
- `convex/users.ts:69`
- `convex/productAi.ts:100`
- `convex/productDevelopers.ts:12`
- `convex/githubAction.ts:447`

### 対応

1. public query/actionを優先し、全登録関数へ`returns`を追加する
2. mutationのvoid戻り値も実際のcontractに合わせて明示する
3. resource単位で共通validatorを定義する
4. document全体のspreadを避け、public fieldだけを返す
5. server-only helperと処理をinternal functionへ閉じる

### 完了条件

- [x] aliasを含む全登録関数に`args`と`returns`がある
- [x] frontendが必要とするfieldだけがpublic contractになっている
- [x] public/internalの公開範囲が用途と一致する

---

## RF-008 error codeと安全な表示メッセージを統一する

- 優先度: **P1**
- 状態: **完了**
- 種別: Error contract / Security / UX

### 問題

認証・権限・入力エラーを通常の`Error`で投げ、frontendで`unknownError.message`を直接表示しています。またGitHub/OpenAIのraw error messageをDB logへ保存する経路があります。

### 根拠

- `convex/lib/auth.ts:15`
- `convex/lib/products.ts:54`
- `convex/githubAction.ts:562`
- `convex/workflows/productAi/tools/readAttachmentContext.ts`
- `apps/frontend/features/profile/components/ProfileContent.tsx:358`
- `apps/frontend/features/products/components/ProductEditContent.tsx:295`
- `apps/frontend/features/tech-stack/components/TechStackEditContent.tsx:232`
- `apps/frontend/features/products/components/ProductAiAssistantShell.tsx:166`

### 対応

1. `UNAUTHENTICATED`、`FORBIDDEN`、`NOT_FOUND`、`INVALID_INPUT`等の安定codeを定義する
2. expected errorをcode付き`ConvexError`へ統一する
3. provider errorはserver内で分類・sanitizeする
4. DB Runには安全なcodeと利用者向け情報だけを保存する
5. frontendでcodeを日本語メッセージへ変換し、unknownは固定文言にする

### 完了条件

- [x] expected failureのplain `Error`がない
- [x] UIがraw `Error.message`を表示しない
- [x] GitHub/OpenAIのraw errorがDB・client responseへ流れない
- [x] UIがcodeで再試行可能・認証切れ・入力不備を判別できる

---

## RF-009 現在のfrontend lint errorを解消する

- 優先度: **P1**
- 状態: **完了**
- 種別: 完了ゲート / React

### 問題

監査時点で`pnpm --filter frontend lint`が6 errorsで失敗しています。effect内の同期`setState`と、Next内部routeへの生`<a>`が主な対象です。

### 根拠

- `apps/frontend/features/lp/components/LpView.tsx:25`
- `apps/frontend/features/tech-stack/components/TechStackEditContent.tsx:273`
- `apps/frontend/features/auth/components/SignupGithubAppContent.tsx:115`
- `apps/frontend/features/tech-stack/components/TechStackOnboardingModal.tsx:122`

### 対応

1. modal phaseや認証分岐をイベントまたは導出stateへ移す
2. 内部routeは`Link`または明示的なnavigation処理へ統一する
3. warningは機械的に消さず、今回のリファクタ対象に関係するものから解消する

### 完了条件

- [x] `pnpm --filter frontend lint`がexit 0
- [x] effectによる初期fetchや状態同期へ置き換えていない

---

## RF-010 domain invariantとURL検証をserverで統一する

- 優先度: **P2**
- 状態: **完了**
- 種別: Domain validation

### 問題

同じfieldでも入口により検証条件が異なり、矛盾状態や危険なURLを保存できます。

### 根拠

- `convex/developerTechnologies.ts:183` — `setYears`は負数・小数・過大値を許容
- `convex/developerTechnologies.ts:213` — `setManyYears`だけ1〜11の整数に制約
- `convex/productAi.ts:158` — proposal statusを自由に変更可能
- `convex/users.ts:362` — social link URLはtrimのみ
- `apps/frontend/features/profile/components/ProfileContent.tsx:739` — 保存値を`href`へ使用

### 対応

1. yearsのnormalize/validationを共通化する
2. proposalは`pending → applied | discarded`の許可遷移をserverで守る
3. terminal stateのtimestampを矛盾なく更新する
4. social linkは許可schemeとplatform別URLをserverで検証する

### 完了条件

- [x] 同じdomain fieldの全入口で同じ制約を使う
- [x] 不正なproposal遷移が拒否される
- [x] 保存可能なprofile linkが許可schemeだけになる

---

## RF-011 Product/Profile formをRHF + Zodへ統一する

- 優先度: **P2**
- 状態: **完了**
- 種別: Frontend form / Validation

### 問題

主要formがfieldごとの`useState`と個別`if`検証で実装されています。手入力、GitHub import、AI proposalで値の入口が増え、検証経路が分散しています。

### 根拠

- `apps/frontend/features/products/components/ProductEditContent.tsx:66`
- `apps/frontend/features/products/components/ProductEditContent.tsx:257`
- `apps/frontend/features/profile/components/ProfileContent.tsx:210`
- `apps/frontend/features/profile/components/ProfileContent.tsx:1566`

### 対応

1. product、profile、connectionのschemaを各featureの`schema.ts`へ置く
2. `react-hook-form`とZod resolverへ統一する
3. AI proposalとrepo importも`reset`/`setValue`を通す
4. server側domain validationは残し、client schemaだけを権限根拠にしない

### 完了条件

- [x] submit値が必ずZod schemaを通る
- [x] AI/import/手入力が同じform contractを使う
- [x] form責務のfield別`useState`と重複必須チェックが除去される

---

## RF-012 Contentの責務、View境界、初期preloadを整理する

- 優先度: **P2**
- 状態: **完了**
- 種別: Frontend architecture
- 依存: RF-004、RF-011の設計後

### 問題

`ProfileContent`がprofile、Product、Connection、画像、複数modalを1ファイルで管理しています。またclientの`*View`や、hydration後に3段query waterfallを起こすProduct AI履歴があります。

### 根拠

- `apps/frontend/features/profile/components/ProfileContent.tsx` — 約2,045行
- `apps/frontend/features/products/components/ProductAiAssistantShell.tsx:112`
- `apps/frontend/features/lp/components/LpView.tsx:1` — clientの`*View`
- `apps/frontend/features/tech-stack/components/TechStackSortView.tsx:1` — clientの`*View`

### 対応

1. `ProfileContent`をlayoutと画面状態の調整役へ縮小する
2. identity、social links、products、connectionsを`*Section`へ分ける
3. Product/Connection操作は各featureへ移す
4. 既存ProductのAI初期データをserver `*View`でpreloadする
5. client componentの`*View`を`*Content`または`*Section`へ改名・分割する
6. `githubAction.ts`もGitHub client、解析、検出、Run orchestrationへ責務分割する

### 完了条件

- [x] `ProfileContent`がProduct/Connectionのform stateとmutationを持たない
- [x] 各Sectionが明示的なProps contractを持つ
- [x] `"use client"`を持つ`*View.tsx`がない
- [x] 既存ProductのAI履歴に初期query waterfallがない
- [x] `githubAction.ts`の外部API、domain解析、Run制御が分離されている

---

## RF-013 旧onboarding導線・stub・不要な公開aliasを撤去する

- 優先度: **P2**
- 状態: **完了**
- 種別: Routing / Public API cleanup

### 問題

旧onboarding page、未接続Notifications、`deleteProduct` / `follow` / `unfollow` public aliasがcanonical導線・APIと重複していた。現在はstubとaliasを撤去し、旧signup routeは既存URLを壊さないcompat redirectへ限定している。

### 根拠

- `/home`と`HomeRedirectView`をonboarding state解決のcanonical実装に統一した。`/onboarding`は現行signin / LPから利用する同Viewの入口である。
- `/signup/detecting`、`/signup/tech-stack`、`/signup/profile`は現行画面へのredirectだけを持つ意図的な互換routeであり、削除対象ではない。
- 未接続Notificationsと`deleteProduct` / `follow` / `unfollow` registered aliasは現行codeに存在しない。
- repo内consumerがない他のpublic Convex APIは存在するが、外部client contractを確認できないため、挙動不変refactorでは削除しない。
- `/settings`へのlinkは残る一方でrouteは未実装であり、legacy cleanupではなく別のproduct課題として扱う。

### 対応

1. onboarding分岐をserver `HomeRedirectView`へ集約する
2. 旧signup routeはcompat redirectとして処理を持たせない
3. 実装されていない通知操作とbadgeを撤去する
4. 重複public aliasを削除する
5. consumerなしpublic APIは外部contract確認とdeprecationを別taskで行う
6. `/settings`の実装またはlink変更は別product taskで決める

### 完了条件

- [x] onboardingのsource of truthが1つ
- [x] 到達可能なstub pageがない
- [x] `app/**/page.tsx`が直接Convex処理と業務分岐を抱えない
- [x] 未接続Notificationsの操作可能UIがない
- [x] 重複public aliasがない
- [x] 互換routeと外部contract未確認APIを無断で削除していない

---

## RF-014 frontend/Convexを一括検証するcommandを作る

- 優先度: **P2**
- 状態: **一部完了（local/PR gate完成、Cloud CI未接続）**
- 種別: Tooling / 再発防止

### 問題

rootの`pnpm typecheck`はworkspace内のfrontendを主に検証し、root `convex/`のCloud typecheckやlintを強制しません。validator不足やConvex queryの問題がreview依存になっています。

### 根拠

- `package.json:8`
- `pnpm-workspace.yaml:1`
- `apps/frontend/eslint.config.mjs:5`

### 対応

1. secretなしのlocal gateを`pnpm check`へ集約する
2. Cloud pushを含む`verify:convex` / `verify`をlocal gateと区別する
3. PRとmain pushで`pnpm check`を実行するleast-privilege CIを追加する
4. fork codeへsecretを渡さず、Cloud verificationは保護Environmentの別jobへ分ける

### 完了条件

- [x] 1 commandでfrontend typecheck/lintとConvex typecheck/lintを実行できる
- [x] Convex未検証を成功扱いにしない
- [x] localとPR CIが同じ`pnpm check`を実行する
- [x] CIのNode/pnpm、frozen lockfile、権限、同時実行方針が固定されている
- [ ] 保護されたmain/manual jobで`verify:convex`を直列実行する（GitHub secret / Environment設定が必要）
- [x] **新規test fileは作成・追記しない**

---

## RF-015 STATUSとarchitecture referenceを実装へ同期する

- 優先度: **P3**
- 状態: **完了**
- 種別: Project documentation
- 依存: 各リファクタ完了時に継続更新

### 問題

`.docs/STATUS.md`の未着手表記と実ファイルが一致しない箇所があります。またarchitecture referenceでは`data/`を純データ・型のみとしていますが、canonicalな`data/tech-stack.ts`はfrontend/Convex共有の決定的helperも提供しています。

### 根拠

- `.docs/STATUS.md` — `productDevelopers.ts`、`connections.ts`、auth/users/onboardingの状態
- `data/tech-stack.ts:2128` — 派生配列とlookup/type guard
- `.agents/skills/quine-implement/references/project-structure.md` — `data/`の責務

### 対応

1. STATUSを「implemented / connected / verified」が区別できる形へ整理する
2. 完了一覧が大きい場合はarchiveへ移す
3. `data/`でI/Oや環境依存のない決定的helperを許可するか、shared helper moduleへ分ける
4. 実装とreferenceのどちらを正とするか決め、二重ルールを残さない

### 完了条件

- [x] route/API/featureの実態とSTATUSが一致する
- [x] 未検証項目が「完了」と混ざっていない
- [x] `data/`の実装とarchitecture referenceが一致する

---

## RF-016 feature/application/workflow/infra/libの配置境界を統一する

- 優先度: **P3**
- 状態: **完了**
- 種別: Architecture / maintainability

### 対応結果

- frontend feature内は`components/`以外の役割directoryを原則作らず、form contract、error、pure helper、実際のhookを具体名でfeature rootへ配置した。
- Convex rootのregistered pathを維持し、複雑なquery/mutationのDB use caseを`application/<feature>/`へ配置した。
- Product AI prompt/tool/contextとGitHub detection/repository変換を`workflows/<feature>/`へ、GitHub/OpenAI provider接続を`infra/<provider>/`へ配置した。
- feature固有処理が複数callerから使われるだけでは横断`lib`にしない。Product media projectionはowner featureの`application/products/`へ統合した。
- applicationとworkflowが共有する同featureのruntime非依存ruleはapplicationへ置き、workflowから純粋ruleだけ参照可能とした。DB use caseはregistered internal function経由のままにした。
- `data/tech-stack.ts`は特殊なcanonical static catalogとして維持し、一般的なshared helper置き場にはしない。

### 検証

- [x] registered functionのmodule path、export、args/returns validatorを維持
- [x] query/index/take/fallback、request上限、hash、Storage更新順の同等性を確認
- [x] `pnpm verify`成功（Convex Cloud codegenを含む）
- [x] `pnpm build`成功
- [x] mockup変更なし、新規test fileなし

---

## RF-017 Product Storageにupload ownership contractを追加する

- 優先度: **P1**
- 状態: **完了**（放棄uploadの期限付きcleanupはRF-003の残件）
- 種別: Security / File Storage

### 問題

`requireProductStorageOwnership`が確認するのは`productAssets.by_storage`のrelation衝突だけで、Storage objectをuploadしたuser、upload intent、用途、期限、消費状態を単独では証明しなかった。

### 方針

authenticated userとStorage IDを用途付きintentで結び、finalizeとresource attachを分離する。resource mutationでaccess確認、purpose/expiry/target検証、consume、relation更新を同じtransactionに置く。

### 実装結果

- `uploadIntents`を追加し、authenticated user、用途、`pending / uploaded / consumed`、Storage ID、期限、消費先resourceを表現した。
- `files.createUploadIntent`と`files.finalizeUpload`を追加した。両mutationは入口で認証し、finalizeはintent owner、期限、状態、Storage ID重複、metadata、用途別MIME、6MB上限を確認する。
- Profile / Product / Product AI consumerを`create → upload → finalize`へ切り替え、resource mutationの引数とUIは維持した。
- resource mutationは新規利用時にcurrent uploader・用途・期限、再利用時に同じ用途・消費先を確認し、relation更新と同一transactionでconsumeする。Productの別editorは現在のeditor accessと同じProduct targetで再利用できる。
- upload URLとStorage IDの厳密な発行元証明ではなく、intent作成後に生成された未登録Storage IDの一回claimである。finalizeだけをownership確定とせず、resource mutationのconsumeを必須にした。
- 未完了intentはuserあたり20件にbounded。pendingは1時間、uploadedは24時間の期限を持つ。
- 共有devを棚卸しした結果、既存Storage参照、`_storage`、`uploadIntents`はいずれも0件だったため、backfillも実データ削除も不要だった。legacy bypassは残していない。
- repo内consumerがなくなった`files.generateUploadUrl`は廃止した。

### 完了条件

- [x] upload intent用schema / indexとadditive public APIを追加する
- [x] 既存upload API / consumerのcontractをexpand phaseで変更しない
- [x] client由来Storage IDをrelation衝突だけでなくserver上のupload owner/intentから検証する
- [x] purposeとconsumption targetを固定し、別resourceとの参照共有を禁止する
- [x] migration要否と既存error/操作順への影響を確認する
- [x] 旧upload APIを廃止する

未消費intentと放棄objectの期限付きcleanupは、ownership contractとは分けてRF-003で追跡する。

---

## 推奨する実施単位

大きな一括リファクタリングにはせず、次の単位で設計・実装・検証・commitを分けます。

### Phase 0: 緊急対応

- RF-001 credential失効
- RF-002 GitHub Installation境界

### Phase 1: Schema expand

- RF-003 File Storage用field/table追加
- RF-004 Run table追加
- RF-006 query用index追加
- RF-017 Product Storage upload intent用schema追加

この段階では旧readerを壊さず、新旧schemaを共存させます。

### Phase 2: Server flow切替

- RF-004 scheduled internalAction
- RF-005 transaction/idempotency
- RF-007 validator/public-internal整理
- RF-008 error contract
- RF-010 domain invariant
- RF-017 Storage ownership検証と全参照cleanup

### Phase 3: Frontend切替

- RF-003 Storage upload
- RF-006 server-side search/pagination
- RF-008 error mapping
- RF-011 RHF + Zod
- RF-012 View/Content/Sectionとpreload

### Phase 4: Cleanupと再発防止

- 旧field/API/routeをcontract
- RF-009 lint error解消
- RF-013 legacy cleanup
- RF-014 verify command
- RF-015 STATUS/reference同期
- RF-016 architecture境界統一

## 各項目の共通完了ゲート

コード変更を伴う各項目は、影響範囲に応じて次を実行します。

```bash
pnpm typecheck
pnpm --filter frontend lint
pnpm exec convex dev --once --typecheck enable
pnpm build
```

- Convex変更時はConvex typecheckを必須にする
- UI変更時は対象routeをブラウザでsmoke確認する
- auth/permission変更時は未認証・本人・他人・Organizationの境界を手動確認する
- schema migrationはexpand/backfill/reader切替/contractの各段階で件数と失敗を確認する
- mockupは変更しない
- 新規test fileは作成・追記しない

## 今回の監査で「違反なし」と確認したもの

- `as any`、`as unknown as`、`@ts-ignore`の新たな使用は検出されなかった
- mockupへの変更は検出されなかった
- test fileの新規作成は不要
