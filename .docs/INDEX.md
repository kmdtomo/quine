# docs インデックス

> 実装タスクで参照すべき docs を素早く特定するための索引。skills は最初にこのファイルを読み、必要な docs を 1〜3 本に絞って読む。
>
> ⚠️ **進捗状況は [STATUS.md](STATUS.md) を見る**（このファイルではない）

## 構造

| 範囲 | 種別 | 役割 |
|------|------|------|
| `00`〜`04` | **プロダクト仕様** | なぜ・何を作るか。プロダクト全体像、ユーザーモデル、外部連携の業務フロー |
| **`05`〜`08`** | **実装規約**（基本これを読む） | コードをどう書くか。配置・データ層・コーディング・移植元 |
| **`09`** | **Gotchas**（罠を踏みそうな時に読む） | 過去のセッションでハマった落とし穴と対処 |

---

## 実装タスク → 必読 docs

実装系タスクは基本 `05`〜`08` から該当するものを読む。プロダクト仕様（00〜04）は **要件確認が必要なときだけ** 追加で読む。

| タスク種別 | 必読（05〜08） | 補足（00〜04） |
|---|---|---|
| 新規 feature を作る | `05_directory-structure.md`, `06_convex.md`, `07_coding-guidelines.md` | 該当機能の `01_product.md` / `02_account.md` |
| 既存 feature を編集 | `05_directory-structure.md`, `07_coding-guidelines.md` | （必要時のみ） |
| Convex の query / mutation / action 追加 | `06_convex.md`, `07_coding-guidelines.md` | — |
| 認証 / 権限の追加・変更 | `06_convex.md` §4-5, `07_coding-guidelines.md` | `04_login.md` |
| GitHub App / リポ解析 | `06_convex.md` §7, `05_directory-structure.md` | `03_github.md` |
| 技術スタック catalog / key / alias 設計 | `05_directory-structure.md` §4, `07_coding-guidelines.md` §2, `06_convex.md` §7 | `03_github.md` |
| 公開ページの実装（プロフィール / プロダクト詳細） | `05_directory-structure.md`, `06_convex.md` §5, `08_mockup.md` | `01_product.md`, `02_account.md` |
| mockup から 1 ページ移植 | **`migrate-page-from-mockup` スキルを使う** | — |
| UI コンポーネント実装 | `05_directory-structure.md`, `07_coding-guidelines.md`, `08_mockup.md` | — |
| フォーム実装 | `06_convex.md` §5（mutation）, `07_coding-guidelines.md` §6 | — |
| エラーハンドリング | `07_coding-guidelines.md` §7 | — |
| 型エラー解消 | `07_coding-guidelines.md` §1 | — |

---

## キーワード索引（05〜08）

### 配置・依存・コンポーネント分割

- 配置ルール（どこに何を置く） → `05_directory-structure.md` §4
- 依存方向 → `05_directory-structure.md` §3
- View / Content / Section → `05_directory-structure.md` §5
- Server Component vs Client Component → `05_directory-structure.md` §5, `07_coding-guidelines.md` §4
- features と shared / components の判断基準 → `05_directory-structure.md` §6
- ルート構造（`app/(public)/`, `app/(app)/`） → `05_directory-structure.md` §2

### Convex

- 接続セットアップ（Cloud / Deploy Key / .env.local 二重管理 / MCP） → `06_convex.md` §3.5
- スキーマ定義 → `06_convex.md` §3
- query / mutation / action の使い分け → `06_convex.md` §2
- 認証セットアップ（Convex Auth + GitHub） → `06_convex.md` §4
- middleware → `06_convex.md` §4.2
- `getCurrentUser` / `requireUser` → `06_convex.md` §4.3
- 公開 / 認証必須 / 所有者限定の権限分岐 → `06_convex.md` §5
- `preloadQuery` / `usePreloadedQuery` / `useMutation` → `06_convex.md` §6
- 外部 API（GitHub / OpenAI）呼び出し → `06_convex.md` §7

### コーディング

- `any` / `!` / `as` 禁止 → `07_coding-guidelines.md` §1
- 命名規則（ファイル / コンポーネント / hook / Convex） → `07_coding-guidelines.md` §2
- import 順 → `07_coding-guidelines.md` §3
- Tailwind の書き方 / `cn()` → `07_coding-guidelines.md` §5
- 技術スタック key / canonical catalog（`data/tech-stack.ts`） → `05_directory-structure.md` §4, `07_coding-guidelines.md` §2
- フォーム（react-hook-form + Zod） → `07_coding-guidelines.md` §6
- エラーハンドリング → `07_coding-guidelines.md` §7
- 共通の禁止事項 → `07_coding-guidelines.md` §10

### mockup（移植元）

- mockup の構成と役割 → `08_mockup.md` §1-2
- **既に整備済みの実装側リソース（技術カタログ / simple-icons import + 公式SVGロゴ / helper）** → `08_mockup.md` §1.1
- ページ一覧と公開度 → `08_mockup.md` §3
- HTML のセクション区切り → `08_mockup.md` §5
- セクション → コンポーネントのマッピング → `08_mockup.md` §5
- 移植方針 → `08_mockup.md` §6
- やってはいけないこと → `08_mockup.md` §8

---

## プロダクト仕様（00〜04）

実装で要件確認が必要な時に参照。

| ファイル | キーワード |
|---|---|
| `00_manifesto.md` | 思想、なぜ作るか、何をしないか |
| `01_product.md` | プロダクトページ、親子構造、AI アシスト |
| `02_account.md` | アカウント、個人 / Org、ユーザー統一モデル |
| `03_github.md` | GitHub App、技術スタック検出、リポ連携 |
| `04_login.md` | ログインフロー、username 同期、URL 設計 |

---

## 使い方（skills 向け）

1. このファイルを最初に読む
2. タスク種別から「必読 docs」を 1〜3 本に絞る
3. 必要なら「補足」を追加で読む
4. 既存コードの類似実装も探索してパターンを踏襲する
