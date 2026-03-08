import { Box } from '@mui/material'
import { useState } from 'react'
import { action } from 'storybook/actions'

import UTMTrackingMap from '@/components/utm/UTMTrackingMap'

import type {
  DroneFlightStatus,
  RestrictedZone,
  UTMAlert,
} from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMTrackingMap> = {
  title: 'Components/UTM/UTMTrackingMap',
  component: UTMTrackingMap,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## ドローントラッキングマップ

複数ドローンの位置をリアルタイムで表示する地図コンポーネントです。

### 主な機能
- ドローンの現在位置をマーカーで表示
- 飛行経路（コリドー）の可視化
- 制限区域（禁止/要許可/注意）の表示
- ドローン選択によるポップアップ表示
- 3Dビューモード対応
- 全機表示ズーム機能

### マーカー表示
- 正常時: ドローン固有の色で表示
- 緊急時: 赤色で点滅表示
- バッテリー低下時: 警告バッジ表示
- 選択時: ハイライト枠表示

### 制限区域
- 禁止区域（赤）: 飛行禁止エリア
- 要許可区域（黄）: 許可が必要なエリア
- 注意区域（青）: 注意が必要なエリア

### 使用場面
- UTM監視ダッシュボードのメインビューとして
- 飛行計画確認画面として
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  decorators: [
    (Story) => (
      <Box sx={{ width: '100vw', height: '100vh' }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    height: {
      control: 'text',
      description: '地図の高さ',
    },
    showZones: {
      control: 'boolean',
      description: '制限区域の表示',
    },
    is3DView: {
      control: 'boolean',
      description: '3Dビューモード',
    },
    leftOffset: {
      control: { type: 'number', min: 0, max: 400 },
      description: '左側のオフセット',
    },
  },
}

export default meta
type Story = StoryObj<typeof UTMTrackingMap>

// モックドローンデータ
const createMockDrones = (): DroneFlightStatus[] => [
  {
    droneId: 'drone-1',
    droneName: '新十津川(845)',
    pilotId: 'pilot-1',
    pilotName: '山田太郎',
    flightPlanId: 'plan-1',
    position: {
      droneId: 'drone-1',
      latitude: 35.6812,
      longitude: 139.7671,
      altitude: 85,
      heading: 45,
      speed: 12.5,
      timestamp: new Date(),
    },
    batteryLevel: 75,
    signalStrength: 92,
    flightMode: 'auto',
    status: 'in_flight',
    startTime: new Date(Date.now() - 1800000),
    estimatedEndTime: new Date(Date.now() + 1800000),
    plannedRoute: {
      waypoints: [
        [139.76, 35.675],
        [139.77, 35.68],
        [139.775, 35.685],
        [139.77, 35.69],
      ],
      corridorWidth: 50,
      color: '#3b82f6',
    },
  },
  {
    droneId: 'drone-2',
    droneName: '浦安(949)',
    pilotId: 'pilot-2',
    pilotName: '佐藤花子',
    flightPlanId: 'plan-2',
    position: {
      droneId: 'drone-2',
      latitude: 35.655,
      longitude: 139.75,
      altitude: 60,
      heading: 180,
      speed: 8.2,
      timestamp: new Date(),
    },
    batteryLevel: 45,
    signalStrength: 78,
    flightMode: 'manual',
    status: 'in_flight',
    startTime: new Date(Date.now() - 2400000),
    estimatedEndTime: new Date(Date.now() + 1200000),
    plannedRoute: {
      waypoints: [
        [139.745, 35.65],
        [139.755, 35.66],
        [139.75, 35.655],
      ],
      corridorWidth: 50,
      color: '#22c55e',
    },
  },
  {
    droneId: 'drone-3',
    droneName: '秩父#1(945)',
    pilotId: 'pilot-3',
    pilotName: '鈴木一郎',
    flightPlanId: 'plan-3',
    position: {
      droneId: 'drone-3',
      latitude: 35.695,
      longitude: 139.72,
      altitude: 120,
      heading: 270,
      speed: 15.0,
      timestamp: new Date(),
    },
    batteryLevel: 22,
    signalStrength: 55,
    flightMode: 'auto',
    status: 'rth',
    startTime: new Date(Date.now() - 3600000),
    estimatedEndTime: new Date(Date.now() + 600000),
    plannedRoute: {
      waypoints: [
        [139.715, 35.69],
        [139.725, 35.7],
        [139.72, 35.695],
      ],
      corridorWidth: 50,
      color: '#f59e0b',
    },
  },
]

// モック制限区域
const createMockZones = (): RestrictedZone[] => [
  {
    id: 'zone-1',
    name: '皇居上空',
    type: 'important_facility',
    level: 'prohibited',
    description: '皇居周辺は飛行禁止区域です',
    coordinates: [
      [
        [139.745, 35.688],
        [139.755, 35.688],
        [139.755, 35.68],
        [139.745, 35.68],
        [139.745, 35.688],
      ],
    ],
    maxAltitude: 150,
    validFrom: new Date(),
    authority: '国土交通省',
  },
  {
    id: 'zone-2',
    name: '東京タワー周辺',
    type: 'custom',
    level: 'restricted',
    description: '許可が必要なエリアです',
    coordinates: [
      [
        [139.74, 35.655],
        [139.75, 35.655],
        [139.75, 35.645],
        [139.74, 35.645],
        [139.74, 35.655],
      ],
    ],
    maxAltitude: 200,
    validFrom: new Date(),
    authority: '東京都',
  },
  {
    id: 'zone-3',
    name: '新宿周辺',
    type: 'did',
    level: 'caution',
    description: '高層ビルが多いため注意が必要です',
    coordinates: [
      [
        [139.69, 35.695],
        [139.71, 35.695],
        [139.71, 35.685],
        [139.69, 35.685],
        [139.69, 35.695],
      ],
    ],
    maxAltitude: 250,
    validFrom: new Date(),
    authority: '新宿区',
  },
]

// モックアラート
const createMockAlerts = (): UTMAlert[] => [
  {
    id: 'alert-1',
    type: 'low_battery',
    severity: 'critical',
    droneId: 'drone-3',
    droneName: '秩父#1(945)',
    message: 'バッテリー残量が危険レベルです',
    details: 'バッテリー残量が25%を下回りました',
    timestamp: new Date(),
    acknowledged: false,
  },
]

// コールバック関数
const handleDroneClick = action('onDroneClick')
const handleMapClick = action('onMapClick')

// インタラクティブデモ用のラッパー
const InteractiveDemo = () => {
  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null)

  return (
    <UTMTrackingMap
      drones={createMockDrones()}
      restrictedZones={createMockZones()}
      selectedDroneId={selectedDroneId}
      onDroneClick={(drone) => setSelectedDroneId(drone.droneId)}
      onMapClick={() => setSelectedDroneId(null)}
      height='100%'
      showZones={true}
    />
  )
}

// ===== ストーリー =====

/**
 * インタラクティブデモ - ドローンをクリックして選択
 */
export const Interactive: Story = {
  render: () => <InteractiveDemo />,
}

/**
 * 基本表示
 */
export const Default: Story = {
  args: {
    drones: createMockDrones(),
    restrictedZones: createMockZones(),
    selectedDroneId: null,
    onDroneClick: handleDroneClick,
    onMapClick: handleMapClick,
    height: '100%',
    showZones: true,
  },
}

/**
 * ドローン選択中
 */
export const WithSelectedDrone: Story = {
  args: {
    drones: createMockDrones(),
    restrictedZones: createMockZones(),
    selectedDroneId: 'drone-1',
    onDroneClick: handleDroneClick,
    onMapClick: handleMapClick,
    height: '100%',
    showZones: true,
  },
}

/**
 * 制限区域非表示
 */
export const WithoutZones: Story = {
  args: {
    drones: createMockDrones(),
    restrictedZones: createMockZones(),
    selectedDroneId: null,
    onDroneClick: handleDroneClick,
    onMapClick: handleMapClick,
    height: '100%',
    showZones: false,
  },
}

/**
 * 3Dビューモード
 */
export const ThreeDView: Story = {
  args: {
    drones: createMockDrones(),
    restrictedZones: createMockZones(),
    selectedDroneId: null,
    onDroneClick: handleDroneClick,
    onMapClick: handleMapClick,
    height: '100%',
    showZones: true,
    is3DView: true,
  },
}

/**
 * 緊急ドローンあり
 */
export const WithEmergencyDrone: Story = {
  args: {
    drones: [
      ...createMockDrones().slice(0, 2),
      {
        ...createMockDrones()[2],
        status: 'emergency' as const,
        batteryLevel: 8,
        signalStrength: 15,
      },
    ],
    restrictedZones: createMockZones(),
    selectedDroneId: null,
    onDroneClick: handleDroneClick,
    onMapClick: handleMapClick,
    alerts: [
      {
        id: 'alert-emergency',
        type: 'signal_loss' as const,
        severity: 'emergency' as const,
        droneId: 'drone-3',
        droneName: '秩父#1(945)',
        message: '通信途絶の危険',
        details: '信号強度が著しく低下しています',
        timestamp: new Date(),
        acknowledged: false,
      },
    ],
    height: '100%',
    showZones: true,
  },
}

/**
 * 未確認アラートあり
 */
export const WithUnacknowledgedAlerts: Story = {
  args: {
    drones: createMockDrones(),
    restrictedZones: createMockZones(),
    selectedDroneId: null,
    onDroneClick: handleDroneClick,
    onMapClick: handleMapClick,
    alerts: createMockAlerts(),
    height: '100%',
    showZones: true,
  },
}

/**
 * 左オフセットあり（サイドバー対応）
 */
export const WithLeftOffset: Story = {
  args: {
    drones: createMockDrones(),
    restrictedZones: createMockZones(),
    selectedDroneId: null,
    onDroneClick: handleDroneClick,
    onMapClick: handleMapClick,
    height: '100%',
    showZones: true,
    leftOffset: 300,
  },
}

/**
 * ホバリング中のドローン
 * ホバリング中は一時停止アイコンで表示
 */
export const WithHoveringDrone: Story = {
  args: {
    drones: [
      {
        ...createMockDrones()[0],
        status: 'hovering' as const,
        flightMode: 'hover' as const,
      },
      ...createMockDrones().slice(1),
    ],
    restrictedZones: createMockZones(),
    selectedDroneId: null,
    onDroneClick: handleDroneClick,
    onMapClick: handleMapClick,
    height: '100%',
    showZones: true,
  },
}

/**
 * RTH（帰還中）のドローン
 * 帰還中はホームアイコンで表示
 */
export const WithRTHDrone: Story = {
  args: {
    drones: [
      {
        ...createMockDrones()[0],
        status: 'rth' as const,
        flightMode: 'rth' as const,
      },
      ...createMockDrones().slice(1),
    ],
    restrictedZones: createMockZones(),
    selectedDroneId: 'drone-1',
    onDroneClick: handleDroneClick,
    onMapClick: handleMapClick,
    height: '100%',
    showZones: true,
  },
}

/**
 * 制限区域レイヤー表示
 * 空港、飛行禁止区域、ヘリポートなどの制限区域を表示
 * キーボードショートカット: R/A/D/E/I/M/H/F でレイヤー切替、L で全切替
 */
export const WithRestrictionLayers: Story = {
  args: {
    drones: createMockDrones(),
    restrictedZones: createMockZones(),
    selectedDroneId: null,
    onDroneClick: handleDroneClick,
    onMapClick: handleMapClick,
    height: '100%',
    showZones: true,
    showRestrictionLayers: true,
  },
}
