import Battery60Icon from '@mui/icons-material/Battery60'
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'
import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import FlightIcon from '@mui/icons-material/Flight'
import HeightIcon from '@mui/icons-material/Height'
import HomeIcon from '@mui/icons-material/Home'
import LayersIcon from '@mui/icons-material/Layers'
import MapIcon from '@mui/icons-material/Map'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import SpeedIcon from '@mui/icons-material/Speed'
import WarningIcon from '@mui/icons-material/Warning'
import ZoomInMapIcon from '@mui/icons-material/ZoomInMap'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  LinearProgress,
  alpha,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  GlobalStyles,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
  memo,
} from 'react'
import { createPortal } from 'react-dom'
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl/maplibre'

import 'maplibre-gl/dist/maplibre-gl.css'
import { useRestrictionLayers, useKeyboardShortcuts } from '@/lib/map/hooks'
import { colors } from '@/styles/tokens'
import { getDroneDisplayColor } from '@/utils'

import { LayerControlPanel, RestrictionMapLayers } from './components'

import type {
  DroneFlightStatus,
  RestrictedZone,
  UTMAlert,
  FlightArea,
} from '../../types/utmTypes'
import type { MapRef } from 'react-map-gl/maplibre'

type LngLat = readonly [number, number]

// 空のGeoJSON FeatureCollection（Source/Layerの安定化用）
const EMPTY_FEATURE_COLLECTION = {
  type: 'FeatureCollection' as const,
  features: [] as never[],
}

// バッテリーアイコン（コンポーネント外で定義）
const getBatteryIcon = (level: number) => {
  if (level > 60)
    return <BatteryFullIcon sx={{ color: colors.success.main, fontSize: 16 }} />
  if (level > 20)
    return <Battery60Icon sx={{ color: colors.warning.main, fontSize: 16 }} />
  return <BatteryAlertIcon sx={{ color: colors.error.main, fontSize: 16 }} />
}

/** ドローンマーカーの色を取得 */
const getMarkerColor = (
  status: DroneFlightStatus['status'],
  hasUnacknowledgedAlert: boolean,
  baseColor: string
): string => {
  if (hasUnacknowledgedAlert || status === 'emergency') {
    return colors.error.main
  }
  switch (status) {
    case 'rth':
      return colors.error.main
    case 'hovering':
      return colors.warning.main
    default:
      return baseColor
  }
}

const isSameLngLat = (a: LngLat, b: LngLat): boolean =>
  a[0] === b[0] && a[1] === b[1]

/**
 * 巡回前提のため、経路が閉じていなければ始点を終点に追加して閉ループ化する。
 * （実データが往路のみの場合でも、UI上は「戻る」前提の見え方に合わせる）
 */
const ensureLoopWaypoints = (waypoints: readonly LngLat[]): LngLat[] => {
  if (waypoints.length < 2) return [...waypoints]
  const first = waypoints[0]
  const last = waypoints[waypoints.length - 1]
  if (isSameLngLat(first, last)) return [...waypoints]
  return [...waypoints, first]
}

/**
 * 2点の緯度経度から方位角（0-360, 北=0, 時計回り）を算出する。
 * ドローンのheadingが実移動とズレるケースに備え、位置変化から見かけの進行方向を得る。
 */
const calcBearingDegrees = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI
  const lat1 = toRad(from.lat)
  const lat2 = toRad(to.lat)
  const dLon = toRad(to.lng - from.lng)
  const y = Math.sin(dLon) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon)
  const brng = toDeg(Math.atan2(y, x))
  return (brng + 360) % 360
}

/**
 * LineString（緯度経度）を、幅（m）を持つコリドーPolygonへ近似変換する。
 * 小領域（市区町村スケール）を前提に、equirectangular近似でローカル平面に落としてオフセットを生成する。
 *
 * パフォーマンス最適化版:
 * - 中間配列の事前サイズ確保
 * - slice().reverse()の削除
 * - 座標変換の統合
 */
const buildCorridorPolygon = (
  waypoints: readonly LngLat[],
  corridorWidthMeters: number
): number[][][] | null => {
  if (waypoints.length < 2) return null

  const looped = ensureLoopWaypoints(waypoints)
  const n = looped.length
  if (n < 3) return null

  const halfWidth = Math.max(1, corridorWidthMeters / 2)

  // 平均緯度の計算（ループ1回で完了）
  let sumLat = 0
  for (let i = 0; i < n; i++) {
    sumLat += looped[i][1]
  }
  const avgLat = sumLat / n

  const metersPerDegLat = 111_320
  const metersPerDegLng = metersPerDegLat * Math.cos((avgLat * Math.PI) / 180)

  // 逆変換用の係数を事前計算
  const invMetersPerDegLng = 1 / metersPerDegLng
  const invMetersPerDegLat = 1 / metersPerDegLat

  // ringを直接構築（left + rightの逆順）
  // ringサイズ = n * 2 + 1（クローズリング用）
  const ring: number[][] = new Array(n * 2 + 1)

  // 法線計算用のインライン関数
  const calcNormal = (
    ax: number,
    ay: number,
    bx: number,
    by: number
  ): { nx: number; ny: number } => {
    const dx = bx - ax
    const dy = by - ay
    const len = Math.hypot(dx, dy)
    if (len === 0) return { nx: 0, ny: 0 }
    return { nx: -dy / len, ny: dx / len }
  }

  for (let i = 0; i < n; i++) {
    const [lng, lat] = looped[i]
    const currX = lng * metersPerDegLng
    const currY = lat * metersPerDegLat

    // 前後の点を取得
    const [prevLng, prevLat] = looped[Math.max(0, i - 1)]
    const [nextLng, nextLat] = looped[Math.min(n - 1, i + 1)]

    const prevX = prevLng * metersPerDegLng
    const prevY = prevLat * metersPerDegLat
    const nextX = nextLng * metersPerDegLng
    const nextY = nextLat * metersPerDegLat

    // 前後セグメントの法線を計算
    const n1 = calcNormal(prevX, prevY, currX, currY)
    const n2 = calcNormal(currX, currY, nextX, nextY)

    // 平均法線を計算
    let nx = n1.nx + n2.nx
    let ny = n1.ny + n2.ny
    const nLen = Math.hypot(nx, ny)

    if (nLen === 0) {
      // 端点や同一点の場合はフォールバック
      const fallback = i === 0 ? n2 : n1
      const fLen = Math.hypot(fallback.nx, fallback.ny)
      if (fLen === 0) {
        nx = 0
        ny = 0
      } else {
        nx = fallback.nx / fLen
        ny = fallback.ny / fLen
      }
    } else {
      nx /= nLen
      ny /= nLen
    }

    // left側（前方に配置）
    ring[i] = [
      (currX + nx * halfWidth) * invMetersPerDegLng,
      (currY + ny * halfWidth) * invMetersPerDegLat,
    ]

    // right側（逆順で後方に配置）
    ring[n * 2 - 1 - i] = [
      (currX - nx * halfWidth) * invMetersPerDegLng,
      (currY - ny * halfWidth) * invMetersPerDegLat,
    ]
  }

  if (ring.length < 5) return null // 最低4点 + クローズ用1点

  // クローズリング（始点を終点にコピー）
  ring[n * 2] = [ring[0][0], ring[0][1]]

  return [ring]
}

// ズームトグルハンドラー（トグル状態を返す）
type ZoomToggleHandler = () => boolean

// マップスタイル定義
interface MapStyleOption {
  id: string
  name: string
  nameJa: string
  url: string
}

const MAP_STYLES: MapStyleOption[] = [
  {
    id: 'positron',
    name: 'Light',
    nameJa: '標準（ライト）',
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  },
  {
    id: 'dark-matter',
    name: 'Dark',
    nameJa: 'ダーク',
    url: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  },
  {
    id: 'voyager',
    name: 'Voyager',
    nameJa: 'ボイジャー',
    url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  },
]

// マップ操作用のハンドラー
/** ビュー状態の型（getViewState用） */
export interface ViewState {
  latitude: number
  longitude: number
  zoom: number
  pitch: number
  bearing: number
}

export interface MapControlHandler {
  flyTo: (lng: number, lat: number, zoom?: number) => void
  /** マップのリサイズを実行（コンテナサイズ変更後に呼び出す） */
  resize: () => void
  /** ズームアウト状態をリセット */
  resetZoomState: () => void
  /** 指定した境界にフィット */
  fitBounds: (
    bounds: [[number, number], [number, number]],
    options?: { padding?: number; maxZoom?: number; duration?: number }
  ) => void
  /** 現在のビュー状態を取得 */
  getViewState: () => ViewState
  /** ビュー状態を復元 */
  restoreViewState: (state: ViewState, options?: { duration?: number }) => void
  /** 中心位置を補正（リサイズ後のズレを手動で修正） */
  recenter: () => void
  /** 全ドローン・飛行区域を表示（Zキー機能） */
  fitAllDrones: () => boolean
}

interface UTMTrackingMapProps {
  drones: DroneFlightStatus[]
  restrictedZones: RestrictedZone[]
  onDroneClick?: (drone: DroneFlightStatus) => void
  onDroneContextMenu?: (
    drone: DroneFlightStatus,
    event: React.MouseEvent
  ) => void // ドローンを右クリックした時
  onMapClick?: () => void // マップをクリックした時（ドローン以外）
  height?: string | number
  showZones?: boolean
  selectedDroneId?: string | null
  is3DView?: boolean // 3Dビューモード
  leftOffset?: number // 左側のオフセット（サイドバー幅など）
  registerFitAllDronesHandler?: (handler: ZoomToggleHandler | null) => void
  /** アラート一覧（未確認のcritical/emergencyアラートがあるドローンを点滅表示） */
  alerts?: UTMAlert[]
  /** 初期マップスタイルID */
  initialMapStyleId?: string
  /** プロジェクト飛行区域 */
  flightAreas?: FlightArea[]
  /** 飛行区域を表示するか */
  showFlightAreas?: boolean
  /** マップ操作ハンドラーを外部に登録 */
  registerMapControl?: (handler: MapControlHandler | null) => void
  /** 初期中心座標 [経度, 緯度] */
  initialCenter?: [number, number]
  /** 初期ズームレベル */
  initialZoom?: number
  /** マップ読み込み時に飛行区域に自動フィット */
  autoFitBounds?: boolean
  /** 選択エリアにフィット（Zキー）のハンドラ（単一ビュー用） */
  onFitToSelectedProjects?: () => void
  /** 選択中のプロジェクト数（Zキーボタンの有効/無効判定用） */
  selectedProjectCount?: number
  /** 全国全体（全ドローン）を俯瞰表示（Jキー）のハンドラ */
  onFitToAllDronesNationwide?: () => void
  /** Zボタン（このパネルのエリア表示）を表示するか（マルチビュー用） */
  showFitToAreaButton?: boolean
  /** マルチビューパネルとして表示中か（座標オフセット調整用） */
  isMultiViewPanel?: boolean
  /** 制限区域レイヤーを表示するか（空港、飛行禁止区域など） */
  showRestrictionLayers?: boolean
}

// ウェイポイントのハッシュを生成
const hashWaypoints = (waypoints: readonly [number, number][]): string => {
  return waypoints
    .map((wp) => `${wp[0].toFixed(6)},${wp[1].toFixed(6)}`)
    .join('|')
}

// コリドーキャッシュの型
type CorridorCacheType = globalThis.Map<string, number[][][] | null>

const UTMTrackingMapComponent = ({
  drones,
  restrictedZones,
  onDroneClick,
  onDroneContextMenu,
  onMapClick,
  height = '600px',
  showZones = true,
  selectedDroneId,
  is3DView = false,
  leftOffset: _leftOffset = 0,
  registerFitAllDronesHandler,
  alerts = [],
  initialMapStyleId = 'positron',
  flightAreas = [],
  showFlightAreas = true,
  registerMapControl,
  initialCenter,
  initialZoom,
  autoFitBounds = false,
  onFitToSelectedProjects,
  selectedProjectCount = 0,
  onFitToAllDronesNationwide,
  showFitToAreaButton = false,
  isMultiViewPanel = false,
  showRestrictionLayers = false,
}: UTMTrackingMapProps) => {
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

  // キーボードショートカット（制限区域レイヤー用）
  useKeyboardShortcuts({
    onToggleLayer: toggleRestrictionLayer,
    onToggleAllLayers: toggleAllRestrictionLayers,
    enabled: showRestrictionLayers,
  })

  // マップスタイル切り替え
  const [currentMapStyle, setCurrentMapStyle] = useState<MapStyleOption>(
    () => MAP_STYLES.find((s) => s.id === initialMapStyleId) || MAP_STYLES[0]
  )
  const [mapStyleMenuAnchor, setMapStyleMenuAnchor] =
    useState<null | HTMLElement>(null)
  const isMapStyleMenuOpen = Boolean(mapStyleMenuAnchor)

  const handleMapStyleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMapStyleMenuAnchor(event.currentTarget)
  }

  const handleMapStyleMenuClose = () => {
    setMapStyleMenuAnchor(null)
  }

  const handleMapStyleChange = (style: MapStyleOption) => {
    setCurrentMapStyle(style)
    handleMapStyleMenuClose()
  }

  // 未確認の重大アラートがあるドローンIDのセット
  const dronesWithUnacknowledgedAlerts = useMemo(() => {
    const droneIds = new Set<string>()
    alerts.forEach((alert) => {
      if (
        !alert.acknowledged &&
        (alert.severity === 'critical' || alert.severity === 'emergency')
      ) {
        droneIds.add(alert.droneId)
      }
    })
    return droneIds
  }, [alerts])
  const lastPositionsRef = useRef<
    Record<string, { lat: number; lng: number; heading: number }>
  >({})

  // コリドーポリゴンのキャッシュ（ドローンID + waypointsのハッシュ -> ポリゴン）
  const corridorCacheRef = useRef<CorridorCacheType | null>(null)
  // キャッシュを遅延初期化
  const getCorridorCache = useCallback((): CorridorCacheType => {
    if (!corridorCacheRef.current) {
      corridorCacheRef.current = new globalThis.Map<
        string,
        number[][][] | null
      >()
    }
    return corridorCacheRef.current
  }, [])
  const [viewState, setViewState] = useState({
    latitude: initialCenter?.[1] ?? 35.65, // 南東寄りに調整
    longitude: initialCenter?.[0] ?? 139.77, // 南東寄りに調整
    zoom: initialZoom ?? 12,
    pitch: 0,
    bearing: 0,
  })

  // onMoveスロットリング用のref（パフォーマンス最適化）
  const lastViewStateUpdateRef = useRef(0)
  const pendingViewStateRef = useRef<typeof viewState | null>(null)
  const rafIdRef = useRef<number | null>(null)

  // スロットリング付きonMoveハンドラー（16ms間隔 = 60fps上限）
  const handleMapMove = useCallback((evt: { viewState: typeof viewState }) => {
    pendingViewStateRef.current = evt.viewState

    // 既にrAFがスケジュールされている場合はスキップ
    if (rafIdRef.current !== null) return

    rafIdRef.current = requestAnimationFrame(() => {
      const now = performance.now()
      const timeSinceLastUpdate = now - lastViewStateUpdateRef.current

      // 16ms以上経過している場合のみ更新（60fps上限）
      if (timeSinceLastUpdate >= 16 && pendingViewStateRef.current) {
        setViewState(pendingViewStateRef.current)
        lastViewStateUpdateRef.current = now
        pendingViewStateRef.current = null
      }
      rafIdRef.current = null
    })
  }, [])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  const [popupInfo, setPopupInfo] = useState<DroneFlightStatus | null>(null)
  const handledSelectedDroneIdRef = useRef<string | null>(null)

  // selectedDroneIdの最新値を保持するref（クロージャ問題回避用）
  const selectedDroneIdRef = useRef<string | null>(selectedDroneId ?? null)
  useEffect(() => {
    selectedDroneIdRef.current = selectedDroneId ?? null
  }, [selectedDroneId])

  // ズームトグル用の状態管理
  const [isZoomedOut, setIsZoomedOut] = useState(false)
  const savedViewStateRef = useRef<typeof viewState | null>(null)

  // マップ読み込み完了フラグ
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // コンテナ参照（ResizeObserver用）
  const containerRef = useRef<HTMLDivElement>(null)

  // コントロールウィジェットのPortal位置を追跡
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)

  // コンテナ位置の更新
  useEffect(() => {
    if (!containerRef.current) return

    const updateRect = () => {
      if (containerRef.current) {
        setContainerRect(containerRef.current.getBoundingClientRect())
      }
    }

    // 初回更新
    updateRect()

    // ResizeObserverで位置変更を監視
    const resizeObserver = new ResizeObserver(updateRect)
    resizeObserver.observe(containerRef.current)

    // スクロールでも更新
    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [])

  // マップロード完了ハンドラ
  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true)
  }, [])

  // ResizeObserverによる自動リサイズ補正
  // 画面分割時などコンテナサイズ変更時に中心軸のズレを自動補正
  useEffect(() => {
    if (!containerRef.current || !mapRef.current) return

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null

    const resizeObserver = new ResizeObserver(() => {
      // デバウンス処理：連続したリサイズイベントをまとめる
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeTimeout = setTimeout(() => {
        if (!mapRef.current) return

        // 現在の中心座標を保存（MapLibre GLのAPIを使用）
        const center = mapRef.current.getCenter()
        const zoom = mapRef.current.getZoom()
        const pitch = mapRef.current.getPitch()
        const bearing = mapRef.current.getBearing()

        // マップをリサイズ
        mapRef.current.resize()

        // 次のフレームでjumpToで中心を復元（リサイズ後のズレを補正）
        requestAnimationFrame(() => {
          if (!mapRef.current) return
          mapRef.current.jumpTo({
            center: [center.lng, center.lat],
            zoom,
            pitch,
            bearing,
          })
        })
      }, 100)
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout)
      }
      resizeObserver.disconnect()
    }
  }, [isMapLoaded])

  // 手動中心補正機能
  // ドローン選択中: そのドローンを中心に表示（現在のズームレベルを維持）
  // 未選択: 全ドローン・飛行区域にフィット（Zと同じ）
  // 注意: selectedDroneIdRef.currentを使用してクロージャ問題を回避
  const handleRecenter = useCallback(() => {
    if (!mapRef.current) return

    // リサイズを実行して現在のコンテナサイズを反映
    mapRef.current.resize()

    // 選択中のドローンがあれば、そのドローンを中心に表示
    // selectedDroneIdRef.currentを使用して最新の値を参照
    const currentSelectedDroneId = selectedDroneIdRef.current
    if (currentSelectedDroneId) {
      const selectedDrone = drones.find(
        (d) => d.droneId === currentSelectedDroneId
      )
      if (selectedDrone) {
        // 現在のズームレベルを取得し、最低でも14を確保
        const currentZoom = mapRef.current.getZoom()
        const targetZoom = Math.max(currentZoom, 14)
        mapRef.current.flyTo({
          center: [
            selectedDrone.position.longitude,
            selectedDrone.position.latitude,
          ],
          zoom: targetZoom,
          duration: 500,
        })
        return
      }
    }

    // 選択中のドローンがない場合は、全ドローン・飛行区域にフィット
    const allLats: number[] = []
    const allLngs: number[] = []

    drones.forEach((d) => {
      allLats.push(d.position.latitude)
      allLngs.push(d.position.longitude)
    })

    flightAreas.forEach((area) => {
      // coordinates が number[][][] の場合のみ処理
      if (Array.isArray(area.coordinates)) {
        area.coordinates.forEach((ring: number[][]) => {
          ring.forEach((coord: number[]) => {
            allLngs.push(coord[0])
            allLats.push(coord[1])
          })
        })
      }
    })

    if (allLats.length === 0 || allLngs.length === 0) return

    const minLat = Math.min(...allLats)
    const maxLat = Math.max(...allLats)
    const minLng = Math.min(...allLngs)
    const maxLng = Math.max(...allLngs)

    mapRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: 60,
        duration: 500,
        maxZoom: 14,
      }
    )
  }, [drones, flightAreas])

  // 3Dビューモードが変更されたらpitchを調整
  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      pitch: is3DView ? 60 : 0,
      bearing: is3DView ? prev.bearing : 0,
    }))
  }, [is3DView])

  // autoFitBounds: マップ読み込み完了後に飛行区域に自動フィット
  const hasAutoFittedRef = useRef(false)
  useEffect(() => {
    // マップがロードされていない、または既にフィット済みの場合はスキップ
    if (!autoFitBounds || !isMapLoaded || hasAutoFittedRef.current) return
    if (flightAreas.length === 0 && drones.length === 0) return
    if (!mapRef.current) return

    // 飛行区域の境界を計算
    const allLats: number[] = []
    const allLngs: number[] = []

    flightAreas.forEach((area) => {
      // coordinates が number[][][] の場合のみ処理
      if (Array.isArray(area.coordinates)) {
        area.coordinates.forEach((ring: number[][]) => {
          ring.forEach((coord: number[]) => {
            allLngs.push(coord[0])
            allLats.push(coord[1])
          })
        })
      }
    })

    // ドローンの座標も追加
    drones.forEach((d) => {
      allLats.push(d.position.latitude)
      allLngs.push(d.position.longitude)
    })

    if (allLats.length === 0 || allLngs.length === 0) return

    const minLat = Math.min(...allLats)
    const maxLat = Math.max(...allLats)
    const minLng = Math.min(...allLngs)
    const maxLng = Math.max(...allLngs)

    // 中心座標とズームレベルを計算
    const centerLng = (minLng + maxLng) / 2
    const centerLat = (minLat + maxLat) / 2
    const latDiff = maxLat - minLat
    const lngDiff = maxLng - minLng
    const maxDiff = Math.max(latDiff, lngDiff)

    // 概算ズームレベル
    let zoom = 12
    if (maxDiff > 1) zoom = 7
    else if (maxDiff > 0.5) zoom = 8
    else if (maxDiff > 0.2) zoom = 10
    else if (maxDiff > 0.1) zoom = 11
    else if (maxDiff > 0.05) zoom = 12
    else if (maxDiff > 0.02) zoom = 13
    else zoom = 14

    // マルチビューパネル時はsetViewStateを使用（fitBoundsは座標オフセット問題あり）
    if (isMultiViewPanel) {
      // 即座にビューステートを設定（タイミング問題を回避）
      setViewState((prev) => ({
        ...prev,
        longitude: centerLng,
        latitude: centerLat,
        zoom: Math.min(zoom, 14),
      }))
      hasAutoFittedRef.current = true
    } else {
      // 単一ビュー時はfitBoundsを使用
      const fitBoundsAfterRender = () => {
        requestAnimationFrame(() => {
          if (!mapRef.current) return
          mapRef.current.resize()

          requestAnimationFrame(() => {
            if (!mapRef.current) return
            mapRef.current.fitBounds(
              [
                [minLng, minLat],
                [maxLng, maxLat],
              ],
              {
                padding: 60,
                duration: 0,
                maxZoom: 14,
              }
            )
            hasAutoFittedRef.current = true
          })
        })
      }

      // 少し遅延してから実行（DOMの安定を待つ）
      const timeoutId = setTimeout(fitBoundsAfterRender, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [autoFitBounds, isMapLoaded, flightAreas, drones, isMultiViewPanel])

  // selectedDroneIdが変わったらpopupInfoを同期し、マップを滑らかに移動
  // FIXME: マルチビュー時にドローン選択で座標がずれるバグ（handleCenterOnDroneと同様の問題）
  useEffect(() => {
    // 選択解除
    if (!selectedDroneId) {
      handledSelectedDroneIdRef.current = null
      setPopupInfo(null)
      return
    }

    // 既に同じ選択IDは処理済み（ユーザーがポップアップを閉じた場合も再オープンしない）
    if (handledSelectedDroneIdRef.current === selectedDroneId) return

    const selectedDrone = drones.find((d) => d.droneId === selectedDroneId)
    if (!selectedDrone) return

    setPopupInfo(selectedDrone)
    handledSelectedDroneIdRef.current = selectedDroneId

    // ドローン選択時はズームアウト状態フラグのみ解除し、ビューステートは保持する
    setIsZoomedOut(false)

    // マルチビューパネル時はsetViewStateで直接中心を設定（flyToはオフセット問題がある）
    if (isMultiViewPanel) {
      setViewState((prev) => ({
        ...prev,
        longitude: selectedDrone.position.longitude,
        latitude: selectedDrone.position.latitude,
        zoom: 14,
      }))
    } else {
      // 単一ビュー時は滑らかなアニメーション移動
      mapRef.current?.flyTo({
        center: [
          selectedDrone.position.longitude,
          selectedDrone.position.latitude,
        ],
        zoom: 14,
        duration: 800,
        essential: true,
      })
    }
  }, [selectedDroneId, drones, isMultiViewPanel])

  // ポップアップが開いている間は、最新のドローンデータ（位置/速度/バッテリー等）へ追従させる
  useEffect(() => {
    setPopupInfo((prev) => {
      if (!prev) return prev
      const updated = drones.find((d) => d.droneId === prev.droneId)
      return updated ?? null
    })
  }, [drones])

  // 制限区域のGeoJSONデータ（Source/Layer安定化のため常にFeatureCollectionを返す）
  const zonesGeoJSON = useMemo(() => {
    if (!showZones || restrictedZones.length === 0) {
      return EMPTY_FEATURE_COLLECTION
    }

    return {
      type: 'FeatureCollection' as const,
      features: restrictedZones.map((zone) => ({
        type: 'Feature' as const,
        properties: {
          id: zone.id,
          name: zone.name,
          type: zone.type,
          level: zone.level,
          description: zone.description,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: zone.coordinates,
        },
      })),
    }
  }, [restrictedZones, showZones])

  // プロジェクト飛行区域のGeoJSONデータ（Source/Layer安定化のため常にFeatureCollectionを返す）
  const flightAreasGeoJSON = useMemo(() => {
    if (!showFlightAreas || flightAreas.length === 0) {
      return EMPTY_FEATURE_COLLECTION
    }

    return {
      type: 'FeatureCollection' as const,
      features: flightAreas.map((area, index) => ({
        type: 'Feature' as const,
        properties: {
          name: area.name,
          color: area.color || colors.primary[500],
          maxAltitude: area.maxAltitude,
          minAltitude: area.minAltitude,
          index,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: area.coordinates,
        },
      })),
    }
  }, [flightAreas, showFlightAreas])

  // 飛行経路コリドーのGeoJSON（キャッシュ最適化版）
  // waypointsが変わらない限りコリドーポリゴンを再計算しない
  const flightCorridorsGeoJSON = useMemo(() => {
    const dronesWithRoute = drones.filter(
      (
        drone
      ): drone is DroneFlightStatus & {
        plannedRoute: NonNullable<DroneFlightStatus['plannedRoute']>
      } =>
        Boolean(drone.plannedRoute && drone.plannedRoute.waypoints.length >= 2)
    )

    type CorridorFeature = {
      type: 'Feature'
      properties: {
        droneId: string
        droneName: string
        color: string
        corridorWidth: number
      }
      geometry: {
        type: 'Polygon'
        coordinates: number[][][]
      }
    }

    const features: CorridorFeature[] = dronesWithRoute
      .map((drone): CorridorFeature | null => {
        const baseColor = getDroneDisplayColor(
          drone.droneId,
          drone.plannedRoute.color
        ).main
        const corridorWidth = drone.plannedRoute.corridorWidth || 50

        // キャッシュキーを生成
        const cacheKey = `${drone.droneId}:${hashWaypoints(drone.plannedRoute.waypoints)}:${corridorWidth}`

        // キャッシュからコリドーポリゴンを取得、なければ計算してキャッシュ
        const cache = getCorridorCache()
        let polygonCoordinates = cache.get(cacheKey)
        if (polygonCoordinates === undefined) {
          polygonCoordinates = buildCorridorPolygon(
            drone.plannedRoute.waypoints,
            corridorWidth
          )
          cache.set(cacheKey, polygonCoordinates)

          // キャッシュサイズ制限（100件を超えたら古いエントリを削除）
          if (cache.size > 100) {
            const firstKey = cache.keys().next().value
            if (firstKey) cache.delete(firstKey)
          }
        }

        if (!polygonCoordinates) return null
        return {
          type: 'Feature' as const,
          properties: {
            droneId: drone.droneId,
            droneName: drone.droneName,
            color: baseColor,
            corridorWidth,
          },
          geometry: {
            type: 'Polygon' as const,
            coordinates: polygonCoordinates,
          },
        }
      })
      .filter((f): f is NonNullable<(typeof features)[number]> => Boolean(f))

    return {
      type: 'FeatureCollection' as const,
      features,
    }
  }, [drones, getCorridorCache])

  // 位置変化から見かけの進行方向（bearing）を計算し、次回描画のために保持
  useEffect(() => {
    const nextLast = { ...lastPositionsRef.current }
    drones.forEach((drone) => {
      const prev = lastPositionsRef.current[drone.droneId]
      const curr = {
        lat: drone.position.latitude,
        lng: drone.position.longitude,
      }

      let derivedHeading = drone.position.heading
      if (prev) {
        const moved =
          Math.abs(prev.lat - curr.lat) > 0.000001 ||
          Math.abs(prev.lng - curr.lng) > 0.000001
        if (moved) {
          derivedHeading = calcBearingDegrees(
            { lat: prev.lat, lng: prev.lng },
            { lat: curr.lat, lng: curr.lng }
          )
        } else {
          derivedHeading = prev.heading
        }
      }

      nextLast[drone.droneId] = { ...curr, heading: derivedHeading }
    })
    lastPositionsRef.current = nextLast
  }, [drones])

  // 選択されたドローンにフォーカス（滑らかなアニメーション）
  // FIXME: マルチビュー時に機体クリックでフォーカスすると座標が右下にずれるバグ
  // - setViewState使用でも座標オフセットが残る可能性
  // - Mapコンポーネントのサイズ計算に問題がある可能性
  const handleCenterOnDrone = useCallback(
    (drone: DroneFlightStatus) => {
      // マルチビューパネル時はsetViewStateで直接設定
      if (isMultiViewPanel) {
        setViewState((prev) => ({
          ...prev,
          longitude: drone.position.longitude,
          latitude: drone.position.latitude,
          zoom: 15,
        }))
      } else if (mapRef.current) {
        mapRef.current.flyTo({
          center: [drone.position.longitude, drone.position.latitude],
          zoom: 15,
          duration: 1200,
          essential: true,
        })
      }
    },
    [isMultiViewPanel]
  )

  // 全ドローン・飛行区域が見える範囲にズームアウト（トグル対応）
  // 戻り値: true = ズームアウト状態に移行, false = 元のビューに復帰
  // FIXME: マルチビュー時にZボタンを押すと全国俯瞰になってしまうバグ
  // - isMultiViewPanel時のsetViewState使用でも座標オフセットが発生する可能性
  // - fitBoundsのViewport計算がパネルサイズを正しく認識していない可能性
  // - drones/flightAreasが空になっているケースがあるかもしれない
  const handleFitAllDrones = useCallback((): boolean => {
    // トグル: 既にズームアウト状態なら元に戻る
    if (isZoomedOut && savedViewStateRef.current) {
      const saved = savedViewStateRef.current
      // マルチビュー時はsetViewStateを使用（flyToは座標オフセットが発生する）
      if (isMultiViewPanel) {
        setViewState((prev) => ({
          ...prev,
          longitude: saved.longitude,
          latitude: saved.latitude,
          zoom: saved.zoom,
          pitch: saved.pitch,
          bearing: saved.bearing,
        }))
      } else if (mapRef.current) {
        mapRef.current.flyTo({
          center: [saved.longitude, saved.latitude],
          zoom: saved.zoom,
          pitch: saved.pitch,
          bearing: saved.bearing,
          duration: 1200,
          essential: true,
        })
      }
      setIsZoomedOut(false)
      savedViewStateRef.current = null
      return false
    }

    // 境界計算用の座標を収集（ドローン + 飛行区域）
    const allLats: number[] = []
    const allLngs: number[] = []

    // ドローンの座標を追加
    drones.forEach((d) => {
      allLats.push(d.position.latitude)
      allLngs.push(d.position.longitude)
    })

    // 飛行区域の座標を追加
    if (showFlightAreas && flightAreas.length > 0) {
      flightAreas.forEach((area) => {
        area.coordinates.forEach((ring) => {
          ring.forEach((coord) => {
            // GeoJSON形式: [lng, lat]
            allLngs.push(coord[0])
            allLats.push(coord[1])
          })
        })
      })
    }

    // 座標がない場合は何もしない
    if (allLats.length === 0 || allLngs.length === 0) {
      return isZoomedOut
    }

    // 現在のビューを保存
    savedViewStateRef.current = { ...viewState }

    // 境界を計算
    const minLat = Math.min(...allLats)
    const maxLat = Math.max(...allLats)
    const minLng = Math.min(...allLngs)
    const maxLng = Math.max(...allLngs)

    // マルチビュー時はsetViewStateを使用（fitBoundsは座標オフセットが発生する）
    if (isMultiViewPanel) {
      // 中心座標を計算
      const centerLng = (minLng + maxLng) / 2
      const centerLat = (minLat + maxLat) / 2

      // バウンディングボックスからズームレベルを概算
      // 緯度差と経度差から適切なズームを計算
      const latDiff = maxLat - minLat
      const lngDiff = maxLng - minLng
      const maxDiff = Math.max(latDiff, lngDiff)

      // 概算ズームレベル（ピクセル幅を考慮した簡易計算）
      // 経度差0.01度 ≈ zoom 14程度、0.1度 ≈ zoom 11程度
      let zoom = 12
      if (maxDiff > 1) zoom = 7
      else if (maxDiff > 0.5) zoom = 8
      else if (maxDiff > 0.2) zoom = 10
      else if (maxDiff > 0.1) zoom = 11
      else if (maxDiff > 0.05) zoom = 12
      else if (maxDiff > 0.02) zoom = 13
      else zoom = 14

      setViewState((prev) => ({
        ...prev,
        longitude: centerLng,
        latitude: centerLat,
        zoom: Math.min(zoom, 15),
      }))
    } else if (mapRef.current) {
      // 通常モード: fitBoundsを使用して正確にフィット
      const map = mapRef.current
      requestAnimationFrame(() => {
        map.resize()
        requestAnimationFrame(() => {
          map.fitBounds(
            [
              [minLng, minLat], // southwest
              [maxLng, maxLat], // northeast
            ],
            {
              padding: 60, // 対称なpadding
              duration: 1500,
              maxZoom: 15,
            }
          )
        })
      })
    }

    // 選択解除
    setPopupInfo(null)
    onMapClick?.()
    setIsZoomedOut(true)
    return true
  }, [
    drones,
    flightAreas,
    showFlightAreas,
    onMapClick,
    isZoomedOut,
    viewState,
    isMultiViewPanel,
  ])

  useEffect(() => {
    registerFitAllDronesHandler?.(handleFitAllDrones)
    return () => registerFitAllDronesHandler?.(null)
  }, [handleFitAllDrones, registerFitAllDronesHandler])

  // マップ操作ハンドラーを外部に登録
  useEffect(() => {
    if (registerMapControl) {
      const handler: MapControlHandler = {
        flyTo: (lng: number, lat: number, zoom = 12) => {
          mapRef.current?.flyTo({
            center: [lng, lat],
            zoom,
            duration: 1500,
            essential: true,
          })
        },
        resize: () => {
          // リサイズを少し遅延させてDOMの更新を待つ
          setTimeout(() => {
            mapRef.current?.resize()
          }, 100)
        },
        resetZoomState: () => {
          // ズームアウト状態をリセット（モード切替後に正しく動作させるため）
          setIsZoomedOut(false)
          savedViewStateRef.current = null
        },
        fitBounds: (bounds, options = {}) => {
          const { padding = 60, maxZoom = 15, duration = 1500 } = options
          if (!mapRef.current) return
          const map = mapRef.current
          // マルチビュー時はコンテナサイズが正しく取得されるようrequestAnimationFrameを使用
          requestAnimationFrame(() => {
            map.resize()
            requestAnimationFrame(() => {
              map.fitBounds(bounds, {
                padding,
                maxZoom,
                duration,
              })
            })
          })
          // ズームアウト状態をリセット
          setIsZoomedOut(false)
          savedViewStateRef.current = null
        },
        getViewState: () => {
          return { ...viewState }
        },
        restoreViewState: (state, options = {}) => {
          const { duration = 1500 } = options
          mapRef.current?.flyTo({
            center: [state.longitude, state.latitude],
            zoom: state.zoom,
            pitch: state.pitch,
            bearing: state.bearing,
            duration,
            essential: true,
          })
        },
        recenter: handleRecenter,
        fitAllDrones: handleFitAllDrones,
      }
      registerMapControl(handler)
      return () => registerMapControl(null)
    }
  }, [registerMapControl, viewState, handleRecenter, handleFitAllDrones])

  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.75)'
        : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
        : '0 8px 32px rgba(0, 0, 0, 0.12)',
  }

  return (
    <>
      {/* MapLibreのPopup z-indexをグローバルにオーバーライド */}
      <GlobalStyles
        styles={{
          '.maplibregl-popup': {
            zIndex: '100 !important',
          },
          '.maplibregl-popup-content': {
            zIndex: '100 !important',
          },
          '.maplibregl-popup-tip': {
            zIndex: '100 !important',
          },
        }}
      />
      <Box
        ref={containerRef}
        sx={{
          height,
          width: '100%',
          position: 'relative',
          // isolation: isolateで新しいスタッキングコンテキストを作成
          // これにより、コントロールウィジェット(z-index:10000)がMapラッパー(z-index:1)より上に確実に表示される
          isolation: 'isolate',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 4px 24px rgba(0, 0, 0, 0.4)'
              : '0 4px 24px rgba(0, 0, 0, 0.1)',
          // MapLibreのPopupよりコントローラーウィジェットを上に表示するためのCSS
          // !importantを使用してMapLibreのデフォルトスタイルを確実にオーバーライド
          '& .maplibregl-popup, & .maplibregl-popup-content, & .maplibregl-popup-tip':
            {
              zIndex: '100 !important',
            },
          // マップコントロールのz-indexも下げる
          '& .maplibregl-ctrl-top-left, & .maplibregl-ctrl-top-right, & .maplibregl-ctrl-bottom-left, & .maplibregl-ctrl-bottom-right':
            {
              zIndex: '50 !important',
            },
        }}>
        {/* Mapを独自のスタッキングコンテキストにラップ（Popup z-index問題の根本解決） */}
        {/* position: absoluteでレイアウトフローに影響を与えない */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
          }}>
          <Map
            ref={mapRef}
            {...viewState}
            onMove={handleMapMove}
            onLoad={handleMapLoad}
            onClick={() => {
              // マップをクリックしたら選択解除
              setPopupInfo(null)
              onMapClick?.()
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={currentMapStyle.url}>
            {/* 制限区域レイヤー（Source/Layer安定化のため常にマウント） */}
            <Source id='restricted-zones' type='geojson' data={zonesGeoJSON}>
              {/* 禁止区域（赤） */}
              <Layer
                id='zones-prohibited-fill'
                type='fill'
                filter={['==', ['get', 'level'], 'prohibited']}
                paint={{
                  'fill-color': 'rgba(220, 38, 38, 0.3)',
                  'fill-outline-color': '#dc2626',
                }}
              />
              <Layer
                id='zones-prohibited-outline'
                type='line'
                filter={['==', ['get', 'level'], 'prohibited']}
                paint={{
                  'line-color': '#dc2626',
                  'line-width': 2,
                  'line-dasharray': [2, 2],
                }}
              />
              {/* 制限区域（黄） */}
              <Layer
                id='zones-restricted-fill'
                type='fill'
                filter={['==', ['get', 'level'], 'restricted']}
                paint={{
                  'fill-color': 'rgba(234, 179, 8, 0.25)',
                  'fill-outline-color': '#eab308',
                }}
              />
              <Layer
                id='zones-restricted-outline'
                type='line'
                filter={['==', ['get', 'level'], 'restricted']}
                paint={{
                  'line-color': '#eab308',
                  'line-width': 2,
                }}
              />
              {/* 注意区域（青） */}
              <Layer
                id='zones-caution-fill'
                type='fill'
                filter={['==', ['get', 'level'], 'caution']}
                paint={{
                  // 注意区域はドローン色(青系を含む)と誤認しないよう、警告色(黄)で表現する
                  'fill-color': alpha(colors.warning.main, 0.18),
                  'fill-outline-color': colors.warning.main,
                }}
              />
              <Layer
                id='zones-caution-outline'
                type='line'
                filter={['==', ['get', 'level'], 'caution']}
                paint={{
                  'line-color': colors.warning.main,
                  'line-width': 2,
                  'line-dasharray': [2, 2],
                }}
              />
            </Source>

            {/* プロジェクト飛行区域レイヤー（Source/Layer安定化のため常にマウント） */}
            <Source id='flight-areas' type='geojson' data={flightAreasGeoJSON}>
              {/* 飛行区域の塗りつぶし */}
              <Layer
                id='flight-areas-fill'
                type='fill'
                paint={{
                  'fill-color': ['get', 'color'],
                  'fill-opacity': 0.15,
                }}
              />
              {/* 飛行区域のアウトライン */}
              <Layer
                id='flight-areas-outline'
                type='line'
                paint={{
                  'line-color': ['get', 'color'],
                  'line-width': 3,
                  'line-opacity': 0.8,
                }}
              />
            </Source>

            {/* 飛行予定経路コリドー（Source/Layer安定化のため常にマウント） */}
            <Source
              id='flight-corridors'
              type='geojson'
              data={flightCorridorsGeoJSON}>
              {/* コリドー面（巡回経路は線ではなく面として把握） */}
              <Layer
                id='flight-corridor-fill'
                type='fill'
                paint={{
                  'fill-color': ['get', 'color'],
                  'fill-opacity': 0.18,
                }}
              />
              <Layer
                id='flight-corridor-outline'
                type='line'
                paint={{
                  'line-color': ['get', 'color'],
                  'line-width': 2,
                  'line-opacity': 0.7,
                }}
              />
            </Source>

            {/* 制限区域レイヤー（空港、飛行禁止区域、ヘリポートなど） */}
            {showRestrictionLayers && (
              <RestrictionMapLayers
                visibility={restrictionVisibility}
                geoJsonData={restrictionGeoJsonData}
                idPrefix='utm-restriction'
              />
            )}

            {/* ドローンマーカー */}
            {drones.map((drone) => (
              <Marker
                key={drone.droneId}
                latitude={drone.position.latitude}
                longitude={drone.position.longitude}
                anchor='center'
                onClick={(e) => {
                  e.originalEvent.stopPropagation()
                  // マップ内クリック時はhandledSelectedDroneIdRefを先に更新
                  // これにより、useEffectでのsetViewStateをスキップし、座標ずれを回避
                  handledSelectedDroneIdRef.current = drone.droneId
                  setPopupInfo(drone)
                  // ズームアウト状態をリセット
                  setIsZoomedOut(false)
                  onDroneClick?.(drone)
                }}>
                {/* 右クリックハンドラー用のラッパー */}
                <Box
                  onContextMenu={(e: React.MouseEvent) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDroneContextMenu?.(drone, e)
                  }}>
                  <Tooltip title={drone.droneName} arrow>
                    <Box
                      sx={{
                        position: 'relative',
                        cursor: 'pointer',
                        transform: `rotate(${lastPositionsRef.current[drone.droneId]?.heading ?? drone.position.heading}deg)`,
                        transition: 'transform 0.5s ease-out',
                      }}>
                      {/* ドローンアイコン */}
                      {(() => {
                        // 未確認の重大アラートがあるかどうか
                        const hasUnacknowledgedAlert =
                          dronesWithUnacknowledgedAlerts.has(drone.droneId)
                        // 経路色と機体色を一致させる（plannedRoute.colorが優先）
                        const baseColor = getDroneDisplayColor(
                          drone.droneId,
                          drone.plannedRoute?.color
                        ).main
                        // ステータスに応じた色を設定
                        const markerColor = getMarkerColor(
                          drone.status,
                          hasUnacknowledgedAlert,
                          baseColor
                        )
                        // 点滅が必要かどうか（緊急時のみ）
                        const shouldPulse =
                          hasUnacknowledgedAlert || drone.status === 'emergency'
                        return (
                          <>
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: `linear-gradient(145deg, ${markerColor}, ${alpha(markerColor, 0.7)})`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow:
                                  selectedDroneId === drone.droneId
                                    ? `0 0 0 4px ${alpha(colors.primary[400], 0.5)}, 0 6px 20px ${alpha(markerColor, 0.5)}`
                                    : shouldPulse
                                      ? `0 0 0 0 ${colors.error.main}80`
                                      : `0 4px 16px ${alpha(markerColor, 0.4)}`,
                                border: shouldPulse
                                  ? `3px solid ${colors.error.main}`
                                  : selectedDroneId === drone.droneId
                                    ? `3px solid ${colors.primary[200]}`
                                    : '2px solid rgba(255,255,255,0.8)',
                                animation: shouldPulse
                                  ? 'emergencyPulse 1s infinite'
                                  : 'none',
                                '@keyframes emergencyPulse': {
                                  '0%': {
                                    boxShadow: `0 0 0 0 ${colors.error.main}80`,
                                  },
                                  '70%': {
                                    boxShadow: `0 0 0 15px ${colors.error.main}00`,
                                  },
                                  '100%': {
                                    boxShadow: `0 0 0 0 ${colors.error.main}00`,
                                  },
                                },
                              }}>
                              {drone.status === 'hovering' ? (
                                <PauseCircleIcon
                                  sx={{
                                    color: 'white',
                                    fontSize: 22,
                                    filter:
                                      'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                                  }}
                                />
                              ) : drone.status === 'rth' ? (
                                <HomeIcon
                                  sx={{
                                    color: 'white',
                                    fontSize: 22,
                                    filter:
                                      'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                                  }}
                                />
                              ) : (
                                <FlightIcon
                                  sx={{
                                    color: 'white',
                                    fontSize: 22,
                                    filter:
                                      'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                                  }}
                                />
                              )}
                            </Box>
                            {/* 方向インジケーター */}
                            <Box
                              sx={{
                                position: 'absolute',
                                top: -8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 0,
                                height: 0,
                                borderLeft: '7px solid transparent',
                                borderRight: '7px solid transparent',
                                borderBottom: `12px solid ${markerColor}`,
                                filter:
                                  'drop-shadow(0 -2px 4px rgba(0,0,0,0.2))',
                              }}
                            />
                          </>
                        )
                      })()}
                      {/* バッテリー低下警告 */}
                      {drone.batteryLevel < 30 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            background: `linear-gradient(145deg, ${colors.error.main}, ${colors.error.dark})`,
                            borderRadius: '50%',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 2px 8px ${alpha(colors.error.main, 0.5)}`,
                            border: '2px solid white',
                          }}>
                          <WarningIcon sx={{ color: 'white', fontSize: 12 }} />
                        </Box>
                      )}
                    </Box>
                  </Tooltip>
                </Box>
              </Marker>
            ))}

            {/* ドローン情報ポップアップ */}
            <AnimatePresence>
              {popupInfo && (
                <Popup
                  latitude={popupInfo.position.latitude}
                  longitude={popupInfo.position.longitude}
                  anchor='bottom'
                  onClose={() => {
                    setPopupInfo(null)
                    onMapClick?.() // 親コンポーネントにも通知
                  }}
                  closeButton={false}
                  closeOnClick={true}
                  offset={25}
                  style={{ zIndex: 100 }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ duration: 0.2 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        minWidth: 240,
                        ...glassStyle,
                        borderRadius: 2,
                      }}>
                      <Stack spacing={1.5}>
                        {/* ウィジェットタイトル */}
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          fontWeight={600}
                          sx={{ letterSpacing: 0.5, mb: -0.5 }}>
                          機体情報
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Typography
                            variant='subtitle1'
                            fontWeight={700}
                            sx={{
                              background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[400]})`,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}>
                            {popupInfo.droneName}
                          </Typography>
                          <Chip
                            label={
                              popupInfo.status === 'in_flight'
                                ? '飛行中'
                                : popupInfo.status
                            }
                            size='small'
                            sx={{
                              fontWeight: 600,
                              background:
                                popupInfo.status === 'in_flight'
                                  ? `linear-gradient(135deg, ${colors.success.main}, ${colors.success.light})`
                                  : popupInfo.status === 'emergency'
                                    ? `linear-gradient(135deg, ${colors.error.main}, ${colors.error.light})`
                                    : undefined,
                              color:
                                popupInfo.status === 'in_flight' ||
                                popupInfo.status === 'emergency'
                                  ? 'white'
                                  : undefined,
                            }}
                          />
                        </Box>

                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}>
                          パイロット: {popupInfo.pilotName}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            flexWrap: 'wrap',
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}>
                            <HeightIcon
                              sx={{ fontSize: 16, color: colors.primary[500] }}
                            />
                            <Typography variant='body2' fontWeight={600}>
                              {popupInfo.position.altitude.toFixed(0)}m
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}>
                            <SpeedIcon
                              sx={{ fontSize: 16, color: colors.primary[500] }}
                            />
                            <Typography variant='body2' fontWeight={600}>
                              {popupInfo.position.speed.toFixed(1)}m/s
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}>
                          {getBatteryIcon(popupInfo.batteryLevel)}
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant='determinate'
                              value={popupInfo.batteryLevel}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: alpha(theme.palette.divider, 0.2),
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 4,
                                  background:
                                    popupInfo.batteryLevel > 60
                                      ? `linear-gradient(90deg, ${colors.success.main}, ${colors.success.light})`
                                      : popupInfo.batteryLevel > 20
                                        ? `linear-gradient(90deg, ${colors.warning.main}, ${colors.warning.light})`
                                        : `linear-gradient(90deg, ${colors.error.main}, ${colors.error.light})`,
                                },
                              }}
                            />
                          </Box>
                          <Typography variant='body2' fontWeight={600}>
                            {popupInfo.batteryLevel.toFixed(0)}%
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}>
                            <SignalCellularAltIcon
                              sx={{
                                fontSize: 16,
                                color:
                                  popupInfo.signalStrength > 70
                                    ? colors.success.main
                                    : colors.warning.main,
                              }}
                            />
                            <Typography variant='body2'>
                              信号: {popupInfo.signalStrength.toFixed(0)}%
                            </Typography>
                          </Box>
                          <Tooltip
                            title='ドローンを中心に表示'
                            arrow
                            slotProps={{
                              tooltip: {
                                sx: {
                                  bgcolor: 'grey.800',
                                  boxShadow: 'none',
                                },
                              },
                              arrow: {
                                sx: {
                                  color: 'grey.800',
                                },
                              },
                            }}>
                            <IconButton
                              size='small'
                              onClick={() => handleCenterOnDrone(popupInfo)}
                              sx={{
                                bgcolor: alpha(colors.primary[500], 0.1),
                                '&:hover': {
                                  bgcolor: alpha(colors.primary[500], 0.2),
                                },
                              }}>
                              <MyLocationIcon
                                fontSize='small'
                                sx={{ color: colors.primary[500] }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Stack>
                    </Paper>
                  </motion.div>
                </Popup>
              )}
            </AnimatePresence>
          </Map>
        </Box>

        {/* 凡例 - 横並びコンパクト */}
        {showZones && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}>
            <Paper
              elevation={0}
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                py: 1,
                px: 1.5,
                borderRadius: 1.5,
                ...glassStyle,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LayersIcon sx={{ fontSize: 14, color: colors.primary[500] }} />
                <Typography
                  variant='caption'
                  fontWeight={600}
                  color='text.secondary'>
                  区域:
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    background: 'rgba(220,38,38,0.4)',
                    border: '1.5px dashed #dc2626',
                  }}
                />
                <Typography variant='caption' fontWeight={500}>
                  禁止
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    background: 'rgba(234,179,8,0.3)',
                    border: '1.5px solid #eab308',
                  }}
                />
                <Typography variant='caption' fontWeight={500}>
                  要許可
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: 0.5,
                    background: 'rgba(14,165,233,0.25)',
                    border: '1.5px solid #0ea5e9',
                  }}
                />
                <Typography variant='caption' fontWeight={500}>
                  注意
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        )}

        {/* アクティブドローン数表示 - React Portalでdocument.bodyにレンダリング */}
        {/* MapLibreのDOM操作から完全に分離してz-index問題を根本解決 */}
        {typeof document !== 'undefined' &&
          containerRect &&
          createPortal(
            isMultiViewPanel ? (
              <Box
                sx={{
                  position: 'fixed',
                  top: containerRect.top + 8,
                  right: window.innerWidth - containerRect.right + 8,
                  zIndex: 999, // MUI Dialogのz-index(1300)より下にして、ヘルプモーダル等を上に表示
                  pointerEvents: 'auto',
                }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 0.5,
                    px: 0.75,
                    borderRadius: 1.5,
                    ...glassStyle,
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.75,
                    }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: colors.success.main,
                        boxShadow: `0 0 8px ${colors.success.main}`,
                        animation: 'livePulse 2s ease-in-out infinite',
                        '@keyframes livePulse': {
                          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                          '50%': { opacity: 0.6, transform: 'scale(1.2)' },
                        },
                      }}
                    />
                    <FlightIcon
                      sx={{
                        color: colors.success.main,
                        fontSize: 16,
                      }}
                    />
                    <Typography
                      variant='subtitle2'
                      fontWeight={700}
                      sx={{ fontSize: '0.75rem' }}>
                      飛行中:{' '}
                      {drones.filter((d) => d.status === 'in_flight').length}機
                    </Typography>
                    {/* 選択エリア表示ボタン (Z) - 単一ビュー用 */}
                    {onFitToSelectedProjects && (
                      <Tooltip
                        title={
                          selectedProjectCount > 0
                            ? '選択エリア表示 (Z)'
                            : 'プロジェクトを選択してください'
                        }
                        arrow>
                        <span>
                          <IconButton
                            size='small'
                            onClick={onFitToSelectedProjects}
                            disabled={selectedProjectCount === 0}
                            sx={{
                              ml: 0.5,
                              bgcolor: alpha(colors.primary[500], 0.1),
                              '&:hover': {
                                bgcolor: alpha(colors.primary[500], 0.2),
                              },
                              '&.Mui-disabled': {
                                bgcolor: alpha(colors.gray[500], 0.05),
                              },
                            }}>
                            <ZoomInMapIcon
                              sx={{
                                fontSize: 18,
                                color:
                                  selectedProjectCount > 0
                                    ? colors.primary[500]
                                    : colors.gray[400],
                              }}
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    {/* このエリア表示ボタン (Z) - マルチビュー用 */}
                    {showFitToAreaButton && (
                      <Tooltip title='このエリア表示 / 戻る (Z)' arrow>
                        <IconButton
                          size='small'
                          onClick={handleFitAllDrones}
                          sx={{
                            ml: 0.25,
                            p: 0.5,
                            bgcolor: alpha(colors.primary[500], 0.1),
                            '&:hover': {
                              bgcolor: alpha(colors.primary[500], 0.2),
                            },
                          }}>
                          <ZoomInMapIcon
                            sx={{
                              fontSize: 14,
                              color: colors.primary[500],
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* 全ドローン俯瞰ボタン (J) - マルチビュー時（showFitToAreaButton=true）は非表示 */}
                    {!showFitToAreaButton &&
                      (onFitToAllDronesNationwide ? (
                        <Tooltip title='全ドローン俯瞰 / 戻る (J)' arrow>
                          <IconButton
                            size='small'
                            onClick={onFitToAllDronesNationwide}
                            sx={{
                              ml: 0.5,
                              bgcolor: alpha(colors.primary[500], 0.1),
                              '&:hover': {
                                bgcolor: alpha(colors.primary[500], 0.2),
                              },
                            }}>
                            <ZoomOutMapIcon
                              sx={{ fontSize: 18, color: colors.primary[500] }}
                            />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title='全ドローン俯瞰 / 戻る (J)' arrow>
                          <IconButton
                            size='small'
                            onClick={handleFitAllDrones}
                            sx={{
                              ml: 0.5,
                              bgcolor: alpha(colors.primary[500], 0.1),
                              '&:hover': {
                                bgcolor: alpha(colors.primary[500], 0.2),
                              },
                            }}>
                            <ZoomOutMapIcon
                              sx={{ fontSize: 18, color: colors.primary[500] }}
                            />
                          </IconButton>
                        </Tooltip>
                      ))}
                    {/* 中心リセットボタン（手動補正用） */}
                    <Tooltip title='中心位置を補正 (C)' arrow>
                      <IconButton
                        size='small'
                        onClick={handleRecenter}
                        sx={{
                          p: 0.5,
                          bgcolor: alpha(colors.primary[500], 0.1),
                          '&:hover': {
                            bgcolor: alpha(colors.primary[500], 0.2),
                          },
                        }}>
                        <CenterFocusStrongIcon
                          sx={{
                            fontSize: 14,
                            color: colors.primary[500],
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    {/* マップスタイル切り替えボタン */}
                    <Tooltip title='マップスタイル変更' arrow>
                      <IconButton
                        size='small'
                        onClick={handleMapStyleMenuOpen}
                        sx={{
                          p: 0.5,
                          bgcolor: alpha(colors.primary[500], 0.1),
                          '&:hover': {
                            bgcolor: alpha(colors.primary[500], 0.2),
                          },
                        }}>
                        <MapIcon
                          sx={{
                            fontSize: 14,
                            color: colors.primary[500],
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Box>
            ) : (
              <Box
                component={motion.div}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                sx={{
                  position: 'fixed',
                  top: containerRect.top + 20,
                  right: window.innerWidth - containerRect.right + 20,
                  zIndex: 999, // MUI Dialogのz-index(1300)より下にして、ヘルプモーダル等を上に表示
                  pointerEvents: 'auto',
                }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    px: 2.5,
                    borderRadius: 2.5,
                    ...glassStyle,
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                    }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: colors.success.main,
                        boxShadow: `0 0 8px ${colors.success.main}`,
                        animation: 'livePulse 2s ease-in-out infinite',
                        '@keyframes livePulse': {
                          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                          '50%': { opacity: 0.6, transform: 'scale(1.2)' },
                        },
                      }}
                    />
                    <FlightIcon
                      sx={{
                        color: colors.success.main,
                        fontSize: 20,
                      }}
                    />
                    <Typography variant='subtitle2' fontWeight={700}>
                      飛行中:{' '}
                      {drones.filter((d) => d.status === 'in_flight').length}機
                    </Typography>
                    {/* 選択エリア表示ボタン (Z) - 単一ビュー用 */}
                    {onFitToSelectedProjects && (
                      <Tooltip
                        title={
                          selectedProjectCount > 0
                            ? '選択エリア表示 (Z)'
                            : 'プロジェクトを選択してください'
                        }
                        arrow>
                        <span>
                          <IconButton
                            size='small'
                            onClick={onFitToSelectedProjects}
                            disabled={selectedProjectCount === 0}
                            sx={{
                              ml: 0.5,
                              bgcolor: alpha(colors.primary[500], 0.1),
                              '&:hover': {
                                bgcolor: alpha(colors.primary[500], 0.2),
                              },
                              '&.Mui-disabled': {
                                bgcolor: alpha(colors.gray[500], 0.05),
                              },
                            }}>
                            <ZoomInMapIcon
                              sx={{
                                fontSize: 18,
                                color:
                                  selectedProjectCount > 0
                                    ? colors.primary[500]
                                    : colors.gray[400],
                              }}
                            />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    {/* このエリア表示ボタン (Z) - マルチビュー用 */}
                    {showFitToAreaButton && (
                      <Tooltip title='このエリア表示 / 戻る (Z)' arrow>
                        <IconButton
                          size='small'
                          onClick={handleFitAllDrones}
                          sx={{
                            ml: 0.5,
                            bgcolor: alpha(colors.primary[500], 0.1),
                            '&:hover': {
                              bgcolor: alpha(colors.primary[500], 0.2),
                            },
                          }}>
                          <ZoomInMapIcon
                            sx={{
                              fontSize: 18,
                              color: colors.primary[500],
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* 全ドローン俯瞰ボタン (J) - マルチビュー時（showFitToAreaButton=true）は非表示 */}
                    {!showFitToAreaButton &&
                      (onFitToAllDronesNationwide ? (
                        <Tooltip title='全ドローン俯瞰 / 戻る (J)' arrow>
                          <IconButton
                            size='small'
                            onClick={onFitToAllDronesNationwide}
                            sx={{
                              ml: 0.5,
                              bgcolor: alpha(colors.primary[500], 0.1),
                              '&:hover': {
                                bgcolor: alpha(colors.primary[500], 0.2),
                              },
                            }}>
                            <ZoomOutMapIcon
                              sx={{ fontSize: 18, color: colors.primary[500] }}
                            />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title='全ドローン俯瞰 / 戻る (J)' arrow>
                          <IconButton
                            size='small'
                            onClick={handleFitAllDrones}
                            sx={{
                              ml: 0.5,
                              bgcolor: alpha(colors.primary[500], 0.1),
                              '&:hover': {
                                bgcolor: alpha(colors.primary[500], 0.2),
                              },
                            }}>
                            <ZoomOutMapIcon
                              sx={{ fontSize: 18, color: colors.primary[500] }}
                            />
                          </IconButton>
                        </Tooltip>
                      ))}
                    {/* 中心リセットボタン（手動補正用） */}
                    <Tooltip title='中心位置を補正 (C)' arrow>
                      <IconButton
                        size='small'
                        onClick={handleRecenter}
                        sx={{
                          bgcolor: alpha(colors.primary[500], 0.1),
                          '&:hover': {
                            bgcolor: alpha(colors.primary[500], 0.2),
                          },
                        }}>
                        <CenterFocusStrongIcon
                          sx={{
                            fontSize: 18,
                            color: colors.primary[500],
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    {/* マップスタイル切り替えボタン */}
                    <Tooltip title='マップスタイル変更' arrow>
                      <IconButton
                        size='small'
                        onClick={handleMapStyleMenuOpen}
                        sx={{
                          bgcolor: alpha(colors.primary[500], 0.1),
                          '&:hover': {
                            bgcolor: alpha(colors.primary[500], 0.2),
                          },
                        }}>
                        <MapIcon
                          sx={{
                            fontSize: 18,
                            color: colors.primary[500],
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Box>
            ),
            document.body
          )}

        {/* マップスタイル選択メニュー */}
        <Menu
          anchorEl={mapStyleMenuAnchor}
          open={isMapStyleMenuOpen}
          onClose={handleMapStyleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: {
                mt: 1,
                minWidth: 180,
                ...glassStyle,
              },
            },
          }}>
          {MAP_STYLES.map((style) => (
            <MenuItem
              key={style.id}
              onClick={() => handleMapStyleChange(style)}
              selected={currentMapStyle.id === style.id}
              sx={{
                py: 1,
                '&.Mui-selected': {
                  bgcolor: alpha(colors.primary[500], 0.1),
                },
              }}>
              <ListItemIcon>
                <MapIcon
                  fontSize='small'
                  sx={{
                    color:
                      currentMapStyle.id === style.id
                        ? colors.primary[500]
                        : 'inherit',
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={style.nameJa}
                secondary={style.name}
                primaryTypographyProps={{
                  fontWeight: currentMapStyle.id === style.id ? 600 : 400,
                }}
              />
            </MenuItem>
          ))}
        </Menu>

        {/* 制限区域レイヤーコントロール */}
        {showRestrictionLayers && (
          <Box
            sx={{
              position: 'absolute',
              top: isMultiViewPanel ? 8 : 16,
              right: isMultiViewPanel ? 8 : 16,
              zIndex: 10,
            }}>
            <LayerControlPanel
              visibility={restrictionVisibility}
              onToggleLayer={toggleRestrictionLayer}
              onToggleAllLayers={toggleAllRestrictionLayers}
              compact={isMultiViewPanel}
              defaultExpanded={!isMultiViewPanel}
            />
          </Box>
        )}
      </Box>
    </>
  )
}

// 浅い比較でpropsの変更を検出
const arePropsEqual = (
  prevProps: UTMTrackingMapProps,
  nextProps: UTMTrackingMapProps
): boolean => {
  // ドローン数が変わった場合
  if (prevProps.drones.length !== nextProps.drones.length) return false

  // ドローンの位置が変わった場合のみ再レンダリング
  for (let i = 0; i < prevProps.drones.length; i++) {
    const prev = prevProps.drones[i]
    const next = nextProps.drones[i]
    if (
      prev.droneId !== next.droneId ||
      prev.status !== next.status ||
      prev.position.latitude !== next.position.latitude ||
      prev.position.longitude !== next.position.longitude ||
      prev.batteryLevel !== next.batteryLevel
    ) {
      return false
    }
  }

  // 選択状態
  if (prevProps.selectedDroneId !== nextProps.selectedDroneId) return false

  // ゾーン表示
  if (prevProps.showZones !== nextProps.showZones) return false
  if (prevProps.restrictedZones.length !== nextProps.restrictedZones.length)
    return false

  // アラート数
  if (prevProps.alerts?.length !== nextProps.alerts?.length) return false

  // 飛行区域
  if (prevProps.flightAreas?.length !== nextProps.flightAreas?.length)
    return false
  if (prevProps.showFlightAreas !== nextProps.showFlightAreas) return false

  // その他のprops
  if (prevProps.is3DView !== nextProps.is3DView) return false
  if (prevProps.showRestrictionLayers !== nextProps.showRestrictionLayers)
    return false

  // コールバック関数の参照比較
  // ハンドラーが追加/変更された場合に再レンダリングを確保
  if (prevProps.onDroneClick !== nextProps.onDroneClick) return false
  if (prevProps.onDroneContextMenu !== nextProps.onDroneContextMenu)
    return false
  if (prevProps.onMapClick !== nextProps.onMapClick) return false

  return true
}

// React.memoでコンポーネントをラップ（マルチビュー時の不要な再レンダリング防止）
// propsが変更されない限り再レンダリングをスキップ
const UTMTrackingMap = memo(UTMTrackingMapComponent, arePropsEqual)

export default UTMTrackingMap

// 後方互換性のためのエイリアス
export const MemoizedUTMTrackingMap = UTMTrackingMap
