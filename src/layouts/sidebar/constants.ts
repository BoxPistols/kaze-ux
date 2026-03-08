import type { MenuItem } from './types'

/**
 * サイドバーの寸法設定（環境別）
 * レスポンシブ対応の値を使用
 */
export const SIDEBAR_WIDTH = {
  laptop: {
    open: 200, // 1366x768環境では最小幅に削減
    closed: 56, // アイコンのみ表示
  },
  desktop: {
    open: 240, // 1920x1080環境では通常幅
    closed: 56, // アイコンのみ表示
  },
} as const

/**
 * メニューカテゴリの定数定義
 */
export const MENU_CATEGORIES = {
  MAIN: 'MAIN MENU',
  ADMIN: 'ADMIN',
  ACCOUNT: 'ACCOUNT',
} as const

/**
 * デフォルトメニュー項目の設定
 */
export const defaultMenuItems: MenuItem[] = []

/**
 * メインコンテンツエリアのパディング設定
 * nextと同等のヘッダーレス設計
 */
export const MAIN_ELEMENT_PADDING_TOP_SPACING = 3
export const MAIN_ELEMENT_PADDING_BOTTOM_SPACING = 3

/**
 * コンテナの最大幅設定
 */
export const CONTAINER_MAX_WIDTH = {
  standard: 1280, // デフォルト、1366と1920の両環境で快適
  narrow: 960, // フォーム、記事など、読みやすさ重視
  wide: 1600, // ダッシュボード、テーブルなど、desktop環境で最適
  full: '100%', // マップ、フルスクリーンなど
} as const

export type ContainerMaxWidthVariant = keyof typeof CONTAINER_MAX_WIDTH
