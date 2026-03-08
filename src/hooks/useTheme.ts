import { useColorScheme, useMediaQuery } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'

import { darkTheme, lightTheme } from '@/themes/theme'

import type { ThemeMode } from '../types/theme'

/**
 * 初期テーマモードを取得（SSR/CSR両対応）
 */
const getInitialMode = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') return 'light'

  // localStorageから保存済みモードを確認
  const savedMode =
    localStorage.getItem('mui-mode') || localStorage.getItem('theme-mode')
  if (savedMode === 'dark') return 'dark'
  if (savedMode === 'light') return 'light'

  // システム設定を確認
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * テーマを管理するフック
 * MUI 6のカラースキーム機能に対応
 */
export const useTheme = (_defaultMode: ThemeMode = 'system') => {
  const { mode, setMode } = useColorScheme()
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  // 初期化完了フラグ（FOUC防止）
  const [isInitialized, setIsInitialized] = useState(false)

  // メモ化でテーマの再計算を最適化
  const theme = useMemo(() => {
    // modeがundefinedの場合は初期モードを使用
    if (mode === undefined || mode === null) {
      const initialMode = getInitialMode()
      return initialMode === 'dark' ? darkTheme : lightTheme
    }

    const resolvedMode =
      mode === 'system' ? (prefersDarkMode ? 'dark' : 'light') : mode
    return resolvedMode === 'dark' ? darkTheme : lightTheme
  }, [mode, prefersDarkMode])

  // 副作用の最適化
  useEffect(() => {
    const isDark = theme.palette.mode === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light'
    )

    // 初期化完了
    if (!isInitialized) {
      setIsInitialized(true)
    }
  }, [theme.palette.mode, isInitialized])

  return { mode, setMode, theme, isInitialized }
}

// 後方互換性のためのエイリアス
export const hookUseTheme = useTheme
