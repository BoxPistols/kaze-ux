#!/usr/bin/env node
/**
 * metadata/components.json が名乗る名前が、実際に export されているか。
 *
 *   pnpm check:exports
 *
 * このファイルは MCP サーバが AI に配る唯一の部品情報なので、name と
 * import の組み合わせがそのまま生成コードになる。story のタイトルは
 * 見出しであって export 名とは限らず（Accordion / CustomAccordion）、
 * 実測では 5 件がずれていた。
 *
 * 読んだエージェントは `import { Accordion } from '@/components/ui/accordion'`
 * を書いてビルドが落ちる。しかも MUI の Accordion に逃げようとすると
 * ds-equivalents.mjs の対応表により ESLint が error で止めるので、
 * **正解にたどり着く手がかりがどこにも無い**。
 *
 * sample があれば正しい名前が書いてあるが、sample の無いエントリは
 * 訂正する材料が無い。だから sample の有無によらず突き合わせる。
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const META = resolve(ROOT, 'metadata', 'components.json')

/** そのファイルが export している値の名前（型は除く） */
const exportedNames = (src) => {
  const names = new Set()
  for (const m of src.matchAll(/export\s+(?:const|function|class)\s+(\w+)/g)) {
    names.add(m[1])
  }
  for (const m of src.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of m[1].split(',')) {
      const t = part
        .trim()
        .split(/\s+as\s+/)
        .pop()
      if (t && !t.startsWith('type')) names.add(t)
    }
  }
  return names
}

/** `@/components/ui/accordion` を実ファイルまで辿って export 名を集める */
const resolveExports = (importPath) => {
  const base = importPath.replace('@/', 'src/')
  for (const cand of [
    `${base}.tsx`,
    `${base}.ts`,
    join(base, 'index.tsx'),
    join(base, 'index.ts'),
  ]) {
    const abs = resolve(ROOT, cand)
    if (!existsSync(abs)) continue
    const src = readFileSync(abs, 'utf-8')
    const names = exportedNames(src)
    // index が再輸出しているだけのことがあるので 1 段だけ辿る
    for (const m of src.matchAll(/export\s*\*\s*from\s*'([^']+)'/g)) {
      const rel = join(dirname(cand), m[1])
      for (const c2 of [
        `${rel}.tsx`,
        `${rel}.ts`,
        join(rel, 'index.tsx'),
        join(rel, 'index.ts'),
      ]) {
        const abs2 = resolve(ROOT, c2)
        if (existsSync(abs2)) {
          for (const n of exportedNames(readFileSync(abs2, 'utf-8')))
            names.add(n)
        }
      }
    }
    return { names, file: cand }
  }
  return null
}

const data = JSON.parse(readFileSync(META, 'utf-8'))
const components = data.components ?? {}

const problems = []
let checked = 0
let external = 0

for (const [key, c] of Object.entries(components)) {
  if (!c.import) continue
  // 外部パッケージは対象外（このリポジトリでは実体を確かめられない）
  if (!c.import.startsWith('@/')) {
    external++
    continue
  }
  const resolved = resolveExports(c.import)
  if (!resolved) {
    problems.push(`${key}: import 先が見つからない (${c.import})`)
    continue
  }
  checked++
  const advertised = c.exportName ?? c.name
  if (!resolved.names.has(advertised)) {
    const hint = [...resolved.names].slice(0, 6).join(', ')
    problems.push(
      `${key}: "${advertised}" は ${resolved.file} から export されていない` +
        `（実体: ${hint}）`
    )
  }
}

console.log(
  `部品 ${Object.keys(components).length} 件 / 実体を照合 ${checked} 件 / ` +
    `外部パッケージ ${external} 件`
)

if (problems.length > 0) {
  console.error('\n名乗っている名前が実体と一致していません:')
  for (const p of problems) console.error(`  ✗ ${p}`)
  console.error(
    '\nstory の `component:` を実体に合わせるか、metadata/curated.json に' +
      ' exportName を書いてください（pnpm export-metadata で再生成）'
  )
  process.exit(1)
}

console.log('✅ metadata が名乗る名前は、すべて実際に export されています')
