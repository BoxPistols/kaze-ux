'use client'

/**
 * アプリケーション設定コンテキスト
 * アプリケーション全体で設定を共有するためのコンテキスト
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react'
import type { ReactNode } from 'react'

import { DEFAULT_APP_SETTINGS, APP_PRESETS } from '../types/appSettings'
import { createUnitFormatter } from '../utils/unitConverter'

import type {
  AppSettings,
  AppPreset,
  UnitSettings,
  DateTimeSettings,
  MockDataSettings,
} from '../types/appSettings'

// ============================================
// 日時フォーマット関数
// ============================================

/**
 * 日時設定に基づいて日付をフォーマット
 */
const formatDateWithSettings = (
  date: Date,
  settings: DateTimeSettings
): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }

  if (settings.timezone !== 'local') {
    options.timeZone = settings.timezone
  }

  const formatted = date.toLocaleDateString(settings.locale, options)

  // 日本語フォーマットの特別処理
  if (settings.dateFormat === 'YYYY年MM月DD日') {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  }

  return formatted
}

/**
 * 日時設定に基づいて時刻をフォーマット
 */
const formatTimeWithSettings = (
  date: Date,
  settings: DateTimeSettings
): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: settings.timeFormat === '12h',
  }

  if (settings.timeFormat === '24h-seconds') {
    options.second = '2-digit'
  }

  if (settings.timezone !== 'local') {
    options.timeZone = settings.timezone
  }

  return date.toLocaleTimeString(settings.locale, options)
}

/**
 * 日時設定に基づいて日時をフォーマット
 */
const formatDateTimeWithSettings = (
  date: Date,
  settings: DateTimeSettings
): string => {
  const dateStr = formatDateWithSettings(date, settings)
  const timeStr = formatTimeWithSettings(date, settings)
  return `${dateStr} ${timeStr}`
}

/**
 * 相対時間をフォーマット
 */
const formatRelativeTimeWithSettings = (
  date: Date,
  settings: DateTimeSettings
): string => {
  if (!settings.useRelativeTime) {
    return formatDateTimeWithSettings(date, settings)
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))

  // 閾値を超えたら絶対時間で表示
  if (diffMinutes > settings.relativeTimeThreshold) {
    return formatDateTimeWithSettings(date, settings)
  }

  // ロケールに応じた相対時間表示
  const locale = settings.locale

  if (diffMinutes < 1) {
    return locale.startsWith('ja') ? 'たった今' : 'Just now'
  }

  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 60) {
    if (locale.startsWith('ja')) {
      return `${diffMinutes}分前`
    }
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`
  }

  if (diffHours < 24) {
    if (locale.startsWith('ja')) {
      return `${diffHours}時間前`
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  }

  if (diffDays < 7) {
    if (locale.startsWith('ja')) {
      return `${diffDays}日前`
    }
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
  }

  return formatDateWithSettings(date, settings)
}

// ============================================
// コンテキストの型定義
// ============================================

interface AppSettingsContextValue {
  // 現在の設定
  settings: AppSettings

  // 設定の更新
  updateSettings: (updates: Partial<AppSettings>) => void
  updateUnits: (updates: Partial<UnitSettings>) => void
  updateDateTime: (updates: Partial<DateTimeSettings>) => void
  updateMockData: (updates: Partial<MockDataSettings>) => void

  // プリセットの適用
  applyPreset: (preset: AppPreset) => void

  // フォーマッター
  formatters: {
    // 単位フォーマッター
    units: ReturnType<typeof createUnitFormatter>
    // 日時フォーマッター
    date: (date: Date) => string
    time: (date: Date) => string
    dateTime: (date: Date) => string
    relativeTime: (date: Date) => string
  }

  // 現在時刻の取得（モック対応）
  getCurrentTime: () => Date
}

// ============================================
// コンテキスト作成
// ============================================

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null)

// ============================================
// プロバイダー
// ============================================

interface AppSettingsProviderProps {
  children: ReactNode
  initialSettings?: Partial<AppSettings>
}

export const AppSettingsProvider = ({
  children,
  initialSettings,
}: AppSettingsProviderProps) => {
  const [settings, setSettings] = useState<AppSettings>(() => ({
    ...DEFAULT_APP_SETTINGS,
    ...initialSettings,
    units: {
      ...DEFAULT_APP_SETTINGS.units,
      ...initialSettings?.units,
    },
    dateTime: {
      ...DEFAULT_APP_SETTINGS.dateTime,
      ...initialSettings?.dateTime,
    },
    mockData: {
      ...DEFAULT_APP_SETTINGS.mockData,
      ...initialSettings?.mockData,
    },
  }))

  // 設定の更新
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const updateUnits = useCallback((updates: Partial<UnitSettings>) => {
    setSettings((prev) => ({
      ...prev,
      units: { ...prev.units, ...updates },
    }))
  }, [])

  const updateDateTime = useCallback((updates: Partial<DateTimeSettings>) => {
    setSettings((prev) => ({
      ...prev,
      dateTime: { ...prev.dateTime, ...updates },
    }))
  }, [])

  const updateMockData = useCallback((updates: Partial<MockDataSettings>) => {
    setSettings((prev) => ({
      ...prev,
      mockData: { ...prev.mockData, ...updates },
    }))
  }, [])

  // プリセットの適用
  const applyPreset = useCallback((preset: AppPreset) => {
    const presetSettings = APP_PRESETS[preset]
    setSettings((prev) => ({
      ...prev,
      ...presetSettings,
    }))
  }, [])

  // フォーマッターの生成
  const formatters = useMemo(
    () => ({
      units: createUnitFormatter(settings.units),
      date: (date: Date) => formatDateWithSettings(date, settings.dateTime),
      time: (date: Date) => formatTimeWithSettings(date, settings.dateTime),
      dateTime: (date: Date) =>
        formatDateTimeWithSettings(date, settings.dateTime),
      relativeTime: (date: Date) =>
        formatRelativeTimeWithSettings(date, settings.dateTime),
    }),
    [settings.units, settings.dateTime]
  )

  // 現在時刻の取得（モック対応）
  const getCurrentTime = useCallback(() => {
    if (settings.mockData.useFixedTime && settings.mockData.fixedTime) {
      return new Date(settings.mockData.fixedTime)
    }
    return new Date()
  }, [settings.mockData.useFixedTime, settings.mockData.fixedTime])

  const value: AppSettingsContextValue = {
    settings,
    updateSettings,
    updateUnits,
    updateDateTime,
    updateMockData,
    applyPreset,
    formatters,
    getCurrentTime,
  }

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  )
}

// ============================================
// フック
// ============================================

export const useAppSettings = (): AppSettingsContextValue => {
  const context = useContext(AppSettingsContext)
  if (!context) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider')
  }
  return context
}

// オプショナル版（プロバイダーがない場合はデフォルト値を返す）
export const useAppSettingsOptional = (): AppSettingsContextValue => {
  const context = useContext(AppSettingsContext)
  if (!context) {
    const defaultFormatters = {
      units: createUnitFormatter(DEFAULT_APP_SETTINGS.units),
      date: (date: Date) =>
        formatDateWithSettings(date, DEFAULT_APP_SETTINGS.dateTime),
      time: (date: Date) =>
        formatTimeWithSettings(date, DEFAULT_APP_SETTINGS.dateTime),
      dateTime: (date: Date) =>
        formatDateTimeWithSettings(date, DEFAULT_APP_SETTINGS.dateTime),
      relativeTime: (date: Date) =>
        formatRelativeTimeWithSettings(date, DEFAULT_APP_SETTINGS.dateTime),
    }

    return {
      settings: DEFAULT_APP_SETTINGS,
      updateSettings: () => {},
      updateUnits: () => {},
      updateDateTime: () => {},
      updateMockData: () => {},
      applyPreset: () => {},
      formatters: defaultFormatters,
      getCurrentTime: () => new Date(),
    }
  }
  return context
}

export default AppSettingsContext
