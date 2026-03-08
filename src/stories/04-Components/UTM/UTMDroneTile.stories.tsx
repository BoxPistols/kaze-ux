import { Box } from '@mui/material'

import { UTMDroneTile } from '@/components/utm/UTMDroneTile'

import type { DroneFlightStatus, UTMAlert } from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMDroneTile> = {
  title: 'Components/UTM/UTMDroneTile',
  component: UTMDroneTile,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## ドローンタイル

個別のドローンの飛行状態、テレメトリ情報を表示するタイルコンポーネントです。

### 主な機能
- FPV映像表示（オプション）
- バッテリー残量、信号強度の表示
- 高度、速度、方位の表示
- 飛行状態ステータス表示
- アラートバッジ表示
- ウェイポイント情報表示

### 使用場面
- UTMMultiDroneGridの子要素として
- ドローン詳細表示画面のヘッダーとして

### 飛行モード
コントロールパネルで以下の飛行モードを切り替えてテスト可能:
- auto: 自動飛行
- manual: マニュアル飛行
- hover: ホバリング
- rth: 帰還中
- landing: 着陸中
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 400, bgcolor: 'grey.900', p: 2 }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: '選択状態',
    },
    cameraMode: {
      control: 'select',
      options: ['Main', 'Thermal', 'Zoom'],
      description: 'カメラモード',
    },
    showAltitudeBar: {
      control: 'boolean',
      description: '高度バー表示',
    },
  },
}

export default meta
type Story = StoryObj<typeof UTMDroneTile>

// モックドローンデータ
const createMockDrone = (
  overrides?: Partial<DroneFlightStatus>
): DroneFlightStatus => ({
  droneId: 'drone-001',
  droneName: '新十津川(845)',
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
      [139.775, 35.685],
    ],
    corridorWidth: 50,
    color: '#3b82f6',
  },
  ...overrides,
})

// モックアラート
const createMockAlerts = (count: number = 0): UTMAlert[] => {
  const alerts: UTMAlert[] = []
  if (count >= 1) {
    alerts.push({
      id: 'alert-1',
      type: 'low_battery',
      severity: 'warning',
      droneId: 'drone-001',
      droneName: '新十津川(845)',
      message: 'バッテリー残量が低下しています',
      details: 'バッテリー残量が25%を下回りました',
      timestamp: new Date(),
      acknowledged: false,
    })
  }
  if (count >= 2) {
    alerts.push({
      id: 'alert-2',
      type: 'zone_approach',
      severity: 'info',
      droneId: 'drone-001',
      droneName: '新十津川(845)',
      message: '制限区域に接近中',
      details: '制限区域まで500m',
      timestamp: new Date(),
      acknowledged: false,
    })
  }
  return alerts
}

// ===== ストーリー =====

/**
 * 基本表示 - 飛行中のドローン
 * 飛行モード（auto/manual/hover/rth/landing）はコントロールパネルで変更可能
 */
export const Default: Story = {
  args: {
    drone: createMockDrone(),
    isSelected: false,
    cameraMode: 'Main',
    nextWaypoint: 3,
    distanceToNextWP: 450,
    showAltitudeBar: true,
  },
}

/**
 * 選択状態
 * ハイライト表示の確認
 */
export const Selected: Story = {
  args: {
    ...Default.args,
    isSelected: true,
  },
}

/**
 * アラートあり - 警告状態
 * バッテリー低下やゾーン接近の警告表示
 */
export const WithAlerts: Story = {
  args: {
    drone: createMockDrone({ batteryLevel: 22 }),
    alerts: createMockAlerts(2),
    isSelected: false,
  },
}

/**
 * 緊急状態（複合警告）
 * バッテリー低下 + 信号弱 + 緊急ステータスの複合状態
 */
export const Emergency: Story = {
  args: {
    drone: createMockDrone({
      status: 'emergency',
      batteryLevel: 8,
      signalStrength: 15,
    }),
    alerts: [
      {
        id: 'alert-critical',
        type: 'signal_loss',
        severity: 'critical',
        droneId: 'drone-001',
        droneName: '新十津川(845)',
        message: '通信異常が発生しています',
        details: '信号強度が著しく低下しています',
        timestamp: new Date(),
        acknowledged: false,
      },
    ],
    isSelected: false,
  },
}

/**
 * RTK情報付き
 * 電圧・電流情報の拡張表示
 */
export const WithRTKInfo: Story = {
  args: {
    drone: createMockDrone(),
    rtkInfo: {
      voltage: 24.5,
      current: 2.3,
    },
    isSelected: false,
  },
}

/**
 * サーマルカメラモード
 * カメラモード切り替え時のUI表示
 */
export const ThermalCamera: Story = {
  args: {
    drone: createMockDrone(),
    cameraMode: 'Thermal',
    isSelected: false,
  },
}

/**
 * 高度バー非表示
 * コンパクト表示オプション
 */
export const WithoutAltitudeBar: Story = {
  args: {
    drone: createMockDrone(),
    showAltitudeBar: false,
    isSelected: false,
  },
}

/**
 * ホバリング状態
 * 緊急アラート対応でホバリング中の表示
 */
export const Hovering: Story = {
  args: {
    drone: createMockDrone({
      status: 'hovering',
      flightMode: 'hover',
    }),
    isSelected: false,
  },
}

/**
 * RTH（帰還中）状態
 * 緊急帰還コマンド実行中の表示
 */
export const RTH: Story = {
  args: {
    drone: createMockDrone({
      status: 'rth',
      flightMode: 'rth',
    }),
    isSelected: false,
  },
}
