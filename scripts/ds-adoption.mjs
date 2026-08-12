#!/usr/bin/env node
/**
 * デザインシステムの準拠率を測る。
 *
 * 「DS に同等品があるのに MUI を直接使っている箇所」を数える。
 * grep の件数ではなく、import 元を解決したうえで JSX の実利用回数を数える。
 *
 * Box / Grid / Stack / Typography のようなレイアウト原始要素は DS に
 * 同等品が無いので、直接使うのが正しい。これを分母に入れると
 * 「準拠率 20%」のような、実態と無関係な数字になる。
 *
 *   pnpm ds:adoption          一覧を表示
 *   pnpm ds:adoption --strict 未準拠が 1 件でもあれば exit 1
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { DS_COUNTED, DS_EQUIVALENT } from './ds-equivalents.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const TARGETS = [
  ['saas-dashboard', 'apps/saas-dashboard/src'],
  ['kaze-eats', 'apps/kaze-eats/src'],
  ['sky-kaze', 'apps/sky-kaze/src'],
  ['LP (src/pages)', 'src/pages'],
]

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) {
      if (['node_modules', 'dist', '__tests__'].includes(e)) continue
      walk(p, out)
    } else if (/\.tsx$/.test(e) && !/\.stories\.tsx$/.test(e)) {
      out.push(p)
    }
  }
  return out
}

/** import 文から「値として入ってきた名前 → モジュール」を作る。型のみの import は除く */
const parseImports = (src) => {
  const map = new Map()
  const typeOnly = new Set()
  for (const m of src.matchAll(
    /import\s+(type\s+)?([^'"]+?)\s+from\s+['"]([^'"]+)['"]/g
  )) {
    const isType = Boolean(m[1])
    const braced = m[2].match(/\{([^}]*)\}/)
    if (braced) {
      for (const part of braced[1].split(',')) {
        const t = part.trim()
        if (!t) continue
        const inlineType = /^type\s+/.test(t)
        const clean = t.replace(/^type\s+/, '')
        const name = (clean.split(/\s+as\s+/)[1] ?? clean).trim()
        if (!name) continue
        if (isType || inlineType) typeOnly.add(name)
        else map.set(name, m[3])
      }
    }
    const head = m[2]
      .replace(/\{[^}]*\}/, '')
      .replace(/,/g, ' ')
      .trim()
    for (const tok of head.split(/\s+/)) {
      if (!tok || tok === '*' || tok === 'as') continue
      if (isType) typeOnly.add(tok)
      else map.set(tok, m[3])
    }
  }
  return { map, typeOnly }
}

/**
 * JSX の開始タグを拾う。
 *
 * 直前が識別子の文字なら型引数 (`useState<Theme>` / `Array<Foo>`) なので数えない。
 */
const JSX_OPEN = /(?<![A-Za-z0-9_$])<([A-Z][A-Za-z0-9_]*)/g

const isDs = (mod) =>
  mod.startsWith('@/components') || mod.startsWith('@/layouts')
const isMui = (mod) =>
  mod === '@mui/material' || mod.startsWith('@mui/material/')

const analyze = (dir) => {
  const bypass = new Map()
  const bySite = []
  let dsUse = 0
  // MUI に同等品が無い DS 部品。分子には数えないが、情報としては出す
  const dsOnly = new Map()
  for (const file of walk(join(ROOT, dir))) {
    const src = readFileSync(file, 'utf8')
    const { map, typeOnly } = parseImports(src)
    const lines = src.split('\n')
    for (const m of src.matchAll(JSX_OPEN)) {
      const name = m[1]
      if (typeOnly.has(name)) continue
      const mod = map.get(name)
      if (!mod) continue
      if (isDs(mod)) {
        if (DS_COUNTED.has(name)) dsUse++
        else dsOnly.set(name, (dsOnly.get(name) ?? 0) + 1)
      } else if (isMui(mod) && DS_EQUIVALENT[name]) {
        bypass.set(name, (bypass.get(name) ?? 0) + 1)
        const line = src.slice(0, m.index).split('\n').length
        bySite.push({
          file: file.replace(ROOT + '/', ''),
          line,
          name,
          text: (lines[line - 1] ?? '').trim().slice(0, 70),
        })
      }
    }
  }
  return { dsUse, bypass, bySite, dsOnly }
}

const strict = process.argv.includes('--strict')
const pad = (s, n) => String(s).padEnd(n)
const rows = TARGETS.map(([app, dir]) => ({ app, ...analyze(dir) }))

console.log('\n== DS 準拠率（DS に同等品がある部品の利用箇所） ==\n')
console.log(pad('app', 18), pad('DS 使用', 9), pad('MUI 直', 8), 'DS 準拠率')
let totalDs = 0
let totalBypass = 0
for (const r of rows) {
  const b = [...r.bypass.values()].reduce((a, c) => a + c, 0)
  const denom = r.dsUse + b
  totalDs += r.dsUse
  totalBypass += b
  console.log(
    pad(r.app, 18),
    pad(r.dsUse, 9),
    pad(b, 8),
    denom ? ((r.dsUse / denom) * 100).toFixed(1) + '%' : '—'
  )
}
const total = totalDs + totalBypass
console.log(
  '\n  合計:',
  `DS ${totalDs} / MUI 直 ${totalBypass} → ${total ? ((totalDs / total) * 100).toFixed(1) : '—'}%`
)

const dsOnlyTotal = rows.reduce(
  (n, r) => n + [...r.dsOnly.values()].reduce((a, c) => a + c, 0),
  0
)
console.log(
  `  参考: MUI に同等品が無い DS 部品の利用 ${dsOnlyTotal} 箇所`,
  '（PageHeader / SectionTitle / KazeLogo 等。分子には数えない）'
)

const sites = rows.flatMap((r) => r.bySite)
if (sites.length) {
  console.log('\n== 未準拠の箇所 ==')
  for (const s of sites) {
    console.log(`  ${s.file}:${s.line}`)
    console.log(`    <${s.name}> → ${DS_EQUIVALENT[s.name]}`)
  }
  console.log(
    '\n  レイアウト原始要素 (Box / Grid / Stack / Typography 等) は',
    'DS に同等品が無いため対象外です。'
  )
}

if (strict && sites.length) {
  console.error(`\n❌ 未準拠 ${sites.length} 箇所`)
  process.exit(1)
}
console.log('')
