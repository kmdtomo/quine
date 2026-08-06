---
name: quine-implement
description: Quine の実装・修正・リファクタリング・コードレビューを、Next.js 16、Convex、Convex Auth、GitHub App、OpenAI、File Storage の責務境界に沿って進める。page/View/Content、フォーム、query/mutation/action、認証・所有権、外部API、長時間Run、schema/index/migration、配置判断、完了前検証が必要な時に使う。
---

# quine-implement

Quine の実装を、frontend feature、Convex DB use case、Action workflowを中心に一貫した構造で完成させる。

## Workflow

1. 新しいセッションでは最初に [`.docs/STATUS.md`](../../../.docs/STATUS.md) を読む。
2. 下の routing から必要な reference をすべて読む。要件の意味が不足する時だけ `.docs/INDEX.md` から product docs を読む。
3. 同じ責務の既存実装を複数確認し、単一ファイルの癖を標準化しない。
4. 変更ファイル、各責務、auth/owner 境界、データフロー、schema/index/storage 変更を設計する。
5. ユーザーへ設計を提示し、承認後に最小単位で実装する。
6. [verification](references/verification.md) に従って diff、型、lint、Convex、対象フローを確認する。
7. 完了した実装・接続・検証を `.docs/STATUS.md` へ反映する。

安全な仮定で結果が変わらない場合は質問せず進める。権限、公開API、破壊的schema変更、外部状態を変える判断が分かれる場合は実装前に確認する。

## Core rules

- `app/` は route と composition、`features/` は feature UI と任意の Next adapter に限定する。
- `*View` は Server Component、`*Content` は Client Component にする。`"use server"` は Server Action にだけ使う。
- 初期取得は `preloadQuery` / `fetchQuery` を使い、`useEffect + fetch` を使わない。
- Convex root の登録関数をpublic adapterとし、複雑なquery/mutationのDB use caseを`convex/application/<feature>/`へ切り出す。
- `convex/schema.ts` を唯一の DB schema entrypoint とする。独立した `domain/` 層は作らない。
- AI prompt、tool、detection、Action固有の処理フローは`convex/workflows/<feature>/`へ置く。
- GitHub、OpenAI など Convex 外部との接続だけを `convex/infra/<provider>/` へ置く。Convex DB を repository で包まない。
- public mutation/action の入口で認証を確定し、owner/Installation は DB の関係から導出する。
- 長時間処理は public mutation で Run を作り、scheduled internalAction を起動する。
- feature 固有コードを汎用 `lib/` へ置かない。`lib/` は複数領域が依存する基盤だけにする。
- `any`、unsafe cast、non-null assertion、理由のない TypeScript 抑制を使わない。
- テストファイルは作成・追記しない。

## Reference routing

| Task | Read |
|---|---|
| ファイル追加、移動、責務判断 | [project structure](references/project-structure.md) |
| page、View、Content、Section、フォーム、Server Action、Route Handler | [frontend](references/frontend.md), [code rules](references/code-rules.md) |
| schema、query、mutation、internal function、index、migration | [Convex](references/convex.md), [security](references/security.md) |
| 複数層をまたぐ処理、SSR、mutation、upload、OAuth | [data flows](references/data-flows.md) |
| GitHub、OpenAI、Action workflow、外部API、長時間Run、retry | [external services](references/external-services.md), [security](references/security.md) |
| auth、owner、公開field、client由来ID、Storage所有権 | [security](references/security.md) |
| TypeScript、命名、import、error、Tailwind、RHF | [code rules](references/code-rules.md) |
| 完了前確認 | [verification](references/verification.md) |

複合タスクでは該当 reference を足し合わせる。情報は正規の reference にだけ置き、別ファイルへ同じ説明を複製しない。
