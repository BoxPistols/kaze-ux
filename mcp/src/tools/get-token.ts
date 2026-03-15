/**
 * get_token ツール
 * ドットパスでデザイントークンを検索
 * 例: color.light.primary.main → { "$value": "#0EADB8", "$type": "color" }
 */

import { loadTokens, resolveTokenPath } from '../utils/loader.js'

export const getTokenTool = {
  name: 'get_token',
  description:
    'デザイントークンをドットパスで取得。例: color.light.primary.main, typography.fontSize.md, spacing.4',
  inputSchema: {
    type: 'object' as const,
    properties: {
      path: {
        type: 'string',
        description: 'トークンのドットパス (例: color.light.primary.main)',
      },
    },
    required: ['path'],
  },
  handler: ({ path }: { path: string }) => {
    const tokens = loadTokens()
    const value = resolveTokenPath(tokens, path)

    if (value === undefined) {
      // パスが見つからない場合、候補を提示
      const parts = path.split('.')
      const parentPath = parts.slice(0, -1).join('.')
      const parent = resolveTokenPath(tokens, parentPath)

      if (typeof parent === 'object' && parent !== null) {
        const keys = Object.keys(parent as Record<string, unknown>).filter(
          (k) => !k.startsWith('$')
        )
        return {
          content: [
            {
              type: 'text' as const,
              text: `Token not found: "${path}"\n\nAvailable keys at "${parentPath}":\n${keys.map((k) => `  - ${parentPath}.${k}`).join('\n')}`,
            },
          ],
        }
      }

      return {
        content: [
          { type: 'text' as const, text: `Token not found: "${path}"` },
        ],
      }
    }

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(value, null, 2),
        },
      ],
    }
  },
}
