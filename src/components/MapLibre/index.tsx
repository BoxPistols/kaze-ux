import maplibregl from 'maplibre-gl'
import { useEffect, useRef, useState } from 'react'

interface MapLibreProps {
  latitude?: number
  longitude?: number
  zoom?: number
}

const MapLibre = ({
  latitude = 35.6814,
  longitude = 139.767,
  zoom = 9,
}: MapLibreProps) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const [lng, setLng] = useState(longitude)
  const [lat, setLat] = useState(latitude)
  const [zoomLevel, setZoomLevel] = useState(zoom)

  useEffect(() => {
    if (map.current) return // マップが既に初期化されている場合は何もしない
    if (mapContainer.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://demotiles.maplibre.org/style.json', // デモタイルのスタイルを使用
        center: [longitude, latitude],
        zoom: zoom,
      })

      map.current.on('move', () => {
        if (map.current) {
          const center = map.current.getCenter()
          setLng(Number(center.lng.toFixed(4)))
          setLat(Number(center.lat.toFixed(4)))
          setZoomLevel(Number(map.current.getZoom().toFixed(2)))
        }
      })
    }
  }, [latitude, longitude, zoom]) // 依存配列に変数を追加

  useEffect(() => {
    if (map.current) {
      map.current.setCenter([longitude, latitude])
      map.current.setZoom(zoom)
    }
    setLng(longitude)
    setLat(latitude)
    setZoomLevel(zoom)
  }, [latitude, longitude, zoom]) // propsの変更を監視

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapContainer} className='absolute inset-0' />
      <div className='absolute top-10 right-10 bg-white bg-opacity-70 p-2 rounded-md font-sans text-sm shadow-md text-gray-700 dark:bg-gray-700 dark:text-white'>
        Longitude: {lng.toFixed(4)} | Latitude: {lat.toFixed(4)} | Zoom:{' '}
        {zoomLevel.toFixed(2)}
      </div>
    </div>
  )
}

export default MapLibre
