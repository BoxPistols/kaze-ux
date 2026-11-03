/**
 * CLAUDE.md の Quick Reference が実装と一致しているかを確かめる。
 *
 *   pnpm check:quickref
 *
 * ## なぜ要るか
 *
 * Quick Reference は「このファイルだけで基本 UI 生成可能」と謳っている、
 * **AI が最初に読む場所**。ここがズレると、以降の生成すべてに効く。
 * しかも読んだ側からは正しいかどうか判断できない。
 *
 * 同じ形の穴を今日 3 回踏んだ（tokens.json の欠落 / components.json が
 * 33% / .mcp.json が存在しないファイルを参照）。**手で書いた値は必ず遅れる。**
 *
 * 今は全部一致している。この検査は「一致し続けること」を守るためのもの。
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { BRAND_BLUE, createLightThemeColors } from '../src/themes/colorToken'
import { theme } from '../src/themes/theme'

const ROOT = resolve(import.meta.dirname, '..')
const md = readFileSync(resolve(ROOT, 'CLAUDE.md'), 'utf-8')
const tokens = JSON.parse(
  readFileSync(resolve(ROOT, 'design-tokens', 'tokens.json'), 'utf-8')
) as { borderRadius: Record<string, { $value: string }> }

interface Check {
  what: string
  claimed: string | null
  actual: string
}

/** 文書から値を取り出す。取り出せなければ「書式が変わった」ものとして落とす */
const claim = (re: RegExp): string | null => {
  const m = md.match(re)
  return m ? m[1].trim() : null
}

const colors = createLightThemeColors('kaze')

const radiusClaim = claim(/\*\*角丸\*\*:\s*(.+)/)
const radiusActual = Object.entries(tokens.borderRadius)
  .filter(([k]) => !k.startsWith('$'))
  .map(([k, v]) => `${k}=${String(v.$value).replace('px', '')}`)
  .join(', ')

const fontFamily = String(theme.typography.fontFamily)

const checks: Check[] = [
  {
    what: 'ブランドカラー (primary.main)',
    claimed: claim(
      /\*\*ブランドカラー\*\*:\s*`primary\.main = (#[0-9A-Fa-f]{6})`/
    ),
    actual: colors.primary.main,
  },
  {
    what: 'ブランドカラーの単一ソース (BRAND_BLUE)',
    claimed: claim(
      /\*\*ブランドカラー\*\*:\s*`primary\.main = (#[0-9A-Fa-f]{6})`/
    ),
    actual: BRAND_BLUE,
  },
  {
    what: 'baseFontSize',
    claimed: claim(/baseFontSize = (\d+)px/),
    actual: String(theme.typography.fontSize),
  },
  {
    what: 'spacing(1)',
    claimed: claim(/`spacing\(1\)=(\d+)px`/),
    actual: String(theme.spacing(1)).replace('px', ''),
  },
  {
    what: 'spacing(2)',
    claimed: claim(/`spacing\(2\)=(\d+)px`/),
    actual: String(theme.spacing(2)).replace('px', ''),
  },
  {
    what: '角丸スケール',
    claimed: radiusClaim,
    actual: radiusActual,
  },
]

// フォント名は「含まれているか」で見る（fontFamily はフォールバックを持つ）
const fontsClaimed = claim(/\*\*フォント\*\*:\s*([^,]+),/)
const fontNames = (fontsClaimed ?? '').split('+').map((s) => s.trim())

let failed = 0

for (const c of checks) {
  if (c.claimed === null) {
    console.error(
      `❌ ${c.what}: CLAUDE.md から値を取り出せません。` +
        'Quick Reference の書式が変わったなら、この検査の抽出も直してください'
    )
    failed++
    continue
  }
  const ok = c.claimed.toLowerCase() === c.actual.toLowerCase()
  if (!ok) failed++
  console.log(
    `${ok ? '✅' : '❌'} ${c.what}: 文書 "${c.claimed}" / 実装 "${c.actual}"`
  )
}

if (fontNames.length === 0 || !fontsClaimed) {
  console.error('❌ フォント: CLAUDE.md から取り出せません')
  failed++
} else {
  const missing = fontNames.filter((n) => !fontFamily.includes(n))
  if (missing.length) failed++
  console.log(
    `${missing.length ? '❌' : '✅'} フォント: 文書 "${fontNames.join(' + ')}" / ` +
      `実装 "${fontFamily.slice(0, 40)}..."` +
      (missing.length ? `  未含有: ${missing.join(', ')}` : '')
  )
}

console.log(`\n${checks.length + 1} 項目を突き合わせ`)
if (failed) {
  console.error(
    `❌ ${failed} 項目が実装と一致しません。CLAUDE.md は AI が最初に読む場所なので、` +
      'ここがズレると以降の生成すべてに効きます'
  )
  process.exit(1)
}
console.log('✅ Quick Reference は実装と一致しています')
