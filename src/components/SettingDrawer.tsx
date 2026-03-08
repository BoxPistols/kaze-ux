// SettingDrawer.tsx
import { Box, Drawer } from '@mui/material'
import type { ReactNode } from 'react'

interface SettingDrawerProps {
  drawerOpen: boolean
  width?: number
  left?: number
  top?: number
  isOverlay?: boolean // 上から覆いかぶせるスタイルかどうか
  children: ReactNode
}

export const SettingDrawer = ({
  drawerOpen,
  children,
  width = 300,
  left = 0,
  top = 64,
  isOverlay = false,
}: SettingDrawerProps) => {
  return (
    <Drawer
      variant='persistent'
      anchor='left'
      open={drawerOpen}
      sx={{
        '& .MuiDrawer-paper': {
          position: isOverlay ? 'absolute' : 'fixed',
          width: width,
          height: 'auto',
          minHeight: '-webkit-fill-available',
          left: left,
          top: top,
          py: 8,
          px: 4,
          opacity: 0.9,
          transition: 'left 0.3s',
          ...(isOverlay && { zIndex: 200 }), // isOverlayの時のみzIndexを設定
        },
      }}>
      <Box sx={{ p: 3 }}>{children}</Box>
    </Drawer>
  )
}
