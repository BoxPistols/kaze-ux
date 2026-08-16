/**
 * 生成した CSS 変数が **実ブラウザで意図どおり解決するか**を測る。
 *
 *   pnpm check:css-vars
 *
 * ## なぜ生成だけでは足りないか
 *
 * design-tokens/kaze-tokens.css は MUI を入れないプロダクトが読む唯一の
 * 色の入口。ここが間違っていても、生成は成功しファイルも存在するので、
 * **相手の画面で色が違う形でしか露見しない**。
 *
 * とくに壊れやすいのが詳細度と順序。
 *
 * - スキーム属性 (0,1,0) とモード属性 (0,1,0) は同じ重み。順序を間違えると
 *   「dracula のダーク」を指定したのに kaze のダークが出る
 * - `prefers-color-scheme: dark` の指定が、明示ライトに勝ってしまう
 *
 * どちらもソースを読んでも判定できない。computed style を読む。
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { chromium } from 'playwright'

import {
  createCssVars,
  createDarkThemeColors,
  createLightThemeColors,
} from '../src/themes/colorToken'
import { parseColor } from '../src/themes/contrast'

import type { ColorScheme } from '../src/themes/colorToken'

/**
 * 色として等しいかを見る。**文字列で比べてはいけない。**
 *
 * ブラウザも prettier も表記を正規化する（`#0057B8` → `#0057b8`、
 * `rgba(…, 0.10)` → `rgba(…, 0.1)`）。表記差を不一致として報告すると、
 * 本物の退行が埋もれるうえ、整形を変えるたびに赤くなる。
 */
const sameColor = (a: string, b: string) => {
  if (a.trim().toLowerCase() === b.trim().toLowerCase()) return true
  try {
    const x = parseColor(a)
    const y = parseColor(b)
    return (
      x.r === y.r && x.g === y.g && x.b === y.b && Math.abs(x.a - y.a) < 0.001
    )
  } catch {
    // 色として解釈できないものは表記で比べるしかない
    return false
  }
}

const CSS_PATH = resolve(
  import.meta.dirname,
  '..',
  'design-tokens',
  'kaze-tokens.css'
)
const css = readFileSync(CSS_PATH, 'utf-8')

interface Case {
  name: string
  /** html 要素に付ける属性 */
  attrs: Record<string, string>
  /** OS のダーク設定 */
  prefersDark: boolean
  expect: Record<string, string>
}

const light = (s: ColorScheme) => createCssVars(createLightThemeColors(s))
const dark = (s: ColorScheme) => createCssVars(createDarkThemeColors(s))

const CASES: Case[] = [
  {
    name: '既定 / ライト',
    attrs: {},
    prefersDark: false,
    expect: light('kaze'),
  },
  {
    name: '既定 / OS ダーク',
    attrs: {},
    prefersDark: true,
    expect: dark('kaze'),
  },
  {
    name: "既定 / data-theme='dark'",
    attrs: { 'data-theme': 'dark' },
    prefersDark: false,
    expect: dark('kaze'),
  },
  {
    name: "既定 / data-mui-color-scheme='dark'",
    attrs: { 'data-mui-color-scheme': 'dark' },
    prefersDark: false,
    expect: dark('kaze'),
  },
  {
    name: '既定 / class="dark"',
    attrs: { class: 'dark' },
    prefersDark: false,
    expect: dark('kaze'),
  },
  {
    // 明示ライトは OS のダークより優先されなければならない
    name: '明示ライト + OS ダーク（明示が勝つこと）',
    attrs: { 'data-theme': 'light' },
    prefersDark: true,
    expect: light('kaze'),
  },
  {
    name: 'dracula / ライト',
    attrs: { 'data-kaze-scheme': 'dracula' },
    prefersDark: false,
    expect: light('dracula'),
  },
  {
    // スキーム × モードの複合が、モードだけの指定に勝つこと
    name: "dracula / data-theme='dark'",
    attrs: { 'data-kaze-scheme': 'dracula', 'data-theme': 'dark' },
    prefersDark: false,
    expect: dark('dracula'),
  },
  {
    name: 'dracula / OS ダーク',
    attrs: { 'data-kaze-scheme': 'dracula' },
    prefersDark: true,
    expect: dark('dracula'),
  },
  {
    name: 'monotone / ライト',
    attrs: { 'data-kaze-scheme': 'monotone' },
    prefersDark: false,
    expect: light('monotone'),
  },
  {
    name: "monotone / class='dark'",
    attrs: { 'data-kaze-scheme': 'monotone', class: 'dark' },
    prefersDark: false,
    expect: dark('monotone'),
  },
]

const browser = await chromium.launch()
let failed = 0
let checked = 0

for (const c of CASES) {
  const ctx = await browser.newContext({
    colorScheme: c.prefersDark ? 'dark' : 'light',
  })
  const page = await ctx.newPage()
  const attrs = Object.entries(c.attrs)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ')
  await page.setContent(
    `<!doctype html><html ${attrs}><head><style>${css}</style></head><body></body></html>`
  )

  const names = Object.keys(c.expect)
  const got = await page.evaluate((keys: string[]) => {
    const s = getComputedStyle(document.documentElement)
    return Object.fromEntries(
      keys.map((k) => [k, s.getPropertyValue(k).trim()])
    )
  }, names)

  const diffs = names.filter((k) => !sameColor(got[k], c.expect[k]))
  checked += names.length
  if (diffs.length) {
    failed++
    console.error(`\n❌ ${c.name}: ${diffs.length}/${names.length} 件が不一致`)
    for (const k of diffs.slice(0, 5)) {
      console.error(`   ${k}: 実測 ${got[k] || '(空)'} / 期待 ${c.expect[k]}`)
    }
    if (diffs.length > 5) console.error(`   ... 他 ${diffs.length - 5} 件`)
  } else {
    console.log(`✅ ${c.name} (${names.length} 変数)`)
  }
  await ctx.close()
}

await browser.close()

console.log(`\n${CASES.length} パターン / 変数 ${checked} 件を実ブラウザで測定`)

if (failed) {
  console.error(`\n❌ ${failed} パターンが期待と一致しませんでした`)
  process.exit(1)
}
console.log('✅ すべてテーマの値と一致（MUI 無しで色が解決できています）')
