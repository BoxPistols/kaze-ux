/**
 * バッテリー表示用ユーティリティ
 * UTMコンポーネント全体で使用する統一バッテリー表示関数群
 */

/** バッテリー状態レベル */
export type BatteryLevel = 'excellent' | 'good' | 'medium' | 'low' | 'critical'

/** バッテリー状態しきい値（%） */
export const BATTERY_THRESHOLDS = {
  excellent: 80,
  good: 60,
  medium: 40,
  low: 20,
} as const

/**
 * バッテリー残量から状態レベルを取得
 * @param level - バッテリー残量（0-100）
 * @returns バッテリー状態レベル
 */
export const getBatteryLevel = (level: number): BatteryLevel => {
  if (level >= BATTERY_THRESHOLDS.excellent) return 'excellent'
  if (level >= BATTERY_THRESHOLDS.good) return 'good'
  if (level >= BATTERY_THRESHOLDS.medium) return 'medium'
  if (level >= BATTERY_THRESHOLDS.low) return 'low'
  return 'critical'
}

/**
 * バッテリー残量に応じた色を取得
 * @param level - バッテリー残量（0-100）
 * @returns hex形式のカラーコード
 */
export const getBatteryColor = (level: number): string => {
  const batteryLevel = getBatteryLevel(level)
  switch (batteryLevel) {
    case 'excellent':
      return '#22c55e' // green-500
    case 'good':
      return '#84cc16' // lime-500
    case 'medium':
      return '#eab308' // yellow-500
    case 'low':
      return '#f97316' // orange-500
    case 'critical':
      return '#ef4444' // red-500
  }
}

/**
 * バッテリー残量に応じたMUIカラー名を取得
 * @param level - バッテリー残量（0-100）
 * @returns MUIカラー名
 */
export const getBatteryMuiColor = (
  level: number
): 'success' | 'warning' | 'error' => {
  if (level >= BATTERY_THRESHOLDS.medium) return 'success'
  if (level >= BATTERY_THRESHOLDS.low) return 'warning'
  return 'error'
}

/**
 * バッテリー残量に応じたアイコン名を取得
 * @param level - バッテリー残量（0-100）
 * @returns MUI Iconsのアイコン名
 */
export const getBatteryIconName = (
  level: number
):
  | 'BatteryFull'
  | 'Battery80'
  | 'Battery60'
  | 'Battery30'
  | 'Battery20'
  | 'BatteryAlert' => {
  if (level >= 90) return 'BatteryFull'
  if (level >= 70) return 'Battery80'
  if (level >= 50) return 'Battery60'
  if (level >= 30) return 'Battery30'
  if (level >= 15) return 'Battery20'
  return 'BatteryAlert'
}

/**
 * バッテリー残量の警告メッセージを取得
 * @param level - バッテリー残量（0-100）
 * @returns 警告メッセージ（問題なければnull）
 */
export const getBatteryWarning = (level: number): string | null => {
  if (level < 10) {
    return 'バッテリー残量が非常に低下しています。即時帰還を推奨します。'
  }
  if (level < 20) {
    return 'バッテリー残量が低下しています。帰還を検討してください。'
  }
  if (level < 30) {
    return 'バッテリー残量に注意してください。'
  }
  return null
}

/**
 * バッテリー残量のラベルを取得
 * @param level - バッテリー残量（0-100）
 * @returns 日本語ラベル
 */
export const getBatteryLabel = (level: number): string => {
  const batteryLevel = getBatteryLevel(level)
  switch (batteryLevel) {
    case 'excellent':
      return '十分'
    case 'good':
      return '良好'
    case 'medium':
      return '普通'
    case 'low':
      return '低下'
    case 'critical':
      return '危険'
  }
}
