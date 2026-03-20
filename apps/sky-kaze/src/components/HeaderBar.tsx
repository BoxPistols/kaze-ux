/**
 * ヘッダーナビゲーション — タブ切替 + テーマ
 */
import AirIcon from '@mui/icons-material/Air'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import { Box, Typography, useMediaQuery } from '@mui/material'

import { IconButton } from '@/components/ui/icon-button'
import { useDevPorts } from '@/hooks/useDevPorts'
import { hookUseTheme } from '@/hooks/useTheme'

import { useSimulation } from '~/data/simulation'
import { LOGI_ORANGE } from '~/theme/colors'

type ViewMode = 'prepare' | 'monitor' | 'complete'
const TABS: { mode: ViewMode; label: string; desc: string }[] = [
  { mode: 'prepare', label: '出荷準備', desc: '荷物・伝票・車両' },
  { mode: 'monitor', label: 'ライブ監視', desc: 'マップ・追跡' },
  { mode: 'complete', label: '配送結果', desc: 'サマリー・履歴' },
]

export const HeaderBar = () => {
  const { mode: themeMode, setMode } = hookUseTheme()
  const isDark = themeMode === 'dark'
  const toggleMode = () => setMode(isDark ? 'light' : 'dark')
  const isMobile = useMediaQuery('(max-width:768px)')

  const viewMode = useSimulation((s) => s.viewMode)
  const setViewMode = useSimulation((s) => s.setViewMode)
  const { portStatus } = useDevPorts()

  return (
    <Box
      sx={{
        height: 56,
        display: 'flex',
        alignItems: 'center',
        px: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}>
      {/* ブランド */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mr: 3,
          flexShrink: 0,
        }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 2,
            bgcolor: LOGI_ORANGE,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <LocalShippingIcon
            sx={{ color: '#fff', fontSize: 20 }}
            aria-hidden='true'
          />
        </Box>
        {!isMobile && (
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '16px',
              letterSpacing: '-0.02em',
              color: 'text.primary',
            }}>
            Kaze
            <Box component='span' sx={{ color: LOGI_ORANGE }}>
              Logistics
            </Box>
          </Typography>
        )}
      </Box>

      {/* タブ */}
      <Box
        component='nav'
        aria-label='メインナビゲーション'
        sx={{ display: 'flex', gap: 0.5, flex: 1 }}>
        {TABS.map((tab) => {
          const active = viewMode === tab.mode
          return (
            <Box
              key={tab.mode}
              onClick={() => setViewMode(tab.mode)}
              role='button'
              tabIndex={0}
              aria-current={active ? 'page' : undefined}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') setViewMode(tab.mode)
              }}
              sx={{
                px: 2,
                py: 0.75,
                cursor: 'pointer',
                color: active ? 'text.primary' : 'text.secondary',
                position: 'relative',
                transition: 'color 0.15s ease',
                '&:hover': {
                  color: 'text.primary',
                },
                // 下部インジケーター（角丸なしの独立要素）
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -1,
                  left: 8,
                  right: 8,
                  height: 2,
                  bgcolor: active ? LOGI_ORANGE : 'transparent',
                  transition: 'background-color 0.15s ease',
                },
              }}>
              <Typography
                sx={{
                  fontSize: '15px',
                  fontWeight: active ? 700 : 500,
                  lineHeight: 1.3,
                }}>
                {tab.label}
              </Typography>
              {!isMobile && (
                <Typography
                  sx={{
                    fontSize: '13px',
                    opacity: active ? 0.85 : 0.6,
                    lineHeight: 1.2,
                  }}>
                  {tab.desc}
                </Typography>
              )}
            </Box>
          )
        })}
      </Box>

      {/* テーマ */}
      <IconButton
        onClick={toggleMode}
        tooltip={isDark ? 'ライトモード' : 'ダークモード'}
        size='small'>
        {isDark ? (
          <LightModeIcon sx={{ fontSize: 20 }} />
        ) : (
          <DarkModeIcon sx={{ fontSize: 20 }} />
        )}
      </IconButton>

      {/* Kaze Design System へ戻る */}
      <IconButton
        onClick={() => {
          const topInfo = portStatus?.top
          if (import.meta.env.DEV && topInfo?.alive) {
            const h = window.location.hostname
            const p = window.location.protocol
            window.open(`${p}//${h}:${topInfo.port}`, '_blank')
          } else {
            // 本番 or alive でなければ origin にフォールバック
            window.open(window.location.origin + '/', '_blank')
          }
        }}
        tooltip={
          import.meta.env.DEV
            ? portStatus?.top?.alive
              ? `Kaze Design System (:${portStatus.top.port})`
              : 'Kaze DS（未起動）'
            : 'Kaze Design System'
        }
        size='small'
        sx={{ color: 'text.secondary', '&:hover': { color: '#0EADB8' } }}>
        <AirIcon sx={{ fontSize: 20 }} />
      </IconButton>
    </Box>
  )
}
