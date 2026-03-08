/**
 * RestrictionLegend - 制限区域凡例コンポーネント
 *
 * 飛行禁止区域、空港制限区域、DIDなどの色凡例を表示
 */

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Box, Paper, Typography, Tooltip, alpha, useTheme } from '@mui/material'

import type { LayerType, LayerVisibility } from '@/lib/map/hooks'
import { LAYER_INFO, LAYER_COLORS } from '@/lib/map/hooks'

export interface RestrictionLegendProps {
  /** 表示中のレイヤー（凡例に含める） */
  visibility?: Partial<LayerVisibility>
  /** 表示するレイヤーを明示的に指定 */
  layers?: LayerType[]
  /** コンパクトモード（説明非表示） */
  compact?: boolean
  /** 横並び表示 */
  horizontal?: boolean
  /** カスタムスタイル */
  sx?: object
}

// 凡例アイテムの詳細設定
const LEGEND_ITEMS: Array<{
  layer: LayerType
  colors: Array<{ label: string; color: string; opacity: number }>
}> = [
  {
    layer: 'noFlyZones',
    colors: [
      {
        label: '飛行禁止（レッド）',
        color: LAYER_COLORS.noFlyZones.red,
        opacity: 0.4,
      },
      {
        label: '要許可（イエロー）',
        color: LAYER_COLORS.noFlyZones.yellow,
        opacity: 0.3,
      },
    ],
  },
  {
    layer: 'airports',
    colors: [
      {
        label: '空港制限区域',
        color: LAYER_COLORS.airports.fill,
        opacity: 0.25,
      },
    ],
  },
  {
    layer: 'did',
    colors: [
      {
        label: 'DID（人口集中地区）',
        color: LAYER_COLORS.did.fill,
        opacity: 0.3,
      },
    ],
  },
  {
    layer: 'emergency',
    colors: [
      {
        label: '緊急用務空域',
        color: LAYER_COLORS.emergency.fill,
        opacity: 0.35,
      },
    ],
  },
  {
    layer: 'remoteId',
    colors: [
      {
        label: 'リモートID区域',
        color: LAYER_COLORS.remoteId.fill,
        opacity: 0.25,
      },
    ],
  },
  {
    layer: 'mannedAircraft',
    colors: [
      {
        label: '有人機発着',
        color: LAYER_COLORS.mannedAircraft.fill,
        opacity: 0.3,
      },
    ],
  },
  {
    layer: 'heliports',
    colors: [
      { label: 'ヘリポート', color: LAYER_COLORS.heliports.fill, opacity: 0.4 },
    ],
  },
  {
    layer: 'radioInterference',
    colors: [
      {
        label: '電波干渉区域',
        color: LAYER_COLORS.radioInterference.fill,
        opacity: 0.2,
      },
    ],
  },
]

/**
 * RestrictionLegend - 制限区域凡例
 */
export function RestrictionLegend({
  visibility,
  layers,
  compact = false,
  horizontal = false,
  sx,
}: RestrictionLegendProps) {
  const theme = useTheme()

  // 表示する凡例アイテムをフィルタ
  const visibleItems = LEGEND_ITEMS.filter((item) => {
    if (layers) {
      return layers.includes(item.layer)
    }
    if (visibility) {
      return visibility[item.layer]
    }
    return true
  })

  if (visibleItems.length === 0) {
    return null
  }

  // グラスモーフィズムスタイル
  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.85)'
        : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  }

  // 凡例アイテムのレンダリング
  const renderLegendItem = (
    label: string,
    color: string,
    opacity: number,
    description?: string
  ) => (
    <Box
      key={label}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: compact ? 0.25 : 0.5,
      }}>
      {/* 色ボックス */}
      <Box
        sx={{
          width: compact ? 14 : 18,
          height: compact ? 14 : 18,
          borderRadius: 0.5,
          bgcolor: alpha(color, opacity),
          border: `2px solid ${color}`,
          flexShrink: 0,
        }}
      />
      {/* ラベル */}
      <Typography
        variant={compact ? 'caption' : 'body2'}
        sx={{ fontSize: compact ? '0.7rem' : '0.8125rem' }}>
        {label}
      </Typography>
      {/* 説明（ツールチップ） */}
      {description && !compact && (
        <Tooltip title={description} arrow placement='right'>
          <InfoOutlinedIcon
            sx={{
              fontSize: 14,
              color: 'text.disabled',
              cursor: 'help',
            }}
          />
        </Tooltip>
      )}
    </Box>
  )

  return (
    <Paper
      elevation={0}
      sx={{
        ...glassStyle,
        p: compact ? 1 : 1.5,
        borderRadius: 2,
        ...sx,
      }}>
      {/* ヘッダー */}
      {!compact && (
        <Typography
          variant='caption'
          fontWeight={600}
          color='text.secondary'
          sx={{ mb: 1, display: 'block', letterSpacing: 0.5 }}>
          凡例
        </Typography>
      )}

      {/* 凡例リスト */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: horizontal ? 'row' : 'column',
          flexWrap: horizontal ? 'wrap' : 'nowrap',
          gap: horizontal ? 2 : 0,
        }}>
        {visibleItems.flatMap((item) =>
          item.colors.map((colorItem) =>
            renderLegendItem(
              colorItem.label,
              colorItem.color,
              colorItem.opacity,
              LAYER_INFO[item.layer].description
            )
          )
        )}
      </Box>
    </Paper>
  )
}

export default RestrictionLegend
