# AI Architect — 設計ドキュメント

## 概要

Kaze Design System は「人間にも AI にも読める」デザインシステムを目指す。
melta-ui の4層アーキテクチャを参考に、MUI + React ベースで再構成した。

## 参考: melta-ui (https://github.com/tsubotax/melta-ui)

Tailwind CSS ベースの AI-Ready Design System。フレームワーク非依存。
以下の4層構造で AI エージェントへの情報提供を最適化している。

## Kaze での4層構造

```
層1: CLAUDE.md（エントリーポイント）
  └── Quick Reference: ブランドカラー・フォント・スペーシング・コンポーネント使用例
  └── タスク別読み込みガイド: どのファイルをどの順序で読むか
  └── 禁止パターン要約

層2: foundations/（設計基盤）
  └── design_philosophy.md: Core Belief + 7 Principles
  └── prohibited.md: 30+項目の禁止パターン（ID付き構造化）
  └── ai-architect.md: この設計ドキュメント

層3: metadata/（機械可読データ）
  └── components.json: 20+コンポーネントのメタデータ
       variants, sizes, accessibility, prohibited, sample
  └── design-tokens/tokens.json: W3C DTCG 形式トークン（既存）

層4: IDE統合
  └── .cursor/rules/*.mdc: Cursor IDE 向け DS ルール
  └── （将来）MCP サーバー: トークン検索・ルールチェック
```

## 層1: CLAUDE.md

**目的**: AI エージェントが最初に読むファイル。このファイルだけで単体 UI 生成が可能。

**構成**:

- Project Overview（技術スタック）
- Key Rules（コード規約）
- Commands（pnpm スクリプト）
- Project Structure
- **AI Architect セクション**
  - Quick Reference: ブランドカラー・フォント・スペーシング・角丸
  - コンポーネント使用例（tsx コードブロック）
  - タスク別読み込みテーブル
  - 禁止パターン要約
  - 機械可読データの一覧

**設計判断**: melta-ui は CLAUDE.md に全コンポーネントの Tailwind クラスをインラインで定義（約500行）。
Kaze では MUI の `sx` prop ベースのため、代わりにコンポーネント使用例を tsx で記載。

## 層2: foundations/

### design_philosophy.md

7原則を定義:

1. **Token-First** — ハードコード値禁止
2. **Semantic Naming** — 意味ベースの命名
3. **Multi-Scheme** — Light/Dark + 複数スキーム
4. **Accessibility by Default** — WCAG 2.1 AA
5. **AI-Ready** — 機械可読データ提供
6. **Storybook as Knowledge Base** — AI チャット搭載
7. **Product-Proven** — 2プロダクトで実証

### prohibited.md

ID付きの構造化禁止パターン。7カテゴリ:

| カテゴリ         | 件数 | 例                                     |
| ---------------- | ---- | -------------------------------------- |
| コンポーネント   | 8    | C01: React.FC禁止, C02: 旧Grid API禁止 |
| カラー           | 4    | K01: ハードコード色値禁止              |
| タイポグラフィ   | 3    | T01: px直書き禁止                      |
| スペーシング     | 2    | S01: 奇数px禁止                        |
| レイアウト       | 3    | L01: position:fixed禁止                |
| アクセシビリティ | 4    | A01: aria-label必須                    |
| AI生成パターン   | 4    | AI01: カラーバー装飾禁止               |

**設計判断**: melta-ui は76項目。Kaze は MUI ベースのため、MUI 固有の禁止事項（旧 Grid API 等）を追加し、
Tailwind 固有の項目（`text-black` 等）は MUI のセマンティックトークンに置換。

## 層3: metadata/

### components.json

各コンポーネントに以下を定義:

```json
{
  "button": {
    "name": "Button",
    "category": "UI",
    "path": "src/components/ui/Button.tsx",
    "description": "CVAベースのボタン",
    "variants": [
      "default",
      "destructive",
      "outline",
      "secondary",
      "ghost",
      "link"
    ],
    "sizes": ["default", "sm", "lg", "icon"],
    "accessibility": ["focus-visible:ring", "disabled:opacity-50"],
    "prohibited": ["React.FC使用禁止"],
    "sample": "<Button variant='outline' size='sm'>Click</Button>"
  }
}
```

**設計判断**: melta-ui は HTML サンプルを `htmlSample` フィールドで提供。
Kaze は React JSX なので `sample` フィールドに tsx を記載。

### design-tokens/tokens.json（既存）

W3C DTCG 形式。`pnpm export-tokens` で MUI テーマから自動生成。
`npx system-design-export --from mui` でも生成可能（Phase 2 CLI）。

## 層4: IDE 統合

### .cursor/rules/

2ファイル:

- `kaze-design-system.mdc`: コード規約・MUI ルール・禁止パターン要約
- `color-system.mdc`: セマンティックカラー一覧・使い方・グレースケール

**設計判断**: melta-ui は3ファイル（全体ルール・カラー・コンポーネントクラス）。
Kaze は MUI テーマ経由でカラーが解決されるため、コンポーネントクラス一覧は不要。

### MCP サーバー（Phase 2）

melta-ui は `@modelcontextprotocol/sdk` で4ツールを提供:

- `get_token`: トークン検索
- `get_component`: コンポーネント仕様取得
- `check_rule`: 禁止パターンチェック
- `search`: 全文検索

Kaze では既存の ChatSupport（Storybook 内 AI チャット）が類似機能を持つが、
MCP サーバーとして外部 AI エージェントに公開する構成は未実装。

## melta-ui との差異

| 観点               | melta-ui                          | Kaze                         |
| ------------------ | --------------------------------- | ---------------------------- |
| フレームワーク     | なし（HTML + Tailwind）           | React + MUI                  |
| コンポーネント定義 | Tailwind クラス + HTML サンプル   | React JSX + MUI sx prop      |
| トークン           | 独自 JSON (value/tailwind/cssVar) | W3C DTCG 形式                |
| AI チャット        | なし                              | Storybook 内 ChatSupport     |
| MCP サーバー       | 実装済み（4ツール）               | 未実装（Phase 2）            |
| デザインファイル   | Pencil (.pen)                     | Figma Plugin (System Design) |
| スキル             | /design-review, /ban-pattern      | 未実装（Phase 2）            |
| Storybook          | なし                              | v10（AI チャット搭載）       |
| プロダクト実証     | サンプル12画面                    | SaaS Dashboard + KazeEats    |
