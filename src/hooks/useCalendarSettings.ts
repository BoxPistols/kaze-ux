// src/hooks/useCalendarSettings.ts
import dayjs from 'dayjs'
import updateLocale from 'dayjs/plugin/updateLocale'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

// 週開始曜日の型定義
// 0 = 日曜, 1 = 月曜, 6 = 土曜
export type WeekStart = 0 | 1 | 6

export interface CalendarSettings {
  weekStart: WeekStart
}

export interface CalendarSettingsContextValue {
  settings: CalendarSettings
  setWeekStart: (weekStart: WeekStart) => void
  /** 週開始曜日に基づいた曜日配列を取得 */
  getDaysOfWeek: () => string[]
  /** 指定曜日が土曜かどうか */
  isSaturday: (dayIndex: number) => boolean
  /** 指定曜日が日曜かどうか */
  isSunday: (dayIndex: number) => boolean
}

const STORAGE_KEY = 'sdpf-calendar-settings'

const DEFAULT_SETTINGS: CalendarSettings = {
  weekStart: 1, // デフォルトは月曜始まり
}

// 曜日の定義（日曜から順番）
const ALL_DAYS = ['日', '月', '火', '水', '木', '金', '土']

// dayjs の updateLocale プラグインを有効化
dayjs.extend(updateLocale)

/**
 * 週開始曜日に基づいた曜日配列を生成
 */
export const getDaysOfWeekByStart = (weekStart: WeekStart): string[] => {
  const result: string[] = []
  for (let i = 0; i < 7; i++) {
    const dayIndex = (weekStart + i) % 7
    result.push(ALL_DAYS[dayIndex])
  }
  return result
}

/**
 * 週開始曜日設定に基づいて、配列インデックスが土曜かどうかを判定
 */
export const isSaturdayByIndex = (
  dayIndex: number,
  weekStart: WeekStart
): boolean => {
  const actualDay = (weekStart + dayIndex) % 7
  return actualDay === 6
}

/**
 * 週開始曜日設定に基づいて、配列インデックスが日曜かどうかを判定
 */
export const isSundayByIndex = (
  dayIndex: number,
  weekStart: WeekStart
): boolean => {
  const actualDay = (weekStart + dayIndex) % 7
  return actualDay === 0
}

/**
 * dayjs の locale を更新して週開始曜日を反映
 */
export const updateDayjsLocale = (weekStart: WeekStart): void => {
  dayjs.updateLocale('ja', {
    weekStart,
  })
}

// Context
export const CalendarSettingsContext =
  createContext<CalendarSettingsContextValue | null>(null)

/**
 * カレンダー設定を管理するフック
 */
export const useCalendarSettings = (): CalendarSettingsContextValue => {
  const context = useContext(CalendarSettingsContext)
  if (!context) {
    throw new Error(
      'useCalendarSettings must be used within a CalendarSettingsProvider'
    )
  }
  return context
}

/**
 * カレンダー設定の初期化（Provider外で使用可能）
 * アプリ起動時に一度だけ呼び出す
 */
export const initCalendarSettings = (): CalendarSettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as CalendarSettings
      updateDayjsLocale(parsed.weekStart)
      return parsed
    }
  } catch {
    // パースエラー時はデフォルト値を使用
  }
  updateDayjsLocale(DEFAULT_SETTINGS.weekStart)
  return DEFAULT_SETTINGS
}

/**
 * Provider用の状態管理フック
 */
export const useCalendarSettingsState = (): CalendarSettingsContextValue => {
  const [settings, setSettings] = useState<CalendarSettings>(() =>
    initCalendarSettings()
  )

  // weekStart変更時にlocalStorageに保存し、dayjsのlocaleも更新
  const setWeekStart = useCallback((weekStart: WeekStart) => {
    setSettings((prev) => {
      const next = { ...prev, weekStart }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // storage full など
      }
      updateDayjsLocale(weekStart)
      return next
    })
  }, [])

  // weekStartに基づいた曜日配列を取得
  const getDaysOfWeek = useCallback(
    () => getDaysOfWeekByStart(settings.weekStart),
    [settings.weekStart]
  )

  // 土曜判定
  const isSaturday = useCallback(
    (dayIndex: number) => isSaturdayByIndex(dayIndex, settings.weekStart),
    [settings.weekStart]
  )

  // 日曜判定
  const isSunday = useCallback(
    (dayIndex: number) => isSundayByIndex(dayIndex, settings.weekStart),
    [settings.weekStart]
  )

  // 初回マウント時にdayjsのlocaleを同期
  useEffect(() => {
    updateDayjsLocale(settings.weekStart)
  }, [settings.weekStart])

  return useMemo(
    () => ({
      settings,
      setWeekStart,
      getDaysOfWeek,
      isSaturday,
      isSunday,
    }),
    [settings, setWeekStart, getDaysOfWeek, isSaturday, isSunday]
  )
}

// 週開始曜日の選択肢の型定義
export interface WeekStartOption {
  /** 曜日の値（0=日曜, 1=月曜, 6=土曜） */
  value: WeekStart
  /** 完全なラベル（例: "日曜日"） */
  label: string
  /** 短縮ラベル（例: "日"） */
  shortLabel: string
}

// 週開始曜日の選択肢
export const WEEK_START_OPTIONS: readonly WeekStartOption[] = [
  { value: 0, label: '日曜日', shortLabel: '日' },
  { value: 1, label: '月曜日', shortLabel: '月' },
  { value: 6, label: '土曜日', shortLabel: '土' },
] as const

// 後方互換性のためのエイリアス
export const hookUseCalendarSettings = useCalendarSettings
