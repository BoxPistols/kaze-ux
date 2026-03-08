/**
 * レイヤー管理フック
 */

import { useCallback, useRef, useState, useEffect } from 'react'

import {
  LAYER_GROUPS,
  RESTRICTION_COLORS,
  getAllRestrictionZones,
  fetchGeoJSONWithCache,
} from '@/lib/map'

import type { LayerState } from '../types'
import type maplibregl from 'maplibre-gl'

// ゾーンID定数（将来の全国DID一括表示機能用）
const _ZONE_IDS = {
  DID_ALL_JAPAN: 'ZONE_IDS.DID_ALL_JAPAN',
  AIRPORT: 'airport',
  NO_FLY_RED: 'ZONE_IDS.NO_FLY_RED',
  NO_FLY_YELLOW: 'ZONE_IDS.NO_FLY_YELLOW',
} as const
void _ZONE_IDS

interface UseLayerManagementOptions {
  map: maplibregl.Map | null
  isLoaded: boolean
  initialOpacity?: number
}

interface UseLayerManagementReturn {
  layerStates: Map<string, LayerState>
  restrictionStates: Map<string, boolean>
  opacity: number
  toggleLayer: (layerId: string) => void
  toggleRestriction: (zoneId: string) => void
  setOpacity: (value: number) => void
  loadLayer: (layerId: string) => Promise<void>
}

export function useLayerManagement({
  map,
  isLoaded,
  initialOpacity = 0.5,
}: UseLayerManagementOptions): UseLayerManagementReturn {
  const [layerStates, setLayerStates] = useState<Map<string, LayerState>>(
    new Map()
  )
  const [restrictionStates, setRestrictionStates] = useState<
    Map<string, boolean>
  >(new Map())
  const [opacity, setOpacity] = useState(initialOpacity)
  const loadedLayersRef = useRef<Set<string>>(new Set())

  // レイヤーをロード
  const loadLayer = useCallback(
    async (layerId: string) => {
      if (!map || !isLoaded) return
      if (loadedLayersRef.current.has(layerId)) return

      // レイヤー設定を検索
      const layer = LAYER_GROUPS.flatMap((group) => group.layers).find(
        (l) => l.id === layerId
      )

      if (!layer) return

      // ローディング状態を更新
      setLayerStates((prev) => {
        const next = new Map(prev)
        next.set(layerId, { visible: false, loading: true, loaded: false })
        return next
      })

      try {
        const geojson = await fetchGeoJSONWithCache(layer.path)

        // ソースが存在しない場合は追加
        if (!map.getSource(layerId)) {
          map.addSource(layerId, {
            type: 'geojson',
            data: geojson,
          })
        }

        // fillレイヤーを追加
        if (!map.getLayer(`${layerId}-fill`)) {
          map.addLayer({
            id: `${layerId}-fill`,
            type: 'fill',
            source: layerId,
            paint: {
              'fill-color': layer.color,
              'fill-opacity': opacity,
            },
          })
        }

        // アウトラインレイヤーを追加
        if (!map.getLayer(`${layerId}-outline`)) {
          map.addLayer({
            id: `${layerId}-outline`,
            type: 'line',
            source: layerId,
            paint: {
              'line-color': layer.color,
              'line-width': 1,
            },
          })
        }

        loadedLayersRef.current.add(layerId)

        setLayerStates((prev) => {
          const next = new Map(prev)
          next.set(layerId, { visible: true, loading: false, loaded: true })
          return next
        })
      } catch (error) {
        console.error(`Failed to load layer ${layerId}:`, error)
        setLayerStates((prev) => {
          const next = new Map(prev)
          next.set(layerId, { visible: false, loading: false, loaded: false })
          return next
        })
      }
    },
    [map, isLoaded, opacity]
  )

  // レイヤーの表示/非表示を切り替え
  const toggleLayer = useCallback(
    (layerId: string) => {
      if (!map) return

      const state = layerStates.get(layerId)

      if (!state?.loaded) {
        // まだロードされていない場合はロード
        loadLayer(layerId)
        return
      }

      const newVisible = !state.visible
      const visibility = newVisible ? 'visible' : 'none'

      // fillレイヤーの可視性を更新
      if (map.getLayer(`${layerId}-fill`)) {
        map.setLayoutProperty(`${layerId}-fill`, 'visibility', visibility)
      }
      // アウトラインレイヤーの可視性を更新
      if (map.getLayer(`${layerId}-outline`)) {
        map.setLayoutProperty(`${layerId}-outline`, 'visibility', visibility)
      }

      setLayerStates((prev) => {
        const next = new Map(prev)
        next.set(layerId, { ...state, visible: newVisible })
        return next
      })
    },
    [map, layerStates, loadLayer]
  )

  // 禁止区域の表示/非表示を切り替え
  const toggleRestriction = useCallback(
    async (zoneId: string) => {
      if (!map || !isLoaded) return

      const currentState = restrictionStates.get(zoneId) ?? false
      const newState = !currentState

      // ゾーン設定を取得
      const zones = getAllRestrictionZones()
      const zone = zones.find((z) => z.id === zoneId)

      if (!zone) return

      if (newState && !loadedLayersRef.current.has(zoneId)) {
        // ゾーンをロード
        try {
          if (!zone.path) return
          const geojson = await fetchGeoJSONWithCache(zone.path)

          if (!map.getSource(zoneId)) {
            map.addSource(zoneId, {
              type: 'geojson',
              data: geojson,
            })
          }

          const color =
            RESTRICTION_COLORS[zone.type as keyof typeof RESTRICTION_COLORS] ??
            '#ff0000'

          if (!map.getLayer(`${zoneId}-fill`)) {
            map.addLayer({
              id: `${zoneId}-fill`,
              type: 'fill',
              source: zoneId,
              paint: {
                'fill-color': color,
                'fill-opacity': 0.4,
              },
            })
          }

          if (!map.getLayer(`${zoneId}-outline`)) {
            map.addLayer({
              id: `${zoneId}-outline`,
              type: 'line',
              source: zoneId,
              paint: {
                'line-color': color,
                'line-width': 2,
              },
            })
          }

          loadedLayersRef.current.add(zoneId)
        } catch (error) {
          console.error(`Failed to load restriction zone ${zoneId}:`, error)
          return
        }
      }

      // 可視性を更新
      const visibility = newState ? 'visible' : 'none'
      if (map.getLayer(`${zoneId}-fill`)) {
        map.setLayoutProperty(`${zoneId}-fill`, 'visibility', visibility)
      }
      if (map.getLayer(`${zoneId}-outline`)) {
        map.setLayoutProperty(`${zoneId}-outline`, 'visibility', visibility)
      }

      setRestrictionStates((prev) => {
        const next = new Map(prev)
        next.set(zoneId, newState)
        return next
      })
    },
    [map, isLoaded, restrictionStates]
  )

  // 透明度を変更
  const handleOpacityChange = useCallback(
    (value: number) => {
      setOpacity(value)

      if (!map) return

      // 全てのロード済みレイヤーの透明度を更新
      loadedLayersRef.current.forEach((layerId) => {
        if (map.getLayer(`${layerId}-fill`)) {
          map.setPaintProperty(`${layerId}-fill`, 'fill-opacity', value)
        }
      })
    },
    [map]
  )

  // マップロード時に初期化
  useEffect(() => {
    if (!isLoaded) {
      loadedLayersRef.current.clear()
      setLayerStates(new Map())
      setRestrictionStates(new Map())
    }
  }, [isLoaded])

  return {
    layerStates,
    restrictionStates,
    opacity,
    toggleLayer,
    toggleRestriction,
    setOpacity: handleOpacityChange,
    loadLayer,
  }
}
