import { Box } from '@mui/material'
import { action } from 'storybook/actions'

import { UTMMultiDroneGrid } from '@/components/utm/UTMMultiDroneGrid'

import type { DroneFlightStatus, UTMAlert } from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

// コールバック関数（Storybook用）
const handleDroneSelect = action('onDroneSelect')
const handleHomeClick = action('onHomeClick')

const meta: Meta<typeof UTMMultiDroneGrid> = {
  title: 'Components/UTM/UTMMultiDroneGrid',
  component: UTMMultiDroneGrid,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 複数ドローングリッド表示

複数のドローンをグリッドレイアウトで同時監視するためのコンポーネントです。

### 主な機能
- 2列または3列のグリッドレイアウト
- 各ドローンのFPV映像とテレメトリ表示
- アラート状態の視覚的表示
- ドローン選択とナビゲーション
- 3D地図の統合表示オプション

### 使用場面
- 1人のオペレーターが複数ドローンを同時監視する場面
- レベル3.5〜4の多数機同時運航
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  decorators: [
    (Story) => (
      <Box sx={{ height: '100vh', bgcolor: 'grey.900' }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof UTMMultiDroneGrid>

// モックドローンデータ生成
const createMockDrones = (count: number): DroneFlightStatus[] => {
  const droneNames = [
    '新十津川(845)',
    '浦安(949)',
    '秩父#1(945)',
    '秩父#2(1027)',
    '奄美(940)',
    '石垣(952)',
  ]

  return Array.from({ length: Math.min(count, 6) }, (_, i) => ({
    droneId: `drone-${i + 1}`,
    droneName: droneNames[i] || `Drone-${i + 1}`,
    pilotId: `pilot-${i + 1}`,
    pilotName: `パイロット${i + 1}`,
    flightPlanId: `fp-${i + 1}`,
    position: {
      droneId: `drone-${i + 1}`,
      latitude: 35.5 + Math.random() * 0.5,
      longitude: 139.5 + Math.random() * 0.5,
      altitude: 30 + Math.random() * 100,
      heading: Math.random() * 360,
      speed: 5 + Math.random() * 10,
      timestamp: new Date(),
    },
    batteryLevel: 20 + Math.random() * 80,
    signalStrength: 40 + Math.random() * 60,
    flightMode: ['auto', 'manual', 'hover'][
      Math.floor(Math.random() * 3)
    ] as DroneFlightStatus['flightMode'],
    status: 'in_flight' as const,
    startTime: new Date(Date.now() - Math.random() * 3600000),
    estimatedEndTime: new Date(Date.now() + Math.random() * 3600000),
    plannedRoute: {
      waypoints: [
        [139.5, 35.5],
        [139.6, 35.6],
        [139.7, 35.5],
      ],
      corridorWidth: 50,
    },
  }))
}

// モックアラートデータ
const createMockAlerts = (): UTMAlert[] => [
  {
    id: 'alert-1',
    type: 'low_battery',
    severity: 'warning',
    droneId: 'drone-1',
    droneName: '新十津川(845)',
    message: 'バッテリー低下警告',
    details: 'バッテリー残量が30%を下回りました',
    timestamp: new Date(),
    acknowledged: false,
  },
  {
    id: 'alert-2',
    type: 'zone_approach',
    severity: 'critical',
    droneId: 'drone-3',
    droneName: '秩父#1(945)',
    message: '制限区域接近',
    details: '制限区域まで残り200m',
    timestamp: new Date(),
    acknowledged: false,
  },
]

/**
 * 2列グリッド（6機）
 */
export const TwoColumnsGrid: Story = {
  args: {
    drones: createMockDrones(6),
    alerts: createMockAlerts(),
    columns: 2,
    showMapInLastCell: true,
    onDroneSelect: handleDroneSelect,
    onHomeClick: handleHomeClick,
  },
}

/**
 * 3列グリッド
 */
export const ThreeColumnsGrid: Story = {
  args: {
    drones: createMockDrones(6),
    alerts: createMockAlerts(),
    columns: 3,
    showMapInLastCell: false,
    onDroneSelect: handleDroneSelect,
    onHomeClick: handleHomeClick,
  },
}

/**
 * 4機のドローン
 */
export const FourDrones: Story = {
  args: {
    drones: createMockDrones(4),
    alerts: createMockAlerts(),
    columns: 2,
    showMapInLastCell: true,
    onDroneSelect: handleDroneSelect,
    onHomeClick: handleHomeClick,
  },
}

/**
 * ドローン選択状態
 */
export const WithSelectedDrone: Story = {
  args: {
    drones: createMockDrones(6),
    alerts: createMockAlerts(),
    columns: 2,
    selectedDroneId: 'drone-2',
    showMapInLastCell: true,
    onDroneSelect: handleDroneSelect,
    onHomeClick: handleHomeClick,
  },
}

/**
 * エラー状態のドローンあり
 */
export const WithErrorDrone: Story = {
  args: {
    drones: [
      ...createMockDrones(5),
      {
        droneId: 'drone-error',
        droneName: '緊急機(999)',
        pilotId: 'pilot-6',
        pilotName: 'パイロット6',
        flightPlanId: 'fp-6',
        position: {
          droneId: 'drone-error',
          latitude: 35.68,
          longitude: 139.75,
          altitude: 50,
          heading: 180,
          speed: 0,
          timestamp: new Date(),
        },
        batteryLevel: 8,
        signalStrength: 25,
        flightMode: 'hover' as const,
        status: 'emergency' as const,
        startTime: new Date(Date.now() - 1800000),
        estimatedEndTime: null,
        plannedRoute: undefined,
      },
    ],
    alerts: [
      ...createMockAlerts(),
      {
        id: 'alert-emergency',
        type: 'signal_loss',
        severity: 'emergency',
        droneId: 'drone-error',
        droneName: '緊急機(999)',
        message: '緊急: 通信喪失',
        details: '信号が失われました。即座に対応してください。',
        timestamp: new Date(),
        acknowledged: false,
      },
    ],
    columns: 2,
    showMapInLastCell: false,
    onDroneSelect: handleDroneSelect,
    onHomeClick: handleHomeClick,
  },
}
