/**
 * Kaze Design System MCP Server
 * 4ツール + 3リソース
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'

import { checkRuleTool } from './tools/check-rule.js'
import { getComponentTool } from './tools/get-component.js'
import { getTokenTool } from './tools/get-token.js'
import { searchTool } from './tools/search.js'
import { loadTokens, loadComponents, loadProhibited } from './utils/loader.js'

export const createServer = () => {
  const server = new McpServer({
    name: 'kaze-design-system',
    version: '0.1.0',
  })

  // --- ツール登録 ---
  server.tool(
    'get_token',
    'デザイントークンをドットパスで取得。例: color.light.primary.main, typography.fontSize.md',
    { path: z.string().describe('トークンのドットパス') },
    async ({ path }) => getTokenTool.handler({ path })
  )

  server.tool(
    'get_component',
    'コンポーネントの仕様を取得。例: button, customTextField',
    { name: z.string().describe('コンポーネント名 (camelCase)') },
    async ({ name }) => getComponentTool.handler({ name })
  )

  server.tool(
    'check_rule',
    'コードスニペットを禁止パターンに照合。違反があれば ID・理由を返す',
    { code: z.string().describe('チェック対象のコードスニペット') },
    async ({ code }) => checkRuleTool.handler({ code })
  )

  server.tool(
    'search',
    'トークン・コンポーネントを横断検索',
    {
      query: z.string().describe('検索クエリ'),
      scope: z
        .enum(['tokens', 'components', 'all'])
        .optional()
        .describe('検索範囲'),
    },
    async ({ query, scope }) => searchTool.handler({ query, scope })
  )

  // --- リソース登録 ---
  server.resource(
    'kaze://tokens',
    'Kaze デザイントークン (W3C DTCG)',
    async () => ({
      contents: [
        {
          uri: 'kaze://tokens',
          mimeType: 'application/json',
          text: JSON.stringify(loadTokens(), null, 2),
        },
      ],
    })
  )

  server.resource(
    'kaze://components',
    'Kaze コンポーネントメタデータ',
    async () => ({
      contents: [
        {
          uri: 'kaze://components',
          mimeType: 'application/json',
          text: JSON.stringify(loadComponents(), null, 2),
        },
      ],
    })
  )

  server.resource('kaze://rules', 'Kaze 禁止パターン', async () => ({
    contents: [
      {
        uri: 'kaze://rules',
        mimeType: 'text/markdown',
        text: loadProhibited(),
      },
    ],
  }))

  return server
}
