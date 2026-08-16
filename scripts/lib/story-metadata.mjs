/**
 * story から部品のメタデータを抽出する。**単一ソースは story。**
 *
 * これまで metadata/components.json は手書きで、公開している 54 件のうち
 * 18 件（33%）しか載っていなかった。MCP 経由でこれを読むエージェントは、
 * 残り 36 件について**何も返ってこないので prop を推測して書く**。
 * 手書きの一覧は必ず遅れるので、story から生成する。
 *
 * story には既に必要なものが揃っている。
 * - `title` … 名前とカテゴリ
 * - `component` … 実体（import 元まで辿れる）
 * - `parameters.docs.description.component` … 説明（人が書いた文章）
 * - `argTypes` … prop・variant・size と、その選択肢
 *
 * story に無いのは「禁止事項」と「アクセシビリティ上の要件」だけなので、
 * そこだけ metadata/curated.json で重ねる。
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, relative } from 'node:path'

/** ブレースの対応を数えてブロックを切り出す */
export const braceBlock = (text, startIdx) => {
  let depth = 0
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '{') depth++
    else if (text[i] === '}') {
      depth--
      if (depth === 0) return text.slice(startIdx, i + 1)
    }
  }
  return null
}

export const findStoryFiles = (dir) => {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...findStoryFiles(p))
    else if (entry.name.endsWith('.stories.tsx')) out.push(p)
  }
  return out.sort()
}

/** `import { X, Y } from 'spec'` から X の import 元を引く */
const importSpecifierOf = (src, symbol) => {
  const re = /import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+'([^']+)'/g
  for (const m of src.matchAll(re)) {
    const names = m[1].split(',').map((s) =>
      s
        .trim()
        .split(/\s+as\s+/)[0]
        .trim()
    )
    if (names.includes(symbol)) return m[2]
  }
  const def = src.match(new RegExp(`import\\s+${symbol}\\s+from\\s+'([^']+)'`))
  return def ? def[1] : null
}

/**
 * argTypes を prop の一覧に変換する。
 *
 * control 名はハイフンを含むことがある（inline-radio）。`\w+` で拾うと
 * その prop が丸ごと消えるので `[\w-]+` で取る（tokens.json で踏んだ穴）。
 */
const parseArgTypes = (block) => {
  if (!block) return {}
  const props = {}
  const re = /(\w+):\s*\{/g
  for (const m of block.matchAll(re)) {
    const propBlock = braceBlock(block, m.index + m[0].length - 1)
    if (!propBlock) continue
    const control = propBlock.match(/control:\s*['"]([\w-]+)['"]/)
    if (!control) continue
    const entry = { control: control[1].replace(/^inline-/, '') }
    const options = propBlock.match(/options:\s*\[([\s\S]*?)\]/)
    if (options) {
      entry.options = options[1]
        .split(',')
        .map((s) => s.trim().replace(/['"]/g, ''))
        .filter(Boolean)
    }
    const desc = propBlock.match(/description:\s*['"]([^'"]+)['"]/)
    if (desc) entry.description = desc[1]
    props[m[1]] = entry
  }
  return props
}

/** description は配列を join している書き方が多いので両方に対応する */
const parseDescription = (src) => {
  const idx = src.indexOf('component: [')
  if (idx !== -1) {
    const arr = src.slice(idx + 'component: '.length)
    const end = arr.indexOf('].join(')
    if (end !== -1) {
      return arr
        .slice(1, end)
        .split('\n')
        .map((l) => l.trim().replace(/^['"]|['"],?$/g, ''))
        .join('\n')
        .trim()
    }
  }
  const single = src.match(/component:\s*['"]([^'"]{4,})['"]/)
  return single ? single[1] : null
}

/**
 * 1 つの story ファイルから部品 1 件分を作る。
 *
 * `root` を渡すと storyFile をリポジトリ相対にする。生成物に絶対パスを
 * 入れると、書いた人の home ディレクトリがコミットに残り、他の環境では
 * 意味を持たない
 */
export const extractComponent = (file, root) => {
  const src = readFileSync(file, 'utf-8')
  const title = src.match(/title:\s*'([^']+)'/)
  if (!title) return null
  const parts = title[1].split('/')
  const name = parts[parts.length - 1]

  const componentSymbol = src.match(/component:\s*(\w+)\s*,/)
  const symbol = componentSymbol ? componentSymbol[1] : null

  const argTypesIdx = src.indexOf('argTypes: {')
  const argTypes = parseArgTypes(
    argTypesIdx === -1
      ? null
      : braceBlock(src, argTypesIdx + 'argTypes: '.length)
  )

  const props = argTypes
  const variants = props.variant?.options ?? null
  const sizes = props.size?.options ?? null

  return {
    name,
    category: parts.length > 2 ? parts.slice(1, -1).join('/') : 'UI',
    story: title[1],
    storyFile: root ? relative(root, file) : file,
    import: symbol ? importSpecifierOf(src, symbol) : null,
    description: parseDescription(src),
    ...(variants ? { variants } : {}),
    ...(sizes ? { sizes } : {}),
    props,
  }
}
