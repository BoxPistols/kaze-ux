// Source: リファレンスとしてバックアップファイル
/**
 * @fileoverview カスタマイズ可能なテーブルコンポーネント
 * - ソート機能
 * - 検索機能
 * - ページネーション
 * - カラムの表示/非表示切り替え
 * - CRUD操作用のアクションボタン
 * - ローディング状態の表示
 * - レスポンシブデザイン
 */

import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  ViewColumn as ViewColumnIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputAdornment,
  Menu,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useMemo, useState } from 'react'
import type React from 'react'

import { theme } from '@/themes/theme'

/**
 * テーブルのカラム定義インターフェース
 * @interface Column
 * @property {string} accessor - データのキー名
 * @property {string} header - 表示するヘッダーテキスト
 * @property {boolean} [sortable] - ソート可能かどうか
 */
interface Column {
  accessor: string
  header: string
  sortable?: boolean
}

/**
 * テーブルコンポーネントのプロパティ定義
 * @interface TableProps
 * @property {Column[]} columns - カラム定義の配列
 * @property {Array<Record<string, string | number | boolean>>} data - 表示するデータ
 * @property {boolean} [showCRUD] - CRUD操作ボタンを表示するか
 * @property {Function} [onView] - 表示ボタンクリック時のコールバック
 * @property {Function} [onEdit] - 編集ボタンクリック時のコールバック
 * @property {Function} [onDelete] - 削除ボタンクリック時のコールバック
 * @property {boolean} [searchable] - 検索機能を有効にするか
 * @property {number} [defaultPageSize] - デフォルトのページサイズ
 * @property {number[]} [pageSizeOptions] - 選択可能なページサイズ
 * @property {boolean} [loading] - ローディング状態
 */
interface TableProps {
  columns: Column[]
  data: Array<Record<string, string | number | boolean>>
  showCRUD?: boolean
  onView?: (row: Record<string, string | number | boolean>) => void
  onEdit?: (row: Record<string, string | number | boolean>) => void
  onDelete?: (row: Record<string, string | number | boolean>) => void
  searchable?: boolean
  defaultPageSize?: number
  pageSizeOptions?: number[]
  loading?: boolean
}

/**
 * ソート順の型定義
 * ascは昇順、descは降順を表す
 */
type Order = 'asc' | 'desc'

/**
 * ソート設定のインターフェース
 * @property {string} key - ソート対象のカラム名
 * @property {Order} direction - ソート方向
 */
interface SortConfig {
  key: string
  direction: Order
}

/**
 * スタイル付きTableCell
 * ヘッダーとボディで異なるスタイルを適用し、ダークモードにも対応
 */
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&
.$
{
  tableCellClasses.head
}
`]: {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[900]
        : theme.palette.secondary.dark,
    color: theme.palette.common.white,
    fontSize: '0.75rem',
    fontWeight: theme.typography.fontWeightMedium,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    '& .MuiTableSortLabel-root': {
      color: theme.palette.common.white,
      '&:hover': {
        color: theme.palette.common.white,
      },
      '&.Mui-active': {
        color: theme.palette.common.white,
        '& .MuiTableSortLabel-icon': {
          color: theme.palette.secondary.light,
        },
      },
    },
  },
  [`&
.$
{
  tableCellClasses.body
}
;`]: {
    fontSize: '0.875rem',
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
  },
}))

/**
 * スタイル付きTableRow
 * 奇数行の背景色変更とホバー効果を実装
 * ダークモードにも対応
 */
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[50],
  },
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.grey[700]
        : theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

/**
 * セルの値を適切な形式でフォーマットする関数
 * nullやundefinedの場合は'-'を表示
 * 真偽値の場合はActive/Inactiveのバッジを表示
 * その他の値は文字列に変換して表示
 * @param {unknown} value - フォーマットする値
 * @returns {React.ReactNode} フォーマットされた値
 */
const formatCellValue = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined) {
    return '-'
  }

  if (typeof value === 'boolean') {
    return (
      <Box
        component='span'
        sx={{
          px: 2,
          py: 0.5,
          borderRadius: 1,
          fontSize: '0.75rem',
          fontWeight: 'medium',
          bgcolor: value ? 'success.lighter' : 'error.lighter',
          color: theme.palette.common.black,
        }}>
        {value ? 'Active' : 'Inactive'}
      </Box>
    )
  }

  return String(value)
}

/**
 * テーブル行を表示するコンポーネント
 * データの各行をレンダリングし、CRUD操作ボタンを含む
 * @param {Object} props
 * @param {Array<Record<string, string | number | boolean>>} props.visibleData - 表示するデータ
 * @param {Column[]} props.columns - カラム定義
 * @param {Set<string>} props.visibleColumns - 表示するカラム
 * @param {boolean} props.showCRUD - CRUD操作ボタンを表示するか
 * @param {Function} props.onView - 表示ボタンのコールバック
 * @param {Function} props.onEdit - 編集ボタンのコールバック
 * @param {Function} props.onDelete - 削除ボタンのコールバック
 */
const TableRows = ({
  visibleData,
  columns,
  visibleColumns,
  showCRUD,
  onView = () => {
    /* no-op */
  },
  onEdit = () => {
    /* no-op */
  },
  onDelete = () => {
    /* no-op */
  },
}: {
  visibleData: Array<Record<string, string | number | boolean>>
  columns: Column[]
  visibleColumns: Set<string>
  showCRUD: boolean
  onView: (row: Record<string, string | number | boolean>) => void
  onEdit: (row: Record<string, string | number | boolean>) => void
  onDelete: (row: Record<string, string | number | boolean>) => void
}) => (
  <>
    {visibleData.map((row) => (
      <StyledTableRow key={String(row.id)}>
        {columns
          .filter((col) => visibleColumns.has(col.accessor))
          .map((column) => (
            <StyledTableCell key={column.accessor}>
              {formatCellValue(row[column.accessor])}
            </StyledTableCell>
          ))}
        {showCRUD && (
          <StyledTableCell
            align='right'
            sx={{
              whiteSpace: 'nowrap',
            }}>
            <Tooltip arrow title='View'>
              <IconButton
                size='small'
                onClick={() => onView(row)}
                color='secondary'
                title='View'
                sx={{ mr: 1 }}>
                <VisibilityIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title='Edit'>
              <IconButton
                size='small'
                onClick={() => onEdit(row)}
                color='secondary'
                title='Edit'
                sx={{ mr: 1 }}>
                <EditIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip arrow title='Delete'>
              <IconButton
                size='small'
                onClick={() => onDelete(row)}
                color='secondary'
                title='Delete'>
                <DeleteIcon fontSize='small' />
              </IconButton>
            </Tooltip>
          </StyledTableCell>
        )}
      </StyledTableRow>
    ))}
  </>
)

/**
 * メインのテーブルコンポーネント
 * 検索、ソート、ページネーション、カラム表示制御などの機能を統合
 * @param {TableProps} props - テーブルのプロパティ
 */
export const CustomTable = ({
  columns = [],
  data = [],
  showCRUD = false,
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
  searchable = false,
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 25, 50],
  loading = false,
}: TableProps) => {
  // 検索語句の状態管理
  const [searchTerm, setSearchTerm] = useState('')
  // フィルタリングされたデータの状態管理
  const [filteredData, setFilteredData] = useState(data)
  // ページネーションの状態管理
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize)
  // ソート設定の状態管理
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: '',
    direction: 'asc',
  })
  // 表示カラムの状態管理
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.accessor))
  )
  // カラムメニューの状態管理（表示/非表示の制御に使用）
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(
    null
  )

  // データ更新時のフィルタリングデータ初期化
  useEffect(() => {
    setFilteredData(data)
  }, [data])

  /**
   * 検索処理を実行する関数
   * 検索文字列に基づいてデータをフィルタリング
   * @param {string} value - 検索文字列
   */
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setPage(0)

    if (!value.trim()) {
      setFilteredData(data)
      return
    }

    const filtered = data.filter((item) =>
      Object.values(item).some((val) =>
        val?.toString().toLowerCase().includes(value.toLowerCase())
      )
    )
    setFilteredData(filtered)
  }

  /**
   * ソート処理を実行する関数
   * 同じカラムを再度クリックすると昇順/降順を切り替え
   * @param {string} accessor - ソート対象のカラム
   */
  const handleSort = (accessor: string) => {
    const newDirection: Order =
      sortConfig.key === accessor && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc'

    setSortConfig({ key: accessor, direction: newDirection })
  }

  /**
   * ソートされたデータの計算（メモ化）
   * ソート設定に基づいてデータを並び替え
   */
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === bValue) return 0

      if (sortConfig.direction === 'asc') {
        return aValue < bValue ? -1 : 1
      }
      return aValue > bValue ? -1 : 1
    })
  }, [filteredData, sortConfig])

  /**
   * ページ変更ハンドラ
   * @param {unknown} _event - イベントオブジェクト（未使用）
   * @param {number} newPage - 新しいページ番号
   */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  /**
   * 1ページあたりの行数変更ハンドラ
   * @param {React.ChangeEvent<HTMLInputElement>} event - イベントオブジェクト
   */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10))
    setPage(0)
  }

  /**
   * カラム表示/非表示を切り替える関数
   * @param {string} accessor - 対象のカラム
   */
  const handleColumnVisibilityChange = (accessor: string) => {
    const newVisibleColumns = new Set(visibleColumns)
    if (newVisibleColumns.has(accessor)) {
      newVisibleColumns.delete(accessor)
    } else {
      newVisibleColumns.add(accessor)
    }
    setVisibleColumns(newVisibleColumns)
  }

  /**
   * データが存在しない場合の表示
   * 中央寄せで「No data available」と表示
   */
  if (!data || data.length === 0) {
    return (
      <Box sx={{ width: '100%', textAlign: 'center', py: 2 }}>
        <Typography variant='body2' color='text.secondary'>
          No data available
        </Typography>
      </Box>
    )
  }

  /**
   * ローディング状態の表示
   * スケルトンUIを表示してローディング中であることを視覚的に表現
   */
  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        {searchable && (
          <Box sx={{ mb: 2 }}>
            <Skeleton variant='rectangular' width={300} height={40} />
          </Box>
        )}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <StyledTableCell key={column.accessor}>
                    {column.header}
                  </StyledTableCell>
                ))}
                {showCRUD && (
                  <StyledTableCell align='right'>Actions</StyledTableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.slice(0, defaultPageSize).map((row) => (
                <StyledTableRow key={String(row.id)}>
                  {columns.map((column) => (
                    <StyledTableCell key={column.accessor}>
                      <Skeleton />
                    </StyledTableCell>
                  ))}
                  {showCRUD && (
                    <StyledTableCell align='right'>
                      <Skeleton width={120} />
                    </StyledTableCell>
                  )}
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 2 }}>
          <Skeleton variant='rectangular' width='100%' height={52} />
        </Box>
      </Box>
    )
  }

  /**
   * 現在のページに表示するデータを計算
   * ソート済みデータからページネーションに応じた範囲を抽出
   */
  const visibleData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  /**
   * メインのレンダリング
   * 検索ボックス、カラム表示制御、テーブル本体、ページネーションを含む
   */
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {searchable && (
          <TextField
            size='small'
            placeholder='Search...'
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' color='primary' />
                </InputAdornment>
              ),
            }}
          />
        )}
        <Button
          size='small'
          startIcon={<ViewColumnIcon />}
          onClick={(e) => setColumnMenuAnchor(e.currentTarget)}>
          Columns
        </Button>
      </Box>

      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}>
        <Box sx={{ p: 1 }}>
          <FormGroup>
            {columns.map((column) => (
              <FormControlLabel
                key={column.accessor}
                control={
                  <Checkbox
                    checked={visibleColumns.has(column.accessor)}
                    onChange={() =>
                      handleColumnVisibilityChange(column.accessor)
                    }
                    size='small'
                  />
                }
                label={column.header}
              />
            ))}
          </FormGroup>
        </Box>
      </Menu>

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 1,
          border: (theme) => `1px solid ${theme.palette.divider};`,
        }}>
        <Table sx={{ minWidth: '100%' }} aria-label='custom table'>
          <TableHead>
            <TableRow>
              {columns
                .filter((col) => visibleColumns.has(col.accessor))
                .map((column) => (
                  <StyledTableCell key={column.accessor}>
                    {column.sortable !== false ? (
                      <TableSortLabel
                        active={sortConfig.key === column.accessor}
                        direction={
                          sortConfig.key === column.accessor
                            ? sortConfig.direction
                            : 'asc'
                        }
                        onClick={() => handleSort(column.accessor)}>
                        {column.header}
                      </TableSortLabel>
                    ) : (
                      column.header
                    )}
                  </StyledTableCell>
                ))}
              {showCRUD && (
                <StyledTableCell align='right'>Actions</StyledTableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRows
              visibleData={visibleData}
              columns={columns}
              visibleColumns={visibleColumns}
              showCRUD={showCRUD}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={pageSizeOptions}
        component='div'
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  )
}
