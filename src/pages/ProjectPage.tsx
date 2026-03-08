// src/pages/ProjectPage.tsx
import AddIcon from '@mui/icons-material/Add'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import GridViewIcon from '@mui/icons-material/GridView'
import GroupIcon from '@mui/icons-material/Group'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import TableViewIcon from '@mui/icons-material/TableView'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  Tabs,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { ProjectCreateForm, type ProjectFormData } from '@/components/project'
import { FormDialog } from '@/components/ui/dialog'
import { ActionMenu, type ActionMenuItem } from '@/components/ui/menu'
import { PageHeader } from '@/components/ui/text'
import { UTMTodayScheduleSummaryCard } from '@/components/utm'
import { getProjectStatusColor } from '@/utils'

// モックデータ
const mockProjects = [
  {
    id: '1',
    name: '東京湾岸エリア点検',
    status: '進行中',
    description: '東京湾岸の施設点検プロジェクト',
    location: '東京都江東区',
    startDate: '2026-02-01',
    endDate: '2024-03-31',
    memberCount: 5,
    droneCount: 2,
  },
  {
    id: '2',
    name: '山間部測量調査',
    status: '計画中',
    description: '山間部の地形測量プロジェクト',
    location: '長野県松本市',
    startDate: '2024-02-01',
    endDate: '2024-04-30',
    memberCount: 3,
    droneCount: 1,
  },
  {
    id: '3',
    name: '農地モニタリング',
    status: '完了',
    description: '農地の定期モニタリングプロジェクト',
    location: '新潟県新潟市',
    startDate: '2023-10-01',
    endDate: '2023-12-31',
    memberCount: 4,
    droneCount: 2,
  },
  {
    id: '4',
    name: '都市部インフラ点検',
    status: '進行中',
    description: '都市インフラの点検・調査',
    location: '大阪府大阪市',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    memberCount: 8,
    droneCount: 3,
  },
]

const frequentlyUsedProjects = mockProjects.slice(0, 3)

const initialFormData: ProjectFormData = {
  name: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
}

const STORAGE_KEY_TODAY_SCHEDULE = 'projectPage-todaySchedule-expanded'
const STORAGE_KEY_FREQUENT_PROJECTS = 'projectPage-frequentProjects-expanded'

const ProjectPage = () => {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData)

  // アコーディオンの開閉状態（デフォルトは閉じた状態）
  const [isTodayScheduleExpanded, setIsTodayScheduleExpanded] = useState(false)
  const [isFrequentProjectsExpanded, setIsFrequentProjectsExpanded] =
    useState(false)

  // localStorageから開閉状態を復元
  useEffect(() => {
    try {
      const todayScheduleState = localStorage.getItem(
        STORAGE_KEY_TODAY_SCHEDULE
      )
      const frequentProjectsState = localStorage.getItem(
        STORAGE_KEY_FREQUENT_PROJECTS
      )

      if (todayScheduleState !== null) {
        setIsTodayScheduleExpanded(JSON.parse(todayScheduleState))
      }
      if (frequentProjectsState !== null) {
        setIsFrequentProjectsExpanded(JSON.parse(frequentProjectsState))
      }
    } catch (error) {
      console.warn('Failed to load accordion state from localStorage:', error)
    }
  }, [])

  // 開閉状態の変更をlocalStorageに保存
  const handleTodayScheduleChange = (_: unknown, isExpanded: boolean) => {
    setIsTodayScheduleExpanded(isExpanded)
    try {
      localStorage.setItem(
        STORAGE_KEY_TODAY_SCHEDULE,
        JSON.stringify(isExpanded)
      )
    } catch (error) {
      console.warn('Failed to save accordion state to localStorage:', error)
    }
  }

  const handleFrequentProjectsChange = (_: unknown, isExpanded: boolean) => {
    setIsFrequentProjectsExpanded(isExpanded)
    try {
      localStorage.setItem(
        STORAGE_KEY_FREQUENT_PROJECTS,
        JSON.stringify(isExpanded)
      )
    } catch (error) {
      console.warn('Failed to save accordion state to localStorage:', error)
    }
  }

  const handleCreateProject = () => {
    // TODO: API呼び出しで新規プロジェクト作成
    // await api.createProject(formData)
    setIsCreateDialogOpen(false)
    setFormData(initialFormData)
    navigate('/project/new-project')
  }

  const handleFormChange = (field: keyof ProjectFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getActionMenuItems = (projectId: string): ActionMenuItem[] => [
    {
      id: 'edit',
      label: '編集',
      onClick: () => navigate(`/project/${projectId}`),
    },
    {
      id: 'delete',
      label: '削除',
      onClick: () => {
        // TODO: 削除確認ダイアログと削除API呼び出しを実装
      },
      danger: true,
    },
  ]

  const renderTableView = () => (
    <Card sx={{ overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: '65vh' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell width='25%'>
                <TableSortLabel
                  active={sortField === 'name'}
                  direction={sortField === 'name' ? sortDirection : 'asc'}
                  onClick={() => handleSort('name')}>
                  プロジェクト名
                </TableSortLabel>
              </TableCell>
              <TableCell width='15%'>場所</TableCell>
              <TableCell width='12%'>
                <TableSortLabel
                  active={sortField === 'startDate'}
                  direction={sortField === 'startDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('startDate')}>
                  開始日
                </TableSortLabel>
              </TableCell>
              <TableCell width='12%'>
                <TableSortLabel
                  active={sortField === 'endDate'}
                  direction={sortField === 'endDate' ? sortDirection : 'asc'}
                  onClick={() => handleSort('endDate')}>
                  終了日
                </TableSortLabel>
              </TableCell>
              <TableCell width='10%'>メンバー</TableCell>
              <TableCell width='10%'>機体</TableCell>
              <TableCell width='8%'>ステータス</TableCell>
              <TableCell align='right' width='8%'>
                アクション
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockProjects.map((project) => (
              <TableRow
                key={project.id}
                sx={{ cursor: 'pointer' }}
                onClick={() => navigate(`/project/${project.id}`)}>
                <TableCell>
                  <Box>
                    <Typography variant='body2' fontWeight='medium'>
                      {project.name}
                    </Typography>
                    <Typography
                      variant='body2'
                      color='text.secondary'
                      sx={{ mt: 0.5 }}>
                      {project.description}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                    <Typography variant='body2'>{project.location}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{project.startDate}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{project.endDate}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant='body2'>
                      {project.memberCount}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{project.droneCount}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={project.status}
                    color={getProjectStatusColor(project.status)}
                    size='small'
                  />
                </TableCell>
                <TableCell align='right' onClick={(e) => e.stopPropagation()}>
                  <ActionMenu items={getActionMenuItems(project.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )

  const renderGridView = () => (
    <Box sx={{ height: '100%', overflowY: 'auto' }}>
      <Grid container spacing={3}>
        {mockProjects.map((project) => (
          <Grid size={4} key={project.id}>
            <Card
              elevation={1}
              sx={{
                cursor: 'pointer',
                '&:hover': { boxShadow: 2 },
                transition: 'box-shadow 0.2s',
              }}
              onClick={() => navigate(`/project/${project.id}`)}>
              {/* 画像エリア（プレースホルダー） */}
              <Box
                sx={{
                  height: 180,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Typography variant='body2' color='text.secondary'>
                  Map Preview
                </Typography>
              </Box>

              <CardHeader
                sx={{ pb: 1 }}
                title={
                  <Typography variant='h6' sx={{ fontSize: '1rem' }}>
                    {project.name}
                  </Typography>
                }
                action={
                  <Box onClick={(e) => e.stopPropagation()}>
                    <ActionMenu items={getActionMenuItems(project.id)} />
                  </Box>
                }
              />

              <CardContent sx={{ pt: 0 }}>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mb: 2, lineHeight: 1.4 }}>
                  {project.description}
                </Typography>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: 2,
                    mb: 2,
                  }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                    <Typography variant='body2'>{project.startDate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                    <Typography variant='body2'>{project.endDate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOnIcon
                      sx={{ fontSize: 16, color: 'text.secondary' }}
                    />
                    <Typography variant='body2'>{project.location}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant='body2'>
                      {project.memberCount}人
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  label={project.status}
                  color={getProjectStatusColor(project.status)}
                  size='small'
                />
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
        <PageHeader title='ホーム' subtitle='プロジェクトを管理できます' />
        <Button
          variant='contained'
          startIcon={<AddIcon />}
          onClick={() => setIsCreateDialogOpen(true)}>
          新規プロジェクト
        </Button>
      </Box>

      {/* 新規プロジェクト作成ダイアログ */}
      <FormDialog
        open={isCreateDialogOpen}
        onCancel={() => setIsCreateDialogOpen(false)}
        title='新規プロジェクト作成'
        onSubmit={handleCreateProject}
        submitText='作成'
        maxWidth='sm'>
        <ProjectCreateForm formData={formData} onChange={handleFormChange} />
      </FormDialog>

      {/* 今日の予定 */}
      <Box sx={{ mb: 4 }}>
        <Accordion
          expanded={isTodayScheduleExpanded}
          onChange={handleTodayScheduleChange}
          sx={{
            boxShadow: 'none',
            '&:before': { display: 'none' },
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            '&.Mui-expanded': {
              margin: 0,
            },
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: 48,
              '&.Mui-expanded': {
                minHeight: 48,
              },
              '& .MuiAccordionSummary-content': {
                margin: '12px 0',
                '&.Mui-expanded': {
                  margin: '12px 0',
                },
              },
            }}>
            <Typography variant='h6' fontWeight={600}>
              今日の予定
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <UTMTodayScheduleSummaryCard />
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* メインコンテンツ */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* よく使うプロジェクト */}
        <Box>
          <Accordion
            expanded={isFrequentProjectsExpanded}
            onChange={handleFrequentProjectsChange}
            sx={{
              boxShadow: 'none',
              '&:before': { display: 'none' },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              '&.Mui-expanded': {
                margin: 0,
              },
            }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                minHeight: 48,
                '&.Mui-expanded': {
                  minHeight: 48,
                },
                '& .MuiAccordionSummary-content': {
                  margin: '12px 0',
                  '&.Mui-expanded': {
                    margin: '12px 0',
                  },
                },
              }}>
              <Typography variant='h6' fontWeight={600}>
                よく使うプロジェクト
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Box sx={{ display: 'flex', gap: 3, overflowX: 'auto', pb: 1 }}>
                {frequentlyUsedProjects.map((project) => (
                  <Card
                    key={project.id}
                    elevation={1}
                    sx={{
                      minWidth: 280,
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 2 },
                      transition: 'box-shadow 0.2s',
                    }}
                    onClick={() => navigate(`/project/${project.id}`)}>
                    <CardContent>
                      <Typography variant='h6' sx={{ mb: 1 }}>
                        {project.name}
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        {project.description}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* 全てのプロジェクト */}
        <Box>
          <Typography variant='h5' sx={{ mb: 3 }}>
            全てのプロジェクト
          </Typography>

          {/* フィルターとビュー切替 */}
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              justifyContent: 'space-between',
              mb: 2,
            }}>
            {/* フィルターエリア（将来実装） */}
            <Box />

            {/* ビュー切替タブ */}
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
                <Tab value='table' icon={<TableViewIcon />} label='テーブル' />
                <Tab value='grid' icon={<GridViewIcon />} label='カード' />
              </Tabs>
            </Box>
          </Box>

          {/* プロジェクトリスト */}
          <Box sx={{ mt: 4 }}>
            {viewMode === 'table' ? renderTableView() : renderGridView()}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default ProjectPage
