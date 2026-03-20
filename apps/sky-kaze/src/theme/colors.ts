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
export const HUB_COLORS = {
  center: LOGI_ORANGE,
  warehouse: LOGI_TEAL,
  depot: '#8B5CF6',
  port: LOGI_BLUE,
} as const
