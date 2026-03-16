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
    | 'generate-all'
    | 'set-storybook-url'
    | 'link-storybook'
    | 'clear-storybook-links'
    | 'clear-component-sets'
  tokens?: Record<string, unknown>
  scope?: string
  collectionName?: string
  componentName?: string
  storybookUrl?: string
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

/**
 * コレクション内の変数名 → Variable の Map を構築（O(1) 検索用）
 */
function buildVariableMap(
  collection: VariableCollection
): Map<string, Variable> {
  const map = new Map<string, Variable>()
  for (const id of collection.variableIds) {
    const v = figma.variables.getVariableById(id)
    if (v) map.set(v.name, v)
  }
  return map
}

function getExistingVariable(
  collection: VariableCollection,
  name: string,
  cache?: Map<string, Variable>
): Variable | null {
  if (cache) return cache.get(name) ?? null
  const map = buildVariableMap(collection)
  return map.get(name) ?? null
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
  const varMap = buildVariableMap(collection)
  let created = 0
  let updated = 0
  let skipped = 0

  for (const entry of entries) {
    try {
      const existing = getExistingVariable(collection, entry.name, varMap)
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
    } catch (e) {
      console.warn(`[importEntries] skipped: ${entry.name}`, e)
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

  const varMap = buildVariableMap(collection)
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
      let variable = getExistingVariable(collection, name, varMap)

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
    } catch (e) {
      console.warn(`[importColorWithModes] skipped: ${name}`, e)
      skipped++
    }
  }

  invalidateColorVarCache()
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
    } catch (e) {
      console.warn(
        `[registerTextStyles] font load failed: Inter ${fontStyle}`,
        e
      )
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

  // COLOR 変数の Map をループ外で一度構築
  const colorVarMap = new Map<string, Variable>()
  for (const v of figma.variables.getLocalVariables('COLOR')) {
    colorVarMap.set(v.name, v)
  }

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
      const varName = path
      const colorVar = colorVarMap.get(varName)

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

// COLOR変数キャッシュ（変数操作後にリセット）
let colorVarCache: Map<string, Variable> | null = null

function invalidateColorVarCache(): void {
  colorVarCache = null
}

function getColorVarCache(): Map<string, Variable> {
  if (!colorVarCache) {
    colorVarCache = new Map()
    for (const v of figma.variables.getLocalVariables('COLOR')) {
      colorVarCache.set(v.name, v)
    }
  }
  return colorVarCache
}

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

  const colorVar = getColorVarCache().get(variableName)

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
// 汎用コンポーネント自動生成
// ---------------------------------------------------------------------------

interface ComponentControl {
  name: string
  variants: Record<string, string[]>
  booleans: string[]
  strings: string[]
  numbers: string[]
  storybookId: string | null
}

/** トークンからコンポーネントのコントロール定義をパース */
const parseComponentControls = (
  tokens: Record<string, unknown>
): ComponentControl[] => {
  const compNode = tokens.component as Record<string, unknown> | undefined
  if (!compNode) return []

  const controls: ComponentControl[] = []

  for (const [name, props] of Object.entries(compNode)) {
    if (typeof props !== 'object' || props === null) continue

    const control: ComponentControl = {
      name,
      variants: {},
      booleans: [],
      strings: [],
      numbers: [],
      storybookId: null,
    }

    for (const [propName, propVal] of Object.entries(
      props as Record<string, unknown>
    )) {
      if (propName.startsWith('$') && propName !== '$storybookId') continue
      if (typeof propVal !== 'object' || propVal === null) continue

      const pv = propVal as Record<string, unknown>

      if ('$value' in pv) {
        const t = pv.$type as string
        if (propName === '$storybookId') {
          control.storybookId = String(pv.$value)
          continue
        }
        if (t === 'boolean') control.booleans.push(propName)
        else if (t === 'string') control.strings.push(propName)
        else if (t === 'number') control.numbers.push(propName)
      } else {
        const options = Object.keys(pv).filter((k) => !k.startsWith('$'))
        if (options.length > 0) {
          control.variants[propName] = options
        }
      }
    }

    if (
      Object.keys(control.variants).length > 0 ||
      control.booleans.length > 0
    ) {
      controls.push(control)
    }
  }

  return controls
}

/** バリアント優先度 */
const VARIANT_PRIORITY: Record<string, number> = {
  variant: 0,
  color: 1,
  size: 2,
  severity: 1,
  orientation: 3,
  status: 1,
}

/** カラー名 → RGB フォールバック（tokens の Color Variable があればそちらが優先） */
const COLOR_MAP: Record<string, RGB> = {
  primary: { r: 0.098, g: 0.463, b: 0.824 },
  secondary: { r: 0.412, g: 0.408, b: 0.506 },
  success: { r: 0.275, g: 0.671, b: 0.29 },
  info: { r: 0.114, g: 0.686, b: 0.761 },
  warning: { r: 0.922, g: 0.506, b: 0.09 },
  error: { r: 0.855, g: 0.216, b: 0.216 },
  default: { r: 0.62, g: 0.62, b: 0.62 },
  inherit: { r: 0.45, g: 0.45, b: 0.45 },
  standard: { r: 0.5, g: 0.5, b: 0.5 },
}

const SIZE_MAP: Record<string, { h: number; fontSize: number; px: number }> = {
  small: { h: 28, fontSize: 12, px: 8 },
  medium: { h: 36, fontSize: 14, px: 14 },
  large: { h: 44, fontSize: 15, px: 20 },
}

const MAX_VARIANTS = 120

let STORYBOOK_BASE_URL = ''

const toPascalCase = (str: string): string =>
  str.replace(/(^|[^a-zA-Z0-9])([a-zA-Z])/g, (_, _p, c) => c.toUpperCase())

/**
 * 汎用 ComponentSet 生成
 */
const generateGenericComponentSet = async (
  control: ComponentControl
): Promise<{ name: string; count: number }> => {
  await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
  await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })

  const displayName = toPascalCase(control.name)

  const sortedVariants = Object.entries(control.variants).sort(
    ([a], [b]) => (VARIANT_PRIORITY[a] ?? 10) - (VARIANT_PRIORITY[b] ?? 10)
  )

  const selectedAxes: [string, string[]][] = []
  let totalCombos = 1

  for (const [axis, options] of sortedVariants) {
    const newTotal = totalCombos * options.length
    if (newTotal > MAX_VARIANTS && selectedAxes.length >= 2) break
    selectedAxes.push([axis, options])
    totalCombos = newTotal
  }

  type Combo = Record<string, string>
  let combos: Combo[] = [{}]

  for (const [axis, options] of selectedAxes) {
    const next: Combo[] = []
    for (const combo of combos) {
      for (const opt of options) {
        next.push({ ...combo, [axis]: opt })
      }
    }
    combos = next
  }

  if (combos.length === 0) combos = [{}]

  const components: ComponentNode[] = []

  for (const combo of combos) {
    const comp = figma.createComponent()
    const nameParts = selectedAxes.map(([axis]) => `${axis}=${combo[axis]}`)
    comp.name = nameParts.join(', ') || 'default'

    comp.layoutMode = 'HORIZONTAL'
    comp.primaryAxisAlignItems = 'CENTER'
    comp.counterAxisAlignItems = 'CENTER'
    comp.primaryAxisSizingMode = 'AUTO'
    comp.counterAxisSizingMode = 'AUTO'
    comp.itemSpacing = 6

    const sizeVal = combo['size'] ?? 'medium'
    const sizeSpec = SIZE_MAP[sizeVal] ?? SIZE_MAP['medium']
    comp.paddingLeft = sizeSpec.px
    comp.paddingRight = sizeSpec.px
    comp.paddingTop = 6
    comp.paddingBottom = 6
    comp.cornerRadius = 6
    comp.minHeight = sizeSpec.h

    const colorVal = combo['color'] ?? combo['severity'] ?? combo['status']
    const baseRGB = colorVal
      ? (COLOR_MAP[colorVal] ?? COLOR_MAP['primary'])
      : COLOR_MAP['primary']
    const variantVal = combo['variant'] ?? 'contained'
    const varName = colorVal ? `${colorVal}/main` : 'primary/main'

    if (variantVal === 'contained' || variantVal === 'filled') {
      comp.fills = [makePaint(baseRGB, varName)]
      comp.strokes = []
    } else if (variantVal === 'outlined') {
      comp.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
      comp.strokes = [makePaint(baseRGB, varName, 0.5)]
      comp.strokeWeight = 1
    } else {
      comp.fills = []
      comp.strokes = []
    }

    const labelParts: string[] = []
    for (const [axis] of selectedAxes) {
      if (combo[axis]) labelParts.push(combo[axis])
    }
    const labelText =
      labelParts.length > 0 ? labelParts.join(' / ') : displayName

    const label = figma.createText()
    label.fontName = { family: 'Inter', style: 'Medium' }
    label.fontSize = sizeSpec.fontSize
    label.characters = labelText
    label.lineHeight = { value: sizeSpec.h - 12, unit: 'PIXELS' }

    if (variantVal === 'contained' || variantVal === 'filled') {
      label.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
    } else {
      label.fills = [makePaint(baseRGB, varName)]
    }

    comp.appendChild(label)
    components.push(comp)
  }

  const componentSet = figma.combineAsVariants(components, figma.currentPage)
  componentSet.name = displayName

  const sbUrl = control.storybookId
    ? `${STORYBOOK_BASE_URL}/?path=/docs/${control.storybookId}`
    : null
  const descLines = [`Source: src/components/ | ${control.name}`]
  if (sbUrl) descLines.push(`Storybook: ${sbUrl}`)
  componentSet.description = descLines.join('\n')

  componentSet.layoutMode = 'HORIZONTAL'
  componentSet.layoutWrap = 'WRAP'
  componentSet.itemSpacing = 10
  componentSet.counterAxisSpacing = 10
  componentSet.paddingLeft = 16
  componentSet.paddingRight = 16
  componentSet.paddingTop = 16
  componentSet.paddingBottom = 16
  componentSet.primaryAxisSizingMode = 'FIXED'
  componentSet.counterAxisSizingMode = 'AUTO'
  const variantCount = components.length
  if (variantCount <= 6) {
    componentSet.resize(300, componentSet.height)
  } else if (variantCount <= 20) {
    componentSet.resize(450, componentSet.height)
  } else {
    componentSet.resize(600, componentSet.height)
  }
  componentSet.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]
  componentSet.cornerRadius = 12
  componentSet.strokes = [
    { type: 'SOLID', color: { r: 0.878, g: 0.878, b: 0.878 } },
  ]
  componentSet.strokeWeight = 1

  for (const boolProp of control.booleans) {
    try {
      componentSet.addComponentProperty(boolProp, 'BOOLEAN', true)
    } catch {
      /* 重複時は無視 */
    }
  }

  for (const strProp of control.strings) {
    try {
      componentSet.addComponentProperty(strProp, 'TEXT', strProp)
    } catch {
      /* 重複時は無視 */
    }
  }

  return { name: displayName, count: components.length }
}

/**
 * 全コンポーネントを一括生成
 */
const generateAllComponents = async (
  tokens: Record<string, unknown>
): Promise<void> => {
  const controls = parseComponentControls(tokens)

  if (controls.length === 0) {
    figma.ui.postMessage({
      type: 'operation-result',
      success: false,
      message: 'No component tokens found',
    })
    return
  }

  figma.ui.postMessage({
    type: 'import-progress',
    message: `Generating ${controls.length} components...`,
  })

  const existingNames = new Set(controls.map((c) => toPascalCase(c.name)))
  for (const child of [...figma.currentPage.children]) {
    if (child.type === 'COMPONENT_SET' && existingNames.has(child.name)) {
      child.remove()
    }
  }

  const results: { name: string; count: number }[] = []
  const COL_WIDTH = 640
  const GRID_COLS = 3
  const GAP_X = 32
  const GAP_Y = 32
  let col = 0
  let currentY = 0
  let currentX = 0
  let rowMaxHeight = 0

  for (let i = 0; i < controls.length; i++) {
    const control = controls[i]
    figma.ui.postMessage({
      type: 'import-progress',
      message: `[${i + 1}/${controls.length}] ${toPascalCase(control.name)}...`,
    })

    const result = await generateGenericComponentSet(control)
    results.push(result)

    const nodes = figma.currentPage.children
    const lastNode = nodes[nodes.length - 1]
    if (lastNode) {
      lastNode.x = currentX
      lastNode.y = currentY

      if (lastNode.height > rowMaxHeight) rowMaxHeight = lastNode.height
      col++
      currentX = col * (COL_WIDTH + GAP_X)

      if (col >= GRID_COLS) {
        col = 0
        currentX = 0
        currentY += rowMaxHeight + GAP_Y
        rowMaxHeight = 0
      }
    }
  }

  const totalVariants = results.reduce((sum, r) => sum + r.count, 0)

  figma.ui.postMessage({
    type: 'operation-result',
    success: true,
    message: `Generated ${results.length} ComponentSets / ${totalVariants} variants`,
  })
  listCollections()
}

// ---------------------------------------------------------------------------
// Storybook リンク
// ---------------------------------------------------------------------------

const linkStorybookToFrames = async (): Promise<void> => {
  const page = figma.currentPage
  let linked = 0

  for (const node of page.children) {
    if (node.type !== 'FRAME') continue
    if (!node.name.includes('--docs')) continue

    const storyId = node.name
    const sbUrl = `${STORYBOOK_BASE_URL}/?path=/docs/${storyId}`

    const parts = storyId
      .replace('--docs', '')
      .split('-')
      .filter(
        (p: string) =>
          ![
            'components',
            'ui',
            'form',
            'layout',
            'maps',
            'patterns',
            'design',
            'tokens',
          ].includes(p)
      )
    const displayName = parts
      .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')

    for (const child of [...figma.currentPage.children]) {
      if (
        child.name === '_storybook-link' &&
        Math.abs(child.x - node.x) < 50 &&
        child.y < node.y &&
        child.y > node.y - 50
      ) {
        child.remove()
      }
    }
    for (const child of [...node.children]) {
      if (child.name === '_storybook-link') child.remove()
    }

    try {
      await figma.loadFontAsync({ family: 'Inter', style: 'Medium' })
      await figma.loadFontAsync({ family: 'Inter', style: 'Regular' })

      const text = figma.createText()
      text.name = '_storybook-link'
      text.fontName = { family: 'Inter', style: 'Medium' }
      text.characters = displayName + '  '
      text.fontSize = 12
      text.fills = [{ type: 'SOLID', color: { r: 0.1, g: 0.1, b: 0.15 } }]

      const startIdx = text.characters.length
      text.insertCharacters(startIdx, 'Open in Storybook')
      text.setRangeFontName(startIdx, startIdx + 17, {
        family: 'Inter',
        style: 'Regular',
      })
      text.setRangeFontSize(startIdx, startIdx + 17, 11)
      text.setRangeFills(startIdx, startIdx + 17, [
        { type: 'SOLID', color: { r: 1, g: 0.278, b: 0.522 } },
      ])
      text.setRangeHyperlink(startIdx, startIdx + 17, {
        type: 'URL',
        value: sbUrl,
      })
      text.setRangeTextDecoration(startIdx, startIdx + 17, 'UNDERLINE')

      figma.currentPage.appendChild(text)
      text.x = node.x
      text.y = node.y - 24
    } catch (e) {
      console.warn('[linkStorybook]', e)
    }

    linked++
  }

  figma.ui.postMessage({
    type: 'operation-result',
    success: true,
    message: `Storybook links added: ${linked} frames`,
  })
}

const clearStorybookLinks = (): void => {
  let removed = 0
  for (const child of [...figma.currentPage.children]) {
    if (child.name === '_storybook-link') {
      child.remove()
      removed++
    }
  }
  for (const node of [...figma.currentPage.children]) {
    if (node.type !== 'FRAME') continue
    for (const child of [...node.children]) {
      if (child.name === '_storybook-link') {
        child.remove()
        removed++
      }
    }
  }
  figma.ui.postMessage({
    type: 'operation-result',
    success: true,
    message:
      removed > 0
        ? `Storybook links removed: ${removed}`
        : 'No Storybook links found',
  })
}

const clearComponentSets = (): void => {
  let removed = 0
  for (const child of [...figma.currentPage.children]) {
    if (child.type === 'COMPONENT_SET') {
      child.remove()
      removed++
    }
  }
  figma.ui.postMessage({
    type: 'operation-result',
    success: true,
    message:
      removed > 0
        ? `ComponentSets removed: ${removed}`
        : 'No ComponentSets found',
  })
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
  invalidateColorVarCache()
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
  invalidateColorVarCache()
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
  invalidateColorVarCache()
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

    case 'generate-all':
      if (msg.storybookUrl) STORYBOOK_BASE_URL = msg.storybookUrl
      if (msg.tokens) {
        generateAllComponents(msg.tokens)
      }
      return

    case 'link-storybook':
      if (msg.storybookUrl) STORYBOOK_BASE_URL = msg.storybookUrl
      linkStorybookToFrames()
      return

    case 'clear-storybook-links':
      clearStorybookLinks()
      return

    case 'clear-component-sets':
      clearComponentSets()
      return

    case 'set-storybook-url':
      if (msg.storybookUrl) STORYBOOK_BASE_URL = msg.storybookUrl
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
