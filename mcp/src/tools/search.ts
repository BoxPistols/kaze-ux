/**
 * search ツール
 * トークン・コンポーネントを横断検索
 */

import { loadTokens, loadComponents } from '../utils/loader.js'

interface SearchResult {
  type: 'token' | 'component'
  path: string
  match: string
  value?: unknown
}

const searchInObject = (
  obj: unknown,
  query: string,
  path: string,
  results: SearchResult[],
  type: 'token' | 'component',
  depth = 0
): void => {
  if (depth > 8) return
  if (typeof obj !== 'object' || obj === null) return

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const currentPath = path ? `${path}.${key}` : key
    const lowerQuery = query.toLowerCase()

    // キー名にマッチ
    if (key.toLowerCase().includes(lowerQuery)) {
      results.push({ type, path: currentPath, match: key, value })
    }

    // 文字列値にマッチ
    if (typeof value === 'string' && value.toLowerCase().includes(lowerQuery)) {
      results.push({ type, path: currentPath, match: value })
    }

    // 再帰
    if (typeof value === 'object' && value !== null) {
      searchInObject(value, query, currentPath, results, type, depth + 1)
    }
  }
}

export const searchTool = {
  name: 'search',
  description: 'トークン・コンポーネントを横断検索。キー名・値でマッチ',
  inputSchema: {
    type: 'object' as const,
    properties: {
      query: {
        type: 'string',
        description: '検索クエリ (例: primary, button, spacing)',
      },
      scope: {
        type: 'string',
        description: '検索範囲 (tokens, components, all)',
        enum: ['tokens', 'components', 'all'],
      },
    },
    required: ['query'],
  },
  handler: ({ query, scope = 'all' }: { query: string; scope?: string }) => {
    const results: SearchResult[] = []

    if (scope === 'all' || scope === 'tokens') {
      const tokens = loadTokens()
      searchInObject(tokens, query, '', results, 'token')
    }

    if (scope === 'all' || scope === 'components') {
      const data = loadComponents()
      const components = data.components as Record<string, unknown> | undefined
      if (components) {
        searchInObject(components, query, '', results, 'component')
      }
    }

    // 重複除去 + 上位20件
    const unique = results.filter(
      (r, i, arr) => arr.findIndex((x) => x.path === r.path) === i
    )
    const top = unique.slice(0, 20)

    if (top.length === 0) {
      return {
        content: [
          { type: 'text' as const, text: `"${query}" に一致する結果なし` },
        ],
      }
    }

    const text = top
      .map((r) => {
        const prefix = r.type === 'token' ? '🎨' : '🧩'
        const val = r.value ? ` → ${JSON.stringify(r.value)}` : ''
        return `${prefix} ${r.path}${val}`
      })
      .join('\n')

    return {
      content: [
        {
          type: 'text' as const,
          text: `${top.length} 件の結果 (${unique.length} 件中):\n\n${text}`,
        },
      ],
    }
  },
}
