// MUIテーブルコンポーネントを使用したプロジェクト一覧テーブルのストーリー
import GroupIcon from '@mui/icons-material/Group'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import {
  Box,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { action } from 'storybook/actions'

import { ActionMenu, type ActionMenuItem } from '@/components/ui/menu'
import { getProjectStatusColor } from '@/utils'

import type { Meta, StoryObj } from '@storybook/react-vite'

// モックデータ型定義
interface Project {
  id: string
  name: string
  status: string
  description: string
  location: string
  startDate: string
  endDate: string
  memberCount: number
  deviceCount: number
}

// モックデータ
const mockProjects: Project[] = [
  {
    id: '1',
    name: '東京湾岸エリア点検',
    status: '進行中',
    description: '東京湾岸の施設点検プロジェクト',
    location: '東京都江東区',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    memberCount: 5,
    deviceCount: 2,
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
    deviceCount: 1,
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
    deviceCount: 2,
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
    deviceCount: 3,
  },
]

// テーブルコンポーネント
interface ProjectTableProps {
  projects?: Project[]
  onRowClick?: (project: Project) => void
  onEdit?: (project: Project) => void
  onDelete?: (project: Project) => void
}

const ProjectTable = ({
  projects = mockProjects,
  onRowClick,
  onEdit,
  onDelete,
}: ProjectTableProps) => {
  const [sortField, setSortField] = useState<string>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const getActionMenuItems = (project: Project): ActionMenuItem[] => [
    {
      id: 'edit',
      label: '編集',
      onClick: () => onEdit?.(project),
    },
    {
      id: 'delete',
      label: '削除',
      onClick: () => onDelete?.(project),
      danger: true,
    },
  ]

  return (
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
            {projects.map((project) => (
              <TableRow
                key={project.id}
                sx={{ cursor: 'pointer' }}
                onClick={() => onRowClick?.(project)}>
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
                  <Typography variant='body2'>{project.deviceCount}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={project.status}
                    color={getProjectStatusColor(project.status)}
                    size='small'
                  />
                </TableCell>
                <TableCell align='right' onClick={(e) => e.stopPropagation()}>
                  <ActionMenu items={getActionMenuItems(project)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

const meta = {
  title: 'Patterns/Data Display/ProjectTable',
  component: ProjectTable,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'プロジェクト一覧を表示するテーブルコンポーネント。MUIのTableコンポーネントを使用し、ソート機能やアクションメニューを備えています。',
      },
    },
    layout: 'padded',
  },
} satisfies Meta<typeof ProjectTable>

export default meta
type Story = StoryObj<typeof meta>

// 基本的な使用例
export const Default: Story = {
  args: {
    projects: mockProjects,
    onRowClick: action('onRowClick'),
    onEdit: action('onEdit'),
    onDelete: action('onDelete'),
  },
}

// データなし
export const NoData: Story = {
  args: {
    projects: [],
  },
}
