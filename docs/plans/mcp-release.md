# Kaze Design System MCP 版リリース — 要件定義・詳細設計

> [uber.design/base-mcp](https://uber.design/base-mcp)（Uber Base Design System の MCP 配布）に
> ならい、Kaze Design System を **MCP サーバーとして外部リリース**するための計画書。
> 横断アーキテクチャ全体は [`DESIGN.md`](../../DESIGN.md) を参照。

## 1. リサーチ要約

### 1.1 Uber Base MCP / uSpec から学ぶこと

| 観点             | Uber のやり方                                                                         | Kaze への適用                                                       |
| ---------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 提供単位         | デザインシステムの知識（トークン・コンポーネント仕様・使用例）を MCP ツールとして供給 | 既に `mcp/` で同型を実装済み（v0.1.0）                              |
| 典型ツール       | `search_components` / `get_component_props` / `get_usage_examples` / `list_tokens`    | `search` / `get_component` / `get_token` / `check_rule` が対応      |
| 導入体験         | 1 コマンド（`aifx mcp add code-mcp`）で Claude Code / Cursor に登録                   | `npx kaze-mcp` + `.mcp.json` スニペット、Plugin なら `/plugin` 1 回 |
| データの置き場所 | 専有データはローカルに留める（Figma Console MCP はローカル WebSocket）                | データはリポジトリ内の生成物。ネットワーク不要の stdio サーバー     |
| 上位レイヤ       | MCP の上に Skills Registry（共有スキル + 評価）を重ねる                               | Claude Code Plugin（skills / agents / hooks + MCP）を重ねる         |
| 紹介ページ       | uber.design/base-mcp で「何ができるか・どう入れるか」を 1 ページで説明                | Storybook `Guide/MCP Server` ページを新設                           |

業界のデザインシステム MCP は「**トークン参照 / コンポーネント仕様 / ルール検証 /
横断検索**」の 4 機能に収斂している。Kaze の既存 4 ツールはこの型に一致しており、
**不足しているのはコードではなく配布とドキュメント**である。

### 1.2 Kaze の現状資産

- `mcp/` — `@kaze-ux/mcp-server` v0.1.0。4 ツール + 3 リソース、計 634 行の thin server
- データはすべて生成物: `design-tokens/tokens.json`（W3C DTCG）/ `metadata/components.json` / `foundations/prohibited.md`
- `DS_ROOT` 等の環境変数で **他リポジトリのデータに差し替え可能**（既実装）
- `pnpm check:mcp` が initialize → tools/list → tools/call まで実起動で検証
- `.claude/skills/` に 5 スキル、ESLint `kaze/ds-first`、`check:rules` 等の強制レイヤ

## 2. 要件定義

### 2.1 目的

Kaze Design System の知識を、**このリポジトリの外**にいる AI エージェント
（Claude Code / Cursor / その他 MCP クライアント）へ供給し、
プロダクトやリポジトリを横断しても一貫した UI コードが生成される状態を作る。

### 2.2 スコープ

| #   | 含む                                                                 | 含まない（今回は）                          |
| --- | -------------------------------------------------------------------- | ------------------------------------------- |
| 1   | MCP サーバーの配布整備（npm publish 準備・README・`.mcp.json` 手順） | npm への実 publish（メンテナが手動実行）    |
| 2   | MCP 紹介ページ（Storybook `Guide/MCP Server`）                       | 独立ドメインの専用サイト                    |
| 3   | Claude Code Plugin（skills / agents / hooks / MCP を同梱）           | 他エディタ（Cursor rules 等）専用パッケージ |
| 4   | `DESIGN.md`（横断アーキテクチャの単一ソース）                        | Figma プラグイン側の拡張                    |
| 5   | サーバー内部コードは**最低限の変更**に留める                         | 新ツールの大量追加・HTTP transport          |

### 2.3 ユースケース

- **UC-1 別リポジトリでの UI 生成**: プロダクト側リポジトリの `.mcp.json` に kaze-mcp を
  登録。AI が `get_component` / `get_token` を引きながら DS 準拠のコードを書く。
- **UC-2 生成コードのセルフチェック**: AI が書いたコードを `check_rule` に通し、
  C01（React.FC）等の違反を commit 前に自己修正する。
- **UC-3 Plugin 一括導入**: `/plugin marketplace add boxpistols/kaze-ux` →
  kaze-design プラグインを install。MCP + skills + review agent + hook が一度に入る。
- **UC-4 他社/他プロジェクト DS への転用**: `DS_ROOT` / `DS_TOKENS_PATH` 等で
  同形式のデータを持つ別 DS でもサーバーをそのまま使う。

### 2.4 機能要件

| ID   | 要件                                                                                    | 実現                                                                 |
| ---- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| FR-1 | 4 ツール（get_token / get_component / check_rule / search）と 3 リソースを stdio で提供 | 既存実装を維持                                                       |
| FR-2 | `npx` 一発で起動できる（ビルド済み配布物）                                              | `package.json` に `files` / `prepublishOnly` を追加、`bin: kaze-mcp` |
| FR-3 | 導入手順が 1 ページで完結する                                                           | `mcp/README.md` + Storybook `Guide/MCP Server`                       |
| FR-4 | Claude Code Plugin として skills / agents / hooks / MCP を同梱配布                      | `.claude-plugin/` + `skills/` + `agents/` + `hooks/`                 |
| FR-5 | 環境変数でデータ参照先を差し替え可能                                                    | 既存 `DS_ROOT` 系を README に明文化                                  |

### 2.5 非機能要件

| ID    | 要件                                                                            |
| ----- | ------------------------------------------------------------------------------- |
| NFR-1 | ネットワーク不要（stdio・ローカルファイル読みのみ）。専有データを外に出さない   |
| NFR-2 | `pnpm check:mcp` で実起動検証が通り続けること（CI 維持）                        |
| NFR-3 | サーバー本体の追加コードは最小（データが単一ソース、コードは読むだけ）          |
| NFR-4 | 生成物（tokens.json / components.json / prohibited.md）を手編集しない原則を維持 |

### 2.6 成功指標

- 別リポジトリで `.mcp.json` 3 行 + `npx` で kaze-mcp が動く
- Plugin 導入後、`/design-review` 相当のチェックが消費側リポジトリで機能する
- `pnpm ds:adoption` の準拠率が消費側プロダクトでも計測・改善できる状態

## 3. 詳細設計

### 3.1 全体アーキテクチャ

```
┌─ 利用層 ──────────────────────────────────────────────┐
│ Claude Code / Cursor / 任意の MCP クライアント          │
│   └ Claude Code Plugin (skills + agents + hooks + MCP) │
├─ 配布層 ──────────────────────────────────────────────┤
│ npm: kaze-mcp (npx 起動)  /  GitHub: plugin marketplace │
├─ サーバー層 ──────────────────────────────────────────┤
│ mcp/ @kaze-ux/mcp-server — 4 tools + 3 resources        │
│   thin server: データを読むだけ。ロジックを持たない     │
├─ データ層（単一ソース・すべて生成物）────────────────┤
│ design-tokens/tokens.json   ← pnpm export-tokens        │
│ metadata/components.json    ← pnpm export-metadata      │
│ foundations/prohibited.md   ← pnpm export-rules         │
└────────────────────────────────────────────────────────┘
```

設計原則: **知識はデータに、強制は仕組みに、コードは最低限に。**
サーバーに新機能が欲しくなったら、まずデータ側（生成物）に足せないかを検討する。

### 3.2 MCP サーバー（変更最小）

コードの変更は配布メタデータのみ。ツール・リソースの追加はしない。

- `mcp/package.json`
  - `files: ["dist"]`, `prepublishOnly: pnpm build`, `engines.node >= 20`
  - `repository` / `homepage` / `keywords`（npm ページからの導線）
  - 公開名は `kaze-mcp`（`npx kaze-mcp` の打ちやすさを優先、scope 無し）
  - **公開前の必須課題**: npm 配布物にはデータ層のファイルが含まれない。
    publish 前に tokens / components / rules を `mcp/data/` へ同梱し
    loader の既定パスをフォールバックさせる（Phase 2 で対応）
- `mcp/README.md`（新規）
  - Quick Start（Claude Code / Cursor / 汎用 client の 3 通り）
  - ツール・リソース・環境変数リファレンス
  - 他 DS への転用手順（`DS_ROOT` 差し替え）

導入スニペット（README / 紹介ページに掲載する正）:

```jsonc
// .mcp.json（消費側リポジトリ）
{
  "mcpServers": {
    "kaze": {
      "command": "npx",
      "args": ["-y", "kaze-mcp"],
    },
  },
}
```

### 3.3 MCP 紹介ページ（Storybook）

- 配置: `src/stories/00-Guide/McpServer.stories.tsx`、title `Guide/MCP Server`
- 構成（base-mcp の 1 ページ完結にならう）:
  1. Hero — 「AI エージェントに Kaze の設計知識を供給する」
  2. できること — 4 ツール + 3 リソースの表
  3. Quick Start — `.mcp.json` / `npx` スニペット（`CodeBlock` 使用）
  4. Plugin 導入 — `/plugin marketplace add boxpistols/kaze-ux`
  5. 仕組み — データ層/サーバー層/配布層の図解と `DESIGN.md` への導線
- 実装規約: 既存 `00-Guide` ページの CSF パターン（`docs: { page: null }`、
  `_shared/CodeBlock`）を踏襲。DS ルール（named export / no React.FC）準拠

### 3.4 Claude Code Plugin

レイアウトとスキーマの詳細は `DESIGN.md` が単一ソース。要点:

- `.claude-plugin/plugin.json` — plugin 本体（name: `kaze-design`）
- `.claude-plugin/marketplace.json` — このリポジトリ自体を marketplace 化
- `skills/`（plugin 配布用・消費側視点） / `agents/` / `hooks/` — repo ルートに配置
- MCP 同梱 — plugin の MCP 設定から `npx -y kaze-mcp` を起動
- 既存 `.claude/skills/`（リポジトリ内作業用）とは役割分離して共存

### 3.5 検証

| 対象               | 手段                                                     |
| ------------------ | -------------------------------------------------------- |
| MCP サーバー実起動 | `pnpm check:mcp`（initialize → tools/list → tools/call） |
| サーバーユニット   | `pnpm --filter kaze-mcp test`                            |
| Storybook ページ   | `pnpm build-storybook` + 既存 lint                       |
| Skills 構文        | `pnpm check:skills`                                      |
| DS ルール          | `pnpm check:rules` / `pnpm lint`                         |

### 3.6 リリース手順（Phase）

1. **Phase 1（この PR）**: 配布整備 + README + 紹介ページ + Plugin + DESIGN.md
2. **Phase 2**: npm publish（メンテナが `cd mcp && pnpm build && npm publish`）。
   紹介ページの「Coming soon」表記を外す
3. **Phase 3（将来）**: `get_usage_examples`（story コードの供給）、HTTP transport、
   Figma variables 連携。**いずれもデータ拡張が先、コード追加は最後**
