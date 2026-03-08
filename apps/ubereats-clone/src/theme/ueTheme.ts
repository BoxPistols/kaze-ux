import { createTheme } from '@mui/material/styles'

import { darkTheme, lightTheme } from '@/themes/theme'

import { UE_GREEN, UE_GREEN_DARK, UE_GREEN_LIGHT, UE_STAR } from './colors'

// MUI パレット型を拡張
declare module '@mui/material/styles' {
  interface Palette {
    ueGreen: Palette['primary']
    ueStar: { main: string }
  }
  interface PaletteOptions {
    ueGreen?: PaletteOptions['primary']
    ueStar?: { main: string }
  }
}

const ueColors = {
  ueGreen: {
    main: UE_GREEN,
    dark: UE_GREEN_DARK,
    light: UE_GREEN_LIGHT,
    contrastText: '#fff',
  },
  ueStar: { main: UE_STAR },
}

export const ueLightTheme = createTheme({
  ...lightTheme,
  palette: {
    ...lightTheme.palette,
    ...ueColors,
  },
})

export const ueDarkTheme = createTheme({
  ...darkTheme,
  palette: {
    ...darkTheme.palette,
    ...ueColors,
  },
})
