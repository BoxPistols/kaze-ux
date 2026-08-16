# Kaze Design System

MUI + Tailwind CSS + Storybook で構築したデザインシステム。

このプロジェクトが他と違うのは 2 点です。

**仕様を AI が読める形で配ります。** トークン・部品のメタデータ・禁止パターンを
機械可読な単一ソースから生成し、MCP サーバー経由で AI エージェントに渡します。
手で書いた一覧は必ず実装から遅れるので、**すべて生成物**にしています。

**「守られていること」を実測で検査します。** 規約を決めることと守られていることは
別物で、その差は毎回測ってはじめて分かりました。コントラスト・操作対象の寸法・
フォント・配布物の鮮度・MCP の稼働まで、実際に描画・起動して数えています
（[docs/verification.md](docs/verification.md)）。

> A React design system that ships its spec in a machine-readable form for AI agents,
> and verifies the rules are actually held by measuring rendered output.

---

## Tech Stack

| カテゴリ             | 技術                                                                         |
| -------------------- | ---------------------------------------------------------------------------- |
| UI フレームワーク    | [MUI v7](https://mui.com/) (Material UI)                                     |
| スタイリング         | [Tailwind CSS v3](https://tailwindcss.com/) + [Emotion](https://emotion.sh/) |
| 言語                 | TypeScript (strict mode)                                                     |
| ビュー               | React 18                                                                     |
| ドキュメント         | [Storybook 10](https://storybook.js.org/)                                    |
| ビルド               | Vite 5                                                                       |
| テスト               | Vitest + Testing Library                                                     |
| 状態管理             | Zustand                                                                      |
| パッケージマネージャ | pnpm (workspace)                                                             |
| デプロイ             | Vercel                                                                       |

## Products

同じコンポーネントとトークンで開発したプロダクト:

| Product            | Description                                         | パス          |
| ------------------ | --------------------------------------------------- | ------------- |
| **Storybook**      | コンポーネントカタログ・デザインガイド・AI チャット | `/storybook/` |
| **SaaS Dashboard** | CRUD・データテーブル・カレンダー・マップ            | `/saas/`      |
| **KazeEats**       | レストラン検索・カート・注文フロー                  | `/kaze-eats/` |
| **KazeLogistics**  | 配送監視・地図・リアルタイムダッシュボード          | `/sky-kaze/`  |

## Quick Start

```bash
pnpm install

# Storybook（コンポーネントカタログ）
pnpm storybook

# 全アプリ一括起動（LP + Storybook + SaaS + KazeEats + KazeLogistics）
pnpm dev:all

# 個別アプリ起動
pnpm dev              # LP
pnpm dev:dashboard    # SaaS Dashboard
pnpm dev:kaze-eats     # KazeEats
pnpm dev:sky-kaze     # KazeLogistics
```

## Architecture Overview

```
kaze-ux/
  src/
    components/        UI コンポーネント (ui/, Form/, Table/, Map*)
    stories/           Storybook ストーリー (6カテゴリ)
    themes/            テーマ定義 (colorToken, typography, breakpoints)
    layouts/           レイアウト (sidebar, header, settingDrawer)
    hooks/             カスタムフック
    contexts/          React Context
    store/             Zustand ストア
    services/          サービス層
    pages/             LP ページ
    types/             TypeScript 型定義
    utils/             ユーティリティ
  apps/
    saas-dashboard/    SaaS Dashboard アプリ
    kaze-eats/    KazeEats アプリ
    sky-kaze/          KazeLogistics アプリ
  packages/
    system-design-export/  CLI: テーマ → W3C DTCG トークン変換
  mcp/                 MCP サーバー (4ツール + 3リソース)
  figma-plugin/        Figma プラグイン「System Design」
  foundations/         設計基盤 (禁止パターン・設計思想)
  metadata/            機械可読メタデータ (components.json)
  design-tokens/       W3C DTCG トークン JSON
  docs/                ガイド・リファレンス
  .storybook/          Storybook 設定
  .claude/skills/      Claude Code スキル
  .cursor/rules/       Cursor IDE ルール
  scripts/             ビルド・自動化スクリプト
```

詳細なアーキテクチャ: [docs/architecture.md](docs/architecture.md)

## Theme System

マルチスキーム対応のテーマシステム。Light / Dark の各モードに 3 つのカラースキームを提供。

| スキーム     | Light              | Dark          | 特徴             |
| ------------ | ------------------ | ------------- | ---------------- |
| **Kaze**     | クールブルー系     | Zinc + ブルー | デフォルト       |
| **Dracula**  | 暖色パープル系     | 紫灰 + ブルー | コントラスト高め |
| **Monotone** | 低彩度ニュートラル | 最小彩度      | 目に優しい       |

- **プライマリカラー**: `#0057B8` (ブルー) — 白文字が 6.87:1 出る。単一ソースは `BRAND_BLUE`
- **フォント**: Inter + Noto Sans JP, baseFontSize = 14px
- **スペーシング**: 4px 基準 (`spacing(1)=4px`, `spacing(2)=8px`)
- **角丸**: デフォルト 8px (shape.borderRadius)
- **ブレイクポイント**: mobile(0) / tablet(768) / laptop(1366) / desktop(1920)

テーマ定義: `src/themes/colorToken.ts` / `src/themes/theme.ts`

## Component Design

### CVA ベース Button

Tailwind CSS + [CVA (class-variance-authority)](https://cva.style/) で構築した shadcn 風ボタン。MUI 非依存。

```tsx
<Button variant='outline' size='sm'>Click</Button>
<Button variant='destructive'>Delete</Button>
```

### MUI カスタマイズコンポーネント

MUI をベースにテーマトークンでカスタマイズしたコンポーネント群。

```tsx
<CustomTextField label='名前' required />
<CustomSelect label='都道府県' options={options} />
<ConfirmDialog open={open} onConfirm={handleConfirm} onCancel={handleCancel} />
```

### レイアウト

```tsx
<LayoutWithSidebar menuItems={items} appName='App'>
  <Grid size={{ xs: 12, sm: 6 }}>{content}</Grid>
</LayoutWithSidebar>
```

## Storybook AI Chat (ChatSupport)

Storybook の各ページにコンテキスト認識型 AI チャットを搭載。

- **ページ文脈認識**: 現在表示中のコンポーネントについて自動で回答
- **セマンティック検索**: OpenAI `text-embedding-3-small` による FAQ / StoryGuide / MUI 知識のベクトル検索
- **ペルソナ検出**: デザイナー / エンジニアの語彙に応じて回答スタイルを切替
- **オフライン FAQ**: API キーなしでも Fuse.js ファジー検索で動作
- **指示語解決**: 「このUI何?」→ 現在のページのコンポーネントを特定
- **マルチモデル**: OpenAI (GPT-5 系) + Gemini デュアル対応

構築ガイド: [docs/guides/storybook-ai-chat-guide.md](docs/guides/storybook-ai-chat-guide.md)

## Claude AI Architecture

AI エージェント（Claude Code, Cursor 等）がデザインシステムの情報にアクセスし、
準拠したコードを生成するための 4 層構造。

```
層1: CLAUDE.md
  └── Quick Reference + タスク別読み込みガイド
  └── コンポーネント使用例・禁止パターン要約

層2: foundations/
  ├── design_philosophy.md   7つの設計原則
  ├── prohibited.md          禁止パターン 20 件（生成物。強制手段つき）
  └── ai-architect.md        設計ドキュメント

層3: metadata/ + design-tokens/
  ├── components.json        部品 55 件の仕様（生成物。story が単一ソース）
  ├── tokens.json            W3C DTCG 形式デザイントークン（生成物）
  └── kaze-tokens.css        CSS 変数（生成物。MUI 不要）

層4: MCP + Skills + IDE Rules
  ├── mcp/                   MCP サーバー（4ツール + 3リソース）
  ├── .claude/skills/        Claude Code スキル
  └── .cursor/rules/         Cursor IDE ルール
```

### MCP Server

Claude Code / Cursor 等の AI エージェントがプログラマティックにアクセス:

```bash
# .mcp.json で自動接続（ビルド不要。tsx でソースから起動する）
get_token("color.light.primary.main")     → #0057B8
get_component("statCard")                 → variants, sizes, props, description
check_rule("<IconButton><X /></IconButton>") → A01: aria-label なし
search("spacing")                         → トークン横断検索
```

**登録されているだけで動かない状態を検出します。** `pnpm check:mcp` が実際に
initialize → tools/list → tools/call まで通し、返答が空でないことまで見ます。
以前はビルド成果物を指しており、clone した環境では起動しませんでした。

### Skills

| Skill               | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `/design-review`    | ファイルを DS ルールに照合し違反を検出・重大度分類           |
| `/create-component` | 新コンポーネントの scaffold（ファイル + Story + メタデータ） |
| `/sync-tokens`      | 生成物 4 つを作り直し、検査まで通す                          |

### Cursor Rules

`.cursor/rules/` に DS ルール・カラーシステムを配置。
Cursor でのコード生成時に自動で参照される。

## Figma Plugin

「System Design」 -- W3C DTCG 形式の JSON を Figma Variables / Styles / ComponentSet としてインポート。

- フレームワーク非依存（MUI / Tailwind / CSS Variables 何でも対応）
- Light / Dark モード統合（1コレクション2モード）
- Storybook リンク自動追加
- Figma Community 公開準備済み

詳細: [figma-plugin/README.md](figma-plugin/README.md)

## system-design-export CLI

テーマファイルから W3C DTCG トークン JSON を生成:

```bash
# MUI テーマから
npx system-design-export --from mui --input src/themes/theme.ts

# Tailwind config から
npx system-design-export --from tailwind --input tailwind.config.js
```

## Build & Deploy

### Vercel デプロイ

`vercel.json` + `scripts/vercel-build.mjs` で全アプリを統合ビルド:

```
dist/
  index.html        ← LP（sandbox モード）
  storybook/         ← Storybook
  saas/              ← SaaS Dashboard
  kaze-eats/          ← KazeEats
  sky-kaze/          ← KazeLogistics
```

### Vite ビルドモード

| モード       | 用途                    | コマンド                  |
| ------------ | ----------------------- | ------------------------- |
| Library      | npm パッケージ (ES/CJS) | `pnpm build`              |
| Sandbox      | LP ウェブアプリ         | `pnpm build-sandbox`      |
| GitHub Pages | GH Pages 静的サイト     | `pnpm build:gh-pages:all` |

## Design Tokens

**すべて生成物です。** 単一ソースは `src/themes/` と story で、手で編集しません。
CI が「再生成して差分が出ないこと」を検査するので、古いまま配られることはありません。

| 出力                            | 中身                                     | 誰が読むか                   | 生成                   |
| ------------------------------- | ---------------------------------------- | ---------------------------- | ---------------------- |
| `design-tokens/tokens.json`     | W3C DTCG 形式 553 トークン               | Figma / 外部ツール           | `pnpm export-tokens`   |
| `design-tokens/kaze-tokens.css` | CSS 変数 55 個 × 3 スキーム × light/dark | **MUI を使わないプロダクト** | `pnpm export-css`      |
| `metadata/components.json`      | 部品 55 件の仕様                         | MCP（AI エージェント）       | `pnpm export-metadata` |
| `foundations/prohibited.md`     | 禁止パターン 20 件と**その強制手段**     | 人と AI                      | `pnpm export-rules`    |

**どれか 1 つだけ再生成すると CI が落ちます。** `/sync-tokens` が 4 つまとめて回します。

### MUI 無しで使う

`design-tokens/kaze-tokens.css` は依存ゼロの 1 ファイルです。これを読み込めば
`--color-*` が揃い、Tailwind 側は `var(--color-primary)` を参照する形なので
`bg-primary-main` のようなクラスがそのまま通ります。MUI も Emotion も要りません。

手順は [design-tokens/README.md](design-tokens/README.md) にあります。
**その手順が本当に動くことを CI が検査しています**（README のコードブロックを
そのまま取り出し、kaze-ux を参照しないプロジェクトを組んで実ブラウザで描画色を測る）。

MUI 非依存で成立している範囲の定義は `scripts/ds-core.mjs` が単一ソースで、
ESLint と依存グラフ検査の両方が境界を守ります。

## Code Conventions

| ルール               | 詳細                                                              |
| -------------------- | ----------------------------------------------------------------- |
| **React.FC 禁止**    | `React.FC`, `FC`, `FunctionComponent` を使わない                  |
| **any 禁止**         | TypeScript strict mode。`any` 型は使用不可                        |
| **セミコロンなし**   | Prettier `semi: false`                                            |
| **シングルクォート** | `singleQuote: true`, `jsxSingleQuote: true`                       |
| **アロー関数**       | `const fn = () => {}` パターン                                    |
| **named export**     | `export const` を使用。default export は不使用                    |
| **MUI v7 Grid**      | `<Grid size={{ xs: 12 }}>` (新 API)。`<Grid item xs={12}>` は禁止 |
| **色はトークン参照** | ハードコード色値禁止。`primary.main` 等を使用                     |
| **ConfirmDialog**    | `window.confirm()` 禁止。`ConfirmDialog` コンポーネントを使用     |

禁止パターンの全量と**それぞれを何が強制しているか**:
[foundations/prohibited.md](foundations/prohibited.md)（生成物）

強制手段が無いルールは、表に「なし」と出ます。書いてあるだけで破っても
気づけないものを、書いてあるからという理由で守られている扱いにしません。

## Quality Gates

規約を決めることと守られていることは別物です。この差は毎回**測ってはじめて**
分かりました。CI が実際に描画・起動して数えます。

| 検査                           | 何を確かめるか                                               |
| ------------------------------ | ------------------------------------------------------------ |
| `pnpm check:a11y`              | 描画したコントラストと操作対象の寸法（138 story × 3 テーマ） |
| `pnpm check:typo`              | 描画したフォントサイズとウェイト                             |
| `pnpm check:css-vars`          | 配布 CSS が実ブラウザで意図どおり解決する                    |
| `pnpm check:tailwind-consumer` | README の手順で組んだ実プロジェクトに色が付く                |
| `pnpm check:mcp`               | 登録した MCP が起動して部品情報を返す                        |
| `pnpm check:ds-core`           | コアの依存グラフに UI ライブラリが無い                       |
| `pnpm check:rules`             | 禁止パターンが実際に守られている                             |
| `pnpm check:quickref`          | CLAUDE.md の値が実装と一致する                               |
| `pnpm ds:adoption`             | アプリが DS の部品を使っている割合                           |

**各検査は導入時に一度壊して赤くなることを確認しています。** 緑を見ただけでは
信用しません。詳しい経緯と、測って初めて分かったこと:
[docs/verification.md](docs/verification.md)

## Commands

| Command                   | Description            |
| ------------------------- | ---------------------- |
| `pnpm dev`                | LP 開発サーバー        |
| `pnpm storybook`          | Storybook              |
| `pnpm dev:all`            | 全アプリ一括起動       |
| `pnpm test`               | テスト (Vitest)        |
| `pnpm test:all`           | テスト + カバレッジ    |
| `pnpm lint`               | ESLint                 |
| `pnpm format`             | Prettier               |
| `pnpm fix`                | lint + format          |
| `pnpm export-tokens`      | tokens.json 生成       |
| `pnpm export-css`         | kaze-tokens.css 生成   |
| `pnpm export-metadata`    | components.json 生成   |
| `pnpm export-rules`       | prohibited.md 生成     |
| `pnpm figma-plugin:build` | Figma プラグインビルド |
| `pnpm build-storybook`    | Storybook ビルド       |

検査コマンドは [Quality Gates](#quality-gates) を参照してください。

## Brand

- **Primary**: `#0057B8`（ブルー）
- **Font**: Inter + Noto Sans JP
- **Grid**: 4px 基準
- **Dark**: Dracula / Kaze / Monotone の 3 スキーム

## License

MIT

---

## English Summary

Kaze UX is a modern React design system built with MUI v7, Tailwind CSS, and Storybook. It provides unified components, design tokens, and theming for consistent product development across multiple applications.

Key features:

- **Multi-scheme theming**: Light/Dark modes with 3 color schemes (Kaze, Dracula, Monotone)
- **AI-powered Storybook chat**: Context-aware ChatSupport with semantic search (OpenAI embeddings)
- **MCP integration**: Programmatic access to tokens, components, and rules for AI agents
- **Monorepo architecture**: Core library + 3 demo applications (SaaS Dashboard, KazeEats, KazeLogistics)
- **Figma plugin**: W3C DTCG token import to Figma Variables/Styles

For detailed architecture documentation in English, see [docs/architecture-en.md](docs/architecture-en.md).
