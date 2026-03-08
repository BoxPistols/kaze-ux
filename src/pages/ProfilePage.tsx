// src/pages/ProfilePage.tsx
import EditIcon from '@mui/icons-material/Edit'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Typography,
} from '@mui/material'

// モックプロフィールデータ
const mockProfile = {
  name: '山田 太郎',
  email: 'yamada@example.com',
  role: '管理者',
  department: 'ドローン運用部',
  phone: '03-1234-5678',
  joinDate: '2022-04-01',
  certifications: [
    '第三級陸上特殊無線技士',
    'DJI認定パイロット',
    '無人航空機操縦士',
  ],
}

const ProfilePage = () => {
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
        <Typography variant='h1'>プロフィール</Typography>
        <Button variant='outlined' startIcon={<EditIcon />}>
          編集
        </Button>
      </Box>

      {/* プロフィールカード */}
      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar sx={{ width: 80, height: 80, fontSize: 32 }}>
              {mockProfile.name.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant='h2'>{mockProfile.name}</Typography>
              <Typography variant='body2' color='text.secondary'>
                {mockProfile.email}
              </Typography>
              <Chip
                label={mockProfile.role}
                color='error'
                size='small'
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                部署
              </Typography>
              <Typography variant='body1'>{mockProfile.department}</Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                電話番号
              </Typography>
              <Typography variant='body1'>{mockProfile.phone}</Typography>
            </Box>
            <Box>
              <Typography variant='caption' color='text.secondary'>
                入社日
              </Typography>
              <Typography variant='body1'>{mockProfile.joinDate}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mb: 1, display: 'block' }}>
              保有資格
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {mockProfile.certifications.map((cert) => (
                <Chip key={cert} label={cert} variant='outlined' size='small' />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ProfilePage
