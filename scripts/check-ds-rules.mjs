#!/usr/bin/env node
/**
 * 禁止パターンが**実際に守られているか**を数える。
 *
 *   pnpm check:rules              違反があれば exit 1
 *   pnpm check:rules --report     数えるだけ（exit 0）
 *
 * ## なぜ要るか
 *
 * `foundations/prohibited.md` は 27 ルールを列挙していたが、どれが実際に
 * 守られているかはどこにも無かった。実測すると `export default` 禁止は
 * **33 箇所で破られていた**。
 *
 * 書いてあるが守られていないルールは、AI にとって嘘の仕様になる。
 * 説明を読んだ AI は従い、コードを読んだ AI は真似る。どちらが正しいのか
 * 判断できない。
 *
 * ## 検出器の精度について
 *
 * 素朴な grep は**両方向に間違える**。実際に踏んだ 2 つ:
 * - `React.FC` を grep したら 12 件出たが、全部 FAQ の**解説文**だった
 * - `outline: none` を 5 件検出したが、全部 focus-visible と併用されており
 *   違反ではなかった
 *
 * そのため検出器は文字列とコメントを落としてから当て、文脈が要るものは
 * 近傍も見る（scripts/lib/ds-rules.mjs）。
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { DS_RULES, UNENFORCED_RULES } from './lib/ds-rules.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const REPORT_ONLY = process.argv.includes('--report')

/** 検査対象。story と test は「悪い例」や解説を含むため外す */
const TARGET_DIRS = [
  'src/components',
  'src/themes',
  'src/pages',
  'src/layouts',
  'src/utils',
  'apps/saas-dashboard/src',
  'apps/kaze-eats/src',
  'apps/sky-kaze/src',
]
const SKIP = /(__tests__|\.test\.|\.stories\.|\.d\.ts$)/

const collect = (dir) => {
  const abs = resolve(ROOT, dir)
  if (!existsSync(abs)) return []
  const out = []
  for (const e of readdirSync(abs, { withFileTypes: true })) {
    const p = join(abs, e.name)
    if (e.isDirectory()) out.push(...collect(relative(ROOT, p)))
    else if (/\.tsx?$/.test(e.name) && !SKIP.test(p)) out.push(p)
  }
  return out
}

const files = TARGET_DIRS.flatMap(collect)
if (files.length === 0) {
  console.error(
    '❌ 検査対象のファイルが 1 件もありません（対象ディレクトリの指定を確認）'
  )
  process.exit(1)
}

const results = []
for (const rule of DS_RULES) {
  if (!rule.detect) continue
  const hits = []
  for (const f of files) {
    const src = readFileSync(f, 'utf-8')
    for (const h of rule.detect(src)) {
      hits.push({ file: relative(ROOT, f), ...h })
    }
  }
  results.push({ rule, hits })
}

const violated = results.filter((r) => r.hits.length > 0)
const detectable = results.length

console.log(
  `禁止パターン ${DS_RULES.length} 件 / 機械的に測れるもの ${detectable} 件 / ` +
    `対象 ${files.length} ファイル`
)

for (const { rule, hits } of results) {
  const mark = hits.length === 0 ? '✅' : '❌'
  const enforced = rule.enforcedBy ?? '（強制なし）'
  console.log(
    `  ${mark} ${rule.id} ${rule.forbidden.replace(/`/g, '')} — 違反 ${hits.length} 件 / 強制: ${enforced}`
  )
  for (const h of hits.slice(0, 5)) {
    console.log(`       ${h.file}:${h.line}  ${h.text.slice(0, 70)}`)
  }
  if (hits.length > 5) console.log(`       ... 他 ${hits.length - 5} 件`)
}

// 測れないものを黙って隠さない
const unmeasurable = DS_RULES.filter((r) => !r.detect)
console.log(
  `\n機械的に測っていないルール ${unmeasurable.length} 件: ` +
    unmeasurable.map((r) => r.id).join(', ')
)
console.log(
  `  うち別の仕組みが担保: ${
    unmeasurable
      .filter((r) => r.enforcedBy)
      .map((r) => r.id)
      .join(', ') || 'なし'
  }`
)
console.log(
  `  止めるものが無い: ${
    UNENFORCED_RULES.filter((r) => !r.detect)
      .map((r) => r.id)
      .join(', ') || 'なし'
  }`
)

if (violated.length && !REPORT_ONLY) {
  console.error(
    `\n❌ ${violated.length} 種類のルールが破られています（計 ${violated.reduce((a, v) => a + v.hits.length, 0)} 箇所）`
  )
  process.exit(1)
}
if (violated.length) {
  console.log(
    `\n⚠ ${violated.length} 種類のルールが破られています（--report のため exit 0）`
  )
} else {
  console.log('\n✅ 機械的に測れる禁止パターンの違反はありません')
}
