import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import type {
  DroneFlightStatus,
  RestrictedZone,
  UTMAlert,
  DIPSApplication,
  FlightLog,
  UTMStatistics,
  CollisionRisk,
  AlertSeverity,
  AlertType,
  UTMProject,
  FlightArea,
} from '../types/utmTypes'

// ============================================
// ドローン監視設定関連の型定義
// ============================================

// アラート閾値設定
export interface AlertThresholds {
  batteryWarning: number // バッテリー警告 (%) - デフォルト: 30
  batteryAlert: number // バッテリー危険 (%) - デフォルト: 10
  signalWarning: number // 信号強度警告 (%) - デフォルト: 40
  signalAlert: number // 信号強度危険 (%) - デフォルト: 20
  maxAltitude: number // 最大高度 (m) - デフォルト: 150
  minAltitude: number // 最小高度 (m) - デフォルト: 0
}

// 音設定
export interface SoundConfig {
  warningTone: 'beep' | 'chime' | 'bell' | 'buzz' // 警告音のトーン
  warningVolume: number // 警告音量 (0-100)
  warningDuration: number // 警告時間 (ms)
  errorTone: 'beep' | 'chime' | 'bell' | 'buzz' // エラー音のトーン
  errorVolume: number // エラー音量 (0-100)
  errorDuration: number // エラー時間 (ms)
  emergencyTone: 'beep' | 'chime' | 'bell' | 'buzz' // 緊急音のトーン
  emergencyVolume: number // 緊急音量 (0-100)
  emergencyDuration: number // 緊急時間 (ms)
}

// ドローン別監視設定
export interface DroneMonitoringConfig {
  droneId: string
  customDroneName?: string // カスタム再命名
  projectId?: string // 関連プロジェクトID
  isMonitored: boolean // モニタリング有効/無効
  alertThresholds: AlertThresholds // アラート閾値（グローバル値からの上書き）
  soundConfig: SoundConfig // 音設定（グローバル値からの上書き）
}

// チェックイン状態
export interface CheckedInDroneInfo {
  droneId: string
  projectId: string
  checkedInAt: Date
  checkedInBy: string // ユーザーID
}

interface UTMState {
  // リアルタイムデータ
  activeDrones: DroneFlightStatus[]
  restrictedZones: RestrictedZone[]
  alerts: UTMAlert[]
  collisionRisks: CollisionRisk[]

  // プロジェクト管理
  projects: UTMProject[]
  selectedProjectIds: string[] // 複数選択対応
  filteredDrones: DroneFlightStatus[] // 選択プロジェクトのドローン（キャッシュ）

  // DIPS申請
  dipsApplications: DIPSApplication[]

  // 飛行記録
  flightLogs: FlightLog[]

  // 統計
  statistics: UTMStatistics

  // シミュレーション状態
  isSimulationRunning: boolean
  simulationInterval: ReturnType<typeof setInterval> | null

  // サウンド設定
  soundSettings: {
    enabled: boolean // マスターサウンドオン/オフ
    warningSound: boolean // 警告レベル
    errorSound: boolean // エラーレベル
    emergencySound: boolean // 緊急レベル
  }

  // アクション - リアルタイムドローン
  updateDronePosition: (
    droneId: string,
    updates: Partial<DroneFlightStatus>
  ) => void
  addActiveDrone: (drone: DroneFlightStatus) => void
  removeActiveDrone: (droneId: string) => void

  // アクション - アラート
  addAlert: (alert: Omit<UTMAlert, 'id' | 'timestamp' | 'acknowledged'>) => void
  acknowledgeAlert: (alertId: string, userId: string) => void
  unacknowledgeAlert: (alertId: string) => void
  clearAlert: (alertId: string) => void
  clearAllAlerts: () => void

  // アクション - DIPS申請
  addDIPSApplication: (
    application: Omit<DIPSApplication, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
  updateDIPSApplication: (id: string, updates: Partial<DIPSApplication>) => void
  deleteDIPSApplication: (id: string) => void

  // アクション - 飛行記録
  addFlightLog: (log: Omit<FlightLog, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateFlightLog: (id: string, updates: Partial<FlightLog>) => void

  // アクション - シミュレーション
  startSimulation: () => void
  stopSimulation: () => void

  // アクション - 初期化
  initializeMockData: () => void

  // アクション - 衝突検知
  checkCollisions: () => void
  checkZoneViolations: () => void

  // アクション - サウンド設定
  updateSoundSettings: (settings: Partial<UTMState['soundSettings']>) => void

  // アクション - プロジェクト管理
  selectProject: (projectId: string) => void
  toggleProjectSelection: (projectId: string) => void
  clearProjectSelection: () => void
  selectAllProjects: () => void
  getSelectedProjects: () => UTMProject[]
  getProjectFlightAreas: () => FlightArea[]
  getFilteredDrones: () => DroneFlightStatus[]
  updateProjectStatus: (projectId: string, status: UTMProject['status']) => void
  updateProjectFlightArea: (projectId: string, flightArea: FlightArea) => void
  getDronesForProject: (projectId: string) => DroneFlightStatus[]

  // ドローン監視設定管理
  monitoredDroneConfigs: Record<string, DroneMonitoringConfig>
  globalAlertThresholds: AlertThresholds // グローバルアラート閾値デフォルト値
  globalSoundConfig: SoundConfig // グローバル音設定デフォルト値

  // ドローン監視設定アクション
  initializeMonitoringConfig: () => void // 初期化（全ドローン用の設定を生成）
  toggleDroneMonitoring: (droneId: string) => void // ドローンのモニタリング ON/OFF
  setDroneAlertThresholds: (
    droneId: string,
    thresholds: Partial<AlertThresholds>
  ) => void // ドローン別アラート閾値設定
  setDroneSoundConfig: (
    droneId: string,
    soundConfig: Partial<SoundConfig>
  ) => void // ドローン別音設定
  renameDrone: (droneId: string, newName: string) => void // ドローン再命名
  updateGlobalAlertThresholds: (thresholds: Partial<AlertThresholds>) => void // グローバルアラート閾値更新
  updateGlobalSoundConfig: (soundConfig: Partial<SoundConfig>) => void // グローバル音設定更新
  getDroneMonitoringConfig: (
    droneId: string
  ) => DroneMonitoringConfig | undefined
  getMonitoredDrones: () => DroneFlightStatus[] // モニタリング対象のドローンのみ取得

  // チェックイン状態管理
  checkedInDrones: Record<string, CheckedInDroneInfo>

  // チェックインアクション
  checkInDrone: (droneId: string, projectId: string) => void
  checkOutDrone: (droneId: string) => void
  checkInProject: (projectId: string) => void
  checkOutProject: (projectId: string) => void
  checkInAllDrones: () => void
  checkOutAllDrones: () => void
  isCheckedIn: (droneId: string) => boolean
  getCheckedInDrones: () => DroneFlightStatus[]
  syncProjectsFromCheckedIn: () => void // チェックイン済みドローンのプロジェクトを選択状態に同期
}

// モックプロジェクトデータ（飛行区域付き）
// active: 東京(3機) + 旭川(3機) + 神戸(2機) + 大阪(2機) + 福岡(2機) = 12機
// scheduled: 成田(2機) = 待機中
const mockProjects: UTMProject[] = [
  {
    id: 'proj-001',
    name: '東京・港区 太陽光パネル点検',
    description: '港区芝浦エリアのビル屋上太陽光パネル点検作業',
    location: '港区芝浦',
    prefecture: '東京都',
    status: 'active',
    scheduledStart: new Date(),
    scheduledEnd: new Date(Date.now() + 3600000 * 4),
    droneCount: 3,
    activeDroneCount: 3,
    droneIds: ['drone-proj-001-1', 'drone-proj-001-2', 'drone-proj-001-3'],
    pilotName: '山田太郎',
    pilotId: 'pilot-tokyo-1',
    flightArea: {
      type: 'polygon' as const,
      name: '港区芝浦エリア',
      coordinates: [
        [
          [139.74, 35.64],
          [139.78, 35.64],
          [139.78, 35.68],
          [139.74, 35.68],
          [139.74, 35.64],
        ],
      ],
      maxAltitude: 150,
      color: '#3B82F6', // blue
    },
    centerCoordinates: [139.77, 35.65], // 南東寄りに調整
    lastUpdated: new Date(),
  },
  {
    id: 'proj-002',
    name: '千葉・成田 農地調査',
    description: '成田市周辺の農地状況調査（明日開始予定）',
    location: '成田市',
    prefecture: '千葉県',
    status: 'scheduled',
    scheduledStart: new Date(Date.now() + 86400000), // 明日
    scheduledEnd: new Date(Date.now() + 86400000 + 3600000 * 6),
    droneCount: 2,
    activeDroneCount: 0,
    droneIds: ['drone-proj-002-1', 'drone-proj-002-2'],
    pilotName: '中村農夫',
    pilotId: 'pilot-narita-1',
    flightArea: {
      type: 'polygon' as const,
      name: '成田市農業エリア',
      coordinates: [
        [
          [140.32, 35.78],
          [140.38, 35.78],
          [140.38, 35.82],
          [140.32, 35.82],
          [140.32, 35.78],
        ],
      ],
      maxAltitude: 100,
      color: '#10B981', // green
    },
    centerCoordinates: [140.35, 35.8],
    lastUpdated: new Date(),
  },
  {
    id: 'proj-003',
    name: '北海道・旭川 インフラ点検',
    description: '旭川市中心部の橋梁・道路インフラ点検',
    location: '旭川市',
    prefecture: '北海道',
    status: 'active',
    scheduledStart: new Date(),
    scheduledEnd: new Date(Date.now() + 3600000 * 5),
    droneCount: 3,
    activeDroneCount: 3,
    droneIds: ['drone-proj-003-1', 'drone-proj-003-2', 'drone-proj-003-3'],
    pilotName: '北川雄大',
    pilotId: 'pilot-asahikawa-1',
    flightArea: {
      type: 'polygon' as const,
      name: '旭川市中心部',
      coordinates: [
        [
          [142.36, 43.76],
          [142.4, 43.76],
          [142.4, 43.8],
          [142.36, 43.8],
          [142.36, 43.76],
        ],
      ],
      maxAltitude: 120,
      color: '#8B5CF6', // purple (黄/赤系は禁止区域と被るため避ける)
    },
    centerCoordinates: [142.38, 43.78],
    lastUpdated: new Date(),
  },
  {
    id: 'proj-004',
    name: '兵庫・神戸 海岸線調査',
    description: '神戸港周辺の海岸線モニタリング',
    location: '神戸市中央区',
    prefecture: '兵庫県',
    status: 'active',
    scheduledStart: new Date(),
    scheduledEnd: new Date(Date.now() + 3600000 * 4),
    droneCount: 2,
    activeDroneCount: 2,
    droneIds: ['drone-proj-004-1', 'drone-proj-004-2'],
    pilotName: '神戸海斗',
    pilotId: 'pilot-kobe-1',
    flightArea: {
      type: 'polygon' as const,
      name: '神戸港エリア',
      coordinates: [
        [
          [135.18, 34.68],
          [135.22, 34.68],
          [135.22, 34.7],
          [135.18, 34.7],
          [135.18, 34.68],
        ],
      ],
      maxAltitude: 80,
      color: '#6366F1', // indigo
    },
    centerCoordinates: [135.2, 34.69],
    lastUpdated: new Date(),
  },
  {
    id: 'proj-005',
    name: '大阪・梅田 ビル点検',
    description: '梅田エリアの高層ビル外壁点検作業',
    location: '大阪市北区',
    prefecture: '大阪府',
    status: 'active',
    scheduledStart: new Date(),
    scheduledEnd: new Date(Date.now() + 3600000 * 5),
    droneCount: 2,
    activeDroneCount: 2,
    droneIds: ['drone-proj-005-1', 'drone-proj-005-2'],
    pilotName: '大阪太郎',
    pilotId: 'pilot-osaka-1',
    flightArea: {
      type: 'polygon' as const,
      name: '梅田エリア',
      coordinates: [
        [
          [135.48, 34.7],
          [135.52, 34.7],
          [135.52, 34.72],
          [135.48, 34.72],
          [135.48, 34.7],
        ],
      ],
      maxAltitude: 200,
      color: '#06B6D4', // cyan
    },
    centerCoordinates: [135.5, 34.71],
    lastUpdated: new Date(),
  },
  {
    id: 'proj-006',
    name: '福岡・博多 物流配送',
    description: '博多駅周辺での実証実験配送',
    location: '福岡市博多区',
    prefecture: '福岡県',
    status: 'active',
    scheduledStart: new Date(),
    scheduledEnd: new Date(Date.now() + 3600000 * 3),
    droneCount: 2,
    activeDroneCount: 2,
    droneIds: ['drone-proj-006-1', 'drone-proj-006-2'],
    pilotName: '福岡次郎',
    pilotId: 'pilot-fukuoka-1',
    flightArea: {
      type: 'polygon' as const,
      name: '博多駅周辺',
      coordinates: [
        [
          [130.4, 33.58],
          [130.44, 33.58],
          [130.44, 33.61],
          [130.4, 33.61],
          [130.4, 33.58],
        ],
      ],
      maxAltitude: 100,
      color: '#EC4899', // pink
    },
    centerCoordinates: [130.42, 33.59],
    lastUpdated: new Date(),
  },
]

// 全国の制限区域データ（東京・旭川・神戸・成田・大阪・福岡）
const mockRestrictedZones: RestrictedZone[] = [
  // ===== 東京エリア =====
  {
    id: 'zone-tokyo-1',
    name: '羽田空港周辺',
    type: 'airport',
    level: 'prohibited',
    description: '羽田空港から半径9km以内は飛行禁止区域です',
    coordinates: [
      [
        [139.72, 35.535],
        [139.75, 35.52],
        [139.79, 35.52],
        [139.82, 35.535],
        [139.84, 35.555],
        [139.845, 35.58],
        [139.84, 35.6],
        [139.82, 35.615],
        [139.78, 35.62],
        [139.74, 35.615],
        [139.71, 35.595],
        [139.705, 35.565],
        [139.72, 35.535],
      ],
    ],
    maxAltitude: 150,
    authority: '国土交通省航空局',
    contactInfo: 'aviation@mlit.go.jp',
  },
  {
    id: 'zone-tokyo-2',
    name: '皇居周辺',
    type: 'important_facility',
    level: 'prohibited',
    description: '皇居周辺は小型無人機等飛行禁止法により飛行禁止',
    coordinates: [
      [
        [139.748, 35.682],
        [139.751, 35.679],
        [139.756, 35.679],
        [139.76, 35.682],
        [139.761, 35.686],
        [139.76, 35.69],
        [139.756, 35.693],
        [139.751, 35.693],
        [139.747, 35.69],
        [139.746, 35.686],
        [139.748, 35.682],
      ],
    ],
    authority: '警察庁',
  },
  {
    id: 'zone-tokyo-3',
    name: '新宿区DID',
    type: 'did',
    level: 'restricted',
    description: '人口集中地区（DID）のため許可が必要',
    coordinates: [
      [
        [139.682, 35.692],
        [139.688, 35.688],
        [139.695, 35.685],
        [139.705, 35.684],
        [139.715, 35.686],
        [139.722, 35.692],
        [139.724, 35.7],
        [139.722, 35.71],
        [139.715, 35.718],
        [139.705, 35.72],
        [139.692, 35.718],
        [139.685, 35.712],
        [139.68, 35.702],
        [139.682, 35.692],
      ],
    ],
    authority: '国土交通省',
  },
  {
    id: 'zone-tokyo-4',
    name: '渋谷・港区DID',
    type: 'did',
    level: 'restricted',
    description: '人口集中地区（DID）のため許可が必要',
    coordinates: [
      [
        [139.692, 35.652],
        [139.7, 35.648],
        [139.712, 35.648],
        [139.72, 35.652],
        [139.725, 35.66],
        [139.724, 35.67],
        [139.718, 35.678],
        [139.708, 35.68],
        [139.698, 35.678],
        [139.69, 35.672],
        [139.688, 35.662],
        [139.692, 35.652],
      ],
    ],
    authority: '国土交通省',
  },
  {
    id: 'zone-tokyo-5',
    name: '東京ドーム・文京区',
    type: 'custom',
    level: 'caution',
    description: 'イベント開催時は飛行注意',
    coordinates: [
      [
        [139.75, 35.704],
        [139.753, 35.702],
        [139.757, 35.703],
        [139.759, 35.706],
        [139.758, 35.71],
        [139.755, 35.712],
        [139.751, 35.712],
        [139.748, 35.71],
        [139.747, 35.706],
        [139.75, 35.704],
      ],
    ],
    authority: '東京都',
  },
  {
    id: 'zone-tokyo-6',
    name: '六本木・赤坂周辺',
    type: 'important_facility',
    level: 'caution',
    description: '大使館密集地域のため注意',
    coordinates: [
      [
        [139.728, 35.662],
        [139.735, 35.658],
        [139.745, 35.66],
        [139.748, 35.668],
        [139.745, 35.675],
        [139.738, 35.678],
        [139.73, 35.674],
        [139.728, 35.662],
      ],
    ],
    authority: '外務省',
  },

  // ===== 旭川エリア（北海道）=====
  {
    id: 'zone-asahikawa-1',
    name: '旭川空港周辺',
    type: 'airport',
    level: 'prohibited',
    description: '旭川空港から半径6km以内は飛行禁止区域です',
    coordinates: [
      [
        [142.42, 43.65],
        [142.46, 43.64],
        [142.5, 43.65],
        [142.52, 43.68],
        [142.5, 43.71],
        [142.46, 43.72],
        [142.42, 43.71],
        [142.4, 43.68],
        [142.42, 43.65],
      ],
    ],
    maxAltitude: 150,
    authority: '国土交通省航空局',
    contactInfo: 'aviation@mlit.go.jp',
  },
  {
    id: 'zone-asahikawa-2',
    name: '旭川市中心部DID',
    type: 'did',
    level: 'restricted',
    description: '人口集中地区（DID）のため許可が必要',
    coordinates: [
      [
        [142.35, 43.76],
        [142.38, 43.755],
        [142.41, 43.76],
        [142.42, 43.78],
        [142.41, 43.8],
        [142.38, 43.805],
        [142.35, 43.8],
        [142.34, 43.78],
        [142.35, 43.76],
      ],
    ],
    authority: '国土交通省',
  },
  {
    id: 'zone-asahikawa-3',
    name: '旭川駅周辺',
    type: 'important_facility',
    level: 'caution',
    description: '旭川駅・商業施設密集エリア',
    coordinates: [
      [
        [142.36, 43.765],
        [142.375, 43.762],
        [142.385, 43.765],
        [142.388, 43.775],
        [142.385, 43.782],
        [142.375, 43.785],
        [142.36, 43.782],
        [142.357, 43.775],
        [142.36, 43.765],
      ],
    ],
    authority: '旭川市',
  },
  {
    id: 'zone-asahikawa-4',
    name: '旭山動物園周辺',
    type: 'custom',
    level: 'caution',
    description: '旭山動物園上空は飛行注意（動物への影響）',
    coordinates: [
      [
        [142.475, 43.765],
        [142.485, 43.762],
        [142.495, 43.765],
        [142.498, 43.773],
        [142.495, 43.78],
        [142.485, 43.783],
        [142.475, 43.78],
        [142.472, 43.773],
        [142.475, 43.765],
      ],
    ],
    authority: '旭川市',
  },

  // ===== 神戸エリア =====
  {
    id: 'zone-kobe-1',
    name: '神戸空港周辺',
    type: 'airport',
    level: 'prohibited',
    description: '神戸空港から半径6km以内は飛行禁止区域です',
    coordinates: [
      [
        [135.2, 34.62],
        [135.24, 34.61],
        [135.28, 34.62],
        [135.3, 34.65],
        [135.28, 34.68],
        [135.24, 34.69],
        [135.2, 34.68],
        [135.18, 34.65],
        [135.2, 34.62],
      ],
    ],
    maxAltitude: 150,
    authority: '国土交通省航空局',
    contactInfo: 'aviation@mlit.go.jp',
  },
  {
    id: 'zone-kobe-2',
    name: '神戸市中央区DID',
    type: 'did',
    level: 'restricted',
    description: '人口集中地区（DID）のため許可が必要',
    coordinates: [
      [
        [135.17, 34.68],
        [135.2, 34.675],
        [135.23, 34.68],
        [135.24, 34.7],
        [135.23, 34.72],
        [135.2, 34.725],
        [135.17, 34.72],
        [135.16, 34.7],
        [135.17, 34.68],
      ],
    ],
    authority: '国土交通省',
  },
  {
    id: 'zone-kobe-3',
    name: '神戸港・ポートアイランド',
    type: 'important_facility',
    level: 'caution',
    description: '港湾施設・船舶往来エリア',
    coordinates: [
      [
        [135.19, 34.66],
        [135.22, 34.655],
        [135.25, 34.66],
        [135.26, 34.68],
        [135.25, 34.69],
        [135.22, 34.695],
        [135.19, 34.69],
        [135.18, 34.68],
        [135.19, 34.66],
      ],
    ],
    authority: '神戸市',
  },

  // ===== 成田エリア =====
  {
    id: 'zone-narita-1',
    name: '成田空港周辺',
    type: 'airport',
    level: 'prohibited',
    description: '成田国際空港から半径9km以内は飛行禁止区域です',
    coordinates: [
      [
        [140.35, 35.72],
        [140.4, 35.71],
        [140.45, 35.72],
        [140.47, 35.77],
        [140.45, 35.82],
        [140.4, 35.83],
        [140.35, 35.82],
        [140.33, 35.77],
        [140.35, 35.72],
      ],
    ],
    maxAltitude: 150,
    authority: '国土交通省航空局',
    contactInfo: 'aviation@mlit.go.jp',
  },
  {
    id: 'zone-narita-2',
    name: '成田市DID',
    type: 'did',
    level: 'restricted',
    description: '人口集中地区（DID）のため許可が必要',
    coordinates: [
      [
        [140.3, 35.78],
        [140.33, 35.775],
        [140.36, 35.78],
        [140.37, 35.8],
        [140.36, 35.82],
        [140.33, 35.825],
        [140.3, 35.82],
        [140.29, 35.8],
        [140.3, 35.78],
      ],
    ],
    authority: '国土交通省',
  },

  // ===== 大阪エリア =====
  {
    id: 'zone-osaka-1',
    name: '伊丹空港（大阪国際空港）周辺',
    type: 'airport',
    level: 'prohibited',
    description: '大阪国際空港から半径6km以内は飛行禁止区域です',
    coordinates: [
      [
        [135.42, 34.78],
        [135.46, 34.77],
        [135.5, 34.78],
        [135.52, 34.81],
        [135.5, 34.84],
        [135.46, 34.85],
        [135.42, 34.84],
        [135.4, 34.81],
        [135.42, 34.78],
      ],
    ],
    maxAltitude: 150,
    authority: '国土交通省航空局',
    contactInfo: 'aviation@mlit.go.jp',
  },
  {
    id: 'zone-osaka-2',
    name: '大阪市北区DID（梅田）',
    type: 'did',
    level: 'restricted',
    description: '人口集中地区（DID）のため許可が必要',
    coordinates: [
      [
        [135.48, 34.69],
        [135.51, 34.685],
        [135.54, 34.69],
        [135.55, 34.71],
        [135.54, 34.73],
        [135.51, 34.735],
        [135.48, 34.73],
        [135.47, 34.71],
        [135.48, 34.69],
      ],
    ],
    authority: '国土交通省',
  },
  {
    id: 'zone-osaka-3',
    name: '大阪城公園周辺',
    type: 'important_facility',
    level: 'caution',
    description: '史跡・観光地のため飛行注意',
    coordinates: [
      [
        [135.52, 34.68],
        [135.535, 34.675],
        [135.55, 34.68],
        [135.555, 34.695],
        [135.55, 34.71],
        [135.535, 34.715],
        [135.52, 34.71],
        [135.515, 34.695],
        [135.52, 34.68],
      ],
    ],
    authority: '大阪市',
  },
  {
    id: 'zone-osaka-4',
    name: '難波・道頓堀エリア',
    type: 'did',
    level: 'restricted',
    description: '繁華街・人口密集地域のため許可が必要',
    coordinates: [
      [
        [135.49, 34.66],
        [135.51, 34.655],
        [135.53, 34.66],
        [135.535, 34.675],
        [135.53, 34.685],
        [135.51, 34.69],
        [135.49, 34.685],
        [135.485, 34.675],
        [135.49, 34.66],
      ],
    ],
    authority: '国土交通省',
  },

  // ===== 福岡エリア =====
  {
    id: 'zone-fukuoka-1',
    name: '福岡空港周辺',
    type: 'airport',
    level: 'prohibited',
    description: '福岡空港から半径6km以内は飛行禁止区域です（市街地近接空港）',
    coordinates: [
      [
        [130.43, 33.56],
        [130.47, 33.55],
        [130.51, 33.56],
        [130.53, 33.6],
        [130.51, 33.64],
        [130.47, 33.65],
        [130.43, 33.64],
        [130.41, 33.6],
        [130.43, 33.56],
      ],
    ],
    maxAltitude: 150,
    authority: '国土交通省航空局',
    contactInfo: 'aviation@mlit.go.jp',
  },
  {
    id: 'zone-fukuoka-2',
    name: '博多駅周辺DID',
    type: 'did',
    level: 'restricted',
    description: '人口集中地区（DID）のため許可が必要',
    coordinates: [
      [
        [130.4, 33.58],
        [130.43, 33.575],
        [130.46, 33.58],
        [130.47, 33.6],
        [130.46, 33.62],
        [130.43, 33.625],
        [130.4, 33.62],
        [130.39, 33.6],
        [130.4, 33.58],
      ],
    ],
    authority: '国土交通省',
  },
  {
    id: 'zone-fukuoka-3',
    name: '天神地区',
    type: 'did',
    level: 'restricted',
    description: '繁華街・商業施設密集地域のため許可が必要',
    coordinates: [
      [
        [130.38, 33.58],
        [130.4, 33.575],
        [130.42, 33.58],
        [130.425, 33.595],
        [130.42, 33.61],
        [130.4, 33.615],
        [130.38, 33.61],
        [130.375, 33.595],
        [130.38, 33.58],
      ],
    ],
    authority: '国土交通省',
  },
  {
    id: 'zone-fukuoka-4',
    name: '福岡タワー・百道浜',
    type: 'important_facility',
    level: 'caution',
    description: '観光施設・海浜エリアのため飛行注意',
    coordinates: [
      [
        [130.34, 33.59],
        [130.36, 33.585],
        [130.38, 33.59],
        [130.385, 33.605],
        [130.38, 33.615],
        [130.36, 33.62],
        [130.34, 33.615],
        [130.335, 33.605],
        [130.34, 33.59],
      ],
    ],
    authority: '福岡市',
  },
]

// プロジェクトごとのドローンデータ（各プロジェクト固有のパイロット・機体）
interface ProjectDroneConfig {
  droneCount: number
  centerLng: number
  centerLat: number
  areaSize: number // 飛行区域の大きさ（度）
  pilots: { id: string; name: string }[]
  drones: { model: string; registrationNumber: string }[]
  colors: string[]
}

const projectDroneConfigs: Record<string, ProjectDroneConfig> = {
  'proj-001': {
    droneCount: 3,
    centerLng: 139.77, // 南東寄りに調整
    centerLat: 35.65, // 南東寄りに調整
    areaSize: 0.04,
    pilots: [
      { id: 'pilot-tokyo-1', name: '山田太郎' },
      { id: 'pilot-tokyo-2', name: '佐藤花子' },
      { id: 'pilot-tokyo-3', name: '伊藤健一' },
    ],
    drones: [
      { model: 'Mavic 3 Pro', registrationNumber: 'JU-TK001' },
      { model: 'Air 2S', registrationNumber: 'JU-TK002' },
      { model: 'Phantom 4 Pro', registrationNumber: 'JU-TK003' },
    ],
    // プロジェクト飛行区域色に統一（青）
    colors: ['#3B82F6'],
  },
  'proj-002': {
    droneCount: 2,
    centerLng: 140.35,
    centerLat: 35.8,
    areaSize: 0.06,
    pilots: [
      { id: 'pilot-narita-1', name: '中村農夫' },
      { id: 'pilot-narita-2', name: '小林誠' },
    ],
    drones: [
      { model: 'Agras T30', registrationNumber: 'JU-NR001' },
      { model: 'Agras T40', registrationNumber: 'JU-NR002' },
    ],
    // プロジェクト飛行区域色に統一（緑）
    colors: ['#10B981'],
  },
  'proj-003': {
    droneCount: 3,
    centerLng: 142.38,
    centerLat: 43.78,
    areaSize: 0.04,
    pilots: [
      { id: 'pilot-asahikawa-1', name: '北川雄大' },
      { id: 'pilot-asahikawa-2', name: '松本冬美' },
      { id: 'pilot-asahikawa-3', name: '渡辺隆' },
    ],
    drones: [
      { model: 'Matrice 300 RTK', registrationNumber: 'JU-AK001' },
      { model: 'Matrice 350 RTK', registrationNumber: 'JU-AK002' },
      { model: 'Zenmuse H20T', registrationNumber: 'JU-AK003' },
    ],
    // プロジェクト飛行区域色に統一（紫）
    colors: ['#8B5CF6'],
  },
  'proj-004': {
    droneCount: 2,
    centerLng: 135.2,
    centerLat: 34.69,
    areaSize: 0.04,
    pilots: [
      { id: 'pilot-kobe-1', name: '神戸海斗' },
      { id: 'pilot-kobe-2', name: '西村美香' },
    ],
    drones: [
      { model: 'Mavic 3 Enterprise', registrationNumber: 'JU-KB001' },
      { model: 'Mavic 3 Thermal', registrationNumber: 'JU-KB002' },
    ],
    // プロジェクト飛行区域色に統一（インディゴ）
    colors: ['#6366F1'],
  },
  'proj-005': {
    droneCount: 2,
    centerLng: 135.5,
    centerLat: 34.68,
    areaSize: 0.04,
    pilots: [
      { id: 'pilot-osaka-1', name: '大阪太郎' },
      { id: 'pilot-osaka-2', name: '田中美穂' },
    ],
    drones: [
      { model: 'Inspire 3', registrationNumber: 'JU-OS001' },
      { model: 'Mavic 3 Pro', registrationNumber: 'JU-OS002' },
    ],
    // プロジェクト飛行区域色に統一（シアン）
    colors: ['#06B6D4'],
  },
  'proj-006': {
    droneCount: 2,
    centerLng: 130.42,
    centerLat: 33.59,
    areaSize: 0.04,
    pilots: [
      { id: 'pilot-fukuoka-1', name: '福岡次郎' },
      { id: 'pilot-fukuoka-2', name: '博多花子' },
    ],
    drones: [
      { model: 'Matrice 30T', registrationNumber: 'JU-FK001' },
      { model: 'Matrice 30', registrationNumber: 'JU-FK002' },
    ],
    // プロジェクト飛行区域色に統一（ピンク）
    colors: ['#EC4899'],
  },
}

// プロジェクトに基づいたドローン生成
const generateDronesForProject = (projectId: string): DroneFlightStatus[] => {
  const config = projectDroneConfigs[projectId]
  if (!config) return []

  const drones: DroneFlightStatus[] = []
  const {
    centerLng,
    centerLat,
    areaSize,
    pilots,
    drones: droneModels,
    colors,
    droneCount,
  } = config

  for (let i = 0; i < droneCount; i++) {
    const droneId = `drone-${projectId}-${i + 1}`
    const droneNumber = i + 1
    const pilot = pilots[i % pilots.length]
    const droneInfo = droneModels[i % droneModels.length]
    const color = colors[i % colors.length]

    // 飛行区域内にランダムなwaypointを生成
    const waypoints: [number, number][] = []
    const waypointCount = 5 + Math.floor(Math.random() * 3) // 5-7個のwaypoint

    for (let j = 0; j < waypointCount; j++) {
      const offsetLng = (Math.random() - 0.5) * areaSize
      const offsetLat = (Math.random() - 0.5) * areaSize
      waypoints.push([centerLng + offsetLng, centerLat + offsetLat])
    }

    // 初期位置は最初のwaypointから開始
    const startWaypoint = waypoints[0]

    drones.push({
      droneId,
      droneName: `${droneInfo.model} [${droneInfo.registrationNumber}]`,
      pilotId: pilot.id,
      pilotName: pilot.name,
      flightPlanId: `fp-${projectId}-${droneNumber}`,
      projectId,
      position: {
        droneId,
        latitude: startWaypoint[1],
        longitude: startWaypoint[0],
        altitude: 50 + Math.random() * 70,
        heading: Math.random() * 360,
        speed: 5 + Math.random() * 10,
        timestamp: new Date(),
        attitude: {
          roll: (Math.random() - 0.5) * 10,
          pitch: (Math.random() - 0.5) * 15,
          yaw: Math.random() * 360,
        },
      },
      batteryLevel: 60 + Math.random() * 40,
      signalStrength: 70 + Math.random() * 30,
      flightMode: Math.random() > 0.3 ? 'auto' : 'manual',
      status: 'in_flight',
      startTime: new Date(Date.now() - Math.random() * 3600000),
      estimatedEndTime: new Date(Date.now() + Math.random() * 3600000),
      plannedRoute: {
        waypoints,
        corridorWidth: 30 + Math.random() * 30,
        color,
      },
    })
  }

  return drones
}

// アクティブなプロジェクトのドローンのみを生成
const generateMockDrones = (
  activeProjectIds: string[]
): DroneFlightStatus[] => {
  const allDrones: DroneFlightStatus[] = []
  activeProjectIds.forEach((projectId) => {
    if (projectDroneConfigs[projectId]) {
      allDrones.push(...generateDronesForProject(projectId))
    }
  })
  return allDrones
}

// モックDIPS申請データ
const generateMockDIPSApplications = (): DIPSApplication[] => [
  {
    id: 'dips-1',
    applicationNumber: 'DIPS-2024-123456',
    status: 'approved',
    applicantId: 'user-1',
    applicantName: '山田太郎',
    organizationName: 'エアロテック株式会社',
    droneId: 'drone-1',
    droneName: 'Mavic 3 Pro',
    droneRegistrationNumber: 'JU1234567890',
    pilotId: 'pilot-1',
    pilotName: '山田太郎',
    pilotLicenseNumber: 'DPL-2024-001',
    flightPurpose: 'aerial_photography',
    flightPurposeDetail: '不動産物件の空撮撮影',
    flightTypes: ['vlos', 'over_people'],
    flightArea: {
      type: 'polygon' as const,
      name: '新宿区西新宿エリア',
      prefecture: '東京都',
      city: '新宿区',
      address: '西新宿1-1-1',
      coordinates: [
        [
          [139.69, 35.69],
          [139.7, 35.69],
          [139.7, 35.7],
          [139.69, 35.7],
          [139.69, 35.69],
        ],
      ],
    },
    scheduledStartDate: new Date('2024-12-20'),
    scheduledEndDate: new Date('2024-12-25'),
    flightTimeStart: '09:00',
    flightTimeEnd: '17:00',
    maxAltitude: 150,
    safetyMeasures: ['補助者配置', 'プロペラガード装着', '第三者立入禁止措置'],
    emergencyProcedures:
      '緊急時は即座に手動操縦に切り替え、最寄りの安全な場所に着陸',
    insuranceInfo: '賠償責任保険加入済（1億円）',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-10'),
    submittedAt: new Date('2024-12-02'),
    reviewedAt: new Date('2024-12-10'),
    reviewerComment: '承認します。飛行時は安全に十分注意してください。',
  },
  {
    id: 'dips-2',
    applicationNumber: null,
    status: 'draft',
    applicantId: 'user-1',
    applicantName: '山田太郎',
    organizationName: 'エアロテック株式会社',
    droneId: 'drone-2',
    droneName: 'Air 2S',
    droneRegistrationNumber: 'JU2345678901',
    pilotId: 'pilot-2',
    pilotName: '佐藤花子',
    flightPurpose: 'inspection',
    flightPurposeDetail: '太陽光パネルの点検',
    flightTypes: ['vlos'],
    flightArea: {
      type: 'polygon' as const,
      name: '千葉県市原市メガソーラー',
      prefecture: '千葉県',
      city: '市原市',
      address: '市原1-1-1',
      coordinates: [
        [
          [140.1, 35.45],
          [140.12, 35.45],
          [140.12, 35.47],
          [140.1, 35.47],
          [140.1, 35.45],
        ],
      ],
    },
    scheduledStartDate: new Date('2025-01-10'),
    scheduledEndDate: new Date('2025-01-12'),
    flightTimeStart: '10:00',
    flightTimeEnd: '15:00',
    maxAltitude: 50,
    safetyMeasures: ['補助者配置', '立入禁止区域設定'],
    emergencyProcedures: '緊急時は自動帰還（RTH）を発動',
    createdAt: new Date('2024-12-15'),
    updatedAt: new Date('2024-12-15'),
  },
  {
    id: 'dips-3',
    applicationNumber: 'DIPS-2024-789012',
    status: 'under_review',
    applicantId: 'user-2',
    applicantName: '鈴木一郎',
    droneId: 'drone-3',
    droneName: 'Matrice 300',
    droneRegistrationNumber: 'JU3456789012',
    pilotId: 'pilot-3',
    pilotName: '鈴木一郎',
    pilotLicenseNumber: 'DPL-2024-002',
    flightPurpose: 'surveying',
    flightPurposeDetail: '建設現場の測量',
    flightTypes: ['bvlos', 'over_people'],
    flightArea: {
      type: 'polygon' as const,
      name: '横浜市建設現場',
      prefecture: '神奈川県',
      city: '横浜市',
      address: '港北区新横浜1-1-1',
      coordinates: [
        [
          [139.6, 35.5],
          [139.62, 35.5],
          [139.62, 35.52],
          [139.6, 35.52],
          [139.6, 35.5],
        ],
      ],
    },
    scheduledStartDate: new Date('2025-01-15'),
    scheduledEndDate: new Date('2025-01-20'),
    flightTimeStart: '08:00',
    flightTimeEnd: '16:00',
    maxAltitude: 100,
    safetyMeasures: ['補助者複数配置', '飛行エリア周囲監視', 'ADS-B受信機搭載'],
    emergencyProcedures: '緊急時は即座にホバリング、手動操縦で安全区域へ誘導',
    insuranceInfo: '賠償責任保険加入済（3億円）',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-12'),
    submittedAt: new Date('2024-12-11'),
  },
]

// モック飛行記録データ
const generateMockFlightLogs = (): FlightLog[] => [
  {
    id: 'log-1',
    flightPlanId: 'fp-1',
    dipsApplicationId: 'dips-1',
    droneId: 'drone-1',
    droneName: 'Mavic 3 Pro #001',
    pilotId: 'pilot-1',
    pilotName: '山田太郎',
    startTime: new Date('2024-12-15T09:30:00'),
    endTime: new Date('2024-12-15T10:45:00'),
    duration: 4500,
    purpose: 'aerial_photography',
    purposeDetail: '不動産物件空撮',
    location: {
      name: '新宿西新宿',
      prefecture: '東京都',
      city: '新宿区',
    },
    maxAltitude: 120,
    maxSpeed: 15.5,
    totalDistance: 8500,
    batteryStartLevel: 100,
    batteryEndLevel: 35,
    weather: {
      temperature: 12,
      windSpeed: 3.5,
      windDirection: 180,
      visibility: '良好',
      conditions: '晴れ',
    },
    notes: '予定通り完了。良好な映像を取得。',
    status: 'completed',
    createdAt: new Date('2024-12-15T10:50:00'),
    updatedAt: new Date('2024-12-15T10:50:00'),
  },
  {
    id: 'log-2',
    flightPlanId: 'fp-2',
    dipsApplicationId: null,
    droneId: 'drone-2',
    droneName: 'Air 2S #002',
    pilotId: 'pilot-2',
    pilotName: '佐藤花子',
    startTime: new Date('2024-12-16T14:00:00'),
    endTime: new Date('2024-12-16T14:45:00'),
    duration: 2700,
    purpose: 'training',
    location: {
      name: '練習場',
      prefecture: '千葉県',
      city: '柏市',
    },
    maxAltitude: 50,
    maxSpeed: 10.0,
    totalDistance: 3200,
    batteryStartLevel: 100,
    batteryEndLevel: 55,
    weather: {
      temperature: 10,
      windSpeed: 2.0,
      windDirection: 90,
      visibility: '良好',
      conditions: '曇り',
    },
    status: 'completed',
    createdAt: new Date('2024-12-16T14:50:00'),
    updatedAt: new Date('2024-12-16T14:50:00'),
  },
]

// サウンド設定のローカルストレージキー
const SOUND_SETTINGS_STORAGE_KEY = 'utm-sound-settings'

// サウンド設定のデフォルト値
const DEFAULT_SOUND_SETTINGS: UTMState['soundSettings'] = {
  enabled: true,
  warningSound: false,
  errorSound: true,
  emergencySound: true,
}

// ローカルストレージからサウンド設定を読み込む
const loadSoundSettings = (): UTMState['soundSettings'] => {
  if (typeof window === 'undefined') return DEFAULT_SOUND_SETTINGS
  try {
    const saved = localStorage.getItem(SOUND_SETTINGS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // 型安全のため、必要なプロパティが存在するか確認
      return {
        enabled:
          typeof parsed.enabled === 'boolean'
            ? parsed.enabled
            : DEFAULT_SOUND_SETTINGS.enabled,
        warningSound:
          typeof parsed.warningSound === 'boolean'
            ? parsed.warningSound
            : DEFAULT_SOUND_SETTINGS.warningSound,
        errorSound:
          typeof parsed.errorSound === 'boolean'
            ? parsed.errorSound
            : DEFAULT_SOUND_SETTINGS.errorSound,
        emergencySound:
          typeof parsed.emergencySound === 'boolean'
            ? parsed.emergencySound
            : DEFAULT_SOUND_SETTINGS.emergencySound,
      }
    }
  } catch {
    // パースエラー時はデフォルト値を返す
  }
  return DEFAULT_SOUND_SETTINGS
}

// ローカルストレージにサウンド設定を保存
const saveSoundSettings = (settings: UTMState['soundSettings']): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SOUND_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (error) {
    console.warn('Failed to save sound settings to localStorage:', error)
  }
}

// ============================================
// ドローン監視設定のデフォルト値
// ============================================

// ランダムに変化するデフォルト値を生成するヘルパー関数
const generateRandomizedDefaults = (): {
  alertThresholds: AlertThresholds
  soundConfig: SoundConfig
} => {
  // バッテリー警告: 25-35%
  const batteryWarning = 25 + Math.floor(Math.random() * 10)
  // バッテリー危険: 5-15%
  const batteryAlert = 5 + Math.floor(Math.random() * 10)
  // 信号強度警告: 35-45%
  const signalWarning = 35 + Math.floor(Math.random() * 10)
  // 信号強度危険: 15-25%
  const signalAlert = 15 + Math.floor(Math.random() * 10)
  // 最大高度: 140-160m
  const maxAltitude = 140 + Math.floor(Math.random() * 20)

  const tones: Array<'beep' | 'chime' | 'bell' | 'buzz'> = [
    'beep',
    'chime',
    'bell',
    'buzz',
  ]
  const randomTone = () => tones[Math.floor(Math.random() * tones.length)]
  const randomVolume = () => 60 + Math.floor(Math.random() * 30) // 60-90%
  const randomDuration = () => 500 + Math.floor(Math.random() * 1500) // 500-2000ms

  return {
    alertThresholds: {
      batteryWarning,
      batteryAlert,
      signalWarning,
      signalAlert,
      maxAltitude,
      minAltitude: 0,
    },
    soundConfig: {
      warningTone: randomTone(),
      warningVolume: randomVolume(),
      warningDuration: randomDuration(),
      errorTone: randomTone(),
      errorVolume: randomVolume(),
      errorDuration: randomDuration(),
      emergencyTone: randomTone(),
      emergencyVolume: randomVolume(),
      emergencyDuration: randomDuration(),
    },
  }
}

const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  batteryWarning: 30,
  batteryAlert: 10,
  signalWarning: 40,
  signalAlert: 20,
  maxAltitude: 150,
  minAltitude: 0,
}

const DEFAULT_SOUND_CONFIG: SoundConfig = {
  warningTone: 'chime',
  warningVolume: 70,
  warningDuration: 800,
  errorTone: 'bell',
  errorVolume: 80,
  errorDuration: 1200,
  emergencyTone: 'buzz',
  emergencyVolume: 100,
  emergencyDuration: 1500,
}

// 選択プロジェクトのドローンを計算するヘルパー関数
// パフォーマンス改善: Setの作成とフィルタリングを1回だけ実行
const calculateFilteredDrones = (
  activeDrones: DroneFlightStatus[],
  projects: UTMProject[],
  selectedProjectIds: string[]
): DroneFlightStatus[] => {
  // すべてのプロジェクトが選択されている場合は全ドローンを返す
  if (selectedProjectIds.length === projects.length) {
    return activeDrones
  }

  // 選択中のプロジェクトに紐づくドローンIDを収集
  const selectedDroneIds = new Set<string>()
  projects
    .filter((p) => selectedProjectIds.includes(p.id))
    .forEach((p) => {
      p.droneIds?.forEach((id) => selectedDroneIds.add(id))
    })

  // ドローンIDでフィルタリング（projectIdまたはdroneIdsでマッチ）
  return activeDrones.filter(
    (drone) =>
      selectedDroneIds.has(drone.droneId) ||
      (drone.projectId && selectedProjectIds.includes(drone.projectId))
  )
}

const useUTMStore = create<UTMState>()(
  devtools(
    (set, get) => ({
      // 初期状態
      activeDrones: [],
      restrictedZones: mockRestrictedZones,
      alerts: [],
      collisionRisks: [],
      dipsApplications: [],
      flightLogs: [],
      statistics: {
        activeDrones: 0,
        totalFlightsToday: 0,
        totalFlightHoursToday: 0,
        activeAlerts: 0,
        criticalAlerts: 0,
        pendingApplications: 0,
        approvedApplications: 0,
        zoneViolations: 0,
        nearMissIncidents: 0,
      },
      isSimulationRunning: false,
      simulationInterval: null,

      // プロジェクト管理
      projects: mockProjects,
      selectedProjectIds: ['proj-001'], // デフォルトで東京プロジェクトを選択
      filteredDrones: [], // initializeMockDataで初期化される

      // サウンド設定（ローカルストレージから読み込み、なければデフォルト値）
      soundSettings: loadSoundSettings(),

      // ドローン監視設定
      monitoredDroneConfigs: {},
      globalAlertThresholds: DEFAULT_ALERT_THRESHOLDS,
      globalSoundConfig: DEFAULT_SOUND_CONFIG,

      // チェックイン状態（空の場合は後方互換性のため全ドローンが対象）
      checkedInDrones: {},

      // ドローン位置更新（パフォーマンス最適化版）
      // - インデックスベースの更新で不要な配列再作成を回避
      // - filteredDronesは対象ドローンのみ部分更新
      updateDronePosition: (droneId, updates) => {
        set((state) => {
          // 対象ドローンのインデックスを検索
          const droneIndex = state.activeDrones.findIndex(
            (d) => d.droneId === droneId
          )
          if (droneIndex === -1) return state // 見つからない場合は更新なし

          const currentDrone = state.activeDrones[droneIndex]

          // 更新後のドローンオブジェクトを作成
          const updatedDrone: DroneFlightStatus = {
            ...currentDrone,
            ...updates,
            position: {
              ...currentDrone.position,
              ...updates.position,
              timestamp: new Date(),
            },
          }

          // activeDronesを更新（該当インデックスのみ置換）
          const updatedActiveDrones = [...state.activeDrones]
          updatedActiveDrones[droneIndex] = updatedDrone

          // filteredDronesの部分更新（全体再計算を回避）
          const filteredIndex = state.filteredDrones.findIndex(
            (d) => d.droneId === droneId
          )
          let updatedFilteredDrones = state.filteredDrones

          if (filteredIndex !== -1) {
            // フィルター対象の場合のみ更新
            updatedFilteredDrones = [...state.filteredDrones]
            updatedFilteredDrones[filteredIndex] = updatedDrone
          }

          return {
            activeDrones: updatedActiveDrones,
            filteredDrones: updatedFilteredDrones,
          }
        })
      },

      // アクティブドローン追加
      addActiveDrone: (drone) => {
        set((state) => ({
          activeDrones: [...state.activeDrones, drone],
          statistics: {
            ...state.statistics,
            activeDrones: state.activeDrones.length + 1,
          },
        }))
      },

      // アクティブドローン削除
      removeActiveDrone: (droneId) => {
        set((state) => ({
          activeDrones: state.activeDrones.filter((d) => d.droneId !== droneId),
          statistics: {
            ...state.statistics,
            activeDrones: Math.max(0, state.statistics.activeDrones - 1),
          },
        }))
      },

      // アラート追加
      addAlert: (alertData) => {
        // 監視対象外のドローンならアラートを追加しない
        // monitoredDroneConfigs が空の場合は初期化（デフォルト全て監視ON）
        set((state) => {
          const droneMonitoringConfig =
            state.monitoredDroneConfigs[alertData.droneId]

          // 監視設定が存在しないか、監視対象の場合のみアラートを追加
          // （初期化前や全て監視デフォルトで動作）
          if (
            Object.keys(state.monitoredDroneConfigs).length === 0 ||
            droneMonitoringConfig?.isMonitored !== false
          ) {
            const newAlert: UTMAlert = {
              ...alertData,
              id: crypto.randomUUID(),
              timestamp: new Date(),
              acknowledged: false,
            }
            const newAlerts = [newAlert, ...state.alerts].slice(0, 100)
            return {
              alerts: newAlerts,
              statistics: {
                ...state.statistics,
                activeAlerts: newAlerts.filter((a) => !a.acknowledged).length,
                criticalAlerts: newAlerts.filter(
                  (a) =>
                    !a.acknowledged &&
                    (a.severity === 'critical' || a.severity === 'emergency')
                ).length,
              },
            }
          }
          // 監視対象外なら何もしない
          return {}
        })
      },

      // アラート確認
      acknowledgeAlert: (alertId, userId) => {
        set((state) => {
          const newAlerts = state.alerts.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  acknowledged: true,
                  acknowledgedBy: userId,
                  acknowledgedAt: new Date(),
                }
              : alert
          )
          return {
            alerts: newAlerts,
            statistics: {
              ...state.statistics,
              activeAlerts: newAlerts.filter((a) => !a.acknowledged).length,
              criticalAlerts: newAlerts.filter(
                (a) =>
                  !a.acknowledged &&
                  (a.severity === 'critical' || a.severity === 'emergency')
              ).length,
            },
          }
        })
      },

      unacknowledgeAlert: (alertId) => {
        set((state) => {
          const newAlerts = state.alerts.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  acknowledged: false,
                  acknowledgedBy: undefined,
                  acknowledgedAt: undefined,
                }
              : alert
          )
          return {
            alerts: newAlerts,
            statistics: {
              ...state.statistics,
              activeAlerts: newAlerts.filter((a) => !a.acknowledged).length,
              criticalAlerts: newAlerts.filter(
                (a) =>
                  !a.acknowledged &&
                  (a.severity === 'critical' || a.severity === 'emergency')
              ).length,
            },
          }
        })
      },

      // アラートクリア
      clearAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== alertId),
        }))
      },

      // 全アラートクリア
      clearAllAlerts: () => {
        set({
          alerts: [],
          statistics: {
            ...get().statistics,
            activeAlerts: 0,
            criticalAlerts: 0,
          },
        })
      },

      // DIPS申請追加
      addDIPSApplication: (applicationData) => {
        const newApplication: DIPSApplication = {
          ...applicationData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          dipsApplications: [...state.dipsApplications, newApplication],
        }))
      },

      // DIPS申請更新
      updateDIPSApplication: (id, updates) => {
        set((state) => ({
          dipsApplications: state.dipsApplications.map((app) =>
            app.id === id ? { ...app, ...updates, updatedAt: new Date() } : app
          ),
        }))
      },

      // DIPS申請削除
      deleteDIPSApplication: (id) => {
        set((state) => ({
          dipsApplications: state.dipsApplications.filter(
            (app) => app.id !== id
          ),
        }))
      },

      // 飛行記録追加
      addFlightLog: (logData) => {
        const newLog: FlightLog = {
          ...logData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        set((state) => ({
          flightLogs: [newLog, ...state.flightLogs],
        }))
      },

      // 飛行記録更新
      updateFlightLog: (id, updates) => {
        set((state) => ({
          flightLogs: state.flightLogs.map((log) =>
            log.id === id ? { ...log, ...updates, updatedAt: new Date() } : log
          ),
        }))
      },

      // シミュレーション開始
      startSimulation: () => {
        const state = get()
        if (state.isSimulationRunning) return

        // チェックイン済みドローンを取得（後方互換性: 空の場合は全ドローン）
        const getSimulationDrones = () => {
          const currentState = get()
          const checkedInIds = Object.keys(currentState.checkedInDrones)
          if (checkedInIds.length === 0) {
            return currentState.activeDrones
          }
          return currentState.activeDrones.filter(
            (d) => d.droneId in currentState.checkedInDrones
          )
        }

        const simulationDrones = getSimulationDrones()

        // 初期アラートを生成
        if (simulationDrones.length > 0) {
          const randomDrone =
            simulationDrones[
              Math.floor(Math.random() * simulationDrones.length)
            ]
          get().addAlert({
            type: 'weather_warning',
            severity: 'info',
            droneId: randomDrone.droneId,
            droneName: randomDrone.droneName,
            message: 'シミュレーション開始',
            details: `UTM監視システムが有効化されました。${simulationDrones.length}機の飛行を監視中です。`,
            position: randomDrone.position,
          })
        }

        let tickCount = 0
        const alertCooldowns: Map<string, number> = new Map()
        // アラートのクールダウン設定（リアリティ向上）
        const ALERT_COOLDOWN_MS = 60000 // 同一ドローン・同一タイプ: 60秒
        const GLOBAL_ALERT_COOLDOWN_MS = 15000 // グローバル: 15秒（頻度を大幅に下げる）
        const CRITICAL_ALERT_COOLDOWN_MS = 120000 // クリティカルアラート: 2分
        let lastGlobalAlertTime = 0
        let lastCriticalAlertTime = 0

        // ウェイポイント追跡用の状態
        const waypointIndices: Map<string, number> = new Map()
        const waypointDirections: Map<string, number> = new Map() // 1: forward, -1: backward

        // ドローンの初期ウェイポイントインデックスを設定
        // 初期インデックス0: ドローンはwaypoints[0]から開始し、すぐに到達判定されて次のwaypoints[1]に向かう
        simulationDrones.forEach((drone) => {
          waypointIndices.set(drone.droneId, 0)
          waypointDirections.set(drone.droneId, 1)
        })

        const canTriggerAlert = (
          droneId: string,
          alertType: string,
          isCritical: boolean = false
        ): boolean => {
          const now = Date.now()
          // グローバルクールダウン
          if (now - lastGlobalAlertTime < GLOBAL_ALERT_COOLDOWN_MS) {
            return false
          }
          // クリティカルアラートは追加のクールダウン
          if (
            isCritical &&
            now - lastCriticalAlertTime < CRITICAL_ALERT_COOLDOWN_MS
          ) {
            return false
          }
          const key = `${droneId}-${alertType}`
          const lastTime = alertCooldowns.get(key) || 0
          if (now - lastTime < ALERT_COOLDOWN_MS) {
            return false
          }
          return true
        }

        const recordAlert = (
          droneId: string,
          alertType: string,
          isCritical: boolean = false
        ) => {
          const now = Date.now()
          alertCooldowns.set(`${droneId}-${alertType}`, now)
          lastGlobalAlertTime = now
          if (isCritical) {
            lastCriticalAlertTime = now
          }
        }

        const interval = setInterval(() => {
          tickCount++

          // チェックイン済みドローンのみ処理
          const dronesToSimulate = getSimulationDrones()

          // 終了時刻を過ぎたドローンを着陸済みに変更（flightModeは変更しない）
          const now = Date.now()
          dronesToSimulate.forEach((drone) => {
            if (
              drone.estimatedEndTime &&
              now > drone.estimatedEndTime.getTime() &&
              drone.status !== 'landed'
            ) {
              get().updateDronePosition(drone.droneId, {
                status: 'landed',
              })
            }
          })

          // ドローン位置をウェイポイントに沿って更新
          dronesToSimulate.forEach((drone) => {
            // 飛行中・帰還中・離陸中・着陸中のドローンのみ移動を許可
            // hovering, landed, preflight, emergencyは移動しない
            const movableStatuses = ['in_flight', 'rth', 'takeoff', 'landing']
            if (!movableStatuses.includes(drone.status)) {
              return
            }

            const waypoints = drone.plannedRoute?.waypoints
            if (!waypoints || waypoints.length < 2) {
              // ウェイポイントがない場合はスキップ
              return
            }

            // 現在のウェイポイントインデックスと方向を取得
            const currentIndex = waypointIndices.get(drone.droneId) ?? 0
            const direction = waypointDirections.get(drone.droneId) ?? 1

            // 次のウェイポイントを計算
            const nextIndex = currentIndex + direction
            const targetWaypoint = waypoints[currentIndex]
            const targetLng = targetWaypoint[0]
            const targetLat = targetWaypoint[1]

            // 現在位置から目標への方向と距離を計算
            const deltaLat = targetLat - drone.position.latitude
            const deltaLng = targetLng - drone.position.longitude
            const distance = Math.sqrt(
              deltaLat * deltaLat + deltaLng * deltaLng
            )

            // 移動速度（度/tick）- 約6-9m/sに相当（ゆっくりめのドローン速度）
            const moveSpeed = 0.0002 + Math.random() * 0.0001

            let newLat: number
            let newLng: number
            let newHeading: number

            if (distance < moveSpeed * 2) {
              // ウェイポイントに到達
              newLat = targetLat
              newLng = targetLng

              // 次のウェイポイントへ進む
              if (nextIndex >= waypoints.length) {
                // 終点に到達したら逆方向へ
                waypointDirections.set(drone.droneId, -1)
                waypointIndices.set(drone.droneId, waypoints.length - 2)
              } else if (nextIndex < 0) {
                // 始点に到達したら順方向へ
                waypointDirections.set(drone.droneId, 1)
                waypointIndices.set(drone.droneId, 0)
              } else {
                waypointIndices.set(drone.droneId, nextIndex)
              }

              newHeading = drone.position.heading
            } else {
              // ウェイポイントに向かって移動
              const ratio = moveSpeed / distance
              newLat = drone.position.latitude + deltaLat * ratio
              newLng = drone.position.longitude + deltaLng * ratio

              // 進行方向を計算（度）
              newHeading =
                (Math.atan2(deltaLng, deltaLat) * (180 / Math.PI) + 360) % 360
            }

            // 高度・バッテリー・信号の変化（小さなランダム変動）
            const altChange = (Math.random() - 0.5) * 3
            const batteryDrain = Math.random() * 0.2
            const signalChange = (Math.random() - 0.5) * 1.5

            // 姿勢データの変化（飛行中の微細な揺れをシミュレート）
            const rollChange = (Math.random() - 0.5) * 3
            const pitchChange = (Math.random() - 0.5) * 2

            const currentAttitude = drone.position.attitude || {
              roll: 0,
              pitch: 0,
              yaw: drone.position.heading,
            }

            const newBatteryLevel = Math.max(
              0,
              drone.batteryLevel - batteryDrain
            )
            const newSignalStrength = Math.max(
              0,
              Math.min(100, drone.signalStrength + signalChange)
            )

            // 速度は一定範囲内でランダム変動
            const baseSpeed = 8 + Math.random() * 6
            const newSpeed = Math.max(5, Math.min(15, baseSpeed))

            get().updateDronePosition(drone.droneId, {
              position: {
                ...drone.position,
                latitude: newLat,
                longitude: newLng,
                altitude: Math.max(
                  30,
                  Math.min(120, drone.position.altitude + altChange)
                ),
                heading: newHeading,
                speed: newSpeed,
                attitude: {
                  roll: Math.max(
                    -20,
                    Math.min(20, currentAttitude.roll + rollChange)
                  ),
                  pitch: Math.max(
                    -30,
                    Math.min(30, currentAttitude.pitch + pitchChange)
                  ),
                  yaw: newHeading,
                },
              },
              batteryLevel: newBatteryLevel,
              signalStrength: newSignalStrength,
            })

            // バッテリー低下アラート
            if (
              newBatteryLevel <= 20 &&
              drone.batteryLevel > 20 &&
              canTriggerAlert(drone.droneId, 'low_battery')
            ) {
              recordAlert(drone.droneId, 'low_battery')
              get().addAlert({
                type: 'low_battery',
                severity: newBatteryLevel <= 10 ? 'critical' : 'warning',
                droneId: drone.droneId,
                droneName: drone.droneName,
                message: `バッテリー低下: ${newBatteryLevel.toFixed(0)}%`,
                details: `${drone.droneName}のバッテリー残量が${newBatteryLevel.toFixed(0)}%まで低下しました。帰還を推奨します。`,
                position: drone.position,
              })
            }

            // 信号低下アラート
            if (
              newSignalStrength <= 50 &&
              drone.signalStrength > 50 &&
              canTriggerAlert(drone.droneId, 'signal_loss')
            ) {
              recordAlert(drone.droneId, 'signal_loss')
              get().addAlert({
                type: 'signal_loss',
                severity: newSignalStrength <= 30 ? 'critical' : 'warning',
                droneId: drone.droneId,
                droneName: drone.droneName,
                message: `信号低下: ${newSignalStrength.toFixed(0)}%`,
                details: `${drone.droneName}の信号強度が${newSignalStrength.toFixed(0)}%まで低下しました。通信が不安定です。`,
                position: drone.position,
              })
            }
          })

          // 気象警告（頻度を下げる: 20tick毎、確率15%）
          if (
            tickCount % 20 === 0 &&
            Math.random() < 0.15 &&
            dronesToSimulate.length > 0
          ) {
            const randomDrone =
              dronesToSimulate[
                Math.floor(Math.random() * dronesToSimulate.length)
              ]
            if (
              randomDrone &&
              canTriggerAlert(randomDrone.droneId, 'weather_warning')
            ) {
              recordAlert(randomDrone.droneId, 'weather_warning')
              get().addAlert({
                type: 'weather_warning',
                severity: 'warning',
                droneId: randomDrone.droneId,
                droneName: randomDrone.droneName,
                message: '気象条件の悪化',
                details:
                  '飛行エリア付近で風速が増加しています。飛行に注意してください。',
                position: randomDrone.position,
              })
            }
          }

          // ジオフェンス逸脱警告（頻度を下げる: 25tick毎、確率10%）
          if (
            tickCount % 25 === 0 &&
            Math.random() < 0.1 &&
            dronesToSimulate.length > 0
          ) {
            const randomDrone =
              dronesToSimulate[
                Math.floor(Math.random() * dronesToSimulate.length)
              ]
            if (
              randomDrone &&
              canTriggerAlert(randomDrone.droneId, 'geofence_breach')
            ) {
              recordAlert(randomDrone.droneId, 'geofence_breach')
              get().addAlert({
                type: 'geofence_breach',
                severity: 'warning',
                droneId: randomDrone.droneId,
                droneName: randomDrone.droneName,
                message: 'ジオフェンス接近',
                details: `${randomDrone.droneName}が設定されたジオフェンス境界に接近しています。`,
                position: randomDrone.position,
              })
            }
          }

          // 空域競合アラート（critical: 大幅に頻度を下げる: 60tick毎、確率5%）
          if (
            tickCount % 60 === 0 &&
            Math.random() < 0.05 &&
            dronesToSimulate.length > 0
          ) {
            const randomDrone =
              dronesToSimulate[
                Math.floor(Math.random() * dronesToSimulate.length)
              ]
            if (
              randomDrone &&
              canTriggerAlert(randomDrone.droneId, 'airspace_conflict', true)
            ) {
              recordAlert(randomDrone.droneId, 'airspace_conflict', true)
              get().addAlert({
                type: 'airspace_conflict',
                severity: 'critical',
                droneId: randomDrone.droneId,
                droneName: randomDrone.droneName,
                message: '空域競合',
                details:
                  '近隣で他の航空機の飛行が予定されています。高度を下げるか、一時退避してください。',
                position: randomDrone.position,
              })
            }
          }

          // 衝突チェック（頻度を下げる: 30tick毎）
          if (tickCount % 30 === 0) {
            get().checkCollisions()
          }

          // 区域侵入チェック（頻度を下げる: 40tick毎）
          if (tickCount % 40 === 0) {
            get().checkZoneViolations()
          }
        }, 1000)

        set({ isSimulationRunning: true, simulationInterval: interval })
      },

      // シミュレーション停止
      stopSimulation: () => {
        const state = get()
        if (state.simulationInterval) {
          clearInterval(state.simulationInterval)
        }
        set({ isSimulationRunning: false, simulationInterval: null })
      },

      // モックデータ初期化
      initializeMockData: () => {
        const { selectedProjectIds, projects } = get()
        // アクティブなプロジェクトのIDを取得
        const activeProjectIds = mockProjects
          .filter((p) => p.status === 'active')
          .map((p) => p.id)
        const mockDrones = generateMockDrones(activeProjectIds)
        const mockApplications = generateMockDIPSApplications()
        const mockLogs = generateMockFlightLogs()

        set({
          activeDrones: mockDrones,
          filteredDrones: calculateFilteredDrones(
            mockDrones,
            projects,
            selectedProjectIds
          ),
          dipsApplications: mockApplications,
          flightLogs: mockLogs,
          statistics: {
            activeDrones: mockDrones.length,
            totalFlightsToday: 12,
            totalFlightHoursToday: 8.5,
            activeAlerts: 0,
            criticalAlerts: 0,
            pendingApplications: mockApplications.filter(
              (a) => a.status === 'under_review' || a.status === 'submitted'
            ).length,
            approvedApplications: mockApplications.filter(
              (a) => a.status === 'approved'
            ).length,
            zoneViolations: 0,
            nearMissIncidents: 0,
          },
        })
      },

      // 衝突検知
      checkCollisions: () => {
        const { activeDrones, addAlert, checkedInDrones } = get()
        const risks: CollisionRisk[] = []

        // チェックイン済みドローンのみをチェック
        // checkedInDrones が空の場合は後方互換性のため全ドローンをチェック
        const dronesToCheck =
          Object.keys(checkedInDrones).length > 0
            ? activeDrones.filter((d) => d.droneId in checkedInDrones)
            : activeDrones

        for (let i = 0; i < dronesToCheck.length; i++) {
          for (let j = i + 1; j < dronesToCheck.length; j++) {
            const drone1 = dronesToCheck[i]
            const drone2 = dronesToCheck[j]

            const latDiff =
              (drone1.position.latitude - drone2.position.latitude) * 111000
            const lngDiff =
              (drone1.position.longitude - drone2.position.longitude) *
              111000 *
              Math.cos((drone1.position.latitude * Math.PI) / 180)
            const altDiff = drone1.position.altitude - drone2.position.altitude
            const distance = Math.sqrt(
              latDiff * latDiff + lngDiff * lngDiff + altDiff * altDiff
            )

            let riskLevel: CollisionRisk['riskLevel'] = 'low'
            let shouldAlert = false
            let alertSeverity: AlertSeverity = 'info'
            let alertType: AlertType = 'collision_warning'

            // 距離閾値を調整（より現実的に）
            if (distance < 30) {
              riskLevel = 'critical'
              shouldAlert = true
              alertSeverity = 'emergency'
              alertType = 'collision_alert'
            } else if (distance < 60) {
              riskLevel = 'high'
              // 高リスクでもアラートは10%の確率のみ（頻発防止）
              shouldAlert = Math.random() < 0.1
              alertSeverity = 'critical'
              alertType = 'collision_alert'
            } else if (distance < 120) {
              riskLevel = 'medium'
              // 中リスクは5%の確率のみ
              shouldAlert = Math.random() < 0.05
              alertSeverity = 'warning'
            } else if (distance < 300) {
              riskLevel = 'low'
            }

            if (distance < 300) {
              risks.push({
                drone1Id: drone1.droneId,
                drone1Name: drone1.droneName,
                drone2Id: drone2.droneId,
                drone2Name: drone2.droneName,
                distance: Math.round(distance),
                timeToCollision: -1,
                riskLevel,
                recommendedAction:
                  riskLevel === 'critical'
                    ? '即座に回避行動を取ってください'
                    : '注意して飛行してください',
              })
            }

            if (shouldAlert) {
              addAlert({
                type: alertType,
                severity: alertSeverity,
                droneId: drone1.droneId,
                droneName: drone1.droneName,
                message: `衝突警告: ${drone1.droneName}と${drone2.droneName}`,
                details: `距離: ${Math.round(distance)}m - ${riskLevel === 'critical' ? '緊急回避が必要です' : '注意して飛行してください'}`,
                relatedDroneId: drone2.droneId,
                position: drone1.position,
              })
            }
          }
        }

        set({ collisionRisks: risks })
      },

      // 区域侵入チェック（アラート発生確率を追加）
      checkZoneViolations: () => {
        const {
          activeDrones,
          restrictedZones,
          addAlert,
          alerts,
          checkedInDrones,
        } = get()

        // チェックイン済みドローンのみをチェック
        // checkedInDrones が空の場合は後方互換性のため全ドローンをチェック
        const dronesToCheck =
          Object.keys(checkedInDrones).length > 0
            ? activeDrones.filter((d) => d.droneId in checkedInDrones)
            : activeDrones

        dronesToCheck.forEach((drone) => {
          restrictedZones.forEach((zone) => {
            const isInZone = isPointInPolygon(
              drone.position.latitude,
              drone.position.longitude,
              zone.coordinates[0]
            )

            if (isInZone && zone.level !== 'caution') {
              // 同じドローンと区域の組み合わせで最近アラートが出ていないかチェック
              const recentAlert = alerts.find(
                (a) =>
                  a.droneId === drone.droneId &&
                  a.relatedZoneId === zone.id &&
                  Date.now() - a.timestamp.getTime() < 120000 // 2分以内
              )

              // 重複防止 + 確率制限（10%）
              if (!recentAlert && Math.random() < 0.1) {
                addAlert({
                  type: 'zone_violation',
                  severity:
                    zone.level === 'prohibited' ? 'emergency' : 'critical',
                  droneId: drone.droneId,
                  droneName: drone.droneName,
                  message: `区域侵入: ${zone.name}`,
                  details: `${drone.droneName}が${zone.name}（${zone.type === 'did' ? 'DID' : zone.type}）に侵入しています。${zone.level === 'prohibited' ? '即座に退避してください。' : '許可を確認してください。'}`,
                  relatedZoneId: zone.id,
                  position: drone.position,
                })
              }
            }
          })
        })
      },

      // サウンド設定更新
      updateSoundSettings: (settings) => {
        set((state) => {
          const newSettings = {
            ...state.soundSettings,
            ...settings,
          }
          // ローカルストレージに保存
          saveSoundSettings(newSettings)
          return { soundSettings: newSettings }
        })
      },

      // プロジェクト選択（単一選択）
      selectProject: (projectId) => {
        const { activeDrones, projects } = get()
        const newSelectedIds = [projectId]
        set({
          selectedProjectIds: newSelectedIds,
          filteredDrones: calculateFilteredDrones(
            activeDrones,
            projects,
            newSelectedIds
          ),
        })
      },

      // プロジェクト選択のトグル（複数選択）
      toggleProjectSelection: (projectId) => {
        set((state) => {
          const isSelected = state.selectedProjectIds.includes(projectId)
          let newSelectedIds: string[]
          if (isSelected) {
            // 最後の1つは選択解除しない
            if (state.selectedProjectIds.length <= 1) {
              return state
            }
            newSelectedIds = state.selectedProjectIds.filter(
              (id) => id !== projectId
            )
          } else {
            newSelectedIds = [...state.selectedProjectIds, projectId]
          }
          return {
            selectedProjectIds: newSelectedIds,
            filteredDrones: calculateFilteredDrones(
              state.activeDrones,
              state.projects,
              newSelectedIds
            ),
          }
        })
      },

      // プロジェクト選択クリア（最初のプロジェクトを選択）
      clearProjectSelection: () => {
        const { projects, activeDrones } = get()
        const newSelectedIds = projects.length > 0 ? [projects[0].id] : []
        set({
          selectedProjectIds: newSelectedIds,
          filteredDrones: calculateFilteredDrones(
            activeDrones,
            projects,
            newSelectedIds
          ),
        })
      },

      // 全プロジェクト選択
      selectAllProjects: () => {
        const { projects, activeDrones } = get()
        const newSelectedIds = projects.map((p) => p.id)
        set({
          selectedProjectIds: newSelectedIds,
          filteredDrones: calculateFilteredDrones(
            activeDrones,
            projects,
            newSelectedIds
          ),
        })
      },

      // 選択中のプロジェクトを取得
      getSelectedProjects: () => {
        const { projects, selectedProjectIds } = get()
        return projects.filter((p) => selectedProjectIds.includes(p.id))
      },

      // 選択中のプロジェクトの飛行区域を取得
      getProjectFlightAreas: () => {
        const { projects, selectedProjectIds } = get()
        return projects
          .filter((p) => selectedProjectIds.includes(p.id) && p.flightArea)
          .map((p) => p.flightArea as FlightArea)
      },

      // 選択中のプロジェクトに関連するドローンをフィルタリング（キャッシュ値を返す）
      // チェックイン済みドローンがある場合は、それでさらにフィルタリング
      getFilteredDrones: () => {
        const { filteredDrones, checkedInDrones } = get()
        const checkedInIds = Object.keys(checkedInDrones)

        // チェックインドローンがない場合は従来通り（後方互換性）
        if (checkedInIds.length === 0) {
          return filteredDrones
        }

        // チェックイン済みドローンでフィルタリング
        return filteredDrones.filter((d) => d.droneId in checkedInDrones)
      },

      // プロジェクトステータスの更新
      updateProjectStatus: (projectId, status) => {
        set((state) => {
          const updatedProjects = state.projects.map((project) => {
            if (project.id !== projectId) return project

            // ステータスに応じてactiveDroneCountを更新
            const activeDroneCount =
              status === 'active' ? project.droneCount : 0

            return {
              ...project,
              status,
              activeDroneCount,
              lastUpdated: new Date(),
            }
          })

          // activeに変更された場合、ドローンを生成
          // standby/completedに変更された場合、ドローンを削除
          let updatedDrones = [...state.activeDrones]
          const targetProject = updatedProjects.find((p) => p.id === projectId)

          if (targetProject) {
            if (status === 'active') {
              // 既存のドローンがない場合のみ追加（重複防止）
              const existingDroneIds = new Set(
                updatedDrones
                  .filter((d) => d.projectId === projectId)
                  .map((d) => d.droneId)
              )
              if (
                existingDroneIds.size === 0 &&
                projectDroneConfigs[projectId]
              ) {
                const newDrones = generateDronesForProject(projectId)
                updatedDrones = [...updatedDrones, ...newDrones]
              }
            } else {
              // ドローンを削除
              updatedDrones = updatedDrones.filter(
                (d) => d.projectId !== projectId
              )
            }
          }

          return {
            projects: updatedProjects,
            activeDrones: updatedDrones,
            filteredDrones: calculateFilteredDrones(
              updatedDrones,
              updatedProjects,
              state.selectedProjectIds
            ),
            statistics: {
              ...state.statistics,
              activeDrones: updatedDrones.length,
            },
          }
        })
      },

      // プロジェクトの飛行エリアを更新
      updateProjectFlightArea: (projectId, flightArea) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, flightArea, lastUpdated: new Date() }
              : project
          ),
        }))
      },

      // 特定プロジェクトのドローンを取得
      getDronesForProject: (projectId) => {
        const { activeDrones, projects } = get()
        const project = projects.find((p) => p.id === projectId)

        if (!project) return []

        // projectIdでマッチするドローン
        const dronesById = activeDrones.filter((d) => d.projectId === projectId)

        // droneIdsでもマッチするドローン（フォールバック）
        if (dronesById.length === 0 && project.droneIds) {
          const droneIdSet = new Set(project.droneIds)
          return activeDrones.filter((d) => droneIdSet.has(d.droneId))
        }

        return dronesById
      },

      // ============================================
      // ドローン監視設定アクション
      // ============================================

      // 監視設定の初期化（全ドローン用）
      initializeMonitoringConfig: () => {
        set((state) => {
          const newConfigs: Record<string, DroneMonitoringConfig> = {}
          const { activeDrones } = state

          activeDrones.forEach((drone) => {
            if (!newConfigs[drone.droneId]) {
              const randomDefaults = generateRandomizedDefaults()
              newConfigs[drone.droneId] = {
                droneId: drone.droneId,
                projectId: drone.projectId,
                isMonitored: true, // デフォルトは全て監視ON
                alertThresholds: randomDefaults.alertThresholds,
                soundConfig: randomDefaults.soundConfig,
              }
            }
          })

          return {
            monitoredDroneConfigs: newConfigs,
          }
        })
      },

      // ドローンのモニタリング ON/OFF切り替え
      toggleDroneMonitoring: (droneId) => {
        set((state) => {
          const config = state.monitoredDroneConfigs[droneId]
          if (!config) {
            // 設定が未作成の場合は作成
            const randomDefaults = generateRandomizedDefaults()
            return {
              monitoredDroneConfigs: {
                ...state.monitoredDroneConfigs,
                [droneId]: {
                  droneId,
                  isMonitored: false,
                  alertThresholds: randomDefaults.alertThresholds,
                  soundConfig: randomDefaults.soundConfig,
                },
              },
            }
          }
          return {
            monitoredDroneConfigs: {
              ...state.monitoredDroneConfigs,
              [droneId]: {
                ...config,
                isMonitored: !config.isMonitored,
              },
            },
          }
        })
      },

      // ドローン別アラート閾値設定
      setDroneAlertThresholds: (droneId, thresholds) => {
        set((state) => {
          const config = state.monitoredDroneConfigs[droneId]
          if (!config) return {}

          return {
            monitoredDroneConfigs: {
              ...state.monitoredDroneConfigs,
              [droneId]: {
                ...config,
                alertThresholds: {
                  ...config.alertThresholds,
                  ...thresholds,
                },
              },
            },
          }
        })
      },

      // ドローン別音設定
      setDroneSoundConfig: (droneId, soundConfig) => {
        set((state) => {
          const config = state.monitoredDroneConfigs[droneId]
          if (!config) return {}

          return {
            monitoredDroneConfigs: {
              ...state.monitoredDroneConfigs,
              [droneId]: {
                ...config,
                soundConfig: {
                  ...config.soundConfig,
                  ...soundConfig,
                },
              },
            },
          }
        })
      },

      // ドローン再命名
      renameDrone: (droneId, newName) => {
        set((state) => {
          const config = state.monitoredDroneConfigs[droneId]
          if (!config) {
            // 設定が未作成の場合は作成
            const randomDefaults = generateRandomizedDefaults()
            return {
              monitoredDroneConfigs: {
                ...state.monitoredDroneConfigs,
                [droneId]: {
                  droneId,
                  customDroneName: newName,
                  isMonitored: true,
                  alertThresholds: randomDefaults.alertThresholds,
                  soundConfig: randomDefaults.soundConfig,
                },
              },
            }
          }
          return {
            monitoredDroneConfigs: {
              ...state.monitoredDroneConfigs,
              [droneId]: {
                ...config,
                customDroneName: newName,
              },
            },
          }
        })
      },

      // グローバルアラート閾値更新
      updateGlobalAlertThresholds: (thresholds) => {
        set((state) => ({
          globalAlertThresholds: {
            ...state.globalAlertThresholds,
            ...thresholds,
          },
        }))
      },

      // グローバル音設定更新
      updateGlobalSoundConfig: (soundConfig) => {
        set((state) => ({
          globalSoundConfig: {
            ...state.globalSoundConfig,
            ...soundConfig,
          },
        }))
      },

      // ドローン監視設定の取得
      getDroneMonitoringConfig: (droneId) => {
        const state = get()
        return state.monitoredDroneConfigs[droneId]
      },

      // モニタリング対象のドローンのみ取得
      getMonitoredDrones: () => {
        const state = get()
        // monitoredDroneConfigs が空の場合は全ドローンを監視対象
        if (Object.keys(state.monitoredDroneConfigs).length === 0) {
          return state.activeDrones
        }
        return state.activeDrones.filter((drone) => {
          const config = state.monitoredDroneConfigs[drone.droneId]
          return config?.isMonitored !== false // 明示的にOFFでない限り監視対象
        })
      },

      // ===== チェックインアクション =====

      // ドローンをチェックイン
      checkInDrone: (droneId: string, projectId: string) => {
        set((state) => ({
          checkedInDrones: {
            ...state.checkedInDrones,
            [droneId]: {
              droneId,
              projectId,
              checkedInAt: new Date(),
              checkedInBy: 'current-user', // TODO: 実際のユーザーIDに置き換え
            },
          },
        }))
      },

      // ドローンをチェックアウト
      checkOutDrone: (droneId: string) => {
        set((state) => {
          const { [droneId]: _, ...rest } = state.checkedInDrones
          return { checkedInDrones: rest }
        })
      },

      // プロジェクト内の全ドローンをチェックイン
      checkInProject: (projectId: string) => {
        const { activeDrones } = get()
        const projectDrones = activeDrones.filter(
          (d) => d.projectId === projectId
        )

        set((state) => {
          const newCheckedIn = { ...state.checkedInDrones }
          projectDrones.forEach((drone) => {
            newCheckedIn[drone.droneId] = {
              droneId: drone.droneId,
              projectId,
              checkedInAt: new Date(),
              checkedInBy: 'current-user',
            }
          })
          return { checkedInDrones: newCheckedIn }
        })
      },

      // プロジェクト内の全ドローンをチェックアウト
      checkOutProject: (projectId: string) => {
        set((state) => {
          const newCheckedIn: Record<string, CheckedInDroneInfo> = {}
          Object.entries(state.checkedInDrones).forEach(([id, info]) => {
            if (info.projectId !== projectId) {
              newCheckedIn[id] = info
            }
          })
          return { checkedInDrones: newCheckedIn }
        })
      },

      // 全ドローンをチェックイン
      checkInAllDrones: () => {
        const { activeDrones } = get()
        set(() => {
          const newCheckedIn: Record<string, CheckedInDroneInfo> = {}
          activeDrones.forEach((drone) => {
            newCheckedIn[drone.droneId] = {
              droneId: drone.droneId,
              projectId: drone.projectId || '',
              checkedInAt: new Date(),
              checkedInBy: 'current-user',
            }
          })
          return { checkedInDrones: newCheckedIn }
        })
      },

      // 全ドローンをチェックアウト
      checkOutAllDrones: () => {
        set({ checkedInDrones: {} })
      },

      // チェックイン状態を判定
      isCheckedIn: (droneId: string) => {
        const { checkedInDrones } = get()
        return droneId in checkedInDrones
      },

      // チェックイン済みドローン一覧を取得
      getCheckedInDrones: () => {
        const { activeDrones, checkedInDrones } = get()
        return activeDrones.filter((d) => d.droneId in checkedInDrones)
      },

      // チェックイン済みドローンのプロジェクトを選択状態に同期
      syncProjectsFromCheckedIn: () => {
        const { checkedInDrones, projects, activeDrones } = get()
        const checkedInIds = Object.keys(checkedInDrones)

        // チェックインなしの場合は何もしない
        if (checkedInIds.length === 0) return

        // チェックイン済みドローンのプロジェクトIDを収集
        const projectIds = new Set<string>()
        Object.values(checkedInDrones).forEach((info) => {
          if (info.projectId) {
            projectIds.add(info.projectId)
          }
        })

        // プロジェクトIDが空の場合はドローンのprojectIdから取得
        if (projectIds.size === 0) {
          activeDrones
            .filter((d) => d.droneId in checkedInDrones)
            .forEach((d) => {
              if (d.projectId) {
                projectIds.add(d.projectId)
              }
            })
        }

        const newSelectedIds = Array.from(projectIds)
        if (newSelectedIds.length > 0) {
          set({
            selectedProjectIds: newSelectedIds,
            filteredDrones: calculateFilteredDrones(
              activeDrones,
              projects,
              newSelectedIds
            ),
          })
        }
      },
    }),
    { name: 'utm-store' }
  )
)

// ポイント・イン・ポリゴン判定（Ray Casting Algorithm）
function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: number[][]
): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1]
    const xj = polygon[j][0],
      yj = polygon[j][1]

    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside
    }
  }
  return inside
}

export default useUTMStore
