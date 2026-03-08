/**
 * LayerControlPanel - 制限区域レイヤーコントロールパネル
 *
 * map-auto-waypointスタイルの縦並びレイヤーコントロール
 * キーボードショートカット対応
 */

import FlightIcon from '@mui/icons-material/Flight'
import GroupsIcon from '@mui/icons-material/Groups'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import RadioIcon from '@mui/icons-material/Radio'
import SettingsIcon from '@mui/icons-material/Settings'
import ShieldIcon from '@mui/icons-material/Shield'
import WarningIcon from '@mui/icons-material/Warning'
import WifiIcon from '@mui/icons-material/Wifi'
import {
  Box,
  Checkbox,
  Paper,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useState, useCallback, useMemo } from 'react'

import type { LayerType, LayerVisibility } from '@/lib/map/hooks'
import { LAYER_INFO, LAYER_COLORS } from '@/lib/map/hooks'

export interface LayerControlPanelProps {
  /** レイヤー表示状態 */
  visibility: LayerVisibility
  /** レイヤー切り替えハンドラ */
  onToggleLayer: (layer: LayerType) => void
  /** 全レイヤー切り替えハンドラ */
  onToggleAllLayers?: () => void
  /** コンパクトモード */
  compact?: boolean
  /** 初期展開状態 */
  defaultExpanded?: boolean
  /** ショートカットキー表示 */
  showShortcuts?: boolean
  /** カスタムスタイル */
  sx?: object
}

// レイヤーの順序とアイコンを定義
const LAYER_CONFIG: {
  layer: LayerType
  icon: React.ReactNode
  activeColor: string
}[] = [
  {
    layer: 'did',
    icon: <GroupsIcon sx={{ fontSize: 18 }} />,
    activeColor: LAYER_COLORS.did.fill,
  },
  {
    layer: 'noFlyZones',
    icon: <ShieldIcon sx={{ fontSize: 18 }} />,
    activeColor: LAYER_COLORS.noFlyZones.red,
  },
  {
    layer: 'airports',
    icon: <FlightIcon sx={{ fontSize: 18 }} />,
    activeColor: LAYER_COLORS.airports.fill,
  },
  {
    layer: 'emergency',
    icon: <WarningIcon sx={{ fontSize: 18 }} />,
    activeColor: LAYER_COLORS.emergency.fill,
  },
  {
    layer: 'heliports',
    icon: <LocalHospitalIcon sx={{ fontSize: 18 }} />,
    activeColor: LAYER_COLORS.heliports.fill,
  },
  {
    layer: 'remoteId',
    icon: <WifiIcon sx={{ fontSize: 18 }} />,
    activeColor: LAYER_COLORS.remoteId.fill,
  },
  {
    layer: 'mannedAircraft',
    icon: <FlightIcon sx={{ fontSize: 18 }} />,
    activeColor: LAYER_COLORS.mannedAircraft.fill,
  },
  {
    layer: 'radioInterference',
    icon: <RadioIcon sx={{ fontSize: 18 }} />,
    activeColor: LAYER_COLORS.radioInterference.fill,
  },
]

/**
 * LayerControlPanel - map-auto-waypointスタイルのレイヤーコントロール
 */
export function LayerControlPanel({
  visibility,
  onToggleLayer,
  onToggleAllLayers,
  compact = false,
  defaultExpanded = true,
  sx,
}: LayerControlPanelProps) {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(defaultExpanded)

  // 表示中のレイヤー数
  const visibleCount = useMemo(
    () => Object.values(visibility).filter(Boolean).length,
    [visibility]
  )
  const totalCount = LAYER_CONFIG.length

  // 全レイヤー表示状態
  const allVisible = visibleCount === totalCount

  // レイヤートグル
  const handleToggle = useCallback(
    (layer: LayerType) => {
      onToggleLayer(layer)
    },
    [onToggleLayer]
  )

  // グラスモーフィズムスタイル
  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(15, 23, 42, 0.85)'
        : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 4px 24px rgba(0, 0, 0, 0.4)'
        : '0 4px 24px rgba(0, 0, 0, 0.1)',
  }

  // 縦並びコンパクト表示（map-auto-waypointスタイル）
  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          ...sx,
        }}>
        {/* ALLボタン */}
        {onToggleAllLayers && (
          <Tooltip title='全レイヤー [L]' placement='left' arrow>
            <Paper
              elevation={0}
              onClick={onToggleAllLayers}
              sx={{
                ...glassStyle,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                borderRadius: 1.5,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                },
              }}>
              <SettingsIcon
                sx={{
                  fontSize: 18,
                  color: allVisible
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
                }}
              />
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  color: allVisible
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
                }}>
                ALL
              </Typography>
              <Checkbox
                checked={allVisible}
                size='small'
                sx={{ p: 0, ml: 'auto' }}
                onClick={(e) => e.stopPropagation()}
                onChange={onToggleAllLayers}
              />
            </Paper>
          </Tooltip>
        )}

        {/* 各レイヤーボタン */}
        {LAYER_CONFIG.map(({ layer, icon, activeColor }) => {
          const info = LAYER_INFO[layer]
          const isVisible = visibility[layer]

          return (
            <Tooltip
              key={layer}
              title={`${info.label} [${info.shortcut}]`}
              placement='left'
              arrow>
              <Paper
                elevation={0}
                onClick={() => handleToggle(layer)}
                sx={{
                  ...glassStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1.5,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderLeft: isVisible
                    ? `3px solid ${activeColor}`
                    : '3px solid transparent',
                  '&:hover': {
                    bgcolor: alpha(activeColor, 0.1),
                  },
                }}>
                <Box sx={{ color: isVisible ? activeColor : 'text.secondary' }}>
                  {icon}
                </Box>
                <Typography
                  variant='body2'
                  sx={{
                    fontWeight: isVisible ? 600 : 400,
                    fontSize: '0.8rem',
                    color: isVisible ? 'text.primary' : 'text.secondary',
                    flex: 1,
                    whiteSpace: 'nowrap',
                  }}>
                  {info.label}
                </Typography>
                <Checkbox
                  checked={isVisible}
                  size='small'
                  sx={{ p: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleToggle(layer)}
                />
              </Paper>
            </Tooltip>
          )
        })}
      </Box>
    )
  }

  // 通常表示（展開可能パネル）
  return (
    <Paper
      elevation={0}
      sx={{
        ...glassStyle,
        borderRadius: 2,
        overflow: 'hidden',
        ...sx,
      }}>
      {/* ヘッダー */}
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          cursor: 'pointer',
          borderBottom: expanded
            ? `1px solid ${alpha(theme.palette.divider, 0.1)}`
            : 'none',
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          },
        }}>
        <SettingsIcon
          sx={{ fontSize: 18, color: theme.palette.primary.main }}
        />
        <Typography variant='body2' fontWeight={600}>
          レイヤー
        </Typography>
        <Typography
          variant='caption'
          sx={{
            ml: 'auto',
            px: 1,
            py: 0.25,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontWeight: 600,
          }}>
          {visibleCount}/{totalCount}
        </Typography>
      </Box>

      {/* レイヤーリスト */}
      {expanded && (
        <Box sx={{ p: 1 }}>
          {/* ALLトグル */}
          {onToggleAllLayers && (
            <Box
              onClick={onToggleAllLayers}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                px: 1,
                py: 0.5,
                mb: 0.5,
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}>
              <Typography
                variant='body2'
                sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                ALL
              </Typography>
              <Checkbox
                checked={allVisible}
                size='small'
                sx={{ p: 0, ml: 'auto' }}
                onClick={(e) => e.stopPropagation()}
                onChange={onToggleAllLayers}
              />
            </Box>
          )}

          {/* 各レイヤー */}
          {LAYER_CONFIG.map(({ layer, icon, activeColor }) => {
            const info = LAYER_INFO[layer]
            const isVisible = visibility[layer]

            return (
              <Box
                key={layer}
                onClick={() => handleToggle(layer)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: alpha(activeColor, 0.08),
                  },
                }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    bgcolor: isVisible ? activeColor : 'transparent',
                    border: `2px solid ${activeColor}`,
                  }}
                />
                <Box sx={{ color: isVisible ? activeColor : 'text.disabled' }}>
                  {icon}
                </Box>
                <Typography
                  variant='body2'
                  sx={{
                    fontSize: '0.8rem',
                    color: isVisible ? 'text.primary' : 'text.secondary',
                    flex: 1,
                  }}>
                  {info.label}
                </Typography>
                <Checkbox
                  checked={isVisible}
                  size='small'
                  sx={{ p: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleToggle(layer)}
                />
              </Box>
            )
          })}
        </Box>
      )}
    </Paper>
  )
}

export default LayerControlPanel
