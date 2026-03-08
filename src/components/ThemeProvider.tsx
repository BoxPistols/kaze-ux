import { CssBaseline } from '@mui/material'
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  StyledEngineProvider,
} from '@mui/material/styles'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { useTheme } from '../hooks/useTheme'

import type { ThemeMode } from '../types/theme'

export interface ThemeProviderProps {
  children: ReactNode
  defaultMode?: ThemeMode
}
/**
 * MUI 6に対応したテーマプロバイダー
 */
export const ThemeProvider = ({
  children,
  defaultMode = 'light', // デフォルトのテーマはsystemでも良い
}: ThemeProviderProps) => {
  const { theme, mode } = useTheme(defaultMode)

  useEffect(() => {
    // TODO: 本番環境ではログを削除またはloggerに置き換える
    if (process.env.NODE_ENV === 'development') {
      console.log(`Current theme mode: ${mode}`)
    }
  }, [mode])

  return (
    <StyledEngineProvider injectFirst>
      <CssVarsProvider theme={theme} defaultMode={defaultMode}>
        <CssBaseline enableColorScheme />
        {children}
      </CssVarsProvider>
    </StyledEngineProvider>
  )
}
