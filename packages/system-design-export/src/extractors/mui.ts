/**
 * MUI エクストラクター
 *
 * tsx でテーマファイルをランタイム実行し、
 * createTheme() の結果オブジェクトからトークンを抽出する
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { Extractor, ExtractedTokens } from '../types.js'

// MUI Theme のパレット構造（最小定義）
interface MuiPaletteColor {
  main: string
  dark: string
  light: string
  lighter?: string
  contrastText: string
}

interface MuiPalette {
  mode: 'light' | 'dark'
  primary: MuiPaletteColor
  secondary: MuiPaletteColor
  success: MuiPaletteColor
  info: MuiPaletteColor
  warning: MuiPaletteColor
  error: MuiPaletteColor
  grey: Record<string, string>
  text: { primary: string; secondary: string; disabled: string }
  background: { default: string; paper: string }
  divider: string
}

// タイポグラフィバリアントのスタイル
interface TypographyVariantStyle {
  fontSize?: string | number
  fontWeight?: number
  lineHeight?: number | string
  letterSpacing?: string
  textTransform?: string
  fontFamily?: string
}

interface MuiTypography {
  fontFamily: string
  fontSize: number
  htmlFontSize?: number
  fontWeightLight?: number
  fontWeightRegular?: number
  fontWeightMedium?: number
  fontWeightBold?: number
  [key: string]: unknown
}

interface MuiTheme {
  palette: MuiPalette
  typography: MuiTypography
  spacing: (factor: number) => string | number
  shape: { borderRadius: number }
  shadows: string[]
  breakpoints: { values: Record<string, number> }
}

/**
 * MUI パレットからカラーマップを抽出
 */
export const extractPaletteColors = (
  palette: MuiPalette
): Record<string, Record<string, string>> => {
  const result: Record<string, Record<string, string>> = {}

  const semanticKeys = [
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'error',
  ] as const
  for (const key of semanticKeys) {
    const color = palette[key] as MuiPaletteColor
    if (!color) continue
    result[key] = {
      main: color.main,
      dark: color.dark,
      light: color.light,
      ...(color.lighter ? { lighter: color.lighter } : {}),
      contrastText: color.contrastText,
    }
  }

  // グレースケール
  if (palette.grey) {
    result.grey = {}
    for (const [shade, val] of Object.entries(palette.grey)) {
      if (typeof val === 'string' && val.startsWith('#')) {
        result.grey[shade] = val
      }
    }
  }

  // テキスト
  result.text = {
    primary: palette.text.primary,
    secondary: palette.text.secondary,
    disabled: palette.text.disabled,
  }

  // 背景
  result.background = {
    default: palette.background.default,
    paper: palette.background.paper,
  }

  // divider
  result.divider = { default: palette.divider }

  return result
}

/**
 * MUI テーマファイルを動的インポートしてトークンを抽出
 */
const extractFromMui: Extractor['extract'] = async (inputPath: string) => {
  const absPath = resolve(process.cwd(), inputPath)
  if (!existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`)
  }

  // tsx ランタイムで動的インポート
  const fileUrl = pathToFileURL(absPath).href
  const mod = await import(fileUrl)

  const tokens: ExtractedTokens = {}

  // --- カラー ---
  const lightTheme = mod.lightTheme as MuiTheme | undefined
  const darkTheme = mod.darkTheme as MuiTheme | undefined

  // lightTheme / darkTheme が直接エクスポートされている場合
  if (lightTheme?.palette && darkTheme?.palette) {
    tokens.color = {
      light: extractPaletteColors(lightTheme.palette),
      dark: extractPaletteColors(darkTheme.palette),
    }
  } else {
    // theme 単体の場合
    const theme = mod.theme as MuiTheme | undefined
    if (theme?.palette) {
      const colors = extractPaletteColors(theme.palette)
      tokens.color = {
        light: colors,
        dark: colors,
      }
    }
  }

  // --- タイポグラフィ ---
  const themeRef = lightTheme ?? (mod.theme as MuiTheme | undefined)
  if (themeRef?.typography) {
    const typo = themeRef.typography
    const baseFontSize = typo.htmlFontSize ?? typo.fontSize ?? 14

    // rem → px 変換
    const remToPx = (remStr: string): number => {
      const match = remStr.match(/^([\d.]+)rem$/)
      if (!match) return Number.NaN
      return Math.round(parseFloat(match[1]) * baseFontSize * 100) / 100
    }

    const pxToRem = (px: number) =>
      `${Number.parseFloat((px / baseFontSize).toFixed(2))}rem`

    // メタキー（バリアントではないキー）
    const META_KEYS = new Set([
      'fontFamily',
      'fontSize',
      'htmlFontSize',
      'fontWeightLight',
      'fontWeightRegular',
      'fontWeightMedium',
      'fontWeightBold',
      'allVariants',
      'pxToRem',
      'useNextVariants',
    ])

    // バリアントを動的に探索してサイズを抽出
    const sizes: Record<string, { px: number; rem: string }> = {}
    for (const [key, value] of Object.entries(typo)) {
      if (META_KEYS.has(key)) continue
      if (typeof value !== 'object' || value === null) continue

      const variant = value as TypographyVariantStyle
      if (!variant.fontSize) continue

      let pxValue: number
      if (typeof variant.fontSize === 'number') {
        pxValue = variant.fontSize
      } else if (typeof variant.fontSize === 'string') {
        if (variant.fontSize.endsWith('rem')) {
          pxValue = remToPx(variant.fontSize)
        } else if (variant.fontSize.endsWith('px')) {
          pxValue = parseFloat(variant.fontSize)
        } else {
          continue
        }
      } else {
        continue
      }

      if (!Number.isNaN(pxValue)) {
        sizes[key] = { px: pxValue, rem: pxToRem(pxValue) }
      }
    }

    // fontWeight を動的に抽出
    const weights: Record<string, number> = {}
    if (typo.fontWeightLight != null)
      weights.light = typo.fontWeightLight as number
    if (typo.fontWeightRegular != null)
      weights.regular = typo.fontWeightRegular as number
    if (typo.fontWeightMedium != null)
      weights.medium = typo.fontWeightMedium as number
    if (typo.fontWeightBold != null)
      weights.bold = typo.fontWeightBold as number

    tokens.typography = {
      fontFamily: typo.fontFamily ?? 'sans-serif',
      baseFontSize,
      sizes,
      weights,
    }
  }

  // --- スペーシング ---
  if (themeRef?.spacing) {
    const base =
      typeof themeRef.spacing === 'function'
        ? (() => {
            try {
              const val = themeRef.spacing(1)
              return typeof val === 'number' ? val : parseInt(String(val), 10)
            } catch {
              return 8
            }
          })()
        : 8

    const multipliers = [0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24]
    const values: Record<string, number> = {}
    for (const m of multipliers) {
      values[String(m).replace('.', '_')] = base * m
    }
    tokens.spacing = { base, values }
  }

  // --- ボーダーラジウス ---
  if (themeRef?.shape?.borderRadius) {
    const br = themeRef.shape.borderRadius
    tokens.borderRadius = {
      xs: 4,
      sm: 6,
      md: br,
      lg: 10,
      xl: 12,
      '2xl': 16,
      full: '9999px',
    }
  }

  // --- シャドウ ---
  if (themeRef?.shadows && Array.isArray(themeRef.shadows)) {
    // MUI shadows は 25段階、代表的な7つを抽出
    const s = themeRef.shadows
    tokens.shadows = [
      s[0] ?? 'none',
      s[1] ?? 'none',
      s[2] ?? 'none',
      s[4] ?? 'none',
      s[8] ?? 'none',
      s[16] ?? 'none',
      s[24] ?? 'none',
    ]
  }

  // --- ブレークポイント ---
  if (themeRef?.breakpoints?.values) {
    tokens.breakpoints = { ...themeRef.breakpoints.values }
  }

  return tokens
}

export const muiExtractor: Extractor = {
  name: 'mui',
  extract: extractFromMui,
}
