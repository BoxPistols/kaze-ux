/**
 * MUI エクストラクター
 *
 * tsx でテーマファイルをランタイム実行し、
 * createTheme() の結果オブジェクトからトークンを抽出する
 */

import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { Extractor, ExtractedTokens } from '../types'

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

interface MuiTypography {
  fontFamily: string
  fontSize: number
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
const extractPaletteColors = (
  palette: MuiPalette
): Record<string, Record<string, string>> => {
  const result: Record<string, Record<string, string>> = {}

  const semanticKeys = ['primary', 'secondary', 'success', 'info', 'warning', 'error'] as const
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
  const themeRef = lightTheme ?? mod.theme as MuiTheme | undefined
  if (themeRef?.typography) {
    const baseFontSize = themeRef.typography.fontSize ?? 14
    const pxToRem = (px: number) =>
      `${Number.parseFloat((px / baseFontSize).toFixed(2))}rem`

    tokens.typography = {
      fontFamily: themeRef.typography.fontFamily ?? 'sans-serif',
      baseFontSize,
      sizes: {
        displayLarge: { px: 32, rem: pxToRem(32) },
        displayMedium: { px: 28, rem: pxToRem(28) },
        displaySmall: { px: 24, rem: pxToRem(24) },
        xxl: { px: 22, rem: pxToRem(22) },
        xl: { px: 20, rem: pxToRem(20) },
        lg: { px: 18, rem: pxToRem(18) },
        ml: { px: 16, rem: pxToRem(16) },
        md: { px: 14, rem: pxToRem(14) },
        sm: { px: 12, rem: pxToRem(12) },
        xs: { px: 10, rem: pxToRem(10) },
      },
      weights: { light: 300, regular: 400, medium: 500, bold: 700 },
    }
  }

  // --- スペーシング ---
  if (themeRef?.spacing) {
    const base = typeof themeRef.spacing === 'function'
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
