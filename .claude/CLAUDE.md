# Claude Code 設定

## 基本方針

このファイルはClaude Code専用の設定ファイルです。

**重要**: すべての開発ルールは `AI_DEVELOPMENT_RULES.md` に集約されています。
Claude Codeで開発を行う際は、まず `AI_DEVELOPMENT_RULES.md` を確認してください。

## 参照ドキュメント

1. **最重要**: `../AI_DEVELOPMENT_RULES.md` - 全開発ルールの単一情報源（SSOT）
2. **Skills**: `./skills/` - MUI v7、Storybook、Themeカスタマイズガイド
3. **MCP設定**: `./MCP_SETUP.md` - Model Context Protocolの設定ガイド

## Claude Code 起動メッセージ

```text
Claude Code for KDDI Smart Drone Platform UI Theme が起動しました

【プロジェクト情報】
- プロジェクト名: KDDI Smart Drone Platform UI Theme
- 技術スタック: MUI v7, Tailwind CSS v3, TypeScript, React, Storybook
- デフォルトブランチ: main

【必須確認事項】
- 統一ルール: AI_DEVELOPMENT_RULES.md を必ず参照
- 🚨 React.FC完全禁止: React.FC / FC / FunctionComponent は使用禁止
- MUI v7新API: <Grid size={{ xs: 12 }}> 形式を使用
- 絵文字使用禁止: すべてのコード、コメント、コミットメッセージで禁止
- 日本語優先: コメントとドキュメントは日本語、コードは英語
- TypeScript strict mode: any型は原則禁止
- pnpm専用: npmコマンドは使用禁止

【利用可能なSkills】
1. 🚨 react-patterns - React実装パターン（React.FC禁止ルール）
2. mui-v7-component - MUI v7コンポーネント作成
3. storybook-story - Storybookストーリー作成
4. theme-customization - テーマカスタマイズ

統一ルールに基づいて開発を開始します。
```

## Claude Code 固有の推奨事項

### 開発タスク実行時

1. **タスク分析**: まず `AI_DEVELOPMENT_RULES.md` でプロジェクトルールを確認
2. **既存コンポーネント確認**: 類似機能が既存コンポーネントにないか確認
3. **Skills活用**: 該当する技術領域のSkillsガイドを参照
4. **品質チェック**: 実装後に必ず `pnpm lint` を実行

### コード生成の原則

- **🚨 React.FC完全禁止**: React.FC / FC / FunctionComponent は絶対に使用しない
- **包括的実装**: エッジケースを考慮した実装
- **型安全性**: TypeScript strict modeに完全準拠
- **アクセシビリティ**: ARIA属性とキーボード操作を考慮
- **レスポンシブ**: すべてのブレークポイントで動作確認
- **Storybook同時生成**: コンポーネントと同時にストーリーを生成

### コミット時の注意

- **日本語メッセージ**: Conventional Commits形式で日本語使用
  - 例: `feat: ボタンコンポーネント追加`
  - 例: `fix: テーマカラーの型エラー修正`
- **Claudeクレジット禁止**: 「Generated with Claude Code」等を含めない
- **絵文字禁止**: コミットメッセージで絵文字を使用しない

## プロジェクト構造

```bash
sdpf-theme/
├── AI_DEVELOPMENT_RULES.md    # 統一開発ルール（SSOT）
├── .claude/                    # Claude専用設定
│   ├── CLAUDE.md              # このファイル
│   ├── MCP_SETUP.md           # MCP設定ガイド
│   └── skills/                # カスタムSkills
│       ├── mui-v7-component/
│       ├── storybook-story/
│       └── theme-customization/
├── .cursorrules               # Cursor設定
├── AGENTS.md                  # 汎用AIエージェント向け
├── src/
│   ├── components/            # UIコンポーネント
│   ├── stories/               # Storybookストーリー
│   ├── themes/                # MUIテーマ設定
│   ├── types/                 # TypeScript型定義
│   └── utils/                 # ユーティリティ関数
└── package.json
```

## 重要なコマンド

```bash
# 開発
pnpm dev        # 開発サーバー起動
pnpm storybook  # Storybook起動

# 品質チェック
pnpm lint       # ESLintチェック
pnpm format     # Prettierフォーマット
pnpm fix        # lint + format

# ビルド
pnpm build      # 本番ビルド
```

## MCP (Model Context Protocol) 設定

このプロジェクトでは以下のMCPサーバーが設定されています:

- **serena**: コードベース検索・編集支援
- **storybook**: Storybook統合
- **mui-mcp**: MUIドキュメント参照
- **context7**: ライブラリドキュメント取得
- **chrome-devtools**: ブラウザデバッグ支援

詳細は `./MCP_SETUP.md` を参照してください。

## Claude Code Skills

### 🚨 1. react-patterns（最重要）

Reactコンポーネント作成時に必ず参照してください。

- **React.FC / FC / FunctionComponent 完全禁止**
- 推奨される代替パターン
- TypeScript型定義のベストプラクティス
- ジェネリック型を使用するコンポーネント
- パフォーマンス最適化パターン

### 2. mui-v7-component

MUI v7コンポーネント作成時に自動的に起動されます。

- 新しいGrid APIの使用
- TypeScript型定義の厳密化（React.FC不使用）
- Tailwind CSS統合パターン
- レスポンシブデザイン実装

### 3. storybook-story

Storybookストーリー作成時に自動的に起動されます。

- ストーリー構成のベストプラクティス
- バリエーション定義（デフォルト、ローディング、エラー等）
- ドキュメント自動生成
- アクセシビリティチェック統合

### 4. theme-customization

テーマカスタマイズ時に自動的に起動されます。

- カラーパレット定義
- タイポグラフィ設定
- ブレークポイント定義
- コンポーネントスタイルのオーバーライド

## 技術スタック詳細

### MUI v7

- **Grid API**: `<Grid size={{ xs: 12, sm: 6, md: 4 }}>` 形式を使用
- **Theme**: カスタムテーマは `src/themes/` で管理
- **コンポーネント**: `sx` prop または Tailwind CSS でスタイリング

### Tailwind CSS v3

- **統合**: MUI と Tailwind CSS の併用
- **優先順位**: Tailwind CSS を優先、MUIコンポーネント固有スタイルはsx propで

### TypeScript

- **strict mode**: 必須
- **any型禁止**: 使用する場合は理由をコメントで明記
- **型定義**: `src/types/` で管理

### Storybook

- **配置**: コンポーネントと同階層に `.stories.tsx` ファイル
- **バリエーション**: 主要な状態を網羅
- **ドキュメント**: 使用方法を明確に記述

## トラブルシューティング

| 問題                         | 対処法                                                            |
| :--------------------------- | :---------------------------------------------------------------- |
| **React.FC使用エラー**       | React.FC を削除し通常の関数定義に変更                             |
| **型エラー**                 | TypeScript strict mode設定を確認                                  |
| **Lintエラー**               | `pnpm lint:fix` で自動修正                                        |
| **Storybookが起動しない**    | `pnpm install` で依存関係を再インストール                         |
| **MUI Grid APIエラー**       | 新しいAPI `size={{ xs: 12 }}` を使用                              |
| **pre-commitでReact.FC検出** | .claude/skills/react-patterns/SKILL.md を参照して修正してください |

## 参考資料

- [AI_DEVELOPMENT_RULES.md](../AI_DEVELOPMENT_RULES.md) - 統一開発ルール
- [MUI v7 Documentation](https://mui.com/material-ui/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
