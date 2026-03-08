/**
 * UTMポストフライトレポートフォーム Storybook
 *
 * フライト全体のインシデント、ノート、添付ファイルを記録するコンポーネントのデモ
 */

import { Box, Container } from '@mui/material'
import { useState } from 'react'

import UTMPostflightReportForm from '@/components/utm/UTMPostflightReportForm'

import type { Meta, StoryObj } from '@storybook/react'

interface Incident {
  id: string
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

interface Attachment {
  id: string
  url: string
  type: 'image' | 'video' | 'document' | 'log' | 'other'
  name: string
  size: number
  uploadedAt: Date
}

interface PostflightReportData {
  incidents: Incident[]
  notes: string
  attachments: Attachment[]
}

const meta: Meta<typeof UTMPostflightReportForm> = {
  title: 'Components/UTM/Postflight/UTMPostflightReportForm',
  component: UTMPostflightReportForm,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
ポストフライトレポートフォームコンポーネント。

## 機能

### 1. 全体インシデント
- UTMIncidentRecorderを使用
- フライト全体のインシデント管理

### 2. 全体ノート
- テキストエリア入力
- 文字数制限（1000文字）

### 3. 添付ファイル
- ファイルアップロード（複数可）
- ファイルタイプ表示（画像/動画/文書/ログ/その他）
- ファイルサイズ表示
- 削除機能
- 最大件数制限

## 使用例

\`\`\`tsx
import UTMPostflightReportForm from '@/components/utm/UTMPostflightReportForm'

const [data, setData] = useState<PostflightReportData>({
  incidents: [],
  notes: '',
  attachments: []
})

<UTMPostflightReportForm
  data={data}
  onChange={setData}
  maxNoteLength={1000}
  maxAttachments={10}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs', 'utm', 'postflight'],
}

export default meta
type Story = StoryObj<typeof UTMPostflightReportForm>

// デフォルト（空）
const DefaultStory = () => {
  const [data, setData] = useState<PostflightReportData>({
    incidents: [],
    notes: '',
    attachments: [],
  })
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='lg'>
        <UTMPostflightReportForm data={data} onChange={setData} />
      </Container>
    </Box>
  )
}

export const Default: Story = {
  name: 'デフォルト（空）',
  render: () => <DefaultStory />,
}

// インシデントとノートあり
const WithIncidentsAndNotesStory = () => {
  const [data, setData] = useState<PostflightReportData>({
    incidents: [
      {
        id: '1',
        description:
          '全体として天候が安定していましたが、一部の地域で風速が強まりました',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        severity: 'medium',
      },
      {
        id: '2',
        description: 'すべてのドローンが無事に帰還しました',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        severity: 'low',
      },
    ],
    notes:
      '本日のマルチサイトフライトは全体として成功でした。各拠点での連携がスムーズで、通信システムも安定していました。今後の改善点として、天候予測の精度向上と、バッテリー管理の最適化が挙げられます。',
    attachments: [],
  })
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='lg'>
        <UTMPostflightReportForm data={data} onChange={setData} />
      </Container>
    </Box>
  )
}

export const WithIncidentsAndNotes: Story = {
  name: 'インシデントとノートあり',
  render: () => <WithIncidentsAndNotesStory />,
}

// 添付ファイルあり
const WithAttachmentsStory = () => {
  const [data, setData] = useState<PostflightReportData>({
    incidents: [],
    notes: '',
    attachments: [
      {
        id: 'att-1',
        url: '#',
        type: 'image',
        name: 'flight-photo-01.jpg',
        size: 2048576,
        uploadedAt: new Date(Date.now() - 10 * 60000),
      },
      {
        id: 'att-2',
        url: '#',
        type: 'video',
        name: 'flight-video-highlights.mp4',
        size: 15728640,
        uploadedAt: new Date(Date.now() - 5 * 60000),
      },
      {
        id: 'att-3',
        url: '#',
        type: 'log',
        name: 'flight-log-20240115.txt',
        size: 51200,
        uploadedAt: new Date(),
      },
    ],
  })
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='lg'>
        <UTMPostflightReportForm data={data} onChange={setData} />
      </Container>
    </Box>
  )
}

export const WithAttachments: Story = {
  name: '添付ファイルあり',
  render: () => <WithAttachmentsStory />,
}

// フルデータ
const FullDataStory = () => {
  const [data, setData] = useState<PostflightReportData>({
    incidents: [
      {
        id: '1',
        description:
          '計画していたルートの一部で許可エリア外への接近警告が発生しました',
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
        severity: 'high',
      },
      {
        id: '2',
        description: 'バッテリー残量が計画より早く低下したドローンがありました',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        severity: 'medium',
      },
      {
        id: '3',
        description: 'すべての配送ミッションが成功しました',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        severity: 'low',
      },
    ],
    notes:
      '本日のマルチサイトフライト運用では、3つの拠点（東京、大阪、福岡）で合計6機のドローンを同時運用しました。全体として順調でしたが、いくつかの改善点が見つかりました。\n\n【良かった点】\n- すべてのドローンが無事に帰還\n- 各拠点間の通信が安定\n- リアルタイム監視システムが有効に機能\n\n【改善点】\n- バッテリー消費の予測精度向上\n- 許可エリアの境界線表示の改善\n- 悪天候時の代替ルート計画の策定\n\n次回のフライトでは、これらの改善点を反映させる予定です。',
    attachments: [
      {
        id: 'att-1',
        url: '#',
        type: 'image',
        name: 'preflight-check.jpg',
        size: 1536000,
        uploadedAt: new Date(Date.now() - 120 * 60000),
      },
      {
        id: 'att-2',
        url: '#',
        type: 'image',
        name: 'drone-tokyo-01.jpg',
        size: 2048576,
        uploadedAt: new Date(Date.now() - 90 * 60000),
      },
      {
        id: 'att-3',
        url: '#',
        type: 'video',
        name: 'flight-highlights.mp4',
        size: 25165824,
        uploadedAt: new Date(Date.now() - 60 * 60000),
      },
      {
        id: 'att-4',
        url: '#',
        type: 'log',
        name: 'flight-log-tokyo.txt',
        size: 102400,
        uploadedAt: new Date(Date.now() - 30 * 60000),
      },
      {
        id: 'att-5',
        url: '#',
        type: 'log',
        name: 'flight-log-osaka.txt',
        size: 98304,
        uploadedAt: new Date(Date.now() - 25 * 60000),
      },
      {
        id: 'att-6',
        url: '#',
        type: 'log',
        name: 'flight-log-fukuoka.txt',
        size: 87552,
        uploadedAt: new Date(Date.now() - 20 * 60000),
      },
      {
        id: 'att-7',
        url: '#',
        type: 'document',
        name: 'incident-report.pdf',
        size: 512000,
        uploadedAt: new Date(Date.now() - 10 * 60000),
      },
    ],
  })
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='lg'>
        <UTMPostflightReportForm data={data} onChange={setData} />
      </Container>
    </Box>
  )
}

export const FullData: Story = {
  name: 'フルデータ',
  render: () => <FullDataStory />,
}

// 最大添付ファイル近く
const NearMaxAttachmentsStory = () => {
  const [data, setData] = useState<PostflightReportData>({
    incidents: [],
    notes: '',
    attachments: Array.from({ length: 9 }, (_, i) => ({
      id: `att-${i}`,
      url: '#',
      type: (['image', 'video', 'document', 'log', 'other'] as const)[i % 5],
      name: `file-${i + 1}.jpg`,
      size: Math.floor(Math.random() * 5000000),
      uploadedAt: new Date(Date.now() - i * 10 * 60000),
    })),
  })
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='lg'>
        <UTMPostflightReportForm
          data={data}
          onChange={setData}
          maxAttachments={10}
        />
      </Container>
    </Box>
  )
}

export const NearMaxAttachments: Story = {
  name: '最大添付ファイル近く',
  render: () => <NearMaxAttachmentsStory />,
}
