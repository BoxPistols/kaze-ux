// src/providers/CalendarSettingsProvider.tsx
import type { ReactNode } from 'react'

import {
  CalendarSettingsContext,
  useCalendarSettingsState,
} from '@/hooks/useCalendarSettings'

interface CalendarSettingsProviderProps {
  children: ReactNode
}

/**
 * カレンダー設定を提供するProvider
 * App.tsx等のルートレベルで使用
 */
export const CalendarSettingsProvider = ({
  children,
}: CalendarSettingsProviderProps) => {
  const value = useCalendarSettingsState()

  return (
    <CalendarSettingsContext.Provider value={value}>
      {children}
    </CalendarSettingsContext.Provider>
  )
}

export default CalendarSettingsProvider
