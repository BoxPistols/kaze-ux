import { Box } from '@mui/material'
import { action } from 'storybook/actions'

import UTMDroneListPanel from '@/components/utm/UTMDroneListPanel'

import type { DroneFlightStatus, UTMAlert } from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMDroneListPanel> = {
  title: 'Components/UTM/UTMDroneListPanel',
  component: UTMDroneListPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## ドローンリストパネル

飛行中のドローン一覧を表示するリストパネルコンポーネントです。

### 主な機能
- ドローンの飛行状態、バッテリー、信号強度を一覧表示
- ドローン選択によるハイライト表示
- 未確認の重大アラートがあるドローンの点滅表示
- 飛行時間、高度、速度のリアルタイム表示
- パイロット情報の表示

### 使用場面
- UTM監視ダッシュボードのサイドパネルとして
- ドローン選択UIとして
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 380, height: 500, bgcolor: 'background.paper' }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof UTMDroneListPanel>

// モックドローンデータ生成
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
        [139.765, 35.675],
        [139.77, 35.68],
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
      longitude: 139.892,
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
        [139.89, 35.65],
        [139.895, 35.66],
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
      latitude: 35.992,
      longitude: 139.086,
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
        [139.08, 35.99],
        [139.09, 36.0],
      ],
      corridorWidth: 50,
      color: '#f59e0b',
    },
  },
  {
    droneId: 'drone-4',
    droneName: '奄美(940)',
    pilotId: 'pilot-4',
    pilotName: '田中美咲',
    flightPlanId: 'plan-4',
    position: {
      droneId: 'drone-4',
      latitude: 28.369,
      longitude: 129.494,
      altitude: 50,
      heading: 90,
      speed: 6.5,
      timestamp: new Date(),
    },
    batteryLevel: 88,
    signalStrength: 95,
    flightMode: 'hover',
    status: 'in_flight',
    startTime: new Date(Date.now() - 900000),
    estimatedEndTime: new Date(Date.now() + 2700000),
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
    details: 'バッテリー残量が20%を下回りました',
    timestamp: new Date(),
    acknowledged: false,
  },
]

// コールバック関数
const handleDroneSelect = action('onDroneSelect')

// ===== ストーリー =====

/**
 * 基本表示 - 複数のドローンがある状態
 */
export const Default: Story = {
  args: {
    drones: createMockDrones(),
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
  },
}

/**
 * ドローン選択中
 */
export const WithSelectedDrone: Story = {
  args: {
    drones: createMockDrones(),
    selectedDroneId: 'drone-1',
    onDroneSelect: handleDroneSelect,
  },
}

/**
 * 重大アラートあり
 */
export const WithCriticalAlert: Story = {
  args: {
    drones: createMockDrones(),
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
    alerts: createMockAlerts(),
  },
}

/**
 * ドローンなし
 */
export const NoDrones: Story = {
  args: {
    drones: [],
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
  },
}

/**
 * 1機のみ
 */
export const SingleDrone: Story = {
  args: {
    drones: [createMockDrones()[0]],
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
  },
}

/**
 * 多数のドローン
 */
export const ManyDrones: Story = {
  args: {
    drones: [
      ...createMockDrones(),
      ...createMockDrones().map((d, i) => ({
        ...d,
        droneId: `drone-extra-${i}`,
        droneName: `予備機#${i + 1}`,
      })),
    ],
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
  },
}

/**
 * 緊急状態のドローンあり
 */
export const WithEmergencyDrone: Story = {
  args: {
    drones: [
      ...createMockDrones().slice(0, 2),
      {
        ...createMockDrones()[2],
        status: 'emergency',
        batteryLevel: 8,
        signalStrength: 15,
      },
    ],
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
    alerts: [
      {
        id: 'alert-emergency',
        type: 'signal_loss',
        severity: 'emergency',
        droneId: 'drone-3',
        droneName: '秩父#1(945)',
        message: '通信途絶の危険',
        details: '信号強度が著しく低下しています',
        timestamp: new Date(),
        acknowledged: false,
      },
    ],
  },
}
