/**
 * UTM (Unmanned Traffic Management) 関連の型定義
 */

// ドローンのリアルタイム位置情報
export interface DronePosition {
  droneId: string
  latitude: number
  longitude: number
  altitude: number // メートル
  heading: number // 0-360度
  speed: number // m/s
  timestamp: Date
  // 姿勢データ（オイラー角）
  attitude?: {
    roll: number // ロール角（-180〜180度）左右の傾き
    pitch: number // ピッチ角（-90〜90度）前後の傾き
    yaw: number // ヨー角（0〜360度）機首方位
  }
}

// ドローンのリアルタイム飛行状態
export interface DroneFlightStatus {
  droneId: string
  droneName: string
  pilotId: string
  pilotName: string
  flightPlanId: string | null
  projectId?: string // 所属プロジェクトID
  position: DronePosition
  batteryLevel: number // 0-100%
  signalStrength: number // 0-100%
  flightMode: 'manual' | 'auto' | 'rth' | 'hover' | 'landing'
  status:
    | 'preflight'
    | 'takeoff'
    | 'in_flight'
    | 'landing'
    | 'landed'
    | 'emergency'
    | 'rth'
    | 'hovering'
  startTime: Date
  estimatedEndTime: Date | null
  // 飛行予定経路（オプショナル）
  plannedRoute?: {
    waypoints: [number, number][] // [lng, lat][]
    corridorWidth: number // メートル
    color?: string
  }
}

// 飛行禁止・制限区域の種類
export type RestrictedZoneType =
  | 'did' // 人口集中地区（DID）
  | 'airport' // 空港周辺
  | 'heliport' // ヘリポート周辺
  | 'emergency' // 緊急用務空域
  | 'important_facility' // 重要施設周辺（国会、官邸など）
  | 'nuclear' // 原子力施設周辺
  | 'custom' // カスタム制限区域

// 制限区域の制限レベル
export type RestrictionLevel =
  | 'prohibited' // 飛行禁止
  | 'restricted' // 許可が必要
  | 'caution' // 注意が必要

// 飛行禁止・制限区域
export interface RestrictedZone {
  id: string
  name: string
  type: RestrictedZoneType
  level: RestrictionLevel
  description: string
  // GeoJSON形式の座標（ポリゴン）
  coordinates: number[][][]
  // 高度制限（メートル）
  minAltitude?: number
  maxAltitude?: number
  // 有効期間
  validFrom?: Date
  validUntil?: Date
  // 管理者情報
  authority: string
  contactInfo?: string
}

// アラートの種類
export type AlertType =
  | 'zone_violation' // 禁止区域侵入
  | 'zone_approach' // 禁止区域接近
  | 'collision_warning' // 衝突警告
  | 'collision_alert' // 衝突危険
  | 'low_battery' // バッテリー低下
  | 'signal_loss' // 信号喪失
  | 'geofence_breach' // ジオフェンス逸脱
  | 'weather_warning' // 気象警告
  | 'airspace_conflict' // 空域競合
  | 'system_command' // システムコマンド（ホバリング、RTH等）

// アラートの重要度
export type AlertSeverity = 'info' | 'warning' | 'critical' | 'emergency'

// アラート
export interface UTMAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  droneId: string
  droneName: string
  message: string
  details: string
  timestamp: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  // 関連する区域（区域侵入の場合）
  relatedZoneId?: string
  // 関連するドローン（衝突警告の場合）
  relatedDroneId?: string
  // 位置情報
  position?: {
    latitude: number
    longitude: number
    altitude: number
  }
}

// DIPS申請ステータス
export type DIPSApplicationStatus =
  | 'draft' // 下書き
  | 'submitted' // 申請済み
  | 'under_review' // 審査中
  | 'approved' // 承認
  | 'rejected' // 却下
  | 'revision_required' // 修正要求
  | 'cancelled' // 取り消し
  | 'expired' // 期限切れ

// 飛行目的
export type FlightPurpose =
  | 'aerial_photography' // 空撮
  | 'surveying' // 測量
  | 'inspection' // 点検
  | 'agriculture' // 農業
  | 'delivery' // 配送
  | 'disaster_response' // 災害対応
  | 'research' // 研究
  | 'training' // 訓練
  | 'other' // その他

// 飛行形態
export type FlightType =
  | 'vlos' // 目視内飛行（Visual Line of Sight）
  | 'bvlos' // 目視外飛行（Beyond Visual Line of Sight）
  | 'night' // 夜間飛行
  | 'over_people' // 人口集中地区上空
  | 'over_event' // イベント上空
  | 'near_airport' // 空港周辺

// DIPS飛行申請
export interface DIPSApplication {
  id: string
  applicationNumber: string | null // DIPS申請番号
  status: DIPSApplicationStatus

  // 申請者情報
  applicantId: string
  applicantName: string
  organizationName?: string

  // ドローン情報
  droneId: string
  droneName: string
  droneRegistrationNumber: string

  // パイロット情報
  pilotId: string
  pilotName: string
  pilotLicenseNumber?: string

  // 飛行情報
  flightPurpose: FlightPurpose
  flightPurposeDetail: string
  flightTypes: FlightType[]

  // 飛行エリア
  flightArea: {
    name: string
    prefecture: string
    city: string
    address: string
    // GeoJSON座標
    coordinates: number[][][]
  }

  // 飛行日時
  scheduledStartDate: Date
  scheduledEndDate: Date
  flightTimeStart: string // HH:mm
  flightTimeEnd: string // HH:mm

  // 高度
  maxAltitude: number // メートル

  // 安全対策
  safetyMeasures: string[]
  emergencyProcedures: string
  insuranceInfo?: string

  // 申請履歴
  createdAt: Date
  updatedAt: Date
  submittedAt?: Date
  reviewedAt?: Date
  reviewerComment?: string

  // 添付ファイル
  attachments?: {
    id: string
    name: string
    type: string
    url: string
  }[]
}

// 飛行記録（フライトログ）
export interface FlightLog {
  id: string
  flightPlanId: string | null
  dipsApplicationId: string | null
  droneId: string
  droneName: string
  pilotId: string
  pilotName: string

  // 飛行時刻
  startTime: Date
  endTime: Date | null
  duration: number // 秒

  // 飛行情報
  purpose: FlightPurpose
  purposeDetail?: string

  // 飛行エリア
  location: {
    name: string
    prefecture: string
    city: string
  }

  // 飛行統計
  maxAltitude: number // メートル
  maxSpeed: number // m/s
  totalDistance: number // メートル

  // GPSトラック（GeoJSON LineString）
  flightPath?: {
    type: 'LineString'
    coordinates: number[][]
  }

  // バッテリー情報
  batteryStartLevel: number
  batteryEndLevel: number | null

  // 気象情報
  weather?: {
    temperature: number
    windSpeed: number
    windDirection: number
    visibility: string
    conditions: string
  }

  // 特記事項・インシデント
  notes?: string
  incidents?: string[]

  // メタデータ
  status: 'in_progress' | 'completed' | 'aborted'
  createdAt: Date
  updatedAt: Date
}

// UTMダッシュボード統計
export interface UTMStatistics {
  activeDrones: number
  totalFlightsToday: number
  totalFlightHoursToday: number
  activeAlerts: number
  criticalAlerts: number
  pendingApplications: number
  approvedApplications: number
  zoneViolations: number
  nearMissIncidents: number
}

// 衝突検知情報
export interface CollisionRisk {
  drone1Id: string
  drone1Name: string
  drone2Id: string
  drone2Name: string
  distance: number // メートル
  timeToCollision: number // 秒（負の場合は離れている）
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendedAction: string
}

// 気象情報
export interface WeatherData {
  timestamp: Date
  location: {
    latitude: number
    longitude: number
    name: string
  }
  current: {
    temperature: number // 摂氏
    humidity: number // %
    pressure: number // hPa
    windSpeed: number // m/s
    windDirection: number // 度
    windGust?: number // m/s (突風)
    visibility: number // km
    cloudCover: number // %
    conditions: string // 天気状態
    icon: string // 天気アイコンコード
  }
  // 短期予報（1時間以内）
  shortTermForecast?: {
    time: Date
    temperature: number
    windSpeed: number
    windDirection: number
    precipitation: number // mm
    precipitationProbability: number // %
    conditions: string
  }[]
  // 飛行適性評価
  flightCondition: {
    status: 'excellent' | 'good' | 'caution' | 'warning' | 'dangerous'
    message: string
    factors: string[]
  }
}

// 気象警告閾値
export interface WeatherThresholds {
  maxWindSpeed: number // m/s - これ以上で警告
  maxGustSpeed: number // m/s - 突風
  minVisibility: number // km
  maxPrecipitation: number // mm/h
}

// 退避ポイントの種類
export type EvacuationPointType = 'evacuation' | 'home' | 'alternate'

// 退避ポイント
export interface EvacuationPoint {
  id: string
  name: string
  type: EvacuationPointType
  position: {
    latitude: number
    longitude: number
    altitude: number
  }
  description?: string
}

// ドローンごとの退避状況
export interface DroneEvacuationStatus {
  droneId: string
  droneName: string
  // エラー・警告状態
  hasWarning: boolean
  warningLevel: 'info' | 'warning' | 'critical' | 'emergency'
  warningMessage?: string
  // 各ポイントまでの距離（メートル）
  distanceToDestination: number
  distanceToEvacuation: number | null // 退避ポイントが設定されていない場合はnull
  distanceToHome: number
  // 利用可能なアクション
  availableActions: EvacuationAction[]
  // 現在の飛行状態
  currentStatus: DroneFlightStatus['status']
  batteryLevel: number
  signalStrength: number
}

// 退避アクションの種類
export type EvacuationAction =
  | 'go_to_evacuation' // 退避ポイントへ移動
  | 'return_to_home' // ホームポイントへ帰還
  | 'continue_flight' // 飛行を継続
  | 'hover' // その場でホバリング
  | 'land_immediately' // 即時着陸

// 退避コマンド
export interface EvacuationCommand {
  droneId: string
  action: EvacuationAction
  targetPoint?: EvacuationPoint
  timestamp: Date
  issuedBy: string
}

// ============================================
// 飛行計画（Flight Plan）関連の型定義
// ============================================

// ウェイポイントの種類
export type WaypointType =
  | 'takeoff' // 離陸地点
  | 'waypoint' // 通過点
  | 'poi' // 関心地点（撮影ポイント等）
  | 'hover' // ホバリングポイント
  | 'landing' // 着陸地点

// ウェイポイントでのアクション
export type WaypointAction =
  | 'none' // アクションなし
  | 'take_photo' // 写真撮影
  | 'start_video' // 動画撮影開始
  | 'stop_video' // 動画撮影停止
  | 'hover' // ホバリング
  | 'rotate' // 機体回転
  | 'gimbal_pitch' // ジンバル角度変更

// ウェイポイント
export interface FlightPlanWaypoint {
  id: string
  order: number // 順番（0始まり）
  type: WaypointType
  name?: string
  position: {
    latitude: number
    longitude: number
    altitude: number // 対地高度（AGL）または海抜高度（AMSL）
  }
  altitudeMode: 'AGL' | 'AMSL' // 高度基準
  speed?: number // このポイントへの移動速度（m/s）
  heading?: number // 機首方位（0-360度）、nullの場合は次のポイントに向く
  gimbalPitch?: number // ジンバルピッチ角度（-90〜0度）
  // ウェイポイントでのアクション
  actions?: {
    type: WaypointAction
    params?: Record<string, unknown>
    duration?: number // アクション持続時間（秒）
  }[]
  // ホバリング時間（秒）
  hoverDuration?: number
}

// 飛行計画のステータス
export type FlightPlanStatus =
  | 'draft' // 下書き
  | 'pending_approval' // 承認待ち
  | 'approved' // 承認済み
  | 'rejected' // 却下
  | 'active' // 実行中
  | 'completed' // 完了
  | 'cancelled' // キャンセル

// 飛行計画
export interface FlightPlan {
  id: string
  name: string
  description?: string
  status: FlightPlanStatus

  // 関連情報
  droneId?: string
  droneName?: string
  pilotId?: string
  pilotName?: string
  dipsApplicationId?: string // DIPS申請との紐付け

  // ウェイポイント
  waypoints: FlightPlanWaypoint[]

  // 飛行経路設定
  corridorWidth: number // 飛行経路の幅（メートル）
  defaultSpeed: number // デフォルト飛行速度（m/s）
  defaultAltitude: number // デフォルト高度（メートル）
  altitudeMode: 'AGL' | 'AMSL' // 高度基準

  // ホームポイント（RTH用）
  homePoint: {
    latitude: number
    longitude: number
    altitude: number
  }

  // 退避ポイント
  evacuationPoints?: EvacuationPoint[]

  // 飛行予定
  scheduledStartTime?: Date
  scheduledEndTime?: Date
  estimatedDuration?: number // 推定飛行時間（秒）
  estimatedDistance?: number // 推定飛行距離（メートル）

  // 安全設定
  maxAltitude: number // 最大高度（メートル）
  minBatteryLevel: number // 最低バッテリー残量（%）- これを下回ったらRTH
  geofence?: {
    enabled: boolean
    coordinates: number[][][] // GeoJSONポリゴン
    maxAltitude: number
  }

  // メタデータ
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
}

// 飛行計画の検証結果
export interface FlightPlanValidation {
  isValid: boolean
  errors: FlightPlanValidationError[]
  warnings: FlightPlanValidationWarning[]
}

export interface FlightPlanValidationError {
  code: string
  message: string
  waypointId?: string
  field?: string
}

export interface FlightPlanValidationWarning {
  code: string
  message: string
  waypointId?: string
  field?: string
  suggestion?: string
}

// 飛行計画エディタのモード
export type FlightPlanEditorMode =
  | 'view' // 閲覧のみ
  | 'edit' // 編集モード
  | 'create' // 新規作成モード

// 飛行計画エディタで選択中の要素
export interface FlightPlanSelection {
  type: 'waypoint' | 'segment' | 'geofence' | 'none'
  waypointId?: string
  segmentIndex?: number
}

// ============================================
// インシデントレポート（Incident Report）関連の型定義
// ============================================

// インシデントの種類
export type IncidentType =
  | 'near_miss' // ニアミス
  | 'collision' // 衝突
  | 'crash' // 墜落
  | 'lost_link' // 通信途絶
  | 'flyaway' // フライアウェイ
  | 'battery_failure' // バッテリー異常
  | 'motor_failure' // モーター異常
  | 'gps_failure' // GPS異常
  | 'zone_violation' // 区域侵入
  | 'injury' // 人身事故
  | 'property_damage' // 物損
  | 'other' // その他

// インシデントの重大度
export type IncidentSeverity =
  | 'minor' // 軽微
  | 'moderate' // 中程度
  | 'serious' // 重大
  | 'critical' // 重大（報告義務あり）

// インシデントレポートのステータス
export type IncidentReportStatus =
  | 'draft' // 下書き
  | 'submitted' // 提出済み
  | 'under_review' // レビュー中
  | 'approved' // 承認済み
  | 'rejected' // 却下
  | 'closed' // クローズ

// 気象条件
export interface IncidentWeatherConditions {
  temperature?: number // 気温（摂氏）
  windSpeed?: number // 風速（m/s）
  windDirection?: number // 風向（度）
  visibility?: string // 視程
  precipitation?: string // 降水
  cloudCover?: string // 雲量
  conditions: string // 天候概要（晴れ、曇り等）
}

// 添付ファイル
export interface IncidentAttachment {
  id: string
  name: string
  type: 'image' | 'video' | 'document' | 'log' | 'other'
  mimeType: string
  size: number // bytes
  url: string
  uploadedAt: Date
  uploadedBy: string
}

// 是正措置
export interface CorrectiveAction {
  id: string
  description: string
  assignedTo?: string
  dueDate?: Date
  status: 'pending' | 'in_progress' | 'completed'
  completedAt?: Date
  notes?: string
}

// インシデントレポート
export interface IncidentReport {
  id: string
  reportNumber?: string // レポート番号（YYYYMMDD-XXX形式）
  status: IncidentReportStatus
  severity: IncidentSeverity

  // インシデント発生情報
  incidentType: IncidentType
  incidentTypeOther?: string // type が 'other' の場合の説明
  occurredAt: Date
  reportedAt: Date
  location: {
    name: string
    address?: string
    latitude: number
    longitude: number
    altitude?: number
  }

  // 関連情報
  flightPlanId?: string
  flightLogId?: string
  droneId: string
  droneName: string
  droneSerialNumber?: string
  pilotId: string
  pilotName: string

  // インシデント詳細
  title: string
  description: string
  cause?: string
  immediateActions?: string // 即時対応

  // 影響
  injuries: boolean
  injuryDetails?: string
  propertyDamage: boolean
  propertyDamageDetails?: string
  droneStatus: 'operational' | 'damaged' | 'destroyed' | 'lost'
  droneDamageDetails?: string

  // 気象条件
  weather?: IncidentWeatherConditions

  // 添付ファイル
  attachments?: IncidentAttachment[]

  // 是正措置
  correctiveActions?: CorrectiveAction[]

  // 規制報告
  regulatoryReport: {
    required: boolean
    reportedTo?: string[] // 報告先（国土交通省、警察等）
    reportedAt?: Date
    referenceNumber?: string
  }

  // メタデータ
  createdAt: Date
  updatedAt: Date
  createdBy: string
  updatedBy?: string
  submittedBy?: string
  submittedAt?: Date
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
}

// ============================================
// タイムラインイベント（Timeline Event）関連の型定義
// ============================================

// タイムラインイベントの種類
export type FlightTimelineEventType =
  | 'takeoff' // 離陸
  | 'landing' // 着陸
  | 'waypoint_reached' // ウェイポイント到達
  | 'route_change' // ルート変更
  | 'rth_start' // RTH開始
  | 'hover_start' // ホバリング開始
  | 'hover_end' // ホバリング終了
  | 'low_battery' // バッテリー低下
  | 'critical_battery' // バッテリー危険
  | 'signal_weak' // 信号弱
  | 'signal_lost' // 信号喪失
  | 'signal_recovered' // 信号回復
  | 'geofence_warning' // ジオフェンス警告
  | 'geofence_breach' // ジオフェンス逸脱
  | 'zone_approach' // 禁止区域接近
  | 'zone_violation' // 禁止区域侵入
  | 'collision_warning' // 衝突警告
  | 'weather_warning' // 気象警告
  | 'system_error' // システムエラー
  | 'motor_warning' // モーター警告
  | 'gps_warning' // GPS警告
  | 'manual_override' // 手動操作切替
  | 'auto_mode' // 自動モード切替
  | 'mission_start' // ミッション開始
  | 'mission_complete' // ミッション完了
  | 'mission_abort' // ミッション中断
  | 'photo_taken' // 写真撮影
  | 'video_start' // 動画開始
  | 'video_end' // 動画終了
  | 'custom' // カスタムイベント

// イベントの重要度
export type FlightTimelineEventSeverity =
  | 'info' // 情報（離陸、着陸、ウェイポイント等）
  | 'success' // 成功（ミッション完了等）
  | 'warning' // 警告（バッテリー低下、信号弱等）
  | 'error' // エラー（システムエラー、ジオフェンス逸脱等）
  | 'critical' // 緊急（衝突警告、信号喪失等）

// タイムラインイベント
export interface FlightTimelineEvent {
  id: string
  droneId: string
  type: FlightTimelineEventType
  severity: FlightTimelineEventSeverity
  timestamp: Date
  // イベントの表示情報
  title: string
  description?: string
  // イベントの詳細データ（種類によって異なる）
  data?: {
    // バッテリー関連
    batteryLevel?: number
    // 信号関連
    signalStrength?: number
    // 位置関連
    position?: {
      latitude: number
      longitude: number
      altitude: number
    }
    // ウェイポイント関連
    waypointId?: string
    waypointName?: string
    waypointIndex?: number
    // 区域関連
    zoneId?: string
    zoneName?: string
    distance?: number
    // 衝突関連
    relatedDroneId?: string
    relatedDroneName?: string
    // 気象関連
    windSpeed?: number
    windDirection?: number
    // その他
    [key: string]: unknown
  }
  // 関連リンク
  links?: {
    mapPosition?: boolean // マップで位置を表示
    flightLog?: string // フライトログID
    alert?: string // アラートID
    incident?: string // インシデントID
  }
  // 対応状況
  acknowledged?: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
}

// ドローンのイベント一覧
export interface DroneTimelineEvents {
  droneId: string
  events: FlightTimelineEvent[]
}

// ============================================
// UTMプロジェクト（Project）関連の型定義
// ============================================

// 飛行区域（プロジェクトの飛行エリア）
// NOTE: FlightArea型はutmDataModel.tsで定義されています
// 後方互換性のためここから再エクスポート
import type { FlightArea as FlightAreaType } from './utmDataModel'
export type FlightArea = FlightAreaType

// UTMプロジェクトのステータス
export type UTMProjectStatus = 'active' | 'scheduled' | 'completed' | 'standby'

// UTMプロジェクト
export interface UTMProject {
  id: string
  name: string
  description: string
  location: string
  prefecture: string
  status: UTMProjectStatus
  // 予定日時
  scheduledStart?: Date
  scheduledEnd?: Date
  // ドローン情報
  droneCount: number
  activeDroneCount: number
  droneIds?: string[] // 関連ドローンID
  // パイロット情報
  pilotName: string
  pilotId?: string
  // 飛行区域
  flightArea?: FlightArea
  // マップ表示用の中心座標 [lng, lat]
  centerCoordinates?: [number, number]
  // メタデータ
  lastUpdated: Date
  createdAt?: Date
}

// ============================================
// 空域判定（Airspace Assessment）関連の型定義
// ============================================

// 空域判定理由コード
export type AirspaceReasonCode =
  | 'controlled_airspace' // 管制空域
  | 'approach_surface' // 進入表面
  | 'airport_vicinity' // 空港周辺
  | 'did_area' // 人口集中地区
  | 'emergency_airspace' // 緊急用務空域
  | 'restricted_zone' // 制限区域
  | 'heliport_vicinity' // ヘリポート周辺
  | 'important_facility' // 重要施設周辺
  | 'nuclear_facility' // 原子力施設周辺
  | 'custom_restriction' // カスタム制限

// 空域判定リクエスト
export interface AirspaceAssessmentRequest {
  polygon: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  maxAltitude: number
  startTime: string // ISO8601
  endTime: string // ISO8601
  uavId: string
  operatorId: string
}

// 空域判定結果
export interface AirspaceAssessmentResult {
  id: string
  flightPlanId: string
  assessedAt: string
  notamRequired: boolean
  notifyList: string[] // 周知対象組織ID
  reasonCodes: AirspaceReasonCode[]
  restrictedZones: RestrictedZoneMatch[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  recommendations: string[]
  validUntil: string // 判定結果の有効期限
}

// 制限区域との交差情報
export interface RestrictedZoneMatch {
  zoneId: string
  zoneName: string
  zoneType: RestrictedZoneType
  restrictionLevel: RestrictionLevel
  overlapPercentage: number // 交差割合（%）
  requiresPermission: boolean
  requiresNotam: boolean
  authority: string
}

// ============================================
// 周知ワークフロー（Notification Workflow）関連の型定義
// ============================================

// 連絡先種別
export type ContactMethod = 'email' | 'sms' | 'api' | 'fax' | 'phone'

// 有人機団体
export interface OrganizationContact {
  id: string
  orgName: string
  orgType:
    | 'airline'
    | 'helicopter'
    | 'glider'
    | 'balloon'
    | 'military'
    | 'government'
    | 'other'
  contactType: ContactMethod
  contactValue: string
  priority: number // 1が最高優先
  isActive: boolean
  region: string // 担当地域
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// 周知ステータス
export type NotificationStatus =
  | 'pending' // 送信待ち
  | 'sending' // 送信中
  | 'sent' // 送信済み
  | 'delivered' // 配信確認済み
  | 'failed' // 送信失敗
  | 'confirmed' // 受信確認済み
  | 'bounced' // バウンス
  | 'expired' // 期限切れ

// 周知ログ
export interface NotificationLog {
  id: string
  flightPlanId: string
  orgId: string
  orgName: string
  method: ContactMethod
  status: NotificationStatus
  sentAt: string | null
  deliveredAt: string | null
  confirmedAt: string | null
  confirmedBy: string | null
  failureReason: string | null
  retryCount: number
  templateId: string
  messageContent: string
  createdAt: string
}

// 周知テンプレート
export interface NotificationTemplate {
  id: string
  name: string
  subject: string
  body: string
  method: ContactMethod
  variables: string[] // 利用可能な変数名
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// 周知送信リクエスト
export interface NotificationSendRequest {
  flightPlanId: string
  orgIds?: string[] // 指定がなければ空域判定結果のnotifyListを使用
  method?: ContactMethod // 指定がなければ各組織のデフォルト
  templateId?: string
}

// 周知サマリー
export interface NotificationSummary {
  flightPlanId: string
  total: number
  pending: number
  sent: number
  delivered: number
  confirmed: number
  failed: number
  lastUpdated: string
}

// ============================================
// NOTAM連携（NOTAM Integration）関連の型定義
// ============================================

// NOTAMステータス
export type NOTAMStatus =
  | 'draft' // 下書き
  | 'pending_review' // レビュー待ち
  | 'submitted' // 申請済み
  | 'processing' // 処理中
  | 'approved' // 承認
  | 'rejected' // 却下
  | 'published' // 発行済み
  | 'cancelled' // 取り消し
  | 'expired' // 期限切れ

// NOTAM申請
export interface NOTAMRequest {
  id: string
  flightPlanId: string
  status: NOTAMStatus
  notamId: string | null // 発行後のNOTAM ID (例: A1234/24)

  // 申請者情報
  requester: {
    name: string
    organization: string
    contact: string
    licenseNumber?: string
    phone?: string
    department?: string
  }

  // 飛行情報
  location: {
    polygon: string // WKT形式
    center: string // "lat,lng"
    radius?: number // km
    description: string
    prefecture?: string
    city?: string
    referencePoint?: string
  }

  time: {
    start: string // ISO8601
    end: string // ISO8601
    timezone: string
    dailySchedule?: string // 日次スケジュール (例: "09:00-17:00 JST")
    validDays?: string // 有効日 (例: "月-金（祝日除く）")
  }

  maxAltitudeM: number
  minAltitudeM?: number
  reason: string
  purpose?: string // 飛行目的の詳細

  // 機体情報
  aircraftInfo?: {
    type: string // 機体タイプ
    model: string // 機種名
    registrationNumber: string // 登録番号
    weight: string // 重量
    color?: string // 機体色
    maxSpeed?: string // 最大速度
    maxFlightTime?: string // 最大飛行時間
  }

  // 安全対策
  safetyMeasures: string | string[]

  // 緊急連絡先
  emergencyContact?: {
    primary: {
      name: string
      phone: string
      available: string
    }
    secondary?: {
      name: string
      phone: string
      available: string
    }
  }

  // 申請書類
  documents: {
    pdfUrl?: string
    jsonData: Record<string, unknown>
  }

  // 添付ファイル
  attachments:
    | string[]
    | {
        id: string
        name: string
        type: string
        size: number
        uploadedAt: string
      }[]

  // 関連NOTAM
  relatedNotams?: {
    id: string
    summary: string
    validFrom: string
    validTo: string
  }[]

  // 履歴
  submittedAt: string | null
  approvedAt: string | null
  publishedAt: string | null
  expiresAt: string | null

  // メタデータ
  createdAt: string
  updatedAt: string
  createdBy: string
  reviewedBy: string | null
  reviewerName?: string | null
  reviewComment: string | null

  // 審査履歴
  reviewHistory?: {
    action: string
    by: string
    at: string
    comment: string
  }[]
}

// NOTAM申請書JSONデータ
export interface NOTAMJsonData {
  flightId: string
  requester: {
    name: string
    contact: string
    organization?: string
  }
  location: {
    polygon: string
    center: string
    description: string
  }
  time: {
    start: string
    end: string
  }
  maxAltitudeM: number
  reason: string
  safetyMeasures: string
  attachments: string[]
}

// ============================================
// 承認ワークフロー（Approval Workflow）関連の型定義
// ============================================

// 承認ステータス
export type ApprovalStatus =
  | 'pending' // 承認待ち
  | 'in_review' // レビュー中
  | 'approved' // 承認
  | 'rejected' // 却下
  | 'revision_required' // 修正要求
  | 'cancelled' // 取り消し

// 承認リクエスト
export interface ApprovalRequest {
  id: string
  flightPlanId: string
  status: ApprovalStatus
  requestedAt: string
  requestedBy: string
  requestedByName: string
  // 承認条件
  prerequisites: {
    airspaceAssessed: boolean
    notificationsConfirmed: boolean
    notamSubmitted: boolean
    preflightChecked: boolean
  }
  // 承認情報
  reviewedAt: string | null
  reviewedBy: string | null
  reviewedByName: string | null
  decision: 'approved' | 'rejected' | null
  comment: string | null
  // 優先度
  priority: 'normal' | 'high' | 'urgent'
  dueDate: string | null
  // メタデータ
  createdAt: string
  updatedAt: string
}

// 承認履歴
export interface ApprovalHistory {
  id: string
  approvalRequestId: string
  action:
    | 'submitted'
    | 'reviewed'
    | 'approved'
    | 'rejected'
    | 'revision_requested'
    | 'cancelled'
  performedBy: string
  performedByName: string
  performedAt: string
  comment: string | null
  previousStatus: ApprovalStatus
  newStatus: ApprovalStatus
}

// ============================================
// プリフライトチェック（Preflight Check）関連の型定義
// ============================================

// チェック項目カテゴリ
export type PreflightCheckCategory =
  | 'aircraft' // 機体
  | 'communication' // 通信
  | 'weather' // 気象
  | 'environment' // 周辺環境
  | 'personnel' // 人員
  | 'emergency' // 緊急手順
  | 'documentation' // 書類

// チェック項目
export interface PreflightCheckItem {
  id: string
  category: PreflightCheckCategory
  label: string
  description: string
  required: boolean
  order: number
}

// チェック結果
export interface PreflightCheckResult {
  itemId: string
  checked: boolean
  checkedAt: string | null
  checkedBy: string | null
  notes: string | null
}

// プリフライトチェックリスト
export interface PreflightChecklist {
  id: string
  flightPlanId: string
  droneId: string
  pilotId: string
  pilotName: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  items: PreflightCheckItem[]
  results: PreflightCheckResult[]
  startedAt: string | null
  completedAt: string | null
  allRequiredPassed: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

// デフォルトチェックリスト項目
export const DEFAULT_PREFLIGHT_ITEMS: PreflightCheckItem[] = [
  // 機体
  {
    id: 'aircraft_1',
    category: 'aircraft',
    label: '機体外観良好',
    description: '機体に損傷や異常がないことを確認',
    required: true,
    order: 1,
  },
  {
    id: 'aircraft_2',
    category: 'aircraft',
    label: 'プロペラ損傷なし',
    description: 'プロペラに欠けや亀裂がないことを確認',
    required: true,
    order: 2,
  },
  {
    id: 'aircraft_3',
    category: 'aircraft',
    label: 'バッテリー残量OK',
    description: 'バッテリー残量が十分であることを確認',
    required: true,
    order: 3,
  },
  // 通信
  {
    id: 'comm_1',
    category: 'communication',
    label: '地上局通信良好',
    description: 'コントローラーとの通信が正常であることを確認',
    required: true,
    order: 4,
  },
  {
    id: 'comm_2',
    category: 'communication',
    label: '冗長通信手段確認',
    description: '予備の通信手段が準備されていることを確認',
    required: false,
    order: 5,
  },
  // 気象
  {
    id: 'weather_1',
    category: 'weather',
    label: '風速が運用基準内',
    description: '風速が飛行可能な範囲内であることを確認',
    required: true,
    order: 6,
  },
  {
    id: 'weather_2',
    category: 'weather',
    label: '視程が運用基準内',
    description: '視程が飛行可能な範囲内であることを確認',
    required: true,
    order: 7,
  },
  // 周辺環境
  {
    id: 'env_1',
    category: 'environment',
    label: '飛行エリアに障害物なし',
    description: '飛行エリア内に障害物がないことを確認',
    required: true,
    order: 8,
  },
  {
    id: 'env_2',
    category: 'environment',
    label: '有人機の予定なし',
    description: '周知確認済みで有人機の飛行予定がないことを確認',
    required: true,
    order: 9,
  },
  // 人員
  {
    id: 'personnel_1',
    category: 'personnel',
    label: '操縦者資格確認',
    description: '操縦者の資格が有効であることを確認',
    required: true,
    order: 10,
  },
  {
    id: 'personnel_2',
    category: 'personnel',
    label: '補助者配置確認',
    description: '必要に応じて補助者が配置されていることを確認',
    required: false,
    order: 11,
  },
  // 緊急手順
  {
    id: 'emergency_1',
    category: 'emergency',
    label: 'RTH設定完了',
    description: 'Return to Home設定が完了していることを確認',
    required: true,
    order: 12,
  },
  {
    id: 'emergency_2',
    category: 'emergency',
    label: '緊急連絡先確認',
    description: '緊急時の連絡先を確認',
    required: true,
    order: 13,
  },
  // 書類
  {
    id: 'doc_1',
    category: 'documentation',
    label: '飛行計画登録済',
    description: '飛行計画がシステムに登録されていることを確認',
    required: true,
    order: 14,
  },
  {
    id: 'doc_2',
    category: 'documentation',
    label: 'NOTAM/周知ステータス確認',
    description: 'NOTAM申請と周知の状況を確認',
    required: true,
    order: 15,
  },
]

// ============================================
// 監査ログ（Audit Log）関連の型定義
// ============================================

// 監査アクション
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'submit'
  | 'cancel'
  | 'send_notification'
  | 'confirm_notification'
  | 'submit_notam'
  | 'publish_notam'
  | 'start_flight'
  | 'end_flight'
  | 'emergency_action'
  | 'login'
  | 'logout'

// エンティティタイプ
export type AuditEntityType =
  | 'flight_plan'
  | 'approval_request'
  | 'notification'
  | 'notam_request'
  | 'preflight_checklist'
  | 'incident_report'
  | 'drone'
  | 'operator'
  | 'organization'
  | 'user'

// 監査ログエントリ
export interface AuditLogEntry {
  id: string
  timestamp: string
  action: AuditAction
  entityType: AuditEntityType
  entityId: string
  entityName: string
  userId: string
  userName: string
  userRole: string
  ipAddress: string
  userAgent: string
  // 変更内容
  changes?: {
    field: string
    oldValue: unknown
    newValue: unknown
  }[]
  // メタデータ
  metadata?: Record<string, unknown>
  // ハッシュチェーン
  hash: string
  previousHash: string
}

// 監査ログ検索条件
export interface AuditLogFilter {
  startDate?: string
  endDate?: string
  actions?: AuditAction[]
  entityTypes?: AuditEntityType[]
  entityId?: string
  userId?: string
  searchText?: string
}

// ============================================
// 落下分散範囲算出（Fall Dispersion Calculation）関連の型定義
// ============================================

// 機体スペック
export interface AircraftSpecs {
  weight: number // 機体重量（kg）
  maxSpeed: number // 最大速度（m/s）
  dragCoefficient: number // 抗力係数
  frontalArea: number // 前面投影面積（m²）
  motorCount: number // モーター数
  propellerDiameter: number // プロペラ直径（cm）
}

// 気象条件（落下計算用）
export interface FallCalculationWeather {
  windSpeed: number // 風速（m/s）
  windDirection: number // 風向（度、北=0）
  temperature: number // 気温（℃）
  pressure: number // 気圧（hPa）
  altitude: number // 標高（m）
}

// 落下分散範囲計算入力
export interface FallDispersionInput {
  flightAltitude: number // 飛行高度（m）
  cruiseSpeed: number // 巡航速度（m/s）
  aircraft: AircraftSpecs
  weather: FallCalculationWeather
  failureScenario: 'motor_stop' | 'full_power_loss' | 'control_loss' // 故障シナリオ
}

// 落下分散範囲計算結果
export interface FallDispersionResult {
  id: string
  calculatedAt: string
  // 計算入力パラメータ
  input: FallDispersionInput
  // 計算結果
  fallTime: number // 落下時間（秒）
  horizontalDistance: number // 水平移動距離（m）
  windDriftDistance: number // 風による移動距離（m）
  totalDispersionRadius: number // 総合分散半径（m）
  // 安全離隔距離
  safetyMargin: number // 安全係数（通常1.2〜1.5）
  requiredSafeDistance: number // 必要安全離隔距離（m）
  // 分散楕円
  dispersionEllipse: {
    centerLat: number
    centerLng: number
    semiMajorAxis: number // 長軸（m）
    semiMinorAxis: number // 短軸（m）
    rotation: number // 回転角度（度）
  }
  // GeoJSON形式のポリゴン
  dispersionPolygon: {
    type: 'Polygon'
    coordinates: number[][][]
  }
  // 計算根拠
  calculationBasis: string
  warnings: string[]
}

// ============================================
// 座標入力自動化（Coordinate Automation）関連の型定義
// ============================================

// 座標形式
export type CoordinateFormat =
  | 'decimal' // 10進度形式 (35.6812, 139.7671)
  | 'dms' // 度分秒形式 (35°40'52"N, 139°46'02"E)
  | 'dmm' // 度分形式 (35°40.867'N, 139°46.033'E)
  | 'mgrs' // MGRSグリッド (54SUE8520)
  | 'utm' // UTM形式 (54N 385205 3950000)

// 座標データ
export interface CoordinateData {
  latitude: number
  longitude: number
  altitude?: number
  name?: string
  type?:
    | 'waypoint'
    | 'polygon_vertex'
    | 'center'
    | 'landing'
    | 'takeoff'
    | 'emergency_landing'
  order?: number
}

// Excel座標抽出結果
export interface ExcelCoordinateExtraction {
  id: string
  fileName: string
  extractedAt: string
  // 抽出された座標
  coordinates: CoordinateData[]
  // 抽出方法
  extractionMethod: 'auto' | 'column_mapping' | 'regex'
  // 検出された形式
  detectedFormat: CoordinateFormat
  // エラー
  errors: {
    row: number
    column: string
    message: string
    originalValue: string
  }[]
  // 変換結果
  conversionResults: {
    total: number
    success: number
    failed: number
    skipped: number
  }
}

// Excel列マッピング
export interface ExcelColumnMapping {
  latitudeColumn: string // 緯度列（例: "A", "緯度", "lat"）
  longitudeColumn: string // 経度列
  altitudeColumn?: string // 高度列
  nameColumn?: string // 名称列
  typeColumn?: string // 種別列
  orderColumn?: string // 順番列
  headerRow: number // ヘッダー行番号
  dataStartRow: number // データ開始行
}

// ============================================
// 書類自動生成（Document Generation）関連の型定義
// ============================================

// 書類テンプレート種別
export type DocumentTemplateType =
  | 'manned_aircraft_notification' // 有人機団体への調整書
  | 'notam_application' // NOTAM申請書
  | 'flight_plan_summary' // 飛行計画概要
  | 'preflight_checklist' // プリフライトチェックリスト
  | 'incident_report' // インシデントレポート
  | 'fiss_notification' // FISS通報書

// 書類テンプレート
export interface DocumentTemplate {
  id: string
  name: string
  type: DocumentTemplateType
  format: 'docx' | 'xlsx' | 'pdf'
  version: string
  description: string
  // テンプレート内の変数
  variables: {
    name: string
    label: string
    type: 'string' | 'number' | 'date' | 'coordinates' | 'polygon' | 'table'
    required: boolean
    defaultValue?: string
  }[]
  // テンプレートファイルURL
  templateUrl: string
  previewUrl?: string
  // メタデータ
  createdAt: string
  updatedAt: string
  createdBy: string
}

// 書類生成リクエスト
export interface DocumentGenerationRequest {
  templateId: string
  flightPlanId: string
  // 変数値
  variables: Record<string, unknown>
  // 出力形式
  outputFormat: 'docx' | 'pdf'
  // 追加オプション
  options?: {
    includeMap?: boolean // 地図画像を含める
    includeCoordinateTable?: boolean // 座標表を含める
    includeDispersionArea?: boolean // 落下分散範囲を含める
    language?: 'ja' | 'en'
  }
}

// 生成された書類
export interface GeneratedDocument {
  id: string
  templateId: string
  templateName: string
  flightPlanId: string
  // ファイル情報
  fileName: string
  fileSize: number
  mimeType: string
  downloadUrl: string
  // 生成情報
  generatedAt: string
  generatedBy: string
  expiresAt: string // ダウンロードURL有効期限
  // ステータス
  status: 'generating' | 'completed' | 'failed'
  errorMessage?: string
}

// ============================================
// FISS連携（Flight Information Sharing System）関連の型定義
// ============================================

// FISS通報ステータス
export type FISSNotificationStatus =
  | 'draft' // 下書き
  | 'pending' // 送信待ち
  | 'submitted' // 送信済み
  | 'acknowledged' // 受領確認済み
  | 'rejected' // 却下
  | 'expired' // 期限切れ

// FISS通報データ
export interface FISSNotification {
  id: string
  flightPlanId: string
  status: FISSNotificationStatus
  // 飛行情報
  flightInfo: {
    operatorName: string
    operatorContact: string
    droneRegistrationNumber: string
    droneModel: string
    purpose: string
    startTime: string
    endTime: string
  }
  // 飛行区域
  flightArea: {
    polygon: {
      type: 'Polygon'
      coordinates: number[][][]
    }
    maxAltitude: number
    minAltitude: number
    description: string
  }
  // 送信履歴
  submittedAt?: string
  acknowledgedAt?: string
  referenceNumber?: string // FISS参照番号
  // メタデータ
  createdAt: string
  updatedAt: string
  createdBy: string
}

// ============================================
// 統合ワークフローステータス
// ============================================

// 飛行計画の統合ステータス
export interface FlightPlanWorkflowStatus {
  flightPlanId: string
  flightPlanName: string
  // 各ステップのステータス
  steps: {
    flightPlan: {
      status: FlightPlanStatus
      updatedAt: string
    }
    airspaceAssessment: {
      status: 'pending' | 'completed' | 'expired'
      result?: AirspaceAssessmentResult
      updatedAt: string | null
    }
    notification: {
      status: 'pending' | 'sending' | 'partial' | 'completed' | 'failed'
      summary?: NotificationSummary
      updatedAt: string | null
    }
    notam: {
      status: 'not_required' | 'pending' | 'submitted' | 'approved' | 'rejected'
      request?: NOTAMRequest
      updatedAt: string | null
    }
    approval: {
      status: ApprovalStatus | 'not_submitted'
      request?: ApprovalRequest
      updatedAt: string | null
    }
    preflightCheck: {
      status: 'pending' | 'in_progress' | 'completed' | 'failed'
      checklist?: PreflightChecklist
      updatedAt: string | null
    }
  }
  // 全体の進捗
  overallProgress: number // 0-100
  canStartFlight: boolean
  isReadyForFlight?: boolean
  currentStep?: string
  blockers: string[]
  nextAction: string
}

// ============================================
// 飛行モニタリング（Flight Monitoring）関連の型定義
// ============================================

// 拡張された制限区域タイプ
export type ExtendedRestrictedZoneType =
  | RestrictedZoneType
  | 'manned_aircraft_area' // 有人機発着エリア
  | 'remote_id_area' // リモートID特定区域
  | 'sua_red_zone' // 小型無人機等飛行禁止法 レッドゾーン
  | 'sua_yellow_zone' // 小型無人機等飛行禁止法 イエローゾーン

// マップレイヤーカテゴリ
export type MapLayerCategory =
  | 'restricted_area' // 禁止エリア
  | 'geographic' // 地理情報
  | 'weather' // 天候情報
  | 'signal' // 電波情報

// マップレイヤー種別
export type MapLayerType =
  // 禁止エリア
  | 'airport_vicinity' // 空港など周辺空域
  | 'did_area' // 人口集中地区
  | 'emergency_airspace' // 緊急用務空域
  | 'manned_aircraft_area' // 有人機発着エリア
  | 'remote_id_area' // リモートID特定区域
  | 'sua_red_zone' // 小型無人機等飛行禁止法 レッドゾーン
  | 'sua_yellow_zone' // 小型無人機等飛行禁止法 イエローゾーン
  // 地理情報
  | 'terrain' // 地物
  // 天候情報
  | 'rain_cloud' // 雨雲
  | 'wind' // 風向・風量
  // 電波情報
  | 'lte_coverage' // LTEカバレッジ

// マップレイヤー設定
export interface MapLayerConfig {
  id: MapLayerType
  label: string
  labelEn: string
  category: MapLayerCategory
  color: string
  borderColor?: string
  borderStyle?: 'solid' | 'dashed'
  opacity?: number
  enabled: boolean
  zIndex?: number
}

// マップレイヤー表示状態
export interface MapLayerState {
  layers: Record<MapLayerType, boolean>
}

// 拡張ドローン情報（モニタリング用）
export interface ExtendedDroneInfo {
  // 基本情報
  droneId: string
  droneName: string // 機体管理名 ★★★
  modelName: string // 機種名 ★★
  juNumber?: string // JU番号 ★

  // バッテリ情報
  batteryLevel: number // バッテリ残量（%）
  batteryVoltage?: number // バッテリ電圧（V）
  batteryTemperature?: number // バッテリ温度（℃）

  // GPS情報
  gps: {
    satelliteCount: number // 衛星捕捉数
    hdop?: number // 水平精度低下率
    vdop?: number // 垂直精度低下率
    fixType: 'no_fix' | '2d' | '3d' | 'dgps' | 'rtk_float' | 'rtk_fixed'
  }

  // 電波情報（Good to have）
  signal?: {
    lte?: {
      rssi: number // 受信信号強度（dBm）
      rsrp?: number // 参照信号受信電力
      rsrq?: number // 参照信号受信品質
      carrier?: string // キャリア名
    }
    radio24ghz?: {
      rssi: number
      channel?: number
    }
    radio58ghz?: {
      rssi: number
      channel?: number
    }
  }

  // 高度情報
  altitude: {
    agl: number // 対地高度（Above Ground Level）★★★
    amsl: number // 平均海抜高度（Above Mean Sea Level）★★
    relative: number // 相対高度（離陸地点基準）★
  }

  // 位置情報
  position: {
    latitude: number
    longitude: number
    heading: number // 方位（0-360度）
  }

  // 姿勢情報
  attitude: {
    roll: number // ロール（度）
    pitch: number // ピッチ（度）
    yaw: number // ヨー（度）
  }

  // フライトモード（Good to have）
  flightMode: 'auto' | 'manual' | 'rth' | 'hover' | 'landing' | 'unknown'

  // タイムスタンプ
  lastUpdated: Date
}

// フライトステータス（飛行状態）
export type FlightStatus =
  | 'preflight' // フライト開始前状態
  | 'takeoff' // 離陸状態
  | 'in_flight' // フライト中状態
  | 'landing' // 着陸状態
  | 'completed' // フライト終了状態

// 気象情報（モニタリング用）
export interface MonitoringWeatherData {
  // 天気 ★★★
  weather: {
    condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown'
    description: string
    icon?: string
  }

  // 風 ★★★
  wind: {
    speed: number // 風速（m/s）
    direction: number // 風向（0-360度）
    gust?: number // 突風（m/s）
  }

  // 雨 ★★★
  precipitation: {
    amount: number // 降雨量（mm/h）
    probability?: number // 降水確率（%）
  }

  // 気圧 ★
  pressure: number // hPa

  // 気温 ★
  temperature: number // 摂氏

  // 湿度 ★
  humidity: number // %

  // 予報（Good to have）
  forecast?: {
    time: Date
    wind: {
      speed: number
      direction: number
    }
    weather: {
      condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'unknown'
    }
  }[]

  // 観測地点
  location: {
    latitude: number
    longitude: number
    name: string
  }

  // 更新時刻
  updatedAt: Date
}

// アラート閾値設定
export interface AlertThresholdConfig {
  id: string
  droneModelId?: string // 機体型式ごとの設定
  droneModelName?: string

  // Warning閾値
  warning: {
    // 制限高度付近 ★★
    altitudeLimit: {
      enabled: boolean
      threshold: number // メートル（デフォルト: 130m）
    }
    // 計画ルートからの逸脱 ★★
    routeDeviation: {
      enabled: boolean
      threshold: number // メートル
    }
    // バッテリレベル ★★
    batteryLevel: {
      enabled: boolean
      threshold: number // %（デフォルト: 40%）
    }
    // GPS ★★
    gpsSignal: {
      enabled: boolean
      minSatellites: number // 最小衛星数
    }
    // 通信 ★★
    signalStrength: {
      enabled: boolean
      threshold: number // %
    }
    // IMU/システムエラー ★★
    systemError: {
      enabled: boolean
    }
    // 気象（風）★★
    windSpeed: {
      enabled: boolean
      threshold: number // m/s
    }
  }

  // Alert閾値
  alert: {
    // 制限高度超過 ★★★
    altitudeExceeded: {
      enabled: boolean
      threshold: number // メートル（デフォルト: 150m）
    }
    // ジオケージ逸脱 ★★★
    geofenceBreach: {
      enabled: boolean
    }
    // ジオフェンス侵入 ★★★
    zoneViolation: {
      enabled: boolean
    }
    // バッテリ低下 ★★★
    batteryLow: {
      enabled: boolean
      threshold: number // %（デフォルト: 30%）
    }
  }

  // メタデータ
  createdAt: Date
  updatedAt: Date
}

// アラートログエントリ
export interface AlertLogEntry {
  id: string
  droneId: string
  droneName: string
  type: 'warning' | 'alert'
  category: AlertType
  severity: AlertSeverity
  message: string
  details?: string
  timestamp: Date
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: Date
  // 関連データ
  data?: {
    position?: {
      latitude: number
      longitude: number
      altitude: number
    }
    value?: number // 閾値超過時の実際の値
    threshold?: number // 設定された閾値
  }
}

// ドローン選択状態
export interface DroneSelectionState {
  selectedDroneIds: string[]
  maxSelection: number // 選択上限（デフォルト: 10）
}

// モニタリング画面の表示設定
export interface MonitoringViewConfig {
  // 表示モード
  viewMode: 'map' | 'list' | 'split'
  // マップ設定
  map: {
    layers: MapLayerState
    showFlightPlan: boolean
    showOtherFlightPlans: boolean
    autoFollow: boolean // 選択機体を自動追従
  }
  // リスト設定
  list: {
    sortBy: 'name' | 'status' | 'battery' | 'altitude'
    sortOrder: 'asc' | 'desc'
  }
  // アラート設定
  alert: {
    soundEnabled: boolean
    voiceEnabled: boolean // 音声通知
  }
}

// ============================================
// マルチサイト対応（Multi-Site Support）関連の型定義
// ============================================

// サイト情報
export interface SiteInfo {
  id: string
  name: string
  location: {
    latitude: number
    longitude: number
  }
  drones: string[] // droneIds
  description?: string
}

// ============================================
// スケジュール・人員配置関連
// ============================================

/** 人員の役割 */
export type CrewRole =
  | 'pilot' // 操縦者
  | 'observer' // 補助者/監視員
  | 'safety_manager' // 安全管理者
  | 'ground_crew' // 地上要員
  | 'coordinator' // 調整役

/** 人員配置ステータス */
export type CrewAssignmentStatus =
  | 'assigned' // 割り当て済み
  | 'confirmed' // 確認済み
  | 'on_site' // 現場到着
  | 'unavailable' // 不参加

/** 人員配置 */
export interface CrewAssignment {
  id: string
  userId: string
  userName: string
  role: CrewRole
  status: CrewAssignmentStatus
  contactPhone?: string
  notes?: string
}

/** スケジュール（1日分） */
export interface FlightSchedule {
  id: string
  date: Date
  projectId: string
  projectName: string
  /** 配置人員 */
  crew: CrewAssignment[]
  /** 予定フライト */
  flightIds: string[]
  /** スケジュールステータス */
  status: 'draft' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  /** 備考 */
  notes?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================
// NOTAM申請関連
// ============================================

/** NOTAM申請ステータス */
export type NOTAMApplicationStatus =
  | 'not_required' // 申請不要
  | 'draft' // 下書き
  | 'pending_review' // 審査待ち
  | 'under_review' // 審査中
  | 'revision_required' // 修正要求
  | 'approved' // 承認済み
  | 'published' // 発行済み
  | 'rejected' // 却下
  | 'expired' // 期限切れ

/** NOTAM申請 */
export interface NOTAMApplication {
  id: string
  flightPlanId: string
  /** NOTAM番号（発行後） */
  notamNumber?: string
  status: NOTAMApplicationStatus

  /** 申請内容 */
  flightArea: {
    centerLat: number
    centerLng: number
    radius: number // メートル
    description: string
  }
  maxAltitude: number // フィート
  scheduledStartTime: Date
  scheduledEndTime: Date
  purpose: string

  /** 申請履歴 */
  submittedAt?: Date
  reviewedAt?: Date
  publishedAt?: Date
  expiresAt?: Date

  /** 審査コメント */
  reviewerComments?: string[]

  createdAt: Date
  updatedAt: Date
}

// ============================================
// プリフライト関連
// ============================================

/** プリフライトフェーズ */
export type PreflightPhase =
  | 'planning_review' // 計画確認
  | 'aircraft_inspection' // 機体点検
  | 'environment_check' // 環境確認
  | 'crew_briefing' // 人員ブリーフィング
  | 'alert_setup' // アラート設定
  | 'final_confirmation' // 最終確認

/** プリフライトチェック項目（拡張版） */
export interface PreflightCheckItemExtended {
  id: string
  phase: PreflightPhase
  category: PreflightCheckCategory
  label: string
  description?: string
  isRequired: boolean
  isCompleted: boolean
  completedBy?: string
  completedAt?: Date
  notes?: string
}

/** プリフライト全体ステータス */
export interface PreflightStatusExtended {
  flightId: string
  /** 各フェーズの完了状況 */
  phases: {
    phase: PreflightPhase
    label: string
    status: 'pending' | 'in_progress' | 'completed' | 'skipped'
    progress: number // 0-100
    items: PreflightCheckItemExtended[]
  }[]
  /** 全体進捗 */
  overallProgress: number // 0-100
  /** 飛行可否判定 */
  canStartFlight: boolean
  /** 飛行不可理由（ある場合） */
  blockingReasons?: string[]
}

// ポストフライトレポート
export interface PostflightReport {
  id: string
  flightId: string
  completedAt: Date
  flightDuration: number // 秒
  totalDistance: number // メートル
  incidents: string[]
  notes: string
  attachments: {
    id: string
    url: string
    type: 'image' | 'video' | 'document' | 'log' | 'other'
    name: string
    size: number // bytes
    uploadedAt: Date
  }[]
  // サイトごとのレポート（マルチサイトの場合）
  siteReports?: {
    siteId: string
    siteName: string
    incidents: string[]
    notes: string
  }[]
  // メタデータ
  createdAt: Date
  updatedAt: Date
  createdBy: string
  status: 'draft' | 'submitted' | 'approved'
}
