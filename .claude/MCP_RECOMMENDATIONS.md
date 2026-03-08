# MCP設定の推奨事項

最終更新: 2026-02-02

このドキュメントは、未接続MCPサーバーの調査結果と推奨される対応方針をまとめたものです。

## 未接続MCPサーバーの分析

### 1. GitHub Copilot MCP

**状態**: ✗ 接続失敗

**原因分析**:

- GitHub Copilot MCPは、GitHub Copilot APIへの接続を提供するサーバー
- HTTPトランスポートを使用して`https://api.githubcopilot.com/mcp/`に接続
- 認証エラーまたはAPIエンドポイントの変更により接続失敗の可能性

**必要性判断**:

- **不要**: Claude Codeには既に組み込みのGitHub統合があり、Copilot特有の機能は不要
- **代替手段**: GitHub CLIツール（`gh`コマンド）で十分な機能が提供される

**推奨対応**: **削除推奨**

```bash
# 削除コマンド
claude mcp remove plugin:github:github
```

**理由**:

1. Claude CodeとGitHub Copilotは異なるAIアシスタントであり、統合の必要性が低い
2. このプロジェクトでは`.github/copilot-instructions.md`でCopilot設定を管理
3. 接続失敗が継続しており、メンテナンスコストが発生
4. 代替手段（gh CLI）が十分に機能している

---

### 2. Figma Desktop MCP

**状態**: ✗ 接続失敗

**原因分析**:

- Figmaデスクトップアプリが起動していない、またはMCPサーバーが有効化されていない
- ローカルホスト（`http://127.0.0.1:3845/mcp`）への接続が必要
- Figmaアプリ内でDev Mode → MCP serverの有効化が必要

**必要性判断**:

- **条件付きで有用**: Figmaデザインからコード生成を頻繁に行う場合のみ有用
- **代替手段あり**: リモートFigma MCP（`plugin:figma:figma`）が利用可能（認証必要）

**推奨対応**: **保持（ただし説明追加）**

**理由**:

1. デザイナーとの連携でFigmaデザインからコード生成する可能性がある
2. リモートFigmaとデスクトップFigmaで機能が異なる
3. 使用時のみFigmaアプリを起動すれば良い
4. 削除しても問題ないが、再設定の手間を考慮

**使用手順**:

```bash
# 1. Figmaデスクトップアプリを起動
# 2. デザインファイルを開く
# 3. Dev Mode（Shift + D）に切り替え
# 4. Inspect パネルの "Enable desktop MCP server" をクリック
# 5. Claude Codeで利用可能になる
```

---

## 推奨されるMCP設定

### 最小構成（現在推奨）

以下のMCPサーバーのみを有効化：

```bash
# 必須（既に稼働中）
✅ mui-mcp           # MUI v7ドキュメント
✅ serena            # セマンティックコード分析
✅ storybook         # Storybook統合
✅ context7          # 最新ライブラリドキュメント
✅ chrome-devtools   # パフォーマンス診断

# オプション（必要に応じて）
⚠️ figma (remote)    # Figmaデザイン連携（認証必要）
⏸️ figma-desktop     # Figmaデスクトップ連携（アプリ起動時のみ）

# 削除推奨
❌ GitHub Copilot MCP # 不要（代替手段あり）
```

### 追加を検討すべきMCPサーバー

#### 1. GitHub MCP（公式）

**用途**: GitHubリポジトリ、Issue、PRの直接操作

**インストール**:

```bash
claude mcp add github -- npx -y @modelcontextprotocol/server-github
```

**必要な環境変数**:

```bash
export GITHUB_TOKEN="<your-personal-access-token>"
```

**メリット**:

- PRのマージ、ラベル追加などのGitHub操作が可能
- Issueの作成・更新が可能
- リポジトリメタデータの取得が容易

**デメリット**:

- Personal Access Tokenの管理が必要
- `gh` CLIツールで代替可能な機能が多い

**推奨度**: ⭐⭐ (中) - `gh` CLIで十分だが、より高度なGitHub統合を求める場合は有用

---

#### 2. Filesystem MCP

**用途**: ファイルシステムの直接操作

**インストール**:

```bash
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /Users/ai/client/KSD/sdpf-theme
```

**メリット**:

- ファイルの読み書きが高速
- ディレクトリ構造の探索が容易

**デメリット**:

- Claude Codeには既に組み込みのファイル操作機能がある
- セキュリティリスクが増加

**推奨度**: ⭐ (低) - Claude Code組み込み機能で十分

---

#### 3. Slack MCP

**用途**: Slackチャンネルへの通知、メッセージ投稿

**インストール**:

```bash
claude mcp add slack -- npx -y @modelcontextprotocol/server-slack
```

**必要な環境変数**:

```bash
export SLACK_BOT_TOKEN="<your-slack-bot-token>"
```

**メリット**:

- CI/CDの結果をSlackに自動通知
- PRマージ時にチームへ通知

**デメリット**:

- Slack App設定が必要
- GitHub Actionsで代替可能

**推奨度**: ⭐⭐ (中) - チーム通知を自動化したい場合は有用

---

## 実施すべきアクション

### 即時実施（推奨）

#### 1. GitHub Copilot MCPの削除

```bash
# 未接続で不要なMCPサーバーを削除
claude mcp remove plugin:github:github
```

**確認方法**:

```bash
claude mcp list
# → plugin:github:github が表示されないことを確認
```

#### 2. Figma Remote MCPの認証

Figmaデザイン連携が必要な場合は認証を完了：

```bash
# Claude Codeで実行
/mcp
# → "figma" を選択
# → "Authenticate" を選択
# → ブラウザで "Allow Access" をクリック
```

### 中期的に検討

#### 1. Context7 APIキーの設定

無料版で動作していますが、APIキーを設定すると高速化：

```bash
# Upstash Console (https://console.upstash.com/) でAPIキーを取得後
claude mcp add context7 -- npx -y @upstash/context7-mcp --api-key YOUR_API_KEY
```

#### 2. プロジェクトメンバーへの設定共有

チームメンバー全員が同じMCP設定を使用できるよう、セットアップスクリプトを作成：

```bash
# .claude/setup-mcp.sh を作成
#!/bin/bash

echo "MCP Serversをセットアップします..."

# 必須MCPサーバー
claude mcp add mui-mcp -- npx -y @mui/mcp@latest
claude mcp add storybook -- npx -y mcp-storybook@latest --storybook-dir $(pwd)/.storybook
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest
claude mcp add serena -- /Users/ai/.local/bin/uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd) --enable-web-dashboard False
claude mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest

echo "セットアップ完了！"
```

---

## Figma Desktop MCPの詳細ガイド

### Figmaデスクトップ連携が必要なケース

1. **デザインからコード生成**: Figmaデザインを直接コードに変換
2. **デザイントークンの抽出**: カラー、タイポグラフィ、スペーシングを自動抽出
3. **コンポーネント同期**: Figmaコンポーネントとコードコンポーネントの整合性維持

### セットアップ手順

#### Step 1: Figmaデスクトップアプリのインストール

```bash
# Mac
brew install --cask figma

# または公式サイトからダウンロード
# https://www.figma.com/downloads/
```

#### Step 2: MCPサーバーの有効化

1. Figmaアプリを起動
2. 任意のデザインファイルを開く
3. `Shift + D`でDev Modeに切り替え
4. 右側のInspectパネルを開く
5. "MCP server"セクションで"Enable desktop MCP server"をクリック

#### Step 3: 接続確認

```bash
# Claude Codeで確認
claude mcp list

# → figma-desktop: ✓ Connected と表示されればOK
```

### 使用例

```text
プロンプト: "この[Figma URL]のボタンコンポーネントをMUIで実装して"

Claude Codeが自動的に:
1. Figmaデザインを読み取り
2. カラー、サイズ、スペーシングを抽出
3. MUI v7のButtonコンポーネントでコード生成
```

### トラブルシューティング

#### 問題: "Failed to connect to figma-desktop"

**原因**: Figmaアプリが起動していない、またはMCPサーバーが無効

**解決方法**:

1. Figmaアプリを起動
2. Dev Mode（Shift + D）に切り替え
3. "Enable desktop MCP server"をクリック
4. Claude Codeを再起動

#### 問題: "Port 3845 is already in use"

**原因**: 別のプロセスがポート3845を使用中

**解決方法**:

```bash
# ポートを使用しているプロセスを確認
lsof -i :3845

# プロセスを終了
kill -9 <PID>

# Figmaを再起動
```

---

## パフォーマンスとメンテナンス

### MCPサーバーのパフォーマンス監視

定期的に以下をチェック：

```bash
# 接続状態の確認
claude mcp list

# 特定サーバーの詳細確認
claude mcp get serena
```

### 不要なMCPサーバーの削除

接続失敗が続く、または使用しないMCPサーバーは削除：

```bash
# 例: GitHub Copilot MCPの削除
claude mcp remove plugin:github:github
```

### MCP設定のバックアップ

```bash
# MCP設定をバックアップ
cp -r ~/.config/claude/mcp.json ~/.config/claude/mcp.json.backup

# または
cat ~/.config/claude/mcp.json > mcp-backup-$(date +%Y%m%d).json
```

---

## まとめ

### 推奨アクション

| 優先度 | アクション                        | 理由                 |
| :----- | :-------------------------------- | :------------------- |
| **高** | GitHub Copilot MCPを削除          | 不要、接続失敗が継続 |
| **中** | Figma Remote MCPを認証            | デザイン連携に有用   |
| **中** | Context7 APIキー設定              | 応答速度の向上       |
| **低** | Figma Desktopの設定ドキュメント化 | 将来的な利用に備えて |

### 最終的な推奨MCP構成

```text
✅ 稼働中（必須）
├── mui-mcp          # MUI v7ドキュメント
├── serena           # セマンティックコード分析
├── storybook        # Storybook統合
├── context7         # 最新ライブラリドキュメント
└── chrome-devtools  # パフォーマンス診断

⚠️ オプション（必要に応じて）
├── figma (remote)   # 認証後に利用可能
└── figma-desktop    # Figmaアプリ起動時のみ

❌ 削除推奨
└── GitHub Copilot MCP # 代替手段あり、接続失敗
```

---

## 参考資料

- [MCP_SETUP.md](./MCP_SETUP.md) - MCPサーバーのインストールガイド
- [MCP_STATUS.md](./MCP_STATUS.md) - 現在のMCP設定状況
- [MCP_USAGE_GUIDE.md](./MCP_USAGE_GUIDE.md) - MCP活用の実践ガイド
- [Claude Code MCP公式ドキュメント](https://code.claude.com/docs/en/mcp)
