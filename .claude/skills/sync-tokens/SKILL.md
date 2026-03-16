---
name: sync-tokens
description: テーマ定義からデザイントークンを再生成し、関連ファイルを同期
user_invocable: true
---

# /sync-tokens

テーマ定義（`src/themes/`）からデザイントークンを再生成し、関連ファイルを一括同期する。

## 使い方

```
/sync-tokens
/sync-tokens --figma-build
```

## 実行内容

### 1. tokens.json 再生成

```bash
pnpm export-tokens
```

`scripts/export-design-tokens.ts` を実行し、`design-tokens/tokens.json` を更新。

### 2. Figma Plugin ビルド（--figma-build 指定時）

```bash
pnpm figma-plugin:build
```

`figma-plugin/code.js` を再コンパイル。

### 3. 整合性チェック

以下を確認:

- `src/themes/colorToken.ts` の primary カラーが `#0EADB8` であること
- `tokens.json` の `$description` が適切であること
- `metadata/components.json` の `framework` フィールドにバージョン番号がないこと

### 4. MCP サーバー再ビルド（トークン変更時）

```bash
cd mcp && pnpm build
```

MCP の `get_token` ツールが最新のトークン値を返すようにする。

## ソースファイル

| ファイル                          | 役割                   |
| --------------------------------- | ---------------------- |
| `src/themes/colorToken.ts`        | カラー定義（SSOT）     |
| `src/themes/typography.ts`        | タイポグラフィ定義     |
| `src/themes/theme.ts`             | MUI テーマ統合         |
| `src/themes/breakpoints.ts`       | ブレークポイント       |
| `scripts/export-design-tokens.ts` | トークン生成スクリプト |
| `design-tokens/tokens.json`       | 出力（W3C DTCG）       |
