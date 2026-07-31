# Convex 設計ルール

## 目次

- [関数と配置](#関数と配置)
- [Schemaとmigration](#schemaとmigration)
- [Cloud dev・環境変数・MCP](#cloud-dev環境変数mcp)
- [認証と権限](#認証と権限)
- [公開関数とvalidator](#公開関数とvalidator)
- [外部APIと長時間処理](#外部apiと長時間処理)
- [GitHub Installation](#github-installation境界)
- [Queryとindex](#queryindexpagination)
- [File Storage](#file-storage)
- [Invariantと競合](#invariantdenormalization競合)
- [チェックリスト](#実装チェック)

## 関数と配置

| 種類 | 用途 | DB | 外部API |
|---|---|---|---|
| `query` / `internalQuery` | 読み取り、リアルタイム購読 | 読み取り | 不可 |
| `mutation` / `internalMutation` | transaction内の書き込み | 読み書き | 不可 |
| `action` / `internalAction` | GitHub、OpenAIなど外部I/O | query / mutation経由 | 可 |

- schemaは`convex/schema.ts`の1ファイルへ集約する。`defineSchema()`をtable別に分割しない。
- 登録関数はtableまたは外部integrationの責務単位で分ける。
- 複雑な純粋ロジックは`convex/lib/<feature>/`へ置き、登録関数を薄い入口にする。
- 外部SDKがNode APIを必要とするAction fileだけ冒頭に`"use node"`を書く。`"use node"` fileにはActionだけを置く。
- Actionから`ctx.db`を直接触らず、internal query / mutation経由で読み書きする。
- frontendは`convex/_generated/`だけを参照する。共有静的データは`data/`へ置く。

## Schemaとmigration

- user-owned resourceは`authorId`またはownerを辿れるrelationを持つ。
- 公開resourceは`isPublic`など明示的な公開状態を持つ。
- document relationは文字列IDではなく`v.id("<table>")`を使う。
- indexは実際の絞り込み順に設計する。
- `_creationTime`は全indexに自動で含まれる。独自`createdAt`はbusiness timestampが必要な場合だけ持つ。

既存データがある変更は`expand -> backfill -> contract`で行う。

1. 新fieldをoptionalまたは新旧unionで追加する。
2. 必要ならdual-read / dual-writeする。
3. bounded batchでbackfillする。
4. readerを新fieldへ切り替える。
5. 旧fieldを削除し、新fieldをrequired化する。

大きいtableへのindex追加はstaged indexを使う。field削除、validatorの狭小化、index削除は破壊的変更としてユーザー確認を取る。

## Cloud dev・環境変数・MCP

QuineはCloud dev deploymentを標準にする。anonymous local backendはOAuth callback、GitHub App、別端末利用に向かないため使わない。

| 場所 | 用途 |
|---|---|
| root `.env.local` | CLI / MCP用の`CONVEX_DEPLOYMENT`, `CONVEX_URL`, `CONVEX_SITE_URL`, `CONVEX_DEPLOY_KEY` |
| `apps/frontend/.env.local` | client用の`NEXT_PUBLIC_CONVEX_URL` |

- `https://<project>.convex.cloud`はclient SDK endpoint。
- `https://<project>.convex.site`はHTTP Action / OAuth callback。
- Development Deploy Keyをroot `.env.local`へ置き、CLI / MCPを非対話で接続する。
- `.mcp.json`変更は次のセッションから反映される。
- Convex変更後は`pnpm exec convex dev --once --typecheck enable`でpush、codegen、Convex typecheckを行う。

一回限りのCloud、Convex Auth、GitHub Provider、MCP設定は[`quine-init`](../../quine-init/SKILL.md)を正にする。

## 認証と権限

Quineの公開度は3段階に分ける。

| 区分 | 例 | 実装 |
|---|---|---|
| 公開 | profile、product detail | authを必須にせず、公開fieldだけ返す |
| 認証必須 | follow、notification | public mutation/queryの入口で`requireUser(ctx)` |
| owner限定 | edit、delete | `requireUser(ctx)`後、DB上のowner relationを検証 |

- 認証済みidentityは`requireUser(ctx)`から取得する。
- client inputの`userId`、`authorId`、`installationId`を権限の根拠にしない。
- UIでbuttonを隠しても権限確認にはならない。DB関数側で必ず守る。
- public queryでviewer情報が任意なら、nullableな`getCurrentUser(ctx)`を使う。
- expected auth / owner errorは安定したcodeを持つ`ConvexError`で返す。
- scheduled internal functionにはauth contextが引き継がれない。認証済みmutationが作ったRunからuserとresourceを復元する。

## 公開関数とvalidator

- clientから呼ぶ必要がない処理は`internalQuery` / `internalMutation` / `internalAction`にする。
- 登録関数には`args`と`returns` validatorを定義する。
- public mutation / public Actionは最初に`requireUser(ctx)`を呼ぶ。
- owner限定操作は「document取得 -> owner検証 -> 更新」を同じmutationで行う。
- public queryはdocument全体をそのまま返さず、公開fieldを明示的に組み立てる。
- 外部API応答とAI structured outputはZodまたは明示的なguardで検証してから保存する。

## 外部APIと長時間処理

GitHub解析、AI生成、複数repo importは、clientからpublic Actionを直接起動する構造を標準にしない。

```text
public mutation
  -> auth / owner check
  -> intentとRunをqueuedで保存
  -> scheduler.runAfter(0, internalAction, { runId })
  -> internalActionがrunningへ更新
  -> 外部API
  -> internalMutationで結果とsucceededを同時保存
  -> 失敗時はfailedと安全なerror codeを保存
```

- `githubAnalysisRuns`、`productAiRuns`のようなRun tableをsource of truthにする。
- client生成stringではなくConvex document IDをRun IDにする。
- ActionへはRun IDだけを渡し、user、resource、InstallationをDBから復元する。
- DB準備・読取・確定は`prepareRun`、`loadRunContext`、`commitRunResult`程度にまとめる。
- scheduled Actionは自動retry前提にしない。retry mutation、attempt、nextRetryAt、idempotencyを明示する。
- 同一resourceの同時実行を禁止する場合は、Run作成mutationでactive Runを検査する。
- 高負荷、queue、concurrency制御が必要になったらWorkpool / Workflowを検討する。

## GitHub Installation境界

GitHub AppのApp JWTはInstallation tokenを発行できるため、`installationId`の誤使用はprivate repositoryの境界を破る。

- App全体のInstallation一覧をclientへ返さない。
- `installationId`を任意のpublic mutationでユーザーへ保存させない。
- `githubInstallations` tableで検証済みのuser、GitHub account、Installation、statusを紐付ける。
- Organization InstallationはユーザーのInstallation accessまたはOrganization権限を検証する。
- repo解析・importは現在ユーザーのInstallationをDBから取得する。
- internalActionはRunからInstallationを復元し、client指定値を使わない。

## Query、index、pagination

- user-facing queryは取得後の`.filter()`ではなく`.withIndex()`のrangeで絞る。
- `.take(n)`してから公開状態やownerをfilterしない。正しい対象を欠落させる。
- `.collect()`は関連数に明確な小さい上限がある場合だけ使う。
- 増え続ける一覧、ログ、履歴は`.paginate()`または明示的な`.take()`を使う。
- 公開一覧は`["isPublic", sortKey]`、owner一覧は`["authorId", sortKey]`のように絞り込み順でindexを設計する。
- 独立して更新される画面sectionは、巨大queryへまとめずbounded queryへ分ける。

## File Storage

- 画像、添付、banner、screenshotをdata URLや巨大stringとしてdocument・Action引数へ保存しない。
- 認証済みmutationでupload URLを発行し、clientからFile Storageへuploadする。
- resourceには`Id<"_storage">`をowner確認付きmutationで保存する。
- AIや外部APIにはstorage IDからblobを取得して渡す。
- 外部avatar URLとQuine管理ファイルはfieldを分ける。
- 置換・削除時は旧storage objectを削除するか、orphan cleanup方針を持つ。

## Invariant、denormalization、競合

- ownershipやsummaryを複数tableへ複製する場合は、1 mutation内で元documentから導出する。
- clientから重複fieldを受け取って整合性を期待しない。
- view数・like数などの高頻度counterを1つのhot documentへ集中させない。event / aggregate / sharded counterを検討する。
- 存在確認、owner確認、状態遷移、更新を同じmutation transaction内で行う。

## 実装チェック

- public関数を本当にclientへ公開する必要があるか
- argsとreturnsがvalidatorで固定されているか
- client由来IDをauth / owner / Installationの根拠にしていないか
- 長時間Actionのintent、status、failureが永続化されるか
- queryがindex rangeで正しい集合を取っているか
- list / log / historyがboundedか
- binaryがFile Storageを通るか
- schema変更に既存データの移行順があるか
