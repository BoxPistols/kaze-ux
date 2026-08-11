// 型定義の明示的なエクスポート
export * from './types/components'
export * from './types/theme'

// コンポーネントの明示的なエクスポートと型情報
export { ThemeProvider } from './components/ThemeProvider'
export type { ThemeProviderProps } from './components/ThemeProvider'

// 重要なコンポーネントは個別にエクスポート
// それ以外は包括的エクスポート
export * from './components'

// フックの明示的なエクスポートと型情報
export { useTheme } from './hooks/useTheme'
export type { ThemeMode } from './types/theme'

// その他のフックも包括的にエクスポート
export * from './hooks'

// コンテキスト
export * from './contexts'

// アプリケーション設定の型
export type {
  AppSettings,
  AppPreset,
  UnitSettings,
  DateTimeSettings,
  DistanceUnit,
  SpeedUnit,
  CoordinateFormat,
} from './types/appSettings'

// テーマ関連のエクスポート
export {
  theme,
  darkTheme,
  lightTheme,
  createDarkTheme,
  createLightTheme,
} from './themes/theme'
export {
  KazeLogo,
  LOGO_CLEAR_SPACE_RATIO,
  LOGO_GRID,
  LOGO_MIN_SIZE,
  LOGO_PROHIBITIONS,
  LOGO_TONES,
  LOGO_VARIANTS,
} from './components/ui/logo'
export type { KazeLogoProps, LogoTone, LogoVariant } from './components/ui/logo'
export type { AppTheme } from './types/theme'
export {
  CONTRAST_THRESHOLD,
  bestContrast,
  contrastLevel,
  contrastRatio,
  contrastRatioOf,
  pickReadable,
} from './themes/contrast'
export { createShadows, elevation } from './themes/elevation'
export type { ElevationLevel } from './themes/elevation'
export {
  kazeEasing,
  kazeDuration,
  kazeTransitions,
  motionOf,
  reducedMotionOverrides,
} from './themes/motion'
export type { KazeEasing, KazeDuration } from './themes/motion'
export {
  colorData,
  getGrey,
  createDarkThemeColors,
  createLightThemeColors,
  foregroundVariant,
  COLOR_SCHEME_STORAGE_KEY,
} from './themes/colorToken'
export type {
  ColorSet,
  GreyShades,
  ThemeColors,
  ColorScheme,
  DarkColorScheme,
} from './themes/colorToken'
export {
  fontSizesVariant,
  typographyOptions,
  typographyComponentsOverrides,
} from './themes/typography'

// Tailwind CSS v4 + MUI統合は現在非対応
// export { muiTheme, CssVarsProvider } from './utils/mui-tailwind'

// レイアウトコンポーネントのエクスポート
export * from './layouts/layout'
