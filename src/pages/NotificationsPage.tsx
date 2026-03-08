// src/pages/NotificationsPage.tsx
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import InfoIcon from '@mui/icons-material/Info'
import WarningIcon from '@mui/icons-material/Warning'
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'

// モック通知データ
const mockNotifications = [
  {
    id: 'n1',
    type: 'error',
    title: 'バッテリー残量低下',
    message: 'Matrice 350 RTK #2 のバッテリー残量が20%を下回りました',
    timestamp: '2024-01-15 11:30',
    read: false,
  },
  {
    id: 'n2',
    type: 'warning',
    title: '飛行制限区域接近',
    message: '現在の飛行経路が制限区域に接近しています',
    timestamp: '2024-01-15 10:45',
    read: false,
  },
  {
    id: 'n3',
    type: 'success',
    title: 'ミッション完了',
    message: '東京湾岸エリア点検のミッションが正常に完了しました',
    timestamp: '2024-01-15 10:30',
    read: true,
  },
  {
    id: 'n4',
    type: 'info',
    title: 'システムアップデート',
    message: '新しいファームウェアバージョン v2.5.0 が利用可能です',
    timestamp: '2024-01-15 09:00',
    read: true,
  },
]

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <ErrorIcon color='error' />
    case 'warning':
      return <WarningIcon color='warning' />
    case 'success':
      return <CheckCircleIcon color='success' />
    case 'info':
    default:
      return <InfoIcon color='info' />
  }
}

const NotificationsPage = () => {
  const unreadCount = mockNotifications.filter((n) => !n.read).length

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant='h1'>通知</Typography>
          {unreadCount > 0 && (
            <Chip label={`${unreadCount}件の未読`} color='error' size='small' />
          )}
        </Box>
        <Button variant='outlined'>すべて既読にする</Button>
      </Box>

      {/* 通知一覧 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mockNotifications.map((notification) => (
          <Card
            key={notification.id}
            sx={{
              opacity: notification.read ? 0.7 : 1,
              borderLeft: notification.read ? 'none' : '4px solid',
              borderLeftColor: `${notification.type}.main`,
            }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ pt: 0.5 }}>
                  {getNotificationIcon(notification.type)}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}>
                    <Typography variant='h3'>{notification.title}</Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {notification.timestamp}
                    </Typography>
                  </Box>
                  <Typography variant='body2' color='text.secondary'>
                    {notification.message}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

export default NotificationsPage
