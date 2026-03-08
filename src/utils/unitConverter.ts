/**
 * 単位変換ユーティリティ
 * プロジェクト設定に基づいて計測値を変換・フォーマット
 */

import type {
  DistanceUnit,
  SpeedUnit,
  AltitudeUnit,
  TemperatureUnit,
  PressureUnit,
  CoordinateFormat,
  UnitSettings,
} from '../types/projectSettings'

// ============================================
// 変換定数
// ============================================

// 距離変換（メートル基準）
const DISTANCE_CONVERSIONS: Record<DistanceUnit, number> = {
  meters: 1,
  feet: 3.28084,
  kilometers: 0.001,
  miles: 0.000621371,
  nauticalMiles: 0.000539957,
}

// 距離単位のラベル
const DISTANCE_LABELS: Record<DistanceUnit, string> = {
  meters: 'm',
  feet: 'ft',
  kilometers: 'km',
  miles: 'mi',
  nauticalMiles: 'NM',
}

// 速度変換（m/s基準）
const SPEED_CONVERSIONS: Record<SpeedUnit, number> = {
  ms: 1,
  kmh: 3.6,
  mph: 2.23694,
  knots: 1.94384,
}

// 速度単位のラベル
const SPEED_LABELS: Record<SpeedUnit, string> = {
  ms: 'm/s',
  kmh: 'km/h',
  mph: 'mph',
  knots: 'kt',
}

// 高度変換（メートル基準）
const ALTITUDE_CONVERSIONS: Record<AltitudeUnit, number> = {
  meters: 1,
  feet: 3.28084,
}

// 高度単位のラベル
const ALTITUDE_LABELS: Record<AltitudeUnit, string> = {
  meters: 'm',
  feet: 'ft',
}

// 温度単位のラベル
const TEMPERATURE_LABELS: Record<TemperatureUnit, string> = {
  celsius: '°C',
  fahrenheit: '°F',
}

// 気圧単位のラベル
const PRESSURE_LABELS: Record<PressureUnit, string> = {
  hPa: 'hPa',
  inHg: 'inHg',
  mmHg: 'mmHg',
}

// ============================================
// 変換関数
// ============================================

/**
 * 距離を変換（メートルから指定単位へ）
 */
export const convertDistance = (meters: number, unit: DistanceUnit): number => {
  return meters * DISTANCE_CONVERSIONS[unit]
}

/**
 * 距離をフォーマット
 */
export const formatDistance = (
  meters: number,
  unit: DistanceUnit,
  decimals: number = 2
): string => {
  const value = convertDistance(meters, unit)
  const label = DISTANCE_LABELS[unit]

  if (unit === 'kilometers' || unit === 'miles' || unit === 'nauticalMiles') {
    return `${value.toFixed(decimals)} ${label}`
  }

  // メートルやフィートは大きな値の場合は小数点なし
  if (value >= 100) {
    return `${Math.round(value)} ${label}`
  }

  return `${value.toFixed(decimals)} ${label}`
}

/**
 * 速度を変換（m/sから指定単位へ）
 */
export const convertSpeed = (ms: number, unit: SpeedUnit): number => {
  return ms * SPEED_CONVERSIONS[unit]
}

/**
 * 速度をフォーマット
 */
export const formatSpeed = (
  ms: number,
  unit: SpeedUnit,
  decimals: number = 1
): string => {
  const value = convertSpeed(ms, unit)
  const label = SPEED_LABELS[unit]
  return `${value.toFixed(decimals)} ${label}`
}

/**
 * 高度を変換（メートルから指定単位へ）
 */
export const convertAltitude = (meters: number, unit: AltitudeUnit): number => {
  return meters * ALTITUDE_CONVERSIONS[unit]
}

/**
 * 高度をフォーマット
 */
export const formatAltitude = (
  meters: number,
  unit: AltitudeUnit,
  decimals: number = 0
): string => {
  const value = convertAltitude(meters, unit)
  const label = ALTITUDE_LABELS[unit]
  return `${value.toFixed(decimals)}${label}`
}

/**
 * 温度を変換（摂氏から指定単位へ）
 */
export const convertTemperature = (
  celsius: number,
  unit: TemperatureUnit
): number => {
  if (unit === 'fahrenheit') {
    return (celsius * 9) / 5 + 32
  }
  return celsius
}

/**
 * 温度をフォーマット
 */
export const formatTemperature = (
  celsius: number,
  unit: TemperatureUnit,
  decimals: number = 1
): string => {
  const value = convertTemperature(celsius, unit)
  const label = TEMPERATURE_LABELS[unit]
  return `${value.toFixed(decimals)}${label}`
}

/**
 * 気圧を変換（hPaから指定単位へ）
 */
export const convertPressure = (hPa: number, unit: PressureUnit): number => {
  switch (unit) {
    case 'inHg':
      return hPa * 0.02953
    case 'mmHg':
      return hPa * 0.750062
    default:
      return hPa
  }
}

/**
 * 気圧をフォーマット
 */
export const formatPressure = (
  hPa: number,
  unit: PressureUnit,
  decimals: number = 1
): string => {
  const value = convertPressure(hPa, unit)
  const label = PRESSURE_LABELS[unit]

  if (unit === 'hPa') {
    return `${Math.round(value)} ${label}`
  }

  return `${value.toFixed(decimals)} ${label}`
}

/**
 * 座標をフォーマット
 */
export const formatCoordinate = (
  latitude: number,
  longitude: number,
  format: CoordinateFormat
): { lat: string; lng: string; combined: string } => {
  switch (format) {
    case 'dms': {
      const latDMS = decimalToDMS(latitude, 'lat')
      const lngDMS = decimalToDMS(longitude, 'lng')
      return {
        lat: latDMS,
        lng: lngDMS,
        combined: `${latDMS}, ${lngDMS}`,
      }
    }
    case 'dmm': {
      const latDMM = decimalToDMM(latitude, 'lat')
      const lngDMM = decimalToDMM(longitude, 'lng')
      return {
        lat: latDMM,
        lng: lngDMM,
        combined: `${latDMM}, ${lngDMM}`,
      }
    }
    default: // decimal
      return {
        lat: latitude.toFixed(6),
        lng: longitude.toFixed(6),
        combined: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      }
  }
}

/**
 * 10進数を度分秒（DMS）形式に変換
 */
const decimalToDMS = (decimal: number, type: 'lat' | 'lng'): string => {
  const absolute = Math.abs(decimal)
  const degrees = Math.floor(absolute)
  const minutesNotTruncated = (absolute - degrees) * 60
  const minutes = Math.floor(minutesNotTruncated)
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(1)

  let direction: string
  if (type === 'lat') {
    direction = decimal >= 0 ? 'N' : 'S'
  } else {
    direction = decimal >= 0 ? 'E' : 'W'
  }

  return `${degrees}°${minutes}'${seconds}"${direction}`
}

/**
 * 10進数を度分（DMM）形式に変換
 */
const decimalToDMM = (decimal: number, type: 'lat' | 'lng'): string => {
  const absolute = Math.abs(decimal)
  const degrees = Math.floor(absolute)
  const minutes = ((absolute - degrees) * 60).toFixed(3)

  let direction: string
  if (type === 'lat') {
    direction = decimal >= 0 ? 'N' : 'S'
  } else {
    direction = decimal >= 0 ? 'E' : 'W'
  }

  return `${degrees}°${minutes}'${direction}`
}

// ============================================
// 単位設定を使用したフォーマッター
// ============================================

/**
 * UnitSettingsを使用した統合フォーマッター
 */
export const createUnitFormatter = (settings: UnitSettings) => {
  return {
    distance: (meters: number, decimals?: number) =>
      formatDistance(meters, settings.distance, decimals),
    speed: (ms: number, decimals?: number) =>
      formatSpeed(ms, settings.speed, decimals),
    altitude: (meters: number, decimals?: number) =>
      formatAltitude(meters, settings.altitude, decimals),
    temperature: (celsius: number, decimals?: number) =>
      formatTemperature(celsius, settings.temperature, decimals),
    pressure: (hPa: number, decimals?: number) =>
      formatPressure(hPa, settings.pressure, decimals),
    coordinate: (lat: number, lng: number) =>
      formatCoordinate(lat, lng, settings.coordinates),

    // 単位ラベルのみ取得
    labels: {
      distance: DISTANCE_LABELS[settings.distance],
      speed: SPEED_LABELS[settings.speed],
      altitude: ALTITUDE_LABELS[settings.altitude],
      temperature: TEMPERATURE_LABELS[settings.temperature],
      pressure: PRESSURE_LABELS[settings.pressure],
    },

    // 生の変換値を取得
    convert: {
      distance: (meters: number) => convertDistance(meters, settings.distance),
      speed: (ms: number) => convertSpeed(ms, settings.speed),
      altitude: (meters: number) => convertAltitude(meters, settings.altitude),
      temperature: (celsius: number) =>
        convertTemperature(celsius, settings.temperature),
      pressure: (hPa: number) => convertPressure(hPa, settings.pressure),
    },
  }
}

// ============================================
// 単位ラベルのエクスポート
// ============================================

export const unitLabels = {
  distance: DISTANCE_LABELS,
  speed: SPEED_LABELS,
  altitude: ALTITUDE_LABELS,
  temperature: TEMPERATURE_LABELS,
  pressure: PRESSURE_LABELS,
}
