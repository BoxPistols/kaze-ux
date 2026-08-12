#!/usr/bin/env node
/**
 * モックデータ等に実在ブランド名が再混入していないか検査する。
 *
 * PR #68 で、モックデータに実在メーカー名と実在型番が入っていたのを
 * 架空のものに置き換えた（電子部品メーカー、サーバー / UPS の製品名、
 * 実在の配達サービス名など）。作業ツリーを直しても、同じことは次の
 * サンプルデータを書いたときにまた起きる。人のレビューに頼らず落とす。
 *
 * ここに並ぶのは誰でも知っている企業・製品の名前で、秘密ではない。
 * 「秘密の一覧」ではなく「サンプルに書いてはいけない実在名の一覧」。
 *
 * 実在の型番そのもの（例: 4 桁英数の品番）はパターンで拾おうとすると
 * 架空の追跡番号 (KL-20260320-0005) 等に当たるため、ここでは扱わない。
 * 型番は docs/mock-data-policy.md の運用ルールとレビューで担保する。
 *
 * 使い方:
 *   node scripts/check-brand-terms.mjs
 *
 * 個別に許可したい行には、同じ行に `brand-check-allow` を含むコメントを置く。
 */

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

/**
 * 検出対象の実在名。
 *
 * 単語境界で照合するため、部分一致の巻き込みは起きない。
 * 日本語は単語境界が効かないので素の部分一致にする。
 *
 * **社名が人の姓と同じものは、単体で並べない。** このリポジトリの
 * サンプルの連絡先には Honda / Murata という姓の人物が実在し、社名として
 * 並べると必ず誤検出する。誤検出が出るチェッカは、入れないほうがマシ
 * （すぐに無視されるようになり、本物の検出まで一緒に流される）。
 * 姓と衝突する社名は「Honda Motor」のように会社を特定する形で持つ。
 */
const DENY_TERMS = [
  // 配達・飲食チェーン
  { term: 'ubereats', kind: 'ascii' },
  { term: 'uber eats', kind: 'ascii' },
  { term: 'doordash', kind: 'ascii' },
  { term: 'deliveroo', kind: 'ascii' },
  { term: 'foodpanda', kind: 'ascii' },
  { term: 'grubhub', kind: 'ascii' },
  { term: '出前館', kind: 'raw' },
  { term: 'マクドナルド', kind: 'raw' },
  { term: 'スターバックス', kind: 'raw' },
  // 電子部品・半導体
  { term: 'tdk', kind: 'ascii' },
  { term: 'kyocera', kind: 'ascii' },
  { term: 'nichicon', kind: 'ascii' },
  { term: 'renesas', kind: 'ascii' },
  { term: 'omron', kind: 'ascii' },
  { term: 'fujitsu', kind: 'ascii' },
  // 姓と衝突するため会社を特定する形で持つ
  { term: 'murata manufacturing', kind: 'ascii' },
  { term: '村田製作所', kind: 'raw' },
  // サーバー・ネットワーク・電源
  { term: 'poweredge', kind: 'ascii' },
  { term: 'proliant', kind: 'ascii' },
  { term: 'thinkpad', kind: 'ascii' },
  { term: 'smart-ups', kind: 'ascii' },
  { term: 'cisco', kind: 'ascii' },
  { term: 'juniper networks', kind: 'ascii' },
  // 自動車・部品
  { term: 'denso', kind: 'ascii' },
  // 姓と衝突するため会社を特定する形で持つ
  { term: 'honda motor', kind: 'ascii' },
  { term: 'toyota motor', kind: 'ascii' },
  { term: 'nissan motor', kind: 'ascii' },
  { term: 'robert bosch', kind: 'ascii' },
  { term: 'トヨタ自動車', kind: 'raw' },
  { term: '日産自動車', kind: 'raw' },
]

/**
 * 行にマーカーを置けない形式（JSON 等）のための明示的な許可。
 *
 * 「なぜ残しているか」を必ず書く。理由を書けないものは残さない。
 */
const ALLOWED_OCCURRENCES = [
  {
    file: 'vercel.json',
    term: 'ubereats',
    reason: '旧公開パスからのリダイレクト元。消すと既存リンクが 404 になる',
  },
]

/**
 * 検査対象の拡張子。
 *
 * バイナリとロックファイルは対象外。ビルド成果物も見ない
 * （ソースを直せば消えるものなので、二重に落ちても情報が増えない）。
 */
const TARGET_EXT = /\.(ts|tsx|js|jsx|mjs|cjs|css|json|md|html|yml|yaml)$/

const EXCLUDED_PATHS = [
  'node_modules/',
  'dist/',
  'gh-pages/',
  'storybook-static/',
  'coverage/',
  'pnpm-lock.yaml',
  // このファイル自身が一覧を持っている
  'scripts/check-brand-terms.mjs',
]

/** 同じ行にこれがあれば意図的な記述として通す */
const ALLOW_MARKER = 'brand-check-allow'

/**
 * 追跡済みに加えて未追跡（.gitignore 対象を除く）も見る。
 *
 * `git ls-files` だけだと、これから足すファイルが手元では検査されず、
 * 追跡された瞬間に CI だけが落ちる。実際にこの検査を入れた PR で、
 * まだ未追跡だった説明文書を手元で見逃して CI で落ちた。
 */
const listFiles = () =>
  execSync('git ls-files --cached --others --exclude-standard', {
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean)
    .filter((f) => TARGET_EXT.test(f))
    .filter((f) => !EXCLUDED_PATHS.some((p) => f.startsWith(p) || f === p))

const buildMatcher = ({ term, kind }) =>
  kind === 'ascii'
    ? // 英数の前後が単語構成文字でないことだけを見る。\b は
      // ハイフンを含む語 (smart-ups) で意図しない位置に入る
      new RegExp(
        `(^|[^a-z0-9])${term.replace(/[-]/g, '\\-')}([^a-z0-9]|$)`,
        'i'
      )
    : new RegExp(term)

const matchers = DENY_TERMS.map((t) => ({ ...t, re: buildMatcher(t) }))

const findings = []

for (const file of listFiles()) {
  let content
  try {
    content = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  const lines = content.split('\n')
  for (const [i, line] of lines.entries()) {
    if (line.includes(ALLOW_MARKER)) continue
    for (const { term, re } of matchers) {
      const allowed = ALLOWED_OCCURRENCES.some(
        (a) => a.file === file && a.term === term
      )
      if (!allowed && re.test(line)) {
        findings.push({
          file,
          line: i + 1,
          term,
          text: line.trim().slice(0, 120),
        })
      }
    }
  }
}

if (findings.length === 0) {
  console.log(
    `✅ 実在ブランド名の混入なし (${DENY_TERMS.length} 語を ${listFiles().length} ファイルで検査)`
  )
  process.exit(0)
}

console.error(`❌ 実在ブランド名が ${findings.length} 箇所で見つかりました\n`)
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}  [${f.term}]`)
  console.error(`    ${f.text}`)
}
console.error(
  [
    '',
    'サンプルデータには架空の企業名・製品名を使ってください。',
    '書き方は docs/mock-data-policy.md を参照。',
    `意図的な記述なら、同じ行に ${ALLOW_MARKER} を含むコメントを付けてください。`,
  ].join('\n')
)
process.exit(1)
