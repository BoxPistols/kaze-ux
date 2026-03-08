// src/components/ui/fab/fab.tsx
// FloatingActionButtonコンポーネント
import {
  CircularProgress,
  Fab as MuiFab,
  type FabProps as MuiFabProps,
  Tooltip,
  Zoom,
  type SxProps,
  type Theme,
} from '@mui/material'
import { forwardRef, type ReactNode } from 'react'

export interface FabProps extends Omit<MuiFabProps, 'children'> {
  /** アイコン */
  icon: ReactNode
  /** 拡張FABのラベル */
  label?: string
  /** ツールチップテキスト */
  tooltip?: string
  /** ツールチップの位置 */
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right'
  /** ローディング状態 */
  loading?: boolean
  /** 表示/非表示アニメーション */
  visible?: boolean
  /** 位置固定 */
  position?: 'fixed' | 'absolute' | 'relative'
  /** 配置位置 */
  placement?:
    | 'bottom-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'top-right'
    | 'top-left'
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

// 配置位置に応じたスタイル
const getPlacementStyles = (
  position: FabProps['position'],
  placement: FabProps['placement']
): SxProps<Theme> => {
  if (position === 'relative') return {}

  const basePosition = { position }
  const spacing = 24

  switch (placement) {
    case 'bottom-right':
      return { ...basePosition, bottom: spacing, right: spacing }
    case 'bottom-left':
      return { ...basePosition, bottom: spacing, left: spacing }
    case 'bottom-center':
      return {
        ...basePosition,
        bottom: spacing,
        left: '50%',
        transform: 'translateX(-50%)',
      }
    case 'top-right':
      return { ...basePosition, top: spacing, right: spacing }
    case 'top-left':
      return { ...basePosition, top: spacing, left: spacing }
    default:
      return basePosition
  }
}

/**
 * FloatingActionButton (FAB) コンポーネント
 * 主要なアクションを強調するためのフローティングボタン
 *
 * @example
 * ```tsx
 * import { Fab } from '@/components/ui/fab'
 * import AddIcon from '@mui/icons-material/Add'
 *
 * // 基本的な使用
 * <Fab
 *   icon={<AddIcon />}
 *   tooltip="新規作成"
 *   onClick={handleAdd}
 * />
 *
 * // 拡張FAB（ラベル付き）
 * <Fab
 *   icon={<AddIcon />}
 *   label="新規作成"
 *   variant="extended"
 *   onClick={handleAdd}
 * />
 *
 * // 固定位置
 * <Fab
 *   icon={<AddIcon />}
 *   tooltip="新規作成"
 *   position="fixed"
 *   placement="bottom-right"
 *   onClick={handleAdd}
 * />
 *
 * // ローディング状態
 * <Fab
 *   icon={<SyncIcon />}
 *   tooltip="同期中"
 *   loading={isSyncing}
 *   onClick={handleSync}
 * />
 * ```
 */
export const Fab = forwardRef<HTMLButtonElement, FabProps>(
  (
    {
      icon,
      label,
      tooltip,
      tooltipPlacement = 'left',
      loading = false,
      visible = true,
      position = 'relative',
      placement = 'bottom-right',
      color = 'primary',
      size = 'medium',
      variant,
      disabled,
      sx,
      ...props
    },
    ref
  ) => {
    // 拡張FABかどうか
    const isExtended = variant === 'extended' || !!label

    const fabButton = (
      <MuiFab
        ref={ref}
        color={color}
        size={size}
        variant={isExtended ? 'extended' : 'circular'}
        disabled={disabled || loading}
        sx={[
          {
            boxShadow: 3,
            transition: 'all 0.2s ease-in-out',
            // フォントサイズ: small=12px(0.86rem), medium=14px(1rem), large=16px(1.14rem)
            fontSize:
              size === 'small'
                ? '0.86rem'
                : size === 'large'
                  ? '1.14rem'
                  : '1rem',
            '& .MuiSvgIcon-root': {
              // アイコンサイズ: small=18px(1.29rem), medium=20px(1.43rem), large=24px(1.71rem)
              fontSize:
                size === 'small'
                  ? '1.29rem'
                  : size === 'large'
                    ? '1.71rem'
                    : '1.43rem',
            },
            '&:hover': {
              boxShadow: 6,
              transform: 'scale(1.05)',
            },
            '&:active': {
              boxShadow: 2,
              transform: 'scale(0.98)',
            },
          },
          isExtended && {
            gap: 0.75,
            px: 1.5,
          },
          getPlacementStyles(position, placement),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
        {...props}>
        {loading ? (
          <CircularProgress
            size={size === 'small' ? 18 : size === 'large' ? 24 : 20}
            color='inherit'
          />
        ) : (
          icon
        )}
        {isExtended && !loading && label}
      </MuiFab>
    )

    // Zoomアニメーション
    const animatedButton = (
      <Zoom in={visible} unmountOnExit>
        {fabButton}
      </Zoom>
    )

    // ツールチップ
    if (tooltip && !disabled && !isExtended) {
      return (
        <Tooltip title={tooltip} placement={tooltipPlacement} arrow>
          {visible ? animatedButton : fabButton}
        </Tooltip>
      )
    }

    return visible ? animatedButton : fabButton
  }
)

Fab.displayName = 'Fab'

export default Fab
