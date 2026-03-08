/**
 * ブレイクポイント設定
 * 最低解像度1366x768、推奨解像度1920x1080を基準とした設計
 */

// ブレイクポイント値の定義
export const breakpointValues = {
  mobile: 0, // 0-767px: スマートフォン（緊急時確認用、将来対応）
  tablet: 768, // 768-1365px: タブレット（将来対応、暫定でlaptopレイアウト流用）
  laptop: 1366, // 1366-1919px: ノートPC最小基準（メインターゲット）
  desktop: 1920, // 1920px以上: デスクトップ推奨環境（メインターゲット）
} as const

// ブレイクポイントキーの型定義
export type BreakpointKey = keyof typeof breakpointValues
export type BreakpointValue = (typeof breakpointValues)[BreakpointKey]

// コンテナ最大幅の型定義
export type ContainerMaxWidthVariant = 'standard' | 'narrow' | 'wide' | 'full'
export type ContainerMaxWidthValue = number | string
export type ContainerMaxWidth = Record<
  ContainerMaxWidthVariant,
  ContainerMaxWidthValue
>

// MUIのBreakpoints型拡張（TypeScript用）
declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    // デフォルトのMUIブレイクポイントを有効にする
    xs: true
    sm: true
    md: true
    lg: true
    xl: true
    // カスタムブレイクポイントを追加
    mobile: true
    tablet: true
    laptop: true
    desktop: true
  }

  // テーマにlayout設定を追加
  interface Theme {
    layout: {
      containerMaxWidth: ContainerMaxWidth
    }
  }

  interface ThemeOptions {
    layout?: {
      containerMaxWidth?: ContainerMaxWidth
    }
  }
}

// メディアクエリヘルパー関数
export const mediaQueries = {
  up: (key: BreakpointKey) => `@media (min-width: ${breakpointValues[key]}px)`,
  down: (key: BreakpointKey) => {
    const keys = Object.keys(breakpointValues) as BreakpointKey[]
    const index = keys.indexOf(key)
    if (index === 0) return '@media (max-width: 0px)' // mobileより小さいサイズはない
    const prevKey = keys[index - 1]
    return `@media (max-width: ${breakpointValues[prevKey] - 0.05}px)`
  },
  between: (start: BreakpointKey, end: BreakpointKey) =>
    `@media (min-width: ${breakpointValues[start]}px) and (max-width: ${breakpointValues[end] - 0.05}px)`,
  only: (key: BreakpointKey) => {
    const keys = Object.keys(breakpointValues) as BreakpointKey[]
    const index = keys.indexOf(key)
    if (index === keys.length - 1) {
      // 最後のブレイクポイントの場合
      return mediaQueries.up(key)
    }
    const nextKey = keys[index + 1]
    return mediaQueries.between(key, nextKey)
  },
}

// MUI用のブレイクポイント設定（MUIの標準キーを保持）
export const muiBreakpoints = {
  values: {
    // MUI標準キー（互換性維持）
    xs: breakpointValues.mobile, // 0px
    sm: 640, // Tailwindとの互換性
    md: breakpointValues.tablet, // 768px
    lg: breakpointValues.laptop, // 1366px
    xl: breakpointValues.desktop, // 1920px
    // カスタムキー
    ...breakpointValues,
  },
  unit: 'px',
  step: 5, // メディアクエリの境界値調整用
}

// Tailwind用のブレイクポイント設定
export const tailwindBreakpoints = {
  tablet: `${breakpointValues.tablet}px`,
  laptop: `${breakpointValues.laptop}px`,
  desktop: `${breakpointValues.desktop}px`,
}

// 推奨タッチターゲットサイズ
export const touchTargets = {
  // 最小推奨サイズ（グローブ着用時）
  minimum: 44,
  // 推奨サイズ（一般的な操作）
  recommended: 48,
  // 重要なアクション（緊急停止など）
  critical: 56,
}

/**
 * コンテナ最大幅の定義
 * レスポンシブレイアウトで使用する標準的な最大幅を提供
 */
export const containerMaxWidth: ContainerMaxWidth = {
  /** 標準コンテンツエリア（サイドバー付きページなど） */
  standard: 1280, // 1366と1920の両環境で快適に使える妥協点
  /** 狭いコンテンツエリア（フォーム、記事など） */
  narrow: 960, // 読みやすさ重視
  /** 広いコンテンツエリア（ダッシュボード、テーブルなど） */
  wide: 1600, // desktop環境でデータ表示に最適
  /** 全幅表示（マップ、フルスクリーンなど） */
  full: '100%',
} as const

/**
 * コンテナ最大幅を取得するユーティリティ関数
 * @param variant - 幅のバリエーション
 * @returns 対応する最大幅の値
 */
export const getContainerMaxWidth = (
  variant: ContainerMaxWidthVariant = 'standard'
): ContainerMaxWidthValue => {
  return containerMaxWidth[variant]
}

// レスポンシブフォントサイズ（視認性重視）
export const responsiveFontSizes = {
  mobile: {
    xs: 12,
    sm: 13,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
  },
  tablet: {
    xs: 13,
    sm: 14,
    base: 15,
    lg: 17,
    xl: 19,
    '2xl': 22,
  },
  desktop: {
    xs: 12,
    sm: 13,
    base: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
  },
}
