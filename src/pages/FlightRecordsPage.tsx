// src/pages/FlightRecordsPage.tsx
import DownloadIcon from '@mui/icons-material/Download'
import FilterListIcon from '@mui/icons-material/FilterList'
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'

// モック飛行記録データ
const mockFlightRecords = [
  {
    id: 'f1',
    project: '東京湾岸エリア点検',
    drone: 'Matrice 350 RTK #1',
    pilot: '山田 太郎',
    date: '2025-11-27',
    duration: '45分',
    distance: '12.5km',
    status: '完了',
  },
  {
    id: 'f2',
    project: '農地モニタリング',
    drone: 'Matrice 30T',
    pilot: '佐藤 一郎',
    date: '2025-11-26',
    duration: '30分',
    distance: '8.2km',
    status: '完了',
  },
  {
    id: 'f3',
    project: '山間部測量調査',
    drone: 'Matrice 350 RTK #2',
    pilot: '鈴木 花子',
    date: '2025-11-25',
    duration: '60分',
    distance: '15.8km',
    status: '中断',
  },
  {
    id: 'f4',
    project: '都市部インフラ点検',
    drone: 'Matrice 300 RTK',
    pilot: '高橋 健一',
    date: '2025-11-24',
    duration: '90分',
    distance: '22.3km',
    status: '完了',
  },
  {
    id: 'f5',
    project: '河川監視プロジェクト',
    drone: 'Phantom 4 RTK',
    pilot: '山田 太郎',
    date: '2025-11-23',
    duration: '35分',
    distance: '6.8km',
    status: '完了',
  },
  {
    id: 'f6',
    project: '防災訓練2025',
    drone: 'Mavic 3 Enterprise',
    pilot: '伊藤 さくら',
    date: '2025-11-22',
    duration: '25分',
    distance: '4.5km',
    status: '完了',
  },
  {
    id: 'f7',
    project: '東京湾岸エリア点検',
    drone: 'Matrice 350 RTK #1',
    pilot: '佐藤 一郎',
    date: '2025-11-21',
    duration: '55分',
    distance: '14.2km',
    status: '完了',
  },
  {
    id: 'f8',
    project: '農地モニタリング',
    drone: 'Inspire 3',
    pilot: '田中 美咲',
    date: '2025-11-20',
    duration: '40分',
    distance: '9.7km',
    status: '中断',
  },
]

const FlightRecordsPage = () => {
  return (
    <Box>
      {/* ページヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}>
        <Typography variant='h1'>飛行記録</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant='outlined' startIcon={<FilterListIcon />}>
            フィルター
          </Button>
          <Button variant='outlined' startIcon={<DownloadIcon />}>
            エクスポート
          </Button>
        </Box>
      </Box>

      {/* 飛行記録一覧 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mockFlightRecords.map((record) => (
          <Card key={record.id}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                <Box>
                  <Typography variant='h3' gutterBottom>
                    {record.project}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Typography variant='body2' color='text.secondary'>
                      機体: {record.drone}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      パイロット: {record.pilot}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      日時: {record.date}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      飛行時間: {record.duration}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      飛行距離: {record.distance}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={record.status}
                  color={record.status === '完了' ? 'success' : 'warning'}
                  size='small'
                />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

export default FlightRecordsPage
