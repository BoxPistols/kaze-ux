/**
 * UTM Pre-Flight Lobby ページ
 *
 * 飛行前の準備状況を一覧表示し、各種チェックへのクイックアクセスを提供
 */

import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive'
import AirplanemodeActiveOutlinedIcon from '@mui/icons-material/AirplanemodeActiveOutlined'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import CloudIcon from '@mui/icons-material/Cloud'
import DescriptionIcon from '@mui/icons-material/Description'
import ErrorIcon from '@mui/icons-material/Error'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import GroupsIcon from '@mui/icons-material/Groups'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import ListIcon from '@mui/icons-material/List'
import MapIcon from '@mui/icons-material/Map'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import RefreshIcon from '@mui/icons-material/Refresh'
import ScheduleIcon from '@mui/icons-material/Schedule'
import ScienceIcon from '@mui/icons-material/Science'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import WbSunnyIcon from '@mui/icons-material/WbSunny'
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Grid,
  LinearProgress,
  Alert,
  AlertTitle,
  Divider,
  alpha,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tabs,
  Tab,
  Badge,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import { useRef, useState, useCallback, useMemo } from 'react'
import Map, { Marker, Source, Layer, Popup } from 'react-map-gl/maplibre'
import { useNavigate } from 'react-router-dom'

import { UTMPreflightWizard } from '@/components/utm'
import {
  getScenarioFlights,
  getAllScenarios,
  SCENARIO_INFO,
  getFlightDrones,
  type ScenarioType,
  type ScheduledFlight,
} from '@/mocks/utmMultiDroneScenarios'

import type { MapRef } from 'react-map-gl/maplibre'

// 型定義とモックデータはutmMultiDroneScenariosからインポート

// ============================================
// Local Types (for WeatherCondition display)
// ============================================

interface WeatherCondition {
  status: 'good' | 'caution' | 'warning' | 'prohibited'
  temperature: number
  windSpeed: number
  windDirection: string
  visibility: number
  precipitation: number
  description: string
}

// ============================================
// Helper Functions
// ============================================

function formatTimeUntil(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)

  if (minutes < 0) return '開始済み'
  if (minutes < 60) return `${minutes}分後`
  return `${hours}時間${minutes % 60}分後`
}

function getWeatherStatusColor(status: WeatherCondition['status']): string {
  switch (status) {
    case 'good':
      return 'success'
    case 'caution':
      return 'warning'
    case 'warning':
      return 'error'
    case 'prohibited':
      return 'error'
    default:
      return 'default'
  }
}

function getPreflightStatusLabel(status: ScheduledFlight['preflightStatus']): {
  label: string
  color: 'success' | 'warning' | 'error' | 'default'
} {
  switch (status) {
    case 'completed':
      return { label: '完了', color: 'success' }
    case 'in_progress':
      return { label: '進行中', color: 'warning' }
    case 'failed':
      return { label: '失敗', color: 'error' }
    case 'pending':
    default:
      return { label: '未実施', color: 'default' }
  }
}

// ============================================
// Sub Components
// ============================================

interface FlightCardProps {
  flight: ScheduledFlight
  onStartPreflight: (flightId: string) => void
  onStartMonitoring: (flightId: string) => void
  onViewDetails: (flightId: string) => void
}

function FlightCard({
  flight,
  onStartPreflight,
  onStartMonitoring,
  onViewDetails,
}: FlightCardProps) {
  const theme = useTheme()
  const preflightStatus = getPreflightStatusLabel(flight.preflightStatus)
  const canStartFlight =
    flight.preflightStatus === 'completed' &&
    flight.weather.status !== 'prohibited' &&
    !flight.airspaceStatus.inRedZone

  // 複数機体対応: ドローンサマリーを計算
  const drones = getFlightDrones(flight)
  const droneCount = drones.length
  const minBattery = Math.min(...drones.map((d) => d.batteryLevel))
  const minSignal = Math.min(...drones.map((d) => d.signalStrength))

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: theme.shadows[4],
          borderColor: theme.palette.primary.main,
        },
      }}>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* ヘッダー */}
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='flex-start'
          sx={{ mb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant='subtitle1' fontWeight={600} noWrap>
              {flight.flightPlan.name}
            </Typography>
            {/* 機体情報 - 複数機体対応 */}
            {(() => {
              const drones = getFlightDrones(flight)
              const droneCount = drones.length
              if (droneCount === 1) {
                // 単一機体
                return (
                  <Stack
                    direction='row'
                    spacing={1}
                    alignItems='center'
                    sx={{ mt: 0.5 }}>
                    <Chip
                      icon={
                        <AirplanemodeActiveOutlinedIcon sx={{ fontSize: 14 }} />
                      }
                      label={drones[0].droneName}
                      size='small'
                      variant='outlined'
                      sx={{
                        height: 22,
                        '& .MuiChip-label': { fontSize: '0.7rem' },
                      }}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      {drones[0].pilotName}
                    </Typography>
                  </Stack>
                )
              }
              // 複数機体
              return (
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    icon={
                      <AirplanemodeActiveOutlinedIcon sx={{ fontSize: 14 }} />
                    }
                    label={`${droneCount}機体参加`}
                    size='small'
                    color='secondary'
                    variant='outlined'
                    sx={{
                      height: 22,
                      '& .MuiChip-label': { fontSize: '0.7rem' },
                      mb: 0.5,
                    }}
                  />
                  <Stack
                    direction='row'
                    spacing={0.5}
                    flexWrap='wrap'
                    useFlexGap>
                    {drones.slice(0, 3).map((drone) => (
                      <Chip
                        key={drone.droneId}
                        label={drone.droneName}
                        size='small'
                        variant='outlined'
                        sx={{
                          height: 18,
                          '& .MuiChip-label': { fontSize: '0.625rem', px: 0.5 },
                        }}
                      />
                    ))}
                    {droneCount > 3 && (
                      <Typography variant='caption' color='text.secondary'>
                        +{droneCount - 3}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              )
            })()}
          </Box>
          <Chip
            icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
            label={formatTimeUntil(flight.estimatedStartTime)}
            size='small'
            color='primary'
            variant='outlined'
            sx={{ ml: 1, flexShrink: 0 }}
          />
        </Stack>

        {/* ステータスグリッド */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* 機体状態 */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              variant='outlined'
              sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
              <BatteryFullIcon
                sx={{
                  fontSize: 24,
                  color:
                    minBattery > 50
                      ? 'success.main'
                      : minBattery > 20
                        ? 'warning.main'
                        : 'error.main',
                }}
              />
              <Typography
                variant='caption'
                display='block'
                color='text.secondary'>
                バッテリー{droneCount > 1 ? '(最低)' : ''}
              </Typography>
              <Typography variant='body2' fontWeight={600}>
                {minBattery}%
              </Typography>
            </Paper>
          </Grid>

          {/* 通信状態 */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              variant='outlined'
              sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
              <SignalCellularAltIcon
                sx={{
                  fontSize: 24,
                  color: minSignal > 70 ? 'success.main' : 'warning.main',
                }}
              />
              <Typography
                variant='caption'
                display='block'
                color='text.secondary'>
                通信{droneCount > 1 ? '(最低)' : ''}
              </Typography>
              <Typography variant='body2' fontWeight={600}>
                {minSignal}%
              </Typography>
            </Paper>
          </Grid>

          {/* 気象状態 */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              variant='outlined'
              sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
              <CloudIcon
                sx={{
                  fontSize: 24,
                  color: `${getWeatherStatusColor(flight.weather.status)}.main`,
                }}
              />
              <Typography
                variant='caption'
                display='block'
                color='text.secondary'>
                気象
              </Typography>
              <Typography variant='body2' fontWeight={600}>
                {flight.weather.windSpeed}m/s
              </Typography>
            </Paper>
          </Grid>

          {/* 空域状態 */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper
              variant='outlined'
              sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
              <MapIcon
                sx={{
                  fontSize: 24,
                  color: flight.airspaceStatus.inRedZone
                    ? 'error.main'
                    : flight.airspaceStatus.inYellowZone
                      ? 'warning.main'
                      : flight.airspaceStatus.inDID
                        ? 'secondary.main'
                        : 'success.main',
                }}
              />
              <Typography
                variant='caption'
                display='block'
                color='text.secondary'>
                空域
              </Typography>
              <Typography variant='body2' fontWeight={600} noWrap>
                {flight.airspaceStatus.summary}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* プリフライト進捗 */}
        <Box sx={{ mb: 2 }}>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            sx={{ mb: 0.5 }}>
            <Typography variant='caption' color='text.secondary'>
              プリフライトチェック
            </Typography>
            <Chip
              label={preflightStatus.label}
              size='small'
              color={preflightStatus.color}
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Stack>
          <LinearProgress
            variant='determinate'
            value={flight.preflightProgress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
            }}
          />
        </Box>

        {/* アラート（固定高さで揃える） */}
        <Box sx={{ flex: 1, minHeight: 80 }}>
          {flight.alerts.length > 0 && (
            <Stack spacing={1}>
              {flight.alerts.slice(0, 2).map((alert) => (
                <Alert
                  key={alert.id}
                  severity={alert.type === 'error' ? 'error' : alert.type}
                  sx={{ py: 0, '& .MuiAlert-message': { py: 0.5 } }}>
                  <Typography variant='caption'>{alert.message}</Typography>
                </Alert>
              ))}
              {flight.alerts.length > 2 && (
                <Typography variant='caption' color='text.secondary'>
                  +{flight.alerts.length - 2}件のアラート
                </Typography>
              )}
            </Stack>
          )}
        </Box>
      </CardContent>

      <Divider />

      {/* アクションボタン */}
      <CardActions sx={{ p: 2, justifyContent: 'flex-end' }}>
        <Button size='small' onClick={() => onViewDetails(flight.id)}>
          詳細
        </Button>
        {flight.preflightStatus !== 'completed' && (
          <Button
            size='small'
            variant='outlined'
            startIcon={<AssignmentIcon />}
            onClick={() => onStartPreflight(flight.id)}>
            プリフライト
          </Button>
        )}
        <Button
          size='small'
          variant='contained'
          startIcon={<PlayArrowIcon />}
          disabled={!canStartFlight}
          onClick={() => onStartMonitoring(flight.id)}>
          監視開始
        </Button>
      </CardActions>
    </Card>
  )
}

// ============================================
// Summary Cards
// ============================================

interface SummaryCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtitle?: string
  helpText?: string
}

function SummaryCard({
  title,
  value,
  icon,
  color,
  subtitle,
  helpText,
}: SummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(color, 0.1),
        border: `1px solid ${alpha(color, 0.2)}`,
      }}>
      <Stack direction='row' spacing={2} alignItems='center'>
        <Avatar
          sx={{
            bgcolor: alpha(color, 0.2),
            color,
            width: 48,
            height: 48,
          }}>
          {icon}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Stack direction='row' alignItems='center' spacing={0.5}>
            <Typography variant='caption' color='text.secondary'>
              {title}
            </Typography>
            {helpText && (
              <Tooltip title={helpText} arrow placement='top'>
                <HelpOutlineIcon
                  sx={{ fontSize: 14, color: 'text.disabled', cursor: 'help' }}
                />
              </Tooltip>
            )}
          </Stack>
          <Typography variant='h5' fontWeight={700} sx={{ color }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant='caption' color='text.secondary'>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  )
}

// ============================================
// Main Component
// ============================================

const UTMPreFlightLobbyPage = () => {
  const theme = useTheme()
  const navigate = useNavigate()

  // シナリオ選択
  const [currentScenario, setCurrentScenario] =
    useState<ScenarioType>('default')
  const [scenarioMenuAnchor, setScenarioMenuAnchor] =
    useState<null | HTMLElement>(null)

  const [scheduledFlights, setScheduledFlights] = useState<ScheduledFlight[]>(
    getScenarioFlights('default')
  )
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedFlightId, setSelectedFlightId] = useState<string | null>(null)
  const [mapPopup, setMapPopup] = useState<{
    flight: ScheduledFlight
    lng: number
    lat: number
  } | null>(null)
  const mapRef = useRef<MapRef>(null)

  // プリフライトウィザード状態
  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardFlight, setWizardFlight] = useState<ScheduledFlight | undefined>(
    undefined
  )

  // チェックリスト状態管理
  const [checklist, setChecklist] = useState({
    weather: {
      windSpeed: false,
      temperature: false,
      visibility: false,
      precipitation: false,
    },
    airspace: {
      emergencyAirspace: false,
      notam: false,
      tfr: false,
    },
    aircraft: {
      gps: false,
      remoteId: false,
      calibration: false,
      firmware: false,
    },
    permits: {
      dips: false,
      permission: false,
      insurance: false,
      qualification: false,
    },
    deconfliction: {
      checked: false,
    },
    crew: {
      pilot: false,
      assistant: false,
      safetyManager: false,
      emergencyContacts: false,
    },
  })

  // チェックリスト更新
  const handleChecklistChange = useCallback(
    (category: keyof typeof checklist, item: string, checked: boolean) => {
      setChecklist((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [item]: checked,
        },
      }))
    },
    []
  )

  // 全チェック完了判定
  const isAllChecked = useMemo(() => {
    return Object.values(checklist).every((category) =>
      Object.values(category).every((value) => value === true)
    )
  }, [checklist])

  // カテゴリ別完了判定
  const categoryProgress = useMemo(() => {
    const calcProgress = (category: Record<string, boolean>) => {
      const total = Object.keys(category).length
      const checked = Object.values(category).filter(Boolean).length
      return { total, checked, complete: checked === total }
    }
    return {
      weather: calcProgress(checklist.weather),
      airspace: calcProgress(checklist.airspace),
      aircraft: calcProgress(checklist.aircraft),
      permits: calcProgress(checklist.permits),
      deconfliction: calcProgress(checklist.deconfliction),
      crew: calcProgress(checklist.crew),
    }
  }, [checklist])

  // 表示モード切替
  const handleViewModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newMode: 'list' | 'map' | null) => {
      if (newMode !== null) {
        setViewMode(newMode)
      }
    },
    []
  )

  // タブ変更
  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setActiveTab(newValue)
    },
    []
  )

  // シナリオ変更
  const handleScenarioChange = useCallback((scenario: ScenarioType) => {
    setLoading(true)
    setCurrentScenario(scenario)
    setScenarioMenuAnchor(null)
    setTimeout(() => {
      setScheduledFlights(getScenarioFlights(scenario))
      setLoading(false)
    }, 500)
  }, [])

  // 現在のシナリオ情報
  const scenarioInfo = useMemo(
    () => SCENARIO_INFO[currentScenario],
    [currentScenario]
  )

  // サマリー計算
  const summary = useMemo(() => {
    const total = scheduledFlights.length
    const ready = scheduledFlights.filter(
      (f) => f.preflightStatus === 'completed'
    ).length
    const warnings = scheduledFlights.filter((f) =>
      f.alerts.some((a) => a.type === 'warning')
    ).length
    const errors = scheduledFlights.filter(
      (f) =>
        f.alerts.some((a) => a.type === 'error') || f.airspaceStatus.inRedZone
    ).length

    return { total, ready, warnings, errors }
  }, [scheduledFlights])

  // フライトの中心座標を取得（モックデータ用）
  const getFlightCenter = useCallback(
    (flight: ScheduledFlight) => {
      // モックデータから座標を生成（実際はflightPlan.areaなどから取得）
      const baseCoords: Record<string, { lng: number; lat: number }> = {
        default: { lng: 139.7, lat: 35.68 },
        haneda_multi: { lng: 139.78, lat: 35.55 },
        tokyo_bay_infra: { lng: 139.82, lat: 35.62 },
        congested_airspace: { lng: 139.75, lat: 35.7 },
        emergency_response: { lng: 139.68, lat: 35.65 },
      }
      const base = baseCoords[currentScenario] || baseCoords.default
      // フライトIDからオフセットを計算
      const index = scheduledFlights.findIndex((f) => f.id === flight.id)
      return {
        lng: base.lng + (index % 3) * 0.02 - 0.02,
        lat: base.lat + Math.floor(index / 3) * 0.015 - 0.015,
      }
    },
    [currentScenario, scheduledFlights]
  )

  // 地図用GeoJSONデータ
  const flightGeoJSON = useMemo(() => {
    const features = scheduledFlights.map((flight) => {
      const center = getFlightCenter(flight)
      // 簡易的なポリゴン（実際はflightPlan.areaから取得）
      const offset = 0.005
      return {
        type: 'Feature' as const,
        properties: {
          id: flight.id,
          name: flight.flightPlan.name,
          status: flight.preflightStatus,
          isSelected: selectedFlightId === flight.id,
        },
        geometry: {
          type: 'Polygon' as const,
          coordinates: [
            [
              [center.lng - offset, center.lat - offset],
              [center.lng + offset, center.lat - offset],
              [center.lng + offset, center.lat + offset],
              [center.lng - offset, center.lat + offset],
              [center.lng - offset, center.lat - offset],
            ],
          ],
        },
      }
    })
    return {
      type: 'FeatureCollection' as const,
      features,
    }
  }, [scheduledFlights, selectedFlightId, getFlightCenter])

  // リフレッシュ
  const handleRefresh = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      setScheduledFlights(getScenarioFlights(currentScenario))
      setLoading(false)
    }, 1000)
  }, [currentScenario])

  // プリフライト開始（ウィザードを開く）
  const handleStartPreflight = useCallback(
    (flightId: string) => {
      const flight = scheduledFlights.find((f) => f.id === flightId)
      if (flight) {
        setWizardFlight(flight)
        setWizardOpen(true)
      }
    },
    [scheduledFlights]
  )

  // ウィザードでフライト選択
  const handleWizardFlightSelect = useCallback((flight: ScheduledFlight) => {
    setWizardFlight(flight)
  }, [])

  // ウィザードからフライト開始
  const handleWizardStartFlight = useCallback(
    (flightId: string) => {
      setWizardOpen(false)
      navigate(`/monitoring/${flightId}`)
    },
    [navigate]
  )

  // ウィザードを閉じる
  const handleWizardClose = useCallback(() => {
    setWizardOpen(false)
    setWizardFlight(undefined)
  }, [])

  // 監視開始
  const handleStartMonitoring = useCallback(
    (flightId: string) => {
      navigate(`/monitoring?flight=${flightId}`)
    },
    [navigate]
  )

  // 詳細表示
  const handleViewDetails = useCallback(
    (flightId: string) => {
      navigate(`/planning/applications?flight=${flightId}`)
    },
    [navigate]
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
        pb: 4,
      }}>
      {/* ヘッダー */}
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          borderRadius: 0,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.paper',
        }}>
        <Stack
          direction='row'
          justifyContent='space-between'
          alignItems='center'>
          <Stack direction='row' alignItems='center' spacing={2}>
            <AirplanemodeActiveIcon color='primary' sx={{ fontSize: 32 }} />
            <Box>
              <Stack direction='row' alignItems='center' spacing={0.5}>
                <Typography variant='h5' fontWeight={700}>
                  Pre-Flight Lobby
                </Typography>
                <Tooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant='body2' fontWeight={600} gutterBottom>
                        Pre-Flight Lobbyとは
                      </Typography>
                      <Typography
                        variant='caption'
                        component='p'
                        sx={{ mb: 1 }}>
                        本日予定されている全ての飛行ミッションの準備状況を一覧で確認できる画面です。
                      </Typography>
                      <Typography
                        variant='caption'
                        component='p'
                        sx={{ mb: 1 }}>
                        各カードは1つの飛行計画を表し、以下の情報が確認できます:
                      </Typography>
                      <Typography
                        variant='caption'
                        component='ul'
                        sx={{ pl: 2, m: 0 }}>
                        <li>機体のバッテリー・通信状態</li>
                        <li>飛行エリアの気象条件</li>
                        <li>空域の制限状況（DID、空港周辺等）</li>
                        <li>プリフライトチェックの進捗</li>
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement='bottom-start'>
                  <IconButton size='small' sx={{ color: 'text.secondary' }}>
                    <HelpOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant='body2' color='text.secondary'>
                本日の飛行予定と準備状況
              </Typography>
            </Box>
          </Stack>
          <Stack direction='row' spacing={1}>
            {/* シナリオ選択 */}
            <Button
              variant='outlined'
              color='secondary'
              startIcon={<ScienceIcon />}
              onClick={(e) => setScenarioMenuAnchor(e.currentTarget)}>
              {scenarioInfo.name}
            </Button>
            <Menu
              anchorEl={scenarioMenuAnchor}
              open={Boolean(scenarioMenuAnchor)}
              onClose={() => setScenarioMenuAnchor(null)}
              PaperProps={{
                sx: { minWidth: 320 },
              }}>
              {getAllScenarios().map((scenario) => (
                <MenuItem
                  key={scenario.id}
                  selected={scenario.id === currentScenario}
                  onClick={() => handleScenarioChange(scenario.id)}>
                  <ListItemIcon>
                    <Chip
                      label={`${scenario.totalDrones}機`}
                      size='small'
                      color={
                        scenario.id === currentScenario ? 'primary' : 'default'
                      }
                      sx={{ minWidth: 48 }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={scenario.name}
                    secondary={scenario.description}
                    primaryTypographyProps={{ fontWeight: 500 }}
                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                  />
                </MenuItem>
              ))}
            </Menu>
            <Button
              variant='outlined'
              startIcon={<FlightTakeoffIcon />}
              onClick={() => navigate('/planning/applications')}>
              新規飛行計画
            </Button>
            <Tooltip title='更新'>
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* シナリオ情報バナー */}
      {currentScenario !== 'default' && (
        <Paper
          elevation={0}
          sx={{
            px: 3,
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
            bgcolor: alpha(theme.palette.secondary.main, 0.05),
          }}>
          <Stack direction='row' spacing={2} alignItems='center'>
            <ScienceIcon color='secondary' />
            <Box sx={{ flex: 1 }}>
              <Typography variant='subtitle2' fontWeight={600}>
                {scenarioInfo.name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {scenarioInfo.description}
              </Typography>
            </Box>
            <Stack direction='row' spacing={1}>
              {scenarioInfo.highlights.map((highlight, i) => (
                <Chip
                  key={i}
                  label={highlight}
                  size='small'
                  variant='outlined'
                  color='secondary'
                />
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}

      <Box sx={{ px: 3, py: 3, maxWidth: 1600, mx: 'auto' }}>
        {/* サマリーカード */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <SummaryCard
              title='本日の飛行予定'
              value={summary.total}
              icon={<FlightTakeoffIcon />}
              color={theme.palette.primary.main}
              subtitle='件'
              helpText='本日スケジュールされている全ての飛行ミッション数'
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <SummaryCard
              title='準備完了'
              value={summary.ready}
              icon={<CheckCircleIcon />}
              color={theme.palette.success.main}
              subtitle='件'
              helpText='プリフライトチェックが完了し、すぐに飛行開始できる状態のミッション数'
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <SummaryCard
              title='注意事項あり'
              value={summary.warnings}
              icon={<WarningAmberIcon />}
              color={theme.palette.warning.main}
              subtitle='件'
              helpText='飛行は可能だが、気象条件や空域制限に注意が必要なミッション数'
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <SummaryCard
              title='要対応'
              value={summary.errors}
              icon={<ErrorIcon />}
              color={theme.palette.error.main}
              subtitle='件'
              helpText='飛行禁止区域への侵入や重大な問題があり、対応が必要なミッション数'
            />
          </Grid>
        </Grid>

        {/* タブナビゲーション */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant='scrollable'
            scrollButtons='auto'
            sx={{
              px: 2,
              '& .MuiTab-root': {
                minHeight: 56,
                textTransform: 'none',
              },
            }}>
            <Tab
              icon={<FlightTakeoffIcon sx={{ fontSize: 20 }} />}
              iconPosition='start'
              label={
                <Badge badgeContent={summary.total} color='primary' max={99}>
                  <Box sx={{ pr: 2 }}>フライト一覧</Box>
                </Badge>
              }
            />
            <Tab
              icon={<WbSunnyIcon sx={{ fontSize: 20 }} />}
              iconPosition='start'
              label={
                <Badge badgeContent={summary.warnings} color='warning' max={99}>
                  <Box sx={{ pr: 2 }}>気象・空域</Box>
                </Badge>
              }
            />
            <Tab
              icon={<GpsFixedIcon sx={{ fontSize: 20 }} />}
              iconPosition='start'
              label='機体・申請'
            />
            <Tab
              icon={<SwapHorizIcon sx={{ fontSize: 20 }} />}
              iconPosition='start'
              label='デコンフリクション'
            />
            <Tab
              icon={<GroupsIcon sx={{ fontSize: 20 }} />}
              iconPosition='start'
              label='運航体制'
            />
          </Tabs>
        </Paper>

        {/* タブ0: フライト一覧 */}
        {activeTab === 0 && (
          <>
            <Stack
              direction='row'
              alignItems='center'
              justifyContent='space-between'
              sx={{ mb: 2 }}>
              <Stack direction='row' alignItems='center' spacing={0.5}>
                <Typography variant='h6' fontWeight={600}>
                  飛行予定一覧
                </Typography>
                <Tooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant='body2' fontWeight={600} gutterBottom>
                        カードの見方
                      </Typography>
                      <Typography
                        variant='caption'
                        component='p'
                        sx={{ mb: 1 }}>
                        各カードは1つの飛行ミッション（1機体）を表します。
                      </Typography>
                      <Typography
                        variant='caption'
                        component='p'
                        fontWeight={600}>
                        ステータスアイコン:
                      </Typography>
                      <Typography
                        variant='caption'
                        component='ul'
                        sx={{ pl: 2, m: 0, mb: 1 }}>
                        <li>バッテリー: 機体の充電状態</li>
                        <li>通信: 機体との接続品質</li>
                        <li>気象: 飛行エリアの風速等</li>
                        <li>空域: 飛行制限の有無</li>
                      </Typography>
                      <Typography
                        variant='caption'
                        component='p'
                        fontWeight={600}>
                        アクション:
                      </Typography>
                      <Typography
                        variant='caption'
                        component='ul'
                        sx={{ pl: 2, m: 0 }}>
                        <li>プリフライト: 飛行前チェック実施</li>
                        <li>監視開始: リアルタイム監視画面へ</li>
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement='right'>
                  <IconButton size='small' sx={{ color: 'text.secondary' }}>
                    <HelpOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* 表示切替ボタン */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size='small'>
                <ToggleButton value='list'>
                  <Tooltip title='リスト表示'>
                    <ListIcon />
                  </Tooltip>
                </ToggleButton>
                <ToggleButton value='map'>
                  <Tooltip title='地図表示'>
                    <MapIcon />
                  </Tooltip>
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {loading ? (
              <LinearProgress sx={{ mb: 2 }} />
            ) : viewMode === 'list' ? (
              /* リスト表示 */
              <Grid container spacing={3}>
                {scheduledFlights.map((flight) => (
                  <Grid key={flight.id} size={{ xs: 12, md: 6, lg: 4 }}>
                    <FlightCard
                      flight={flight}
                      onStartPreflight={handleStartPreflight}
                      onStartMonitoring={handleStartMonitoring}
                      onViewDetails={handleViewDetails}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              /* 地図表示 */
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${theme.palette.divider}`,
                  height: 500,
                  position: 'relative',
                }}>
                <Map
                  ref={mapRef}
                  initialViewState={{
                    longitude: 139.7,
                    latitude: 35.68,
                    zoom: 10,
                  }}
                  style={{ width: '100%', height: '100%' }}
                  mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
                  interactiveLayerIds={['flight-areas-fill']}>
                  {/* フライトエリアポリゴン */}
                  <Source id='flight-areas' type='geojson' data={flightGeoJSON}>
                    <Layer
                      id='flight-areas-fill'
                      type='fill'
                      paint={{
                        'fill-color': [
                          'case',
                          ['get', 'isSelected'],
                          theme.palette.primary.main,
                          ['==', ['get', 'status'], 'completed'],
                          theme.palette.success.main,
                          ['==', ['get', 'status'], 'in_progress'],
                          theme.palette.warning.main,
                          theme.palette.grey[500],
                        ],
                        'fill-opacity': [
                          'case',
                          ['get', 'isSelected'],
                          0.5,
                          0.3,
                        ],
                      }}
                    />
                    <Layer
                      id='flight-areas-line'
                      type='line'
                      paint={{
                        'line-color': [
                          'case',
                          ['get', 'isSelected'],
                          theme.palette.primary.main,
                          ['==', ['get', 'status'], 'completed'],
                          theme.palette.success.main,
                          theme.palette.grey[400],
                        ],
                        'line-width': ['case', ['get', 'isSelected'], 3, 1],
                      }}
                    />
                  </Source>

                  {/* フライトマーカー */}
                  {scheduledFlights.map((flight) => {
                    const center = getFlightCenter(flight)
                    const isSelected = selectedFlightId === flight.id
                    const statusColor =
                      flight.preflightStatus === 'completed'
                        ? theme.palette.success.main
                        : flight.preflightStatus === 'in_progress'
                          ? theme.palette.warning.main
                          : theme.palette.grey[500]

                    return (
                      <Marker
                        key={flight.id}
                        longitude={center.lng}
                        latitude={center.lat}
                        anchor='center'
                        onClick={(e) => {
                          e.originalEvent.stopPropagation()
                          setSelectedFlightId(flight.id)
                          setMapPopup({
                            flight,
                            lng: center.lng,
                            lat: center.lat,
                          })
                        }}>
                        <Box
                          sx={{
                            width: isSelected ? 36 : 28,
                            height: isSelected ? 36 : 28,
                            borderRadius: '50%',
                            bgcolor: isSelected
                              ? theme.palette.primary.main
                              : statusColor,
                            border: `2px solid ${theme.palette.background.paper}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: theme.shadows[4],
                          }}>
                          <FlightTakeoffIcon
                            sx={{
                              fontSize: isSelected ? 20 : 16,
                              color: '#fff',
                            }}
                          />
                        </Box>
                      </Marker>
                    )
                  })}

                  {/* ポップアップ */}
                  {mapPopup && (
                    <Popup
                      longitude={mapPopup.lng}
                      latitude={mapPopup.lat}
                      anchor='bottom'
                      onClose={() => {
                        setMapPopup(null)
                        setSelectedFlightId(null)
                      }}
                      closeButton={true}
                      closeOnClick={false}>
                      <Box sx={{ p: 1, minWidth: 220 }}>
                        <Typography variant='subtitle2' fontWeight={600}>
                          {mapPopup.flight.flightPlan.name}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          display='block'
                          sx={{ mb: 1 }}>
                          {formatTimeUntil(mapPopup.flight.estimatedStartTime)}
                        </Typography>
                        <Stack direction='row' spacing={1} sx={{ mb: 1 }}>
                          <Chip
                            label={
                              getPreflightStatusLabel(
                                mapPopup.flight.preflightStatus
                              ).label
                            }
                            size='small'
                            color={
                              getPreflightStatusLabel(
                                mapPopup.flight.preflightStatus
                              ).color
                            }
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        </Stack>
                        <Stack direction='row' spacing={1}>
                          <Button
                            size='small'
                            variant='outlined'
                            onClick={() =>
                              handleViewDetails(mapPopup.flight.id)
                            }>
                            詳細
                          </Button>
                          <Button
                            size='small'
                            variant='contained'
                            startIcon={<PlayArrowIcon />}
                            disabled={
                              mapPopup.flight.preflightStatus !== 'completed'
                            }
                            onClick={() =>
                              handleStartMonitoring(mapPopup.flight.id)
                            }>
                            監視開始
                          </Button>
                        </Stack>
                      </Box>
                    </Popup>
                  )}
                </Map>

                {/* 地図凡例 */}
                <Paper
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    px: 2,
                    py: 1,
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    backdropFilter: 'blur(4px)',
                    zIndex: 10,
                  }}>
                  <Stack direction='row' spacing={2} alignItems='center'>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: theme.palette.success.main,
                        }}
                      />
                      <Typography variant='caption'>準備完了</Typography>
                    </Stack>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: theme.palette.warning.main,
                        }}
                      />
                      <Typography variant='caption'>進行中</Typography>
                    </Stack>
                    <Stack direction='row' spacing={0.5} alignItems='center'>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: theme.palette.grey[500],
                        }}
                      />
                      <Typography variant='caption'>未実施</Typography>
                    </Stack>
                  </Stack>
                </Paper>
              </Paper>
            )}

            {/* 空の状態 */}
            {!loading && scheduledFlights.length === 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                }}>
                <FlightTakeoffIcon
                  sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }}
                />
                <Typography variant='h6' color='text.secondary' gutterBottom>
                  本日の飛行予定はありません
                </Typography>
                <Button
                  variant='contained'
                  startIcon={<FlightTakeoffIcon />}
                  onClick={() => navigate('/planning/applications')}
                  sx={{ mt: 2 }}>
                  新規飛行計画を作成
                </Button>
              </Paper>
            )}
          </>
        )}

        {/* タブ1: 気象・空域チェック */}
        {activeTab === 1 && (
          <Stack spacing={3}>
            {/* 進捗バー */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor:
                  categoryProgress.weather.complete &&
                  categoryProgress.airspace.complete
                    ? alpha(theme.palette.success.main, 0.1)
                    : 'background.paper',
              }}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Typography variant='subtitle1' fontWeight={600}>
                    気象・空域チェック
                  </Typography>
                  <Chip
                    label={`${categoryProgress.weather.checked + categoryProgress.airspace.checked}/${categoryProgress.weather.total + categoryProgress.airspace.total} 確認済み`}
                    size='small'
                    color={
                      categoryProgress.weather.complete &&
                      categoryProgress.airspace.complete
                        ? 'success'
                        : 'default'
                    }
                  />
                </Stack>
                <Button
                  size='small'
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}>
                  データ更新
                </Button>
              </Stack>
            </Paper>

            <Grid container spacing={3}>
              {/* 気象情報 */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                  }}>
                  <Stack direction='row' spacing={1} alignItems='center' mb={2}>
                    <CloudIcon color='primary' />
                    <Typography variant='h6' fontWeight={600}>
                      気象情報
                    </Typography>
                    {categoryProgress.weather.complete && (
                      <CheckCircleIcon color='success' sx={{ ml: 'auto' }} />
                    )}
                  </Stack>

                  {/* 現在の気象 */}
                  <Paper
                    variant='outlined'
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    }}>
                    <Typography
                      variant='subtitle2'
                      color='text.secondary'
                      gutterBottom>
                      現在の気象条件
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant='caption' color='text.secondary'>
                          風速
                        </Typography>
                        <Typography variant='h5' fontWeight={700}>
                          3.2
                        </Typography>
                        <Typography variant='caption'>m/s</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant='caption' color='text.secondary'>
                          気温
                        </Typography>
                        <Typography variant='h5' fontWeight={700}>
                          18
                        </Typography>
                        <Typography variant='caption'>°C</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant='caption' color='text.secondary'>
                          視程
                        </Typography>
                        <Typography variant='h5' fontWeight={700}>
                          10+
                        </Typography>
                        <Typography variant='caption'>km</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant='caption' color='text.secondary'>
                          降水
                        </Typography>
                        <Typography variant='h5' fontWeight={700}>
                          0
                        </Typography>
                        <Typography variant='caption'>mm</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* 時間帯別予報 */}
                  <Typography variant='subtitle2' gutterBottom>
                    時間帯別予報
                  </Typography>
                  <TableContainer
                    component={Paper}
                    variant='outlined'
                    sx={{ mb: 2 }}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>時刻</TableCell>
                          <TableCell align='center'>風速</TableCell>
                          <TableCell align='center'>気温</TableCell>
                          <TableCell align='center'>降水</TableCell>
                          <TableCell align='center'>判定</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          {
                            time: '09:00',
                            wind: 2.8,
                            temp: 16,
                            rain: 0,
                            ok: true,
                          },
                          {
                            time: '12:00',
                            wind: 3.5,
                            temp: 18,
                            rain: 0,
                            ok: true,
                          },
                          {
                            time: '15:00',
                            wind: 4.2,
                            temp: 19,
                            rain: 0,
                            ok: true,
                          },
                          {
                            time: '18:00',
                            wind: 5.1,
                            temp: 17,
                            rain: 10,
                            ok: false,
                          },
                        ].map((row) => (
                          <TableRow key={row.time}>
                            <TableCell>{row.time}</TableCell>
                            <TableCell align='center'>{row.wind}m/s</TableCell>
                            <TableCell align='center'>{row.temp}°C</TableCell>
                            <TableCell align='center'>{row.rain}%</TableCell>
                            <TableCell align='center'>
                              <Chip
                                label={row.ok ? '可' : '注意'}
                                size='small'
                                color={row.ok ? 'success' : 'warning'}
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* チェックリスト */}
                  <Typography variant='subtitle2' gutterBottom>
                    確認項目
                  </Typography>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.weather.windSpeed}
                          onChange={(e) =>
                            handleChecklistChange(
                              'weather',
                              'windSpeed',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          風速が基準値（5m/s）以下であることを確認
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.weather.temperature}
                          onChange={(e) =>
                            handleChecklistChange(
                              'weather',
                              'temperature',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          気温がバッテリー動作範囲内（0-40°C）を確認
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.weather.visibility}
                          onChange={(e) =>
                            handleChecklistChange(
                              'weather',
                              'visibility',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          視程が1.5km以上であることを確認
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.weather.precipitation}
                          onChange={(e) =>
                            handleChecklistChange(
                              'weather',
                              'precipitation',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          降雨・降雪がないことを確認
                        </Typography>
                      }
                    />
                  </Stack>
                </Paper>
              </Grid>

              {/* 空域情報 */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                  }}>
                  <Stack direction='row' spacing={1} alignItems='center' mb={2}>
                    <MapIcon color='primary' />
                    <Typography variant='h6' fontWeight={600}>
                      空域情報
                    </Typography>
                    {categoryProgress.airspace.complete && (
                      <CheckCircleIcon color='success' sx={{ ml: 'auto' }} />
                    )}
                  </Stack>

                  {/* 空域ステータス */}
                  <Stack spacing={2} mb={3}>
                    <Alert severity='success'>
                      <AlertTitle>緊急用務空域</AlertTitle>
                      現在、飛行予定エリアに緊急用務空域の指定はありません
                    </Alert>
                    <Alert severity='info'>
                      <AlertTitle>NOTAM情報</AlertTitle>
                      該当エリアに影響するNOTAMはありません（最終確認:{' '}
                      {new Date().toLocaleTimeString('ja-JP')}）
                    </Alert>
                    <Alert severity='warning'>
                      <AlertTitle>TFR（一時的飛行制限）</AlertTitle>
                      羽田空港周辺（半径6km）に一時的飛行制限が発令中。該当エリア外であることを確認してください。
                    </Alert>
                  </Stack>

                  {/* NOTAM一覧 */}
                  <Typography variant='subtitle2' gutterBottom>
                    近隣のNOTAM一覧
                  </Typography>
                  <TableContainer
                    component={Paper}
                    variant='outlined'
                    sx={{ mb: 2 }}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>NOTAM番号</TableCell>
                          <TableCell>内容</TableCell>
                          <TableCell>期間</TableCell>
                          <TableCell>影響</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>A0123/26</TableCell>
                          <TableCell>羽田空港 航空機増便</TableCell>
                          <TableCell>02/01-02/28</TableCell>
                          <TableCell>
                            <Chip
                              label='範囲外'
                              size='small'
                              color='success'
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>A0456/26</TableCell>
                          <TableCell>品川区 イベント開催</TableCell>
                          <TableCell>02/01</TableCell>
                          <TableCell>
                            <Chip
                              label='範囲外'
                              size='small'
                              color='success'
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* チェックリスト */}
                  <Typography variant='subtitle2' gutterBottom>
                    確認項目
                  </Typography>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.airspace.emergencyAirspace}
                          onChange={(e) =>
                            handleChecklistChange(
                              'airspace',
                              'emergencyAirspace',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          緊急用務空域に指定されていないことを確認
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.airspace.notam}
                          onChange={(e) =>
                            handleChecklistChange(
                              'airspace',
                              'notam',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          関連NOTAMを確認し、影響がないことを確認
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.airspace.tfr}
                          onChange={(e) =>
                            handleChecklistChange(
                              'airspace',
                              'tfr',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          TFR（一時的飛行制限）の影響がないことを確認
                        </Typography>
                      }
                    />
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        )}

        {/* タブ2: 機体・申請チェック */}
        {activeTab === 2 && (
          <Stack spacing={3}>
            {/* 進捗バー */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor:
                  categoryProgress.aircraft.complete &&
                  categoryProgress.permits.complete
                    ? alpha(theme.palette.success.main, 0.1)
                    : 'background.paper',
              }}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Typography variant='subtitle1' fontWeight={600}>
                    機体・申請チェック
                  </Typography>
                  <Chip
                    label={`${categoryProgress.aircraft.checked + categoryProgress.permits.checked}/${categoryProgress.aircraft.total + categoryProgress.permits.total} 確認済み`}
                    size='small'
                    color={
                      categoryProgress.aircraft.complete &&
                      categoryProgress.permits.complete
                        ? 'success'
                        : 'default'
                    }
                  />
                </Stack>
              </Stack>
            </Paper>

            <Grid container spacing={3}>
              {/* 機体診断 */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                  }}>
                  <Stack direction='row' spacing={1} alignItems='center' mb={2}>
                    <GpsFixedIcon color='primary' />
                    <Typography variant='h6' fontWeight={600}>
                      機体診断
                    </Typography>
                    {categoryProgress.aircraft.complete && (
                      <CheckCircleIcon color='success' sx={{ ml: 'auto' }} />
                    )}
                  </Stack>

                  {/* 機体ステータス */}
                  <Paper
                    variant='outlined'
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant='caption' color='text.secondary'>
                          GPS衛星数
                        </Typography>
                        <Typography
                          variant='h5'
                          fontWeight={700}
                          color='success.main'>
                          12
                        </Typography>
                        <Typography variant='caption'>衛星</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant='caption' color='text.secondary'>
                          HDOP
                        </Typography>
                        <Typography
                          variant='h5'
                          fontWeight={700}
                          color='success.main'>
                          0.8
                        </Typography>
                        <Typography variant='caption'>精度</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant='caption' color='text.secondary'>
                          FW Ver
                        </Typography>
                        <Typography variant='h5' fontWeight={700}>
                          2.1
                        </Typography>
                        <Typography variant='caption'>.3</Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant='caption' color='text.secondary'>
                          飛行時間
                        </Typography>
                        <Typography variant='h5' fontWeight={700}>
                          124
                        </Typography>
                        <Typography variant='caption'>時間</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* チェックリスト */}
                  <Typography variant='subtitle2' gutterBottom>
                    確認項目
                  </Typography>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.aircraft.gps}
                          onChange={(e) =>
                            handleChecklistChange(
                              'aircraft',
                              'gps',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Stack direction='row' alignItems='center' spacing={1}>
                          <Typography variant='body2'>
                            GPS受信状態が良好（8衛星以上）
                          </Typography>
                          <Chip
                            label='12衛星'
                            size='small'
                            color='success'
                            sx={{ height: 20 }}
                          />
                        </Stack>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.aircraft.remoteId}
                          onChange={(e) =>
                            handleChecklistChange(
                              'aircraft',
                              'remoteId',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Stack direction='row' alignItems='center' spacing={1}>
                          <Typography variant='body2'>
                            リモートIDが有効に動作
                          </Typography>
                          <Chip
                            label='有効'
                            size='small'
                            color='success'
                            sx={{ height: 20 }}
                          />
                        </Stack>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.aircraft.calibration}
                          onChange={(e) =>
                            handleChecklistChange(
                              'aircraft',
                              'calibration',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Stack direction='row' alignItems='center' spacing={1}>
                          <Typography variant='body2'>
                            センサーキャリブレーション完了
                          </Typography>
                          <Chip
                            label='完了'
                            size='small'
                            color='success'
                            sx={{ height: 20 }}
                          />
                        </Stack>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.aircraft.firmware}
                          onChange={(e) =>
                            handleChecklistChange(
                              'aircraft',
                              'firmware',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Stack direction='row' alignItems='center' spacing={1}>
                          <Typography variant='body2'>
                            ファームウェアが最新版
                          </Typography>
                          <Chip
                            label='v2.1.3'
                            size='small'
                            color='success'
                            sx={{ height: 20 }}
                          />
                        </Stack>
                      }
                    />
                  </Stack>
                </Paper>
              </Grid>

              {/* 申請・許可確認 */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                  }}>
                  <Stack direction='row' spacing={1} alignItems='center' mb={2}>
                    <DescriptionIcon color='primary' />
                    <Typography variant='h6' fontWeight={600}>
                      申請・許可確認
                    </Typography>
                    {categoryProgress.permits.complete && (
                      <CheckCircleIcon color='success' sx={{ ml: 'auto' }} />
                    )}
                  </Stack>

                  {/* 有効期限一覧 */}
                  <TableContainer
                    component={Paper}
                    variant='outlined'
                    sx={{ mb: 2 }}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>項目</TableCell>
                          <TableCell>ステータス</TableCell>
                          <TableCell>有効期限</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>DIPS飛行計画</TableCell>
                          <TableCell>
                            <Chip
                              label='通報済み'
                              size='small'
                              color='success'
                              sx={{ height: 20 }}
                            />
                          </TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>包括許可</TableCell>
                          <TableCell>
                            <Chip
                              label='有効'
                              size='small'
                              color='success'
                              sx={{ height: 20 }}
                            />
                          </TableCell>
                          <TableCell>2026/12/31</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>賠償責任保険</TableCell>
                          <TableCell>
                            <Chip
                              label='有効'
                              size='small'
                              color='success'
                              sx={{ height: 20 }}
                            />
                          </TableCell>
                          <TableCell>2026/06/30</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>操縦者資格</TableCell>
                          <TableCell>
                            <Chip
                              label='一等'
                              size='small'
                              color='success'
                              sx={{ height: 20 }}
                            />
                          </TableCell>
                          <TableCell>2027/03/31</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* チェックリスト */}
                  <Typography variant='subtitle2' gutterBottom>
                    確認項目
                  </Typography>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.permits.dips}
                          onChange={(e) =>
                            handleChecklistChange(
                              'permits',
                              'dips',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          DIPS飛行計画が通報済み
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.permits.permission}
                          onChange={(e) =>
                            handleChecklistChange(
                              'permits',
                              'permission',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          飛行許可・承認が有効期限内
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.permits.insurance}
                          onChange={(e) =>
                            handleChecklistChange(
                              'permits',
                              'insurance',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          賠償責任保険が有効期限内
                        </Typography>
                      }
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={checklist.permits.qualification}
                          onChange={(e) =>
                            handleChecklistChange(
                              'permits',
                              'qualification',
                              e.target.checked
                            )
                          }
                        />
                      }
                      label={
                        <Typography variant='body2'>
                          操縦者の資格が有効
                        </Typography>
                      }
                    />
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        )}

        {/* タブ3: デコンフリクション */}
        {activeTab === 3 && (
          <Stack spacing={3}>
            {/* 進捗バー */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: categoryProgress.deconfliction.complete
                  ? alpha(theme.palette.success.main, 0.1)
                  : 'background.paper',
              }}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Typography variant='subtitle1' fontWeight={600}>
                    デコンフリクション
                  </Typography>
                  <Chip
                    label={
                      checklist.deconfliction.checked ? '確認済み' : '未確認'
                    }
                    size='small'
                    color={
                      checklist.deconfliction.checked ? 'success' : 'default'
                    }
                  />
                </Stack>
              </Stack>
            </Paper>

            <Grid container spacing={3}>
              {/* 地図表示 */}
              <Grid size={{ xs: 12, lg: 7 }}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${theme.palette.divider}`,
                    height: 400,
                    position: 'relative',
                  }}>
                  <Map
                    initialViewState={{
                      longitude: 139.7,
                      latitude: 35.68,
                      zoom: 11,
                    }}
                    style={{ width: '100%', height: '100%' }}
                    mapStyle='https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'>
                    {/* 自機のフライトエリア */}
                    <Source
                      id='own-flights'
                      type='geojson'
                      data={flightGeoJSON}>
                      <Layer
                        id='own-flights-fill'
                        type='fill'
                        paint={{
                          'fill-color': theme.palette.primary.main,
                          'fill-opacity': 0.3,
                        }}
                      />
                      <Layer
                        id='own-flights-line'
                        type='line'
                        paint={{
                          'line-color': theme.palette.primary.main,
                          'line-width': 2,
                        }}
                      />
                    </Source>

                    {/* 他機のフライトエリア（モック） */}
                    <Source
                      id='other-flights'
                      type='geojson'
                      data={{
                        type: 'FeatureCollection',
                        features: [
                          {
                            type: 'Feature',
                            properties: { name: '他社A飛行計画' },
                            geometry: {
                              type: 'Polygon',
                              coordinates: [
                                [
                                  [139.72, 35.7],
                                  [139.74, 35.7],
                                  [139.74, 35.72],
                                  [139.72, 35.72],
                                  [139.72, 35.7],
                                ],
                              ],
                            },
                          },
                        ],
                      }}>
                      <Layer
                        id='other-flights-fill'
                        type='fill'
                        paint={{
                          'fill-color': theme.palette.warning.main,
                          'fill-opacity': 0.2,
                        }}
                      />
                      <Layer
                        id='other-flights-line'
                        type='line'
                        paint={{
                          'line-color': theme.palette.warning.main,
                          'line-width': 2,
                          'line-dasharray': [2, 2],
                        }}
                      />
                    </Source>
                  </Map>

                  {/* 凡例 */}
                  <Paper
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      left: 16,
                      px: 2,
                      py: 1,
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: 'blur(4px)',
                    }}>
                    <Stack spacing={1}>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            bgcolor: theme.palette.primary.main,
                            borderRadius: 0.5,
                          }}
                        />
                        <Typography variant='caption'>自社飛行計画</Typography>
                      </Stack>
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            bgcolor: theme.palette.warning.main,
                            borderRadius: 0.5,
                            opacity: 0.5,
                          }}
                        />
                        <Typography variant='caption'>他社飛行計画</Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                </Paper>
              </Grid>

              {/* 干渉チェック結果 */}
              <Grid size={{ xs: 12, lg: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                  }}>
                  <Typography variant='h6' fontWeight={600} gutterBottom>
                    干渉チェック結果
                  </Typography>

                  <Alert severity='success' sx={{ mb: 2 }}>
                    <AlertTitle>干渉なし</AlertTitle>
                    本日予定されている全ての飛行計画において、他の運航者との干渉は検出されませんでした。
                  </Alert>

                  <Stack spacing={2} mb={3}>
                    {scheduledFlights.slice(0, 4).map((flight) => (
                      <Paper
                        key={flight.id}
                        variant='outlined'
                        sx={{ p: 2, borderRadius: 2 }}>
                        <Stack
                          direction='row'
                          justifyContent='space-between'
                          alignItems='center'>
                          <Box>
                            <Typography variant='subtitle2' fontWeight={600}>
                              {flight.flightPlan.name}
                            </Typography>
                            <Typography
                              variant='caption'
                              color='text.secondary'>
                              {flight.estimatedStartTime.toLocaleTimeString(
                                'ja-JP',
                                { hour: '2-digit', minute: '2-digit' }
                              )}{' '}
                              -{' '}
                              {flight.estimatedEndTime.toLocaleTimeString(
                                'ja-JP',
                                { hour: '2-digit', minute: '2-digit' }
                              )}
                            </Typography>
                          </Box>
                          <Chip
                            label='干渉なし'
                            size='small'
                            color='success'
                            icon={<CheckCircleIcon />}
                          />
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklist.deconfliction.checked}
                        onChange={(e) =>
                          handleChecklistChange(
                            'deconfliction',
                            'checked',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label={
                      <Typography variant='body2' fontWeight={600}>
                        他機との干渉がないことを確認しました
                      </Typography>
                    }
                  />
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        )}

        {/* タブ4: 運航体制 */}
        {activeTab === 4 && (
          <Stack spacing={3}>
            {/* 進捗バー */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: categoryProgress.crew.complete
                  ? alpha(theme.palette.success.main, 0.1)
                  : 'background.paper',
              }}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'>
                <Stack direction='row' spacing={2} alignItems='center'>
                  <Typography variant='subtitle1' fontWeight={600}>
                    運航体制確認
                  </Typography>
                  <Chip
                    label={`${categoryProgress.crew.checked}/${categoryProgress.crew.total} 確認済み`}
                    size='small'
                    color={
                      categoryProgress.crew.complete ? 'success' : 'default'
                    }
                  />
                </Stack>
              </Stack>
            </Paper>

            <Grid container spacing={3}>
              {/* 人員配置 */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                  }}>
                  <Stack direction='row' spacing={1} alignItems='center' mb={2}>
                    <GroupsIcon color='primary' />
                    <Typography variant='h6' fontWeight={600}>
                      人員配置
                    </Typography>
                  </Stack>

                  <Stack spacing={2}>
                    <Paper variant='outlined' sx={{ p: 2, borderRadius: 2 }}>
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='flex-start'>
                        <Box>
                          <Typography variant='subtitle2' fontWeight={600}>
                            操縦者
                          </Typography>
                          <Typography variant='body2'>山田太郎</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            一等無人航空機操縦士 / JA-XXXXX
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={checklist.crew.pilot}
                              onChange={(e) =>
                                handleChecklistChange(
                                  'crew',
                                  'pilot',
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label='確認'
                        />
                      </Stack>
                    </Paper>

                    <Paper variant='outlined' sx={{ p: 2, borderRadius: 2 }}>
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='flex-start'>
                        <Box>
                          <Typography variant='subtitle2' fontWeight={600}>
                            補助者
                          </Typography>
                          <Typography variant='body2'>佐藤花子</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            監視・周辺警戒担当
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={checklist.crew.assistant}
                              onChange={(e) =>
                                handleChecklistChange(
                                  'crew',
                                  'assistant',
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label='確認'
                        />
                      </Stack>
                    </Paper>

                    <Paper variant='outlined' sx={{ p: 2, borderRadius: 2 }}>
                      <Stack
                        direction='row'
                        justifyContent='space-between'
                        alignItems='flex-start'>
                        <Box>
                          <Typography variant='subtitle2' fontWeight={600}>
                            安全管理者
                          </Typography>
                          <Typography variant='body2'>鈴木一郎</Typography>
                          <Typography variant='caption' color='text.secondary'>
                            運航全体の安全管理
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={checklist.crew.safetyManager}
                              onChange={(e) =>
                                handleChecklistChange(
                                  'crew',
                                  'safetyManager',
                                  e.target.checked
                                )
                              }
                            />
                          }
                          label='確認'
                        />
                      </Stack>
                    </Paper>
                  </Stack>
                </Paper>
              </Grid>

              {/* 緊急連絡先 */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    height: '100%',
                  }}>
                  <Stack direction='row' spacing={1} alignItems='center' mb={2}>
                    <ErrorIcon color='error' />
                    <Typography variant='h6' fontWeight={600}>
                      緊急連絡先
                    </Typography>
                  </Stack>

                  <TableContainer
                    component={Paper}
                    variant='outlined'
                    sx={{ mb: 2 }}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>連絡先</TableCell>
                          <TableCell>電話番号</TableCell>
                          <TableCell>備考</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>運航管理者</TableCell>
                          <TableCell fontWeight={600}>03-1234-5678</TableCell>
                          <TableCell>24時間対応</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>保険会社</TableCell>
                          <TableCell fontWeight={600}>0120-XXX-XXX</TableCell>
                          <TableCell>事故時連絡</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>最寄り消防署</TableCell>
                          <TableCell fontWeight={600}>03-XXXX-XXXX</TableCell>
                          <TableCell>品川消防署</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>最寄り警察署</TableCell>
                          <TableCell fontWeight={600}>03-XXXX-XXXX</TableCell>
                          <TableCell>品川警察署</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>国土交通省</TableCell>
                          <TableCell fontWeight={600}>03-5253-8111</TableCell>
                          <TableCell>事故報告</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklist.crew.emergencyContacts}
                        onChange={(e) =>
                          handleChecklistChange(
                            'crew',
                            'emergencyContacts',
                            e.target.checked
                          )
                        }
                      />
                    }
                    label={
                      <Typography variant='body2' fontWeight={600}>
                        緊急連絡先を確認し、連絡手段を確保しました
                      </Typography>
                    }
                  />
                </Paper>
              </Grid>
            </Grid>

            {/* 全チェック完了時のアクション */}
            {isAllChecked && (
              <Alert
                severity='success'
                action={
                  <Button
                    color='inherit'
                    size='small'
                    variant='outlined'
                    startIcon={<PlayArrowIcon />}
                    onClick={() => navigate('/monitoring')}>
                    飛行監視を開始
                  </Button>
                }>
                <AlertTitle>全ての確認が完了しました</AlertTitle>
                飛行前準備が完了しました。飛行監視を開始できます。
              </Alert>
            )}
          </Stack>
        )}
      </Box>

      {/* プリフライトウィザードダイアログ */}
      <Dialog
        open={wizardOpen}
        onClose={handleWizardClose}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh',
          },
        }}>
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
          <Typography variant='h6' fontWeight='bold'>
            飛行前準備ウィザード
          </Typography>
          <IconButton onClick={handleWizardClose} size='small'>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <UTMPreflightWizard
            selectedFlight={wizardFlight}
            availableFlights={scheduledFlights}
            onFlightSelect={handleWizardFlightSelect}
            onStartFlight={handleWizardStartFlight}
            onCancel={handleWizardClose}
          />
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default UTMPreFlightLobbyPage
