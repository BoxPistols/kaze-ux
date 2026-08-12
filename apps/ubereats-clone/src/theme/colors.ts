/**
 * UberEats Clone ブランドカラー定数
 * Uber Eats Japan のデザインに準拠
 */
import { ON_SURFACE_INKS } from '@/themes/colorToken'
import {
  CONTRAST_THRESHOLD,
  bestContrast,
  ensureContrast,
} from '@/themes/contrast'

export const UE_GREEN = '#06C167'
export const UE_GREEN_DARK = '#048848'
export const UE_GREEN_LIGHT = 'rgba(6, 193, 103, 0.08)'
export const UE_BLACK = '#000000'
export const UE_BLACK_HOVER = '#282828'
export const UE_STAR = '#fbbf24'

/**
 * UE グリーンの塗り面に乗せる文字色。
 *
 * ブランドグリーンは明るく、白文字だと 2.38:1 しか出ない。ブランド色は
 * 変えられないため、文字側を実測で決める（墨なら 8:1 前後）。
 */
export const UE_ON_GREEN = bestContrast(UE_GREEN, ON_SURFACE_INKS)

/**
 * ワードマークとして面に置くグリーン。
 *
 * ブランドの #06C167 は白に対して 2.38:1 で、18.66px 以上の太字
 * （WCAG の「大きい文字」）に必要な 3:1 に届かない。
 * 一方でダークの paper (#27272a) の上では 6.26:1 出るので補正は要らない。
 * 面はモードで変わるため、置く面を渡して都度決める。
 */
const wordmarkCache = new Map<string, string>()

export const ueWordmarkColor = (surface: string): string => {
  const hit = wordmarkCache.get(surface)
  if (hit !== undefined) return hit
  const value = ensureContrast(UE_GREEN, surface, CONTRAST_THRESHOLD.largeText)
  wordmarkCache.set(surface, value)
  return value
}

/** 白地に置く場合の値（後方互換） */
export const UE_GREEN_ON_LIGHT = ueWordmarkColor('#FFFFFF')
