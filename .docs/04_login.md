# ログイン & 認証 設計方針

> 上位の思想は [`00_manifesto.md`](./00_manifesto.md) に記載。「設定を最小化」「フローを完璧に」はマニフェスト由来。

> **⚠ 実装注記:** このドキュメント内の「Supabase Auth」記述はかつての方針。現在は **Convex Auth + GitHub Provider** で実装する。フロー（GitHub OAuth → username取得 → account作成）は変わらない。実装詳細は[Convex design reference](../.agents/skills/quine-implement/references/convex-design.md)と[`quine-init`](../.agents/skills/quine-init/SKILL.md)を参照。

## コンセプト

**GitHubだけで完結する認証。メールアドレスもパスワードも要求しない。**

- ログイン手段はGitHubのみ
- ユーザー名 = GitHubユーザー名
- メアド入力欄もパスワードもない
- エンジニア向けサービスなので、全員がGitHubアカウントを持っている前提

Vercel / v0 と同じ思想。余計な設定をさせない。

## 認証アーキテクチャ

**「ログイン」と「リポジトリ読み取り」を2つの仕組みに分離する。**

```
① ログイン認証
   Supabase Auth + GitHub OAuth (read:user のみ)
   → ユーザー識別だけが目的
   → リポジトリへのアクセス権は持たない

② リポジトリ読み取り
   Quine GitHub App (Contents: Read-only)
   → プロダクト作成時に必要な人だけが Install
   → 読み取り専用で書き込みは物理的に不可能
```

### なぜ分離するか

| | OAuth App だけで全部やる | OAuth + GitHub App 分離 |
|---|---|---|
| ログイン時のスコープ | `repo` が必要（リポ読むため） | `read:user` のみ |
| ユーザーから見た権限 | 「全リポを読み書きする」 | 「プロフィール取得だけ」 |
| 書き込み権限 | トークンに含まれてしまう | **物理的に不可能** |
| リポ単位の制御 | 不可（全リポ or なし） | Install時に選択可 |
| サインアップの軽さ | 重い | 軽い |

**サインアップは最も離脱しやすい瞬間。** リポへのアクセス許可は、本当に必要になる「プロダクト作成時」まで遅らせる。

## 1. ログインフロー

### サインアップ & ログイン（同一フロー）

```
Quine トップ
  ↓ [GitHubでログイン] をクリック
GitHub の OAuth 画面
  → Quine wants to access your account
  → Read access to your profile
  → [Authorize]
  ↓
Supabase Auth がコールバック受信
  ├ 初回 → users テーブルに INSERT
  └ 既存 → セッション発行
  ↓
Quine に戻る（ログイン完了）
```

### Supabase側の設定

```
Supabaseダッシュボード → Authentication → Providers → GitHub
  ├ OAuth App を GitHub に登録
  ├ Client ID / Client Secret を Supabase に設定
  └ デフォルトスコープ: read:user
```

**追加スコープは要求しない。** リポ読み取りは GitHub App 側の責務。

## 2. ユーザーデータ設計

### users テーブル

```
users
  ├ id (uuid)              Supabase auth.users.id と紐付け
  ├ github_id (text)       GitHub の数値ID、不変。真のユニークキー
  ├ username (text)        GitHub username。URL/表示用
  ├ display_name (text)    表示名（GitHub の name、ユーザー編集可）
  ├ avatar_url (text)      GitHub のアバター
  ├ bio (text)             プロフィール本文
  └ created_at (timestamp)
```

### 重要な原則

**真の識別子は `github_id`（数値）、表示は `username`（文字列）。**

- GitHubではユーザー名の変更が可能。`kmdtomo` が `tomo-k` に変わることがある
- `github_id` は不変なので、DB上の外部キーは必ずこれで紐付ける
- `username` は表示・URL生成時に使用。変更があれば Supabase Auth の再ログイン時に同期する

### Supabase から取得できる情報

GitHub OAuth後、Supabase が自動で提供:

```typescript
user.user_metadata = {
  user_name: "kmdtomo",             // username (変わりうる)
  provider_id: "12345678",          // github_id (不変)
  avatar_url: "https://...",
  full_name: "Tomo Komoda",         // name
  preferred_username: "kmdtomo",
  email: "...",                     // 非公開設定の人はnoreplyアドレス
}
```

## 3. メアドなし運用

### GitHubでメアド非公開の人への対応

GitHubのプライバシー設定で「メアド非公開」にしているユーザーは、Supabaseに以下のダミーアドレスが渡される:

```
12345678+kmdtomo@users.noreply.github.com
```

- Supabase Auth は問題なく動く（内部的にはこれがメアド扱い）
- Quine側では **このアドレスを表示・通知に使わない**
- メアドが必要になる機能（メール通知等）は作らない、もしくは後から任意入力で追加

### 通知手段

メアドなし前提の通知設計:

- **アプリ内通知**（通知センター）がメイン
- **GitHub notification API** で重要な通知を送る選択肢もあり
- どうしても必要なら設定画面で「メアドを追加」を任意で用意（必須にはしない）

## 4. URL設計

### ユーザー領域は `@username` 形式

```
quine.com/@kmdtomo              プロフィール
quine.com/@kmdtomo/my-product   プロダクト個別ページ
quine.com/@kmdtomo/settings     設定（本人のみ）
```

### システム領域は `@` なし

```
quine.com/                      トップ
quine.com/explore               探索
quine.com/create                プロダクト作成
```

### 設計意図

- `@` プレフィックスでユーザー領域を明示的に区切る（Zenn / X 風）
- 将来 `settings` や `explore` といったシステムパスを増やしても、ユーザー名と衝突しない
- エンジニアにとって馴染みのある慣習

### username 変更時の扱い

- GitHub側で username を変えたユーザーがログインし直した時に、Quineの `username` カラムを更新
- 古いURL `@kmdtomo` は `301 redirect` で新しい `@tomo-k` に飛ばす
- プロダクト個別ページも同様にリダイレクト

## 5. GitHub App（リポジトリ読み取り用）

### ログインとは別物

ログイン（OAuth）はサインアップ時にやる。
GitHub App の Install は **プロダクト作成時に初めてお願いする**。

### インストールフロー

```
ユーザーがプロダクト作成画面を開く
  ↓
「自分のリポから選ぶ」を押す
  ↓
未インストールなら案内画面:
  「Quine GitHub App をインストールしてください
   あなたのリポを読んでAIが下書きを作ります
   読み取り専用で、書き込みは一切できません」
  [ Install ]
  ↓
GitHub の Install 画面:
  ├ インストール先 (個人 / Org)
  ├ リポジトリ選択 (All / Only select)
  └ 権限表示: Contents Read, Metadata Read
  ↓
Quine に戻る
  └ installation_id を users テーブルに保存
  ↓
以降、Installation Token でリポ読み取り可能
```

### 権限（最小構成）

```
Repository permissions:
  ├ Contents:  Read-only   ← README, package.json 等の取得
  └ Metadata:  Read-only   ← リポ一覧、Languages API 等

Account permissions:
  └ なし
```

**書き込み権限は一切要求しない。**

### 読み取るファイルの制限

GitHub Appの権限は「Contents: Read-only」までしか絞れない（「READMEだけ」のような粒度はGitHubに存在しない）。

→ **Quine サーバー側でホワイトリスト制の呼び出しを実装する**:

```
✅ 呼ぶ:
  GET /repos/{owner}/{repo}
  GET /repos/{owner}/{repo}/languages
  GET /repos/{owner}/{repo}/readme
  GET /repos/{owner}/{repo}/contents/package.json
  GET /repos/{owner}/{repo}/contents/requirements.txt
  GET /repos/{owner}/{repo}/contents/go.mod
  GET /repos/{owner}/{repo}/contents/Gemfile
  その他、依存関係・設定ファイルのみ

❌ 呼ばない:
  /contents/src/...   ソースコード
  /git/trees/...      ファイルツリー全取得
  /contents で src/, lib/, app/ 等のディレクトリ配下
```

### ユーザーへの説明

OAuth画面と Install画面で、以下を明示する:

- 読み取るファイル: README、依存関係ファイル（package.json 等）のみ
- ソースコードは一切読まない
- 取得したファイルは解析後に破棄、結果だけ保存
- 書き込みは物理的に不可能（GitHub App の権限設定による）

## 6. Organization 対応

### 個人アカウントと Org は別インストール

GitHub App は **インストール単位** で動く:

```
ユーザーA の個人アカウント → Quine App インストール済み
  → ユーザーAの個人リポが見える

会社Org → Quine App 未インストール
  → 会社のリポは見えない

会社Org → org admin が Install
  → 会社Orgの全メンバーが Quine 経由でリポにアクセス可
```

### UI挙動

プロダクト作成画面のリポ選択UI:

```
Personal
  ├ my-portfolio
  └ side-project

Organizations
  ├ 会社A ✅ Installed
  │   └ internal-dashboard
  ├ 会社B ⏳ Install依頼中
  └ 会社C [Orgにインストールを依頼]
```

Orgへのインストールは admin 権限が必要。admin でないユーザーは **「Request install」** を送れる（GitHub公式の仕組み）。

## 7. エラー & エッジケース

| ケース | 対応 |
|--------|------|
| GitHub OAuth をキャンセル | ログイン画面に戻る |
| username を GitHub 側で変更 | 次回ログイン時に同期、旧URLはリダイレクト |
| GitHub App をアンインストール | installation_id を無効化、次回リポ表示時に再Install案内 |
| Org admin が App をアンインストール | 該当Orgのリポ一覧を隠す |
| GitHubアカウント削除 | Webhookで受信、Quineユーザーも soft delete |
| プライベートリポへの読み取りが失敗 | その1件だけスキップ、他は表示 |

## 8. 実装優先度

### Phase 1: ログインの最小構成
1. Supabase Auth + GitHub OAuth 設定（`read:user` のみ）
2. users テーブル作成（github_id, username, avatar_url, display_name）
3. サインアップ → プロフィール自動作成
4. `quine.com/@username` のルーティング

### Phase 2: GitHub App 導入
1. GitHub App 登録（Contents: Read, Metadata: Read）
2. Install フロー実装
3. installation_id の保存・管理
4. リポジトリ一覧取得 API の実装

### Phase 3: Org 対応 & 磨き込み
1. Org Install 依頼フロー
2. username 変更への追従
3. アンインストール時の処理
4. エラーケースのハンドリング

## 9. セキュリティまとめ

- ログインは `read:user` のみ。リポへの書き込み権限はどこにも発行しない
- リポ読み取りは GitHub App の Read-only 権限。書き込みは物理的に不可能
- 読み取るファイルはサーバー側でホワイトリスト制限
- 取得したコードベースのファイルは永続化せず、解析結果（技術スタック、説明文）のみ保存
- ユーザーには OAuth / Install の両画面で何をどこまで読むか明示
