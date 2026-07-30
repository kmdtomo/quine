# プロダクト仕様インデックス

> `.docs/`は「なぜ・何を作るか」と現在地の正規ソース。実装方法は[`.agents/skills/`](../.agents/skills/)へ集約する。

進捗・次のタスク・既知課題は[`STATUS.md`](STATUS.md)を最初に確認する。

## プロダクト仕様

| ファイル | 内容 | 主に読む時 |
|---|---|---|
| [`00_manifesto.md`](00_manifesto.md) | 思想、価値、何をしないか | 方針や優先順位を決める |
| [`01_product.md`](01_product.md) | product page、親子構造、AI assist | product機能の要件確認 |
| [`02_account.md`](02_account.md) | 個人 / Organization、user model | profile、account、権限要件 |
| [`03_github.md`](03_github.md) | GitHub App、技術検出、repo連携 | GitHub連携の業務フロー |
| [`04_login.md`](04_login.md) | login、username同期、URL | auth、onboarding、route要件 |

複合機能では必要な仕様だけを足し合わせる。仕様内に残るSupabaseなどの旧実装記述より、冒頭の現行実装注記とcanonical skill referencesを優先する。

## 実装ルール

| タスク | 正規ソース |
|---|---|
| Quine実装全般 | [`quine-implement`](../.agents/skills/quine-implement/SKILL.md) |
| タスク別reference routing | [`quine-implement/references/index.md`](../.agents/skills/quine-implement/references/index.md) |
| mockup移植 | [`migrate-page-from-mockup`](../.agents/skills/migrate-page-from-mockup/SKILL.md) |
| 初期セットアップ | [`quine-init`](../.agents/skills/quine-init/SKILL.md) |
