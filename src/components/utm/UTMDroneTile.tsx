'use client'

import {
  MoreHoriz as MoreIcon,
  Home as HomeIcon,
  NavigateNext as NextIcon,
  NavigateBefore as PrevIcon,
  Error as ErrorIcon,
  SignalCellular4Bar as SignalIcon,
  Battery80 as BatteryIcon,
} from '@mui/icons-material'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Select,
  MenuItem,
  FormControl,
  Tooltip,
  Badge,
} from '@mui/material'
import { motion } from 'framer-motion'
import { useMemo, memo } from 'react'

import { useProjectSettingsOptional } from '@/contexts/ProjectSettingsContext'

import type { DroneFlightStatus, UTMAlert } from '../../types/utmTypes'

// 時間フォーマット（HH:MM:SS形式）
const formatFlightTime = (startTime: Date): string => {
  const now = new Date()
  const diffMs = now.getTime() - startTime.getTime()
  const hours = Math.floor(diffMs / 3600000)
  const minutes = Math.floor((diffMs % 3600000) / 60000)
  const seconds = Math.floor((diffMs % 60000) / 1000)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

// 飛行モードの日本語表示
const getFlightModeLabel = (mode: DroneFlightStatus['flightMode']): string => {
  const labels: Record<DroneFlightStatus['flightMode'], string> = {
    manual: 'マニュアル飛行',
    auto: 'オート飛行',
    rth: 'RTH',
    hover: 'ホバリング',
    landing: '着陸中',
  }
  return labels[mode]
}

// ステータスの日本語表示
const getStatusLabel = (status: DroneFlightStatus['status']): string => {
  const labels: Record<DroneFlightStatus['status'], string> = {
    preflight: '飛行前',
    takeoff: '離陸中',
    in_flight: '飛行中',
    landing: '着陸中',
    landed: '着陸済',
    emergency: '緊急',
    rth: '帰還中',
    hovering: 'ホバリング',
  }
  return labels[status]
}

// ステータスの色
const getStatusColor = (
  status: DroneFlightStatus['status']
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'in_flight':
      return 'success'
    case 'emergency':
      return 'error'
    case 'takeoff':
    case 'rth':
    case 'landing':
    case 'hovering':
      return 'warning'
    case 'preflight':
      return 'default'
    default:
      return 'info'
  }
}

export interface UTMDroneTileProps {
  // ドローン情報
  drone: DroneFlightStatus
  // 関連アラート
  alerts?: UTMAlert[]
  // FPV映像URL（オプション）
  fpvStreamUrl?: string
  // 選択状態
  isSelected?: boolean
  // クリック時のコールバック
  onClick?: () => void
  // ホームボタンクリック時のコールバック
  onHomeClick?: () => void
  // 前後のドローン切り替えコールバック
  onPrevious?: () => void
  onNext?: () => void
  // メニュークリックコールバック
  onMenuClick?: () => void
  // カメラモード切り替え
  cameraMode?: 'Main' | 'Thermal' | 'Zoom'
  onCameraModeChange?: (mode: 'Main' | 'Thermal' | 'Zoom') => void
  // 次のウェイポイント番号
  nextWaypoint?: number
  // 次のウェイポイントまでの距離（メートル）
  distanceToNextWP?: number
  // RTK情報
  rtkInfo?: {
    voltage: number
    current: number
  }
  // 高度バー表示
  showAltitudeBar?: boolean
  // ドローン固有のカラー（選択時ボーダー等に使用）
  droneColor?: string
}

// メモ化されたドローンタイルコンポーネント
const UTMDroneTileComponent = ({
  drone,
  alerts = [],
  fpvStreamUrl,
  isSelected = false,
  onClick,
  onHomeClick,
  onPrevious,
  onNext,
  onMenuClick,
  cameraMode = 'Main',
  onCameraModeChange,
  nextWaypoint,
  distanceToNextWP,
  rtkInfo,
  showAltitudeBar = true,
  droneColor,
}: UTMDroneTileProps) => {
  const { formatters, settings } = useProjectSettingsOptional()

  // 未確認アラート数
  const unacknowledgedAlertCount = useMemo(() => {
    return alerts.filter((a) => !a.acknowledged).length
  }, [alerts])

  // 緊急アラートがあるか
  const hasEmergencyAlert = useMemo(() => {
    return alerts.some(
      (a) =>
        !a.acknowledged &&
        (a.severity === 'emergency' || a.severity === 'critical')
    )
  }, [alerts])

  // エラー状態かどうか
  const hasError = drone.status === 'emergency' || hasEmergencyAlert

  // バッテリーの色
  const getBatteryColor = (level: number): string => {
    if (level <= 20) return '#ef4444' // red
    if (level <= 50) return '#f59e0b' // amber
    return '#22c55e' // green
  }

  // 信号強度の色
  const getSignalColor = (strength: number): string => {
    if (strength <= 30) return '#ef4444'
    if (strength <= 60) return '#f59e0b'
    return '#22c55e'
  }

  return (
    <Paper
      component={motion.div}
      whileHover={{ scale: 1.005 }}
      elevation={isSelected ? 8 : 0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'grey.900',
        color: 'white',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 0,
        border: isSelected ? 2 : 0,
        borderColor: droneColor || 'primary.main',
        cursor: onClick ? 'pointer' : 'default',
        animation: hasEmergencyAlert ? 'pulse-border 1s infinite' : 'none',
        '@keyframes pulse-border': {
          '0%, 100%': { borderColor: 'error.main' },
          '50%': { borderColor: 'error.light' },
        },
      }}
      onClick={onClick}>
      {/* ヘッダー部分 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1,
          py: 0.5,
          bgcolor: hasError ? 'error.dark' : 'grey.800',
        }}>
        {/* 左側: ドローン名とアラートバッジ */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Badge
            badgeContent={unacknowledgedAlertCount}
            color='error'
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.65rem',
                minWidth: 16,
                height: 16,
              },
            }}>
            <Typography
              variant='body2'
              fontWeight='bold'
              sx={{
                bgcolor: hasError ? 'error.main' : 'primary.main',
                px: 1,
                py: 0.25,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}>
              {drone.droneName}
              {hasError && <ErrorIcon sx={{ fontSize: 14 }} />}
            </Typography>
          </Badge>
          <IconButton
            size='small'
            onClick={onPrevious}
            sx={{ color: 'white', p: 0.25 }}>
            <PrevIcon fontSize='small' />
          </IconButton>
        </Box>

        {/* 中央: カメラモード選択 */}
        <FormControl size='small' sx={{ minWidth: 80 }}>
          <Select
            value={cameraMode}
            onChange={(e) =>
              onCameraModeChange?.(
                e.target.value as 'Main' | 'Thermal' | 'Zoom'
              )
            }
            sx={{
              color: 'white',
              bgcolor: 'grey.700',
              fontSize: '0.75rem',
              height: 24,
              '& .MuiSelect-icon': { color: 'white' },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            }}>
            <MenuItem value='Main'>Main</MenuItem>
            <MenuItem value='Thermal'>Thermal</MenuItem>
            <MenuItem value='Zoom'>Zoom</MenuItem>
          </Select>
        </FormControl>

        {/* 右側: ホームボタンとメニュー */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size='small'
            onClick={onMenuClick}
            sx={{ color: 'white', p: 0.25 }}>
            <MoreIcon fontSize='small' />
          </IconButton>
          <Tooltip title='ホームポイントへ帰還'>
            <IconButton
              size='small'
              onClick={(e) => {
                e.stopPropagation()
                onHomeClick?.()
              }}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                p: 0.5,
                '&:hover': { bgcolor: 'primary.dark' },
              }}>
              <HomeIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <IconButton
            size='small'
            onClick={onNext}
            sx={{ color: 'white', p: 0.25 }}>
            <NextIcon fontSize='small' />
          </IconButton>
        </Box>
      </Box>

      {/* メインコンテンツ: FPV映像エリア */}
      <Box
        sx={{
          position: 'relative',
          flex: 1,
          minHeight: 120,
          bgcolor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {fpvStreamUrl ? (
          <Box
            component='video'
            src={fpvStreamUrl}
            autoPlay
            muted
            loop
            playsInline
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Typography variant='caption' color='grey.600'>
            FPV映像なし
          </Typography>
        )}

        {/* 高度バー（右側） */}
        {showAltitudeBar && (
          <Box
            sx={{
              position: 'absolute',
              right: 4,
              top: 8,
              bottom: 8,
              width: 28,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              bgcolor: 'rgba(0,0,0,0.5)',
              borderRadius: 1,
              py: 0.5,
            }}>
            <Typography
              variant='caption'
              sx={{ fontSize: '0.625rem', color: 'grey.400' }}>
              {formatters.units.altitude(drone.position.altitude + 20, 0)}
            </Typography>
            <Box
              sx={{
                flex: 1,
                width: 4,
                bgcolor: 'grey.700',
                borderRadius: 0.5,
                position: 'relative',
                my: 0.5,
              }}>
              <Box
                sx={{
                  position: 'absolute',
                  bottom: `${Math.min(100, (drone.position.altitude / 150) * 100)}%`,
                  left: -4,
                  right: -4,
                  height: 2,
                  bgcolor: 'primary.main',
                }}
              />
            </Box>
            <Typography
              variant='caption'
              sx={{ fontSize: '0.625rem', color: 'grey.400' }}>
              {settings.units.altitude === 'feet' ? '0ft' : '0m'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* テレメトリ情報 */}
      <Box sx={{ px: 1, py: 0.75, bgcolor: 'grey.900' }}>
        {/* 上段: 飛行時間とモード */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5,
          }}>
          <Typography
            variant='h6'
            fontWeight='bold'
            sx={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>
            {formatFlightTime(drone.startTime)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant='caption' color='grey.400'>
              {getFlightModeLabel(drone.flightMode)}
            </Typography>
          </Box>
        </Box>

        {/* ステータス表示 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
          <Chip
            size='small'
            label={getStatusLabel(drone.status)}
            color={getStatusColor(drone.status)}
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>

        {/* 下段: バッテリー、RTK、速度、WP情報 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 0.5,
            fontSize: '0.7rem',
          }}>
          {/* バッテリー */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.25,
                mb: 0.25,
              }}>
              <BatteryIcon
                sx={{
                  fontSize: 14,
                  color: getBatteryColor(drone.batteryLevel),
                }}
              />
              <Typography
                variant='caption'
                sx={{
                  color: getBatteryColor(drone.batteryLevel),
                  fontWeight: 'bold',
                }}>
                {Math.round(drone.batteryLevel)}%
              </Typography>
            </Box>
            <LinearProgress
              variant='determinate'
              value={drone.batteryLevel}
              sx={{
                height: 3,
                borderRadius: 1,
                bgcolor: 'grey.700',
                '& .MuiLinearProgress-bar': {
                  bgcolor: getBatteryColor(drone.batteryLevel),
                },
              }}
            />
          </Box>

          {/* RTK情報 */}
          <Box>
            <Typography
              variant='caption'
              color='grey.500'
              sx={{ fontSize: '0.625rem' }}>
              RTK
            </Typography>
            <Typography
              variant='caption'
              sx={{ display: 'block', fontFamily: 'monospace' }}>
              {rtkInfo ? `${rtkInfo.voltage.toFixed(1)}V` : '46.8V'}
            </Typography>
            <Typography
              variant='caption'
              color='grey.500'
              sx={{ fontFamily: 'monospace' }}>
              {rtkInfo ? `${rtkInfo.current.toFixed(1)}A` : '30.0A'}
            </Typography>
          </Box>

          {/* 速度 */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <SignalIcon
                sx={{
                  fontSize: 12,
                  color: getSignalColor(drone.signalStrength),
                }}
              />
            </Box>
            <Typography
              variant='caption'
              sx={{ display: 'block', fontFamily: 'monospace' }}>
              {formatters.units.speed(drone.position.speed, 1)}
            </Typography>
          </Box>

          {/* 次のWPまでの距離 */}
          <Box>
            <Typography
              variant='caption'
              color='grey.500'
              sx={{ fontSize: '0.625rem' }}>
              次のWP: {nextWaypoint ?? '-'}
            </Typography>
            <Typography
              variant='caption'
              sx={{ display: 'block', fontFamily: 'monospace' }}>
              {distanceToNextWP
                ? formatters.units.distance(distanceToNextWP, 1)
                : '-'}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* エラー時のオーバーレイ */}
      {hasError && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(239, 68, 68, 0.1)',
            pointerEvents: 'none',
          }}
        />
      )}
    </Paper>
  )
}

// 浅い比較でpropsの変更を検出
const arePropsEqual = (
  prevProps: UTMDroneTileProps,
  nextProps: UTMDroneTileProps
): boolean => {
  // ドローンの状態が変わった場合は再レンダリング
  if (prevProps.drone.droneId !== nextProps.drone.droneId) return false
  if (prevProps.drone.status !== nextProps.drone.status) return false
  if (prevProps.drone.batteryLevel !== nextProps.drone.batteryLevel)
    return false
  if (prevProps.drone.signalStrength !== nextProps.drone.signalStrength)
    return false
  if (prevProps.drone.flightMode !== nextProps.drone.flightMode) return false
  if (
    prevProps.drone.position.altitude !== nextProps.drone.position.altitude ||
    prevProps.drone.position.speed !== nextProps.drone.position.speed
  )
    return false

  // 選択状態
  if (prevProps.isSelected !== nextProps.isSelected) return false

  // アラートの数が変わった場合のみ再レンダリング
  const prevAlertCount =
    prevProps.alerts?.filter((a) => !a.acknowledged).length ?? 0
  const nextAlertCount =
    nextProps.alerts?.filter((a) => !a.acknowledged).length ?? 0
  if (prevAlertCount !== nextAlertCount) return false

  // その他のprops
  if (prevProps.cameraMode !== nextProps.cameraMode) return false
  if (prevProps.nextWaypoint !== nextProps.nextWaypoint) return false
  if (prevProps.distanceToNextWP !== nextProps.distanceToNextWP) return false
  if (prevProps.droneColor !== nextProps.droneColor) return false

  return true
}

// React.memoでラップしてエクスポート
export const UTMDroneTile = memo(UTMDroneTileComponent, arePropsEqual)

export default UTMDroneTile
