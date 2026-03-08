import { Box } from '@mui/material'

import UTMWeatherWidget from '@/components/utm/UTMWeatherWidget'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMWeatherWidget> = {
  title: 'Components/UTM/UTMWeatherWidget',
  component: UTMWeatherWidget,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## 気象情報ウィジェット

リアルタイム気象データと飛行適性を表示するウィジェットコンポーネントです。

### 主な機能
- 現在の気温、湿度、視程の表示
- 風速・風向のゲージ表示
- 飛行条件の評価（最適/良好/注意/警告/危険）
- 短期予報の表示
- 折りたたみ/展開機能
- 自動更新（設定可能な間隔）

### 飛行条件ステータス
- 最適（緑）: 飛行に最適な条件
- 良好（明緑）: 問題なく飛行可能
- 注意（黄）: 飛行に注意が必要
- 警告（橙）: 飛行を控えることを推奨
- 危険（赤）: 飛行禁止レベル

### 使用場面
- UTM監視ダッシュボードのサイドウィジェットとして
- 飛行計画画面での気象確認として
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 360, bgcolor: 'background.paper', p: 2 }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    latitude: {
      control: { type: 'number', min: -90, max: 90 },
      description: '緯度',
    },
    longitude: {
      control: { type: 'number', min: -180, max: 180 },
      description: '経度',
    },
    compact: {
      control: 'boolean',
      description: 'コンパクトモード',
    },
    forceCollapse: {
      control: 'boolean',
      description: '折りたたみ状態の外部制御',
    },
    updateInterval: {
      control: { type: 'number', min: 10000, max: 300000 },
      description: '更新間隔（ミリ秒）',
    },
  },
}

export default meta
type Story = StoryObj<typeof UTMWeatherWidget>

// ===== ストーリー =====

/**
 * 基本表示 - 東京の気象情報
 */
export const Default: Story = {
  args: {
    latitude: 35.6812,
    longitude: 139.7671,
    updateInterval: 60000,
    compact: false,
    forceCollapse: false,
  },
}

/**
 * コンパクトモード
 */
export const Compact: Story = {
  args: {
    latitude: 35.6812,
    longitude: 139.7671,
    compact: true,
    forceCollapse: false,
  },
}

/**
 * 折りたたみ状態
 */
export const Collapsed: Story = {
  args: {
    latitude: 35.6812,
    longitude: 139.7671,
    compact: false,
    forceCollapse: true,
  },
}
