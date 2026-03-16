/**
 * Figma Variables 同期スクリプト
 *
 * design-tokens/tokens.json を読み込み、Figma REST API で
 * Variables / Variable Collections として登録する。
 *
 * 必要な環境変数:
 *   FIGMA_ACCESS_TOKEN - Figma Personal Access Token
 *   FIGMA_FILE_KEY     - 対象ファイルのキー（URLから取得）
 *
 * 使い方: FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN FIGMA_FILE_KEY=YOUR_FILE_KEY pnpm tsx scripts/push-tokens-to-figma.ts
 */

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const FIGMA_API = 'https://api.figma.com/v1'
const TOKEN = process.env.FIGMA_ACCESS_TOKEN
const FILE_KEY = process.env.FIGMA_FILE_KEY

if (!TOKEN || !FILE_KEY) {
  console.error(
    '環境変数 FIGMA_ACCESS_TOKEN と FIGMA_FILE_KEY を設定してください'
  )
  console.error(
    '例: FIGMA_ACCESS_TOKEN=figd_YOUR_TOKEN FIGMA_FILE_KEY=YOUR_FILE_KEY pnpm tsx scripts/push-tokens-to-figma.ts'
  )
  process.exit(1)
}

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

interface FigmaVariableCreate {
  action: 'CREATE'
  id: string
  name: string
  variableCollectionId: string
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR'
  description?: string
}

interface FigmaVariableUpdate {
  action: 'UPDATE'
  id: string
  name?: string
  description?: string
}

interface FigmaVariableModeValue {
  variableId: string
  modeId: string
  value:
    | boolean
    | number
    | string
    | { r: number; g: number; b: number; a: number }
}

// ---------------------------------------------------------------------------
// カラー変換
// ---------------------------------------------------------------------------

const hexToRgba = (
  hex: string
): { r: number; g: number; b: number; a: number } | null => {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return null

  const clean = hex.replace('#', '')
  if (clean.length < 6) return null

  const r = parseInt(clean.slice(0, 2), 16) / 255
  const g = parseInt(clean.slice(2, 4), 16) / 255
  const b = parseInt(clean.slice(4, 6), 16) / 255
  const a = clean.length === 8 ? parseInt(clean.slice(6, 8), 16) / 255 : 1

  return { r, g, b, a }
}

// ---------------------------------------------------------------------------
// トークン → Figma Variables 変換
// ---------------------------------------------------------------------------

interface TokenNode {
  $value?: unknown
  $type?: string
  $description?: string
  [key: string]: unknown
}

interface VariableEntry {
  name: string
  resolvedType: 'BOOLEAN' | 'FLOAT' | 'STRING' | 'COLOR'
  value:
    | boolean
    | number
    | string
    | { r: number; g: number; b: number; a: number }
  description?: string
}

const flattenTokens = (node: TokenNode, prefix: string): VariableEntry[] => {
  const entries: VariableEntry[] = []

  if ('$value' in node && node.$type) {
    const entry = tokenToVariable(node, prefix)
    if (entry) entries.push(entry)
    return entries
  }

  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue
    if (typeof child === 'object' && child !== null) {
      entries.push(...flattenTokens(child as TokenNode, `${prefix}/${key}`))
    }
  }

  return entries
}

const tokenToVariable = (
  node: TokenNode,
  name: string
): VariableEntry | null => {
  const type = node.$type as string
  const value = node.$value
  const description = node.$description as string | undefined

  switch (type) {
    case 'color': {
      const rgba = hexToRgba(String(value))
      if (!rgba) return null
      return { name, resolvedType: 'COLOR', value: rgba, description }
    }
    case 'boolean':
      return {
        name,
        resolvedType: 'BOOLEAN',
        value: Boolean(value),
        description,
      }
    case 'number':
    case 'fontWeight':
      return {
        name,
        resolvedType: 'FLOAT',
        value: Number(value),
        description,
      }
    case 'dimension': {
      const px = String(value).replace('px', '')
      const num = parseFloat(px)
      if (isNaN(num)) return null
      return { name, resolvedType: 'FLOAT', value: num, description }
    }
    case 'string':
    case 'other':
      return {
        name,
        resolvedType: 'STRING',
        value: String(value),
        description,
      }
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Figma API 呼び出し
// ---------------------------------------------------------------------------

const figmaFetch = async (
  path: string,
  method = 'GET',
  body?: unknown
): Promise<unknown> => {
  const res = await fetch(`${FIGMA_API}${path}`, {
    method,
    headers: {
      'X-Figma-Token': TOKEN ?? '',
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Figma API ${res.status}: ${text}`)
  }

  return res.json()
}

const getExistingCollections = async (): Promise<
  Record<string, { id: string; defaultModeId: string }>
> => {
  const data = (await figmaFetch(`/files/${FILE_KEY}/variables/local`)) as {
    meta: {
      variableCollections: Record<
        string,
        { id: string; name: string; modes: { modeId: string }[] }
      >
    }
  }

  const result: Record<string, { id: string; defaultModeId: string }> = {}
  for (const col of Object.values(data.meta.variableCollections)) {
    result[col.name] = {
      id: col.id,
      defaultModeId: col.modes[0].modeId,
    }
  }
  return result
}

const getExistingVariables = async (): Promise<
  Record<string, { id: string; name: string; collectionId: string }>
> => {
  const data = (await figmaFetch(`/files/${FILE_KEY}/variables/local`)) as {
    meta: {
      variables: Record<
        string,
        { id: string; name: string; variableCollectionId: string }
      >
    }
  }

  const result: Record<
    string,
    { id: string; name: string; collectionId: string }
  > = {}
  for (const v of Object.values(data.meta.variables)) {
    result[v.name] = {
      id: v.id,
      name: v.name,
      collectionId: v.variableCollectionId,
    }
  }
  return result
}

// ---------------------------------------------------------------------------
// メイン処理
// ---------------------------------------------------------------------------

const main = async () => {
  const tokensPath = resolve(__dirname, '..', 'design-tokens', 'tokens.json')
  const tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'))

  console.log('Figma Variables 同期を開始します...')
  console.log(`  File: ${FILE_KEY}`)

  const existingCollections = await getExistingCollections()
  const existingVariables = await getExistingVariables()
  console.log(
    `  既存: ${Object.keys(existingCollections).length} collections, ${Object.keys(existingVariables).length} variables`
  )

  const collectionMap: Record<string, string[]> = {
    'Color/Light': ['color.light'],
    'Color/Dark': ['color.dark'],
    Typography: ['typography'],
    Spacing: ['spacing'],
    'Border Radius': ['borderRadius'],
    Shadow: ['shadow'],
    Breakpoint: ['breakpoint'],
    Component: ['component'],
  }

  for (const [collectionName, tokenPaths] of Object.entries(collectionMap)) {
    console.log(`\n--- ${collectionName} ---`)

    const entries: VariableEntry[] = []
    for (const tokenPath of tokenPaths) {
      const parts = tokenPath.split('.')
      let node = tokens
      for (const p of parts) {
        node = node?.[p]
      }
      if (!node) {
        console.log(`  スキップ: ${tokenPath} が見つかりません`)
        continue
      }
      const prefix = tokenPath.split('.').pop() ?? tokenPath
      entries.push(...flattenTokens(node, prefix))
    }

    if (entries.length === 0) {
      console.log('  変数なし、スキップ')
      continue
    }

    let collectionId: string
    let modeId: string

    if (existingCollections[collectionName]) {
      collectionId = existingCollections[collectionName].id
      modeId = existingCollections[collectionName].defaultModeId
      console.log(`  既存コレクションを使用: ${collectionId}`)
    } else {
      const createPayload = {
        variableCollections: [
          {
            action: 'CREATE' as const,
            name: collectionName,
            id: `temp_${collectionName}`,
          },
        ],
        variables: [] as FigmaVariableCreate[],
        variableModeValues: [] as FigmaVariableModeValue[],
      }

      const createResult = (await figmaFetch(
        `/files/${FILE_KEY}/variables`,
        'POST',
        createPayload
      )) as {
        meta: {
          variableCollections: { id: string; defaultModeId: string }[]
        }
      }

      const created = createResult.meta.variableCollections[0]
      collectionId = created.id
      modeId = created.defaultModeId
      console.log(`  コレクション作成: ${collectionId}`)
    }

    const variables: (FigmaVariableCreate | FigmaVariableUpdate)[] = []
    const modeValues: FigmaVariableModeValue[] = []
    let newCount = 0
    let updateCount = 0

    for (const entry of entries) {
      const existing = existingVariables[entry.name]

      if (existing && existing.collectionId === collectionId) {
        variables.push({
          action: 'UPDATE',
          id: existing.id,
          description: entry.description,
        })
        modeValues.push({
          variableId: existing.id,
          modeId,
          value: entry.value,
        })
        updateCount++
      } else {
        const tempId = `temp_${entry.name.replace(/\//g, '_')}`
        variables.push({
          action: 'CREATE',
          id: tempId,
          name: entry.name,
          variableCollectionId: collectionId,
          resolvedType: entry.resolvedType,
          description: entry.description,
        })
        modeValues.push({
          variableId: tempId,
          modeId,
          value: entry.value,
        })
        newCount++
      }
    }

    if (variables.length > 0) {
      await figmaFetch(`/files/${FILE_KEY}/variables`, 'POST', {
        variables,
        variableModeValues: modeValues,
      })
      console.log(`  作成: ${newCount}, 更新: ${updateCount}`)
    }
  }

  console.log('\nFigma Variables の同期が完了しました')
}

main().catch((err) => {
  console.error('エラー:', err.message)
  process.exit(1)
})
