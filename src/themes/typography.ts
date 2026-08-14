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
  // 12px が下限。これ未満は用途を問わず使わない。
  // 以前は xs: pxToRem(10) があったが 9.94px になり規約を満たさず、
  // 12px に上げると sm と同値になるため variant ごと廃止した
  sm: pxToRem(12),
}

// ウェイトは 2 値のみ。normal か bold か、それ以外は無い。
//
// 中間ウェイト（500 / 600 / 800 等）を許すと、同じ「少し強調」に対して
// 書き手ごとに違う数値が入り、どれが正なのか誰にも分からなくなる。
// 実際 528 箇所の直書きに 200/300/380/400/420/500/600/700/800/900 の
// 10 種類が混在し、380 や 420 のように由来を説明できない値まであった。
const fontWeight = {
  normal: 400,
  bold: 700,
} as const

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
}

/** display 帯 (24px 以上): 太字は大きいほど重く見えるため semibold + 詰めた行送り */
const display = {
  fontWeight: fontWeight.bold,
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

/**
 * サイズ帯 (xxl - sm): 寸法だけを与え、太さは呼び出し側の裁量に残す。
 *
 * 以前は xxl/xl/lg だけが bold + 行送り 1.3、ml 以下が normal + 1.4 で、
 * 同じ命名軸の途中で太さが切り替わっていた。結果として、見出しに使う側は
 * 必ず fontWeight を書き足し（serviceCard は variant='md' に 600 を追加）、
 * サイズ帯に使う側は太さを打ち消す必要があった。
 *
 * 意味 (h1-h6 / display) と寸法 (xxl-sm) を別の軸として扱い、
 * 寸法側は太さを主張しない。
 */
const sizeOnly = {
  fontWeight: fontWeight.normal,
  lineHeight: lineHeight.small,
}

// Typography options
export const typographyOptions: TypographyOptions = {
  htmlFontSize: baseFontSize,
  fontSize: baseFontSize,
  fontFamily: 'Inter, Noto Sans JP, Helvetica, Arial, sans-serif',
  // MUI 自身のスケールも 2 値に潰す。theme.typography.fontWeightMedium を
  // 参照している箇所があり、ここが 500 のままだと描画に 500 が残る
  fontWeightLight: 400,
  fontWeightRegular: 400,
  fontWeightMedium: 400,
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
  // subtitle1 / subtitle2 / caption / overline は以前すべて 12px・
  // 行送り 1.4・weight 400 の同値だった。名前が 4 つあって見た目が 1 つでは
  // 段として機能しないため、呼び出し側は毎回 sx で打ち消していた。
  // 見出しと本文の間を埋める段として、それぞれに役割を与える。
  /** 見出しに添える導入文。本文より一段大きく、bold で立てる */
  subtitle1: {
    fontSize: fontSizesVariant.ml,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.small,
    letterSpacing: letterSpacingVariant.ml,
  },
  /** 小見出しに添える補足。本文と同じ寸法で、太さ (bold) だけで区別する */
  subtitle2: {
    fontSize: fontSizesVariant.md,
    fontWeight: fontWeight.bold,
    // h5 も md + bold。見出しは行送りを締め (small)、副題は文として
    // 読ませるので緩める (medium)。ウェイトが 2 値なので太さでは分けられない
    lineHeight: lineHeight.medium,
    letterSpacing: letterSpacingVariant.md,
  },
  /** 図版の説明・補助テキスト。最小フォントサイズ 12px 原則に準拠 */
  caption: {
    fontSize: fontSizesVariant.sm,
    lineHeight: lineHeight.small,
    letterSpacing: letterSpacingVariant.sm,
  },
  /**
   * セクションの上に置くラベル (eyebrow)。
   *
   * 字間を大きく開けるのは光学調整の式から意図的に外れる。この段は
   * 読ませる文ではなく「印」として認識されるため、単語の塊を解いて
   * 文字の帯に見せる方が役目に合う。
   */
  overline: {
    fontSize: fontSizesVariant.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.small,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  button: {
    fontSize: fontSizesVariant.md,
    fontWeight: fontWeight.normal, // ラベルは本文より一段重く、押せる面に見せる
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
    ...sizeOnly,
  },
  xl: {
    fontSize: fontSizesVariant.xl,
    letterSpacing: letterSpacingVariant.xl,
    ...sizeOnly,
  },
  lg: {
    fontSize: fontSizesVariant.lg,
    letterSpacing: letterSpacingVariant.lg,
    ...sizeOnly,
  },
  ml: {
    fontSize: fontSizesVariant.ml,
    letterSpacing: letterSpacingVariant.ml,
    ...sizeOnly,
  },
  md: {
    fontSize: fontSizesVariant.md,
    letterSpacing: letterSpacingVariant.md,
    ...sizeOnly,
  },
  sm: {
    fontSize: fontSizesVariant.sm,
    letterSpacing: letterSpacingVariant.sm,
    ...sizeOnly,
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
