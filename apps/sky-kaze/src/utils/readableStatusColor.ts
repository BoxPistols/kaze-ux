import { ensureContrast } from '@/themes/contrast'

/**
 * ステータス色を「置かれる面で読める明度」に補正する。
 *
 * STATUS_COLORS / DRIVER_STATUS_COLOR は Tailwind の 500 番台をそのまま
 * 使っており、状態を色で識別するには適しているが、文字色として暗いパネルに
 * 置くとコントラストが足りない（violet #8B5CF6 は 3.45:1、blue #3B82F6 は
 * 3.98:1）。かといって明るくすると、白背景のライトモードで今度は読めない。
 *
 * 面の明暗はモードで変わるため、パレット側を固定値で調整しても両立しない。
 * 使う時点で背景を渡し、色相・彩度を保ったまま明度だけ合わせる。
 *
 * @example
 * color: (theme) => readableStatusColor(STATUS_COLORS[s.status], theme.palette.mode)
 */

/**
 * ステータス色を置く面の実効背景。
 *
 * ダークは Card の実描画色 (#1E293B)、ライトは白。theme.palette.background
 * ではなく実測値を使うのは、sky-kaze のパネルが独自の背景を持つため。
 */
const PANEL_BACKGROUND = {
  dark: '#1E293B',
  light: '#FFFFFF',
} as const

export const readableStatusColor = (
  color: string,
  mode: 'light' | 'dark'
): string => ensureContrast(color, PANEL_BACKGROUND[mode])
