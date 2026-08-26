#!/usr/bin/env node
/**
 * `metadata/components.json` の `sample` が**実際にコンパイルできるか**を検査する。
 *
 *   pnpm check:samples
 *
 * ## なぜ要るか
 *
 * `sample` は「AI が書く前に参照するもの」で、ルールの検査とは効くタイミングが
 * 違う。検査は書いた**後**にしか効かないが、sample は書く**前**に効く。
 *
 * だからこそ、**間違った sample は間違ったコードを量産する**。
 * 読んだ AI は疑わずに真似るし、実装を読んだ AI との区別も付かない。
 * 手で書いた文字列を検査せずに配るのは、`prohibited.md` に守られていない
 * ルールを載せるのと同じ「嘘の仕様」になる。
 *
 * 実際、この検査を書いた時点で登録されていた 4 件のうち 1 件
 * （`select`）は `import` を持たず、JSX のタグ名（`CustomSelect`）と
 * `name`（`Select`）も食い違っていた。読んでも import 文が書けない。
 *
 * ## やり方
 *
 * sample を本物の tsx に組み立てて `tsc --noEmit` に通す。
 * 型が通る = その部品がその props を実際に受け取る、ということ。
 *
 * 根以外のタグは `*Icon` を `@mui/icons-material/*` から、それ以外を
 * **その部品と同じモジュール**から引く（`@mui/material` なら `TableRow`
 * などの兄弟が解決する）。実在しなければ tsc の import エラーとして出る。
 *
 * sample に**自由変数を残さない**のも要件。`{items}` や `{handleSave}` が
 * 入っていると、読んだ側がそれを補うことになり、補い方は sample に無い。
 * 書いた時点で 11 件がこれで落ちた
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const OUT_DIR = resolve(ROOT, 'src/__sample-check__')

const meta = JSON.parse(
  readFileSync(resolve(ROOT, 'metadata/components.json'), 'utf8')
)
const entries = Object.entries(meta.components).filter(([, c]) => c.sample)

if (entries.length === 0) {
  console.log('sample を持つ部品がありません')
  process.exit(0)
}

/** sample に現れる大文字始まりの JSX タグ名 */
const jsxTags = (sample) => [
  ...new Set(
    [...sample.matchAll(/<\s*([A-Z][A-Za-z0-9_]*)/g)].map((m) => m[1])
  ),
]

const problems = []
const blocks = []

for (const [key, c] of entries) {
  const tags = jsxTags(c.sample)
  if (tags.length === 0) {
    problems.push(`${key}: sample に JSX が無い`)
    continue
  }
  const root = tags[0]

  if (!c.import) {
    problems.push(
      `${key}: import が無いので、読んだ側が import 文を書けない（sample の根は <${root}>）`
    )
    continue
  }

  // 根以外のタグは、(1) MUI アイコン (2) 同じモジュールの兄弟 export
  // のどちらかで解決する。兄弟が実在しなければ tsc がそこで落ちるので、
  // ここで弾かずに型検査へ渡す（「解決できない」と「型が合わない」を
  // 別々に報告するより、実際の import エラーを見せたほうが直しやすい）
  const named = [root]
  const imports = []
  for (const tag of tags.slice(1)) {
    if (/Icon$/.test(tag)) {
      imports.push(
        `import ${tag} from '@mui/icons-material/${tag.replace(/Icon$/, '')}'`
      )
    } else if (!named.includes(tag)) {
      named.push(tag)
    }
  }
  imports.unshift(`import { ${named.join(', ')} } from '${c.import}'`)

  blocks.push(
    `${imports.join('\n')}\nexport const Sample_${key.replace(/[^A-Za-z0-9_]/g, '_')} = () => (\n  ${c.sample}\n)`
  )
}

if (blocks.length > 0) {
  mkdirSync(OUT_DIR, { recursive: true })
  // 1 ファイルにまとめると同名 import が衝突するので、部品ごとに分ける
  blocks.forEach((code, i) => {
    writeFileSync(resolve(OUT_DIR, `sample-${i}.tsx`), code + '\n')
  })

  try {
    execFileSync('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json'], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: 'pipe',
    })
  } catch (e) {
    const out = `${e.stdout ?? ''}${e.stderr ?? ''}`
    for (const line of out.split('\n')) {
      const m = line.match(
        /__sample-check__\/sample-(\d+)\.tsx\((\d+),\d+\): error (.+)/
      )
      if (!m) continue
      const key = entries.filter(([, c]) => c.sample)[Number(m[1])]?.[0] ?? '?'
      problems.push(`${key}: ${m[3]}`)
    }
    // sample と無関係な型エラーまで拾わない。それは別の検査の仕事
    if (problems.length === 0 && /error TS/.test(out)) {
      problems.push(
        'sample 以外の場所で型エラーが出ているため判定できません。先に `npx tsc --noEmit` を通してください'
      )
    }
  } finally {
    rmSync(OUT_DIR, { recursive: true, force: true })
  }
}

const total = Object.keys(meta.components).length
console.log(
  `sample を持つ部品 ${entries.length} / ${total} 件（${Math.round((entries.length / total) * 1000) / 10}%）`
)

if (problems.length > 0) {
  console.error(`\n❌ ${problems.length} 件の sample に問題があります\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error(
    '\n  sample は「AI が書く前に読むもの」なので、間違っていると間違ったコードを量産します。'
  )
  process.exitCode = 1
} else {
  console.log('✅ すべての sample が型検査を通りました')
}
