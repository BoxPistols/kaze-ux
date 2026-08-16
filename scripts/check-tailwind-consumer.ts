/**
 * **README に書いた手順どおりにやったら色が付くか**を、実際にやって確かめる。
 *
 *   pnpm check:tailwind-consumer
 *
 * ## なぜ要るか
 *
 * `check:css-vars` は生成した CSS 単体を測る。しかし利用者が踏む経路は
 * 「README を読む → tailwind.config を書く → ビルドする → 描画される」で、
 * **途中のどこが欠けても色は付かない**。実際この検証中に、`content` の
 * パスが cwd 基準であることに気づかず「変数は出ているのにユーティリティが
 * 1 つも生成されない」状態を踏んだ。CSS 単体の検査では通ってしまう。
 *
 * ## 何をするか
 *
 * 1. `design-tokens/README.md` の tailwind.config のコードブロックを
 *    **そのまま取り出す**（写経しない。写経すると README が古くなっても
 *    検査が通り続ける）
 * 2. kaze-ux のソースを一切参照しない一時プロジェクトを組む。
 *    置くのは配布物の CSS だけ
 * 3. tailwind をビルドする
 * 4. 実ブラウザで light / dark の描画色を読み、テーマの値と突き合わせる
 */
import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  mkdtempSync,
  copyFileSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'

import { chromium } from 'playwright'

import {
  createDarkThemeColors,
  createLightThemeColors,
} from '../src/themes/colorToken'

const ROOT = resolve(import.meta.dirname, '..')
const README = resolve(ROOT, 'design-tokens', 'README.md')
const CSS = resolve(ROOT, 'design-tokens', 'kaze-tokens.css')
const TAILWIND_BIN = resolve(ROOT, 'node_modules', '.bin', 'tailwindcss')

// --- 1. README から設定を取り出す ---

const readme = readFileSync(README, 'utf-8')
const marked = readme.match(
  /<!-- kaze:tailwind-config:begin -->([\s\S]*?)<!-- kaze:tailwind-config:end -->/
)
if (!marked) {
  console.error(
    '❌ design-tokens/README.md に kaze:tailwind-config のマーカーが見つかりません。' +
      'README の構成を変えたなら、この検査の取り出し方も直してください'
  )
  process.exit(1)
}
const fence = marked[1].match(/```js\n([\s\S]*?)```/)
if (!fence) {
  console.error('❌ マーカーの中に js のコードブロックがありません')
  process.exit(1)
}
const config = fence[1]

// 取り出せた内容が設定として成立しているか。空や別物を掴んでいたら
// 「検査していないのに緑」になる
for (const required of ['export default', 'colors:', 'var(--color-primary)']) {
  if (!config.includes(required)) {
    console.error(`❌ 取り出した設定に "${required}" が含まれていません`)
    process.exit(1)
  }
}

// --- 2. kaze-ux を参照しないプロジェクトを組む ---

const dir = mkdtempSync(resolve(tmpdir(), 'kaze-tw-consumer-'))
mkdirSync(dir, { recursive: true })
copyFileSync(CSS, resolve(dir, 'kaze-tokens.css'))
writeFileSync(resolve(dir, 'tailwind.config.js'), config, 'utf-8')
writeFileSync(
  resolve(dir, 'input.css'),
  "@import './kaze-tokens.css';\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n",
  'utf-8'
)
writeFileSync(
  resolve(dir, 'index.html'),
  `<!doctype html><html><head><link rel="stylesheet" href="out.css"></head>
<body class="bg-background text-foreground">
  <button id="solid" class="bg-primary-main text-primary-foreground">Primary</button>
  <span id="ink" class="text-error-ink">Error</span>
  <div id="card" class="bg-background-paper border border-border">
    <p id="muted" class="text-muted">secondary</p>
  </div>
</body></html>`,
  'utf-8'
)

// --- 3. ビルド ---

try {
  execFileSync(
    TAILWIND_BIN,
    ['-c', './tailwind.config.js', '-i', './input.css', '-o', './out.css'],
    // content のパスは cwd 基準。設定ファイルの場所ではない
    { cwd: dir, stdio: 'pipe' }
  )
} catch (e) {
  console.error('❌ tailwind のビルドに失敗しました')
  console.error(String((e as { stderr?: Buffer }).stderr ?? e))
  rmSync(dir, { recursive: true, force: true })
  process.exit(1)
}

const out = readFileSync(resolve(dir, 'out.css'), 'utf-8')
const utilities = ['.bg-primary-main', '.text-error-ink', '.text-muted']
const missingUtils = utilities.filter((u) => !out.includes(u))
if (missingUtils.length) {
  console.error(
    `❌ ユーティリティが生成されていません: ${missingUtils.join(', ')}\n` +
      '   content のパスが解決できていない可能性があります（cwd 基準）'
  )
  rmSync(dir, { recursive: true, force: true })
  process.exit(1)
}

// --- 4. 実ブラウザで測る ---

const READ = `(() => {
  const cs = (id) => getComputedStyle(document.getElementById(id));
  return {
    solidBg: cs('solid').backgroundColor,
    solidFg: cs('solid').color,
    errorInk: cs('ink').color,
    cardBg: cs('card').backgroundColor,
    muted: cs('muted').color,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
})()`

const toRgb = (hex: string) => {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h
  const n = parseInt(full, 16)
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`
}

const browser = await chromium.launch()
let ng = 0
let checked = 0

for (const mode of ['light', 'dark'] as const) {
  const c =
    mode === 'light'
      ? createLightThemeColors('kaze')
      : createDarkThemeColors('kaze')
  const ctx = await browser.newContext({ colorScheme: 'light' })
  const page = await ctx.newPage()
  await page.goto(`file://${dir}/index.html`)
  // README が案内している .dark（Tailwind の darkMode: 'class'）で切り替える
  if (mode === 'dark')
    await page.evaluate("document.documentElement.classList.add('dark')")

  const got = (await page.evaluate(READ)) as Record<string, string>
  const want: Record<string, string> = {
    solidBg: toRgb(c.primary.main),
    solidFg: toRgb(c.primary.contrastText),
    errorInk: toRgb(c.error.textContrast as string),
    cardBg: toRgb(c.background.paper),
    muted: toRgb(c.text.secondary),
    bodyBg: toRgb(c.background.default),
  }

  for (const k of Object.keys(want)) {
    checked++
    if (got[k] !== want[k]) {
      ng++
      console.error(`❌ ${mode} / ${k}: 実測 ${got[k]} / 期待 ${want[k]}`)
    }
  }
  await ctx.close()
}

await browser.close()
rmSync(dir, { recursive: true, force: true })

console.log(
  `README の手順で組んだプロジェクトを light / dark で描画し、${checked} 箇所を測定`
)
if (ng) {
  console.error(`\n❌ ${ng} 箇所がテーマの値と一致しませんでした`)
  process.exit(1)
}
console.log('✅ kaze-ux のソースを参照せずに、配布 CSS だけで色が付いています')
