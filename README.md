# Kaze Design System

MUI + Tailwind CSS + Storybook で構築したデザインシステム。
コンポーネント・デザイントークン・テーマを統一し、プロダクト開発の品質と速度を両立します。

## Products

同じコンポーネントとトークンで開発したプロダクト:

| Product            | Description                                         |
| ------------------ | --------------------------------------------------- |
| **Storybook**      | コンポーネントカタログ・デザインガイド・AI チャット |
| **SaaS Dashboard** | CRUD・データテーブル・カレンダー・マップ            |
| **KazeEats**       | レストラン検索・カート・注文フロー                  |

## Quick Start

```bash
pnpm install

# Storybook
pnpm storybook

# 全アプリ一括起動（LP + SaaS + UberEats）
pnpm dev:all
```

## Claude AI Architecture

AI エージェント（Claude Code, Cursor 等）がデザインシステムの情報にアクセスし、
準拠したコードを生成するための 4 層構造。

```
層1: CLAUDE.md
  └── Quick Reference + タスク別読み込みガイド
  └── コンポーネント使用例・禁止パターン要約

層2: foundations/
  ├── design_philosophy.md   7つの設計原則
  ├── prohibited.md          30+ 禁止パターン（ID付き構造化）
  └── ai-architect.md        設計ドキュメント

層3: metadata/ + design-tokens/
  ├── components.json        コンポーネントメタデータ（variants, sizes, accessibility, sample）
  └── tokens.json            W3C DTCG 形式デザイントークン

層4: MCP + Skills + IDE Rules
  ├── mcp/                   MCP サーバー（4ツール + 3リソース）
  ├── .claude/skills/        Claude Code スキル
  └── .cursor/rules/         Cursor IDE ルール
```

### MCP Server

Claude Code / Cursor 等の AI エージェントがプログラマティックにアクセス:

```bash
# .mcp.json で自動接続
get_token("color.light.primary.main")     → #0EADB8
get_component("button")                   → variants, sizes, sample
check_rule("<IconButton><X /></IconButton>") → A01: aria-label なし
search("spacing")                         → トークン横断検索
```

### Skills

| Skill               | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `/design-review`    | ファイルを DS ルールに照合し違反を検出・重大度分類           |
| `/create-component` | 新コンポーネントの scaffold（ファイル + Story + メタデータ） |
| `/sync-tokens`      | テーマ → tokens.json → Figma Plugin 一括同期                 |

### Cursor Rules

`.cursor/rules/` に DS ルール・カラーシステムを配置。
Cursor でのコード生成時に自動で参照される。

## Storybook AI Chat

Storybook の各ページにコンテキスト認識型 AI チャットを搭載。

- **ページ文脈認識**: 現在表示中のコンポーネントについて自動で回答
- **ペルソナ検出**: デザイナー / エンジニアの語彙に応じて回答スタイルを切替
- **オフライン FAQ**: API キーなしでも Fuse.js ファジー検索で動作
- **指示語解決**: 「このUI何？」→ 現在のページのコンポーネントを特定
- **マルチモデル**: OpenAI + Gemini デュアル対応

構築ガイド: [docs/guides/storybook-ai-chat-guide.md](docs/guides/storybook-ai-chat-guide.md)

## Figma Plugin

「System Design」— W3C DTCG 形式の JSON を Figma Variables / Styles / ComponentSet としてインポート。

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

## Project Structure

```
src/
  components/          UI コンポーネント
  stories/             Storybook ストーリー
  themes/              MUI テーマ・デザイントークン定義
  pages/               LP
  utils/               ユーティリティ
apps/
  saas-dashboard/      SaaS Dashboard デモ
  ubereats-clone/      KazeEats デモ
packages/
  system-design-export/ CLI ツール
mcp/                   MCP サーバー
figma-plugin/          Figma プラグイン
foundations/           設計基盤（禁止パターン・設計思想）
metadata/              機械可読メタデータ
design-tokens/         W3C DTCG トークン JSON
docs/                  ガイド・リファレンス
```

## Design Tokens

W3C DTCG 形式。カラー・タイポグラフィ・スペーシング・シャドウ・角丸・ブレークポイントをカバー。

```bash
# 生成
pnpm export-tokens

# 出力
design-tokens/tokens.json
```

## Commands

| Command                   | Description            |
| ------------------------- | ---------------------- |
| `pnpm dev`                | LP 開発サーバー        |
| `pnpm storybook`          | Storybook              |
| `pnpm dev:all`            | 全アプリ一括起動       |
| `pnpm test`               | テスト                 |
| `pnpm lint`               | ESLint                 |
| `pnpm format`             | Prettier               |
| `pnpm export-tokens`      | トークン生成           |
| `pnpm figma-plugin:build` | Figma プラグインビルド |
| `pnpm build-storybook`    | Storybook ビルド       |

## Brand

- **Primary**: `#0EADB8`（ティール）
- **Font**: Inter + Noto Sans JP
- **Grid**: 4px 基準
- **Dark**: Dracula / Kaze / Monotone の 3 スキーム

## License

MIT
