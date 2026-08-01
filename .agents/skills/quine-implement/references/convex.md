# Convex

Convexのschema、registered function、transaction、query、migration、File Storageを定義する。認証・所有権は [security](security.md)、外部I/Oは [external services](external-services.md) を参照する。

## Contents

- [Function model](#function-model)
- [Public adapter](#public-adapter)
- [Application use case](#application-use-case)
- [Schema](#schema)
- [Queries and indexes](#queries-and-indexes)
- [Mutations and invariants](#mutations-and-invariants)
- [Internal functions](#internal-functions)
- [Actions](#actions)
- [Action workflows](#action-workflows)
- [File Storage](#file-storage)
- [Migrations](#migrations)
- [Environment and generated API](#environment-and-generated-api)
- [Convex checklist](#convex-checklist)

## Function model

| Function | Purpose | Direct DB access | External I/O |
|---|---|---:|---:|
| `query` | client向けread、reactive subscription | read | no |
| `mutation` | client向けtransaction | read/write | no |
| `action` | client向け外部I/O入口 | query/mutation経由 | yes |
| `internalQuery` | server flow内のread | read | no |
| `internalMutation` | server flow内のtransaction | read/write | no |
| `internalAction` | server flow内の外部I/O | query/mutation経由 | yes |

clientから直接必要なものだけpublicにする。長時間処理の標準入口はpublic mutationであり、public actionではない。

## Public adapter

`convex/<resource>.ts`はgenerated APIを登録する薄いadapterである。

```ts
export const save = mutation({
  args: {
    productId: v.id("products"),
    title: v.string(),
  },
  returns: v.id("products"),
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);

    return saveProduct(ctx, {
      productId: args.productId,
      title: args.title,
      userId: user._id,
    });
  },
});
```

adapterの責務:

- `args` / `returns` validator。
- publicかinternalかの公開範囲。
- public mutation/actionのhandler先頭で行う認証。
- 短い単一resource read/write。
- 複雑なuse caseへの型付きinput作成。

adapterを単に別functionへ転送するだけにしない。単純な1 document read/writeはadapterに置いた方が明確である。

root fileをresource単位に保つと、`api.products.save`のようなAPI名が安定する。applicationへregistered functionを置いてgenerated pathを深くしない。

## Application use case

`convex/application/<feature>/<verbObject>.ts`は、複雑なmutation transactionと、featureとして意味のある複雑なquery use caseを置く。Convex moduleとdirectoryの名前はcamelCaseにし、hyphenを使わない。

切り出す基準:

- resourceを読み、owner/accessを確認し、更新する。
- 状態遷移を検証する。
- 複数tableを整合的に更新する。
- idempotencyやactive Runとの競合を扱う。
- 同じtransaction use caseを複数adapterから使う。
- access確認、複数のbounded read、明示的な公開shapeの組み立てを一体で行う。

```ts
type SaveProductInput = {
  productId: Id<"products">;
  userId: Id<"users">;
  title: string;
};

export async function saveProduct(
  ctx: MutationCtx,
  input: SaveProductInput,
): Promise<Id<"products">> {
  const product = await ctx.db.get(input.productId);
  if (!product) {
    throw productNotFound();
  }
  if (product.authorId !== input.userId) {
    throw productForbidden();
  }

  await ctx.db.patch(product._id, { title: input.title });
  return product._id;
}
```

- `MutationCtx`では`ctx.db`を直接使い、1つのtransactionを維持する。
- query use caseは`QueryCtx`を受け取り、indexで絞ったbounded readから公開fieldだけを組み立てる。
- adapterで確定したidentityを受け取り、client由来IDをidentityとして使わない。
- Next、React、HTTP、外部SDKをimportしない。
- Convex DBをrepository interfaceで包まない。
- 純粋な業務ruleが複数use caseで共有された時だけ、同じfeature directoryへ具体名で切り出す。

単純query、1 documentのread/write、単なる再利用だけを理由とするwrapperはroot adapterに残す。read projection専用のtop-level directoryは作らず、複雑なread use caseもowner featureのapplicationへ置く。

独立したdomain層は作らない。型とruleがConvex use caseから独立して安定するまでは、use caseの近くに置く方が変更理由が明確である。

## Schema

`convex/schema.ts`をDB schemaの唯一のentrypointにする。

- table、field、relation、indexを定義する。
- relationはstringでなく`v.id("<table>")`を使う。
- user-owned resourceはownerを直接またはrelationで辿れるようにする。
- 公開resourceは`isPublic`等の公開状態を明示する。
- Runはstatus、resource、requester、attempt、時刻、結果/error codeを必要に応じて持つ。
- `_creationTime`で足りる時に独自`createdAt`を重複させない。business timestampだけ明示fieldにする。

フォームや外部API responseのshapeをDB schemaへ混ぜない。DBへ保存するcanonical stateだけを表現する。

schema changeでは既存document、query/index、write path、backfill、rollback可能性を同時に確認する。

## Queries and indexes

queryは正しい集合をindex rangeで取得し、返却fieldを明示する。

```ts
const products = await ctx.db
  .query("products")
  .withIndex("by_authorId_updatedAt", (q) =>
    q.eq("authorId", user._id),
  )
  .order("desc")
  .take(50);
```

- user-facing queryで取得後の`.filter()`に依存しない。
- `.take(n)`の後に公開状態やownerをfilterしない。必要なdocumentが欠落する。
- 増え続ける一覧、履歴、notification、Runはpaginateまたはbounded `take`にする。
- `.collect()`は関連数に明確な小さい上限がある時だけ使う。
- index fieldは等価絞り込み、範囲、sortの実際の順に設計する。
- public queryはDB document全体を返さず、公開fieldだけ組み立てる。
- owner向けqueryとpublic queryはcontractを分ける。

独立して更新される画面Sectionは1つの巨大queryにまとめない。ただしN+1 queryをclientで発生させず、必要なjoinはboundedなserver queryで組み立てる。

## Mutations and invariants

存在確認、access確認、現在状態の確認、更新は同じmutation transactionで行う。

- clientから送られた`authorId`やderived countを保存の根拠にしない。
- denormalized fieldは同じtransactionでcanonical documentから導出する。
- duplicate作成を防ぐ条件はqueryしてから同じtransactionでinsertする。
- state machineは許可された遷移を列挙し、不明なstateをdefault成功にしない。
- retryされても重複副作用を起こさないidempotency keyやcurrent statusを設計する。
- view/like等の高頻度counterを1つのhot documentへ無制限に集中させない。

UI側のdisabledや二重送信防止はUXであり、DB invariantの代わりではない。

## Internal functions

clientから呼ぶ必要のないDB operationはinternalにする。

典型例:

- Actionが外部I/O前にRun contextを読む`internalQuery`。
- Action結果とRun statusを確定する`internalMutation`。
- schedulerからのみ起動する`internalAction`。

internalであってもinputを信用しきらず、Run/resourceのrelationとcurrent statusをDBから確認する。scheduled functionには元のauth contextが引き継がれないため、認証済み入口で保存したRunからidentityを復元する。

## Actions

Actionは外部I/OまたはNode runtimeが必要な処理だけにする。

- Actionから`ctx.db`を直接触らない。
- `ctx.runQuery` / `ctx.runMutation`でDB contextを読み書きする。
- Node APIが必要なAction fileだけ先頭へ`"use node"`を書く。
- `"use node"` fileへquery/mutationを同居させない。
- SDK/fetchの詳細は`convex/infra/<provider>/`へ置く。
- DB transactionの途中で外部APIを待つ設計にしない。

短時間でclientが結果を即時必要とする処理だけpublic Actionを検討する。GitHub解析、AI生成、複数repository importはRun方式を使う。

## Action workflows

registered Actionのentrypointはrootの`convex/<feature>Action.ts`に置き、generated path、validator、public/internal境界、認証を安定させる。prompt、tool、detection、Action固有のorchestrationが大きくなった時だけ`convex/workflows/<feature>/`へ分ける。

```text
convex/
├── productAiAction.ts
└── workflows/
    └── productAi/
        ├── runProductWriting.ts
        ├── prompt.ts
        └── tools/
```

- workflow moduleはregistered functionをexportしない。
- workflowからDBへ触る時はActionCtxの`ctx.runQuery` / `ctx.runMutation`を使い、rootのregistered query/mutationを呼ぶ。複雑なtransactionはそのadapterからapplication use caseへ委譲する。
- 同じfeatureのapplicationにあるruntime非依存の純粋ruleはworkflowからimportしてよい。`QueryCtx` / `MutationCtx`を受けるDB use caseを直接呼ばない。
- provider SDK、fetch、request/response protocolは`convex/infra/<provider>/`へ置く。
- DB transaction、owner/state確認、result commitは`convex/application/<feature>/`へ置く。
- mutation/queryからNode専用workflowをimportしない。
- workflowを汎用service layerやrepository layerにしない。

## File Storage

画像、screenshot、attachment、生成物はConvex File Storageへ置く。

標準flow:

1. 認証済みmutationがupload URLを発行する。
2. clientがbinaryをuploadする。
3. owner確認付きmutationが`Id<"_storage">`をresourceへ関連付ける。
4. 表示またはActionがstorage IDからURL/blobを得る。
5. 置換・削除時に旧objectを削除するか、orphan cleanup方針を持つ。

- data URLやbase64巨大stringをdocument、Action args、Runへ保存しない。
- client指定storage IDをowner確認なしで他resourceへ関連付けない。
- GitHub avatar等の外部URLとQuine管理storage IDはfieldを分ける。
- upload完了とresource確定の間に残るorphanを想定する。

## Migrations

既存dataがあるschema変更は`expand -> backfill -> contract`で行う。

1. 新fieldをoptionalまたは新旧unionで追加する。
2. 必要ならreaderをdual-read、writerをdual-writeにする。
3. bounded batchでbackfillする。
4. read pathを新fieldへ切り替え、結果を確認する。
5. 旧fieldを削除し、新fieldをrequiredにする。

破壊的変更として事前確認が必要な例:

- field削除、validatorの狭小化。
- table/index削除。
- ID relationやowner semanticsの変更。
- 既存dataを再構成する一括write。

大きいtableへのindex追加はstaged indexを検討する。migration functionはbatch size、cursor、再実行安全性、完了判定を持たせる。

## Environment and generated API

Quineは共有できるCloud dev deploymentを標準にする。

| Location | Purpose |
|---|---|
| root `.env.local` | Convex CLI/server接続 |
| `apps/frontend/.env.local` | `NEXT_PUBLIC_CONVEX_URL`等frontend接続 |

- `.convex.cloud`はclient SDK endpoint、`.convex.site`はHTTP Action endpointとして区別する。
- anonymous local backend (`127.0.0.1`)へprojectを切り替えない。OAuth callback、GitHub App、別端末から到達できない。
- secretを`NEXT_PUBLIC_*`へ置かない。
- Convex backend secretはConvex environmentへ設定する。`.env.local`へ置くだけではdeployed functionへ反映されない。
- rootとfrontendのConvex URLは同じdeploymentを指すことを確認する。
- `.mcp.json`変更は現在sessionのtool一覧へ即時反映されない。toolがなければCLIで検証し、次sessionで接続を確認する。
- `convex/_generated/`はcodegen結果としてcommitし、手動編集しない。
- Convex変更後は`pnpm exec convex dev --once --typecheck enable`でpush、codegen、Convex typecheckを行う。

frontendの型検査だけ成功してもCloud function bundleは更新されない。新しいfunctionが`Could not find public function`になる場合は、function名を回避する前にCloud pushとgenerated APIを確認する。

## Convex checklist

- registered functionのpublic/internal範囲は最小か。
- argsとreturns validatorがあるか。
- 複雑さのない処理までapplication wrapperにしていないか。
- 複雑なowner/transition/複数table更新が1 transactionか。
- applicationへ移したqueryがaccess、bounded read、公開shapeを一体で扱う意味のあるuse caseか。
- queryはindexで正しい集合を先に絞っているか。
- list、history、Runはboundedか。
- ActionからDBを直接触っていないか。
- Action固有workflowにregistered functionやprovider protocolを混ぜていないか。
- binaryはFile Storageを通るか。
- schema変更にmigration順序があるか。
- generated fileを手動編集していないか。
