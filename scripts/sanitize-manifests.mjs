#!/usr/bin/env node
/**
 * Storybook の manifests から、ビルドしたマシンの絶対パスを取り除く。
 *
 * `@storybook/addon-mcp` は `manifests/components.{json,html}` に
 * コンポーネントの**絶対パス**を書き出す。
 * `/Users/<ユーザー名>/dev/...` の形なので、成果物を第三者へ URL で共有すると
 * ビルドした人のマシンのユーザー名がそのまま出る。
 *
 * ソースを grep しても見つからない（ビルド時に生成される）ため、
 * 成果物側を見ないと気づけない。
 *
 * リポジトリ相対に書き換えるだけで、どのファイルかは変わらず読める。
 *
 * `build-storybook` の後に自動で走る（package.json の postbuild-storybook）。
 */

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** 出力先を固定で列挙しない。`build-storybook -o <dir>` で出力先を変えられる以上、
 * 決め打ちにすると素通りして絶対パスが残る（実際に素通りすることを確認済み）。
 * リポジトリ配下の manifests ディレクトリを探して回る。
 * 引数で明示された場合はそちらを優先する。 */
const SKIP_DIRS = new Set(['node_modules', '.git', 'src', 'apps', 'packages'])

const findManifestDirs = (dir, depth = 0, out = []) => {
  if (depth > 4) return out
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    if (SKIP_DIRS.has(name) || name.startsWith('.git')) continue
    const p = join(dir, name)
    try {
      if (!statSync(p).isDirectory()) continue
    } catch {
      continue
    }
    if (name === 'manifests') out.push(p)
    else findManifestDirs(p, depth + 1, out)
  }
  return out
}

const args = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const TARGET_DIRS = args.length
  ? args.map((a) => join(ROOT, a))
  : findManifestDirs(ROOT)

/** 絶対パスの形で残っているものを相対へ。ROOT 以外の絶対パスも潰す */
const stripAbsolute = (text) =>
  text
    .split(ROOT + '/')
    .join('')
    .replace(/\/(Users|home)\/[A-Za-z0-9._-]+\//g, '')

let changed = 0
let scanned = 0

for (const dir of TARGET_DIRS) {
  if (!existsSync(dir)) continue
  const rel = dir.replace(ROOT + '/', '')
  for (const name of readdirSync(dir)) {
    const file = join(dir, name)
    if (!statSync(file).isFile()) continue
    scanned++
    const before = readFileSync(file, 'utf8')
    const after = stripAbsolute(before)
    if (after !== before) {
      writeFileSync(file, after)
      changed++
      console.log(`  ✅ ${rel}/${name} の絶対パスを相対化`)
    }
  }
}

if (!scanned) {
  // Storybook を建てていないときは何もしない（エラーにしない）
  console.log('manifests がありません。何もしませんでした。')
} else if (!changed) {
  console.log(`絶対パスなし (${scanned} ファイル)`)
}
