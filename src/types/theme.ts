import type { ThemeColors, ColorSet, GreyShades } from '../themes/colorToken'
import type { PaletteOptions, Theme as MuiTheme } from '@mui/material/styles'

// Easing / Duration の拡張は src/themes/motion.ts に集約している

// ColorSet の textContrast（前景として使う色）を MUI のパレット型に載せる。
// sx の文字列指定 (color: 'primary.textContrast') だけでなく、
// theme.palette.primary.textContrast として型安全に参照できるようにする
declare module '@mui/material/styles' {
  interface PaletteColor {
    textContrast?: string
  }
  interface SimplePaletteColorOptions {
    textContrast?: string
  }
}

/**
 * Kaze UX Design Systemで拡張されたパレットオプション
 * MUI 6のカラースキームに対応
 */
export interface ExtendedPaletteOptions extends PaletteOptions {
  surface?: {
    background?: string
    backgroundDark?: string
    backgroundDisabled?: string
  }
  icon?: {
    white?: string
    light?: string
    dark?: string
    action?: string
    disabled?: string
  }
  chart?: {
    blue: Record<string, string>
    pink: Record<string, string>
  }
}

export interface ColorSchemeOptions {
  palette: ExtendedPaletteOptions
}

/**
 * テーマモードの型定義
 */
export type ThemeMode = 'light' | 'dark' | 'system'

/**
 * アプリケーション固有のテーマ型定義
 */
export interface AppTheme extends MuiTheme {
  palette: MuiTheme['palette'] & ThemeColors
}

/**
 * カラートークン型エクスポート
 */
export type { ColorSet, GreyShades, ThemeColors }
