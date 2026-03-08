/** @jsxImportSource react */
import { Box } from '@mui/material'

import { LAYOUT_CONSTANTS } from '@/constants/layout'
import { Header } from '@/layouts/header'
import { SideNav } from '@/layouts/sideNav'

type LayoutProps = {
  open?: boolean
  onToggle?: () => void
  sideNavWidth?: number
  children?: React.ReactNode
}

const Layout = ({
  open = false,
  onToggle,
  sideNavWidth = LAYOUT_CONSTANTS.SIDEBAR.WIDTH_CLOSED,
  children,
}: LayoutProps) => {
  const handleToggle = onToggle || (() => console.log('Drawer toggled'))

  // サイドバーが開いているときの実際の幅を計算
  const actualSideNavWidth = open
    ? sideNavWidth
    : LAYOUT_CONSTANTS.SIDEBAR.WIDTH_CLOSED

  return (
    <Box className='flex'>
      <Header toggleDrawer={handleToggle} open={open} />
      <SideNav open={open} width={sideNavWidth} />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          // サイドナビの幅に応じてマージンを調整
          marginLeft: `${actualSideNavWidth}px`,
          // ヘッダーの高さに基づいてマージンを設定
          marginTop: `${LAYOUT_CONSTANTS.HEADER.HEIGHT}px`,
          transition: 'margin-left 0.3s ease-in-out',
          width: `calc(100% - ${actualSideNavWidth}px)`,
          height: `calc(100vh - ${LAYOUT_CONSTANTS.HEADER.HEIGHT}px)`,
          overflow: 'auto',
        }}>
        {children || (
          <Box
            sx={{
              p: 3,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            メインコンテンツエリア
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default Layout
