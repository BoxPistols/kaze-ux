import { amber, blue, pink } from '@mui/material/colors'

import { bestContrast, ensureContrast } from './contrast'

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

/**
 * 塗り面に乗せる文字色の候補。
 *
 * 墨 (#0A0A0A) は kazeTokens.color.sumi と同値。純白と墨の 2 択にして、
 * どちらを使うかは実測で決める。
 */
const ON_SURFACE_INKS = ['#ffffff', '#0A0A0A'] as const

/**
 * 色を「前景」として使うときに選ぶべき variant。
 *
 * Kaze のブランドティール #0EADB8 は明るい色で、白地に対して 2.73:1 しか
 * 出ない。塗り面（背景）としては美しく成立するが、アイコン・細線・
 * テキストなど前景に使うと視認できない。
 *
 * そのため用途で variant を使い分ける:
 * - 塗り面（背景）: `main` + `contrastText`（contrastText は実測で自動決定）
 * - 前景（アイコン・線・文字）: ライトでは `dark`、ダークでは `main`
 *
 * @example
 * <CheckIcon sx={{ color: foregroundVariant(theme.palette.primary, theme.palette.mode) }} />
 */
export const foregroundVariant = (
  set: Pick<ColorSet, 'main' | 'dark'>,
  mode: 'light' | 'dark'
): string => (mode === 'light' ? set.dark : set.main)

/**
 * ColorSet に「前景として使う色」(textContrast) を埋める。
 *
 * `color: 'primary.main'` と書くとブランドティールがそのまま文字色になり、
 * 白地で 2.61:1 しか出ない。かといって使う側に variant の選択を強いると
 * 必ず漏れる。テーマ側で `primary.textContrast` を用意し、
 * 文字・アイコンにはそれを使う運用にする。
 */
const withTextContrast = (
  cs: ColorSet,
  mode: 'light' | 'dark',
  paper: string
): ColorSet => ({
  ...cs,
  // まず用途に応じた variant を選び、それでも本文 AA に届かなければ
  // 色相・彩度を保ったまま明度だけ動かして基準まで持っていく
  textContrast: ensureContrast(foregroundVariant(cs, mode), paper),
})

const createColorSet = (
  main: string,
  dark: string,
  light: string,
  lighter: string,
  textContrast?: string,
  contrastText?: string
): ColorSet => ({
  main,
  dark,
  light,
  lighter,
  textContrast,
  // 白を一律に乗せると明るいブランド色で破綻する
  // (Kaze のティール #0EADB8 に白は 2.73:1、墨なら 7.69:1)。
  // 明示指定が無ければ実測でコントラストの高い方を選ぶ
  contrastText: contrastText ?? bestContrast(main, ON_SURFACE_INKS),
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
export type ColorScheme = 'dracula' | 'kaze' | 'monotone'
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
    description: 'ダーク・紫灰ベース',
    preview: '#282A36',
  },
  {
    id: 'kaze',
    name: 'Kaze',
    description: 'クールティール系',
    preview: '#0EADB8',
  },
  // monotone: 実装済みだがUI調整中のため非表示。有効化する場合は下記を解除
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
  primary: createColorSet('#0EADB8', '#0A8A94', '#3CC0C8', '@@lighter@@'),
  secondary: createColorSet('#696881', '#424242', '#757575', '@@lighter@@'),
  // success/info/warning/error は固有のlighterを持つ（スキーム色で上書きしない）
  success: createColorSet('#46ab4a', '#3f7f42', '#6db770', '#e8f5e9'),
  info: createColorSet('#1dafc2', '#277781', '#43bfcf', '#e0f7fa'),
  warning: createColorSet(
    '#eb8117',
    // 前景用の dark は #EF6C00 だと monotone の paper 上で 2.95:1 と
    // UI 基準 (3:1) に届かなかったため、緑成分をわずかに落として濃くした
    '#E56200',
    '#dd9c3c',
    '#fff3e0'
  ),
  error: createColorSet('#da3737', '#c63535', '#dc4e4e', '#fce4ec'),
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
  // Kaze Light: クールティール系(現行デフォルト)
  kaze: {
    lighter: '#b0dfe3',
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
  scheme: ColorScheme = 'kaze'
): ThemeColors => {
  const env = lightSchemeEnvMap[scheme]
  // スキーム色はprimary/secondaryのlighterのみに適用
  // success/info/warning/errorは固有のlighterを維持（Alert背景等で使用）
  const patchLighter = (cs: ColorSet): ColorSet => ({
    ...cs,
    lighter: env.lighter,
  })
  const fg = (cs: ColorSet) =>
    withTextContrast(cs, 'light', env.background.paper)
  return {
    primary: fg(patchLighter(lightSemanticColors.primary)),
    secondary: fg(patchLighter(lightSemanticColors.secondary)),
    success: fg(lightSemanticColors.success),
    info: fg(lightSemanticColors.info),
    warning: fg(lightSemanticColors.warning),
    error: fg(lightSemanticColors.error),
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
const createLightColors = (): ThemeColors => createLightThemeColors('kaze')

// ----- M3準拠: ダークテーマの同色相トーナル派生 -----
// 共通セマンティックカラー（primary以外はスキーム間で共有）
const darkSemanticBase = {
  secondary: createColorSet('#9a9ab4', '#8080a0', '#b4b4c8', '@@lighter@@'),
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

// スキーム別プライマリカラー（全スキームでティール系を共有）
// Dracula: 紫灰背景に映えるやや彩度高めのティール
// Kaze: Zinc背景に合うスタンダードティール
// Monotone: 低彩度背景に合う落ち着いたティール
const darkSchemePrimaryMap: Record<ColorScheme, ColorSet> = {
  dracula: createColorSet(
    '#50D8D8',
    '#38C0C0',
    '#7AE8E8',
    '@@lighter@@',
    undefined,
    '#1a2e2e'
  ),
  kaze: createColorSet(
    '#4DD8E0',
    '#2CB8C2',
    '#7AE6EC',
    '@@lighter@@',
    undefined,
    '#0c2628'
  ),
  monotone: createColorSet(
    '#68C8CC',
    '#50B0B4',
    '#90D8DC',
    '@@lighter@@',
    undefined,
    '#1a2e2e'
  ),
}

const darkSchemeEnvMap: Record<ColorScheme, SchemeEnv> = {
  // Dracula: 紫灰がかった暗い背景 + ティールアクセント
  dracula: {
    lighter: '#44475A',
    background: { default: '#282A36', paper: '#343746' },
    // secondary は Dracula の comment 色 (#6272A4) を色相・彩度そのままに
    // 明度だけ上げたもの。元の値は paper 上で 3.03:1 と AA に届かなかった
    text: { primary: '#F8F8F2', secondary: '#9ca2c4', disabled: '#6272A4' },
    action: {
      hover: 'rgba(248, 248, 242, 0.06)',
      selected: 'rgba(80, 216, 216, 0.15)',
      disabled: 'rgba(248, 248, 242, 0.3)',
      active: 'rgba(248, 248, 242, 0.56)',
    },
    surface: {
      background: '#2d2f3d',
      backgroundDark: '#44475A',
      backgroundDisabled: '#44475A',
    },
    icon: { light: '#6272A4', dark: '#F8F8F2', disabled: '#44475A' },
    divider: 'rgba(98, 114, 164, 0.15)',
  },
  // Kaze: Zinc系ニュートラル + ティールプライマリ
  kaze: {
    lighter: '#1a3a3e',
    background: { default: '#18181b', paper: '#27272a' },
    text: { primary: '#e4e4e7', secondary: '#a1a1aa', disabled: '#71717a' },
    action: {
      hover: 'rgba(255, 255, 255, 0.04)',
      selected: 'rgba(77, 216, 224, 0.15)',
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
    // secondary は 4.49:1 で AA にわずかに届かなかったため明度を上げた
    text: { primary: '#d0d0d4', secondary: '#8c8f97', disabled: '#606068' },
    action: {
      hover: 'rgba(255, 255, 255, 0.04)',
      selected: 'rgba(104, 200, 204, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.26)',
      active: 'rgba(255, 255, 255, 0.54)',
    },
    surface: {
      background: '#1e1e22',
      backgroundDark: '#303034',
      backgroundDisabled: '#303034',
    },
    icon: { light: '#8a8c94', dark: '#d0d0d4', disabled: '#48484e' },
    divider: 'rgba(255, 255, 255, 0.08)',
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

  const fg = (cs: ColorSet) =>
    withTextContrast(cs, 'dark', env.background.paper)
  return {
    primary: fg(patchLighter(darkSchemePrimaryMap[scheme])),
    secondary: fg(patchLighter(darkSemanticBase.secondary)),
    // success/info/warning/errorは固有のlighterを維持（Alert背景等で使用）
    success: fg(darkSemanticBase.success),
    info: fg(darkSemanticBase.info),
    warning: fg(darkSemanticBase.warning),
    error: fg(darkSemanticBase.error),
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

/**
 * Tailwind / 素の CSS が参照する CSS カスタムプロパティを、
 * このファイルの色定義から生成する。
 *
 * かつては同じ変数が index.css に手打ちされており、しかもアプリごとに
 * 別の値を持っていた（例: --color-background-paper が Dracula では
 * #343746、SaaS では #3b3b3d）。色の真のソースが複数あると、MUI 側の
 * トークンだけ直しても Tailwind 側が古い値のまま残り、同じ画面で
 * 明暗が食い違う。生成に一本化して構造的に起きないようにする。
 *
 * 生成された変数はテーマ適用時に :root へ注入されるため、
 * テーマ／スキームを切り替えると Tailwind 側も追従する。
 */
export const createCssVars = (c: ThemeColors): Record<string, string> => ({
  '--color-primary': c.primary.main,
  '--color-primary-foreground': c.primary.contrastText,
  '--color-primary-light': c.primary.light,
  '--color-primary-dark': c.primary.dark,

  '--color-secondary': c.secondary.main,
  '--color-secondary-foreground': c.secondary.contrastText,

  '--color-success': c.success.main,
  '--color-success-foreground': c.success.contrastText,
  '--color-success-light': c.success.light,
  '--color-success-border': c.success.dark,

  '--color-error': c.error.main,
  '--color-error-foreground': c.error.contrastText,
  '--color-error-light': c.error.light,
  '--color-error-border': c.error.dark,

  '--color-warning': c.warning.main,
  '--color-warning-foreground': c.warning.contrastText,
  '--color-warning-light': c.warning.light,
  '--color-warning-border': c.warning.dark,

  '--color-info': c.info.main,
  '--color-info-foreground': c.info.contrastText,
  '--color-info-light': c.info.light,
  '--color-info-border': c.info.dark,

  '--color-background': c.background.default,
  '--color-background-paper': c.background.paper,
  '--color-foreground': c.text.primary,
  '--color-muted': c.text.secondary,
  '--color-border': c.divider,
})

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
