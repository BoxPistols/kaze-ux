/**
 * タイムラインイベント関連のヘルパー関数
 * アイコン生成、色取得、ラベル取得など
 */

import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'
import CameraAltIcon from '@mui/icons-material/CameraAlt'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import FlightLandIcon from '@mui/icons-material/FlightLand'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import HomeIcon from '@mui/icons-material/Home'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import PanToolIcon from '@mui/icons-material/PanTool'
import RouteIcon from '@mui/icons-material/Route'
import SignalWifiOffIcon from '@mui/icons-material/SignalWifiOff'
import VideocamIcon from '@mui/icons-material/Videocam'
import WarningIcon from '@mui/icons-material/Warning'
import type { SxProps, Theme } from '@mui/material'

import { colors } from '@/styles/tokens'
import type {
  FlightTimelineEventSeverity,
  FlightTimelineEventType,
} from '@/types/utmTypes'

/**
 * イベント種類ごとのアイコンコンポーネントを取得
 * @param type - イベント種類
 * @param fontSize - アイコンのフォントサイズ（デフォルト: 10）
 * @param sx - 追加のスタイルプロパティ
 * @returns アイコンコンポーネント
 */
export const getEventIcon = (
  type: FlightTimelineEventType,
  fontSize: number = 10,
  sx?: SxProps<Theme>
) => {
  const iconProps = { sx: { fontSize, ...sx } }

  switch (type) {
    case 'takeoff':
      return <FlightTakeoffIcon {...iconProps} />
    case 'landing':
      return <FlightLandIcon {...iconProps} />
    case 'waypoint_reached':
      return <LocationOnIcon {...iconProps} />
    case 'route_change':
      return <RouteIcon {...iconProps} />
    case 'rth_start':
      return <HomeIcon {...iconProps} />
    case 'hover_start':
    case 'hover_end':
      return <PanToolIcon {...iconProps} />
    case 'low_battery':
    case 'critical_battery':
      return <BatteryAlertIcon {...iconProps} />
    case 'signal_weak':
    case 'signal_lost':
    case 'signal_recovered':
      return <SignalWifiOffIcon {...iconProps} />
    case 'geofence_warning':
    case 'geofence_breach':
    case 'zone_approach':
    case 'zone_violation':
      return <WarningIcon {...iconProps} />
    case 'collision_warning':
      return <ErrorIcon {...iconProps} />
    case 'weather_warning':
      return <WarningIcon {...iconProps} />
    case 'system_error':
    case 'motor_warning':
      return <ErrorIcon {...iconProps} />
    case 'gps_warning':
      return <GpsFixedIcon {...iconProps} />
    case 'manual_override':
    case 'auto_mode':
      return <PanToolIcon {...iconProps} />
    case 'mission_start':
    case 'mission_complete':
      return <CheckCircleIcon {...iconProps} />
    case 'mission_abort':
      return <ErrorIcon {...iconProps} />
    case 'photo_taken':
      return <CameraAltIcon {...iconProps} />
    case 'video_start':
    case 'video_end':
      return <VideocamIcon {...iconProps} />
    default:
      return <LocationOnIcon {...iconProps} />
  }
}

/**
 * 重要度ごとの色を取得
 * @param severity - イベントの重要度
 * @returns 色コード
 */
export const getSeverityColor = (severity: FlightTimelineEventSeverity) => {
  switch (severity) {
    case 'info':
      return colors.primary[500]
    case 'success':
      return colors.success.main
    case 'warning':
      return colors.warning.main
    case 'error':
      return colors.error.main
    case 'critical':
      return colors.error.dark
    default:
      return colors.gray[500]
  }
}

/**
 * イベント種類の日本語ラベルを取得
 * @param type - イベント種類
 * @returns 日本語のラベル文字列
 */
export const getEventTypeLabel = (type: FlightTimelineEventType): string => {
  const labels: Record<FlightTimelineEventType, string> = {
    takeoff: '離陸',
    landing: '着陸',
    waypoint_reached: 'WP到達',
    route_change: 'ルート変更',
    rth_start: 'RTH開始',
    hover_start: 'ホバリング開始',
    hover_end: 'ホバリング終了',
    low_battery: 'バッテリー低下',
    critical_battery: 'バッテリー危険',
    signal_weak: '信号弱',
    signal_lost: '信号喪失',
    signal_recovered: '信号回復',
    geofence_warning: 'ジオフェンス警告',
    geofence_breach: 'ジオフェンス逸脱',
    zone_approach: '禁止区域接近',
    zone_violation: '禁止区域侵入',
    collision_warning: '衝突警告',
    weather_warning: '気象警告',
    system_error: 'システムエラー',
    motor_warning: 'モーター警告',
    gps_warning: 'GPS警告',
    manual_override: '手動操作',
    auto_mode: '自動モード',
    mission_start: 'ミッション開始',
    mission_complete: 'ミッション完了',
    mission_abort: 'ミッション中断',
    photo_taken: '写真撮影',
    video_start: '動画開始',
    video_end: '動画終了',
    custom: 'カスタム',
  }
  return labels[type] || type
}
