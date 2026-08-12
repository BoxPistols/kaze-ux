import { composite, ensureContrast, parseColor } from '@/themes/contrast'

import { PANEL_SURFACE, PANEL_SURFACE_EMPHASIZED } from './panelStyles'

import { LOGI_NAVY } from '~/theme/colors'

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

/** パネルの下に敷かれている面。ダークは地図のネイビー、ライトは白 */
const BENEATH_PANEL = { dark: LOGI_NAVY, light: '#FFFFFF' } as const

const toHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`

/**
 * パネルの実効背景色。
 *
 * パネルは半透明 (`rgba(10, 15, 28, 0.92)`) なので、宣言値をそのまま
 * 背景として測ると実際の描画色と食い違う。下地に合成して solid に直す。
 * 標準と強調で不透明度が違うため、コントラストが不利になる標準側を基準にする。
 */
const effectiveBackground = (mode: 'light' | 'dark') =>
  toHex(
    composite(parseColor(PANEL_SURFACE[mode]), parseColor(BENEATH_PANEL[mode]))
  )

const PANEL_BACKGROUND = {
  dark: effectiveBackground('dark'),
  light: effectiveBackground('light'),
} as const

// 補正結果は color × mode の有限集合にしかならない。sx コールバックから
// 呼ばれるため再レンダーのたびに 100 回ループを回す可能性がある
const cache = new Map<string, string>()

export const readableStatusColor = (
  color: string,
  mode: 'light' | 'dark'
): string => {
  const key = `${mode}:${color}`
  const hit = cache.get(key)
  if (hit !== undefined) return hit
  const value = ensureContrast(color, PANEL_BACKGROUND[mode])
  cache.set(key, value)
  return value
}

/** 強調パネルの実効背景（監査・テスト用に公開する） */
export const PANEL_BACKGROUNDS = {
  standard: PANEL_BACKGROUND,
  emphasized: {
    dark: toHex(
      composite(
        parseColor(PANEL_SURFACE_EMPHASIZED.dark),
        parseColor(BENEATH_PANEL.dark)
      )
    ),
    light: toHex(
      composite(
        parseColor(PANEL_SURFACE_EMPHASIZED.light),
        parseColor(BENEATH_PANEL.light)
      )
    ),
  },
} as const

const tintCache = new Map<string, string>()

/**
 * 淡く色を敷いた面（Chip の `alpha(color, 0.12)` など）に置く文字色。
 *
 * `readableStatusColor` はフローティングパネルの面を基準にする。
 * Chip はその上にさらに自身の色を薄く敷くので、基準が一段ずれる。
 * 実際に描かれる面を合成してから測らないと、4.0:1 前後で止まる。
 */
export const readableOnTint = (
  color: string,
  surface: string,
  tintAlpha = 0.12
): string => {
  const key = `${surface}:${tintAlpha}:${color}`
  const hit = tintCache.get(key)
  if (hit !== undefined) return hit
  const tinted = toHex(
    composite({ ...parseColor(color), a: tintAlpha }, parseColor(surface))
  )
  const value = ensureContrast(color, tinted)
  tintCache.set(key, value)
  return value
}
