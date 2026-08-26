#!/usr/bin/env node
/**
 * デザインシステムのカバレッジを定量化する。
 *
 *   pnpm ds:coverage            表で出す
 *   pnpm ds:coverage --json     機械可読
 *   pnpm ds:coverage --write    docs/coverage.md を生成する
 *
 * ## なぜ要るか
 *
 * 「デザインシステムが整っている」は、部品を数えるだけでは言えない。
 * **AI に仕様を渡して再生成させる**のがこのシステムの目的なので、
 * 測るべきは「AI が引ける情報がどれだけ揃っているか」と
 * 「破ったときに止まるか」の 2 つ。
 *
 * だから 4 面から測る。
 *
 * | 面 | 問い |
 * | -- | ---- |
 * | ルール | 禁止パターンのうち、機械が止められるのは何割か |
 * | 部品   | AI が引ける仕様（props / a11y / 実例）はどれだけ埋まっているか |
 * | トークン | 値が機械可読な形で出ているか |
 * | 採用   | 実際のアプリが DS を使っているか |
 *
 * **数えられないものは数えられないと書く。** 意匠の質・ドメイン知識は
 * ここに現れない（docs/operating-model.md の「守れないもの」）。
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { DS_RULES } from './lib/ds-rules.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const args = process.argv.slice(2)
const asJson = args.includes('--json')
const write = args.includes('--write')

const pct = (n, d) => (d === 0 ? 0 : Math.round((n / d) * 1000) / 10)

// --- 1. ルール ---------------------------------------------------------

/**
 * 検出器があるのに `enforcedBy` が空、という状態を許さない。
 *
 * `check:rules` は CI で走り、検出器のあるルールに違反があれば exit 1 する。
 * つまり**検出器がある = 止まる**。それを `enforcedBy: null` のまま置くと、
 * このカバレッジ表が「何も止めない」を過大に報告する。
 * 実際 C02 / C07 / A03 / AI04 の 4 件がその状態で、
 * 「何も止めないルール 38.1%」と出ていた（正しくは 19.0%）。
 */
const inconsistent = DS_RULES.filter((r) => r.detect && !r.enforcedBy)
if (inconsistent.length > 0) {
  console.error(
    '❌ 検出器があるのに enforcedBy が空のルール: ' +
      inconsistent.map((r) => r.id).join(', ') +
      '\n   check:rules（CI）が止めているはずなので、enforcedBy に書いてください。' +
      '\n   放置すると、このカバレッジ表が実態より悪く出ます。'
  )
  process.exit(1)
}

const rules = {
  total: DS_RULES.length,
  detectable: DS_RULES.filter((r) => r.detect).length,
  enforced: DS_RULES.filter((r) => r.enforcedBy).length,
  unenforced: DS_RULES.filter((r) => !r.enforcedBy).map((r) => ({
    id: r.id,
    forbidden: r.forbidden,
  })),
  byCategory: Object.entries(
    DS_RULES.reduce((acc, r) => {
      const c = (acc[r.category] ??= { total: 0, detectable: 0, enforced: 0 })
      c.total += 1
      if (r.detect) c.detectable += 1
      if (r.enforcedBy) c.enforced += 1
      return acc
    }, {})
  ).map(([category, v]) => ({ category, ...v })),
}

// --- 2. 部品メタデータ -------------------------------------------------

/**
 * AI が実際に引く項目だけを数える。
 * `name` / `category` は必ず入るので測っても意味が無い
 */
const META_FIELDS = [
  ['import', '置き場所。これが無いと AI は import 文を書けない'],
  ['description', '何のための部品か'],
  ['props', 'props 契約'],
  ['variants', 'バリエーション'],
  ['sizes', 'サイズ'],
  ['accessibility', 'a11y の要件'],
  ['sample', '実際に動くコード例'],
  ['prohibited', 'この部品固有の禁止事項'],
]

const filled = (value) => {
  if (value === undefined || value === null || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}

const metaJson = JSON.parse(
  readFileSync(resolve(ROOT, 'metadata/components.json'), 'utf8')
)
const components = Object.values(metaJson.components)
const metadata = {
  total: components.length,
  fields: META_FIELDS.map(([field, why]) => {
    const n = components.filter((c) => filled(c[field])).length
    return { field, why, filled: n, pct: pct(n, components.length) }
  }),
}

// --- 3. トークン -------------------------------------------------------

const tokensJson = JSON.parse(
  readFileSync(resolve(ROOT, 'design-tokens/tokens.json'), 'utf8')
)
const countTokens = (node) =>
  Object.entries(node).reduce((n, [key, value]) => {
    if (key.startsWith('$') || !value || typeof value !== 'object') return n
    return n + (value.$value !== undefined ? 1 : countTokens(value))
  }, 0)

const tokens = {
  total: countTokens(tokensJson),
  groups: Object.keys(tokensJson)
    .filter((k) => !k.startsWith('$'))
    .map((k) => ({ group: k, count: countTokens(tokensJson[k]) })),
}

// --- 4. アプリでの採用 -------------------------------------------------

/**
 * ds-adoption は独立したスクリプト。二重実装せず結果を借りる。
 * `--json` は標準出力ではなく生成物へ書き出す仕様なので、それを読む
 */
const ADOPTION_JSON = 'src/stories/00-Guide/ds-adoption.generated.json'
const adoption = (() => {
  try {
    execFileSync(
      process.execPath,
      [resolve(ROOT, 'scripts/ds-adoption.mjs'), '--json'],
      { encoding: 'utf8' }
    )
    return JSON.parse(readFileSync(resolve(ROOT, ADOPTION_JSON), 'utf8'))
  } catch {
    return null
  }
})()

// --- 出力 --------------------------------------------------------------

const report = { rules, metadata, tokens, adoption }

if (asJson) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

const lines = []
const p = (s = '') => lines.push(s)

p('# デザインシステムのカバレッジ')
p()
p('<!-- 生成物。`pnpm ds:coverage --write` で再生成する。直接編集しない -->')
p()
p('測っているのは「**AI が引ける情報が揃っているか**」と')
p('「**破ったときに止まるか**」の 2 つ。部品の数は指標にしていない。')
p()
p('数えられないもの（意匠の質・ドメイン知識・宣言すべき対象の判断）は')
p('ここに現れない。[`operating-model.md`](operating-model.md) の')
p('「この体制で守れないもの」を併せて読むこと。')
p()

p('## 1. ルール — 破ったときに止まるか')
p()
p(`禁止パターン **${rules.total} 件**。`)
p()
p('| 段階 | 件数 | 割合 |')
p('| ---- | ---- | ---- |')
p(
  `| 機械が検出できる（検出器あり） | ${rules.detectable} | ${pct(rules.detectable, rules.total)}% |`
)
p(
  `| 何かが止める（検出器・ESLint・Hook・CI・テストのいずれか） | ${rules.enforced} | ${pct(rules.enforced, rules.total)}% |`
)
p(
  `| **何も止めない（書いてあるだけ）** | ${rules.unenforced.length} | ${pct(rules.unenforced.length, rules.total)}% |`
)
p()
p('カテゴリ別。')
p()
p('| カテゴリ | ルール | 検出器あり | 何かが止める |')
p('| -------- | ------ | ---------- | ------------ |')
for (const c of rules.byCategory) {
  p(`| ${c.category} | ${c.total} | ${c.detectable} | ${c.enforced} |`)
}
p()
p('### 何も止めないルール')
p()
p('**書いてあるだけで、破っても誰も気づかない。** 隠さず並べる。')
p()
p('| ID | 禁止していること |')
p('| -- | ---------------- |')
for (const r of rules.unenforced) p(`| ${r.id} | ${r.forbidden} |`)
p()

p('## 2. 部品メタデータ — AI が引ける情報が揃っているか')
p()
p(`登録部品 **${metadata.total} 件**。項目ごとの充足率。`)
p()
p('| 項目 | 充足 | 割合 | なぜ要るか |')
p('| ---- | ---- | ---- | ---------- |')
for (const f of metadata.fields) {
  p(`| ${f.field} | ${f.filled} / ${metadata.total} | ${f.pct}% | ${f.why} |`)
}
p()

p('## 3. トークン — 値が機械可読か')
p()
p(`W3C DTCG 形式で **${tokens.total} 件**。`)
p()
p('| グループ | 件数 |')
p('| -------- | ---- |')
for (const g of tokens.groups) p(`| ${g.group} | ${g.count} |`)
p()

p('## 4. アプリでの採用 — 実際に使われているか')
p()
if (adoption) {
  const t = adoption.totals
  p('DS に同等品がある MUI 部品を、直接 import せず DS 経由で使っているか。')
  p()
  p(`**${t.rate}%**（DS 経由 ${t.dsUse} 箇所 / 直 import ${t.bypass} 箇所）`)
  p()
  p('| アプリ | DS 経由 | MUI 直 | 準拠率 |')
  p('| ------ | ------- | ------ | ------ |')
  for (const a of adoption.apps) {
    p(
      `| ${a.app} | ${a.dsUse} | ${a.bypass} | ${a.rate === null ? '—' : a.rate + '%'} |`
    )
  }
  p()
  p(
    `MUI に同等品が無い DS 部品の利用が別に ${adoption.dsOnly} 箇所ある` +
      '（PageHeader 等。分子には数えない）。'
  )
} else {
  p('`pnpm ds:adoption` が実行できなかった。')
}
p()
p('---')
p()
p('再生成: `pnpm ds:coverage --write`')

const text = lines.join('\n') + '\n'

if (write) {
  const out = resolve(ROOT, 'docs/coverage.md')
  writeFileSync(out, text)
  console.log(
    `docs/coverage.md を生成: ルール ${rules.total} / 部品 ${metadata.total} / トークン ${tokens.total}`
  )
} else {
  console.log(text)
}
