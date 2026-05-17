# コーディング規約

> 命名、型安全、import 順、Server/Client の使い分けなど、全実装で守る規約。

**関連ドキュメント:** [05_directory-structure.md](./05_directory-structure.md), [06_convex.md](./06_convex.md)

---

## 1. 型安全（絶対ルール）

- **`any` 禁止**。型がわからない時は `unknown` を使い、型ガードで絞る
- **`as` キャスト原則禁止**。Convex の `Id<"table">` 等の安全なキャスト以外は使わない
- **Non-null assertion (`!`) 禁止**。`if (!x) throw` で明示的に絞る
- **`@ts-ignore` / `@ts-expect-error` 禁止**。理由がある場合は `// @ts-expect-error: <理由>` で必ずコメント

## 2. 命名

| 対象 | 規則 | 例 |
|---|---|---|
| ファイル | kebab-case | `product-card.tsx`, `use-debounce.ts` |
| コンポーネント | PascalCase | `ProductCard`, `ProfileView` |
| hook | `use*` で始める | `useDebounce`, `useProduct` |
| Convex 関数 | camelCase | `getProfile`, `updateProduct` |
| Convex テーブル | 複数形 lowercase | `users`, `products`, `techStacks` |
| Zod スキーマ | `*Schema` 接尾辞 | `productInputSchema` |
| 型 / interface | PascalCase | `Product`, `ProfileFormValues` |
| 定数 | SCREAMING_SNAKE_CASE | `MAX_PRODUCTS`, `TECH_DOMAINS` |

### 技術スタック key

`data/tech-stack.ts` の `technology.key` は Quine 全体の canonical ID。DB、URL、UI、GitHub 解析、編集フォームで同じ key を使う。

- 形式は lowercase ASCII の安定 slug
- 基本は `snake_case`。ただし固有名として定着しているものは詰めてよい（例: `nextjs`, `nodejs`, `vuejs`, `postgresql`）
- 言語系は URL / DB で扱いやすい slug にする（例: `csharp`, `cpp`, `objective_c`）
- 表示名（例: `Next.js`）や依存名（例: `next`）に引っ張られない
- 解析用 alias は canonical key へ寄せる。alias 側も `TechnologyKey` 型で存在チェックする
- 生の string key を feature / Convex / logo helper に散らさない

例:

```typescript
{
  key: "nextjs",
  name: "Next.js",
}
```

### 特殊な接尾辞

- `*View.tsx` … server component の入口
- `*Content.tsx` … client component の本体
- `*Section.tsx` … 部分 UI

## 3. import 順

上から順に空行を 1 つ挟んで並べる。

```typescript
// 1. React / Next.js
import { useState } from "react";
import Link from "next/link";

// 2. 外部ライブラリ
import { z } from "zod";
import { format } from "date-fns";

// 3. Convex
import { api } from "@convex/_generated/api";
import { useMutation, usePreloadedQuery } from "convex/react";

// 4. lib / hooks / contexts
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// 5. components（共通）
import { Button } from "@/components/ui/button";

// 6. features（同一 or 他 feature）
import { ProductCard } from "@/features/products/components/ProductCard";

// 7. 相対 import
import { LocalHelper } from "./LocalHelper";
```

## 4. Server / Client の使い分け

### Server Component（デフォルト）

- `*View` は必ず server
- データ取得（`preloadQuery`）はここでやる
- `useState` / `useEffect` を使わない

### Client Component（`"use client"`）

- `*Content` は client
- インタラクション、フォーム、状態管理
- ファイル先頭に `"use client";`
- できる限りツリーの **末端** で `"use client"` する。親まで client にしない

### 判断基準

| やりたいこと | どちら |
|---|---|
| データ取得して表示 | Server（`*View`） |
| ユーザー入力、ボタン操作 | Client（`*Content`） |
| `useQuery` でリアルタイム購読 | Client |
| アニメーション、スクロール検知 | Client |
| metadata、generateMetadata | Server |

## 5. Tailwind の書き方

### クラスの並び

`prettier-plugin-tailwindcss` に任せる（自動ソート）。手で並びを気にしない。

### `cn()` で条件分岐

```typescript
import { cn } from "@/lib/utils";

<div className={cn(
  "rounded-md border px-4 py-2",
  isActive && "border-primary bg-primary/10",
  disabled && "opacity-50 pointer-events-none",
  className,  // Props 由来は最後
)} />
```

### 禁止

- `style={{ ... }}` のインライン CSS（dynamic な値で必要な場合のみ可）
- `!important` （Tailwind の `!` プレフィックスも避ける）
- グローバル CSS への追加（`globals.css` は最小限）

## 6. フォーム

- **react-hook-form + Zod resolver** を使う
- Zod スキーマは `features/<feature>/schema.ts` に置く
- shadcn/ui の `<Form>` を使うと統一できる

## 7. エラーハンドリング

- **mutation / action のエラーは `throw new Error(...)` で投げる**
- Client 側で `try/catch` してトーストや UI で通知する
- 「失敗しても無視して続ける」コードを書かない

```typescript
"use client";
import { useMutation } from "convex/react";
import { useToast } from "@/hooks/use-toast";

const update = useMutation(api.products.updateProduct);
const { toast } = useToast();

async function onSubmit(values) {
  try {
    await update(values);
    toast({ title: "保存しました" });
  } catch (e) {
    toast({ title: "失敗しました", variant: "destructive" });
  }
}
```

## 8. ログ

- Server / Convex 側: `console.error` のみ許可。`console.log` 禁止
- Client 側: 開発中の `console.log` は許可するが、コミット前に消す
- `lib/logger.ts` を入れたら全面それを使う

## 9. コメント

- **基本書かない**。コードと識別子で意図を表す
- 例外: なぜそうしているかの **WHY**（GitHub の rate limit を回避するため等）
- TODO は `// TODO: <理由> by <担当>` 形式

## 10. 共通の禁止事項

- `as any`、`!`（non-null assertion）、`@ts-ignore`
- `useEffect + fetch` での初期データ取得（`preloadQuery` を使う）
- `app/` 直下にビジネスロジック
- `features/` 内から他の `features/` の private な内部にアクセス（公開 export 経由のみ）
- `convex/` 内で外部の `features/` を import
- グローバル状態を Context や Zustand で持つ前に、Convex の `useQuery` で済まないか検討

## 11. チェックリスト

- [ ] `any` / `!` / `as` を使っていない
- [ ] `import` 順がルール通り
- [ ] `*Content` の末端で `"use client"` している（親に上がっていない）
- [ ] mutation エラーが try / catch で UI 通知されている
- [ ] `useEffect + fetch` で初期取得していない
- [ ] `tsc --noEmit` がエラー 0
