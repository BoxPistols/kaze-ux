/**
 * UTMプリフライトチェックパネル Storybook
 *
 * マルチサイト対応のプリフライトチェックパネルのデモ
 */

import { Box, Container } from '@mui/material'

import UTMPreflightCheckPanel from '@/components/utm/UTMPreflightCheckPanel'
import {
  createMultiSiteScenario,
  createDefaultScenario,
} from '@/mocks/utmMultiDroneScenarios'

import type { Meta, StoryObj } from '@storybook/react'

// Storybook設定
const meta: Meta<typeof UTMPreflightCheckPanel> = {
  title: 'Components/UTM/MultiSite/UTMPreflightCheckPanel',
  component: UTMPreflightCheckPanel,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
マルチサイト対応のプリフライトチェックパネル。

## 機能

### 1. ドローンステータスカード
- **バッテリー**: 残量表示と色分け（緑: 80%以上、黄: 50-79%、赤: 50%未満）
- **通信**: 信号強度表示と色分け
- **GPS**: GPS状態表示
- **ステータス**: ドローンの現在状態

### 2. 気象状況
- 飛行適性評価（良好/注意/警告/飛行禁止）
- 気温、風速、視程の表示
- 詳細説明

### 3. 空域ステータス
- NOTAM申請状態
- 人口集中地区（DID）、空港周辺、レッドゾーン、イエローゾーンのタグ表示
- 空域サマリー

### 4. マルチサイト対応
- サイトごとのアコーディオン表示
- サイト別進捗バー
- 全拠点の概要表示

## 使用例

\`\`\`tsx
import UTMPreflightCheckPanel from '@/components/utm/UTMPreflightCheckPanel'

// シングルサイト
<UTMPreflightCheckPanel
  flight={scheduledFlight}
  onCheckComplete={() => console.log('Check completed')}
/>

// マルチサイト - 特定サイトのみ
<UTMPreflightCheckPanel
  flight={multiSiteFlight}
  siteId="site-tokyo"
  onCheckComplete={(siteId) => console.log('Completed:', siteId)}
/>

// マルチサイト - 全サイト表示
<UTMPreflightCheckPanel
  flight={multiSiteFlight}
  onCheckComplete={(siteId) => console.log('Completed:', siteId)}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs', 'utm', 'multi-site'],
}

export default meta
type Story = StoryObj<typeof UTMPreflightCheckPanel>

// シングルサイトフライト
export const SingleSiteFlight: Story = {
  name: 'シングルサイトフライト',
  render: () => {
    const [flight] = createDefaultScenario()
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMPreflightCheckPanel flight={flight} />
        </Container>
      </Box>
    )
  },
}

// マルチサイトフライト - 全拠点表示
export const MultiSiteAllSites: Story = {
  name: 'マルチサイト - 全拠点表示',
  render: () => {
    const [flight] = createMultiSiteScenario()
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMPreflightCheckPanel flight={flight} />
        </Container>
      </Box>
    )
  },
}

// マルチサイトフライト - 東京拠点のみ
export const MultiSiteTokyoOnly: Story = {
  name: 'マルチサイト - 東京拠点のみ',
  render: () => {
    const [flight] = createMultiSiteScenario()
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMPreflightCheckPanel flight={flight} siteId='site-tokyo' />
        </Container>
      </Box>
    )
  },
}

// マルチサイトフライト - 大阪拠点のみ
export const MultiSiteOsakaOnly: Story = {
  name: 'マルチサイト - 大阪拠点のみ',
  render: () => {
    const [flight] = createMultiSiteScenario()
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMPreflightCheckPanel flight={flight} siteId='site-osaka' />
        </Container>
      </Box>
    )
  },
}

// マルチサイトフライト - 福岡拠点のみ
export const MultiSiteFukuokaOnly: Story = {
  name: 'マルチサイト - 福岡拠点のみ',
  render: () => {
    const [flight] = createMultiSiteScenario()
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMPreflightCheckPanel flight={flight} siteId='site-fukuoka' />
        </Container>
      </Box>
    )
  },
}

// プリフライト進行中
export const InProgress: Story = {
  name: 'プリフライト進行中（60%）',
  render: () => {
    const [flight] = createMultiSiteScenario()
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMPreflightCheckPanel flight={flight} siteId='site-tokyo' />
        </Container>
      </Box>
    )
  },
}

// プリフライト完了
export const Completed: Story = {
  name: 'プリフライト完了',
  render: () => {
    const [flight] = createDefaultScenario()
    // プリフライトステータスを完了に変更
    const completedFlight = {
      ...flight,
      preflightStatus: 'completed' as const,
      preflightProgress: 100,
    }
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMPreflightCheckPanel flight={completedFlight} />
        </Container>
      </Box>
    )
  },
}

// バッテリー低下警告
export const LowBattery: Story = {
  name: 'バッテリー低下警告',
  render: () => {
    const [flight] = createDefaultScenario()
    // バッテリーレベルを低く設定
    const lowBatteryFlight = {
      ...flight,
      drone: { ...flight.drone, batteryLevel: 35 },
      drones: flight.drones?.map((d) => ({ ...d, batteryLevel: 35 })),
    }
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMPreflightCheckPanel flight={lowBatteryFlight} />
        </Container>
      </Box>
    )
  },
}

// 通信不良警告
export const WeakSignal: Story = {
  name: '通信不良警告',
  render: () => {
    const [flight] = createDefaultScenario()
    // 信号強度を低く設定
    const weakSignalFlight = {
      ...flight,
      drone: { ...flight.drone, signalStrength: 45 },
      drones: flight.drones?.map((d) => ({ ...d, signalStrength: 45 })),
    }
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMPreflightCheckPanel flight={weakSignalFlight} />
        </Container>
      </Box>
    )
  },
}

// 悪天候警告
export const BadWeather: Story = {
  name: '悪天候警告',
  render: () => {
    const [flight] = createDefaultScenario()
    // 気象状況を警告に設定
    const badWeatherFlight = {
      ...flight,
      weather: {
        ...flight.weather,
        status: 'warning' as const,
        windSpeed: 8.5,
        description: '強風のため飛行は推奨されません',
      },
    }
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
        <Container maxWidth='lg'>
          <UTMPreflightCheckPanel flight={badWeatherFlight} />
        </Container>
      </Box>
    )
  },
}
