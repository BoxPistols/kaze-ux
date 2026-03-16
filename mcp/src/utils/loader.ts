/**
 * デザインシステムデータの読み込み・キャッシュ
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..', '..', '..')

// キャッシュ
let tokensCache: Record<string, unknown> | null = null
let componentsCache: Record<string, unknown> | null = null
let prohibitedCache: string | null = null

/**
 * design-tokens/tokens.json を読み込み
 */
export const loadTokens = (): Record<string, unknown> => {
  if (tokensCache) return tokensCache
  const path = resolve(ROOT, 'design-tokens', 'tokens.json')
  tokensCache = JSON.parse(readFileSync(path, 'utf-8')) as Record<
    string,
    unknown
  >
  return tokensCache
}

/**
 * metadata/components.json を読み込み
 */
export const loadComponents = (): Record<string, unknown> => {
  if (componentsCache) return componentsCache
  const path = resolve(ROOT, 'metadata', 'components.json')
  componentsCache = JSON.parse(readFileSync(path, 'utf-8')) as Record<
    string,
    unknown
  >
  return componentsCache
}

/**
 * foundations/prohibited.md を読み込み
 */
export const loadProhibited = (): string => {
  if (prohibitedCache) return prohibitedCache
  const path = resolve(ROOT, 'foundations', 'prohibited.md')
  prohibitedCache = readFileSync(path, 'utf-8')
  return prohibitedCache
}

/**
 * ドットパスでネストされたオブジェクトの値を取得
 * 例: resolveTokenPath(tokens, 'color.light.primary.main')
 */
export const resolveTokenPath = (
  obj: Record<string, unknown>,
  path: string
): unknown => {
  const keys = path.split('.')
  let current: unknown = obj
  for (const key of keys) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current
}

// 禁止パターンのルール定義
export interface ProhibitedRule {
  id: string
  pattern: string
  reason: string
  category: string
}

/**
 * prohibited.md からルールをパース
 */
export const parseProhibitedRules = (): ProhibitedRule[] => {
  const md = loadProhibited()
  const rules: ProhibitedRule[] = []
  let currentCategory = ''

  for (const line of md.split('\n')) {
    // カテゴリ見出し
    const headingMatch = line.match(/^## (.+)/)
    if (headingMatch) {
      currentCategory = headingMatch[1]
      continue
    }

    // テーブル行: | ID | 禁止 | 理由/代替 |
    const rowMatch = line.match(/^\|\s*([\w]+)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|$/)
    if (rowMatch && rowMatch[1] !== 'ID' && !rowMatch[1].startsWith('-')) {
      rules.push({
        id: rowMatch[1],
        pattern: rowMatch[2].replace(/`/g, ''),
        reason: rowMatch[3].replace(/`/g, ''),
        category: currentCategory,
      })
    }
  }

  return rules
}
