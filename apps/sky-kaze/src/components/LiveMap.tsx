/**
 * ライブマップ — 全ドライバーがリアルタイムで動く地図
 *
 * 修正: クロージャ問題(ref化)、flyTo、拠点popup、全6ドライバー表示
 */
import { Box } from '@mui/material'
import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useCallback } from 'react'

import 'maplibre-gl/dist/maplibre-gl.css'

import { HUBS, HUB_TYPE_LABELS, SHIPMENTS } from '~/data/logistics'
import {
  useSimulation,
  DRIVER_STATUS_COLOR,
  type DriverPosition,
} from '~/data/simulation'
import { HUB_COLORS, LOGI_NAVY } from '~/theme/colors'

export const LiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const driverMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map())

  // refで最新値を参照（クロージャ問題修正）
  const selectedRef = useRef<string | null>(null)
  const selectDriverRef = useRef(useSimulation.getState().selectDriver)

  const positions = useSimulation((s) => s.positions)
  const selectedDriverId = useSimulation((s) => s.selectedDriverId)
  const selectDriver = useSimulation((s) => s.selectDriver)

  // refを最新値に同期
  selectedRef.current = selectedDriverId
  selectDriverRef.current = selectDriver

  // ドライバー選択時のみflyTo（positions変更では発火しない）
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedDriverId) return
    const dp = useSimulation
      .getState()
      .positions.find((p) => p.driverId === selectedDriverId)
    if (!dp) return
    map.flyTo({
      center: [dp.position.lng, dp.position.lat],
      zoom: 8,
      duration: 800,
    })
  }, [selectedDriverId])

  // マップ初期化
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          cartodb: {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
            maxzoom: 20,
          },
        },
        layers: [{ id: 'cartodb', type: 'raster', source: 'cartodb' }],
      },
      center: [136.9, 35.5],
      zoom: 7,
      pitch: 0,
      bearing: 0,
      antialias: true,
    })

    map.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showZoom: true,
        showCompass: true,
      }),
      'top-right'
    )

    map.on('style.load', () => {
      map.addSource('driver-routes', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })
      map.addLayer({
        id: 'driver-routes-line',
        type: 'line',
        source: 'driver-routes',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 2.5,
          'line-opacity': 0.5,
          'line-dasharray': [4, 3],
        },
      })
    })

    // 拠点マーカー（固定 + クリックでpopup）
    HUBS.forEach((hub) => {
      const el = document.createElement('div')
      const color = HUB_COLORS[hub.type]
      el.style.cssText = `
        width:22px;height:22px;border-radius:50%;
        background:rgba(15,23,42,0.75);border:2px solid ${color};
        display:flex;align-items:center;justify-content:center;
        font-size:9px;font-weight:700;color:${color};
        font-family:'JetBrains Mono',monospace;cursor:pointer;
      `
      el.textContent = hub.code.split('-')[0]

      // 拠点popup: 名前・タイプ・荷物数
      const shipmentsHere = SHIPMENTS.filter(
        (s) => s.currentHub === hub.code
      ).length
      const popup = new maplibregl.Popup({
        offset: 16,
        closeButton: false,
        maxWidth: '220px',
      }).setHTML(`
        <div style="font-family:'JetBrains Mono',Inter,sans-serif;font-size:12px;line-height:1.5;">
          <div style="font-weight:700;margin-bottom:2px;">${hub.name}</div>
          <div style="color:#64748B;font-size:12px;">${HUB_TYPE_LABELS[hub.type]} — ${hub.city}</div>
          <div style="margin-top:4px;font-size:12px;">
            処理能力: <strong>${hub.capacity.toLocaleString()}</strong> t/日<br/>
            現在荷物: <strong>${shipmentsHere}</strong> 件
          </div>
        </div>
      `)

      new maplibregl.Marker({ element: el })
        .setLngLat([hub.longitude, hub.latitude])
        .setPopup(popup)
        .addTo(map)
    })

    // マップ空白クリックでドライバー選択解除
    map.on('click', () => {
      selectDriverRef.current(null)
    })

    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // ドライバーマーカーDOM生成（一度だけ・クロージャをrefで回避）
  const createDriverEl = useCallback((dp: DriverPosition) => {
    const color = DRIVER_STATUS_COLOR[dp.status] ?? '#64748B'
    const el = document.createElement('div')
    el.style.cssText = `width:36px;height:36px;cursor:pointer;position:relative;`
    el.innerHTML = `
      <svg viewBox="0 0 32 32" width="36" height="36">
        <circle cx="16" cy="16" r="14" fill="${LOGI_NAVY}" stroke="${color}" stroke-width="2.5" opacity="0.95"/>
        <path d="M10 19h12M11 19v-3l2-3h6l2 3v3M14 13h4v-2c0-.6-.4-1-1-1h-2c-.6 0-1 .4-1 1v2z"
          stroke="${color}" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <div style="
        position:absolute;bottom:-12px;left:50%;transform:translateX(-50%);
        background:${LOGI_NAVY};color:#fff;font-size:10px;font-weight:700;
        font-family:'JetBrains Mono',monospace;padding:1px 5px;border-radius:3px;
        white-space:nowrap;border:1px solid ${color};pointer-events:none;
      ">${dp.name.split(' ')[0]}</div>
    `
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      const cur = selectedRef.current
      selectDriverRef.current(cur === dp.driverId ? null : dp.driverId)
    })
    return el
  }, [])

  // マーカー・ルート更新
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const existing = driverMarkersRef.current

    positions.forEach((dp) => {
      let marker = existing.get(dp.driverId)
      const color = DRIVER_STATUS_COLOR[dp.status] ?? '#64748B'
      const isSelected = dp.driverId === selectedDriverId

      if (!marker) {
        const el = createDriverEl(dp)
        marker = new maplibregl.Marker({ element: el })
          .setLngLat([dp.position.lng, dp.position.lat])
          .addTo(map)
        existing.set(dp.driverId, marker)
      } else {
        marker.setLngLat([dp.position.lng, dp.position.lat])

        // SVG色更新
        const el = marker.getElement()
        const circle = el.querySelector('circle')
        const paths = el.querySelectorAll('path')
        const label = el.querySelector('div')
        if (circle) {
          circle.setAttribute('stroke', color)
          circle.setAttribute('stroke-width', isSelected ? '3.5' : '2.5')
          circle.setAttribute(
            'fill',
            dp.status === 'incident' ? '#1a0000' : LOGI_NAVY
          )
        }
        paths.forEach((p) => p.setAttribute('stroke', color))
        if (label) {
          ;(label as HTMLElement).style.borderColor = color
        }
      }
    })

    // ルートライン更新（走行中のドライバーのみ）
    const source = map.getSource('driver-routes') as maplibregl.GeoJSONSource
    if (source) {
      const features = positions
        .filter((dp) => dp.route.length > 1 && dp.status === 'moving')
        .map((dp) => ({
          type: 'Feature' as const,
          properties: { color: DRIVER_STATUS_COLOR[dp.status] ?? '#64748B' },
          geometry: {
            type: 'LineString' as const,
            coordinates: dp.route.map((p) => [p.lng, p.lat]),
          },
        }))
      source.setData({ type: 'FeatureCollection', features })
    }
  }, [positions, selectedDriverId, createDriverEl])

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        '& .maplibregl-ctrl-top-right': { top: 72, right: 12 },
        '& .maplibregl-popup-content': {
          borderRadius: '8px',
          padding: '10px 12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        },
      }}>
      <Box
        ref={mapContainer}
        aria-label='配送リアルタイムマップ'
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </Box>
  )
}
