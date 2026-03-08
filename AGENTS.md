# AIエージェント統合ガイド (AGENTS.md)

## 1. 中核原則: Single Source of Truth

このプロジェクトでは、一貫性と保守性を確保するため、すべての開発ルールとガイドラインを単一ファイルに集約しています。

**主要参照: `AI_DEVELOPMENT_RULES.md`**

すべてのAIエージェントは、以下について`AI_DEVELOPMENT_RULES.md`を**Single Source of Truth**として参照する必要があります:

- プロジェクト概要（KDDI Smart Drone Platform UI Theme）
- 技術スタック（MUI v7, Tailwind CSS v3, TypeScript, React, Storybook）
- プロジェクト構造
- 重要なコマンド
- コーディング規約とガイドライン
- 開発ワークフロー
- トラブルシューティング

## 2. このファイルの使用方法

この`AGENTS.md`ファイルは、汎用AIエージェント（例：OpenAI GPTモデル等）向けの軽量なエントリーポイントとして機能します。主な目的は、エージェントを正しい統一ドキュメントに導くことです。

## 3. AIエージェント向け指示

開発タスクを開始する際は、以下の手順に従ってください:

1. **最初に`AI_DEVELOPMENT_RULES.md`を読む。** これは必須です。
2. そのファイルからプロジェクトの中核原則、コマンド、構造を理解する。
3. Claude Code固有の設定については、`.claude/CLAUDE.md`を参照する。
4. 技術固有の詳細（MUI v7コンポーネント、Storybook、テーマカスタマイズ）については、`.claude/skills/`ディレクトリ内のSkillsを参照する。
   - `mui-v7-component.md` - MUI v7コンポーネント作成ガイド
   - `storybook-story.md` - Storybookストーリー作成ガイド
   - `theme-customization.md` - テーマカスタマイズガイド
5. 生成されるすべてのコードが`AI_DEVELOPMENT_RULES.md`に記載されたルールに厳密に準拠していることを確認する。

## 4. AI統合開発システム概要

このプロジェクトでは、複数のAIエージェントが協調して開発を進める統合システムを採用しています。

### 主要統合ポイント

1. **統一ルール管理**: 全AIエージェントが同一の開発原則に従う
2. **技術別専門化**: MUI v7、Tailwind CSS、Storybookなど各技術領域での最適化された支援
3. **品質保証自動化**: ESLintエラーゼロ、型安全性の徹底
4. **コンポーネント品質向上**: アクセシビリティ、レスポンシブデザインの自動チェック

### AIエージェントの役割

- **Claude Code**: メイン開発アシスタント、包括的なコンポーネント実装
- **Cursor**: IDE統合エージェント、インライン補完とリファクタリング支援
- **GitHub Copilot**: コード補完エージェント、パターン学習と提案
- **その他AI**: 汎用補完、コードレビュー、ドキュメント生成

## 5. 開発制約事項

### 必須遵守事項

- **絵文字使用禁止**: すべてのコード、コメント、コミットメッセージで絵文字を使用しない
- **日本語優先**: コメントとドキュメントは日本語、コードは英語
- **MUI v7新API使用**: Grid コンポーネントは `<Grid size={{ xs: 12 }}>` 形式を使用
- **TypeScript strict mode**: `any`型は原則禁止、厳密な型定義を実施
- **pnpm専用**: npmコマンドは使用禁止
- **ESLintエラーゼロ**: 全てのコードでLintエラーが無い状態を維持

### 禁止事項

- `any`型の使用（理由がある場合はコメントで明記）
- 古いMUI Grid API（`item xs={12}`形式）の使用
- npmコマンドの使用
- console.logの残存
- 絵文字の使用

## 6. 起動メッセージ

```text
KDDI Smart Drone Platform UI Theme用AIエージェントが起動しました。

【重要】すべての開発ルールは`AI_DEVELOPMENT_RULES.md`に集約されています。
このファイルがSingle Source of Truthです。作業前に必ず読んでください。

主要指示:
1. `AI_DEVELOPMENT_RULES.md`のガイドラインに厳密に従う。
2. ESLintエラーゼロを維持する。
3. MUI v7の新しいGrid APIを使用する。
4. TypeScript strict modeに準拠する。
5. 絵文字を一切使用しない。
6. 日本語コメント、英語コードを徹底する。

統一ルールに基づいて高品質なUIコンポーネント開発を進めます。
```

## 7. トラブルシューティング

### よくある問題

| 問題                           | 対処法                                                      |
| :----------------------------- | :---------------------------------------------------------- |
| **ルールが分からない**         | `AI_DEVELOPMENT_RULES.md`を確認してください                 |
| **MUI v7のAPIが不明**          | `.claude/skills/mui-v7-component.md`を参照してください      |
| **Storybookの書き方が不明**    | `.claude/skills/storybook-story.md`を参照してください       |
| **テーマカスタマイズ方法不明** | `.claude/skills/theme-customization.md`を参照してください   |
| **型エラーが解決できない**     | TypeScript strict modeの設定とAI_DEVELOPMENT_RULES.mdを確認 |

## 8. 参考リンク

- [AI_DEVELOPMENT_RULES.md](./AI_DEVELOPMENT_RULES.md) - 統一開発ルール
- [.claude/CLAUDE.md](./.claude/CLAUDE.md) - Claude Code専用設定
- [.claude/skills/](./.claude/skills/) - 技術別Skillsガイド
- [MUI v7 Documentation](https://mui.com/material-ui/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
