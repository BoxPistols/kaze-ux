import { Menu, Close } from '@mui/icons-material'
import { Fab, Tooltip, useMediaQuery } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material'

import { SIDEBAR_WIDTH } from './constants'

interface SidebarToggleProps {
  isOpen: boolean
  onToggle: () => void
  sx?: SxProps<Theme>
}

export const SidebarToggle = ({ isOpen, onToggle, sx }: SidebarToggleProps) => {
  const theme = useTheme()
  // desktopブレークポイントが未定義の場合は1920pxをフォールバックとして使用
  const desktopBreakpoint = theme.breakpoints.values.xl || 1920
  const isDesktop = useMediaQuery(`(min-width:${desktopBreakpoint}px)`)

  // 環境に応じたサイドバー幅を取得
  const openWidth = isDesktop
    ? SIDEBAR_WIDTH.desktop.open
    : SIDEBAR_WIDTH.laptop.open
  const closedWidth = isDesktop
    ? SIDEBAR_WIDTH.desktop.closed
    : SIDEBAR_WIDTH.laptop.closed

  return (
    <Tooltip
      title={isOpen ? 'サイドバーを閉じる' : 'サイドバーを開く'}
      placement='left'
      enterDelay={2000}
      leaveDelay={200}>
      <Fab
        size='small'
        onClick={onToggle}
        disableRipple
        sx={{
          position: 'fixed',
          top: 32,
          width: 40,
          height: 40,
          minWidth: 40,
          minHeight: 40,
          left: isOpen ? `${openWidth - 20}px` : `${closedWidth - 20}px`,
          zIndex: 1300,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1,
          transition: 'left 0.3s ease',
          ...sx,
        }}>
        {isOpen ? <Close /> : <Menu />}
      </Fab>
    </Tooltip>
  )
}
