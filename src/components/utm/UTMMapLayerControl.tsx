import LayersIcon from '@mui/icons-material/Layers'
import {
  Box,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useCallback } from 'react'

import {
  MAP_LAYER_CONFIGS,
  MAP_LAYER_CATEGORY_LABELS,
} from '@/constants/utmLabels'
import type { MapLayerType, MapLayerCategory } from '@/types/utmTypes'

export interface UTMMapLayerControlProps {
  /** 現在のレイヤー表示状態 */
  layerState: Record<MapLayerType, boolean>
  /** レイヤー表示状態の変更ハンドラ */
  onLayerChange: (layerId: MapLayerType, enabled: boolean) => void
  /** 全レイヤー一括変更ハンドラ */
  onLayerBulkChange?: (layers: Record<MapLayerType, boolean>) => void
  /** コンパクト表示（折りたたみ） */
  compact?: boolean
  /** 初期表示状態 */
  defaultExpanded?: boolean
  /** カスタムスタイル */
  sx?: object
}

/**
 * UTMMapLayerControl - 地図レイヤー表示制御コンポーネント
 *
 * 禁止エリア、地理情報、天候情報、電波情報のレイヤー表示を
 * カテゴリごとにチェックボックスで制御するコンポーネント
 */
export const UTMMapLayerControl = ({
  layerState,
  onLayerChange,
  onLayerBulkChange,
  compact = false,
  defaultExpanded = true,
  sx,
}: UTMMapLayerControlProps) => {
  const theme = useTheme()
  const [expanded, setExpanded] = useState(defaultExpanded)

  // カテゴリごとにレイヤーをグループ化
  const layersByCategory = useMemo(() => {
    const grouped: Record<MapLayerCategory, typeof MAP_LAYER_CONFIGS> = {
      restricted_area: [],
      geographic: [],
      weather: [],
      signal: [],
    }

    MAP_LAYER_CONFIGS.forEach((config) => {
      grouped[config.category].push(config)
    })

    return grouped
  }, [])

  // カテゴリ全体のチェック状態を計算
  const getCategoryState = useCallback(
    (category: MapLayerCategory) => {
      const layers = layersByCategory[category]
      const enabledCount = layers.filter((l) => layerState[l.id]).length
      if (enabledCount === 0) return 'none'
      if (enabledCount === layers.length) return 'all'
      return 'partial'
    },
    [layersByCategory, layerState]
  )

  // カテゴリ全体のトグル
  const handleCategoryToggle = useCallback(
    (category: MapLayerCategory) => {
      const layers = layersByCategory[category]
      const currentState = getCategoryState(category)
      const newEnabled = currentState !== 'all'

      if (onLayerBulkChange) {
        const newState = { ...layerState }
        layers.forEach((l) => {
          newState[l.id] = newEnabled
        })
        onLayerBulkChange(newState)
      } else {
        layers.forEach((l) => {
          onLayerChange(l.id, newEnabled)
        })
      }
    },
    [
      layersByCategory,
      getCategoryState,
      layerState,
      onLayerBulkChange,
      onLayerChange,
    ]
  )

  // グラスモーフィズムスタイル
  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.85)'
        : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
        : '0 8px 32px rgba(0, 0, 0, 0.12)',
  }

  // カテゴリセクションのレンダリング
  const renderCategorySection = (
    category: MapLayerCategory,
    isLast: boolean
  ) => {
    const layers = layersByCategory[category]
    if (layers.length === 0) return null

    const categoryState = getCategoryState(category)

    return (
      <Box key={category}>
        {/* カテゴリヘッダー */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 0.5,
          }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={categoryState === 'all'}
                indeterminate={categoryState === 'partial'}
                onChange={() => handleCategoryToggle(category)}
                size='small'
                sx={{
                  p: 0.5,
                  '& .MuiSvgIcon-root': { fontSize: 18 },
                }}
              />
            }
            label={
              <Typography
                variant='caption'
                fontWeight={600}
                color='text.secondary'
                sx={{ letterSpacing: 0.5 }}>
                {MAP_LAYER_CATEGORY_LABELS[category]}
              </Typography>
            }
            sx={{ ml: 0, mr: 0 }}
          />
        </Box>

        {/* レイヤーリスト */}
        <Box sx={{ pl: 2 }}>
          {layers.map((config) => (
            <Box
              key={config.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                py: 0.25,
              }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={layerState[config.id] ?? config.enabled}
                    onChange={(e) => onLayerChange(config.id, e.target.checked)}
                    size='small'
                    sx={{
                      p: 0.5,
                      '& .MuiSvgIcon-root': { fontSize: 16 },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* 色インジケーター */}
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: 0.5,
                        bgcolor: alpha(config.color, config.opacity ?? 0.3),
                        border: `1.5px ${config.borderStyle ?? 'solid'} ${config.borderColor ?? config.color}`,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant='body2' sx={{ fontSize: '0.8125rem' }}>
                      {config.label}
                    </Typography>
                  </Box>
                }
                sx={{ ml: 0, mr: 0 }}
              />
            </Box>
          ))}
        </Box>

        {!isLast && <Divider sx={{ my: 1 }} />}
      </Box>
    )
  }

  // コンパクト表示（折りたたみアイコンのみ）
  if (compact) {
    return (
      <Box sx={sx}>
        <Tooltip title='レイヤー表示設定' arrow placement='left'>
          <IconButton
            onClick={() => setExpanded(!expanded)}
            sx={{
              ...glassStyle,
              borderRadius: 2,
              p: 1,
            }}>
            <LayersIcon
              sx={{
                fontSize: 20,
                color: expanded
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
              }}
            />
          </IconButton>
        </Tooltip>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}>
              <Paper
                elevation={0}
                sx={{
                  ...glassStyle,
                  mt: 1,
                  p: 1.5,
                  borderRadius: 2,
                  minWidth: 200,
                }}>
                {(
                  [
                    'restricted_area',
                    'geographic',
                    'weather',
                    'signal',
                  ] as MapLayerCategory[]
                ).map((category, index, arr) =>
                  renderCategorySection(category, index === arr.length - 1)
                )}
              </Paper>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    )
  }

  // 通常表示（パネル）
  return (
    <Paper elevation={0} sx={{ ...glassStyle, p: 2, borderRadius: 2, ...sx }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LayersIcon
            sx={{ fontSize: 18, color: theme.palette.primary.main }}
          />
          <Typography variant='subtitle2' fontWeight={600}>
            レイヤー表示設定
          </Typography>
        </Box>
        <IconButton
          size='small'
          onClick={() => setExpanded(!expanded)}
          sx={{
            p: 0.5,
            transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
            transition: 'transform 0.2s',
          }}>
          <Box
            component='span'
            sx={{
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderTop: `6px solid ${theme.palette.text.secondary}`,
            }}
          />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {(
          [
            'restricted_area',
            'geographic',
            'weather',
            'signal',
          ] as MapLayerCategory[]
        ).map((category, index, arr) =>
          renderCategorySection(category, index === arr.length - 1)
        )}
      </Collapse>
    </Paper>
  )
}

export default UTMMapLayerControl
