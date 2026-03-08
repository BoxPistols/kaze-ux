import type { ThemeColors, ColorSet, GreyShades } from '../themes/colorToken'
import type { PaletteOptions, Theme as MuiTheme } from '@mui/material/styles'

/**
 * KDDI Smart Drone Platformで拡張されたパレットオプション
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
