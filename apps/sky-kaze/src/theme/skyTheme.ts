import { createTheme } from '@mui/material/styles'

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

const logiColors = {
  logiOrange: {
    main: LOGI_ORANGE,
    dark: LOGI_ORANGE_DARK,
    light: LOGI_ORANGE_LIGHT,
    contrastText: '#fff',
  },
  logiTeal: { main: LOGI_TEAL },
}

export const logiLightTheme = createTheme({
  ...lightTheme,
  palette: {
    ...lightTheme.palette,
    ...logiColors,
    primary: {
      main: LOGI_ORANGE_DARK,
      dark: '#C2410C',
      light: LOGI_ORANGE,
      contrastText: '#fff',
    },
  },
})

export const logiDarkTheme = createTheme({
  ...darkTheme,
  palette: {
    ...darkTheme.palette,
    ...logiColors,
    primary: {
      main: LOGI_ORANGE,
      dark: LOGI_ORANGE_DARK,
      light: '#FB923C',
      contrastText: '#1E293B',
    },
  },
})
