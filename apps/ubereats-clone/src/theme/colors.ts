/**
 * UberEats Clone ブランドカラー定数
 * Uber Eats Japan のデザインに準拠
 */
import { bestContrast } from '@/themes/contrast'

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
export const UE_ON_GREEN = bestContrast(UE_GREEN, ['#ffffff', '#0A0A0A'])
