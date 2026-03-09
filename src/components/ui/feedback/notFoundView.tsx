// src/components/ui/feedback/notFoundView.tsx
import { Home, ArrowBack } from '@mui/icons-material'
import {
  Box,
  Container,
  Typography,
  Button,
  type SxProps,
  type Theme,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'

export interface NotFoundViewProps {
  /** ホームへのパス */
  homePath?: string
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

export const NotFoundView = ({ homePath = '/', sx }: NotFoundViewProps) => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate(homePath)
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  return (
    <Container
      maxWidth='md'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        ...sx,
      }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant='h1'
          sx={{
            fontSize: { xs: '4rem', md: '6rem' },
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2,
          }}>
          404
        </Typography>
        <Typography
          variant='h4'
          sx={{
            mb: 2,
            color: 'text.primary',
            fontWeight: 500,
          }}>
          ページが見つかりません
        </Typography>
        <Typography
          variant='body1'
          sx={{
            mb: 4,
            color: 'text.secondary',
            maxWidth: 500,
          }}>
          お探しのページは存在しないか、移動された可能性があります。
          URLをご確認いただくか、ホームページに戻ってください。
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          width: { xs: '100%', sm: 'auto' },
        }}>
        <Button
          variant='outlined'
          size='large'
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
          }}>
          前のページに戻る
        </Button>
        <Button
          variant='contained'
          size='large'
          startIcon={<Home />}
          onClick={handleGoHome}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
          }}>
          ホームに戻る
        </Button>
      </Box>
    </Container>
  )
}

export default NotFoundView
