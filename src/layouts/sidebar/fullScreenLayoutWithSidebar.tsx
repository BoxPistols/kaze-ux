import { Box, Drawer } from '@mui/material'
import { useLocation } from 'react-router-dom'

import { Sidebar, type SidebarProps } from './sidebar'
import { SidebarToggle } from './sidebarToggle'

export type FullScreenLayoutWithSidebarProps = {
  /** Drawerの開閉状態 */
  isOpen: boolean
  /** 閉じるコールバック */
  onClose: () => void
  /** メインコンテンツ */
  children: React.ReactNode
} & Required<
  Pick<SidebarProps, 'accountMenu' | 'menuItems' | 'appName' | 'defaultUrl'>
>

/**
 * フルスクリーンレイアウト（サイドバー付き）
 * プロジェクト詳細やフォームページで使用
 * Drawerでサイドバーをオーバーレイ表示
 */
export const FullScreenLayoutWithSidebar = ({
  children,
  isOpen,
  onClose,
  ...sidebarProps
}: FullScreenLayoutWithSidebarProps) => {
  const location = useLocation()
  const pathname = location.pathname || '/'

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Drawer
        anchor='left'
        open={isOpen}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            border: 'none',
          },
        }}>
        <Sidebar
          isOpen
          onClose={() => {}}
          onToggle={() => {}}
          pathname={pathname}
          {...sidebarProps}
        />
        <SidebarToggle isOpen onToggle={onClose} />
      </Drawer>
      {children}
    </Box>
  )
}
