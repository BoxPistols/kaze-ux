/**
 * KazeEats ブランドカラー定数
 *
 * フードデリバリーの一般的な配色（グリーンを主役に、墨の面をアクセントに置く）を
 * Kaze の実測ルールに載せたもの。
 *
 * 基準色はかつて実在サービスのブランドグリーンと同一値だったが、
 * デザインシステムとしては自前のブランドに閉じているべきなので置き換えた。
 * 現在の #0F8048 は白文字が 5.00:1 出るため、塗り面に白を乗せられる
 * （旧 #06C167 は 2.38:1 で、index.css が白文字を指定していたのは誤りだった）。
 */
import { ON_SURFACE_INKS } from '@/themes/colorToken'
import {
  CONTRAST_THRESHOLD,
  bestContrast,
  ensureContrast,
} from '@/themes/contrast'

export const KE_GREEN = '#0F8048'
/** 前景・hover 用に落とした段 */
export const KE_GREEN_DARK = '#0B5F35'
/** 面に薄く敷く tint（sx から直接使う） */
export const KE_GREEN_LIGHT = 'rgba(15, 128, 72, 0.08)'
export const KE_BLACK = '#000000'
export const KE_BLACK_HOVER = '#282828'
export const KE_STAR = '#fbbf24'

/**
 * ブランドグリーンの塗り面に乗せる文字色。
 *
 * 白固定にせず実測で決める。基準色を動かしても文字側が追従するため、
 * 「色を変えたらコントラストが割れていた」が起きない。
 */
export const KE_ON_GREEN = bestContrast(KE_GREEN, ON_SURFACE_INKS)

/**
 * ワードマークとして面に置くグリーン。
 *
 * 塗り面ではなく文字なので基準が変わる。18.66px 以上の太字（WCAG の
 * 「大きい文字」）に必要な 3:1 を、置く面ごとに満たす値を返す。
 * 面はモードで変わるため、置く面を渡して都度決める。
 *
 * ちょうど 3:1 で止めると余裕がゼロになる。基準色を #06C167 から
 * #0F8048 に変えたとき、暗い面 (#242424) での実測が 3.11:1 まで落ちた。
 * 「基準は満たすが読みづらい」状態なので、colorToken.ts と同じ 1.2 倍の
 * 余裕を持たせる。明るい面では元から余裕があり、値は変わらない。
 */
const WORDMARK_HEADROOM = 1.2

const wordmarkCache = new Map<string, string>()

export const keWordmarkColor = (surface: string): string => {
  const hit = wordmarkCache.get(surface)
  if (hit !== undefined) return hit
  const value = ensureContrast(
    KE_GREEN,
    surface,
    CONTRAST_THRESHOLD.largeText * WORDMARK_HEADROOM
  )
  wordmarkCache.set(surface, value)
  return value
}

/** 白地に置く場合の値（後方互換） */
export const KE_GREEN_ON_LIGHT = keWordmarkColor('#FFFFFF')
