/**
 * UTMサイト別ポストフライトフォーム Storybook
 *
 * マルチサイトフライトにおける各サイトごとのインシデント・ノート記録のデモ
 */

import { Box, Container } from '@mui/material'
import { useState } from 'react'

import UTMSitePostflightForm from '@/components/utm/UTMSitePostflightForm'
import type { SiteInfo } from '@/types/utmTypes'

import type { Meta, StoryObj } from '@storybook/react'

interface Incident {
  id: string
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

interface SitePostflightData {
  siteId: string
  siteName: string
  incidents: Incident[]
  notes: string
}

const meta: Meta<typeof UTMSitePostflightForm> = {
  title: 'Components/UTM/Postflight/UTMSitePostflightForm',
  component: UTMSitePostflightForm,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
サイト別ポストフライトフォームコンポーネント。

## 機能

### 1. サイト情報表示
- サイト名、説明
- ドローン数

### 2. インシデント記録
- UTMIncidentRecorderを使用
- サイト固有のインシデント管理

### 3. サイト別ノート
- テキストエリア入力
- 文字数制限（500文字）

## 使用例

\`\`\`tsx
import UTMSitePostflightForm from '@/components/utm/UTMSitePostflightForm'

const [data, setData] = useState<SitePostflightData>()

<UTMSitePostflightForm
  site={site}
  data={data}
  onChange={setData}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs', 'utm', 'postflight', 'multi-site'],
}

export default meta
type Story = StoryObj<typeof UTMSitePostflightForm>

const mockSiteTokyo: SiteInfo = {
  id: 'site-tokyo',
  name: '東京拠点',
  location: { latitude: 35.6809591, longitude: 139.7673068 },
  drones: ['drone-tokyo-1', 'drone-tokyo-2'],
  description: '東京都内の配送エリア',
}

const mockSiteOsaka: SiteInfo = {
  id: 'site-osaka',
  name: '大阪拠点',
  location: { latitude: 34.6937, longitude: 135.5023 },
  drones: ['drone-osaka-1', 'drone-osaka-2', 'drone-osaka-3'],
  description: '大阪市内の配送エリア',
}

// デフォルト（空）
const DefaultStory = () => {
  const [data, setData] = useState<SitePostflightData>()
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='md'>
        <UTMSitePostflightForm
          site={mockSiteTokyo}
          data={data}
          onChange={setData}
        />
      </Container>
    </Box>
  )
}

export const Default: Story = {
  name: 'デフォルト（空）',
  render: () => <DefaultStory />,
}

// データあり
const WithDataStory = () => {
  const [data, setData] = useState<SitePostflightData>({
    siteId: 'site-tokyo',
    siteName: '東京拠点',
    incidents: [
      {
        id: '1',
        description: '配送先のアクセスが困難でした',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        severity: 'medium',
      },
    ],
    notes:
      '東京拠点では全体的にスムーズな運用ができました。ただし、一部のエリアで建物が密集しており、GPS精度が低下する場面がありました。',
  })
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='md'>
        <UTMSitePostflightForm
          site={mockSiteTokyo}
          data={data}
          onChange={setData}
        />
      </Container>
    </Box>
  )
}

export const WithData: Story = {
  name: 'データあり',
  render: () => <WithDataStory />,
}

// 大阪拠点
const OsakaSiteStory = () => {
  const [data, setData] = useState<SitePostflightData>()
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='md'>
        <UTMSitePostflightForm
          site={mockSiteOsaka}
          data={data}
          onChange={setData}
        />
      </Container>
    </Box>
  )
}

export const OsakaSite: Story = {
  name: '大阪拠点',
  render: () => <OsakaSiteStory />,
}

// 多数のインシデント
const ManyIncidentsStory = () => {
  const [data, setData] = useState<SitePostflightData>({
    siteId: 'site-osaka',
    siteName: '大阪拠点',
    incidents: [
      {
        id: '1',
        description: 'バッテリー交換が必要でした',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        severity: 'medium',
      },
      {
        id: '2',
        description: '強風のため一時待機しました',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        severity: 'high',
      },
      {
        id: '3',
        description: '目視確認で問題なし',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        severity: 'low',
      },
      {
        id: '4',
        description: 'GPS信号が弱い箇所がありました',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        severity: 'medium',
      },
    ],
    notes:
      '大阪拠点では天候の影響で一部遅延が発生しましたが、安全に運用できました。今後は風速の閾値を見直す必要があるかもしれません。',
  })
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='md'>
        <UTMSitePostflightForm
          site={mockSiteOsaka}
          data={data}
          onChange={setData}
        />
      </Container>
    </Box>
  )
}

export const ManyIncidents: Story = {
  name: '多数のインシデント',
  render: () => <ManyIncidentsStory />,
}
