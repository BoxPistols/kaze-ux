import Battery60Icon from '@mui/icons-material/Battery60'
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'
import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FlightIcon from '@mui/icons-material/Flight'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import SearchIcon from '@mui/icons-material/Search'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import {
  Box,
  Checkbox,
  Chip,
  InputAdornment,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useState, useMemo, useCallback } from 'react'

import { DRONE_STATUS_LABELS, DRONE_STATUS_COLORS } from '@/constants/utmLabels'
import { colors } from '@/styles/tokens'
import type { DroneFlightStatus } from '@/types/utmTypes'

export interface UTMDroneSelectorProps {
  /** 利用可能なドローン一覧 */
  drones: DroneFlightStatus[]
  /** 選択されたドローンID */
  selectedDroneIds: string[]
  /** 選択変更ハンドラ */
  onSelectionChange: (selectedIds: string[]) => void
  /** 選択上限（デフォルト: 10） */
  maxSelection?: number
  /** 単一選択モード */
  singleSelect?: boolean
  /** 高さ */
  height?: string | number
  /** タイトル */
  title?: string
  /** カスタムスタイル */
  sx?: object
}

// バッテリーアイコンの取得
const getBatteryIcon = (level: number) => {
  if (level > 60)
    return <BatteryFullIcon sx={{ color: colors.success.main, fontSize: 16 }} />
  if (level > 20)
    return <Battery60Icon sx={{ color: colors.warning.main, fontSize: 16 }} />
  return <BatteryAlertIcon sx={{ color: colors.error.main, fontSize: 16 }} />
}

// 信号強度アイコンの色
const getSignalColor = (strength: number) => {
  if (strength > 70) return colors.success.main
  if (strength > 40) return colors.warning.main
  return colors.error.main
}

/**
 * UTMDroneSelector - 機体選択コンポーネント
 *
 * モニタリング対象の機体を選択するためのコンポーネント
 * 最大10機まで選択可能（設定変更可能）
 */
export const UTMDroneSelector = ({
  drones,
  selectedDroneIds,
  onSelectionChange,
  maxSelection = 10,
  singleSelect = false,
  height = 400,
  title = 'モニタリング機体選択',
  sx,
}: UTMDroneSelectorProps) => {
  const theme = useTheme()
  const [searchQuery, setSearchQuery] = useState('')

  // 検索フィルタリング
  const filteredDrones = useMemo(() => {
    if (!searchQuery.trim()) return drones
    const query = searchQuery.toLowerCase()
    return drones.filter(
      (drone) =>
        drone.droneName.toLowerCase().includes(query) ||
        drone.droneId.toLowerCase().includes(query) ||
        drone.pilotName.toLowerCase().includes(query)
    )
  }, [drones, searchQuery])

  // 選択状態のチェック
  const isSelected = useCallback(
    (droneId: string) => selectedDroneIds.includes(droneId),
    [selectedDroneIds]
  )

  // 選択上限に達しているか
  const isAtLimit = selectedDroneIds.length >= maxSelection

  // ドローン選択/解除
  const handleToggle = useCallback(
    (droneId: string) => {
      if (singleSelect) {
        // 単一選択モード
        onSelectionChange([droneId])
        return
      }

      if (isSelected(droneId)) {
        // 選択解除
        onSelectionChange(selectedDroneIds.filter((id) => id !== droneId))
      } else if (!isAtLimit) {
        // 選択追加（上限未達の場合のみ）
        onSelectionChange([...selectedDroneIds, droneId])
      }
    },
    [singleSelect, isSelected, isAtLimit, selectedDroneIds, onSelectionChange]
  )

  // 全選択/全解除
  const handleSelectAll = useCallback(() => {
    if (selectedDroneIds.length === filteredDrones.length) {
      // 全解除
      onSelectionChange([])
    } else {
      // 全選択（上限まで）
      const idsToSelect = filteredDrones
        .slice(0, maxSelection)
        .map((d) => d.droneId)
      onSelectionChange(idsToSelect)
    }
  }, [selectedDroneIds, filteredDrones, maxSelection, onSelectionChange])

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

  return (
    <Paper elevation={0} sx={{ ...glassStyle, borderRadius: 2, ...sx }}>
      {/* ヘッダー */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlightIcon
              sx={{ fontSize: 18, color: theme.palette.primary.main }}
            />
            <Typography variant='subtitle2' fontWeight={600}>
              {title}
            </Typography>
          </Box>
          <Typography variant='caption' color='text.secondary'>
            {selectedDroneIds.length} / {maxSelection} 選択中
          </Typography>
        </Box>

        {/* 検索フィールド */}
        <TextField
          fullWidth
          size='small'
          placeholder='機体名、ID、パイロット名で検索...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: alpha(theme.palette.background.paper, 0.5),
            },
          }}
        />

        {/* 全選択ボタン */}
        {!singleSelect && filteredDrones.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Chip
              label={
                selectedDroneIds.length === filteredDrones.length
                  ? '全て解除'
                  : '全て選択'
              }
              size='small'
              onClick={handleSelectAll}
              sx={{
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          </Box>
        )}
      </Box>

      {/* ドローンリスト */}
      <List
        dense
        sx={{
          height,
          overflow: 'auto',
          py: 0,
        }}>
        {filteredDrones.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 3,
            }}>
            <Typography color='text.secondary' variant='body2'>
              {searchQuery
                ? '該当する機体が見つかりません'
                : '利用可能な機体がありません'}
            </Typography>
          </Box>
        ) : (
          filteredDrones.map((drone) => {
            const selected = isSelected(drone.droneId)
            const disabled = !selected && isAtLimit

            return (
              <ListItemButton
                key={drone.droneId}
                onClick={() => handleToggle(drone.droneId)}
                disabled={disabled}
                sx={{
                  py: 1,
                  px: 2,
                  bgcolor: selected
                    ? alpha(theme.palette.primary.main, 0.08)
                    : 'transparent',
                  '&:hover': {
                    bgcolor: selected
                      ? alpha(theme.palette.primary.main, 0.12)
                      : alpha(theme.palette.action.hover, 0.04),
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {singleSelect ? (
                    selected ? (
                      <CheckCircleIcon
                        sx={{ fontSize: 20, color: theme.palette.primary.main }}
                      />
                    ) : (
                      <RadioButtonUncheckedIcon
                        sx={{ fontSize: 20, color: 'text.secondary' }}
                      />
                    )
                  ) : (
                    <Checkbox
                      edge='start'
                      checked={selected}
                      disabled={disabled}
                      tabIndex={-1}
                      disableRipple
                      size='small'
                    />
                  )}
                </ListItemIcon>

                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}>
                      <Typography
                        variant='body2'
                        fontWeight={600}
                        sx={{
                          color: selected
                            ? theme.palette.primary.main
                            : 'text.primary',
                        }}>
                        {drone.droneName}
                      </Typography>
                      <Chip
                        label={DRONE_STATUS_LABELS[drone.status]}
                        size='small'
                        sx={{
                          height: 18,
                          fontSize: '0.65rem',
                          bgcolor: alpha(
                            DRONE_STATUS_COLORS[drone.status],
                            0.15
                          ),
                          color: DRONE_STATUS_COLORS[drone.status],
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mt: 0.5,
                      }}>
                      <Typography
                        variant='caption'
                        color='text.secondary'
                        sx={{ fontSize: '0.7rem' }}>
                        {drone.pilotName}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}>
                        {getBatteryIcon(drone.batteryLevel)}
                        <Typography
                          variant='caption'
                          sx={{
                            fontSize: '0.7rem',
                            color:
                              drone.batteryLevel > 60
                                ? colors.success.main
                                : drone.batteryLevel > 20
                                  ? colors.warning.main
                                  : colors.error.main,
                          }}>
                          {drone.batteryLevel}%
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}>
                        <SignalCellularAltIcon
                          sx={{
                            fontSize: 14,
                            color: getSignalColor(drone.signalStrength),
                          }}
                        />
                        <Typography
                          variant='caption'
                          sx={{
                            fontSize: '0.7rem',
                            color: getSignalColor(drone.signalStrength),
                          }}>
                          {drone.signalStrength}%
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItemButton>
            )
          })
        )}
      </List>

      {/* 選択上限警告 */}
      {isAtLimit && !singleSelect && (
        <Box
          sx={{
            p: 1.5,
            bgcolor: alpha(colors.warning.main, 0.1),
            borderTop: `1px solid ${alpha(colors.warning.main, 0.3)}`,
          }}>
          <Typography
            variant='caption'
            sx={{ color: colors.warning.dark, fontWeight: 500 }}>
            選択上限（{maxSelection}機）に達しています
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default UTMDroneSelector
