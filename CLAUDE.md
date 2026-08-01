# Quine project rules

このファイルはClaude Code向けの互換入口。プロジェクトルールの正規ソースは[`AGENTS.md`](AGENTS.md)、実装workflowと詳細ルールの正規ソースは[`.agents/skills/`](.agents/skills/)とする。

作業時は次の順で読む。

1. [`AGENTS.md`](AGENTS.md)
2. [`.docs/STATUS.md`](.docs/STATUS.md)
3. 該当する[canonical skill](.agents/skills/)
4. skillのroutingが指定するreference
5. 要件確認が必要な場合だけ[product docs](.docs/INDEX.md)

実装ルールは`.agents/skills/`だけに置き、別の互換directoryへ複製しない。
