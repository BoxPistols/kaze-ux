import { useTheme } from '@mui/material/styles'
import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'

import { hookUseTheme } from '@/hooks/useTheme'
import 'maplibre-gl/dist/maplibre-gl.css'

interface Map3DProps {
  latitude: number
  longitude: number
  zoom: number
  pitch: number
  bearing: number
}

export const Map3D = ({
  latitude = 35.6809591,
  longitude = 139.7673068,
  zoom = 9,
  pitch = 60,
  bearing = -20,
}: Map3DProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<maplibregl.Map | null>(null)
  const [mapInfo, setMapInfo] = useState({
    lng: longitude,
    lat: latitude,
    zoom: zoom,
    pitch: 60,
    bearing: -20,
  })
  const { mode } = hookUseTheme()
  const theme = useTheme()

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: 'raster',
              tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
              maxzoom: 19,
            },
            terrainSource: {
              type: 'raster-dem',
              url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
              tileSize: 256,
            },
            hillshadeSource: {
              type: 'raster-dem',
              url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
              tileSize: 256,
            },
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm',
            },
            {
              id: 'hills',
              type: 'hillshade',
              source: 'hillshadeSource',
              layout: { visibility: 'visible' },
              paint: { 'hillshade-shadow-color': '#473B24' },
            },
          ],
          terrain: {
            source: 'terrainSource',
            exaggeration: 1.5,
          },
        },
        center: [longitude, latitude],
        zoom: zoom,
        pitch: 60,
        bearing: -20,
        antialias: true,
      })

      map.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true,
        })
      )

      map.addControl(
        new maplibregl.TerrainControl({
          source: 'terrainSource',
          exaggeration: 1.5,
        })
      )

      map.on('style.load', () => {
        map.setTerrain({
          source: 'terrainSource',
          exaggeration: 1.5,
        })
      })

      map.on('move', () => {
        const center = map.getCenter()
        setMapInfo({
          lng: Number(center.lng.toFixed(4)),
          lat: Number(center.lat.toFixed(4)),
          zoom: Number(map.getZoom().toFixed(2)),
          pitch: Number(map.getPitch().toFixed(2)),
          bearing: Number(map.getBearing().toFixed(2)),
        })
      })

      // マウスでの回転を有効にする
      map.dragRotate.enable()

      mapInstance.current = map
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [latitude, longitude, zoom, pitch, bearing])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapContainer} className='absolute inset-0' />

      <div
        className={`
          absolute top-4 right-16 p-2 text-sm z-10
          ${
            mode === 'dark'
              ? 'dark:bg-gray-700 dark:text-white dark:bg-opacity-70'
              : 'bg-white text-gray-700 bg-opacity-70'
          }
          transition-colors duration-200 opacity-80 rounded-md
        `}
        style={{
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}>
        Longitude: {mapInfo.lng} | Latitude: {mapInfo.lat} | Zoom:{' '}
        {mapInfo.zoom} | Pitch: {mapInfo.pitch} | Bearing: {mapInfo.bearing}
      </div>
    </div>
  )
}
