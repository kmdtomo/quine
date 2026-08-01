# Security

Quineのidentity、authorization、trust boundary、公開情報、secretのルールを定義する。関数種別は [Convex](convex.md)、外部provider固有のflowは [external services](external-services.md) を参照する。

## Contents

- [Access classes](#access-classes)
- [Authentication](#authentication)
- [Ownership and authorization](#ownership-and-authorization)
- [Untrusted input](#untrusted-input)
- [Public responses](#public-responses)
- [Scheduled work](#scheduled-work)
- [GitHub Installation boundary](#github-installation-boundary)
- [File ownership](#file-ownership)
- [Secrets and errors](#secrets-and-errors)
- [Security checklist](#security-checklist)

## Access classes

実装前に各entrypointを次のどれかへ分類する。

| Class | Example | Required check |
|---|---|---|
| public | 公開profile、公開product detail | 公開状態と返却field |
| authenticated | notification、follow | `requireUser(ctx)` |
| owner/member limited | edit、delete、private repo解析 | identity + DB relation |
| internal | scheduled Action、result commit | internal registration + Run/resource state |

「ログインしていれば可能」と「そのresourceを操作できる」は別の判断である。owner/member限定では両方を確認する。

## Authentication

public mutationとpublic Actionはhandlerの最初で`requireUser(ctx)`を呼ぶ。認証が任意のpublic queryだけnullableなcurrent user helperを使う。

```ts
handler: async (ctx, args) => {
  const user = await requireUser(ctx);
  // use user._id, never args.userId as identity
}
```

- client由来の`userId`、`authorId`、email、GitHub loginをidentityにしない。
- authenticated userとQuine user documentの対応は共通auth helperで一貫させる。
- UIのroute guardやbutton非表示だけを認証・権限の根拠にしない。
- Server Componentでtokenを得られない場合を、owner queryのanonymous fallbackにしない。

Convex AuthのGitHub OAuth callbackは`.convex.cloud`ではなく`.convex.site`のHTTP endpointを使う。`AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`はConvex backend environmentへ設定し、frontend envや`NEXT_PUBLIC_*`へ置かない。Convex Authがschemaへ追加するauth tableはlibrary管理とし、application codeから直接変更しない。

## Ownership and authorization

owner/resource accessはDB relationから導出する。

```text
authenticated identity
  -> users document
  -> resource.authorId / membership / installation relation
  -> allowed operation
```

- document取得、owner/member確認、更新を同じmutationで行う。
- nested resourceは親relationを辿って権限を確認する。
- client指定parent IDをそのまま信用せず、対象documentとのrelationを検証する。
- role名だけで許可せず、そのroleが対象organization/resourceに属することを確認する。
- denormalized owner fieldはcanonical relationからserverで導出する。
- resource不存在と権限不足を外部へ区別すると存在漏えいになる場合は、同じpublic errorにする。

## Untrusted input

次をtrust boundaryとして扱う。

- form、URL params、searchParams、cookie、header。
- Convex public function args。
- webhook bodyとsignature header。
- GitHub/OpenAI response。
- AI structured output。
- legacy DB document。
- filename、MIME type、external URL。

各boundaryでvalidator、Zod schema、明示的type guardのいずれかを使う。TypeScript型やcastはruntime validationではない。

- string length、array length、pagination limitをboundedにする。
- URLはprotocolと必要ならhost allowlistを確認する。
- markdown/HTMLをrenderする時は既存のsanitization contractを守る。
- promptやrepository contentを命令ではなくuntrusted dataとして区切る。
- external responseに未知値が来た時はsilent coercionせず、safe failureまたは明示的fallbackにする。

## Public responses

public queryは保存documentをそのまま返さず、公開fieldを明示的に組み立てる。

含めない例:

- private owner/member ID。
- email、OAuth identity detail。
- GitHub Installation IDやaccess metadata。
- internal Run error detail、raw prompt/output。
- storageの内部管理情報。
- draft/private content。

owner向けdetailとpublic detailは別query/return contractにする。frontendでfieldを隠すだけでは情報公開を防げない。

## Scheduled work

scheduled internal functionへ元requestのauth contextは引き継がれない。

1. public mutationで認証とresource accessを確認する。
2. user/resource/provider relationをRunへserver側で保存する。
3. schedulerにはRun IDだけを渡す。
4. internalActionはRunを読み、current stateとrelationを再確認する。
5. result commit時もRun/resource relationと許可stateを確認する。

Action argsへclient由来user ID、Installation ID、保存先resource IDを一式渡して権限の代わりにしない。

## GitHub Installation boundary

GitHub AppのInstallation tokenはprivate repositoryへ到達できるため、Installation IDを機密なauthorization relationとして扱う。

- App全体のInstallation一覧をclientへ返さない。
- clientが任意の`installationId`を自分へ紐付けるmutationを作らない。
- verified callback/setup flowでuser、GitHub account/organization、Installation、statusをDBへ関連付ける。
- repository操作時は現在userがaccess可能なInstallationをDB relationから選ぶ。
- Organization InstallationはGitHub側のuser accessまたはQuineのorganization membershipを検証する。
- disabled/suspended/deleted Installationを使用しない。
- internalActionはRunからInstallationを復元し、client inputを使わない。
- Installation tokenやApp JWTを保存document、log、client responseへ含めない。

GitHub login用OAuth identityとrepository解析用GitHub App Installationは別のtrust boundaryであり、ログイン済みだけで任意repository accessを許可しない。

## File ownership

- upload URLはauthenticated mutationで用途付きintentと一緒に発行する。
- finalizeではintent owner、期限、用途別MIME/size、Storage IDの一意claimを確認し、`uploaded`まで進める。
- storage IDをresourceへ付けるmutationでowner/accessを確認し、intent consumeと関連付けを同じtransactionで行う。
- 初回consumeはcurrent user、用途、期限を確認する。consumed IDの再利用は同じ用途・同じ消費先に限定し、現在のresource accessを別途確認する。
- private fileのURLをpublic queryへ無条件に含めない。
- resource削除・差し替え時のstorage object cleanupを定義する。
- file size、MIME、用途をclient表示だけでなくserver flowでも検証する。

presigned/upload URLは短命なcapabilityとして扱い、不要にlog・永続化・再利用しない。

`finalizeUpload`はresource ownershipの確定ではなく、intent作成後に生成された未登録Storage IDの一回claimである。upload URLとStorage IDの厳密な発行元証明とは扱わず、resource mutationのconsumeを必須にする。

`requireProductStorageOwnership`は`productAssets` relationの衝突検査であり、upload ownership検査ではない。Product use caseではこれをmetadata検査と`consumeUploadIntent`に組み合わせる。別editorが既存mediaを維持・並べ替える場合、uploader一致ではなく、同じProduct targetのconsumed intentと現在のeditor accessで許可する。

## Secrets and errors

- secretはConvex/Next server environmentに置き、client bundleへimportしない。
- `NEXT_PUBLIC_*`へtoken、App private key、OpenAI keyを置かない。
- error message、toast、redirect URL、query resultへsecretを含めない。
- providerのraw response bodyを丸ごとlogしない。
- infraのprovider errorをそのままpublicへ返さず、registered boundaryで安定したpublic errorへ変換する。
- scheduled Actionのprovider failureはsafe codeへ分類し、secretやraw responseを含めずRunへ保存する。
- expected auth/access errorは安定codeを返し、内部理由を必要以上に公開しない。
- unexpected errorは安全なcontextとcorrelation用Run/resource IDだけをserverで記録する。
- webhookはsignatureとreplay riskをprovider contractに従って検証する。
- OAuth `state`、callback URL、cookie属性は既存の認証flowと一致させる。

## Security checklist

- entrypointをpublic/authenticated/owner/internalのどれかに分類したか。
- public mutation/actionの最初でidentityを確定したか。
- owner/member/InstallationをDB relationから導出したか。
- client由来IDを権限根拠にしていないか。
- external/AI/legacy値をruntime validationしたか。
- public queryが公開fieldだけを返すか。
- scheduled workがRun IDからcontextを復元するか。
- fileのupload intent/ownerとInstallationのownershipをserverで確認するか。helper名だけで保証済みと判断していないか。
- secret、raw provider data、個人情報がclient/logへ漏れないか。
