# Quine 共通実装ルール

## 実装モデル

入口でidentityと入力を確定し、Convexのtransactionを中心に状態を更新する。

```text
page / client event
  -> public query or mutation
  -> auth / owner check
  -> Convex validator
  -> transaction or scheduled internal action
  -> internal query / mutation
  -> reactive UI update
```

`app/`はroutingとcompositionだけを持つ。`features/`はユーザー操作単位のUIとConvex呼び出しを持つ。複数featureで使う純UIは`components/`、横断的な小さな基盤は`lib/`に置く。

Convexの公開関数は薄い入口にする。認証、validator、対象resourceの読み込み、owner確認を行い、複雑な純粋ロジックは`convex/lib/<feature>/`へ分ける。GENSEKIのapplication/domain/infra層をそのまま持ち込まず、Convexのtransaction境界を中心に必要な分だけ分ける。

## Identity と trust boundary

認証済みidentityは`requireUser(ctx)`から取得する。client inputの`userId`、`authorId`、GitHub `installationId`などは、選択情報として受け取れても権限の根拠にしない。

外部入力、URL params、Actionの外部API応答、AI structured output、既存DBの互換データをtrust boundaryとして扱う。Convex validator、Zod、明示的なtype guardのいずれかで検証し、castで通さない。

expected errorは安定したcodeを持つ`ConvexError`として返し、UI側で日本語表示へ変換する。secret、token、raw prompt、raw model output、個人情報をログやclient errorへ含めない。

## 既存コードの読み方

類似実装は1ファイルだけを正にしない。近い責務の複数ファイルを確認し、繰り返される命名、auth、validator、query、状態遷移を抽出する。

既存実装が分かれている場合は、次の順で判断する。

1. 権限とデータ整合性
2. skill referenceと必要なproduct docs
3. 複数箇所で繰り返される安定パターン
4. 外部契約を守るための局所的な互換処理

legacy互換は境界へ閉じ込め、新しいflowへ広げない。shared helperは、独立した複数flowで同じ理由から必要になってから共通化する。

## 実装前に確定すること

- 変更するfileと各fileの責務
- public / auth必須 / owner限定のどれか
- clientから受け取るIDと、DBから導出するID
- 1 transactionで守るinvariant
- 外部API失敗時のRun状態と再実行方法
- schema/index/storage変更と既存データの移行方法
- UIが購読するsource of truth
