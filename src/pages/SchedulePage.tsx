// src/pages/SchedulePage.tsx
import AddIcon from '@mui/icons-material/Add'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EventIcon from '@mui/icons-material/Event'
import GridViewIcon from '@mui/icons-material/GridView'
import ScheduleIcon from '@mui/icons-material/Schedule'
import TableViewIcon from '@mui/icons-material/TableView'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Tabs,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import dayjs, { type Dayjs } from 'dayjs'
import { useState } from 'react'
import 'dayjs/locale/ja'

import { CustomSelect } from '@/components/Form/CustomSelect'
import { DateTimePicker } from '@/components/Form/DateTimePicker'
import {
  MiniCalendar,
  CalendarControl,
  type CalendarViewMode,
  MonthView,
  WeekView,
  DayView,
  WeekStartSelector,
} from '@/components/ui/calendar'
import { FormDialog } from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/dialog'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/menu'
import { PageHeader } from '@/components/ui/text'

dayjs.locale('ja')

// モックスケジュールデータ
const mockSchedules = [
  // 今日（2/1）の予定 - 同日複数予定のサンプル
  {
    id: '1',
    title: '朝礼・作業計画確認',
    projectName: '全プロジェクト共通',
    date: '2026-02-01',
    time: '08:00',
    duration: '1時間',
    type: '整備',
    status: '予定',
    assignee: '山田太郎',
  },
  {
    id: '2',
    title: '東京湾岸 定期点検',
    projectName: '東京湾岸エリア点検',
    date: '2026-02-01',
    time: '10:00',
    duration: '3時間',
    type: '点検',
    status: '予定',
    assignee: '山田太郎',
  },
  {
    id: '3',
    title: 'ドローン機体整備',
    projectName: '全プロジェクト共通',
    date: '2026-02-01',
    time: '14:00',
    duration: '2時間',
    type: '整備',
    status: '予定',
    assignee: '鈴木花子',
  },
  {
    id: '4',
    title: '夕方点検報告会',
    projectName: '東京湾岸エリア点検',
    date: '2026-02-01',
    time: '17:00',
    duration: '1時間',
    type: '点検',
    status: '予定',
    assignee: '高橋健一',
  },
  // 明日（2/2）- 同日複数予定
  {
    id: '5',
    title: '農地モニタリング飛行',
    projectName: '農地モニタリング',
    date: '2026-02-02',
    time: '06:00',
    duration: '4時間',
    type: '飛行',
    status: '確認中',
    assignee: '佐藤一郎',
  },
  {
    id: '6',
    title: 'データ解析・レポート作成',
    projectName: '農地モニタリング',
    date: '2026-02-02',
    time: '13:00',
    duration: '3時間',
    type: '整備',
    status: '予定',
    assignee: '佐藤一郎',
  },
  {
    id: '7',
    title: '河川監視飛行',
    projectName: '河川監視プロジェクト',
    date: '2026-02-02',
    time: '15:00',
    duration: '2時間',
    type: '飛行',
    status: '予定',
    assignee: '田中美咲',
  },
  // 2/2-3 - 日付をまたぐスケジュール（深夜作業）
  // 22:00開始 → 翌02:00終了の4時間作業を2つに分割
  {
    id: '8',
    title: '深夜インフラ点検（前半）',
    projectName: '都市部インフラ点検',
    date: '2026-02-02',
    time: '22:00',
    duration: '2時間',
    type: '点検',
    status: '予定',
    assignee: '田中美咲',
  },
  {
    id: '9',
    title: '深夜インフラ点検（後半）',
    projectName: '都市部インフラ点検',
    date: '2026-02-03',
    time: '00:00',
    duration: '2時間',
    type: '点検',
    status: '予定',
    assignee: '田中美咲',
  },
  // 2/3 昼間
  {
    id: '10',
    title: '山間部測量',
    projectName: '山間部測量調査',
    date: '2026-02-03',
    time: '09:00',
    duration: '6時間',
    type: '飛行',
    status: '予定',
    assignee: '高橋健一',
  },
  // 2/3-4 - 日付をまたぐスケジュール（終夜監視）
  // 23:00開始 → 翌03:00終了の4時間作業を2つに分割
  {
    id: '11',
    title: '終夜河川監視（前半）',
    projectName: '河川監視プロジェクト',
    date: '2026-02-03',
    time: '23:00',
    duration: '1時間',
    type: '飛行',
    status: '確認中',
    assignee: '山田太郎',
  },
  {
    id: '12',
    title: '終夜河川監視（後半）',
    projectName: '河川監視プロジェクト',
    date: '2026-02-04',
    time: '00:00',
    duration: '3時間',
    type: '飛行',
    status: '確認中',
    assignee: '山田太郎',
  },
  // 2/4 昼間
  {
    id: '13',
    title: '農地空撮',
    projectName: '農地モニタリング',
    date: '2026-02-04',
    time: '10:00',
    duration: '4時間',
    type: '飛行',
    status: '予定',
    assignee: '佐藤一郎',
  },
  // 2/5
  {
    id: '14',
    title: 'インフラ橋梁点検',
    projectName: '都市部インフラ点検',
    date: '2026-02-05',
    time: '09:00',
    duration: '5時間',
    type: '点検',
    status: '予定',
    assignee: '高橋健一',
  },
  // 2/6-7 - 日付をまたぐスケジュール（終夜作業）
  {
    id: '15',
    title: '夜間監視飛行（前半）',
    projectName: '河川監視プロジェクト',
    date: '2026-02-06',
    time: '22:00',
    duration: '2時間',
    type: '飛行',
    status: '確認中',
    assignee: '山田太郎',
  },
  {
    id: '16',
    title: '夜間監視飛行（後半）',
    projectName: '河川監視プロジェクト',
    date: '2026-02-07',
    time: '00:00',
    duration: '4時間',
    type: '飛行',
    status: '確認中',
    assignee: '山田太郎',
  },
  // 2/8 - 月次整備
  {
    id: '17',
    title: 'バッテリー交換・充電',
    projectName: '全プロジェクト共通',
    date: '2026-02-08',
    time: '09:00',
    duration: '3時間',
    type: '整備',
    status: '予定',
    assignee: '鈴木花子',
  },
  {
    id: '18',
    title: '機体定期点検',
    projectName: '全プロジェクト共通',
    date: '2026-02-08',
    time: '13:00',
    duration: '4時間',
    type: '整備',
    status: '予定',
    assignee: '鈴木花子',
  },
  // 2/16-18 - 災害対応訓練（3日間）
  {
    id: '19',
    title: '災害対応訓練（1日目）',
    projectName: '防災訓練2026',
    date: '2026-02-16',
    time: '08:00',
    duration: '8時間',
    type: '飛行',
    status: '確認中',
    assignee: '佐藤一郎',
  },
  {
    id: '20',
    title: '災害対応訓練（2日目）',
    projectName: '防災訓練2026',
    date: '2026-02-17',
    time: '08:00',
    duration: '8時間',
    type: '飛行',
    status: '確認中',
    assignee: '佐藤一郎',
  },
  {
    id: '21',
    title: '災害対応訓練（3日目）',
    projectName: '防災訓練2026',
    date: '2026-02-18',
    time: '08:00',
    duration: '6時間',
    type: '飛行',
    status: '確認中',
    assignee: '佐藤一郎',
  },
]

const typeOptions = [
  { value: '点検', label: '点検' },
  { value: '整備', label: '整備' },
  { value: '飛行', label: '飛行' },
]

const getTypeColor = (type: string) => {
  switch (type) {
    case '点検':
      return 'primary'
    case '整備':
      return 'warning'
    case '飛行':
      return 'success'
    default:
      return 'default'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case '予定':
      return 'info'
    case '確認中':
      return 'warning'
    case '完了':
      return 'success'
    default:
      return 'default'
  }
}

const SchedulePage = () => {
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'calendar'>(
    'calendar'
  )
  const [calendarViewMode, setCalendarViewMode] =
    useState<CalendarViewMode>('month')
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs())
  const [isMiniCalendarOpen, setIsMiniCalendarOpen] = useState(true)
  const [sortField, setSortField] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // テーブルフィルター・ページネーション
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // ダイアログ状態
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(
    null
  )
  const [formLoading, setFormLoading] = useState(false)

  // フォーム状態
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    startDateTime: dayjs() as Dayjs | null,
  })

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleDateNavigate = (direction: 'prev' | 'next') => {
    const unit =
      calendarViewMode === 'month'
        ? 'month'
        : calendarViewMode === 'week'
          ? 'week'
          : 'day'
    setCurrentDate(
      direction === 'prev'
        ? currentDate.subtract(1, unit)
        : currentDate.add(1, unit)
    )
  }

  const formatDateHeader = () => {
    if (calendarViewMode === 'month') {
      return currentDate.format('YYYY年 M月')
    } else if (calendarViewMode === 'week') {
      const weekStart = currentDate.startOf('week')
      const weekEnd = currentDate.endOf('week')
      return `${weekStart.format('M/D')} - ${weekEnd.format('M/D')}`
    }
    return currentDate.format('YYYY年 M月 D日 (ddd)')
  }

  const handleOpenCreateDialog = () => {
    setFormData({ title: '', type: '', startDateTime: dayjs() })
    setSelectedScheduleId(null)
    setIsFormDialogOpen(true)
  }

  const handleOpenEditDialog = (scheduleId: string) => {
    const schedule = mockSchedules.find((s) => s.id === scheduleId)
    if (schedule) {
      setFormData({
        title: schedule.title,
        type: schedule.type,
        startDateTime: dayjs(`${schedule.date} ${schedule.time}`),
      })
      setSelectedScheduleId(scheduleId)
      setIsFormDialogOpen(true)
    }
  }

  const handleOpenDeleteDialog = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId)
    setIsDeleteDialogOpen(true)
  }

  const handleFormSubmit = async () => {
    setFormLoading(true)
    // 模擬API呼び出し
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setFormLoading(false)
    setIsFormDialogOpen(false)
  }

  const handleDelete = async () => {
    setFormLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setFormLoading(false)
    setIsDeleteDialogOpen(false)
  }

  const getActionMenuItems = (scheduleId: string): ActionMenuItem[] => [
    {
      id: 'edit',
      label: '編集',
      onClick: () => handleOpenEditDialog(scheduleId),
    },
    {
      id: 'duplicate',
      label: '複製',
      // TODO: 複製機能は別途実装する
      onClick: () => undefined,
    },
    {
      id: 'delete',
      label: '削除',
      onClick: () => handleOpenDeleteDialog(scheduleId),
      danger: true,
    },
  ]

  // カレンダービュー用のスケジュールデータを変換
  const calendarSchedules = mockSchedules.map((s) => ({
    id: s.id,
    title: s.title,
    date: s.date,
    time: s.time,
    duration: s.duration,
    type: s.type,
    assignee: s.assignee,
  }))

  const handleScheduleClick = (schedule: { id: string }) => {
    handleOpenEditDialog(schedule.id)
  }

  // フィルター・ソート・ページネーション処理
  const getFilteredAndSortedSchedules = () => {
    let filtered = [...mockSchedules]

    // フィルター適用
    if (filterType !== 'all') {
      filtered = filtered.filter((s) => s.type === filterType)
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter((s) => s.status === filterStatus)
    }

    // ソート適用
    filtered.sort((a, b) => {
      let aValue: string | number = ''
      let bValue: string | number = ''

      switch (sortField) {
        case 'title':
          aValue = a.title
          bValue = b.title
          break
        case 'date':
          aValue = `${a.date} ${a.time}`
          bValue = `${b.date} ${b.time}`
          break
        default:
          return 0
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })

    return filtered
  }

  const filteredSchedules = getFilteredAndSortedSchedules()
  const paginatedSchedules = filteredSchedules.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const renderCalendarView = () => (
    <Grid
      container
      spacing={3}
      alignItems='stretch'
      sx={{ height: 'calc(100vh - 240px)' }}>
      {/* サイドバー */}
      <Grid size={{ xs: 12, md: isMiniCalendarOpen ? 3 : 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            height: '100%',
          }}>
          <Card
            sx={{
              width: isMiniCalendarOpen ? '100%' : 64,
              transition: 'width 200ms ease',
              overflow: 'hidden',
            }}>
            <CardContent sx={{ p: isMiniCalendarOpen ? 2 : 1 }}>
              <MiniCalendar
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                showToggle
                open={isMiniCalendarOpen}
                onOpenChange={setIsMiniCalendarOpen}
                title='ミニカレンダー'
              />
            </CardContent>
          </Card>
          {/* 週開始曜日設定 */}
          {isMiniCalendarOpen && (
            <Card>
              <CardContent sx={{ p: 2 }}>
                <WeekStartSelector compact />
              </CardContent>
            </Card>
          )}
        </Box>
      </Grid>

      {/* メインカレンダー */}
      <Grid size={{ xs: 12, md: isMiniCalendarOpen ? 9 : 11 }}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2 }}>
            <CalendarControl
              viewMode={calendarViewMode}
              onViewModeChange={setCalendarViewMode}
              dateHeaderText={formatDateHeader()}
              onPrev={() => handleDateNavigate('prev')}
              onNext={() => handleDateNavigate('next')}
              onTodayClick={() => setCurrentDate(dayjs())}
            />
            {/* カレンダー本体 */}
            <Box
              sx={{
                mt: 2,
                flex: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}>
              {calendarViewMode === 'month' && (
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <MonthView
                    currentDate={currentDate}
                    schedules={calendarSchedules}
                    onDateClick={setCurrentDate}
                    onScheduleClick={handleScheduleClick}
                  />
                </Box>
              )}
              {calendarViewMode === 'week' && (
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <WeekView
                    currentDate={currentDate}
                    schedules={calendarSchedules}
                    onScheduleClick={handleScheduleClick}
                  />
                </Box>
              )}
              {calendarViewMode === 'day' && (
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                  <DayView
                    currentDate={currentDate}
                    schedules={calendarSchedules}
                    onScheduleClick={handleScheduleClick}
                  />
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )

  const renderTableView = () => (
    <Card sx={{ overflow: 'hidden' }}>
      {/* フィルターエリア */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          gap: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}>
        <FormControl size='small' sx={{ minWidth: 120 }}>
          <InputLabel>種別</InputLabel>
          <Select
            value={filterType}
            label='種別'
            onChange={(e) => {
              setFilterType(e.target.value)
              setPage(0)
            }}>
            <MenuItem value='all'>すべて</MenuItem>
            <MenuItem value='点検'>点検</MenuItem>
            <MenuItem value='整備'>整備</MenuItem>
            <MenuItem value='飛行'>飛行</MenuItem>
          </Select>
        </FormControl>
        <FormControl size='small' sx={{ minWidth: 120 }}>
          <InputLabel>ステータス</InputLabel>
          <Select
            value={filterStatus}
            label='ステータス'
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setPage(0)
            }}>
            <MenuItem value='all'>すべて</MenuItem>
            <MenuItem value='予定'>予定</MenuItem>
            <MenuItem value='確認中'>確認中</MenuItem>
            <MenuItem value='完了'>完了</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ flex: 1 }} />
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ display: 'flex', alignItems: 'center' }}>
          {filteredSchedules.length}件のスケジュール
        </Typography>
      </Box>

      {/* テーブル */}
      <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width='20%'>
                <TableSortLabel
                  active={sortField === 'title'}
                  direction={sortField === 'title' ? sortDirection : 'asc'}
                  onClick={() => handleSort('title')}>
                  タイトル
                </TableSortLabel>
              </TableCell>
              <TableCell width='15%'>プロジェクト</TableCell>
              <TableCell width='12%'>
                <TableSortLabel
                  active={sortField === 'date'}
                  direction={sortField === 'date' ? sortDirection : 'asc'}
                  onClick={() => handleSort('date')}>
                  日付
                </TableSortLabel>
              </TableCell>
              <TableCell width='10%'>時間</TableCell>
              <TableCell width='10%'>所要時間</TableCell>
              <TableCell width='8%'>種別</TableCell>
              <TableCell width='8%'>ステータス</TableCell>
              <TableCell width='10%'>担当者</TableCell>
              <TableCell align='right' width='7%'>
                アクション
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSchedules.map((schedule) => (
              <TableRow key={schedule.id} sx={{ cursor: 'pointer' }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant='body2' fontWeight='medium'>
                      {schedule.title}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' color='text.secondary'>
                    {schedule.projectName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon
                      sx={{ fontSize: 14, color: 'text.secondary' }}
                    />
                    <Typography variant='body2'>{schedule.date}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <ScheduleIcon
                      sx={{ fontSize: 14, color: 'text.secondary' }}
                    />
                    <Typography variant='body2'>{schedule.time}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{schedule.duration}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={schedule.type}
                    color={getTypeColor(schedule.type)}
                    size='small'
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={schedule.status}
                    color={getStatusColor(schedule.status)}
                    size='small'
                    variant='outlined'
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{schedule.assignee}</Typography>
                </TableCell>
                <TableCell align='right' onClick={(e) => e.stopPropagation()}>
                  <ActionMenu items={getActionMenuItems(schedule.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ページネーション */}
      <TablePagination
        component='div'
        count={filteredSchedules.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[10, 25, 50, 100]}
        labelRowsPerPage='表示件数:'
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} / ${count}件`
        }
      />
    </Card>
  )

  const renderCardView = () => (
    <Box sx={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
      <Grid container spacing={3}>
        {filteredSchedules.map((schedule) => (
          <Grid size={4} key={schedule.id}>
            <Card
              elevation={1}
              sx={{
                cursor: 'pointer',
                '&:hover': { boxShadow: 2 },
                transition: 'box-shadow 0.2s',
              }}>
              <CardHeader
                sx={{ pb: 1 }}
                title={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EventIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Typography variant='h6' sx={{ fontSize: '1rem' }}>
                      {schedule.title}
                    </Typography>
                  </Box>
                }
                action={
                  <Box onClick={(e) => e.stopPropagation()}>
                    <ActionMenu items={getActionMenuItems(schedule.id)} />
                  </Box>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2 }}>
                  {schedule.projectName}
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 2,
                    mb: 2,
                  }}>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      日付
                    </Typography>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarTodayIcon
                        sx={{ fontSize: 14, color: 'text.secondary' }}
                      />
                      <Typography variant='body2'>{schedule.date}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      時間
                    </Typography>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ScheduleIcon
                        sx={{ fontSize: 14, color: 'text.secondary' }}
                      />
                      <Typography variant='body2'>{schedule.time}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      所要時間
                    </Typography>
                    <Typography variant='body2'>{schedule.duration}</Typography>
                  </Box>
                  <Box>
                    <Typography variant='body2' color='text.secondary'>
                      担当者
                    </Typography>
                    <Typography variant='body2'>{schedule.assignee}</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={schedule.type}
                    color={getTypeColor(schedule.type)}
                    size='small'
                  />
                  <Chip
                    label={schedule.status}
                    color={getStatusColor(schedule.status)}
                    size='small'
                    variant='outlined'
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )

  return (
    <Box>
      {/* ページヘッダー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <PageHeader
          title='スケジュール'
          subtitle='飛行計画と作業予定を管理します'
        />
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={handleOpenCreateDialog}>
          新規スケジュール
        </Button>
      </Box>

      {/* メインコンテンツ */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* ビュー切替 */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tabs
            value={viewMode}
            onChange={(_, value) => setViewMode(value)}
            sx={{
              minHeight: 'auto',
              '& .MuiTab-root': {
                minHeight: 'auto',
                py: 1.5,
                px: 2,
                minWidth: 'auto',
              },
            }}>
            <Tab
              value='calendar'
              icon={<CalendarMonthIcon />}
              label='カレンダー'
            />
            <Tab value='table' icon={<TableViewIcon />} label='テーブル' />
            <Tab value='card' icon={<GridViewIcon />} label='カード' />
          </Tabs>
        </Box>

        {/* スケジュール一覧 */}
        <Box>
          {viewMode === 'calendar' && renderCalendarView()}
          {viewMode === 'table' && renderTableView()}
          {viewMode === 'card' && renderCardView()}
        </Box>
      </Box>

      {/* 新規作成/編集ダイアログ */}
      <FormDialog
        open={isFormDialogOpen}
        title={selectedScheduleId ? 'スケジュール編集' : '新規スケジュール'}
        description='スケジュールの詳細を入力してください'
        onSubmit={handleFormSubmit}
        onCancel={() => setIsFormDialogOpen(false)}
        submitText={selectedScheduleId ? '更新' : '作成'}
        loading={formLoading}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <TextField
            label='タイトル'
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            fullWidth
            required
          />
          <CustomSelect
            label='種別'
            options={typeOptions}
            value={formData.type}
            onChange={(value) =>
              setFormData({ ...formData, type: String(value) })
            }
          />
          <DateTimePicker
            label='開始日時'
            value={formData.startDateTime}
            onChange={(value) =>
              setFormData({ ...formData, startDateTime: value })
            }
            format='YYYY/MM/DD HH:mm'
          />
        </Box>
      </FormDialog>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        title='スケジュールの削除'
        message='このスケジュールを削除してもよろしいですか？この操作は取り消せません。'
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
        confirmText='削除'
        confirmColor='error'
        loading={formLoading}
      />
    </Box>
  )
}

export default SchedulePage
