import { Box } from '@mui/material'
import { action } from 'storybook/actions'

import { UTMFlightTimeline } from '@/components/utm/UTMFlightTimeline'

import type {
  DroneFlightStatus,
  DroneTimelineEvents,
  FlightTimelineEvent,
} from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMFlightTimeline> = {
  title: 'Components/UTM/UTMFlightTimeline',
  component: UTMFlightTimeline,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## フライトタイムライン

各ドローンの飛行計画と進捗をガントチャート形式で表示するコンポーネントです。

### 主な機能
- 時系列での飛行計画表示
- 進捗率のリアルタイム表示
- 現在時刻インジケーター
- ドローン選択による詳細表示
- 時間軸のスクロール対応
- **イベントマーカー表示（離陸/着陸/エラー等）**
- **イベント詳細パネル（双方向リンク対応）**

### 表示内容
- ドローン名とアイコン
- 飛行開始〜終了予定時刻
- 現在の進捗状況
- 飛行ステータス（飛行中/飛行前/着陸済み等）
- イベントマーカー（離陸/着陸/警告/エラー等）

### 使用場面
- UTM監視ダッシュボードの概要表示として
- 飛行スケジュール確認画面として
- イベント発生時のトラブルシューティングとして
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 600, height: 300, bgcolor: 'background.paper' }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    timeRangeHours: {
      control: { type: 'number', min: 1, max: 12 },
      description: 'タイムラインの表示範囲（時間）',
    },
  },
}

export default meta
type Story = StoryObj<typeof UTMFlightTimeline>

// 現在時刻を基準にしたモックドローンデータ生成
const createMockDrones = (): DroneFlightStatus[] => {
  const now = Date.now()

  return [
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
      startTime: new Date(now - 30 * 60 * 1000), // 30分前に開始
      estimatedEndTime: new Date(now + 60 * 60 * 1000), // 1時間後に終了予定
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
      startTime: new Date(now - 60 * 60 * 1000), // 1時間前に開始
      estimatedEndTime: new Date(now + 30 * 60 * 1000), // 30分後に終了予定
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
        altitude: 0,
        heading: 0,
        speed: 0,
        timestamp: new Date(),
      },
      batteryLevel: 100,
      signalStrength: 100,
      flightMode: 'auto',
      status: 'preflight',
      startTime: new Date(now + 30 * 60 * 1000), // 30分後に開始予定
      estimatedEndTime: new Date(now + 120 * 60 * 1000), // 2時間後に終了予定
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
        altitude: 0,
        heading: 0,
        speed: 0,
        timestamp: new Date(),
      },
      batteryLevel: 95,
      signalStrength: 100,
      flightMode: 'auto',
      status: 'landed',
      startTime: new Date(now - 120 * 60 * 1000), // 2時間前に開始
      estimatedEndTime: new Date(now - 30 * 60 * 1000), // 30分前に終了
    },
  ]
}

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
    timeRangeHours: 4,
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
    timeRangeHours: 4,
  },
}

/**
 * 長い時間範囲（8時間）
 */
export const LongTimeRange: Story = {
  args: {
    drones: createMockDrones(),
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
    timeRangeHours: 8,
  },
}

/**
 * 短い時間範囲（2時間）
 */
export const ShortTimeRange: Story = {
  args: {
    drones: createMockDrones(),
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
    timeRangeHours: 2,
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
    timeRangeHours: 4,
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
    timeRangeHours: 4,
  },
}

/**
 * 多数のドローン
 */
export const ManyDrones: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ width: 600, height: 450, bgcolor: 'background.paper' }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    drones: [
      ...createMockDrones(),
      ...createMockDrones().map((d, i) => ({
        ...d,
        droneId: `drone-extra-${i}`,
        droneName: `追加機#${i + 1}`,
        startTime: new Date(Date.now() + (i - 2) * 30 * 60 * 1000),
        estimatedEndTime: new Date(Date.now() + (i + 1) * 60 * 60 * 1000),
      })),
    ],
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
    timeRangeHours: 4,
  },
}

// ===== イベント機能のストーリー =====

// モックイベントデータ生成
const createMockEvents = (): DroneTimelineEvents[] => {
  const now = Date.now()

  const drone1Events: FlightTimelineEvent[] = [
    {
      id: 'event-1-1',
      droneId: 'drone-1',
      type: 'takeoff',
      severity: 'info',
      timestamp: new Date(now - 30 * 60 * 1000),
      title: '離陸完了',
      description: '新十津川ベースから離陸',
      data: {
        position: { latitude: 35.6812, longitude: 139.7671, altitude: 0 },
      },
      links: { mapPosition: true },
    },
    {
      id: 'event-1-2',
      droneId: 'drone-1',
      type: 'waypoint_reached',
      severity: 'info',
      timestamp: new Date(now - 20 * 60 * 1000),
      title: 'WP1到達',
      description: 'ウェイポイント1に到達',
      data: {
        waypointName: 'WP1',
        waypointIndex: 1,
        position: { latitude: 35.682, longitude: 139.768, altitude: 50 },
      },
      links: { mapPosition: true },
    },
    {
      id: 'event-1-3',
      droneId: 'drone-1',
      type: 'low_battery',
      severity: 'warning',
      timestamp: new Date(now - 10 * 60 * 1000),
      title: 'バッテリー警告',
      description: 'バッテリー残量が40%を下回りました',
      data: {
        batteryLevel: 38,
        position: { latitude: 35.683, longitude: 139.769, altitude: 60 },
      },
      links: { mapPosition: true, alert: 'alert-001' },
    },
  ]

  const drone2Events: FlightTimelineEvent[] = [
    {
      id: 'event-2-1',
      droneId: 'drone-2',
      type: 'takeoff',
      severity: 'info',
      timestamp: new Date(now - 60 * 60 * 1000),
      title: '離陸完了',
      description: '浦安ベースから離陸',
    },
    {
      id: 'event-2-2',
      droneId: 'drone-2',
      type: 'route_change',
      severity: 'warning',
      timestamp: new Date(now - 45 * 60 * 1000),
      title: 'ルート変更',
      description: '風向変化のためルートを変更',
      data: {
        windSpeed: 8.5,
        windDirection: 270,
      },
    },
    {
      id: 'event-2-3',
      droneId: 'drone-2',
      type: 'signal_weak',
      severity: 'warning',
      timestamp: new Date(now - 15 * 60 * 1000),
      title: '信号弱',
      description: '信号強度が低下しています',
      data: {
        signalStrength: 45,
      },
      links: { alert: 'alert-002' },
    },
    {
      id: 'event-2-4',
      droneId: 'drone-2',
      type: 'geofence_warning',
      severity: 'error',
      timestamp: new Date(now - 5 * 60 * 1000),
      title: 'ジオフェンス警告',
      description: 'ジオフェンス境界に接近中',
      data: {
        zoneName: '羽田空港制限区域',
        distance: 150,
        position: { latitude: 35.656, longitude: 139.894, altitude: 55 },
      },
      links: { mapPosition: true, alert: 'alert-003' },
    },
  ]

  const drone4Events: FlightTimelineEvent[] = [
    {
      id: 'event-4-1',
      droneId: 'drone-4',
      type: 'takeoff',
      severity: 'info',
      timestamp: new Date(now - 120 * 60 * 1000),
      title: '離陸完了',
      description: '奄美ベースから離陸',
    },
    {
      id: 'event-4-2',
      droneId: 'drone-4',
      type: 'mission_complete',
      severity: 'success',
      timestamp: new Date(now - 40 * 60 * 1000),
      title: 'ミッション完了',
      description: '全ウェイポイントの撮影完了',
    },
    {
      id: 'event-4-3',
      droneId: 'drone-4',
      type: 'landing',
      severity: 'info',
      timestamp: new Date(now - 30 * 60 * 1000),
      title: '着陸完了',
      description: '奄美ベースに着陸',
      data: {
        batteryLevel: 25,
      },
      links: { flightLog: 'log-004' },
    },
  ]

  return [
    { droneId: 'drone-1', events: drone1Events },
    { droneId: 'drone-2', events: drone2Events },
    { droneId: 'drone-4', events: drone4Events },
  ]
}

// イベント関連コールバック
const handleEventSelect = action('onEventSelect')
const handleEventMapClick = action('onEventMapClick')
const handleFlightLogClick = action('onFlightLogClick')
const handleAlertClick = action('onAlertClick')

/**
 * イベントマーカー付き
 * 離陸・着陸・警告などのイベントがタイムライン上にマーカーで表示されます
 */
export const WithEvents: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ width: 700, height: 400, bgcolor: 'background.paper' }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    drones: createMockDrones(),
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
    timeRangeHours: 4,
    droneEvents: createMockEvents(),
    onEventSelect: handleEventSelect,
    onEventMapClick: handleEventMapClick,
    onFlightLogClick: handleFlightLogClick,
    onAlertClick: handleAlertClick,
    showDetailPanel: true,
  },
}

/**
 * イベント選択中
 * イベントマーカーをクリックすると詳細パネルが表示されます
 */
export const WithSelectedEvent: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ width: 700, height: 450, bgcolor: 'background.paper' }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    drones: createMockDrones(),
    selectedDroneId: 'drone-2',
    onDroneSelect: handleDroneSelect,
    timeRangeHours: 4,
    droneEvents: createMockEvents(),
    selectedEventId: 'event-2-4',
    onEventSelect: handleEventSelect,
    onEventMapClick: handleEventMapClick,
    onFlightLogClick: handleFlightLogClick,
    onAlertClick: handleAlertClick,
    showDetailPanel: true,
  },
}

/**
 * 詳細パネル非表示
 * showDetailPanel=false でイベント詳細パネルを非表示にできます
 */
export const WithEventsNoDetailPanel: Story = {
  args: {
    drones: createMockDrones(),
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
    timeRangeHours: 4,
    droneEvents: createMockEvents(),
    onEventSelect: handleEventSelect,
    showDetailPanel: false,
  },
}

// ===== ステータス別表示のストーリー =====

// ホバリング・RTH状態を含むモックドローンデータ
const createStatusMockDrones = (): DroneFlightStatus[] => {
  const now = Date.now()

  return [
    {
      droneId: 'drone-hovering',
      droneName: 'ホバリング機(001)',
      pilotId: 'pilot-1',
      pilotName: '山田太郎',
      flightPlanId: 'plan-1',
      position: {
        droneId: 'drone-hovering',
        latitude: 35.6812,
        longitude: 139.7671,
        altitude: 85,
        heading: 45,
        speed: 0,
        timestamp: new Date(),
      },
      batteryLevel: 65,
      signalStrength: 92,
      flightMode: 'hover',
      status: 'hovering',
      startTime: new Date(now - 30 * 60 * 1000),
      estimatedEndTime: new Date(now + 60 * 60 * 1000),
      plannedRoute: {
        waypoints: [
          [139.765, 35.675],
          [139.77, 35.68],
        ],
        corridorWidth: 50,
        color: '#f59e0b',
      },
    },
    {
      droneId: 'drone-rth',
      droneName: '帰還中機(002)',
      pilotId: 'pilot-2',
      pilotName: '佐藤花子',
      flightPlanId: 'plan-2',
      position: {
        droneId: 'drone-rth',
        latitude: 35.655,
        longitude: 139.892,
        altitude: 60,
        heading: 180,
        speed: 8.2,
        timestamp: new Date(),
      },
      batteryLevel: 25,
      signalStrength: 78,
      flightMode: 'rth',
      status: 'rth',
      startTime: new Date(now - 60 * 60 * 1000),
      estimatedEndTime: new Date(now + 10 * 60 * 1000),
      plannedRoute: {
        waypoints: [
          [139.89, 35.65],
          [139.895, 35.66],
        ],
        corridorWidth: 50,
        color: '#ef4444',
      },
    },
    {
      droneId: 'drone-emergency',
      droneName: '緊急機(003)',
      pilotId: 'pilot-3',
      pilotName: '鈴木一郎',
      flightPlanId: 'plan-3',
      position: {
        droneId: 'drone-emergency',
        latitude: 35.992,
        longitude: 139.086,
        altitude: 100,
        heading: 0,
        speed: 0,
        timestamp: new Date(),
      },
      batteryLevel: 10,
      signalStrength: 30,
      flightMode: 'hover',
      status: 'emergency',
      startTime: new Date(now - 45 * 60 * 1000),
      estimatedEndTime: new Date(now + 30 * 60 * 1000),
      plannedRoute: {
        waypoints: [
          [139.08, 35.99],
          [139.09, 36.0],
        ],
        corridorWidth: 50,
        color: '#dc2626',
      },
    },
    ...createMockDrones().slice(0, 2),
  ]
}

/**
 * ホバリング・RTH・緊急状態
 * 各種ステータスでのタイムライン表示を確認できます
 */
export const WithSpecialStatuses: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ width: 700, height: 400, bgcolor: 'background.paper' }}>
        <Story />
      </Box>
    ),
  ],
  args: {
    drones: createStatusMockDrones(),
    selectedDroneId: null,
    onDroneSelect: handleDroneSelect,
    timeRangeHours: 4,
  },
}
