import type React from 'react'
import type { CSSProperties } from 'react'
// TypographyOptions interface for MUI v7
interface TypographyOptions {
  htmlFontSize?: number
  fontSize?: number
  fontFamily?: string
  fontWeightLight?: number
  fontWeightRegular?: number
  fontWeightMedium?: number
  fontWeightBold?: number
  allVariants?: CSSProperties
  [key: string]: unknown
}
import '@mui/material/Typography'

declare module '@mui/material/styles' {
  interface TypographyVariants {
    displayLarge: React.CSSProperties
    displayMedium: React.CSSProperties
    displaySmall: React.CSSProperties
    xxl: React.CSSProperties
    xl: React.CSSProperties
    lg: React.CSSProperties
    ml: React.CSSProperties
    md: React.CSSProperties
    sm: React.CSSProperties
    xs: React.CSSProperties
  }

  interface TypographyVariantsOptions {
    // 実行時のフォールバックは MUI デフォルトに委ねるため optional。
    // 必須 (`:`) にすると createTheme の引数型と typographyOptions が不整合になる
    // (typographyOptions は display* を定義していない)。
    displayLarge?: React.CSSProperties
    displayMedium?: React.CSSProperties
    displaySmall?: React.CSSProperties
    xxl?: React.CSSProperties
    xl?: React.CSSProperties
    lg?: React.CSSProperties
    ml?: React.CSSProperties
    md?: React.CSSProperties
    sm?: React.CSSProperties
    xs?: React.CSSProperties
  }
}

// Existing type declarations
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    displayLarge: true
    displayMedium: true
    displaySmall: true
    xxl: true
    xl: true
    lg: true
    ml: true
    md: true
    sm: true
    xs: true
  }
}

declare module '@mui/material/styles' {
  interface Typography {
    displayLarge: CSSProperties
    displayMedium: CSSProperties
    displaySmall: CSSProperties
    xxl?: CSSProperties
    xl?: CSSProperties
    lg?: CSSProperties
    ml?: CSSProperties
    md?: CSSProperties
    sm?: CSSProperties
    xs?: CSSProperties
  }
}

// Typography-related constants and functions
const baseFontSize = 14

const pxToRem = (px: number) => {
  const remValue = (px / baseFontSize).toFixed(2)
  return `${Number.parseFloat(remValue)}rem`
}

export const fontSizesVariant = {
  displayLarge: pxToRem(32),
  displayMedium: pxToRem(28),
  displaySmall: pxToRem(24),
  xxl: pxToRem(22),
  xl: pxToRem(20),
  lg: pxToRem(18),
  ml: pxToRem(16),
  md: pxToRem(14),
  sm: pxToRem(12),
  xs: pxToRem(10), // 最小サイズ（特殊用途のみ）
}

const fontWeight = {
  bold: 700,
  semibold: 600,
  medium: 500,
  normal: 400,
}

const lineHeight = {
  large: 1.8,
  medium: 1.6,
  small: 1.4,
  /** display 帯 (24px 以上) の詰めた行送り */
  tight: 1.2,
  /** 見出し帯 (16-22px) の行送り */
  snug: 1.3,
}

/**
 * 光学的トラッキング (letter-spacing)
 *
 * Inter の公式ダイナミックメトリクス式に基づく。
 * `tracking(px) = a + b * e^(c * px)`  (a = -0.0223, b = 0.185, c = -0.1745)
 *
 * 大きい文字ほど字間を詰め、小さい文字ほど開く。人間の視覚は
 * 同じ相対字間でも大きい文字ほど「間延び」して見えるため、
 * 全サイズ一律 0 だと display は散漫に、caption は窮屈に見える。
 *
 * 参照: https://rsms.me/inter/dynmetrics/
 */
const TRACKING_A = -0.0223
const TRACKING_B = 0.185
const TRACKING_C = -0.1745

const trackingFor = (px: number) =>
  `${(TRACKING_A + TRACKING_B * Math.exp(TRACKING_C * px)).toFixed(4)}em`

/** サイズ (px) → letter-spacing。Storybook のトークン表示でも参照する */
export const letterSpacingVariant = {
  displayLarge: trackingFor(32),
  displayMedium: trackingFor(28),
  displaySmall: trackingFor(24),
  xxl: trackingFor(22),
  xl: trackingFor(20),
  lg: trackingFor(18),
  ml: trackingFor(16),
  md: trackingFor(14),
  sm: trackingFor(12),
  xs: trackingFor(10),
}

/** display 帯 (24px 以上): 太字は大きいほど重く見えるため semibold + 詰めた行送り */
const display = {
  fontWeight: fontWeight.semibold,
  lineHeight: lineHeight.tight,
}

/** 見出し帯 (16-22px): 本文との対比を保つため bold のまま行送りだけ締める */
const heading = {
  fontWeight: fontWeight.bold,
  lineHeight: lineHeight.snug,
}

/** 小見出し帯 (14px 以下): 行送りを緩めて可読性を確保 */
const headingSmall = {
  fontWeight: fontWeight.bold,
  lineHeight: lineHeight.small,
}

// Typography options
export const typographyOptions: TypographyOptions = {
  htmlFontSize: baseFontSize,
  fontSize: baseFontSize,
  fontFamily: 'Inter, Noto Sans JP, Helvetica, Arial, sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  allVariants: {
    fontFamily: 'Inter, Noto Sans JP, Helvetica, Arial, sans-serif',
    lineHeight: lineHeight.medium,
    fontWeight: fontWeight.normal,
    textTransform: 'inherit',
    WebkitFontSmoothing: 'antialiased',
    // -moz-osx-font-smoothing は grayscale / auto / unset のみ有効。
    // antialiased は無効値で描画に反映されないため grayscale に統一
    MozOsxFontSmoothing: 'grayscale',
    fontSize: pxToRem(baseFontSize),
    letterSpacing: letterSpacingVariant.md,
  },
  h1: {
    fontSize: fontSizesVariant.xxl,
    letterSpacing: letterSpacingVariant.xxl,
    ...heading,
  },
  h2: {
    fontSize: fontSizesVariant.xl,
    letterSpacing: letterSpacingVariant.xl,
    ...heading,
  },
  h3: {
    fontSize: fontSizesVariant.lg,
    letterSpacing: letterSpacingVariant.lg,
    ...heading,
  },
  h4: {
    fontSize: fontSizesVariant.ml,
    letterSpacing: letterSpacingVariant.ml,
    ...heading,
  },
  h5: {
    fontSize: fontSizesVariant.md,
    letterSpacing: letterSpacingVariant.md,
    ...headingSmall,
  },
  h6: {
    fontSize: fontSizesVariant.sm,
    letterSpacing: letterSpacingVariant.sm,
    ...headingSmall,
  },
  body1: {
    fontSize: fontSizesVariant.md,
    lineHeight: lineHeight.medium,
    letterSpacing: letterSpacingVariant.md,
  },
  body2: {
    fontSize: fontSizesVariant.sm,
    lineHeight: lineHeight.medium,
    letterSpacing: letterSpacingVariant.sm,
  },
  subtitle1: {
    fontSize: fontSizesVariant.sm,
    lineHeight: lineHeight.small,
    letterSpacing: letterSpacingVariant.sm,
  },
  subtitle2: {
    fontSize: fontSizesVariant.sm, // 最小フォントサイズ12px原則に準拠
    lineHeight: lineHeight.small,
    letterSpacing: letterSpacingVariant.sm,
  },
  caption: {
    fontSize: fontSizesVariant.sm, // 最小フォントサイズ12px原則に準拠
    lineHeight: lineHeight.small,
    letterSpacing: letterSpacingVariant.sm,
  },
  overline: {
    fontSize: fontSizesVariant.sm, // 最小フォントサイズ12px原則に準拠
    lineHeight: lineHeight.small,
    letterSpacing: letterSpacingVariant.sm,
    textTransform: 'none',
  },
  button: {
    fontSize: fontSizesVariant.md,
    fontWeight: fontWeight.medium, // ラベルは本文より一段重く、押せる面に見せる
    lineHeight: lineHeight.medium,
    letterSpacing: letterSpacingVariant.md,
    textTransform: 'none',
  },
  displayLarge: {
    fontSize: fontSizesVariant.displayLarge,
    letterSpacing: letterSpacingVariant.displayLarge,
    ...display,
  },
  displayMedium: {
    fontSize: fontSizesVariant.displayMedium,
    letterSpacing: letterSpacingVariant.displayMedium,
    ...display,
  },
  displaySmall: {
    fontSize: fontSizesVariant.displaySmall,
    letterSpacing: letterSpacingVariant.displaySmall,
    ...display,
  },
  xxl: {
    fontSize: fontSizesVariant.xxl,
    letterSpacing: letterSpacingVariant.xxl,
    ...heading,
  },
  xl: {
    fontSize: fontSizesVariant.xl,
    letterSpacing: letterSpacingVariant.xl,
    ...heading,
  },
  lg: {
    fontSize: fontSizesVariant.lg,
    letterSpacing: letterSpacingVariant.lg,
    ...heading,
  },
  ml: {
    fontSize: fontSizesVariant.ml,
    lineHeight: lineHeight.small,
    letterSpacing: letterSpacingVariant.ml,
  },
  md: {
    fontSize: fontSizesVariant.md,
    lineHeight: lineHeight.small,
    letterSpacing: letterSpacingVariant.md,
  },
  sm: {
    fontSize: fontSizesVariant.sm,
    lineHeight: lineHeight.small,
    letterSpacing: letterSpacingVariant.sm,
  },
  xs: {
    fontSize: fontSizesVariant.xs,
    lineHeight: lineHeight.small,
    letterSpacing: letterSpacingVariant.xs,
  },
}

export const typographyComponentsOverrides = {
  MuiTypography: {
    defaultProps: {
      variantMapping: {
        h1: 'h1',
        h2: 'div',
        h3: 'div',
        h4: 'div',
        h5: 'div',
        h6: 'div',
        body1: 'p',
        body2: 'p',
        subtitle1: 'p',
        subtitle2: 'p',
        overline: 'span',
        caption: 'span',
        button: 'p',
        displayLarge: 'div',
        displayMedium: 'div',
        displaySmall: 'div',
        xxl: 'div',
        xl: 'div',
        lg: 'div',
        ml: 'p',
        md: 'p',
        sm: 'p',
        xs: 'p',
      },
    },
    styleOverrides: {
      gutterBottom: {
        marginBottom: '1em',
      },
      paragraph: {
        marginBottom: '1em',
        fontSize: fontSizesVariant.md,
      },
    },
  },
}
