import { Box } from '@mui/material'

import UTMForecastTimeline from '@/components/utm/UTMForecastTimeline'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMForecastTimeline> = {
  title: 'Components/UTM/UTMForecastTimeline',
  component: UTMForecastTimeline,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## 短期予報タイムライン

風向・風速の短期予報を視覚的に表示するコンポーネントです。

### 主な機能
- 5分刻みの風向予報表示
- 風速の色分け表示（5m/s未満:緑、5-8m/s:黄、8m/s超:赤）
- 風向変化の警告検出（45度以上の変化）
- 風速増加の警告検出
- 降水確率の表示
- 折りたたみ/展開機能

### 警告表示
- 大きな風向変化が予測される場合に警告表示
- 風速増加が予測される場合に警告表示

### 使用場面
- UTM監視ダッシュボードのサイドウィジェットとして
- パイロット向けの気象情報表示として
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  decorators: [
    (Story) => (
      <Box sx={{ width: 380, bgcolor: 'background.paper', p: 2 }}>
        <Story />
      </Box>
    ),
  ],
  argTypes: {
    currentWindSpeed: {
      control: { type: 'number', min: 0, max: 20 },
      description: '現在の風速（m/s）',
    },
    currentWindDirection: {
      control: { type: 'number', min: 0, max: 360 },
      description: '現在の風向（度）',
    },
    forceCollapse: {
      control: 'boolean',
      description: '折りたたみ状態の外部制御',
    },
    updateInterval: {
      control: { type: 'number', min: 10000, max: 120000 },
      description: '更新間隔（ミリ秒）',
    },
  },
}

export default meta
type Story = StoryObj<typeof UTMForecastTimeline>

// ===== ストーリー =====

/**
 * 基本表示 - 穏やかな天気
 */
export const Default: Story = {
  args: {
    currentWindSpeed: 3.5,
    currentWindDirection: 180,
    updateInterval: 30000,
    forceCollapse: false,
  },
}

/**
 * 強風時
 */
export const HighWind: Story = {
  args: {
    currentWindSpeed: 7.5,
    currentWindDirection: 225,
    updateInterval: 30000,
    forceCollapse: false,
  },
}

/**
 * 風向変化予測あり
 */
export const WindDirectionChange: Story = {
  args: {
    currentWindSpeed: 4.0,
    currentWindDirection: 90,
    updateInterval: 30000,
    forceCollapse: false,
  },
}

/**
 * 折りたたみ状態
 */
export const Collapsed: Story = {
  args: {
    currentWindSpeed: 3.5,
    currentWindDirection: 180,
    updateInterval: 30000,
    forceCollapse: true,
  },
}
