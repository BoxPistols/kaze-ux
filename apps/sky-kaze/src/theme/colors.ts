import { CONTRAST_THRESHOLD, ensureContrast } from '@/themes/contrast'

/**
 * KazeLogistics ブランドカラー定数
 * 物流業界推奨パレット: Blue(信頼) + Orange(アクション/追跡) + Green(配送完了)
 */

// ブランドプライマリ — ネイビー系
export const LOGI_NAVY = '#0F172A'
export const LOGI_NAVY_LIGHT = '#1E293B'

// アクション — オレンジ（追跡・CTA）
export const LOGI_ORANGE = '#F97316'
export const LOGI_ORANGE_DARK = '#EA580C'
export const LOGI_ORANGE_LIGHT = 'rgba(249, 115, 22, 0.08)'

// 信頼 — ブルー（プライマリUI）
export const LOGI_BLUE = '#3B82F6'
export const LOGI_BLUE_DARK = '#2563EB'
export const LOGI_BLUE_LIGHT = 'rgba(59, 130, 246, 0.08)'

// 配送完了 — グリーン
export const LOGI_GREEN = '#22C55E'
export const LOGI_GREEN_DARK = '#16A34A'

// ティール — 中継拠点
export const LOGI_TEAL = '#0D9488'

// 警告
export const LOGI_AMBER = '#F59E0B'
export const LOGI_ROSE = '#FB7185'

// 拠点タイプごとのカラーマップ
import type { Hub } from '~/data/logistics'

export const HUB_COLORS: Record<Hub['type'], string> = {
  center: LOGI_ORANGE,
  warehouse: LOGI_TEAL,
  depot: '#8B5CF6',
  port: LOGI_BLUE,
} as const

/**
 * ブランド色を「前景」として置くときの補正。
 *
 * LOGI_* は Tailwind の 500 番台で、塗り面としては成立するが、
 * 文字やアイコンとして白い面に置くと届かない
 * （LOGI_ORANGE #F97316 は白地で 2.8:1、LOGI_AMBER は 2.15:1）。
 * ブランド色は変えられないので、色相・彩度を保ったまま明度だけ寄せる。
 *
 * @param target 本文は 4.5、24px 以上の文字とアイコンは 3
 */
const FOREGROUND_SURFACE = { light: '#FFFFFF', dark: LOGI_NAVY_LIGHT } as const

const foregroundCache = new Map<string, string>()

export const logiForeground = (
  color: string,
  mode: 'light' | 'dark',
  target: number = CONTRAST_THRESHOLD.text
): string => {
  const key = `${mode}:${target}:${color}`
  const hit = foregroundCache.get(key)
  if (hit !== undefined) return hit
  const value = ensureContrast(color, FOREGROUND_SURFACE[mode], target)
  foregroundCache.set(key, value)
  return value
}

/** 24px 以上の文字・アイコン用（WCAG の UI / 大きい文字は 3:1） */
export const logiForegroundLarge = (color: string, mode: 'light' | 'dark') =>
  logiForeground(color, mode, CONTRAST_THRESHOLD.largeText)
