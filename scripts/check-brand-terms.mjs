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
  { term: '大阪王将', kind: 'raw' },
  { term: '吉野家', kind: 'raw' },
  { term: 'すき家', kind: 'raw' },
  // 物流
  { term: 'ヤマト運輸', kind: 'raw' },
  { term: '佐川急便', kind: 'raw' },
  { term: '日本通運', kind: 'raw' },
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
  { term: 'dell', kind: 'ascii' },
  { term: 'poweredge', kind: 'ascii' },
  { term: 'proliant', kind: 'ascii' },
  { term: 'thinkpad', kind: 'ascii' },
  { term: 'apc', kind: 'ascii' },
  { term: 'smart-ups', kind: 'ascii' },
  { term: 'cisco', kind: 'ascii' },
  { term: 'juniper networks', kind: 'ascii' },
  // 自動車・部品
  { term: 'denso', kind: 'ascii' },
  // カタカナの社名は姓と衝突しない
  { term: 'トヨタ', kind: 'raw' },
  { term: '日産', kind: 'raw' },
  // 姓と衝突するため会社を特定する形で持つ（Honda / Murata は
  // サンプルの連絡先に同じ姓の人物がいる）
  { term: 'honda motor', kind: 'ascii' },
  { term: 'toyota motor', kind: 'ascii' },
  { term: 'nissan motor', kind: 'ascii' },
  { term: 'robert bosch', kind: 'ascii' },
]

/**
 * 行にマーカーを置けない形式（JSON 等）のための明示的な許可。
 *
 * 「なぜ残しているか」を必ず書く。理由を書けないものは残さない。
 *
 * `contains` で行を絞る。ファイル単位で通すと、そのファイルのどこに
 * 別の実在名を書いても以後ずっと見えなくなる。
 */
const ALLOWED_OCCURRENCES = [
  {
    file: 'vercel.json',
    term: 'ubereats',
    contains: '"source": "/ubereats',
    reason: '旧公開パスからのリダイレクト元。消すと既存リンクが 404 になる',
  },
]

/**
 * 検査対象の拡張子。
 *
 * バイナリとロックファイルは対象外。ビルド成果物も見ない
 * （ソースを直せば消えるものなので、二重に落ちても情報が増えない）。
 */
/**
 * 検査対象の拡張子。
 *
 * テキストとして読めるものは基本的に見る。特に:
 * - `.mdx` は Storybook のドキュメントページ。**公開される面そのもの**で、
 *   ここを外していると一番読まれる場所が検査されない
 * - `.svg` はテキストで、実在ブランドのロゴが入るならここ。
 *   docs/mock-data-policy.md が「ロゴも同じ」と書いている以上、外せない
 *
 * 大文字の拡張子 (README.MD 等) を取りこぼさないよう i を付ける。
 * macOS は既定で大文字小文字を区別しないため、実際に起こりうる。
 */
const TARGET_EXT =
  /\.(ts|tsx|js|jsx|mjs|cjs|mdx|md|mdc|css|json|html|svg|yml|yaml|sh|txt)$/i

/**
 * 走査から外すパス。
 *
 * node_modules / dist / gh-pages / storybook-static / coverage は
 * .gitignore に載っており --exclude-standard が先に落とすので、ここには要らない。
 * 残すのは「追跡されているが見たくないもの」だけ。
 */
const EXCLUDED_PATHS = [
  'pnpm-lock.yaml',
  // このファイル自身が一覧を持っている
  'scripts/check-brand-terms.mjs',
]

/**
 * 意図的な記述として通すマーカー。
 *
 * **通す語を必ず書かせる。** 素の目印だけで行ごと通すと、その行は以後
 * 30 語すべてに対する盲点になり、あとから別の実在名を書いても気づけない。
 *
 *   const KEY = 'ubereats-theme' // brand-check-allow: ubereats — 旧キー互換
 */
const ALLOW_MARKER = /brand-check-allow:?\s*([^\n]*?)(?:—|-->|\*\/|$)/gi

/** その行で明示的に許可された語を集める（複数書ける） */
const allowedTermsOn = (line) =>
  [...line.matchAll(ALLOW_MARKER)].map((m) => m[1].trim().toLowerCase())

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
    .filter((f) => !EXCLUDED_PATHS.some((p) => f.startsWith(p)))

/**
 * 正規表現に埋め込む前にメタ文字を殺す。
 *
 * 一覧に `amazon.com` のような語を足すと `.` が任意 1 文字になって
 * `amazonXcom` に当たり、`c++` のような語を足すと読み込み時に
 * SyntaxError で検査そのものが動かなくなる。どちらも無言で壊れる。
 */
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&')

/**
 * 区切りを 1 つの半角空白に均す。
 *
 * `Uber-Eats` `Uber_Eats` `Uber  Eats` `Uber\nEats` はどれも同じものを
 * 指すのに、素の一致では別物になる。**元の不具合そのものがハイフン形
 * (`ubereats-clone` / `ubereats-theme`) だった**ので、ここを揃えないと
 * 同じ形の再発を取り逃す。
 *
 * 語の側も同じ規則で均すため、`smart-ups` は `smart ups` として照合される。
 */
const normalize = (s) => s.replace(/[-_\s]+/g, ' ')

const buildMatcher = (term) =>
  // 英数の前後が単語構成文字でないことだけを見る。\b はハイフンを含む語で
  // 意図しない位置に入る
  new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}([^a-z0-9]|$)`, 'i')

const matchers = DENY_TERMS.map(({ term, kind }) =>
  kind === 'ascii'
    ? { term, kind, re: buildMatcher(normalize(term)) }
    : { term, kind, re: new RegExp(escapeRegExp(term)) }
)

const findings = []
// 走査したファイルの集合をそのまま報告に使う。二度数えると、
// 間に増減があったときに「検査した数」と実際がずれる
const files = listFiles()

for (const file of files) {
  let content
  try {
    content = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  const lines = content.split('\n')
  for (const [i, rawLine] of lines.entries()) {
    const markerTerms = rawLine.includes('brand-check-allow')
      ? allowedTermsOn(rawLine)
      : []
    const line = normalize(rawLine)

    for (const { term, kind, re } of matchers) {
      // 目印に書かれた語だけを通す。行ごと通さない
      if (markerTerms.some((t) => t.includes(term.toLowerCase()))) continue
      const allowed = ALLOWED_OCCURRENCES.some(
        (a) =>
          a.file === file &&
          a.term === term &&
          (!a.contains || rawLine.includes(a.contains))
      )
      // 日本語は区切りの均しが意味を持たないので元の行で見る
      if (!allowed && re.test(kind === 'ascii' ? line : rawLine)) {
        findings.push({
          file,
          line: i + 1,
          term,
          text: rawLine.trim().slice(0, 120),
        })
      }
    }
  }
}

if (findings.length === 0) {
  console.log(
    `✅ 実在ブランド名の混入なし (${DENY_TERMS.length} 語を ${files.length} ファイルで検査)`
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
    '意図的な記述なら、同じ行に通す語を書いたコメントを付けてください。',
    "  例: const KEY = 'ubereats-theme' // brand-check-allow: ubereats — 旧キー互換",
  ].join('\n')
)
process.exit(1)
