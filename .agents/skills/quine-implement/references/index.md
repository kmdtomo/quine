# Reference ルーティング

全タスクで[`core-rules.md`](core-rules.md)、[`gotchas.md`](gotchas.md)、[`verification.md`](verification.md)を読む。Convexに触る場合は[`convex-design.md`](convex-design.md)も読む。

| 変更内容 | 追加で読む資料 |
|---|---|
| page、View、Content、フォーム、共通UI | [architecture](architecture.md), [frontend rules](frontend-rules.md) |
| schema、query、mutation、action、auth、権限 | [Convex設計](convex-design.md) |
| GitHub App、OpenAI、外部API、長時間処理 | [Convex設計](convex-design.md), 必要なproduct仕様 |
| 画像・添付・アバター・スクリーンショット | [Convex設計](convex-design.md)のFile Storage、対象feature仕様 |
| schema/index変更、backfill | [Convex設計](convex-design.md)のmigration |
| 技術スタック検出・表示・保存 | [architecture](architecture.md), [frontend rules](frontend-rules.md), [Convex設計](convex-design.md), [`data/tech-stack.ts`](../../../../data/tech-stack.ts) |
| mockup移植 | [`migrate-page-from-mockup`](../../migrate-page-from-mockup/SKILL.md)を使う |

新規セッションではreferenceの前に[`.docs/STATUS.md`](../../../../.docs/STATUS.md)を読む。プロダクト仕様の[`.docs/00`〜`04`](../../../../.docs/INDEX.md)は、要件やfieldの意味が必要な場合だけ読む。

複合タスクでは該当資料を足し合わせる。資料と現行コードが食い違う場合は、ユーザーへ差分を示し、権限・データ破壊・公開APIに影響する判断を黙って行わない。
