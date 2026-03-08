import { action } from 'storybook/actions'

import { UTMEvacuationPanel } from '@/components/utm/UTMEvacuationPanel'

import type {
  DroneFlightStatus,
  UTMAlert,
  EvacuationPoint,
} from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

// コールバック関数（Storybook用）
const handleClose = action('onClose')
const handleEvacuationAction = action('onEvacuationAction')
const handleDroneSelect = action('onDroneSelect')

const meta: Meta<typeof UTMEvacuationPanel> = {
  title: 'Components/UTM/UTMEvacuationPanel',
  component: UTMEvacuationPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## 退避情報とエラー状況パネル

飛行中のドローンの退避情報とエラー状況を一覧表示するパネルコンポーネントです。

### 主な機能
- 各ドローンの退避ポイント、ホームポイントまでの距離表示
- バッテリー低下、信号低下などの警告表示
- 退避/帰還コマンドボタン
- アラート一覧との連携

### 使用場面
- UTM監視画面の右パネルとして使用
- 複数ドローン同時監視時の緊急対応に使用
        `,
      },
    },
  },
  tags: ['autodocs', 'planned'],
  argTypes: {
    maxHeight: {
      control: { type: 'text' },
      description: 'パネルの最大高さ',
    },
    title: {
      control: { type: 'text' },
      description: 'パネルのタイトル',
    },
  },
}

export default meta
type Story = StoryObj<typeof UTMEvacuationPanel>

// モックドローンデータ
const createMockDrones = (): DroneFlightStatus[] => [
  {
    droneId: 'drone-1',
    droneName: '新十津川(845)',
    pilotId: 'pilot-1',
    pilotName: '山田太郎',
    flightPlanId: 'fp-1',
    position: {
      droneId: 'drone-1',
      latitude: 35.675,
      longitude: 139.765,
      altitude: 50,
      heading: 45,
      speed: 8.5,
      timestamp: new Date(),
    },
    batteryLevel: 15, // バッテリー低下
    signalStrength: 95,
    flightMode: 'auto',
    status: 'in_flight',
    startTime: new Date(Date.now() - 1800000),
    estimatedEndTime: new Date(Date.now() + 1800000),
    plannedRoute: {
      waypoints: [
        [139.765, 35.675],
        [139.77, 35.68],
        [139.775, 35.685],
      ],
      corridorWidth: 50,
    },
  },
  {
    droneId: 'drone-2',
    droneName: '浦安(949)',
    pilotId: 'pilot-2',
    pilotName: '佐藤花子',
    flightPlanId: 'fp-2',
    position: {
      droneId: 'drone-2',
      latitude: 35.65,
      longitude: 139.88,
      altitude: 80,
      heading: 90,
      speed: 12.3,
      timestamp: new Date(),
    },
    batteryLevel: 72,
    signalStrength: 88,
    flightMode: 'auto',
    status: 'in_flight',
    startTime: new Date(Date.now() - 2400000),
    estimatedEndTime: new Date(Date.now() + 1200000),
    plannedRoute: {
      waypoints: [
        [139.88, 35.65],
        [139.89, 35.66],
        [139.9, 35.67],
      ],
      corridorWidth: 40,
    },
  },
  {
    droneId: 'drone-3',
    droneName: '秩父#1(945)',
    pilotId: 'pilot-3',
    pilotName: '鈴木一郎',
    flightPlanId: 'fp-3',
    position: {
      droneId: 'drone-3',
      latitude: 35.99,
      longitude: 139.08,
      altitude: 120,
      heading: 180,
      speed: 15.0,
      timestamp: new Date(),
    },
    batteryLevel: 45,
    signalStrength: 40, // 信号低下
    flightMode: 'auto',
    status: 'in_flight',
    startTime: new Date(Date.now() - 3000000),
    estimatedEndTime: new Date(Date.now() + 600000),
    plannedRoute: {
      waypoints: [
        [139.08, 35.99],
        [139.09, 36.0],
        [139.1, 36.01],
      ],
      corridorWidth: 60,
    },
  },
]

// モックアラートデータ
const createMockAlerts = (): UTMAlert[] => [
  {
    id: 'alert-1',
    type: 'low_battery',
    severity: 'critical',
    droneId: 'drone-1',
    droneName: '新十津川(845)',
    message: 'バッテリー残量が少ないです',
    details: 'バッテリー残量が15%まで低下しました。帰還を推奨します。',
    timestamp: new Date(),
    acknowledged: false,
    position: { latitude: 35.675, longitude: 139.765, altitude: 50 },
  },
  {
    id: 'alert-2',
    type: 'signal_loss',
    severity: 'warning',
    droneId: 'drone-3',
    droneName: '秩父#1(945)',
    message: '信号強度が低下しています',
    details: '信号強度が40%まで低下しました。',
    timestamp: new Date(),
    acknowledged: false,
    position: { latitude: 35.99, longitude: 139.08, altitude: 120 },
  },
]

// モック退避ポイント
const createMockEvacuationPoints = (): Map<string, EvacuationPoint> => {
  const map = new Map<string, EvacuationPoint>()
  map.set('drone-1', {
    id: 'evac-1',
    name: '退避ポイントA',
    type: 'evacuation',
    position: { latitude: 35.68, longitude: 139.77, altitude: 30 },
  })
  map.set('drone-3', {
    id: 'evac-3',
    name: '退避ポイントC',
    type: 'evacuation',
    position: { latitude: 36.0, longitude: 139.1, altitude: 50 },
  })
  return map
}

// モックホームポイント
const createMockHomePoints = (): Map<string, EvacuationPoint> => {
  const map = new Map<string, EvacuationPoint>()
  map.set('drone-1', {
    id: 'home-1',
    name: 'ホームA',
    type: 'home',
    position: { latitude: 35.67, longitude: 139.76, altitude: 0 },
  })
  map.set('drone-2', {
    id: 'home-2',
    name: 'ホームB',
    type: 'home',
    position: { latitude: 35.64, longitude: 139.87, altitude: 0 },
  })
  map.set('drone-3', {
    id: 'home-3',
    name: 'ホームC',
    type: 'home',
    position: { latitude: 35.98, longitude: 139.07, altitude: 0 },
  })
  return map
}

/**
 * 基本的な退避情報パネル
 */
export const Default: Story = {
  args: {
    drones: createMockDrones(),
    alerts: createMockAlerts(),
    evacuationPoints: createMockEvacuationPoints(),
    homePoints: createMockHomePoints(),
    onClose: handleClose,
    onEvacuationAction: handleEvacuationAction,
    onDroneSelect: handleDroneSelect,
    maxHeight: 600,
  },
}

/**
 * 緊急アラート状態
 */
export const EmergencyState: Story = {
  args: {
    drones: createMockDrones(),
    alerts: [
      ...createMockAlerts(),
      {
        id: 'alert-emergency',
        type: 'zone_violation',
        severity: 'emergency',
        droneId: 'drone-1',
        droneName: '新十津川(845)',
        message: '飛行禁止区域に侵入しました',
        details: '即座に退避してください。',
        timestamp: new Date(),
        acknowledged: false,
        position: { latitude: 35.675, longitude: 139.765, altitude: 50 },
      },
    ],
    evacuationPoints: createMockEvacuationPoints(),
    homePoints: createMockHomePoints(),
    onClose: handleClose,
    onEvacuationAction: handleEvacuationAction,
    onDroneSelect: handleDroneSelect,
    maxHeight: 600,
  },
}

/**
 * 警告なし状態
 */
export const NoWarnings: Story = {
  args: {
    drones: [
      {
        ...createMockDrones()[1],
        batteryLevel: 85,
        signalStrength: 95,
      },
    ],
    alerts: [],
    evacuationPoints: createMockEvacuationPoints(),
    homePoints: createMockHomePoints(),
    onClose: handleClose,
    onEvacuationAction: handleEvacuationAction,
    onDroneSelect: handleDroneSelect,
    maxHeight: 400,
  },
}

/**
 * ドローンなし状態
 */
export const NoDrones: Story = {
  args: {
    drones: [],
    alerts: [],
    evacuationPoints: new Map(),
    homePoints: new Map(),
    onClose: handleClose,
    onEvacuationAction: handleEvacuationAction,
    onDroneSelect: handleDroneSelect,
    maxHeight: 400,
  },
}

/**
 * 多数のドローン
 */
export const ManyDrones: Story = {
  args: {
    drones: [
      ...createMockDrones(),
      {
        droneId: 'drone-4',
        droneName: '秩父#2(1027)',
        pilotId: 'pilot-4',
        pilotName: '田中次郎',
        flightPlanId: 'fp-4',
        position: {
          droneId: 'drone-4',
          latitude: 36.0,
          longitude: 139.1,
          altitude: 100,
          heading: 270,
          speed: 10.0,
          timestamp: new Date(),
        },
        batteryLevel: 60,
        signalStrength: 75,
        flightMode: 'auto',
        status: 'in_flight',
        startTime: new Date(Date.now() - 1200000),
        estimatedEndTime: new Date(Date.now() + 2400000),
        plannedRoute: {
          waypoints: [
            [139.1, 36.0],
            [139.12, 36.02],
          ],
          corridorWidth: 50,
        },
      },
      {
        droneId: 'drone-5',
        droneName: '奄美(940)',
        pilotId: 'pilot-5',
        pilotName: '高橋三郎',
        flightPlanId: 'fp-5',
        position: {
          droneId: 'drone-5',
          latitude: 28.4,
          longitude: 129.5,
          altitude: 80,
          heading: 0,
          speed: 8.0,
          timestamp: new Date(),
        },
        batteryLevel: 90,
        signalStrength: 92,
        flightMode: 'auto',
        status: 'in_flight',
        startTime: new Date(Date.now() - 600000),
        estimatedEndTime: new Date(Date.now() + 3000000),
        plannedRoute: {
          waypoints: [
            [129.5, 28.4],
            [129.52, 28.42],
          ],
          corridorWidth: 40,
        },
      },
    ],
    alerts: createMockAlerts(),
    evacuationPoints: createMockEvacuationPoints(),
    homePoints: createMockHomePoints(),
    onClose: handleClose,
    onEvacuationAction: handleEvacuationAction,
    onDroneSelect: handleDroneSelect,
    maxHeight: 700,
  },
}
