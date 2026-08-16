#!/usr/bin/env node
/**
 * foundations/prohibited.md を `scripts/lib/ds-rules.mjs` から生成する。
 *
 *   pnpm export-rules
 *
 * ## なぜ生成にするか
 *
 * 手書きだった間、この文書は**実態より多くを主張していた**。
 *
 * - `export default` 禁止と書いてあるが 33 箇所で破られ、止めるものも無かった
 * - font-weight は「200/100 を禁止、最低 300」と書いてあるが、実際の gate は
 *   **400/700 のみ**だった（文書のほうが緩い）
 *
 * これは AI にとって嘘の仕様になる。説明を読んだ AI は従い、コードを読んだ
 * AI は真似る。どちらが正しいのか判断できない。
 *
 * 表を生成にすると、**「何が強制しているか」を書かずにルールを増やせなく
 * なる**。強制が無いなら「なし」と表に出る。
 */
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { format, resolveConfig } from 'prettier'

import { DS_RULES } from './lib/ds-rules.mjs'

const OUT = resolve(import.meta.dirname, '..', 'foundations', 'prohibited.md')

const categories = [...new Set(DS_RULES.map((r) => r.category))]

const lines = [
  '# Kaze Design System — 禁止パターン',
  '',
  '**この表は生成物です。** 手で編集せず `scripts/lib/ds-rules.mjs` を直して',
  '`pnpm export-rules` を実行してください。',
  '',
  'AI コード生成・手動実装の両方で準拠するルール。**「強制」の列が、',
  'そのルールを実際に止めるものです。** ここが「なし」のルールは、',
  '書いてあるだけで破っても気づけません。',
  '',
  `違反の実数は \`pnpm check:rules\` が数えます（${DS_RULES.filter((r) => r.detect).length} 件は`,
  '機械的に測れます。残りは実描画の gate か、測れないもの）。',
  '',
]

for (const cat of categories) {
  const rules = DS_RULES.filter((r) => r.category === cat)
  lines.push(`## ${cat}`, '')
  lines.push('| ID | 禁止 | 代わりに | 強制 | 自動計測 |')
  lines.push('| --- | --- | --- | --- | --- |')
  for (const r of rules) {
    lines.push(
      `| ${r.id} | ${r.forbidden} | ${r.instead} | ${r.enforcedBy ?? '**なし**'} | ${r.detect ? '`check:rules`' : '—'} |`
    )
  }
  lines.push('')
}

const unenforced = DS_RULES.filter((r) => !r.enforcedBy)
lines.push(
  '## 止めるものが無いルール',
  '',
  '**黙って減らさないために明示する。** 以下は方針として書いてあるだけで、',
  '破っても検出されません。守るかどうかはレビューに依存します。',
  '',
  ...unenforced.map((r) => `- **${r.id}** ${r.forbidden}`),
  '',
  '意匠に関するもの（AI 生成で出やすい装飾など）は、機械的に判定すると',
  '誤検出のほうが多くなるため意図的に検出器を付けていません。',
  ''
)

const md = lines.join('\n')
writeFileSync(
  OUT,
  await format(md, { ...(await resolveConfig(OUT)), parser: 'markdown' }),
  'utf-8'
)

console.log(
  `foundations/prohibited.md を生成: ${DS_RULES.length} ルール / ` +
    `強制あり ${DS_RULES.length - unenforced.length} / 強制なし ${unenforced.length} / ` +
    `自動計測 ${DS_RULES.filter((r) => r.detect).length}`
)
