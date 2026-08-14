import {
  ON_SURFACE_INKS,
  createColorSet,
  createDarkThemeColors,
  createLightThemeColors,
  withTextContrast,
} from '@/themes/colorToken'
import type { ColorSet, ThemeColors } from '@/themes/colorToken'
import { bestContrast } from '@/themes/contrast'
import { createBrandTheme } from '@/themes/theme'

import {
  LOGI_NAVY,
  LOGI_NAVY_LIGHT,
  LOGI_ORANGE,
  LOGI_ORANGE_DARK,
  LOGI_ORANGE_LIGHT,
  LOGI_TEAL,
} from './colors'

import type { Theme } from '@mui/material/styles'

// MUI パレット型を拡張
declare module '@mui/material/styles' {
  interface Palette {
    logiOrange: Palette['primary']
    logiTeal: { main: string }
  }
  interface PaletteOptions {
    logiOrange?: PaletteOptions['primary']
    logiTeal?: { main: string }
  }
}

/** 塗り面に乗せる文字色は白固定にせず実測で選ぶ（明るいオレンジに白は乗らない） */
const onSurface = (bg: string) => bestContrast(bg, ON_SURFACE_INKS)

/**
 * KazeLogistics の環境色。
 *
 * ダークの面を navy に保つのは意匠の都合だけではない。colors.ts の
 * logiForeground() は暗い面を LOGI_NAVY_LIGHT と決め打って前景色を実測して
 * いるので、ここを別系統の色にすると「測った面」と「実際に置かれる面」が
 * ずれて、通っているはずの検証が意味を失う。
 */
const skyEnv = {
  light: {
    background: { default: '#FAFAFA', paper: '#FFFFFF' },
    text: { primary: LOGI_NAVY, secondary: '#64748B' },
    divider: '#E5E7EB',
  },
  dark: {
    background: { default: LOGI_NAVY, paper: LOGI_NAVY_LIGHT },
    text: { primary: '#F1F5F9', secondary: '#94A3B8' },
    divider: '#334155',
  },
} as const

/**
 * ブランドプライマリ。
 *
 * 物流の骨格は navy、アクション（追跡・CTA）はオレンジという役割分担で、
 * primary は navy 側を指す。ダークでは同じ役割を反転した淡い slate が担う
 * （暗い面に暗い navy を置いても面として成立しない）。
 * どちらも contrastText は実測なので、値を動かしても文字色は追従する。
 */
const skyPrimary = {
  light: createColorSet(LOGI_NAVY_LIGHT, LOGI_NAVY, '#334155', '#E2E8F0'),
  dark: createColorSet('#E2E8F0', '#F1F5F9', '#94A3B8', '#334155'),
} as const

/** KazeLogistics の色定義。Kaze のセマンティック色を継ぎ、ブランド軸だけ差し替える */
const createSkyColors = (mode: 'light' | 'dark'): ThemeColors => {
  const base =
    mode === 'light'
      ? createLightThemeColors('kaze')
      : createDarkThemeColors('kaze')
  const env = skyEnv[mode]
  // 背景を差し替えたので、前景として使う色は新しい面で測り直す
  const fg = (cs: ColorSet) => withTextContrast(cs, mode, env.background)

  return {
    ...base,
    primary: fg(skyPrimary[mode]),
    secondary: fg(base.secondary),
    success: fg(base.success),
    info: fg(base.info),
    warning: fg(base.warning),
    error: fg(base.error),
    text: { ...base.text, ...env.text },
    background: env.background,
    divider: env.divider,
  }
}

export const skyLightColors = createSkyColors('light')
export const skyDarkColors = createSkyColors('dark')

/**
 * アクセント（追跡・CTA・進行中ステップ）。
 *
 * createCssVars() は DS 共通の変数しか持たないため、アプリ固有の accent は
 * ここで生成して同じ経路に載せる。index.css に手打ちすると、モードを
 * 切り替えたときに追従しなくなる。
 */
const accentCssVars = (main: string, light: string) => ({
  '--color-accent': main,
  '--color-accent-light': light,
  // 明るいオレンジに白は乗らない（#EA580C に白は 3.56:1、墨なら 5.56:1）
  '--color-accent-foreground': onSurface(main),
})

const logiPalette = {
  logiOrange: {
    main: LOGI_ORANGE,
    dark: LOGI_ORANGE_DARK,
    light: LOGI_ORANGE_LIGHT,
    contrastText: onSurface(LOGI_ORANGE),
  },
  logiTeal: { main: LOGI_TEAL },
}

/**
 * KazeLogistics のテーマ。App.tsx が ThemeProvider に渡す実体。
 *
 * MUI の palette と Tailwind の `--color-*` が同じ ThemeColors から出るため、
 * 片方だけ直して食い違う状態にならない。
 */
export const skyTheme: Theme = createBrandTheme({
  light: skyLightColors,
  dark: skyDarkColors,
  paletteExtras: { light: logiPalette, dark: logiPalette },
  cssVars: {
    light: accentCssVars(LOGI_ORANGE_DARK, 'rgba(234, 88, 12, 0.08)'),
    dark: accentCssVars(LOGI_ORANGE, 'rgba(249, 115, 22, 0.10)'),
  },
  components: {
    // 円の色を変えるなら中の番号も一緒に決める。かつては index.css から
    // !important で差し替えていたが、テーマの外から色を入れる形だと
    // モード切替に追従せず、番号のコントラストも別管理になっていた。
    // 完了状態に text の指定は要らない（MUI は completed のとき CheckCircle を
    // 返して早期 return するので、text ノード自体が生まれない）
    MuiStepIcon: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          '&.Mui-completed': { color: theme.palette.success.main },
          '&.Mui-active': {
            color: 'var(--color-accent)',
            '& .MuiStepIcon-text': { fill: 'var(--color-accent-foreground)' },
          },
        }),
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontFamily: "'DM Sans', 'Noto Sans JP', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          // MUI 自身が `.MuiStepLabel-label.Mui-active` で fontWeight: 400 を
          // 当てており、素の `.MuiStepLabel-label` では詳細度で負ける。
          // index.css 側が !important を必要としていたのはこれが理由なので、
          // 状態セレクタを明示して打ち返す（実測で 600 になることを確認済み）
          '&.Mui-active': { fontWeight: 700 },
          '&.Mui-completed': { fontWeight: 700 },
        },
      },
    },
  },
})
