#!/usr/bin/env node
/**
 * DS コア層が UI ライブラリに依存していないことを、**依存グラフを辿って**確かめる。
 *
 *   pnpm check:ds-core
 *
 * ## なぜ ESLint と別に要るか
 *
 * `eslint.config.js` の `kaze/ds-core-no-ui-library` は、コアのファイルが
 * 直接 `@mui/*` を import することを止める。しかしそれだけでは
 * **コア外のファイルを 1 枚挟めば素通りする**。
 *
 *   colorToken.ts → ./someHelper.ts → @mui/material/styles
 *
 * ESLint はファイル単位でしか見ないので、この経路は検出できない。ここでは
 * コアの各ファイルから相対 import を再帰的に辿り、閉じているかを見る。
 *
 * ## 何を検査するか
 *
 * 1. 一覧のファイルが実在すること（欠けていたら失敗。**黙ってスキップさせない**）
 * 2. bare specifier が許可リストに入っていること
 * 3. 相対 import の行き先がコアの外に出ていないこと
 *
 * 2 と 3 を両方見るのが要点で、3 が無いと「コア外を経由した依存」を見逃す。
 *
 * 一覧の単一ソースは scripts/ds-core.mjs（ESLint も同じ表を見る）。
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'

import {
  DS_CORE_ALLOWED_PACKAGES,
  DS_CORE_MODULES,
  DS_CORE_VIOLATION_MESSAGE,
} from './ds-core.mjs'

const ROOT = resolve(import.meta.dirname, '..')

/**
 * import / export の参照先を全部拾う。
 *
 * 行頭を前提にすると複数行 import を取りこぼすので、ファイル全体に当てる。
 * 副作用 import (`import '@mui/material/Typography'`) は `from` を持たない
 * ため別の枝で拾う。**実際にこの形の MUI 依存が typography.ts に隠れていた。**
 */
const SPECIFIER_PATTERNS = [
  /\bfrom\s+['"]([^'"]+)['"]/g, // import ... from 'x' / export ... from 'x'
  /\bimport\s+['"]([^'"]+)['"]/g, // import 'x'（副作用のみ）
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g, // await import('x')
]

const specifiersOf = (source) => {
  const found = new Set()
  for (const re of SPECIFIER_PATTERNS) {
    for (const m of source.matchAll(re)) found.add(m[1])
  }
  return [...found]
}

/** 相対 specifier を実ファイルへ解決する（拡張子省略に対応） */
const resolveRelative = (fromFile, spec) => {
  const base = resolve(dirname(resolve(ROOT, fromFile)), spec)
  for (const cand of [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ]) {
    if (existsSync(cand) && !cand.endsWith('/')) return relative(ROOT, cand)
  }
  return null
}

const core = new Set(DS_CORE_MODULES)
const allowed = new Set(DS_CORE_ALLOWED_PACKAGES)
const violations = []

// 1. 一覧が実在するか。全部欠けていたらループが回らず、検査していないのに
//    緑になる。ここで落としておく
const missing = DS_CORE_MODULES.filter((f) => !existsSync(resolve(ROOT, f)))
if (missing.length) {
  console.error(
    `❌ scripts/ds-core.mjs に載っているのに存在しないファイルがあります:\n` +
      missing.map((f) => `   ${f}`).join('\n')
  )
  process.exit(1)
}
if (DS_CORE_MODULES.length === 0) {
  console.error('❌ コアの一覧が空です。検査対象がありません')
  process.exit(1)
}

// 2 + 3. コアから辿れる範囲を全部見る
const visited = new Set()
const queue = [...DS_CORE_MODULES]
let importsChecked = 0

while (queue.length) {
  const file = queue.shift()
  if (visited.has(file)) continue
  visited.add(file)

  const source = readFileSync(resolve(ROOT, file), 'utf8')
  for (const spec of specifiersOf(source)) {
    importsChecked++
    if (spec.startsWith('.')) {
      const target = resolveRelative(file, spec)
      if (!target) {
        violations.push(`${file}: '${spec}' を解決できません`)
        continue
      }
      if (!core.has(target)) {
        violations.push(
          `${file} → ${target}\n      コアの外へ出ています。` +
            `辿った先が UI ライブラリに触れると、コアも依存することになります。` +
            `コアに入れるなら scripts/ds-core.mjs へ追加してください`
        )
        continue
      }
      queue.push(target)
      continue
    }
    // bare specifier
    const pkg = spec.startsWith('@')
      ? spec.split('/').slice(0, 2).join('/')
      : spec.split('/')[0]
    if (!allowed.has(pkg)) {
      violations.push(
        `${file}: '${spec}' (${pkg})\n      ${DS_CORE_VIOLATION_MESSAGE}`
      )
    }
  }
}

console.log(
  `DS コア ${DS_CORE_MODULES.length} ファイル / 到達 ${visited.size} ファイル / ` +
    `参照 ${importsChecked} 件を検査 / 許可パッケージ: ${[...allowed].join(', ')}`
)

if (violations.length) {
  console.error(`\n❌ コア層の依存に違反があります (${violations.length} 件)`)
  for (const v of violations) console.error(`   ${v}`)
  process.exit(1)
}

console.log(
  '\n✅ DS コア層は UI ライブラリに依存していません（MUI があってもなくても使えます）'
)
