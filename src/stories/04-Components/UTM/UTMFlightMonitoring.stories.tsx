import { Box, Grid, Paper, alpha, useTheme } from '@mui/material'
import { useState } from 'react'
import { action } from 'storybook/actions'

import UTMAlertLogPanel from '@/components/utm/UTMAlertLogPanel'
import UTMAlertThresholdSettings from '@/components/utm/UTMAlertThresholdSettings'
import UTMDroneDetailWidget from '@/components/utm/UTMDroneDetailWidget'
import UTMDroneSelector from '@/components/utm/UTMDroneSelector'
import UTMMapLayerControl from '@/components/utm/UTMMapLayerControl'
import { DEFAULT_ALERT_THRESHOLDS } from '@/constants/utmLabels'
import type {
  AlertLogEntry,
  AlertThresholdConfig,
  DroneFlightStatus,
  ExtendedDroneInfo,
  MapLayerType,
} from '@/types/utmTypes'

import type { Meta, StoryObj } from '@storybook/react-vite'

// デフォルトのレイヤー状態
const createDefaultLayerState = (): Record<MapLayerType, boolean> => ({
  airport_vicinity: true,
  did_area: true,
  emergency_airspace: true,
  manned_aircraft_area: true,
  remote_id_area: false,
  sua_red_zone: true,
  sua_yellow_zone: true,
  terrain: false,
  rain_cloud: false,
  wind: false,
  lte_coverage: false,
})

// モックドローンデータ
const createMockDrones = (): DroneFlightStatus[] => [
  {
    droneId: 'drone-001',
    droneName: '北海道1号機',
    pilotId: 'pilot-001',
    pilotName: '山田太郎',
    flightPlanId: 'plan-001',
    position: {
      droneId: 'drone-001',
      latitude: 35.6812,
      longitude: 139.7671,
      altitude: 85,
      heading: 45,
      speed: 12.5,
      timestamp: new Date(),
      attitude: { roll: 2.5, pitch: -5.0, yaw: 45 },
    },
    batteryLevel: 75,
    signalStrength: 92,
    flightMode: 'auto',
    status: 'in_flight',
    startTime: new Date(Date.now() - 1800000),
    estimatedEndTime: new Date(Date.now() + 1800000),
  },
  {
    droneId: 'drone-002',
    droneName: '東京2号機',
    pilotId: 'pilot-002',
    pilotName: '佐藤花子',
    flightPlanId: 'plan-002',
    position: {
      droneId: 'drone-002',
      latitude: 35.6895,
      longitude: 139.6917,
      altitude: 120,
      heading: 180,
      speed: 8.3,
      timestamp: new Date(),
      attitude: { roll: 0.5, pitch: -2.0, yaw: 180 },
    },
    batteryLevel: 45,
    signalStrength: 78,
    flightMode: 'manual',
    status: 'in_flight',
    startTime: new Date(Date.now() - 900000),
    estimatedEndTime: new Date(Date.now() + 2700000),
  },
  {
    droneId: 'drone-003',
    droneName: '大阪3号機',
    pilotId: 'pilot-003',
    pilotName: '鈴木一郎',
    flightPlanId: 'plan-003',
    position: {
      droneId: 'drone-003',
      latitude: 34.6937,
      longitude: 135.5023,
      altitude: 60,
      heading: 270,
      speed: 0,
      timestamp: new Date(),
      attitude: { roll: 0, pitch: 0, yaw: 270 },
    },
    batteryLevel: 25,
    signalStrength: 45,
    flightMode: 'hover',
    status: 'hovering',
    startTime: new Date(Date.now() - 600000),
    estimatedEndTime: null,
  },
  {
    droneId: 'drone-004',
    droneName: '名古屋4号機',
    pilotId: 'pilot-004',
    pilotName: '田中美咲',
    flightPlanId: null,
    position: {
      droneId: 'drone-004',
      latitude: 35.1815,
      longitude: 136.9066,
      altitude: 0,
      heading: 0,
      speed: 0,
      timestamp: new Date(),
      attitude: { roll: 0, pitch: 0, yaw: 0 },
    },
    batteryLevel: 100,
    signalStrength: 100,
    flightMode: 'manual',
    status: 'preflight',
    startTime: new Date(),
    estimatedEndTime: null,
  },
  {
    droneId: 'drone-005',
    droneName: '福岡5号機',
    pilotId: 'pilot-005',
    pilotName: '高橋次郎',
    flightPlanId: 'plan-005',
    position: {
      droneId: 'drone-005',
      latitude: 33.5904,
      longitude: 130.4017,
      altitude: 95,
      heading: 90,
      speed: 15.2,
      timestamp: new Date(),
      attitude: { roll: -3.2, pitch: 4.5, yaw: 92 },
    },
    batteryLevel: 62,
    signalStrength: 85,
    flightMode: 'auto',
    status: 'in_flight',
    startTime: new Date(Date.now() - 2400000),
    estimatedEndTime: new Date(Date.now() + 600000),
  },
]

// 拡張ドローン情報のモック
const createMockExtendedDrone = (): ExtendedDroneInfo => ({
  droneId: 'drone-001',
  droneName: '北海道1号機',
  modelName: 'DJI Matrice 300 RTK',
  juNumber: 'JU0001234',
  batteryLevel: 75,
  batteryVoltage: 44.2,
  batteryTemperature: 32,
  gps: {
    satelliteCount: 18,
    hdop: 0.8,
    vdop: 1.2,
    fixType: 'rtk_fixed',
  },
  signal: {
    lte: {
      rssi: -65,
      rsrp: -85,
      rsrq: -10,
      carrier: 'KDDI',
    },
    radio24ghz: {
      rssi: -45,
      channel: 6,
    },
    radio58ghz: {
      rssi: -52,
      channel: 36,
    },
  },
  altitude: {
    agl: 85.2,
    amsl: 135.8,
    relative: 85.2,
  },
  position: {
    latitude: 35.6812,
    longitude: 139.7671,
    heading: 45,
  },
  attitude: {
    roll: 2.5,
    pitch: -5.0,
    yaw: 45,
  },
  flightMode: 'auto',
  lastUpdated: new Date(),
})

// アラートログのモック
const createMockAlertLogs = (): AlertLogEntry[] => [
  {
    id: 'alert-001',
    droneId: 'drone-001',
    droneName: '北海道1号機',
    type: 'warning',
    category: 'low_battery',
    severity: 'warning',
    message: 'バッテリ残量が40%を下回りました',
    timestamp: new Date(Date.now() - 300000),
    acknowledged: false,
    data: { value: 38, threshold: 40 },
  },
  {
    id: 'alert-002',
    droneId: 'drone-001',
    droneName: '北海道1号機',
    type: 'warning',
    category: 'weather_warning',
    severity: 'warning',
    message: '風速が8m/sを超えています',
    timestamp: new Date(Date.now() - 600000),
    acknowledged: true,
    data: { value: 9.2, threshold: 8 },
  },
  {
    id: 'alert-003',
    droneId: 'drone-002',
    droneName: '東京2号機',
    type: 'alert',
    category: 'zone_approach',
    severity: 'critical',
    message: '禁止区域に接近しています',
    timestamp: new Date(Date.now() - 120000),
    acknowledged: false,
    data: {
      position: { latitude: 35.6895, longitude: 139.6917, altitude: 120 },
    },
  },
  {
    id: 'alert-004',
    droneId: 'drone-003',
    droneName: '大阪3号機',
    type: 'alert',
    category: 'low_battery',
    severity: 'emergency',
    message: 'バッテリ残量が30%を下回りました - 即時帰還を推奨',
    timestamp: new Date(Date.now() - 60000),
    acknowledged: false,
    data: { value: 25, threshold: 30 },
  },
  {
    id: 'alert-005',
    droneId: 'drone-003',
    droneName: '大阪3号機',
    type: 'warning',
    category: 'signal_loss',
    severity: 'warning',
    message: '通信強度が低下しています',
    timestamp: new Date(Date.now() - 180000),
    acknowledged: false,
    data: { value: 45, threshold: 50 },
  },
]

// 閾値設定のモック
const createMockThresholdConfig = (): AlertThresholdConfig => ({
  id: 'config-001',
  droneModelId: 'model-001',
  droneModelName: 'DJI Matrice 300 RTK',
  warning: {
    altitudeLimit: {
      enabled: true,
      threshold: DEFAULT_ALERT_THRESHOLDS.warning.altitudeLimit,
    },
    routeDeviation: {
      enabled: true,
      threshold: DEFAULT_ALERT_THRESHOLDS.warning.routeDeviation,
    },
    batteryLevel: {
      enabled: true,
      threshold: DEFAULT_ALERT_THRESHOLDS.warning.batteryLevel,
    },
    gpsSignal: {
      enabled: true,
      minSatellites: DEFAULT_ALERT_THRESHOLDS.warning.gpsMinSatellites,
    },
    signalStrength: {
      enabled: true,
      threshold: DEFAULT_ALERT_THRESHOLDS.warning.signalStrength,
    },
    systemError: { enabled: true },
    windSpeed: {
      enabled: true,
      threshold: DEFAULT_ALERT_THRESHOLDS.warning.windSpeed,
    },
  },
  alert: {
    altitudeExceeded: {
      enabled: true,
      threshold: DEFAULT_ALERT_THRESHOLDS.alert.altitudeExceeded,
    },
    geofenceBreach: { enabled: true },
    zoneViolation: { enabled: true },
    batteryLow: {
      enabled: true,
      threshold: DEFAULT_ALERT_THRESHOLDS.alert.batteryLow,
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
})

const meta: Meta = {
  title: 'Components/UTM/FlightMonitoring',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 飛行モニタリング機能

UTMシステムにおける飛行中のドローンをモニタリングするためのコンポーネント群です。

### 主な機能

#### 1. 機体選択 (UTMDroneSelector)
- モニタリング対象の機体を選択
- 最大10機まで選択可能
- 検索・フィルタリング機能

#### 2. 機体詳細表示 (UTMDroneDetailWidget)
- 機体管理名、機種名、JU番号
- バッテリ情報（残量、電圧、温度）
- GPS情報（衛星数、Fix Type）
- 高度情報（対地、平均海抜、相対）
- 位置・姿勢情報
- 電波情報（LTE、2.4GHz、5.8GHz）

#### 3. マップレイヤー制御 (UTMMapLayerControl)
- 禁止エリア表示切替
- 地理情報表示
- 天候情報オーバーレイ
- 電波カバレッジ表示

#### 4. アラート閾値設定 (UTMAlertThresholdSettings)
- Warning/Alert閾値の個別設定
- 機体型式ごとの設定
- リセット・保存機能

#### 5. アラートログ (UTMAlertLogPanel)
- 機体ごとのアラート履歴
- 時系列表示
- フィルタリング機能
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
}

export default meta

// ======================================
// UTMMapLayerControl Stories
// ======================================

export const MapLayerControl: StoryObj = {
  name: 'マップレイヤー制御',
  render: () => {
    const MapLayerControlDemo = () => {
      const [layerState, setLayerState] = useState(createDefaultLayerState())

      return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <UTMMapLayerControl
                layerState={layerState}
                onLayerChange={(layerId, enabled) => {
                  setLayerState((prev) => ({ ...prev, [layerId]: enabled }))
                }}
                onLayerBulkChange={setLayerState}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <UTMMapLayerControl
                layerState={layerState}
                onLayerChange={(layerId, enabled) => {
                  setLayerState((prev) => ({ ...prev, [layerId]: enabled }))
                }}
                compact
                defaultExpanded={false}
              />
            </Grid>
          </Grid>
        </Box>
      )
    }
    return <MapLayerControlDemo />
  },
  parameters: {
    docs: {
      description: {
        story:
          '地図上のレイヤー表示を制御するコンポーネント。禁止エリア、天候情報、電波情報などの表示を切り替えられます。',
      },
    },
  },
}

// ======================================
// UTMDroneSelector Stories
// ======================================

export const DroneSelector: StoryObj = {
  name: '機体選択',
  render: () => {
    const DroneSelectorDemo = () => {
      const [selectedIds, setSelectedIds] = useState<string[]>(['drone-001'])
      const drones = createMockDrones()

      return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <UTMDroneSelector
                drones={drones}
                selectedDroneIds={selectedIds}
                onSelectionChange={setSelectedIds}
                maxSelection={10}
                title='モニタリング機体選択'
                height={400}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <UTMDroneSelector
                drones={drones}
                selectedDroneIds={selectedIds}
                onSelectionChange={setSelectedIds}
                singleSelect
                title='単一選択モード'
                height={400}
              />
            </Grid>
          </Grid>
        </Box>
      )
    }
    return <DroneSelectorDemo />
  },
  parameters: {
    docs: {
      description: {
        story:
          'モニタリング対象の機体を選択するコンポーネント。複数選択（最大10機）と単一選択モードを切り替え可能。',
      },
    },
  },
}

// ======================================
// UTMDroneDetailWidget Stories
// ======================================

export const DroneDetailWidget: StoryObj = {
  name: '機体詳細情報',
  render: () => {
    const drone = createMockExtendedDrone()

    return (
      <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <UTMDroneDetailWidget drone={drone} flightStatus='in_flight' />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <UTMDroneDetailWidget
              drone={drone}
              flightStatus='in_flight'
              compact
            />
          </Grid>
        </Grid>
      </Box>
    )
  },
  parameters: {
    docs: {
      description: {
        story:
          '機体の詳細なテレメトリ情報を表示するウィジェット。バッテリ、GPS、高度、位置、姿勢、電波情報を確認できます。',
      },
    },
  },
}

// ======================================
// UTMAlertThresholdSettings Stories
// ======================================

export const AlertThresholdSettings: StoryObj = {
  name: 'アラート閾値設定',
  render: () => {
    const AlertThresholdDemo = () => {
      const [config, setConfig] = useState(createMockThresholdConfig())

      return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
          <UTMAlertThresholdSettings
            config={config}
            onChange={setConfig}
            onSave={action('onSave')}
            droneModelName='DJI Matrice 300 RTK'
            sx={{ maxWidth: 600 }}
          />
        </Box>
      )
    }
    return <AlertThresholdDemo />
  },
  parameters: {
    docs: {
      description: {
        story:
          'Warning/Alertの閾値を機体型式ごとに設定するコンポーネント。各項目の有効/無効と閾値を個別に設定できます。',
      },
    },
  },
}

// ======================================
// UTMAlertLogPanel Stories
// ======================================

export const AlertLogPanel: StoryObj = {
  name: 'アラートログ',
  render: () => {
    const AlertLogDemo = () => {
      const [alerts, setAlerts] = useState(createMockAlertLogs())

      const handleAcknowledge = (alertId: string) => {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
        )
      }

      const handleAcknowledgeAll = (droneId: string) => {
        setAlerts((prev) =>
          prev.map((a) =>
            a.droneId === droneId ? { ...a, acknowledged: true } : a
          )
        )
      }

      return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
          <UTMAlertLogPanel
            alerts={alerts}
            onAcknowledge={handleAcknowledge}
            onAcknowledgeAll={handleAcknowledgeAll}
            onAlertClick={action('onAlertClick')}
            height={400}
            sx={{ maxWidth: 600 }}
          />
        </Box>
      )
    }
    return <AlertLogDemo />
  },
  parameters: {
    docs: {
      description: {
        story:
          '機体ごとにアラートを時系列でまとめて表示するコンポーネント。フィルタリングと確認済み機能を提供します。',
      },
    },
  },
}

// ======================================
// 統合デモ
// ======================================

export const IntegratedDemo: StoryObj = {
  name: '統合デモ - 飛行モニタリング画面',
  render: () => {
    const IntegratedMonitoringDemo = () => {
      const theme = useTheme()
      const [layerState, setLayerState] = useState(createDefaultLayerState())
      const [selectedDroneIds, setSelectedDroneIds] = useState<string[]>([
        'drone-001',
      ])
      const [alerts, setAlerts] = useState(createMockAlertLogs())
      const [thresholdConfig, setThresholdConfig] = useState(
        createMockThresholdConfig()
      )

      const drones = createMockDrones()
      const selectedDrone = drones.find(
        (d) => d.droneId === selectedDroneIds[0]
      )
      const extendedDrone = createMockExtendedDrone()

      const handleAcknowledge = (alertId: string) => {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
        )
      }

      return (
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.default',
            minHeight: '100vh',
          }}>
          <Grid container spacing={2}>
            {/* 左サイドバー：機体選択 */}
            <Grid size={{ xs: 12, md: 3 }}>
              <UTMDroneSelector
                drones={drones}
                selectedDroneIds={selectedDroneIds}
                onSelectionChange={setSelectedDroneIds}
                maxSelection={10}
                height={300}
              />
              <Box sx={{ mt: 2 }}>
                <UTMMapLayerControl
                  layerState={layerState}
                  onLayerChange={(layerId, enabled) => {
                    setLayerState((prev) => ({ ...prev, [layerId]: enabled }))
                  }}
                  onLayerBulkChange={setLayerState}
                />
              </Box>
            </Grid>

            {/* 中央：地図エリア（プレースホルダー） */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  height: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor:
                    theme.palette.mode === 'dark'
                      ? 'rgba(30, 41, 59, 0.85)'
                      : 'rgba(255, 255, 255, 0.9)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
                  borderRadius: 2,
                }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      fontSize: 48,
                      color: 'text.secondary',
                      mb: 2,
                    }}>
                    Map Area
                  </Box>
                  <Box sx={{ color: 'text.secondary' }}>
                    UTMTrackingMapコンポーネントがここに表示されます
                  </Box>
                </Box>
              </Paper>
              {/* 選択中の機体詳細 */}
              {selectedDrone && (
                <Box sx={{ mt: 2 }}>
                  <UTMDroneDetailWidget
                    drone={extendedDrone}
                    flightStatus='in_flight'
                  />
                </Box>
              )}
            </Grid>

            {/* 右サイドバー：アラート */}
            <Grid size={{ xs: 12, md: 3 }}>
              <UTMAlertLogPanel
                alerts={alerts}
                onAcknowledge={handleAcknowledge}
                onAlertClick={action('onAlertClick')}
                height={350}
              />
              <Box sx={{ mt: 2 }}>
                <UTMAlertThresholdSettings
                  config={thresholdConfig}
                  onChange={setThresholdConfig}
                  onSave={action('onSave')}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      )
    }
    return <IntegratedMonitoringDemo />
  },
  parameters: {
    docs: {
      description: {
        story:
          '飛行モニタリング機能の統合デモ。機体選択、レイヤー制御、機体詳細、アラートログ、閾値設定を組み合わせた画面です。',
      },
    },
  },
}
