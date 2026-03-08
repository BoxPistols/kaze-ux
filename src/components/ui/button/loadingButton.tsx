// src/components/ui/button/loadingButton.tsx
// カスタムLoadingButtonコンポーネント
import {
  LoadingButton as MuiLoadingButton,
  type LoadingButtonProps as MuiLoadingButtonProps,
} from '@mui/lab'
import { type SxProps, type Theme } from '@mui/material'
import { forwardRef, type ReactNode } from 'react'

import {
  BUTTON_BORDER_RADIUS,
  BUTTON_FONT_SIZE,
  BUTTON_MIN_HEIGHT,
  BUTTON_MIN_WIDTH,
  BUTTON_PADDING_X,
  BUTTON_PADDING_Y,
  BUTTON_TRANSITION,
  LOADING_INDICATOR_SIZE,
} from './constants'

export interface LoadingButtonProps extends Omit<
  MuiLoadingButtonProps,
  'loadingIndicator'
> {
  /** ローディング中に表示するテキスト */
  loadingText?: string
  /** ローディングインジケーターのカスタム要素 */
  loadingIndicator?: ReactNode
  /** 成功状態 */
  success?: boolean
  /** 成功時のテキスト */
  successText?: string
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

/**
 * カスタムLoadingButtonコンポーネント
 * ローディング状態を持つボタン
 *
 * @example
 * ```tsx
 * import { LoadingButton } from '@/components/ui/button'
 * import SaveIcon from '@mui/icons-material/Save'
 *
 * // 基本的な使用
 * <LoadingButton
 *   loading={isSubmitting}
 *   onClick={handleSubmit}
 * >
 *   保存
 * </LoadingButton>
 *
 * // ローディングテキスト付き
 * <LoadingButton
 *   loading={isSubmitting}
 *   loadingText="保存中..."
 *   loadingPosition="start"
 *   startIcon={<SaveIcon />}
 *   onClick={handleSubmit}
 * >
 *   保存
 * </LoadingButton>
 *
 * // 成功状態
 * <LoadingButton
 *   loading={isSubmitting}
 *   success={isSuccess}
 *   successText="保存完了"
 *   onClick={handleSubmit}
 * >
 *   保存
 * </LoadingButton>
 * ```
 */
export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      loading = false,
      loadingText,
      loadingIndicator,
      success = false,
      successText,
      variant = 'contained',
      color = 'primary',
      size = 'medium',
      children,
      disabled,
      sx,
      ...props
    },
    ref
  ) => {
    // 成功状態の場合は緑色に変更
    const buttonColor = success ? 'success' : color

    // 表示テキスト
    const displayText = success && successText ? successText : children

    return (
      <MuiLoadingButton
        ref={ref}
        loading={loading}
        loadingIndicator={
          loadingIndicator || (loadingText ? loadingText : undefined)
        }
        variant={variant}
        color={buttonColor}
        size={size}
        disabled={disabled || success}
        sx={{
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: BUTTON_BORDER_RADIUS,
          transition: BUTTON_TRANSITION,
          // フォントサイズ（1rem=14px基準）: small=約12px, medium=14px, large=約16px
          fontSize: BUTTON_FONT_SIZE[size],
          minWidth: BUTTON_MIN_WIDTH[size],
          // 最小ヒットターゲット24px確保
          minHeight: BUTTON_MIN_HEIGHT[size],
          py: BUTTON_PADDING_Y[size],
          px: BUTTON_PADDING_X[size],
          '& .MuiCircularProgress-root': {
            width: `${LOADING_INDICATOR_SIZE[size]}px !important`,
            height: `${LOADING_INDICATOR_SIZE[size]}px !important`,
          },
          '&.MuiLoadingButton-loading': {
            opacity: 0.8,
          },
          ...(success && {
            bgcolor: 'success.main',
            color: 'common.white',
            '&:hover': {
              bgcolor: 'success.dark',
            },
          }),
          ...sx,
        }}
        {...props}>
        {displayText}
      </MuiLoadingButton>
    )
  }
)

LoadingButton.displayName = 'LoadingButton'

export default LoadingButton
