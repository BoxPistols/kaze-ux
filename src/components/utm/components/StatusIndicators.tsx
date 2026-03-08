/**
 * StatusIndicators - 状態表示インジケーター
 *
 * GPS、LTE、バッテリーなどの状態をアイコンで表示
 */

import Battery30Icon from '@mui/icons-material/Battery30'
import Battery60Icon from '@mui/icons-material/Battery60'
import Battery80Icon from '@mui/icons-material/Battery80'
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'
import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import GpsNotFixedIcon from '@mui/icons-material/GpsNotFixed'
import GpsOffIcon from '@mui/icons-material/GpsOff'
import HeightIcon from '@mui/icons-material/Height'
import SignalCellular0BarIcon from '@mui/icons-material/SignalCellular0Bar'
import SignalCellular4BarIcon from '@mui/icons-material/SignalCellular4Bar'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import TerrainIcon from '@mui/icons-material/Terrain'
import WifiIcon from '@mui/icons-material/Wifi'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import {
  Box,
  Chip,
  Paper,
  Tooltip,
  Typography,
  alpha,
  useTheme,
  type Theme,
} from '@mui/material'

export interface StatusIndicatorsProps {
  /** GPS状態（0-100、-1で無効） */
  gpsSignal?: number
  /** GPS衛星数 */
  gpsSatellites?: number
  /** LTE信号強度（0-100、-1で無効） */
  lteSignal?: number
  /** WiFi信号強度（0-100、-1で無効） */
  wifiSignal?: number
  /** バッテリー残量（0-100） */
  battery?: number
  /** バッテリー警告閾値（デフォルト30%） */
  batteryWarningThreshold?: number
  /** バッテリー危険閾値（デフォルト15%） */
  batteryCriticalThreshold?: number
  /** AGL（対地高度）メートル、nullで非表示 */
  agl?: number | null
  /** MSL（海抜高度）メートル、nullで非表示 */
  msl?: number | null
  /** コンパクトモード */
  compact?: boolean
  /** 横並び表示 */
  horizontal?: boolean
  /** カスタムスタイル */
  sx?: object
}

type SignalLevel = 'good' | 'warning' | 'critical' | 'off'

/**
 * 信号強度からレベルを判定
 */
function getSignalLevel(signal: number): SignalLevel {
  if (signal < 0) return 'off'
  if (signal >= 70) return 'good'
  if (signal >= 30) return 'warning'
  return 'critical'
}

/**
 * レベルに応じた色を取得
 */
function getLevelColor(level: SignalLevel, theme: Theme): string {
  switch (level) {
    case 'good':
      return theme.palette.success.main
    case 'warning':
      return theme.palette.warning.main
    case 'critical':
      return theme.palette.error.main
    case 'off':
    default:
      return theme.palette.text.disabled
  }
}

/**
 * バッテリー残量に応じたアイコンを取得
 */
function getBatteryIcon(
  level: number,
  warningThreshold: number,
  criticalThreshold: number
) {
  if (level < criticalThreshold) return BatteryAlertIcon
  if (level < warningThreshold) return Battery30Icon
  if (level < 50) return Battery60Icon
  if (level < 80) return Battery80Icon
  return BatteryFullIcon
}

/**
 * StatusIndicators - 状態表示
 */
export function StatusIndicators({
  gpsSignal = -1,
  gpsSatellites,
  lteSignal = -1,
  wifiSignal = -1,
  battery = -1,
  batteryWarningThreshold = 30,
  batteryCriticalThreshold = 15,
  agl = null,
  msl = null,
  compact = false,
  horizontal = true,
  sx,
}: StatusIndicatorsProps) {
  const theme = useTheme()

  // グラスモーフィズムスタイル
  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.85)'
        : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
  }

  // GPS信号レベル
  const gpsLevel = getSignalLevel(gpsSignal)
  const gpsColor = getLevelColor(gpsLevel, theme)
  const GpsIcon =
    gpsLevel === 'off'
      ? GpsOffIcon
      : gpsLevel === 'good'
        ? GpsFixedIcon
        : GpsNotFixedIcon

  // LTE信号レベル
  const lteLevel = getSignalLevel(lteSignal)
  const lteColor = getLevelColor(lteLevel, theme)
  const LteIcon =
    lteLevel === 'off'
      ? SignalCellular0BarIcon
      : lteLevel === 'good'
        ? SignalCellular4BarIcon
        : SignalCellularAltIcon

  // WiFi信号レベル
  const wifiLevel = getSignalLevel(wifiSignal)
  const wifiColor = getLevelColor(wifiLevel, theme)
  const WifiCurrentIcon = wifiLevel === 'off' ? WifiOffIcon : WifiIcon

  // バッテリーレベル（カスタム閾値対応）
  const getBatteryLevel = (value: number): SignalLevel => {
    if (value < 0) return 'off'
    if (value < batteryCriticalThreshold) return 'critical'
    if (value < batteryWarningThreshold) return 'warning'
    return 'good'
  }
  const batteryLevel = getBatteryLevel(battery)
  const batteryColor = getLevelColor(batteryLevel, theme)
  const BatteryIcon = getBatteryIcon(
    battery,
    batteryWarningThreshold,
    batteryCriticalThreshold
  )

  // インジケーターアイテム
  const renderIndicator = (
    icon: React.ReactNode,
    label: string,
    value: string,
    color: string
  ) => {
    if (compact) {
      return (
        <Tooltip key={label} title={`${label}: ${value}`} arrow>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color,
            }}>
            {icon}
          </Box>
        </Tooltip>
      )
    }

    return (
      <Box
        key={label}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}>
        <Box sx={{ color, display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography
            variant='caption'
            sx={{
              fontSize: '0.65rem',
              color: 'text.secondary',
              lineHeight: 1,
              display: 'block',
            }}>
            {label}
          </Typography>
          <Typography
            variant='body2'
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color,
              lineHeight: 1.2,
            }}>
            {value}
          </Typography>
        </Box>
      </Box>
    )
  }

  const indicators = []

  // GPS
  if (gpsSignal >= 0) {
    const gpsValue =
      gpsSatellites !== undefined
        ? `${gpsSignal}% (${gpsSatellites}衛星)`
        : `${gpsSignal}%`
    indicators.push(
      renderIndicator(
        <GpsIcon sx={{ fontSize: compact ? 18 : 20 }} />,
        'GPS',
        gpsValue,
        gpsColor
      )
    )
  }

  // LTE
  if (lteSignal >= 0) {
    indicators.push(
      renderIndicator(
        <LteIcon sx={{ fontSize: compact ? 18 : 20 }} />,
        'LTE',
        `${lteSignal}%`,
        lteColor
      )
    )
  }

  // WiFi
  if (wifiSignal >= 0) {
    indicators.push(
      renderIndicator(
        <WifiCurrentIcon sx={{ fontSize: compact ? 18 : 20 }} />,
        'WiFi',
        `${wifiSignal}%`,
        wifiColor
      )
    )
  }

  // バッテリー
  if (battery >= 0) {
    const batteryLabel =
      battery < batteryCriticalThreshold
        ? 'Battery (CRITICAL)'
        : battery < batteryWarningThreshold
          ? 'Battery (LOW)'
          : 'Battery'
    indicators.push(
      renderIndicator(
        <BatteryIcon sx={{ fontSize: compact ? 18 : 20 }} />,
        batteryLabel,
        `${battery}%`,
        batteryColor
      )
    )
  }

  // AGL（対地高度）
  if (agl !== null && agl !== undefined) {
    const aglColor =
      agl < 10
        ? theme.palette.warning.main
        : agl > 150
          ? theme.palette.error.main
          : theme.palette.success.main
    indicators.push(
      renderIndicator(
        <TerrainIcon sx={{ fontSize: compact ? 18 : 20 }} />,
        'AGL',
        `${agl.toFixed(0)}m`,
        aglColor
      )
    )
  }

  // MSL（海抜高度）
  if (msl !== null && msl !== undefined) {
    indicators.push(
      renderIndicator(
        <HeightIcon sx={{ fontSize: compact ? 18 : 20 }} />,
        'MSL',
        `${msl.toFixed(0)}m`,
        theme.palette.info.main
      )
    )
  }

  if (indicators.length === 0) {
    return null
  }

  return (
    <Paper
      elevation={0}
      sx={{
        ...glassStyle,
        p: compact ? 0.75 : 1.5,
        borderRadius: 2,
        ...sx,
      }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: horizontal ? 'row' : 'column',
          gap: compact ? 1.5 : 2,
          alignItems: horizontal ? 'center' : 'flex-start',
        }}>
        {indicators}
      </Box>
    </Paper>
  )
}

/**
 * DID/制限区域チェック結果インジケーター
 */
export interface ZoneStatusChipProps {
  /** ゾーン内かどうか */
  inZone: boolean
  /** ゾーン名 */
  zoneName?: string
  /** ゾーンタイプ */
  zoneType?: 'red' | 'yellow' | 'did' | 'airport'
  /** カスタムスタイル */
  sx?: object
}

export function ZoneStatusChip({
  inZone,
  zoneName,
  zoneType = 'red',
  sx,
}: ZoneStatusChipProps) {
  if (!inZone) {
    return (
      <Chip
        label='区域外'
        size='small'
        color='success'
        variant='outlined'
        sx={{ fontSize: '0.75rem', height: 24, ...sx }}
      />
    )
  }

  // ゾーンタイプに応じた色
  const chipColor =
    zoneType === 'red'
      ? 'error'
      : zoneType === 'yellow'
        ? 'warning'
        : zoneType === 'did'
          ? 'secondary'
          : 'info'

  return (
    <Tooltip title={zoneName || '制限区域内'} arrow>
      <Chip
        label={
          zoneType === 'red'
            ? '飛行禁止区域'
            : zoneType === 'yellow'
              ? '要許可区域'
              : zoneType === 'did'
                ? 'DID区域'
                : '制限区域'
        }
        size='small'
        color={chipColor}
        sx={{ fontSize: '0.75rem', height: 24, ...sx }}
      />
    </Tooltip>
  )
}

export default StatusIndicators
