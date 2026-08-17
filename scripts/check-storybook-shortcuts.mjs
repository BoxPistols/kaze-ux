#!/usr/bin/env node
/**
 * ガイドが掲げるキーボードショートカットが、Storybook の既定値と一致するか。
 *
 *   pnpm check:shortcuts
 *
 * ## なぜ要るか
 *
 * How to Use と Introduction が手書きの表を持っており、**15 行のうち 11 行が
 * 間違っていた**。素の `S` / `T` / `A` / `F` / `K` / `D` と書いてあったが、
 * 実際はすべて `alt` 修飾が要る。`/` は既定に存在せず、`D` は「Docs 切替」
 * ではなくアドオンパネルの向きだった。
 *
 * 誰も気づかなかったのは、**照合する相手がいなかった**から。正解は Storybook
 * 自身が持っているので、そこと突き合わせる。
 *
 * ## 何を照合するか
 *
 * `src/stories/_shared/shortcutKeys.ts` の `STORYBOOK_SHORTCUTS` は、
 * Storybook の `defaultShortcuts` と**同じコマンド名**でキー配列を持つ。
 * 名前ごとに配列を突き合わせるので、
 *
 * - 修飾キーの欠落（`S` と `alt+S`）
 * - 存在しないキー（`/`）
 * - 別のコマンドの値を書く取り違え
 *
 * のすべてが 1 つの照合で出る。表示文字列は OS から導出されるので検査しない
 * （検査するのは値の定義だけ）。
 */
import { existsSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SB_BUNDLE = resolve(
  ROOT,
  'node_modules/storybook/dist/manager-api/index.js'
)
const OURS = resolve(ROOT, 'src/stories/_shared/shortcutKeys.ts')

const die = (...lines) => {
  for (const l of lines) console.error(l)
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 1. Storybook の既定値
// ---------------------------------------------------------------------------

if (!existsSync(SB_BUNDLE)) {
  die(
    `❌ Storybook が見つかりません: ${relative(ROOT, SB_BUNDLE)}`,
    '   pnpm install してから実行してください'
  )
}

const bundle = readFileSync(SB_BUNDLE, 'utf-8')
const decl = bundle.match(/defaultShortcuts\s*=\s*Object\.freeze\(\{/)
if (!decl) {
  // 見つからないまま緑にすると、照合していないのに「一致」と報告してしまう
  die(
    '❌ Storybook の defaultShortcuts を見つけられませんでした',
    '   バンドルの形が変わった可能性があります。この検査を直すまで、',
    '   ショートカットの記述は信用できません'
  )
}

/** `{ ... }` を括弧の対応で切り出す */
const braceBody = (src, from) => {
  const start = src.indexOf('{', from)
  let depth = 0
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}' && --depth === 0) return src.slice(start, i + 1)
  }
  return null
}

/** `controlOrMetaKey()` は実行環境依存。こちらの `ctrlOrMeta` と同一視する */
const CTRL_OR_META = 'ctrlOrMeta'

const parseEntries = (body, keyPattern) => {
  const out = new Map()
  for (const m of body.matchAll(/([\w$]+)\s*:\s*\[([^\]]*)\]/g)) {
    const tokens = [...m[2].matchAll(keyPattern)].map((k) =>
      k[1] !== undefined ? k[1] : CTRL_OR_META
    )
    if (tokens.length) out.set(m[1], tokens)
  }
  return out
}

const canonical = parseEntries(
  braceBody(bundle, decl.index),
  /"([^"]+)"|controlOrMetaKey\d*\(\)/g
)

if (canonical.size < 15) {
  die(
    `❌ Storybook 側の抽出が ${canonical.size} 件しかありません`,
    '   20 件前後あるはずです。抽出が壊れています'
  )
}

// ---------------------------------------------------------------------------
// 2. こちらの定義
// ---------------------------------------------------------------------------

if (!existsSync(OURS)) {
  die(`❌ ${relative(ROOT, OURS)} が見つかりません`)
}
const ourSrc = readFileSync(OURS, 'utf-8')
const ourDecl = ourSrc.match(/STORYBOOK_SHORTCUTS[^=]*=\s*\{/)
if (!ourDecl) {
  die(
    `❌ ${relative(ROOT, OURS)} に STORYBOOK_SHORTCUTS が見つかりません`,
    '   定義の形が変わったなら、この検査も直してください'
  )
}
const ours = parseEntries(
  braceBody(ourSrc, ourDecl.index),
  /'([^']+)'|"([^"]+)"/g
)

if (ours.size === 0) {
  // 1 件も拾えていないなら、検査が働いていないのと同じ
  die(
    '❌ こちらの定義を 1 件も読み取れませんでした',
    '   走査が外れています。この状態を緑にしてはいけません'
  )
}

// ---------------------------------------------------------------------------
// 3. 照合
// ---------------------------------------------------------------------------

const norm = (tokens) => {
  const order = { [CTRL_OR_META]: 0, alt: 1, shift: 2 }
  const mods = tokens
    .filter((t) => t in order)
    .map((t) => t)
    .sort((a, b) => order[a] - order[b])
  const rest = tokens.filter((t) => !(t in order)).map((t) => t.toLowerCase())
  return [...mods, ...rest].join('+')
}

const problems = []
for (const [command, tokens] of ours) {
  const expected = canonical.get(command)
  if (!expected) {
    problems.push(
      `${command}: Storybook にこの名前のコマンドがありません（綴り違いか、廃止された）`
    )
    continue
  }
  const a = norm(tokens)
  const b = norm(expected)
  if (a !== b) {
    problems.push(`${command}: こちら "${a}" / Storybook "${b}"`)
  }
}

console.log(
  `Storybook の既定値 ${canonical.size} 件のうち、` +
    `ガイドが掲げる ${ours.size} 件を照合`
)

if (problems.length) {
  console.error(`\n❌ ${problems.length} 件が一致しません`)
  for (const p of problems) console.error(`   ${p}`)
  console.error('')
  console.error('   正解は Storybook 自身が持っています:')
  console.error('   /storybook/?path=/settings/shortcuts')
  process.exit(1)
}

console.log('\n✅ ガイドのショートカットは Storybook の既定値と一致します')
