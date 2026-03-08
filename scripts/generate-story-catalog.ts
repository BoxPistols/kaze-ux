/**
 * ストーリーカタログ生成スクリプト
 *
 * Storybook の index.json を解析し、コンポーネント→URL マッピングを生成する。
 * Code Connect セットアップや html.to.design でのバッチ変換に使用。
 *
 * 前提: pnpm build-storybook が完了していること
 * 使い方: pnpm export-story-catalog
 * 出力先: design-tokens/story-catalog.json
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const INDEX_PATH = resolve(ROOT, 'storybook-static', 'index.json')
const OUTPUT_DIR = resolve(ROOT, 'design-tokens')

// Storybook の base URL（ローカル開発 or デプロイ先）
const STORYBOOK_BASE = process.env.STORYBOOK_URL || 'http://localhost:6006'

interface StoryEntry {
  type: 'story' | 'docs'
  subtype?: string
  id: string
  name: string
  title: string
  importPath: string
  tags: string[]
  exportName?: string
}

interface IndexJson {
  v: number
  entries: Record<string, StoryEntry>
}

interface CatalogEntry {
  id: string
  title: string
  name: string
  exportName: string
  category: string
  storyUrl: string
  iframeUrl: string
  docsUrl: string
  importPath: string
  type: 'story' | 'docs'
}

interface CatalogOutput {
  generatedAt: string
  storybookBaseUrl: string
  totalStories: number
  totalDocs: number
  categories: Record<string, number>
  entries: CatalogEntry[]
}

// --- メイン処理 ---

const raw = readFileSync(INDEX_PATH, 'utf-8')
const index: IndexJson = JSON.parse(raw)

const entries: CatalogEntry[] = []
const categories: Record<string, number> = {}

for (const [_key, entry] of Object.entries(index.entries)) {
  // カテゴリ抽出（最初のスラッシュ区切り）
  const parts = entry.title.split('/')
  const category = parts[0] || 'Other'

  categories[category] = (categories[category] || 0) + 1

  entries.push({
    id: entry.id,
    title: entry.title,
    name: entry.name,
    exportName: entry.exportName || entry.name,
    category,
    storyUrl: `${STORYBOOK_BASE}/?path=/story/${entry.id}`,
    iframeUrl: `${STORYBOOK_BASE}/iframe.html?id=${entry.id}&viewMode=story`,
    docsUrl: `${STORYBOOK_BASE}/?path=/docs/${entry.id}`,
    importPath: entry.importPath,
    type: entry.type,
  })
}

// カテゴリ→タイトル順でソート
entries.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category)
  if (a.title !== b.title) return a.title.localeCompare(b.title)
  return a.name.localeCompare(b.name)
})

const storyCount = entries.filter((e) => e.type === 'story').length
const docsCount = entries.filter((e) => e.type === 'docs').length

const output: CatalogOutput = {
  generatedAt: new Date().toISOString(),
  storybookBaseUrl: STORYBOOK_BASE,
  totalStories: storyCount,
  totalDocs: docsCount,
  categories,
  entries,
}

mkdirSync(OUTPUT_DIR, { recursive: true })
const outputPath = resolve(OUTPUT_DIR, 'story-catalog.json')
writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8')

console.log(`Story catalog exported to: ${outputPath}`)
console.log(`  - Stories: ${storyCount}`)
console.log(`  - Docs: ${docsCount}`)
console.log(`  - Categories:`)
for (const [cat, count] of Object.entries(categories).sort()) {
  console.log(`    ${cat}: ${count}`)
}
console.log(
  `\nhtml.to.design で使う場合: iframeUrl を Figma プラグインに貼り付け`
)
