import { CssBaseline, useMediaQuery } from '@mui/material'
import {
  Experimental_CssVarsProvider as CssVarsProvider,
  StyledEngineProvider,
  useColorScheme,
} from '@mui/material/styles'
import { useEffect } from 'react'
import type { ReactNode } from 'react'

import { theme as defaultTheme } from '../themes/theme'

import type { ThemeMode } from '../types/theme'
import type { Theme } from '@mui/material/styles'

/**
 * CssVarsProvider 内部でモード変更をHTML属性に同期するコンポーネント
 * Tailwind CSS の .dark クラスと data-theme 属性を管理
 */
const ThemeSync = ({ children }: { children: ReactNode }) => {
  const { mode } = useColorScheme()
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')

  useEffect(() => {
    const resolved =
      mode === 'system' || !mode ? (prefersDark ? 'dark' : 'light') : mode
    const isDark = resolved === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light'
    )
  }, [mode, prefersDark])

  return <>{children}</>
}

export interface ThemeProviderProps {
  children: ReactNode
  defaultMode?: ThemeMode
  /**
   * アプリ固有のブランドテーマ。省略時は Kaze の既定テーマ。
   *
   * createBrandTheme() で生成したものを渡すと、MUI の palette と
   * Tailwind が参照する `--color-*` が同じ定義から出る。
   */
  theme?: Theme
}

/**
 * MUI 6 CssVarsProvider ベースのテーマプロバイダー
 * colorSchemes を含む統合テーマを使用し、モード切替を CssVarsProvider に委譲
 */
export const ThemeProvider = ({
  children,
  defaultMode = 'light',
  theme = defaultTheme,
}: ThemeProviderProps) => {
  return (
    <StyledEngineProvider injectFirst>
      <CssVarsProvider theme={theme} defaultMode={defaultMode}>
        <CssBaseline enableColorScheme />
        <ThemeSync>{children}</ThemeSync>
      </CssVarsProvider>
    </StyledEngineProvider>
  )
}
