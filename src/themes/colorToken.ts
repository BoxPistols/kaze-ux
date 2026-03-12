import { amber, blue, pink } from '@mui/material/colors'

export interface ColorSet {
  main: string
  dark: string
  light: string
  lighter: string
  textContrast?: string
  contrastText: string
}

export interface GreyShades extends Record<string, string> {
  [key: number]: string
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  850: string
  900: string
}

export interface ThemeColors {
  primary: ColorSet
  secondary: ColorSet
  success: ColorSet
  info: ColorSet
  warning: ColorSet
  error: ColorSet
  grey: GreyShades
  text: {
    primary: string
    secondary: string
    disabled: string
    white: string
  }
  background: {
    default: string
    paper: string
  }
  action: {
    hover: string
    selected: string
    disabled: string
    active: string
  }
  surface: {
    background: string
    backgroundDark: string
    backgroundDisabled: string
  }
  icon: {
    white: string
    light: string
    dark: string
    action: string
    disabled: string
  }
  divider: string
  common: {
    black: string
    white: string
  }
}

const createColorSet = (
  main: string,
  dark: string,
  light: string,
  lighter: string,
  textContrast?: string,
  contrastText: string = '#ffffff'
): ColorSet => ({
  main,
  dark,
  light,
  lighter,
  textContrast,
  contrastText,
})

const greyShades: GreyShades = {
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

// ===== カラースキーム (Light/Dark 共通) =====
export type ColorScheme = 'dracula' | 'blue' | 'monotone'
/** 後方互換エイリアス */
export type DarkColorScheme = ColorScheme

export interface SchemeMeta {
  id: ColorScheme
  name: string
  description: string
  preview: string // UI表示用プレビュー色
}

/** Storybook ツールバー等のUI表示用メタ情報 */
export const SCHEME_META: SchemeMeta[] = [
  {
    id: 'dracula',
    name: 'Dracula',
    description: '暖色パープル系',
    preview: '#282A36',
  },
  { id: 'blue', name: 'Blue', description: 'クールZinc系', preview: '#18181b' },
  // { id: 'monotone', name: 'Monotone', description: '低彩度ニュートラル', preview: '#1a1a1e' },
]
/** 後方互換エイリアス */
export const DARK_SCHEME_META: SchemeMeta[] = SCHEME_META
export type DarkSchemeMeta = SchemeMeta

// ===== ライトテーマ色定義 =====

/** スキーム別の環境色(背景/サーフェス/テキスト/divider等)を定義 */
interface SchemeEnv {
  lighter: string // semantic色のlighterスロットに使うサーフェス色
  background: { default: string; paper: string }
  text: { primary: string; secondary: string; disabled: string }
  action: { hover: string; selected: string; disabled: string; active: string }
  surface: {
    background: string
    backgroundDark: string
    backgroundDisabled: string
  }
  icon: { light: string; dark: string; disabled: string }
  divider: string
}

/** ライトテーマのベースセマンティックカラー(スキーム共通) */
const lightSemanticColors = {
  primary: createColorSet(
    '#2642be',
    '#1a2c80',
    '#4d68d4',
    '@@lighter@@',
    undefined,
    '#ffffff'
  ),
  secondary: createColorSet(
    '#696881',
    '#424242',
    '#757575',
    '@@lighter@@',
    undefined,
    '#ffffff'
  ),
  // success/info/warning/error は固有のlighterを持つ（スキーム色で上書きしない）
  success: createColorSet(
    '#46ab4a',
    '#3f7f42',
    '#6db770',
    '#e8f5e9',
    undefined,
    '#ffffff'
  ),
  info: createColorSet(
    '#1dafc2',
    '#277781',
    '#43bfcf',
    '#e0f7fa',
    undefined,
    '#ffffff'
  ),
  warning: createColorSet(
    '#eb8117',
    '#EF6C00',
    '#dd9c3c',
    '#fff3e0',
    undefined,
    '#ffffff'
  ),
  error: createColorSet(
    '#da3737',
    '#c63535',
    '#dc4e4e',
    '#fce4ec',
    undefined,
    '#ffffff'
  ),
}

/** ライトスキーム別の環境色 */
const lightSchemeEnvMap: Record<ColorScheme, SchemeEnv> = {
  // Dracula Light: 暖色パープル系
  dracula: {
    lighter: '#e8e0f0',
    background: { default: '#faf8fc', paper: '#ffffff' },
    text: {
      primary: '#2d1f4e',
      secondary: '#5c4d7a',
      disabled: greyShades[400],
    },
    action: {
      hover: 'rgba(100, 60, 160, 0.06)',
      selected: 'rgba(100, 60, 160, 0.10)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      active: 'rgba(100, 60, 160, 0.54)',
    },
    surface: {
      background: '#faf8fc',
      backgroundDark: '#3f3f46',
      backgroundDisabled: '#f3eef8',
    },
    icon: { light: '#7c6c9a', dark: '#3d2d5e', disabled: '#d0c4e0' },
    divider: 'rgba(100, 60, 160, 0.10)',
  },
  // Blue Light: クールZinc系(現行デフォルト)
  blue: {
    lighter: '#a6b4ec',
    background: { default: '#f8fafc', paper: '#ffffff' },
    text: {
      primary: '#1a1a2e',
      secondary: '#4a5568',
      disabled: greyShades[400],
    },
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
      selected: 'rgba(0, 0, 0, 0.08)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      active: 'rgba(0, 0, 0, 0.54)',
    },
    surface: {
      background: '#f8fafc',
      backgroundDark: '#3f3f46',
      backgroundDisabled: '#f1f5f9',
    },
    icon: { light: '#64748b', dark: '#334155', disabled: '#cbd5e1' },
    divider: 'rgba(0, 0, 0, 0.08)',
  },
  // Monotone Light: 低彩度ニュートラル
  monotone: {
    lighter: '#d8d8dc',
    background: { default: '#f5f5f6', paper: '#fafafa' },
    text: {
      primary: '#2a2a2e',
      secondary: '#606068',
      disabled: greyShades[400],
    },
    action: {
      hover: 'rgba(0, 0, 0, 0.03)',
      selected: 'rgba(0, 0, 0, 0.06)',
      disabled: 'rgba(0, 0, 0, 0.26)',
      active: 'rgba(0, 0, 0, 0.48)',
    },
    surface: {
      background: '#f5f5f6',
      backgroundDark: '#3f3f46',
      backgroundDisabled: '#ededf0',
    },
    icon: { light: '#8a8c94', dark: '#48484e', disabled: '#c8c8cc' },
    divider: 'rgba(0, 0, 0, 0.06)',
  },
}

/** ライトスキームごとの色定義を返す */
export const createLightThemeColors = (
  scheme: ColorScheme = 'blue'
): ThemeColors => {
  const env = lightSchemeEnvMap[scheme]
  // スキーム色はprimary/secondaryのlighterのみに適用
  // success/info/warning/errorは固有のlighterを維持（Alert背景等で使用）
  const patchLighter = (cs: ColorSet): ColorSet => ({
    ...cs,
    lighter: env.lighter,
  })
  return {
    primary: patchLighter(lightSemanticColors.primary),
    secondary: patchLighter(lightSemanticColors.secondary),
    success: lightSemanticColors.success,
    info: lightSemanticColors.info,
    warning: lightSemanticColors.warning,
    error: lightSemanticColors.error,
    grey: greyShades,
    text: { ...env.text, white: '#ffffff' },
    background: env.background,
    action: env.action,
    surface: env.surface,
    icon: { white: '#ffffff', ...env.icon, action: amber[400] },
    divider: env.divider,
    common: { black: '#09090b', white: '#ffffff' },
  }
}

/** 後方互換: スキーム指定なしのライト色(Blue) */
const createLightColors = (): ThemeColors => createLightThemeColors('blue')

// ----- M3準拠: ダークテーマの同色相トーナル派生 -----
// 共通セマンティックカラー（primary以外はスキーム間で共有）
const darkSemanticBase = {
  secondary: createColorSet(
    '#9a9ab4',
    '#8080a0',
    '#b4b4c8',
    '@@lighter@@',
    undefined,
    '#ffffff'
  ),
  // success/info/warning/error は固有のlighterを持つ（Alert背景等で使用）
  success: createColorSet(
    '#6dce72',
    '#52b856',
    '#90dd94',
    '#1a3a1a',
    undefined,
    '#1a2e1a'
  ),
  info: createColorSet(
    '#4dd4e6',
    '#30c0d4',
    '#78e0ee',
    '#0d2a30',
    undefined,
    '#0d2528'
  ),
  warning: createColorSet(
    '#f0a050',
    '#e08c38',
    '#f5b878',
    '#2d2010',
    undefined,
    '#2d1f0d'
  ),
  error: createColorSet(
    '#ef6b6b',
    '#e05050',
    '#f59090',
    '#2d1515',
    undefined,
    '#2d1515'
  ),
}

// スキーム別プライマリカラー
// Dracula: 暖色パープル系 (#BD93F9ベース)
// Blue: 鮮やかなブルー (#60A5FAベース、Tailwind blue-400)
// Monotone: 低彩度グレーブルー (#7B8FE8ベース)
const darkSchemePrimaryMap: Record<ColorScheme, ColorSet> = {
  dracula: createColorSet(
    '#BD93F9',
    '#9B6FD7',
    '#D4B5FF',
    '@@lighter@@',
    undefined,
    '#1a1a2e'
  ),
  blue: createColorSet(
    '#60A5FA',
    '#3B82F6',
    '#93C5FD',
    '@@lighter@@',
    undefined,
    '#0c1829'
  ),
  monotone: createColorSet(
    '#7B8FE8',
    '#5d73d0',
    '#a0b0f0',
    '@@lighter@@',
    undefined,
    '#ffffff'
  ),
}

const darkSchemeEnvMap: Record<ColorScheme, SchemeEnv> = {
  // Dracula: 紫灰がかった暗い背景
  dracula: {
    lighter: '#44475A',
    background: { default: '#282A36', paper: '#343746' },
    text: { primary: '#F8F8F2', secondary: '#6272A4', disabled: '#6272A4' },
    action: {
      hover: 'rgba(248, 248, 242, 0.06)',
      selected: 'rgba(123, 143, 232, 0.15)',
      disabled: 'rgba(248, 248, 242, 0.3)',
      active: 'rgba(248, 248, 242, 0.56)',
    },
    surface: {
      background: '#2d2f3d',
      backgroundDark: '#44475A',
      backgroundDisabled: '#44475A',
    },
    icon: { light: '#6272A4', dark: '#F8F8F2', disabled: '#44475A' },
    divider: 'rgba(98, 114, 164, 0.25)',
  },
  // Blue: Zinc系ニュートラル + 青プライマリ
  blue: {
    lighter: '#1e3a5f',
    background: { default: '#18181b', paper: '#27272a' },
    text: { primary: '#e4e4e7', secondary: '#a1a1aa', disabled: '#71717a' },
    action: {
      hover: 'rgba(255, 255, 255, 0.04)',
      selected: 'rgba(96, 165, 250, 0.15)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      active: 'rgba(255, 255, 255, 0.54)',
    },
    surface: {
      background: '#1e1e22',
      backgroundDark: '#333338',
      backgroundDisabled: '#333338',
    },
    icon: { light: '#a1a1aa', dark: '#e4e4e7', disabled: '#52525b' },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
  // Monotone: 低コントラスト・最小彩度
  monotone: {
    lighter: '#2a2c36',
    background: { default: '#1a1a1e', paper: '#26262a' },
    text: { primary: '#d0d0d4', secondary: '#8a8c94', disabled: '#606068' },
    action: {
      hover: 'rgba(255, 255, 255, 0.04)',
      selected: 'rgba(123, 143, 232, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      active: 'rgba(255, 255, 255, 0.54)',
    },
    surface: {
      background: '#1e1e22',
      backgroundDark: '#303034',
      backgroundDisabled: '#303034',
    },
    icon: { light: '#8a8c94', dark: '#d0d0d4', disabled: '#48484e' },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
}

/** ダークスキームごとの色定義を返す */
export const createDarkThemeColors = (
  scheme: ColorScheme = 'dracula'
): ThemeColors => {
  const env = darkSchemeEnvMap[scheme]

  // lighter スロットをスキーム環境色で置換
  const patchLighter = (cs: ColorSet): ColorSet => ({
    ...cs,
    lighter: env.lighter,
  })

  return {
    primary: patchLighter(darkSchemePrimaryMap[scheme]),
    secondary: patchLighter(darkSemanticBase.secondary),
    // success/info/warning/errorは固有のlighterを維持（Alert背景等で使用）
    success: darkSemanticBase.success,
    info: darkSemanticBase.info,
    warning: darkSemanticBase.warning,
    error: darkSemanticBase.error,
    grey: greyShades,
    text: { ...env.text, white: '#ffffff' },
    background: env.background,
    action: env.action,
    surface: env.surface,
    icon: { white: '#ffffff', ...env.icon, action: amber[400] },
    divider: env.divider,
    common: { black: '#09090b', white: '#ffffff' },
  }
}

/** localStorage キー(Storybook等で使用) */
export const COLOR_SCHEME_STORAGE_KEY = 'color-scheme'
/** 後方互換エイリアス */
export const DARK_SCHEME_STORAGE_KEY = COLOR_SCHEME_STORAGE_KEY

// これは、後にチャートなどの色を設計する時の参考
export const colorData = {
  chart: {
    blue: { 50: blue[50], 200: blue[200] },
    pink: { 200: pink[200] },
  },
  ...createLightColors(),
  dark: createDarkThemeColors('dracula'), // デフォルト: Dracula(後方互換)
}

/** 指定スキームの色データを取得 */
export const getThemeColorData = (
  mode: 'light' | 'dark',
  scheme: ColorScheme
): ThemeColors =>
  mode === 'dark'
    ? createDarkThemeColors(scheme)
    : createLightThemeColors(scheme)

/** 後方互換: ダーク色データ取得 */
export const getDarkColorData = (
  scheme: ColorScheme = 'dracula'
): ThemeColors => createDarkThemeColors(scheme)

export const getGrey = (shade: keyof GreyShades): string => greyShades[shade]

/* ===== Examples =====
styled-componentsを使う場合
const StyledComponent = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
}));

useThemeフックを使う場合
function SomeComponent() {
  const theme = useTheme();
  return <Box sx={{ backgroundColor: theme.palette.primary.main }}>Hello</Box>;
}
*/

//  ===== CSS Variables =====
/** CSS化する場合の生成コード */
/**
let cssVars = ':root {\n'
for (const [key, value] of Object.entries(colorData)) {
  if (typeof value === 'string') {
    cssVars += `  --${key}: ${value};\n`
  } else {
    for (const [subKey, subValue] of Object.entries(value)) {
      if (typeof subValue === 'string') {
        cssVars += `  --${key}-${subKey}: ${subValue};\n`
      } else {
        for (const [nestedKey, nestedValue] of Object.entries(subValue)) {
          cssVars += `  --${key}-${subKey}-${nestedKey}: ${nestedValue};\n`
        }
      }
    }
  }
}
cssVars += '}'

console.log(cssVars)
*/
