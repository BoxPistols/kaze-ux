import { useMediaQuery, useTheme } from '@mui/material'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'

import { SIDEBAR_WIDTH } from './constants'

interface SidebarContextType {
  isSidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  sidebarWidth: number
  isHydrated: boolean
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const SIDEBAR_STORAGE_KEY = 'sdpf-sidebar-open'

// LocalStorageから初期値を同期的に取得
const getInitialSidebarState = (): boolean => {
  if (typeof window !== 'undefined') {
    try {
      const savedState = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      if (savedState !== null) {
        return JSON.parse(savedState)
      }
    } catch {
      // エラー時はデフォルト値を返す
    }
  }
  return true // デフォルトは開いた状態
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  // 初期値をLocalStorageから同期的に取得
  const [isSidebarOpen, setIsSidebarOpen] = useState(getInitialSidebarState)
  const [isHydrated, setIsHydrated] = useState(false)
  const theme = useTheme()
  // desktopブレークポイントが未定義の場合は1920pxをフォールバックとして使用
  const desktopBreakpoint = theme.breakpoints.values.xl || 1920
  const isDesktop = useMediaQuery(`(min-width:${desktopBreakpoint}px)`, {
    // SSR時のデフォルト値を設定（デスクトップを仮定）
    defaultMatches: true,
  })

  // ハイドレーション完了を検知
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(open))
      } catch (error) {
        console.warn('Failed to save sidebar state to localStorage:', error)
      }
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const newState = !prev
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(SIDEBAR_STORAGE_KEY, JSON.stringify(newState))
        } catch (error) {
          console.warn('Failed to save sidebar state to localStorage:', error)
        }
      }
      return newState
    })
  }, [])

  // 環境に応じたサイドバー幅を計算
  const sidebarWidth = isSidebarOpen
    ? isDesktop
      ? SIDEBAR_WIDTH.desktop.open
      : SIDEBAR_WIDTH.laptop.open
    : isDesktop
      ? SIDEBAR_WIDTH.desktop.closed
      : SIDEBAR_WIDTH.laptop.closed

  const value = useMemo<SidebarContextType>(
    () => ({
      isSidebarOpen,
      setSidebarOpen,
      toggleSidebar,
      sidebarWidth,
      isHydrated,
    }),
    [isSidebarOpen, setSidebarOpen, toggleSidebar, sidebarWidth, isHydrated]
  )

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }
  return context
}
