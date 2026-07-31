# GitHub連携 & 技術スタック自動検出 設計方針

> 上位の思想は [`00_manifesto.md`](./00_manifesto.md) に記載。「AI で自動化」「フローを完璧にする」はマニフェスト由来。

> **⚠ 実装注記:** このドキュメント内の「Supabase」記述はかつての方針。現在は **Convex** で実装する。リポ解析は認証済みmutationでRunを作成し、scheduled internalAction（`"use node"`）で実行する。詳細は[Convex design reference](../.agents/skills/quine-implement/references/convex-design.md)を参照。

## コンセプト

**設定は最小限、自動化を最大化する。**

- サインアップしたら技術スタックが自動で入っている
- プロダクト作成はURLを貼るだけで下書きが完成する
- 足りない分は手動で追加・編集する
- ユースケースはこちらで限定しない。フローだけ完璧にする

## 全体アーキテクチャ

```
GitHub OAuth（認証）
  ↓
GitHub API（データ取得: 高速・無料）
  ├ リポジトリ一覧
  ├ Languages API（言語比率）
  ├ package.json / requirements.txt 等
  └ README.md
  ↓
軽量AI（正規化 & 文章生成: 高速・低コスト）
  ├ 検出結果 → data/tech-stack.ts の canonical key に正規化
  └ README → エンジニア向け説明文を生成
  ↓
data/tech-stack.ts の canonical key として保存
```

## 1. OAuth認証フロー

### 段階的なスコープ要求

```
Step 1: 最小権限でOAuth認証
  → スコープ: read:user（デフォルト）
  → パブリックリポジトリから自動検出

Step 2: オプションでスコープ追加
  → 「プライベートリポも含めますか？」
  → YES → repo スコープを追加で許可
  → NO  → スキップ（手動追加で補完）
```

### 設計原則

- **誰がどの判断をするかはこちらは関知しない**
- 個人アカウントでも会社アカウントでも同じフロー
- やる人はやる、やらない人はやらない
- スコープ追加は設定画面からいつでも変更可能

### Supabase側の設定

```
Supabaseダッシュボード → Authentication → Providers → GitHub
  → デフォルトスコープ: read:user
  → 追加スコープ要求時: repo（動的にスコープ変更）
```

### 注意事項

- `repo` スコープは読み書き両方の権限を含む（GitHub仕様）
- コードは一切保存しない。README + メタ情報のみ使用する
- ユーザーにはその旨を明示する

## 2. サインアップ時の自動技術スタック検出

### フロー

```
GitHub OAuth認証完了
  ↓
GitHub API: ユーザーのリポジトリ一覧取得（上位20件、スター順）
  ↓
各リポジトリから情報収集:
  ├ GET /repos/{owner}/{repo}/languages → 言語比率
  ├ GET /repos/{owner}/{repo}/contents/package.json → JS/TS依存関係
  ├ GET /repos/{owner}/{repo}/contents/requirements.txt → Python依存関係
  ├ GET /repos/{owner}/{repo}/contents/Gemfile → Ruby依存関係
  ├ GET /repos/{owner}/{repo}/contents/go.mod → Go依存関係
  └ 設定ファイルの存在チェック（next.config.*, tailwind.config.*, docker-compose.* 等）
  ↓
軽量AI: 収集データ → data/tech-stack.ts の canonical key に正規化
  ↓
tech_stacks テーブルに自動INSERT
  ↓
確認画面:「これで合ってる？ 追加・削除できるよ」
```

### GitHub API使用詳細

```typescript
// ユーザーのリポジトリ一覧（スター順、上位20件）
GET /user/repos?sort=stars&per_page=20

// リポジトリの言語比率
GET /repos/{owner}/{repo}/languages
// → { "TypeScript": 45000, "JavaScript": 12000, "CSS": 3000 }

// 特定ファイルの取得（Base64エンコード）
GET /repos/{owner}/{repo}/contents/package.json
// → { content: "base64エンコードされた内容", encoding: "base64" }
```

### パフォーマンス

- リポジトリ一覧: 1リクエスト
- 各リポの言語: 20リクエスト（並列実行）
- パッケージファイル: 最大20リクエスト（並列実行、404は無視）
- **合計: 2-3秒で完了（並列実行時）**
- GitHub APIレート制限: 認証済みユーザー 5,000回/時 → 十分

## 3. プロダクト作成

### フロー

```
入力方法:
  A. GitHub URLを貼る（パブリックリポ or OAuth認証済みのプライベートリポ）
  B. 自分のリポジトリ一覧から選択
  C. 手動入力（URLなし）

A or B の場合:
  ↓
GitHub API:
  ├ リポジトリ基本情報（名前、説明、スター数）
  ├ Languages API
  ├ パッケージファイル
  └ README.md
  ↓
軽量AI:
  ├ 技術スタックの正規化
  └ エンジニア向け説明文の自動生成（READMEベース）
  ↓
プレビュー画面（ユーザーが確認・カスタマイズ）
  ├ プロダクト名（自動入力 or 手動）
  ├ 説明文（AI生成の下書き → ユーザーが編集）
  ├ 技術スタック（自動検出 → 追加/削除）
  └ その他の情報（手動入力）
  ↓
保存

C の場合:
  ↓
手動フォーム + AI補完
  ├ 技術スタック選択UI
  └ 説明文はAIが提案（入力内容に基づく）
```

### エンジニア向け説明文について

**会社のHPにはない、エンジニアが本当に知りたい情報を書く場所。**

```
❌ HP的な説明:
「AIを活用した次世代マッチングプラットフォーム」

✅ Quineでの説明:
「Next.js 14 App Router + Python FastAPIのマイクロサービス構成。
 推薦エンジンはPyTorch + Transformerベースで構築。
 AWS ECS上でGitHub ActionsによるCI/CDパイプラインで運用。
 フロントはTailwind CSS + Framer Motionで構築」
```

AIがREADMEと技術スタックから下書きを生成し、ユーザーが肉付け・編集する。

## 4. 技術スタック正規化

### 方式: 軽量AIによる正規化

```
入力: GitHub APIから取得した生データ
  {
    languages: { "TypeScript": 45000, "JavaScript": 12000 },
    packageJson: { dependencies: { "next": "14.2.3", "react": "18.3.1", ... } },
    configFiles: ["next.config.mjs", "tailwind.config.ts", "docker-compose.yml"]
  }

↓ 軽量AI（Haiku級）に以下を渡す:
  - 上記の生データ
  - data/tech-stack.ts の全キー一覧

↓ AIの出力:
  ["typescript", "javascript", "nextjs", "react", "tailwind_css", "docker"]
```

### なぜ静的マッピングではなくAIか

| | 静的マッピング | 軽量AI |
|---|---|---|
| メンテナンス | マッピングテーブルの手動更新が必要 | 不要 |
| 新技術対応 | 都度追加が必要 | 自動対応 |
| 曖昧な名前の解決 | 困難 | 文脈で判断可能 |
| コスト | 無料 | 1リクエスト0.01円以下 |
| 速度 | 即座 | 0.5-1秒 |
| 精度 | 80-85% | 95%+ |

### 正規化の制約

- `data/tech-stack.ts` に定義されている canonical key のみを対象
- 未定義の技術は無視する（AIに明示的に指示）
- 既存のデータ構造との完全な整合性を保つ

## 5. AI活用の詳細

### 使用箇所

| 用途 | タイミング | AIモデル | 入力 | 出力 |
|------|----------|---------|------|------|
| 技術スタック正規化 | サインアップ時 | Haiku級 | GitHub APIの生データ + キー一覧 | キー配列 |
| 技術スタック正規化 | プロダクト作成時 | Haiku級 | 同上 | キー配列 |
| 説明文生成 | プロダクト作成時 | Haiku級 | README + 技術スタック | エンジニア向け説明文 |

### コスト見積もり

```
技術スタック正規化:
  入力: ~2,000トークン（生データ + キー一覧）
  出力: ~100トークン（キー配列）
  コスト: ~0.01円/リクエスト

説明文生成:
  入力: ~3,000トークン（README + 技術スタック）
  出力: ~500トークン（説明文）
  コスト: ~0.05円/リクエスト

月間1,000ユーザーのサインアップ + 500プロダクト作成:
  → 月額約30円
```

### レスポンス時間目標

```
サインアップ時の自動検出:
  GitHub API（並列）: 2-3秒
  AI正規化: 0.5-1秒
  合計: 3-4秒

プロダクト作成のAI生成:
  GitHub API: 1-2秒
  AI正規化 + 説明文生成（並列）: 1-2秒
  合計: 2-4秒
```

## 6. データ構造

### tech_stacks テーブル（既存）

```
ユーザーの技術スタック
  → data/tech-stack.ts の canonical key で保存
  → ソース（自動検出 / 手動追加）は区別しない
  → ユーザーが最終的に確認・編集したものが正
```

### products テーブル（既存）

```
プロダクト情報
  → 技術スタック: data/tech-stack.ts の key 配列
  → 説明文: ユーザーが編集した最終版
  → GitHub URL: 任意（なくても作成可能）
```

## 7. エラーハンドリング

| ケース | 対応 |
|--------|------|
| GitHubリポジトリが0件 | 手動入力を促す |
| GitHub APIレート制限 | キャッシュ or リトライ |
| パッケージファイルが存在しない | Languages APIの結果のみ使用 |
| AI正規化が失敗 | 言語のみの基本マッピングにフォールバック |
| プライベートリポでアクセス拒否 | スコープ追加を提案 or スキップ |

## 8. 実装優先度

### Phase 1: MVP（サインアップ自動検出）
1. GitHub OAuth認証の改修（スコープ管理）
2. GitHub API連携（リポジトリ一覧、Languages API、ファイル取得）
3. 軽量AIによる正規化処理
4. 自動検出結果の確認・編集UI
5. tech_stacksへの保存

### Phase 2: プロダクト作成強化
1. GitHub URL入力 → 自動解析
2. 自分のリポ一覧から選択UI
3. AI説明文生成
4. プレビュー・編集UI

### Phase 3: 体験の磨き込み
1. スコープ追加フロー（設定画面）
2. 技術スタックの提案精度向上
3. 説明文テンプレートの改善
4. レスポンス速度の最適化
