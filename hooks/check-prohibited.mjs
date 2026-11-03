#!/usr/bin/env node
/**
 * PostToolUse hook（Write|Edit）: 編集されたファイルを DS 禁止パターンに照合する。
 *
 * 消費側リポジトリでは ESLint `kaze/*` や pre-commit が無いので、
 * この hook が最前線のガードになる。違反があれば exit 2 + stderr で
 * エージェントに差し戻し、その場で自己修正させる。
 *
 * 検出ロジックは持たない。単一ソース `scripts/lib/ds-rules.mjs` の
 * `detect` をそのまま実行する（ここに正規表現を書いた時点で二重管理）。
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

// Plugin として配布されたときは CLAUDE_PLUGIN_ROOT、単体実行ならリポジトリルート
const root =
  process.env.CLAUDE_PLUGIN_ROOT ??
  resolve(dirname(fileURLToPath(import.meta.url)), '..')

const readStdin = async () => {
  let buf = ''
  for await (const chunk of process.stdin) buf += chunk
  return buf
}

const main = async () => {
  let input
  try {
    input = JSON.parse(await readStdin())
  } catch {
    return // hook 入力が読めないときは黙って通す（編集自体を壊さない）
  }

  const filePath = input?.tool_input?.file_path
  if (!filePath || !/\.(ts|tsx)$/.test(filePath)) return
  // story の meta / 設定ファイルは export default が正当。型定義も対象外
  if (/\.(stories|config|d)\.(ts|tsx)$/.test(filePath)) return

  let src
  try {
    src = readFileSync(filePath, 'utf-8')
  } catch {
    return
  }

  const { DS_RULES } = await import(
    pathToFileURL(resolve(root, 'scripts/lib/ds-rules.mjs')).href
  )

  const violations = []
  for (const rule of DS_RULES) {
    if (!rule.detect) continue
    for (const hit of rule.detect(src)) {
      violations.push(
        `${rule.id} ${filePath}:${hit.line} — 禁止: ${rule.forbidden} → ${rule.instead}`
      )
    }
  }

  if (violations.length > 0) {
    console.error(
      `Kaze DS 禁止パターン違反 ${violations.length} 件。修正してください:\n` +
        violations.map((v) => `  ${v}`).join('\n')
    )
    process.exit(2)
  }
}

main()
