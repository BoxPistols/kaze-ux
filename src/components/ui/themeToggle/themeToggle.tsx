// src/components/ui/themeToggle/themeToggle.tsx
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import { IconButton, Tooltip } from '@mui/material'

import { useTheme } from '@/hooks/useTheme'

/**
 * テーマ切り替えボタンコンポーネント
 * 右上に固定表示されるライト/ダークモード切り替えボタン
 */
export const ThemeToggle = () => {
  const { mode, setMode } = useTheme()

  // システムのカラースキーム設定を一度だけ取得して再利用
  const prefersDarkMediaQuery = window.matchMedia(
    '(prefers-color-scheme: dark)'
  )

  const handleToggle = () => {
    // light <-> dark を切り替え（systemは除外）
    if (mode === 'light') {
      setMode('dark')
    } else if (mode === 'dark') {
      setMode('light')
    } else {
      // systemの場合は現在のシステム設定に基づいて切り替え
      const prefersDark = prefersDarkMediaQuery.matches
      setMode(prefersDark ? 'light' : 'dark')
    }
  }

  // 現在のモードに応じたアイコンとツールチップを決定
  const isDark =
    mode === 'dark' || (mode === 'system' && prefersDarkMediaQuery.matches)
  const tooltipText = isDark
    ? 'ライトモードに切り替え'
    : 'ダークモードに切り替え'

  return (
    <Tooltip title={tooltipText} placement='left' enterDelay={500}>
      <IconButton
        size='small'
        onClick={handleToggle}
        aria-label={tooltipText}
        sx={{
          position: 'fixed',
          top: 4,
          right: 4,
          zIndex: 1300,
          width: 32,
          height: 32,
          minWidth: 32,
          padding: 0.5,
          backgroundColor: 'background.paper',
          color: 'text.primary',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 1,
          '&:hover': {
            backgroundColor: 'action.hover',
            boxShadow: 2,
          },
          transition: 'all 0.2s ease',
          '& .MuiSvgIcon-root': {
            fontSize: '1.125rem',
          },
        }}>
        {isDark ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  )
}
