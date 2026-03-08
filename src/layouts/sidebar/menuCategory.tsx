import { Box, Typography, List } from '@mui/material'

import { MenuItemButton } from './menuItemButton'

import type { MenuItem } from './types'

/**
 * メニューカテゴリコンポーネントのProps型定義
 */
interface MenuCategoryProps {
  /** カテゴリ名 */
  category: string
  /** カテゴリ内のメニューアイテム */
  items: MenuItem[]
  /** サイドバーの開閉状態 */
  isOpen: boolean
  /** 閉じるコールバック */
  onClose: () => void
  /** 展開状態の管理オブジェクト */
  expandedItems: Record<string, boolean>
  /** 展開切り替えコールバック */
  onToggleExpanded: (itemId: string) => void
  /** 現在のパス */
  pathname: string
}

/**
 * メニューカテゴリコンポーネント
 * サイドバー内のメニューアイテムをカテゴリ別にグルーピングして表示する
 */
export const MenuCategory = ({
  category,
  items,
  isOpen,
  onClose,
  expandedItems,
  onToggleExpanded,
  pathname,
}: MenuCategoryProps) => {
  return (
    <Box>
      {/* カテゴリラベルタイトル（サイドバー展開時のみ表示） */}
      {isOpen && (
        <Typography
          variant='caption'
          color='text.secondary'
          fontWeight={700}
          sx={{
            display: 'block',
            px: 2.5,
            pt: 4,
            pb: 1,
            color: 'text.secondary',
          }}>
          {category}
        </Typography>
      )}
      {/* カテゴリ内のメニューアイテムリスト */}
      <List sx={{ py: 0, backgroundColor: 'transparent' }}>
        {items.map((item) => {
          // 現在のパスと一致するか、パスの開始部分と一致するかでアクティブ状態を判定
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          // サブメニューの有無をチェック
          const hasChildren = Boolean(item.children && item.children.length > 0)
          // 展開状態を取得
          const isExpanded = expandedItems[item.id]

          return (
            <Box key={item.id}>
              <MenuItemButton
                item={item}
                isActive={isActive}
                isOpen={isOpen}
                hasChildren={hasChildren}
                isExpanded={isExpanded}
                onClose={onClose}
                onToggleExpanded={onToggleExpanded}
              />

              {/* 子メニューの表示（展開時かつ子要素がある場合のみ） */}
              {hasChildren && isExpanded && (
                <List sx={{ pl: 4, py: 0, backgroundColor: 'transparent' }}>
                  {item.children?.map((childItem) => {
                    const childIsActive =
                      pathname === childItem.href ||
                      (childItem.href !== '/' &&
                        pathname.startsWith(childItem.href))

                    return (
                      <MenuItemButton
                        key={childItem.id}
                        item={childItem}
                        isActive={childIsActive}
                        isOpen={isOpen}
                        hasChildren={false}
                        isExpanded={false}
                        onClose={onClose}
                        onToggleExpanded={onToggleExpanded}
                      />
                    )
                  })}
                </List>
              )}
            </Box>
          )
        })}
      </List>
    </Box>
  )
}
