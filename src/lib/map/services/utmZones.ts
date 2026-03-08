/**
 * UTM Zone Services
 * UTM関連区域データサービス
 *
 * - 緊急用務空域
 * - リモートID特定区域
 * - 有人機発着エリア
 * - 電波干渉区域（LTE/5G）
 */

// ============================================
// Local Types for Zone Data
// ============================================

/** 基本的な円形ゾーン */
interface BaseCircleZone {
  name: string
  lat: number
  lng: number
  radius: number // meters
}

/** 緊急用務空域データ */
export interface EmergencyAirspaceData extends BaseCircleZone {
  type: 'emergency'
  active: boolean
}

/** リモートID特定区域データ */
export interface RemoteIdZoneData extends BaseCircleZone {
  type: 'remote_id'
  required?: boolean
}

/** 有人機発着エリアデータ */
export interface MannedAircraftZoneData extends BaseCircleZone {
  type: 'manned' | 'manned_aircraft' | 'agricultural' | 'glider'
  operatingHours?: string
}

/** 電波干渉区域データ */
export interface RadioInterferenceZoneData extends BaseCircleZone {
  type: 'radio' | '5g'
  frequency?: string
}

/**
 * 緊急用務空域（災害時などの一時的な飛行制限エリア）
 * 参照: https://www.mlit.go.jp/koku/koku_tk10_000003.html
 */
export const EMERGENCY_AIRSPACE: EmergencyAirspaceData[] = [
  {
    name: '富士山周辺訓練空域',
    lat: 35.3606,
    lng: 138.7274,
    radius: 10000,
    type: 'emergency',
    active: false,
  },
  {
    name: '御嶽山周辺',
    lat: 35.893,
    lng: 137.4803,
    radius: 5000,
    type: 'emergency',
    active: false,
  },
  {
    name: '阿蘇山周辺',
    lat: 32.8842,
    lng: 131.104,
    radius: 5000,
    type: 'emergency',
    active: false,
  },
  {
    name: '桜島周辺',
    lat: 31.5855,
    lng: 130.6565,
    radius: 5000,
    type: 'emergency',
    active: false,
  },
  {
    name: '雲仙岳周辺',
    lat: 32.7573,
    lng: 130.2986,
    radius: 5000,
    type: 'emergency',
    active: false,
  },
]

/**
 * リモートID特定区域（リモートID発信が必要な区域）
 * 参照: https://www.mlit.go.jp/koku/koku_ua_remoteid.html
 */
export const REMOTE_ID_ZONES: RemoteIdZoneData[] = [
  {
    name: '東京都心部',
    lat: 35.6762,
    lng: 139.6503,
    radius: 15000,
    type: 'remote_id',
  },
  {
    name: '大阪市中心部',
    lat: 34.6937,
    lng: 135.5023,
    radius: 12000,
    type: 'remote_id',
  },
  {
    name: '名古屋市中心部',
    lat: 35.1815,
    lng: 136.9066,
    radius: 10000,
    type: 'remote_id',
  },
  {
    name: '福岡市中心部',
    lat: 33.5904,
    lng: 130.4017,
    radius: 8000,
    type: 'remote_id',
  },
  {
    name: '札幌市中心部',
    lat: 43.0618,
    lng: 141.3545,
    radius: 8000,
    type: 'remote_id',
  },
  {
    name: '横浜市中心部',
    lat: 35.4437,
    lng: 139.638,
    radius: 10000,
    type: 'remote_id',
  },
  {
    name: '神戸市中心部',
    lat: 34.6901,
    lng: 135.1956,
    radius: 8000,
    type: 'remote_id',
  },
  {
    name: '京都市中心部',
    lat: 35.0116,
    lng: 135.7681,
    radius: 8000,
    type: 'remote_id',
  },
  {
    name: '広島市中心部',
    lat: 34.3853,
    lng: 132.4553,
    radius: 7000,
    type: 'remote_id',
  },
  {
    name: '仙台市中心部',
    lat: 38.2682,
    lng: 140.8694,
    radius: 7000,
    type: 'remote_id',
  },
]

/**
 * 有人機発着エリア（ヘリポート以外の離着陸施設）
 */
export const MANNED_AIRCRAFT_ZONES: MannedAircraftZoneData[] = [
  // 場外離着陸場（農業用等）
  {
    name: '筑波農業航空施設',
    lat: 36.0833,
    lng: 140.0833,
    radius: 1000,
    type: 'manned_aircraft',
  },
  {
    name: '新潟農業航空基地',
    lat: 37.9167,
    lng: 139.05,
    radius: 1000,
    type: 'manned_aircraft',
  },
  {
    name: '北海道農業航空施設（十勝）',
    lat: 43.0,
    lng: 143.15,
    radius: 1500,
    type: 'manned_aircraft',
  },
  {
    name: '佐賀農業航空施設',
    lat: 33.2667,
    lng: 130.3,
    radius: 1000,
    type: 'manned_aircraft',
  },
  // グライダー離着陸場
  {
    name: '関宿滑空場',
    lat: 36.0,
    lng: 139.8333,
    radius: 2000,
    type: 'manned_aircraft',
  },
  {
    name: '妻沼滑空場',
    lat: 36.2167,
    lng: 139.3833,
    radius: 2000,
    type: 'manned_aircraft',
  },
  {
    name: '板倉滑空場',
    lat: 36.2333,
    lng: 139.6167,
    radius: 2000,
    type: 'manned_aircraft',
  },
  {
    name: '大野滑空場',
    lat: 35.9833,
    lng: 136.5,
    radius: 2000,
    type: 'manned_aircraft',
  },
  // 水上飛行機基地
  {
    name: '琵琶湖水上機基地',
    lat: 35.2833,
    lng: 136.0833,
    radius: 1500,
    type: 'manned_aircraft',
  },
  {
    name: '芦ノ湖水上機離着水場',
    lat: 35.2,
    lng: 139.0333,
    radius: 1000,
    type: 'manned_aircraft',
  },
]

/**
 * LTE電波干渉区域（携帯電話基地局周辺の注意区域）
 */
export const RADIO_INTERFERENCE_ZONES: RadioInterferenceZoneData[] = [
  {
    name: '東京スカイツリー',
    lat: 35.7101,
    lng: 139.8107,
    radius: 2000,
    type: 'radio',
    frequency: 'LTE/5G',
  },
  {
    name: '東京タワー',
    lat: 35.6586,
    lng: 139.7454,
    radius: 1500,
    type: 'radio',
    frequency: 'LTE/FM',
  },
  {
    name: 'NHK菖蒲久喜ラジオ放送所',
    lat: 36.0667,
    lng: 139.5833,
    radius: 3000,
    type: 'radio',
    frequency: 'AM',
  },
  {
    name: '名古屋テレビ塔',
    lat: 35.1803,
    lng: 136.9088,
    radius: 1000,
    type: 'radio',
    frequency: 'LTE',
  },
  {
    name: '通天閣',
    lat: 34.6525,
    lng: 135.5063,
    radius: 800,
    type: 'radio',
    frequency: 'LTE',
  },
  {
    name: '福岡タワー',
    lat: 33.593,
    lng: 130.3515,
    radius: 1000,
    type: 'radio',
    frequency: 'LTE',
  },
  {
    name: '札幌テレビ塔',
    lat: 43.061,
    lng: 141.3566,
    radius: 800,
    type: 'radio',
    frequency: 'LTE',
  },
  {
    name: '京都タワー',
    lat: 34.9875,
    lng: 135.7592,
    radius: 600,
    type: 'radio',
    frequency: 'LTE',
  },
  {
    name: '横浜ランドマークタワー',
    lat: 35.455,
    lng: 139.6325,
    radius: 1000,
    type: 'radio',
    frequency: 'LTE',
  },
  {
    name: 'あべのハルカス',
    lat: 34.6463,
    lng: 135.5133,
    radius: 1000,
    type: 'radio',
    frequency: 'LTE/5G',
  },
]

// ============================================
// GeoJSON変換関数
// ============================================

/** 円形のGeoJSON Polygon生成用の汎用ゾーン型 */
type CircleZoneInput = BaseCircleZone & {
  type: string
  frequency?: string
  active?: boolean
  required?: boolean
  operatingHours?: string
}

/**
 * 円形のGeoJSON Polygonを生成（共通関数）
 */
function createCircleFeature(
  zone: CircleZoneInput,
  points: number = 32
): GeoJSON.Feature {
  const coords: [number, number][] = []
  const { lat, lng, radius } = zone

  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * 2 * Math.PI
    const dx = radius * Math.cos(angle)
    const dy = radius * Math.sin(angle)

    // メートルから度への変換（近似）
    const latOffset = dy / 111320
    const lngOffset = dx / (111320 * Math.cos((lat * Math.PI) / 180))

    coords.push([lng + lngOffset, lat + latOffset])
  }

  return {
    type: 'Feature',
    properties: {
      name: zone.name,
      type: zone.type,
      radius: zone.radius,
      ...(zone.frequency && { frequency: zone.frequency }),
      ...(zone.active !== undefined && { active: zone.active }),
      ...(zone.required !== undefined && { required: zone.required }),
      ...(zone.operatingHours && { operatingHours: zone.operatingHours }),
    },
    geometry: {
      type: 'Polygon',
      coordinates: [coords],
    },
  }
}

/**
 * 緊急用務空域をGeoJSONに変換
 */
export function getEmergencyAirspaceGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: EMERGENCY_AIRSPACE.map((zone) => createCircleFeature(zone, 32)),
  }
}

/**
 * リモートID特定区域をGeoJSONに変換
 */
export function getRemoteIdZonesGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: REMOTE_ID_ZONES.map((zone) => createCircleFeature(zone, 48)),
  }
}

/**
 * 有人機発着エリアをGeoJSONに変換
 */
export function getMannedAircraftZonesGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: MANNED_AIRCRAFT_ZONES.map((zone) =>
      createCircleFeature(zone, 32)
    ),
  }
}

/**
 * 電波干渉区域をGeoJSONに変換
 */
export function getRadioInterferenceZonesGeoJSON(): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: RADIO_INTERFERENCE_ZONES.map((zone) =>
      createCircleFeature(zone, 32)
    ),
  }
}

// ============================================
// フィルタリング関数
// ============================================

/**
 * アクティブな緊急用務空域のみ取得
 */
export function getActiveEmergencyAirspace(): EmergencyAirspaceData[] {
  return EMERGENCY_AIRSPACE.filter((zone) => zone.active)
}

/**
 * 農業関連の有人機発着エリアを取得
 */
export function getAgriculturalZones(): MannedAircraftZoneData[] {
  return MANNED_AIRCRAFT_ZONES.filter((zone) => zone.name.includes('農業'))
}

/**
 * グライダー離着陸場を取得
 */
export function getGliderFields(): MannedAircraftZoneData[] {
  return MANNED_AIRCRAFT_ZONES.filter((zone) => zone.name.includes('滑空'))
}

/**
 * 5G対応エリアを取得
 */
export function get5GZones(): RadioInterferenceZoneData[] {
  return RADIO_INTERFERENCE_ZONES.filter((zone) =>
    zone.frequency?.includes('5G')
  )
}

// ============================================
// Service Export
// ============================================

export const UTMZoneService = {
  // データ
  EMERGENCY_AIRSPACE,
  REMOTE_ID_ZONES,
  MANNED_AIRCRAFT_ZONES,
  RADIO_INTERFERENCE_ZONES,
  // GeoJSON生成
  getEmergencyAirspaceGeoJSON,
  getRemoteIdZonesGeoJSON,
  getMannedAircraftZonesGeoJSON,
  getRadioInterferenceZonesGeoJSON,
  // フィルタ
  getActiveEmergencyAirspace,
  getAgriculturalZones,
  getGliderFields,
  get5GZones,
}
