# MCP環境 実際の導入手順

このドキュメントは、KDDI Smart Drone Platform UI Theme プロジェクトでMCP環境を実際に構築した手順を記録しています。

## 実施日

2025-11-18

## 導入したMCPサーバー

以下の5つのMCPサーバーを導入しました：

1. **MUI-MCP** - Material-UI v7ドキュメントアクセス
2. **Storybook-MCP** - Storybookコンポーネント連携
3. **Context7** - 最新ライブラリドキュメント取得
4. **Serena** - セマンティックコード分析
5. **Chrome DevTools MCP** - ブラウザパフォーマンス診断とデバッグ

この構成は、トークン効率と品質のバランスが良好で、フロントエンド開発に必要な機能を網羅しています。

## 導入手順

### 前提条件の確認

```bash
# uvがインストールされているか確認
which uv

# Storybookが起動しているか確認
lsof -ti:6006
```

### ステップ1: uvパッケージマネージャーのインストール

Serenaに必要なuvをインストールします。

```bash
# uvインストール
curl -LsSf https://astral.sh/uv/install.sh | sh

# PATHに追加（シェルを再起動するか以下を実行）
source $HOME/.local/bin/env

# インストール確認
which uv
# 出力: /Users/ai/.local/bin/uv
```

### ステップ2: MUI-MCPサーバーの追加

Material-UI v7の公式ドキュメントにアクセスできるようにします。

```bash
claude mcp add mui-mcp -- npx -y @mui/mcp@latest
```

**結果**:

- ユーザースコープに追加
- 設定ファイル: `~/.claude.json`
- ステータス: 接続済

### ステップ3: Storybook-MCPサーバーの追加

Storybook v8ではMCPアドオンが含まれていないため、コミュニティ実装のmcp-storybookを使用します。

```bash
claude mcp add storybook -- npx -y mcp-storybook@latest --storybook-dir /Users/ai/client/KSD/sdpf-theme/.storybook
```

**注意**:

- Storybook v9以降では公式MCPアドオンが提供される予定
- 現在はコミュニティ実装を使用
- Storybookディレクトリのパスを絶対パスで指定する必要がある

**結果**:

- ユーザースコープに追加
- 設定ファイル: `~/.claude.json`
- ステータス: 接続済

### ステップ4: Context7サーバーの追加

最新のライブラリドキュメントを動的に取得できるようにします。

```bash
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
```

**結果**:

- ユーザースコープに追加
- 設定ファイル: `~/.claude.json`
- APIキーなし（基本機能のみ）
- ステータス: 接続済

**使い方**:
プロンプトに `use context7` を追加します。

```
例: "React hooksのTypeScript使用方法を教えて。use context7"
```

**重要**: ダッシュボードを無効化するため `--enable-web-dashboard False` オプションを追加します。

### ステップ5: Serenaサーバーの追加

セマンティックコード分析機能を追加します。

```bash
claude mcp add serena -- /Users/ai/.local/bin/uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project /Users/ai/client/KSD/sdpf-theme --enable-web-dashboard False
```

- ダッシュボード: 無効
- ステータス: 接続済

**ダッシュボードについて**:

- デフォルトでは http://127.0.0.1:24282/dashboard/index.html が起動
- Claude Codeでは不要なため無効化を推奨
- 詳細は [SERENA_GUIDE.md](.claude/SERENA_GUIDE.md) を参照

### ステップ6: Chrome DevTools MCPサーバーの追加

ブラウザパフォーマンス診断とデバッグ機能を追加します。

```bash
claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
```

**結果**:

- ユーザースコープに追加
- 設定ファイル: `~/.claude.json`
  **結果**:

- ユーザースコープに追加
- 設定ファイル: `~/.claude.json`
- コンテキスト: ide-assistant
- プロジェクトパス: `/Users/ai/client/KSD/sdpf-theme`
- ステータス: 接続済

**主な機能**:

- パフォーマンストレース記録
- ネットワーク診断（CORS問題など）
- コンソールログ分析
- DOM/CSS検査

### ステップ7: 設定の確認

```bash
claude mcp list
```

serena: /Users/ai/.local/bin/uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project /Users/ai/client/KSD/sdpf-theme --enable-web-dashboard False - ✓ Connected
chrome-devtools: npx -y chrome-devtools-mcp@latest - ✓ Connected

**出力**:

```
mui-mcp: npx -y @mui/mcp@latest - ✓ Connected
context7: npx -y @upstash/context7-mcp@latest - ✓ Connected
storybook: npx -y mcp-storybook@latest --storybook-dir /Users/ai/client/KSD/sdpf-theme/.storybook - ✓ Connected
```

全5つのMCPサーバーが接続済であれば成功です。

## 設定ファイルの場所

### ユーザースコープ設定

- ファイル: `~/.claude.json`
- 含まれるサーバー: MUI-MCP, Context7, Serena, Storybook, Chrome DevTools MCP
- すべてのプロジェクトで利用可能

注: Storybookサーバーはプロジェクト固有のディレクトリパスを指定しているため、他のプロジェクトで使用する場合は再設定が必要です。

## 動作確認

Claude Codeで以下のコマンドを実行して、MCPサーバーが認識されていることを確認します：

```
/mcp
```

5つのMCPサーバーがリストに表示されれば成功です。

## 各MCPサーバーの使用方法

### MUI-MCP

Material-UI v7のコンポーネント情報を取得：

```
プロンプト例:
- "Grid v7の新しいsizeプロパティの使い方を教えて"
- "Buttonコンポーネントのカスタマイズ方法は？"
```

### Storybook-MCP

Storybookのコンポーネントやストーリーと連携：

```
プロンプト例:
- "Buttonコンポーネントの全バリエーションをStorybookで確認して"
- "新しいCardコンポーネントのストーリーを生成して"
```

### Context7

最新のライブラリドキュメントを取得（プロンプトに `use context7` を追加）：

```
プロンプト例:
- "Tailwind CSS v3の最新機能は？use context7"
- "React 18のuseEffectの使い方を教えて。use context7"
```

### Serena

セマンティックコード分析（自動的に動作）：
詳細は [SERENA_GUIDE.md](.claude/SERENA_GUIDE.md) を参照。

### Chrome DevTools MCP

ブラウザのパフォーマンス診断とデバッグ：

```
プロンプト例:
- "Please check the LCP of web.dev."
- "このページのCORS問題を診断して"
- "コンソールエラーを確認して"
```

```
プロンプト例:
- "テーマのカスタマイズロジックはどこにある？"
- "Material-UIコンポーネントの型定義を見つけて"
```

## トラブルシューティング

### MCPサーバーが認識されない

```bash
# Claude Codeを再起動
# または設定ファイルを確認
claude mcp list
cat ~/.claude.json
cat .mcp.json
```

### Storybook-MCPが接続できない

mcp-storybookを使用する場合は、Storybookディレクトリの絶対パスを指定してください：

```bash
# 現在の設定を削除
claude mcp remove storybook

# プロジェクトの.storybookディレクトリの絶対パスを指定して再追加
claude mcp add storybook -- npx -y mcp-storybook@latest --storybook-dir $(pwd)/.storybook
```

### uvが見つからない

### Serenaダッシュボードが開いてしまう

`--enable-web-dashboard False` オプションが正しく設定されているか確認：

```bash
# 設定確認
claude mcp list
# 出力に "--enable-web-dashboard False" が含まれているか確認

# 含まれていない場合は再設定
claude mcp remove serena
claude mcp add serena -- /Users/ai/.local/bin/uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd) --enable-web-dashboard False
```

```bash
# PATHに追加
source $HOME/.local/bin/env

# または、シェルを再起動
```

## 次のステップ

### Context7のフル機能を使用する（オプション）

APIキーを取得してフル機能を有効化：

1. [Upstash Console](https://console.upstash.com/)でアカウント作成
2. Context7 APIキーを生成
3. 以下のコマンドで再設定：

```bash
claude mcp remove context7
claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key YOUR_API_KEY
```

### Figma-MCPの追加（オプション）

デザインからコード生成が必要な場合：

```bash
claude mcp add --transport http figma https://mcp.figma.com/mcp
```

認証手順:

1. Claude Codeで `/mcp` と入力
2. `figma` を選択
3. `Authenticate` を選択
4. `Allow Access` をクリック

5. ブラウザパフォーマンス診断とデバッグ

## まとめ

この構成により、以下の機能が利用可能になりました：

1. Material-UI v7の最新ドキュメントへの即座のアクセス
2. Storybookコンポーネントとの緊密な連携
3. 最新ライブラリドキュメントの動的取得
4. セマンティックコード分析による高度なコード理解

- [Chrome DevTools MCP](https://developer.chrome.com/blog/chrome-devtools-mcp)
  トークン効率と品質のバランスが良好で、フロントエンド開発に必要な機能を網羅しており、開発生産性の大幅な向上が期待できます。
- [Serena詳細ガイド](.claude/SERENA_GUIDE.md)

## 参考リンク

- [Claude Code MCP公式ドキュメント](https://code.claude.com/docs/en/mcp)
- [MUI-MCP公式ドキュメント](https://mui.com/material-ui/getting-started/mcp/)
- [Context7 GitHub](https://github.com/upstash/context7)
- [Serena GitHub](https://github.com/oraios/serena)
- [詳細設定ガイド](.claude/MCP_SETUP.md)
