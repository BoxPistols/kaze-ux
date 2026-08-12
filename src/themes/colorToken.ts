import { amber, blue, pink } from '@mui/material/colors'

import { CONTRAST_THRESHOLD, bestContrast, ensureContrast } from './contrast'
import { focusRingColor } from './focus'

export interface ColorSet {
  main: string
  dark: string
  light: string
  lighter: string
  textContrast?: string
  contrastText: string
  /**
   * `light` の塗り面に乗せる文字色。
   *
   * `contrastText` は `main` を基準に測った値なので、`light` の面に
   * 乗せると基準が食い違う。今の値では偶然成立していても、`main` を
   * 動かした瞬間に無言で破綻する。面ごとに前景を持つ。
   */
  onLight: string
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
 *
 * アプリ側の塗り面（UE のグリーン、Logistics のオレンジ等）でも同じ 2 択を
 * 使う。候補を各所で書き直すと、墨の値を変えたときに食い違う
 */
export const ON_SURFACE_INKS: readonly [string, ...string[]] = [
  '#ffffff',
  '#0A0A0A',
]

/**
 * ブランドの基準色。
 *
 * ロゴのシンボルとテーマの primary が同じ値を指すための単一ソース。
 * バウハウスの三原色から採った青で、白文字が 6.87:1 出る（旧ティール
 * #0EADB8 は 2.73:1 しか出ず、塗り面に白を乗せられなかった）。
 *
 * ロゴ側の参照: src/components/ui/logo/logoRules.ts
 */
export const BRAND_BLUE = '#0057B8'

/**
 * 色を「前景」として使うときに選ぶべき variant。
 *
 * セマンティック色の main は明度がまちまちで、明るいもの（info #1dafc2 は
 * 白地に対して 2.61:1）は塗り面としては成立しても、アイコン・細線・
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
 * `color: 'info.main'` と書くと明るい main がそのまま文字色になり、
 * 白地で 2.61:1 しか出ない。かといって使う側に variant の選択を強いると
 * 必ず漏れる。テーマ側で `primary.textContrast` を用意し、
 * 文字・アイコンにはそれを使う運用にする。
 */
/**
 * 前景色に持たせる余裕。
 *
 * ちょうど 4.5:1 で止めると余裕がゼロになり、その色を淡い tint の上に
 * 置いた瞬間に基準を割る。実測すると `success.textContrast` を
 * `success.lighter` に重ねた「+12%」が 4.49:1 で、0.01 足りなかった。
 *
 * 前景は素の背景の上だけに置かれるとは限らない。Chip・Alert・
 * ハイライト行など、薄く色を敷いた面に乗ることの方が多い。
 * 素の面に対して少し濃いめに決めておけば、その分がそのまま余裕になる。
 */
const TEXT_CONTRAST_HEADROOM = 1.2

const withTextContrast = (
  cs: ColorSet,
  mode: 'light' | 'dark',
  background: { default: string; paper: string }
): ColorSet => ({
  ...cs,
  // まず用途に応じた variant を選び、それでも本文 AA に届かなければ
  // 色相・彩度を保ったまま明度だけ動かして基準まで持っていく。
  //
  // paper と default の両方に対して満たす必要がある。どちらが厳しいかは
  // モードで入れ替わるため（ライトは暗い文字なので暗い default が厳しく、
  // ダークは明るい文字なので明るい paper が厳しい）、片方だけを基準に
  // すると、もう一方の面に置いたときに AA を割る。
  textContrast: ensureContrast(
    ensureContrast(
      foregroundVariant(cs, mode),
      background.paper,
      CONTRAST_THRESHOLD.text * TEXT_CONTRAST_HEADROOM
    ),
    background.default,
    CONTRAST_THRESHOLD.text * TEXT_CONTRAST_HEADROOM
  ),
})

const createColorSet = (
  main: string,
  dark: string,
  light: string,
  lighter: string,
  // textContrast と contrastText は名前も型も似ている。位置引数で並べると
  // 取り違えてもコンパイルが通り、無言で誤った色になる
  opts: { textContrast?: string; contrastText?: string } = {}
): ColorSet => ({
  main,
  dark,
  light,
  lighter,
  textContrast: opts.textContrast,
  // 白を一律に乗せると明るいブランド色で破綻する
  // (旧ブランドティール #0EADB8 に白は 2.73:1、墨なら 7.25:1)。
  // 明示指定が無ければ実測でコントラストの高い方を選ぶ
  contrastText: opts.contrastText ?? bestContrast(main, ON_SURFACE_INKS),
  onLight: bestContrast(light, ON_SURFACE_INKS),
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
/**
 * 実装済みのスキーム一覧。
 * テストや監査が全スキームを走査するための単一ソース。
 * ここに足すだけで検査対象に入る（手書きの列挙だと取りこぼす）
 */
export const COLOR_SCHEMES = ['dracula', 'kaze', 'monotone'] as const
export type ColorScheme = (typeof COLOR_SCHEMES)[number]
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
    description: 'クールブルー系',
    preview: BRAND_BLUE,
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
  // ロゴと同じ青。dark は前景・hover 用に落とした段、light は面の淡い段
  primary: createColorSet(BRAND_BLUE, '#00458F', '#3D82D2', '@@lighter@@'),
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
  // Kaze Light: クールブルー系(現行デフォルト)
  kaze: {
    lighter: '#c2d9f2',
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
  const fg = (cs: ColorSet) => withTextContrast(cs, 'light', env.background)
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
  // ダークでは main が前景 (outlined Chip の文字・アイコン) として使われる。
  // #9a9ab4 は Dracula の paper 上で 4.30:1 と本文 AA に届かないため、
  // 色相・彩度を保ったまま明度だけ上げた
  secondary: createColorSet('#a0a0b8', '#8080a0', '#b4b4c8', '@@lighter@@'),
  // success/info/warning/error は固有のlighterを持つ（Alert背景等で使用）
  success: createColorSet('#6dce72', '#52b856', '#90dd94', '#1a3a1a', {
    contrastText: '#1a2e1a',
  }),
  info: createColorSet('#4dd4e6', '#30c0d4', '#78e0ee', '#0d2a30', {
    contrastText: '#0d2528',
  }),
  warning: createColorSet('#f0a050', '#e08c38', '#f5b878', '#2d2010', {
    contrastText: '#2d1f0d',
  }),
  error: createColorSet(
    // Dracula の paper 上で 3.92:1 だったため明度を上げた
    '#f18282',
    '#e05050',
    '#f59090',
    '#2d1515',
    { contrastText: '#2d1515' }
  ),
}

// スキーム別プライマリカラー（全スキームで青系を共有）
// ライトの #0057B8 は暗い面では沈むため、色相を保ったまま明度を上げた段を使う。
// Dracula: 紫灰背景に馴染むやや紫寄りの青
// Kaze: Zinc背景に合うニュートラルな青
// Monotone: 低彩度背景に合う彩度を落とした青
const darkSchemePrimaryMap: Record<ColorScheme, ColorSet> = {
  dracula: createColorSet('#7FA8F8', '#5E8CE8', '#A6C4FB', '@@lighter@@', {
    contrastText: '#101a33',
  }),
  kaze: createColorSet('#5AA9FF', '#3B8CE8', '#8CC4FF', '@@lighter@@', {
    contrastText: '#06182e',
  }),
  monotone: createColorSet('#86ADD9', '#688FBC', '#A8C6E6', '@@lighter@@', {
    contrastText: '#121b28',
  }),
}

const darkSchemeEnvMap: Record<ColorScheme, SchemeEnv> = {
  // Dracula: 紫灰がかった暗い背景 + ブルーアクセント
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
  // Kaze: Zinc系ニュートラル + ブループライマリ
  kaze: {
    lighter: '#152a44',
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
      selected: 'rgba(134, 173, 217, 0.12)',
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

  const fg = (cs: ColorSet) => withTextContrast(cs, 'dark', env.background)
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
  // 面ではなく文字・アイコンとして使う色（実測で決まる）
  '--color-primary-ink': c.primary.textContrast ?? c.primary.main,
  '--color-primary-light': c.primary.light,
  '--color-primary-light-foreground': c.primary.onLight,
  '--color-primary-dark': c.primary.dark,

  '--color-secondary': c.secondary.main,
  '--color-secondary-foreground': c.secondary.contrastText,
  // 面ではなく文字・アイコンとして使う色（実測で決まる）
  '--color-secondary-ink': c.secondary.textContrast ?? c.secondary.main,
  '--color-secondary-dark': c.secondary.dark,

  '--color-success': c.success.main,
  '--color-success-foreground': c.success.contrastText,
  // 面ではなく文字・アイコンとして使う色（実測で決まる）
  '--color-success-ink': c.success.textContrast ?? c.success.main,
  '--color-success-light': c.success.light,
  '--color-success-light-foreground': c.success.onLight,
  '--color-success-border': c.success.dark,
  '--color-success-dark': c.success.dark,

  '--color-error': c.error.main,
  '--color-error-foreground': c.error.contrastText,
  // 面ではなく文字・アイコンとして使う色（実測で決まる）
  '--color-error-ink': c.error.textContrast ?? c.error.main,
  '--color-error-light': c.error.light,
  '--color-error-light-foreground': c.error.onLight,
  '--color-error-border': c.error.dark,
  '--color-error-dark': c.error.dark,

  '--color-warning': c.warning.main,
  '--color-warning-foreground': c.warning.contrastText,
  // 面ではなく文字・アイコンとして使う色（実測で決まる）
  '--color-warning-ink': c.warning.textContrast ?? c.warning.main,
  '--color-warning-light': c.warning.light,
  '--color-warning-light-foreground': c.warning.onLight,
  '--color-warning-border': c.warning.dark,
  '--color-warning-dark': c.warning.dark,

  '--color-info': c.info.main,
  '--color-info-foreground': c.info.contrastText,
  // 面ではなく文字・アイコンとして使う色（実測で決まる）
  '--color-info-ink': c.info.textContrast ?? c.info.main,
  '--color-info-light': c.info.light,
  '--color-info-light-foreground': c.info.onLight,
  '--color-info-border': c.info.dark,
  '--color-info-dark': c.info.dark,

  '--color-background': c.background.default,
  '--color-background-paper': c.background.paper,
  '--color-foreground': c.text.primary,
  '--color-muted': c.text.secondary,
  '--color-border': c.divider,

  // フォーカスリング。ブランド色そのままだと primary の塗り面で溶けるため、
  // 面と地の両方に対して UI 基準 (3:1) を満たす明度に寄せた値を持つ
  '--color-ring': focusRingColor(c.primary.main, c.background),
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
