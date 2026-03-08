import { useColorScheme, useMediaQuery } from '@mui/material'
import { useMemo } from 'react'

import { darkTheme, lightTheme } from '@/themes/theme'

import type { ThemeMode } from '../types/theme'

/**
 * テーマを管理するフック
 * CssVarsProvider 内で使用し、モード切替は useColorScheme に委譲
 */
export const useTheme = (_defaultMode: ThemeMode = 'system') => {
  const { mode, setMode } = useColorScheme()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(() => {
    const resolvedMode =
      !mode || mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode
    return resolvedMode === 'dark' ? darkTheme : lightTheme
  }, [mode, prefersDarkMode])

  return { mode, setMode, theme, isInitialized: true }
}

// 後方互換性のためのエイリアス
export const hookUseTheme = useTheme
