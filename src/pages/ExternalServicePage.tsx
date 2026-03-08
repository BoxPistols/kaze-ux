// src/pages/ExternalServicePage.tsx
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import SyncIcon from '@mui/icons-material/Sync'
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'

// モック外部サービスデータ
const mockServices = [
  {
    id: 's1',
    name: 'DIPS (ドローン情報基盤システム)',
    description: '国土交通省のドローン飛行管理システム',
    status: '接続済み',
    lastSync: '2024-01-15 10:30',
  },
  {
    id: 's2',
    name: 'DJI FlightHub 2',
    description: 'DJI機体管理・フリート管理システム',
    status: '接続済み',
    lastSync: '2024-01-15 09:45',
  },
  {
    id: 's3',
    name: 'AntMedia',
    description: 'ライブストリーミングサービス',
    status: '未接続',
    lastSync: '-',
  },
  {
    id: 's4',
    name: 'AWS S3',
    description: 'クラウドストレージサービス',
    status: '接続済み',
    lastSync: '2024-01-15 11:00',
  },
]

const ExternalServicePage = () => {
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
        <Typography variant='h1'>外部サービス連携</Typography>
        <Button variant='outlined' startIcon={<SyncIcon />}>
          全サービス同期
        </Button>
      </Box>

      {/* サービス一覧 */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: 2,
        }}>
        {mockServices.map((service) => (
          <Card key={service.id}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 2,
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {service.status === '接続済み' ? (
                    <CheckCircleIcon color='success' />
                  ) : (
                    <ErrorIcon color='error' />
                  )}
                  <Typography variant='h3'>{service.name}</Typography>
                </Box>
                <Chip
                  label={service.status}
                  color={service.status === '接続済み' ? 'success' : 'error'}
                  size='small'
                />
              </Box>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                {service.description}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <Typography variant='caption' color='text.secondary'>
                  最終同期: {service.lastSync}
                </Typography>
                <Button size='small' startIcon={<SyncIcon />}>
                  同期
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

export default ExternalServicePage
