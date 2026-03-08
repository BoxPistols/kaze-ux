// src/pages/DashboardPage.tsx
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull'
import FlightIcon from '@mui/icons-material/Flight'
import FolderIcon from '@mui/icons-material/Folder'
import ScheduleIcon from '@mui/icons-material/Schedule'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import WarningIcon from '@mui/icons-material/Warning'
import {
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Typography,
} from '@mui/material'

// モックデータ
const stats = [
  {
    id: 'active-drones',
    label: '稼働中ドローン',
    value: 3,
    total: 5,
    icon: <FlightIcon />,
    color: 'success',
  },
  {
    id: 'today-flights',
    label: '本日のフライト',
    value: 7,
    unit: '件',
    icon: <ScheduleIcon />,
    color: 'primary',
  },
  {
    id: 'active-projects',
    label: '進行中プロジェクト',
    value: 4,
    unit: '件',
    icon: <FolderIcon />,
    color: 'info',
  },
  {
    id: 'alerts',
    label: 'アラート',
    value: 2,
    unit: '件',
    icon: <WarningIcon />,
    color: 'warning',
  },
]

const recentActivities = [
  {
    id: 'a1',
    type: 'flight',
    message: '東京湾岸エリア点検 - フライト完了',
    time: '10分前',
  },
  {
    id: 'a2',
    type: 'alert',
    message: 'Matrice 350 RTK #2 - バッテリー残量低下',
    time: '25分前',
  },
  {
    id: 'a3',
    type: 'sync',
    message: 'DJI FlightHub 2 - データ同期完了',
    time: '1時間前',
  },
  {
    id: 'a4',
    type: 'project',
    message: '農地モニタリング - 新規タスク追加',
    time: '2時間前',
  },
]

const droneStatus = [
  { id: 'd1', name: 'Matrice 350 RTK #1', battery: 78, status: '飛行中' },
  { id: 'd2', name: 'Matrice 30T', battery: 100, status: '待機中' },
  { id: 'd3', name: 'Matrice 350 RTK #2', battery: 45, status: '充電中' },
]

const DashboardPage = () => {
  return (
    <Box>
      {/* ページヘッダー */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h1'>ダッシュボード</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
          システム全体の状況を確認できます
        </Typography>
      </Box>

      {/* 統計カード */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 2,
          mb: 3,
        }}>
        {stats.map((stat) => (
          <Card key={stat.id}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: `${stat.color}.main`,
                    color: `${stat.color}.contrastText`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {stat.icon}
                </Box>
                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    {stat.label}
                  </Typography>
                  <Typography variant='h2'>
                    {stat.value}
                    {stat.total && (
                      <Typography
                        component='span'
                        variant='body2'
                        color='text.secondary'>
                        {' '}
                        / {stat.total}
                      </Typography>
                    )}
                    {stat.unit && (
                      <Typography
                        component='span'
                        variant='body2'
                        color='text.secondary'>
                        {' '}
                        {stat.unit}
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* メインコンテンツ */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
          gap: 2,
        }}>
        {/* 最近のアクティビティ */}
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
              }}>
              <TrendingUpIcon color='primary' />
              <Typography variant='h3'>最近のアクティビティ</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentActivities.map((activity) => (
                <Box
                  key={activity.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}>
                  <Typography variant='body2'>{activity.message}</Typography>
                  <Typography variant='caption' color='text.secondary'>
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* ドローンステータス */}
        <Card>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2,
              }}>
              <BatteryChargingFullIcon color='primary' />
              <Typography variant='h3'>ドローン状態</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {droneStatus.map((drone) => (
                <Box key={drone.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}>
                    <Typography variant='body2'>{drone.name}</Typography>
                    <Chip
                      label={drone.status}
                      size='small'
                      color={
                        drone.status === '飛行中'
                          ? 'success'
                          : drone.status === '待機中'
                            ? 'info'
                            : 'warning'
                      }
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant='determinate'
                      value={drone.battery}
                      sx={{ flex: 1, height: 6, borderRadius: 1 }}
                      color={
                        drone.battery > 50
                          ? 'success'
                          : drone.battery > 20
                            ? 'warning'
                            : 'error'
                      }
                    />
                    <Typography variant='caption' color='text.secondary'>
                      {drone.battery}%
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default DashboardPage
