/**
 * UTM NOTAMリスト管理パネル Storybook
 *
 * SaaS風CRUDインターフェースのデモ
 */

import { Box, Typography, Paper, alpha, useTheme } from '@mui/material'
import { useState, useCallback } from 'react'

import { UTMNotamListPanel } from '@/components/utm/UTMNotamListPanel'
import type { NOTAMRequest, NOTAMStatus } from '@/types/utmTypes'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof UTMNotamListPanel> = {
  title: 'Components/UTM/NOTAMリスト管理パネル',
  component: UTMNotamListPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: `
## 概要

SaaS風のCRUDインターフェースを提供するNOTAM管理コンポーネントです。

### 機能

- **一覧表示（Read）**: NOTAMの一覧をテーブル形式で表示
- **新規作成（Create）**: 新しいNOTAM申請を作成
- **編集（Update）**: 下書き状態のNOTAMを編集
- **削除（Delete）**: 下書きまたは却下状態のNOTAMを削除

### フィルタリング機能

- タブフィルター: すべて / 進行中 / 下書き / 完了
- ステータスフィルター: 各ステータスで絞り込み
- 検索: 飛行エリア、申請者名、組織名などで検索

### ステータス遷移

\`\`\`
下書き → レビュー待ち → 申請済み → 処理中 → 承認済み → 発行済み
                                           ↘ 却下
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    loading: {
      control: 'boolean',
      description: 'ローディング状態',
    },
  },
}

export default meta
type Story = StoryObj<typeof UTMNotamListPanel>

// モックデータ生成
const generateId = (): string =>
  `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

const createMockNotam = (status: NOTAMStatus, index: number): NOTAMRequest => {
  const now = new Date()
  const locations = [
    {
      description: '東京都港区周辺 空撮業務',
      prefecture: '東京都',
      city: '港区',
    },
    {
      description: '神奈川県横浜市 インフラ点検',
      prefecture: '神奈川県',
      city: '横浜市',
    },
    {
      description: '千葉県成田市 農業支援飛行',
      prefecture: '千葉県',
      city: '成田市',
    },
    {
      description: '埼玉県さいたま市 測量作業',
      prefecture: '埼玉県',
      city: 'さいたま市',
    },
    {
      description: '茨城県つくば市 研究開発',
      prefecture: '茨城県',
      city: 'つくば市',
    },
    {
      description: '栃木県宇都宮市 災害調査',
      prefecture: '栃木県',
      city: '宇都宮市',
    },
    {
      description: '群馬県前橋市 建設現場点検',
      prefecture: '群馬県',
      city: '前橋市',
    },
  ]

  const requesters = [
    { name: '山田太郎', organization: 'KDDIスマートドローン株式会社' },
    { name: '鈴木花子', organization: '東京ドローンサービス' },
    { name: '佐藤一郎', organization: '関東インフラ点検' },
    { name: '田中美咲', organization: '農業ドローン協会' },
    { name: '高橋健一', organization: '測量技術センター' },
  ]

  const location = locations[index % locations.length]
  const requester = requesters[index % requesters.length]

  const isIssued = status === 'published'
  const isApproved = status === 'approved' || isIssued
  const isSubmitted = [
    'submitted',
    'processing',
    'pending_review',
    'approved',
    'published',
  ].includes(status)

  return {
    id: generateId(),
    flightPlanId: `fp-${index + 1}`,
    status,
    notamId: isIssued ? `A${String(1000 + index).padStart(4, '0')}/24` : null,
    requester: {
      name: requester.name,
      organization: requester.organization,
      contact: `${requester.name.toLowerCase().replace(/\s/g, '.')}@example.jp`,
      licenseNumber: `HP-2024-${String(index + 1).padStart(6, '0')}`,
      phone: '03-XXXX-XXXX',
      department: 'ドローン運航部',
    },
    location: {
      polygon:
        'POLYGON((139.7 35.6, 139.8 35.6, 139.8 35.7, 139.7 35.7, 139.7 35.6))',
      center: '35.65,139.75',
      radius: 2,
      description: location.description,
      prefecture: location.prefecture,
      city: location.city,
    },
    time: {
      start: new Date(now.getTime() + (index + 1) * 86400000).toISOString(),
      end: new Date(now.getTime() + (index + 2) * 86400000).toISOString(),
      timezone: 'Asia/Tokyo',
      dailySchedule: '09:00-17:00 JST',
    },
    maxAltitudeM: 100 + (index % 5) * 10,
    minAltitudeM: 0,
    reason: '空撮・点検業務',
    purpose: location.description,
    aircraftInfo: {
      type: 'マルチコプター（回転翼）',
      model: 'DJI Matrice 350 RTK',
      registrationNumber: `JU-2024-${String(index + 1).padStart(6, '0')}`,
      weight: '6.3kg',
    },
    safetyMeasures: [
      '操縦者1名＋補助者2名体制',
      '目視内飛行を維持',
      '第三者立入禁止区域を設定',
    ],
    documents: {
      pdfUrl: isIssued ? `/documents/notam-${index}.pdf` : undefined,
      jsonData: {},
    },
    attachments: isSubmitted
      ? [
          {
            id: 'att-1',
            name: '飛行計画書.pdf',
            type: 'application/pdf',
            size: 245000,
            uploadedAt: now.toISOString(),
          },
        ]
      : [],
    submittedAt: isSubmitted
      ? new Date(now.getTime() - 7200000).toISOString()
      : null,
    approvedAt: isApproved
      ? new Date(now.getTime() - 3600000).toISOString()
      : null,
    publishedAt: isIssued
      ? new Date(now.getTime() - 1800000).toISOString()
      : null,
    expiresAt: isIssued
      ? new Date(now.getTime() + 604800000).toISOString()
      : null,
    createdAt: new Date(now.getTime() - (index + 1) * 86400000).toISOString(),
    updatedAt: now.toISOString(),
    createdBy: 'user-001',
    reviewedBy: isApproved ? 'reviewer-001' : null,
    reviewerName: isApproved ? '審査員 佐藤花子' : null,
    reviewComment: isApproved ? '安全対策が適切に計画されています。' : null,
  }
}

// 様々なステータスのNOTAMを生成
const generateMockNotams = (): NOTAMRequest[] => {
  const statuses: NOTAMStatus[] = [
    'draft',
    'draft',
    'pending_review',
    'submitted',
    'processing',
    'approved',
    'published',
    'published',
    'rejected',
    'cancelled',
    'expired',
  ]
  return statuses.map((status, index) => createMockNotam(status, index))
}

// インタラクティブなデモ用ラッパー
const InteractiveDemo = () => {
  const theme = useTheme()
  const [notams, setNotams] = useState<NOTAMRequest[]>(generateMockNotams())
  const [selectedNotam, setSelectedNotam] = useState<NOTAMRequest | null>(null)
  const [actionLog, setActionLog] = useState<string[]>([])

  const addLog = (message: string) => {
    setActionLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${message}`,
      ...prev.slice(0, 9),
    ])
  }

  const handleView = useCallback((notam: NOTAMRequest) => {
    setSelectedNotam(notam)
    addLog(`詳細表示: ${notam.location.description}`)
  }, [])

  const handleRefresh = useCallback(() => {
    setNotams(generateMockNotams())
    addLog('データを更新しました')
  }, [])

  const handleMockCreate = useCallback(
    (data: Partial<NOTAMRequest>) => {
      const newNotam = createMockNotam('draft', notams.length)
      newNotam.requester = {
        ...newNotam.requester,
        ...data.requester,
      }
      newNotam.location = {
        ...newNotam.location,
        ...data.location,
      }
      if (data.reason) newNotam.reason = data.reason
      if (data.maxAltitudeM) newNotam.maxAltitudeM = data.maxAltitudeM

      setNotams((prev) => [newNotam, ...prev])
      addLog(`新規作成: ${newNotam.location.description || '(新しいNOTAM)'}`)
    },
    [notams.length]
  )

  const handleMockUpdate = useCallback(
    (id: string, data: Partial<NOTAMRequest>) => {
      setNotams((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, ...data, updatedAt: new Date().toISOString() }
            : n
        )
      )
      addLog(`更新: ID ${id.substring(0, 8)}...`)
    },
    []
  )

  const handleMockDelete = useCallback((id: string) => {
    setNotams((prev) => prev.filter((n) => n.id !== id))
    addLog(`削除: ID ${id.substring(0, 8)}...`)
  }, [])

  const handleSubmit = useCallback((notam: NOTAMRequest) => {
    setNotams((prev) =>
      prev.map((n) =>
        n.id === notam.id
          ? {
              ...n,
              status: 'submitted' as NOTAMStatus,
              submittedAt: new Date().toISOString(),
            }
          : n
      )
    )
    addLog(`申請: ${notam.location.description}`)
  }, [])

  return (
    <Box sx={{ display: 'flex', gap: 2, minHeight: 600 }}>
      <Box sx={{ flex: 1 }}>
        <UTMNotamListPanel
          notamRequests={notams}
          onView={handleView}
          onSubmit={handleSubmit}
          onRefresh={handleRefresh}
          onMockCreate={handleMockCreate}
          onMockUpdate={handleMockUpdate}
          onMockDelete={handleMockDelete}
        />
      </Box>

      {/* サイドパネル: 操作ログと選択中のNOTAM */}
      <Box
        sx={{ width: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* 操作ログ */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
          }}>
          <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
            操作ログ
          </Typography>
          <Box
            sx={{
              maxHeight: 200,
              overflow: 'auto',
              bgcolor: 'action.hover',
              borderRadius: 1,
              p: 1,
            }}>
            {actionLog.length === 0 ? (
              <Typography variant='caption' color='text.secondary'>
                操作ログがありません
              </Typography>
            ) : (
              actionLog.map((log, index) => (
                <Typography
                  key={index}
                  variant='caption'
                  display='block'
                  sx={{ fontFamily: 'monospace' }}>
                  {log}
                </Typography>
              ))
            )}
          </Box>
        </Paper>

        {/* 選択中のNOTAM */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            bgcolor: alpha(theme.palette.background.paper, 0.9),
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
            flex: 1,
          }}>
          <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
            選択中のNOTAM
          </Typography>
          {selectedNotam ? (
            <Box>
              <Typography variant='body2' fontWeight='medium'>
                {selectedNotam.location.description}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'>
                {selectedNotam.location.prefecture}{' '}
                {selectedNotam.location.city}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
                sx={{ mt: 1 }}>
                申請者: {selectedNotam.requester.name}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'>
                組織: {selectedNotam.requester.organization}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                display='block'
                sx={{ mt: 1 }}>
                高度: {selectedNotam.minAltitudeM || 0}m -{' '}
                {selectedNotam.maxAltitudeM}m
              </Typography>
              {selectedNotam.notamId && (
                <Typography
                  variant='caption'
                  color='primary'
                  display='block'
                  sx={{ mt: 1 }}>
                  NOTAM ID: {selectedNotam.notamId}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant='caption' color='text.secondary'>
              テーブルの行をクリックして選択
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  )
}

// デフォルトストーリー（インタラクティブデモ）
export const Default: Story = {
  render: () => <InteractiveDemo />,
  parameters: {
    docs: {
      description: {
        story: `
インタラクティブなCRUDデモです。

- **新規作成**: 「新規作成」ボタンをクリックしてフォームを開きます
- **編集**: 下書き状態のNOTAMの「...」メニューから「編集」を選択
- **削除**: 下書きまたは却下状態のNOTAMの「...」メニューから「削除」を選択
- **詳細表示**: テーブルの行をクリックすると右パネルに詳細が表示されます
- **申請**: 下書き状態のNOTAMの「...」メニューから「申請する」を選択

右側のパネルに操作ログが表示されます。
        `,
      },
    },
  },
}

// 空のリスト
export const EmptyList: Story = {
  args: {
    notamRequests: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'NOTAMが存在しない場合の表示です。',
      },
    },
  },
}

// 多数のNOTAM
export const ManyNotams: Story = {
  args: {
    notamRequests: Array.from({ length: 50 }, (_, i) => {
      const statuses: NOTAMStatus[] = [
        'draft',
        'pending_review',
        'submitted',
        'processing',
        'approved',
        'published',
        'rejected',
        'cancelled',
        'expired',
      ]
      return createMockNotam(statuses[i % statuses.length], i)
    }),
  },
  parameters: {
    docs: {
      description: {
        story: '多数のNOTAMがある場合のページネーション表示です。',
      },
    },
  },
}

// ローディング状態
export const Loading: Story = {
  args: {
    notamRequests: generateMockNotams(),
    loading: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'ローディング中の状態です。',
      },
    },
  },
}

// 下書きのみ
export const DraftsOnly: Story = {
  args: {
    notamRequests: Array.from({ length: 5 }, (_, i) =>
      createMockNotam('draft', i)
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '下書き状態のNOTAMのみを表示。編集・削除が可能です。',
      },
    },
  },
}

// 発行済みのみ
export const PublishedOnly: Story = {
  args: {
    notamRequests: Array.from({ length: 5 }, (_, i) =>
      createMockNotam('published', i)
    ),
  },
  parameters: {
    docs: {
      description: {
        story: '発行済みのNOTAMのみを表示。閲覧のみ可能です。',
      },
    },
  },
}
