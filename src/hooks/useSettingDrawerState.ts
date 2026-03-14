// src/hooks/useSettingDrawerState.ts
import { useCallback, useEffect, useState } from 'react'

const SETTING_DRAWER_STATE_KEY = 'settingDrawerOpen'

export const useSettingDrawerState = (defaultOpen = false) => {
  // ローカルストレージから初期状態を取得
  const getSavedState = () => {
    try {
      const saved = localStorage.getItem(SETTING_DRAWER_STATE_KEY)
      return saved !== null ? JSON.parse(saved) : defaultOpen
    } catch {
      return defaultOpen
    }
  }

  const [open, setOpen] = useState(getSavedState)

  // 状態が変更されたときにローカルストレージに保存
  useEffect(() => {
    try {
      localStorage.setItem(SETTING_DRAWER_STATE_KEY, JSON.stringify(open))
    } catch (error) {
      console.error('Failed to save setting drawer state:', error)
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
