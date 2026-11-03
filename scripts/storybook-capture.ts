/**
 * Storybook Figma キャプチャ準備スクリプト
 *
 * preview-head.html にキャプチャスクリプトを注入して Storybook を起動する。
 * 終了時に自動でスクリプトを除去する。
 *
 * 使い方: pnpm storybook:capture
 *
 * 起動後、Claude Code の generate_figma_design で各ページをキャプチャ。
 * Ctrl+C で停止するとキャプチャスクリプトが自動除去される。
 */

import { spawn } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PREVIEW_HEAD = resolve(__dirname, '..', '.storybook', 'preview-head.html')
const CAPTURE_SCRIPT =
  '<script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script>'

const inject = (): void => {
  const content = readFileSync(PREVIEW_HEAD, 'utf-8')
  if (content.includes('capture.js')) {
    console.log('キャプチャスクリプトは既に注入済み')
    return
  }
  const updated = CAPTURE_SCRIPT + '\n' + content
  writeFileSync(PREVIEW_HEAD, updated)
  console.log('キャプチャスクリプトを注入しました')
}

const remove = (): void => {
  const content = readFileSync(PREVIEW_HEAD, 'utf-8')
  if (!content.includes('capture.js')) return
  const updated = content
    .replace(CAPTURE_SCRIPT + '\n', '')
    .replace(CAPTURE_SCRIPT, '')
  writeFileSync(PREVIEW_HEAD, updated)
  console.log('キャプチャスクリプトを除去しました')
}

// 注入
inject()

console.log('')
console.log('Storybook をキャプチャモードで起動します...')
console.log('Ctrl+C で停止するとキャプチャスクリプトが自動除去されます')
console.log('')

// Storybook 起動
const sb = spawn('pnpm', ['storybook', '--no-open'], {
  stdio: 'inherit',
  shell: true,
})

const cleanup = (): void => {
  remove()
  if (!sb.killed) {
    sb.kill('SIGTERM')
  }
}

process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})
process.on('SIGTERM', () => {
  cleanup()
  process.exit(0)
})
process.on('exit', () => {
  remove()
})
process.on('uncaughtException', (err) => {
  console.error('予期しないエラー:', err)
  cleanup()
  process.exit(1)
})

sb.on('exit', (code) => {
  remove()
  process.exit(code ?? 0)
})
