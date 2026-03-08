// src/components/ui/button/constants.ts
// ボタンコンポーネント共通の定数定義

/**
 * ボタンサイズに応じた最小幅（px）
 */
export const BUTTON_MIN_WIDTH = {
  small: 64,
  medium: 80,
  large: 96,
} as const

/**
 * ボタンサイズに応じた最小高さ（px）
 * 最小ヒットターゲット24px以上を確保
 */
export const BUTTON_MIN_HEIGHT = {
  small: 28,
  medium: 32,
  large: 40,
} as const

/**
 * ボタンサイズに応じたフォントサイズ（rem）
 * 1rem = 14px基準
 */
export const BUTTON_FONT_SIZE = {
  small: '0.86rem', // 約12px
  medium: '1rem', // 14px
  large: '1.14rem', // 約16px
} as const

/**
 * ボタンサイズに応じた垂直パディング（テーマspacing単位）
 */
export const BUTTON_PADDING_Y = {
  small: 0.375,
  medium: 0.5,
  large: 0.75,
} as const

/**
 * ボタンサイズに応じた水平パディング（テーマspacing単位）
 */
export const BUTTON_PADDING_X = {
  small: 1.5,
  medium: 2,
  large: 3,
} as const

/**
 * ローディングインジケーターサイズ（px）
 */
export const LOADING_INDICATOR_SIZE = {
  small: 12,
  medium: 14,
  large: 18,
} as const

/**
 * アイコンサイズ（rem）
 * 1rem = 14px基準
 * WCAG: アイコンは視認性のため最低16px推奨
 */
export const ICON_SIZE = {
  small: '1.29rem', // 約18px
  medium: '1.57rem', // 約22px
  large: '1.71rem', // 約24px
} as const

/**
 * IconButtonのヒットターゲットサイズ（px）
 * WCAG 2.5.8: タッチターゲットは最低44×44px推奨
 */
export const ICON_BUTTON_HIT_TARGET = {
  small: 44,
  medium: 44,
  large: 48,
} as const

/**
 * IconButtonのパディング（テーマspacing単位）
 */
export const ICON_BUTTON_PADDING = {
  small: 0.5,
  medium: 0.75,
  large: 1,
} as const

/**
 * 共通のトランジション設定
 */
export const BUTTON_TRANSITION = 'all 0.2s ease-in-out' as const

/**
 * 共通のボーダー半径（テーマspacing単位）
 */
export const BUTTON_BORDER_RADIUS = 1.5 as const

export type ButtonSize = 'small' | 'medium' | 'large'
