import type { ReactNode } from 'react'

/**
 * メニューアイテムの型定義
 */
export type MenuItem = {
  /** メニューアイテムの一意識別子 */
  id: string
  /** 表示ラベル */
  label: string
  /** アイコンコンポーネント */
  icon: ReactNode
  /** リンク先URL */
  href: string
  /** サブメニューアイテム（オプション） */
  children?: MenuItem[]
  /** メニューカテゴリ（オプション） */
  category?: string
  /** 詳細説明（Tooltip用、オプション） */
  description?: string
}

/**
 * アカウントメニューアイテムの型定義
 */
export type AccountMenuItem = {
  id: string
  label: string
  icon: ReactNode
  onClick: () => void
}

/**
 * アカウントメニューの型定義
 */
export type AccountMenu = {
  userName?: string
  userEmail?: string
  menuItems?: AccountMenuItem[]
}
