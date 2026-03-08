/**
 * UTMサイトタブナビゲーション Storybook
 *
 * マルチサイトフライトのサイト選択タブのデモ
 */

import { Box, Container, Paper, Typography } from '@mui/material'
import { useState } from 'react'

import UTMSiteTabNavigation from '@/components/utm/UTMSiteTabNavigation'
import type { SiteInfo } from '@/types/utmTypes'

import type { Meta, StoryObj } from '@storybook/react'

// サンプルサイトデータ
const sampleSites: SiteInfo[] = [
  {
    id: 'site-tokyo',
    name: '東京拠点',
    location: { latitude: 35.6812, longitude: 139.7671 },
    drones: ['drone-tokyo-01', 'drone-tokyo-02'],
    description: '東京都心部のインフラ点検拠点',
  },
  {
    id: 'site-osaka',
    name: '大阪拠点',
    location: { latitude: 34.6937, longitude: 135.5023 },
    drones: ['drone-osaka-01', 'drone-osaka-02'],
    description: '大阪市内のインフラ点検拠点',
  },
  {
    id: 'site-fukuoka',
    name: '福岡拠点',
    location: { latitude: 33.5904, longitude: 130.4017 },
    drones: ['drone-fukuoka-01', 'drone-fukuoka-02'],
    description: '福岡市内のインフラ点検拠点',
  },
]

// 5サイトのサンプルデータ
const fiveSites: SiteInfo[] = [
  {
    id: 'site-tokyo',
    name: '東京拠点',
    location: { latitude: 35.6812, longitude: 139.7671 },
    drones: ['drone-tokyo-01', 'drone-tokyo-02', 'drone-tokyo-03'],
  },
  {
    id: 'site-osaka',
    name: '大阪拠点',
    location: { latitude: 34.6937, longitude: 135.5023 },
    drones: ['drone-osaka-01', 'drone-osaka-02'],
  },
  {
    id: 'site-fukuoka',
    name: '福岡拠点',
    location: { latitude: 33.5904, longitude: 130.4017 },
    drones: ['drone-fukuoka-01'],
  },
  {
    id: 'site-nagoya',
    name: '名古屋拠点',
    location: { latitude: 35.1815, longitude: 136.9066 },
    drones: ['drone-nagoya-01', 'drone-nagoya-02'],
  },
  {
    id: 'site-sapporo',
    name: '札幌拠点',
    location: { latitude: 43.0642, longitude: 141.3469 },
    drones: ['drone-sapporo-01'],
  },
]

// デモコンポーネント
function UTMSiteTabNavigationDemo(props: {
  sites: SiteInfo[]
  initialStatus?: 'preflight' | 'in_flight' | 'completed'
}): JSX.Element {
  const { sites, initialStatus = 'preflight' } = props
  const [activeSiteId, setActiveSiteId] = useState(sites[0]?.id ?? '')
  const [flightStatus, setFlightStatus] = useState<
    'preflight' | 'in_flight' | 'completed'
  >(initialStatus)

  const activeSite = sites.find((s) => s.id === activeSiteId)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <UTMSiteTabNavigation
        sites={sites}
        activeSiteId={activeSiteId}
        onSiteChange={setActiveSiteId}
        flightStatus={flightStatus}
      />

      <Container maxWidth='lg' sx={{ py: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant='h6' gutterBottom>
            選択中のサイト情報
          </Typography>
          {activeSite && (
            <>
              <Typography variant='body1' gutterBottom>
                サイト名: {activeSite.name}
              </Typography>
              <Typography variant='body1' gutterBottom>
                ドローン数: {activeSite.drones.length}機
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                位置: {activeSite.location.latitude.toFixed(4)},{' '}
                {activeSite.location.longitude.toFixed(4)}
              </Typography>
              {activeSite.description && (
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 1 }}>
                  {activeSite.description}
                </Typography>
              )}
            </>
          )}
        </Paper>

        {/* ステータス切替ボタン */}
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant='subtitle2' gutterBottom>
            フライトステータス変更（デモ用）
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <button
              type='button'
              onClick={() => setFlightStatus('preflight')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                background:
                  flightStatus === 'preflight' ? '#ff9800' : '#e0e0e0',
                border: 'none',
                borderRadius: '4px',
              }}>
              プリフライト
            </button>
            <button
              type='button'
              onClick={() => setFlightStatus('in_flight')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                background:
                  flightStatus === 'in_flight' ? '#2196f3' : '#e0e0e0',
                border: 'none',
                borderRadius: '4px',
              }}>
              飛行中
            </button>
            <button
              type='button'
              onClick={() => setFlightStatus('completed')}
              style={{
                padding: '8px 16px',
                cursor: 'pointer',
                background:
                  flightStatus === 'completed' ? '#4caf50' : '#e0e0e0',
                border: 'none',
                borderRadius: '4px',
              }}>
              完了
            </button>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

// Storybook設定
const meta: Meta<typeof UTMSiteTabNavigation> = {
  title: 'Components/UTM/MultiSite/UTMSiteTabNavigation',
  component: UTMSiteTabNavigation,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
マルチサイトフライトのサイト選択タブナビゲーション。

## 機能

- **サイト名表示**: タブで各サイト名を表示
- **ドローン数バッジ**: 各サイトに所属するドローン数を表示
- **ステータス色分け**: フライトステータスに応じて色を変更
  - プリフライト: オレンジ
  - 飛行中: ブルー
  - 完了: グリーン
- **レスポンシブ**: モバイルでスクロール可能

## 使用例

\`\`\`tsx
import UTMSiteTabNavigation from '@/components/utm/UTMSiteTabNavigation'

const [activeSiteId, setActiveSiteId] = useState('site-tokyo')

<UTMSiteTabNavigation
  sites={flight.sites}
  activeSiteId={activeSiteId}
  onSiteChange={setActiveSiteId}
  flightStatus="in_flight"
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs', 'utm', 'multi-site'],
}

export default meta
type Story = StoryObj<typeof UTMSiteTabNavigationDemo>

// 基本表示（3サイト）
export const Default: Story = {
  name: '基本表示（3サイト）',
  render: () => <UTMSiteTabNavigationDemo sites={sampleSites} />,
}

// 飛行中ステータス
export const InFlight: Story = {
  name: '飛行中ステータス',
  render: () => (
    <UTMSiteTabNavigationDemo sites={sampleSites} initialStatus='in_flight' />
  ),
}

// 完了ステータス
export const Completed: Story = {
  name: '完了ステータス',
  render: () => (
    <UTMSiteTabNavigationDemo sites={sampleSites} initialStatus='completed' />
  ),
}

// 5サイト（スクロール）
export const FiveSites: Story = {
  name: '5サイト（スクロール）',
  render: () => <UTMSiteTabNavigationDemo sites={fiveSites} />,
}

// 1サイト（エッジケース）
export const SingleSite: Story = {
  name: '1サイトのみ',
  render: () => <UTMSiteTabNavigationDemo sites={[sampleSites[0]]} />,
}

// ドローン数が異なる場合
export const DifferentDroneCounts: Story = {
  name: 'ドローン数が異なる',
  render: () => {
    const sites: SiteInfo[] = [
      {
        id: 'site-1',
        name: '小規模拠点',
        location: { latitude: 35.6812, longitude: 139.7671 },
        drones: ['drone-01'],
      },
      {
        id: 'site-2',
        name: '中規模拠点',
        location: { latitude: 34.6937, longitude: 135.5023 },
        drones: ['drone-02', 'drone-03', 'drone-04'],
      },
      {
        id: 'site-3',
        name: '大規模拠点',
        location: { latitude: 33.5904, longitude: 130.4017 },
        drones: [
          'drone-05',
          'drone-06',
          'drone-07',
          'drone-08',
          'drone-09',
          'drone-10',
        ],
      },
    ]
    return <UTMSiteTabNavigationDemo sites={sites} />
  },
}
