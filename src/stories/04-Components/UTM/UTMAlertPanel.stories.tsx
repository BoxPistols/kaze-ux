import { Box } from '@mui/material'
import { action } from 'storybook/actions'

import UTMAlertPanel from '@/components/utm/UTMAlertPanel'

import type { UTMAlert } from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMAlertPanel> = {
  title: 'Components/UTM/UTMAlertPanel',
  component: UTMAlertPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## アラートパネル

UTM監視画面のアラートを一覧表示・管理するパネルコンポーネントです。

### 主な機能
- 重大度別のアラート表示（緊急、重大、警告、情報）
- アラート確認（Acknowledge）機能
- アラート削除機能
- ドローン選択との連携
- アラート一括クリア機能

### 使用場面
- UTM監視ダッシュボードのサイドパネルとして
- アラート監視専用画面として
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 400, bgcolor: 'background.paper', p: 1 }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {},
}

export default meta
type Story = StoryObj<typeof UTMAlertPanel>

// モックアラート生成関数
const createMockAlerts = (): UTMAlert[] => [
  {
    id: 'alert-1',
    type: 'zone_violation',
    severity: 'emergency',
    droneId: 'drone-1',
    droneName: '新十津川(845)',
    message: '飛行禁止区域に侵入しました',
    details:
      '空港周辺の飛行禁止区域内に機体が検出されました。即時退避してください。',
    timestamp: new Date(Date.now() - 60000),
    acknowledged: false,
    position: {
      latitude: 35.6812,
      longitude: 139.7671,
      altitude: 85,
    },
  },
  {
    id: 'alert-2',
    type: 'collision_alert',
    severity: 'critical',
    droneId: 'drone-2',
    droneName: '浦安(949)',
    message: '衝突危険を検知しました',
    details: '他機との距離が50m未満に接近しています。',
    timestamp: new Date(Date.now() - 120000),
    acknowledged: false,
    relatedDroneId: 'drone-3',
  },
  {
    id: 'alert-3',
    type: 'low_battery',
    severity: 'warning',
    droneId: 'drone-3',
    droneName: '秩父#1(945)',
    message: 'バッテリー残量が低下しています',
    details: 'バッテリー残量が20%を下回りました。帰還を検討してください。',
    timestamp: new Date(Date.now() - 180000),
    acknowledged: false,
  },
  {
    id: 'alert-4',
    type: 'zone_approach',
    severity: 'info',
    droneId: 'drone-1',
    droneName: '新十津川(845)',
    message: '制限区域に接近中',
    details: '制限区域まで500mに接近しています。',
    timestamp: new Date(Date.now() - 240000),
    acknowledged: true,
  },
  {
    id: 'alert-5',
    type: 'weather_warning',
    severity: 'warning',
    droneId: 'drone-4',
    droneName: '秩父#2(1027)',
    message: '強風警報',
    details: '風速が15m/sを超えています。飛行に注意してください。',
    timestamp: new Date(Date.now() - 300000),
    acknowledged: false,
  },
  {
    id: 'alert-6',
    type: 'signal_loss',
    severity: 'critical',
    droneId: 'drone-5',
    droneName: '奄美(940)',
    message: '通信が不安定です',
    details: '信号強度が著しく低下しています。',
    timestamp: new Date(Date.now() - 360000),
    acknowledged: false,
  },
]

// コールバック関数
const handleAcknowledge = action('onAcknowledge')
const handleClear = action('onClear')
const handleClearAll = action('onClearAll')
const handleDroneClick = action('onDroneClick')
const handleAlertSelect = action('onAlertSelect')
const handleHover = action('onHover')
const handleEmergencyReturn = action('onEmergencyReturn')

// ===== ストーリー =====

/**
 * 基本表示 - 複数のアラートがある状態
 */
export const Default: Story = {
  args: {
    alerts: createMockAlerts(),
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
    onDroneClick: handleDroneClick,
  },
}

/**
 * 緊急アラートのみ
 */
export const EmergencyOnly: Story = {
  args: {
    alerts: createMockAlerts().filter((a) => a.severity === 'emergency'),
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
  },
}

/**
 * 警告アラートのみ
 */
export const WarningsOnly: Story = {
  args: {
    alerts: createMockAlerts().filter((a) => a.severity === 'warning'),
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
  },
}

/**
 * すべて確認済み
 */
export const AllAcknowledged: Story = {
  args: {
    alerts: createMockAlerts().map((a) => ({ ...a, acknowledged: true })),
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
  },
}

/**
 * アラートなし
 */
export const NoAlerts: Story = {
  args: {
    alerts: [],
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
  },
}

/**
 * 特定のドローンを選択中
 */
export const WithSelectedDrone: Story = {
  args: {
    alerts: createMockAlerts(),
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
    onDroneClick: handleDroneClick,
    selectedDroneId: 'drone-1',
  },
}

/**
 * アラートを選択中
 */
export const WithSelectedAlerts: Story = {
  args: {
    alerts: createMockAlerts(),
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
    onAlertSelect: handleAlertSelect,
    selectedAlertIds: ['alert-1', 'alert-2'],
  },
}

/**
 * 多数のアラート（スクロール表示）
 */
export const ManyAlerts: Story = {
  args: {
    alerts: [
      ...createMockAlerts(),
      ...createMockAlerts().map((a, i) => ({
        ...a,
        id: `alert-extra-${i}`,
        timestamp: new Date(Date.now() - 400000 - i * 60000),
      })),
    ],
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
  },
}

/**
 * コンパクト表示
 */
export const Compact: Story = {
  args: {
    alerts: createMockAlerts().slice(0, 3),
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
  },
}

/**
 * 緊急アラート対応ボタン付き
 *
 * 未確認の緊急/重大アラートに対して、ホバリングと緊急帰還のアクションボタンが表示されます。
 * - ホバリング: ドローンを現在位置で停止させる
 * - 緊急帰還: ドローンをホームポイントに帰還させる
 */
export const WithEmergencyActions: Story = {
  args: {
    alerts: createMockAlerts().filter(
      (a) =>
        (a.severity === 'emergency' || a.severity === 'critical') &&
        !a.acknowledged
    ),
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
    onDroneClick: handleDroneClick,
    onHover: handleHover,
    onEmergencyReturn: handleEmergencyReturn,
  },
}

/**
 * 全機能付き（実際のダッシュボード使用例）
 *
 * すべてのコールバックが設定された状態。緊急/重大アラートにはアクションボタンが表示されます。
 */
export const FullFeatured: Story = {
  args: {
    alerts: createMockAlerts(),
    onAcknowledge: handleAcknowledge,
    onClear: handleClear,
    onClearAll: handleClearAll,
    onDroneClick: handleDroneClick,
    onAlertSelect: handleAlertSelect,
    onHover: handleHover,
    onEmergencyReturn: handleEmergencyReturn,
    selectedAlertIds: [],
  },
}
