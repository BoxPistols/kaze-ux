/**
 * アプリケーション設定の型定義
 * プロジェクトごとに計測値・日時フォーマットを切り替えるための設定
 */

// 距離の単位
export type DistanceUnit =
  | 'meters'
  | 'feet'
  | 'kilometers'
  | 'miles'
  | 'nauticalMiles'

// 速度の単位
export type SpeedUnit = 'ms' | 'kmh' | 'mph' | 'knots'

// 高度の単位
export type AltitudeUnit = 'meters' | 'feet'

// 温度の単位
export type TemperatureUnit = 'celsius' | 'fahrenheit'

// 気圧の単位
export type PressureUnit = 'hPa' | 'inHg' | 'mmHg'

// 座標表示形式
export type CoordinateFormat =
  | 'decimal' // 35.6812, 139.7671
  | 'dms' // 35°40'52"N, 139°46'02"E
  | 'dmm' // 35°40.872'N, 139°46.026'E

// 日時フォーマットのロケール
export type DateTimeLocale =
  | 'ja-JP'
  | 'en-US'
  | 'en-GB'
  | 'de-DE'
  | 'fr-FR'
  | 'zh-CN'
  | 'ko-KR'

// 日付フォーマット
export type DateFormat =
  | 'YYYY/MM/DD' // 2025/12/20
  | 'YYYY-MM-DD' // 2025-12-20
  | 'DD/MM/YYYY' // 20/12/2025
  | 'MM/DD/YYYY' // 12/20/2025
  | 'YYYY年MM月DD日' // 2025年12月20日

// 時刻フォーマット
export type TimeFormat =
  | '24h' // 14:30
  | '12h' // 2:30 PM
  | '24h-seconds' // 14:30:45

// タイムゾーン
export type TimezoneOption =
  | 'local' // ブラウザのローカル
  | 'UTC' // UTC
  | 'Asia/Tokyo'
  | 'America/New_York'
  | 'America/Los_Angeles'
  | 'Europe/London'
  | 'Europe/Paris'

// 計測単位設定
export interface UnitSettings {
  distance: DistanceUnit
  speed: SpeedUnit
  altitude: AltitudeUnit
  temperature: TemperatureUnit
  pressure: PressureUnit
  coordinates: CoordinateFormat
}

// 日時フォーマット設定
export interface DateTimeSettings {
  locale: DateTimeLocale
  dateFormat: DateFormat
  timeFormat: TimeFormat
  timezone: TimezoneOption
  // 相対時間表示（「3分前」等）を使用するか
  useRelativeTime: boolean
  // 相対時間表示の閾値（分）- これより古い場合は絶対時間で表示
  relativeTimeThreshold: number
}

// モックデータ設定
export interface MockDataSettings {
  // 基準位置（モックデータの生成中心）
  baseLocation: {
    latitude: number
    longitude: number
    name: string
  }
  // エンティティ数（モック生成時の要素数）
  entityCount: number
  // 更新間隔（ミリ秒）
  updateInterval: number
  // シード値（乱数の再現性のため）
  seed?: number
  // 固定時刻を使用するか（デモ用）
  useFixedTime: boolean
  // 固定時刻（useFixedTimeがtrueの場合）
  fixedTime?: Date
}

// アプリケーション設定
export interface AppSettings {
  // 識別子
  id: string
  name: string
  description?: string

  // 単位設定
  units: UnitSettings

  // 日時設定
  dateTime: DateTimeSettings

  // モックデータ設定
  mockData: MockDataSettings

  // カスタム設定（プロジェクト固有の設定を拡張可能）
  custom?: Record<string, unknown>
}

// プリセット名
export type AppPreset =
  | 'japan' // 日本（メートル法、日本語）
  | 'usa' // アメリカ（フィート、英語）
  | 'europe' // ヨーロッパ（メートル法、24時間）
  | 'international' // 国際（メートル法、UTC）

// プリセット設定
export const APP_PRESETS: Record<
  AppPreset,
  Omit<AppSettings, 'id' | 'name'>
> = {
  japan: {
    units: {
      distance: 'meters',
      speed: 'ms',
      altitude: 'meters',
      temperature: 'celsius',
      pressure: 'hPa',
      coordinates: 'decimal',
    },
    dateTime: {
      locale: 'ja-JP',
      dateFormat: 'YYYY/MM/DD',
      timeFormat: '24h',
      timezone: 'Asia/Tokyo',
      useRelativeTime: true,
      relativeTimeThreshold: 60,
    },
    mockData: {
      baseLocation: {
        latitude: 35.6812,
        longitude: 139.7671,
        name: '東京都千代田区',
      },
      entityCount: 4,
      updateInterval: 2000,
      useFixedTime: false,
    },
  },
  usa: {
    units: {
      distance: 'feet',
      speed: 'mph',
      altitude: 'feet',
      temperature: 'fahrenheit',
      pressure: 'inHg',
      coordinates: 'decimal',
    },
    dateTime: {
      locale: 'en-US',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      timezone: 'America/New_York',
      useRelativeTime: true,
      relativeTimeThreshold: 60,
    },
    mockData: {
      baseLocation: {
        latitude: 40.7128,
        longitude: -74.006,
        name: 'New York, NY',
      },
      entityCount: 4,
      updateInterval: 2000,
      useFixedTime: false,
    },
  },
  europe: {
    units: {
      distance: 'meters',
      speed: 'kmh',
      altitude: 'meters',
      temperature: 'celsius',
      pressure: 'hPa',
      coordinates: 'decimal',
    },
    dateTime: {
      locale: 'en-GB',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      timezone: 'Europe/London',
      useRelativeTime: true,
      relativeTimeThreshold: 60,
    },
    mockData: {
      baseLocation: {
        latitude: 51.5074,
        longitude: -0.1278,
        name: 'London, UK',
      },
      entityCount: 4,
      updateInterval: 2000,
      useFixedTime: false,
    },
  },
  international: {
    units: {
      distance: 'kilometers',
      speed: 'kmh',
      altitude: 'meters',
      temperature: 'celsius',
      pressure: 'hPa',
      coordinates: 'dms',
    },
    dateTime: {
      locale: 'en-US',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      timezone: 'UTC',
      useRelativeTime: false,
      relativeTimeThreshold: 0,
    },
    mockData: {
      baseLocation: {
        latitude: 35.6812,
        longitude: 139.7671,
        name: 'Tokyo, Japan',
      },
      entityCount: 4,
      updateInterval: 2000,
      useFixedTime: false,
    },
  },
}

// デフォルトアプリケーション設定
export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: 'default',
  name: 'デフォルト',
  ...APP_PRESETS.japan,
}
