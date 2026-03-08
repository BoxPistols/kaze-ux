# Gemini AI Code Review セットアップガイド

最終更新: 2026-02-02

このガイドでは、sdpf-themeプロジェクトにGemini AIによる自動コードレビュー機能を設定する方法を説明します。

## 目次

1. [概要](#概要)
2. [前提条件](#前提条件)
3. [セットアップ手順](#セットアップ手順)
4. [使用方法](#使用方法)
5. [カスタマイズ](#カスタマイズ)
6. [トラブルシューティング](#トラブルシューティング)

---

## 概要

### Gemini Code Reviewとは

Google Gemini AIを使用した自動PRコードレビュー機能です。以下の特徴があります：

- **プロジェクト固有のルールチェック**: React.FC禁止、MUI v7新API、any型禁止など
- **日本語でのレビューコメント**: 開発者に分かりやすい日本語でフィードバック
- **自動トリガー**: PRオープン時に自動実行、または`@gemini-cli`コマンドで手動実行
- **組織リポジトリ対応**: フォークからのPRは自動除外でセキュア

### 既存のOpenAIレビューとの違い

| 項目               | OpenAI Review          | Gemini Review                |
| :----------------- | :--------------------- | :--------------------------- |
| **モデル**         | GPT-4.1-nano/mini      | Gemini 2.0 Flash             |
| **トリガー**       | 自動（PRオープン時）   | 自動 + 手動（@gemini-cli）   |
| **レビュー内容**   | 一般的なコードレビュー | プロジェクト固有ルール重視   |
| **コメント形式**   | 単純なコメント         | 重要度レベル付き（🔴🟠🟡🟢） |
| **コード提案**     | なし                   | あり（suggestionブロック）   |
| **GitHub MCP統合** | なし                   | あり（PR操作の完全統合）     |

**推奨**: 両方を有効化して、多角的なレビューを実現

---

## 前提条件

### 必須

1. **GitHubリポジトリ権限**
   - Organization ownerまたはAdmin権限
   - Settings > Secrets and variables > Actions へのアクセス権

2. **Google Cloud Platform**
   - GCPプロジェクトの作成権限
   - Gemini APIまたはVertex AIの有効化権限

3. **Docker環境**
   - GitHub MCPサーバーがDockerコンテナで実行されます
   - GitHub Actionsのubuntu-latest runnerに含まれています

### オプション

- **GitHub App**: より高度な認証を使用する場合（推奨）
- **Workload Identity Federation**: GCPとの連携を強化する場合

---

## セットアップ手順

### 手順1: Google Cloud Platformの設定

#### オプションA: Gemini APIを使用（シンプル・推奨）

1. [Google AI Studio](https://aistudio.google.com/)にアクセス
2. "Get API Key"をクリックしてAPIキーを取得
3. 取得したAPIキーをメモ

#### オプションB: Vertex AIを使用（エンタープライズ向け）

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Vertex AI APIを有効化
3. サービスアカウントを作成し、権限を付与
4. Workload Identity Federationを設定

**注意**: 初心者はオプションAを推奨します。

### 手順2: GitHub Secretsの設定

GitHubリポジトリで以下を設定します：

```text
Settings > Secrets and variables > Actions > New repository secret
```

#### 必須Secrets

| シークレット名     | 説明           | 取得方法               |
| :----------------- | :------------- | :--------------------- |
| **GEMINI_API_KEY** | Gemini APIキー | Google AI Studioで取得 |

#### オプションSecrets（GitHub App使用時）

| シークレット名      | 説明               |
| :------------------ | :----------------- |
| **APP_PRIVATE_KEY** | GitHub Appの秘密鍵 |

#### オプションSecrets（Vertex AI使用時）

| シークレット名     | 説明           |
| :----------------- | :------------- |
| **GOOGLE_API_KEY** | Google API Key |

### 手順3: GitHub Variablesの設定

```text
Settings > Secrets and variables > Actions > Variables > New repository variable
```

#### 必須Variables

現在は必須のVariablesはありません。すべてオプションです。

#### オプションVariables

| 変数名                 | デフォルト値           | 説明                           |
| :--------------------- | :--------------------- | :----------------------------- |
| **GEMINI_MODEL**       | `gemini-2.0-flash-exp` | 使用するGeminiモデル           |
| **GEMINI_CLI_VERSION** | `latest`               | Gemini CLIのバージョン         |
| **GEMINI_DEBUG**       | `false`                | デバッグモードの有効化         |
| **UPLOAD_ARTIFACTS**   | `false`                | アーティファクトのアップロード |

#### GitHub App使用時のVariables

| 変数名     | 説明           |
| :--------- | :------------- |
| **APP_ID** | GitHub AppのID |

#### Vertex AI使用時のVariables

| 変数名                        | 説明                                     |
| :---------------------------- | :--------------------------------------- |
| **GOOGLE_CLOUD_PROJECT**      | GCPプロジェクトID                        |
| **GOOGLE_CLOUD_LOCATION**     | GCPリージョン（例: us-central1）         |
| **SERVICE_ACCOUNT_EMAIL**     | サービスアカウントのメール               |
| **GCP_WIF_PROVIDER**          | Workload Identity Federationプロバイダー |
| **GOOGLE_GENAI_USE_VERTEXAI** | `true`                                   |
| **GOOGLE_GENAI_USE_GCA**      | `false`                                  |

### 手順4: ワークフローファイルの確認

以下のファイルが正しく配置されているか確認：

```bash
.github/
├── workflows/
│   ├── gemini-dispatch.yml  # イベントディスパッチャー
│   └── gemini-review.yml    # レビュー実行
└── commands/
    └── gemini-review.toml   # レビュー設定
```

### 手順5: 動作確認

#### テストPRの作成

1. 新しいブランチを作成

   ```bash
   git checkout -b test/gemini-review
   ```

2. テスト用の変更を追加

   ```bash
   echo "// Test file" > test.ts
   git add test.ts
   git commit -m "test: Gemini reviewのテスト"
   git push -u origin test/gemini-review
   ```

3. PRを作成
   - GitHub上でPRを作成
   - Actionsタブで`🔀 Gemini Dispatch`ワークフローが実行されることを確認

4. レビュー結果を確認
   - 数分後、PRにGeminiからのコメントが追加される

---

## 使用方法

### 自動レビュー

PRを開くと自動的にGeminiレビューが実行されます。

### 手動レビュー

PRのコメントで以下のコマンドを実行：

```text
@gemini-cli /review
```

または、追加のコンテキストを指定：

```text
@gemini-cli /review セキュリティに特に注意してレビューしてください
```

### レビュー結果の読み方

#### 重要度レベル

- 🔴 **Critical**: 必ず修正が必要（本番障害、セキュリティリスク）
- 🟠 **High**: 修正推奨（将来的なバグやパフォーマンス問題）
- 🟡 **Medium**: 改善検討（ベストプラクティスからの逸脱）
- 🟢 **Low**: 任意（スタイルやドキュメント改善）

#### コメント例

````text
🔴 React.FCの使用は禁止されています。

理由：
- 暗黙的なchildrenの型定義により意図しないpropsが受け入れられる
- ジェネリック型の扱いに制約がある
- React 18+でdefaultPropsのサポートが限定的

修正案：

\```suggestion
export const Component = ({ prop }: ComponentProps) => {
  return <div>{prop}</div>
}
\```
````

---

## カスタマイズ

### レビュー基準のカスタマイズ

`.github/commands/gemini-review.toml`を編集：

```toml
description = "カスタムレビュー設定"
prompt = """
## プロジェクト固有のレビュー基準

### 追加の禁止事項
1. console.error以外のconsoleメソッドの使用
2. 非同期処理でのtry-catchの欠如

...
"""
```

### モデルの変更

より高性能なモデルを使用する場合：

```text
Settings > Variables > GEMINI_MODEL
```

値を以下のいずれかに設定：

- `gemini-2.0-flash-exp` (デフォルト、高速)
- `gemini-2.0-pro` (高精度)
- `gemini-1.5-flash` (軽量)

### レビュー対象ファイルの制限

`gemini-dispatch.yml`の`paths`フィルターを編集：

```yaml
on:
  pull_request:
    types:
      - 'opened'
    paths:
      - 'src/**/*.ts'
      - 'src/**/*.tsx'
      # 追加のパスパターン
```

### デバッグモードの有効化

```text
Settings > Variables > GEMINI_DEBUG = true
```

これにより、GitHub ActionsログにGeminiの詳細なデバッグ情報が出力されます。

---

## トラブルシューティング

### 問題1: Geminiレビューが実行されない

**原因**: SecretsまたはVariablesの設定ミス

**確認事項**:

```bash
# 1. Secretsの確認
Settings > Secrets and variables > Actions > Secrets
→ GEMINI_API_KEYが設定されているか

# 2. ワークフローの実行履歴
Actions > 🔀 Gemini Dispatch
→ エラーメッセージを確認
```

**解決方法**:

- GEMINI_API_KEYが正しく設定されているか確認
- APIキーに十分なクォータがあるか確認
- [Google AI Studio](https://aistudio.google.com/)でAPIキーの状態を確認

### 問題2: "Failed to connect to GitHub MCP server"

**原因**: DockerまたはGitHub MCPサーバーの問題

**解決方法**:

```yaml
# gemini-review.ymlのmcpServers設定を確認
'mcpServers':
  {
    'github':
      {
        'command': 'docker',
        'args':
          [
            'run',
            '-i',
            '--rm',
            '-e',
            'GITHUB_PERSONAL_ACCESS_TOKEN',
            'ghcr.io/github/github-mcp-server:v0.18.0',
          ],
      },
  }
```

GitHub Actionsのランナーが最新であることを確認：

```yaml
runs-on: 'ubuntu-latest'
```

### 問題3: フォークからのPRでレビューが動かない

**原因**: セキュリティ上、フォークからのPRは自動除外されています

**これは正常な動作です**:

```yaml
if: |-
  (
    github.event_name == 'pull_request' &&
    github.event.pull_request.head.repo.fork == false
  )
```

**対処方法**:

- フォークからのPRは手動でレビューしてください
- または、信頼できるコラボレーターのみを許可

### 問題4: 組織リポジトリで権限エラー

**原因**: Organization設定でGitHub Actionsの権限が制限されている

**解決方法**:

```text
Organization Settings > Actions > General
→ Workflow permissions
→ "Read and write permissions"を選択
→ "Allow GitHub Actions to create and approve pull requests"を有効化
```

または、GitHub Appを使用して認証（推奨）：

```text
Settings > Variables > APP_ID = <GitHub AppのID>
Settings > Secrets > APP_PRIVATE_KEY = <GitHub Appの秘密鍵>
```

### 問題5: レビューコメントが投稿されない

**原因**: GitHub token権限の不足

**確認事項**:

```yaml
permissions:
  contents: 'read'
  issues: 'write' # コメント投稿に必要
  pull-requests: 'write' # PR操作に必要
```

**解決方法**:

- ワークフローファイルのpermissions設定を確認
- GITHUB_TOKENが正しく渡されているか確認

### 問題6: "API rate limit exceeded"

**原因**: GitHub API またはGemini APIのレート制限

**解決方法**:

```text
# Gemini APIの場合
→ Google AI Studioでクォータを確認
→ 必要に応じてクォータ増加をリクエスト

# GitHub APIの場合
→ GitHub Appを使用して認証（レート制限が緩和される）
→ APP_IDとAPP_PRIVATE_KEYを設定
```

### 問題7: タイムアウトエラー

**原因**: レビュー処理が長時間実行されている

**解決方法**:

```yaml
# gemini-review.ymlのtimeout設定を調整
jobs:
  review:
    timeout-minutes: 15 # デフォルトは10分
```

または、PRのサイズを小さくする：

- 大きなPRは分割する
- 自動生成ファイルは除外する

---

## DIDinJapanとsdpf-themeの設定比較

| 項目                       | DIDinJapan               | sdpf-theme                  |
| :------------------------- | :----------------------- | :-------------------------- |
| **Gemini Model**           | デフォルト               | `gemini-2.0-flash-exp`      |
| **トリガー**               | PRオープン + @gemini-cli | 同左                        |
| **Issue Triage**           | あり                     | なし（不要のためスキップ）  |
| **プロジェクト固有ルール** | なし                     | React.FC禁止、MUI v7新API等 |
| **レビュー言語**           | 英語                     | 日本語                      |
| **コメント重要度**         | なし                     | あり（🔴🟠🟡🟢）            |

---

## 組織リポジトリでの注意事項

### フォークからのPRの扱い

組織リポジトリでは、外部コントリビューターからのフォークPRはセキュリティ上自動除外されます：

```yaml
if: |-
  github.event.pull_request.head.repo.fork == false
```

**理由**:

- Secretsへのアクセスを防ぐ
- コードインジェクション攻撃を防ぐ
- 不正なAPI使用を防ぐ

### 推奨設定

1. **Organization Membersのみ自動レビュー**
   - フォークからのPRは手動レビュー
   - 信頼できるコラボレーターを追加

2. **GitHub Appの使用**
   - GITHUB_TOKENよりも細かい権限制御
   - レート制限の緩和
   - 監査ログの充実

3. **定期的なAPI使用量の確認**
   - Gemini APIのクォータ監視
   - GitHub Actionsの使用時間監視

---

## 次のステップ

1. **OpenAIレビューとの併用**
   - [.github/workflows/ai-review.yml](../../.github/workflows/ai-review.yml)と併用可能
   - 異なる視点からのレビューで品質向上

2. **カスタムルールの追加**
   - プロジェクト固有の禁止事項を追加
   - チームのコーディング規約を反映

3. **メトリクスの収集**
   - レビュー実行時間の監視
   - 検出された問題の種類を分析
   - チームの学習に活用

---

## 参考資料

- [Gemini API公式ドキュメント](https://ai.google.dev/docs)
- [Google Gemini CLI Action](https://github.com/google-github-actions/run-gemini-cli)
- [GitHub MCP Server](https://github.com/github/github-mcp-server)
- [AI_DEVELOPMENT_RULES.md](../../AI_DEVELOPMENT_RULES.md) - プロジェクト開発ルール

---

**質問・サポート**: 設定でお困りの場合は、Issueを作成してください。
