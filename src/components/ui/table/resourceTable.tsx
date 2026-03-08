// src/components/ui/table/resourceTable.tsx
// ResourceTableコンポーネント
import AddIcon from '@mui/icons-material/Add'
import SearchOffIcon from '@mui/icons-material/SearchOff'
import TableRowsIcon from '@mui/icons-material/TableRows'
import { Box, Button, Stack, Typography } from '@mui/material'
import {
  DataGrid,
  type GridColDef,
  type GridRowParams,
  GridToolbarQuickFilter,
  type GridRowSelectionModel,
  type GridFilterModel,
  type GridSortModel,
  type GridSlots,
} from '@mui/x-data-grid'

// フィルター設定の型
export interface FilterConfig {
  field: string
  value: string | string[]
  operator?: string
}

// カスタムツールバー
interface CustomToolbarProps {
  children?: React.ReactNode
  showQuickFilter?: boolean
}

const CustomToolbar = ({
  children,
  showQuickFilter = true,
}: CustomToolbarProps) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      p: 2,
      borderBottom: 1,
      borderColor: 'divider',
    }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>{children}</Box>
    {showQuickFilter && (
      <GridToolbarQuickFilter
        placeholder='検索...'
        sx={{
          '& .MuiInputBase-root': {
            borderRadius: 1.5,
          },
        }}
      />
    )}
  </Box>
)

// データなしオーバーレイ
const NoRowsOverlay = () => (
  <Stack
    height='100%'
    alignItems='center'
    justifyContent='center'
    spacing={2}
    sx={{ py: 8 }}>
    <TableRowsIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
    <Typography variant='body1' color='text.secondary'>
      データがありません
    </Typography>
    <Typography variant='body2' color='text.disabled'>
      新規登録してデータを追加してください
    </Typography>
  </Stack>
)

// フィルター結果なしオーバーレイ
const NoResultsOverlay = () => (
  <Stack
    height='100%'
    alignItems='center'
    justifyContent='center'
    spacing={2}
    sx={{ py: 8 }}>
    <SearchOffIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
    <Typography variant='body1' color='text.secondary'>
      検索結果がありません
    </Typography>
    <Typography variant='body2' color='text.disabled'>
      検索条件を変更してお試しください
    </Typography>
  </Stack>
)

export interface ResourceTableProps<T extends { id: string | number }> {
  /** テーブルタイトル */
  title?: string
  /** 新規登録ボタンクリック時のコールバック */
  onAdd?: () => void
  /** 新規登録ボタンのテキスト */
  addButtonText?: string
  /** カラム定義 */
  columns: GridColDef<T>[]
  /** データ行 */
  rows: T[]
  /** フィルター設定 */
  filter?: FilterConfig
  /** フィルターモデル（高度なフィルタリング用） */
  filterModel?: GridFilterModel
  /** フィルターモデル変更時のコールバック */
  onFilterModelChange?: (model: GridFilterModel) => void
  /** ソートモデル */
  sortModel?: GridSortModel
  /** ソートモデル変更時のコールバック */
  onSortModelChange?: (model: GridSortModel) => void
  /** カスタムツールバーの内容 */
  toolbarContent?: React.ReactNode
  /** クイックフィルターを表示 */
  showQuickFilter?: boolean
  /** 非表示カラムID配列 */
  hideColumns?: string[]
  /** 行クリック時のコールバック */
  onRowClick?: (params: GridRowParams<T>) => void
  /** ローディング状態 */
  loading?: boolean
  /** 高さ */
  height?: string | number
  /** ページサイズオプション */
  pageSizeOptions?: number[]
  /** 初期ページサイズ */
  initialPageSize?: number
  /** チェックボックス選択 */
  checkboxSelection?: boolean
  /** 選択された行ID */
  selectedRows?: GridRowSelectionModel
  /** 選択変更時のコールバック */
  onSelectionChange?: (ids: GridRowSelectionModel) => void
  /** 密度（コンパクト表示） */
  density?: 'compact' | 'standard' | 'comfortable'
  /** 自動高さ調整 */
  autoHeight?: boolean
  /** カスタムスロット */
  slots?: Partial<GridSlots>
}

export const ResourceTable = <T extends { id: string | number }>({
  title,
  onAdd,
  addButtonText = '新規登録',
  columns,
  rows,
  filter,
  filterModel: externalFilterModel,
  onFilterModelChange,
  sortModel,
  onSortModelChange,
  toolbarContent,
  showQuickFilter = true,
  hideColumns = [],
  onRowClick,
  loading = false,
  height = '70vh',
  pageSizeOptions = [20, 50, 100],
  initialPageSize = 20,
  checkboxSelection = false,
  selectedRows,
  onSelectionChange,
  density = 'standard',
  autoHeight = false,
  slots,
}: ResourceTableProps<T>) => {
  // 非表示カラムの設定
  const columnVisibilityModel = hideColumns.reduce(
    (acc, colId) => {
      acc[colId] = false
      return acc
    },
    {} as Record<string, boolean>
  )

  // フィルターモデル（内部生成またはexternal）
  const filterModelValue = externalFilterModel
    ? externalFilterModel
    : filter
      ? {
          items: [
            {
              field: filter.field,
              operator: filter.operator || 'contains',
              value: Array.isArray(filter.value)
                ? filter.value.join(',')
                : filter.value,
            },
          ],
        }
      : undefined

  // デフォルトスロット
  const defaultSlots: Partial<GridSlots> = {
    toolbar: () => (
      <CustomToolbar showQuickFilter={showQuickFilter}>
        {toolbarContent}
      </CustomToolbar>
    ),
    noRowsOverlay: NoRowsOverlay,
    noResultsOverlay: NoResultsOverlay,
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* ヘッダー */}
      {(title || onAdd) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}>
          {title && (
            <Typography variant='h5' fontWeight={600}>
              {title}
            </Typography>
          )}
          {onAdd && (
            <Button variant='contained' startIcon={<AddIcon />} onClick={onAdd}>
              {addButtonText}
            </Button>
          )}
        </Box>
      )}

      {/* DataGrid */}
      <Box sx={{ height: autoHeight ? 'auto' : height, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          density={density}
          autoHeight={autoHeight}
          pageSizeOptions={pageSizeOptions}
          initialState={{
            pagination: { paginationModel: { pageSize: initialPageSize } },
            columns: { columnVisibilityModel },
            filter: filterModelValue
              ? { filterModel: filterModelValue }
              : undefined,
            sorting: sortModel ? { sortModel } : undefined,
          }}
          filterModel={externalFilterModel}
          onFilterModelChange={onFilterModelChange}
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          slots={{ ...defaultSlots, ...slots }}
          onRowClick={onRowClick}
          checkboxSelection={checkboxSelection}
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={(newSelection) => {
            onSelectionChange?.(newSelection)
          }}
          disableRowSelectionOnClick={!checkboxSelection}
          localeText={{
            noRowsLabel: 'データがありません',
            noResultsOverlayLabel: '検索条件に一致するデータがありません',
            // ページネーション
            footerRowSelected: (count: number) => `${count}行選択中`,
            footerTotalRows: '合計行数:',
            footerTotalVisibleRows: (
              visibleCount: number,
              totalCount: number
            ) => `${visibleCount} / ${totalCount}`,
            // ツールバー
            toolbarFilters: 'フィルター',
            toolbarDensity: '密度',
            toolbarColumns: 'カラム',
            toolbarExport: 'エクスポート',
            // フィルター
            filterPanelAddFilter: 'フィルターを追加',
            filterPanelRemoveAll: 'すべて削除',
            filterOperatorContains: '含む',
            filterOperatorEquals: '等しい',
            filterOperatorStartsWith: '始まる',
            filterOperatorEndsWith: '終わる',
            filterOperatorIsEmpty: '空',
            filterOperatorIsNotEmpty: '空でない',
            // 列メニュー
            columnMenuLabel: 'メニュー',
            columnMenuShowColumns: 'カラム表示',
            columnMenuManageColumns: 'カラム管理',
            columnMenuFilter: 'フィルター',
            columnMenuHideColumn: '非表示',
            columnMenuSortAsc: '昇順',
            columnMenuSortDesc: '降順',
            columnMenuUnsort: 'ソート解除',
          }}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
              borderBottom: 1,
              borderColor: 'divider',
            },
            '& .MuiDataGrid-columnHeader': {
              '&:focus, &:focus-within': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-row': {
              cursor: onRowClick ? 'pointer' : 'default',
              '&:hover': {
                bgcolor: 'action.hover',
              },
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                '&:hover': {
                  bgcolor: 'action.selected',
                },
              },
            },
            '& .MuiDataGrid-cell': {
              display: 'flex',
              alignItems: 'center',
              borderBottom: 1,
              borderColor: 'divider',
              '&:focus, &:focus-within': {
                outline: 'none',
              },
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: 1,
              borderColor: 'divider',
            },
            '& .MuiDataGrid-virtualScroller': {
              bgcolor: 'background.paper',
            },
          }}
        />
      </Box>
    </Box>
  )
}

export default ResourceTable
