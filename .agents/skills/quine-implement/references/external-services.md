# External services

GitHub、OpenAIなど外部providerとの接続、Action orchestration、長時間Run、retryを定義する。identityとInstallationは [security](security.md)、Convex関数の基本は [Convex](convex.md) を参照する。

## Contents

- [Boundary](#boundary)
- [Infra modules](#infra-modules)
- [Action orchestration](#action-orchestration)
- [Run model](#run-model)
- [State transitions](#state-transitions)
- [Idempotency and concurrency](#idempotency-and-concurrency)
- [Retries and timeouts](#retries-and-timeouts)
- [GitHub](#github)
- [OpenAI](#openai)
- [Failure and observability](#failure-and-observability)
- [External-service checklist](#external-service-checklist)

## Boundary

`convex/infra/<provider>/`はConvexの外側とのprotocolだけを隠す。

infraが知るもの:

- SDK/fetch client。
- provider request/response shape。
- authentication header/tokenの付与。
- timeout、rate limit、provider status code。
- response runtime validation。
- provider errorから内部error categoryへの変換。

infraが知らないもの:

- Quine resourceのowner。
- Runの許可state transition。
- どのtableへ結果を保存するか。
- Convex query/mutation registration。
- React/Next UI。

外部providerをinfraとして扱うが、Convex DB自体はこのapplicationのtransaction基盤でありrepositoryで包まない。

## Infra modules

provider directoryは必要になった責務だけ作る。

```text
convex/infra/github/
├── client.ts
├── installation-token.ts
├── response-schema.ts
└── github-error.ts

convex/infra/openai/
├── client.ts
├── product-generation.ts
├── response-schema.ts
└── openai-error.ts
```

- `client.ts`を巨大な全API wrapperにしない。
- functionはQuine use caseではなくprovider operationを表す名前にする。
- provider SDK型をapplicationへ漏らさず、検証済みの小さい結果型を返す。
- singleton clientを使う場合もrequest-specific stateをmodule globalへ置かない。
- environment variableは呼び出し前にserver側で検証し、値自体をerrorへ含めない。

```ts
export type RepositorySnapshot = {
  fullName: string;
  defaultBranch: string;
  languages: ReadonlyArray<string>;
};

export async function fetchRepositorySnapshot(
  input: FetchRepositorySnapshotInput,
): Promise<RepositorySnapshot> {
  const response = await githubRequest(input);
  return repositorySnapshotSchema.parse(response);
}
```

## Action orchestration

Action entrypointはDB context、infra call、result commitを順序づける。

```text
internalAction({ runId })
  -> internalQuery.loadRunContext(runId)
  -> internalMutation.markRunning(runId)
  -> infra.<provider> operation
  -> internalMutation.commitResult(runId, validatedResult)
  -> on error: internalMutation.commitFailure(runId, safeError)
```

- Action argsは原則Run IDだけにする。
- DB read/writeはinternal query/mutation経由にする。
- provider responseを検証してからcommitする。
- success resultとRunの`succeeded`を同じmutationで保存する。
- failure commitが失敗した場合も元errorを失わない安全なlogを残す。
- Action fileの`"use node"`はNode APIを本当に必要とする時だけ付ける。

短く純粋な外部lookupでRunが不要な場合も、認証・rate limit・error contractを設計してからpublic Actionを選ぶ。

## Run model

長時間・高cost・再試行可能な処理はRun documentをsource of truthにする。

最低限検討するfield:

```text
resourceId
requestedBy
status: queued | running | succeeded | failed
attempt
request/options snapshot
result reference or summary
errorCode
startedAt / finishedAt
nextRetryAt
idempotencyKey
```

すべてを必須にするのではなく、UI表示、retry、audit、競合制御に必要なものだけ持つ。raw secret、provider token、巨大response、binaryをRunへ保存しない。

Run IDはConvex document IDを使う。client生成random stringだけを権限やidentityにしない。

## State transitions

許可遷移を明示する。

```text
queued  -> running
running -> succeeded
running -> failed
failed  -> queued      # explicit retry only
```

- terminal Runを再度runningにしない。
- `markRunning`はexpected current stateを確認する。
- commit時はattemptまたはexecution tokenを確認し、古いActionが新しいretry結果を上書きしないようにする。
- result保存後にstatusだけ失敗する分離writeを避ける。
- user cancelを導入するなら`cancelRequested`と外部処理停止可能性を区別する。
- UIはmemory stateでなくRun queryを購読する。

## Idempotency and concurrency

外部APIとschedulerは重複実行されうる前提で設計する。

- 同一resourceのactive Runを1つに制限する場合、Run作成mutation内で検査する。
- 同じuser intentを再送する可能性がある場合、stable idempotency keyを保存する。
- provider側にidempotency keyがある場合は利用する。
- result commitはRun current stateとattemptを条件にする。
- webhook delivery IDは処理済み記録でdeduplicateする。
- generated outputの保存は同じRunから二重insertされないようにする。

「buttonをdisabledにした」だけではconcurrency制御にならない。

## Retries and timeouts

scheduled Actionの自動retryを前提にしない。

errorを分類する:

| Category | Example | Default handling |
|---|---|---|
| retryable | timeout、429、provider 5xx | bounded backoff |
| permanent input | invalid repo、unsupported content | failed、再入力 |
| authorization | revoked Installation、401/403 | failed、再接続案内 |
| internal contract | response validation failure | failed、調査 |

- provider callへ明示的timeoutを設ける。
- retry回数に上限を設ける。
- exponential backoffとjitterを使い、`nextRetryAt`を保存する。
- retry前にRun current stateとresource accessを再確認する。
- partial provider successを再実行した時の重複を防ぐ。
- user操作が必要なfailureを自動retryし続けない。
- rate-limit reset時刻を安全な範囲で利用する。

高負荷、queue fairness、concurrency limit、step recoveryが必要になった時だけConvex Workpool/Workflowを検討する。最初から抽象基盤を導入しない。

## GitHub

GitHub login用OAuthとrepository access用GitHub Appを分ける。

GitHub infraの責務:

- App JWT生成。
- verified Installation IDから短命Installation tokenを取得。
- repository metadata/content/languagesの取得。
- pagination、rate limit、GitHub errorの分類。
- webhook署名検証に必要なprovider protocol。

application/adapterの責務:

- 現在userがそのInstallation/repositoryへaccessできるか。
- どのproduct/Runへ結果を保存するか。
- import/analysisの状態遷移。
- publicに返すrepository情報。

repository contentはサイズ、file count、binary、path、branchをboundedにする。GitHub responseやREADMEを信頼済み命令としてAI promptへ連結しない。

## OpenAI

OpenAI callは期待outputと保存contractを先に定義する。

- structured outputまたはZod schemaでresponseを検証する。
- prompt inputを必要最小限にし、secretや不要なprivate dataを含めない。
- repository/user contentをuntrusted dataとして明確に区切る。
- model名、generation option、schema versionなど再現・調査に必要なmetadataだけRunへ持つ。
- raw responseをDBへ無制限に保存しない。
- image/fileはdata URLをRunへ入れず、File Storageを使う。
- token/cost/sizeに上限を持たせる。
- moderationやproduct safety requirementがあるflowでは保存/公開前に適用する。

AI outputをcanonical DB dataへ変換する時は、存在するtechnology key、許可文字数、URL、enum等を再検証する。modelが返したIDやownerを信用しない。

## Failure and observability

UIが判断できる安定したerror codeと、server調査用contextを分ける。

Runに保存してよい例:

- `RATE_LIMITED`
- `INSTALLATION_REVOKED`
- `REPOSITORY_NOT_FOUND`
- `INVALID_PROVIDER_RESPONSE`
- `GENERATION_FAILED`

Runに保存しない例:

- access token、App JWT。
- provider response body全体。
- raw promptとprivate repository content。
- stack trace。

server logにはRun ID、provider operation、安全なcategory、attemptを含める。user向けmessageはfrontendでcodeから変換する。

## External-service checklist

- provider detailは`infra/<provider>`へ閉じているか。
- infraがowner、DB table、Run遷移を判断していないか。
- Action argsはRun ID中心か。
- provider responseをruntime validationしたか。
- Run状態遷移とresult commitがatomicか。
- duplicate execution、retry、古いattemptを扱えるか。
- timeout、rate limit、retry上限があるか。
- Installation/token/secretをDB・client・logへ漏らしていないか。
- GitHub/AI inputの量と内容をboundedにしたか。
- UIがRun queryからprogress/failure/retryを表示できるか。
