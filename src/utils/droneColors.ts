/**
 * ドローンIDから一意のカラーを生成するユーティリティ
 * - UTM画面内のマーカー / リスト / ウィジェット / パネル閉状態アイコン等で共通利用する
 * - 危険色（error/warning系）と競合しにくいパレットを採用
 */

import { darken } from '@mui/material/styles'

export type DroneColor = Readonly<{
  main: string
  dark: string
}>

// ドローン固有の色パレット（エラー・警告色を避ける）
const DRONE_COLORS: readonly DroneColor[] = [
  { main: '#3B82F6', dark: '#2563EB' }, // blue
  { main: '#8B5CF6', dark: '#7C3AED' }, // violet
  { main: '#06B6D4', dark: '#0891B2' }, // cyan
  { main: '#10B981', dark: '#059669' }, // emerald
  { main: '#6366F1', dark: '#4F46E5' }, // indigo
  { main: '#14B8A6', dark: '#0D9488' }, // teal
  { main: '#EC4899', dark: '#DB2777' }, // pink
  { main: '#F97316', dark: '#EA580C' }, // orange
]

const hashString = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0 // 32bit intに正規化
  }
  return hash
}

/**
 * ドローンIDから一意の色（main/dark）を取得
 */
export const getDroneColor = (droneId: string): DroneColor => {
  const hash = hashString(droneId)
  const index = Math.abs(hash) % DRONE_COLORS.length
  return DRONE_COLORS[index]
}

/**
 * 画面表示用のドローン色を取得する。
 * plannedRoute.color 等で色指定がある場合はそれを優先し、dark は自動生成する。
 */
export const getDroneDisplayColor = (
  droneId: string,
  preferredMain?: string | null
): DroneColor => {
  if (preferredMain) {
    return { main: preferredMain, dark: darken(preferredMain, 0.25) }
  }
  return getDroneColor(droneId)
}
