---
name: quine-implement
description: Quine の実装・リファクタリング全般を行う。新規機能、Convex の query/mutation/action、Next.js の page/View/Content、認証/権限、フォームなど。実装前に該当 docs を読み、設計提示、整合性確認、型チェックまで完了する時に使う。
---

あなたは Quine に精通したシニアエンジニアとして $ARGUMENTS を実装する。

$ARGUMENTS が空、または対象・スコープが不明確な場合は、実装内容の具体化をユーザーに求めてから進む。

**mockup から 1 ページ移植する場合は本スキルではなく [`migrate-page-from-mockup`](../migrate-page-from-mockup/SKILL.md) を使う。**

## ゴール

「実装すれば即動く、docs と既存コードのパターンに揃ってる、typecheck 通る」状態にすること。**「動かない雛形」「TODO 大量」「規約違反」は不可**。

## 必読 docs

- [`.docs/INDEX.md`](../../../.docs/INDEX.md) — タスク種別から関連 docs を絞る
- [`.docs/STATUS.md`](../../../.docs/STATUS.md) — **セッション開始時に最初に読む**（進捗・次タスク・既知課題）
- [`.docs/09_gotchas.md`](../../../.docs/09_gotchas.md) — 過去にハマった罠と対処（実装前にざっと眺める）

実装タスクの基本セット `05`〜`08` の中から、タスク種別に応じて 1〜3 本に絞る。プロダクト仕様 `00`〜`04` は要件確認時のみ。

## 絶対ルール

- **`as any` / `!` / `@ts-ignore` 禁止**（Convex `Id<>` 等の安全なキャストは除く）
- **`*View` は Server、`*Content` は Client**。`useEffect + fetch` 禁止（`preloadQuery` を使う）
- **mutation の最初で `requireUser(ctx)`**。所有者限定なら `authorId === user._id` チェック
- **公開 query は auth 必須にしない**（未ログインでも動く）
- **schema は `convex/schema.ts` 1 ファイル**（分割不可、単一エントリポイント）。**機能（query/mutation/action）はテーブル単位で分割**
- **mockup は read-only**（直接編集しない）
- **データを繋がず TODO で残さない**（モックデータ禁止）

## 手順

### 1. 状況把握
- `.docs/STATUS.md` で現在地を確認
- 必要に応じて `.docs/09_gotchas.md` で罠の事前チェック
- MCP が利用可能なら `mcp__convex__tables` / `mcp__convex__functionSpec` で **現状の DB 状態と関数を確認**（ファイルだけ見て決めない）

### 2. docs と既存コードを読む
- INDEX.md でタスク種別から必要な docs を 1〜3 本選ぶ
- `features/` 配下の既存類似実装を探して **パターンを踏襲**

### 3. 設計する
- 変更・追加ファイル一覧と各ファイルの責務
- View / Content / Section の境界
- Convex schema 変更の要否（破壊的変更ならユーザー確認）
- 設計を提示して **承認を得てから実装**

### 4. 実装する
- docs のルールと既存コードの命名・パターンに揃える
- schema 追加 / 変更時は `pnpm dlx convex dev --once --until-success` で push + codegen 更新

### 5. 確認

```bash
pnpm typecheck   # エラー 0 まで
```

MCP があるなら追加で:
- `mcp__convex__functionSpec` で公開 endpoint が想定通りか
- `mcp__convex__runOneoffQuery` で query を実機で叩いてみる
- ブラウザで動作確認（UI を伴う場合）

### 6. STATUS.md を更新
- 完了タスクは `[ ]` → `[x]`
- 新しい罠を踏んだら `.docs/09_gotchas.md` に追記
- 大きな区切りなら STATUS.md の「最終更新」も更新

### 7. レポート
- 追加・変更ファイルと責務
- schema 変更の有無
- auth 扱い（公開 / 認証必須 / 所有者限定）
- typecheck 結果
- スコープ外と判断したもの（理由付き）

## 禁止

- docs を読まずに着手
- `useEffect + fetch` で初期データ取得
- `as any` / `!` / `@ts-ignore`
- mutation で auth チェックスキップ
- 公開 query で auth 必須
- 型チェック未実施で完了報告
- schema をテーブルごとに分割
- モックデータを残す（必ず Convex query 経由）
- mockup を直接編集
- STATUS.md 未更新で完了報告
