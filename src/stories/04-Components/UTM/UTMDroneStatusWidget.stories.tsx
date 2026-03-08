import { Box } from '@mui/material'
import { useRef } from 'react'
import type { ComponentProps } from 'react'

import UTMDroneStatusWidget from '@/components/utm/UTMDroneStatusWidget'

import type { DroneFlightStatus } from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMDroneStatusWidget> = {
  title: 'Components/UTM/UTMDroneStatusWidget',
  component: UTMDroneStatusWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## ドローンステータスウィジェット

個別ドローンの詳細なテレメトリ情報を表示するウィジェットコンポーネントです。

### 主な機能
- バッテリー残量、信号強度のゲージ表示
- 高度、速度、方位のリアルタイム表示
- 姿勢情報（ロール、ピッチ、ヨー）
- 飛行モード、ステータス表示
- 折りたたみ/展開機能
- ドラッグ可能なフローティング表示

### 使用場面
- 地図上のオーバーレイとして
- 監視ダッシュボードの詳細パネルとして
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: 500,
          height: 400,
          bgcolor: 'grey.900',
          p: 3,
          position: 'relative',
        }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    collapsed: {
      control: 'boolean',
      description: '折りたたみ状態',
    },
    draggable: {
      control: 'boolean',
      description: 'ドラッグ可能',
    },
    groundLevel: {
      control: { type: 'number', min: 0, max: 500 },
      description: '地上高（メートル）',
    },
  },
}

export default meta
type Story = StoryObj<typeof UTMDroneStatusWidget>

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
    attitude: {
      roll: 2.5,
      pitch: -5.0,
      yaw: 45,
    },
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
  ...overrides,
})

// ドラッグ可能ストーリー用のラッパーコンポーネント
const DraggableWrapper = (
  props: ComponentProps<typeof UTMDroneStatusWidget>
) => {
  const containerRef = useRef<HTMLDivElement>(null)
  return (
    <Box
      ref={containerRef}
      sx={{
        width: 600,
        height: 400,
        bgcolor: 'grey.900',
        position: 'relative',
        overflow: 'hidden',
      }}>
      <UTMDroneStatusWidget
        {...props}
        draggable={true}
        dragConstraints={containerRef}
      />
    </Box>
  )
}

// ===== ストーリー =====

/**
 * 基本表示 - 展開状態
 * 飛行モード（auto/manual/hover/rth/landing）や各パラメータはコントロールパネルで変更可能
 */
export const Default: Story = {
  args: {
    drone: createMockDrone(),
    collapsed: false,
    draggable: false,
    groundLevel: 50,
  },
}

/**
 * 折りたたみ状態
 * コンパクト表示時のUI確認
 */
export const Collapsed: Story = {
  args: {
    drone: createMockDrone(),
    collapsed: true,
    draggable: false,
  },
}

/**
 * ドラッグ可能
 * フローティングウィジェットとして使用時のドラッグ操作確認
 */
export const Draggable: Story = {
  render: (args) => <DraggableWrapper {...args} />,
  args: {
    drone: createMockDrone(),
    collapsed: false,
  },
}

/**
 * 緊急状態（複合警告）
 * バッテリー低下 + 信号弱 + 緊急ステータスの複合状態
 */
export const CriticalState: Story = {
  args: {
    drone: createMockDrone({
      status: 'emergency',
      batteryLevel: 5,
      signalStrength: 10,
    }),
    collapsed: false,
  },
}

/**
 * ドローンなし
 * ドローン未選択時のエッジケース
 */
export const NoDrone: Story = {
  args: {
    drone: null,
    collapsed: false,
  },
}
