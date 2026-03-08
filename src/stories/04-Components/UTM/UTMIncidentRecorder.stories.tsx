/**
 * UTMインシデント記録ウィジェット Storybook
 *
 * インシデントの追加・編集・削除を行うコンポーネントのデモ
 */

import { Box, Container } from '@mui/material'
import { useState } from 'react'

import UTMIncidentRecorder from '@/components/utm/UTMIncidentRecorder'

import type { Meta, StoryObj } from '@storybook/react'

interface Incident {
  id: string
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

const meta: Meta<typeof UTMIncidentRecorder> = {
  title: 'Components/UTM/Postflight/UTMIncidentRecorder',
  component: UTMIncidentRecorder,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
インシデント記録ウィジェットコンポーネント。

## 機能

### 1. インシデント追加
- テキスト入力
- 重要度選択（低/中/高）
- タイムスタンプ自動記録

### 2. インシデント管理
- 一覧表示
- 重要度別の色分け
- 削除機能

### 3. バリデーション
- 最大件数制限
- 空入力チェック

## 使用例

\`\`\`tsx
import UTMIncidentRecorder from '@/components/utm/UTMIncidentRecorder'

const [incidents, setIncidents] = useState([])

<UTMIncidentRecorder
  incidents={incidents}
  onChange={setIncidents}
  maxIncidents={10}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs', 'utm', 'postflight'],
}

export default meta
type Story = StoryObj<typeof UTMIncidentRecorder>

// デフォルト（空）
const DefaultStory = () => {
  const [incidents, setIncidents] = useState<Incident[]>([])
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='md'>
        <UTMIncidentRecorder incidents={incidents} onChange={setIncidents} />
      </Container>
    </Box>
  )
}

export const Default: Story = {
  name: 'デフォルト（空）',
  render: () => <DefaultStory />,
}

// インシデントあり
const WithIncidentsStory = () => {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      description: 'バッテリー残量が予想より早く低下しました',
      timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
      severity: 'medium',
    },
    {
      id: '2',
      description: 'GPS信号が一時的に不安定になりました',
      timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
      severity: 'high',
    },
    {
      id: '3',
      description: '目視確認時に鳥の接近を確認しましたが、回避できました',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      severity: 'low',
    },
  ])
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='md'>
        <UTMIncidentRecorder incidents={incidents} onChange={setIncidents} />
      </Container>
    </Box>
  )
}

export const WithIncidents: Story = {
  name: 'インシデントあり',
  render: () => <WithIncidentsStory />,
}

// 最大件数近く
const NearMaxIncidentsStory = () => {
  const [incidents, setIncidents] = useState<Incident[]>(
    Array.from({ length: 9 }, (_, i) => ({
      id: `incident-${i}`,
      description: `インシデント ${i + 1}: テストインシデントの説明`,
      timestamp: new Date(Date.now() - i * 5 * 60000).toISOString(),
      severity: (['low', 'medium', 'high'] as const)[i % 3],
    }))
  )
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='md'>
        <UTMIncidentRecorder
          incidents={incidents}
          onChange={setIncidents}
          maxIncidents={10}
        />
      </Container>
    </Box>
  )
}

export const NearMaxIncidents: Story = {
  name: '最大件数近く',
  render: () => <NearMaxIncidentsStory />,
}

// 高重要度のみ
const HighSeverityOnlyStory = () => {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: '1',
      description: '緊急着陸が必要でした',
      timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
      severity: 'high',
    },
    {
      id: '2',
      description: 'システムエラーが発生しました',
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      severity: 'high',
    },
  ])
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 3 }}>
      <Container maxWidth='md'>
        <UTMIncidentRecorder incidents={incidents} onChange={setIncidents} />
      </Container>
    </Box>
  )
}

export const HighSeverityOnly: Story = {
  name: '高重要度のみ',
  render: () => <HighSeverityOnlyStory />,
}
