/**
 * Restriction Layers Hook
 * 制限区域レイヤー管理フック
 *
 * 飛行禁止区域、空港制限区域、DIDなどのレイヤー表示を管理
 */

import { useState, useCallback, useMemo, useEffect } from 'react'

import {
  AirportService,
  NoFlyZoneService,
  HeliportService,
  UTMZoneService,
  DIDService,
} from '../services'

// ============================================
// 型定義
// ============================================

/** レイヤータイプ */
export type LayerType =
  | 'noFlyZones' // 飛行禁止区域（レッド/イエロー）
  | 'airports' // 空港制限区域
  | 'did' // 人口集中地区
  | 'emergency' // 緊急用務空域
  | 'remoteId' // リモートID特定区域
  | 'mannedAircraft' // 有人機発着エリア
  | 'heliports' // ヘリポート
  | 'radioInterference' // 電波干渉区域

/** レイヤー表示設定 */
export interface LayerVisibility {
  noFlyZones: boolean
  airports: boolean
  did: boolean
  emergency: boolean
  remoteId: boolean
  mannedAircraft: boolean
  heliports: boolean
  radioInterference: boolean
}

/** GeoJSONデータ型 */
export interface GeoJsonData {
  noFlyZonesRed: GeoJSON.FeatureCollection | null
  noFlyZonesYellow: GeoJSON.FeatureCollection | null
  airports: GeoJSON.FeatureCollection | null
  airportMarkers: GeoJSON.FeatureCollection | null
  emergency: GeoJSON.FeatureCollection | null
  remoteId: GeoJSON.FeatureCollection | null
  mannedAircraft: GeoJSON.FeatureCollection | null
  heliports: GeoJSON.FeatureCollection | null
  heliportMarkers: GeoJSON.FeatureCollection | null
  radioInterference: GeoJSON.FeatureCollection | null
}

/** レイヤー色設定（UTM要件準拠） */
export const LAYER_COLORS = {
  noFlyZones: {
    red: '#FF0000', // 飛行禁止（レッド）
    yellow: '#FFFF00', // 要許可（イエロー）
    redOpacity: 0.4,
    yellowOpacity: 0.3,
  },
  airports: {
    fill: '#9C27B0', // 紫
    stroke: '#7B1FA2',
    opacity: 0.25,
  },
  did: {
    fill: '#FFB6C1', // ピンク
    stroke: '#FF69B4',
    opacity: 0.3,
  },
  emergency: {
    fill: '#FFA500', // オレンジ
    stroke: '#FF8C00',
    opacity: 0.35,
  },
  remoteId: {
    fill: '#DDA0DD', // 薄紫
    stroke: '#BA55D3',
    opacity: 0.25,
  },
  mannedAircraft: {
    fill: '#87CEEB', // 水色
    stroke: '#4682B4',
    opacity: 0.3,
  },
  heliports: {
    fill: '#3B82F6', // 青
    stroke: '#1D4ED8',
    opacity: 0.4,
  },
  radioInterference: {
    fill: '#FFC107', // 黄色（電波）
    stroke: '#FFA000',
    opacity: 0.2,
  },
} as const

/** レイヤー情報（凡例用） */
export const LAYER_INFO: Record<
  LayerType,
  { label: string; labelEn: string; shortcut: string; description: string }
> = {
  noFlyZones: {
    label: '飛行禁止区域',
    labelEn: 'No-Fly Zones',
    shortcut: 'R',
    description: '小型無人機等飛行禁止法対象施設',
  },
  airports: {
    label: '空港制限区域',
    labelEn: 'Airport Zones',
    shortcut: 'A',
    description: '空港周辺の飛行制限区域',
  },
  did: {
    label: 'DID（人口集中地区）',
    labelEn: 'Densely Inhabited District',
    shortcut: 'D',
    description: '人口集中地区（国勢調査2020年）',
  },
  emergency: {
    label: '緊急用務空域',
    labelEn: 'Emergency Airspace',
    shortcut: 'E',
    description: '災害時などの一時的な飛行制限エリア',
  },
  remoteId: {
    label: 'リモートID区域',
    labelEn: 'Remote ID Zones',
    shortcut: 'I',
    description: 'リモートID発信が必要な区域',
  },
  mannedAircraft: {
    label: '有人機発着',
    labelEn: 'Manned Aircraft',
    shortcut: 'M',
    description: '有人機の離着陸施設周辺',
  },
  heliports: {
    label: 'ヘリポート',
    labelEn: 'Heliports',
    shortcut: 'H',
    description: 'ヘリポートおよび病院ヘリポート',
  },
  radioInterference: {
    label: '電波干渉区域',
    labelEn: 'Radio Interference',
    shortcut: 'F',
    description: 'LTE/5G基地局周辺の注意区域',
  },
}

/** デフォルトの表示設定 */
const DEFAULT_VISIBILITY: LayerVisibility = {
  noFlyZones: true,
  airports: true,
  did: true, // DIDはデフォルトで表示
  emergency: false,
  remoteId: false,
  mannedAircraft: false,
  heliports: false,
  radioInterference: false,
}

// ============================================
// フック実装
// ============================================

interface UseRestrictionLayersOptions {
  /** 初期表示設定 */
  initialVisibility?: Partial<LayerVisibility>
  /** DID自動読み込み */
  autoLoadDID?: boolean
  /** 飛行禁止区域自動読み込み */
  autoLoadNoFlyZones?: boolean
}

interface UseRestrictionLayersReturn {
  /** レイヤー表示状態 */
  visibility: LayerVisibility
  /** レイヤー表示を切り替え */
  toggleLayer: (layer: LayerType) => void
  /** レイヤー表示を設定 */
  setLayerVisibility: (layer: LayerType, visible: boolean) => void
  /** 全レイヤー表示/非表示 */
  toggleAllLayers: () => void
  /** 表示状態を一括設定 */
  setVisibility: (visibility: Partial<LayerVisibility>) => void
  /** 表示中のレイヤー数 */
  visibleLayersCount: number
  /** GeoJSONデータ */
  geoJsonData: {
    noFlyZonesRed: GeoJSON.FeatureCollection | null
    noFlyZonesYellow: GeoJSON.FeatureCollection | null
    airports: GeoJSON.FeatureCollection | null
    airportMarkers: GeoJSON.FeatureCollection | null
    emergency: GeoJSON.FeatureCollection | null
    remoteId: GeoJSON.FeatureCollection | null
    mannedAircraft: GeoJSON.FeatureCollection | null
    heliports: GeoJSON.FeatureCollection | null
    heliportMarkers: GeoJSON.FeatureCollection | null
    radioInterference: GeoJSON.FeatureCollection | null
  }
  /** データ読み込み状態 */
  isLoading: boolean
  /** エラー */
  error: Error | null
  /** 手動でデータを再読み込み */
  reloadData: () => Promise<void>
}

export function useRestrictionLayers(
  options: UseRestrictionLayersOptions = {}
): UseRestrictionLayersReturn {
  const { initialVisibility = {}, autoLoadNoFlyZones = true } = options

  // 表示状態
  const [visibility, setVisibilityState] = useState<LayerVisibility>({
    ...DEFAULT_VISIBILITY,
    ...initialVisibility,
  })

  // 読み込み状態
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)

  // レイヤー表示切り替え
  const toggleLayer = useCallback((layer: LayerType) => {
    setVisibilityState((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }))
  }, [])

  // レイヤー表示設定
  const setLayerVisibility = useCallback(
    (layer: LayerType, visible: boolean) => {
      setVisibilityState((prev) => ({
        ...prev,
        [layer]: visible,
      }))
    },
    []
  )

  // 全レイヤー表示/非表示
  const toggleAllLayers = useCallback(() => {
    setVisibilityState((prev) => {
      const allVisible = Object.values(prev).every((v) => v)
      const newValue = !allVisible
      return {
        noFlyZones: newValue,
        airports: newValue,
        did: newValue,
        emergency: newValue,
        remoteId: newValue,
        mannedAircraft: newValue,
        heliports: newValue,
        radioInterference: newValue,
      }
    })
  }, [])

  // 一括設定
  const setVisibility = useCallback(
    (newVisibility: Partial<LayerVisibility>) => {
      setVisibilityState((prev) => ({
        ...prev,
        ...newVisibility,
      }))
    },
    []
  )

  // 表示中のレイヤー数
  const visibleLayersCount = useMemo(
    () => Object.values(visibility).filter(Boolean).length,
    [visibility]
  )

  // データ読み込み
  const loadData = useCallback(async () => {
    if (dataLoaded) return

    setIsLoading(true)
    setError(null)

    try {
      // 飛行禁止区域データを読み込み
      if (autoLoadNoFlyZones) {
        await NoFlyZoneService.loadFacilities()
      }
      setDataLoaded(true)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('データ読み込みエラー'))
    } finally {
      setIsLoading(false)
    }
  }, [autoLoadNoFlyZones, dataLoaded])

  // 自動読み込み
  useEffect(() => {
    loadData()
  }, [loadData])

  // GeoJSONデータ生成（メモ化）
  const geoJsonData = useMemo(() => {
    return {
      // 飛行禁止区域（レッド/イエロー分離）
      noFlyZonesRed:
        visibility.noFlyZones && dataLoaded
          ? NoFlyZoneService.generateRedZoneGeoJSON()
          : null,
      noFlyZonesYellow:
        visibility.noFlyZones && dataLoaded
          ? NoFlyZoneService.generateYellowZoneGeoJSON()
          : null,

      // 空港制限区域
      airports: visibility.airports ? AirportService.generateGeoJSON() : null,
      airportMarkers: visibility.airports
        ? AirportService.generateMarkers()
        : null,

      // 緊急用務空域
      emergency: visibility.emergency
        ? UTMZoneService.getEmergencyAirspaceGeoJSON()
        : null,

      // リモートID区域
      remoteId: visibility.remoteId
        ? UTMZoneService.getRemoteIdZonesGeoJSON()
        : null,

      // 有人機発着エリア
      mannedAircraft: visibility.mannedAircraft
        ? UTMZoneService.getMannedAircraftZonesGeoJSON()
        : null,

      // ヘリポート
      heliports: visibility.heliports
        ? HeliportService.getHeliportsGeoJSON()
        : null,
      heliportMarkers: visibility.heliports
        ? HeliportService.getHeliportMarkersGeoJSON()
        : null,

      // 電波干渉区域
      radioInterference: visibility.radioInterference
        ? UTMZoneService.getRadioInterferenceZonesGeoJSON()
        : null,
    }
  }, [visibility, dataLoaded])

  // 手動再読み込み
  const reloadData = useCallback(async () => {
    setDataLoaded(false)
    await loadData()
  }, [loadData])

  return {
    visibility,
    toggleLayer,
    setLayerVisibility,
    toggleAllLayers,
    setVisibility,
    visibleLayersCount,
    geoJsonData,
    isLoading,
    error,
    reloadData,
  }
}

// ============================================
// ユーティリティ
// ============================================

/**
 * ショートカットキーからレイヤータイプを取得
 */
export function getLayerFromShortcut(key: string): LayerType | null {
  const upperKey = key.toUpperCase()
  for (const [layerType, info] of Object.entries(LAYER_INFO)) {
    if (info.shortcut === upperKey) {
      return layerType as LayerType
    }
  }
  return null
}

/**
 * DIDサービスをエクスポート（利便性のため）
 */
export { DIDService }
