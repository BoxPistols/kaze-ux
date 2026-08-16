---
name: sync-tokens
description: テーマ定義と story から生成物（トークン / CSS 変数 / 部品メタデータ）を再生成し、検査まで通す
user_invocable: true
---

# /sync-tokens

`src/themes/` と `src/stories/` から**生成物を作り直し、実測の検査まで通す**。

生成物は 3 つあり、**どれか 1 つだけ再生成すると CI が落ちる**（鮮度チェックが
3 つまとめて見ているため）。必ず全部走らせる。

## 使い方

```
/sync-tokens
/sync-tokens --figma-build
```

## 実行内容

### 1. 生成物の再生成（3 つとも）

```bash
pnpm export-tokens    # design-tokens/tokens.json     (W3C DTCG)
pnpm export-css       # design-tokens/kaze-tokens.css (MUI 無しで使う CSS 変数)
pnpm export-metadata  # metadata/components.json      (MCP が AI に配る部品情報)
```

| 生成物            | 単一ソース                        | 誰が読むか                       |
| ----------------- | --------------------------------- | -------------------------------- |
| `tokens.json`     | `src/themes/` + story の argTypes | Figma / 外部ツール               |
| `kaze-tokens.css` | `src/themes/`                     | Tailwind だけのプロダクト        |
| `components.json` | story + `metadata/curated.json`   | MCP (`get_component` / `search`) |

**手で編集しない。** どれも先頭に「生成物」と書いてある。

### 2. 検査（生成しただけでは信用しない）

```bash
pnpm check:css-vars           # 実ブラウザで CSS 変数が意図どおり解決するか
pnpm check:tailwind-consumer  # README の手順で組んだ実プロジェクトで色が付くか
pnpm check:mcp                # 登録した MCP が起動して部品情報を返すか
pnpm check:ds-core            # コア層が UI ライブラリに依存していないか
```

`check:css-vars` と `check:tailwind-consumer` は chromium を使う。
未インストールなら `pnpm exec playwright install chromium`。

### 3. Figma Plugin ビルド（`--figma-build` 指定時）

```bash
pnpm figma-plugin:build
```

### 4. 差分の確認

```bash
git diff --stat design-tokens/ metadata/
```

**色が動いたら理由を説明できること。** テーマを触っていないのに値が変わって
いたら、生成側の変更を疑う。

## 落とし穴

- **MCP はビルド不要**。`.mcp.json` は `npx tsx mcp/src/index.ts` を指している。
  かつて `mcp/dist/index.js` を指していたが `dist` は .gitignore 済みで、
  clone した環境では**登録されているのに起動しない**状態だった
- **生成物は生成側で prettier を通している。** 素の `JSON.stringify` は短い配列も
  必ず展開するため、pre-commit の prettier と食い違って鮮度チェックが恒常的に
  落ちる。生成ロジックを足すときは同じ扱いにする
- **story を足せば `components.json` に自動で載る。** 手で追記しない。
  禁止事項など story から取れないものだけ `metadata/curated.json` に置く。
  **キーは生成キーに一致させる**（名前で寄せると別部品に重なる。実際に
  CVA 版 Button の記述が MUI の Button に載った）

## ソースファイル

| ファイル                                | 役割                                 |
| --------------------------------------- | ------------------------------------ |
| `src/themes/colorToken.ts`              | カラー定義（SSOT）・`createCssVars`  |
| `src/themes/typography.ts`              | タイポグラフィ定義                   |
| `src/themes/breakpoints.ts`             | ブレークポイント                     |
| `scripts/export-design-tokens.ts`       | tokens.json 生成                     |
| `scripts/export-css-vars.ts`            | kaze-tokens.css 生成                 |
| `scripts/export-component-metadata.mjs` | components.json 生成                 |
| `scripts/ds-core.mjs`                   | MUI 非依存コア層の定義（単一ソース） |
| `metadata/curated.json`                 | story から取れない記述の上書き       |
