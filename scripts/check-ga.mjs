#!/usr/bin/env node
/**
 * GA4 の測定 ID が、書かれているすべての場所で同じかを確かめる。
 *
 *   pnpm check:ga
 *
 * ## なぜ要るか
 *
 * ID は 2 箇所にある。React 4 面が読む `src/utils/ga.ts` と、Storybook の
 * manager に注入する `.storybook/main.cjs`。**片方だけ書き換えると、その面の
 * データだけ別プロパティへ飛ぶ。**エラーは出ず、GA4 の画面にも「片方が
 * 来ていない」とは表示されないので、気づく手段が無い。
 *
 * ## 走査式にする
 *
 * 「この 2 ファイルを見る」と列挙すると、3 箇所目を足したときに**その箇所を
 * 最初から見ない**。リポジトリを走査して `G-XXXX` の形を全部拾う。
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const ID = /G-[A-Z0-9]{6,}/g

const die = (...lines) => {
  for (const l of lines) console.error(l)
  process.exit(1)
}

// git が知っているファイルだけを見る。生成物や node_modules は対象外
const files = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard'],
  { cwd: ROOT, encoding: 'utf-8', maxBuffer: 32 * 1024 * 1024 }
)
  .split('\n')
  .filter((f) => /\.(ts|tsx|js|jsx|cjs|mjs|html)$/.test(f))

const found = new Map() // id -> [場所]
/** 読めなかったファイル。未検査の範囲として報告する */
const unreadable = []
for (const f of files) {
  let src
  try {
    src = readFileSync(resolve(ROOT, f), 'utf-8')
  } catch {
    // 黙って飛ばすと、測定 ID がその中にあっても気づけない
    unreadable.push(f)
    continue
  }
  for (const m of src.matchAll(ID)) {
    // プレースホルダは対象外
    if (m[0].includes('MEASUREMENT')) continue
    const line = src.slice(0, m.index).split('\n').length
    if (!found.has(m[0])) found.set(m[0], [])
    found.get(m[0]).push(`${relative(ROOT, f)}:${line}`)
  }
}

const ids = [...found.keys()]

if (unreadable.length > 0) {
  die(
    `❌ ${unreadable.length} 件のファイルを読めませんでした（未検査）`,
    ...unreadable.slice(0, 20).map((f) => `   ${f}`)
  )
}

if (ids.length === 0) {
  // 1 件も無いなら、検査が働いていないか GA が外れている
  die(
    '❌ GA4 の測定 ID が 1 件も見つかりませんでした',
    '   GA を外したならこの検査も外してください。',
    '   外していないなら、走査が届いていません'
  )
}

const total = [...found.values()].reduce((n, v) => n + v.length, 0)
console.log(`測定 ID を ${total} 箇所で検出（種類 ${ids.length}）`)
for (const [id, places] of found) {
  console.log(`  ${id}`)
  for (const p of places) console.log(`    ${p}`)
}

if (ids.length > 1) {
  die(
    '',
    `❌ 測定 ID が ${ids.length} 種類あります。面ごとに別のプロパティへ飛びます`,
    '   すべて同じ値に揃えてください'
  )
}

// 面ごとに 1 箇所は要る。減っていたらどこかの面が計測から外れている
const MIN_PLACES = 2
if (total < MIN_PLACES) {
  die(
    '',
    `❌ 検出が ${total} 箇所しかありません（${MIN_PLACES} 箇所以上あるはず）`,
    '   React 側（src/utils/ga.ts）と Storybook 側（.storybook/main.cjs）の',
    '   両方に必要です。どちらかが計測から外れています'
  )
}

console.log('\n✅ 測定 ID はすべての場所で一致しています')
