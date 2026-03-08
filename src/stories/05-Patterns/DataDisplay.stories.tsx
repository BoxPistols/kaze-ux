import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * データ表示パターン。
 *
 * 検索、フィルター、テーブル、ページネーションを組み合わせた実用的なデータ一覧画面。
 */
const meta: Meta = {
  title: 'Patterns/Data Display',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'データ表示パターン。検索、フィルター、テーブル、ページネーションを組み合わせた実用的なデータ一覧レイアウト例。',
      },
    },
  },
}
export default meta

// ===========================================================================
// 共通モックデータ: デバイス一覧
// ===========================================================================

/** デバイスデータの型定義 */
interface DeviceRecord {
  id: string
  name: string
  model: string
  status: '稼働中' | '待機中' | 'メンテナンス'
  battery: number
  location: string
  lastUpdated: string
}

/** ステータスに対応するChipカラーを返す */
function getStatusColor(
  status: DeviceRecord['status']
): 'success' | 'info' | 'warning' {
  const map: Record<DeviceRecord['status'], 'success' | 'info' | 'warning'> = {
    稼働中: 'success',
    待機中: 'info',
    メンテナンス: 'warning',
  }
  return map[status]
}

/** バッテリー残量に応じたテキスト色を返す */
function getBatteryColor(battery: number): string {
  if (battery >= 70) return 'success.main'
  if (battery >= 30) return 'warning.main'
  return 'error.main'
}

/** フィルターの選択肢 */
const filterOptions = ['全て', '稼働中', '待機中', 'メンテナンス'] as const
type FilterOption = (typeof filterOptions)[number]

/** モックデータ: 8件のデバイスレコード */
const deviceRecords: DeviceRecord[] = [
  {
    id: 'DEV-001',
    name: 'センサーAlpha',
    model: 'Model X-300',
    status: '稼働中',
    battery: 82,
    location: '東京都江東区',
    lastUpdated: '2026-03-07 09:15',
  },
  {
    id: 'DEV-002',
    name: 'モニターBeta',
    model: 'Model Y-400',
    status: '待機中',
    battery: 100,
    location: '千葉県幕張',
    lastUpdated: '2026-03-07 08:45',
  },
  {
    id: 'DEV-003',
    name: 'トラッカーGamma',
    model: 'Model Z-500',
    status: 'メンテナンス',
    battery: 45,
    location: '大阪府大阪市',
    lastUpdated: '2026-03-06 17:30',
  },
  {
    id: 'DEV-004',
    name: 'サーベイヤーDelta',
    model: 'Model X-350',
    status: '稼働中',
    battery: 67,
    location: '愛知県名古屋市',
    lastUpdated: '2026-03-07 10:02',
  },
  {
    id: 'DEV-005',
    name: 'パトロールEpsilon',
    model: 'Model Y-450',
    status: '待機中',
    battery: 95,
    location: '福岡県福岡市',
    lastUpdated: '2026-03-07 07:20',
  },
  {
    id: 'DEV-006',
    name: 'スキャナーZeta',
    model: 'Model W-600',
    status: 'メンテナンス',
    battery: 12,
    location: '北海道札幌市',
    lastUpdated: '2026-03-05 14:00',
  },
  {
    id: 'DEV-007',
    name: 'レシーバーEta',
    model: 'Model X-300',
    status: '稼働中',
    battery: 74,
    location: '神奈川県横浜市',
    lastUpdated: '2026-03-07 09:50',
  },
  {
    id: 'DEV-008',
    name: 'オブザーバーTheta',
    model: 'Model Y-400',
    status: '待機中',
    battery: 88,
    location: '京都府京都市',
    lastUpdated: '2026-03-07 06:30',
  },
]

// ===========================================================================
// 共通: 検索バーとフィルターチップ
// ===========================================================================

/** 検索バーとフィルターチップのProps */
interface SearchBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  activeFilter: FilterOption
  onFilterChange: (filter: FilterOption) => void
  resultCount: number
}

/** 検索バーとフィルターチップを表示する共通コンポーネント */
function SearchBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  resultCount,
}: SearchBarProps) {
  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      {/* 検索フィールドと結果件数 */}
      <Stack
        direction='row'
        spacing={2}
        alignItems='center'
        justifyContent='space-between'>
        <TextField
          placeholder='機体名で検索...'
          size='small'
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon fontSize='small' color='action' />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 280 }}
        />
        <Stack direction='row' spacing={1} alignItems='center'>
          <Tooltip title='フィルター'>
            <IconButton size='small'>
              <FilterListIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Typography variant='body2' color='text.secondary'>
            {resultCount} 件
          </Typography>
        </Stack>
      </Stack>

      {/* フィルターチップ */}
      <Stack direction='row' spacing={1}>
        {filterOptions.map((option) => (
          <Chip
            key={option}
            label={option}
            size='small'
            variant={activeFilter === option ? 'filled' : 'outlined'}
            color={activeFilter === option ? 'primary' : 'default'}
            onClick={() => onFilterChange(option)}
            clickable
          />
        ))}
      </Stack>
    </Stack>
  )
}

// ===========================================================================
// 共通: フィルタリングロジック
// ===========================================================================

/** 検索クエリとフィルターに基づいてレコードを絞り込む */
function filterRecords(
  records: DeviceRecord[],
  searchQuery: string,
  activeFilter: FilterOption
): DeviceRecord[] {
  return records.filter((record) => {
    // 機体名による検索フィルター
    const matchesSearch =
      searchQuery === '' ||
      record.name.toLowerCase().includes(searchQuery.toLowerCase())

    // ステータスによるフィルター
    const matchesFilter =
      activeFilter === '全て' || record.status === activeFilter

    return matchesSearch && matchesFilter
  })
}

// ===========================================================================
// 1. SearchableTable - 検索可能テーブル
// ===========================================================================

const SearchableTableContent = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterOption>('全て')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  /** フィルタリング済みデータ */
  const filteredData = filterRecords(deviceRecords, searchQuery, activeFilter)

  /** ページネーション適用済みデータ */
  const visibleRows = filteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  /** ページ変更ハンドラ */
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  /** 表示件数変更ハンドラ */
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  /** 検索クエリ変更時にページをリセット */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(0)
  }

  /** フィルター変更時にページをリセット */
  const handleFilterChange = (filter: FilterOption) => {
    setActiveFilter(filter)
    setPage(0)
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
        検索可能テーブル
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        検索、ステータスフィルター、テーブル、ページネーションを組み合わせたデータ一覧。
        検索とフィルターはリアルタイムに動作する。
      </Typography>

      {/* 検索バーとフィルター */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        resultCount={filteredData.length}
      />

      {/* テーブル */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>機体名</TableCell>
              <TableCell>モデル</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell align='right'>バッテリー</TableCell>
              <TableCell>所在地</TableCell>
              <TableCell>最終更新</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length > 0 ? (
              visibleRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography
                      variant='body2'
                      sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {row.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' fontWeight={500}>
                      {row.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.model}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={getStatusColor(row.status)}
                      size='small'
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <Typography
                      variant='body2'
                      sx={{
                        color: getBatteryColor(row.battery),
                        fontWeight: 600,
                        fontFamily: 'monospace',
                      }}>
                      {row.battery}%
                    </Typography>
                  </TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>
                    <Typography variant='body2' color='text.secondary'>
                      {row.lastUpdated}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align='center' sx={{ py: 6 }}>
                  <Typography variant='body2' color='text.secondary'>
                    該当するデータがありません
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component='div'
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage='表示件数:'
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count} 件`
          }
        />
      </TableContainer>
    </Box>
  )
}

export const SearchableTable: StoryObj = {
  name: '検索可能テーブル',
  render: () => <SearchableTableContent />,
}

// ===========================================================================
// 2. CardGrid - カードグリッド表示
// ===========================================================================

const CardGridContent = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterOption>('全て')

  /** フィルタリング済みデータ */
  const filteredData = filterRecords(deviceRecords, searchQuery, activeFilter)

  /** 検索クエリ変更ハンドラ */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
  }

  /** フィルター変更ハンドラ */
  const handleFilterChange = (filter: FilterOption) => {
    setActiveFilter(filter)
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
        カードグリッド表示
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
        テーブルの代替としてカードベースでデータを表示するパターン。
        同じ検索・フィルター機能をカードグリッドと組み合わせている。
      </Typography>

      {/* 検索バーとフィルター */}
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        resultCount={filteredData.length}
      />

      {/* カードグリッド */}
      {filteredData.length > 0 ? (
        <Grid container spacing={3}>
          {filteredData.map((record) => (
            <Grid key={record.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  {/* ヘッダー: 機体名とステータス */}
                  <Stack
                    direction='row'
                    justifyContent='space-between'
                    alignItems='flex-start'
                    sx={{ mb: 2 }}>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant='subtitle1'
                        sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {record.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {record.model}
                      </Typography>
                    </Box>
                    <Chip
                      label={record.status}
                      color={getStatusColor(record.status)}
                      size='small'
                      sx={{ ml: 1, flexShrink: 0 }}
                    />
                  </Stack>

                  {/* 詳細情報 */}
                  <Stack spacing={1.5}>
                    {/* バッテリー */}
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'>
                      <Typography variant='body2' color='text.secondary'>
                        バッテリー
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          color: getBatteryColor(record.battery),
                          fontWeight: 600,
                          fontFamily: 'monospace',
                        }}>
                        {record.battery}%
                      </Typography>
                    </Stack>

                    {/* 所在地 */}
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'>
                      <Typography variant='body2' color='text.secondary'>
                        所在地
                      </Typography>
                      <Typography variant='body2' fontWeight={500}>
                        {record.location}
                      </Typography>
                    </Stack>

                    {/* ID */}
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'>
                      <Typography variant='body2' color='text.secondary'>
                        ID
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{ fontFamily: 'monospace' }}>
                        {record.id}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant='body2' color='text.secondary'>
            該当するデータがありません
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export const CardGrid: StoryObj = {
  name: 'カードグリッド表示',
  render: () => <CardGridContent />,
}
