/**
 * UTM複数機体シナリオ モックデータ
 *
 * 複数機体管理のテスト用シナリオを定義
 * - 同一エリア複数機体
 * - 空域コンフリクト
 * - NOTAM共有エリア
 */

/** 飛行計画の簡略化型 */
interface SimplifiedFlightPlan {
  id: string
  name: string
  description?: string
  status:
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'active'
    | 'completed'
    | 'cancelled'
  droneId?: string
  pilotId?: string
  pilotName?: string
  scheduledStartTime?: Date
  scheduledEndTime?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

/** ドローン状態の簡略化型 */
interface SimplifiedDroneStatus {
  droneId: string
  droneName: string
  pilotId: string
  pilotName: string
  flightPlanId: string | null
  position: {
    droneId: string
    latitude: number
    longitude: number
    altitude: number
    heading: number
    speed: number
    timestamp: Date
  }
  batteryLevel: number
  signalStrength: number
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
}

interface WeatherCondition {
  status: 'good' | 'caution' | 'warning' | 'prohibited'
  temperature: number
  windSpeed: number
  windDirection: string
  visibility: number
  precipitation: number
  description: string
}

interface AirspaceStatus {
  inDID: boolean
  inRedZone: boolean
  inYellowZone: boolean
  nearAirport: boolean
  notamActive: boolean
  summary: string
}

interface FlightAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  message: string
  timestamp: Date
}

export interface ScheduledFlight {
  id: string
  flightPlan: SimplifiedFlightPlan
  /** 単一機体（後方互換） */
  drone: SimplifiedDroneStatus
  /** 複数機体対応: 参加する全機体（オプション） */
  drones?: SimplifiedDroneStatus[]
  /** マルチサイト対応: 複数拠点情報（オプション） */
  sites?: import('../types/utmTypes').SiteInfo[]
  /** マルチサイト対応: デフォルト選択サイトID（オプション） */
  primarySiteId?: string
  preflightStatus: 'pending' | 'in_progress' | 'completed' | 'failed'
  preflightProgress: number
  weather: WeatherCondition
  airspaceStatus: AirspaceStatus
  estimatedStartTime: Date
  estimatedEndTime: Date
  alerts: FlightAlert[]
}

/** ヘルパー: flightから全機体を取得（drones があれば使用、なければ drone を配列で返す） */
export const getFlightDrones = (
  flight: ScheduledFlight
): SimplifiedDroneStatus[] => {
  return flight.drones ?? [flight.drone]
}

/** ヘルパー: 機体数を取得 */
export const getFlightDroneCount = (flight: ScheduledFlight): number => {
  return flight.drones?.length ?? 1
}

/** ヘルパー: flightからサイト情報を取得（sites があれば使用、なければ空配列） */
export const getFlightSites = (
  flight: ScheduledFlight
): import('../types/utmTypes').SiteInfo[] => {
  return flight.sites ?? []
}

/** ヘルパー: マルチサイトフライトかどうかを判定 */
export const isSingleSiteFlight = (flight: ScheduledFlight): boolean => {
  return !flight.sites || flight.sites.length <= 1
}

export type ScenarioType =
  | 'default'
  | 'haneda_multi'
  | 'tokyo_bay_infra'
  | 'congested_airspace'
  | 'emergency_response'
  | 'multi_site'

export interface ScenarioInfo {
  id: ScenarioType
  name: string
  description: string
  totalDrones: number
  areas: string[]
  highlights: string[]
}

// ============================================
// シナリオ情報
// ============================================

export const SCENARIO_INFO: Record<ScenarioType, ScenarioInfo> = {
  default: {
    id: 'default',
    name: '標準シナリオ',
    description: '3エリア各1機体の基本シナリオ',
    totalDrones: 3,
    areas: ['東京都心', '横浜港', '羽田空港周辺'],
    highlights: ['基本的な飛行計画管理'],
  },
  haneda_multi: {
    id: 'haneda_multi',
    name: '羽田空港周辺複数機体',
    description: '羽田空港周辺に3機体を配置、NOTAM共有・空域調整が必要',
    totalDrones: 4,
    areas: ['羽田空港周辺（3機）', '東京湾岸'],
    highlights: [
      '同一NOTAM共有',
      '空港周辺高度制限',
      '機体間安全距離',
      '管制連携',
    ],
  },
  tokyo_bay_infra: {
    id: 'tokyo_bay_infra',
    name: '東京湾岸インフラ一斉点検',
    description: '東京湾岸の橋梁・港湾施設を複数機体で同時点検',
    totalDrones: 5,
    areas: ['東京湾岸（5機）'],
    highlights: [
      '複数機体同時運航',
      'エリア分担',
      'リアルタイム監視',
      'データ収集',
    ],
  },
  congested_airspace: {
    id: 'congested_airspace',
    name: '混雑空域シミュレーション',
    description: '狭いエリアに複数機体、コンフリクト検出テスト',
    totalDrones: 6,
    areas: ['お台場エリア（6機）'],
    highlights: [
      'コンフリクト検出',
      '回避経路計算',
      '優先順位調整',
      '緊急時対応',
    ],
  },
  emergency_response: {
    id: 'emergency_response',
    name: '緊急対応シナリオ',
    description: '災害発生時の緊急飛行、複数機関連携',
    totalDrones: 4,
    areas: ['災害発生エリア（4機）'],
    highlights: ['緊急用務空域', '優先飛行', '機関連携', 'リアルタイム共有'],
  },
  multi_site: {
    id: 'multi_site',
    name: 'マルチサイトシナリオ',
    description: '複数拠点での同時飛行、サイトごとのチェックリストと監視',
    totalDrones: 6,
    areas: ['東京拠点（2機）', '大阪拠点（2機）', '福岡拠点（2機）'],
    highlights: [
      '複数拠点同時飛行',
      'サイトごとプリフライト',
      'サイト間連携',
      '全国規模運航',
    ],
  },
}

// ============================================
// 各シナリオのモックデータ生成
// ============================================

/** 標準シナリオ（既存） */
export const createDefaultScenario = (): ScheduledFlight[] => [
  {
    id: 'sf-001',
    flightPlan: {
      id: 'fp-001',
      name: '東京湾岸インフラ点検',
      description: '橋梁・護岸施設の定期点検飛行',
      status: 'approved',
      droneId: 'drone-001',
      pilotId: 'pilot-001',
      pilotName: '山田太郎',
      scheduledStartTime: new Date(Date.now() + 30 * 60 * 1000),
      scheduledEndTime: new Date(Date.now() + 90 * 60 * 1000),
      createdBy: 'user-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    drone: {
      droneId: 'drone-001',
      droneName: '新十津川(845)',
      pilotId: 'pilot-001',
      pilotName: '山田太郎',
      flightPlanId: 'fp-001',
      position: {
        droneId: 'drone-001',
        latitude: 35.6812,
        longitude: 139.7671,
        altitude: 0,
        heading: 0,
        speed: 0,
        timestamp: new Date(),
      },
      batteryLevel: 98,
      signalStrength: 95,
      flightMode: 'hover',
      status: 'preflight',
      startTime: new Date(),
      estimatedEndTime: new Date(Date.now() + 90 * 60 * 1000),
    },
    preflightStatus: 'completed',
    preflightProgress: 100,
    weather: {
      status: 'good',
      temperature: 22,
      windSpeed: 3.2,
      windDirection: 'NE',
      visibility: 10,
      precipitation: 0,
      description: '晴れ、飛行に適した条件',
    },
    airspaceStatus: {
      inDID: false,
      inRedZone: false,
      inYellowZone: false,
      nearAirport: false,
      notamActive: false,
      summary: '制限なし',
    },
    estimatedStartTime: new Date(Date.now() + 30 * 60 * 1000),
    estimatedEndTime: new Date(
      new Date(Date.now() + 30 * 60 * 1000).getTime() + 3600000
    ),
    alerts: [],
  },
  {
    id: 'sf-002',
    flightPlan: {
      id: 'fp-002',
      name: '横浜港湾施設調査',
      description: 'コンテナターミナル周辺の施設状況調査',
      status: 'approved',
      droneId: 'drone-002',
      pilotId: 'pilot-002',
      pilotName: '佐藤花子',
      scheduledStartTime: new Date(Date.now() + 120 * 60 * 1000),
      scheduledEndTime: new Date(Date.now() + 180 * 60 * 1000),
      createdBy: 'user-001',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    drone: {
      droneId: 'drone-002',
      droneName: '浦安(949)',
      pilotId: 'pilot-002',
      pilotName: '佐藤花子',
      flightPlanId: 'fp-002',
      position: {
        droneId: 'drone-002',
        latitude: 35.45,
        longitude: 139.65,
        altitude: 0,
        heading: 0,
        speed: 0,
        timestamp: new Date(),
      },
      batteryLevel: 45,
      signalStrength: 88,
      flightMode: 'hover',
      status: 'preflight',
      startTime: new Date(),
      estimatedEndTime: new Date(Date.now() + 180 * 60 * 1000),
    },
    preflightStatus: 'in_progress',
    preflightProgress: 65,
    weather: {
      status: 'caution',
      temperature: 20,
      windSpeed: 8.5,
      windDirection: 'SW',
      visibility: 8,
      precipitation: 0,
      description: '風速注意（8.5m/s）',
    },
    airspaceStatus: {
      inDID: true,
      inRedZone: false,
      inYellowZone: false,
      nearAirport: false,
      notamActive: false,
      summary: 'DID区域内',
    },
    estimatedStartTime: new Date(Date.now() + 120 * 60 * 1000),
    estimatedEndTime: new Date(
      new Date(Date.now() + 120 * 60 * 1000).getTime() + 3600000
    ),
    alerts: [
      {
        id: 'alert-001',
        type: 'warning',
        message: 'バッテリー残量が50%を下回っています',
        timestamp: new Date(),
      },
    ],
  },
  {
    id: 'sf-003',
    flightPlan: {
      id: 'fp-003',
      name: '羽田空港周辺監視',
      description: '鳥害対策モニタリング飛行',
      status: 'pending_approval',
      droneId: 'drone-003',
      pilotId: 'pilot-003',
      pilotName: '鈴木一郎',
      scheduledStartTime: new Date(Date.now() + 240 * 60 * 1000),
      scheduledEndTime: new Date(Date.now() + 300 * 60 * 1000),
      createdBy: 'user-002',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    drone: {
      droneId: 'drone-003',
      droneName: '秩父#1(945)',
      pilotId: 'pilot-003',
      pilotName: '鈴木一郎',
      flightPlanId: 'fp-003',
      position: {
        droneId: 'drone-003',
        latitude: 35.55,
        longitude: 139.78,
        altitude: 0,
        heading: 0,
        speed: 0,
        timestamp: new Date(),
      },
      batteryLevel: 85,
      signalStrength: 72,
      flightMode: 'hover',
      status: 'preflight',
      startTime: new Date(),
      estimatedEndTime: new Date(Date.now() + 300 * 60 * 1000),
    },
    preflightStatus: 'pending',
    preflightProgress: 0,
    weather: {
      status: 'good',
      temperature: 21,
      windSpeed: 4.1,
      windDirection: 'N',
      visibility: 12,
      precipitation: 0,
      description: '晴れ',
    },
    airspaceStatus: {
      inDID: true,
      inRedZone: false,
      inYellowZone: true,
      nearAirport: true,
      notamActive: true,
      summary: '空港周辺・NOTAM発行中',
    },
    estimatedStartTime: new Date(Date.now() + 240 * 60 * 1000),
    estimatedEndTime: new Date(
      new Date(Date.now() + 240 * 60 * 1000).getTime() + 3600000
    ),
    alerts: [
      {
        id: 'alert-002',
        type: 'error',
        message: '空港周辺飛行には管制許可が必要です',
        timestamp: new Date(),
      },
      {
        id: 'alert-003',
        type: 'info',
        message: 'NOTAM A1234/26 発行中',
        timestamp: new Date(),
      },
    ],
  },
]

/** 羽田空港周辺複数機体シナリオ */
export const createHanedaMultiScenario = (): ScheduledFlight[] => {
  const baseTime = Date.now()
  // 羽田空港周辺の座標（35.5493, 139.7798）
  const hanedaCenter = { lat: 35.5493, lng: 139.7798 }

  return [
    // 羽田機体1: 滑走路北側監視
    {
      id: 'sf-h001',
      flightPlan: {
        id: 'fp-h001',
        name: '羽田空港 滑走路北側監視',
        description: 'A滑走路北側の鳥害監視飛行',
        status: 'approved',
        droneId: 'drone-h001',
        pilotId: 'pilot-h001',
        pilotName: '田中一郎',
        scheduledStartTime: new Date(baseTime + 30 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 90 * 60 * 1000),
        createdBy: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-h001',
        droneName: '羽田監視#1(H01)',
        pilotId: 'pilot-h001',
        pilotName: '田中一郎',
        flightPlanId: 'fp-h001',
        position: {
          droneId: 'drone-h001',
          latitude: hanedaCenter.lat + 0.015, // 北側
          longitude: hanedaCenter.lng - 0.01,
          altitude: 0,
          heading: 180,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 95,
        signalStrength: 92,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 90 * 60 * 1000),
      },
      preflightStatus: 'completed',
      preflightProgress: 100,
      weather: {
        status: 'good',
        temperature: 21,
        windSpeed: 4.2,
        windDirection: 'N',
        visibility: 12,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: true,
        nearAirport: true,
        notamActive: true,
        summary: '空港周辺・NOTAM A1234/26',
      },
      estimatedStartTime: new Date(baseTime + 30 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 30 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [
        {
          id: 'alert-h001',
          type: 'info',
          message: 'NOTAM A1234/26 - 他機体と共有',
          timestamp: new Date(),
        },
      ],
    },
    // 羽田機体2: 滑走路南側監視
    {
      id: 'sf-h002',
      flightPlan: {
        id: 'fp-h002',
        name: '羽田空港 滑走路南側監視',
        description: 'C滑走路南側の鳥害監視飛行',
        status: 'approved',
        droneId: 'drone-h002',
        pilotId: 'pilot-h002',
        pilotName: '高橋次郎',
        scheduledStartTime: new Date(baseTime + 35 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 95 * 60 * 1000),
        createdBy: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-h002',
        droneName: '羽田監視#2(H02)',
        pilotId: 'pilot-h002',
        pilotName: '高橋次郎',
        flightPlanId: 'fp-h002',
        position: {
          droneId: 'drone-h002',
          latitude: hanedaCenter.lat - 0.012, // 南側
          longitude: hanedaCenter.lng + 0.008,
          altitude: 0,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 88,
        signalStrength: 89,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 95 * 60 * 1000),
      },
      preflightStatus: 'completed',
      preflightProgress: 100,
      weather: {
        status: 'good',
        temperature: 21,
        windSpeed: 4.5,
        windDirection: 'N',
        visibility: 12,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: true,
        nearAirport: true,
        notamActive: true,
        summary: '空港周辺・NOTAM A1234/26',
      },
      estimatedStartTime: new Date(baseTime + 35 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 35 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [
        {
          id: 'alert-h002',
          type: 'info',
          message: 'NOTAM A1234/26 - 他機体と共有',
          timestamp: new Date(),
        },
        {
          id: 'alert-h002-2',
          type: 'warning',
          message: '機体H01と飛行時間帯が重複',
          timestamp: new Date(),
        },
      ],
    },
    // 羽田機体3: ターミナル周辺
    {
      id: 'sf-h003',
      flightPlan: {
        id: 'fp-h003',
        name: '羽田空港 ターミナル周辺点検',
        description: '第3ターミナル屋根・外壁点検',
        status: 'pending_approval',
        droneId: 'drone-h003',
        pilotId: 'pilot-h003',
        pilotName: '伊藤三郎',
        scheduledStartTime: new Date(baseTime + 60 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 120 * 60 * 1000),
        createdBy: 'user-002',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-h003',
        droneName: '点検専用#3(H03)',
        pilotId: 'pilot-h003',
        pilotName: '伊藤三郎',
        flightPlanId: 'fp-h003',
        position: {
          droneId: 'drone-h003',
          latitude: hanedaCenter.lat + 0.005,
          longitude: hanedaCenter.lng + 0.015, // ターミナル側
          altitude: 0,
          heading: 270,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 100,
        signalStrength: 95,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 120 * 60 * 1000),
      },
      preflightStatus: 'in_progress',
      preflightProgress: 45,
      weather: {
        status: 'good',
        temperature: 21,
        windSpeed: 3.8,
        windDirection: 'NE',
        visibility: 12,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: true,
        nearAirport: true,
        notamActive: true,
        summary: '空港周辺・要管制許可',
      },
      estimatedStartTime: new Date(baseTime + 60 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 60 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [
        {
          id: 'alert-h003',
          type: 'error',
          message: '空港管理者の特別許可が必要です',
          timestamp: new Date(),
        },
        {
          id: 'alert-h003-2',
          type: 'warning',
          message: '機体H01, H02と同時刻帯の飛行',
          timestamp: new Date(),
        },
      ],
    },
    // 東京湾岸（比較用）
    {
      id: 'sf-h004',
      flightPlan: {
        id: 'fp-h004',
        name: '東京湾岸インフラ点検',
        description: 'レインボーブリッジ定期点検',
        status: 'approved',
        droneId: 'drone-h004',
        pilotId: 'pilot-h004',
        pilotName: '山本四郎',
        scheduledStartTime: new Date(baseTime + 45 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 105 * 60 * 1000),
        createdBy: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-h004',
        droneName: '新十津川(845)',
        pilotId: 'pilot-h004',
        pilotName: '山本四郎',
        flightPlanId: 'fp-h004',
        position: {
          droneId: 'drone-h004',
          latitude: 35.6358, // レインボーブリッジ
          longitude: 139.7634,
          altitude: 0,
          heading: 90,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 92,
        signalStrength: 94,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 105 * 60 * 1000),
      },
      preflightStatus: 'completed',
      preflightProgress: 100,
      weather: {
        status: 'good',
        temperature: 22,
        windSpeed: 4.0,
        windDirection: 'NE',
        visibility: 10,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: false,
        summary: 'DID区域内',
      },
      estimatedStartTime: new Date(baseTime + 45 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 45 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [],
    },
  ]
}

/** 東京湾岸インフラ一斉点検シナリオ */
export const createTokyoBayInfraScenario = (): ScheduledFlight[] => {
  const baseTime = Date.now()

  return [
    // レインボーブリッジ
    {
      id: 'sf-tb001',
      flightPlan: {
        id: 'fp-tb001',
        name: 'レインボーブリッジ点検',
        description: '主塔・ケーブル目視点検',
        status: 'approved',
        droneId: 'drone-tb001',
        pilotId: 'pilot-tb001',
        pilotName: '点検チームA',
        scheduledStartTime: new Date(baseTime + 30 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 90 * 60 * 1000),
        createdBy: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-tb001',
        droneName: '湾岸点検#1(TB01)',
        pilotId: 'pilot-tb001',
        pilotName: '点検チームA',
        flightPlanId: 'fp-tb001',
        position: {
          droneId: 'drone-tb001',
          latitude: 35.6358,
          longitude: 139.7634,
          altitude: 0,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 100,
        signalStrength: 95,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 90 * 60 * 1000),
      },
      preflightStatus: 'completed',
      preflightProgress: 100,
      weather: {
        status: 'good',
        temperature: 22,
        windSpeed: 3.5,
        windDirection: 'E',
        visibility: 12,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: false,
        summary: 'DID区域内',
      },
      estimatedStartTime: new Date(baseTime + 30 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 30 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [],
    },
    // 東京ゲートブリッジ
    {
      id: 'sf-tb002',
      flightPlan: {
        id: 'fp-tb002',
        name: '東京ゲートブリッジ点検',
        description: 'トラス構造・路面点検',
        status: 'approved',
        droneId: 'drone-tb002',
        pilotId: 'pilot-tb002',
        pilotName: '点検チームB',
        scheduledStartTime: new Date(baseTime + 35 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 95 * 60 * 1000),
        createdBy: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-tb002',
        droneName: '湾岸点検#2(TB02)',
        pilotId: 'pilot-tb002',
        pilotName: '点検チームB',
        flightPlanId: 'fp-tb002',
        position: {
          droneId: 'drone-tb002',
          latitude: 35.6017,
          longitude: 139.8267,
          altitude: 0,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 98,
        signalStrength: 92,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 95 * 60 * 1000),
      },
      preflightStatus: 'completed',
      preflightProgress: 100,
      weather: {
        status: 'good',
        temperature: 22,
        windSpeed: 4.0,
        windDirection: 'E',
        visibility: 12,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: false,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: false,
        summary: '制限なし',
      },
      estimatedStartTime: new Date(baseTime + 35 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 35 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [],
    },
    // 晴海埠頭
    {
      id: 'sf-tb003',
      flightPlan: {
        id: 'fp-tb003',
        name: '晴海埠頭施設点検',
        description: '岸壁・クレーン設備点検',
        status: 'approved',
        droneId: 'drone-tb003',
        pilotId: 'pilot-tb003',
        pilotName: '点検チームC',
        scheduledStartTime: new Date(baseTime + 40 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 100 * 60 * 1000),
        createdBy: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-tb003',
        droneName: '湾岸点検#3(TB03)',
        pilotId: 'pilot-tb003',
        pilotName: '点検チームC',
        flightPlanId: 'fp-tb003',
        position: {
          droneId: 'drone-tb003',
          latitude: 35.6465,
          longitude: 139.7823,
          altitude: 0,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 95,
        signalStrength: 90,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 100 * 60 * 1000),
      },
      preflightStatus: 'in_progress',
      preflightProgress: 80,
      weather: {
        status: 'good',
        temperature: 22,
        windSpeed: 3.8,
        windDirection: 'E',
        visibility: 12,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: false,
        summary: 'DID区域内',
      },
      estimatedStartTime: new Date(baseTime + 40 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 40 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [],
    },
    // 大井埠頭
    {
      id: 'sf-tb004',
      flightPlan: {
        id: 'fp-tb004',
        name: '大井埠頭コンテナターミナル点検',
        description: 'ガントリークレーン・ヤード点検',
        status: 'approved',
        droneId: 'drone-tb004',
        pilotId: 'pilot-tb004',
        pilotName: '点検チームD',
        scheduledStartTime: new Date(baseTime + 45 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 105 * 60 * 1000),
        createdBy: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-tb004',
        droneName: '湾岸点検#4(TB04)',
        pilotId: 'pilot-tb004',
        pilotName: '点検チームD',
        flightPlanId: 'fp-tb004',
        position: {
          droneId: 'drone-tb004',
          latitude: 35.5958,
          longitude: 139.7583,
          altitude: 0,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 92,
        signalStrength: 88,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 105 * 60 * 1000),
      },
      preflightStatus: 'in_progress',
      preflightProgress: 60,
      weather: {
        status: 'good',
        temperature: 22,
        windSpeed: 4.2,
        windDirection: 'E',
        visibility: 12,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: false,
        summary: 'DID区域内',
      },
      estimatedStartTime: new Date(baseTime + 45 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 45 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [],
    },
    // 有明埠頭
    {
      id: 'sf-tb005',
      flightPlan: {
        id: 'fp-tb005',
        name: '有明埠頭・ビッグサイト周辺点検',
        description: '護岸・建築物外壁点検',
        status: 'pending_approval',
        droneId: 'drone-tb005',
        pilotId: 'pilot-tb005',
        pilotName: '点検チームE',
        scheduledStartTime: new Date(baseTime + 50 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 110 * 60 * 1000),
        createdBy: 'user-002',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-tb005',
        droneName: '湾岸点検#5(TB05)',
        pilotId: 'pilot-tb005',
        pilotName: '点検チームE',
        flightPlanId: 'fp-tb005',
        position: {
          droneId: 'drone-tb005',
          latitude: 35.6292,
          longitude: 139.7917,
          altitude: 0,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 100,
        signalStrength: 94,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 110 * 60 * 1000),
      },
      preflightStatus: 'pending',
      preflightProgress: 0,
      weather: {
        status: 'good',
        temperature: 22,
        windSpeed: 3.5,
        windDirection: 'E',
        visibility: 12,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: false,
        summary: 'DID区域内',
      },
      estimatedStartTime: new Date(baseTime + 50 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 50 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [
        {
          id: 'alert-tb005',
          type: 'warning',
          message: '同時刻帯に4機が飛行予定',
          timestamp: new Date(),
        },
      ],
    },
    // 複数機体ミッション: 東京港一斉点検（編隊飛行）
    {
      id: 'sf-tb006',
      flightPlan: {
        id: 'fp-tb006',
        name: '東京港一斉点検（編隊飛行）',
        description: '3機編隊による港湾施設広域点検',
        status: 'approved',
        droneId: 'drone-tb006a',
        pilotId: 'pilot-tb006',
        pilotName: '編隊指揮チーム',
        scheduledStartTime: new Date(baseTime + 55 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 115 * 60 * 1000),
        createdBy: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-tb006a',
        droneName: '編隊#1(FL01)',
        pilotId: 'pilot-tb006',
        pilotName: '編隊指揮チーム',
        flightPlanId: 'fp-tb006',
        position: {
          droneId: 'drone-tb006a',
          latitude: 35.62,
          longitude: 139.77,
          altitude: 0,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 95,
        signalStrength: 92,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 115 * 60 * 1000),
      },
      // 複数機体
      drones: [
        {
          droneId: 'drone-tb006a',
          droneName: '編隊#1(FL01)',
          pilotId: 'pilot-tb006a',
          pilotName: '操縦者A',
          flightPlanId: 'fp-tb006',
          position: {
            droneId: 'drone-tb006a',
            latitude: 35.62,
            longitude: 139.77,
            altitude: 0,
            heading: 0,
            speed: 0,
            timestamp: new Date(),
          },
          batteryLevel: 95,
          signalStrength: 92,
          flightMode: 'hover',
          status: 'preflight',
          startTime: new Date(),
          estimatedEndTime: new Date(baseTime + 115 * 60 * 1000),
        },
        {
          droneId: 'drone-tb006b',
          droneName: '編隊#2(FL02)',
          pilotId: 'pilot-tb006b',
          pilotName: '操縦者B',
          flightPlanId: 'fp-tb006',
          position: {
            droneId: 'drone-tb006b',
            latitude: 35.621,
            longitude: 139.771,
            altitude: 0,
            heading: 0,
            speed: 0,
            timestamp: new Date(),
          },
          batteryLevel: 88,
          signalStrength: 89,
          flightMode: 'hover',
          status: 'preflight',
          startTime: new Date(),
          estimatedEndTime: new Date(baseTime + 115 * 60 * 1000),
        },
        {
          droneId: 'drone-tb006c',
          droneName: '編隊#3(FL03)',
          pilotId: 'pilot-tb006c',
          pilotName: '操縦者C',
          flightPlanId: 'fp-tb006',
          position: {
            droneId: 'drone-tb006c',
            latitude: 35.619,
            longitude: 139.769,
            altitude: 0,
            heading: 0,
            speed: 0,
            timestamp: new Date(),
          },
          batteryLevel: 92,
          signalStrength: 85,
          flightMode: 'hover',
          status: 'preflight',
          startTime: new Date(),
          estimatedEndTime: new Date(baseTime + 115 * 60 * 1000),
        },
      ],
      preflightStatus: 'in_progress',
      preflightProgress: 70,
      weather: {
        status: 'good',
        temperature: 22,
        windSpeed: 3.2,
        windDirection: 'E',
        visibility: 12,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: false,
        summary: 'DID区域内',
      },
      estimatedStartTime: new Date(baseTime + 55 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 55 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [
        {
          id: 'alert-tb006',
          type: 'info',
          message: '3機編隊飛行ミッション',
          timestamp: new Date(),
        },
      ],
    },
  ]
}

/** 混雑空域シナリオ（お台場エリア） */
export const createCongestedAirspaceScenario = (): ScheduledFlight[] => {
  const baseTime = Date.now()
  // お台場中心座標
  const odaibaCenter = { lat: 35.6267, lng: 139.775 }

  const flights: ScheduledFlight[] = []
  const teamNames = ['Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot']
  const purposes = [
    'イベント空撮',
    'セキュリティ監視',
    '施設点検',
    '測量',
    '物流テスト',
    'デモフライト',
  ]

  for (let i = 0; i < 6; i++) {
    const angle = (i * 60 * Math.PI) / 180
    const radius = 0.005 + Math.random() * 0.003

    flights.push({
      id: `sf-ca00${i + 1}`,
      flightPlan: {
        id: `fp-ca00${i + 1}`,
        name: `お台場 ${purposes[i]}`,
        description: `お台場エリア${purposes[i]}ミッション`,
        status: i < 4 ? 'approved' : 'pending_approval',
        droneId: `drone-ca00${i + 1}`,
        pilotId: `pilot-ca00${i + 1}`,
        pilotName: `チーム${teamNames[i]}`,
        scheduledStartTime: new Date(baseTime + (20 + i * 5) * 60 * 1000),
        scheduledEndTime: new Date(baseTime + (80 + i * 5) * 60 * 1000),
        createdBy: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: `drone-ca00${i + 1}`,
        droneName: `混雑テスト#${i + 1}(CA0${i + 1})`,
        pilotId: `pilot-ca00${i + 1}`,
        pilotName: `チーム${teamNames[i]}`,
        flightPlanId: `fp-ca00${i + 1}`,
        position: {
          droneId: `drone-ca00${i + 1}`,
          latitude: odaibaCenter.lat + radius * Math.sin(angle),
          longitude: odaibaCenter.lng + radius * Math.cos(angle),
          altitude: 0,
          heading: (angle * 180) / Math.PI,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 90 + Math.floor(Math.random() * 10),
        signalStrength: 85 + Math.floor(Math.random() * 10),
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + (80 + i * 5) * 60 * 1000),
      },
      preflightStatus: i < 3 ? 'completed' : i < 5 ? 'in_progress' : 'pending',
      preflightProgress: i < 3 ? 100 : i < 5 ? 50 + i * 10 : 0,
      weather: {
        status: 'good',
        temperature: 22,
        windSpeed: 3.0 + Math.random() * 2,
        windDirection: 'SE',
        visibility: 10,
        precipitation: 0,
        description: '晴れ',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: false,
        summary: 'DID区域内',
      },
      estimatedStartTime: new Date(baseTime + (20 + i * 5) * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + (20 + i * 5) * 60 * 1000).getTime() + 3600000
      ),
      alerts:
        i > 0
          ? [
              {
                id: `alert-ca00${i + 1}`,
                type: 'warning',
                message: `他${i}機と飛行エリアが重複`,
                timestamp: new Date(),
              },
            ]
          : [],
    })
  }

  return flights
}

/** 緊急対応シナリオ */
export const createEmergencyResponseScenario = (): ScheduledFlight[] => {
  const baseTime = Date.now()
  // 災害発生地点（仮：江東区）
  const emergencyCenter = { lat: 35.6729, lng: 139.817 }

  return [
    // 消防ドローン
    {
      id: 'sf-em001',
      flightPlan: {
        id: 'fp-em001',
        name: '【緊急】火災現場上空監視',
        description: '東京消防庁 緊急出動',
        status: 'active',
        droneId: 'drone-em001',
        pilotId: 'pilot-em001',
        pilotName: '消防局オペレーター',
        scheduledStartTime: new Date(baseTime - 10 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 50 * 60 * 1000),
        createdBy: 'emergency-001',
        createdAt: new Date(baseTime - 15 * 60 * 1000),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-em001',
        droneName: '消防監視#1(FD01)',
        pilotId: 'pilot-em001',
        pilotName: '消防局オペレーター',
        flightPlanId: 'fp-em001',
        position: {
          droneId: 'drone-em001',
          latitude: emergencyCenter.lat,
          longitude: emergencyCenter.lng,
          altitude: 100,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 75,
        signalStrength: 92,
        flightMode: 'hover',
        status: 'in_flight',
        startTime: new Date(baseTime - 10 * 60 * 1000),
        estimatedEndTime: new Date(baseTime + 50 * 60 * 1000),
      },
      preflightStatus: 'completed',
      preflightProgress: 100,
      weather: {
        status: 'caution',
        temperature: 25,
        windSpeed: 6.5,
        windDirection: 'W',
        visibility: 5,
        precipitation: 0,
        description: '煙による視程低下',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: true,
        summary: '緊急用務空域設定中',
      },
      estimatedStartTime: new Date(baseTime - 10 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime - 10 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [
        {
          id: 'alert-em001',
          type: 'error',
          message: '緊急用務空域 - 優先飛行中',
          timestamp: new Date(),
        },
      ],
    },
    // 警察ドローン
    {
      id: 'sf-em002',
      flightPlan: {
        id: 'fp-em002',
        name: '【緊急】交通規制支援',
        description: '警視庁 緊急出動',
        status: 'active',
        droneId: 'drone-em002',
        pilotId: 'pilot-em002',
        pilotName: '警察オペレーター',
        scheduledStartTime: new Date(baseTime - 5 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 55 * 60 * 1000),
        createdBy: 'emergency-002',
        createdAt: new Date(baseTime - 10 * 60 * 1000),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-em002',
        droneName: '警察監視#1(PD01)',
        pilotId: 'pilot-em002',
        pilotName: '警察オペレーター',
        flightPlanId: 'fp-em002',
        position: {
          droneId: 'drone-em002',
          latitude: emergencyCenter.lat + 0.005,
          longitude: emergencyCenter.lng - 0.003,
          altitude: 80,
          heading: 180,
          speed: 5,
          timestamp: new Date(),
        },
        batteryLevel: 82,
        signalStrength: 90,
        flightMode: 'auto',
        status: 'in_flight',
        startTime: new Date(baseTime - 5 * 60 * 1000),
        estimatedEndTime: new Date(baseTime + 55 * 60 * 1000),
      },
      preflightStatus: 'completed',
      preflightProgress: 100,
      weather: {
        status: 'caution',
        temperature: 25,
        windSpeed: 6.5,
        windDirection: 'W',
        visibility: 5,
        precipitation: 0,
        description: '煙による視程低下',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: true,
        summary: '緊急用務空域設定中',
      },
      estimatedStartTime: new Date(baseTime - 5 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime - 5 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [
        {
          id: 'alert-em002',
          type: 'error',
          message: '緊急用務空域 - 優先飛行中',
          timestamp: new Date(),
        },
      ],
    },
    // 報道ドローン（待機中）
    {
      id: 'sf-em003',
      flightPlan: {
        id: 'fp-em003',
        name: '報道取材（緊急空域外待機）',
        description: 'テレビ局 取材飛行',
        status: 'approved',
        droneId: 'drone-em003',
        pilotId: 'pilot-em003',
        pilotName: '報道オペレーター',
        scheduledStartTime: new Date(baseTime + 30 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 90 * 60 * 1000),
        createdBy: 'user-003',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-em003',
        droneName: '報道#1(NW01)',
        pilotId: 'pilot-em003',
        pilotName: '報道オペレーター',
        flightPlanId: 'fp-em003',
        position: {
          droneId: 'drone-em003',
          latitude: emergencyCenter.lat - 0.015,
          longitude: emergencyCenter.lng + 0.01,
          altitude: 0,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 100,
        signalStrength: 95,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 90 * 60 * 1000),
      },
      preflightStatus: 'completed',
      preflightProgress: 100,
      weather: {
        status: 'caution',
        temperature: 25,
        windSpeed: 6.5,
        windDirection: 'W',
        visibility: 5,
        precipitation: 0,
        description: '煙による視程低下',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: true,
        nearAirport: false,
        notamActive: true,
        summary: '緊急空域外・待機中',
      },
      estimatedStartTime: new Date(baseTime + 30 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 30 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [
        {
          id: 'alert-em003',
          type: 'warning',
          message: '緊急用務空域解除まで待機',
          timestamp: new Date(),
        },
      ],
    },
    // 物流ドローン（飛行中止）
    {
      id: 'sf-em004',
      flightPlan: {
        id: 'fp-em004',
        name: '物流配送（飛行中止）',
        description: '定期配送ルート - 緊急空域により中止',
        status: 'cancelled',
        droneId: 'drone-em004',
        pilotId: 'pilot-em004',
        pilotName: '物流オペレーター',
        scheduledStartTime: new Date(baseTime + 10 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 40 * 60 * 1000),
        createdBy: 'user-004',
        createdAt: new Date(baseTime - 60 * 60 * 1000),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-em004',
        droneName: '配送#5(DL05)',
        pilotId: 'pilot-em004',
        pilotName: '物流オペレーター',
        flightPlanId: 'fp-em004',
        position: {
          droneId: 'drone-em004',
          latitude: emergencyCenter.lat + 0.02,
          longitude: emergencyCenter.lng - 0.015,
          altitude: 0,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 100,
        signalStrength: 95,
        flightMode: 'hover',
        status: 'landed',
        startTime: new Date(),
        estimatedEndTime: null,
      },
      preflightStatus: 'failed',
      preflightProgress: 100,
      weather: {
        status: 'prohibited',
        temperature: 25,
        windSpeed: 6.5,
        windDirection: 'W',
        visibility: 5,
        precipitation: 0,
        description: '緊急空域設定により飛行禁止',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: true,
        inYellowZone: false,
        nearAirport: false,
        notamActive: true,
        summary: '緊急用務空域内・飛行禁止',
      },
      estimatedStartTime: new Date(baseTime + 10 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 10 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [
        {
          id: 'alert-em004',
          type: 'error',
          message: '緊急用務空域により飛行中止',
          timestamp: new Date(),
        },
      ],
    },
  ]
}

/** マルチサイトシナリオ */
export const createMultiSiteScenario = (): ScheduledFlight[] => {
  const baseTime = Date.now()

  return [
    {
      id: 'sf-multisite-001',
      flightPlan: {
        id: 'fp-multisite-001',
        name: '全国拠点インフラ点検',
        description: '東京・大阪・福岡の3拠点で同時にインフラ点検を実施',
        status: 'approved',
        pilotId: 'pilot-ms-001',
        pilotName: '統括パイロット',
        scheduledStartTime: new Date(baseTime + 30 * 60 * 1000),
        scheduledEndTime: new Date(baseTime + 150 * 60 * 1000),
        createdBy: 'user-admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      drone: {
        droneId: 'drone-tokyo-01',
        droneName: '東京1号機',
        pilotId: 'pilot-tokyo-01',
        pilotName: '東京パイロット1',
        flightPlanId: 'fp-multisite-001',
        position: {
          droneId: 'drone-tokyo-01',
          latitude: 35.6812,
          longitude: 139.7671,
          altitude: 0,
          heading: 0,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 100,
        signalStrength: 98,
        flightMode: 'hover',
        status: 'preflight',
        startTime: new Date(),
        estimatedEndTime: new Date(baseTime + 120 * 60 * 1000),
      },
      drones: [
        {
          droneId: 'drone-tokyo-01',
          droneName: '東京1号機',
          pilotId: 'pilot-tokyo-01',
          pilotName: '東京パイロット1',
          flightPlanId: 'fp-multisite-001',
          position: {
            droneId: 'drone-tokyo-01',
            latitude: 35.6812,
            longitude: 139.7671,
            altitude: 0,
            heading: 0,
            speed: 0,
            timestamp: new Date(),
          },
          batteryLevel: 100,
          signalStrength: 98,
          flightMode: 'hover',
          status: 'preflight',
          startTime: new Date(),
          estimatedEndTime: new Date(baseTime + 120 * 60 * 1000),
        },
        {
          droneId: 'drone-tokyo-02',
          droneName: '東京2号機',
          pilotId: 'pilot-tokyo-02',
          pilotName: '東京パイロット2',
          flightPlanId: 'fp-multisite-001',
          position: {
            droneId: 'drone-tokyo-02',
            latitude: 35.6895,
            longitude: 139.6917,
            altitude: 0,
            heading: 0,
            speed: 0,
            timestamp: new Date(),
          },
          batteryLevel: 98,
          signalStrength: 95,
          flightMode: 'hover',
          status: 'preflight',
          startTime: new Date(),
          estimatedEndTime: new Date(baseTime + 120 * 60 * 1000),
        },
        {
          droneId: 'drone-osaka-01',
          droneName: '大阪1号機',
          pilotId: 'pilot-osaka-01',
          pilotName: '大阪パイロット1',
          flightPlanId: 'fp-multisite-001',
          position: {
            droneId: 'drone-osaka-01',
            latitude: 34.6937,
            longitude: 135.5023,
            altitude: 0,
            heading: 0,
            speed: 0,
            timestamp: new Date(),
          },
          batteryLevel: 100,
          signalStrength: 97,
          flightMode: 'hover',
          status: 'preflight',
          startTime: new Date(),
          estimatedEndTime: new Date(baseTime + 120 * 60 * 1000),
        },
        {
          droneId: 'drone-osaka-02',
          droneName: '大阪2号機',
          pilotId: 'pilot-osaka-02',
          pilotName: '大阪パイロット2',
          flightPlanId: 'fp-multisite-001',
          position: {
            droneId: 'drone-osaka-02',
            latitude: 34.6863,
            longitude: 135.5145,
            altitude: 0,
            heading: 0,
            speed: 0,
            timestamp: new Date(),
          },
          batteryLevel: 95,
          signalStrength: 93,
          flightMode: 'hover',
          status: 'preflight',
          startTime: new Date(),
          estimatedEndTime: new Date(baseTime + 120 * 60 * 1000),
        },
        {
          droneId: 'drone-fukuoka-01',
          droneName: '福岡1号機',
          pilotId: 'pilot-fukuoka-01',
          pilotName: '福岡パイロット1',
          flightPlanId: 'fp-multisite-001',
          position: {
            droneId: 'drone-fukuoka-01',
            latitude: 33.5904,
            longitude: 130.4017,
            altitude: 0,
            heading: 0,
            speed: 0,
            timestamp: new Date(),
          },
          batteryLevel: 100,
          signalStrength: 96,
          flightMode: 'hover',
          status: 'preflight',
          startTime: new Date(),
          estimatedEndTime: new Date(baseTime + 120 * 60 * 1000),
        },
        {
          droneId: 'drone-fukuoka-02',
          droneName: '福岡2号機',
          pilotId: 'pilot-fukuoka-02',
          pilotName: '福岡パイロット2',
          flightPlanId: 'fp-multisite-001',
          position: {
            droneId: 'drone-fukuoka-02',
            latitude: 33.5833,
            longitude: 130.4167,
            altitude: 0,
            heading: 0,
            speed: 0,
            timestamp: new Date(),
          },
          batteryLevel: 97,
          signalStrength: 94,
          flightMode: 'hover',
          status: 'preflight',
          startTime: new Date(),
          estimatedEndTime: new Date(baseTime + 120 * 60 * 1000),
        },
      ],
      sites: [
        {
          id: 'site-tokyo',
          name: '東京拠点',
          location: {
            latitude: 35.6812,
            longitude: 139.7671,
          },
          drones: ['drone-tokyo-01', 'drone-tokyo-02'],
          description: '東京都心部のインフラ点検拠点',
        },
        {
          id: 'site-osaka',
          name: '大阪拠点',
          location: {
            latitude: 34.6937,
            longitude: 135.5023,
          },
          drones: ['drone-osaka-01', 'drone-osaka-02'],
          description: '大阪市内のインフラ点検拠点',
        },
        {
          id: 'site-fukuoka',
          name: '福岡拠点',
          location: {
            latitude: 33.5904,
            longitude: 130.4017,
          },
          drones: ['drone-fukuoka-01', 'drone-fukuoka-02'],
          description: '福岡市内のインフラ点検拠点',
        },
      ],
      primarySiteId: 'site-tokyo',
      preflightStatus: 'in_progress',
      preflightProgress: 60,
      weather: {
        status: 'good',
        temperature: 23,
        windSpeed: 4.5,
        windDirection: 'NE',
        visibility: 12,
        precipitation: 0,
        description: '全拠点で良好な飛行条件',
      },
      airspaceStatus: {
        inDID: true,
        inRedZone: false,
        inYellowZone: false,
        nearAirport: false,
        notamActive: true,
        summary: '各拠点でNOTAM申請済み、人口集中地区での飛行許可取得済み',
      },
      estimatedStartTime: new Date(baseTime + 30 * 60 * 1000),
      estimatedEndTime: new Date(
        new Date(baseTime + 30 * 60 * 1000).getTime() + 3600000
      ),
      alerts: [
        {
          id: 'alert-multisite-001',
          type: 'info',
          message: '大阪拠点のプリフライトチェックが未完了です',
          timestamp: new Date(),
        },
      ],
    },
  ]
}

// ============================================
// シナリオ取得関数
// ============================================

export const getScenarioFlights = (
  scenarioType: ScenarioType
): ScheduledFlight[] => {
  switch (scenarioType) {
    case 'haneda_multi':
      return createHanedaMultiScenario()
    case 'tokyo_bay_infra':
      return createTokyoBayInfraScenario()
    case 'congested_airspace':
      return createCongestedAirspaceScenario()
    case 'emergency_response':
      return createEmergencyResponseScenario()
    case 'multi_site':
      return createMultiSiteScenario()
    default:
      return createDefaultScenario()
  }
}

export const getAllScenarios = (): ScenarioInfo[] => {
  return Object.values(SCENARIO_INFO)
}
