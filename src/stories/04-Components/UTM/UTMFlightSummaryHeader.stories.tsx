/**
 * UTMフライトサマリーヘッダー Storybook
 *
 * ポストフライトページで表示するフライト概要情報のデモ
 */

import { Box, Container } from '@mui/material'

import UTMFlightSummaryHeader from '@/components/utm/UTMFlightSummaryHeader'
import {
  createMultiSiteScenario,
  createDefaultScenario,
} from '@/mocks/utmMultiDroneScenarios'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof UTMFlightSummaryHeader> = {
  title: 'Components/UTM/Postflight/UTMFlightSummaryHeader',
  component: UTMFlightSummaryHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
フライトサマリーヘッダーコンポーネント。

## 機能

### 1. フライト基本情報
- フライトID
- ステータス（完了/進行中）
- 飛行時間、総距離
- ドローン数

### 2. マルチサイト対応
- サイト数表示
- 各サイトのドローン数表示

### 3. 日時情報
- 開始日時、終了日時の表示

## 使用例

\`\`\`tsx
import UTMFlightSummaryHeader from '@/components/utm/UTMFlightSummaryHeader'

<UTMFlightSummaryHeader flight={scheduledFlight} />
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs', 'utm', 'postflight'],
}

export default meta
type Story = StoryObj<typeof UTMFlightSummaryHeader>

// シングルサイトフライト
export const SingleSite: Story = {
  name: 'シングルサイトフライト',
  render: () => {
    const [flight] = createDefaultScenario()
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMFlightSummaryHeader flight={flight} />
        </Container>
      </Box>
    )
  },
}

// マルチサイトフライト
export const MultiSite: Story = {
  name: 'マルチサイトフライト',
  render: () => {
    const [flight] = createMultiSiteScenario()
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMFlightSummaryHeader flight={flight} />
        </Container>
      </Box>
    )
  },
}

// フライト完了
export const Completed: Story = {
  name: 'フライト完了',
  render: () => {
    const [flight] = createDefaultScenario()
    const completedFlight = { ...flight, status: 'completed' as const }
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMFlightSummaryHeader flight={completedFlight} />
        </Container>
      </Box>
    )
  },
}

// 日時未設定
export const NoDateTime: Story = {
  name: '日時未設定',
  render: () => {
    const [flight] = createDefaultScenario()
    const noDateFlight = { ...flight, startTime: undefined, endTime: undefined }
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMFlightSummaryHeader flight={noDateFlight} />
        </Container>
      </Box>
    )
  },
}
