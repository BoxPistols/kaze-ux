/**
 * DS の CSS 変数を **MUI 抜きで** 使える .css として書き出す。
 *
 *   pnpm export-css   →  design-tokens/kaze-tokens.css
 *
 * ## なぜ要るか
 *
 * `createCssVars()` は ThemeColors から `--color-*` を返す純関数で、MUI に
 * 依存していない。しかし現状それを `:root` へ流し込む経路は MUI の
 * `CssBaseline` の styleOverrides しかない。つまり **MUI を入れないと
 * 変数が出ない**。
 *
 * kaze-ux の Tailwind 側は `tailwind.config` が `var(--color-primary)` を
 * 参照する形なので、変数さえ出ていればクラス名（`bg-primary-main` 等）は
 * そのまま通る。この 1 枚があれば、Tailwind だけのプロダクトが MUI を
 * 入れずに DS の色に乗れる。
 *
 * ## セレクタの約束
 *
 * - `:root` … 既定スキーム (kaze) のライト
 * - ダーク … `prefers-color-scheme` に加えて、明示切替の 3 系統を見る。
 *   `[data-theme='dark']`（Storybook と一般的な実装）/
 *   `[data-mui-color-scheme='dark']`（MUI CssVarsProvider）/ `.dark`（Tailwind）
 * - 別スキーム … `[data-kaze-scheme='dracula']` のように属性で指定する。
 *   スキーム × モードは属性 2 つの複合セレクタ (0,2,0) になるので、
 *   モードだけの指定 (0,1,0) に詳細度で勝つ
 *
 * 明示指定がライトのときに `prefers-color-scheme: dark` が勝たないよう、
 * メディアクエリ側は `:not([data-theme='light'])` 等で降ろしている。
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { format, resolveConfig } from 'prettier'

import {
  COLOR_SCHEMES,
  createCssVars,
  createDarkThemeColors,
  createLightThemeColors,
} from '../src/themes/colorToken'
import { createMotionCssVars } from '../src/themes/motion'

import type { ColorScheme } from '../src/themes/colorToken'

const DEFAULT_SCHEME: ColorScheme = 'kaze'

/** ダークを明示している状態を表すセレクタ（実装によって流儀が違う） */
const DARK_MARKERS = [
  "[data-theme='dark']",
  "[data-mui-color-scheme='dark']",
  '.dark',
]

/** ライトを明示している状態。prefers-color-scheme より優先させる */
const LIGHT_MARKERS = [
  "[data-theme='light']",
  "[data-mui-color-scheme='light']",
]

const block = (selector: string, vars: Record<string, string>, indent = '') => {
  const body = Object.entries(vars)
    .map(([k, v]) => `${indent}  ${k}: ${v};`)
    .join('\n')
  return `${indent}${selector} {\n${body}\n${indent}}`
}

const schemeAttr = (s: ColorScheme) => `[data-kaze-scheme='${s}']`

const out: string[] = [
  '/**',
  ' * Kaze UX — CSS custom properties',
  ' *',
  ' * 生成物です。手で編集しないでください（pnpm export-css で再生成）。',
  ' * 生成元: src/themes/colorToken.ts, src/themes/motion.ts',
  ' *',
  ' * MUI は不要です。この 1 枚を読み込めば --color-* / --motion-* が使えます。',
  ' * ダークは prefers-color-scheme に加えて',
  " * [data-theme='dark'] / [data-mui-color-scheme='dark'] / .dark を見ます。",
  " * 別スキームは [data-kaze-scheme='dracula'] のように指定してください。",
  ' */',
  '',
]

// 既定スキームのライト + モーション（モーションはスキームに依らない）
out.push(
  block(':root', {
    ...createCssVars(createLightThemeColors(DEFAULT_SCHEME)),
    ...createMotionCssVars(),
  })
)
out.push('')

// 既定スキームのダーク（OS 設定）。明示ライトのときは降りる
const notLight = LIGHT_MARKERS.map((m) => `:not(${m})`).join('')
out.push('@media (prefers-color-scheme: dark) {')
out.push(
  block(
    `:root${notLight}`,
    createCssVars(createDarkThemeColors(DEFAULT_SCHEME)),
    '  '
  )
)
out.push('}')
out.push('')

// 既定スキームのダーク（明示切替）
out.push(
  block(
    DARK_MARKERS.join(',\n'),
    createCssVars(createDarkThemeColors(DEFAULT_SCHEME))
  )
)
out.push('')

// 既定以外のスキーム
for (const scheme of COLOR_SCHEMES) {
  if (scheme === DEFAULT_SCHEME) continue

  out.push(`/* ---- scheme: ${scheme} ---- */`)
  out.push(
    block(schemeAttr(scheme), createCssVars(createLightThemeColors(scheme)))
  )
  out.push('')

  out.push('@media (prefers-color-scheme: dark) {')
  out.push(
    block(
      `${schemeAttr(scheme)}${notLight}`,
      createCssVars(createDarkThemeColors(scheme)),
      '  '
    )
  )
  out.push('}')
  out.push('')

  // スキーム × モードは属性 2 つ (0,2,0) なので、モードだけの指定に勝つ
  out.push(
    block(
      DARK_MARKERS.map((m) =>
        m.startsWith('.')
          ? `${schemeAttr(scheme)}${m}`
          : `${schemeAttr(scheme)}${m}`
      ).join(',\n'),
      createCssVars(createDarkThemeColors(scheme))
    )
  )
  out.push('')
}

const OUTPUT_DIR = resolve(import.meta.dirname, '..', 'design-tokens')
mkdirSync(OUTPUT_DIR, { recursive: true })
const outputPath = resolve(OUTPUT_DIR, 'kaze-tokens.css')

// 生成側で prettier をかける。
//
// これをしないと pre-commit の prettier が生成物を書き換え、CI の鮮度
// チェック（再生成して差分が出ないこと）が恒常的に落ちる。tokens.json では
// 末尾改行だけの差だったので手で合わせたが、CSS は 16 進の小文字化など
// 揃えるべき点が多い。**整形の規則を写経せず、prettier 自身に通す**
const formatted = await format(out.join('\n'), {
  ...(await resolveConfig(outputPath)),
  parser: 'css',
})
writeFileSync(outputPath, formatted, 'utf-8')

const varCount = Object.keys({
  ...createCssVars(createLightThemeColors(DEFAULT_SCHEME)),
  ...createMotionCssVars(),
}).length
console.log(`CSS variables exported to: ${outputPath}`)
console.log(
  `  - 変数 ${varCount} 件 × スキーム ${COLOR_SCHEMES.length} × light/dark`
)
