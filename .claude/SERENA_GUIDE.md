# Serena MCPサーバー 説明ガイド

## 概要

SerenaはセマンティックコードRIEF（Retrieval, Inspection, Editing, and Formatting）機能を提供する強力なMCPサーバーです。従来のgrep検索とは異なり、コードの意味を理解して関連するコードを発見できます。

## 主な機能

### 1. セマンティック検索

従来のgrep検索では見つけられない、意味的に関連するコードを発見します。

**例**:

- 「ユーザー認証はどこで処理される？」
- 「テーマのカスタマイズロジックはどこにある？」
- 変数名が異なっても関連するコードを発見

### 2. インテリジェント編集

コードの構造を理解した上で、正確な編集を実行します。

### 3. プロジェクトコンテキスト理解

プロジェクト全体の構造とコンテキストを把握し、より的確な提案を行います。

## インストール

### 前提条件

uvパッケージマネージャーが必要です：

```bash
# uvのインストール
curl -LsSf https://astral.sh/uv/install.sh | sh

# PATHに追加
source $HOME/.local/bin/env
```

### Serenaサーバーの追加

```bash
claude mcp add serena -- /Users/ai/.local/bin/uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project /Users/ai/client/KSD/sdpf-theme --enable-web-dashboard False
```

**重要なオプション**:

- `--context ide-assistant`: IDE統合用のコンテキスト
- `--project <path>`: プロジェクトの絶対パス
- `--enable-web-dashboard False`: ダッシュボード無効化

## ダッシュボードについて

### ダッシュボードとは

Serenaはデフォルトでウェブダッシュボードを起動します：

- URL: <http://127.0.0.1:24282/dashboard/index.html>
- 機能: ログビューアとエージェントのシャットダウン

### ダッシュボードを無効にする理由

- Claude Codeでは不要な機能
- ブラウザが自動的に開くのを防ぐ
- リソース節約

### ダッシュボードの無効化方法

**方法1**: コマンドライン引数（推奨）

```bash
claude mcp add serena -- uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd) --enable-web-dashboard False
```

**方法2**: 設定ファイル

`serena_config.yml` に以下を設定：

```yaml
enable-web-dashboard: false
```

## 使用方法

Serenaは自動的に動作します。明示的な呼び出しは不要です。

### プロンプト例

```
"テーマのカスタマイズロジックはどこにある？"
"Material-UIコンポーネントの型定義を見つけて"
"認証関連のコードを全て表示して"
"エラーハンドリングはどのように実装されている？"
```

### 通常のgrep検索との違い

| 検索タイプ | 検索方法           | 結果                                         |
| ---------- | ------------------ | -------------------------------------------- |
| grep検索   | キーワード完全一致 | 「authentication」という文字列を含むファイル |
| Serena     | 意味的理解         | 認証処理を行うコード（変数名が違っても発見） |

## トラブルシューティング

### Serenaが接続できない

```bash
# uvがインストールされているか確認
which uv

# PATHに追加されているか確認
source $HOME/.local/bin/env

# 再接続を試行
claude mcp remove serena
claude mcp add serena -- /Users/ai/.local/bin/uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $(pwd) --enable-web-dashboard False
```

### ダッシュボードが開いてしまう

`--enable-web-dashboard False` オプションが正しく設定されているか確認：

```bash
# 設定確認
claude mcp list
# 出力に "--enable-web-dashboard False" が含まれているか確認
```

### パフォーマンスが遅い

プロジェクトのサイズが大きい場合、初回のインデックス作成に時間がかかることがあります。

## 設定確認

```bash
# Serena設定の確認
claude mcp list

# 期待される出力:
# serena: /Users/ai/.local/bin/uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project /Users/ai/client/KSD/sdpf-theme --enable-web-dashboard False - ✓ Connected
```

## 利点

1. **トークン効率**: 関連するコードのみを正確に検索
2. **高度な理解**: コードの意味を理解した検索
3. **時間節約**: 手動でのコード探索が不要
4. **品質向上**: より正確なコード理解に基づく提案

## 参考リンク

- [Serena GitHub](https://github.com/oraios/serena)
- [Serena公式ドキュメント](https://oraios.github.io/serena/)
- [ダッシュボード無効化に関するディスカッション](https://github.com/oraios/serena/discussions/271)

## まとめ

Serenaは、従来のキーワード検索を超えた、セマンティックコード理解を提供します。プロジェクトの規模が大きくなるほど、その価値は高まります。

ダッシュボードを無効化することで、Claude Codeとの統合がよりスムーズになります。
