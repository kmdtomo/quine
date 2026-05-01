# mockup ディレクトリ

> `mockup/` は **デザインの真理値（source of truth）**。Quine の全ページの最終的な見た目・操作はここで定義されている。

**関連ドキュメント:** [05_directory-structure.md](./05_directory-structure.md)

---

## 1. mockup/ とは

- 純粋な **HTML + CSS + 一部 JS** で書かれた、Quine の全ページの完成形
- データはすべてハードコード（モック）
- フェーズ「mockup → Next.js 実装」の **左側の入力**として使う

## 1.1 既に整備済みの実装側リソース

mockup と一緒に使える、既に `apps/frontend/` `convex/` 側に揃っている資産。**新規作成しなくて良い**。

| リソース | 場所 | 内容 |
|---|---|---|
| 技術カタログ | `convex/seeds/technologies.ts` | 2955 行。カテゴリ（Language / Framework 等）→ technologies[] に key / name / description。Convex の seed として `techStacks` テーブルに流し込む |
| 技術スタックロゴ画像 | `apps/frontend/public/tech_stack_logo/*.png` | 628 ファイル。`<key>.png` の命名 |
| 技術名 → ロゴパス helper | `apps/frontend/lib/technology-logo.ts` | `getTechnologyLogo(techName)` で正規化された path を返す。`convex/seeds/technologies.ts` を参照 |

## 2. 構成

```
mockup/
├── common.css              # デザイントークン + リセット + ベース
├── components.css          # 全 UI パーツのスタイル（約 1300 クラス）
├── data/technologies.js    # 技術スタック定義のハードコード
├── header.js, lp.js, ...   # 一部のインタラクション JS
├── prism.js                # コードハイライト
├── notion-editor.js        # 簡易 WYSIWYG
├── assets/                 # 画像 / 技術スタックロゴ
└── *.html                  # 1 ページ = 1 ファイル
```

## 3. ページ一覧

| ファイル | 用途 | 公開度 |
|---|---|---|
| `lp.html` | ランディング | 公開 |
| `signup-github-app.html` | GitHub App インストール | 認証 |
| `signup-detecting.html` | リポ解析中 | 認証 |
| `signup-profile.html` | プロフィール初期設定 | 認証 |
| `users.html` | ユーザー一覧 | 公開 |
| `user-profile.html` | プロフィール（閲覧 + 編集モード切替） | 公開 + 所有者編集 |
| `products.html` | プロダクト一覧 | 公開 |
| `product-detail.html` | プロダクト詳細 | 公開 |
| `product-edit.html` | プロダクト編集 | 所有者のみ |
| `tech-stack-detail.html` | 技術スタック詳細 | 公開 |
| `tech-stack-edit.html` | 技術スタック編集 | 所有者のみ |

## 4. CSS 設計

### common.css

- `:root` に CSS 変数（カラー、フォント、スペーシング）
- リセット + body のベース

### components.css

- 約 1300 クラス。ページ単位ではなくコンポーネント単位で定義されている
- BEM 風命名: `.section-name__element--modifier`
- セクションコメント `/* ========== ComponentName ========== */` で区切り

## 5. HTML の構造ルール

各 HTML 内に下記コメントで責務分離されている。これを **コンポーネント分割の単位**として読む。

```html
<!-- ========== Header ========== -->
<!-- ========== HeroSection ========== -->
<!-- ========== ProductDetail ========== -->
<!-- ========== ProductCard ========== -->
```

| パターン | 移植先（features 内） |
|---|---|
| `{Name}Header` | feature の Header コンポーネント |
| `{Name}Form` | フォーム系 Section |
| `{Name}Card` | 単体カード（`*Section.tsx`） |
| `{Name}Grid` / `{Name}List` | リスト系 Section |
| `{Name}Filter` | フィルタ Section |
| `{Name}Detail` | 詳細表示 Section |
| `{Name}Modal` | shadcn Dialog で実装 |
| `{Name}Action` | CTA ボタン群 |

## 6. Next.js への移植方針

詳細は `migrate-page-from-mockup` skill を参照。要点だけ:

1. **HTML の `<!-- ========== ComponentName ========== -->` 区切りで `Section.tsx` に分割**
2. **CSS クラスを Tailwind に置換**（共通トークンは `tailwind.config.ts` の `theme.extend` に移す）
3. **shadcn primitive 適用**: Dialog / Popover / DropdownMenu / Tabs / Toast / Tooltip 等は shadcn に置換
4. **Quine 固有の見た目**（UserCard, TechStack, ProductCard 等）は Tailwind で自前実装
5. **モックデータを Convex query に置換**（`*View` で preload、`*Content` で `usePreloadedQuery`）
6. **インタラクション JS を React state / hook に置き換え**

## 7. 移植時のチェックリスト

- [ ] mockup の HTML / CSS と並べて見比べた
- [ ] セクションコメントの単位でコンポーネント分割した
- [ ] CSS 変数（`--color-primary` 等）を Tailwind config に移した
- [ ] `style="..."` のインライン CSS を Tailwind class に置換した
- [ ] shadcn で代替できる primitive を置き換えた
- [ ] モックデータ（`data/technologies.js`、HTML 内ベタ書き）を Convex 経由に変えた
- [ ] アクセシビリティを担保した（shadcn primitive 採用で大半は自動）

## 8. やってはいけないこと

- **mockup を直接編集して実装に流用する**: mockup は read-only で参照する
- **デザインを「シンプルに」勝手に変える**: mockup の見た目は確定済み。崩したい場合はユーザーに確認
- **components.css 全体を一括 import**: 必要なクラスだけ Tailwind に置換していく
