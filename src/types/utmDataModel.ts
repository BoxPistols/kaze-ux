/**
 * UTM データモデル型定義
 *
 * プロジェクト、飛行計画、機体、ユーザー、クルー割当の
 * 紐づけを定義する中核的な型定義ファイル
 */

// ============================================
// Project（プロジェクト）
// ============================================

export interface Project {
  id: string
  name: string
  description?: string
  clientName?: string
  location: ProjectLocation
  status: ProjectStatus
  startDate: string // ISO8601
  endDate?: string // ISO8601
  createdAt: string
  updatedAt: string
  createdBy: string // User.id
}

export interface ProjectLocation {
  name: string
  coordinates: [number, number] // [lng, lat]
  address?: string
}

export type ProjectStatus =
  | 'draft' // 下書き
  | 'planning' // 計画中
  | 'active' // 実施中
  | 'completed' // 完了
  | 'cancelled' // キャンセル

// ============================================
// FlightPlan（飛行計画）
// ============================================

export interface FlightPlan {
  id: string
  projectId: string // Project.id
  name: string

  // スケジュール
  scheduledDate: string // ISO8601 (日付)
  scheduledStartTime: string // ISO8601 (開始時刻)
  scheduledEndTime: string // ISO8601 (終了時刻)

  // 飛行エリア
  flightArea: FlightArea

  // 機体割当
  aircraftId: string // Aircraft.id

  // 飛行目的
  purpose: FlightPurpose
  purposeDetail?: string

  // 許可状況
  permits: FlightPermits

  // ワークフロー状態
  status: FlightPlanStatus
  preflightStatus: PreflightStatus

  // 実績
  actualStartTime?: string
  actualEndTime?: string

  // メタデータ
  createdAt: string
  updatedAt: string
  createdBy: string // User.id
}

export interface FlightArea {
  // 飛行エリア名（表示用）
  name?: string
  // エリアのタイプ
  type: 'polygon' | 'circle' | 'corridor'
  // GeoJSON形式の座標（GeoJSON.Geometry または Polygon座標配列）
  coordinates: GeoJSON.Geometry | number[][][]
  // 高度制限（メートル）
  maxAltitude: number
  minAltitude?: number
  // 表示色（16進数カラーコード）
  color?: string
}

export interface FlightPermits {
  dipsRegistered: boolean // DIPS登録
  dipsNumber?: string // DIPS番号
  flightPermission: boolean // 飛行許可
  permissionNumber?: string
  notamRequired: boolean // NOTAM必要
  notamIssued?: boolean
}

export type FlightPurpose =
  | 'inspection' // 点検
  | 'survey' // 測量
  | 'photography' // 撮影
  | 'delivery' // 配送
  | 'agriculture' // 農業
  | 'emergency' // 緊急
  | 'training' // 訓練
  | 'other' // その他

export type FlightPlanStatus =
  | 'draft' // 下書き
  | 'pending' // 承認待ち
  | 'approved' // 承認済み
  | 'ready' // 準備完了（飛行可能）
  | 'in_flight' // 飛行中
  | 'completed' // 完了
  | 'aborted' // 中止
  | 'cancelled' // キャンセル

export type PreflightStatus =
  | 'not_started' // 未着手
  | 'in_progress' // 準備中
  | 'completed' // 準備完了
  | 'failed' // 準備失敗（要再確認）

// ============================================
// Aircraft（機体）
// ============================================

export interface Aircraft {
  id: string
  name: string // 機体名
  model: string // 機種
  manufacturer: string // メーカー
  serialNumber: string // シリアル番号
  registrationNumber: string // 登録記号（JA〜）

  // リモートID
  remoteId: RemoteIdInfo

  // スペック
  specs: AircraftSpecs

  // 状態
  status: AircraftStatus
  lastMaintenanceDate?: string
  nextMaintenanceDate?: string
  totalFlightTime: number // 累計飛行時間（分）

  // 保険
  insurance: InsuranceInfo

  createdAt: string
  updatedAt: string
}

export interface RemoteIdInfo {
  registered: boolean
  number?: string
}

export interface AircraftSpecs {
  maxFlightTime: number // 分
  maxSpeed: number // m/s
  maxAltitude: number // m
  maxPayload: number // kg
  weight: number // kg（機体重量）
}

export interface InsuranceInfo {
  valid: boolean
  expiryDate?: string
  policyNumber?: string
}

export type AircraftStatus =
  | 'available' // 利用可能
  | 'in_use' // 使用中
  | 'maintenance' // メンテナンス中
  | 'grounded' // 飛行停止
  | 'retired' // 退役

// ============================================
// User（ユーザー）
// ============================================

export interface User {
  id: string
  name: string
  email: string
  phone?: string

  // 資格
  qualifications: Qualification[]

  // ロール
  roles: UserRole[]

  // 所属
  organizationId?: string
  department?: string

  status: UserStatus
  createdAt: string
  updatedAt: string
}

export interface Qualification {
  type: QualificationType
  number?: string // 資格番号
  issuedDate: string
  expiryDate?: string
  isValid: boolean
}

export type QualificationType =
  | 'pilot_license' // 操縦ライセンス
  | 'first_class' // 一等無人航空機操縦士
  | 'second_class' // 二等無人航空機操縦士
  | 'instructor' // 講習機関修了
  | 'safety_manager' // 安全管理者
  | 'other'

export type UserRole =
  | 'admin' // システム管理者
  | 'manager' // 運航管理者
  | 'pilot' // 操縦者
  | 'observer' // 補助者/監視員
  | 'safety_officer' // 安全管理者
  | 'viewer' // 閲覧者

export type UserStatus = 'active' | 'inactive' | 'suspended'

// ============================================
// CrewAssignment（クルー割当）
// ============================================

export interface CrewAssignment {
  id: string
  flightPlanId: string // FlightPlan.id
  userId: string // User.id
  role: CrewRole
  isPrimary: boolean // 主担当かどうか
  confirmedAt?: string // 本人確認日時
  status: CrewAssignmentStatus
}

export type CrewRole =
  | 'pilot_in_command' // 機長（操縦者）
  | 'remote_pilot' // 操縦者
  | 'observer' // 補助者
  | 'safety_manager' // 安全管理者
  | 'ground_crew' // 地上要員

export type CrewAssignmentStatus =
  | 'assigned' // 割当済み
  | 'confirmed' // 本人確認済み
  | 'declined' // 辞退
  | 'unavailable' // 不在

// ============================================
// PreflightChecklist（飛行前チェックリスト）
// ============================================

export interface PreflightChecklist {
  id: string
  flightPlanId: string // FlightPlan.id

  weather: WeatherCheck
  airspace: AirspaceCheck
  aircraft: AircraftCheck
  permits: PermitsCheck
  crew: CrewCheck

  // 総合判定
  overallStatus: ChecklistOverallStatus
  completedAt?: string
  completedBy?: string // User.id
}

export type ChecklistOverallStatus = 'pending' | 'passed' | 'failed'

// 各チェック項目の共通構造
interface BaseCheck {
  checked: boolean
  checkedAt?: string
  checkedBy?: string // User.id
  passed: boolean
  notes?: string
}

export interface WeatherCheck extends BaseCheck {
  conditions?: {
    windSpeed: number // m/s
    windDirection: number // degrees
    temperature: number // Celsius
    visibility: number // km
    precipitation: boolean
  }
}

export interface AirspaceCheck extends BaseCheck {
  items: {
    emergencyAirspace: boolean // 緊急用務空域なし
    notam: boolean // NOTAM確認
    tfr: boolean // TFR確認
  }
}

export interface AircraftCheck extends BaseCheck {
  items: {
    visualInspection: boolean // 外観点検
    batteryLevel: number // バッテリー残量%
    gpsStatus: boolean // GPS正常
    remoteIdActive: boolean // リモートID送信
    sensorCalibration: boolean // センサー校正
    firmwareUpToDate: boolean // ファームウェア最新
  }
}

export interface PermitsCheck extends BaseCheck {
  items: {
    dipsRegistration: boolean // DIPS登録確認
    flightPermission: boolean // 飛行許可確認
    insuranceValid: boolean // 保険有効
    pilotQualification: boolean // 操縦資格確認
  }
}

export interface CrewCheck extends BaseCheck {
  items: {
    pilotPresent: boolean // 操縦者配置
    observerPresent: boolean // 補助者配置
    safetyManagerPresent: boolean // 安全管理者配置
    emergencyContactsSet: boolean // 緊急連絡先設定
  }
}

// ============================================
// 拡張型（UIで使用する結合データ）
// ============================================

/**
 * 飛行計画の詳細（関連データ含む）
 */
export interface FlightPlanDetail extends FlightPlan {
  project: Project
  aircraft: Aircraft
  crew: CrewAssignmentWithUser[]
  checklist?: PreflightChecklist
}

/**
 * クルー割当（ユーザー情報含む）
 */
export interface CrewAssignmentWithUser extends CrewAssignment {
  user: User
}

/**
 * プロジェクト詳細（飛行計画含む）
 */
export interface ProjectDetail extends Project {
  flightPlans: FlightPlan[]
  statistics?: {
    totalFlights: number
    completedFlights: number
    upcomingFlights: number
  }
}

// ============================================
// ヘルパー型
// ============================================

/**
 * 飛行可能かどうかの判定結果
 */
export interface FlightReadinessResult {
  canFly: boolean
  reasons: string[]
  checklist: {
    weather: boolean
    airspace: boolean
    aircraft: boolean
    permits: boolean
    crew: boolean
  }
}

/**
 * 日付範囲でのフライト検索
 */
export interface FlightPlanQuery {
  projectId?: string
  startDate?: string
  endDate?: string
  status?: FlightPlanStatus[]
  preflightStatus?: PreflightStatus[]
  aircraftId?: string
  pilotId?: string
}
