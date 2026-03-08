import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AirIcon from '@mui/icons-material/Air'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import CloseIcon from '@mui/icons-material/Close'
import CompressIcon from '@mui/icons-material/Compress'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import ErrorIcon from '@mui/icons-material/Error'
import FlightIcon from '@mui/icons-material/Flight'
import FlightLandIcon from '@mui/icons-material/FlightLand'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import FolderOpenIcon from '@mui/icons-material/FolderOpen'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import HomeIcon from '@mui/icons-material/Home'
import InfoIcon from '@mui/icons-material/Info'
import KeyboardIcon from '@mui/icons-material/Keyboard'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import LightModeIcon from '@mui/icons-material/LightMode'
import ListIcon from '@mui/icons-material/List'
import MapIcon from '@mui/icons-material/Map'
import NotificationsIcon from '@mui/icons-material/Notifications'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RadarIcon from '@mui/icons-material/Radar'
import RefreshIcon from '@mui/icons-material/Refresh'
import SettingsIcon from '@mui/icons-material/Settings'
import StopIcon from '@mui/icons-material/Stop'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation'
import TimelineIcon from '@mui/icons-material/Timeline'
import TouchAppIcon from '@mui/icons-material/TouchApp'
import VideocamIcon from '@mui/icons-material/Videocam'
import ViewColumnIcon from '@mui/icons-material/ViewColumn'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  alpha,
  useTheme,
  useColorScheme,
  Collapse,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Popover,
  FormGroup,
  Select,
  MenuItem,
  Checkbox,
} from '@mui/material'
import { motion } from 'framer-motion'
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

import { ResizableDivider } from '@/components/ui/ResizableDivider'
import { useSidebar } from '@/layouts/sidebar'
import {
  getScenarioFlights,
  type ScheduledFlight,
} from '@/mocks/utmMultiDroneScenarios'
import { fetchWeatherData } from '@/services/weatherService'
import { colors } from '@/styles/tokens'
import type {
  DroneFlightStatus,
  WeatherData,
  DroneTimelineEvents,
  FlightTimelineEvent,
  FlightTimelineEventType,
  FlightTimelineEventSeverity,
  FlightStatus,
} from '@/types/utmTypes'
import { getDroneDisplayColor } from '@/utils'
import { droneFlightStatusToExtended } from '@/utils/droneDataAdapter'

import { UTMDroneDetailWidget } from '../components/utm/UTMDroneDetailWidget'
import UTMDroneListPanel from '../components/utm/UTMDroneListPanel'
import { UTMDroneSettingsModal } from '../components/utm/UTMDroneSettingsModal'
import { UTMEnhancedAlertPanel } from '../components/utm/UTMEnhancedAlertPanel'
import { UTMFlightTimeline } from '../components/utm/UTMFlightTimeline'
import UTMForecastTimeline from '../components/utm/UTMForecastTimeline'
import UTMMultiDroneGrid from '../components/utm/UTMMultiDroneGrid'
import UTMPilotHUD from '../components/utm/UTMPilotHUD'
import { UTMProjectDroneSelector } from '../components/utm/UTMProjectDroneSelector'
import UTMToastNotification, {
  useToastNotifications,
} from '../components/utm/UTMToastNotification'
import UTMTrackingMap, {
  MemoizedUTMTrackingMap,
  MapControlHandler,
  ViewState,
} from '../components/utm/UTMTrackingMap'
import UTMWeatherWidget from '../components/utm/UTMWeatherWidget'
import useAppStore from '../store/appStore'
import useUTMStore from '../store/utmStore'

// コンパクト統計表示
interface MiniStatProps {
  icon: React.ReactNode
  value: string | number
  label: string
  color: string
}

const MiniStat = ({ icon, value, label, color }: MiniStatProps) => (
  <Tooltip title={label} arrow placement='bottom'>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 0.75,
        borderRadius: 2,
        bgcolor: alpha(color, 0.1),
        cursor: 'default',
      }}>
      <Box sx={{ color, display: 'flex' }}>{icon}</Box>
      <Typography
        variant='subtitle2'
        fontWeight={700}
        sx={{ color, lineHeight: 1 }}>
        {value}
      </Typography>
    </Box>
  </Tooltip>
)

// ライブインジケーター
const LiveIndicator = ({ active }: { active: boolean }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: active ? colors.success.main : colors.gray[400],
        animation: active ? 'pulse-dot 2s infinite' : 'none',
        '@keyframes pulse-dot': {
          '0%': { boxShadow: `0 0 0 0 ${alpha(colors.success.main, 0.7)}` },
          '70%': { boxShadow: `0 0 0 6px ${alpha(colors.success.main, 0)}` },
          '100%': { boxShadow: `0 0 0 0 ${alpha(colors.success.main, 0)}` },
        },
      }}
    />
    <Typography
      variant='caption'
      fontWeight={600}
      color={active ? 'success.main' : 'text.secondary'}>
      {active ? 'LIVE' : 'PAUSED'}
    </Typography>
  </Box>
)

// 分割パネル用ミニ気象バッジ
const getFlightStatusColor = (
  status: WeatherData['flightCondition']['status']
) => {
  switch (status) {
    case 'excellent':
      return colors.success.main
    case 'good':
      return colors.success.light
    case 'caution':
      return colors.warning.main
    case 'warning':
      return colors.warning.dark
    case 'dangerous':
      return colors.error.main
    default:
      return colors.gray[500]
  }
}

interface MiniWeatherBadgeProps {
  latitude: number
  longitude: number
}

const MiniWeatherBadge = ({ latitude, longitude }: MiniWeatherBadgeProps) => {
  const [weather, setWeather] = useState<WeatherData | null>(null)

  useEffect(() => {
    let mounted = true
    fetchWeatherData(latitude, longitude).then((data) => {
      if (mounted) setWeather(data)
    })
    return () => {
      mounted = false
    }
  }, [latitude, longitude])

  if (!weather) return null

  const statusColor = getFlightStatusColor(weather.flightCondition.status)

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1,
        py: 0.25,
        borderRadius: 1,
        bgcolor: alpha('#000', 0.6),
        backdropFilter: 'blur(4px)',
      }}>
      {/* 飛行条件ステータス */}
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: statusColor,
        }}
      />
      {/* 気温 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <ThermostatIcon sx={{ fontSize: 12, color: '#fff', opacity: 0.8 }} />
        <Typography
          variant='caption'
          sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 600 }}>
          {Math.round(weather.current.temperature)}°
        </Typography>
      </Box>
      {/* 風速 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
        <AirIcon sx={{ fontSize: 12, color: '#fff', opacity: 0.8 }} />
        <Typography
          variant='caption'
          sx={{ color: '#fff', fontSize: '0.65rem', fontWeight: 600 }}>
          {weather.current.windSpeed.toFixed(1)}m/s
        </Typography>
      </Box>
    </Box>
  )
}

const ShortcutKey = ({ children }: { children: string }) => (
  <Box
    component='span'
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      px: 1,
      py: 0.25,
      borderRadius: 1,
      fontFamily:
        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '0.75rem',
      fontWeight: 700,
      bgcolor: (t) =>
        t.palette.mode === 'dark'
          ? alpha(colors.gray[800], 0.8)
          : alpha(colors.gray[200], 0.8),
      border: (t) => `1px solid ${alpha(t.palette.divider, 0.2)}`,
      color: 'text.primary',
      minWidth: 44,
    }}>
    {children}
  </Box>
)

const UTMDashboardPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { sidebarWidth } = useSidebar()

  // URLパラメータから取得
  const flightIdParam = searchParams.get('flight')
  const [scheduledFlight, setScheduledFlight] =
    useState<ScheduledFlight | null>(null)
  const {
    activeDrones,
    restrictedZones,
    alerts,
    statistics,
    isSimulationRunning,
    initializeMockData,
    initializeMonitoringConfig,
    startSimulation,
    stopSimulation,
    acknowledgeAlert,
    unacknowledgeAlert,
    // clearAlert,
    // clearAllAlerts,
    soundSettings,
    updateSoundSettings,
    // プロジェクト管理
    projects,
    selectedProjectIds,
    selectProject,
    toggleProjectSelection,
    getSelectedProjects,
    getProjectFlightAreas,
    getFilteredDrones,
    // ドローンステータス更新
    updateDronePosition,
    // ドローン監視設定
    monitoredDroneConfigs,
  } = useUTMStore()

  // 選択プロジェクトのドローンを取得（マップ表示用）
  const filteredDrones = getFilteredDrones()

  // アラートとドローン状態からタイムラインイベントを生成
  const droneTimelineEvents = useMemo((): DroneTimelineEvents[] => {
    const eventsMap = new Map<string, FlightTimelineEvent[]>()

    // 各ドローンの初期配列を作成
    filteredDrones.forEach((drone) => {
      eventsMap.set(drone.droneId, [])
    })

    // ドローンの離陸イベントを追加（飛行中または着陸済みの場合）
    filteredDrones.forEach((drone) => {
      const events = eventsMap.get(drone.droneId) || []
      if (drone.status !== 'preflight' && drone.startTime) {
        events.push({
          id: `takeoff-${drone.droneId}`,
          droneId: drone.droneId,
          type: 'takeoff' as FlightTimelineEventType,
          severity: 'info' as FlightTimelineEventSeverity,
          timestamp: drone.startTime,
          title: '離陸',
          description: `${drone.droneName}が離陸しました`,
          links: { mapPosition: true },
        })
      }
      // 着陸済みの場合は着陸イベントを追加
      if (drone.status === 'landed' && drone.estimatedEndTime) {
        events.push({
          id: `landing-${drone.droneId}`,
          droneId: drone.droneId,
          type: 'landing' as FlightTimelineEventType,
          severity: 'info' as FlightTimelineEventSeverity,
          timestamp: drone.estimatedEndTime,
          title: '着陸',
          description: `${drone.droneName}が着陸しました`,
          links: { mapPosition: true },
        })
      }
      eventsMap.set(drone.droneId, events)
    })

    // アラートをタイムラインイベントに変換
    alerts.forEach((alert) => {
      const events = eventsMap.get(alert.droneId)
      if (events) {
        // AlertTypeからFlightTimelineEventTypeへのマッピング
        const typeMap: Record<string, FlightTimelineEventType> = {
          zone_violation: 'zone_violation',
          zone_approach: 'zone_approach',
          collision_warning: 'collision_warning',
          collision_alert: 'collision_warning',
          low_battery: 'low_battery',
          critical_battery: 'critical_battery',
          geofence_breach: 'geofence_breach',
          weather_warning: 'weather_warning',
          airspace_conflict: 'geofence_warning',
        }
        // AlertSeverityからFlightTimelineEventSeverityへのマッピング
        const severityMap: Record<string, FlightTimelineEventSeverity> = {
          info: 'info',
          warning: 'warning',
          critical: 'error',
          emergency: 'critical',
        }
        events.push({
          id: alert.id,
          droneId: alert.droneId,
          type: typeMap[alert.type] || 'custom',
          severity: severityMap[alert.severity] || 'warning',
          timestamp: alert.timestamp,
          title: alert.message,
          description: alert.details,
          data: alert.position
            ? {
                position: {
                  latitude: alert.position.latitude,
                  longitude: alert.position.longitude,
                  altitude: alert.position.altitude,
                },
              }
            : undefined,
          links: { mapPosition: !!alert.position, alert: alert.id },
          acknowledged: alert.acknowledged,
          acknowledgedBy: alert.acknowledgedBy,
          acknowledgedAt: alert.acknowledgedAt,
        })
      }
    })

    // Map をDroneTimelineEvents[] に変換
    return Array.from(eventsMap.entries()).map(([droneId, events]) => ({
      droneId,
      events: events.sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      ),
    }))
  }, [filteredDrones, alerts])

  // プロジェクトごとのドローンをフィルタリング（分割表示用）
  const getDronesForProject = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId)
      // projectIdでマッチするドローン
      const dronesById = activeDrones.filter(
        (drone) => drone.projectId === projectId
      )
      // droneIdsでもマッチするドローン（フォールバック）
      if (dronesById.length === 0 && project?.droneIds) {
        const droneIdSet = new Set(project.droneIds)
        return activeDrones.filter((d) => droneIdSet.has(d.droneId))
      }
      return dronesById
    },
    [activeDrones, projects]
  )

  // プロジェクトごとの飛行エリアを取得
  const getFlightAreaForProject = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId)
      return project?.flightArea ? [project.flightArea] : []
    },
    [projects]
  )

  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null)
  const [selectedAlertIds, setSelectedAlertIds] = useState<string[]>([])
  const [soundAnchorEl, setSoundAnchorEl] = useState<HTMLButtonElement | null>(
    null
  )
  const [showZones, setShowZones] = useState(true)
  const [sidePanelOpen, setSidePanelOpen] = useState(true)
  const [sidePanelWidth, setSidePanelWidth] = useState<number>(280)
  const [activeTab, setActiveTab] = useState(0)
  const [alertPanelHeight, setAlertPanelHeight] = useState(250) // アラートパネルの高さ
  const [isResizing, setIsResizing] = useState(false) // リサイズ中フラグ
  const [showHUD, setShowHUD] = useState(false)
  const [compactWidgets, setCompactWidgets] = useState(false)
  const [is3DView, setIs3DView] = useState(true) // 初期表示は3D
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map') // マップ or グリッド表示
  const [multiViewEnabled, setMultiViewEnabled] = useState(false) // マルチビュー（複数地域同時監視）モード
  const [projectSelectOpen, setProjectSelectOpen] = useState(false) // プロジェクト選択Selectのオープン状態
  const [helpModalOpen, setHelpModalOpen] = useState(false)
  const [helpModalTab, setHelpModalTab] = useState(0)
  const [droneWidgetCollapsed, setDroneWidgetCollapsed] = useState(false)

  // ズームトグルハンドラー（true: ズームアウト状態, false: 元に戻った）
  const fitAllDronesHandlerRef = useRef<(() => boolean) | null>(null)
  const registerFitAllDronesHandler = useCallback(
    (handler: (() => boolean) | null) => {
      fitAllDronesHandlerRef.current = handler
    },
    []
  )

  // Zキートグル用の状態管理（選択エリアビュー）
  const [isAreaZoomed, setIsAreaZoomed] = useState(false)
  const savedAreaViewRef = useRef<ViewState | null>(null)

  // Jキートグル用の状態管理（全国俯瞰ビュー）
  const [isNationwideView, setIsNationwideView] = useState(false)
  const savedNationwideViewRef = useRef<ViewState | null>(null)
  // マルチビューから全国表示に切り替えた場合、戻る際にマルチビューに復帰するためのフラグ
  const returnToMultiViewRef = useRef(false)

  // フッタータイムラインの展開状態
  const [timelineExpanded, setTimelineExpanded] = useState(false)
  const [droneSettingsModalOpen, setDroneSettingsModalOpen] = useState(false)
  const [selectedDroneForSettings, setSelectedDroneForSettings] =
    useState<DroneFlightStatus | null>(null)

  // ドローン右クリックコンテキストメニュー
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number
    mouseY: number
    drone: DroneFlightStatus | null
  } | null>(null)
  // const [showDroneMonitoringPanel, setShowDroneMonitoringPanel] =
  //   useState(false) // ドローン監視設定パネルの表示状態

  // ドローン設定モーダルを開くハンドラー
  const handleOpenDroneSettings = useCallback((drone: DroneFlightStatus) => {
    setSelectedDroneForSettings(drone)
    setDroneSettingsModalOpen(true)
  }, [])

  // Zoom状態をリセット（表示モード切り替え時に呼び出す）
  const resetZoomStates = useCallback(() => {
    setIsAreaZoomed(false)
    savedAreaViewRef.current = null
    setIsNationwideView(false)
    savedNationwideViewRef.current = null
    // マップ側のズーム状態もリセット
    mapControlRef.current?.resetZoomState()
  }, [])

  // マップ操作ハンドラー
  const mapControlRef = useRef<MapControlHandler | null>(null)
  const registerMapControl = useCallback(
    (handler: MapControlHandler | null) => {
      mapControlRef.current = handler
    },
    []
  )

  // マルチビュー用: 各パネルのマップ操作ハンドラー
  const multiViewMapRefs = useRef<Map<string, MapControlHandler>>(new Map())
  const [focusedPanelId, setFocusedPanelId] = useState<string | null>(null)

  // マルチビューパネルのマップコントロールを登録
  const registerMultiViewMapControl = useCallback(
    (projectId: string, handler: MapControlHandler | null) => {
      if (handler) {
        multiViewMapRefs.current.set(projectId, handler)
      } else {
        multiViewMapRefs.current.delete(projectId)
      }
    },
    []
  )

  // URLパラメータからprojectIdを取得
  const projectIdFromUrl = searchParams.get('projectId')

  // URLパラメータのprojectIdに基づいてプロジェクトを選択し、マップを移動
  useEffect(() => {
    if (projectIdFromUrl) {
      // プロジェクトを選択
      const project = projects.find((p) => p.id === projectIdFromUrl)
      if (project) {
        selectProject(projectIdFromUrl)
        // マップを移動（mapControlRefが利用可能になるまでリトライ）
        if (project.centerCoordinates) {
          const [lng, lat] = project.centerCoordinates
          const attemptFlyTo = (retryCount: number = 0) => {
            const handler = mapControlRef.current
            if (handler) {
              handler.flyTo(lng, lat, 13)
              return
            }
            // 上限回数（10回 = 1秒）を超えた場合は中断
            if (retryCount >= 10) {
              return
            }
            window.setTimeout(() => attemptFlyTo(retryCount + 1), 100)
          }
          window.setTimeout(() => attemptFlyTo(), 500)
        }
        // URLパラメータをクリア（リロード時に再度移動しないように）
        setSearchParams({}, { replace: true })
      }
    }
  }, [projectIdFromUrl, projects, selectProject, setSearchParams])

  // ドローン選択時に自動フォーカス（アラートクリック時など）
  useEffect(() => {
    if (!selectedDroneId || !mapControlRef.current) return

    const drone = activeDrones.find((d) => d.droneId === selectedDroneId)
    if (drone?.position) {
      // 少し遅延させてマップが準備できてから実行
      const timeoutId = setTimeout(() => {
        mapControlRef.current?.flyTo(
          drone.position.longitude,
          drone.position.latitude,
          15 // ズームレベル
        )
      }, 100)
      return () => clearTimeout(timeoutId)
    }
  }, [selectedDroneId, activeDrones])

  // テーマモード（MUIのuseColorSchemeを使用）
  const { setMode: setThemeMode } = useColorScheme()

  // フルスクリーンモード
  const { fullscreenMode, toggleFullscreenMode } = useAppStore()

  // テーマ切り替え関数
  // theme.palette.modeは実際の解決済みモード（'light'または'dark'）を返す
  // themeModeが'system'の場合でも正しく動作する
  const resolvedMode = theme.palette.mode
  const toggleThemeMode = useCallback(() => {
    setThemeMode(resolvedMode === 'dark' ? 'light' : 'dark')
  }, [resolvedMode, setThemeMode])

  const handleSimulationSubmit = useCallback(() => {
    if (isSimulationRunning) {
      stopSimulation()
      return
    }
    startSimulation()
  }, [isSimulationRunning, startSimulation, stopSimulation])

  const isTextInputTarget = (target: EventTarget | null): boolean => {
    if (!target) return false
    if (!(target instanceof HTMLElement)) return false
    const tag = target.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
  }

  // 選択エリア表示/ドローンフォーカス切替（Zキー）- トグル動作
  // 意図: 選択ドローンの所属プロジェクト ⇔ 選択ドローンフォーカスのトグル
  // ※ 全国俯瞰（Jキー）とは独立。複数プロジェクト選択時も全国表示にはならない
  const handleFitToSelectedProjects = useCallback(() => {
    const selectedProjects = getSelectedProjects()
    if (selectedProjects.length === 0 || !mapControlRef.current) return

    // トグル動作: エリアズーム状態かつドローンが選択されている場合、そのドローンにフォーカス
    if (isAreaZoomed && selectedDroneId) {
      const drone = activeDrones.find((d) => d.droneId === selectedDroneId)
      if (drone) {
        mapControlRef.current.flyTo(
          drone.position.longitude,
          drone.position.latitude,
          16
        )
      }
      setIsAreaZoomed(false)
      return
    }

    // フォーカス対象のプロジェクトを決定:
    // - ドローンが選択されている場合: そのドローンの所属プロジェクト
    // - ドローン未選択の場合: 最初の選択プロジェクト
    // ※ 複数プロジェクト選択時でも1つのプロジェクトのみにフォーカス（全国俯瞰を防ぐ）
    let targetProject = selectedProjects[0]
    if (selectedDroneId) {
      const selectedDrone = activeDrones.find(
        (d) => d.droneId === selectedDroneId
      )
      if (selectedDrone?.projectId) {
        const droneProject = selectedProjects.find(
          (p) => p.id === selectedDrone.projectId
        )
        if (droneProject) {
          targetProject = droneProject
        }
      }
    }

    // 対象プロジェクトの境界を計算してフィット
    const allLats: number[] = []
    const allLngs: number[] = []

    // 飛行区域の座標を追加
    if (targetProject.flightArea) {
      // coordinates が number[][][] の場合のみ処理
      if (Array.isArray(targetProject.flightArea.coordinates)) {
        targetProject.flightArea.coordinates.forEach((ring: number[][]) => {
          ring.forEach((coord: number[]) => {
            allLngs.push(coord[0])
            allLats.push(coord[1])
          })
        })
      }
    }
    // プロジェクトのドローンも含める
    getDronesForProject(targetProject.id).forEach((d) => {
      allLats.push(d.position.latitude)
      allLngs.push(d.position.longitude)
    })
    // 中心座標も含める（飛行区域がない場合の保険）
    if (targetProject.centerCoordinates) {
      allLngs.push(targetProject.centerCoordinates[0])
      allLats.push(targetProject.centerCoordinates[1])
    }

    if (allLats.length === 0 || allLngs.length === 0) return

    const minLat = Math.min(...allLats)
    const maxLat = Math.max(...allLats)
    const minLng = Math.min(...allLngs)
    const maxLng = Math.max(...allLngs)

    mapControlRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 80, maxZoom: 15, duration: 1500 }
    )
    setIsAreaZoomed(true)
    // 全国ビュー状態をリセット（ZとJは独立だが、Zで移動したら全国状態ではなくなる）
    setIsNationwideView(false)
    savedNationwideViewRef.current = null
  }, [
    getSelectedProjects,
    getDronesForProject,
    isAreaZoomed,
    selectedDroneId,
    activeDrones,
  ])

  // 全国全体（全ドローン・全プロジェクト）を俯瞰表示（Jキー）- トグル動作
  // shouldReturnToMultiView: trueの場合、戻る際にマルチビューモードに復帰する
  const handleFitToAllDronesNationwide = useCallback(
    (shouldReturnToMultiView = false) => {
      if (!mapControlRef.current) return

      // トグル: 既に全国ビュー状態なら、保存されたビューに戻る
      if (isNationwideView && savedNationwideViewRef.current) {
        mapControlRef.current.restoreViewState(savedNationwideViewRef.current, {
          duration: 1500,
        })
        setIsNationwideView(false)
        savedNationwideViewRef.current = null
        // マルチビューから来た場合は復帰
        if (returnToMultiViewRef.current) {
          returnToMultiViewRef.current = false
          setMultiViewEnabled(true)
        }
        return
      }

      // マルチビューから来た場合はフラグを立てる
      if (shouldReturnToMultiView) {
        returnToMultiViewRef.current = true
      }

      // 現在のビュー状態を保存
      savedNationwideViewRef.current = mapControlRef.current.getViewState()

      // 全プロジェクト・全ドローンの境界を計算
      const allLats: number[] = []
      const allLngs: number[] = []

      // 全アクティブドローンの座標を追加
      activeDrones.forEach((d) => {
        allLats.push(d.position.latitude)
        allLngs.push(d.position.longitude)
      })

      // 全プロジェクトの飛行区域を追加
      projects.forEach((project) => {
        if (project.flightArea) {
          project.flightArea.coordinates.forEach((ring) => {
            ring.forEach((coord) => {
              allLngs.push(coord[0])
              allLats.push(coord[1])
            })
          })
        }
        // 中心座標も含める
        if (project.centerCoordinates) {
          allLngs.push(project.centerCoordinates[0])
          allLats.push(project.centerCoordinates[1])
        }
      })

      if (allLats.length === 0 || allLngs.length === 0) return

      const minLat = Math.min(...allLats)
      const maxLat = Math.max(...allLats)
      const minLng = Math.min(...allLngs)
      const maxLng = Math.max(...allLngs)

      mapControlRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: 60, maxZoom: 8, duration: 1500 }
      )
      setIsNationwideView(true)
      // エリアズーム状態をリセット
      setIsAreaZoomed(false)
      savedAreaViewRef.current = null
    },
    [activeDrones, projects, isNationwideView]
  )

  // サイドパネルのリサイズ処理
  const handleSidebarResize = useCallback((delta: number) => {
    setSidePanelWidth((prev) => {
      const newWidth = prev + delta
      const minWidth = 240
      const maxWidth = 600
      return Math.min(Math.max(newWidth, minWidth), maxWidth)
    })
  }, [])

  // キーボードショートカット
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      // Cmd/Ctrl + K: ヘルプモーダルを開く
      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault()
        setHelpModalOpen(true)
        return
      }

      // Cmd/Ctrl + S: シミュレーション開始/停止（ブラウザの保存を抑止）
      if ((event.metaKey || event.ctrlKey) && key === 's') {
        event.preventDefault()
        handleSimulationSubmit()
        return
      }

      // Cmd/Ctrl + Enter: 選択中のアラートを既読/未読トグル（複数対応）
      if ((event.metaKey || event.ctrlKey) && key === 'enter') {
        event.preventDefault()
        if (selectedAlertIds.length > 0) {
          // 選択中のアラートを取得
          const selectedAlerts = alerts.filter((a) =>
            selectedAlertIds.includes(a.id)
          )
          // すべて既読かどうかを判定
          const allAcknowledged = selectedAlerts.every((a) => a.acknowledged)

          if (allAcknowledged) {
            // すべて既読 → 未読に戻す
            selectedAlertIds.forEach((alertId) => {
              unacknowledgeAlert(alertId)
            })
          } else {
            // 1つでも未読がある → すべて既読にする
            selectedAlertIds.forEach((alertId) => {
              const alert = alerts.find((a) => a.id === alertId)
              if (alert && !alert.acknowledged) {
                acknowledgeAlert(alertId, 'current-user')
              }
            })
          }
          // 選択を解除
          setSelectedAlertIds([])
        }
        return
      }

      // Cmd/Ctrl + ArrowUp/ArrowDown: タブに応じて選択移動
      if (
        (event.metaKey || event.ctrlKey) &&
        (key === 'arrowup' || key === 'arrowdown')
      ) {
        event.preventDefault()

        // アラートタブの場合: アラートリスト内を1つずつ移動
        if (activeTab === 1 && alerts.length > 0) {
          const currentAlertId =
            selectedAlertIds.length > 0
              ? selectedAlertIds[selectedAlertIds.length - 1]
              : null
          const currentIndex = currentAlertId
            ? alerts.findIndex((a) => a.id === currentAlertId)
            : -1

          let newIndex: number
          if (key === 'arrowup') {
            newIndex = currentIndex <= 0 ? alerts.length - 1 : currentIndex - 1
          } else {
            newIndex =
              currentIndex < 0 || currentIndex >= alerts.length - 1
                ? 0
                : currentIndex + 1
          }

          // 単一選択（複数選択はCmd+クリックのみ）
          setSelectedAlertIds([alerts[newIndex].id])
          return
        }

        // ドローンタブの場合: ドローンリスト内を移動
        if (filteredDrones.length === 0) return

        const currentIndex = selectedDroneId
          ? filteredDrones.findIndex((d) => d.droneId === selectedDroneId)
          : -1

        let newIndex: number
        if (key === 'arrowup') {
          // 上: 前のドローンへ (選択なしまたは最初なら最後へ)
          newIndex =
            currentIndex <= 0 ? filteredDrones.length - 1 : currentIndex - 1
        } else {
          // 下: 次のドローンへ (選択なしまたは最後なら最初へ)
          newIndex =
            currentIndex < 0 || currentIndex >= filteredDrones.length - 1
              ? 0
              : currentIndex + 1
        }

        setSelectedDroneId(filteredDrones[newIndex].droneId)
        return
      }

      // テキスト入力中は単キーショートカットを無視
      if (isTextInputTarget(event.target)) return

      // 修飾キーがある場合は単キーショートカットを無視（Cmd/Ctrl+Sは上で処理済み）
      if (event.metaKey || event.ctrlKey || event.altKey) return

      switch (key) {
        case 'z': {
          // 選択中のプロジェクト/飛行エリアにズーム
          event.preventDefault()
          if (multiViewEnabled && focusedPanelId) {
            // マルチビュー時: フォーカスされたパネルのエリアにフィット
            const handler = multiViewMapRefs.current.get(focusedPanelId)
            handler?.fitAllDrones()
          } else if (!multiViewEnabled) {
            // 単一ビュー時
            handleFitToSelectedProjects()
          }
          return
        }
        case 'j': {
          // 全国全体（全ドローン・全プロジェクト）を俯瞰表示
          event.preventDefault()
          // 全国表示時はドローン選択を解除（自動フォーカスを防ぐ）
          setSelectedDroneId(null)
          if (viewMode === 'grid') {
            // グリッドビュー(V)からの切り替え: マップに戻して全国表示
            setViewMode('map')
            resetZoomStates()
            setTimeout(() => {
              mapControlRef.current?.resize()
              handleFitToAllDronesNationwide()
            }, 200)
          } else if (multiViewEnabled) {
            // マルチビュー時: 単一ビューに切り替えて全国表示
            // Jを再度押すとマルチビューに戻る
            setMultiViewEnabled(false)
            resetZoomStates() // ズーム状態をリセットしてから全国表示
            // 少し遅延してから全国表示（マップの初期化を待つ）
            setTimeout(() => {
              mapControlRef.current?.resize()
              handleFitToAllDronesNationwide(true) // trueでマルチビュー復帰フラグを立てる
            }, 200)
          } else {
            // 単一ビュー時: 通常のトグル動作
            handleFitToAllDronesNationwide()
          }
          return
        }
        case 'f': {
          event.preventDefault()
          toggleFullscreenMode()
          return
        }
        case 'w': {
          // ウィジェットコンパクト化トグル（単一ビュー時のみ）
          // マルチビュー時は各パネルに個別のウィジェットがないため無効
          event.preventDefault()
          if (!multiViewEnabled) {
            setCompactWidgets((prev) => !prev)
          }
          return
        }
        case 's': {
          event.preventDefault()
          setSidePanelOpen((prev) => !prev)
          return
        }
        case 'd': {
          event.preventDefault()
          setShowZones((prev) => !prev)
          return
        }
        case '2': {
          event.preventDefault()
          setIs3DView(false)
          return
        }
        case '3': {
          event.preventDefault()
          setIs3DView(true)
          return
        }
        case 'h': {
          // HUD表示トグル（単一ビューかつドローン選択時のみ）
          // マルチビュー時は意味がないので無効
          event.preventDefault()
          if (!multiViewEnabled && selectedDroneId) {
            setShowHUD((prev) => !prev)
          }
          return
        }
        case 'a': {
          // ドローンステータスウィジェットの展開/折りたたみ
          event.preventDefault()
          setDroneWidgetCollapsed((prev) => !prev)
          return
        }
        case 'c': {
          // マップの中心位置を補正（リサイズ後のズレを手動で修正）
          event.preventDefault()
          if (multiViewEnabled && focusedPanelId) {
            // マルチビュー時: フォーカスされたパネルの中心を補正
            const handler = multiViewMapRefs.current.get(focusedPanelId)
            handler?.recenter()
          } else {
            // 単一ビュー時
            mapControlRef.current?.recenter()
          }
          return
        }
        case 'm': {
          // マルチビュー（複数地域同時監視）モード切り替え
          event.preventDefault()
          // V画面（グリッド）の場合は、まずマップ表示に切り替えてからマルチビューON
          if (viewMode === 'grid') {
            setViewMode('map')
            setMultiViewEnabled(true)
            resetZoomStates()
            setTimeout(() => {
              mapControlRef.current?.resize()
            }, 200)
          } else {
            const nextMultiView = !multiViewEnabled
            setMultiViewEnabled(nextMultiView)
            // モード変更後にマップリサイズとズーム状態リセット
            resetZoomStates()
            setTimeout(() => {
              mapControlRef.current?.resize()
              // 単一ビューに戻る時、選択中のドローンがあればフォーカスを復元
              if (!nextMultiView && selectedDroneId) {
                mapControlRef.current?.recenter()
              }
            }, 200)
          }
          return
        }
        case 'v': {
          // ビデオグリッド表示切り替え
          event.preventDefault()
          // M画面（マルチビュー）の場合は、まずグリッド表示に切り替え
          if (multiViewEnabled && viewMode === 'map') {
            setMultiViewEnabled(false)
            setViewMode('grid')
            resetZoomStates()
          } else {
            setViewMode((prev) => {
              const newMode = prev === 'map' ? 'grid' : 'map'
              // マップモードに戻る時にリサイズとズーム状態リセット
              resetZoomStates()
              if (newMode === 'map') {
                setTimeout(() => {
                  mapControlRef.current?.resize()
                  // 選択中のドローンがあれば、そのドローンにフォーカスを復元
                  if (selectedDroneId) {
                    mapControlRef.current?.recenter()
                  }
                }, 200)
              }
              return newMode
            })
          }
          return
        }
        case 'o': {
          // ドローンタブに切り替え
          event.preventDefault()
          setActiveTab(0)
          return
        }
        case 'p': {
          // 監視設定タブに切り替え
          event.preventDefault()
          setActiveTab(1)
          return
        }
        case 't': {
          // タイムライン展開/縮小トグル
          event.preventDefault()
          setTimelineExpanded((prev) => !prev)
          return
        }
        case 'q': {
          // プロジェクト（地域）選択ドロップダウンを開く
          event.preventDefault()
          setProjectSelectOpen((prev) => !prev)
          return
        }
      }
    },
    [
      filteredDrones,
      activeTab,
      alerts,
      acknowledgeAlert,
      unacknowledgeAlert,
      handleSimulationSubmit,
      selectedAlertIds,
      selectedDroneId,
      toggleFullscreenMode,
      handleFitToSelectedProjects,
      handleFitToAllDronesNationwide,
      multiViewEnabled,
      viewMode,
      resetZoomStates,
      focusedPanelId,
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // トースト通知システム
  const {
    notifications,
    removeNotification,
    notifyStatusChange,
    notifyAlert,
    notifyLowBattery,
    notifyLowSignal,
  } = useToastNotifications(soundSettings)

  // 前回のドローン状態を保持
  const prevDronesRef = useRef<Map<string, DroneFlightStatus>>(new Map())
  const prevAlertsRef = useRef<Set<string>>(new Set())

  // Pre-Flight LobbyからのflightId読み込み
  useEffect(() => {
    if (flightIdParam) {
      // 全シナリオからflightを検索
      const allFlights = [
        ...getScenarioFlights('default'),
        ...getScenarioFlights('haneda_multi'),
        ...getScenarioFlights('tokyo_bay_infra'),
        ...getScenarioFlights('congested_airspace'),
        ...getScenarioFlights('emergency_response'),
      ]
      const flight = allFlights.find((f) => f.id === flightIdParam)
      if (flight) {
        setScheduledFlight(flight)
      }
    }
  }, [flightIdParam])

  // データ初期化（初回マウント時のみ）
  // シミュレーションはユーザー操作（開始ボタン or Cmd+S）で開始
  useEffect(() => {
    initializeMockData()
    initializeMonitoringConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ドローンステータス変化を監視
  useEffect(() => {
    const prevDrones = prevDronesRef.current

    activeDrones.forEach((drone) => {
      const prev = prevDrones.get(drone.droneId)

      // ステータス変化
      if (prev && prev.status !== drone.status) {
        notifyStatusChange(drone, prev.status)
      }

      // バッテリー低下警告（20%以下で警告、かつ前回は20%以上）
      if (drone.batteryLevel <= 20 && (!prev || prev.batteryLevel > 20)) {
        notifyLowBattery(drone)
      }

      // 信号低下警告（50%以下で警告、かつ前回は50%以上）
      if (drone.signalStrength <= 50 && (!prev || prev.signalStrength > 50)) {
        notifyLowSignal(drone)
      }

      // 現在の状態を保存
      prevDrones.set(drone.droneId, { ...drone })
    })
  }, [activeDrones, notifyStatusChange, notifyLowBattery, notifyLowSignal])

  // 新規アラートを監視
  useEffect(() => {
    const prevAlertIds = prevAlertsRef.current

    alerts.forEach((alert) => {
      if (!prevAlertIds.has(alert.id)) {
        notifyAlert(alert)
        prevAlertIds.add(alert.id)
      }
    })

    // 古いアラートIDをクリーンアップ
    const currentAlertIds = new Set(alerts.map((a) => a.id))
    prevAlertIds.forEach((id) => {
      if (!currentAlertIds.has(id)) {
        prevAlertIds.delete(id)
      }
    })
  }, [alerts, notifyAlert])

  const handleDroneSelect = (drone: DroneFlightStatus) => {
    setSelectedDroneId(drone.droneId === selectedDroneId ? null : drone.droneId)
    // ドローン選択時にZoom状態をリセット
    resetZoomStates()
  }

  // droneIdで選択（アラートからのクリック用 - 常にズーム）
  const handleDroneSelectById = (droneId: string) => {
    // 同じドローンでも再度選択してズームする（トグルしない）
    if (droneId === selectedDroneId) {
      // 一旦nullにしてから再設定することで、useEffectを再トリガー
      setSelectedDroneId(null)
      setTimeout(() => setSelectedDroneId(droneId), 0)
    } else {
      setSelectedDroneId(droneId)
    }
    // ドローン選択時にZoom状態をリセット
    resetZoomStates()
  }

  // マップクリックでポップアップを閉じる（ドローンウィジェットは閉じない）
  const handleMapClick = () => {
    // ドローンステータスウィジェットは閉じない
    // ポップアップ（UTMTrackingMap内）は closeOnClick={true} で自動的に閉じる
  }

  // ドローンアクションハンドラ（緊急アラート用）
  const handleDroneHover = useCallback(
    (droneId: string) => {
      const drone = activeDrones.find((d) => d.droneId === droneId)
      const droneName = drone?.droneName || droneId

      // ドローンのステータスを「ホバリング」に変更
      updateDronePosition(droneId, {
        status: 'hovering',
        flightMode: 'hover',
      })

      // 該当ドローンの未確認アラートを確認済みにする
      alerts
        .filter((a) => a.droneId === droneId && !a.acknowledged)
        .forEach((a) => acknowledgeAlert(a.id, 'system'))

      notifyAlert({
        id: `hover-${droneId}-${Date.now()}`,
        type: 'system_command',
        severity: 'info',
        droneId,
        droneName,
        message: `${droneName}: ホバリング中`,
        details: 'ドローンは現在位置でホバリングを開始しました',
        timestamp: new Date(),
        acknowledged: true,
      })
    },
    [activeDrones, alerts, acknowledgeAlert, updateDronePosition, notifyAlert]
  )

  const handleDroneEmergencyReturn = useCallback(
    (droneId: string) => {
      const drone = activeDrones.find((d) => d.droneId === droneId)
      const droneName = drone?.droneName || droneId

      // ドローンのステータスを「緊急帰還」に変更
      updateDronePosition(droneId, {
        status: 'rth',
        flightMode: 'rth',
      })

      // 該当ドローンの未確認アラートを確認済みにする
      alerts
        .filter((a) => a.droneId === droneId && !a.acknowledged)
        .forEach((a) => acknowledgeAlert(a.id, 'system'))

      notifyAlert({
        id: `rth-${droneId}-${Date.now()}`,
        type: 'system_command',
        severity: 'warning',
        droneId,
        droneName,
        message: `${droneName}: 緊急帰還(RTH)中`,
        details: 'ドローンはホームポイントに向かって帰還を開始しました',
        timestamp: new Date(),
        acknowledged: true,
      })
    },
    [activeDrones, alerts, acknowledgeAlert, updateDronePosition, notifyAlert]
  )

  // 即時着陸ハンドラー
  const handleDroneLandImmediately = useCallback(
    (droneId: string) => {
      const drone = activeDrones.find((d) => d.droneId === droneId)
      const droneName = drone?.droneName || droneId

      // ドローンのステータスを「着陸」に変更
      updateDronePosition(droneId, {
        status: 'landing',
        flightMode: 'landing',
      })

      // 該当ドローンの未確認アラートを確認済みにする
      alerts
        .filter((a) => a.droneId === droneId && !a.acknowledged)
        .forEach((a) => acknowledgeAlert(a.id, 'system'))

      notifyAlert({
        id: `land-${droneId}-${Date.now()}`,
        type: 'system_command',
        severity: 'warning',
        droneId,
        droneName,
        message: `${droneName}: 即時着陸中`,
        details: 'ドローンは現在位置で即時着陸を開始しました',
        timestamp: new Date(),
        acknowledged: true,
      })
    },
    [activeDrones, alerts, acknowledgeAlert, updateDronePosition, notifyAlert]
  )

  // ドローン右クリックコンテキストメニューハンドラー
  const handleDroneContextMenu = useCallback(
    (drone: DroneFlightStatus, event: React.MouseEvent) => {
      event.preventDefault()
      setContextMenu({
        mouseX: event.clientX,
        mouseY: event.clientY,
        drone,
      })
    },
    []
  )

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const flyingDrones = filteredDrones.filter((d) => d.status === 'in_flight')
  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged).length

  // モックFPVストリームURL（デモ用）
  // TODO: 本番環境では実際のドローンFPVストリームURLに置き換える
  // 理想的な映像: 山岳、地上、海、施設上空などのドローン撮影映像
  const mockFpvUrls = useMemo(() => {
    const urls = new Map<string, string>()
    // 異なる動画を各ドローンに割り当て（デモ用プレースホルダー）
    const sampleVideos = [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', // アクション映像
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4', // 屋外映像
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4', // 地上走行映像
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // アクション映像2
    ]
    filteredDrones.forEach((drone, index) => {
      urls.set(drone.droneId, sampleVideos[index % sampleVideos.length])
    })
    return urls
  }, [filteredDrones])

  return (
    <Box
      sx={{
        height: fullscreenMode ? 'calc(100vh - 16px)' : '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: fullscreenMode ? 1 : 2,
      }}>
      {/* コンパクトヘッダー */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}>
        <Paper
          elevation={0}
          sx={{
            px: fullscreenMode ? 1.5 : 2.5,
            py: fullscreenMode ? 0.75 : 1.5,
            borderRadius: fullscreenMode ? 1.5 : 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: fullscreenMode ? 1 : 2,
            background:
              theme.palette.mode === 'dark'
                ? alpha(colors.gray[900], 0.6)
                : alpha('#fff', 0.9),
            border: `1px solid ${alpha(colors.gray[500], 0.1)}`,
            backdropFilter: 'blur(10px)',
          }}>
          {/* 左側: タイトルと統計 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: fullscreenMode ? 2 : 3,
              flexWrap: 'wrap',
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {scheduledFlight && (
                <Tooltip title='Pre-Flight Lobbyに戻る'>
                  <IconButton
                    onClick={() => navigate('/utm/pre-flight-lobby')}
                    size='small'
                    sx={{ mr: 0.5 }}>
                    <ChevronLeftIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Box
                sx={{
                  width: fullscreenMode ? 32 : 40,
                  height: fullscreenMode ? 32 : 40,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `linear-gradient(135deg, ${colors.primary[600]}, ${colors.primary[400]})`,
                  boxShadow: `0 2px 10px ${alpha(colors.primary[500], 0.3)}`,
                }}>
                <RadarIcon
                  sx={{ fontSize: fullscreenMode ? 18 : 22, color: '#fff' }}
                />
              </Box>
              <Box>
                <Typography
                  variant={fullscreenMode ? 'subtitle1' : 'h6'}
                  fontWeight={700}
                  sx={{ lineHeight: 1.2 }}>
                  {scheduledFlight
                    ? scheduledFlight.flightPlan.name
                    : fullscreenMode
                      ? 'UTM'
                      : 'UTM Control Center'}
                </Typography>
                {scheduledFlight ? (
                  <Typography variant='caption' color='text.secondary'>
                    リアルタイム監視
                  </Typography>
                ) : (
                  <LiveIndicator active={isSimulationRunning} />
                )}
              </Box>
            </Box>

            {/* プロジェクト選択ドロップダウン */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                bgcolor: alpha(colors.primary[500], 0.08),
                border: `1px solid ${alpha(colors.primary[500], 0.2)}`,
              }}>
              <Tooltip title='プロジェクト選択' arrow placement='bottom'>
                <FolderOpenIcon
                  sx={{
                    fontSize: fullscreenMode ? 16 : 20,
                    color: colors.primary[500],
                    cursor: 'default',
                  }}
                />
              </Tooltip>
              <Select
                size='small'
                multiple
                open={projectSelectOpen}
                onOpen={() => setProjectSelectOpen(true)}
                onClose={() => setProjectSelectOpen(false)}
                value={selectedProjectIds}
                onChange={(e) => {
                  const value = e.target.value
                  const ids =
                    typeof value === 'string'
                      ? value.split(',')
                      : (value as string[])

                  // 新規追加
                  ids.forEach((id, index) => {
                    if (index === 0 && !selectedProjectIds.includes(id)) {
                      selectProject(id)
                    } else if (!selectedProjectIds.includes(id)) {
                      toggleProjectSelection(id)
                    }
                  })
                  // 選択解除
                  selectedProjectIds.forEach((id) => {
                    if (!ids.includes(id)) {
                      toggleProjectSelection(id)
                    }
                  })
                  // Zoom状態をリセット
                  resetZoomStates()
                }}
                displayEmpty
                variant='standard'
                disableUnderline
                sx={{
                  minWidth: fullscreenMode ? 100 : 160,
                  maxWidth: fullscreenMode ? 160 : 260,
                  '& .MuiSelect-select': {
                    py: 0,
                    pr: '24px !important',
                    fontSize: fullscreenMode ? '0.75rem' : '0.875rem',
                    fontWeight: 600,
                  },
                  '& .MuiSelect-icon': {
                    color: colors.primary[500],
                  },
                }}
                renderValue={(selected) => {
                  const ids = selected as string[]
                  if (!ids || ids.length === 0) {
                    return (
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ fontSize: 'inherit' }}>
                        エリアを選択
                      </Typography>
                    )
                  }
                  if (ids.length === 1) {
                    // 1件選択時はプロジェクト名を表示
                    const project = projects.find((p) => p.id === ids[0])
                    if (project) {
                      const maxLen = fullscreenMode ? 12 : 18
                      const name = project.name
                      return name.length > maxLen
                        ? `${name.slice(0, maxLen)}...`
                        : name
                    }
                  }
                  return `${ids.length}件選択中`
                }}>
                {projects.map((project) => {
                  const isSelected = selectedProjectIds.includes(project.id)

                  return (
                    <MenuItem key={project.id} value={project.id}>
                      <Checkbox
                        checked={isSelected}
                        size='small'
                        sx={{ p: 0.5, mr: 1 }}
                      />
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor:
                              project.status === 'active'
                                ? colors.success.main
                                : project.status === 'scheduled'
                                  ? colors.info.main
                                  : project.status === 'standby'
                                    ? colors.warning.main
                                    : colors.gray[400],
                          }}
                        />
                        <Typography
                          variant='body2'
                          sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                          {project.name}
                        </Typography>
                      </Box>
                    </MenuItem>
                  )
                })}
              </Select>
            </Box>

            {/* コンパクト統計 - フルスクリーン時はさらにコンパクト */}
            <Stack
              direction='row'
              spacing={fullscreenMode ? 1 : 1.5}
              sx={{
                display: { xs: 'none', md: 'flex' },
              }}>
              {fullscreenMode ? (
                // フルスクリーン時のミニマル表示
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(colors.success.main, 0.1),
                    }}>
                    <FlightIcon
                      sx={{ fontSize: 14, color: colors.success.main }}
                    />
                    <Typography
                      variant='caption'
                      fontWeight={700}
                      sx={{ color: colors.success.main }}>
                      {flyingDrones.length}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(
                        statistics.criticalAlerts > 0
                          ? colors.error.main
                          : colors.warning.main,
                        0.1
                      ),
                    }}>
                    <WarningAmberIcon
                      sx={{
                        fontSize: 14,
                        color:
                          statistics.criticalAlerts > 0
                            ? colors.error.main
                            : colors.warning.main,
                      }}
                    />
                    <Typography
                      variant='caption'
                      fontWeight={700}
                      sx={{
                        color:
                          statistics.criticalAlerts > 0
                            ? colors.error.main
                            : colors.warning.main,
                      }}>
                      {statistics.activeAlerts}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(colors.info.main, 0.1),
                    }}>
                    <AccessTimeIcon
                      sx={{ fontSize: 14, color: colors.info.main }}
                    />
                    <Typography
                      variant='caption'
                      fontWeight={700}
                      sx={{ color: colors.info.main }}>
                      {statistics.totalFlightHoursToday.toFixed(1)}h
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: alpha(colors.primary[600], 0.1),
                    }}>
                    <AssignmentIcon
                      sx={{ fontSize: 14, color: colors.primary[600] }}
                    />
                    <Typography
                      variant='caption'
                      fontWeight={700}
                      sx={{ color: colors.primary[600] }}>
                      {statistics.approvedApplications}
                    </Typography>
                  </Box>
                </>
              ) : (
                // 通常時の表示
                <>
                  <MiniStat
                    icon={<FlightIcon fontSize='small' />}
                    value={flyingDrones.length}
                    label='飛行中'
                    color={colors.success.main}
                  />
                  <MiniStat
                    icon={<WarningAmberIcon fontSize='small' />}
                    value={statistics.activeAlerts}
                    label='アラート'
                    color={
                      statistics.criticalAlerts > 0
                        ? colors.error.main
                        : colors.warning.main
                    }
                  />
                  <MiniStat
                    icon={<AccessTimeIcon fontSize='small' />}
                    value={`${statistics.totalFlightHoursToday.toFixed(1)}h`}
                    label='飛行時間'
                    color={colors.info.main}
                  />
                  <MiniStat
                    icon={<AssignmentIcon fontSize='small' />}
                    value={statistics.approvedApplications}
                    label='承認済'
                    color={colors.primary[600]}
                  />
                </>
              )}
            </Stack>
          </Box>

          {/* 右側: コントロール */}
          <Stack direction='row' spacing={1.5} alignItems='center'>
            <FormControlLabel
              control={
                <Switch
                  checked={showZones}
                  onChange={(e) => setShowZones(e.target.checked)}
                  size='small'
                />
              }
              label={<Typography variant='caption'>区域表示</Typography>}
              sx={{ mr: 0 }}
            />

            <Tooltip title={is3DView ? '2Dビューに切替' : '3Dビューに切替'}>
              <IconButton
                size='small'
                onClick={() => setIs3DView(!is3DView)}
                disabled={viewMode === 'grid'}
                sx={{
                  bgcolor: is3DView
                    ? alpha(colors.primary[500], 0.2)
                    : alpha(colors.gray[500], 0.1),
                  color: is3DView ? colors.primary[500] : 'inherit',
                  '&:hover': { bgcolor: alpha(colors.primary[500], 0.2) },
                  '&.Mui-disabled': { opacity: 0.5 },
                }}>
                {is3DView ? (
                  <ThreeDRotationIcon fontSize='small' />
                ) : (
                  <MapIcon fontSize='small' />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip
              title={
                viewMode === 'grid' ? 'マップ表示に切替 (V)' : 'ビデオ表示 (V)'
              }>
              <IconButton
                size='small'
                onClick={() => {
                  const newMode = viewMode === 'map' ? 'grid' : 'map'
                  setViewMode(newMode)
                  resetZoomStates()
                  // マップモードに戻る時にリサイズとフォーカス復元
                  if (newMode === 'map') {
                    setTimeout(() => {
                      mapControlRef.current?.resize()
                      // 選択中のドローンがあればフォーカスを復元
                      if (selectedDroneId) {
                        mapControlRef.current?.recenter()
                      }
                    }, 200)
                  }
                }}
                sx={{
                  bgcolor:
                    viewMode === 'grid'
                      ? alpha(colors.success.main, 0.2)
                      : alpha(colors.gray[500], 0.1),
                  color: viewMode === 'grid' ? colors.success.main : 'inherit',
                  '&:hover': { bgcolor: alpha(colors.success.main, 0.2) },
                }}>
                <VideocamIcon fontSize='small' />
              </IconButton>
            </Tooltip>

            <Tooltip
              title={
                multiViewEnabled ? '単一表示に戻る (M)' : 'マルチビュー (M)'
              }>
              <IconButton
                size='small'
                onClick={() => {
                  const nextMultiView = !multiViewEnabled
                  setMultiViewEnabled(nextMultiView)
                  // モード変更後にマップリサイズとズーム状態リセット
                  resetZoomStates()
                  setTimeout(() => {
                    mapControlRef.current?.resize()
                    // 単一ビューに戻る時、選択中のドローンがあればフォーカスを復元
                    if (!nextMultiView && selectedDroneId) {
                      mapControlRef.current?.recenter()
                    }
                  }, 200)
                }}
                disabled={viewMode === 'grid'}
                sx={{
                  bgcolor: multiViewEnabled
                    ? alpha(colors.info.main, 0.2)
                    : alpha(colors.gray[500], 0.1),
                  color: multiViewEnabled ? colors.info.main : 'inherit',
                  '&:hover': { bgcolor: alpha(colors.info.main, 0.2) },
                  '&.Mui-disabled': { opacity: 0.5 },
                }}>
                <ViewColumnIcon fontSize='small' />
              </IconButton>
            </Tooltip>

            <Tooltip title='データ更新'>
              <IconButton size='small' onClick={initializeMockData}>
                <RefreshIcon fontSize='small' />
              </IconButton>
            </Tooltip>

            <Button
              variant='contained'
              size='small'
              color={isSimulationRunning ? 'error' : 'success'}
              startIcon={isSimulationRunning ? <StopIcon /> : <PlayArrowIcon />}
              onClick={handleSimulationSubmit}
              sx={{ px: 2, borderRadius: 1.5, fontWeight: 600 }}>
              {isSimulationRunning ? '停止' : '開始'}
            </Button>

            <Tooltip
              title={
                multiViewEnabled
                  ? 'HUDはマルチビュー時無効'
                  : !selectedDroneId
                    ? 'ドローンを選択してください'
                    : showHUD
                      ? 'HUD表示OFF'
                      : 'パイロットHUD表示'
              }>
              <span>
                <IconButton
                  size='small'
                  onClick={() => setShowHUD(!showHUD)}
                  disabled={!selectedDroneId || multiViewEnabled}
                  sx={{
                    bgcolor: showHUD
                      ? alpha('#00ff88', 0.2)
                      : alpha(colors.gray[500], 0.1),
                    color: showHUD ? '#00ff88' : 'inherit',
                    '&:hover': {
                      bgcolor: showHUD
                        ? alpha('#00ff88', 0.3)
                        : alpha(colors.gray[500], 0.2),
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    },
                  }}>
                  <CenterFocusStrongIcon fontSize='small' />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip
              title={
                multiViewEnabled
                  ? 'マルチビュー時は無効'
                  : compactWidgets
                    ? 'ウィジェット展開 (W)'
                    : 'ウィジェットコンパクト化 (W)'
              }>
              <span>
                <IconButton
                  size='small'
                  onClick={() => setCompactWidgets((prev) => !prev)}
                  disabled={multiViewEnabled}
                  sx={{
                    bgcolor: compactWidgets
                      ? alpha(colors.primary[500], 0.2)
                      : alpha(colors.gray[500], 0.1),
                    color: compactWidgets ? colors.primary[500] : 'inherit',
                    '&:hover': { bgcolor: alpha(colors.primary[500], 0.2) },
                    '&.Mui-disabled': { opacity: 0.5 },
                  }}>
                  <CompressIcon fontSize='small' />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip
              title={
                fullscreenMode ? 'フルスクリーン解除 (F)' : 'フルスクリーン (F)'
              }>
              <IconButton
                size='small'
                onClick={toggleFullscreenMode}
                sx={{
                  bgcolor: fullscreenMode
                    ? alpha(colors.info.main, 0.2)
                    : alpha(colors.info.main, 0.1),
                  color: fullscreenMode ? colors.info.main : 'inherit',
                  '&:hover': { bgcolor: alpha(colors.info.main, 0.2) },
                }}>
                {fullscreenMode ? (
                  <FullscreenExitIcon fontSize='small' />
                ) : (
                  <FullscreenIcon fontSize='small' />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title='ヘルプ (Cmd/Ctrl+K)'>
              <IconButton
                size='small'
                aria-label='ヘルプを開く'
                onClick={() => setHelpModalOpen(true)}
                sx={{
                  bgcolor: alpha(colors.gray[500], 0.08),
                  '&:hover': { bgcolor: alpha(colors.gray[500], 0.16) },
                }}>
                <HelpOutlineIcon fontSize='small' />
              </IconButton>
            </Tooltip>

            {/* サウンド設定 */}
            <Tooltip title='アラートサウンド設定'>
              <IconButton
                size='small'
                aria-label='アラートサウンド設定'
                onClick={(e) => setSoundAnchorEl(e.currentTarget)}
                sx={{
                  bgcolor: soundSettings.enabled
                    ? alpha(colors.info.main, 0.15)
                    : alpha(colors.gray[500], 0.08),
                  color: soundSettings.enabled ? colors.info.main : 'inherit',
                  '&:hover': {
                    bgcolor: soundSettings.enabled
                      ? alpha(colors.info.main, 0.25)
                      : alpha(colors.gray[500], 0.16),
                  },
                }}>
                {soundSettings.enabled ? (
                  <NotificationsActiveIcon fontSize='small' />
                ) : (
                  <NotificationsOffIcon fontSize='small' />
                )}
              </IconButton>
            </Tooltip>
            <Popover
              open={Boolean(soundAnchorEl)}
              anchorEl={soundAnchorEl}
              onClose={() => setSoundAnchorEl(null)}
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
                    p: 2,
                    minWidth: 220,
                    borderRadius: 2,
                  },
                },
              }}>
              <Typography variant='subtitle2' fontWeight={700} sx={{ mb: 1.5 }}>
                アラートサウンド設定
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      size='small'
                      checked={soundSettings.enabled}
                      onChange={(e) =>
                        updateSoundSettings({ enabled: e.target.checked })
                      }
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {soundSettings.enabled ? (
                        <VolumeUpIcon fontSize='small' />
                      ) : (
                        <VolumeOffIcon fontSize='small' />
                      )}
                      <Typography variant='body2'>サウンドON/OFF</Typography>
                    </Box>
                  }
                />
                <Divider sx={{ my: 1 }} />
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mb: 0.5 }}>
                  レベル別設定
                </Typography>
                <FormControlLabel
                  disabled={!soundSettings.enabled}
                  control={
                    <Switch
                      size='small'
                      checked={soundSettings.warningSound}
                      onChange={(e) =>
                        updateSoundSettings({ warningSound: e.target.checked })
                      }
                    />
                  }
                  label={
                    <Typography
                      variant='body2'
                      sx={{ color: colors.warning.main }}>
                      警告 (Warning)
                    </Typography>
                  }
                />
                <FormControlLabel
                  disabled={!soundSettings.enabled}
                  control={
                    <Switch
                      size='small'
                      checked={soundSettings.errorSound}
                      onChange={(e) =>
                        updateSoundSettings({ errorSound: e.target.checked })
                      }
                    />
                  }
                  label={
                    <Typography
                      variant='body2'
                      sx={{ color: colors.error.main }}>
                      エラー (Error)
                    </Typography>
                  }
                />
                <FormControlLabel
                  disabled={!soundSettings.enabled}
                  control={
                    <Switch
                      size='small'
                      checked={soundSettings.emergencySound}
                      onChange={(e) =>
                        updateSoundSettings({
                          emergencySound: e.target.checked,
                        })
                      }
                    />
                  }
                  label={
                    <Typography
                      variant='body2'
                      sx={{ color: colors.error.dark }}>
                      緊急 (Emergency)
                    </Typography>
                  }
                />
              </FormGroup>
            </Popover>

            <Tooltip
              title={
                resolvedMode === 'dark'
                  ? 'ライトモードに切替'
                  : 'ダークモードに切替'
              }>
              <IconButton
                size='small'
                onClick={toggleThemeMode}
                aria-label='テーマモード切替'
                sx={{
                  bgcolor:
                    resolvedMode === 'dark'
                      ? alpha(colors.warning.main, 0.15)
                      : alpha(colors.primary[500], 0.1),
                  color:
                    resolvedMode === 'dark'
                      ? colors.warning.main
                      : colors.primary[500],
                  '&:hover': {
                    bgcolor:
                      resolvedMode === 'dark'
                        ? alpha(colors.warning.main, 0.25)
                        : alpha(colors.primary[500], 0.2),
                  },
                }}>
                {resolvedMode === 'dark' ? (
                  <LightModeIcon fontSize='small' />
                ) : (
                  <DarkModeIcon fontSize='small' />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Paper>
      </motion.div>
      {/* メインコンテンツ: (マップ + タイムライン) + サイドパネル */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, minHeight: 0 }}>
        {/* 左エリア: マップ + タイムライン */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            gap: fullscreenMode ? 1 : 2,
          }}>
          {/* マップエリア */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            {viewMode === 'grid' ? (
              // ビデオグリッド表示
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: `1px solid ${alpha(colors.gray[500], 0.1)}`,
                }}>
                <UTMMultiDroneGrid
                  drones={filteredDrones}
                  alerts={alerts}
                  fpvStreamUrls={mockFpvUrls}
                  selectedDroneId={selectedDroneId ?? undefined}
                  columns={2}
                  onDroneSelect={(droneId) => {
                    setSelectedDroneId(
                      droneId === selectedDroneId ? null : droneId
                    )
                    resetZoomStates()
                  }}
                  height='100%'
                />
              </Paper>
            ) : !multiViewEnabled || selectedProjectIds.length <= 1 ? (
              // 単一マップ表示
              <Paper
                elevation={0}
                sx={{
                  height: '100%',
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: `1px solid ${alpha(colors.gray[500], 0.1)}`,
                }}>
                <UTMTrackingMap
                  drones={filteredDrones}
                  restrictedZones={restrictedZones}
                  onDroneClick={handleDroneSelect}
                  onDroneContextMenu={handleDroneContextMenu}
                  onMapClick={handleMapClick}
                  selectedDroneId={selectedDroneId}
                  showZones={showZones}
                  is3DView={is3DView}
                  height='100%'
                  leftOffset={sidebarWidth}
                  registerFitAllDronesHandler={registerFitAllDronesHandler}
                  registerMapControl={registerMapControl}
                  alerts={alerts}
                  flightAreas={getProjectFlightAreas()}
                  showFlightAreas={true}
                  onFitToSelectedProjects={handleFitToSelectedProjects}
                  selectedProjectCount={selectedProjectIds.length}
                  onFitToAllDronesNationwide={handleFitToAllDronesNationwide}
                />
              </Paper>
            ) : (
              // マルチビュー表示（選択数に応じた動的グリッド）
              <Grid container spacing={1} sx={{ height: '100%' }}>
                {(() => {
                  const selectedProjects = getSelectedProjects()
                  const count = selectedProjects.length
                  // グリッドレイアウト計算: 1→1x1, 2→1x2, 3→2x2(1空), 4→2x2, 5→2x3(1空), 6→2x3
                  const cols = count <= 2 ? count : count <= 4 ? 2 : 3
                  const rows = Math.ceil(count / cols)
                  const colSize = 12 / cols
                  const rowHeight = `${100 / rows}%`

                  return selectedProjects.map((project) => {
                    // パフォーマンス最適化: 各関数を1回だけ呼び出してキャッシュ
                    const projectDrones = getDronesForProject(project.id)
                    const projectAlerts = alerts.filter((a) =>
                      projectDrones.some((d) => d.droneId === a.droneId)
                    )
                    const projectFlightAreas = getFlightAreaForProject(
                      project.id
                    )

                    return (
                      <Grid
                        key={project.id}
                        size={{ xs: colSize, md: colSize }}
                        sx={{ height: rowHeight }}>
                        <Paper
                          elevation={0}
                          tabIndex={0}
                          onFocus={() => setFocusedPanelId(project.id)}
                          onClick={() => setFocusedPanelId(project.id)}
                          sx={{
                            height: '100%',
                            overflow: 'hidden',
                            borderRadius: 1.5,
                            border:
                              focusedPanelId === project.id
                                ? `2px solid ${colors.primary[500]}`
                                : `1px solid ${alpha(colors.gray[500], 0.15)}`,
                            position: 'relative',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                            '&:focus': {
                              borderColor: colors.primary[500],
                              borderWidth: 2,
                            },
                          }}>
                          {/* プロジェクト名ヘッダー（左上） */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 8,
                              left: 8,
                              zIndex: 10,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              gap: 0.5,
                            }}>
                            {/* プロジェクト名とステータス */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}>
                              <Box
                                sx={{
                                  px: 1.5,
                                  py: 0.5,
                                  borderRadius: 1,
                                  bgcolor: alpha(
                                    project.flightArea?.color ||
                                      colors.primary[500],
                                    0.9
                                  ),
                                  backdropFilter: 'blur(4px)',
                                }}>
                                <Typography
                                  variant='caption'
                                  fontWeight={700}
                                  sx={{ color: '#fff' }}>
                                  {project.name.length > 20
                                    ? `${project.name.slice(0, 20)}...`
                                    : project.name}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor:
                                    project.status === 'active'
                                      ? colors.success.main
                                      : project.status === 'scheduled'
                                        ? colors.info.main
                                        : colors.warning.main,
                                  animation:
                                    project.status === 'active'
                                      ? 'pulse-dot 2s infinite'
                                      : 'none',
                                }}
                              />
                            </Box>
                            {/* 気象情報（地域名の下） */}
                            {project.centerCoordinates && (
                              <MiniWeatherBadge
                                latitude={project.centerCoordinates[1]}
                                longitude={project.centerCoordinates[0]}
                              />
                            )}
                          </Box>
                          <MemoizedUTMTrackingMap
                            drones={projectDrones}
                            restrictedZones={restrictedZones}
                            onDroneClick={handleDroneSelect}
                            onDroneContextMenu={handleDroneContextMenu}
                            onMapClick={handleMapClick}
                            selectedDroneId={selectedDroneId}
                            showZones={showZones}
                            is3DView={is3DView}
                            height='100%'
                            leftOffset={0}
                            alerts={projectAlerts}
                            flightAreas={projectFlightAreas}
                            showFlightAreas={true}
                            initialCenter={project.centerCoordinates}
                            initialZoom={11}
                            autoFitBounds={true}
                            showFitToAreaButton={true}
                            isMultiViewPanel={true}
                            registerMapControl={(handler) =>
                              registerMultiViewMapControl(project.id, handler)
                            }
                          />
                          {/* コンパクト機体ステータスバー */}
                          {projectDrones.length > 0 && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                right: 8,
                                zIndex: 10,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                flexWrap: 'wrap',
                              }}>
                              {projectDrones.map((drone) => {
                                const isSelected =
                                  selectedDroneId === drone.droneId
                                const droneColorObj = getDroneDisplayColor(
                                  drone.droneId,
                                  drone.plannedRoute?.color
                                )
                                const droneColor = droneColorObj.main
                                const batteryLevel = drone.batteryLevel
                                const batteryColor =
                                  batteryLevel > 50
                                    ? colors.success.main
                                    : batteryLevel > 20
                                      ? colors.warning.main
                                      : colors.error.main
                                return (
                                  <Tooltip
                                    key={drone.droneId}
                                    title={
                                      isSelected
                                        ? ''
                                        : `${drone.pilotName || drone.droneId} - ${batteryLevel}%`
                                    }
                                    arrow
                                    disableHoverListener={isSelected}>
                                    <Box
                                      onClick={() => handleDroneSelect(drone)}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: isSelected ? 1 : 0.5,
                                        px: isSelected ? 1.5 : 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                        bgcolor: alpha(
                                          isSelected ? droneColor : '#000',
                                          isSelected ? 0.9 : 0.6
                                        ),
                                        border: isSelected
                                          ? `2px solid ${droneColor}`
                                          : '1px solid transparent',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                          bgcolor: alpha(droneColor, 0.8),
                                        },
                                      }}>
                                      <FlightIcon
                                        sx={{
                                          fontSize: isSelected ? 16 : 14,
                                          color: isSelected
                                            ? '#fff'
                                            : droneColor,
                                        }}
                                      />
                                      {isSelected ? (
                                        // 選択中は詳細表示
                                        <>
                                          <Typography
                                            variant='caption'
                                            sx={{
                                              color: '#fff',
                                              fontWeight: 600,
                                              fontSize: '0.65rem',
                                            }}>
                                            {batteryLevel}%
                                          </Typography>
                                          <Typography
                                            variant='caption'
                                            sx={{
                                              color: alpha('#fff', 0.8),
                                              fontSize: '0.625rem',
                                            }}>
                                            {drone.position.altitude.toFixed(0)}
                                            m
                                          </Typography>
                                          <Typography
                                            variant='caption'
                                            sx={{
                                              color: alpha('#fff', 0.8),
                                              fontSize: '0.625rem',
                                            }}>
                                            {drone.position.speed.toFixed(1)}m/s
                                          </Typography>
                                        </>
                                      ) : (
                                        // 非選択時はバッテリーバーのみ
                                        <Box
                                          sx={{
                                            width: 4,
                                            height: 12,
                                            borderRadius: 0.5,
                                            bgcolor: batteryColor,
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Tooltip>
                                )
                              })}
                            </Box>
                          )}
                        </Paper>
                      </Grid>
                    )
                  })
                })()}
              </Grid>
            )}

            {/* 気象情報ウィジェット（マップ左上に配置）- グリッド表示時は非表示 */}
            {/*
            HUD表示時の要件:
            - 「飛行条件/短期予報」ウィジェットはマップ領域の左端に固定
            - HUD(特にSPDテープ/機体名)はウィジェットの右側に配置して重なりを避ける
          */}
            {viewMode === 'map' &&
              (!multiViewEnabled || selectedProjectIds.length <= 1) &&
              (() => {
                const widgetDockWidth = 300
                // このBoxは「マップコンテナ(relative)」基準なので、sidebarWidthを足すと二重オフセットになる
                const leftDockX = 16
                // 飛行条件の座標を決定（優先順位: 選択ドローン > プロジェクト中心 > デフォルト東京）
                let weatherLat = 35.65
                let weatherLng = 139.77

                // 選択中のドローンがあればその位置を使用
                const selectedDrone = selectedDroneId
                  ? activeDrones.find((d) => d.droneId === selectedDroneId)
                  : null
                if (selectedDrone) {
                  weatherLat = selectedDrone.position.latitude
                  weatherLng = selectedDrone.position.longitude
                } else {
                  // ドローン未選択時はプロジェクトの中心座標を使用
                  const selectedProjects = getSelectedProjects()
                  if (
                    selectedProjects.length > 0 &&
                    selectedProjects[0].centerCoordinates
                  ) {
                    const [lng, lat] = selectedProjects[0].centerCoordinates
                    weatherLat = lat
                    weatherLng = lng
                  }
                }
                return (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: leftDockX,
                      width: widgetDockWidth,
                      maxWidth: 'calc(100% - 16px)',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}>
                    <UTMWeatherWidget
                      key={`weather-${weatherLat.toFixed(2)}-${weatherLng.toFixed(2)}`}
                      latitude={weatherLat}
                      longitude={weatherLng}
                      updateInterval={60000}
                      compact={false}
                      forceCollapse={compactWidgets}
                    />
                    <UTMForecastTimeline
                      updateInterval={30000}
                      forceCollapse={compactWidgets}
                    />
                  </Box>
                )
              })()}

            {/* 選択ドローン詳細ウィジェット（単一ビュー・HUD非表示時のみ、右下に配置） */}
            {/* マルチビュー時は各パネル下部のコンパクトステータスバーを使用 */}
            {viewMode === 'map' &&
              selectedDroneId &&
              !showHUD &&
              !multiViewEnabled &&
              (() => {
                const selectedDrone = activeDrones.find(
                  (d) => d.droneId === selectedDroneId
                )
                if (!selectedDrone) return null

                // DroneFlightStatus → ExtendedDroneInfo 変換
                const extendedDrone = droneFlightStatusToExtended(selectedDrone)

                // 選択されたドローンが属するプロジェクト/エリア情報を取得
                const selectedProjects = getSelectedProjects()
                let areaName: string | undefined
                if (selectedDrone.projectId && selectedProjects.length > 0) {
                  const project = selectedProjects.find(
                    (p) => p.id === selectedDrone.projectId
                  )
                  if (project) {
                    areaName = project.flightArea?.name
                  }
                }

                return (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      zIndex: 20,
                    }}>
                    <UTMDroneDetailWidget
                      drone={extendedDrone}
                      flightStatus={selectedDrone.status as FlightStatus}
                      areaName={areaName}
                      compact={droneWidgetCollapsed}
                      onToggle={() => setDroneWidgetCollapsed((prev) => !prev)}
                      sx={{ maxWidth: 400 }}
                    />
                  </Box>
                )
              })()}

            {/* パイロットHUDオーバーレイ - グリッド表示時は非表示 */}
            {viewMode === 'map' && showHUD && selectedDroneId && (
              <UTMPilotHUD
                drone={
                  activeDrones.find((d) => d.droneId === selectedDroneId) ||
                  null
                }
                visible={showHUD}
                // ウィジェット展開時: 左上ウィジェット（left:16, width:300）の右に配置
                // ウィジェット折りたたみ時: 左端に寄せる（0）
                leftDockWidth={compactWidgets ? 0 : 16 + 300}
              />
            )}
          </motion.div>

          {/* フライトタイムライン */}
          <Box
            sx={{
              height: fullscreenMode
                ? timelineExpanded
                  ? 180
                  : 80
                : timelineExpanded
                  ? 350
                  : 200,
              flexShrink: 0,
              position: 'relative',
              transition: 'height 0.3s ease',
            }}>
            {/* 展開/折りたたみトグルボタン */}
            <Tooltip
              title={
                timelineExpanded
                  ? 'タイムラインを縮小 (T)'
                  : 'タイムラインを拡大 (T)'
              }>
              <IconButton
                size='small'
                onClick={() => setTimelineExpanded(!timelineExpanded)}
                sx={{
                  position: 'absolute',
                  top: -14,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                  bgcolor: colors.primary[500],
                  color: '#fff',
                  border: `2px solid ${alpha('#fff', 0.9)}`,
                  width: 32,
                  height: 20,
                  borderRadius: 2,
                  boxShadow: `0 2px 8px ${alpha('#000', 0.25)}`,
                  '&:hover': {
                    bgcolor: colors.primary[600],
                  },
                }}>
                {timelineExpanded ? (
                  <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                ) : (
                  <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>
            </Tooltip>
            <UTMFlightTimeline
              drones={filteredDrones}
              selectedDroneId={selectedDroneId}
              onDroneSelect={(droneId) => {
                setSelectedDroneId(droneId === selectedDroneId ? null : droneId)
                resetZoomStates()
              }}
              timeRangeHours={4}
              droneEvents={droneTimelineEvents}
              showDetailPanel={!fullscreenMode || timelineExpanded}
              compact={fullscreenMode && !timelineExpanded}
            />
          </Box>
        </Box>

        {/* サイドパネルトグル + パネル */}
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* リサイズハンドル */}
          {sidePanelOpen && (
            <ResizableDivider
              onResize={handleSidebarResize}
              orientation='vertical'
            />
          )}

          {/* パネル開閉トグル */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: 1,
              pt: 1,
            }}>
            <Tooltip
              title={sidePanelOpen ? 'パネルを閉じる' : 'パネルを開く'}
              placement='left'>
              <IconButton
                onClick={() => setSidePanelOpen(!sidePanelOpen)}
                sx={{
                  width: 24,
                  height: 48,
                  bgcolor: alpha(colors.primary[500], 0.1),
                  borderRadius: '8px 0 0 8px',
                  '&:hover': { bgcolor: alpha(colors.primary[500], 0.2) },
                }}>
                {sidePanelOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Tooltip>
            {/* 閉じた時のドローンリスト */}
            {!sidePanelOpen && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.75,
                  p: 0.5,
                  borderRadius: '8px 0 0 8px',
                  bgcolor: alpha(colors.primary[500], 0.05),
                  maxHeight: 'calc(100vh - 200px)',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': { width: 3 },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: alpha(colors.gray[500], 0.3),
                    borderRadius: 1,
                  },
                }}>
                {filteredDrones.map((drone) => {
                  const isSelected = selectedDroneId === drone.droneId
                  const droneColor = getDroneDisplayColor(
                    drone.droneId,
                    drone.plannedRoute?.color
                  )
                  // プロジェクト情報を取得
                  const droneProject = drone.projectId
                    ? projects.find((p) => p.id === drone.projectId)
                    : null
                  return (
                    <Tooltip
                      key={drone.droneId}
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography
                            variant='subtitle2'
                            fontWeight={700}
                            sx={{ mb: 0.5 }}>
                            {drone.droneName}
                          </Typography>
                          {droneProject && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                mb: 0.5,
                              }}>
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor:
                                    droneProject.flightArea?.color ||
                                    colors.primary[500],
                                }}
                              />
                              <Typography
                                variant='caption'
                                sx={{
                                  color:
                                    droneProject.flightArea?.color ||
                                    colors.primary[300],
                                  fontWeight: 600,
                                }}>
                                {droneProject.location}
                              </Typography>
                            </Box>
                          )}
                          <Typography variant='caption' display='block'>
                            パイロット: {drone.pilotName}
                          </Typography>
                          <Typography variant='caption' display='block'>
                            高度: {drone.position.altitude.toFixed(0)}m
                          </Typography>
                          <Typography variant='caption' display='block'>
                            バッテリー: {drone.batteryLevel.toFixed(0)}%
                          </Typography>
                          <Typography variant='caption' display='block'>
                            速度: {drone.position.speed.toFixed(1)}m/s
                          </Typography>
                        </Box>
                      }
                      placement='left'
                      arrow>
                      <IconButton
                        size='small'
                        onClick={() => handleDroneSelect(drone)}
                        sx={{
                          p: 0.5,
                          bgcolor: isSelected
                            ? alpha(droneColor.main, 0.25)
                            : alpha(droneColor.main, 0.12),
                          border: isSelected
                            ? `2px solid ${droneColor.main}`
                            : `1px solid ${alpha(droneColor.main, 0.35)}`,
                          '&:hover': {
                            bgcolor: alpha(droneColor.main, 0.18),
                          },
                        }}>
                        <FlightIcon
                          sx={{
                            fontSize: 16,
                            color: droneColor.main,
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  )
                })}
              </Box>
            )}
          </Box>

          {/* サイドパネル（折りたたみ可能） */}
          <Collapse in={sidePanelOpen} orientation='horizontal' timeout={300}>
            <Box
              sx={{
                width: sidePanelWidth,
                minWidth: 240,
                maxWidth: 600,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: fullscreenMode ? 1 : 2,
                transition: 'width 0.2s ease',
              }}>
              {/* 上部: タブ切り替え（ドローン・監視設定） */}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(colors.gray[500], 0.1)}`,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant='fullWidth'
                    sx={{
                      minHeight: fullscreenMode ? 36 : 44,
                      '& .MuiTab-root': {
                        minHeight: fullscreenMode ? 36 : 44,
                        py: fullscreenMode ? 0.5 : 1,
                        fontWeight: 600,
                        fontSize: fullscreenMode ? '0.75rem' : '0.8rem',
                      },
                    }}>
                    <Tab
                      icon={<ListIcon sx={{ fontSize: 18 }} />}
                      iconPosition='start'
                      label={`ドローン (${filteredDrones.length})`}
                    />
                    <Tab
                      icon={<SettingsIcon sx={{ fontSize: 18 }} />}
                      iconPosition='start'
                      label='監視設定'
                    />
                  </Tabs>
                </Paper>

                {/* パネルコンテンツ */}
                <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', mt: 1 }}>
                  {activeTab === 0 ? (
                    <UTMDroneListPanel
                      drones={filteredDrones}
                      selectedDroneId={selectedDroneId}
                      onDroneSelect={handleDroneSelect}
                      alerts={alerts}
                      projects={projects}
                    />
                  ) : (
                    <UTMProjectDroneSelector
                      projects={projects}
                      activeDrones={filteredDrones}
                      onOpenDroneSettings={handleOpenDroneSettings}
                      sx={{ height: '100%' }}
                    />
                  )}
                </Box>
              </Box>

              {/* リサイズハンドル */}
              <Box
                sx={{
                  height: 8,
                  flexShrink: 0,
                  cursor: 'row-resize',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: isResizing
                    ? alpha(colors.primary[500], 0.1)
                    : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(colors.primary[500], 0.05),
                  },
                }}
                onMouseDown={(e) => {
                  e.preventDefault()
                  setIsResizing(true)
                  const startY = e.clientY
                  const startHeight = alertPanelHeight

                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const deltaY = startY - moveEvent.clientY
                    const newHeight = Math.max(
                      100,
                      Math.min(500, startHeight + deltaY)
                    )
                    setAlertPanelHeight(newHeight)
                  }

                  const handleMouseUp = () => {
                    setIsResizing(false)
                    document.removeEventListener('mousemove', handleMouseMove)
                    document.removeEventListener('mouseup', handleMouseUp)
                  }

                  document.addEventListener('mousemove', handleMouseMove)
                  document.addEventListener('mouseup', handleMouseUp)
                }}>
                <Box
                  sx={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    bgcolor: alpha(colors.gray[500], 0.3),
                  }}
                />
              </Box>

              {/* 下部: アラートパネル */}
              <Box sx={{ height: alertPanelHeight, flexShrink: 0 }}>
                <Paper
                  elevation={0}
                  sx={{
                    height: '100%',
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(colors.gray[500], 0.1)}`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}>
                  {/* アラートヘッダー */}
                  <Box
                    sx={{
                      px: 2,
                      py: 1,
                      borderBottom: `1px solid ${alpha(colors.gray[500], 0.1)}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      flexShrink: 0,
                    }}>
                    <Box sx={{ position: 'relative', display: 'flex' }}>
                      <NotificationsIcon
                        sx={{ fontSize: 18, color: colors.primary[500] }}
                      />
                      {unacknowledgedAlerts > 0 && (
                        <Box
                          component={motion.div}
                          animate={{
                            scale: [1, 1.2, 1],
                            boxShadow: [
                              `0 0 0 0 ${alpha(colors.error.main, 0.7)}`,
                              `0 0 0 6px ${alpha(colors.error.main, 0)}`,
                              `0 0 0 0 ${alpha(colors.error.main, 0)}`,
                            ],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          sx={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: colors.error.main,
                            color: '#fff',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          {unacknowledgedAlerts}
                        </Box>
                      )}
                    </Box>
                    <Typography variant='subtitle2' fontWeight={600}>
                      アラート!
                    </Typography>
                  </Box>
                  {/* アラートコンテンツ */}
                  <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <UTMEnhancedAlertPanel
                      sx={{ height: '100%', border: 'none', borderRadius: 0 }}
                      height='100%'
                      onDroneSelect={handleDroneSelectById}
                      onHover={handleDroneHover}
                      onEmergencyReturn={handleDroneEmergencyReturn}
                    />
                  </Box>
                </Paper>
              </Box>

              {/* 制限区域サマリー - フルスクリーン時は非表示 */}
              {!fullscreenMode && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(colors.gray[500], 0.1)}`,
                  }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight={600}
                    sx={{ mb: 1.5 }}>
                    監視中の制限区域
                  </Typography>
                  <Grid container spacing={1}>
                    {[
                      {
                        level: 'prohibited',
                        label: '飛行禁止',
                        color: colors.error.main,
                        count: restrictedZones.filter(
                          (z) => z.level === 'prohibited'
                        ).length,
                      },
                      {
                        level: 'restricted',
                        label: '要許可',
                        color: colors.warning.main,
                        count: restrictedZones.filter(
                          (z) => z.level === 'restricted'
                        ).length,
                      },
                      {
                        level: 'caution',
                        label: '注意',
                        color: colors.info.main,
                        count: restrictedZones.filter(
                          (z) => z.level === 'caution'
                        ).length,
                      },
                    ].map((item) => (
                      <Grid size={{ xs: 4 }} key={item.level}>
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 1.5,
                            textAlign: 'center',
                            bgcolor: alpha(item.color, 0.1),
                            border: `1px solid ${alpha(item.color, 0.2)}`,
                          }}>
                          <Typography
                            variant='h6'
                            fontWeight={700}
                            sx={{ color: item.color }}>
                            {item.count}
                          </Typography>
                          <Typography variant='caption' color='text.secondary'>
                            {item.label}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </Box>
          </Collapse>
        </Box>
      </Box>

      {/* トースト通知（右下に1つだけ表示） */}
      <UTMToastNotification
        notifications={notifications}
        onClose={removeNotification}
        maxVisible={1}
      />

      {/* ヘルプモーダル */}
      <Dialog
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        maxWidth='md'
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: 2, maxHeight: '80vh' },
          },
        }}>
        <DialogTitle
          sx={{
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HelpOutlineIcon sx={{ color: colors.primary[500] }} />
            UTM Control Center ヘルプ
          </Box>
          <IconButton
            size='small'
            onClick={() => setHelpModalOpen(false)}
            aria-label='閉じる'>
            <CloseIcon fontSize='small' />
          </IconButton>
        </DialogTitle>

        {/* タブナビゲーション */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs
            value={helpModalTab}
            onChange={(_, v) => setHelpModalTab(v)}
            variant='scrollable'
            scrollButtons='auto'>
            <Tab
              icon={<KeyboardIcon sx={{ fontSize: 18 }} />}
              iconPosition='start'
              label='ショートカット'
              sx={{ minHeight: 48 }}
            />
            <Tab
              icon={<MapIcon sx={{ fontSize: 18 }} />}
              iconPosition='start'
              label='画面説明'
              sx={{ minHeight: 48 }}
            />
            <Tab
              icon={<InfoIcon sx={{ fontSize: 18 }} />}
              iconPosition='start'
              label='ステータス凡例'
              sx={{ minHeight: 48 }}
            />
            <Tab
              icon={<TouchAppIcon sx={{ fontSize: 18 }} />}
              iconPosition='start'
              label='操作ガイド'
              sx={{ minHeight: 48 }}
            />
          </Tabs>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {/* ショートカットタブ */}
          {helpModalTab === 0 && (
            <Box>
              <Typography
                variant='subtitle2'
                color='text.secondary'
                sx={{ mb: 2 }}>
                キーボードショートカットで素早く操作できます。Cmd/Ctrl+K
                でこのヘルプを開きます。
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight={700}
                    sx={{ mb: 1.5, color: colors.primary[500] }}>
                    表示切替
                  </Typography>
                  <List disablePadding dense>
                    {[
                      { key: 'Q', label: 'プロジェクト（地域）選択' },
                      { key: 'F', label: 'フルスクリーン切替' },
                      { key: 'S', label: 'サイドパネル開閉' },
                      { key: 'T', label: 'タイムライン展開/縮小' },
                      { key: 'W', label: 'ウィジェットコンパクト化' },
                      { key: 'M', label: 'マルチビュー（複数地域同時監視）' },
                      { key: 'V', label: 'ビデオ/マップ切替' },
                      { key: 'D', label: '区域表示ON/OFF' },
                      { key: '2', label: '2Dビュー' },
                      { key: '3', label: '3Dビュー' },
                      { key: 'C', label: 'マップ中心位置補正' },
                      { key: 'H', label: 'HUD表示（選択時のみ）' },
                      { key: 'A', label: '機体ステータス展開/折りたたみ' },
                      { key: 'O', label: 'ドローンタブ表示' },
                      { key: 'P', label: 'アラートタブ表示' },
                    ].map((item) => (
                      <ListItem key={item.key} sx={{ py: 0.5, px: 0 }}>
                        <ShortcutKey>{item.key}</ShortcutKey>
                        <ListItemText primary={item.label} sx={{ ml: 1.5 }} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight={700}
                    sx={{ mb: 1.5, color: colors.primary[500] }}>
                    操作・ナビゲーション
                  </Typography>
                  <List disablePadding dense>
                    {[
                      {
                        key: 'Z',
                        label: '選択エリア表示/ドローンフォーカス切替',
                      },
                      { key: 'J', label: '全国俯瞰/戻る' },
                      { key: 'Cmd/Ctrl+K', label: 'ヘルプを開く' },
                      { key: 'Cmd/Ctrl+S', label: 'シミュレーション開始/停止' },
                      { key: 'Cmd/Ctrl+↑↓', label: 'リスト選択移動' },
                      { key: 'Cmd/Ctrl+Click', label: 'アラート複数選択' },
                      {
                        key: 'Cmd/Ctrl+Enter',
                        label: 'アラート既読/未読トグル',
                      },
                      { key: 'Enter', label: '選択項目にズーム' },
                      {
                        key: 'Shift+Scroll',
                        label: 'タイムライン時間軸ズーム',
                      },
                      {
                        key: 'Cmd/Ctrl+Scroll',
                        label: 'タイムライン横移動（ズーム時）',
                      },
                      {
                        key: 'Shift++/-',
                        label: 'タイムラインズームイン/アウト',
                      },
                      { key: 'Shift+0', label: 'タイムラインズームリセット' },
                    ].map((item) => (
                      <ListItem key={item.key} sx={{ py: 0.5, px: 0 }}>
                        <ShortcutKey>{item.key}</ShortcutKey>
                        <ListItemText primary={item.label} sx={{ ml: 1.5 }} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: 2, display: 'block' }}>
                注: 入力欄にフォーカス中は単キーショートカットは無効です。
              </Typography>
            </Box>
          )}

          {/* 画面説明タブ */}
          {helpModalTab === 1 && (
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(colors.primary[500], 0.05),
                      border: `1px solid ${alpha(colors.primary[500], 0.1)}`,
                    }}>
                    <Typography
                      variant='subtitle2'
                      fontWeight={700}
                      sx={{ mb: 1 }}>
                      <MapIcon
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      マップエリア
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      ドローンの位置、飛行経路、制限区域をリアルタイムで表示。
                      ドローンをクリックで選択し、詳細情報を確認できます。
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(colors.info.main, 0.05),
                      border: `1px solid ${alpha(colors.info.main, 0.1)}`,
                    }}>
                    <Typography
                      variant='subtitle2'
                      fontWeight={700}
                      sx={{ mb: 1 }}>
                      <ListIcon
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      サイドパネル
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      「ドローン」タブ: 全機体のリストと状態。 「アラート」タブ:
                      警告・エラー通知の確認と対応。
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(colors.success.main, 0.05),
                      border: `1px solid ${alpha(colors.success.main, 0.1)}`,
                    }}>
                    <Typography
                      variant='subtitle2'
                      fontWeight={700}
                      sx={{ mb: 1 }}>
                      <RadarIcon
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      飛行条件ウィジェット
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      現在地の気象情報（風速、気温、湿度等）と飛行条件の判定を表示。
                      短期予報で今後の天候変化も確認可能。
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(colors.warning.main, 0.05),
                      border: `1px solid ${alpha(colors.warning.main, 0.1)}`,
                    }}>
                    <Typography
                      variant='subtitle2'
                      fontWeight={700}
                      sx={{ mb: 1 }}>
                      <CenterFocusStrongIcon
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      パイロットHUD
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      選択中ドローンのコックピット風表示。
                      速度、高度、方位などをフライトシミュレーター形式で確認。
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(colors.secondary[500], 0.05),
                      border: `1px solid ${alpha(colors.secondary[500], 0.1)}`,
                    }}>
                    <Typography
                      variant='subtitle2'
                      fontWeight={700}
                      sx={{ mb: 1 }}>
                      <TimelineIcon
                        sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                      />
                      フライトタイムライン
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mb: 1 }}>
                      画面下部に全ドローンの飛行スケジュールと発生イベントを時間軸で表示。
                      イベントバーをクリックすると詳細パネルが表示されます。
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      <strong>ズーム機能:</strong>{' '}
                      Shift+スクロールで時間軸を拡大・縮小。
                      ズーム中は横スクロール/ドラッグで時間を移動、時間目盛りクリックでその時刻へジャンプ。
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* ステータス凡例タブ */}
          {helpModalTab === 2 && (
            <Box>
              <Grid container spacing={3}>
                {/* ドローンステータス */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight={700}
                    sx={{ mb: 2 }}>
                    <FlightIcon
                      sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                    />
                    ドローンステータス
                  </Typography>
                  <List disablePadding dense>
                    {[
                      {
                        icon: (
                          <FlightIcon sx={{ color: colors.success.main }} />
                        ),
                        label: '飛行中',
                        desc: '現在飛行中のドローン',
                      },
                      {
                        icon: (
                          <FlightTakeoffIcon sx={{ color: colors.info.main }} />
                        ),
                        label: '離陸準備',
                        desc: '離陸準備中',
                      },
                      {
                        icon: (
                          <FlightLandIcon sx={{ color: colors.warning.main }} />
                        ),
                        label: '着陸中',
                        desc: '着陸中または帰還中',
                      },
                      {
                        icon: (
                          <PauseCircleIcon sx={{ color: colors.gray[500] }} />
                        ),
                        label: 'ホバリング',
                        desc: '空中で静止中',
                      },
                      {
                        icon: (
                          <BatteryAlertIcon sx={{ color: colors.error.main }} />
                        ),
                        label: '緊急',
                        desc: 'バッテリー低下等の緊急状態',
                      },
                    ].map((item) => (
                      <ListItem key={item.label} sx={{ py: 0.75, px: 0 }}>
                        <Box
                          sx={{
                            width: 28,
                            display: 'flex',
                            justifyContent: 'center',
                          }}>
                          {item.icon}
                        </Box>
                        <ListItemText
                          primary={item.label}
                          secondary={item.desc}
                          sx={{ ml: 1 }}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                {/* アラートレベル */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight={700}
                    sx={{ mb: 2 }}>
                    <WarningAmberIcon
                      sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                    />
                    アラートレベル
                  </Typography>
                  <List disablePadding dense>
                    {[
                      {
                        color: colors.info.main,
                        label: '情報',
                        desc: '通常の通知・お知らせ',
                      },
                      {
                        color: colors.warning.main,
                        label: '警告',
                        desc: '注意が必要な状態',
                      },
                      {
                        color: colors.error.main,
                        label: 'エラー',
                        desc: '対応が必要な問題',
                      },
                      {
                        color: colors.error.dark,
                        label: '緊急',
                        desc: '即時対応が必要',
                      },
                    ].map((item) => (
                      <ListItem key={item.label} sx={{ py: 0.75, px: 0 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1,
                            bgcolor: alpha(item.color, 0.15),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <ErrorIcon sx={{ fontSize: 16, color: item.color }} />
                        </Box>
                        <ListItemText
                          primary={item.label}
                          secondary={item.desc}
                          sx={{ ml: 1 }}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                {/* 区域タイプ */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight={700}
                    sx={{ mb: 2 }}>
                    <RadarIcon
                      sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                    />
                    制限区域
                  </Typography>
                  <List disablePadding dense>
                    {[
                      {
                        color: colors.error.main,
                        label: '飛行禁止',
                        desc: '飛行不可エリア',
                      },
                      {
                        color: colors.warning.main,
                        label: '要許可',
                        desc: '許可が必要なエリア',
                      },
                      {
                        color: colors.info.main,
                        label: '注意',
                        desc: '注意が必要なエリア',
                      },
                    ].map((item) => (
                      <ListItem key={item.label} sx={{ py: 0.75, px: 0 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 16,
                            borderRadius: 0.5,
                            bgcolor: alpha(item.color, 0.3),
                            border: `2px solid ${item.color}`,
                          }}
                        />
                        <ListItemText
                          primary={item.label}
                          secondary={item.desc}
                          sx={{ ml: 1 }}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                {/* プロジェクトステータス */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight={700}
                    sx={{ mb: 2 }}>
                    <FolderOpenIcon
                      sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }}
                    />
                    プロジェクトステータス
                  </Typography>
                  <List disablePadding dense>
                    {[
                      {
                        color: colors.success.main,
                        label: '飛行中 (Active)',
                        desc: '現在運用中',
                      },
                      {
                        color: colors.info.main,
                        label: '予定 (Scheduled)',
                        desc: '飛行予定あり',
                      },
                      {
                        color: colors.warning.main,
                        label: '待機中 (Standby)',
                        desc: '準備完了・待機',
                      },
                      {
                        color: colors.gray[400],
                        label: '完了 (Completed)',
                        desc: '運用終了',
                      },
                    ].map((item) => (
                      <ListItem key={item.label} sx={{ py: 0.75, px: 0 }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: item.color,
                            ml: 1,
                          }}
                        />
                        <ListItemText
                          primary={item.label}
                          secondary={item.desc}
                          sx={{ ml: 1.5 }}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* 操作ガイドタブ */}
          {helpModalTab === 3 && (
            <Box>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight={700}
                    sx={{ mb: 2, color: colors.primary[500] }}>
                    基本操作
                  </Typography>
                  <List disablePadding>
                    {[
                      {
                        step: '1',
                        title: 'プロジェクト選択',
                        desc: 'ヘッダーのドロップダウンから監視対象のプロジェクト（飛行エリア）を選択',
                      },
                      {
                        step: '2',
                        title: 'シミュレーション開始',
                        desc: '「開始」ボタンまたは Cmd/Ctrl+S でドローンの動きを開始',
                      },
                      {
                        step: '3',
                        title: 'ドローン選択',
                        desc: 'マップ上のドローンをクリック、またはサイドパネルのリストから選択',
                      },
                      {
                        step: '4',
                        title: '詳細確認',
                        desc: '選択したドローンのステータスウィジェットやHUDで詳細を確認',
                      },
                    ].map((item) => (
                      <ListItem
                        key={item.step}
                        sx={{ py: 1, px: 0, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: colors.primary[500],
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            flexShrink: 0,
                          }}>
                          {item.step}
                        </Box>
                        <ListItemText
                          primary={item.title}
                          secondary={item.desc}
                          sx={{ ml: 1.5 }}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography
                    variant='subtitle2'
                    fontWeight={700}
                    sx={{ mb: 2, color: colors.primary[500] }}>
                    アラート対応
                  </Typography>
                  <List disablePadding>
                    {[
                      {
                        step: '1',
                        title: 'アラート確認',
                        desc: 'サイドパネルの「アラート」タブで未読アラートを確認',
                      },
                      {
                        step: '2',
                        title: 'ドローン特定',
                        desc: 'アラート内のドローン名をクリックで該当機を選択・表示',
                      },
                      {
                        step: '3',
                        title: '状況判断',
                        desc: 'ステータスウィジェットやマップで現在位置と状態を確認',
                      },
                      {
                        step: '4',
                        title: '既読処理',
                        desc: 'アラートを選択して Cmd/Ctrl+Enter で既読に変更',
                      },
                    ].map((item) => (
                      <ListItem
                        key={item.step}
                        sx={{ py: 1, px: 0, alignItems: 'flex-start' }}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: colors.warning.main,
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            flexShrink: 0,
                          }}>
                          {item.step}
                        </Box>
                        <ListItemText
                          primary={item.title}
                          secondary={item.desc}
                          sx={{ ml: 1.5 }}
                          primaryTypographyProps={{ fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* ドローン設定モーダル */}
      {selectedDroneForSettings && (
        <UTMDroneSettingsModal
          open={droneSettingsModalOpen}
          onClose={() => {
            setDroneSettingsModalOpen(false)
            setSelectedDroneForSettings(null)
          }}
          drone={selectedDroneForSettings}
          config={monitoredDroneConfigs[selectedDroneForSettings.droneId]}
        />
      )}

      {/* ドローン右クリックコンテキストメニュー */}
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference='anchorPosition'
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        slotProps={{
          paper: {
            sx: {
              minWidth: 200,
              borderRadius: 2,
              boxShadow: `0 8px 32px ${alpha(colors.gray[900], 0.2)}`,
            },
          },
        }}>
        {(() => {
          const drone = contextMenu?.drone
          if (!drone) return null
          return (
            <>
              {/* ヘッダー */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  borderBottom: `1px solid ${alpha(colors.gray[500], 0.1)}`,
                }}>
                <Typography variant='subtitle2' fontWeight={700}>
                  {drone.droneName}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  緊急制御メニュー
                </Typography>
              </Box>

              {/* ホバリング */}
              <MenuItem
                onClick={() => {
                  handleDroneHover(drone.droneId)
                  handleCloseContextMenu()
                }}
                disabled={drone.status === 'hovering'}
                sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <PauseCircleIcon sx={{ color: colors.warning.main }} />
                </ListItemIcon>
                <ListItemText
                  primary='ホバリング'
                  secondary='現在位置で停止'
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </MenuItem>

              {/* 緊急帰還（RTH） */}
              <MenuItem
                onClick={() => {
                  handleDroneEmergencyReturn(drone.droneId)
                  handleCloseContextMenu()
                }}
                disabled={drone.status === 'rth'}
                sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <HomeIcon sx={{ color: colors.error.main }} />
                </ListItemIcon>
                <ListItemText
                  primary='緊急帰還 (RTH)'
                  secondary='ホームポイントへ帰還'
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </MenuItem>

              {/* 即時着陸 */}
              <MenuItem
                onClick={() => {
                  handleDroneLandImmediately(drone.droneId)
                  handleCloseContextMenu()
                }}
                disabled={
                  drone.status === 'landing' || drone.status === 'landed'
                }
                sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <FlightLandIcon sx={{ color: colors.info.main }} />
                </ListItemIcon>
                <ListItemText
                  primary='即時着陸'
                  secondary='現在位置で着陸'
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </MenuItem>

              <Divider sx={{ my: 1 }} />

              {/* ドローン詳細選択 */}
              <MenuItem
                onClick={() => {
                  handleDroneSelect(drone)
                  handleCloseContextMenu()
                }}
                sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <InfoIcon sx={{ color: colors.primary[500] }} />
                </ListItemIcon>
                <ListItemText
                  primary='詳細を表示'
                  secondary='ドローン情報を表示'
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </MenuItem>

              {/* 設定を開く */}
              <MenuItem
                onClick={() => {
                  handleOpenDroneSettings(drone)
                  handleCloseContextMenu()
                }}
                sx={{ py: 1.5 }}>
                <ListItemIcon>
                  <SettingsIcon sx={{ color: colors.gray[500] }} />
                </ListItemIcon>
                <ListItemText
                  primary='設定'
                  secondary='監視設定を開く'
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </MenuItem>
            </>
          )
        })()}
      </Menu>
    </Box>
  )
}

export default UTMDashboardPage
