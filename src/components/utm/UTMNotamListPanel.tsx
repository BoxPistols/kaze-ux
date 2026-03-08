/**
 * UTM NOTAMリスト管理パネル
 *
 * SaaS風のCRUDインターフェースを提供するNOTAM管理コンポーネント
 * - 一覧表示（Read）
 * - 新規作成（Create）
 * - 編集（Update）
 * - 削除（Delete）
 */

import AddIcon from '@mui/icons-material/Add'
import ArticleIcon from '@mui/icons-material/Article'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import ErrorIcon from '@mui/icons-material/Error'
import FilterListIcon from '@mui/icons-material/FilterList'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
  useTheme,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Divider,
  Alert,
} from '@mui/material'
import React, { useState, useCallback, useMemo } from 'react'

import type { NOTAMRequest, NOTAMStatus } from '../../types/utmTypes'

// ステータスの色
const getStatusColor = (
  status: NOTAMStatus
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'approved':
    case 'published':
      return 'success'
    case 'submitted':
    case 'processing':
    case 'pending_review':
      return 'info'
    case 'draft':
      return 'default'
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return 'error'
    default:
      return 'default'
  }
}

// ステータスラベル
const getStatusLabel = (status: NOTAMStatus): string => {
  const labels: Record<NOTAMStatus, string> = {
    draft: '下書き',
    pending_review: 'レビュー待ち',
    submitted: '申請済み',
    processing: '処理中',
    approved: '承認済み',
    rejected: '却下',
    published: '発行済み',
    cancelled: '取り消し',
    expired: '期限切れ',
  }
  return labels[status] || status
}

// ステータスアイコン
const getStatusIcon = (status: NOTAMStatus): React.ReactNode => {
  switch (status) {
    case 'approved':
    case 'published':
      return <CheckCircleIcon fontSize='small' />
    case 'submitted':
    case 'processing':
    case 'pending_review':
      return <HourglassEmptyIcon fontSize='small' />
    case 'rejected':
    case 'cancelled':
    case 'expired':
      return <ErrorIcon fontSize='small' />
    default:
      return <ArticleIcon fontSize='small' />
  }
}

// 日時フォーマット
const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 短い日付フォーマット
const formatShortDate = (dateString: string | null): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
  })
}

// タブのフィルター値
type TabFilter = 'all' | 'active' | 'draft' | 'completed'

// Props定義
export interface UTMNotamListPanelProps {
  notamRequests: NOTAMRequest[]
  onCreateNew?: () => void
  onEdit?: (notam: NOTAMRequest) => void
  onDelete?: (notam: NOTAMRequest) => void
  onView?: (notam: NOTAMRequest) => void
  onSubmit?: (notam: NOTAMRequest) => void
  onRefresh?: () => void
  loading?: boolean
  // CRUD操作のモックハンドラー（デモ用）
  onMockCreate?: (data: Partial<NOTAMRequest>) => void
  onMockUpdate?: (id: string, data: Partial<NOTAMRequest>) => void
  onMockDelete?: (id: string) => void
}

// NOTAMフォームダイアログの状態
interface NotamFormState {
  open: boolean
  mode: 'create' | 'edit'
  data: Partial<NOTAMRequest> | null
}

export const UTMNotamListPanel = ({
  notamRequests,
  onCreateNew,
  onEdit,
  onDelete,
  onView,
  onSubmit,
  onRefresh,
  loading = false,
  onMockCreate,
  onMockUpdate,
  onMockDelete,
}: UTMNotamListPanelProps) => {
  const theme = useTheme()

  // 状態管理
  const [searchQuery, setSearchQuery] = useState('')
  const [tabFilter, setTabFilter] = useState<TabFilter>('all')
  const [statusFilter, setStatusFilter] = useState<NOTAMStatus | 'all'>('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedNotam, setSelectedNotam] = useState<NOTAMRequest | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [formState, setFormState] = useState<NotamFormState>({
    open: false,
    mode: 'create',
    data: null,
  })

  // フィルタリング
  const filteredNotams = useMemo(() => {
    let result = [...notamRequests]

    // タブフィルター
    if (tabFilter === 'active') {
      result = result.filter((n) =>
        ['submitted', 'processing', 'pending_review', 'approved'].includes(
          n.status
        )
      )
    } else if (tabFilter === 'draft') {
      result = result.filter((n) => n.status === 'draft')
    } else if (tabFilter === 'completed') {
      result = result.filter((n) =>
        ['published', 'cancelled', 'expired', 'rejected'].includes(n.status)
      )
    }

    // ステータスフィルター
    if (statusFilter !== 'all') {
      result = result.filter((n) => n.status === statusFilter)
    }

    // 検索フィルター
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (n) =>
          n.location.description.toLowerCase().includes(query) ||
          n.requester.name.toLowerCase().includes(query) ||
          n.requester.organization.toLowerCase().includes(query) ||
          n.notamId?.toLowerCase().includes(query) ||
          n.reason.toLowerCase().includes(query)
      )
    }

    return result
  }, [notamRequests, tabFilter, statusFilter, searchQuery])

  // ページネーション
  const paginatedNotams = useMemo(() => {
    const start = page * rowsPerPage
    return filteredNotams.slice(start, start + rowsPerPage)
  }, [filteredNotams, page, rowsPerPage])

  // ハンドラー
  const handleMenuOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>, notam: NOTAMRequest) => {
      setAnchorEl(event.currentTarget)
      setSelectedNotam(notam)
    },
    []
  )

  const handleMenuClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleView = useCallback(() => {
    if (selectedNotam) {
      onView?.(selectedNotam)
    }
    handleMenuClose()
  }, [selectedNotam, onView, handleMenuClose])

  const handleEdit = useCallback(() => {
    if (selectedNotam) {
      if (onEdit) {
        onEdit(selectedNotam)
      } else {
        // モックの編集フォームを開く
        setFormState({
          open: true,
          mode: 'edit',
          data: selectedNotam,
        })
      }
    }
    handleMenuClose()
  }, [selectedNotam, onEdit, handleMenuClose])

  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true)
    handleMenuClose()
  }, [handleMenuClose])

  const handleDeleteConfirm = useCallback(() => {
    if (selectedNotam) {
      if (onDelete) {
        onDelete(selectedNotam)
      } else if (onMockDelete) {
        onMockDelete(selectedNotam.id)
      }
    }
    setDeleteDialogOpen(false)
    setSelectedNotam(null)
  }, [selectedNotam, onDelete, onMockDelete])

  const handleSubmit = useCallback(() => {
    if (selectedNotam) {
      onSubmit?.(selectedNotam)
    }
    handleMenuClose()
  }, [selectedNotam, onSubmit, handleMenuClose])

  const handleCreateNew = useCallback(() => {
    if (onCreateNew) {
      onCreateNew()
    } else {
      // モックの作成フォームを開く
      setFormState({
        open: true,
        mode: 'create',
        data: {
          status: 'draft',
          requester: {
            name: '',
            organization: '',
            contact: '',
          },
          location: {
            polygon: '',
            center: '',
            description: '',
          },
          time: {
            start: '',
            end: '',
            timezone: 'Asia/Tokyo',
          },
          maxAltitudeM: 150,
          reason: '',
          safetyMeasures: [],
          documents: {
            jsonData: {},
          },
          attachments: [],
        },
      })
    }
  }, [onCreateNew])

  const handleFormClose = useCallback(() => {
    setFormState({ open: false, mode: 'create', data: null })
  }, [])

  const handleFormSubmit = useCallback(() => {
    if (formState.mode === 'create' && onMockCreate && formState.data) {
      onMockCreate(formState.data)
    } else if (
      formState.mode === 'edit' &&
      onMockUpdate &&
      formState.data?.id
    ) {
      onMockUpdate(formState.data.id, formState.data)
    }
    handleFormClose()
  }, [formState, onMockCreate, onMockUpdate, handleFormClose])

  const handleFormChange = useCallback(
    (field: string, value: string | number) => {
      setFormState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          [field]: value,
        } as Partial<NOTAMRequest>,
      }))
    },
    []
  )

  const handleRequesterChange = useCallback((field: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        requester: {
          ...(prev.data?.requester || {}),
          [field]: value,
        },
      } as Partial<NOTAMRequest>,
    }))
  }, [])

  const handleLocationChange = useCallback((field: string, value: string) => {
    setFormState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        location: {
          ...(prev.data?.location || {}),
          [field]: value,
        },
      } as Partial<NOTAMRequest>,
    }))
  }, [])

  // タブの件数を計算
  const tabCounts = useMemo(() => {
    return {
      all: notamRequests.length,
      active: notamRequests.filter((n) =>
        ['submitted', 'processing', 'pending_review', 'approved'].includes(
          n.status
        )
      ).length,
      draft: notamRequests.filter((n) => n.status === 'draft').length,
      completed: notamRequests.filter((n) =>
        ['published', 'cancelled', 'expired', 'rejected'].includes(n.status)
      ).length,
    }
  }, [notamRequests])

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
        overflow: 'hidden',
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
        <Typography variant='h6' fontWeight='bold'>
          NOTAM管理
        </Typography>
        <Stack direction='row' spacing={1}>
          <Tooltip title='更新'>
            <IconButton size='small' onClick={onRefresh} disabled={loading}>
              <RefreshIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Button
            variant='contained'
            size='small'
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            disabled={loading}>
            新規作成
          </Button>
        </Stack>
      </Box>

      {/* タブフィルター */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabFilter}
          onChange={(_, value) => {
            setTabFilter(value)
            setPage(0)
          }}
          sx={{ px: 2 }}>
          <Tab
            value='all'
            label={
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <span>すべて</span>
                <Chip size='small' label={tabCounts.all} sx={{ height: 20 }} />
              </Stack>
            }
          />
          <Tab
            value='active'
            label={
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <span>進行中</span>
                <Chip
                  size='small'
                  label={tabCounts.active}
                  color='info'
                  sx={{ height: 20 }}
                />
              </Stack>
            }
          />
          <Tab
            value='draft'
            label={
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <span>下書き</span>
                <Chip
                  size='small'
                  label={tabCounts.draft}
                  sx={{ height: 20 }}
                />
              </Stack>
            }
          />
          <Tab
            value='completed'
            label={
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <span>完了</span>
                <Chip
                  size='small'
                  label={tabCounts.completed}
                  sx={{ height: 20 }}
                />
              </Stack>
            }
          />
        </Tabs>
      </Box>

      {/* 検索・フィルター */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
        <TextField
          size='small'
          placeholder='検索...'
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(0)
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon fontSize='small' />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, maxWidth: 300 }}
        />
        <FormControl size='small' sx={{ minWidth: 150 }}>
          <InputLabel>ステータス</InputLabel>
          <Select
            value={statusFilter}
            label='ステータス'
            onChange={(e) => {
              setStatusFilter(e.target.value as NOTAMStatus | 'all')
              setPage(0)
            }}
            startAdornment={<FilterListIcon fontSize='small' sx={{ mr: 1 }} />}>
            <MenuItem value='all'>すべて</MenuItem>
            <Divider />
            <MenuItem value='draft'>下書き</MenuItem>
            <MenuItem value='pending_review'>レビュー待ち</MenuItem>
            <MenuItem value='submitted'>申請済み</MenuItem>
            <MenuItem value='processing'>処理中</MenuItem>
            <MenuItem value='approved'>承認済み</MenuItem>
            <MenuItem value='published'>発行済み</MenuItem>
            <MenuItem value='rejected'>却下</MenuItem>
            <MenuItem value='cancelled'>取り消し</MenuItem>
            <MenuItem value='expired'>期限切れ</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* テーブル */}
      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>NOTAM ID</TableCell>
              <TableCell>飛行エリア</TableCell>
              <TableCell>申請者</TableCell>
              <TableCell>飛行期間</TableCell>
              <TableCell>ステータス</TableCell>
              <TableCell>更新日時</TableCell>
              <TableCell align='right'>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedNotams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align='center' sx={{ py: 4 }}>
                  <Typography color='text.secondary'>
                    {searchQuery || statusFilter !== 'all'
                      ? '該当するNOTAMが見つかりません'
                      : 'NOTAMがありません'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedNotams.map((notam) => (
                <TableRow
                  key={notam.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onView?.(notam)}>
                  <TableCell>
                    <Typography variant='body2' fontWeight='medium'>
                      {notam.notamId || '-'}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {notam.id.substring(0, 8)}...
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>
                      {notam.location.description}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {notam.location.prefecture} {notam.location.city}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>
                      {notam.requester.name}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {notam.requester.organization}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>
                      {formatShortDate(notam.time.start)} -{' '}
                      {formatShortDate(notam.time.end)}
                    </Typography>
                    {notam.time.dailySchedule && (
                      <Typography variant='caption' color='text.secondary'>
                        {notam.time.dailySchedule}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size='small'
                      icon={getStatusIcon(notam.status) as React.ReactElement}
                      label={getStatusLabel(notam.status)}
                      color={getStatusColor(notam.status)}
                      sx={{ height: 24 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant='caption' color='text.secondary'>
                      {formatDateTime(notam.updatedAt)}
                    </Typography>
                  </TableCell>
                  <TableCell align='right'>
                    <IconButton
                      size='small'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMenuOpen(e, notam)
                      }}>
                      <MoreVertIcon fontSize='small' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ページネーション */}
      <TablePagination
        component='div'
        count={filteredNotams.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10))
          setPage(0)
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage='表示件数:'
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} / ${count}件`
        }
      />

      {/* アクションメニュー */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <VisibilityIcon fontSize='small' />
          </ListItemIcon>
          <ListItemText>詳細を表示</ListItemText>
        </MenuItem>
        {selectedNotam?.status === 'draft' && (
          <MenuItem onClick={handleEdit}>
            <ListItemIcon>
              <EditIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>編集</ListItemText>
          </MenuItem>
        )}
        {selectedNotam?.status === 'draft' && onSubmit && (
          <MenuItem onClick={handleSubmit}>
            <ListItemIcon>
              <ArticleIcon fontSize='small' color='primary' />
            </ListItemIcon>
            <ListItemText>申請する</ListItemText>
          </MenuItem>
        )}
        {(selectedNotam?.status === 'draft' ||
          selectedNotam?.status === 'rejected') && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize='small' color='error' />
            </ListItemIcon>
            <ListItemText>削除</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* 削除確認ダイアログ */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>NOTAM削除の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            このNOTAMを削除してもよろしいですか？
            <br />
            <strong>{selectedNotam?.location.description}</strong>
            <br />
            この操作は取り消せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button
            onClick={handleDeleteConfirm}
            color='error'
            variant='contained'>
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 作成・編集フォームダイアログ */}
      <Dialog
        open={formState.open}
        onClose={handleFormClose}
        maxWidth='md'
        fullWidth>
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <Typography variant='h6'>
              {formState.mode === 'create' ? 'NOTAM新規作成' : 'NOTAM編集'}
            </Typography>
            <IconButton size='small' onClick={handleFormClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity='info' sx={{ mb: 3 }}>
            これはモックフォームです。実際の実装では、APIと連携して保存されます。
          </Alert>

          <Grid container spacing={3}>
            {/* 申請者情報 */}
            <Grid size={12}>
              <Typography variant='subtitle1' fontWeight='bold' gutterBottom>
                申請者情報
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='氏名'
                required
                value={formState.data?.requester?.name || ''}
                onChange={(e) => handleRequesterChange('name', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='所属組織'
                required
                value={formState.data?.requester?.organization || ''}
                onChange={(e) =>
                  handleRequesterChange('organization', e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='連絡先'
                type='email'
                required
                value={formState.data?.requester?.contact || ''}
                onChange={(e) =>
                  handleRequesterChange('contact', e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='技能証明番号'
                value={formState.data?.requester?.licenseNumber || ''}
                onChange={(e) =>
                  handleRequesterChange('licenseNumber', e.target.value)
                }
              />
            </Grid>

            {/* 飛行エリア情報 */}
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant='subtitle1'
                fontWeight='bold'
                gutterBottom
                sx={{ mt: 2 }}>
                飛行エリア情報
              </Typography>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label='飛行エリア説明'
                required
                multiline
                rows={2}
                value={formState.data?.location?.description || ''}
                onChange={(e) =>
                  handleLocationChange('description', e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='都道府県'
                value={formState.data?.location?.prefecture || ''}
                onChange={(e) =>
                  handleLocationChange('prefecture', e.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='市区町村'
                value={formState.data?.location?.city || ''}
                onChange={(e) => handleLocationChange('city', e.target.value)}
              />
            </Grid>

            {/* 飛行条件 */}
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography
                variant='subtitle1'
                fontWeight='bold'
                gutterBottom
                sx={{ mt: 2 }}>
                飛行条件
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='最大高度 (m)'
                type='number'
                required
                value={formState.data?.maxAltitudeM || ''}
                onChange={(e) =>
                  handleFormChange('maxAltitudeM', parseInt(e.target.value, 10))
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label='最低高度 (m)'
                type='number'
                value={formState.data?.minAltitudeM || ''}
                onChange={(e) =>
                  handleFormChange('minAltitudeM', parseInt(e.target.value, 10))
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                label='飛行目的'
                required
                multiline
                rows={2}
                value={formState.data?.reason || ''}
                onChange={(e) => handleFormChange('reason', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose}>キャンセル</Button>
          <Button onClick={handleFormSubmit} variant='contained'>
            {formState.mode === 'create' ? '作成' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  )
}

export default UTMNotamListPanel
