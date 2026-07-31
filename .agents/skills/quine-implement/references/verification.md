# 完了前の検証

テストファイルは作成も追記もしない。diff review、静的検証、Cloud dev上のConvex確認、対象フローのsmoke checkで完了を判定する。

## Diff review

- 無関係なユーザー変更を編集・revertしていない。
- 変更fileごとの責務を説明できる。
- 単一の既存fileにだけある局所パターンを模倣していない。
- auth、owner、Installation、公開fieldの境界を確認した。
- public/internal関数、args/returns validator、Run状態を確認した。
- `.take()`後のfilter、unbounded `.collect()`、data URL保存を増やしていない。
- schema変更にexpand/backfill/contractの順序がある。

## 必須コマンド

Frontendを変更した場合:

```bash
pnpm typecheck
pnpm --filter frontend lint
```

rootの`pnpm typecheck`はfrontend workspaceのTypeScript検査であり、rootの`convex/*.ts`検証を代替しない。Convexを変更した場合:

```bash
pnpm exec convex dev --once --typecheck enable
```

Cloud devへpushできない環境では、失敗理由を報告し、Convex検証済みと表現しない。

## 実機確認

MCPが利用可能なら、変更内容に応じてfunction spec、query実行、書き込み結果、table状態を確認する。MCPが認証されていなければCLIとブラウザで代替する。

UI変更ではブラウザで対象導線を操作し、loading、empty、success、expected errorを確認する。外部APIや長時間処理では、Runが`queued -> running -> succeeded/failed`へ遷移し、再読み込み後も状態が残ることを確認する。

## Skill変更時

```bash
python3 /Users/komodatomo/.codex/skills/.system/skill-creator/scripts/quick_validate.py <changed-skill-folder>
```

変更した各skillを個別にvalidateし、`SKILL.md`から各referenceへ直接到達できることも確認する。

## 完了報告

- 主な変更fileと責務
- schema/index/storage変更
- auth区分とowner確認方法
- 実行したコマンドと結果
- smoke checkの対象と結果
- 未実施項目または残るrisk
