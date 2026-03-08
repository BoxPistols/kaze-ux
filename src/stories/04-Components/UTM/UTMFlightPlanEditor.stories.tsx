import { Box } from '@mui/material'
import { useState } from 'react'
import { action } from 'storybook/actions'

import { UTMFlightPlanEditor } from '@/components/utm/UTMFlightPlanEditor'

import type {
  FlightPlan,
  FlightPlanEditorMode,
  FlightPlanValidation,
} from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

// コールバック関数（Storybook用）
const handleChange = action('onChange')
const handleWaypointSelect = action('onWaypointSelect')
const handleSave = action('onSave')
const handleModeChange = action('onModeChange')

const meta: Meta<typeof UTMFlightPlanEditor> = {
  title: 'Components/UTM/UTMFlightPlanEditor',
  component: UTMFlightPlanEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 飛行計画エディタ

ドローンの飛行計画を作成・編集するためのコンポーネントです。

### 主な機能
- ウェイポイントの追加・編集・削除
- ウェイポイントのドラッグ&ドロップ並び替え
- 飛行速度、高度、経路幅の設定
- ジオフェンスの設定
- ホームポイントの設定
- 飛行計画の検証

### 使用場面
- 新規飛行計画の作成
- 既存飛行計画の編集・閲覧
- DIPS申請前の飛行経路確認
        `,
      },
    },
  },
  tags: ['autodocs', 'planned'],
  decorators: [
    (Story) => (
      <Box sx={{ height: '100vh', bgcolor: 'background.default' }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof UTMFlightPlanEditor>

// モック飛行計画データ
const createMockFlightPlan = (overrides?: Partial<FlightPlan>): FlightPlan => ({
  id: 'fp-001',
  name: '東京湾沿岸調査飛行',
  description: '東京湾沿岸の定期点検飛行',
  status: 'draft',

  droneId: 'drone-001',
  droneName: '調査機1号',
  pilotId: 'pilot-001',
  pilotName: '山田太郎',

  waypoints: [
    {
      id: 'wp-1',
      order: 0,
      type: 'takeoff',
      name: '離陸地点',
      position: { latitude: 35.6295, longitude: 139.8833, altitude: 0 },
      altitudeMode: 'AGL',
    },
    {
      id: 'wp-2',
      order: 1,
      type: 'waypoint',
      name: 'WP1',
      position: { latitude: 35.6345, longitude: 139.8883, altitude: 50 },
      altitudeMode: 'AGL',
      speed: 10,
    },
    {
      id: 'wp-3',
      order: 2,
      type: 'poi',
      name: '撮影ポイント1',
      position: { latitude: 35.6395, longitude: 139.8933, altitude: 80 },
      altitudeMode: 'AGL',
      speed: 5,
      hoverDuration: 30,
      actions: [{ type: 'take_photo' }],
    },
    {
      id: 'wp-4',
      order: 3,
      type: 'waypoint',
      name: 'WP2',
      position: { latitude: 35.6445, longitude: 139.8883, altitude: 60 },
      altitudeMode: 'AGL',
      speed: 12,
    },
    {
      id: 'wp-5',
      order: 4,
      type: 'hover',
      name: 'ホバリングポイント',
      position: { latitude: 35.6495, longitude: 139.8833, altitude: 50 },
      altitudeMode: 'AGL',
      hoverDuration: 60,
    },
    {
      id: 'wp-6',
      order: 5,
      type: 'landing',
      name: '着陸地点',
      position: { latitude: 35.6295, longitude: 139.8833, altitude: 0 },
      altitudeMode: 'AGL',
    },
  ],

  corridorWidth: 50,
  defaultSpeed: 10,
  defaultAltitude: 50,
  altitudeMode: 'AGL',

  homePoint: {
    latitude: 35.6295,
    longitude: 139.8833,
    altitude: 0,
  },

  maxAltitude: 150,
  minBatteryLevel: 30,
  geofence: {
    enabled: true,
    coordinates: [
      [
        [139.87, 35.62],
        [139.9, 35.62],
        [139.9, 35.66],
        [139.87, 35.66],
        [139.87, 35.62],
      ],
    ],
    maxAltitude: 150,
  },

  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user-001',

  ...overrides,
})

// エラーありの検証結果
const validationWithErrors: FlightPlanValidation = {
  isValid: false,
  errors: [
    {
      code: 'ALTITUDE_EXCEEDED',
      message: 'WP3の高度が制限を超えています（最大150m）',
      waypointId: 'wp-3',
      field: 'altitude',
    },
  ],
  warnings: [
    {
      code: 'CLOSE_TO_RESTRICTED_ZONE',
      message: '飛行経路が制限区域に接近しています',
      suggestion: '経路を東に500m移動することを推奨します',
    },
  ],
}

// インタラクティブなストーリー用のラッパー
const InteractiveEditor = ({
  initialMode = 'edit',
  initialFlightPlan,
  validation,
}: {
  initialMode?: FlightPlanEditorMode
  initialFlightPlan?: FlightPlan
  validation?: FlightPlanValidation
}) => {
  const [flightPlan, setFlightPlan] = useState<FlightPlan>(
    initialFlightPlan || createMockFlightPlan()
  )
  const [mode, setMode] = useState<FlightPlanEditorMode>(initialMode)

  return (
    <UTMFlightPlanEditor
      flightPlan={flightPlan}
      mode={mode}
      validation={validation}
      onChange={setFlightPlan}
      onWaypointSelect={handleWaypointSelect}
      onSave={handleSave}
      onModeChange={setMode}
    />
  )
}

/**
 * 編集モード
 */
export const EditMode: Story = {
  render: () => <InteractiveEditor initialMode='edit' />,
}

/**
 * 閲覧モード
 */
export const ViewMode: Story = {
  args: {
    flightPlan: createMockFlightPlan({ status: 'approved' }),
    mode: 'view',
    onChange: handleChange,
    onWaypointSelect: handleWaypointSelect,
    onSave: handleSave,
    onModeChange: handleModeChange,
  },
}

/**
 * 新規作成モード
 */
export const CreateMode: Story = {
  args: {
    flightPlan: createMockFlightPlan({
      id: '',
      name: '',
      description: '',
      status: 'draft',
      waypoints: [
        {
          id: 'wp-1',
          order: 0,
          type: 'takeoff',
          name: '離陸地点',
          position: { latitude: 35.68, longitude: 139.76, altitude: 0 },
          altitudeMode: 'AGL',
        },
        {
          id: 'wp-2',
          order: 1,
          type: 'landing',
          name: '着陸地点',
          position: { latitude: 35.68, longitude: 139.76, altitude: 0 },
          altitudeMode: 'AGL',
        },
      ],
    }),
    mode: 'create',
    onChange: handleChange,
    onWaypointSelect: handleWaypointSelect,
    onSave: handleSave,
    onModeChange: handleModeChange,
  },
}

/**
 * 検証エラーあり
 */
export const WithValidationErrors: Story = {
  render: () => (
    <InteractiveEditor
      initialMode='edit'
      initialFlightPlan={createMockFlightPlan({
        waypoints: [
          ...createMockFlightPlan().waypoints.slice(0, 2),
          {
            id: 'wp-3',
            order: 2,
            type: 'poi',
            name: '撮影ポイント1',
            position: { latitude: 35.6395, longitude: 139.8933, altitude: 180 }, // 高度制限超過
            altitudeMode: 'AGL',
            speed: 5,
            hoverDuration: 30,
          },
          ...createMockFlightPlan().waypoints.slice(3),
        ],
      })}
      validation={validationWithErrors}
    />
  ),
}

/**
 * 承認済み計画
 */
export const ApprovedPlan: Story = {
  args: {
    flightPlan: createMockFlightPlan({
      status: 'approved',
      dipsApplicationId: 'DIPS-2024-001234',
    }),
    mode: 'view',
    onChange: handleChange,
    onWaypointSelect: handleWaypointSelect,
    onSave: handleSave,
    onModeChange: handleModeChange,
  },
}

/**
 * 実行中の計画
 */
export const ActivePlan: Story = {
  args: {
    flightPlan: createMockFlightPlan({
      status: 'active',
      scheduledStartTime: new Date(Date.now() - 600000),
      scheduledEndTime: new Date(Date.now() + 1800000),
    }),
    mode: 'view',
    onChange: handleChange,
    onWaypointSelect: handleWaypointSelect,
    onSave: handleSave,
    onModeChange: handleModeChange,
  },
}

/**
 * 複雑な経路
 */
export const ComplexRoute: Story = {
  args: {
    flightPlan: createMockFlightPlan({
      name: '広域調査飛行',
      waypoints: [
        {
          id: 'wp-1',
          order: 0,
          type: 'takeoff',
          name: '離陸',
          position: { latitude: 35.6295, longitude: 139.8833, altitude: 0 },
          altitudeMode: 'AGL',
        },
        ...Array.from({ length: 10 }, (_, i) => ({
          id: `wp-${i + 2}`,
          order: i + 1,
          type: 'waypoint' as const,
          name: `WP${i + 1}`,
          position: {
            latitude: 35.63 + Math.sin(i * 0.5) * 0.02,
            longitude: 139.885 + i * 0.003,
            altitude: 50 + Math.random() * 50,
          },
          altitudeMode: 'AGL' as const,
          speed: 8 + Math.random() * 6,
        })),
        {
          id: 'wp-12',
          order: 11,
          type: 'landing',
          name: '着陸',
          position: { latitude: 35.6295, longitude: 139.8833, altitude: 0 },
          altitudeMode: 'AGL',
        },
      ],
    }),
    mode: 'edit',
    onChange: handleChange,
    onWaypointSelect: handleWaypointSelect,
    onSave: handleSave,
    onModeChange: handleModeChange,
  },
}

/**
 * 地図なし表示
 */
export const WithoutMap: Story = {
  args: {
    flightPlan: createMockFlightPlan(),
    mode: 'edit',
    showMap: false,
    onChange: handleChange,
    onWaypointSelect: handleWaypointSelect,
    onSave: handleSave,
    onModeChange: handleModeChange,
  },
}

/**
 * ジオフェンス無効
 */
export const WithoutGeofence: Story = {
  args: {
    flightPlan: createMockFlightPlan({
      geofence: {
        enabled: false,
        coordinates: [],
        maxAltitude: 150,
      },
    }),
    mode: 'edit',
    onChange: handleChange,
    onWaypointSelect: handleWaypointSelect,
    onSave: handleSave,
    onModeChange: handleModeChange,
  },
}
