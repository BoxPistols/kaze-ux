// src/hooks/useSidebarState.ts
import { useCallback, useEffect, useState } from 'react'

const SIDEBAR_STATE_KEY = 'sidebarOpen'

export const useSidebarState = (defaultOpen = true) => {
  // ローカルストレージから初期状態を取得
  const getSavedState = () => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STATE_KEY)
      return saved !== null ? JSON.parse(saved) : defaultOpen
    } catch {
      return defaultOpen
    }
  }

  const [open, setOpen] = useState(getSavedState)

  // 状態が変更されたときにローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(open))
    } catch (error) {
      console.error('Failed to save sidebar state:', error)
    }
  }, [open])

  const toggleDrawer = useCallback(() => {
    setOpen((prevOpen: boolean) => !prevOpen)
  }, [])

  return {
    open,
    setOpen,
    toggleDrawer,
  }
}
