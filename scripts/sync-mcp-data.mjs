#!/usr/bin/env node
/**
 * npm 配布物にデザインシステムのデータを同梱する。
 *
 *   pnpm sync:mcp-data
 *
 * ## なぜ要るか
 *
 * MCP サーバはトークン・部品仕様・禁止ルールを**リポジトリのルートから**読む。
 * リポジトリの中で動かす限りこれで足りるが、npm から入れた
 * `npx kaze-mcp` は node_modules の中で動くので、その 3 つがどこにも無い。
 * **起動はする。ツール一覧も返る。中身だけが空になる。**
 * 一番気づきにくい壊れ方なので、配布物には必ずデータを同梱する。
 *
 * ## data/ は編集場所ではない
 *
 * ここが作る `mcp/data/` は生成物のコピーであって、第 2 の正ではない。
 * 手で編集しても次の publish で上書きされる。DESIGN.md の
 * 「同じ知識を 2 箇所に書いた時点で設計違反」に従い、.gitignore して
 * publish 時にだけ作る（`prepublishOnly` から呼ばれる）。
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const DEST = resolve(ROOT, 'mcp', 'data')

/** [コピー元（リポジトリ内の生成物）, コピー先のファイル名] */
const FILES = [
  ['design-tokens/tokens.json', 'tokens.json'],
  ['metadata/components.json', 'components.json'],
  ['foundations/prohibited.md', 'prohibited.md'],
]

const missing = FILES.filter(([src]) => !existsSync(resolve(ROOT, src)))
if (missing.length) {
  console.error(
    '❌ 同梱するデータが揃っていません。先に生成してください:\n' +
      missing.map(([src]) => `   ${src}`).join('\n') +
      '\n   pnpm export-tokens && pnpm export-metadata && pnpm export-rules'
  )
  process.exit(1)
}

mkdirSync(DEST, { recursive: true })
for (const [src, name] of FILES) {
  copyFileSync(resolve(ROOT, src), resolve(DEST, name))
  console.log(`  ${src} → mcp/data/${name}`)
}

console.log(`✅ 配布物用のデータ ${FILES.length} 件を mcp/data/ に同梱しました`)
