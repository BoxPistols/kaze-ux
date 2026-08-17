#!/usr/bin/env node
/**
 * ガイドに書いたキーボードショートカットが、Storybook の既定値と一致するか。
 *
 *   pnpm check:shortcuts
 *
 * ## なぜ要るか
 *
 * How to Use には手書きのショートカット表があり、**5 行とも間違っていた**。
 * 素の `S` / `T` / `A` / `F` と書いてあったが、実際はすべて `alt` 修飾が要る。
 * `/` は既定に存在せず、`D` は「Docs 切替」ではなくアドオンの向きだった。
 *
 * 誰も気づかなかったのは、**照合する相手がいなかった**から。正解は
 * Storybook 自身が持っているので、そこと突き合わせる。
 *
 * ## 照合の範囲
 *
 * 2 つの形を見る。
 *
 * 1. 修飾キー（⌘ / ⌥）で始まる表記
 * 2. ショートカット表のデータ（`shortcut: '...'` と、`action:` と対になった
 *    `key: '...'`）
 *
 * **1 だけでは元のバグを捕まえられない。** 素の `key: 'S'` は修飾キーで
 * 始まらないため。2 を足して初めて反証が通った。
 *
 * 逆に `key:` を無条件に拾うと、ダイアログのサイズ（`key: 'sm'`）や
 * フォームの項目名（`key: 'serialNumber'`）を誤検出する。`action:` と
 * 並んでいるものだけに絞ってある。本文中の「Figma → コード」のような
 * 矢印も対象外。**取りこぼす代わりに誤検出を出さない。**
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const SB_BUNDLE = resolve(
  ROOT,
  'node_modules/storybook/dist/manager-api/index.js'
)
const SCAN_DIR = resolve(ROOT, 'src/stories')

// ---------------------------------------------------------------------------
// 1. Storybook の既定値を読む
// ---------------------------------------------------------------------------

if (!existsSync(SB_BUNDLE)) {
  console.error(`❌ Storybook が見つかりません: ${relative(ROOT, SB_BUNDLE)}`)
  console.error('   pnpm install してから実行してください')
  process.exit(1)
}

const bundle = readFileSync(SB_BUNDLE, 'utf-8')
const declaration = bundle.match(/defaultShortcuts\s*=\s*Object\.freeze\(\{/)
if (!declaration) {
  // 見つからないまま緑にすると、照合していないのに「一致」と報告してしまう
  console.error('❌ Storybook の defaultShortcuts を見つけられませんでした')
  console.error('   バンドルの形が変わった可能性があります。この検査を直すまで')
  console.error('   ショートカットの記述は信用できません')
  process.exit(1)
}

// Object.freeze({ ... }) の中身を括弧の対応で切り出す
const bodyStart = bundle.indexOf(
  '{',
  declaration.index + declaration[0].length - 1
)
let depth = 0
let bodyEnd = -1
for (let i = bodyStart; i < bundle.length; i++) {
  if (bundle[i] === '{') depth++
  else if (bundle[i] === '}') {
    depth--
    if (depth === 0) {
      bodyEnd = i
      break
    }
  }
}
const body = bundle.slice(bodyStart, bodyEnd + 1)

/** `controlOrMetaKey()` は実行環境依存。Mac / それ以外の両方を許す */
const CONTROL_OR_META = '__ctrlOrMeta__'

const canonical = new Map() // "alt+f" -> コマンド名
for (const m of body.matchAll(/(\w+):\s*\[([^\]]*)\]/g)) {
  const command = m[1]
  const keys = [...m[2].matchAll(/"([^"]+)"|(controlOrMetaKey\d*\(\))/g)].map(
    (k) => (k[1] !== undefined ? k[1] : CONTROL_OR_META)
  )
  if (!keys.length) continue
  canonical.set(normalize(keys), command)
}

if (canonical.size < 15) {
  console.error(`❌ 既定値の抽出が ${canonical.size} 件しかありません`)
  console.error('   20 件前後あるはずです。抽出が壊れています')
  process.exit(1)
}

/** 修飾キーを並び順に依存しない形へ */
function normalize(keys) {
  const mods = []
  const rest = []
  for (const raw of keys) {
    const k = raw === CONTROL_OR_META ? CONTROL_OR_META : raw.toLowerCase()
    if (['alt', 'shift', CONTROL_OR_META, 'meta', 'control'].includes(k)) {
      mods.push(k === 'meta' || k === 'control' ? CONTROL_OR_META : k)
    } else {
      rest.push(k)
    }
  }
  return [...new Set(mods)].sort().concat(rest.sort()).join('+')
}

// ---------------------------------------------------------------------------
// 2. ガイドに書かれた表記を集める
// ---------------------------------------------------------------------------

const SYMBOL = {
  '⌘': CONTROL_OR_META,
  '⌥': 'alt',
  '⇧': 'shift',
  '↑': 'arrowup',
  '↓': 'arrowdown',
  '←': 'arrowleft',
  '→': 'arrowright',
}

/** ⌘ か ⌥ で始まり、記号・英数字・カンマが続くもの */
const WRITTEN = /[⌘⌥][⌘⌥⇧\s]*(?:[A-Za-z,]|[↑↓←→])/g

/**
 * ショートカット表のデータ。**元のバグはこの形だった。**
 * 素の `key: 'S'` は修飾キーで始まらないので WRITTEN では拾えない。
 *
 * `key:` は色名やフィールド名にも使う語なので、**同じ行に `action:` が
 * 並んでいるものだけ**を対象にする。`shortcut:` は曖昧さが無いので単独で拾う。
 */
const TABLE_ROW =
  /(?:shortcut:\s*'([^']+)'|action:\s*'[^']*',\s*key:\s*'([^']+)'|key:\s*'([^']+)',\s*action:\s*'[^']*')/g

/** ソースに書かれた `\uXXXX` を実文字へ。prettier がこの形で保存する */
const decode = (src) =>
  src.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) =>
    String.fromCodePoint(Number.parseInt(h, 16))
  )

/** 表記を Storybook のキー名の並びへ */
const tokenize = (written) => {
  const out = []
  // "Alt + Up" のような英語表記も受ける
  const words = written.split(/[\s+]+/).filter(Boolean)
  for (const w of words) {
    if (w.length === 1 && SYMBOL[w]) {
      out.push(SYMBOL[w])
      continue
    }
    if (w.length > 1 && [...w].every((c) => SYMBOL[c])) {
      out.push(...[...w].map((c) => SYMBOL[c]))
      continue
    }
    const lower = w.toLowerCase()
    const alias = {
      cmd: CONTROL_OR_META,
      command: CONTROL_OR_META,
      ctrl: CONTROL_OR_META,
      control: CONTROL_OR_META,
      meta: CONTROL_OR_META,
      opt: 'alt',
      option: 'alt',
      alt: 'alt',
      shift: 'shift',
      up: 'arrowup',
      down: 'arrowdown',
      left: 'arrowleft',
      right: 'arrowright',
    }
    out.push(alias[lower] ?? lower)
  }
  return out
}

const files = []
const walk = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, e.name)
    if (e.isDirectory()) walk(full)
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(full)
  }
}
walk(SCAN_DIR)

const problems = []
let checked = 0

const record = (file, src, index, written) => {
  checked++
  const key = normalize(tokenize(written))
  if (canonical.has(key)) return
  problems.push({
    file: relative(ROOT, file),
    line: src.slice(0, index).split('\n').length,
    written: written.replace(/\s+/g, ' ').trim(),
    key,
  })
}

for (const file of files) {
  const src = decode(readFileSync(file, 'utf-8'))
  for (const m of src.matchAll(WRITTEN)) record(file, src, m.index, m[0])
  for (const m of src.matchAll(TABLE_ROW)) {
    const written = m[1] ?? m[2] ?? m[3]
    // 修飾キー始まりは WRITTEN 側で既に数えている
    if (/^[⌘⌥]/.test(written.trim())) continue
    record(file, src, m.index, written)
  }
}

// ---------------------------------------------------------------------------
// 3. 報告
// ---------------------------------------------------------------------------

console.log(
  `Storybook の既定値 ${canonical.size} 件と、ガイドの表記 ${checked} 件を照合`
)

if (checked === 0) {
  // 1 件も拾えていないなら、検査が働いていないのと同じ
  console.error('\n❌ 照合対象を 1 件も見つけられませんでした')
  console.error('   表記の形が変わったか、走査範囲が外れています')
  process.exit(1)
}

if (problems.length) {
  console.error(`\n❌ 既定値に無い表記が ${problems.length} 件`)
  for (const p of problems) {
    console.error(`   ${p.file}:${p.line}  "${p.written}"  → ${p.key}`)
  }
  console.error('\n   正解は Storybook 自身が持っています:')
  console.error('   /storybook/?path=/settings/shortcuts')
  process.exit(1)
}

console.log('\n✅ ガイドの表記はすべて Storybook の既定値と一致します')
