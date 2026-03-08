import { Menu as MenuIcon } from '@mui/icons-material'
import {
  Box,
  Drawer,
  Stack,
  Divider,
  IconButton,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useEffect, useState } from 'react'

import { AccountMenu } from './accountMenu'
import { SIDEBAR_WIDTH } from './constants'
import { MenuCategory } from './menuCategory'
import { SidebarHeader } from './sidebarHeader'
import { groupMenuItemsByCategory } from './utils'

import type { MenuItem, AccountMenu as AccountMenuType } from './types'

/**
 * サイドバーコンポーネントのProps型定義
 */
export type SidebarProps = {
  /** サイドバーの開閉状態 */
  isOpen: boolean
  /** サイドバーを閉じるコールバック */
  onClose: () => void
  /** サイドバーの開閉を切り替えるコールバック */
  onToggle: () => void
  /** メニューアイテム配列（オプション） */
  menuItems?: MenuItem[]
  /** アプリケーション名（オプション） */
  appName?: string
  /** 現在のパス名（オプション） */
  pathname?: string
  /** デフォルトのURL（オプション） */
  defaultUrl?: string
  /** アカウントメニュー */
  accountMenu?: AccountMenuType
  /** タイトルの文字色（オプション） */
  titleColor?: string
  /** タイトルの背景色（オプション） */
  titleBackgroundColor?: string
}

export const Sidebar = ({
  isOpen,
  onClose,
  onToggle,
  menuItems = [],
  appName = 'SDPF Theme',
  pathname = '',
  defaultUrl = '/',
  accountMenu,
  titleColor,
  titleBackgroundColor,
}: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>(
    {}
  )
  const theme = useTheme()
  // desktopブレークポイントが未定義の場合は1920pxをフォールバックとして使用
  const desktopBreakpoint = theme.breakpoints.values.xl || 1920
  const isDesktop = useMediaQuery(`(min-width:${desktopBreakpoint}px)`, {
    // SSR時はデスクトップをデフォルトと仮定
    defaultMatches: true,
  })

  // 環境に応じたサイドバー幅を取得
  const openWidth = isDesktop
    ? SIDEBAR_WIDTH.desktop.open
    : SIDEBAR_WIDTH.laptop.open
  const closedWidth = isDesktop
    ? SIDEBAR_WIDTH.desktop.closed
    : SIDEBAR_WIDTH.laptop.closed

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }))
  }

  // サイドバーが閉じられた時に展開状態をリセット
  useEffect(() => {
    if (!isOpen) {
      setExpandedItems({})
    }
  }, [isOpen])

  const groupedMenuItems = groupMenuItemsByCategory(menuItems)
  const menuCategories = Object.entries(groupedMenuItems)

  return (
    <Drawer
      variant='permanent'
      open={isOpen}
      sx={{
        width: isOpen ? openWidth : closedWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: isOpen ? openWidth : closedWidth,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          backgroundColor: 'transparent',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRight: '1px solid',
          borderColor: 'divider',
          boxShadow: 2,
          position: 'relative',
          transform: 'none !important',
          height: '100vh',
          maxHeight: '100vh',
          transition: 'width 0.3s ease',
        },
      }}>
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: (theme) => `${theme.palette.background.paper}CC`,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          overflow: 'hidden',
        }}>
        {/* サイドバーヘッダー */}
        <SidebarHeader
          isOpen={isOpen}
          onClose={onClose}
          onToggle={onToggle}
          appName={appName}
          defaultUrl={defaultUrl}
          titleColor={titleColor}
          titleBackgroundColor={titleBackgroundColor}
        />

        {/* 折りたたみ時の開くボタン */}
        {!isOpen && onToggle && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                pt: 2,
                pb: 2,
                mt: 1,
                mb: 1,
              }}>
              <IconButton
                size='small'
                onClick={onToggle}
                aria-label='サイドバーを開く'
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}>
                <MenuIcon fontSize='small' />
              </IconButton>
            </Box>
            <Divider sx={{ mx: 2 }} />
          </>
        )}

        {/* メニューコンテンツエリア */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            py: 1,
            overflowX: 'hidden',
            minHeight: 0,
            justifyContent: 'space-between',
          }}>
          <Stack
            divider={<Divider sx={{ mx: 2 }} />}
            spacing={0}
            sx={{
              minHeight: 0,
              flex: 1,
              overflowY: 'auto',
            }}>
            {menuCategories.map(([category, items]) => (
              <MenuCategory
                key={category}
                category={category}
                items={items}
                isOpen={isOpen}
                onClose={onClose}
                expandedItems={expandedItems}
                onToggleExpanded={toggleExpanded}
                pathname={pathname}
              />
            ))}
          </Stack>
          {accountMenu && (
            <AccountMenu
              userName={accountMenu.userName}
              userEmail={accountMenu.userEmail}
              menuItems={accountMenu.menuItems}
              isOpen={isOpen}
            />
          )}
        </Box>
      </Box>
    </Drawer>
  )
}
