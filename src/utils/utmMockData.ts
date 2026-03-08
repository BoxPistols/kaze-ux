/**
 * UTMプロトタイプ用モックデータユーティリティ
 * 見た目上動作するプロトタイプのためのダミーデータを提供
 */

import type {
  DroneFlightStatus,
  RestrictedZone,
  UTMAlert,
  WeatherData,
} from '@/types/utmTypes'

// モックFPV映像URL（Unsplashのドローン空撮画像）
// 実際のプロトタイプでは静止画を使用
export const MOCK_FPV_URLS: Record<string, string> = {
  // 都市部空撮
  urban:
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=360&fit=crop',
  // 田園地帯
  rural:
    'https://images.unsplash.com/photo-1500534623283-312aade485b7?w=640&h=360&fit=crop',
  // 海岸線
  coastal:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=640&h=360&fit=crop',
  // 山岳地帯
  mountain:
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=640&h=360&fit=crop',
  // 工業地帯
  industrial:
    'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=640&h=360&fit=crop',
  // 森林
  forest:
    'https://images.unsplash.com/photo-1448375240586-882707db888b?w=640&h=360&fit=crop',
}

// FPV映像タイプをランダムに取得
export const getRandomFpvUrl = (): string => {
  const types = Object.keys(MOCK_FPV_URLS)
  const randomType = types[Math.floor(Math.random() * types.length)]
  return MOCK_FPV_URLS[randomType]
}

// ドローンIDに基づいてFPV URLを取得（一貫性のため）
export const getFpvUrlForDrone = (droneId: string): string => {
  const types = Object.keys(MOCK_FPV_URLS)
  // ドローンIDからハッシュを生成して一貫したURLを返す
  const hash = droneId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const index = hash % types.length
  return MOCK_FPV_URLS[types[index]]
}

// 複数ドローンのFPV URLマップを生成
export const generateFpvUrlMap = (droneIds: string[]): Map<string, string> => {
  const map = new Map<string, string>()
  droneIds.forEach((id) => {
    map.set(id, getFpvUrlForDrone(id))
  })
  return map
}

// マップスタイル定義
export interface MapStyleOption {
  id: string
  name: string
  nameJa: string
  url: string
  preview: string
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'positron',
    name: 'Light',
    nameJa: '標準（ライト）',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    preview: 'https://a.basemaps.cartocdn.com/light_all/12/2048/2048.png',
  },
  {
    id: 'dark-matter',
    name: 'Dark',
    nameJa: 'ダーク',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
    preview: 'https://a.basemaps.cartocdn.com/dark_all/12/2048/2048.png',
  },
  {
    id: 'voyager',
    name: 'Voyager',
    nameJa: 'ボイジャー',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
    preview:
      'https://a.basemaps.cartocdn.com/rastertiles/voyager/12/2048/2048.png',
  },
  {
    id: 'satellite',
    name: 'Satellite',
    nameJa: '衛星写真',
    // OpenStreetMap互換の衛星画像タイルを使用
    url: 'https://api.maptiler.com/maps/hybrid/style.json?key=get_your_own_key',
    preview:
      'https://api.maptiler.com/maps/hybrid/256/12/2048/2048.png?key=demo',
  },
]

// デフォルトマップスタイル
export const DEFAULT_MAP_STYLE = MAP_STYLES[0]

// モックドローンデータ生成
export const createMockDrones = (count: number = 4): DroneFlightStatus[] => {
  const now = Date.now()
  const baseLocations = [
    { lat: 35.6812, lng: 139.7671, name: '新十津川(845)' },
    { lat: 35.655, lng: 139.75, name: '浦安(949)' },
    { lat: 35.695, lng: 139.72, name: '秩父#1(945)' },
    { lat: 35.67, lng: 139.78, name: '奄美(940)' },
    { lat: 35.66, lng: 139.73, name: '札幌(850)' },
    { lat: 35.685, lng: 139.76, name: '那覇(955)' },
  ]

  const statuses: DroneFlightStatus['status'][] = [
    'in_flight',
    'in_flight',
    'rth',
    'in_flight',
    'preflight',
    'landing',
  ]
  const flightModes: DroneFlightStatus['flightMode'][] = [
    'auto',
    'manual',
    'auto',
    'hover',
    'auto',
    'auto',
  ]

  return baseLocations.slice(0, count).map((loc, i) => ({
    droneId: `drone-${i + 1}`,
    droneName: loc.name,
    pilotId: `pilot-${i + 1}`,
    pilotName: `パイロット${i + 1}`,
    flightPlanId: `plan-${i + 1}`,
    position: {
      droneId: `drone-${i + 1}`,
      latitude: loc.lat + (Math.random() - 0.5) * 0.01,
      longitude: loc.lng + (Math.random() - 0.5) * 0.01,
      altitude: 50 + Math.random() * 100,
      heading: Math.random() * 360,
      speed: 5 + Math.random() * 15,
      timestamp: new Date(),
    },
    batteryLevel: 20 + Math.random() * 80,
    signalStrength: 50 + Math.random() * 50,
    flightMode: flightModes[i % flightModes.length],
    status: statuses[i % statuses.length],
    startTime: new Date(now - (30 + Math.random() * 60) * 60 * 1000),
    estimatedEndTime: new Date(now + (30 + Math.random() * 60) * 60 * 1000),
    plannedRoute: {
      waypoints: [
        [loc.lng - 0.005, loc.lat - 0.005],
        [loc.lng + 0.005, loc.lat],
        [loc.lng, loc.lat + 0.005],
        [loc.lng - 0.005, loc.lat],
      ],
      corridorWidth: 50,
      color: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'][
        i % 6
      ],
    },
  }))
}

// モック制限区域生成
export const createMockRestrictedZones = (): RestrictedZone[] => [
  {
    id: 'zone-1',
    name: '皇居上空',
    type: 'important_facility',
    level: 'prohibited',
    description: '皇居周辺は飛行禁止区域です',
    coordinates: [
      [
        [139.745, 35.688],
        [139.755, 35.688],
        [139.755, 35.68],
        [139.745, 35.68],
        [139.745, 35.688],
      ],
    ],
    maxAltitude: 150,
    validFrom: new Date(),
    authority: '国土交通省',
  },
  {
    id: 'zone-2',
    name: '東京タワー周辺',
    type: 'custom',
    level: 'restricted',
    description: '許可が必要なエリアです',
    coordinates: [
      [
        [139.74, 35.66],
        [139.75, 35.66],
        [139.75, 35.65],
        [139.74, 35.65],
        [139.74, 35.66],
      ],
    ],
    maxAltitude: 200,
    validFrom: new Date(),
    authority: '東京都',
  },
  {
    id: 'zone-3',
    name: '新宿周辺',
    type: 'did',
    level: 'caution',
    description: '高層ビルが多いため注意が必要です',
    coordinates: [
      [
        [139.69, 35.695],
        [139.71, 35.695],
        [139.71, 35.685],
        [139.69, 35.685],
        [139.69, 35.695],
      ],
    ],
    maxAltitude: 250,
    validFrom: new Date(),
    authority: '新宿区',
  },
]

// モックアラート生成
export const createMockAlerts = (droneIds: string[]): UTMAlert[] => {
  const alertTypes: UTMAlert['type'][] = [
    'low_battery',
    'signal_loss',
    'zone_approach',
    'collision_warning',
  ]
  const severities: UTMAlert['severity'][] = [
    'warning',
    'critical',
    'warning',
    'emergency',
  ]

  return droneIds.slice(0, 2).map((droneId, i) => ({
    id: `alert-${i + 1}`,
    type: alertTypes[i % alertTypes.length],
    severity: severities[i % severities.length],
    droneId,
    droneName: `ドローン${i + 1}`,
    message:
      i === 0 ? 'バッテリー残量が低下しています' : '信号強度が低下しています',
    details:
      i === 0
        ? 'バッテリー残量が25%を下回りました'
        : '信号強度が50%を下回りました',
    timestamp: new Date(),
    acknowledged: false,
  }))
}

// モック気象データ生成
export const createMockWeatherData = (): WeatherData => ({
  timestamp: new Date(),
  location: {
    latitude: 35.6812,
    longitude: 139.7671,
    name: '東京都千代田区',
  },
  current: {
    temperature: 18 + Math.random() * 10,
    humidity: 40 + Math.random() * 30,
    pressure: 1010 + Math.random() * 10,
    windSpeed: 2 + Math.random() * 8,
    windDirection: Math.random() * 360,
    visibility: 8 + Math.random() * 4,
    cloudCover: 10 + Math.random() * 40,
    conditions: ['晴れ', '曇り', '晴れ時々曇り'][Math.floor(Math.random() * 3)],
    icon: '01d',
  },
  flightCondition: {
    status: 'good',
    message: '飛行に適した条件です',
    factors: ['良好な視程', '穏やかな風'],
  },
})

// ドローン位置をアニメーション更新するためのヘルパー
export const updateDronePositions = (
  drones: DroneFlightStatus[]
): DroneFlightStatus[] => {
  return drones.map((drone) => {
    // ウェイポイントに沿って移動をシミュレート
    const speed = drone.position.speed * 0.00001 // 緯度経度の移動量に変換
    const headingRad = (drone.position.heading * Math.PI) / 180

    return {
      ...drone,
      position: {
        ...drone.position,
        latitude: drone.position.latitude + Math.cos(headingRad) * speed,
        longitude: drone.position.longitude + Math.sin(headingRad) * speed,
        heading: drone.position.heading + (Math.random() - 0.5) * 5, // 微小な方向変化
        timestamp: new Date(),
      },
      batteryLevel: Math.max(5, drone.batteryLevel - Math.random() * 0.1), // 微減
    }
  })
}
