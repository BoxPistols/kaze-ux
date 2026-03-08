/**
 * UTM座標入力自動化パネル
 *
 * キーワード検索、地図選択、手動入力を2カラムレイアウトで統合
 * フルスクリーンモード対応
 */

import AddLocationIcon from '@mui/icons-material/AddLocation'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import EditLocationIcon from '@mui/icons-material/EditLocation'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import OpenWithIcon from '@mui/icons-material/OpenWith'
import PentagonIcon from '@mui/icons-material/Pentagon'
import PlaceIcon from '@mui/icons-material/Place'
import RouteIcon from '@mui/icons-material/Route'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  IconButton,
  Stack,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  InputAdornment,
  CircularProgress,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ToggleButtonGroup,
  ToggleButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material'
import { useState, useCallback, useRef, useMemo, memo } from 'react'
import Map, {
  Marker,
  NavigationControl,
  Source,
  Layer,
} from 'react-map-gl/maplibre'

import 'maplibre-gl/dist/maplibre-gl.css'

import {
  LayerControlPanel,
  RestrictionMapLayers,
} from '@/components/utm/components'
import { useRestrictionLayers, useKeyboardShortcuts } from '@/lib/map/hooks'
import type { LayerVisibility, GeoJsonData } from '@/lib/map/hooks'
import {
  geocodeSearch,
  geocodeSearchLocal,
  type GeocodingResult,
} from '@/services/geocoding/geocodingService'
import type {
  CoordinateData,
  CoordinateFormat,
  ExcelCoordinateExtraction,
} from '@/types/utmTypes'
import {
  parseCoordinateText,
  getFormatName,
  type ParseResult,
} from '@/utils/coordinateParser'

import type {
  LineLayer,
  FillLayer,
  MapRef,
  MapLayerMouseEvent,
} from 'react-map-gl/maplibre'

// 地図コンポーネントのProps
interface CoordinateMapProps {
  mapRef: React.RefObject<MapRef>
  initialViewState: { latitude: number; longitude: number; zoom: number }
  coordinates: CoordinateData[]
  polygonGeoJSON: GeoJSON.Feature | null
  polygonLineGeoJSON: GeoJSON.Feature | null
  waypointLineGeoJSON: GeoJSON.Feature | null
  polygonFillLayer: FillLayer
  polygonLineLayer: LineLayer
  waypointLineLayer: LineLayer
  editMode: boolean
  selectedMarkerIndex: number | null
  onMapClick: (event: MapLayerMouseEvent) => void
  onMarkerDragEnd: (
    index: number,
    event: { lngLat: { lng: number; lat: number } }
  ) => void
  onMarkerSelect: (index: number) => void
  // 制限区域レイヤー用props
  showRestrictionLayers?: boolean
  restrictionVisibility?: LayerVisibility
  restrictionGeoJsonData?: GeoJsonData
}

// memo化された地図コンポーネント（親の再レンダリングの影響を受けない）
const CoordinateMap = memo(function CoordinateMap({
  mapRef,
  initialViewState,
  coordinates,
  polygonGeoJSON,
  polygonLineGeoJSON,
  waypointLineGeoJSON,
  polygonFillLayer,
  polygonLineLayer,
  waypointLineLayer,
  editMode,
  selectedMarkerIndex,
  onMapClick,
  onMarkerDragEnd,
  onMarkerSelect,
  showRestrictionLayers,
  restrictionVisibility,
  restrictionGeoJsonData,
}: CoordinateMapProps) {
  return (
    <Map
      ref={mapRef}
      initialViewState={initialViewState}
      onClick={onMapClick}
      style={{ width: '100%', height: '100%' }}
      mapStyle='https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
      cursor={editMode ? 'grab' : 'crosshair'}>
      <NavigationControl position='top-right' />

      {/* 制限区域レイヤー（座標入力レイヤーより下に表示） */}
      {showRestrictionLayers &&
        restrictionVisibility &&
        restrictionGeoJsonData && (
          <RestrictionMapLayers
            visibility={restrictionVisibility}
            geoJsonData={restrictionGeoJsonData}
          />
        )}

      {polygonGeoJSON && (
        <Source id='polygon' type='geojson' data={polygonGeoJSON}>
          <Layer {...polygonFillLayer} />
        </Source>
      )}
      {polygonLineGeoJSON && (
        <Source id='polygon-line' type='geojson' data={polygonLineGeoJSON}>
          <Layer {...polygonLineLayer} />
        </Source>
      )}
      {waypointLineGeoJSON && (
        <Source id='waypoint-line' type='geojson' data={waypointLineGeoJSON}>
          <Layer {...waypointLineLayer} />
        </Source>
      )}

      {coordinates.map((coord, index) => (
        <Marker
          key={`coord-${index}`}
          latitude={coord.latitude}
          longitude={coord.longitude}
          anchor='bottom'
          draggable={editMode}
          onDragEnd={(e) => onMarkerDragEnd(index, e)}>
          <Tooltip
            title={
              editMode
                ? `${coord.name || `ポイント ${index + 1}`} - ドラッグで移動`
                : coord.name || `ポイント ${index + 1}`
            }
            arrow>
            <Box
              onClick={() => editMode && onMarkerSelect(index)}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor:
                  coord.type === 'takeoff'
                    ? 'success.main'
                    : coord.type === 'landing'
                      ? 'warning.main'
                      : coord.type === 'polygon_vertex'
                        ? 'secondary.main'
                        : 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: selectedMarkerIndex === index ? 6 : 2,
                border:
                  selectedMarkerIndex === index
                    ? '3px solid #ff5722'
                    : '2px solid white',
                cursor: editMode ? 'grab' : 'pointer',
                transition: 'all 0.2s',
                '&:hover': editMode
                  ? { transform: 'scale(1.15)', boxShadow: 4 }
                  : {},
              }}>
              <Typography
                variant='caption'
                sx={{ color: 'white', fontWeight: 700 }}>
                {index + 1}
              </Typography>
            </Box>
          </Tooltip>
        </Marker>
      ))}
    </Map>
  )
})

// 座標入力パネルのProps
interface UTMCoordinateInputPanelProps {
  coordinates: CoordinateData[]
  onCoordinatesChange: (coordinates: CoordinateData[]) => void
  readOnly?: boolean
  loading?: boolean
  /** 制限区域レイヤーを表示するかどうか */
  showRestrictionLayers?: boolean
}

// ポリゴン外周座標を生成するユーティリティ
const generatePolygonPerimeter = (
  centerLat: number,
  centerLng: number,
  radiusMeters: number,
  numPoints: number = 8
): { latitude: number; longitude: number }[] => {
  const points: { latitude: number; longitude: number }[] = []
  const metersPerDegreeLat = 111320
  const metersPerDegreeLng =
    metersPerDegreeLat * Math.cos((centerLat * Math.PI) / 180)
  const latRadius = radiusMeters / metersPerDegreeLat
  const lngRadius = radiusMeters / metersPerDegreeLng

  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2
    points.push({
      latitude: centerLat + latRadius * Math.sin(angle + Math.PI / 2),
      longitude: centerLng + lngRadius * Math.cos(angle + Math.PI / 2),
    })
  }
  return points
}

// ランドマークタイプに応じたデフォルト半径
const getDefaultRadiusForType = (type: string): number => {
  switch (type) {
    case 'airport':
      return 500
    case 'heliport':
      return 200
    case 'landmark':
      return 100
    case 'station':
      return 150
    case 'government':
    case 'imperial':
      return 200
    case 'bridge':
      return 300
    case 'industrial':
      return 500
    case 'river':
      return 200
    default:
      return 100
  }
}

// 座標形式変換ユーティリティ
const formatDecimal = (value: number): string => {
  return value.toFixed(6)
}

const UTMCoordinateInputPanel = ({
  coordinates,
  onCoordinatesChange,
  readOnly = false,
  loading: _loading = false,
  showRestrictionLayers = false,
}: UTMCoordinateInputPanelProps) => {
  const theme = useTheme()
  const mapRef = useRef<MapRef>(null)

  // 制限区域レイヤー管理
  const {
    visibility: restrictionVisibility,
    toggleLayer: toggleRestrictionLayer,
    toggleAllLayers: toggleAllRestrictionLayers,
    geoJsonData: restrictionGeoJsonData,
  } = useRestrictionLayers({
    initialVisibility: {
      noFlyZones: true,
      airports: true,
      heliports: true,
    },
  })

  // キーボードショートカット（制限区域レイヤー表示時のみ有効）
  useKeyboardShortcuts({
    onToggleLayer: toggleRestrictionLayer,
    onToggleAllLayers: toggleAllRestrictionLayers,
    enabled: showRestrictionLayers,
  })

  // 最新のcoordinatesを参照するためのref（コールバック安定化用）
  const coordinatesRef = useRef(coordinates)
  coordinatesRef.current = coordinates

  // フルスクリーンモード
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 検索状態
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([])
  const [searching, setSearching] = useState(false)
  const [useGSI, setUseGSI] = useState(true)

  // 手動入力状態
  const [manualLat, setManualLat] = useState('')
  const [manualLng, setManualLng] = useState('')
  const [manualName, setManualName] = useState('')

  // 表示形式
  const [displayFormat, setDisplayFormat] =
    useState<CoordinateFormat>('decimal')

  // 地図初期状態（uncontrolled mode でチラツキ防止）
  const initialViewState = useMemo(
    () => ({
      latitude: 35.6812,
      longitude: 139.7671,
      zoom: 10,
    }),
    []
  )
  const [mapClickMode, setMapClickMode] = useState<
    'waypoint' | 'polygon_vertex'
  >('polygon_vertex')
  const [editMode, setEditMode] = useState(false)
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(
    null
  )

  // Excel取込状態
  const [excelDialogOpen, setExcelDialogOpen] = useState(false)
  const [extractionResult, setExtractionResult] =
    useState<ExcelCoordinateExtraction | null>(null)

  // テキスト貼り付け状態
  const [pasteText, setPasteText] = useState('')
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)

  // 座標編集ダイアログ状態
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingCoord, setEditingCoord] = useState<{
    name: string
    latitude: string
    longitude: string
    type: CoordinateData['type']
  } | null>(null)

  // ポリゴン頂点とウェイポイントを分離
  const polygonVertices = useMemo(
    () => coordinates.filter((c) => c.type === 'polygon_vertex'),
    [coordinates]
  )
  const waypointCoordinates = useMemo(
    () => coordinates.filter((c) => c.type !== 'polygon_vertex'),
    [coordinates]
  )

  // ポリゴンのGeoJSONデータ
  const polygonGeoJSON = useMemo(() => {
    if (polygonVertices.length < 3) return null
    const ringCoords = [
      ...polygonVertices.map((c) => [c.longitude, c.latitude]),
      [polygonVertices[0].longitude, polygonVertices[0].latitude],
    ]
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'Polygon' as const, coordinates: [ringCoords] },
    }
  }, [polygonVertices])

  const polygonLineGeoJSON = useMemo(() => {
    if (polygonVertices.length < 2) return null
    const lineCoords =
      polygonVertices.length >= 3
        ? [
            ...polygonVertices.map((c) => [c.longitude, c.latitude]),
            [polygonVertices[0].longitude, polygonVertices[0].latitude],
          ]
        : polygonVertices.map((c) => [c.longitude, c.latitude])
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'LineString' as const, coordinates: lineCoords },
    }
  }, [polygonVertices])

  const waypointLineGeoJSON = useMemo(() => {
    if (waypointCoordinates.length < 2) return null
    return {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: waypointCoordinates.map((c) => [c.longitude, c.latitude]),
      },
    }
  }, [waypointCoordinates])

  // レイヤースタイル
  const polygonFillLayer: FillLayer = {
    id: 'polygon-fill',
    type: 'fill',
    source: 'polygon',
    paint: { 'fill-color': theme.palette.secondary.main, 'fill-opacity': 0.2 },
  }
  const polygonLineLayer: LineLayer = {
    id: 'polygon-line',
    type: 'line',
    source: 'polygon-line',
    paint: {
      'line-color': theme.palette.secondary.main,
      'line-width': 3,
      'line-dasharray': [2, 1],
    },
  }
  const waypointLineLayer: LineLayer = {
    id: 'waypoint-line',
    type: 'line',
    source: 'waypoint-line',
    paint: { 'line-color': theme.palette.primary.main, 'line-width': 2 },
  }

  // 地図を指定座標に移動（mapRefを使用）
  const flyToLocation = useCallback(
    (latitude: number, longitude: number, zoom: number = 14) => {
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom,
        duration: 1000,
      })
    },
    []
  )

  // 検索実行（Enter/ボタンクリック時のみ）
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      // まずローカル検索を実行
      const localResults = geocodeSearchLocal(searchQuery, 5)
      // GSIが有効な場合はAPI検索も実行
      if (useGSI) {
        const apiResults = await geocodeSearch(searchQuery, {
          useGSI: true,
          maxResults: 10,
        })
        // ローカル結果とAPI結果をマージ（重複除去）
        const mergedResults = [...localResults]
        apiResults.forEach((r) => {
          if (!mergedResults.some((lr) => lr.id === r.id)) {
            mergedResults.push(r)
          }
        })
        setSearchResults(mergedResults.slice(0, 10))
      } else {
        setSearchResults(localResults)
      }
    } catch (error) {
      console.error('Geocoding search error:', error)
      // エラー時はローカル結果のみ表示
      const localResults = geocodeSearchLocal(searchQuery, 5)
      setSearchResults(localResults)
    } finally {
      setSearching(false)
    }
  }, [searchQuery, useGSI])

  // 検索結果から座標追加
  const handleAddFromSearch = useCallback(
    (result: GeocodingResult, generatePolygon: boolean = false) => {
      const shouldGeneratePolygon =
        generatePolygon ||
        [
          'landmark',
          'airport',
          'heliport',
          'government',
          'imperial',
          'bridge',
          'industrial',
        ].includes(result.type)

      if (shouldGeneratePolygon) {
        const radius = getDefaultRadiusForType(result.type)
        const perimeterPoints = generatePolygonPerimeter(
          result.latitude,
          result.longitude,
          radius,
          8
        )
        const newCoords: CoordinateData[] = perimeterPoints.map(
          (point, index) => ({
            latitude: point.latitude,
            longitude: point.longitude,
            name: `${result.name} 頂点${index + 1}`,
            type: 'polygon_vertex' as const,
            order: coordinates.length + index,
          })
        )
        onCoordinatesChange([...coordinates, ...newCoords])
      } else {
        const newCoord: CoordinateData = {
          latitude: result.latitude,
          longitude: result.longitude,
          name: result.name,
          type: 'waypoint',
          order: coordinates.length,
        }
        onCoordinatesChange([...coordinates, newCoord])
      }
      flyToLocation(result.latitude, result.longitude, 15)
    },
    [coordinates, onCoordinatesChange, flyToLocation]
  )

  // 地図クリックから座標追加（refを使用して関数参照を安定化）
  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (editMode) return
      const { lng, lat } = event.lngLat
      const currentCoords = coordinatesRef.current
      const isPolygonMode = mapClickMode === 'polygon_vertex'
      const polygonCount = currentCoords.filter(
        (c) => c.type === 'polygon_vertex'
      ).length
      const waypointCount = currentCoords.filter(
        (c) => c.type !== 'polygon_vertex'
      ).length

      const newCoord: CoordinateData = {
        latitude: lat,
        longitude: lng,
        name: isPolygonMode
          ? `ポリゴン頂点 ${polygonCount + 1}`
          : `ウェイポイント ${waypointCount + 1}`,
        type: mapClickMode,
        order: currentCoords.length,
      }
      onCoordinatesChange([...currentCoords, newCoord])
    },
    [onCoordinatesChange, mapClickMode, editMode]
  )

  // 手動入力から座標追加
  const handleAddManual = useCallback(() => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    if (isNaN(lat) || isNaN(lng)) return

    const newCoord: CoordinateData = {
      latitude: lat,
      longitude: lng,
      name: manualName || `ポイント ${coordinates.length + 1}`,
      type: 'waypoint',
      order: coordinates.length,
    }
    onCoordinatesChange([...coordinates, newCoord])
    setManualLat('')
    setManualLng('')
    setManualName('')
    flyToLocation(lat, lng, 14)
  }, [
    manualLat,
    manualLng,
    manualName,
    coordinates,
    onCoordinatesChange,
    flyToLocation,
  ])

  // 座標削除
  const handleRemoveCoordinate = useCallback(
    (index: number) => {
      const updated = coordinates.filter((_, i) => i !== index)
      onCoordinatesChange(updated.map((c, i) => ({ ...c, order: i })))
    },
    [coordinates, onCoordinatesChange]
  )

  // マーカードラッグ（refを使用して関数参照を安定化）
  const handleMarkerDragEnd = useCallback(
    (index: number, event: { lngLat: { lng: number; lat: number } }) => {
      const { lng, lat } = event.lngLat
      const updated = coordinatesRef.current.map((coord, i) =>
        i === index ? { ...coord, latitude: lat, longitude: lng } : coord
      )
      onCoordinatesChange(updated)
    },
    [onCoordinatesChange]
  )

  // クリア
  const handleClearPolygon = useCallback(() => {
    const updated = coordinates.filter((c) => c.type !== 'polygon_vertex')
    onCoordinatesChange(updated.map((c, i) => ({ ...c, order: i })))
  }, [coordinates, onCoordinatesChange])

  const handleClearWaypoints = useCallback(() => {
    const updated = coordinates.filter((c) => c.type === 'polygon_vertex')
    onCoordinatesChange(updated.map((c, i) => ({ ...c, order: i })))
  }, [coordinates, onCoordinatesChange])

  // 座標編集を開始
  const handleEditCoordinate = useCallback(
    (index: number) => {
      const coord = coordinates[index]
      setEditingIndex(index)
      setEditingCoord({
        name: coord.name || '',
        latitude: coord.latitude.toString(),
        longitude: coord.longitude.toString(),
        type: coord.type,
      })
      setEditDialogOpen(true)
    },
    [coordinates]
  )

  // 座標編集を保存
  const handleSaveEdit = useCallback(() => {
    if (editingIndex === null || !editingCoord) return
    const lat = parseFloat(editingCoord.latitude)
    const lng = parseFloat(editingCoord.longitude)
    if (isNaN(lat) || isNaN(lng)) return

    const updated = coordinates.map((coord, i) =>
      i === editingIndex
        ? {
            ...coord,
            name: editingCoord.name,
            latitude: lat,
            longitude: lng,
            type: editingCoord.type,
          }
        : coord
    )
    onCoordinatesChange(updated)
    setEditDialogOpen(false)
    setEditingIndex(null)
    setEditingCoord(null)
  }, [editingIndex, editingCoord, coordinates, onCoordinatesChange])

  // 座標編集をキャンセル
  const handleCancelEdit = useCallback(() => {
    setEditDialogOpen(false)
    setEditingIndex(null)
    setEditingCoord(null)
  }, [])

  // クリップボードにコピー
  const handleCopyCoordinates = useCallback(() => {
    const text = coordinates
      .map(
        (c) =>
          `${c.name || `ポイント${c.order}`}: ${formatDecimal(c.latitude)}, ${formatDecimal(c.longitude)}`
      )
      .join('\n')
    navigator.clipboard.writeText(text)
  }, [coordinates])

  // Excel取込（モック）
  const handleExcelUpload = useCallback(() => {
    const mockExtraction: ExcelCoordinateExtraction = {
      id: `ext-${Date.now()}`,
      fileName: 'NOTAM申請_飛行区域座標.xlsx',
      extractedAt: new Date().toISOString(),
      coordinates: [
        {
          latitude: 35.685,
          longitude: 139.76,
          name: '飛行区域 頂点A',
          type: 'polygon_vertex',
          order: 0,
        },
        {
          latitude: 35.685,
          longitude: 139.78,
          name: '飛行区域 頂点B',
          type: 'polygon_vertex',
          order: 1,
        },
        {
          latitude: 35.67,
          longitude: 139.78,
          name: '飛行区域 頂点C',
          type: 'polygon_vertex',
          order: 2,
        },
        {
          latitude: 35.67,
          longitude: 139.76,
          name: '飛行区域 頂点D',
          type: 'polygon_vertex',
          order: 3,
        },
      ],
      extractionMethod: 'column_mapping',
      detectedFormat: 'decimal',
      errors: [],
      conversionResults: { total: 4, success: 4, failed: 0, skipped: 0 },
    }
    setExtractionResult(mockExtraction)
    setExcelDialogOpen(true)
  }, [])

  const handleApplyExcelExtraction = useCallback(() => {
    if (!extractionResult) return
    const newCoords = extractionResult.coordinates.map((c, i) => ({
      ...c,
      order: coordinates.length + i,
    }))
    onCoordinatesChange([...coordinates, ...newCoords])
    setExcelDialogOpen(false)
    setExtractionResult(null)
  }, [extractionResult, coordinates, onCoordinatesChange])

  // テキスト貼り付けのパース処理
  const handleParsePasteText = useCallback(() => {
    if (!pasteText.trim()) return

    const result = parseCoordinateText(pasteText)
    setParseResult(result)
    setPasteDialogOpen(true)
  }, [pasteText])

  // テキスト貼り付け結果を適用
  const handleApplyPasteResult = useCallback(() => {
    if (!parseResult || !parseResult.success) return

    const newCoords = parseResult.coordinates.map((c, i) => ({
      ...c,
      order: coordinates.length + i,
    }))
    onCoordinatesChange([...coordinates, ...newCoords])
    setPasteDialogOpen(false)
    setPasteText('')
    setParseResult(null)
  }, [parseResult, coordinates, onCoordinatesChange])

  // マーカー選択ハンドラ（memo化されたコンポーネントに渡すため）
  const handleMarkerSelect = useCallback((index: number) => {
    setSelectedMarkerIndex(index)
  }, [])

  return (
    <Box
      sx={{
        height: isFullscreen ? '100vh' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 1300 : 'auto',
        bgcolor: theme.palette.background.default,
      }}>
      {/* ヘッダー */}
      <Paper
        elevation={0}
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Stack direction='row' spacing={2} alignItems='center'>
          <EditLocationIcon color='primary' />
          <Typography variant='h6' fontWeight={600}>
            座標入力
          </Typography>
          <Chip
            label={`${coordinates.length}件`}
            size='small'
            color='primary'
            variant='outlined'
          />
        </Stack>

        <Stack direction='row' spacing={1} alignItems='center'>
          <FormControl size='small' sx={{ minWidth: 100 }}>
            <InputLabel>表示</InputLabel>
            <Select
              value={displayFormat}
              label='表示'
              onChange={(e) =>
                setDisplayFormat(e.target.value as CoordinateFormat)
              }>
              <MenuItem value='decimal'>10進度</MenuItem>
              <MenuItem value='dms'>度分秒</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title='座標をコピー'>
            <IconButton
              onClick={handleCopyCoordinates}
              disabled={coordinates.length === 0}>
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title={isFullscreen ? '通常表示' : 'フルスクリーン'}>
            <IconButton onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <CloseFullscreenIcon /> : <FullscreenIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* 2カラムレイアウト */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          minHeight: isFullscreen ? 0 : 600,
        }}>
        {/* 左カラム: 検索・手動入力・座標リスト */}
        <Paper
          elevation={0}
          sx={{
            width: isFullscreen ? 400 : 360,
            minWidth: isFullscreen ? 400 : 360,
            borderRight: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {/* キーワード検索 */}
            <Box sx={{ mb: 2 }}>
              <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
                <SearchIcon
                  sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }}
                />
                キーワード検索
              </Typography>
              <Stack direction='row' spacing={1}>
                <TextField
                  fullWidth
                  size='small'
                  placeholder='地名、施設名、住所...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <SearchIcon
                          sx={{ fontSize: 18, color: 'text.disabled' }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant='contained'
                  size='small'
                  onClick={handleSearch}
                  disabled={searching || !searchQuery.trim()}
                  sx={{ minWidth: 'auto', px: 2 }}>
                  {searching ? (
                    <CircularProgress size={16} />
                  ) : (
                    <AutoFixHighIcon />
                  )}
                </Button>
              </Stack>
              <Stack
                direction='row'
                spacing={1}
                sx={{ mt: 1 }}
                alignItems='center'>
                <Chip
                  label='住所検索'
                  size='small'
                  color={useGSI ? 'primary' : 'default'}
                  variant={useGSI ? 'filled' : 'outlined'}
                  onClick={() => setUseGSI(!useGSI)}
                  sx={{ height: 22, fontSize: '0.7rem' }}
                />
              </Stack>
            </Box>

            {/* 検索結果 */}
            {searchResults.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <List dense sx={{ py: 0 }}>
                  {searchResults.slice(0, 5).map((result) => (
                    <ListItem
                      key={result.id}
                      sx={{
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        mb: 0.5,
                        py: 0.5,
                      }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <AddLocationIcon fontSize='small' color='primary' />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant='body2' fontWeight={500} noWrap>
                            {result.name}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant='caption'
                            color='text.secondary'
                            noWrap>
                            {result.address}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction='row' spacing={0.5}>
                          <Tooltip title='地図で表示'>
                            <IconButton
                              size='small'
                              onClick={() =>
                                flyToLocation(
                                  result.latitude,
                                  result.longitude,
                                  15
                                )
                              }>
                              <PlaceIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() => handleAddFromSearch(result)}>
                            追加
                          </Button>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* 手動入力 */}
            <Accordion
              defaultExpanded={false}
              sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                <Typography variant='subtitle2' fontWeight={600}>
                  <MyLocationIcon
                    sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }}
                  />
                  手動入力
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    size='small'
                    label='地点名'
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder='任意'
                  />
                  <Stack direction='row' spacing={1}>
                    <TextField
                      size='small'
                      label='緯度'
                      value={manualLat}
                      onChange={(e) => setManualLat(e.target.value)}
                      placeholder='35.6812'
                      type='number'
                      inputProps={{ step: 'any' }}
                    />
                    <TextField
                      size='small'
                      label='経度'
                      value={manualLng}
                      onChange={(e) => setManualLng(e.target.value)}
                      placeholder='139.7671'
                      type='number'
                      inputProps={{ step: 'any' }}
                    />
                  </Stack>
                  <Button
                    variant='contained'
                    size='small'
                    onClick={handleAddManual}
                    disabled={!manualLat || !manualLng}
                    startIcon={<AddLocationIcon />}>
                    追加
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Excel取込 */}
            <Accordion
              sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                <Typography variant='subtitle2' fontWeight={600}>
                  <FileUploadIcon
                    sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }}
                  />
                  Excel取込
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Button
                  variant='outlined'
                  fullWidth
                  onClick={handleExcelUpload}
                  startIcon={<FileUploadIcon />}>
                  ファイルを選択
                </Button>
              </AccordionDetails>
            </Accordion>

            {/* テキスト貼り付け */}
            <Accordion
              defaultExpanded={false}
              sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                <Typography variant='subtitle2' fontWeight={600}>
                  <ContentCopyIcon
                    sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }}
                  />
                  テキスト貼り付け
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <Stack spacing={1.5}>
                  <TextField
                    multiline
                    rows={6}
                    fullWidth
                    placeholder={`KML, GeoJSON, CSV, DMS, 度分, 10進度に対応

例:
35.6812, 139.7671
35°40'48"N 139°45'03"E
<coordinates>139.7671,35.6812</coordinates>`}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                    }}
                  />
                  <Button
                    variant='contained'
                    fullWidth
                    onClick={handleParsePasteText}
                    disabled={!pasteText.trim()}
                    startIcon={<AutoFixHighIcon />}>
                    解析
                  </Button>
                  <Typography variant='caption' color='text.secondary'>
                    対応形式: KML, GeoJSON, CSV, DMS（度分秒）, 度分, 10進度
                  </Typography>
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 2 }} />

            {/* 登録済み座標リスト */}
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 1 }}>
              <Typography variant='subtitle2' fontWeight={600}>
                登録済み座標
              </Typography>
              {coordinates.length > 0 && (
                <Tooltip title='全て削除'>
                  <Button
                    size='small'
                    color='error'
                    variant='text'
                    startIcon={<ClearAllIcon sx={{ fontSize: 16 }} />}
                    onClick={() => onCoordinatesChange([])}
                    disabled={readOnly}
                    sx={{ fontSize: '0.7rem', py: 0, minWidth: 'auto' }}>
                    全削除
                  </Button>
                </Tooltip>
              )}
            </Stack>
            {coordinates.length === 0 ? (
              <Alert severity='info' sx={{ py: 1 }}>
                <Typography variant='caption'>
                  地図をクリックするか、検索で座標を追加してください
                </Typography>
              </Alert>
            ) : (
              <TableContainer
                sx={{ maxHeight: 300, maxWidth: '100%', overflow: 'auto' }}>
                <Table
                  size='small'
                  stickyHeader
                  sx={{
                    tableLayout: 'fixed',
                    width: '100%',
                    minWidth: 'unset !important',
                  }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ py: 0.5, width: 40, minWidth: 40 }}>
                        #
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                        名前
                      </TableCell>
                      <TableCell
                        sx={{ py: 0.5, width: 90, minWidth: 90 }}
                        align='right'>
                        操作
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {coordinates.map((coord, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ py: 0.5 }}>
                          <Chip
                            size='small'
                            label={index + 1}
                            color={
                              coord.type === 'polygon_vertex'
                                ? 'secondary'
                                : 'primary'
                            }
                            sx={{ height: 20, fontSize: '0.65rem' }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 0.5, overflow: 'hidden' }}>
                          <Typography
                            variant='caption'
                            noWrap
                            sx={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}>
                            {coord.name || `ポイント ${index + 1}`}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{ py: 0.5, width: 90, minWidth: 90 }}
                          align='right'>
                          <Stack
                            direction='row'
                            spacing={0}
                            justifyContent='flex-end'>
                            <Tooltip title='地図で表示'>
                              <IconButton
                                size='small'
                                onClick={() =>
                                  flyToLocation(
                                    coord.latitude,
                                    coord.longitude,
                                    16
                                  )
                                }>
                                <PlaceIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='編集'>
                              <IconButton
                                size='small'
                                color='primary'
                                onClick={() => handleEditCoordinate(index)}
                                disabled={readOnly}>
                                <EditIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title='削除'>
                              <IconButton
                                size='small'
                                color='error'
                                onClick={() => handleRemoveCoordinate(index)}
                                disabled={readOnly}>
                                <DeleteIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>

        {/* 右カラム: 地図 */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          <CoordinateMap
            mapRef={mapRef}
            initialViewState={initialViewState}
            coordinates={coordinates}
            polygonGeoJSON={polygonGeoJSON}
            polygonLineGeoJSON={polygonLineGeoJSON}
            waypointLineGeoJSON={waypointLineGeoJSON}
            polygonFillLayer={polygonFillLayer}
            polygonLineLayer={polygonLineLayer}
            waypointLineLayer={waypointLineLayer}
            editMode={editMode}
            selectedMarkerIndex={selectedMarkerIndex}
            onMapClick={handleMapClick}
            onMarkerDragEnd={handleMarkerDragEnd}
            onMarkerSelect={handleMarkerSelect}
            showRestrictionLayers={showRestrictionLayers}
            restrictionVisibility={restrictionVisibility}
            restrictionGeoJsonData={restrictionGeoJsonData}
          />

          {/* 制限区域レイヤーコントロールパネル */}
          {showRestrictionLayers && (
            <Box
              sx={{
                position: 'absolute',
                top: 56,
                right: 8,
                zIndex: 10,
              }}>
              <LayerControlPanel
                visibility={restrictionVisibility}
                onToggleLayer={toggleRestrictionLayer}
                onToggleAllLayers={toggleAllRestrictionLayers}
                compact
                defaultExpanded={false}
              />
            </Box>
          )}

          {/* 地図上のコントロール */}
          <Stack
            direction='row'
            spacing={0.5}
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
            }}>
            {/* モード切り替え */}
            <ToggleButtonGroup
              value={mapClickMode}
              exclusive
              onChange={(_, value) => value && setMapClickMode(value)}
              size='small'
              sx={{
                bgcolor: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(8px)',
              }}>
              <ToggleButton
                value='polygon_vertex'
                sx={{
                  gap: 0.5,
                  px: 1.5,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.secondary.main, 0.15),
                    color: theme.palette.secondary.main,
                  },
                }}>
                <PentagonIcon fontSize='small' />
                ポリゴン
              </ToggleButton>
              <ToggleButton
                value='waypoint'
                sx={{
                  gap: 0.5,
                  px: 1.5,
                  '&.Mui-selected': {
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    color: theme.palette.primary.main,
                  },
                }}>
                <RouteIcon fontSize='small' />
                WP
              </ToggleButton>
            </ToggleButtonGroup>

            {/* 編集モード */}
            <Tooltip
              title={editMode ? '編集モード終了' : 'マーカー編集（ドラッグ）'}>
              <IconButton
                size='small'
                onClick={() => {
                  setEditMode(!editMode)
                  setSelectedMarkerIndex(null)
                }}
                sx={{
                  bgcolor: editMode
                    ? alpha(theme.palette.warning.main, 0.9)
                    : alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(8px)',
                  color: editMode ? 'white' : 'inherit',
                  '&:hover': {
                    bgcolor: editMode
                      ? theme.palette.warning.main
                      : theme.palette.background.paper,
                  },
                }}>
                <OpenWithIcon />
              </IconButton>
            </Tooltip>

            {editMode && selectedMarkerIndex !== null && (
              <Tooltip title='選択中のポイントを削除'>
                <IconButton
                  size='small'
                  onClick={() => {
                    handleRemoveCoordinate(selectedMarkerIndex)
                    setSelectedMarkerIndex(null)
                  }}
                  sx={{
                    bgcolor: alpha(theme.palette.error.main, 0.9),
                    color: 'white',
                    '&:hover': { bgcolor: theme.palette.error.main },
                  }}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {/* クリアボタン */}
          {coordinates.length > 0 && (
            <Stack
              direction='row'
              spacing={0.5}
              sx={{ position: 'absolute', bottom: 16, right: 16 }}>
              {polygonVertices.length > 0 && (
                <Button
                  size='small'
                  variant='contained'
                  color='secondary'
                  startIcon={<ClearAllIcon />}
                  onClick={handleClearPolygon}
                  sx={{
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.7rem',
                    py: 0.5,
                  }}>
                  ポリゴン削除
                </Button>
              )}
              {waypointCoordinates.length > 0 && (
                <Button
                  size='small'
                  variant='contained'
                  color='primary'
                  startIcon={<ClearAllIcon />}
                  onClick={handleClearWaypoints}
                  sx={{
                    backdropFilter: 'blur(8px)',
                    fontSize: '0.7rem',
                    py: 0.5,
                  }}>
                  WP削除
                </Button>
              )}
            </Stack>
          )}

          {/* 操作ヒント */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: 16,
              bgcolor: alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(8px)',
              borderRadius: 1,
              px: 1.5,
              py: 0.5,
            }}>
            <Typography variant='caption' color='text.secondary'>
              地図クリックで座標追加 / ホイールでズーム
            </Typography>
          </Box>

          {/* 編集モードインジケータ */}
          {editMode && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: alpha(theme.palette.warning.main, 0.95),
                color: 'white',
                px: 2,
                py: 0.5,
                borderRadius: 2,
              }}>
              <Typography variant='caption' fontWeight='bold'>
                編集モード: マーカーをドラッグで移動
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Excel取込ダイアログ */}
      <Dialog
        open={excelDialogOpen}
        onClose={() => setExcelDialogOpen(false)}
        maxWidth='sm'
        fullWidth>
        <DialogTitle>Excel座標抽出結果</DialogTitle>
        <DialogContent>
          {extractionResult && (
            <Box>
              <Alert severity='success' sx={{ mb: 2 }}>
                {extractionResult.conversionResults.success}
                件の座標を抽出しました
              </Alert>
              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>地点名</TableCell>
                      <TableCell>座標</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {extractionResult.coordinates.map((coord, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{coord.name}</TableCell>
                        <TableCell>
                          {formatDecimal(coord.latitude)},{' '}
                          {formatDecimal(coord.longitude)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExcelDialogOpen(false)}>キャンセル</Button>
          <Button
            variant='contained'
            onClick={handleApplyExcelExtraction}
            startIcon={<AddLocationIcon />}>
            追加
          </Button>
        </DialogActions>
      </Dialog>

      {/* テキスト貼り付け結果ダイアログ */}
      <Dialog
        open={pasteDialogOpen}
        onClose={() => setPasteDialogOpen(false)}
        maxWidth='md'
        fullWidth>
        <DialogTitle>
          テキスト解析結果
          {parseResult && (
            <Chip
              label={getFormatName(parseResult.format)}
              size='small'
              color='primary'
              sx={{ ml: 2 }}
            />
          )}
        </DialogTitle>
        <DialogContent>
          {parseResult && (
            <Box>
              {/* エラーメッセージ */}
              {parseResult.errors.length > 0 && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {parseResult.errors.map((error, index) => (
                    <Typography key={index} variant='body2'>
                      {error}
                    </Typography>
                  ))}
                </Alert>
              )}

              {/* 警告メッセージ */}
              {parseResult.warnings.length > 0 && (
                <Alert severity='warning' sx={{ mb: 2 }}>
                  {parseResult.warnings.map((warning, index) => (
                    <Typography key={index} variant='body2'>
                      {warning}
                    </Typography>
                  ))}
                </Alert>
              )}

              {/* 成功メッセージと座標プレビュー */}
              {parseResult.success && parseResult.coordinates.length > 0 && (
                <>
                  <Alert severity='success' sx={{ mb: 2 }}>
                    {parseResult.coordinates.length}件の座標を認識しました
                  </Alert>

                  <Typography
                    variant='subtitle2'
                    fontWeight={600}
                    sx={{ mb: 1 }}>
                    座標プレビュー
                  </Typography>
                  <TableContainer component={Paper} variant='outlined'>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>地点名</TableCell>
                          <TableCell>緯度</TableCell>
                          <TableCell>経度</TableCell>
                          <TableCell>種別</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parseResult.coordinates
                          .slice(0, 10)
                          .map((coord, index) => (
                            <TableRow key={index}>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell>{coord.name}</TableCell>
                              <TableCell>{coord.latitude.toFixed(6)}</TableCell>
                              <TableCell>
                                {coord.longitude.toFixed(6)}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    coord.type === 'polygon_vertex'
                                      ? 'ポリゴン'
                                      : 'WP'
                                  }
                                  size='small'
                                  color={
                                    coord.type === 'polygon_vertex'
                                      ? 'secondary'
                                      : 'primary'
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  {parseResult.coordinates.length > 10 && (
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mt: 1, display: 'block' }}>
                      他{parseResult.coordinates.length - 10}件...
                    </Typography>
                  )}
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasteDialogOpen(false)}>キャンセル</Button>
          <Button
            variant='contained'
            onClick={handleApplyPasteResult}
            disabled={!parseResult?.success}
            startIcon={<AddLocationIcon />}>
            座標を追加
          </Button>
        </DialogActions>
      </Dialog>

      {/* 座標編集ダイアログ */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCancelEdit}
        maxWidth='xs'
        fullWidth>
        <DialogTitle>座標を編集</DialogTitle>
        <DialogContent>
          {editingCoord && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label='地点名'
                value={editingCoord.name}
                onChange={(e) =>
                  setEditingCoord({ ...editingCoord, name: e.target.value })
                }
              />
              <TextField
                fullWidth
                label='緯度'
                type='number'
                value={editingCoord.latitude}
                onChange={(e) =>
                  setEditingCoord({ ...editingCoord, latitude: e.target.value })
                }
                inputProps={{ step: 'any' }}
              />
              <TextField
                fullWidth
                label='経度'
                type='number'
                value={editingCoord.longitude}
                onChange={(e) =>
                  setEditingCoord({
                    ...editingCoord,
                    longitude: e.target.value,
                  })
                }
                inputProps={{ step: 'any' }}
              />
              <FormControl fullWidth>
                <InputLabel>種別</InputLabel>
                <Select
                  value={editingCoord.type}
                  label='種別'
                  onChange={(e) =>
                    setEditingCoord({
                      ...editingCoord,
                      type: e.target.value as CoordinateData['type'],
                    })
                  }>
                  <MenuItem value='polygon_vertex'>ポリゴン頂点</MenuItem>
                  <MenuItem value='waypoint'>ウェイポイント</MenuItem>
                  <MenuItem value='takeoff'>離陸地点</MenuItem>
                  <MenuItem value='landing'>着陸地点</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>キャンセル</Button>
          <Button variant='contained' onClick={handleSaveEdit}>
            保存
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UTMCoordinateInputPanel
