// src/components/ui/dialog/formDialog.tsx
// 汎用フォームダイアログコンポーネント
import { LoadingButton } from '@mui/lab'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  type SxProps,
  type Theme,
} from '@mui/material'
import type { ReactNode } from 'react'

export interface FormDialogProps {
  /** ダイアログの開閉状態 */
  open: boolean
  /** ダイアログのタイトル */
  title: string
  /** 説明テキスト（オプション） */
  description?: string
  /** フォームコンテンツ */
  children: ReactNode
  /** 送信時のコールバック */
  onSubmit: () => void
  /** キャンセル時のコールバック */
  onCancel: () => void
  /** 送信ボタンのテキスト */
  submitText?: string
  /** キャンセルボタンのテキスト */
  cancelText?: string
  /** ローディング状態 */
  loading?: boolean
  /** 送信ボタン無効化 */
  submitDisabled?: boolean
  /** ダイアログの最大幅 */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** フルワイドス */
  fullWidth?: boolean
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

export const FormDialog = ({
  open,
  title,
  description,
  children,
  onSubmit,
  onCancel,
  submitText = '保存',
  cancelText = 'キャンセル',
  loading = false,
  submitDisabled = false,
  maxWidth = 'sm',
  fullWidth = true,
  sx,
}: FormDialogProps) => {
  const handleClose = () => {
    if (!loading) {
      onCancel()
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={sx}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {description && (
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            {description}
          </Typography>
        )}
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant='outlined' onClick={handleClose} disabled={loading}>
          {cancelText}
        </Button>
        <LoadingButton
          variant='contained'
          onClick={onSubmit}
          loading={loading}
          disabled={submitDisabled}>
          {submitText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

export default FormDialog
