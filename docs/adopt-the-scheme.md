# このスキームを自分のプロジェクトで使う

kaze-ux で使っている「AI が読めるデザインシステム」の作り方は、**この
リポジトリ固有のものではありません**。同じ形のファイルを置けば、あなたの
プロジェクトでも同じように動きます。

kaze-ux は、その仕組みが実際に成立することを示す実例です。

## スキームの中身

```
① 単一ソースから生成する      テーマ・story → トークン / 部品仕様 / ルール
② AI に配る                   MCP サーバー（4 ツール + 3 リソース）
③ 守られているか実測する      描画・起動して数える
④ 生成物の鮮度を CI で守る    再生成して差分が出たら落とす
```

要点は **①→③ の順に守ること**です。仕様を書くだけでは必ず実装から遅れ、
遅れたことに誰も気づきません。手で書いた一覧は必ず古くなります。

## 最短で試す

MCP サーバーだけなら、あなたのプロジェクトに 3 つのファイルを置くだけで
動きます。

### 1. データを置く

| ファイル                    | 中身                                                             |
| --------------------------- | ---------------------------------------------------------------- |
| `design-tokens/tokens.json` | [W3C DTCG](https://tr.designtokens.org/) 形式のトークン          |
| `metadata/components.json`  | 部品の仕様（`{ components: { key: { name, category, ... } } }`） |
| `foundations/prohibited.md` | 禁止パターンの表（`\| ID \| 禁止 \| 代わりに \| 強制 \|`）       |

`components.json` は `name` と `category` があれば動きます。他のフィールドは
そのまま AI に渡るので、`variants` / `props` / `description` を足すほど
生成されるコードが正確になります。

### 2. MCP を登録する

```jsonc
// .mcp.json
{
  "mcpServers": {
    "ds": {
      "command": "npx",
      "args": ["tsx", "path/to/mcp/src/index.ts"],
      "env": {
        "DS_ROOT": "/absolute/path/to/your-project",
      },
    },
  },
}
```

配置が違う場合は個別に指定できます。

```jsonc
"env": {
  "DS_ROOT": "/absolute/path/to/your-project",
  "DS_TOKENS_PATH": "design/tokens.json",
  "DS_COMPONENTS_PATH": "design/components.json",
  "DS_RULES_PATH": "design/rules.md"
}
```

**ビルドは要りません。** ソースから直接起動します。ビルド成果物を指すと
「dist が source より古い」という無言の失敗が生まれます。

### 3. 動いていることを確かめる

```bash
node scripts/check-mcp.mjs
```

登録されているだけで起動しない状態を検出します。**登録の有無は設定を読めば
分かりますが、動くかどうかは起動しないと分かりません。** このリポジトリでも
実際に、`.gitignore` 済みのファイルを指していて clone 環境では常に起動失敗
していた時期がありました。

## 生成に切り替える

手書きの一覧をやめると、遅れが構造的に起きなくなります。

| 生成物             | 単一ソース         | 参考実装                                |
| ------------------ | ------------------ | --------------------------------------- |
| 部品の仕様         | Storybook の story | `scripts/export-component-metadata.mjs` |
| CSS 変数           | テーマ定義         | `scripts/export-css-vars.ts`            |
| 禁止パターンの文書 | ルールの manifest  | `scripts/export-prohibited-doc.mjs`     |

story から部品仕様を作る発想が要点です。`title` / `component` / `argTypes` /
`description` は**すでに書いてあります**。それを読めば、部品を足したときに
一覧へ載せ忘れることがなくなります。

**生成側で prettier を通してください。** 素の `JSON.stringify` は短い配列も
必ず展開するため、pre-commit の整形と食い違って鮮度チェックが恒常的に落ちます。

## ルールに「強制手段」を持たせる

禁止パターンを列挙するだけでは足りません。**何がそれを止めるのか**を一緒に
持ってください。

```js
// scripts/lib/ds-rules.mjs
{
  id: 'C03',
  forbidden: '`export default`',
  instead: '`export const` で named export',
  enforcedBy: 'ESLint `import/no-default-export`（error）',  // null なら止めるものが無い
  detect: codeMatcher(/^export default\b/),                 // 数える関数（任意）
}
```

こうすると、文書は生成物になり、**「何が強制するか」を書かずにルールを
増やせなくなります**。強制が無いものは表に「なし」と出ます。

kaze-ux で実際に測ったところ、`export default` 禁止は **33 箇所で破られ、
止めるものは何もありませんでした**。書いてあるだけのルールは、AI にとって
嘘の仕様になります。説明を読んだ AI は従い、コードを読んだ AI は真似るので、
どちらが正しいか判断できません。

## 検出器を書くときの注意

素朴な grep は**両方向に間違えます**。このリポジトリで実際に踏んだものです。

| やったこと                     | 出た結果   | 実際                              |
| ------------------------------ | ---------- | --------------------------------- |
| `React.FC` を grep             | 違反 12 件 | 0 件（全部 FAQ の解説文）         |
| `outline: none` を grep        | 違反 5 件  | 0 件（全部 focus-visible と併用） |
| コメントを落として行番号を報告 | 80 行目    | 95 行目                           |

対策は 3 つです。**文字列とコメントを落としてから当てる**、文脈が要るものは
原文の近傍も見る、**落とした範囲の改行は残す**（行数がずれると報告した行番号
が実ファイルと食い違い、調査できません）。

実装は `scripts/lib/ds-rules.mjs` の `stripLiteralsAndComments` にあります。

## 検査は「壊して赤くなること」を確認してから信用する

緑を見ただけでは、検査が機能しているのか、そもそも何も見ていないのか
区別できません。導入時に必ず一度壊してください。

このリポジトリでは全ての検査でこれをやっており、実際に**何も検証していない
検査**を作りかけたことが複数回あります。

## 持っていけないもの

- **部品そのもの。** kaze-ux の部品は 71 件中 64 件が MUI 製です
- トークンの値・ルールの中身。これはプロジェクト固有です

持っていけるのは**型**です。生成の流れ、MCP の配り方、検査の書き方、
そして「書いたことが守られているかを測る」という運用。

## 参考

- 検査の全体像と、測って初めて分かったこと: [verification.md](verification.md)
- MUI 無しで色に乗る方法: [../design-tokens/README.md](../design-tokens/README.md)
- 禁止パターンの実例: [../foundations/prohibited.md](../foundations/prohibited.md)
