# Data flows

複数層をまたぐ標準flowと各境界の受け渡しを定義する。配置は [project structure](project-structure.md)、各層の詳細は該当referenceを参照する。

## Contents

- [SSR read](#ssr-read)
- [Reactive client read](#reactive-client-read)
- [Direct mutation](#direct-mutation)
- [Server Action](#server-action)
- [Transactional use case](#transactional-use-case)
- [Long-running external work](#long-running-external-work)
- [File upload](#file-upload)
- [OAuth and webhook](#oauth-and-webhook)
- [Flow design checklist](#flow-design-checklist)

## SSR read

初期表示に必要なデータはServer Componentでpreloadし、Client Componentが同じqueryをreactiveに購読する。

```text
browser request
  -> app/**/page.tsx
  -> feature/*View.tsx
     -> auth token
     -> preloadQuery(api.<resource>.<query>)
  -> feature/*Content.tsx
     -> usePreloadedQuery
  -> rendered UI + reactive updates
```

責務:

- page: route params / searchParamsとmetadataを扱い、Viewを配置する。
- View: token、preload、redirect/not-found。
- public query: access確認、index read、明示的return shape。
- Content: reactive query / mutationとinteractionを扱う。

初期取得のためだけにRoute Handlerや`useEffect + fetch`を挟まない。Server Componentに`"use server"`は不要である。

## Reactive client read

browser状態やinteraction後だけ必要なデータは`useQuery`で購読してよい。

```text
Content / Section
  -> useQuery(api.notifications.list, args or "skip")
  -> public query
  -> index + bounded result
  -> reactive rerender
```

- 必要条件が揃うまで`"skip"`を使う。
- query argsにclient user IDを含めてscopeを決めない。
- loading (`undefined`) とempty (`[]` / `null`)を区別する。
- pagination対象を無制限queryへ変えない。

## Direct mutation

通常のユーザー更新はClient ComponentからConvex mutationを直接呼ぶ。

```text
form/button event
  -> useMutation(api.products.save)
  -> public mutation adapter
     -> validate args
     -> requireUser
     -> simple write or application use case
  -> transaction commit
  -> subscribed query updates UI
```

このflowにNext Server Actionは不要である。Convex mutationがserver boundary、認証、transaction、reactive updateを提供する。

frontendはpendingとexpected errorを扱う。mutationはdocument、owner、current stateを同じtransactionで再確認する。

## Server Action

Next runtimeの機能が必要な時だけServer Actionを追加する。

```text
native form
  -> features/<feature>/actions.ts
     -> parse FormData
     -> read server cookie/token
     -> fetchMutation(api.products.create)
     -> redirect / revalidate
  -> Convex mutation
     -> auth + invariant + write
```

Server Actionが担うのはNext固有adapterだけである。business permissionやDB consistencyはConvex側に残す。

Server Actionを選ぶ前に確認する:

- native form actionが必要か。
- cookie/header/redirect/revalidateが同じrequestに必要か。
- clientから`useMutation`を呼ぶ方が自然ではないか。
- action内で長時間処理を待とうとしていないか。

## Transactional use case

複雑なmutationはroot adapterからapplication use caseを呼ぶ。

```text
api.products.publish
  -> convex/products.ts
     -> args/returns
     -> requireUser
     -> publishProduct(ctx, { productId, userId })
        -> load product
        -> verify owner + current state
        -> update product
        -> insert activity
        -> return result
```

全DB operationは同じ`MutationCtx`を使う。application内から別mutationを`runMutation`してtransactionを分断しない。

単一document patchまでapplicationへ移さない。owner/transition/複数table等のまとまりがある時だけ切り出す。

## Long-running external work

GitHub、OpenAI、複数repository処理はRunをsource of truthにする。詳しいstate/retry設計は [external services](external-services.md) を参照する。

```text
Content
  -> public mutation startRun
     -> requireUser + access check
     -> insert queued Run
     -> scheduler.runAfter(0, internalAction, { runId })
  -> useQuery(runId)

internalAction
  -> internalQuery loadRunContext
  -> internalMutation markRunning
  -> infra provider call
  -> internalMutation commitSuccess or commitFailure

Content subscription
  -> queued -> running -> succeeded / failed
```

public mutationはintentの受理までで返す。client requestをAction完了まで保持しない。ActionにはRun IDだけを渡し、user/resource/InstallationはDBから復元する。

結果と`succeeded`は同じtransactionで確定する。failureも永続化し、再読み込み後に消えないようにする。

## File upload

binaryはbrowserからConvex File Storageへuploadし、storage IDだけをresourceへ関連付ける。

```text
Content
  -> mutation createUploadIntent({ purpose })
  -> POST binary to upload URL
  -> receive storageId
  -> mutation finalizeUpload({ uploadIntentId, storageId })
     -> owner + expiry + purpose/MIME/size + unique claim
  -> resource mutation({ productId, storageId })
     -> auth + product access
     -> consume intent + save storage relation in one transaction
  -> query returns display URL
```

- form schemaではfile size/typeの早いfeedbackを行う。
- server側でも用途、owner、relationを確認する。
- finalize成功だけでresource ownership確定と扱わない。resource mutationでconsumeして初めて関連付けを確定する。
- 同じresource targetへのretryやProduct editorによる並べ替えは、consumed intentのtarget一致と現在のaccessで許可する。
- base64/data URLをmutation argsやdocumentへ入れない。
- upload成功後にattachが失敗するorphanをcleanup対象にする。
- 置換時は新fileの確定後に旧fileを削除するなど、消失しない順序を選ぶ。

## OAuth and webhook

OAuth callbackやwebhookはHTTP protocol boundaryのためRoute HandlerまたはConvex HTTP Actionを使う。

### OAuth

```text
browser
  -> connect endpoint
     -> authenticated user + signed state
     -> provider authorization
  -> callback
     -> verify state
     -> exchange code server-side
     -> fetch verified provider identity
     -> internal/public mutation stores relation
     -> redirect to safe fixed destination
```

- callback queryのaccount/Installation IDを本人確認に使わない。
- stateと現在sessionのrelationを検証する。
- token exchangeとsecretはserver側だけで行う。
- redirect先をuntrustedな外部URLにしない。

### Webhook

```text
provider POST
  -> HTTP boundary
     -> verify signature on raw body
     -> validate event type and payload
     -> deduplicate delivery ID
     -> internal mutation / scheduled action
  -> respond promptly
```

webhook request内で重い解析を完了させない。受理と永続化を行い、必要ならinternalActionへ送る。deliveryは重複・順序逆転を想定する。

## Flow design checklist

- source of truthはどのdocument/queryか。
- 最初のidentity確定はどこか。
- clientから来るIDとDBから導出するIDを区別したか。
- どのinvariantを1 transactionで守るか。
- Next固有処理がないのにServer Actionを追加していないか。
- 外部I/Oをmutation transactionへ混ぜていないか。
- long-running workのRun statusが永続化されるか。
- refresh、retry、二重click、重複webhookで壊れないか。
- loading、empty、success、failureがUIから観測できるか。
- binaryやsecretが不適切なboundaryを通っていないか。
