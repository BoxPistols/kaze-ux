/**
 * get_component ツール
 * コンポーネント仕様を取得
 * 例: button → { name, category, variants, sizes, accessibility, sample, ... }
 */

import { loadComponents } from '../utils/loader.js'

export const getComponentTool = {
  name: 'get_component',
  description:
    'コンポーネントの仕様を取得。例: button, customTextField, layoutWithSidebar',
  inputSchema: {
    type: 'object' as const,
    properties: {
      name: {
        type: 'string',
        description:
          'コンポーネント名 (camelCase。例: button, customTextField)',
      },
    },
    required: ['name'],
  },
  handler: ({ name }: { name: string }) => {
    const data = loadComponents()
    const components = data.components as Record<string, unknown> | undefined

    if (!components) {
      return {
        content: [
          { type: 'text' as const, text: 'components.json の読み込みに失敗' },
        ],
      }
    }

    // 完全一致
    const component = components[name]
    if (component) {
      return {
        content: [
          { type: 'text' as const, text: JSON.stringify(component, null, 2) },
        ],
      }
    }

    // 部分一致で候補を提示
    const keys = Object.keys(components)
    const matches = keys.filter(
      (k) =>
        k.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(k.toLowerCase())
    )

    if (matches.length > 0) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Component "${name}" not found.\n\nDid you mean:\n${matches.map((m) => `  - ${m}`).join('\n')}`,
          },
        ],
      }
    }

    // カテゴリ一覧
    const categories = new Map<string, string[]>()
    for (const [key, val] of Object.entries(components)) {
      const cat = (val as Record<string, unknown>).category as string
      const existing = categories.get(cat) ?? []
      existing.push(key)
      categories.set(cat, existing)
    }

    const categoryList = [...categories.entries()]
      .map(([cat, comps]) => `${cat}: ${comps.join(', ')}`)
      .join('\n')

    return {
      content: [
        {
          type: 'text' as const,
          text: `Component "${name}" not found.\n\nAvailable components:\n${categoryList}`,
        },
      ],
    }
  },
}
