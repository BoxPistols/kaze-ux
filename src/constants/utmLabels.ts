/**
 * UTM関連ラベル・定数定義
 * UTMコンポーネント全体で使用する統一ラベル・設定
 */

import type {
  DroneFlightStatus,
  AlertType,
  AlertSeverity,
  FlightPlanStatus,
  FlightStatus,
  IncidentType,
  IncidentSeverity,
  IncidentReportStatus,
  MapLayerCategory,
  MapLayerConfig,
  MapLayerType,
  WaypointType,
  WaypointAction,
} from '../types/utmTypes'

// ===== ドローンステータス =====

/** ドローン飛行状態のラベル */
export const DRONE_STATUS_LABELS: Record<DroneFlightStatus['status'], string> =
  {
    preflight: '飛行前',
    takeoff: '離陸中',
    in_flight: '飛行中',
    landing: '着陸中',
    landed: '着陸済み',
    emergency: '緊急',
    rth: '帰還中',
    hovering: 'ホバリング',
  }

/** ドローン飛行状態の色設定（コンテキストメニューと統一） */
export const DRONE_STATUS_COLORS: Record<DroneFlightStatus['status'], string> =
  {
    preflight: '#6b7280', // グレー（準備中）
    takeoff: '#3b82f6', // 青（離陸中）
    in_flight: '#22c55e', // 緑（飛行中）
    landing: '#6b7280', // グレー（着陸中 - 通常動作）
    landed: '#6b7280', // グレー（着陸済み）
    emergency: '#ef4444', // 赤（緊急）
    rth: '#ef4444', // 赤（緊急帰還 - 緊急扱い）
    hovering: '#eab308', // 黄色（ホバリング - 注意）
  }

/** ドローン飛行状態のMUIカラー（コンテキストメニューと統一） */
export const DRONE_STATUS_MUI_COLORS: Record<
  DroneFlightStatus['status'],
  'success' | 'warning' | 'error' | 'info' | 'default'
> = {
  preflight: 'default', // グレー
  takeoff: 'info', // 青
  in_flight: 'success', // 緑
  landing: 'default', // グレー（通常動作）
  landed: 'default', // グレー
  emergency: 'error', // 赤
  rth: 'error', // 赤（緊急扱い）
  hovering: 'warning', // 黄色
}

/** ドローン飛行状態のスタイル設定（コンテキストメニューと統一） */
export const DRONE_STATUS_STYLES: Record<
  DroneFlightStatus['status'],
  { color: string; bgColor: string; gradient: string }
> = {
  preflight: {
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
  },
  takeoff: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  },
  in_flight: {
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.1)',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
  },
  landing: {
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
  },
  landed: {
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.1)',
    gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
  },
  emergency: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
  },
  rth: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
  },
  hovering: {
    color: '#eab308',
    bgColor: 'rgba(234, 179, 8, 0.1)',
    gradient: 'linear-gradient(135deg, #eab308, #ca8a04)',
  },
}

// ===== 飛行モード =====

/** 飛行モードのラベル */
export const FLIGHT_MODE_LABELS: Record<string, string> = {
  manual: 'マニュアル飛行',
  auto: 'オート飛行',
  rth: 'RTH',
  hover: 'ホバリング',
  landing: '着陸中',
  unknown: '不明',
}

// ===== アラート =====

/** アラートタイプのラベル */
export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  zone_violation: '禁止区域侵入',
  zone_approach: '禁止区域接近',
  collision_warning: '衝突警告',
  collision_alert: '衝突危険',
  low_battery: 'バッテリー低下',
  signal_loss: '信号喪失',
  geofence_breach: 'ジオフェンス逸脱',
  weather_warning: '気象警報',
  airspace_conflict: '空域競合',
  system_command: 'システムコマンド',
}

/** アラート重大度のラベル */
export const ALERT_SEVERITY_LABELS: Record<AlertSeverity, string> = {
  info: '情報',
  warning: '警告',
  critical: '重大',
  emergency: '緊急',
}

/** アラート重大度の色設定 */
export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  info: '#3b82f6',
  warning: '#f59e0b',
  critical: '#ef4444',
  emergency: '#dc2626',
}

/** アラート重大度のMUIカラー */
export const ALERT_SEVERITY_MUI_COLORS: Record<
  AlertSeverity,
  'info' | 'warning' | 'error'
> = {
  info: 'info',
  warning: 'warning',
  critical: 'error',
  emergency: 'error',
}

/** アラート重大度のスタイル設定 */
export const ALERT_SEVERITY_STYLES: Record<
  AlertSeverity,
  { color: string; bgColor: string; gradient: string }
> = {
  info: {
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  },
  warning: {
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  critical: {
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
  },
  emergency: {
    color: '#dc2626',
    bgColor: 'rgba(220, 38, 38, 0.15)',
    gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)',
  },
}

// ===== 飛行計画 =====

/** 飛行計画ステータスのラベル */
export const FLIGHT_PLAN_STATUS_LABELS: Record<FlightPlanStatus, string> = {
  draft: '下書き',
  pending_approval: '承認待ち',
  approved: '承認済み',
  rejected: '却下',
  active: '実行中',
  completed: '完了',
  cancelled: 'キャンセル',
}

/** 飛行計画ステータスの色設定 */
export const FLIGHT_PLAN_STATUS_COLORS: Record<FlightPlanStatus, string> = {
  draft: '#6b7280',
  pending_approval: '#f59e0b',
  approved: '#22c55e',
  rejected: '#dc2626',
  active: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
}

/** 飛行計画ステータスのMUIカラー */
export const FLIGHT_PLAN_STATUS_MUI_COLORS: Record<
  FlightPlanStatus,
  'default' | 'warning' | 'success' | 'info' | 'error'
> = {
  draft: 'default',
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'error',
  active: 'info',
  completed: 'success',
  cancelled: 'error',
}

// ===== ウェイポイント =====

/** ウェイポイントタイプのラベル */
export const WAYPOINT_TYPE_LABELS: Record<WaypointType, string> = {
  takeoff: '離陸地点',
  waypoint: 'ウェイポイント',
  poi: '関心地点',
  hover: 'ホバリング',
  landing: '着陸地点',
}

/** ウェイポイントアクションのラベル */
export const WAYPOINT_ACTION_LABELS: Record<WaypointAction, string> = {
  none: 'なし',
  take_photo: '写真撮影',
  start_video: '動画撮影開始',
  stop_video: '動画撮影停止',
  hover: 'ホバリング',
  rotate: '機体回転',
  gimbal_pitch: 'ジンバル角度変更',
}

// ===== インシデント =====

/** インシデントタイプのラベル */
export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  near_miss: 'ニアミス',
  collision: '衝突',
  crash: '墜落',
  lost_link: '通信途絶',
  flyaway: 'フライアウェイ',
  battery_failure: 'バッテリー異常',
  motor_failure: 'モーター異常',
  gps_failure: 'GPS異常',
  zone_violation: '区域侵入',
  injury: '人身事故',
  property_damage: '物損',
  other: 'その他',
}

/** インシデント重大度のラベル */
export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  minor: '軽微',
  moderate: '中程度',
  serious: '重大',
  critical: '重大（報告義務）',
}

/** インシデント重大度の色設定 */
export const INCIDENT_SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  minor: '#3b82f6',
  moderate: '#f59e0b',
  serious: '#ef4444',
  critical: '#dc2626',
}

/** インシデント重大度のMUIカラー */
export const INCIDENT_SEVERITY_MUI_COLORS: Record<
  IncidentSeverity,
  'info' | 'warning' | 'error'
> = {
  minor: 'info',
  moderate: 'warning',
  serious: 'error',
  critical: 'error',
}

/** インシデントレポートステータスのラベル */
export const INCIDENT_STATUS_LABELS: Record<IncidentReportStatus, string> = {
  draft: '下書き',
  submitted: '提出済み',
  under_review: 'レビュー中',
  approved: '承認済み',
  rejected: '却下',
  closed: 'クローズ',
}

/** インシデントレポートステータスの色設定 */
export const INCIDENT_STATUS_COLORS: Record<IncidentReportStatus, string> = {
  draft: '#6b7280',
  submitted: '#3b82f6',
  under_review: '#f59e0b',
  approved: '#22c55e',
  rejected: '#ef4444',
  closed: '#10b981',
}

/** インシデントレポートステータスのMUIカラー */
export const INCIDENT_STATUS_MUI_COLORS: Record<
  IncidentReportStatus,
  'default' | 'info' | 'warning' | 'success' | 'error'
> = {
  draft: 'default',
  submitted: 'info',
  under_review: 'warning',
  approved: 'success',
  rejected: 'error',
  closed: 'success',
}

// ===== マップレイヤー =====

/** マップレイヤーカテゴリのラベル */
export const MAP_LAYER_CATEGORY_LABELS: Record<MapLayerCategory, string> = {
  restricted_area: '禁止エリア',
  geographic: '地理情報',
  weather: '天候情報',
  signal: '電波情報',
}

/** マップレイヤー設定 */
export const MAP_LAYER_CONFIGS: MapLayerConfig[] = [
  // 禁止エリア
  {
    id: 'airport_vicinity',
    label: '空港など周辺空域',
    labelEn: 'Airport Vicinity',
    category: 'restricted_area',
    color: '#f97316', // オレンジ
    borderColor: '#ea580c',
    borderStyle: 'solid',
    opacity: 0.3,
    enabled: true,
    zIndex: 10,
  },
  {
    id: 'did_area',
    label: '人口集中地区',
    labelEn: 'DID Area',
    category: 'restricted_area',
    color: '#eab308', // 黄色
    borderColor: '#ca8a04',
    borderStyle: 'solid',
    opacity: 0.25,
    enabled: true,
    zIndex: 9,
  },
  {
    id: 'emergency_airspace',
    label: '緊急用務空域',
    labelEn: 'Emergency Airspace',
    category: 'restricted_area',
    color: '#ec4899', // ピンク
    borderColor: '#db2777',
    borderStyle: 'dashed',
    opacity: 0.3,
    enabled: true,
    zIndex: 12,
  },
  {
    id: 'manned_aircraft_area',
    label: '有人機発着エリア',
    labelEn: 'Manned Aircraft Area',
    category: 'restricted_area',
    color: '#22c55e', // 緑
    borderColor: '#16a34a',
    borderStyle: 'solid',
    opacity: 0.25,
    enabled: true,
    zIndex: 8,
  },
  {
    id: 'remote_id_area',
    label: 'リモートID特定区域',
    labelEn: 'Remote ID Area',
    category: 'restricted_area',
    color: '#3b82f6', // 青
    borderColor: '#2563eb',
    borderStyle: 'solid',
    opacity: 0.2,
    enabled: false,
    zIndex: 7,
  },
  {
    id: 'sua_red_zone',
    label: 'レッドゾーン',
    labelEn: 'Red Zone (SUA)',
    category: 'restricted_area',
    color: '#dc2626', // 赤
    borderColor: '#b91c1c',
    borderStyle: 'solid',
    opacity: 0.35,
    enabled: true,
    zIndex: 11,
  },
  {
    id: 'sua_yellow_zone',
    label: 'イエローゾーン',
    labelEn: 'Yellow Zone (SUA)',
    category: 'restricted_area',
    color: '#fbbf24', // 黄
    borderColor: '#f59e0b',
    borderStyle: 'dashed',
    opacity: 0.25,
    enabled: true,
    zIndex: 10,
  },
  // 地理情報
  {
    id: 'terrain',
    label: '地物',
    labelEn: 'Terrain',
    category: 'geographic',
    color: '#78716c', // グレー
    borderColor: '#57534e',
    borderStyle: 'solid',
    opacity: 0.2,
    enabled: false,
    zIndex: 5,
  },
  // 天候情報
  {
    id: 'rain_cloud',
    label: '雨雲',
    labelEn: 'Rain Cloud',
    category: 'weather',
    color: '#06b6d4', // シアン
    borderColor: '#0891b2',
    borderStyle: 'solid',
    opacity: 0.4,
    enabled: false,
    zIndex: 15,
  },
  {
    id: 'wind',
    label: '風向・風量',
    labelEn: 'Wind',
    category: 'weather',
    color: '#8b5cf6', // 紫
    borderColor: '#7c3aed',
    borderStyle: 'solid',
    opacity: 0.3,
    enabled: false,
    zIndex: 14,
  },
  // 電波情報
  {
    id: 'lte_coverage',
    label: 'LTE',
    labelEn: 'LTE Coverage',
    category: 'signal',
    color: '#14b8a6', // ティール
    borderColor: '#0d9488',
    borderStyle: 'solid',
    opacity: 0.2,
    enabled: false,
    zIndex: 6,
  },
]

/** マップレイヤーIDからラベルを取得 */
export const MAP_LAYER_LABELS: Record<MapLayerType, string> = {
  airport_vicinity: '空港など周辺空域',
  did_area: '人口集中地区',
  emergency_airspace: '緊急用務空域',
  manned_aircraft_area: '有人機発着エリア',
  remote_id_area: 'リモートID特定区域',
  sua_red_zone: 'レッドゾーン',
  sua_yellow_zone: 'イエローゾーン',
  terrain: '地物',
  rain_cloud: '雨雲',
  wind: '風向・風量',
  lte_coverage: 'LTE',
}

/** マップレイヤーの色設定 */
export const MAP_LAYER_COLORS: Record<MapLayerType, string> = {
  airport_vicinity: '#f97316',
  did_area: '#eab308',
  emergency_airspace: '#ec4899',
  manned_aircraft_area: '#22c55e',
  remote_id_area: '#3b82f6',
  sua_red_zone: '#dc2626',
  sua_yellow_zone: '#fbbf24',
  terrain: '#78716c',
  rain_cloud: '#06b6d4',
  wind: '#8b5cf6',
  lte_coverage: '#14b8a6',
}

// ===== フライトステータス =====

/** フライトステータスのラベル */
export const FLIGHT_STATUS_LABELS: Record<FlightStatus, string> = {
  preflight: 'フライト開始前',
  takeoff: '離陸中',
  in_flight: 'フライト中',
  landing: '着陸中',
  completed: 'フライト終了',
}

/** フライトステータスの色設定 */
export const FLIGHT_STATUS_COLORS: Record<FlightStatus, string> = {
  preflight: '#6b7280',
  takeoff: '#8b5cf6',
  in_flight: '#22c55e',
  landing: '#f59e0b',
  completed: '#3b82f6',
}

// ===== 気象条件 =====

/** 天気条件のラベル */
export const WEATHER_CONDITION_LABELS: Record<
  'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown',
  string
> = {
  sunny: '晴れ',
  cloudy: 'くもり',
  rainy: '雨',
  snowy: '雪',
  unknown: '不明',
}

/** 天気条件のアイコン */
export const WEATHER_CONDITION_ICONS: Record<
  'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown',
  string
> = {
  sunny: 'WbSunny',
  cloudy: 'Cloud',
  rainy: 'Grain',
  snowy: 'AcUnit',
  unknown: 'HelpOutline',
}

// ===== GPS Fix Type =====

/** GPS Fix Typeのラベル */
export const GPS_FIX_TYPE_LABELS: Record<
  'no_fix' | '2d' | '3d' | 'dgps' | 'rtk_float' | 'rtk_fixed',
  string
> = {
  no_fix: 'No Fix',
  '2d': '2D Fix',
  '3d': '3D Fix',
  dgps: 'DGPS',
  rtk_float: 'RTK Float',
  rtk_fixed: 'RTK Fixed',
}

/** GPS Fix Typeの色設定 */
export const GPS_FIX_TYPE_COLORS: Record<
  'no_fix' | '2d' | '3d' | 'dgps' | 'rtk_float' | 'rtk_fixed',
  string
> = {
  no_fix: '#ef4444',
  '2d': '#f59e0b',
  '3d': '#22c55e',
  dgps: '#3b82f6',
  rtk_float: '#8b5cf6',
  rtk_fixed: '#10b981',
}

// ===== アラート閾値デフォルト値 =====

/** デフォルトのアラート閾値設定 */
export const DEFAULT_ALERT_THRESHOLDS = {
  warning: {
    altitudeLimit: 130, // メートル
    routeDeviation: 50, // メートル
    batteryLevel: 40, // %
    gpsMinSatellites: 6, // 最小衛星数
    signalStrength: 50, // %
    windSpeed: 8, // m/s
  },
  alert: {
    altitudeExceeded: 150, // メートル
    batteryLow: 30, // %
  },
}
