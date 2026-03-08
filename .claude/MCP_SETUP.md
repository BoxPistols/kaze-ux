# MCP（Model Context Protocol）設定ガイド

このドキュメントは、KDDI Smart Drone Platform UI Theme プロジェクトに推奨されるMCPサーバーの設定方法を説明します。

## 推奨MCPサーバー

このプロジェクトでは以下のMCPサーバーが特に有用です：

1. **MUI-MCP** - Material-UI v7の公式ドキュメントアクセス（必須）
2. **Storybook-MCP** - Storybookコンポーネントとの連携（必須）
3. **Context7** - 最新のライブラリドキュメントを動的に取得（推奨）
4. **Serena** - セマンティックコード分析とインテリジェント編集（推奨）
5. **Chrome DevTools MCP** - ブラウザパフォーマンス診断とデバッグ（推奨）
6. **Figma-MCP** - Figmaデザインからコード生成（オプション）

---

## 1. MUI-MCP（必須）

### 概要

Material-UI v7の50以上のReactコンポーネントに関する最新ドキュメントへ即座にアクセスできます。

### インストール

**プロジェクトスコープ（推奨）**：

```bash
claude mcp add mui-mcp -- npx -y @mui/mcp@latest
```

**ユーザースコープ（全プロジェクトで利用）**：

```bash
claude mcp add mui-mcp -s user -- npx -y @mui/mcp@latest
```

### 利用可能なツール

- `list_components` - コンポーネント一覧を取得
- `get_component_info` - 特定コンポーネントの詳細情報
- `search_components` - コンポーネントを検索
- `get_customization_guide` - カスタマイズガイド
- `get_setup_guide` - セットアップガイド
- `get_mui_guide` - MUIガイド

### 使用例

```text
プロンプト: "Grid v7の新しいsizeプロパティの使い方を教えて"
プロンプト: "Buttonコンポーネントのカスタマイズ方法は？"
```

### 注意事項

- レスポンスが25000トークンを超える場合があるため、具体的なコンポーネント名を指定することを推奨

---

## 2. Storybook-MCP（必須）

### 概要

Storybookインスタンスと連携し、コンポーネント、ストーリー、プロパティ、スクリーンショットにAIがアクセスできるようにします。UIコンポーネント開発で自動的にストーリーを生成します。

### インストール

#### コミュニティ実装（推奨）

Storybook v8では公式MCPアドオンが含まれていないため、コミュニティ実装を使用します。

```bash
claude mcp add storybook -- npx -y mcp-storybook@latest --storybook-dir $(pwd)/.storybook
```

**注意**：

- Storybookディレクトリの絶対パスを指定する必要があります
- Storybook v9以降では公式MCPアドオンが提供される予定
- 実際の導入手順は [MCP_INSTALLATION_GUIDE.md](.claude/MCP_INSTALLATION_GUIDE.md) を参照

### 利用可能な機能

- コンポーネント一覧の取得
- ストーリー情報の取得（パラメータ、args、props定義）
- スクリーンショット自動キャプチャ
- 自動ストーリー生成とリンク

### 使用例

```text
プロンプト: "Buttonコンポーネントの全バリエーションをStorybookで確認して"
プロンプト: "新しいCardコンポーネントのストーリーを生成して"
プロンプト: "Formコンポーネントのスクリーンショットを取得"
```

### ワークフロー

1. UIコンポーネントを作成
2. AIが自動的にストーリーを生成・リンク
3. 各状態を視覚的に確認
4. ドキュメントとコンポーネントテストを提供

---

## 3. Context7（推奨）

### 概要

バージョン固有の最新ドキュメントとコード例を公式ソースから動的に取得します。

### インストール

**APIキーなし（基本機能）**：

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

**APIキーあり（フル機能）**：

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key YOUR_API_KEY
```

または、HTTPトランスポート：

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp --header "CONTEXT7_API_KEY: YOUR_API_KEY"
```

### 使用例

プロンプトに `use context7` を追加：

```text
"React hooksのTypeScript使用方法を教えて。use context7"
"Tailwind CSS v3の最新機能は？use context7"
```

### APIキー取得

1. [Upstash Console](https://console.upstash.com/)でアカウント作成
2. Context7 APIキーを生成

---

## 4. Serena（推奨）

### 概要

セマンティックコード理解とインテリジェント編集機能を提供する強力なAIコーディングエージェント。

### 前提条件

`uv` パッケージマネージャーが必要：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env
```

### インストール

**プロジェクトスコープ（推奨）**：

```bash
claude mcp add serena -- /Users/ai/.local/bin/uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd) --enable-web-dashboard False
```

**ユーザースコープ（全プロジェクトで利用）**：

```bash
claude mcp add serena -- /Users/ai/.local/bin/uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --enable-web-dashboard False
```

**重要**: `--enable-web-dashboard False` オプションを追加してダッシュボードを無効化してください。

### 特徴

- コードをgrep検索するのではなく、意味を理解
- 「ユーザー認証はどこで処理される？」といった抽象的な質問に回答
- 変数名が異なっても関連するコードを発見

### ダッシュボードについて

- デフォルトでは <http://127.0.0.1:24282/dashboard/index.html> が起動
- Claude Codeでは不要なため無効化を推奨
- 詳細は [SERENA_GUIDE.md](.claude/SERENA_GUIDE.md) を参照

### 使用例

```text
プロンプト: "テーマのカスタマイズロジックはどこにある？"
プロンプト: "Material-UIコンポーネントの型定義を見つけて"
```

---

## 5. Chrome DevTools MCP（推奨）

### 概要

AIコーディングアシスタントにChrome DevToolsの機能を導入し、ブラウザのパフォーマンス診断とデバッグを可能にします。

### インストール

```bash
claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
```

### 主な機能

- **パフォーマンス分析**: LCP、FCP等のCore Web Vitals測定
- **ネットワーク診断**: CORS問題やネットワークエラーの特定
- **コンソール検査**: ブラウザのログを分析
- **ユーザー行動シミュレーション**: ナビゲーション、フォーム入力、クリック実行
- **DOM/CSS検査**: ライブページのスタイリングとレイアウト問題の診断

### 使用例

```text
プロンプト: "Please check the LCP of web.dev."
プロンプト: "このページのCORS問題を診断して"
プロンプト: "コンソールエラーを確認して"
```

---

## 6. Figma-MCP（オプション）

### 概要

Figmaデザ インをAIツールと連携し、デザインからコードを生成できます。

### インストール方法

#### リモートサーバー（推奨）

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

**認証手順**：

1. Claude Codeで `/mcp` と入力
2. `figma` を選択
3. `Authenticate` を選択
4. `Allow Access` をクリック

#### デスクトップサーバー（Figmaアプリ必要）

**前提条件**：

- Figmaデスクトップアプリをインストール
- 最新バージョンに更新

**設定手順**：

1. Figmaデスクトップアプリを開く
2. デザインファイルを開く
3. Dev Mode（Shift + D）に切り替え
4. Inspect パネルのMCP serverセクションで "Enable desktop MCP server" をクリック

**インストールコマンド**：

```bash
claude mcp add --transport http figma-desktop http://127.0.0.1:3845/mcp
```

### 使用例

```text
プロンプト: "この[Figma URL]のボタンコンポーネントをMUIで実装して"
プロンプト: "Figmaデザインのカラーパレットをtheme.tsに反映して"
```

---

## MCP管理コマンド

### サーバー一覧

```bash
claude mcp list
```

### サーバー詳細確認

```bash
claude mcp get <サーバー名>
```

### サーバー削除

```bash
claude mcp remove <サーバー名>
```

### 設定確認

```bash
cat ~/.config/claude/mcp.json  # Linux/macOS
```

---

## トラブルシューティング

### MCPサーバーが認識されない

1. Claude Codeを再起動
2. `claude mcp list` で設定を確認
3. 設定ファイルのJSON構文をチェック

### 認証エラー

- APIキーが正しいか確認
- 環境変数が設定されているか確認
- `/mcp` コマンドで再認証を試行

### パフォーマンス問題

- レスポンスサイズが大きい場合は、より具体的なクエリを使用
- 必要なMCPサーバーのみを有効化

---

## このプロジェクトでの推奨設定

### 最小構成（必須）

```bash
# MUI-MCP（Material-UI v7必須）
claude mcp add mui-mcp -- npx -y @mui/mcp@latest

# Storybook-MCP
claude mcp add storybook -- npx -y mcp-storybook@latest --storybook-dir $(pwd)/.storybook
```

### 標準構成（推奨）

実際にこのプロジェクトで導入した構成：

```bash
# uvインストール（Serenaに必要）
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# MUI-MCP
claude mcp add mui-mcp -- npx -y @mui/mcp@latest

# Storybook-MCP
claude mcp add storybook -- npx -y mcp-storybook@latest --storybook-dir $(pwd)/.storybook

# Context7
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest

# Serena（ダッシュボード無効化）
claude mcp add serena -- /Users/ai/.local/bin/uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd) --enable-web-dashboard False

# Chrome DevTools MCP
claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
```

### フル構成（全機能）

上記に加えて：

```bash
# Figma-MCP（オプション）
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

---

## Claude Code Skills

### Skillsとは

Skillsはモデル呼び出し型の機能で、Claude が自動的に判断して使用します。各Skillは `.claude/skills/` ディレクトリに配置され、`SKILL.md` ファイルで定義されます。

### このプロジェクトのカスタムSkills

以下のカスタムSkillsがプロジェクトに含まれています：

#### 1. mui-v7-component

Material-UI v7コンポーネント作成のベストプラクティスとガイドライン。新しいGrid APIやTypeScript型定義に準拠したコンポーネント作成時に自動起動。

#### 2. storybook-story

Storybookストーリーの自動生成ガイドライン。コンポーネントごとの適切なストーリー構造とバリエーション作成をサポート。

#### 3. theme-customization

MUI v7テーマカスタマイズとTailwind CSS統合ガイド。カラーパレット、タイポグラフィ、ブレークポイントの設定をサポート。

### Skillsの配置

```text
.claude/skills/
├── mui-v7-component/
│   └── SKILL.md
├── storybook-story/
│   └── SKILL.md
└── theme-customization/
    └── SKILL.md
```

### 使い方

Skillsは自動的に起動されます。明示的な呼び出しは不要です。Claude が作業内容から適切なSkillを判断して使用します。

---

## 参考リンク

### 公式ドキュメント

- [Claude Code MCP公式ドキュメント](https://code.claude.com/docs/en/mcp)
- [Claude Code Skills公式ドキュメント](https://code.claude.com/docs/en/skills)
- [MUI-MCP公式ドキュメント](https://mui.com/material-ui/getting-started/mcp/)

### 各MCPサーバー

- [Context7 GitHub](https://github.com/upstash/context7)
- [Serena GitHub](https://github.com/oraios/serena)
- [Chrome DevTools MCP](https://developer.chrome.com/blog/chrome-devtools-mcp)
- [Figma MCP開発者ドキュメント](https://developers.figma.com/docs/figma-mcp-server/)

### プロジェクトドキュメント

- [実際の導入手順](./MCP_INSTALLATION_GUIDE.md)
- [Serena詳細ガイド](./SERENA_GUIDE.md)

---

**最終更新**: 2025-11-18
