// src/pages/ContractsPage.tsx
import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material'

// モック契約データ
const mockContracts = [
  {
    id: 'c1',
    name: '年間保守契約',
    provider: 'DJI Enterprise',
    startDate: '2026-02-01',
    endDate: '2024-12-31',
    status: '有効',
  },
  {
    id: 'c2',
    name: 'クラウドサービス契約',
    provider: 'AWS',
    startDate: '2026-02-01',
    endDate: '2024-12-31',
    status: '有効',
  },
  {
    id: 'c3',
    name: '保険契約',
    provider: '東京海上日動',
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    status: '更新待ち',
  },
]

const ContractsPage = () => {
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
        <Typography variant='h1'>契約管理</Typography>
        <Button variant='contained' startIcon={<AddIcon />}>
          契約追加
        </Button>
      </Box>

      {/* 契約一覧 */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {mockContracts.map((contract) => (
          <Card key={contract.id}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}>
                <Box>
                  <Typography variant='h3' gutterBottom>
                    {contract.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                    <Typography variant='body2' color='text.secondary'>
                      提供元: {contract.provider}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      期間: {contract.startDate} 〜 {contract.endDate}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={contract.status}
                  color={contract.status === '有効' ? 'success' : 'warning'}
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

export default ContractsPage
