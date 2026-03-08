/**
 * Heliport Data Service
 * ヘリポートデータサービス
 *
 * データソース:
 * - 国土交通省 航空局
 * - 各自治体公表データ
 */

import { createCirclePolygon } from '../utils/geo'

import type { Heliport } from '../types'

/**
 * ヘリポートデータ
 */
export const HELIPORTS: Heliport[] = [
  // 主要ヘリポート
  {
    name: '東京ヘリポート',
    lat: 35.6403,
    lng: 139.8372,
    radius: 500,
    type: 'heliport',
  },
  {
    name: '八尾ヘリポート',
    lat: 34.5967,
    lng: 135.6019,
    radius: 500,
    type: 'heliport',
  },
  {
    name: '舞洲ヘリポート',
    lat: 34.6592,
    lng: 135.3931,
    radius: 500,
    type: 'heliport',
  },
  {
    name: '横浜ヘリポート',
    lat: 35.4667,
    lng: 139.6333,
    radius: 500,
    type: 'heliport',
  },
  {
    name: '名古屋ヘリポート',
    lat: 35.1833,
    lng: 136.9,
    radius: 500,
    type: 'heliport',
  },
  {
    name: '福岡ヘリポート',
    lat: 33.5833,
    lng: 130.45,
    radius: 500,
    type: 'heliport',
  },
  // ビル屋上ヘリポート
  {
    name: '虎ノ門ヒルズヘリポート',
    lat: 35.6667,
    lng: 139.75,
    radius: 200,
    type: 'heliport',
  },
  {
    name: '六本木ヒルズヘリポート',
    lat: 35.6603,
    lng: 139.7292,
    radius: 200,
    type: 'heliport',
  },
  {
    name: '晴海ヘリポート',
    lat: 35.6506,
    lng: 139.7881,
    radius: 300,
    type: 'heliport',
  },
  // 病院ヘリポート（ドクターヘリ）
  {
    name: '聖路加国際病院ヘリポート',
    lat: 35.6714,
    lng: 139.7731,
    radius: 200,
    type: 'hospital_heliport',
  },
  {
    name: '日本医科大学付属病院ヘリポート',
    lat: 35.7028,
    lng: 139.7683,
    radius: 200,
    type: 'hospital_heliport',
  },
  {
    name: '東京大学医学部附属病院ヘリポート',
    lat: 35.7131,
    lng: 139.7639,
    radius: 200,
    type: 'hospital_heliport',
  },
]

/**
 * 全ヘリポートのGeoJSONを生成
 */
export function getHeliportsGeoJSON(): GeoJSON.FeatureCollection {
  const features: GeoJSON.Feature[] = HELIPORTS.map((heliport) => ({
    type: 'Feature',
    properties: {
      name: heliport.name,
      type: heliport.type,
      radius: heliport.radius,
      zoneType: 'HELIPORT',
    },
    geometry: createCirclePolygon(
      [heliport.lng, heliport.lat],
      heliport.radius / 1000
    ),
  }))

  return {
    type: 'FeatureCollection',
    features,
  }
}

/**
 * ヘリポートマーカー（ポイント）のGeoJSONを生成
 */
export function getHeliportMarkersGeoJSON(): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: Array<GeoJSON.Feature<GeoJSON.Point>> = HELIPORTS.map(
    (heliport) => ({
      type: 'Feature',
      properties: {
        name: heliport.name,
        type: heliport.type,
        radius: heliport.radius,
      },
      geometry: {
        type: 'Point',
        coordinates: [heliport.lng, heliport.lat],
      },
    })
  )

  return {
    type: 'FeatureCollection',
    features,
  }
}

/**
 * タイプ別にヘリポートを取得
 */
export function getHeliportsByType(type: Heliport['type']): Heliport[] {
  return HELIPORTS.filter((h) => h.type === type)
}

/**
 * 病院ヘリポートのみ取得
 */
export function getHospitalHeliports(): Heliport[] {
  return HELIPORTS.filter((h) => h.type === 'hospital_heliport')
}

/**
 * 通常ヘリポートのみ取得
 */
export function getRegularHeliports(): Heliport[] {
  return HELIPORTS.filter((h) => h.type === 'heliport')
}

// ============================================
// Service Export
// ============================================

export const HeliportService = {
  HELIPORTS,
  getHeliportsGeoJSON,
  getHeliportMarkersGeoJSON,
  getHeliportsByType,
  getHospitalHeliports,
  getRegularHeliports,
}
