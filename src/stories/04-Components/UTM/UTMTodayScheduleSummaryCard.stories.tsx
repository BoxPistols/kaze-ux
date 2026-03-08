/**
 * UTM今日の予定サマリーカード Storybook
 *
 * 今日予定されているフライトを表示するサマリーカードのデモ
 */

import { Box, Container } from '@mui/material'
import { MemoryRouter } from 'react-router-dom'

import UTMTodayScheduleSummaryCard from '@/components/utm/UTMTodayScheduleSummaryCard'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof UTMTodayScheduleSummaryCard> = {
  title: 'Components/UTM/Dashboard/UTMTodayScheduleSummaryCard',
  component: UTMTodayScheduleSummaryCard,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
今日の予定サマリーカードコンポーネント。

## 機能

### 1. 今日のフライト表示
- 次の24時間以内のフライトを表示
- ステータス別にグループ化（プリフライト、飛行中、完了）

### 2. クイックアクション
- プリフライト: 「開始」ボタン → プリフライトタブへ
- 飛行中: 「監視」ボタン → モニタリングページへ
- 完了: 「レポート」ボタン → ポストフライトページへ

### 3. ステータスインジケーター
- 色分けされたChipでステータス表示
- 件数表示

### 4. マルチサイト対応
- マルチサイトフライトにバッジ表示
- 拠点数とドローン数を表示

### 5. その他
- リフレッシュボタン
- 「すべてのフライトを表示」リンク

## 使用例

\`\`\`tsx
import UTMTodayScheduleSummaryCard from '@/components/utm/UTMTodayScheduleSummaryCard'

<UTMTodayScheduleSummaryCard />
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs', 'utm', 'dashboard'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof UTMTodayScheduleSummaryCard>

// デフォルト
export const Default: Story = {
  name: 'デフォルト（モックデータ使用）',
  render: () => (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='sm'>
        <UTMTodayScheduleSummaryCard />
      </Container>
    </Box>
  ),
}

// モバイル表示
export const Mobile: Story = {
  name: 'モバイル表示',
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
  render: () => (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 2 }}>
      <UTMTodayScheduleSummaryCard />
    </Box>
  ),
}

// タブレット表示
export const Tablet: Story = {
  name: 'タブレット表示',
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
  render: () => (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='md'>
        <UTMTodayScheduleSummaryCard />
      </Container>
    </Box>
  ),
}

// デスクトップ - サイドバー内想定
export const InSidebar: Story = {
  name: 'サイドバー内表示',
  render: () => (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
        display: 'flex',
        justifyContent: 'center',
      }}>
      <Box sx={{ width: 360 }}>
        <UTMTodayScheduleSummaryCard />
      </Box>
    </Box>
  ),
}
