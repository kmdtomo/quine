# Quine project rules

## Phase and stack

QuineをNext.js 16 App Router、TypeScript、Convex、Convex Auth、GitHub App、Tailwind CSS v4、shadcn/ui、pnpmで継続開発する。

ConvexはDB、registered functions、realtime、auth、外部処理のserver boundaryでありrootへ置く。別DB、repository layer、別認証基盤を追加しない。

## Source of truth

新しいsessionでは最初に[実装ステータス](.docs/STATUS.md)を読む。

実装・修正・refactor・reviewでは、必ず[quine-implement](.agents/skills/quine-implement/SKILL.md)を使い、taskに該当するreferenceをSKILL.mdのroutingから直接読む。product requirementが不足する時だけ[product docs index](.docs/INDEX.md)から必要なdocsを読む。

- `.docs/` — product requirementと実装進捗。
- `.agents/skills/quine-implement/` — workflowと実装ルール。

同じ情報を複数referenceへ複製しない。

## Architecture

```text
apps/frontend/
├── app/                  # route、metadata、composition
├── features/<feature>/   # feature UI、form contract、optional Next adapter
├── components/           # 複数featureで使う純UI
├── lib/                  # frontend横断基盤
├── hooks/
├── contexts/
└── proxy.ts              # route auth境界

convex/
├── schema.ts             # 唯一のDB schema entrypoint
├── <resource>.ts         # public/internal Convex adapter
├── <feature>Action.ts    # Node Action entrypoint
├── application/<feature>/# 複雑なquery/mutationのDB use case
├── workflows/<feature>/  # AI/Action固有の処理フロー
├── infra/<provider>/     # GitHub/OpenAI等の外部接続
├── lib/                  # Convex横断基盤
└── _generated/           # codegen、手動編集禁止
```

- 独立した`domain/`層は作らない。
- `convex/schema.ts`をDB schemaの正規ソースにする。
- Convex DBをrepositoryで包まない。
- feature固有コードを汎用`lib/`へ置かない。
- 詳細は[project structure](.agents/skills/quine-implement/references/project-structure.md)を正にする。

import aliasは`@/* = apps/frontend/*`、`@convex/* = convex/*`、`@data/* = data/*`。

## Non-negotiable rules

- `app/`はrouteとcompositionだけにする。
- `*View`はServer Component、`*Content`はClient Componentにする。
- Server Componentに`"use server"`を書かない。これはServer Actionだけに使う。
- 初期取得は`preloadQuery` / `fetchQuery`を使い、`useEffect + fetch`を使わない。
- 通常の更新はclientからConvex mutationを直接呼ぶ。`features/<feature>/actions.ts`はNext runtimeが必要な場合だけ作る。
- Convex root functionを薄いadapterにし、複雑なquery/mutationのDB use caseを`convex/application/<feature>/`へ置く。単純な1 document/index queryはrootに残す。
- AI prompt、tool、detection、Action固有の処理フローは`convex/workflows/<feature>/`へ置く。
- public mutation/actionの最初で`requireUser(ctx)`を呼ぶ。
- client由来の`userId`、`authorId`、GitHub `installationId`を権限の根拠にしない。DB relationから導出する。
- 長時間外部処理はpublic mutationでRunを作り、scheduled internalActionを起動する。
- GitHub/OpenAIのSDK、request/response、provider errorだけを`convex/infra/<provider>/`へ置く。
- `convex/`配下のmodule pathはcamelCaseにし、hyphenを含めない。
- 画像・添付はConvex File Storageを使い、data URLや巨大stringをdocument/Action argsへ保存しない。
- `any`、non-null assertion、unsafe cast、理由のないTypeScript抑制を使わない。
- test fileを作成・追記しない。
- 無関係なuser変更を編集、format、revertしない。

## Workflow

1. STATUSとtaskに必要なskill referenceを読む。
2. 同じ責務の既存実装を複数確認する。
3. 変更file、責務、auth/owner、data flow、schema/index/storage変更を提示する。
4. 承認後、最小の変更を実装する。
5. diffと対象flowを確認し、必要なcommandを実行する。
6. 完了内容と検証結果をSTATUSへ反映する。

権限、公開API、破壊的schema変更、外部状態を変える判断が分かれる場合は実装前に確認する。

## Commands

```bash
pnpm dev
pnpm convex:dev
pnpm build
pnpm typecheck
pnpm --filter frontend lint
pnpm run typecheck:convex
pnpm run lint:convex
pnpm exec convex dev --once --typecheck enable
pnpm verify
```

実装コード変更後は最低限`pnpm typecheck`を成功させる。Convex変更の統合確認では`pnpm exec convex dev --once --typecheck enable`も必須。ただしfork PR CIはsecretlessな`pnpm check`までとし、Cloud確認は保護されたbranch / Environmentのjobで行う。`pnpm verify`は共有Convex dev deploymentへのpushを含むため、read-only/local-only commandとして扱わない。UI変更時は対象flowをbrowser smokeする。詳細は[verification](.agents/skills/quine-implement/references/verification.md)を正にする。

## Out of scope

- Supabase、Prisma等、Convex以外のDB/backend導入。
- Convex Auth以外の認証library追加。
- taskと無関係なrefactorやcleanup。
