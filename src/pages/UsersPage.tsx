// src/pages/UsersPage.tsx
import AddIcon from '@mui/icons-material/Add'
import GridViewIcon from '@mui/icons-material/GridView'
import MailOutlineIcon from '@mui/icons-material/MailOutline'
import PersonIcon from '@mui/icons-material/Person'
import TableViewIcon from '@mui/icons-material/TableView'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  styled,
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
import { useState } from 'react'

import { ActionMenu, type ActionMenuItem } from '@/components/ui/menu'
import { PageHeader } from '@/components/ui/text'

// ステータスドット
interface StatusDotProps {
  status: 'active' | 'inactive'
}

const StatusDot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'status',
})<StatusDotProps>(({ theme, status }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  backgroundColor:
    status === 'active' ? theme.palette.success.main : theme.palette.grey[400],
  flexShrink: 0,
}))

// モックユーザーデータ
const mockUsers = [
  {
    id: 'u1',
    name: '山田 太郎',
    email: 'yamada@example.com',
    role: '管理者',
    status: 'active' as const,
    lastLogin: '2025-11-28 10:30',
    projectCount: 5,
  },
  {
    id: 'u2',
    name: '鈴木 花子',
    email: 'suzuki@example.com',
    role: 'オペレーター',
    status: 'active' as const,
    lastLogin: '2025-11-27 15:45',
    projectCount: 3,
  },
  {
    id: 'u3',
    name: '佐藤 一郎',
    email: 'sato@example.com',
    role: 'パイロット',
    status: 'inactive' as const,
    lastLogin: '2025-11-15 09:00',
    projectCount: 2,
  },
  {
    id: 'u4',
    name: '田中 美咲',
    email: 'tanaka@example.com',
    role: 'ビューアー',
    status: 'active' as const,
    lastLogin: '2025-11-28 08:15',
    projectCount: 1,
  },
  {
    id: 'u5',
    name: '高橋 健一',
    email: 'takahashi@example.com',
    role: 'パイロット',
    status: 'active' as const,
    lastLogin: '2025-11-28 07:00',
    projectCount: 4,
  },
  {
    id: 'u6',
    name: '伊藤 さくら',
    email: 'ito@example.com',
    role: 'オペレーター',
    status: 'active' as const,
    lastLogin: '2025-11-26 14:20',
    projectCount: 2,
  },
  {
    id: 'u7',
    name: '渡辺 大輔',
    email: 'watanabe@example.com',
    role: '管理者',
    status: 'active' as const,
    lastLogin: '2025-11-28 09:45',
    projectCount: 8,
  },
  {
    id: 'u8',
    name: '中村 由美',
    email: 'nakamura@example.com',
    role: 'ビューアー',
    status: 'inactive' as const,
    lastLogin: '2025-10-20 11:30',
    projectCount: 1,
  },
]

const getRoleColor = (role: string) => {
  switch (role) {
    case '管理者':
      return 'error'
    case 'オペレーター':
      return 'primary'
    case 'パイロット':
      return 'success'
    default:
      return 'default'
  }
}

const getStatusLabel = (status: 'active' | 'inactive') => {
  return status === 'active' ? 'アクティブ' : '休止中'
}

const UsersPage = () => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
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

  const getActionMenuItems = (userId: string): ActionMenuItem[] => [
    {
      id: 'edit',
      label: '編集',
      onClick: () => console.log('Edit user:', userId),
    },
    {
      id: 'resetPassword',
      label: 'パスワードリセット',
      onClick: () => console.log('Reset password:', userId),
    },
    {
      id: 'delete',
      label: '削除',
      onClick: () => console.log('Delete user:', userId),
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
                  ユーザー
                </TableSortLabel>
              </TableCell>
              <TableCell width='15%'>ロール</TableCell>
              <TableCell width='10%'>ステータス</TableCell>
              <TableCell width='15%'>
                <TableSortLabel
                  active={sortField === 'lastLogin'}
                  direction={sortField === 'lastLogin' ? sortDirection : 'asc'}
                  onClick={() => handleSort('lastLogin')}>
                  最終ログイン
                </TableSortLabel>
              </TableCell>
              <TableCell width='10%'>参加プロジェクト</TableCell>
              <TableCell align='right' width='8%'>
                アクション
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id} sx={{ cursor: 'pointer' }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 36, height: 36 }}>
                      {user.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant='body2' fontWeight='medium'>
                        {user.name}
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}>
                        <MailOutlineIcon
                          sx={{ fontSize: 12, color: 'text.secondary' }}
                        />
                        <Typography variant='body2' color='text.secondary'>
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size='small'
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StatusDot status={user.status} />
                    <Typography variant='body2'>
                      {getStatusLabel(user.status)}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>{user.lastLogin}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2'>
                    {user.projectCount} プロジェクト
                  </Typography>
                </TableCell>
                <TableCell align='right' onClick={(e) => e.stopPropagation()}>
                  <ActionMenu items={getActionMenuItems(user.id)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )

  const renderCardView = () => (
    <Grid container spacing={3}>
      {mockUsers.map((user) => (
        <Grid size={4} key={user.id}>
          <Card
            elevation={1}
            sx={{
              cursor: 'pointer',
              '&:hover': { boxShadow: 2 },
              transition: 'box-shadow 0.2s',
            }}>
            <CardHeader
              sx={{ pb: 1 }}
              avatar={
                <Avatar sx={{ width: 48, height: 48 }}>
                  {user.name.charAt(0)}
                </Avatar>
              }
              title={
                <Typography variant='h6' sx={{ fontSize: '1rem' }}>
                  {user.name}
                </Typography>
              }
              subheader={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <MailOutlineIcon
                    sx={{ fontSize: 12, color: 'text.secondary' }}
                  />
                  <Typography variant='body2' color='text.secondary'>
                    {user.email}
                  </Typography>
                </Box>
              }
              action={
                <Box onClick={(e) => e.stopPropagation()}>
                  <ActionMenu items={getActionMenuItems(user.id)} />
                </Box>
              }
            />
            <CardContent sx={{ pt: 0 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 2,
                  mb: 2,
                }}>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    ロール
                  </Typography>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size='small'
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    ステータス
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      mt: 0.5,
                    }}>
                    <StatusDot status={user.status} />
                    <Typography variant='body2'>
                      {getStatusLabel(user.status)}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    最終ログイン
                  </Typography>
                  <Typography variant='body2'>{user.lastLogin}</Typography>
                </Box>
                <Box>
                  <Typography variant='body2' color='text.secondary'>
                    参加プロジェクト
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon
                      sx={{ fontSize: 14, color: 'text.secondary' }}
                    />
                    <Typography variant='body2'>
                      {user.projectCount} プロジェクト
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
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
          title='ユーザー管理'
          subtitle='チームメンバーを管理します'
        />
        <Button variant='contained' startIcon={<AddIcon />}>
          ユーザー招待
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
            <Tab value='table' icon={<TableViewIcon />} label='テーブル' />
            <Tab value='card' icon={<GridViewIcon />} label='カード' />
          </Tabs>
        </Box>

        {/* ユーザー一覧 */}
        <Box>{viewMode === 'table' ? renderTableView() : renderCardView()}</Box>
      </Box>
    </Box>
  )
}

export default UsersPage
