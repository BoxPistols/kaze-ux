/**
 * 信号強度表示用ユーティリティ
 * UTMコンポーネント全体で使用する統一信号強度表示関数群
 */

/** 信号状態レベル */
export type SignalLevel = 'excellent' | 'good' | 'fair' | 'weak' | 'offline'

/** 信号強度しきい値（%） */
export const SIGNAL_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  weak: 20,
} as const

/**
 * 信号強度から状態レベルを取得
 * @param strength - 信号強度（0-100）
 * @returns 信号状態レベル
 */
export const getSignalLevel = (strength: number): SignalLevel => {
  if (strength >= SIGNAL_THRESHOLDS.excellent) return 'excellent'
  if (strength >= SIGNAL_THRESHOLDS.good) return 'good'
  if (strength >= SIGNAL_THRESHOLDS.fair) return 'fair'
  if (strength >= SIGNAL_THRESHOLDS.weak) return 'weak'
  return 'offline'
}

/**
 * 信号強度に応じた色を取得
 * @param strength - 信号強度（0-100）
 * @returns hex形式のカラーコード
 */
export const getSignalColor = (strength: number): string => {
  const signalLevel = getSignalLevel(strength)
  switch (signalLevel) {
    case 'excellent':
      return '#22c55e' // green-500
    case 'good':
      return '#84cc16' // lime-500
    case 'fair':
      return '#eab308' // yellow-500
    case 'weak':
      return '#f97316' // orange-500
    case 'offline':
      return '#ef4444' // red-500
  }
}

/**
 * 信号強度に応じたMUIカラー名を取得
 * @param strength - 信号強度（0-100）
 * @returns MUIカラー名
 */
export const getSignalMuiColor = (
  strength: number
): 'success' | 'warning' | 'error' => {
  if (strength >= SIGNAL_THRESHOLDS.fair) return 'success'
  if (strength >= SIGNAL_THRESHOLDS.weak) return 'warning'
  return 'error'
}

/**
 * 信号強度に応じたアイコン名を取得
 * @param strength - 信号強度（0-100）
 * @returns MUI Iconsのアイコン名
 */
export const getSignalIconName = (
  strength: number
):
  | 'SignalCellular4Bar'
  | 'SignalCellular3Bar'
  | 'SignalCellular2Bar'
  | 'SignalCellular1Bar'
  | 'SignalCellularOff' => {
  if (strength >= SIGNAL_THRESHOLDS.excellent) return 'SignalCellular4Bar'
  if (strength >= SIGNAL_THRESHOLDS.good) return 'SignalCellular3Bar'
  if (strength >= SIGNAL_THRESHOLDS.fair) return 'SignalCellular2Bar'
  if (strength >= SIGNAL_THRESHOLDS.weak) return 'SignalCellular1Bar'
  return 'SignalCellularOff'
}

/**
 * 信号強度の警告メッセージを取得
 * @param strength - 信号強度（0-100）
 * @returns 警告メッセージ（問題なければnull）
 */
export const getSignalWarning = (strength: number): string | null => {
  if (strength < 10) {
    return '通信が非常に不安定です。接続断の可能性があります。'
  }
  if (strength < 20) {
    return '通信が不安定です。操作に遅延が発生する可能性があります。'
  }
  if (strength < 40) {
    return '信号強度が低下しています。'
  }
  return null
}

/**
 * 信号強度のラベルを取得
 * @param strength - 信号強度（0-100）
 * @returns 日本語ラベル
 */
export const getSignalLabel = (strength: number): string => {
  const signalLevel = getSignalLevel(strength)
  switch (signalLevel) {
    case 'excellent':
      return '非常に良好'
    case 'good':
      return '良好'
    case 'fair':
      return '普通'
    case 'weak':
      return '弱い'
    case 'offline':
      return 'オフライン'
  }
}
