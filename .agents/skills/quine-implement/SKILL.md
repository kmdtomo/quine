---
name: quine-implement
description: Quine の実装・リファクタリング全般を行う。Next.js の page/View/Content、Convex の schema/query/mutation/action、認証・権限、GitHub App、AI、ファイルアップロード、長時間処理、データ移行を、Quine 固有の責務境界と Convex の設計原則に沿って設計・実装・検証する時に使う。
---

# quine-implement

Quine の実装を、既存コードの偶然の形ではなく、プロジェクトで合意した責務境界とデータフローに揃えて完成させる。

mockup の HTML 1 ページを移植する場合は、本スキルではなく [`migrate-page-from-mockup`](../migrate-page-from-mockup/SKILL.md) を使う。

$ARGUMENTS が空、または対象・成功条件が不明確で、安全な仮定では結果が大きく変わる場合だけ、実装前にユーザーへ確認する。

## ゴール

実データで動作し、権限境界が守られ、Cloud dev に反映でき、静的検証と対象フローの smoke check が通る状態にする。動かない雛形、未接続のモック、先送りの TODO は残さない。

## 進め方

1. [`references/index.md`](references/index.md) と [`references/core-rules.md`](references/core-rules.md) を読む。
2. `references/index.md` のルーティングに従い、今回必要な reference と `.docs/` だけを読む。
3. 新規セッションでは [`.docs/STATUS.md`](../../../.docs/STATUS.md) を最初に読み、実装前に [`references/gotchas.md`](references/gotchas.md) を確認する。
4. 同じ責務の既存実装を複数確認する。単一ファイルの局所的な癖や古い歪みを新規実装へ広げない。
5. 変更ファイル、各ファイルの責務、auth/owner 境界、データフロー、schema 変更と移行方法を設計する。
6. 設計をユーザーへ提示し、承認後に最小スコープで実装する。
7. [`references/verification.md`](references/verification.md) に従い、diff、型、lint、Convex、実機フローを確認する。
8. 完了した項目を`.docs/STATUS.md`に反映し、新しい罠だけを`references/gotchas.md`に追記する。

## 絶対ルール

- `as any`、`as unknown as`、non-null assertion、理由のない `@ts-ignore` / `@ts-expect-error` を使わない。
- `*View` は Server、`*Content` は Client とし、初期取得に `useEffect + fetch` を使わない。
- public mutation/action の入口で `requireUser(ctx)` を呼び、所有者限定操作はDB上の所有関係を検証する。
- client 由来の `userId`、`authorId`、`installationId`、tenant相当IDを権限の根拠にしない。
- server-only 処理は `internalQuery` / `internalMutation` / `internalAction` に閉じる。
- schema は `convex/schema.ts` に集約し、登録関数は責務単位で分ける。複雑な純粋ロジックは `convex/lib/<feature>/` に置く。
- 技術スタックのDB値、検出結果、ロゴは `data/tech-stack.ts` の canonical keyに統一する。
- バイナリをdata URLや巨大なstringとしてDB・Action引数へ流さず、Convex File StorageのIDを使う。
- mockup はread-onlyとし、未接続モックや主要導線のTODOを残さない。
- テストファイルは新規作成も追記もしない。検証は静的検証、Convex実行確認、ブラウザsmokeで行う。

## 優先順位

1. auth、owner、GitHub Installationなどの権限境界
2. schema、validator、公開API、Run状態などのデータ契約
3. transaction、index、pagination、storageなどの正確性
4. View/Contentとfeature境界
5. UIと局所的な実装詳細

既存コードがreferenceと異なる場合、既存の外部契約は壊さず、古い危険なパターンを新規実装へ増やさない。

## References

- [`references/index.md`](references/index.md): タスク別に読む資料を選ぶ
- [`references/core-rules.md`](references/core-rules.md): 全実装共通の責務境界、identity、validation
- [`references/architecture.md`](references/architecture.md): ディレクトリ、依存方向、View / Content
- [`references/frontend-rules.md`](references/frontend-rules.md): 型、命名、import、Tailwind、フォーム
- [`references/convex-design.md`](references/convex-design.md): Convexのauth、Action、Run、index、storage、migration
- [`references/gotchas.md`](references/gotchas.md): 実際に踏んだ罠と対処
- [`references/verification.md`](references/verification.md): テストファイルを使わない完了前検証
