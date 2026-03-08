import { Box } from '@mui/material'
import { useState } from 'react'
import { action } from 'storybook/actions'

import { UTMIncidentReport } from '@/components/utm/UTMIncidentReport'

import type { IncidentReport } from '../../../types/utmTypes'
import type { Meta, StoryObj } from '@storybook/react-vite'

// コールバック関数（Storybook用）
const handleChange = action('onChange')
const handleSave = action('onSave')
const handleSubmit = action('onSubmit')
const handleModeChange = action('onModeChange')
const handleAttachmentDelete = action('onAttachmentDelete')

const meta: Meta<typeof UTMIncidentReport> = {
  title: 'Components/UTM/UTMIncidentReport',
  component: UTMIncidentReport,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## インシデントレポート

ドローン運用中に発生したインシデントを記録・報告するためのコンポーネントです。

### 主な機能
- インシデントの種類と重大度の選択
- 詳細説明と原因の記録
- 人身事故・物損の記録
- 気象条件の記録
- 添付ファイル（写真・動画・ログ）のアップロード
- 是正措置の管理
- 規制報告の追跡

### 使用場面
- インシデント発生時の報告書作成
- 既存インシデントレポートの確認・編集
- 安全管理システムへの報告
        `,
      },
    },
  },
  tags: ['autodocs', 'planned'],
  decorators: [
    (Story) => (
      <Box sx={{ height: '100vh', bgcolor: 'background.default' }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof UTMIncidentReport>

// モックインシデントレポートデータ
const createMockReport = (
  overrides?: Partial<IncidentReport>
): IncidentReport => ({
  id: 'ir-001',
  reportNumber: '20241220-001',
  status: 'draft',
  severity: 'moderate',

  incidentType: 'near_miss',
  occurredAt: new Date(Date.now() - 3600000),
  reportedAt: new Date(),
  location: {
    name: '東京湾沿岸',
    address: '東京都江東区有明',
    latitude: 35.6295,
    longitude: 139.8833,
    altitude: 50,
  },

  droneId: 'drone-001',
  droneName: '調査機1号',
  droneSerialNumber: 'DRN-2024-001234',
  pilotId: 'pilot-001',
  pilotName: '山田太郎',

  title: '他機との接近事象',
  description:
    '定期点検飛行中、予期せぬ他機（有人機）が同一空域に進入。自動検知システムにより検出し、緊急回避操作を実施。最接近距離は約200m。',
  cause: '有人機が飛行計画なく侵入した可能性',
  immediateActions: '即座にホバリングに移行し、有人機が通過後に飛行を再開',

  injuries: false,
  propertyDamage: false,
  droneStatus: 'operational',

  weather: {
    temperature: 18,
    windSpeed: 5.5,
    windDirection: 270,
    visibility: '良好（10km以上）',
    conditions: '晴れ',
  },

  attachments: [
    {
      id: 'att-001',
      name: 'flight_log_20241220.csv',
      type: 'log',
      mimeType: 'text/csv',
      size: 245678,
      url: '/logs/flight_log_20241220.csv',
      uploadedAt: new Date(),
      uploadedBy: 'user-001',
    },
    {
      id: 'att-002',
      name: 'incident_photo_01.jpg',
      type: 'image',
      mimeType: 'image/jpeg',
      size: 1234567,
      url: '/images/incident_photo_01.jpg',
      uploadedAt: new Date(),
      uploadedBy: 'user-001',
    },
  ],

  correctiveActions: [
    {
      id: 'action-001',
      description: '飛行前の空域確認手順を強化する',
      assignedTo: 'pilot-001',
      status: 'pending',
    },
    {
      id: 'action-002',
      description: '自動検知システムのアラート閾値を見直す',
      assignedTo: 'engineer-001',
      status: 'in_progress',
    },
  ],

  regulatoryReport: {
    required: false,
  },

  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: 'user-001',

  ...overrides,
})

// インタラクティブなストーリー用のラッパー
const InteractiveReport = ({
  initialMode = 'edit',
  initialReport,
}: {
  initialMode?: 'view' | 'edit' | 'create'
  initialReport?: IncidentReport
}) => {
  const [report, setReport] = useState<IncidentReport>(
    initialReport || createMockReport()
  )
  const [mode, setMode] = useState<'view' | 'edit' | 'create'>(initialMode)

  return (
    <UTMIncidentReport
      report={report}
      mode={mode}
      onChange={setReport}
      onSave={handleSave}
      onSubmit={handleSubmit}
      onModeChange={setMode}
      onAttachmentDelete={handleAttachmentDelete}
      showAllSections
    />
  )
}

/**
 * 編集モード
 */
export const EditMode: Story = {
  render: () => <InteractiveReport initialMode='edit' />,
}

/**
 * 閲覧モード
 */
export const ViewMode: Story = {
  args: {
    report: createMockReport({ status: 'submitted' }),
    mode: 'view',
    onChange: handleChange,
    onSave: handleSave,
    onSubmit: handleSubmit,
    onModeChange: handleModeChange,
    onAttachmentDelete: handleAttachmentDelete,
    showAllSections: true,
  },
}

/**
 * 新規作成モード
 */
export const CreateMode: Story = {
  args: {
    report: createMockReport({
      id: '',
      reportNumber: undefined,
      status: 'draft',
      title: '',
      description: '',
      cause: undefined,
      immediateActions: undefined,
      attachments: [],
      correctiveActions: [],
    }),
    mode: 'create',
    onChange: handleChange,
    onSave: handleSave,
    onSubmit: handleSubmit,
    onModeChange: handleModeChange,
    showAllSections: true,
  },
}

/**
 * 重大インシデント（報告義務あり）
 */
export const CriticalIncident: Story = {
  args: {
    report: createMockReport({
      severity: 'critical',
      incidentType: 'crash',
      title: 'ドローン墜落事故',
      description:
        '飛行中に突然の制御喪失が発生し、機体が農地に墜落。機体は全損。幸い人的被害はなし。',
      cause: 'モーター故障（調査中）',
      injuries: false,
      propertyDamage: true,
      propertyDamageDetails: '農地の作物一部に損害（被害額調査中）',
      droneStatus: 'destroyed',
      droneDamageDetails: '機体全損、回収済み',
      regulatoryReport: {
        required: true,
        reportedTo: ['国土交通省航空局'],
        reportedAt: new Date(),
        referenceNumber: 'MLIT-2024-12345',
      },
    }),
    mode: 'view',
    onChange: handleChange,
    onSave: handleSave,
    onSubmit: handleSubmit,
    onModeChange: handleModeChange,
    showAllSections: true,
  },
}

/**
 * 人身事故
 */
export const InjuryIncident: Story = {
  args: {
    report: createMockReport({
      severity: 'serious',
      incidentType: 'injury',
      title: '第三者への接触事故',
      description:
        '着陸時に予期せぬ強風により機体が流され、付近にいた作業員に軽く接触。',
      injuries: true,
      injuryDetails:
        '作業員1名が軽い打撲を負った。救急搬送は不要で、その場で応急処置を実施。',
      propertyDamage: false,
      droneStatus: 'damaged',
      droneDamageDetails: 'プロペラ1本が破損',
      correctiveActions: [
        {
          id: 'action-001',
          description: '着陸時の安全区域を拡大する',
          status: 'completed',
          completedAt: new Date(),
        },
        {
          id: 'action-002',
          description: '風速制限値を見直す',
          status: 'in_progress',
        },
        {
          id: 'action-003',
          description: '作業員への安全教育を実施',
          status: 'pending',
          dueDate: new Date(Date.now() + 7 * 24 * 3600000),
        },
      ],
    }),
    mode: 'edit',
    onChange: handleChange,
    onSave: handleSave,
    onSubmit: handleSubmit,
    onModeChange: handleModeChange,
    showAllSections: true,
  },
}

/**
 * 通信途絶
 */
export const LostLinkIncident: Story = {
  args: {
    report: createMockReport({
      severity: 'moderate',
      incidentType: 'lost_link',
      title: '一時的な通信途絶',
      description:
        '飛行中に約30秒間の通信途絶が発生。機体は自動RTHを開始し、通信回復後に正常に帰還。',
      cause: '電波干渉の可能性（近隣で無線機器使用中）',
      immediateActions: '通信回復を確認後、飛行を中止して帰還',
      droneStatus: 'operational',
      weather: {
        temperature: 22,
        windSpeed: 3.2,
        windDirection: 180,
        visibility: '良好',
        conditions: '晴れ',
      },
    }),
    mode: 'view',
    onChange: handleChange,
    onSave: handleSave,
    onSubmit: handleSubmit,
    onModeChange: handleModeChange,
    showAllSections: true,
  },
}

/**
 * 区域侵入
 */
export const ZoneViolationIncident: Story = {
  args: {
    report: createMockReport({
      severity: 'serious',
      incidentType: 'zone_violation',
      title: '一時的な飛行禁止区域侵入',
      description:
        '強風により機体が飛行計画区域を逸脱し、一時的に飛行禁止区域に侵入。即座に手動操作に切り替え、区域外へ退避。',
      cause: '想定を超える突風の発生',
      immediateActions: '手動操作で即座に飛行禁止区域から退避',
      regulatoryReport: {
        required: true,
        reportedTo: ['国土交通省航空局', '管轄空港事務所'],
      },
    }),
    mode: 'edit',
    onChange: handleChange,
    onSave: handleSave,
    onSubmit: handleSubmit,
    onModeChange: handleModeChange,
    showAllSections: true,
  },
}

/**
 * 承認済みレポート
 */
export const ApprovedReport: Story = {
  args: {
    report: createMockReport({
      status: 'approved',
      reviewedBy: 'manager-001',
      reviewedAt: new Date(Date.now() - 86400000),
      reviewNotes:
        'レポート内容を確認しました。是正措置を確実に実施してください。',
    }),
    mode: 'view',
    onChange: handleChange,
    onSave: handleSave,
    onModeChange: handleModeChange,
    showAllSections: true,
  },
}

/**
 * 却下されたレポート
 */
export const RejectedReport: Story = {
  args: {
    report: createMockReport({
      status: 'rejected',
      reviewedBy: 'manager-001',
      reviewedAt: new Date(Date.now() - 43200000),
      reviewNotes: '原因分析が不十分です。詳細な調査結果を追記してください。',
    }),
    mode: 'edit',
    onChange: handleChange,
    onSave: handleSave,
    onSubmit: handleSubmit,
    onModeChange: handleModeChange,
    showAllSections: true,
  },
}

/**
 * 添付ファイルなし
 */
export const NoAttachments: Story = {
  args: {
    report: createMockReport({
      attachments: [],
    }),
    mode: 'edit',
    onChange: handleChange,
    onSave: handleSave,
    onSubmit: handleSubmit,
    onModeChange: handleModeChange,
    showAllSections: true,
  },
}
