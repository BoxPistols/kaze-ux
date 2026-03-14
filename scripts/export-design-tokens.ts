/**
 * デザイントークン Export スクリプト
 *
 * MUI テーマ定義から W3C Design Tokens Community Group (DTCG) 形式の
 * JSON ファイルを生成する。Figma Variables REST API や
 * DTCG 対応プラグインで直接インポート可能。
 *
 * 使い方: pnpm export-tokens
 * 出力先: design-tokens/tokens.json (light + dark)
 */

import {
  writeFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
} from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// --- ソースデータの直接読み込み ---
// テーマファイルは MUI ランタイムに依存するため、値を直接定義

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = resolve(__dirname, '..', 'design-tokens')

// colorToken.ts の createThemeColors 相当
const lightColors = {
  primary: {
    main: '#0EADB8',
    dark: '#0A8A94',
    light: '#3CC0C8',
    lighter: '#b0dfe3',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#696881',
    dark: '#424242',
    light: '#757575',
    lighter: '#FAFAFA',
    contrastText: '#ffffff',
  },
  success: {
    main: '#46ab4a',
    dark: '#3f7f42',
    light: '#6db770',
    lighter: '#d4e9d4',
    contrastText: '#ffffff',
  },
  info: {
    main: '#1dafc2',
    dark: '#277781',
    light: '#43bfcf',
    lighter: '#bde8ee',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#eb8117',
    dark: '#EF6C00',
    light: '#dd9c3c',
    lighter: '#FFF3E0',
    contrastText: '#ffffff',
  },
  error: {
    main: '#da3737',
    dark: '#c63535',
    light: '#dc4e4e',
    lighter: '#FFEBEE',
    contrastText: '#ffffff',
  },
  text: { primary: '#1a1a2e', secondary: '#4a5568', disabled: '#bdbdbd' },
  background: { default: '#f8fafc', paper: '#ffffff' },
  divider: 'rgba(0, 0, 0, 0.08)',
}

const darkColors = {
  primary: {
    main: '#4DD8E0',
    dark: '#2CB8C2',
    light: '#7AE6EC',
    lighter: '#1a3a3e',
    contrastText: '#0c2628',
  },
  secondary: {
    main: '#a0a1b8',
    dark: '#6a6a6a',
    light: '#b5b5b5',
    lighter: '#454550',
    contrastText: '#ffffff',
  },
  success: {
    main: '#7cd07f',
    dark: '#4caf50',
    light: '#97dc9a',
    lighter: '#2d4a2e',
    contrastText: '#1a2e1a',
  },
  info: {
    main: '#4dd4e8',
    dark: '#1ba8b9',
    light: '#7ae3f0',
    lighter: '#1d3d42',
    contrastText: '#0d2528',
  },
  warning: {
    main: '#ffb74d',
    dark: '#ff9800',
    light: '#ffcc80',
    lighter: '#4a3520',
    contrastText: '#2d1f0d',
  },
  error: {
    main: '#f07070',
    dark: '#e53935',
    light: '#f5a0a0',
    lighter: '#4a2828',
    contrastText: '#2d1515',
  },
  text: { primary: '#f5f5f7', secondary: '#b0b5c0', disabled: '#9e9e9e' },
  background: { default: '#18181b', paper: '#27272a' },
  divider: 'rgba(255, 255, 255, 0.08)',
}

const grey = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#4e4e4e',
  800: '#3a3a3a',
  850: '#323232',
  900: '#292929',
}

// typography.ts
const baseFontSize = 14
const pxToRem = (px: number) =>
  `${Number.parseFloat((px / baseFontSize).toFixed(2))}rem`

const fontSizes = {
  displayLarge: { value: pxToRem(32), px: 32 },
  displayMedium: { value: pxToRem(28), px: 28 },
  displaySmall: { value: pxToRem(24), px: 24 },
  xxl: { value: pxToRem(22), px: 22 },
  xl: { value: pxToRem(20), px: 20 },
  lg: { value: pxToRem(18), px: 18 },
  ml: { value: pxToRem(16), px: 16 },
  md: { value: pxToRem(14), px: 14 },
  sm: { value: pxToRem(12), px: 12 },
  xs: { value: pxToRem(10), px: 10 },
}

const fontWeights = { light: 300, regular: 400, medium: 500, bold: 700 }

const fontFamily =
  'Inter, "Noto Sans JP", system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif'

// theme.ts
const spacingBase = 4 // px
const borderRadiusBase = 8 // px

const shadows = [
  'none',
  '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
]

// breakpoints.ts
const breakpoints = { mobile: 0, tablet: 768, laptop: 1366, desktop: 1920 }
const containerMaxWidth = { standard: 1280, narrow: 960, wide: 1600 }

// --- DTCG トークン構築 ---

type TokenValue = {
  $value: string | number
  $type: string
  $description?: string
}
type TokenGroup = { [key: string]: TokenValue | TokenGroup }

const colorToken = (value: string, description?: string): TokenValue => ({
  $value: value,
  $type: 'color',
  ...(description ? { $description: description } : {}),
})

const dimensionToken = (
  value: string | number,
  description?: string
): TokenValue => ({
  $value: typeof value === 'number' ? `${value}px` : value,
  $type: 'dimension',
  ...(description ? { $description: description } : {}),
})

const buildColorTokens = (colors: typeof lightColors): TokenGroup => {
  const result: TokenGroup = {}

  for (const [group, values] of Object.entries(colors)) {
    if (typeof values === 'string') {
      result[group] = colorToken(values)
    } else {
      const groupTokens: TokenGroup = {}
      for (const [key, val] of Object.entries(values)) {
        groupTokens[key] = colorToken(val as string)
      }
      result[group] = groupTokens
    }
  }

  // グレースケール
  const greyTokens: TokenGroup = {}
  for (const [shade, val] of Object.entries(grey)) {
    greyTokens[shade] = colorToken(val)
  }
  result.grey = greyTokens

  return result
}

const buildTypographyTokens = (): TokenGroup => {
  const sizes: TokenGroup = {}
  for (const [name, data] of Object.entries(fontSizes)) {
    sizes[name] = dimensionToken(`${data.px}px`, `${data.value}`)
  }

  const weights: TokenGroup = {}
  for (const [name, val] of Object.entries(fontWeights)) {
    weights[name] = { $value: val, $type: 'fontWeight' }
  }

  return {
    fontFamily: { $value: fontFamily, $type: 'fontFamily' },
    fontSize: sizes,
    fontWeight: weights,
    lineHeight: {
      large: { $value: 1.8, $type: 'number' },
      medium: { $value: 1.6, $type: 'number' },
      small: { $value: 1.4, $type: 'number' },
    },
    baseFontSize: dimensionToken(`${baseFontSize}px`, '1rem = 14px'),
  }
}

const buildSpacingTokens = (): TokenGroup => {
  const result: TokenGroup = {}
  const multipliers = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
  for (const m of multipliers) {
    const px = spacingBase * m
    result[String(m).replace('.', '_')] = dimensionToken(
      `${px}px`,
      `spacing(${m})`
    )
  }
  return result
}

const buildBorderRadiusTokens = (): TokenGroup => ({
  xs: dimensionToken('4px', 'Chip, Badge'),
  sm: dimensionToken('6px', 'Button, Menu, Tooltip'),
  md: dimensionToken(`${borderRadiusBase}px`, 'Default (IconButton, Skeleton)'),
  lg: dimensionToken('10px', 'Alert'),
  xl: dimensionToken('12px', 'Card, Paper, TableContainer'),
  '2xl': dimensionToken('16px', 'Dialog'),
  full: dimensionToken('9999px', '完全な丸'),
})

const buildShadowTokens = (): TokenGroup => {
  const result: TokenGroup = {}
  const names = ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
  for (let i = 0; i < names.length; i++) {
    result[names[i]] = { $value: shadows[i], $type: 'shadow' }
  }
  return result
}

const buildBreakpointTokens = (): TokenGroup => {
  const result: TokenGroup = {}
  for (const [name, val] of Object.entries(breakpoints)) {
    result[name] = dimensionToken(`${val}px`)
  }
  return result
}

const buildContainerTokens = (): TokenGroup => {
  const result: TokenGroup = {}
  for (const [name, val] of Object.entries(containerMaxWidth)) {
    result[name] = dimensionToken(`${val}px`)
  }
  return result
}

// --- コンポーネント Controls 抽出 ---

interface ControlDef {
  type: 'select' | 'boolean' | 'text' | 'number' | 'radio'
  options?: string[]
  description?: string
}

/**
 * 開始位置からブレースの対応を数えてブロック全体を抽出する
 */
const extractBraceBlock = (text: string, startIdx: number): string | null => {
  let depth = 0
  let started = false
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '{') {
      depth++
      started = true
    } else if (text[i] === '}') {
      depth--
      if (started && depth === 0) {
        return text.slice(startIdx, i + 1)
      }
    }
  }
  return null
}

/**
 * ストーリーファイルから argTypes を抽出する
 */
const parseArgTypesFromFile = (
  filePath: string
): Record<string, ControlDef> | null => {
  const content = readFileSync(filePath, 'utf-8')

  const argTypesIdx = content.indexOf('argTypes:')
  if (argTypesIdx === -1) return null

  const braceStart = content.indexOf('{', argTypesIdx)
  if (braceStart === -1) return null

  const block = extractBraceBlock(content, braceStart)
  if (!block) return null

  const controls: Record<string, ControlDef> = {}

  const propStartRegex = /(\w+)\s*:\s*\{/g
  let match: RegExpExecArray | null

  while ((match = propStartRegex.exec(block)) !== null) {
    const propName = match[0].startsWith('{') ? null : match[1]
    if (!propName) continue

    const propBlock = extractBraceBlock(
      block,
      match.index + match[0].length - 1
    )
    if (!propBlock) continue

    const controlMatch = propBlock.match(/control:\s*['"](\w+)['"]/)
    if (!controlMatch) continue

    const controlType = controlMatch[1] as ControlDef['type']
    const def: ControlDef = { type: controlType }

    const optionsMatch = propBlock.match(/options:\s*\[([\s\S]*?)\]/)
    if (optionsMatch) {
      def.options = optionsMatch[1]
        .split(',')
        .map((s) => s.trim().replace(/['"]/g, ''))
        .filter(Boolean)
    }

    const descMatch = propBlock.match(/description:\s*['"]([^'"]+)['"]/)
    if (descMatch) def.description = descMatch[1]

    controls[propName] = def
  }

  return Object.keys(controls).length > 0 ? controls : null
}

/**
 * ストーリーファイルからコンポーネント名を抽出
 */
const extractComponentName = (filePath: string): string => {
  const content = readFileSync(filePath, 'utf-8')
  const titleMatch = content.match(/title:\s*['"]([^'"]+)['"]/)
  if (titleMatch) {
    const parts = titleMatch[1].split('/')
    return parts[parts.length - 1]
  }
  const fileName = filePath.split('/').pop() ?? ''
  return fileName.replace('.stories.tsx', '').replace('.stories.ts', '')
}

/**
 * ディレクトリを再帰走査して *.stories.tsx を収集
 */
const findStoryFiles = (dir: string): string[] => {
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) {
      results.push(...findStoryFiles(full))
    } else if (
      entry.endsWith('.stories.tsx') ||
      entry.endsWith('.stories.ts')
    ) {
      results.push(full)
    }
  }
  return results
}

/**
 * コンポーネント Controls をトークン形式に変換
 */
const buildComponentTokens = (): TokenGroup => {
  const storiesDir = resolve(__dirname, '..', 'src', 'stories', '04-Components')
  const storyFiles = findStoryFiles(storiesDir)
  const result: TokenGroup = {}
  let totalProps = 0

  for (const file of storyFiles) {
    const controls = parseArgTypesFromFile(file)
    if (!controls) continue

    const componentName = extractComponentName(file)
    const componentKey =
      componentName.charAt(0).toLowerCase() + componentName.slice(1)
    const componentGroup: TokenGroup = {}

    for (const [propName, def] of Object.entries(controls)) {
      if (def.type === 'select' || def.type === 'radio') {
        if (def.options) {
          const optionsGroup: TokenGroup = {}
          for (const opt of def.options) {
            optionsGroup[opt] = {
              $value: opt,
              $type: 'other',
            }
          }
          componentGroup[propName] = {
            $description: `${def.options.length} options: ${def.options.join(', ')}`,
            ...optionsGroup,
          } as TokenGroup
          totalProps++
        }
      } else if (def.type === 'boolean') {
        componentGroup[propName] = {
          $value: false,
          $type: 'boolean',
          $description: def.description ?? `${componentName}.${propName}`,
        }
        totalProps++
      } else if (def.type === 'text') {
        componentGroup[propName] = {
          $value: '',
          $type: 'string',
          $description: def.description ?? `${componentName}.${propName}`,
        }
        totalProps++
      } else if (def.type === 'number') {
        componentGroup[propName] = {
          $value: 0,
          $type: 'number',
          $description: def.description ?? `${componentName}.${propName}`,
        }
        totalProps++
      }
    }

    if (Object.keys(componentGroup).length > 0) {
      result[componentKey] = componentGroup
    }
  }

  console.log(
    `  - Components: ${Object.keys(result).length} components, ${totalProps} props`
  )
  return result
}

// --- メイン出力 ---

const tokens = {
  $schema: 'https://design-tokens.github.io/community-group/format/',
  $description: 'Kaze UX Design System - Design Tokens',
  color: {
    light: buildColorTokens(lightColors),
    dark: buildColorTokens(darkColors),
  },
  typography: buildTypographyTokens(),
  spacing: buildSpacingTokens(),
  borderRadius: buildBorderRadiusTokens(),
  shadow: buildShadowTokens(),
  breakpoint: buildBreakpointTokens(),
  container: buildContainerTokens(),
  transition: {
    easing: {
      sharp: { $value: 'cubic-bezier(0.4, 0, 0.6, 1)', $type: 'cubicBezier' },
      smooth: { $value: 'cubic-bezier(0.4, 0, 0.2, 1)', $type: 'cubicBezier' },
    },
    duration: {
      leavingScreen: { $value: '150ms', $type: 'duration' },
      enteringScreen: { $value: '200ms', $type: 'duration' },
    },
  },
  component: buildComponentTokens(),
}

// 出力
mkdirSync(OUTPUT_DIR, { recursive: true })
const outputPath = resolve(OUTPUT_DIR, 'tokens.json')
writeFileSync(outputPath, JSON.stringify(tokens, null, 2), 'utf-8')

console.log(`Design tokens exported to: ${outputPath}`)
console.log(`  - Color modes: light, dark`)
console.log(
  `  - Typography: ${Object.keys(fontSizes).length} sizes, ${Object.keys(fontWeights).length} weights`
)
console.log(`  - Spacing: ${Object.keys(buildSpacingTokens()).length} values`)
console.log(
  `  - Border radius: ${Object.keys(buildBorderRadiusTokens()).length} values`
)
console.log(`  - Shadows: ${shadows.length} levels`)
console.log(`  - Breakpoints: ${Object.keys(breakpoints).length} values`)
