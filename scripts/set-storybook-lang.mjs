#!/usr/bin/env node
/**
 * Storybook の成果物の `<html lang="en">` を `ja` に書き換える。
 *
 * Storybook は manager / preview とも HTML テンプレートの lang を設定で
 * 変えられない。中身はほぼ日本語なので、en のままだと読み上げソフトが
 * 英語の発音で読み、検索エンジンも言語を誤判定する。
 *
 * `build-storybook` の後に自動で走る（package.json の postbuild-storybook）。
 *
 *   node scripts/set-storybook-lang.mjs [outDir]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const outDir = resolve(ROOT, process.argv[2] ?? 'storybook-static')

// `build-storybook -o <dir>`（vrt.mjs など）では postbuild に出力先が渡らない。
// その場合は既定の出力先が無いので、何もしなかったことを明示して抜ける
if (!existsSync(outDir)) {
  console.log(`- ${outDir} が無いので lang の書き換えを飛ばしました`)
  process.exit(0)
}

const targets = ['index.html', 'iframe.html'].map((f) => join(outDir, f))
let changed = 0

for (const file of targets) {
  if (!existsSync(file)) {
    // 片方でも無いのはビルドが壊れている。黙って成功にしない
    console.error(`❌ ${file} がありません`)
    process.exit(1)
  }
  const html = readFileSync(file, 'utf-8')
  const next = html.replace(/<html lang="[^"]*"/, '<html lang="ja"')
  if (!/<html lang="ja"/.test(next)) {
    console.error(`❌ ${file} の <html lang> を書き換えられませんでした`)
    process.exit(1)
  }
  if (next !== html) {
    writeFileSync(file, next)
    changed++
  }
}

console.log(`✅ Storybook の lang を ja に設定（${changed} ファイル更新）`)
