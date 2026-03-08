// src/components/Form/RegisterForm/index.tsx
// sdpf-frontend-nextに準拠した登録フォームテンプレート
import {
  Box,
  Button,
  Divider,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export interface RegisterFormProps {
  /** フォームタイトル */
  title: string
  /** 送信時のコールバック */
  handleSubmit: () => void
  /** フォームコンテンツ */
  children: ReactNode
  /** 送信ボタン無効化 */
  disabled?: boolean
  /** 送信ボタンテキスト（デフォルト: 登録） */
  submitButtonText?: string
  /** キャンセルボタンテキスト（デフォルト: キャンセル） */
  cancelButtonText?: string
  /** カスタム戻る処理（指定しない場合はhistory.back()） */
  onCancel?: () => void
  /** コンテナのカスタムスタイル */
  sx?: SxProps<Theme>
  /** 送信中状態 */
  loading?: boolean
}

export const RegisterForm = ({
  title,
  handleSubmit,
  children,
  disabled = false,
  submitButtonText = '登録',
  cancelButtonText = 'キャンセル',
  onCancel,
  sx,
  loading = false,
}: RegisterFormProps) => {
  const navigate = useNavigate()

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      navigate(-1)
    }
  }

  return (
    <Box sx={sx}>
      {/* タイトル部分 */}
      <Box
        sx={{
          mx: { xs: 4, sm: 8, md: 12 },
          mt: { xs: 8, sm: 12, md: 20 },
          mb: 4,
        }}>
        <Typography component='h1' variant='h5' fontWeight={600}>
          {title}
        </Typography>
      </Box>

      <Divider />

      {/* フォームコンテンツ */}
      <Box
        component='div'
        sx={{
          mx: { xs: 4, sm: 8, md: 12 },
          my: { xs: 4, sm: 6, md: 8 },
        }}>
        {children}
      </Box>

      {/* アクションボタン */}
      <Box
        sx={{
          mr: { xs: 4, sm: 8, md: 12 },
          my: 4,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          pb: { xs: 4, sm: 8, md: 12 },
        }}>
        <Button variant='outlined' onClick={handleCancel} disabled={loading}>
          {cancelButtonText}
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={disabled || loading}>
          {loading ? '処理中...' : submitButtonText}
        </Button>
      </Box>
    </Box>
  )
}

export default RegisterForm
