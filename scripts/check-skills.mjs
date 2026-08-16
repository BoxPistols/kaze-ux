#!/usr/bin/env node
/**
 * Skill の記述が実態と合っているかを確かめる。
 *
 *   pnpm check:skills
 *
 * ## なぜ要るか
 *
 * Skill は AI がそのまま従う指示書で、**間違っていても誰も気づかない**。
 * 参照先が消えていれば読めず、案内しているコマンドが無ければそこで止まる。
 * しかもエラーは AI 側にしか出ないので、リポジトリを見ている人には見えない。
 *
 * 実際 `/sync-tokens` は生成物が 3 つに増えたあとも 1 つしか案内しておらず、
 * **そのとおり実行すると CI が落ちる**状態で残っていた。
 *
 * ## 何を検査するか
 *
 * 1. frontmatter に name / description があること
 * 2. 案内している `pnpm <script>` が package.json に実在すること
 * 3. 相対リンクの参照先が実在すること
 *
 * 中身が正しいかまでは機械では見られない。**見られる範囲だけを見る。**
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, normalize, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SKILLS_DIR = resolve(ROOT, '.claude', 'skills')

if (!existsSync(SKILLS_DIR)) {
  console.error('❌ .claude/skills が見つかりません')
  process.exit(1)
}

const scripts = JSON.parse(
  readFileSync(resolve(ROOT, 'package.json'), 'utf-8')
).scripts

const skills = readdirSync(SKILLS_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => join('.claude/skills', e.name, 'SKILL.md'))
  .filter((p) => existsSync(resolve(ROOT, p)))

if (skills.length === 0) {
  console.error('❌ SKILL.md が 1 つも見つかりません（検査対象なし）')
  process.exit(1)
}

const problems = []
let checkedScripts = 0
let checkedLinks = 0

for (const rel of skills) {
  const src = readFileSync(resolve(ROOT, rel), 'utf-8')

  // 1. frontmatter
  const fm = src.match(/^---\n([\s\S]*?)\n---/)
  if (!fm) {
    problems.push(`${rel}: frontmatter がありません`)
  } else {
    for (const key of ['name', 'description']) {
      if (!new RegExp(`^${key}:\\s*\\S`, 'm').test(fm[1])) {
        problems.push(`${rel}: frontmatter に ${key} がありません`)
      }
    }
  }

  // 2. 案内している pnpm スクリプト
  for (const m of src.matchAll(/pnpm (?:run )?([a-z][\w:-]*)/g)) {
    const name = m[1]
    // pnpm 自体のサブコマンドは対象外
    if (['install', 'add', 'exec', 'dlx', 'why', 'update'].includes(name))
      continue
    checkedScripts++
    if (!scripts[name]) {
      problems.push(
        `${rel}: 案内している \`pnpm ${name}\` が package.json にありません`
      )
    }
  }

  // 3. 相対リンク
  for (const m of src.matchAll(/\]\((\.[^)]+)\)/g)) {
    const link = m[1].split('#')[0]
    if (!link) continue
    checkedLinks++
    const target = normalize(join(dirname(rel), link))
    if (!existsSync(resolve(ROOT, target))) {
      problems.push(`${rel}: リンク先が存在しません → ${link}`)
    }
  }
}

console.log(
  `Skill ${skills.length} 件 / 案内コマンド ${checkedScripts} 件 / リンク ${checkedLinks} 件を検査`
)
for (const s of skills) console.log(`  ${s}`)

if (problems.length) {
  console.error(`\n❌ ${problems.length} 件の不整合`)
  for (const p of problems) console.error(`   ${p}`)
  process.exit(1)
}
console.log('\n✅ Skill の参照先とコマンドはすべて実在します')
