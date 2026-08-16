# design-tokens — MUI 無しで kaze-ux の色を使う

このディレクトリの 2 ファイルは **どちらも生成物** で、`src/themes/` が単一
ソースです。手で編集しないでください。

| ファイル          | 中身                                                                          | 再生成               |
| ----------------- | ----------------------------------------------------------------------------- | -------------------- |
| `kaze-tokens.css` | CSS カスタムプロパティ（`--color-*` / `--motion-*`）。3 スキーム × light/dark | `pnpm export-css`    |
| `tokens.json`     | W3C DTCG 形式のトークン。Figma・他ツール連携用                                | `pnpm export-tokens` |

CI が「再生成して差分が出ないこと」を検査しているので、古いまま配られる
ことはありません（`.github/workflows/quality-check.yml`）。

## Tailwind のプロダクトから使う

kaze-ux 本体は MUI と Tailwind を併用していますが、**色の経路に MUI は
入っていません**。`tailwind.config` が `var(--color-primary)` のように
変数を参照する形なので、変数さえ出ていればクラス名がそのまま通ります。

```ts
// 1. CSS を読み込む
import 'kaze-tokens.css' // パスは配置先に合わせる
```

<!-- kaze:tailwind-config:begin -->

```js
// 2. tailwind.config で変数を参照する（kaze-ux 本体と同じ形）
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          main: 'var(--color-primary)',
          ink: 'var(--color-primary-ink)',
          foreground: 'var(--color-primary-foreground)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: {
          main: 'var(--color-secondary)',
          ink: 'var(--color-secondary-ink)',
          foreground: 'var(--color-secondary-foreground)',
          dark: 'var(--color-secondary-dark)',
        },
        success: {
          main: 'var(--color-success)',
          ink: 'var(--color-success-ink)',
          foreground: 'var(--color-success-foreground)',
        },
        warning: {
          main: 'var(--color-warning)',
          ink: 'var(--color-warning-ink)',
          foreground: 'var(--color-warning-foreground)',
        },
        info: {
          main: 'var(--color-info)',
          ink: 'var(--color-info-ink)',
          foreground: 'var(--color-info-foreground)',
        },
        error: {
          main: 'var(--color-error)',
          ink: 'var(--color-error-ink)',
          foreground: 'var(--color-error-foreground)',
        },
        background: {
          DEFAULT: 'var(--color-background)',
          paper: 'var(--color-background-paper)',
        },
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        border: 'var(--color-border)',
        ring: 'var(--color-ring)',
        accent: {
          DEFAULT: 'var(--color-action-hover)',
          foreground: 'var(--color-foreground)',
        },
      },
    },
  },
}
```

<!-- kaze:tailwind-config:end -->

これで `bg-primary-main` `text-error-ink` などが使えます。MUI も Emotion も
不要です。

> **`content` のパスは実行時のカレントディレクトリ基準**で、設定ファイルの
> 場所基準ではありません。別ディレクトリから tailwind を起動すると走査対象が
> 0 件になり、**変数は出るのにユーティリティが 1 つも生成されない**という
> 形で出ます（この検証中に実際に踏みました）。

> `darkMode: 'class'` は**色の切り替えには不要**です。light / dark の出し
> 分けは CSS 側で完結しているので、`.dark` を付けるだけで色は変わります
> （検証で確認済み）。この設定が要るのは、利用者側が `dark:` バリアントを
> 自分で書く場合だけです。

**この手順は `pnpm check:tailwind-consumer` が実際に動かして検証しています。**
上のコードブロックをそのまま取り出し、kaze-ux のソースを一切参照しない
プロジェクトを組んで tailwind をビルドし、実ブラウザで light / dark の
描画色をテーマの値と突き合わせます。README が古くなれば落ちます。

## ダークとスキームの切り替え

ダークは 4 通りを見ます。**OS 設定より明示指定が優先されます。**

| 指定                                        | 意味                                 |
| ------------------------------------------- | ------------------------------------ |
| なし                                        | `prefers-color-scheme` に従う        |
| `data-theme="dark"` \| `"light"`            | 明示切替（一般的な実装 / Storybook） |
| `data-mui-color-scheme="dark"` \| `"light"` | MUI CssVarsProvider を使う場合       |
| `class="dark"`                              | Tailwind の dark クラス運用          |

スキームは属性で選びます。既定は `kaze` で、`:root` に出ています。

```html
<html data-kaze-scheme="dracula" data-theme="dark"></html>
```

スキーム × モードは属性 2 つの複合セレクタ (0,2,0) なので、モードだけの
指定 (0,1,0) に詳細度で勝ちます。この優先関係は
`pnpm check:css-vars` が **実ブラウザの computed value** で検査しています
（11 パターン / 変数 484 件）。詳細度と順序はソースを読んでも判定できない
ためです。

## `--color-*-ink` は何か

面ではなく**文字・アイコンとして置く色**です。`--color-primary` をそのまま
文字色にすると、明るいセマンティック色（info など）は白地で 2.6:1 程度しか
出ません。`-ink` は実際に敷かれる面（paper / default / lighter）すべてに
対して本文 AA を満たすよう実測で決めた値です。

**文字には `-ink`、塗り面には無印**を使ってください。

## 使えないもの

コンポーネントはここには含まれません。kaze-ux の部品は 71 件中 64 件が
MUI 製なので、持ち込むには移植が要ります。MUI 非依存で成立している範囲の
定義は `scripts/ds-core.mjs` にあります。
