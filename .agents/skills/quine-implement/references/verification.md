# Verification

完了前のdiff review、静的検証、Convex確認、browser smoke、報告内容を定義する。test fileは作成も追記もしない。

## Contents

- [Choose the verification scope](#choose-the-verification-scope)
- [Diff review](#diff-review)
- [Commands](#commands)
- [Convex checks](#convex-checks)
- [Browser smoke](#browser-smoke)
- [External-flow checks](#external-flow-checks)
- [Skill and documentation checks](#skill-and-documentation-checks)
- [Completion report](#completion-report)

## Choose the verification scope

変更内容に比例して検証する。

| Changed area | Required |
|---|---|
| frontend TypeScript/UI | `pnpm typecheck`、frontend lint、対象flow smoke |
| Convex function/schema | frontend typecheck、Convex Cloud typecheck、Convex lint、対象function/data確認 |
| shared `data/` | frontend + Convex typecheck/lint、利用側確認 |
| external provider flow | Convex checks、Run state、safe failure、可能ならE2E |
| docs/skill only | link/reference検査、skill validator、diff review |
| broad cross-cutting change | `pnpm verify`、必要なら`pnpm build`、browser smoke |

commandを実行できない時は代替結果と未検証範囲を明示し、「検証済み」と表現しない。

## Diff review

最初に`git status --short`と対象diffを確認する。

- task外のuser変更を編集・revertしていない。
- 変更fileごとの責務を説明できる。
- generic `lib`、`utils`、`helpers`へfeature logicを逃がしていない。
- 新しいpublic API、schema/index/storage、env dependencyを特定した。
- `any`、non-null assertion、unsafe cast、TypeScript抑制が増えていない。
- debug log、dead code、不要import、secretがない。
- generated fileとmockupを手動編集していない。
- test fileを作成・追記していない。

security/Convex変更ではさらに確認する:

- public/internal、args/returns、公開fieldが意図どおり。
- auth、owner、Installation、File Storageのrelationがserverで検証される。
- queryがindexで正しい集合を先に絞り、listがbounded。
- mutation invariantが1 transaction内。
- schema変更にexpand/backfill/contractの順序がある。
- Action/Runにsecret、binary、巨大payloadを渡していない。

## Commands

Frontend変更:

```bash
pnpm typecheck
pnpm --filter frontend lint
```

Convex変更:

```bash
pnpm typecheck
pnpm run lint:convex
pnpm exec convex dev --once --typecheck enable
```

root `pnpm typecheck`はfrontend TypeScriptの検査であり、root `convex/*.ts`のCloud codegen/typecheckを代替しない。

広範囲またはrelease前:

```bash
pnpm verify
pnpm build
```

`pnpm verify`はsecret scan、frontend/Convex typecheck、frontend/Convex lint、Convex Cloud確認をまとめて行う。

lint errorを無関係な一括formatで直さない。task対象でない既存errorがある場合は、対象changeによるものかを切り分けて報告する。

## Convex checks

`pnpm exec convex dev --once --typecheck enable`でpush、codegen、Convex function typecheckを行う。

変更に応じて確認する:

- generated APIに意図したfunction pathがある。
- args/returns validatorが期待contractと一致する。
- queryが代表dataで正しい公開/owner resultを返す。
- mutation後に関連tableとdenormalized fieldが整合する。
- unauthorized/not-found/invalid transitionがsafe errorになる。
- migrationはsmall batchで再実行でき、完了を判定できる。
- File Storageのattach、replace、deleteがowner relationを守る。

Cloud devへ接続できない場合は、local TypeScriptだけでConvex検証済みとしない。失敗commandと接続blockerを残す。

## Browser smoke

UI変更では実際のrouteをbrowserで操作する。

最低限:

- routeが表示され、console/runtime errorがない。
- loading、empty、success、expected errorが成立する。
- primary actionが1回実行され、pending中の二重操作を防ぐ。
- 保存後、reactive queryまたはredirectで正しい画面になる。
- reload後もserver stateが復元される。
- keyboard/focus/label等、変更部分の基本accessibilityが壊れていない。
- mockup対象では主要layoutとinteractionが一致する。

auth必須flowをanonymous smokeだけで完了扱いにしない。signed-in sessionが使えない時は、未実施範囲を明記する。

## External-flow checks

GitHub/OpenAI/長時間処理ではRunを観測する。

- start mutationが`queued` Runを1つ作る。
- internalActionが`running`へ進める。
- success resultと`succeeded`が同じtransactionで確定する。
- provider failureがsafe error code付き`failed`になる。
- refresh後もstatusとresult/errorが残る。
- duplicate start、retry、古いattemptが二重結果を作らない。
- revoked Installation、timeout、429等の代表failureが分類される。
- log/client responseへtoken、raw prompt、private contentが出ない。

外部APIを実行できない時は、contract/typecheckとどのfailure pathまで確認したかを分けて報告する。

## Skill and documentation checks

skill変更時はvalidatorを実行する。

```bash
python3 /Users/komodatomo/.codex/skills/.system/skill-creator/scripts/quick_validate.py \
  .agents/skills/quine-implement
```

さらに確認する:

- `SKILL.md`から必要なreferenceへ直接到達できる。
- relative Markdown linkのtargetが存在する。
- 削除したreferenceへの参照が残っていない。
- AGENTS.mdとskillのarchitecture/hard ruleが矛盾しない。
- referenceごとに正規の責務があり、同じ長い説明を複製していない。
- substantialなskill変更では、現実的なtask promptでroutingと回答をforward-testする。

## Completion report

完了報告には次だけを簡潔に含める。

- 主な変更fileと得られた構造/動作。
- schema/index/storage/public API/auth境界の変更有無。
- 実行したcommandと結果。
- smoke/E2Eの対象と結果。
- 未実施項目、外部blocker、残るrisk。

実施していない検証を推測で成功扱いにしない。
