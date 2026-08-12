import {
  createColorSet,
  createDarkThemeColors,
  createLightThemeColors,
  withTextContrast,
} from '@/themes/colorToken'
import type { ColorSet, ThemeColors } from '@/themes/colorToken'
import { createBrandModeTheme } from '@/themes/theme'

import {
  KE_GREEN,
  KE_GREEN_DARK,
  KE_GREEN_LIGHT,
  KE_ON_GREEN,
  KE_STAR,
} from './colors'

import type { Theme } from '@mui/material/styles'

// MUI パレット型を拡張
declare module '@mui/material/styles' {
  interface Palette {
    keGreen: Palette['primary']
    keStar: { main: string }
  }
  interface PaletteOptions {
    keGreen?: PaletteOptions['primary']
    keStar?: { main: string }
  }
}

/**
 * KazeEats の環境色。
 *
 * ライトは紙のように真っ白、ダークは墨寄りのニュートラルという
 * フードデリバリーらしい振れ幅を保つ。
 */
const keEnv = {
  light: {
    background: { default: '#FFFFFF', paper: '#FFFFFF' },
    text: { primary: '#000000', secondary: '#545454' },
    divider: '#E2E2E2',
  },
  dark: {
    background: { default: '#1A1A1A', paper: '#242424' },
    text: { primary: '#FFFFFF', secondary: '#B0B0B0' },
    divider: '#333333',
  },
} as const

/**
 * ブランドグリーンが primary。
 *
 * ダークでは暗い面の上で沈むため、色相を保ったまま明度を上げた段を使う。
 * contrastText はどちらも実測なので、値を動かしても文字色が追従する。
 */
const kePrimary = {
  light: createColorSet(KE_GREEN, KE_GREEN_DARK, '#4FBF85', '#D9F2E4'),
  dark: createColorSet('#35C07E', KE_GREEN, '#6BD3A0', '#12301F'),
} as const

/** KazeEats の色定義。Kaze のセマンティック色を継ぎ、ブランド軸だけ差し替える */
const createKeColors = (mode: 'light' | 'dark'): ThemeColors => {
  const base =
    mode === 'light'
      ? createLightThemeColors('kaze')
      : createDarkThemeColors('kaze')
  const env = keEnv[mode]
  // 背景を差し替えたので、前景として使う色は新しい面で測り直す
  const fg = (cs: ColorSet) => withTextContrast(cs, mode, env.background)

  return {
    ...base,
    primary: fg(kePrimary[mode]),
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

export const keLightColors = createKeColors('light')
export const keDarkColors = createKeColors('dark')

/**
 * ブランド固有スロット。
 *
 * primary と同じ色を指すが、「ブランドのグリーン」として名指しで参照したい
 * 箇所（ワードマーク・評価バッジ等）があるため別名でも引けるようにしてある。
 */
const kePalette = {
  keGreen: {
    main: KE_GREEN,
    dark: KE_GREEN_DARK,
    light: KE_GREEN_LIGHT,
    // ブランドグリーンの塗り面に乗せる文字は実測で決める
    contrastText: KE_ON_GREEN,
  },
  keStar: { main: KE_STAR },
}

export const keLightTheme: Theme = createBrandModeTheme(
  keLightColors,
  'light',
  { paletteExtras: kePalette }
)

export const keDarkTheme: Theme = createBrandModeTheme(keDarkColors, 'dark', {
  paletteExtras: kePalette,
})
