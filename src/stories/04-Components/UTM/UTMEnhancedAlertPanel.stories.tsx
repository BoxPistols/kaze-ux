import { Box } from '@mui/material'
import { useEffect } from 'react'
import { action } from 'storybook/actions'

import UTMEnhancedAlertPanel from '@/components/utm/UTMEnhancedAlertPanel'
import useUTMStore from '@/store/utmStore'

import type { UTMAlert } from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMEnhancedAlertPanel> = {
  title: 'Components/UTM/UTMEnhancedAlertPanel',
  component: UTMEnhancedAlertPanel,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## 高機能アラートパネル

UTM監視画面のアラートを一覧表示・管理するパネルコンポーネントです。

### 主な機能
- コンパクトな検索・フィルター機能
- 重大度別フィルタリング（緊急、重大、警告、情報）
- アラート種類別フィルタリング
- キーワード検索
- アラート確認（Acknowledge）機能
- アラート削除機能
- ドローン選択との連携（クリックでマップにフォーカス）

### デザイン特徴
- コンパクトなフォームサイズ（高さ28-32px）
- グラスモーフィズム効果
- 時系列順表示（新しい順）
- 未確認アラートのハイライト表示

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
      <Box sx={{ width: 320, height: 400, bgcolor: 'background.paper' }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof UTMEnhancedAlertPanel>

// モックアラート生成関数
const createMockAlerts = (): UTMAlert[] => [
  {
    id: 'alert-1',
    type: 'zone_violation',
    severity: 'emergency',
    droneId: 'drone-1',
    droneName: 'Matrice 30 [JU-FK002]',
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
    droneName: 'Mavic 3 Enterprise [JU-KB001]',
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
    droneName: 'Mavic 3 Pro [JU-TK001]',
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
    droneName: 'Matrice 30 [JU-FK002]',
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
    droneName: 'Zenmuse H20T [JU-AK003]',
    message: '強風警報',
    details: '風速が15m/sを超えています。飛行に注意してください。',
    timestamp: new Date(Date.now() - 300000),
    acknowledged: false,
  },
]

// ストアにアラートを設定するラッパーコンポーネント
const AlertPanelWithStore = ({
  alerts,
  ...props
}: { alerts: UTMAlert[] } & React.ComponentProps<
  typeof UTMEnhancedAlertPanel
>) => {
  const addAlert = useUTMStore((state) => state.addAlert)
  const clearAllAlerts = useUTMStore((state) => state.clearAllAlerts)

  useEffect(() => {
    // 既存のアラートをクリア
    clearAllAlerts()
    // モックアラートを追加
    alerts.forEach((alert) => {
      addAlert({
        type: alert.type,
        severity: alert.severity,
        droneId: alert.droneId,
        droneName: alert.droneName,
        message: alert.message,
        details: alert.details,
        position: alert.position,
      })
    })
  }, [alerts, addAlert, clearAllAlerts])

  return <UTMEnhancedAlertPanel {...props} />
}

// ===== ストーリー =====

/**
 * 基本表示 - 複数のアラートがある状態
 */
export const Default: Story = {
  render: (args) => (
    <AlertPanelWithStore alerts={createMockAlerts()} {...args} />
  ),
  args: {
    height: '100%',
    onDroneSelect: action('onDroneSelect'),
  },
}

/**
 * 緊急アラートのみ
 */
export const EmergencyOnly: Story = {
  render: (args) => (
    <AlertPanelWithStore
      alerts={createMockAlerts().filter((a) => a.severity === 'emergency')}
      {...args}
    />
  ),
  args: {
    height: '100%',
    onDroneSelect: action('onDroneSelect'),
  },
}

/**
 * 警告アラートのみ
 */
export const WarningsOnly: Story = {
  render: (args) => (
    <AlertPanelWithStore
      alerts={createMockAlerts().filter((a) => a.severity === 'warning')}
      {...args}
    />
  ),
  args: {
    height: '100%',
  },
}

/**
 * アラートなし
 */
export const NoAlerts: Story = {
  render: (args) => <AlertPanelWithStore alerts={[]} {...args} />,
  args: {
    height: '100%',
  },
}

/**
 * 多数のアラート（スクロール表示）
 */
export const ManyAlerts: Story = {
  render: (args) => (
    <AlertPanelWithStore
      alerts={[
        ...createMockAlerts(),
        ...createMockAlerts().map((a, i) => ({
          ...a,
          id: `alert-extra-${i}`,
          timestamp: new Date(Date.now() - 400000 - i * 60000),
        })),
      ]}
      {...args}
    />
  ),
  args: {
    height: '100%',
    onDroneSelect: action('onDroneSelect'),
  },
}

/**
 * コンパクト表示（小さい高さ）
 */
export const CompactHeight: Story = {
  render: (args) => (
    <AlertPanelWithStore alerts={createMockAlerts()} {...args} />
  ),
  args: {
    height: 250,
    onDroneSelect: action('onDroneSelect'),
  },
  decorators: [
    (Story) => (
      <Box sx={{ width: 280, height: 250, bgcolor: 'background.paper' }}>
        <Story />
      </Box>
    ),
  ],
}

/**
 * ドローンフィルタリング - 特定のドローンのアラートのみ表示
 *
 * マルチサイト運航監視環境で、現在のサイトのドローンのアラートのみを表示する場合に使用します。
 */
export const FilteredByDrones: Story = {
  render: (args) => (
    <AlertPanelWithStore alerts={createMockAlerts()} {...args} />
  ),
  args: {
    height: '100%',
    droneIds: ['drone-1', 'drone-2'], // drone-1とdrone-2のアラートのみ表示
    onDroneSelect: action('onDroneSelect'),
  },
  parameters: {
    docs: {
      description: {
        story:
          '`droneIds`プロパティで特定のドローンのアラートのみを表示します。この例では、drone-1とdrone-2のアラートのみが表示されます。マルチサイト環境で現在のサイトのドローンに絞り込む場合に便利です。',
      },
    },
  },
}

/**
 * 単一ドローンのアラート
 */
export const SingleDroneFilter: Story = {
  render: (args) => (
    <AlertPanelWithStore alerts={createMockAlerts()} {...args} />
  ),
  args: {
    height: '100%',
    droneIds: ['drone-1'], // drone-1のアラートのみ表示
    onDroneSelect: action('onDroneSelect'),
  },
  parameters: {
    docs: {
      description: {
        story:
          '単一ドローンのアラートのみを表示します。特定のドローンを監視する場合に使用します。',
      },
    },
  },
}
