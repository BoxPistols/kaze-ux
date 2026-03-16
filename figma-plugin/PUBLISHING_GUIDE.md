# System Design — Figma Plugin 公開マニュアル

Figma Community へ「System Design」プラグインを公開するための手順書。

---

## 目次

1. [前提条件](#1-前提条件)
2. [プラグインID取得](#2-プラグインid取得)
3. [ビルドとローカルテスト](#3-ビルドとローカルテスト)
4. [テスト項目](#4-テスト項目)
5. [アセット作成](#5-アセット作成)
6. [Community 公開申請](#6-community-公開申請)
7. [公開後の作業](#7-公開後の作業)
8. [付録: Community 説明文](#付録-community-説明文)
9. [付録: CLI ツール設計 (Phase 2)](#付録-cli-ツール設計-phase-2)

---

## 1. 前提条件

| 項目                                     | 状態   | 備考                                   |
| ---------------------------------------- | ------ | -------------------------------------- |
| Figma Professional / Organization プラン | 要確認 | 無料プランでは Community 公開不可      |
| 2FA 有効化                               | 要確認 | Figma アカウント設定 > Security        |
| Figma Desktop インストール               | 要確認 | プラグイン開発にはデスクトップ版が必要 |
| Node.js 22+ / pnpm                       | 済     | `packageManager: pnpm@10.2.1`          |

## 2. プラグインID取得

### 手順

1. **Figma Desktop** を起動
2. 任意のファイルを開く
3. メニュー: **Plugins > Development > New plugin...**
4. **Figma design** を選択
5. プラグイン名: `System Design`
6. **Save as** で任意のフォルダに保存（生成される manifest.json から ID だけ使う）
7. 生成された `manifest.json` を開き、**数字の `id`** をコピー

### 反映

`figma-plugin/manifest.json` の `REPLACE_WITH_FIGMA_PLUGIN_ID` を取得した数字IDに差し替え:

```json
{
  "name": "System Design",
  "id": "1234567890123456789",
  ...
}
```

> **注意**: `id` は必ず Figma が発行した数字文字列を使う。自由な文字列ではPublish不可。

## 3. ビルドとローカルテスト

### ビルド

```bash
pnpm figma-plugin:build
```

`figma-plugin/code.js` が生成される（`.gitignore` 済み）。

### ローカル読み込み

1. Figma Desktop で任意のファイルを開く
2. **Plugins > Development > Import plugin from manifest...**
3. `figma-plugin/manifest.json` を選択
4. プラグインが「Development」セクションに表示される
5. クリックして起動 → UI が表示される

### 開発中の自動リビルド

```bash
pnpm figma-plugin:watch
```

code.ts を保存するたびに自動ビルド。Figma 側で `Cmd+Option+P` で再実行。

## 4. テスト項目

### Import タブ

| #   | テスト                                                             | 期待結果                                         |
| --- | ------------------------------------------------------------------ | ------------------------------------------------ |
| 1   | `sample-tokens.json` をテキストエリアに貼り付け → Import Variables | 全コレクション作成                               |
| 2   | Choose File → `sample-tokens.json` 選択                            | ファイル名表示 → インポート成功                  |
| 3   | Scope: Color only で Import                                        | Color コレクションのみ作成（Light/Dark 2モード） |
| 4   | Scope: Typography only で Import                                   | Typography コレクションのみ作成                  |
| 5   | Register Styles クリック                                           | Text 10 / Color / Effect スタイルが登録される    |
| 6   | 空の JSON `{}` でImport                                            | エラーなく "0 collections" と表示                |
| 7   | 不正な JSON                                                        | "JSON parse error" とステータス表示              |

### Generate タブ

| #   | テスト                                             | 期待結果                                 |
| --- | -------------------------------------------------- | ---------------------------------------- |
| 1   | Button クリック                                    | 54バリアントの ComponentSet が生成される |
| 2   | Color Variables インポート済みの状態で Button 生成 | Variable バインド付きのボタン            |

### Manage タブ

| #   | テスト               | 期待結果                                         |
| --- | -------------------- | ------------------------------------------------ |
| 1   | タブ切替             | コレクション一覧が表示される                     |
| 2   | 個別 Delete          | 対象コレクションのみ削除                         |
| 3   | Delete All → confirm | 全コレクション・変数削除                         |
| 4   | Remove Duplicates    | 重複があれば削除、なければ "No duplicates found" |

### エッジケース

- [ ] 大量トークン（500+変数）でのパフォーマンス
- [ ] 既存の Variables がある状態で再インポート（更新動作）
- [ ] manifest.json の `networkAccess: "none"` でネットワークアクセスがブロックされること

## 5. アセット作成

### 必須アセット

| アセット           | サイズ              | 配置先                  | 用途                       |
| ------------------ | ------------------- | ----------------------- | -------------------------- |
| アイコン           | 128 x 128 px (PNG)  | `figma-plugin/icon.png` | プラグイン一覧表示         |
| カバー画像         | 1920 x 960 px (PNG) | 任意                    | Community ページヘッダー   |
| スクリーンショット | 自由（3-5枚）       | 任意                    | Community ページギャラリー |

### アイコンのデザインガイド

- 背景: グラデーション `#5b6af0` → `#7c4dff`（プラグインUI と統一）
- シンボル: レイヤーアイコン（SVG は `ui.html` ヘッダーに定義済み）
- 角丸: 28px
- パディング: 16px
- フォーマット: PNG、透過なし

### スクリーンショット推奨構成

1. **Import タブ** — JSON 貼り付け → インポート成功メッセージ
2. **Variables パネル** — 作成された Color コレクション（Light/Dark モード）
3. **Generate タブ** — Button ComponentSet 生成結果
4. **Styles パネル** — 登録された Text/Color/Effect スタイル
5. **Manage タブ** — コレクション一覧表示

## 6. Community 公開申請

### 手順

1. Figma Desktop で **Plugins > Development** から「System Design」を右クリック
2. **Publish new release** を選択
3. 以下を入力:

| フィールド    | 値                                               |
| ------------- | ------------------------------------------------ |
| Name          | System Design                                    |
| Tagline       | Import W3C Design Tokens into Figma              |
| Description   | [付録の説明文を参照](#付録-community-説明文)     |
| Categories    | Design Systems, Utilities                        |
| Tags          | design-tokens, variables, w3c, dtcg, mui, styles |
| Creator links | https://github.com/your-username/your-repo       |
| Support email | (任意)                                           |

4. アイコン・カバー・スクリーンショットをアップロード
5. **Submit for approval** をクリック
6. Figma チームによるレビュー: **5-10 営業日**

### レビューで注意される点

- `networkAccess` に不要なドメインがないか → `"none"` 設定済み
- UI に外部リンクがないか → Google Fonts の `@import` のみ（許容範囲）
- `documentAccess` が適切か → `"dynamic-page"` で現在ページのみ
- 説明文が機能と一致しているか

## 7. 公開後の作業

- [ ] Figma Community URL を GitHub リポジトリの README に追加
- [ ] GitHub リリースタグを作成（例: `figma-plugin-v1.0.0`）
- [ ] 実際の `design-tokens/tokens.json` を使った動作デモ動画（任意）
- [ ] Phase 2: `system-design-export` CLI 開発開始

---

## 付録: Community 説明文

> 以下をそのまま Figma Community の Description にコピー

System Design — Import W3C Design Tokens into Figma

Import your design tokens (W3C DTCG format) directly into Figma as Variables, Styles, and Components. Works with any design system — framework-agnostic.

### Features

**Import Variables**
Paste or load a tokens.json file to create Figma Variable Collections:

- Color (Light/Dark modes in one collection)
- Typography (font sizes, weights, line heights)
- Spacing, Border Radius, Breakpoints
- Component tokens

**Register Styles**
One-click creation of Figma Styles from your tokens:

- 10 Text Styles (Display, Heading, Body, Caption)
- Color Styles with Variable binding
- Effect Styles (CSS box-shadow to Figma effects)

**Generate Components**
Auto-generate MUI-compatible ComponentSets:

- Button: 54 variants (3 types x 6 colors x 3 sizes)
- Auto-binds to imported Color Variables
- More components coming soon

**Manage**

- View all Variable Collections
- Delete individual collections
- Remove duplicate variables
- Bulk delete

### Token Format (W3C DTCG)

```json
{
  "color": {
    "light": {
      "primary": {
        "main": { "$value": "#1976d2", "$type": "color" }
      }
    },
    "dark": {
      "primary": {
        "main": { "$value": "#90caf9", "$type": "color" }
      }
    }
  },
  "spacing": {
    "1": { "$value": "4px", "$type": "dimension" }
  }
}
```

A sample tokens.json is included in the GitHub repository.

### Links

- GitHub: https://github.com/your-username/your-repo
- Sample tokens: figma-plugin/sample-tokens.json

---

## 付録: CLI ツール設計 (Phase 2)

### 概要

フロントエンドフレームワークからデザイントークンを抽出し、
W3C DTCG 形式 JSON として出力する CLI ツール。
System Design Figma プラグインとシームレスに連携する。

### 使用例

```bash
# MUI theme から抽出
npx system-design-export --from mui --input src/themes/theme.ts

# Tailwind config から抽出
npx system-design-export --from tailwind --input tailwind.config.js

# CSS カスタムプロパティから抽出
npx system-design-export --from css-vars --input src/styles/variables.css

# 出力オプション
npx system-design-export --from mui -o design-tokens/tokens.json
npx system-design-export --from mui --stdout | pbcopy
```

### アーキテクチャ

```
packages/system-design-export/
  src/
    cli.ts              # エントリーポイント (commander)
    extractors/
      mui.ts            # MUI theme → DTCG
      tailwind.ts       # Tailwind config → DTCG
      css-vars.ts       # CSS Variables → DTCG
    formatter.ts        # DTCG JSON フォーマッター
    types.ts            # 共有型定義
  package.json
  tsconfig.json
```

### エクストラクター仕様

**MUI**

- TypeScript AST で `createTheme()` をパース
- 抽出: palette, typography, spacing, shape.borderRadius, shadows, breakpoints
- Light/Dark サポート付き DTCG 形式にマッピング

**Tailwind**

- config ファイルを `require()` で読み込み
- `theme.extend` マージを解決
- 抽出: colors, fontSize, spacing, borderRadius, boxShadow, screens

**CSS Variables**

- CSS ファイルから `--` カスタムプロパティをパース
- プレフィックス規約でグルーピング（例: `--color-*`, `--spacing-*`）
- 値フォーマットから `$type` を推論（hex → color, px → dimension）

### パッケージ情報

- パッケージ名: `system-design-export`
- バイナリ名: `system-design-export`
- 依存: `commander`, `typescript`（AST パース用）
- フレームワーク非依存（React, MUI 等は不要）
- npm 単独パッケージとして公開可能
