import { Box, Chip } from '@mui/material'
import { useState } from 'react'

import { ResourceTable } from '@/components/ui/table/resourceTable'

import type { GridColDef, GridRowParams } from '@mui/x-data-grid'
import type { Meta, StoryObj } from '@storybook/react-vite'

interface DeviceRow {
  id: number
  name: string
  status: '稼働中' | '待機中' | 'メンテナンス' | 'オフライン'
  battery: number
  lastActive: string
}

const statusColorMap: Record<
  DeviceRow['status'],
  'success' | 'info' | 'warning' | 'default'
> = {
  稼働中: 'success',
  待機中: 'info',
  メンテナンス: 'warning',
  オフライン: 'default',
}

const sampleColumns: GridColDef<DeviceRow>[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'デバイス名', flex: 1, minWidth: 160 },
  {
    field: 'status',
    headerName: 'ステータス',
    width: 140,
    renderCell: (params) => (
      <Chip
        label={params.value as string}
        size='small'
        color={statusColorMap[params.value as DeviceRow['status']]}
        variant='outlined'
      />
    ),
  },
  {
    field: 'battery',
    headerName: 'バッテリー',
    width: 120,
    renderCell: (params) => {
      const value = params.value as number
      return (
        <Box
          component='span'
          sx={{
            fontWeight: 500,
            color: value < 30 ? 'error.main' : 'text.primary',
          }}>
          {value}%
        </Box>
      )
    },
  },
  { field: 'lastActive', headerName: '最終アクティブ', width: 160 },
]

const sampleRows: DeviceRow[] = [
  {
    id: 1,
    name: 'Alpha-01',
    status: '稼働中',
    battery: 82,
    lastActive: '2026-03-07 09:15',
  },
  {
    id: 2,
    name: 'Bravo-02',
    status: '待機中',
    battery: 95,
    lastActive: '2026-03-06 16:42',
  },
  {
    id: 3,
    name: 'Charlie-03',
    status: 'メンテナンス',
    battery: 23,
    lastActive: '2026-03-05 11:30',
  },
  {
    id: 4,
    name: 'Delta-04',
    status: 'オフライン',
    battery: 0,
    lastActive: '2026-02-28 08:00',
  },
  {
    id: 5,
    name: 'Echo-05',
    status: '待機中',
    battery: 67,
    lastActive: '2026-03-07 07:55',
  },
]

const meta: Meta<typeof ResourceTable> = {
  title: 'Components/UI/Table/ResourceTable',
  component: ResourceTable,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '汎用リソーステーブル。ソート、検索、密度切替、ページネーション機能を備えた再利用可能なデータテーブルコンポーネント。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ResourceTable>

const DefaultRenderer = () => {
  const [clickedRow, setClickedRow] = useState<string>('')

  const handleRowClick = (params: GridRowParams) => {
    setClickedRow(`行クリック: ${params.row.name}`)
  }

  const handleAdd = () => {
    setClickedRow('新規登録ボタンがクリックされました')
  }

  return (
    <Box sx={{ width: '100%' }}>
      <ResourceTable<DeviceRow>
        title='デバイス管理'
        columns={sampleColumns}
        rows={sampleRows}
        onAdd={handleAdd}
        addButtonText='新規登録'
        onRowClick={handleRowClick}
        height={450}
        pageSizeOptions={[5, 10, 20]}
        initialPageSize={5}
      />
      {clickedRow && (
        <Box sx={{ mt: 2, color: 'text.secondary', fontSize: 14 }}>
          {clickedRow}
        </Box>
      )}
    </Box>
  )
}

export const Default: Story = {
  render: () => <DefaultRenderer />,
}
