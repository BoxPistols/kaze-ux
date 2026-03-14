// System Design - Figma Plugin
// Design tokens JSON を読み込み、Figma Variables / Variable Collections として登録する

figma.showUI(__html__, { width: 420, height: 560 })

// ---------------------------------------------------------------------------
// 型定義
// ---------------------------------------------------------------------------

interface TokenNode {
  $value?: unknown
  $type?: string
  $description?: string
  [key: string]: unknown
}

interface VariableEntry {
  name: string
  resolvedType: VariableResolvedDataType
  value: VariableValue
  description?: string
}

interface PluginMessage {
  type:
    | 'import-tokens'
    | 'register-styles'
    | 'list-collections'
    | 'clear-all'
    | 'clear-collection'
    | 'remove-duplicates'
    | 'generate-component'
  tokens?: Record<string, unknown>
  scope?: string
  collectionName?: string
  componentName?: string
}

// ---------------------------------------------------------------------------
// カラー変換
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): RGB | null {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return null
  const clean = hex.replace('#', '')
  if (clean.length < 6) return null
  return {
    r: parseInt(clean.slice(0, 2), 16) / 255,
    g: parseInt(clean.slice(2, 4), 16) / 255,
    b: parseInt(clean.slice(4, 6), 16) / 255,
  }
}

// ---------------------------------------------------------------------------
// トークン → Variable エントリー変換
// ---------------------------------------------------------------------------

function tokenToEntry(node: TokenNode, name: string): VariableEntry | null {
  const type = node.$type as string
  const value = node.$value
  const description = node.$description as string | undefined

  switch (type) {
    case 'color': {
      const rgb = hexToRgb(String(value))
      if (!rgb) return null
      return { name, resolvedType: 'COLOR', value: rgb, description }
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
      const num = parseFloat(String(value).replace('px', ''))
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

function flattenTokens(node: TokenNode, prefix: string): VariableEntry[] {
  const entries: VariableEntry[] = []

  // リーフノード
  if ('$value' in node && node.$type) {
    const entry = tokenToEntry(node, prefix)
    if (entry) entries.push(entry)
    return entries
  }

  // 再帰
  for (const [key, child] of Object.entries(node)) {
    if (key.startsWith('$')) continue
    if (typeof child === 'object' && child !== null) {
      entries.push(...flattenTokens(child as TokenNode, `${prefix}/${key}`))
    }
  }

  return entries
}

// ---------------------------------------------------------------------------
// Figma Variables 作成・更新
// ---------------------------------------------------------------------------

function getOrCreateCollection(name: string): VariableCollection {
  const collections = figma.variables.getLocalVariableCollections()
  const existing = collections.find((c) => c.name === name)
  if (existing) return existing
  return figma.variables.createVariableCollection(name)
}

function getExistingVariable(
  collection: VariableCollection,
  name: string
): Variable | null {
  for (const id of collection.variableIds) {
    const v = figma.variables.getVariableById(id)
    if (v && v.name === name) return v
  }
  return null
}

/**
 * 単一モードのコレクションにエントリーをインポート
 */
function importEntries(
  collectionName: string,
  entries: VariableEntry[]
): { created: number; updated: number; skipped: number } {
  if (entries.length === 0) return { created: 0, updated: 0, skipped: 0 }

  const collection = getOrCreateCollection(collectionName)
  const modeId = collection.modes[0].modeId
  let created = 0
  let updated = 0
  let skipped = 0

  for (const entry of entries) {
    try {
      const existing = getExistingVariable(collection, entry.name)
      if (existing) {
        if (existing.resolvedType === entry.resolvedType) {
          existing.setValueForMode(modeId, entry.value)
          if (entry.description) existing.description = entry.description
          updated++
        } else {
          skipped++
        }
      } else {
        const variable = figma.variables.createVariable(
          entry.name,
          collection,
          entry.resolvedType
        )
        variable.setValueForMode(modeId, entry.value)
        if (entry.description) variable.description = entry.description
        created++
      }
    } catch {
      skipped++
    }
  }

  return { created, updated, skipped }
}

/**
 * Color コレクション: Light/Dark をモードとして1つのコレクションに統合
 * 変数名は primary/main 等（light/dark プレフィックスなし）
 */
function importColorWithModes(tokens: Record<string, unknown>): {
  created: number
  updated: number
  skipped: number
} {
  const colorNode = tokens.color as Record<string, unknown> | undefined
  if (!colorNode) return { created: 0, updated: 0, skipped: 0 }

  const lightNode = colorNode.light as TokenNode | undefined
  const darkNode = colorNode.dark as TokenNode | undefined
  if (!lightNode && !darkNode) return { created: 0, updated: 0, skipped: 0 }

  // コレクション取得/作成
  const collection = getOrCreateCollection('Color')

  // モード設定: デフォルトモードを Light にリネーム、Dark モードを追加
  let lightModeId = collection.modes[0].modeId
  let darkModeId: string | null = null

  if (collection.modes.length === 1) {
    // 新規コレクション: デフォルトモードを Light にリネーム
    collection.renameMode(lightModeId, 'Light')
    darkModeId = collection.addMode('Dark')
  } else {
    // 既存コレクション: モード名で探す
    for (const mode of collection.modes) {
      if (mode.name === 'Light') lightModeId = mode.modeId
      if (mode.name === 'Dark') darkModeId = mode.modeId
    }
    if (!darkModeId) {
      darkModeId = collection.addMode('Dark')
    }
  }

  // Light/Dark それぞれのエントリーを取得（プレフィックスなし）
  const lightEntries = lightNode ? flattenTokens(lightNode, '') : []
  const darkEntries = darkNode ? flattenTokens(darkNode, '') : []

  // 全変数名を収集
  const allNames = new Set<string>()
  const lightMap = new Map<string, VariableEntry>()
  const darkMap = new Map<string, VariableEntry>()

  for (const e of lightEntries) {
    // 先頭の "/" を除去（flattenTokens が空プレフィックスで "/" 始まりになるため）
    const name = e.name.startsWith('/') ? e.name.slice(1) : e.name
    e.name = name
    allNames.add(name)
    lightMap.set(name, e)
  }
  for (const e of darkEntries) {
    const name = e.name.startsWith('/') ? e.name.slice(1) : e.name
    e.name = name
    allNames.add(name)
    darkMap.set(name, e)
  }

  let created = 0
  let updated = 0
  let skipped = 0

  for (const name of allNames) {
    const lightEntry = lightMap.get(name)
    const darkEntry = darkMap.get(name)
    const resolvedType = (lightEntry ?? darkEntry)?.resolvedType
    if (!resolvedType) {
      skipped++
      continue
    }

    try {
      let variable = getExistingVariable(collection, name)

      if (variable) {
        if (variable.resolvedType === resolvedType) {
          if (lightEntry)
            variable.setValueForMode(lightModeId, lightEntry.value)
          if (darkEntry && darkModeId)
            variable.setValueForMode(darkModeId, darkEntry.value)
          const desc = lightEntry?.description ?? darkEntry?.description
          if (desc) variable.description = desc
          updated++
        } else {
          skipped++
        }
      } else {
        variable = figma.variables.createVariable(
          name,
          collection,
          resolvedType
        )
        if (lightEntry) variable.setValueForMode(lightModeId, lightEntry.value)
        if (darkEntry && darkModeId)
          variable.setValueForMode(darkModeId, darkEntry.value)
        const desc = lightEntry?.description ?? darkEntry?.description
        if (desc) variable.description = desc
        created++
      }
    } catch {
      skipped++
    }
  }

  return { created, updated, skipped }
}

// ---------------------------------------------------------------------------
// スコープに基づくトークン抽出
// ---------------------------------------------------------------------------

interface CollectionDef {
  name: string
  path: string[]
}

function getSingleModeDefs(scope: string): CollectionDef[] {
  const all: CollectionDef[] = [
    { name: 'Typography', path: ['typography'] },
    { name: 'Spacing', path: ['spacing'] },
    { name: 'Border Radius', path: ['borderRadius'] },
    { name: 'Shadow', path: ['shadow'] },
    { name: 'Breakpoint', path: ['breakpoint'] },
    { name: 'Component', path: ['component'] },
  ]

  switch (scope) {
    case 'typography':
      return all.filter((d) => d.name === 'Typography')
    case 'spacing':
      return all.filter((d) => d.name === 'Spacing')
    case 'component':
      return all.filter((d) => d.name === 'Component')
    case 'button':
      return [{ name: 'Component/Button', path: ['component', 'button'] }]
    case 'color':
      return [] // Color はモード付きで別処理
    default:
      return all
  }
}

function resolveTokenPath(
  tokens: Record<string, unknown>,
  path: string[]
): TokenNode | null {
  let node: unknown = tokens
  for (const key of path) {
    if (typeof node !== 'object' || node === null) return null
    node = (node as Record<string, unknown>)[key]
  }
  return (node as TokenNode) || null
}

// ---------------------------------------------------------------------------
// Figma Styles 登録
// ---------------------------------------------------------------------------

/** 既存スタイルを名前で検索 */
function findTextStyle(name: string): TextStyle | null {
  return figma.getLocalTextStyles().find((s) => s.name === name) ?? null
}

function findPaintStyle(name: string): PaintStyle | null {
  return figma.getLocalPaintStyles().find((s) => s.name === name) ?? null
}

function findEffectStyle(name: string): EffectStyle | null {
  return figma.getLocalEffectStyles().find((s) => s.name === name) ?? null
}

/** フォントウェイト → Figma font style 名 */
const WEIGHT_TO_STYLE: Record<number, string> = {
  300: 'Light',
  400: 'Regular',
  500: 'Medium',
  700: 'Bold',
}

/** テキストスタイルの定義 */
const TEXT_STYLE_DEFS = [
  { name: 'Display/Large', size: 32, weight: 700, lh: 1.4 },
  { name: 'Display/Medium', size: 28, weight: 700, lh: 1.4 },
  { name: 'Display/Small', size: 24, weight: 500, lh: 1.4 },
  { name: 'Heading/XXL', size: 22, weight: 500, lh: 1.4 },
  { name: 'Heading/XL', size: 20, weight: 500, lh: 1.4 },
  { name: 'Heading/LG', size: 18, weight: 500, lh: 1.6 },
  { name: 'Body/ML', size: 16, weight: 400, lh: 1.6 },
  { name: 'Body/MD', size: 14, weight: 400, lh: 1.6 },
  { name: 'Body/SM', size: 12, weight: 400, lh: 1.6 },
  { name: 'Caption/XS', size: 10, weight: 400, lh: 1.4 },
] as const

/** テキストスタイルを登録 */
async function registerTextStyles(): Promise<number> {
  let count = 0

  for (const def of TEXT_STYLE_DEFS) {
    const fontStyle = WEIGHT_TO_STYLE[def.weight] ?? 'Regular'

    try {
      await figma.loadFontAsync({ family: 'Inter', style: fontStyle })
    } catch {
      continue
    }

    const existing = findTextStyle(def.name)
    const style = existing ?? figma.createTextStyle()
    style.name = def.name
    style.fontName = { family: 'Inter', style: fontStyle }
    style.fontSize = def.size
    style.lineHeight = {
      value: Math.round(def.size * def.lh * 10) / 10,
      unit: 'PIXELS',
    }
    style.letterSpacing = { value: 0, unit: 'PIXELS' }
    count++
  }

  return count
}

/** カラースタイルを登録（Light テーマ、Variable バインド付き） */
function registerColorStyles(tokens: Record<string, unknown>): number {
  const colorNode = tokens.color as Record<string, unknown> | undefined
  if (!colorNode) return 0

  const lightNode = colorNode.light as TokenNode | undefined
  if (!lightNode) return 0

  let count = 0

  function walkColors(node: TokenNode, path: string): void {
    if ('$value' in node && node.$type === 'color') {
      const rgb = hexToRgb(String(node.$value))
      if (!rgb) return

      const styleName = `Color/${path}`
      const existing = findPaintStyle(styleName)
      const style = existing ?? figma.createPaintStyle()
      style.name = styleName

      // Variable バインド試行
      const varName = path.toLowerCase().replace(/\//g, '/')
      const colorVar = figma.variables
        .getLocalVariables('COLOR')
        .find((v) => v.name === varName)

      if (colorVar) {
        const paint = figma.variables.setBoundVariableForPaint(
          { type: 'SOLID', color: rgb },
          'color',
          colorVar
        )
        style.paints = [paint]
      } else {
        style.paints = [{ type: 'SOLID', color: rgb }]
      }

      count++
      return
    }

    for (const [key, child] of Object.entries(node)) {
      if (key.startsWith('$')) continue
      if (typeof child === 'object' && child !== null) {
        const childPath = path ? `${path}/${key}` : key
        walkColors(child as TokenNode, childPath)
      }
    }
  }

  walkColors(lightNode, '')
  return count
}

/** CSS box-shadow をパースして Figma Effect に変換 */
function parseShadow(shadow: string): DropShadowEffect[] {
  const effects: DropShadowEffect[] = []
  // カンマ区切り (rgba() 内のカンマを避けて分割)
  const parts = shadow.split(/,(?![^(]*\))/)

  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed === 'none') continue

    // 数値部分を抽出: offsetX offsetY blur spread
    const nums = trimmed.match(/-?\d+(?:\.\d+)?px/g)
    if (!nums || nums.length < 3) continue

    const offsetX = parseFloat(nums[0])
    const offsetY = parseFloat(nums[1])
    const blur = parseFloat(nums[2])
    const spread = nums.length >= 4 ? parseFloat(nums[3]) : 0

    // rgba() を抽出
    const rgbaMatch = trimmed.match(
      /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)/
    )
    let r = 0
    let g = 0
    let b = 0
    let a = 1
    if (rgbaMatch) {
      r = parseFloat(rgbaMatch[1]) / 255
      g = parseFloat(rgbaMatch[2]) / 255
      b = parseFloat(rgbaMatch[3]) / 255
      a = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1
    }

    effects.push({
      type: 'DROP_SHADOW',
      color: { r, g, b, a },
      offset: { x: offsetX, y: offsetY },
      radius: blur,
      spread,
      visible: true,
      blendMode: 'NORMAL',
    })
  }

  return effects
}

/** エフェクトスタイルを登録 */
function registerEffectStyles(tokens: Record<string, unknown>): number {
  const shadowNode = tokens.shadow as TokenNode | undefined
  if (!shadowNode) return 0

  let count = 0

  for (const [key, child] of Object.entries(shadowNode)) {
    if (key.startsWith('$')) continue
    const node = child as TokenNode
    if (node.$type !== 'shadow' || !node.$value) continue
    if (String(node.$value) === 'none') continue

    const effects = parseShadow(String(node.$value))
    if (effects.length === 0) continue

    const styleName = `Shadow/${key}`
    const existing = findEffectStyle(styleName)
    const style = existing ?? figma.createEffectStyle()
    style.name = styleName
    style.effects = effects
    count++
  }

  return count
}

/** 全スタイルをまとめて登録 */
async function registerAllStyles(
  tokens: Record<string, unknown>
): Promise<void> {
  figma.ui.postMessage({
    type: 'import-progress',
    message: 'Registering text styles...',
  })
  const textCount = await registerTextStyles()

  figma.ui.postMessage({
    type: 'import-progress',
    message: 'Registering color styles...',
  })
  const colorCount = registerColorStyles(tokens)

  figma.ui.postMessage({
    type: 'import-progress',
    message: 'Registering effect styles...',
  })
  const effectCount = registerEffectStyles(tokens)

  figma.ui.postMessage({
    type: 'operation-result',
    success: true,
    message: `Styles registered: Text ${textCount} / Color ${colorCount} / Effect ${effectCount}`,
  })
}

// ---------------------------------------------------------------------------
// コンポーネント生成
// ---------------------------------------------------------------------------

const MUI_COLORS: Record<string, { main: RGB; contrastText: RGB }> = {
  primary: {
    main: { r: 0.149, g: 0.259, b: 0.745 },
    contrastText: { r: 1, g: 1, b: 1 },
  },
  secondary: {
    main: { r: 0.412, g: 0.408, b: 0.506 },
    contrastText: { r: 1, g: 1, b: 1 },
  },
  success: {
    main: { r: 0.275, g: 0.671, b: 0.29 },
    contrastText: { r: 1, g: 1, b: 1 },
  },
  info: {
    main: { r: 0.114, g: 0.686, b: 0.761 },
    contrastText: { r: 1, g: 1, b: 1 },
  },
  warning: {
    main: { r: 0.922, g: 0.506, b: 0.09 },
    contrastText: { r: 1, g: 1, b: 1 },
  },
  error: {
    main: { r: 0.855, g: 0.216, b: 0.216 },
    contrastText: { r: 1, g: 1, b: 1 },
  },
}

const BUTTON_SIZES = {
  small: { paddingH: 10, paddingV: 4, fontSize: 13, lineHeight: 22 },
  medium: { paddingH: 16, paddingV: 6, fontSize: 14, lineHeight: 24 },
  large: { paddingH: 22, paddingV: 8, fontSize: 15, lineHeight: 26 },
} as const

const ELEVATION_2: Effect[] = [
  {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.2 },
    offset: { x: 0, y: 3 },
    radius: 1,
    spread: -2,
    visible: true,
    blendMode: 'NORMAL',
  },
  {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.14 },
    offset: { x: 0, y: 2 },
    radius: 2,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  },
  {
    type: 'DROP_SHADOW',
    color: { r: 0, g: 0, b: 0, a: 0.12 },
    offset: { x: 0, y: 1 },
    radius: 5,
    spread: 0,
    visible: true,
    blendMode: 'NORMAL',
  },
]

/**
 * Color Variable を検索し、バインド済み Paint を返す
 * Variable が見つからなければ通常の SolidPaint
 */
function makePaint(
  color: RGB,
  variableName: string,
  opacity?: number
): SolidPaint {
  const base: SolidPaint = {
    type: 'SOLID',
    color,
    ...(opacity !== undefined ? { opacity } : {}),
  }

  const colorVar = figma.variables
    .getLocalVariables('COLOR')
    .find((v) => v.name === variableName)

  if (colorVar) {
    return figma.variables.setBoundVariableForPaint(base, 'color', colorVar)
  }

  return base
}

/**
 * Button ComponentSet を生成
 */
async function generateButton(): Promise<void> {
  figma.ui.postMessage({
    type: 'import-progress',
    message: 'Loading fonts...',
  })

  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })

  const variantTypes = ['contained', 'outlined', 'text'] as const
  const colorNames = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'error',
  ] as const
  const sizeNames = ['small', 'medium', 'large'] as const

  const components: ComponentNode[] = []

  for (const variant of variantTypes) {
    for (const colorName of colorNames) {
      for (const size of sizeNames) {
        figma.ui.postMessage({
          type: 'import-progress',
          message: `Generating: ${variant}/${colorName}/${size}`,
        })

        const comp = figma.createComponent()
        comp.name = `variant=${variant}, color=${colorName}, size=${size}`

        // Auto Layout
        comp.layoutMode = 'HORIZONTAL'
        comp.primaryAxisAlignItems = 'CENTER'
        comp.counterAxisAlignItems = 'CENTER'

        const sc = BUTTON_SIZES[size]
        comp.paddingLeft = sc.paddingH
        comp.paddingRight = sc.paddingH
        comp.paddingTop = sc.paddingV
        comp.paddingBottom = sc.paddingV
        comp.cornerRadius = 6
        comp.primaryAxisSizingMode = 'AUTO'
        comp.counterAxisSizingMode = 'AUTO'
        comp.itemSpacing = 8

        const mainColor = MUI_COLORS[colorName].main
        const varName = `${colorName}/main`

        // Fill / Stroke
        if (variant === 'contained') {
          comp.fills = [makePaint(mainColor, varName)]
          comp.strokes = []
          comp.effects = ELEVATION_2
        } else if (variant === 'outlined') {
          comp.fills = []
          comp.strokes = [makePaint(mainColor, varName, 0.5)]
          comp.strokeWeight = 1
          comp.effects = []
        } else {
          comp.fills = []
          comp.strokes = []
          comp.effects = []
        }

        // Text
        const text = figma.createText()
        text.fontName = { family: 'Inter', style: 'Medium' }
        text.characters = 'Button'
        text.fontSize = sc.fontSize
        text.lineHeight = { value: sc.lineHeight, unit: 'PIXELS' }
        text.letterSpacing = { value: 0.4, unit: 'PIXELS' }
        text.textCase = 'UPPER'

        if (variant === 'contained') {
          text.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
        } else {
          text.fills = [makePaint(mainColor, varName)]
        }

        comp.appendChild(text)
        components.push(comp)
      }
    }
  }

  // ComponentSet に統合
  const componentSet = figma.combineAsVariants(components, figma.currentPage)
  componentSet.name = 'Button'

  // ComponentSet のレイアウト
  componentSet.layoutMode = 'HORIZONTAL'
  componentSet.layoutWrap = 'WRAP'
  componentSet.itemSpacing = 16
  componentSet.counterAxisSpacing = 16
  componentSet.paddingLeft = 24
  componentSet.paddingRight = 24
  componentSet.paddingTop = 24
  componentSet.paddingBottom = 24
  componentSet.primaryAxisSizingMode = 'AUTO'
  componentSet.counterAxisSizingMode = 'AUTO'
  componentSet.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
  componentSet.cornerRadius = 8
  componentSet.strokes = [
    {
      type: 'SOLID',
      color: { r: 0.878, g: 0.878, b: 0.878 },
    },
  ]
  componentSet.strokeWeight = 1

  figma.viewport.scrollAndZoomIntoView([componentSet])

  figma.ui.postMessage({
    type: 'operation-result',
    success: true,
    message: `Button ComponentSet generated: ${components.length} variants (${variantTypes.length} variant x ${colorNames.length} color x ${sizeNames.length} size)`,
  })
  listCollections()
}

// ---------------------------------------------------------------------------
// CRUD操作
// ---------------------------------------------------------------------------

/**
 * コレクション一覧を返す
 */
function listCollections(): void {
  const collections = figma.variables.getLocalVariableCollections()
  const list = collections.map((c) => ({
    name: c.name,
    variableCount: c.variableIds.length,
    modes: c.modes.map((m) => m.name),
  }))
  figma.ui.postMessage({ type: 'collections-list', collections: list })
}

/**
 * 全コレクション・変数を削除
 */
function clearAll(): void {
  const collections = figma.variables.getLocalVariableCollections()
  let varCount = 0

  for (const col of collections) {
    for (const id of col.variableIds) {
      const v = figma.variables.getVariableById(id)
      if (v) {
        v.remove()
        varCount++
      }
    }
    col.remove()
  }

  figma.ui.postMessage({
    type: 'operation-result',
    success: true,
    message: `Deleted all: ${collections.length} collections / ${varCount} variables`,
  })
  listCollections()
}

/**
 * 指定コレクションを削除
 */
function clearCollection(name: string): void {
  const collections = figma.variables.getLocalVariableCollections()
  const target = collections.find((c) => c.name === name)

  if (!target) {
    figma.ui.postMessage({
      type: 'operation-result',
      success: false,
      message: `Collection "${name}" not found`,
    })
    return
  }

  let varCount = 0
  for (const id of target.variableIds) {
    const v = figma.variables.getVariableById(id)
    if (v) {
      v.remove()
      varCount++
    }
  }
  target.remove()

  figma.ui.postMessage({
    type: 'operation-result',
    success: true,
    message: `Deleted "${name}": ${varCount} variables`,
  })
  listCollections()
}

/**
 * 重複変数を削除（同一コレクション内で同名の変数を1つだけ残す）
 */
function removeDuplicates(): void {
  const collections = figma.variables.getLocalVariableCollections()
  let totalRemoved = 0

  for (const col of collections) {
    const seen = new Map<string, string>() // name → first variable id
    for (const id of col.variableIds) {
      const v = figma.variables.getVariableById(id)
      if (!v) continue

      if (seen.has(v.name)) {
        v.remove()
        totalRemoved++
      } else {
        seen.set(v.name, id)
      }
    }
  }

  figma.ui.postMessage({
    type: 'operation-result',
    success: true,
    message:
      totalRemoved > 0
        ? `Removed ${totalRemoved} duplicate variables`
        : 'No duplicates found',
  })
  listCollections()
}

// ---------------------------------------------------------------------------
// メッセージハンドラ
// ---------------------------------------------------------------------------

figma.ui.onmessage = async (msg: PluginMessage) => {
  switch (msg.type) {
    case 'list-collections':
      listCollections()
      return

    case 'clear-all':
      clearAll()
      return

    case 'clear-collection':
      if (msg.collectionName) clearCollection(msg.collectionName)
      return

    case 'remove-duplicates':
      removeDuplicates()
      return

    case 'register-styles':
      if (msg.tokens) registerAllStyles(msg.tokens)
      return

    case 'generate-component':
      if (msg.componentName === 'button') {
        generateButton()
      }
      return

    case 'import-tokens':
      break

    default:
      return
  }

  // --- import-tokens 処理 ---
  const tokens = msg.tokens
  const scope = msg.scope ?? 'all'
  if (!tokens) return

  let totalCreated = 0
  let totalUpdated = 0
  let totalSkipped = 0
  let totalCollections = 0

  // Color: Light/Dark モード付き1コレクション
  if (scope === 'all' || scope === 'color') {
    figma.ui.postMessage({
      type: 'import-progress',
      message: 'Processing: Color (Light/Dark modes)...',
    })

    const colorResult = importColorWithModes(tokens)
    totalCreated += colorResult.created
    totalUpdated += colorResult.updated
    totalSkipped += colorResult.skipped
    if (colorResult.created + colorResult.updated > 0) totalCollections++
  }

  // その他の単一モードコレクション
  const defs = getSingleModeDefs(scope)

  for (const def of defs) {
    figma.ui.postMessage({
      type: 'import-progress',
      message: `Processing: ${def.name}...`,
    })

    const node = resolveTokenPath(tokens, def.path)
    if (!node) {
      figma.ui.postMessage({
        type: 'import-progress',
        message: `Skipped: ${def.name} (no data)`,
      })
      continue
    }

    const prefix = def.path[def.path.length - 1]
    const entries = flattenTokens(node, prefix)

    if (entries.length === 0) continue

    const result = importEntries(def.name, entries)
    totalCreated += result.created
    totalUpdated += result.updated
    totalSkipped += result.skipped
    totalCollections++
  }

  figma.ui.postMessage({
    type: 'import-result',
    success: true,
    message: 'Import complete',
    stats: `${totalCollections} collections | Created: ${totalCreated} | Updated: ${totalUpdated} | Skipped: ${totalSkipped}`,
  })
  listCollections()
}
