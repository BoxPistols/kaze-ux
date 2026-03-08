import { Box } from '@mui/material'

import UTMPilotHUD from '@/components/utm/UTMPilotHUD'

import type { DroneFlightStatus, WeatherData } from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMPilotHUD> = {
  title: 'Components/UTM/UTMPilotHUD',
  component: UTMPilotHUD,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## パイロットHUD（ヘッドアップディスプレイ）

航空機/ドローンパイロット向けのリアルタイム飛行情報表示コンポーネントです。

### 主な機能
- 高度テープ（右側）: 現在高度と目盛り表示
- 速度テープ（左側）: 対地速度と目盛り表示
- ヘディングインジケーター（上部）: 機首方位のコンパス表示
- 風向インジケーター（右下）: 機体基準の風向き表示
- ステータスバー（下部）: バッテリー、信号強度、飛行状態

### HUDカラー
- プライマリ（緑）: 正常値
- 警告（黄）: 注意が必要な値
- 危険（赤）: 危険な値
- 情報（青）: 風向等の情報

### 使用場面
- ドローン操縦画面のオーバーレイとして
- FPV映像上の情報表示として
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          bgcolor: 'grey.900',
          position: 'relative',
          overflow: 'hidden',
        }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    visible: {
      control: 'boolean',
      description: 'HUDの表示/非表示',
    },
    leftDockWidth: {
      control: { type: 'number', min: 0, max: 400 },
      description: '左側のオフセット（サイドバー幅など）',
    },
  },
}

export default meta
type Story = StoryObj<typeof UTMPilotHUD>

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
  ...overrides,
})

// モック気象データ
const createMockWeather = (): WeatherData => ({
  timestamp: new Date(),
  location: {
    latitude: 35.6812,
    longitude: 139.7671,
    name: '東京都千代田区',
  },
  current: {
    temperature: 22.5,
    humidity: 55,
    pressure: 1013,
    windSpeed: 5.5,
    windDirection: 225,
    visibility: 10,
    cloudCover: 20,
    conditions: '晴れ',
    icon: '01d',
  },
  flightCondition: {
    status: 'good',
    message: '飛行に適した条件です',
    factors: ['良好'],
  },
})

// ===== ストーリー =====

/**
 * 基本表示 - 通常飛行中
 */
export const Default: Story = {
  args: {
    drone: createMockDrone(),
    weather: createMockWeather(),
    visible: true,
    leftDockWidth: 0,
  },
}

/**
 * 高速飛行
 */
export const HighSpeed: Story = {
  args: {
    drone: createMockDrone({
      position: {
        ...createMockDrone().position,
        speed: 18.5,
      },
    }),
    weather: createMockWeather(),
    visible: true,
  },
}

/**
 * 高高度飛行
 */
export const HighAltitude: Story = {
  args: {
    drone: createMockDrone({
      position: {
        ...createMockDrone().position,
        altitude: 145,
      },
    }),
    weather: createMockWeather(),
    visible: true,
  },
}

/**
 * 北向き飛行
 */
export const HeadingNorth: Story = {
  args: {
    drone: createMockDrone({
      position: {
        ...createMockDrone().position,
        heading: 0,
      },
    }),
    weather: createMockWeather(),
    visible: true,
  },
}

/**
 * 南向き飛行
 */
export const HeadingSouth: Story = {
  args: {
    drone: createMockDrone({
      position: {
        ...createMockDrone().position,
        heading: 180,
      },
    }),
    weather: createMockWeather(),
    visible: true,
  },
}

/**
 * バッテリー低下
 */
export const LowBattery: Story = {
  args: {
    drone: createMockDrone({
      batteryLevel: 18,
    }),
    weather: createMockWeather(),
    visible: true,
  },
}

/**
 * 信号弱
 */
export const WeakSignal: Story = {
  args: {
    drone: createMockDrone({
      signalStrength: 25,
    }),
    weather: createMockWeather(),
    visible: true,
  },
}

/**
 * RTH（帰還中）
 */
export const ReturningHome: Story = {
  args: {
    drone: createMockDrone({
      status: 'rth',
      flightMode: 'rth',
      batteryLevel: 15,
    }),
    weather: createMockWeather(),
    visible: true,
  },
}

/**
 * 緊急状態
 */
export const Emergency: Story = {
  args: {
    drone: createMockDrone({
      status: 'emergency',
      batteryLevel: 5,
      signalStrength: 10,
    }),
    weather: createMockWeather(),
    visible: true,
  },
}

/**
 * 気象情報なし
 */
export const NoWeather: Story = {
  args: {
    drone: createMockDrone(),
    weather: null,
    visible: true,
  },
}

/**
 * 左オフセットあり（サイドバー対応）
 */
export const WithLeftOffset: Story = {
  args: {
    drone: createMockDrone(),
    weather: createMockWeather(),
    visible: true,
    leftDockWidth: 300,
  },
}

/**
 * ドローンなし
 */
export const NoDrone: Story = {
  args: {
    drone: null,
    weather: createMockWeather(),
    visible: true,
  },
}
