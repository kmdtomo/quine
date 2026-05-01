---
name: quine-implement
description: Quine の実装・リファクタリング全般を行う。新規機能、Convex の query/mutation/action、Next.js の page/View/Content、認証/権限、フォームなど。実装前に該当 docs を読み、設計提示、整合性確認、型チェックまで完了する時に使う。
---

あなたは Quine に精通したシニアエンジニアとして $ARGUMENTS を実装する。

$ARGUMENTS が空、または対象・スコープが不明確な場合は、実装内容の具体化をユーザーに求めてから進む。

## 1. docs を読む（スキップ厳禁）

**最初に必ず [`.docs/INDEX.md`](../../../.docs/INDEX.md) を読む**。タスク種別表とキーワード索引から、必要な docs を 1〜3 本に絞る。

実装タスクの基本セットは **`05`〜`08`**:

- `05_directory-structure.md` — 配置、依存方向、View/Content
- `06_convex.md` — schema、認証、権限分岐、query/mutation/action
- `07_coding-guidelines.md` — 型安全、命名、import 順、Server/Client
- `08_mockup.md` — mockup の役割と移植方針

プロダクト仕様（`00`〜`04`）は **要件確認が必要なときだけ** 追加で読む。

mockup から 1 ページ移植する場合は本スキルではなく **`migrate-page-from-mockup` スキル** を使う。

docs を読んだ後、`features/` 配下の既存類似実装も探索してパターンを踏襲する。

## 2. 設計する

docs と既存コードで得た情報をもとに、実装前に設計方針を固める。

- 変更・追加するファイル一覧と各ファイルの責務を洗い出す
- View / Content / Section の境界を決める
- Convex 側のスキーマ変更が必要か確認する
- 既存の同種 feature のコード構造を探索し、パターンを踏襲する
- 設計方針をユーザーに提示し、**承認を得てから実装に進む**

## 3. 実装する

- docs のルールに従い、既存コードの命名規則・パターンと一貫性を保って実装する
- `*View` は Server Component、`*Content` は Client Component を厳守
- mutation の最初で `requireUser(ctx)` を呼ぶ
- 所有者限定なら `authorId === user._id` チェックを入れる
- `useEffect + fetch` での初期取得は禁止。`preloadQuery` を使う
- **Convex schema 変更は `convex/schema.ts` 1 ファイルに集約**。テーブルごとにファイル分割しない（`defineSchema` の仕様上、単一エントリポイント必須）。一方 query / mutation / action は `convex/<table>.ts` のテーブル単位分割を維持する

## 4. docs 整合性チェック（スキップ厳禁）

実装がステップ1で読んだ docs の設計方針と乖離していないか確認する。

- レイヤー依存方向（`app → features → convex`）を守っているか
- `as any` / `!` / `@ts-ignore` を使っていないか
- mutation で `requireUser` を呼んでいるか
- 所有者限定で `authorId` チェックがあるか
- 公開 query が auth 必須になっていないか
- import 順（React/Next → 外部 → Convex → lib → components → features → 相対）を守っているか
- `*View` が server、`*Content` が `"use client"` になっているか
- 乖離がある場合は実装を修正する

## 5. 型チェック（スキップ厳禁）

実装後、**必ず** 以下を実行する。**型チェック成功まで実装完了ではない。**

```bash
pnpm typecheck
```

- 出力が空（または既知エラーのみ）なら成功
- エラーが出たら修正して再実行する
- `convex/_generated/` の更新が必要な場合は `pnpm convex:dev` を一度走らせる

## 6. レポート

以下を簡潔にユーザーへ報告。

- 追加・変更したファイル一覧と責務
- Convex スキーマ変更の有無
- 認証 / 権限の扱い（公開 / 認証必須 / 所有者限定）
- 型チェック結果
- スコープ外と判断して触らなかったもの（あれば理由付きで）

## 禁止

- 実装前に docs を読まずに着手すること
- mockup を直接編集すること（mockup は read-only の参照元）
- `useEffect + fetch` で初期データを取ること
- `as any` / `!` / `@ts-ignore` を使うこと
- mutation で auth チェックをスキップすること
- 型チェック未実施で完了報告すること
- Convex schema をテーブルごとに分割すること（`convex/users.schema.ts` のような分け方は禁止。schema は `convex/schema.ts` 1 ファイル集約）
