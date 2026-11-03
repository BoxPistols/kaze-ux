import AddIcon from '@mui/icons-material/Add'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Button, IconButton, Stack, Tooltip } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'

import { TableToolbar } from '@/components/ui/table/tableToolbar'

import type { Meta, StoryObj } from '@storybook/react-vite'

// サンプルデータ
const sampleRows = [
  { id: 1, name: 'プロジェクトA', status: '進行中', updatedAt: '2024-01-15' },
  { id: 2, name: 'プロジェクトB', status: '完了', updatedAt: '2024-01-10' },
  { id: 3, name: 'プロジェクトC', status: '計画中', updatedAt: '2024-01-20' },
]

const sampleColumns: GridColDef[] = [
  { field: 'name', headerName: 'プロジェクト名', flex: 1 },
  { field: 'status', headerName: 'ステータス', width: 120 },
  { field: 'updatedAt', headerName: '更新日', width: 120 },
]

const meta: Meta<typeof TableToolbar> = {
  title: 'Components/UI/Table/TableToolbar',
  component: TableToolbar,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'DataGrid内で使用するツールバーコンポーネント。GridToolbarQuickFilterを内包しているため、必ずDataGridのslots.toolbarとして使用してください。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof TableToolbar>

/**
 * DataGrid内でツールバーとして使用する基本例
 */
export const Default: Story = {
  render: () => (
    <DataGrid
      rows={sampleRows}
      columns={sampleColumns}
      autoHeight
      initialState={{
        pagination: { paginationModel: { pageSize: 5 } },
      }}
      pageSizeOptions={[5, 10]}
      slots={{
        toolbar: () => (
          <TableToolbar>
            <Stack direction='row' spacing={1}>
              <Button variant='contained' size='small' startIcon={<AddIcon />}>
                新規作成
              </Button>
            </Stack>
          </TableToolbar>
        ),
      }}
    />
  ),
}

/**
 * プレースホルダー付きのクイックフィルター
 */
export const WithPlaceholder: Story = {
  render: () => (
    <DataGrid
      rows={sampleRows}
      columns={sampleColumns}
      autoHeight
      initialState={{
        pagination: { paginationModel: { pageSize: 5 } },
      }}
      pageSizeOptions={[5, 10]}
      slots={{
        toolbar: () => (
          <TableToolbar placeholder='プロジェクト名で検索...'>
            <Stack direction='row' spacing={1}>
              <Button variant='contained' size='small' startIcon={<AddIcon />}>
                新規作成
              </Button>
              <Tooltip title='フィルター'>
                <IconButton size='small'>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </TableToolbar>
        ),
      }}
    />
  ),
}

/**
 * クイックフィルターを非表示にした例
 */
export const WithoutQuickFilter: Story = {
  render: () => (
    <DataGrid
      rows={sampleRows}
      columns={sampleColumns}
      autoHeight
      initialState={{
        pagination: { paginationModel: { pageSize: 5 } },
      }}
      pageSizeOptions={[5, 10]}
      slots={{
        toolbar: () => (
          <TableToolbar hideQuickFilter>
            <Stack direction='row' spacing={1}>
              <Button variant='contained' size='small' startIcon={<AddIcon />}>
                新規作成
              </Button>
              <Button variant='outlined' size='small'>
                エクスポート
              </Button>
            </Stack>
          </TableToolbar>
        ),
      }}
    />
  ),
}
