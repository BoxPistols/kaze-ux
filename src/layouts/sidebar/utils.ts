import type { MenuItem } from './types'

/**
 * メニューアイテムをカテゴリ別にグループ化するヘルパー関数
 */
export const groupMenuItemsByCategory = (
  items: MenuItem[]
): Record<string, MenuItem[]> => {
  return items.reduce(
    (groups, item) => {
      const category = item.category || 'DEFAULT'
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    },
    {} as Record<string, MenuItem[]>
  )
}
