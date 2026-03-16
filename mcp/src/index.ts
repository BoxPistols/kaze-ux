#!/usr/bin/env node
/**
 * Kaze Design System MCP Server エントリーポイント
 * stdio トランスポートで起動
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

import { createServer } from './server.js'

const main = async () => {
  const server = createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('Kaze MCP Server started (stdio)')
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error)
  process.exit(1)
})
