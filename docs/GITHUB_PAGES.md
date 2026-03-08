# GitHub Pages デプロイガイド

このドキュメントでは、SDPF Theme を GitHub Pages にデプロイする方法を説明します。

## 概要

GitHub Pages を使用して、以下の2つの環境を公開できます：

| 環境      | URL パス      | 説明                                   |
| :-------- | :------------ | :------------------------------------- |
| Dev環境   | `/` (ルート)  | UIコンポーネントのプレイグラウンド     |
| Storybook | `/storybook/` | コンポーネントのドキュメント・カタログ |

## デプロイURL

デプロイ後のURLは以下の形式になります：

```
https://kddi-smartdrone-dev.github.io/sdpf-theme/          # Dev環境
https://kddi-smartdrone-dev.github.io/sdpf-theme/storybook/ # Storybook
```

## セットアップ

### 1. GitHub Pages の有効化

1. リポジトリの Settings > Pages を開く
2. Source を「GitHub Actions」に設定

### 2. 認証の設定（オプション）

公開サイトに簡易認証をかける場合は、リポジトリの Secrets に以下を設定：

1. Settings > Secrets and variables > Actions を開く
2. 「New repository secret」をクリック
3. 以下を設定：
   - Name: `PAGES_AUTH_PASSWORD`
   - Secret: 任意のパスワード

認証が有効な場合、ユーザーは以下の選択肢があります：

- **永続保存**: ブラウザを閉じても認証状態を維持
- **24時間保存**: 24時間後に再認証が必要

認証を無効化する場合は、Secret を削除するか空にしてください。

## デプロイトリガー

### 現在の設定

| トリガー                     | 対象            | 説明                       |
| :--------------------------- | :-------------- | :------------------------- |
| `main` ブランチへのプッシュ  | Dev + Storybook | 両方をデプロイ             |
| 手動実行 (workflow_dispatch) | 選択可能        | all/dev/storybook から選択 |

### 手動デプロイ

1. Actions タブを開く
2. 「Deploy to GitHub Pages」を選択
3. 「Run workflow」をクリック
4. デプロイ対象を選択して実行

## ブランチ別デプロイ設定（将来対応）

将来的にブランチによってデプロイ内容を分ける場合は、`.github/workflows/deploy-pages.yml` を以下のように変更してください：

### 例: ブランチ別デプロイ

```yaml
on:
  push:
    branches:
      - main # Dev + Storybook
      - storybook # Storybookのみ
      - develop # Dev環境のみ
```

ワークフロー内の判定ロジック（`Determine deploy target`ステップ）が自動的にブランチ名を認識します：

| ブランチ    | デプロイ対象    |
| :---------- | :-------------- |
| `main`      | Dev + Storybook |
| `storybook` | Storybook のみ  |
| `develop`   | Dev環境 のみ    |

### カスタムブランチの追加

新しいブランチを追加する場合は、ワークフローの `Determine deploy target` ステップを編集：

```yaml
case "${{ github.ref_name }}" in
  main)
    echo "target=all" >> $GITHUB_OUTPUT
    ;;
  storybook)
    echo "target=storybook" >> $GITHUB_OUTPUT
    ;;
  develop)
    echo "target=dev" >> $GITHUB_OUTPUT
    ;;
  feature/*)  # 追加例: feature/* ブランチ
    echo "target=dev" >> $GITHUB_OUTPUT
    ;;
  *)
    echo "target=all" >> $GITHUB_OUTPUT
    ;;
esac
```

## ローカルビルド

GitHub Pages 用のビルドをローカルで確認する場合：

```bash
# Dev環境 + Storybook 両方をビルド
pnpm run build:gh-pages:all

# Dev環境のみ
pnpm run build:gh-pages

# Storybookのみ（gh-pages/storybook に出力）
pnpm run build:gh-pages:storybook

# 認証スクリプトの注入（パスワードを指定）
AUTH_PASSWORD=mypassword pnpm run build:gh-pages:inject-auth
```

ビルド成果物は `gh-pages/` ディレクトリに出力されます。

### ローカルでプレビュー

```bash
# ビルド後、ローカルサーバーで確認
pnpm exec serve gh-pages
```

## ディレクトリ構造

```
gh-pages/
├── index.html          # Dev環境エントリーポイント
├── assets/             # Dev環境のアセット
├── favicon.svg
├── auth.js             # 認証スクリプト（注入時のみ）
└── storybook/          # Storybookサブディレクトリ
    ├── index.html
    ├── iframe.html
    ├── assets/
    ├── sb-addons/
    ├── sb-common-assets/
    └── sb-manager/
```

## トラブルシューティング

### デプロイが失敗する

1. Settings > Pages で Source が「GitHub Actions」になっているか確認
2. Actions タブでエラーログを確認
3. 権限設定を確認（workflow の `permissions` セクション）

### 404エラーが発生する

- ベースパスが正しく設定されているか確認
- `vite.config.ts` の `base` オプションがリポジトリ名と一致しているか確認

### 認証が機能しない

- `PAGES_AUTH_PASSWORD` Secret が正しく設定されているか確認
- ブラウザのLocalStorageをクリアして再試行

### 認証をリセットしたい

ブラウザの開発者コンソールで以下を実行：

```javascript
sdpfLogout()
```

または、LocalStorage から `sdpf_auth` キーを削除してください。

## 関連ファイル

| ファイル                             | 説明                    |
| :----------------------------------- | :---------------------- |
| `.github/workflows/deploy-pages.yml` | デプロイワークフロー    |
| `vite.config.ts`                     | Vite設定（base パス等） |
| `public/auth.js`                     | 簡易認証スクリプト      |
| `scripts/inject-auth.js`             | 認証注入スクリプト      |

## 注意事項

- 簡易認証はクライアントサイドのみで動作するため、機密性の高いコンテンツの保護には適していません
- GitHub Pages は静的サイトのみ対応しており、サーバーサイド処理は実行できません
- デプロイ制限: GitHub Pages には月間帯域制限（100GB）があります
