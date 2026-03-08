/**
 * Map初期化・設定フック
 */

import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState, useCallback } from 'react'

import { BASE_MAPS, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/map'

import type { BaseMapKey } from '../types'

interface UseMapSetupOptions {
  container: React.RefObject<HTMLDivElement | null>
  center?: [number, number]
  zoom?: number
  baseMap?: BaseMapKey
  onLoad?: (map: maplibregl.Map) => void
}

interface UseMapSetupReturn {
  map: maplibregl.Map | null
  isLoaded: boolean
  error: Error | null
  setBaseMap: (key: BaseMapKey) => void
}

export function useMapSetup({
  container,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  baseMap = 'osm',
  onLoad,
}: UseMapSetupOptions): UseMapSetupReturn {
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [currentBaseMap, setCurrentBaseMap] = useState<BaseMapKey>(baseMap)

  // マップ初期化
  useEffect(() => {
    if (!container.current) return

    const mapConfig = BASE_MAPS[currentBaseMap]
    if (!mapConfig) {
      setError(new Error(`Invalid base map: ${currentBaseMap}`))
      return
    }

    try {
      const map = new maplibregl.Map({
        container: container.current,
        style: mapConfig.style as maplibregl.StyleSpecification,
        center,
        zoom,
        attributionControl: true,
      })

      // コントロールを追加
      map.addControl(new maplibregl.NavigationControl(), 'top-right')
      map.addControl(
        new maplibregl.ScaleControl({ unit: 'metric' }),
        'bottom-left'
      )
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: false,
        }),
        'top-right'
      )

      map.on('load', () => {
        setIsLoaded(true)
        if (onLoad) {
          onLoad(map)
        }
      })

      map.on('error', (e) => {
        console.error('Map error:', e)
        setError(new Error(e.error?.message ?? 'Map loading error'))
      })

      mapRef.current = map

      return () => {
        map.remove()
        mapRef.current = null
        setIsLoaded(false)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to initialize map')
      )
    }
  }, [container, currentBaseMap, center, zoom, onLoad])

  // ベースマップ変更
  const setBaseMap = useCallback(
    (key: BaseMapKey) => {
      if (key === currentBaseMap) return
      setCurrentBaseMap(key)
      setIsLoaded(false)
    },
    [currentBaseMap]
  )

  return {
    map: mapRef.current,
    isLoaded,
    error,
    setBaseMap,
  }
}
