# AI開発ルール・ガイドライン (Single Source of Truth)

## AI開発モード開始通知

```text
KDDI Smart Drone Platform UI Theme - AI開発アシスタントが起動しました

【プロジェクト設定】
- プロジェクト名: KDDI Smart Drone Platform UI Theme
- 技術スタック: MUI v7, Tailwind CSS v3, TypeScript, React, Storybook
- 開発ルール: このファイル「AI_DEVELOPMENT_RULES.md」が全てのルールの単一情報源(Source of Truth)です。

【必須確認事項】
- ESLintエラーゼロでの実装
- MUI v7 の新しいGrid APIの使用
- TypeScript strict mode準拠
- 既存パターンの踏襲

【各AIツール向けドキュメント】
- Claude: .claude/CLAUDE.md を参照
- Cursor: .cursorrules を参照
- その他AI: AGENTS.md を参照

型安全性とコンポーネント品質を重視した開発を開始します。
```

## 1. プロジェクト概要

KDDI Smart Drone Platform のUIコンポーネントライブラリ・デザインシステム開発。

### 1.1. 技術スタック

- **UI Framework**: MUI v7 (Material-UI)
- **Styling**: Tailwind CSS v3
- **Language**: TypeScript (strict mode必須)
- **UI Library**: React
- **Documentation**: Storybook
- **Package Manager**: pnpm
- **Linting/Formatting**: ESLint, Prettier

### 1.2. プロジェクト構造

```bash
src/
├── components/     # 再利用可能なコンポーネント
├── stories/        # Storybookストーリー
├── themes/         # MUIテーマ設定
├── types/          # TypeScript型定義
└── utils/          # ユーティリティ関数
```

## 2. 重要なコマンド

| カテゴリ         | コマンド         | 説明                                         |
| :--------------- | :--------------- | :------------------------------------------- |
| **開発**         | `pnpm dev`       | 開発サーバーを起動します。                   |
|                  | `pnpm storybook` | Storybookを起動します。                      |
| **品質チェック** | `pnpm lint`      | ESLintルールに基づきコードをチェックします。 |
|                  | `pnpm format`    | Prettierでコードをフォーマットします。       |
|                  | `pnpm fix`       | lint + format を実行します。                 |
| **ビルド**       | `pnpm build`     | 本番用のビルドを生成します。                 |

## 3. 開発ルールとガイドライン

### 3.1. 基本原則

1. **ESLint準拠**: エラーゼロが必須です。
2. **型安全性の徹底**: TypeScriptの`strict`モードに準拠し、`any`型は原則禁止です。
3. **コンポーネント再利用**: 新規作成の前に、既存コンポーネントがないか必ず確認します。
4. **日本語優先**: ユーザー向けメッセージやコードコメントは日本語を基本とします。変数名・関数名は英語（camelCase）です。
5. **絵文字の使用禁止**: AI生成コードおよびコメントでの絵文字使用は原則禁止です。
6. **デフォルトブランチ**: プロジェクトのデフォルトブランチは `main` です。

### 3.2. MUI v7 コンポーネント実装規約

#### Grid コンポーネント

- **新しいAPI（必須）**: `<Grid size={{ xs: 12, sm: 6, md: 4 }}>`
- **古いAPI（非推奨）**: `<Grid item xs={12} sm={6} md={4}>` は使用しない

#### コンポーネントのprops型定義

**🚨 重要: React.FC / FC / FunctionComponent の使用は完全に禁止されています**

```typescript
// ✅ 良い例: 通常の関数定義と明確な型定義
interface UserCardProps {
  name: string
  email: string
  avatar?: string
  onEdit?: () => void
}

export const UserCard = ({ name, email, avatar, onEdit }: UserCardProps) => {
  // 実装
  return null
}

// ❌ 悪い例1: React.FC の使用（禁止）
import { FC } from 'react'
export const UserCard: FC<UserCardProps> = ({ name, email }) => {
  // React.FC は使用禁止
}

// ❌ 悪い例2: any型の使用
export const UserCard = (props: any) => {
  // any型は禁止
}
```

**React.FC を使用してはいけない理由:**

- 暗黙的な children の型定義により意図しない props が受け入れられる
- ジェネリック型の扱いに制約がある
- React 18+ で defaultProps のサポートが限定的
- React チームが React.FC の使用を推奨していない

**詳細は `.claude/skills/react-patterns/SKILL.md` を参照してください。**

### 3.3. 命名規則

- **ファイル名**: `camelCase` (例: `userCard.tsx`, `themeProvider.tsx`)
- **コンポーネント名**: `PascalCase` (例: `export const UserCard`, `export const ThemeProvider`)
- **Custom Hooks**: `use` + `PascalCase` (例: `useTheme`, `useBreakpoint`)
- **イベントハンドラー**: `handle` + 動詞 (例: `handleClick`, `handleChange`)
- **Boolean State**:
  - 状態確認: `is` + 形容詞 (例: `isOpen`, `isActive`, `isLoading`)
  - 所有確認: `has` + 名詞 (例: `hasError`, `hasData`)
  - 可能性: `can` + 動詞 (例: `canSubmit`, `canEdit`)
- **関数・変数**: `camelCase` (例: `getUserData`, `themeColors`)
- **定数**: `UPPER_SNAKE_CASE` (例: `MAX_WIDTH`, `DEFAULT_THEME`)

### 3.4. コーディングスタイル

- **インデント**: スペース2
- **行長**: 最大100文字
- **セミコロン**: 省略可（Prettierの設定に従う）
- **クォート**: シングルクォート (`'`) 優先
- **末尾カンマ**: オブジェクト・配列・TS型リストで必須
- **インポート**: 絶対パスを使用し、深い階層の相対パス (`../../`) は避けます。
- **関数**: アロー関数 (`const fn = () => {}`) を使用します。
- **エクスポート**: `export const` を使用

### 3.5. UI/UX開発指針

- **デザインシステム**: MUI v7のテーマシステムとTailwind CSSを最大限活用します。
- **スタイリング**: Tailwind CSSを優先し、カスタムCSSは最小限に留めます。
- **アクセシビリティ**: 適切な`role`や`aria-*`属性を設定し、キーボード操作を保証します。
- **レスポンシブデザイン**: モバイルファーストで設計し、すべてのブレークポイントで動作確認します。

### 3.6. パフォーマンス最適化

- **コンポーネント分割**: 大きなコンポーネントは小さく分割します。
- **遅延ローディング**: 必要に応じて`React.lazy`を活用します。
- **メモ化**: 高コストな計算は`useMemo`で、コールバックは`useCallback`でメモ化します。

### 3.7. Storybook 実装規約

- **ストーリー配置**: コンポーネントと同じディレクトリに `ComponentName.stories.tsx` を配置
- **バリエーション**: 主要な状態（デフォルト、ローディング、エラー等）のストーリーを用意
- **ドキュメント**: コンポーネントの使用方法を明確に記述
- **アクセシビリティチェック**: Storybook addon-a11yで確認

### 3.8. 避けるべきアンチパターン

- **🚨 `React.FC` / `FC` の使用**: 完全に禁止（ESLintでエラーになります）
- **`any`型の使用**: 基本的に禁止。使用する際は理由をコメントで明記
- **インラインスタイル**: Tailwind CSSまたはMUIのsx propを使用
- **console.logの残存**: デバッグ用のconsole.logはコミットしない
- **深いネスト**: コンポーネントのネストは最大4レベルまで

## 4. ワークフロー

### 4.1. 開発フローのチェックリスト

- **実装前**:
  - [ ] 既存コンポーネントに類似機能がないか確認
  - [ ] デザインシステムのトークンを確認
- **実装中**:
  - [ ] TypeScriptの`strict`モードに準拠
  - [ ] アクセシビリティを考慮
  - [ ] レスポンシブデザインを実装
- **実装後**:
  - [ ] `pnpm lint`でエラーがないことを確認
  - [ ] Storybookストーリーを作成
  - [ ] アクセシビリティチェックを実施

### 4.2. プルリクエストのガイドライン

- **PR作成前**: `pnpm lint`と`pnpm build`が成功することを確認
- **コミットメッセージ**: 日本語でConventional Commits形式に従う
  - 例: `feat: ユーザーカードコンポーネント追加`
  - 例: `fix: テーマカラーの型定義を修正`
  - 例: `docs: Storybookドキュメント更新`
- **Claudeのクレジット禁止**: コミットメッセージに「Generated with Claude Code」等を含めない
- **絵文字禁止**: コミットメッセージで絵文字を使用しない

## 5. AI駆動開発プロセス

### 5.1. AI統合開発の基本原則

すべてのAIエージェント（Claude、Cursor等）は以下のプロセスに従って作業を進めてください：

#### タスク分析と計画

1. **指示の分析**: 主要なタスクを簡潔に要約
2. **ルール確認**: このAI_DEVELOPMENT_RULES.mdを必ずチェック
3. **要件と制約の特定**: 重要な要件と制約を特定
4. **実行計画**: 具体的なステップと最適な実行順序を決定

#### 重複実装の防止

実装前に以下の確認を行ってください：

- 既存の類似コンポーネントの有無
- 同名または類似名の関数やコンポーネント
- 共通化可能な処理の特定

#### 品質管理と問題対応

- 各タスクの実行結果を迅速に検証
- エラーや不整合が発生した場合の対応プロセス
- Lintエラーの確認と修正

#### 最終確認と報告

- 成果物全体の評価
- 当初の指示内容との整合性確認
- 実装機能の重複確認

### 5.2. 重要な制約事項

- **明示的指示以外の変更禁止**: 指示されていない変更は提案として報告し、承認後に実施
- **デザイン変更の制限**: レイアウト・色・フォント・間隔等の変更は原則禁止
- **技術スタック固定**: MUI v7、Tailwind CSS v3等のバージョンを勝手に変更しない

### 5.3. パッケージ管理ルール

**pnpm専用**: npmコマンドは使用禁止

- **依存関係の追加**: `pnpm add <package>`
- **依存関係のインストール**: `pnpm install`
- **禁止事項**: `npm install`や`npm`コマンドの使用、`package-lock.json`の作成

## 6. Claude Code Skills

このプロジェクトには以下のカスタムSkillsが設定されています：

### 利用可能なSkills

1. **🚨 react-patterns** - Reactコンポーネント実装パターン（最重要）
   - **React.FC完全禁止ルール**
   - 推奨される代替パターン
   - TypeScript型定義のベストプラクティス
   - パフォーマンス最適化パターン

2. **mui-v7-component** - MUI v7コンポーネント作成ガイド
   - 新しいGrid APIの使用
   - TypeScript型定義（React.FC不使用）
   - Tailwind CSS統合
   - レスポンシブデザイン対応

3. **storybook-story** - Storybookストーリー作成ガイド
   - ストーリー構成
   - バリエーション定義
   - ドキュメント作成
   - アクセシビリティチェック

4. **theme-customization** - テーマカスタマイズガイド
   - カラーパレット設定
   - タイポグラフィ設定
   - ブレークポイント定義
   - コンポーネントスタイルカスタマイズ

Skillsは自動的に起動されます。詳細は`.claude/skills/`ディレクトリを参照してください。

## 7. AIエージェントへの特別指示

### Claude向け

- 包括的なコンポーネント実装を生成する
- TypeScript型定義を厳密に行う
- Storybookストーリーも同時生成する
- アクセシビリティを考慮した実装

### Cursor向け

- インライン補完を優先
- 既存パターンを学習して提案
- MUI v7の新しいAPIを使用

### その他のAI向け

- このAI_DEVELOPMENT_RULES.mdを必ず参照
- 絵文字使用禁止を徹底
- 日本語コメント、英語コードを遵守

## 8. CI/CD と AI レビュー設定

### 8.1. 自動品質チェック

PR作成時に以下のチェックが自動実行されます：

| ワークフロー          | 実行内容                                                   |
| :-------------------- | :--------------------------------------------------------- |
| `quality-check.yml`   | ESLint、TypeCheck、テスト実行、Storybookビルド             |
| `ai-review.yml`       | プロジェクトルールチェック、AI（OpenAI）レビュー           |
| `gemini-dispatch.yml` | Gemini AIによる自動レビュー（PRオープン時 + 手動トリガー） |
| `ci.yml`              | ビルド確認、Storybookビルド                                |

### 8.2. AI レビュー機能

#### プロジェクトルールチェック（自動実行）

以下の項目を自動的にチェックします：

- 🚨 **`React.FC` / `FC` / `FunctionComponent` の使用（最重要）**
- `any`型の使用
- 古いMUI Grid API（`Grid item`）の使用
- `console.log`の残存（テスト・ストーリーファイル除く）
- 絵文字の使用

#### OpenAI レビュー（オプション）

有効化するには以下のSecretsとVariablesを設定してください：

```bash
# GitHub Repository Settings > Secrets and variables > Actions

# Secrets
OPENAI_API_KEY=sk-xxx      # OpenAI APIキー

# Variables
ENABLE_AI_REVIEW=true      # OpenAIレビュー有効化
```

#### Gemini レビュー（推奨）

**プロジェクト固有のルールに特化した高精度レビュー**

Gemini AIによる自動コードレビュー機能が利用可能です。OpenAIレビューとは異なり、以下の特徴があります：

**特徴:**

- 🚨 **React.FC禁止**、**MUI v7新API**などプロジェクト固有ルールを最優先でチェック
- 📝 **日本語でのレビューコメント**で開発者に分かりやすいフィードバック
- 🎯 **重要度レベル付きコメント**（🔴 Critical、🟠 High、🟡 Medium、🟢 Low）
- 💡 **コード提案機能**でsuggestionブロックによる修正案を提示
- 🔄 **自動 + 手動トリガー**でPRオープン時の自動実行と`@gemini-cli`による手動実行が可能

**使用方法:**

1. **自動レビュー**: PRを開くと自動的に実行
2. **手動レビュー**: PRコメントで`@gemini-cli /review`を実行

**セットアップ:**

```bash
# GitHub Repository Settings > Secrets and variables > Actions

# Secrets（必須）
GEMINI_API_KEY=<your-api-key>  # Google AI Studioで取得

# Variables（オプション）
GEMINI_MODEL=gemini-2.0-flash-exp  # 使用するモデル
GEMINI_DEBUG=false                  # デバッグモードの有効化
```

**詳細なセットアップ手順:**

詳細は [.claude/GEMINI_SETUP_GUIDE.md](.claude/GEMINI_SETUP_GUIDE.md) を参照してください。

**OpenAI vs Gemini 比較:**

| 項目           | OpenAI Review      | Gemini Review              |
| :------------- | :----------------- | :------------------------- |
| **重点**       | 一般的なコード品質 | プロジェクト固有ルール     |
| **トリガー**   | 自動のみ           | 自動 + 手動                |
| **言語**       | 英語               | 日本語                     |
| **コード提案** | なし               | あり（suggestionブロック） |
| **重要度表示** | なし               | あり（🔴🟠🟡🟢）           |

**推奨**: 両方を有効化して多角的なレビューを実現することを推奨します。

### 8.3. GitHub Copilot 設定

#### Copilot Instructions

`.github/copilot-instructions.md`にプロジェクト固有の指示が記載されています。

#### Copilot 除外設定

`.copilotignore`に以下のファイルが除外設定されています：

- 依存関係（`node_modules/`）
- ビルド成果物（`dist/`, `build/`）
- 環境設定ファイル（`.env*`）
- 自動生成ファイル（`*.min.js`, `*.d.ts`）

### 8.4. レビュー設定ファイル

`.github/ai-review-config.json`でレビュー設定をカスタマイズできます：

```json
{
  "rules": {
    "typescript": {
      "noAnyType": { "enabled": true, "severity": "error" }
    },
    "mui": {
      "useNewGridApi": { "enabled": true, "severity": "error" }
    }
  }
}
```

### 8.5. マルチAIエージェント活用

| AIエージェント     | 役割                     | 設定ファイル                      |
| :----------------- | :----------------------- | :-------------------------------- |
| Claude Code        | メイン開発アシスタント   | `.claude/CLAUDE.md`               |
| GitHub Copilot     | IDE内コード補完          | `.github/copilot-instructions.md` |
| Cursor             | リファクタリング・型修正 | `.cursorrules`                    |
| OpenAI (PR Review) | PRコードレビュー         | `.github/ai-review-config.json`   |

### 8.6. AI 自動修正機能

PRのコメントに以下のコマンドを入力すると、AIによる自動修正が実行されます。

#### 利用可能なコマンド

| コマンド            | 説明                             |
| :------------------ | :------------------------------- |
| `/fix all`          | 全ての問題を自動修正             |
| `/fix typescript`   | TypeScript型エラーを自動修正     |
| `/fix lint`         | ESLint/Prettierで自動修正        |
| `/fix security`     | セキュリティ脆弱性を修正         |
| `/fix performance`  | パフォーマンス問題を分析・報告   |
| `/resolve-conflict` | マージコンフリクトをAIで自動解決 |

#### 自動修正の対象

**TypeScript型修正 (`/fix typescript`)**

- `any`型の適切な型への置換
- 型の不整合の修正
- missing property エラーの修正
- 型アサーションの改善

**Lint修正 (`/fix lint`)**

- ESLint自動修正可能なエラー
- Prettierフォーマット
- import順序の整理
- 未使用変数の警告

**セキュリティ修正 (`/fix security`)**

- 依存関係の脆弱性更新（pnpm audit --fix）
- 危険なパターンの検出・警告

**パフォーマンス分析 (`/fix performance`)**

- useEffect依存配列の問題検出
- インラインオブジェクト生成の検出
- メモ化欠如の指摘

**コンフリクト解決 (`/resolve-conflict`)**

- AIによるマージコンフリクトの自動解決
- 両方の変更を統合した解決案の生成
- 手動解決が必要な場合の通知

#### 自動修正の有効化

```bash
# GitHub Repository Settings > Secrets and variables > Actions

# Secrets（必須）
OPENAI_API_KEY=sk-xxx    # OpenAI APIキー（GPT-4oを使用）
```

#### ワークフロー構成

```
ai-review.yml          → 問題検出・レビュー → 自動修正コマンド提示
      ↓
ai-auto-fix.yml        → /fix コマンド検出 → AI自動修正実行
      ↓
conflict-resolver.yml  → コンフリクト検出 → AI自動解決
```

## 9. トラブルシューティング

| 問題                      | 対処法                                                 |
| :------------------------ | :----------------------------------------------------- |
| **型エラーが発生する**    | TypeScript strict modeの設定を確認してください。       |
| **Lintエラーが出る**      | `pnpm lint:fix`で自動修正を試してください。            |
| **Storybookが起動しない** | `pnpm install`で依存関係を再インストールしてください。 |
| **ビルドが失敗する**      | `pnpm build`のエラーメッセージを確認してください。     |

## 10. 参考資料

- [MUI v7 Documentation](https://mui.com/material-ui/)
- [MUI Grid Documentation](https://mui.com/material-ui/react-grid/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Claude Code Skills Documentation](https://code.claude.com/docs/en/skills)
- [Claude Code MCP Documentation](https://code.claude.com/docs/en/mcp)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
