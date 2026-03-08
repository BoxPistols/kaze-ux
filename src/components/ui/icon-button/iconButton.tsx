// src/components/ui/icon-button/iconButton.tsx
// カスタムIconButtonコンポーネント
import {
  CircularProgress,
  IconButton as MuiIconButton,
  type IconButtonProps as MuiIconButtonProps,
  Tooltip,
  type SxProps,
  type Theme,
} from '@mui/material'
import { forwardRef } from 'react'

import {
  BUTTON_BORDER_RADIUS,
  BUTTON_TRANSITION,
  ICON_BUTTON_HIT_TARGET,
  ICON_BUTTON_PADDING,
  ICON_SIZE,
  LOADING_INDICATOR_SIZE,
} from '../button/constants'

export interface IconButtonProps extends Omit<
  MuiIconButtonProps,
  'color' | 'size'
> {
  /** ボタンのバリアント */
  variant?: 'default' | 'outlined' | 'filled' | 'ghost'
  /** ボタンの色 */
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success'
    | 'inherit'
  /** ボタンのサイズ */
  size?: 'small' | 'medium' | 'large'
  /** ローディング状態 */
  loading?: boolean
  /**
   * ツールチップテキスト
   * aria-labelが未指定の場合、この値がaria-labelとしても使用される
   */
  tooltip?: string
  /** ツールチップの位置 */
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right'
  /** アクティブ状態 */
  active?: boolean
  /**
   * アクセシビリティラベル（必須推奨）
   * IconButtonはアイコンのみ表示するため、スクリーンリーダー用のラベルが必要
   */
  'aria-label'?: string
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

/**
 * カスタムIconButtonコンポーネント
 * MUI IconButtonをラップし、統一的なスタイリングとバリアントを提供
 *
 * @example
 * ```tsx
 * import { IconButton } from '@/components/ui/icon-button'
 * import DeleteIcon from '@mui/icons-material/Delete'
 *
 * <IconButton
 *   variant="outlined"
 *   color="error"
 *   tooltip="削除"
 *   onClick={handleDelete}
 * >
 *   <DeleteIcon />
 * </IconButton>
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant = 'default',
      color = 'primary',
      size = 'medium',
      loading = false,
      tooltip,
      tooltipPlacement = 'top',
      active = false,
      disabled,
      children,
      sx,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    // tooltipが指定されていてaria-labelが未指定の場合、tooltipをaria-labelとして使用
    const accessibleLabel = ariaLabel || tooltip
    // サイズに応じたスタイル（定数から取得）
    const sizeStyles: Record<string, SxProps<Theme>> = {
      small: {
        minWidth: ICON_BUTTON_HIT_TARGET.small,
        minHeight: ICON_BUTTON_HIT_TARGET.small,
        p: ICON_BUTTON_PADDING.small,
        '& .MuiSvgIcon-root': { fontSize: ICON_SIZE.small },
      },
      medium: {
        minWidth: ICON_BUTTON_HIT_TARGET.medium,
        minHeight: ICON_BUTTON_HIT_TARGET.medium,
        p: ICON_BUTTON_PADDING.medium,
        '& .MuiSvgIcon-root': { fontSize: ICON_SIZE.medium },
      },
      large: {
        minWidth: ICON_BUTTON_HIT_TARGET.large,
        minHeight: ICON_BUTTON_HIT_TARGET.large,
        p: ICON_BUTTON_PADDING.large,
        '& .MuiSvgIcon-root': { fontSize: ICON_SIZE.large },
      },
    }

    // バリアントに応じたスタイル
    const getVariantStyles = (): SxProps<Theme> => {
      const colorValue = color === 'inherit' ? 'text.primary' : `${color}.main`
      const colorDark =
        color === 'inherit' ? 'action.selected' : `${color}.dark`

      switch (variant) {
        case 'outlined':
          return {
            border: 1,
            borderColor: active ? colorValue : 'divider',
            bgcolor: active ? `${color}.lighter` : 'transparent',
            color: colorValue,
            '&:hover': {
              borderColor: colorValue,
              bgcolor: 'action.hover',
            },
          }
        case 'filled':
          return {
            bgcolor: active ? colorDark : colorValue,
            color: 'common.white',
            '&:hover': {
              bgcolor: colorDark,
            },
          }
        case 'ghost':
          return {
            bgcolor: active ? 'action.selected' : 'transparent',
            color: colorValue,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }
        default:
          return {
            color: colorValue,
            bgcolor: active ? 'action.selected' : 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }
      }
    }

    const button = (
      <MuiIconButton
        ref={ref}
        disabled={disabled || loading}
        aria-label={accessibleLabel}
        sx={[
          {
            borderRadius: BUTTON_BORDER_RADIUS,
            transition: BUTTON_TRANSITION,
          },
          sizeStyles[size],
          getVariantStyles(),
          disabled && {
            opacity: 0.5,
            cursor: 'not-allowed',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}>
        {loading ? (
          <CircularProgress
            size={LOADING_INDICATOR_SIZE[size]}
            color='inherit'
          />
        ) : (
          children
        )}
      </MuiIconButton>
    )

    if (tooltip && !disabled) {
      return (
        <Tooltip title={tooltip} placement={tooltipPlacement} arrow>
          {button}
        </Tooltip>
      )
    }

    return button
  }
)

IconButton.displayName = 'IconButton'

export default IconButton
