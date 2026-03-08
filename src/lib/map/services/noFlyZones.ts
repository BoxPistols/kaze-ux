/**
 * No-Fly Zone Data Service
 * 小型無人機等飛行禁止法の対象施設
 *
 * データソース:
 * - 警察庁「小型無人機等飛行禁止法に基づく対象施設」
 * - 国土交通省「無人航空機の飛行禁止空域」
 * - map-auto-waypointプロジェクト
 *
 * 注意事項:
 * - 座標・半径は参考値であり、正確な禁止区域は公式情報で確認してください
 * - レッドゾーン: 施設上空は完全飛行禁止
 * - イエローゾーン: 周辺300m、事前通報・許可が必要
 */

import { createCirclePolygon, calculateDistance } from '../utils/geo'

import type { NoFlyFacility, FacilityType } from '../types'

// ============================================
// No-Fly Zone Data
// ============================================

let _noFlyFacilities: NoFlyFacility[] = []

/**
 * 施設データを非同期で読み込む
 */
export async function loadNoFlyFacilities(): Promise<NoFlyFacility[]> {
  if (_noFlyFacilities.length > 0) {
    return _noFlyFacilities
  }

  try {
    const response = await fetch('/data/no_fly_facilities.json')
    const data = await response.json()
    _noFlyFacilities = data as NoFlyFacility[]
    return _noFlyFacilities
  } catch (error) {
    console.error('Failed to load no-fly facilities data:', error)
    return []
  }
}

/**
 * キャッシュ済みの施設データを取得（同期）
 */
export function getNoFlyFacilities(): NoFlyFacility[] {
  return _noFlyFacilities
}

// ============================================
// Filter Functions
// ============================================

/**
 * ゾーンタイプでフィルタ
 */
export function getFacilitiesByZone(zone: 'red' | 'yellow'): NoFlyFacility[] {
  return _noFlyFacilities.filter((f) => f.zone === zone)
}

/**
 * 施設タイプでフィルタ
 */
export function getFacilitiesByType(type: FacilityType): NoFlyFacility[] {
  return _noFlyFacilities.filter((f) => f.type === type)
}

/**
 * 原子力発電所を取得
 */
export function getNuclearPlants(): NoFlyFacility[] {
  return _noFlyFacilities.filter((f) => f.type === 'nuclear')
}

/**
 * 外国公館を取得
 */
export function getEmbassies(): NoFlyFacility[] {
  return _noFlyFacilities.filter((f) => f.type === 'foreign_mission')
}

/**
 * 都道府県庁を取得
 */
export function getPrefectures(): NoFlyFacility[] {
  return _noFlyFacilities.filter((f) => f.type === 'prefecture')
}

/**
 * 警察施設を取得
 */
export function getPoliceFacilities(): NoFlyFacility[] {
  return _noFlyFacilities.filter((f) => f.type === 'police')
}

/**
 * 刑務所を取得
 */
export function getPrisons(): NoFlyFacility[] {
  return _noFlyFacilities.filter((f) => f.type === 'prison')
}

/**
 * 自衛隊施設を取得
 */
export function getJSDFFacilities(): NoFlyFacility[] {
  return _noFlyFacilities.filter((f) => f.type === 'military_jsdf')
}

// ============================================
// GeoJSON Generation Functions
// ============================================

/**
 * レッドゾーンのGeoJSONを生成
 */
export function generateRedZoneGeoJSON(): GeoJSON.FeatureCollection {
  const facilities = getFacilitiesByZone('red')
  const features: GeoJSON.Feature[] = facilities.map((facility) => ({
    type: 'Feature',
    properties: {
      id: facility.id,
      name: facility.name,
      nameEn: facility.nameEn,
      type: facility.type,
      radiusKm: facility.radiusKm,
      zone: facility.zone,
      zoneType: 'RED_ZONE',
      operationalStatus: facility.operationalStatus,
      description: facility.description,
    },
    geometry: createCirclePolygon(facility.coordinates, facility.radiusKm),
  }))

  return {
    type: 'FeatureCollection',
    features,
  }
}

const YELLOW_ZONE_BUFFER_KM = 0.3

/**
 * イエローゾーンのGeoJSONを生成
 */
export function generateYellowZoneGeoJSON(): GeoJSON.FeatureCollection {
  // 在外公館のイエローゾーン
  const foreignMissions = getFacilitiesByZone('yellow').map((facility) => ({
    type: 'Feature' as const,
    properties: {
      id: facility.id,
      name: facility.name,
      nameEn: facility.nameEn,
      type: facility.type,
      radiusKm: facility.radiusKm,
      zone: facility.zone,
      zoneType: 'YELLOW_ZONE',
      description: facility.description,
    },
    geometry: createCirclePolygon(facility.coordinates, facility.radiusKm),
  }))

  // レッドゾーン対象施設の周辺300m（イエローゾーン）
  const redZoneFacilities = getFacilitiesByZone('red')
  const peripheryZones = redZoneFacilities.map((facility) => ({
    type: 'Feature' as const,
    properties: {
      id: facility.id + '-perimeter',
      name: facility.name + '周辺',
      nameEn: facility.nameEn ? facility.nameEn + ' (Perimeter)' : 'Perimeter',
      type: facility.type,
      radiusKm: facility.radiusKm + YELLOW_ZONE_BUFFER_KM,
      zone: 'yellow' as const,
      zoneType: 'YELLOW_ZONE',
      isPerimeter: true,
    },
    geometry: createCirclePolygon(
      facility.coordinates,
      facility.radiusKm + YELLOW_ZONE_BUFFER_KM
    ),
  }))

  return {
    type: 'FeatureCollection',
    features: [...foreignMissions, ...peripheryZones],
  }
}

/**
 * 全飛行禁止区域のGeoJSONを生成
 */
export function generateAllNoFlyGeoJSON(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = _noFlyFacilities.map((facility) => ({
    type: 'Feature',
    properties: {
      id: facility.id,
      name: facility.name,
      nameEn: facility.nameEn,
      type: facility.type,
      radiusKm: facility.radiusKm,
      zone: facility.zone,
      zoneType: facility.zone === 'red' ? 'RED_ZONE' : 'YELLOW_ZONE',
    },
    geometry: createCirclePolygon(facility.coordinates, facility.radiusKm),
  }))

  return {
    type: 'FeatureCollection',
    features,
  }
}

/**
 * 施設タイプ別GeoJSONを生成
 */
export function generateCategoryGeoJSON(
  type: FacilityType
): GeoJSON.FeatureCollection {
  const facilities = getFacilitiesByType(type)
  const features: GeoJSON.Feature[] = facilities.map((facility) => ({
    type: 'Feature',
    properties: {
      id: facility.id,
      name: facility.name,
      nameEn: facility.nameEn,
      type: facility.type,
      radiusKm: facility.radiusKm,
      zone: facility.zone,
      zoneType: facility.zone === 'red' ? 'RED_ZONE' : 'YELLOW_ZONE',
      operationalStatus: facility.operationalStatus,
      description: facility.description,
    },
    geometry: createCirclePolygon(facility.coordinates, facility.radiusKm),
  }))

  return {
    type: 'FeatureCollection',
    features,
  }
}

// ============================================
// Zone Check Functions
// ============================================

/**
 * 指定座標が飛行禁止区域内かチェック
 */
export function isInNoFlyZone(
  lat: number,
  lng: number
): { inZone: boolean; zone?: 'red' | 'yellow'; facility?: NoFlyFacility } {
  for (const facility of _noFlyFacilities) {
    const distance = calculateDistance(
      lat,
      lng,
      facility.coordinates[1],
      facility.coordinates[0]
    )
    if (distance <= facility.radiusKm) {
      return { inZone: true, zone: facility.zone, facility }
    }
    // 300m周辺バッファもチェック
    if (
      facility.zone === 'red' &&
      distance <= facility.radiusKm + YELLOW_ZONE_BUFFER_KM
    ) {
      return { inZone: true, zone: 'yellow', facility }
    }
  }
  return { inZone: false }
}

/**
 * 指定座標から近い飛行禁止区域を取得
 */
export function getNearbyNoFlyZones(
  lat: number,
  lng: number,
  maxDistanceKm: number = 10
): Array<{ facility: NoFlyFacility; distance: number }> {
  const nearby: Array<{ facility: NoFlyFacility; distance: number }> = []

  for (const facility of _noFlyFacilities) {
    const distance = calculateDistance(
      lat,
      lng,
      facility.coordinates[1],
      facility.coordinates[0]
    )
    if (distance <= maxDistanceKm) {
      nearby.push({ facility, distance })
    }
  }

  return nearby.sort((a, b) => a.distance - b.distance)
}

// ============================================
// Service Export
// ============================================

export const NoFlyZoneService = {
  loadFacilities: loadNoFlyFacilities,
  getFacilities: getNoFlyFacilities,
  getFacilitiesByZone,
  getFacilitiesByType,
  getNuclearPlants,
  getEmbassies,
  getPrefectures,
  getPoliceFacilities,
  getPrisons,
  getJSDFFacilities,
  generateRedZoneGeoJSON,
  generateYellowZoneGeoJSON,
  generateAllNoFlyGeoJSON,
  generateCategoryGeoJSON,
  isInNoFlyZone,
  getNearbyNoFlyZones,
}
