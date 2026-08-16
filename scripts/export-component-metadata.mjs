#!/usr/bin/env node
/**
 * metadata/components.json を story から生成する。
 *
 *   pnpm export-metadata
 *
 * ## なぜ生成に切り替えたか
 *
 * 手書きだった間、公開している部品 54 件のうち **18 件（33%）しか載って
 * いなかった**。このファイルは MCP サーバ（`get_component` / `search`）が
 * 読む唯一の部品情報なので、**載っていない 36 件については AI が prop を
 * 推測して書く**。しかもエラーにならず、それらしいコードが出てくる。
 *
 * 手書きの一覧が実装に遅れるのは構造的なので、単一ソースを story に移した。
 * story には必要なものが既に揃っている（title / component / description /
 * argTypes）。story を足せば自動で載る。
 *
 * ## 手で持つもの
 *
 * 「禁止事項」と「アクセシビリティ上の要件」だけは story から取れないので
 * metadata/curated.json に置き、名前で重ねる。curated 側にしか無い名前が
 * あれば警告する（部品を消したのに記述が残っている状態を検出する）。
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { format, resolveConfig } from 'prettier'

import { extractComponent, findStoryFiles } from './lib/story-metadata.mjs'

const ROOT = resolve(import.meta.dirname, '..')
const STORIES_DIR = resolve(ROOT, 'src', 'stories', '04-Components')
const OUT = resolve(ROOT, 'metadata', 'components.json')
const CURATED = resolve(ROOT, 'metadata', 'curated.json')

/**
 * 部品として数えないもの。
 *
 * 比較のために MUI 素の実装を並べた story と、部品ではない読み物。
 * **除外したものは必ず出力する**（黙って減らすと数字が意味を失う）
 */
const NOT_A_COMPONENT = [/^MUI /, /^チームミーティング$/]

/** `EmptyState` → `emptyState` / `Checkbox & Radio` → `checkboxRadio` */
const toKey = (name) => {
  const cleaned = name.replace(/[^A-Za-z0-9]+(.)?/g, (_, c) =>
    c ? c.toUpperCase() : ''
  )
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1)
}

const curatedFile = JSON.parse(readFileSync(CURATED, 'utf-8'))
const curated = curatedFile.components ?? {}
/** 重ね先が一意に決まらず保留しているもの。**黙って落とさない** */
const pending = curatedFile.pending ?? {}

const files = findStoryFiles(STORIES_DIR)
const extracted = files.map((f) => extractComponent(f, ROOT)).filter(Boolean)

const excluded = extracted.filter((c) =>
  NOT_A_COMPONENT.some((r) => r.test(c.name))
)
const components = extracted.filter(
  (c) => !NOT_A_COMPONENT.some((r) => r.test(c.name))
)

if (components.length === 0) {
  console.error(
    '❌ story から部品を 1 件も抽出できませんでした。' +
      '抽出ロジックか story の書式が変わっています'
  )
  process.exit(1)
}

const out = {}
const usedCurated = new Set()
for (const c of components.sort((a, b) => a.name.localeCompare(b.name))) {
  const key = toKey(c.name)
  const extra = curated[key]
  if (extra) usedCurated.add(key)
  out[key] = {
    name: c.name,
    category: c.category,
    story: c.story,
    storyFile: c.storyFile,
    ...(c.import ? { import: c.import } : {}),
    ...(c.description ? { description: c.description } : {}),
    ...(c.variants ? { variants: c.variants } : {}),
    ...(c.sizes ? { sizes: c.sizes } : {}),
    ...(extra ?? {}),
    props: c.props,
  }
}

// 生成側で prettier を通す。素の JSON.stringify は短い配列も必ず展開する
// ため、pre-commit の prettier が書き換えて CI の鮮度チェックが恒常的に
// 落ちる（kaze-tokens.css で踏んだのと同じ形）
const json = JSON.stringify(
  {
    $schema: 'https://kaze-ux.dev/schema/components.json',
    $description:
      '生成物。手で編集しない（pnpm export-metadata）。story が単一ソースで、禁止事項などは metadata/curated.json で重ねる',
    version: '2.0.0',
    framework: 'React + MUI + Tailwind CSS',
    components: out,
  },
  null,
  2
)
writeFileSync(
  OUT,
  await format(json, { ...(await resolveConfig(OUT)), parser: 'json' }),
  'utf-8'
)

// 実装が消えたのに記述だけ残っている状態を検出する
const orphans = Object.keys(curated).filter((n) => !usedCurated.has(n))

const withDesc = components.filter((c) => c.description).length
const withProps = components.filter(
  (c) => Object.keys(c.props).length > 0
).length

console.log(`metadata/components.json を生成: ${components.length} 件`)
console.log(`  説明あり ${withDesc} / prop 定義あり ${withProps}`)
console.log(
  `  curated を適用 ${usedCurated.size} 件 / 部品として数えなかった story ${excluded.length} 件` +
    (excluded.length ? ` (${excluded.map((c) => c.name).join(', ')})` : '')
)
if (orphans.length) {
  console.log(
    `  ⚠ curated.json に該当する story が無い記述: ${orphans.join(', ')}`
  )
}
for (const [name, entry] of Object.entries(pending)) {
  console.log(`  ⚠ 保留 ${name}: ${entry.$reason}`)
}

// story が無い＝a11y の gate でも描画されていない。数だけは必ず出す
const noStoryDs = Object.keys(pending).length
if (noStoryDs) {
  console.log(
    `  → 保留 ${noStoryDs} 件は story を整備すれば解消する（story が無い部品は` +
      ` check:a11y でも一度も描画されていない）`
  )
}
