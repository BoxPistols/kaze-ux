# Dev Docs

このドキュメントは柔軟に適時更新していきます。

**最終更新**: 2026-02-02 - Gemini AIレビュー統合完了

## 基本環境構築

### .env ファイルの配置

```sh
cp -p .env.example .env
```

### pnpm

```sh
# npmを使ってpnpmをグローバルにインストール
npm install -g pnpm

# または Macの場合、Homebrewを使用
brew install pnpm
```

#### pnpm Docs

[pnpm Official](https://pnpm.io/)
[pnpm Installation](https://pnpm.io/installation)

### ESLint と Prettier のインストール

```sh
# プロジェクトに ESLint と Prettier を追加
pnpm add -D eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

### 依存パッケージのインストール

```sh
pnpm install
```

## Scripts

```json
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,scss}\"",
    "lint": "eslint \"src/**/*.{ts,tsx,js,jsx}\" --fix",
    "fix": "pnpm run lint && pnpm run format",
    "preview": "vite preview",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "build-all": "pnpm run build && pnpm run build-storybook",
    "prepare": "husky install"
  },
```

### 主なターミナル実行コマンド

#### ローカル開発サーバを起動

```sh
pnpm dev
```

#### Lintチェック

```sh
pnpm lint
```

#### ファイルの整形と自動改善

```sh
pnpm fix
```

#### プロダクション用ビルド

```sh
pnpm run build
```

#### Storybook

```sh
pnpm storybook
```

## テスト環境

このプロジェクトでは **Vitest** を使用したコンポーネントテスト環境を構築しています。

### テスト実行コマンド

| コマンド              | 説明                                 |
| --------------------- | ------------------------------------ |
| `pnpm test`           | 基本的なテスト実行（watch モード）   |
| `pnpm test:run`       | 1回だけテスト実行                    |
| `pnpm test:ui`        | Vitest UI でテスト実行               |
| `pnpm test:coverage`  | カバレッジ付きテスト実行             |
| `pnpm test:all`       | カバレッジ + HTMLレポート + 詳細ログ |
| `pnpm test:all:ui`    | UI付きフルテスト                     |
| `pnpm test:all:watch` | watchモードでフルテスト              |

### テスト対象コンポーネント

- **CustomSelect**: セレクトフィールドコンポーネント
- **CustomTextField**: テキストフィールドコンポーネント
- **ユーティリティ関数**: 各コンポーネントのヘルパー関数

### テスト環境の特徴

- **Vitest + JSDOM**: React コンポーネントテスト環境
- **カバレッジ測定**: v8プロバイダーによる高精度なカバレッジ
- **型安全性**: TypeScript strict モードでの厳格な型チェック
- **MUI対応**: Material-UI コンポーネントのテスト最適化
- **クリーンな出力**: 警告抑制とシンプルなレポート

### テスト結果

- **テストファイル**: 3個
- **テストケース**: 23個 (全て成功)
- **カバレッジ**: 平均84%以上
- **実行時間**: 約2.5秒

詳細なテスト仕様については [TESTING.md](./TESTING.md) を参照してください。

### Node 管理

Node.jsのバージョン管理にはVoltaを推奨します

```sh
# install Volta
$ curl https://get.volta.sh | bash
# or
$ brew install volta
$ volta setup
$ cat ~/.zshrc（各自の環境ファイル）

export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"

```

#### Volta ドキュメント

- [Volta のインストールと使い方 #Node.js - Qiita](https://qiita.com/YoshinoriKanno/items/1a41b840a68dea2fb7e7)
- <https://volta.sh/>
- [brew install volta](https://formulae.brew.sh/formula/volta)

## 自動整形

### VSCode 拡張ツール

- ESLint <https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint>
- Prettier <https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode>
- ErrorLens <https://marketplace.visualstudio.com/items?itemName=usernamehw.errorlens>
- MarkdownLint <https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint>
- 他 .vscode/extensions.json 参照

VSCode 拡張検索枠に @recommended を入力すると、この開発環境に必要な拡張機能が表示されます

![Code 2024-07-10 20 59 57](https://github.com/BoxPistols/react-drone-vite/assets/10333049/518a259e-09eb-43cc-8e3b-9b841226fcaa)

#### VSCode 設定

基本的に上記拡張ツールを入れると使えるはずですが、`Cmd + S`で自動整形されない、動かない場合は以下を確認

- `Cmd + Shift + P` 「フォーマット」
- フォーマットを Prettier に選択、既定ツールにする
- `Cmd + ,（カンマ）`
- ワークスペース
- Format On Save をオン

### 運用

#### コミット・プッシュ前に

- `pnpm run fix`で全ファイル一括整形+自動改善可能なものは自動改善
- この操作を習慣づけることで個々の書式による差分がなくなり、エラー検知も常時行える
- 動的な箇所の変更などで挙動やデプロイの懸念がある場合は`pnpm run build`を実行し、エラーが無いか確認する

↑

##### husky にて自動化

もし`git commit`を実行した時に自動で`pnpm run fix`が走らなければ Local に husky が入っていません。その時は以下の操作をして husky を入れてください

```sh
pnpm run prepare
# or
pnpm add -D husky
pnpm dlx husky install
chmod -R +x .husky
```

pnpm、`git commit`を実行して`pnpm run fix`が走っているか確認してください

## React + TypeScript + Vite + ESLint + Prettier

- [React 公式ドキュメント](https://ja.react.dev/blog/2023/03/16/introducing-react-dev/)：React の基本概念、チュートリアル、API リファレンスなど
- [TypeScript ハンドブック](https://www.typescriptlang.org/)：TypeScript の言語機能、ベストプラクティス、サンプルコードなど
- [Vite 公式ドキュメント](https://ja.vitejs.dev/)：Vite の設定、プラグイン、ビルドオプションなど
- [ESLint 公式ドキュメント](https://eslint.org/)：ESLint の設定、ルール、プラグインなど
- [Prettier 公式ドキュメント](https://prettier.io/)：Prettier の設定、オプション、インテグレーションなど

---

## Theme Packageインストール方法

このパッケージはGitHub Packagesで公開されています。以下の手順でインストールできます。

### 1. 認証設定

`.npmrc`ファイルをプロジェクトのルートに作成し、以下の内容を追加します：

```bash
@kddi-smartdrone-dev:registry=https://npm.pkg.github.com/
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

GitHub Personal Access Tokenを環境変数として設定するか、直接`.npmrc`ファイルに記載してください。

### 2. パッケージのインストール

```sh
pnpm add @kddi-smartdrone-dev/sdpf-theme
```

### 3. 使用方法

```jsx
import { ThemeProvider, Button } from '@kddi-smartdrone-dev/sdpf-theme'

function App() {
  return (
    <ThemeProvider>
      <Button variant='contained'>クリック</Button>
    </ThemeProvider>
  )
}
```

詳細な公開手順は[PUBLISHING.md](./PUBLISHING.md)を参照してください。

## GitHub Pages デプロイ

デザイナー向けの確認環境として、GitHub Pagesへのデプロイ機能を提供しています。

### デプロイスクリプト

| コマンド                          | 説明                                           |
| --------------------------------- | ---------------------------------------------- |
| `pnpm build:gh-pages`             | Dev環境のビルド（gh-pages/に出力）             |
| `pnpm build:gh-pages:storybook`   | Storybookのビルド（gh-pages/storybook/に出力） |
| `pnpm build:gh-pages:all`         | Dev環境 + Storybook両方のビルド                |
| `pnpm build:gh-pages:inject-auth` | 認証スクリプトの注入（CI用）                   |

### 自動デプロイ

mainブランチへのマージで、GitHub Actionsが自動的にGitHub Pagesへデプロイします。

詳細な設定方法は [docs/GITHUB_PAGES.md](./docs/GITHUB_PAGES.md) を参照してください。

## 飛行計画フロー

本アプリケーションは、ドローン飛行の計画から監視までを一貫して管理します。

```
申請管理 (/planning/applications)
    │ DIPS/FISS申請・ワークフロー管理
    ↓ 申請承認後
飛行前準備 (/planning/preflight)
    │ 気象・機体・許可・デコンフリクション・クルー確認
    ↓ 全チェック完了後
飛行監視 (/monitoring/:flightId)
    │ リアルタイム飛行監視
    ↓ 飛行終了後
飛行後確認 (/postflight/:flightId)
    │ ログ・データ確認
    ↓
飛行記録 (/records)
    履歴・ログ・メディア管理
```

### 主要ページ

| ページ       | パス                     | 説明                               |
| :----------- | :----------------------- | :--------------------------------- |
| プロジェクト | `/project`               | プロジェクト管理                   |
| マップ       | `/map`                   | Waypoint・エリア・禁止区域管理     |
| 申請管理     | `/planning/applications` | DIPS/FISS申請・ワークフロー管理    |
| 飛行前準備   | `/planning/preflight`    | 飛行前チェックリスト（5タブ構成）  |
| 飛行監視     | `/monitoring`            | リアルタイム飛行監視ダッシュボード |
| 飛行記録     | `/records`               | 飛行履歴・ログ管理                 |
| スケジュール | `/schedule`              | カレンダー・スケジュール管理       |

## ドキュメント

### プロジェクトドキュメント

- [プロジェクトドキュメント](./docs/) - 包括的なプロジェクトドキュメント
  - [飛行前準備機能仕様](./docs/04-features/preflight-check.md) - 飛行前チェック機能の詳細仕様
  - [UTM要件定義書](./docs/04-features/utm-requirements.md) - UTMプロトタイプの網羅的な要件定義
  - [UI改善実装ログ](./docs/04-features/ui-improvements-2026-02.md) - 最近のUI改善とバグ修正
  - [運航監視アラート機能](./docs/04-features/monitoring-alerts.md) - アラート機能の詳細ガイド
  - [コーディングルール](./docs/05-coding-rules/) - MUI v7 Gridコンポーネントの使用ルール
  - [テスト環境](./TESTING.md) - テスト環境構築とテスト実装の詳細
  - [GitHub Pages デプロイ](./docs/GITHUB_PAGES.md) - GitHub Pagesへのデプロイ設定

### AI統合開発環境

- **開発ルール**
  - [AI_DEVELOPMENT_RULES.md](./AI_DEVELOPMENT_RULES.md) - 全開発ルールの統一ドキュメント（SSOT）
  - [.claude/CLAUDE.md](./.claude/CLAUDE.md) - Claude Code専用設定

- **MCP（Model Context Protocol）**
  - [MCP_SETUP.md](./.claude/MCP_SETUP.md) - MCPサーバーのインストールガイド
  - [MCP_STATUS.md](./.claude/MCP_STATUS.md) - 現在のMCP設定状況と分析
  - [MCP_USAGE_GUIDE.md](./.claude/MCP_USAGE_GUIDE.md) - MCP活用の実践ガイド

- **AI Code Review**
  - [GEMINI_SETUP_GUIDE.md](./.claude/GEMINI_SETUP_GUIDE.md) - Gemini AIレビューのセットアップ手順
  - [ai-review.yml](./.github/workflows/ai-review.yml) - OpenAIレビュー設定
  - [gemini-dispatch.yml](./.github/workflows/gemini-dispatch.yml) - Geminiレビュー設定

### 利用可能なMCPサーバー

現在、以下のMCPサーバーが稼働中です：

- **mui-mcp**: Material-UI v7の公式ドキュメント参照
- **serena**: セマンティックコード分析とインテリジェント編集
- **storybook**: Storybookコンポーネントとの連携
- **context7**: 最新のライブラリドキュメントを動的に取得
- **chrome-devtools**: ブラウザパフォーマンス診断とデバッグ
- **pencil**: デザインツール統合

詳細は [MCP_STATUS.md](./.claude/MCP_STATUS.md) を参照してください。

## 最近の更新

### 2026年2月 - UI改善とバグ修正

#### スケジュールページ (`/schedule`)

- ✨ カレンダービューのレイアウト最適化（画面スペースの有効活用）
- ✨ テーブルビューにフィルター機能追加（種別・ステータス）
- ✨ 実際に動作するソート機能を実装
- ✨ ページネーション機能追加（10/25/50/100件表示）
- ✨ カードビューのスクロール対応

#### モニタリングページ (`/monitoring`)

- ✨ アラートパネルの統合（UTMEnhancedAlertPanel）
- 🐛 サイトフィルタリング機能（現在監視中のドローンのアラートのみ表示）
- ✨ アラートクリック時のドローン自動選択

#### プロジェクトページ (`/project`)

- ✨ アコーディオン機能追加（今日の予定・よく使うプロジェクト）
- ✨ LocalStorageで開閉状態を永続化
- ✨ デフォルトで閉じた状態でテーブルを優先表示

詳細は [UI改善実装ログ](./docs/04-features/ui-improvements-2026-02.md) を参照してください。
