import { LoadingButton } from '@mui/lab'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  type SxProps,
  type Theme,
} from '@mui/material'
import type { ReactNode } from 'react'

export type ConfirmDialogProps = {
  /** ダイアログのタイトル */
  title?: string
  /** 確認メッセージ */
  message?: string
  /** 説明テキスト（オプション） */
  description?: string
  /** 開閉状態 */
  open: boolean
  /** キャンセル時のコールバック */
  onCancel: () => void
  /** 確定時のコールバック */
  onConfirm: () => void
  /** 確定ボタンのテキスト */
  confirmText?: string
  /** キャンセルボタンのテキスト */
  cancelText?: string
  /** 確定ボタンの色 */
  confirmColor?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success'
  /** 確定ボタンのバリアント */
  confirmVariant?: 'text' | 'outlined' | 'contained'
  /** カスタムコンテンツ */
  children?: ReactNode
  /** ローディング状態 */
  loading?: boolean
  /** 確定ボタン無効化 */
  confirmDisabled?: boolean
  /** ダイアログの最大幅 */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  /** フルワイドス */
  fullWidth?: boolean
  /** カスタムスタイル */
  sx?: SxProps<Theme>
  /** フォーカス制御を無効化 */
  disableEnforceFocus?: boolean
}

/**
 * 確認ダイアログコンポーネント
 * 削除や重要な操作の確認に使用
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   open={open}
 *   title="削除の確認"
 *   message="このアイテムを削除しますか？"
 *   confirmText="削除"
 *   confirmColor="error"
 *   onConfirm={handleDelete}
 *   onCancel={handleClose}
 * />
 * ```
 */
export const ConfirmDialog = ({
  title,
  message,
  description,
  open,
  onCancel,
  onConfirm,
  confirmText = '実行',
  cancelText = 'キャンセル',
  confirmColor = 'primary',
  confirmVariant = 'contained',
  children,
  loading = false,
  confirmDisabled = false,
  maxWidth = 'xs',
  fullWidth = true,
  sx,
  disableEnforceFocus = false,
}: ConfirmDialogProps) => {
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
      disableEnforceFocus={disableEnforceFocus}
      sx={sx}
      aria-labelledby={title ? 'confirm-dialog-title' : undefined}
      aria-describedby={
        message || description ? 'confirm-dialog-description' : undefined
      }>
      {title && <DialogTitle id='confirm-dialog-title'>{title}</DialogTitle>}
      <DialogContent>
        {(message || description) && (
          <DialogContentText
            id='confirm-dialog-description'
            sx={{ mb: children ? 2 : 0 }}>
            {message || description}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant='outlined' onClick={handleClose} disabled={loading}>
          {cancelText}
        </Button>
        <LoadingButton
          variant={confirmVariant}
          color={confirmColor}
          onClick={onConfirm}
          loading={loading}
          disabled={confirmDisabled}>
          {confirmText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
