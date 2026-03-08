import Battery60Icon from '@mui/icons-material/Battery60'
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'
import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExploreIcon from '@mui/icons-material/Explore'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import HeightIcon from '@mui/icons-material/Height'
import NavigationIcon from '@mui/icons-material/Navigation'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import SpeedIcon from '@mui/icons-material/Speed'
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty'
import {
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import React from 'react'

import {
  DRONE_STATUS_LABELS,
  DRONE_STATUS_COLORS,
  FLIGHT_MODE_LABELS,
  GPS_FIX_TYPE_LABELS,
  GPS_FIX_TYPE_COLORS,
} from '@/constants/utmLabels'
import { colors } from '@/styles/tokens'
import type { ExtendedDroneInfo, FlightStatus } from '@/types/utmTypes'

export interface UTMDroneDetailWidgetProps {
  /** 機体情報 */
  drone: ExtendedDroneInfo
  /** フライトステータス */
  flightStatus?: FlightStatus
  /** プロジェクト名 */
  projectName?: string
  /** エリア名 */
  areaName?: string
  /** コンパクト表示 */
  compact?: boolean
  /** 展開/折りたたみ切り替えコールバック */
  onToggle?: () => void
  /** カスタムスタイル */
  sx?: object
}

// バッテリーアイコンの取得
const getBatteryIcon = (level: number, fontSize: number = 20) => {
  if (level > 60)
    return <BatteryFullIcon sx={{ color: colors.success.main, fontSize }} />
  if (level > 20)
    return <Battery60Icon sx={{ color: colors.warning.main, fontSize }} />
  return <BatteryAlertIcon sx={{ color: colors.error.main, fontSize }} />
}

// バッテリー色の取得
const getBatteryColor = (level: number) => {
  if (level > 60) return colors.success.main
  if (level > 20) return colors.warning.main
  return colors.error.main
}

// 信号強度色の取得
const getSignalColor = (rssi: number) => {
  // rssiは通常 -30 (強) 〜 -120 (弱) dBm
  if (rssi > -70) return colors.success.main
  if (rssi > -90) return colors.warning.main
  return colors.error.main
}

// 情報項目コンポーネント
interface InfoItemProps {
  label: string
  value: React.ReactNode
  icon?: React.ReactNode
  priority?: 1 | 2 | 3 // 1: ★★★, 2: ★★, 3: ★
}

const InfoItem = ({ label, value, icon, priority = 3 }: InfoItemProps) => {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
      {icon && (
        <Box sx={{ color: 'text.secondary', display: 'flex' }}>{icon}</Box>
      )}
      <Box sx={{ flex: 1 }}>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ fontSize: '0.65rem', display: 'block' }}>
          {label}
        </Typography>
        <Typography
          variant='body2'
          fontWeight={priority === 1 ? 700 : priority === 2 ? 600 : 500}
          sx={{
            color:
              priority === 1
                ? theme.palette.primary.main
                : priority === 2
                  ? 'text.primary'
                  : 'text.secondary',
          }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

// 簡易人工水平儀コンポーネント
const ArtificialHorizon = ({
  roll,
  pitch,
  size = 60,
}: {
  roll: number
  pitch: number
  size?: number
}) => {
  // 1度あたりのピクセル移動量。size=60なら半径30。30度で端まで行くとすると 30/30 = 1 px/deg
  // 見やすさのため少し感度を下げる
  const pxPerDeg = size / 2 / 45
  const yOffset = pitch * pxPerDeg

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid rgba(128,128,128,0.5)',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#000', // 隙間が見えた時のための背景色
        flexShrink: 0,
      }}>
      {/* 背景（全体を回転・移動） */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size * 4, // 十分大きく
          height: size * 4,
          // rollが正（右傾き）のとき、地平線は左に傾く（反時計回り）ように見えるべき -> rotate(-roll)
          // pitchが正（機首上げ）のとき、地平線は下に下がる -> translateY(positive)
          transform: `translate(-50%, -50%) rotate(${-roll}deg) translateY(${yOffset}px)`,
          transition: 'transform 0.1s ease-out',
        }}>
        <Box sx={{ height: '50%', bgcolor: '#42a5f5' }} /> {/* 空 */}
        <Box sx={{ height: '50%', bgcolor: '#8d6e63' }} /> {/* 地面 */}
      </Box>
      {/* 基準線（機体固定） */}
      {/* 横線 */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '20%',
          right: '20%',
          height: 2,
          bgcolor: 'rgba(255, 255, 0, 0.8)',
          transform: 'translateY(-50%)',
          boxShadow: '0 0 2px rgba(0,0,0,0.5)',
          zIndex: 1,
        }}
      />
      {/* 中心点 */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 4,
          height: 4,
          borderRadius: '50%',
          bgcolor: 'rgba(255, 0, 0, 0.8)',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0 0 2px rgba(0,0,0,0.5)',
          zIndex: 2,
        }}
      />
      {/* 上部の指標 */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          width: 2,
          height: 4,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          transform: 'translateX(-50%)',
          zIndex: 1,
        }}
      />
    </Box>
  )
}

/**
 * UTMDroneDetailWidget - 拡張機体情報ウィジェット
 *
 * モニタリング用の詳細な機体情報を表示するコンポーネント
 * 機体管理名、機種名、JU番号、バッテリ、GPS、電波、高度、位置、姿勢、フライトモードを表示
 */
export const UTMDroneDetailWidget = ({
  drone,
  flightStatus,
  projectName,
  areaName,
  compact = false,
  onToggle,
  sx,
}: UTMDroneDetailWidgetProps) => {
  const theme = useTheme()

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

  // ステータスマッピング（DroneFlightStatusのstatusをFlightStatusにマップ）
  const getStatusLabel = (): string => {
    if (flightStatus) {
      const labels: Record<FlightStatus, string> = {
        preflight: '飛行前',
        takeoff: '離陸中',
        in_flight: '飛行中',
        landing: '着陸中',
        completed: 'フライト終了',
      }
      // FlightStatus として定義されているか確認
      if (flightStatus in labels) {
        return labels[flightStatus]
      }
      // DRONE_STATUS_LABELS にフォールバック
      const droneStatusLabel =
        DRONE_STATUS_LABELS[flightStatus as keyof typeof DRONE_STATUS_LABELS]
      if (droneStatusLabel) {
        return droneStatusLabel
      }
      return '不明'
    }
    // flightMode からラベルを取得（マッピングが必要）
    const flightModeToLabelMap: Record<string, string> = {
      auto: 'オート飛行',
      manual: 'マニュアル飛行',
      rth: '帰還中',
      hover: 'ホバリング',
      landing: '着陸中',
      unknown: '不明',
    }
    return flightModeToLabelMap[drone.flightMode] ?? '不明'
  }

  const getStatusColor = (): string => {
    if (flightStatus) {
      const colorMap: Record<FlightStatus, string> = {
        preflight: colors.gray[500],
        takeoff: colors.warning.main,
        in_flight: colors.success.main,
        landing: colors.warning.main,
        completed: colors.info.main,
      }
      // FlightStatus として定義されているか確認
      if (flightStatus in colorMap) {
        return colorMap[flightStatus]
      }
      // DRONE_STATUS_COLORS にフォールバック
      const droneStatusColor =
        DRONE_STATUS_COLORS[flightStatus as keyof typeof DRONE_STATUS_COLORS]
      if (droneStatusColor) {
        return droneStatusColor
      }
      return colors.gray[500]
    }
    // flightMode から色を取得（マッピングが必要）
    const flightModeToStatusMap: Record<
      string,
      keyof typeof DRONE_STATUS_COLORS | null
    > = {
      auto: 'in_flight',
      manual: 'in_flight',
      rth: 'rth',
      hover: 'hovering',
      landing: 'landing',
      unknown: null,
    }
    const mappedStatus = flightModeToStatusMap[drone.flightMode]
    if (mappedStatus) {
      return DRONE_STATUS_COLORS[mappedStatus]
    }
    return colors.gray[500]
  }

  if (compact) {
    // コンパクト表示（アコーディオンヘッダー）
    return (
      <Paper
        elevation={0}
        sx={{
          ...glassStyle,
          p: 1.5,
          borderRadius: 2,
          cursor: onToggle ? 'pointer' : 'default',
          transition: 'all 0.2s ease',
          '&:hover': onToggle ? { boxShadow: 2 } : {},
          ...sx,
        }}
        onClick={onToggle}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle2' fontWeight={700}>
              {areaName || projectName || drone.droneName}
            </Typography>
            {(areaName || projectName) && (
              <Typography variant='caption' color='text.secondary'>
                {drone.droneName}
              </Typography>
            )}
          </Box>
          <Chip
            label={getStatusLabel()}
            size='small'
            sx={{
              height: 18,
              fontSize: '0.65rem',
              bgcolor: alpha(getStatusColor(), 0.15),
              color: getStatusColor(),
              fontWeight: 600,
            }}
          />
          {onToggle && (
            <IconButton
              size='small'
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
              sx={{ ml: 'auto' }}>
              <ExpandMoreIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {getBatteryIcon(drone.batteryLevel, 16)}
            <Typography variant='caption' fontWeight={600}>
              {Math.round(drone.batteryLevel)}%
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HeightIcon sx={{ fontSize: 16, color: colors.primary[500] }} />
            <Typography variant='caption' fontWeight={600}>
              {drone.altitude.agl.toFixed(0)}m
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <GpsFixedIcon
              sx={{
                fontSize: 16,
                color: GPS_FIX_TYPE_COLORS[drone.gps.fixType],
              }}
            />
            <Typography variant='caption'>
              {drone.gps.satelliteCount}衛星
            </Typography>
          </Box>
        </Box>
      </Paper>
    )
  }

  // フル表示
  return (
    <Paper elevation={0} sx={{ ...glassStyle, p: 2, borderRadius: 2, ...sx }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
            cursor: onToggle ? 'pointer' : 'default',
          }}
          onClick={onToggle}>
          <Box>
            <Typography variant='h6' fontWeight={700}>
              {areaName || projectName || drone.droneName}
            </Typography>
            {(areaName || projectName) && (
              <Typography
                variant='body2'
                color='text.secondary'
                fontWeight={600}>
                {drone.droneName}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={getStatusLabel()}
              sx={{
                bgcolor: alpha(getStatusColor(), 0.15),
                color: getStatusColor(),
                fontWeight: 600,
              }}
            />
            {onToggle && (
              <IconButton
                size='small'
                onClick={(e) => {
                  e.stopPropagation()
                  onToggle()
                }}>
                <ExpandLessIcon sx={{ fontSize: 20 }} />
              </IconButton>
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant='caption' color='text.secondary'>
            機種: {drone.modelName}
          </Typography>
          {drone.juNumber && (
            <Typography variant='caption' color='text.secondary'>
              JU: {drone.juNumber}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      {/* バッテリ情報 */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant='caption'
          fontWeight={600}
          color='text.secondary'
          sx={{ mb: 0.5, display: 'block' }}>
          バッテリ情報
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          {getBatteryIcon(drone.batteryLevel)}
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant='determinate'
              value={drone.batteryLevel}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.divider, 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  bgcolor: getBatteryColor(drone.batteryLevel),
                },
              }}
            />
          </Box>
          <Typography variant='body2' fontWeight={700}>
            {Math.round(drone.batteryLevel)}%
          </Typography>
        </Box>
        {(drone.batteryVoltage !== undefined ||
          drone.batteryTemperature !== undefined) && (
          <Box sx={{ display: 'flex', gap: 2, ml: 4 }}>
            {drone.batteryVoltage !== undefined && (
              <Typography variant='caption' color='text.secondary'>
                電圧: {drone.batteryVoltage.toFixed(1)}V
              </Typography>
            )}
            {drone.batteryTemperature !== undefined && (
              <Typography variant='caption' color='text.secondary'>
                温度: {drone.batteryTemperature}℃
              </Typography>
            )}
          </Box>
        )}
      </Box>

      <Grid container spacing={1.5}>
        {/* GPS情報 */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1.5,
            }}>
            <Typography
              variant='caption'
              fontWeight={600}
              color='text.secondary'
              sx={{ mb: 0.5, display: 'block' }}>
              GPS情報
            </Typography>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <GpsFixedIcon
                sx={{
                  fontSize: 18,
                  color: GPS_FIX_TYPE_COLORS[drone.gps.fixType],
                }}
              />
              <Typography variant='body2' fontWeight={600}>
                {GPS_FIX_TYPE_LABELS[drone.gps.fixType]}
              </Typography>
            </Box>
            <Typography variant='body2'>
              衛星捕捉数:{' '}
              <Typography component='span' fontWeight={700}>
                {drone.gps.satelliteCount}
              </Typography>
            </Typography>
            {drone.gps.hdop && (
              <Typography variant='caption' color='text.secondary'>
                HDOP: {drone.gps.hdop.toFixed(1)}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* 高度情報 */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1.5,
            }}>
            <Typography
              variant='caption'
              fontWeight={600}
              color='text.secondary'
              sx={{ mb: 0.5, display: 'block' }}>
              高度情報
            </Typography>
            <InfoItem
              label='対地高度 (AGL)'
              value={`${drone.altitude.agl.toFixed(1)} m`}
              icon={<HeightIcon sx={{ fontSize: 16 }} />}
              priority={1}
            />
            <InfoItem
              label='平均海抜高度 (AMSL)'
              value={`${drone.altitude.amsl.toFixed(1)} m`}
              priority={2}
            />
            <InfoItem
              label='相対高度'
              value={`${drone.altitude.relative.toFixed(1)} m`}
              priority={3}
            />
          </Box>
        </Grid>

        {/* 位置・方位情報 */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1.5,
            }}>
            <Typography
              variant='caption'
              fontWeight={600}
              color='text.secondary'
              sx={{ mb: 0.5, display: 'block' }}>
              位置情報
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', mb: 0.25 }}>
              緯度: {drone.position.latitude.toFixed(6)}
            </Typography>
            <Typography variant='caption' sx={{ display: 'block', mb: 0.25 }}>
              経度: {drone.position.longitude.toFixed(6)}
            </Typography>
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <ExploreIcon sx={{ fontSize: 16, color: colors.primary[500] }} />
              <Typography variant='body2' fontWeight={600}>
                方位: {drone.position.heading.toFixed(0)}deg
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* 姿勢情報 */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1.5,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant='caption'
                fontWeight={600}
                color='text.secondary'
                sx={{ mb: 0.5, display: 'block' }}>
                姿勢情報
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}>
                <Tooltip title='ロール（左右傾き）' arrow>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ThreeSixtyIcon
                      sx={{ fontSize: 16, color: colors.info.main }}
                    />
                    <Typography variant='caption' sx={{ lineHeight: 1.2 }}>
                      R: {drone.attitude.roll.toFixed(1)}deg
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title='ピッチ（前後傾き）' arrow>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SpeedIcon
                      sx={{ fontSize: 16, color: colors.success.main }}
                    />
                    <Typography variant='caption' sx={{ lineHeight: 1.2 }}>
                      P: {drone.attitude.pitch.toFixed(1)}deg
                    </Typography>
                  </Box>
                </Tooltip>
                <Tooltip title='ヨー（機首方位）' arrow>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <NavigationIcon
                      sx={{ fontSize: 16, color: colors.warning.main }}
                    />
                    <Typography variant='caption' sx={{ lineHeight: 1.2 }}>
                      Y: {drone.attitude.yaw.toFixed(1)}deg
                    </Typography>
                  </Box>
                </Tooltip>
              </Box>
            </Box>
            <Tooltip title='姿勢インジケーター' arrow>
              <Box>
                <ArtificialHorizon
                  roll={drone.attitude.roll}
                  pitch={drone.attitude.pitch}
                  size={56}
                />
              </Box>
            </Tooltip>
          </Box>
        </Grid>

        {/* 電波情報 */}
        {drone.signal && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                p: 1,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 1.5,
              }}>
              <Typography
                variant='caption'
                fontWeight={600}
                color='text.secondary'
                sx={{ mb: 0.5, display: 'block' }}>
                電波情報
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {drone.signal.lte && (
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block' }}>
                      LTE
                    </Typography>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SignalCellularAltIcon
                        sx={{
                          fontSize: 16,
                          color: getSignalColor(drone.signal.lte.rssi),
                        }}
                      />
                      <Typography variant='body2' fontWeight={600}>
                        {Math.round(drone.signal.lte.rssi)} dBm
                      </Typography>
                    </Box>
                    {drone.signal.lte.carrier && (
                      <Typography variant='caption' color='text.secondary'>
                        {drone.signal.lte.carrier}
                      </Typography>
                    )}
                  </Box>
                )}
                {drone.signal.radio24ghz && (
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block' }}>
                      2.4GHz
                    </Typography>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SignalCellularAltIcon
                        sx={{
                          fontSize: 16,
                          color: getSignalColor(drone.signal.radio24ghz.rssi),
                        }}
                      />
                      <Typography variant='body2' fontWeight={600}>
                        {Math.round(drone.signal.radio24ghz.rssi)} dBm
                      </Typography>
                    </Box>
                  </Box>
                )}
                {drone.signal.radio58ghz && (
                  <Box>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ display: 'block' }}>
                      5.8GHz
                    </Typography>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SignalCellularAltIcon
                        sx={{
                          fontSize: 16,
                          color: getSignalColor(drone.signal.radio58ghz.rssi),
                        }}
                      />
                      <Typography variant='body2' fontWeight={600}>
                        {Math.round(drone.signal.radio58ghz.rssi)} dBm
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Grid>
        )}

        {/* フライトモード */}
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              p: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Typography
              variant='caption'
              fontWeight={600}
              color='text.secondary'>
              フライトモード
            </Typography>
            <Chip
              label={
                FLIGHT_MODE_LABELS[
                  drone.flightMode as keyof typeof FLIGHT_MODE_LABELS
                ] ??
                (drone.flightMode === 'unknown' ? '不明' : drone.flightMode)
              }
              size='small'
              sx={{
                fontWeight: 600,
                bgcolor:
                  drone.flightMode === 'auto'
                    ? alpha(colors.success.main, 0.15)
                    : alpha(colors.warning.main, 0.15),
                color:
                  drone.flightMode === 'auto'
                    ? colors.success.main
                    : colors.warning.main,
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* 最終更新時刻 */}
      <Box sx={{ mt: 2, textAlign: 'right' }}>
        <Typography variant='caption' color='text.secondary'>
          最終更新:{' '}
          {drone.lastUpdated.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Typography>
      </Box>
    </Paper>
  )
}

export default UTMDroneDetailWidget
