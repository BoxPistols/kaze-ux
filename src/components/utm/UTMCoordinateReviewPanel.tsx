/**
 * UTM座標確認・インポートパネル
 *
 * 外部で取得した座標データの確認、アップロード、ゾーンチェックを行う
 * 地図上での描画は行わず、確認・バリデーションに特化
 */

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import ErrorIcon from '@mui/icons-material/Error'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import InfoIcon from '@mui/icons-material/Info'
import MapIcon from '@mui/icons-material/Map'
import PlaceIcon from '@mui/icons-material/Place'
import VerifiedIcon from '@mui/icons-material/Verified'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  alpha,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Card,
} from '@mui/material'
import { useState, useCallback, useRef, useMemo, memo, useEffect } from 'react'
import Map, {
  NavigationControl,
  Source,
  Layer,
  Marker,
} from 'react-map-gl/maplibre'

import 'maplibre-gl/dist/maplibre-gl.css'

import {
  LayerControlPanel,
  RestrictionMapLayers,
} from '@/components/utm/components'
import { useRestrictionLayers, useKeyboardShortcuts } from '@/lib/map/hooks'
import type { LayerVisibility, GeoJsonData } from '@/lib/map/hooks'
import type { CoordinateData, CoordinateFormat } from '@/types/utmTypes'

import type { LineLayer, FillLayer, MapRef } from 'react-map-gl/maplibre'

// ============================================
// Types
// ============================================

/** ゾーンチェック結果 */
interface ZoneCheckStatus {
  coordinateIndex: number
  inDID: boolean
  inRedZone: boolean
  inYellowZone: boolean
  nearAirport: boolean
  airportName?: string
  facilityName?: string
  severity: 'safe' | 'caution' | 'warning' | 'prohibited'
  message: string
}

/** インポートファイル形式 */
type ImportFileType = 'kml' | 'kmz' | 'geojson' | 'csv' | 'excel' | 'dji'

/** インポート結果 */
interface ImportResult {
  success: boolean
  coordinates: CoordinateData[]
  errors: string[]
  warnings: string[]
  fileType: ImportFileType
  fileName: string
}

/** バリデーション結果 */
interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  zoneChecks: ZoneCheckStatus[]
}

// ============================================
// Props
// ============================================

interface UTMCoordinateReviewPanelProps {
  /** 座標データ */
  coordinates: CoordinateData[]
  /** 座標データ変更コールバック */
  onCoordinatesChange: (coordinates: CoordinateData[]) => void
  /** 読み取り専用モード */
  readOnly?: boolean
  /** ローディング状態 */
  loading?: boolean
  /** 制限区域レイヤーを表示するか */
  showRestrictionLayers?: boolean
  /** バリデーション結果コールバック */
  onValidationComplete?: (result: ValidationResult) => void
}

// ============================================
// 地図コンポーネント（memo化）
// ============================================

interface ReviewMapProps {
  mapRef: React.RefObject<MapRef>
  initialViewState: { latitude: number; longitude: number; zoom: number }
  coordinates: CoordinateData[]
  polygonGeoJSON: GeoJSON.Feature | null
  polygonLineGeoJSON: GeoJSON.Feature | null
  waypointLineGeoJSON: GeoJSON.Feature | null
  polygonFillLayer: FillLayer
  polygonLineLayer: LineLayer
  waypointLineLayer: LineLayer
  zoneChecks: ZoneCheckStatus[]
  showRestrictionLayers?: boolean
  restrictionVisibility?: LayerVisibility
  restrictionGeoJsonData?: GeoJsonData
}

const ReviewMap = memo(function ReviewMap({
  mapRef,
  initialViewState,
  coordinates,
  polygonGeoJSON,
  polygonLineGeoJSON,
  waypointLineGeoJSON,
  polygonFillLayer,
  polygonLineLayer,
  waypointLineLayer,
  zoneChecks,
  showRestrictionLayers,
  restrictionVisibility,
  restrictionGeoJsonData,
}: ReviewMapProps) {
  // ゾーンチェック結果からマーカー色を取得
  const getMarkerColor = (index: number, type: CoordinateData['type']) => {
    const check = zoneChecks.find((c) => c.coordinateIndex === index)
    if (check) {
      switch (check.severity) {
        case 'prohibited':
          return '#F44336' // 赤
        case 'warning':
          return '#FF9800' // オレンジ
        case 'caution':
          return '#FFC107' // 黄
        default:
          break
      }
    }
    // デフォルト色
    if (type === 'polygon_vertex') return '#9C27B0' // 紫
    if (type === 'takeoff') return '#4CAF50' // 緑
    if (type === 'landing') return '#FF9800' // オレンジ
    return '#2196F3' // 青
  }

  return (
    <Map
      ref={mapRef}
      initialViewState={initialViewState}
      style={{ width: '100%', height: '100%' }}
      mapStyle='https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
      cursor='default'>
      <NavigationControl position='top-right' />

      {/* 制限区域レイヤー */}
      {showRestrictionLayers &&
        restrictionVisibility &&
        restrictionGeoJsonData && (
          <RestrictionMapLayers
            visibility={restrictionVisibility}
            geoJsonData={restrictionGeoJsonData}
          />
        )}

      {/* ポリゴン塗りつぶし */}
      {polygonGeoJSON && (
        <Source id='polygon' type='geojson' data={polygonGeoJSON}>
          <Layer {...polygonFillLayer} />
        </Source>
      )}

      {/* ポリゴン境界線 */}
      {polygonLineGeoJSON && (
        <Source id='polygon-line' type='geojson' data={polygonLineGeoJSON}>
          <Layer {...polygonLineLayer} />
        </Source>
      )}

      {/* ウェイポイント経路線 */}
      {waypointLineGeoJSON && (
        <Source id='waypoint-line' type='geojson' data={waypointLineGeoJSON}>
          <Layer {...waypointLineLayer} />
        </Source>
      )}

      {/* マーカー（確認用・ドラッグ不可） */}
      {coordinates.map((coord, index) => (
        <Marker
          key={`coord-${index}`}
          latitude={coord.latitude}
          longitude={coord.longitude}
          anchor='bottom'>
          <Tooltip title={coord.name || `ポイント ${index + 1}`} arrow>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: getMarkerColor(index, coord.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
                border: '2px solid white',
              }}>
              <Typography
                variant='caption'
                sx={{ color: 'white', fontWeight: 700, fontSize: '0.65rem' }}>
                {index + 1}
              </Typography>
            </Box>
          </Tooltip>
        </Marker>
      ))}
    </Map>
  )
})

// ============================================
// ユーティリティ関数
// ============================================

const formatDecimal = (value: number): string => value.toFixed(6)

const formatDMS = (value: number, isLat: boolean): string => {
  const abs = Math.abs(value)
  const degrees = Math.floor(abs)
  const minutes = Math.floor((abs - degrees) * 60)
  const seconds = ((abs - degrees) * 60 - minutes) * 60
  const direction = isLat ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W'
  return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`
}

// ============================================
// メインコンポーネント
// ============================================

const UTMCoordinateReviewPanel = ({
  coordinates,
  onCoordinatesChange,
  readOnly = false,
  loading: externalLoading = false,
  showRestrictionLayers = true,
  onValidationComplete,
}: UTMCoordinateReviewPanelProps) => {
  const theme = useTheme()
  const mapRef = useRef<MapRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 状態管理
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [displayFormat, setDisplayFormat] =
    useState<CoordinateFormat>('decimal')
  const [validating, setValidating] = useState(false)
  const [zoneChecks, setZoneChecks] = useState<ZoneCheckStatus[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)

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
      did: true,
    },
  })

  // キーボードショートカット
  useKeyboardShortcuts({
    onToggleLayer: toggleRestrictionLayer,
    onToggleAllLayers: toggleAllRestrictionLayers,
    enabled: showRestrictionLayers,
  })

  // 地図初期状態
  const initialViewState = useMemo(() => {
    if (coordinates.length > 0) {
      // 座標の中心を計算
      const lats = coordinates.map((c) => c.latitude)
      const lngs = coordinates.map((c) => c.longitude)
      return {
        latitude: (Math.max(...lats) + Math.min(...lats)) / 2,
        longitude: (Math.max(...lngs) + Math.min(...lngs)) / 2,
        zoom: 12,
      }
    }
    return { latitude: 35.6812, longitude: 139.7671, zoom: 10 }
  }, [coordinates])

  // ポリゴン頂点とウェイポイントを分離
  const polygonVertices = useMemo(
    () => coordinates.filter((c) => c.type === 'polygon_vertex'),
    [coordinates]
  )
  const waypointCoordinates = useMemo(
    () => coordinates.filter((c) => c.type !== 'polygon_vertex'),
    [coordinates]
  )

  // GeoJSONデータ生成
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

  // 地図を指定座標に移動
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

  // 座標を全て表示するようにフィット
  const fitToCoordinates = useCallback(() => {
    if (coordinates.length === 0) return
    const lats = coordinates.map((c) => c.latitude)
    const lngs = coordinates.map((c) => c.longitude)
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ]
    mapRef.current?.fitBounds(bounds, { padding: 50, duration: 1000 })
  }, [coordinates])

  // ゾーンチェック実行
  const performZoneCheck = useCallback(async () => {
    if (coordinates.length === 0) return

    setValidating(true)
    const checks: ZoneCheckStatus[] = []

    // 各座標に対してゾーンチェック（モック実装）
    for (let i = 0; i < coordinates.length; i++) {
      const coord = coordinates[i]

      // 仮のゾーンチェックロジック（実際にはサービスを呼び出す）
      const inDID = coord.latitude > 35.5 && coord.latitude < 35.8
      const nearAirport = coord.longitude > 139.7 && coord.longitude < 139.85
      const inRedZone = false
      const inYellowZone = nearAirport

      let severity: ZoneCheckStatus['severity'] = 'safe'
      let message = '制限なし'

      if (inRedZone) {
        severity = 'prohibited'
        message = '飛行禁止区域内'
      } else if (nearAirport) {
        severity = 'warning'
        message = '空港周辺・要許可'
      } else if (inDID) {
        severity = 'caution'
        message = 'DID区域内'
      }

      checks.push({
        coordinateIndex: i,
        inDID,
        inRedZone,
        inYellowZone,
        nearAirport,
        severity,
        message,
      })
    }

    setZoneChecks(checks)
    setValidating(false)

    // バリデーション結果をコールバック
    if (onValidationComplete) {
      const errors = checks
        .filter((c) => c.severity === 'prohibited')
        .map((c) => `座標${c.coordinateIndex + 1}: ${c.message}`)
      const warnings = checks
        .filter((c) => c.severity === 'warning' || c.severity === 'caution')
        .map((c) => `座標${c.coordinateIndex + 1}: ${c.message}`)

      onValidationComplete({
        isValid: errors.length === 0,
        errors,
        warnings,
        zoneChecks: checks,
      })
    }
  }, [coordinates, onValidationComplete])

  // 座標変更時に自動でゾーンチェック
  useEffect(() => {
    if (coordinates.length > 0) {
      performZoneCheck()
    } else {
      setZoneChecks([])
    }
  }, [coordinates, performZoneCheck])

  // ファイルインポート処理
  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const fileName = file.name.toLowerCase()
      let fileType: ImportFileType = 'csv'

      if (fileName.endsWith('.kml')) fileType = 'kml'
      else if (fileName.endsWith('.kmz')) fileType = 'kmz'
      else if (fileName.endsWith('.geojson') || fileName.endsWith('.json'))
        fileType = 'geojson'
      else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls'))
        fileType = 'excel'

      // モックインポート結果
      const mockCoordinates: CoordinateData[] = [
        {
          latitude: 35.685,
          longitude: 139.76,
          name: '飛行区域 起点',
          type: 'polygon_vertex',
          order: 0,
        },
        {
          latitude: 35.69,
          longitude: 139.78,
          name: '飛行区域 頂点B',
          type: 'polygon_vertex',
          order: 1,
        },
        {
          latitude: 35.675,
          longitude: 139.785,
          name: '飛行区域 頂点C',
          type: 'polygon_vertex',
          order: 2,
        },
        {
          latitude: 35.67,
          longitude: 139.765,
          name: '飛行区域 頂点D',
          type: 'polygon_vertex',
          order: 3,
        },
        {
          latitude: 35.68,
          longitude: 139.77,
          name: '緊急着陸地点（港湾管理棟前）',
          type: 'landing',
          order: 4,
        },
      ]

      setImportResult({
        success: true,
        coordinates: mockCoordinates,
        errors: [],
        warnings: ['一部の高度情報が欠落しています'],
        fileType,
        fileName: file.name,
      })

      // インポート結果を座標に反映
      onCoordinatesChange(mockCoordinates)

      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [onCoordinatesChange]
  )

  // マップからポリゴンをインポート
  const handleImportFromMap = useCallback(() => {
    const savedPolygons = localStorage.getItem('drone_waypoint_polygons')
    if (!savedPolygons) {
      setImportResult({
        success: false,
        coordinates: [],
        errors: ['マップで描画されたポリゴンがありません'],
        warnings: [],
        fileType: 'geojson',
        fileName: 'マップ',
      })
      return
    }

    try {
      const polygons = JSON.parse(savedPolygons) as Array<{
        id: string
        name: string
        geometry: { type: string; coordinates: number[][][] }
        color?: string
      }>

      if (polygons.length === 0) {
        setImportResult({
          success: false,
          coordinates: [],
          errors: ['マップで描画されたポリゴンがありません'],
          warnings: [],
          fileType: 'geojson',
          fileName: 'マップ',
        })
        return
      }

      // 最新のポリゴンを使用
      const selectedPolygon = polygons[polygons.length - 1]
      const coords = selectedPolygon.geometry.coordinates[0]

      // CoordinateData[] に変換
      const newCoordinates: CoordinateData[] = coords
        .slice(0, -1) // 閉じたポリゴンの最後の座標（最初と同じ）を除外
        .map((coord, index) => ({
          latitude: coord[1],
          longitude: coord[0],
          name:
            index === 0
              ? '飛行区域 起点'
              : `飛行区域 頂点${String.fromCharCode(65 + index)}`,
          type: 'polygon_vertex' as const,
          order: index,
        }))

      setImportResult({
        success: true,
        coordinates: newCoordinates,
        errors: [],
        warnings:
          polygons.length > 1
            ? [
                `${polygons.length}個のポリゴンのうち、最新の「${selectedPolygon.name}」を取り込みました`,
              ]
            : [],
        fileType: 'geojson',
        fileName: `マップ: ${selectedPolygon.name}`,
      })

      onCoordinatesChange(newCoordinates)
    } catch {
      setImportResult({
        success: false,
        coordinates: [],
        errors: ['ポリゴンデータの読み込みに失敗しました'],
        warnings: [],
        fileType: 'geojson',
        fileName: 'マップ',
      })
    }
  }, [onCoordinatesChange])

  // 座標削除
  const handleRemoveCoordinate = useCallback(
    (index: number) => {
      const updated = coordinates.filter((_, i) => i !== index)
      onCoordinatesChange(updated.map((c, i) => ({ ...c, order: i })))
    },
    [coordinates, onCoordinatesChange]
  )

  // 全座標削除
  const handleClearAll = useCallback(() => {
    onCoordinatesChange([])
    setZoneChecks([])
    setImportResult(null)
  }, [onCoordinatesChange])

  // クリップボードにコピー
  const handleCopyCoordinates = useCallback(() => {
    const text = coordinates
      .map(
        (c, i) =>
          `${i + 1}\t${c.name || ''}\t${formatDecimal(c.latitude)}\t${formatDecimal(c.longitude)}`
      )
      .join('\n')
    navigator.clipboard.writeText(text)
  }, [coordinates])

  // GeoJSONエクスポート
  const handleExportGeoJSON = useCallback(() => {
    const geojson = {
      type: 'FeatureCollection',
      features: coordinates.map((c, i) => ({
        type: 'Feature',
        properties: { name: c.name, type: c.type, order: i },
        geometry: {
          type: 'Point',
          coordinates: [c.longitude, c.latitude],
        },
      })),
    }
    const blob = new Blob([JSON.stringify(geojson, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flight_area_coordinates.geojson'
    a.click()
    URL.revokeObjectURL(url)
  }, [coordinates])

  // バリデーションサマリー
  const validationSummary = useMemo(() => {
    const safe = zoneChecks.filter((c) => c.severity === 'safe').length
    const caution = zoneChecks.filter((c) => c.severity === 'caution').length
    const warning = zoneChecks.filter((c) => c.severity === 'warning').length
    const prohibited = zoneChecks.filter(
      (c) => c.severity === 'prohibited'
    ).length
    return { safe, caution, warning, prohibited }
  }, [zoneChecks])

  // ゾーンチェック結果のアイコンを取得
  const getZoneCheckIcon = (severity: ZoneCheckStatus['severity']) => {
    switch (severity) {
      case 'prohibited':
        return <ErrorIcon sx={{ fontSize: 16, color: 'error.main' }} />
      case 'warning':
        return <WarningAmberIcon sx={{ fontSize: 16, color: 'warning.main' }} />
      case 'caution':
        return <InfoIcon sx={{ fontSize: 16, color: 'info.main' }} />
      default:
        return <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
    }
  }

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
          <VerifiedIcon color='primary' />
          <Typography variant='h6' fontWeight={600}>
            座標確認
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
        {/* 左カラム: インポート・座標リスト・バリデーション */}
        <Paper
          elevation={0}
          sx={{
            width: isFullscreen ? 420 : 380,
            minWidth: isFullscreen ? 420 : 380,
            borderRight: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {/* ファイルインポート */}
            <Accordion
              defaultExpanded
              sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
                <Typography variant='subtitle2' fontWeight={600}>
                  <FileUploadIcon
                    sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }}
                  />
                  ファイルインポート
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0 }}>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.kml,.kmz,.geojson,.json,.csv,.xlsx,.xls'
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
                <Stack direction='row' spacing={1}>
                  <Button
                    variant='outlined'
                    fullWidth
                    onClick={() => fileInputRef.current?.click()}
                    startIcon={<FileUploadIcon />}
                    disabled={readOnly}>
                    ファイルを選択
                  </Button>
                  <Button
                    variant='outlined'
                    fullWidth
                    onClick={handleImportFromMap}
                    startIcon={<MapIcon />}
                    disabled={readOnly}>
                    マップから取込
                  </Button>
                </Stack>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'block', mt: 1 }}>
                  対応形式: KML, KMZ, GeoJSON, CSV, Excel /
                  マップで描画したポリゴン
                </Typography>

                {importResult && (
                  <Alert
                    severity={importResult.success ? 'success' : 'error'}
                    sx={{ mt: 1.5 }}>
                    <Typography variant='caption'>
                      {importResult.success
                        ? `${importResult.fileName}から${importResult.coordinates.length}件の座標を読み込みました`
                        : importResult.errors[0]}
                    </Typography>
                    {importResult.warnings.length > 0 && (
                      <Typography
                        variant='caption'
                        display='block'
                        color='text.secondary'>
                        {importResult.warnings[0]}
                      </Typography>
                    )}
                  </Alert>
                )}
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 2 }} />

            {/* バリデーション結果サマリー */}
            {coordinates.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant='subtitle2' fontWeight={600} sx={{ mb: 1 }}>
                  <MapIcon
                    sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }}
                  />
                  ゾーンチェック結果
                </Typography>

                {validating ? (
                  <LinearProgress sx={{ my: 2 }} />
                ) : (
                  <Stack direction='row' spacing={1} sx={{ mb: 1.5 }}>
                    <Chip
                      icon={<CheckCircleIcon />}
                      label={`安全 ${validationSummary.safe}`}
                      size='small'
                      color='success'
                      variant='outlined'
                    />
                    <Chip
                      icon={<InfoIcon />}
                      label={`注意 ${validationSummary.caution}`}
                      size='small'
                      color='info'
                      variant='outlined'
                    />
                    <Chip
                      icon={<WarningAmberIcon />}
                      label={`警告 ${validationSummary.warning}`}
                      size='small'
                      color='warning'
                      variant='outlined'
                    />
                    {validationSummary.prohibited > 0 && (
                      <Chip
                        icon={<ErrorIcon />}
                        label={`禁止 ${validationSummary.prohibited}`}
                        size='small'
                        color='error'
                        variant='outlined'
                      />
                    )}
                  </Stack>
                )}

                {validationSummary.prohibited > 0 && (
                  <Alert severity='error' sx={{ mb: 1 }}>
                    <Typography variant='caption'>
                      飛行禁止区域に含まれる座標があります。計画を見直してください。
                    </Typography>
                  </Alert>
                )}

                {validationSummary.warning > 0 && (
                  <Alert severity='warning' sx={{ mb: 1 }}>
                    <Typography variant='caption'>
                      許可申請が必要な区域があります。
                    </Typography>
                  </Alert>
                )}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* 座標リスト */}
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 1 }}>
              <Typography variant='subtitle2' fontWeight={600}>
                登録済み座標
              </Typography>
              {coordinates.length > 0 && !readOnly && (
                <Button
                  size='small'
                  color='error'
                  variant='text'
                  onClick={handleClearAll}
                  sx={{ fontSize: '0.7rem', py: 0 }}>
                  全削除
                </Button>
              )}
            </Stack>

            {coordinates.length === 0 ? (
              <Card
                variant='outlined'
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}>
                <FileUploadIcon
                  sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
                />
                <Typography variant='body2' color='text.secondary'>
                  ファイルをアップロードして
                  <br />
                  座標データを読み込んでください
                </Typography>
              </Card>
            ) : (
              <TableContainer
                sx={{ maxHeight: 320, maxWidth: '100%', overflow: 'auto' }}>
                <Table size='small' stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ py: 0.5, width: 36 }}>#</TableCell>
                      <TableCell sx={{ py: 0.5 }}>名前</TableCell>
                      <TableCell sx={{ py: 0.5, width: 28 }} />
                      <TableCell sx={{ py: 0.5, width: 70 }} align='right'>
                        操作
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {coordinates.map((coord, index) => {
                      const check = zoneChecks.find(
                        (c) => c.coordinateIndex === index
                      )
                      return (
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
                          <TableCell sx={{ py: 0.5 }}>
                            <Typography variant='caption' noWrap>
                              {coord.name || `ポイント ${index + 1}`}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'
                              display='block'
                              sx={{ fontSize: '0.65rem' }}>
                              {displayFormat === 'decimal'
                                ? `${formatDecimal(coord.latitude)}, ${formatDecimal(coord.longitude)}`
                                : `${formatDMS(coord.latitude, true)}, ${formatDMS(coord.longitude, false)}`}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 0.5 }}>
                            {check && (
                              <Tooltip title={check.message}>
                                {getZoneCheckIcon(check.severity)}
                              </Tooltip>
                            )}
                          </TableCell>
                          <TableCell sx={{ py: 0.5 }} align='right'>
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
                              {!readOnly && (
                                <Tooltip title='削除'>
                                  <IconButton
                                    size='small'
                                    color='error'
                                    onClick={() =>
                                      handleRemoveCoordinate(index)
                                    }>
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* エクスポート */}
            {coordinates.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Stack direction='row' spacing={1}>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<DownloadIcon />}
                    onClick={handleExportGeoJSON}>
                    GeoJSON出力
                  </Button>
                  <Button
                    size='small'
                    variant='outlined'
                    startIcon={<ContentCopyIcon />}
                    onClick={handleCopyCoordinates}>
                    コピー
                  </Button>
                </Stack>
              </Box>
            )}
          </Box>
        </Paper>

        {/* 右カラム: 地図（確認専用） */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {externalLoading && <LinearProgress />}

          <ReviewMap
            mapRef={mapRef}
            initialViewState={initialViewState}
            coordinates={coordinates}
            polygonGeoJSON={polygonGeoJSON}
            polygonLineGeoJSON={polygonLineGeoJSON}
            waypointLineGeoJSON={waypointLineGeoJSON}
            polygonFillLayer={polygonFillLayer}
            polygonLineLayer={polygonLineLayer}
            waypointLineLayer={waypointLineLayer}
            zoneChecks={zoneChecks}
            showRestrictionLayers={showRestrictionLayers}
            restrictionVisibility={restrictionVisibility}
            restrictionGeoJsonData={restrictionGeoJsonData}
          />

          {/* 制限区域レイヤーコントロール */}
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

          {/* 全座標表示ボタン */}
          {coordinates.length > 0 && (
            <Tooltip title='全座標を表示'>
              <IconButton
                onClick={fitToCoordinates}
                sx={{
                  position: 'absolute',
                  bottom: 16,
                  right: 16,
                  bgcolor: alpha(theme.palette.background.paper, 0.95),
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: theme.palette.background.paper },
                }}>
                <MapIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* 確認モード表示 */}
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
              確認モード（編集不可）
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default UTMCoordinateReviewPanel
