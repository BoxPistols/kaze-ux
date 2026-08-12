import { createTheme } from '@mui/material/styles'

import { ON_SURFACE_INKS } from '@/themes/colorToken'
import { bestContrast, ensureContrast } from '@/themes/contrast'
import { darkTheme, lightTheme } from '@/themes/theme'

import {
  LOGI_ORANGE,
  LOGI_ORANGE_DARK,
  LOGI_ORANGE_LIGHT,
  LOGI_TEAL,
} from './colors'

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

const logiColors = {
  logiOrange: {
    main: LOGI_ORANGE,
    dark: LOGI_ORANGE_DARK,
    light: LOGI_ORANGE_LIGHT,
    contrastText: onSurface(LOGI_ORANGE),
  },
  logiTeal: { main: LOGI_TEAL },
}

// ダークでは main が Stepper のアイコンやロゴなど前景としても使われるため、
// 面の上で本文 AA を満たす明度まで補正する（ブランドの色相は保つ）
const darkPrimaryMain = ensureContrast(
  LOGI_ORANGE,
  darkTheme.palette.background.paper
)

export const logiLightTheme = createTheme({
  ...lightTheme,
  palette: {
    ...lightTheme.palette,
    ...logiColors,
    primary: {
      main: LOGI_ORANGE_DARK,
      dark: '#C2410C',
      light: LOGI_ORANGE,
      contrastText: onSurface(LOGI_ORANGE_DARK),
    },
  },
})

export const logiDarkTheme = createTheme({
  ...darkTheme,
  palette: {
    ...darkTheme.palette,
    ...logiColors,
    primary: {
      main: darkPrimaryMain,
      dark: LOGI_ORANGE_DARK,
      light: '#FB923C',
      contrastText: onSurface(darkPrimaryMain),
    },
  },
})
