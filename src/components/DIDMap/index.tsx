/**
 * DIDMap コンポーネント
 *
 * 日本の人口集中地区（DID）、飛行禁止区域、空港空域を表示する地図コンポーネント
 */

import {
  Layers as LayersIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  MyLocation as MyLocationIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from '@mui/icons-material'
import { Box, IconButton, Paper, Tooltip } from '@mui/material'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useRef, useState, useCallback, useEffect } from 'react'

import { DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/map'

import { CoordinateDisplay } from './CoordinateDisplay'
import { useMapSetup, useLayerManagement } from './hooks'
import { LayerPanel } from './LayerPanel'

import type { DIDMapProps, ClickPosition, CoordinateFormat } from './types'

/**
 * DIDMap - 日本のドローン飛行制限区域表示地図
 */
function DIDMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  baseMap = 'osm',
  darkMode = false,
  showDID: _showDID = true,
  showAirports: _showAirports = false,
  showNoFlyZones: _showNoFlyZones = false,
  showDrawingTools: _showDrawingTools = false,
  showLayerPanel = true,
  enableCoordinateDisplay = true,
  height = '100%',
  width = '100%',
  onMapLoad,
  onClick,
  onFeatureDrawn: _onFeatureDrawn,
  className,
}: DIDMapProps) {
  // 将来の機能拡張用のプレースホルダー
  void _showDID
  void _showAirports
  void _showNoFlyZones
  void _showDrawingTools
  void _onFeatureDrawn
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLayerPanelState, setShowLayerPanelState] = useState(showLayerPanel)
  const [clickPosition, setClickPosition] = useState<ClickPosition | null>(null)
  const [coordFormat, setCoordFormat] = useState<CoordinateFormat>('decimal')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(zoom)

  // マップ初期化
  const {
    map,
    isLoaded,
    error,
    setBaseMap: _setBaseMap,
  } = useMapSetup({
    container: containerRef,
    center,
    zoom,
    baseMap,
    onLoad: onMapLoad,
  })
  void _setBaseMap // 将来のベースマップ切り替え用

  // レイヤー管理
  const {
    layerStates,
    restrictionStates,
    opacity,
    toggleLayer,
    toggleRestriction,
    setOpacity,
  } = useLayerManagement({
    map,
    isLoaded,
  })

  // ズームレベル更新
  useEffect(() => {
    if (!map || !isLoaded) return

    const handleZoom = () => {
      setCurrentZoom(map.getZoom())
    }

    map.on('zoom', handleZoom)
    return () => {
      map.off('zoom', handleZoom)
    }
  }, [map, isLoaded])

  // クリックイベント
  useEffect(() => {
    if (!map || !isLoaded) return

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const { lngLat, point } = e

      if (enableCoordinateDisplay) {
        setClickPosition({
          x: point.x,
          y: point.y,
          lng: lngLat.lng,
          lat: lngLat.lat,
        })
      }

      if (onClick) {
        const features = map.queryRenderedFeatures(point)
        onClick(lngLat, features)
      }
    }

    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [map, isLoaded, enableCoordinateDisplay, onClick])

  // ズームイン
  const handleZoomIn = useCallback(() => {
    if (map) {
      map.zoomIn()
    }
  }, [map])

  // ズームアウト
  const handleZoomOut = useCallback(() => {
    if (map) {
      map.zoomOut()
    }
  }, [map])

  // 現在地に移動
  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map) {
          map.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 14,
          })
        }
      },
      (err) => {
        console.error('Geolocation error:', err)
      }
    )
  }, [map])

  // フルスクリーン切り替え
  const handleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen?.()
      setIsFullscreen(false)
    }
  }, [isFullscreen])

  // フルスクリーン状態の監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        position: 'relative',
        width,
        height,
        backgroundColor: darkMode ? 'grey.900' : 'grey.100',
      }}>
      {/* エラー表示 */}
      {error && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'error.main',
          }}>
          地図の読み込みに失敗しました: {error.message}
        </Box>
      )}

      {/* ズームレベル表示 */}
      <Paper
        sx={{
          position: 'absolute',
          bottom: 40,
          right: 16,
          px: 1,
          py: 0.5,
          backgroundColor: darkMode ? 'grey.800' : 'background.paper',
          zIndex: 1000,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <span style={{ fontSize: 12, fontFamily: 'monospace' }}>
            z{currentZoom.toFixed(1)}
          </span>
        </Box>
      </Paper>

      {/* コントロールボタン */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 60,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
          zIndex: 1000,
        }}>
        <Tooltip title='レイヤーパネル' placement='left'>
          <IconButton
            onClick={() => setShowLayerPanelState(!showLayerPanelState)}
            sx={{
              backgroundColor: darkMode ? 'grey.800' : 'background.paper',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: darkMode ? 'grey.700' : 'grey.100',
              },
            }}
            size='small'>
            <LayersIcon fontSize='small' />
          </IconButton>
        </Tooltip>

        <Tooltip title='ズームイン' placement='left'>
          <IconButton
            onClick={handleZoomIn}
            sx={{
              backgroundColor: darkMode ? 'grey.800' : 'background.paper',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: darkMode ? 'grey.700' : 'grey.100',
              },
            }}
            size='small'>
            <ZoomInIcon fontSize='small' />
          </IconButton>
        </Tooltip>

        <Tooltip title='ズームアウト' placement='left'>
          <IconButton
            onClick={handleZoomOut}
            sx={{
              backgroundColor: darkMode ? 'grey.800' : 'background.paper',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: darkMode ? 'grey.700' : 'grey.100',
              },
            }}
            size='small'>
            <ZoomOutIcon fontSize='small' />
          </IconButton>
        </Tooltip>

        <Tooltip title='現在地' placement='left'>
          <IconButton
            onClick={handleGeolocate}
            sx={{
              backgroundColor: darkMode ? 'grey.800' : 'background.paper',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: darkMode ? 'grey.700' : 'grey.100',
              },
            }}
            size='small'>
            <MyLocationIcon fontSize='small' />
          </IconButton>
        </Tooltip>

        <Tooltip
          title={isFullscreen ? 'フルスクリーン解除' : 'フルスクリーン'}
          placement='left'>
          <IconButton
            onClick={handleFullscreen}
            sx={{
              backgroundColor: darkMode ? 'grey.800' : 'background.paper',
              boxShadow: 1,
              '&:hover': {
                backgroundColor: darkMode ? 'grey.700' : 'grey.100',
              },
            }}
            size='small'>
            {isFullscreen ? (
              <FullscreenExitIcon fontSize='small' />
            ) : (
              <FullscreenIcon fontSize='small' />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* レイヤーパネル */}
      {showLayerPanelState && isLoaded && (
        <LayerPanel
          layerStates={layerStates}
          restrictionStates={restrictionStates}
          opacity={opacity}
          darkMode={darkMode}
          onLayerToggle={toggleLayer}
          onRestrictionToggle={toggleRestriction}
          onOpacityChange={setOpacity}
          onClose={() => setShowLayerPanelState(false)}
        />
      )}

      {/* 座標表示 */}
      {enableCoordinateDisplay && clickPosition && (
        <CoordinateDisplay
          position={clickPosition}
          format={coordFormat}
          darkMode={darkMode}
          onFormatChange={setCoordFormat}
          onClose={() => setClickPosition(null)}
        />
      )}
    </Box>
  )
}

export { DIDMap }
export type {
  DIDMapProps,
  BaseMapKey,
  LayerState,
  DrawMode,
  CoordinateFormat,
} from './types'
