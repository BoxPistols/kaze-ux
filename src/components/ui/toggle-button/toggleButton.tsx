// src/components/ui/toggle-button/toggleButton.tsx
// カスタムToggleButtonコンポーネント
import {
  ToggleButton as MuiToggleButton,
  type ToggleButtonProps as MuiToggleButtonProps,
  ToggleButtonGroup as MuiToggleButtonGroup,
  type ToggleButtonGroupProps as MuiToggleButtonGroupProps,
  Tooltip,
  type SxProps,
  type Theme,
} from '@mui/material'
import { forwardRef, type ReactNode } from 'react'

// ToggleButton Props
export interface ToggleButtonProps extends Omit<MuiToggleButtonProps, 'color'> {
  /** ボタンの色 */
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success'
    | 'standard'
  /** ツールチップテキスト */
  tooltip?: string
  /** ツールチップの位置 */
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right'
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

/**
 * カスタムToggleButtonコンポーネント
 * オン/オフの切り替えに使用
 *
 * @example
 * ```tsx
 * import { ToggleButton } from '@/components/ui/toggle-button'
 * import FormatBoldIcon from '@mui/icons-material/FormatBold'
 *
 * <ToggleButton
 *   value="bold"
 *   selected={isBold}
 *   onChange={handleBoldToggle}
 *   tooltip="太字"
 * >
 *   <FormatBoldIcon />
 * </ToggleButton>
 * ```
 */
export const ToggleButton = forwardRef<HTMLButtonElement, ToggleButtonProps>(
  (
    {
      color = 'primary',
      tooltip,
      tooltipPlacement = 'top',
      children,
      sx,
      ...props
    },
    ref
  ) => {
    const button = (
      <MuiToggleButton
        ref={ref}
        color={color}
        sx={{
          textTransform: 'none',
          borderRadius: 1.5,
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            fontWeight: 600,
          },
          ...sx,
        }}
        {...props}>
        {children}
      </MuiToggleButton>
    )

    if (tooltip) {
      return (
        <Tooltip title={tooltip} placement={tooltipPlacement} arrow>
          {button}
        </Tooltip>
      )
    }

    return button
  }
)

ToggleButton.displayName = 'ToggleButton'

// ToggleButtonGroup Option
export interface ToggleButtonOption {
  /** オプションの値 */
  value: string
  /** 表示ラベル */
  label?: string
  /** アイコン */
  icon?: ReactNode
  /** ツールチップ */
  tooltip?: string
  /** 無効化 */
  disabled?: boolean
}

// ToggleButtonGroup Props
export interface ToggleButtonGroupProps extends Omit<
  MuiToggleButtonGroupProps,
  'onChange' | 'children'
> {
  /** オプション配列 */
  options: ToggleButtonOption[]
  /** 選択された値 */
  value?: string | string[] | null
  /** 値変更時のコールバック */
  onChange?: (value: string | string[] | null) => void
  /** ボタンの色 */
  color?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success'
    | 'standard'
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

/**
 * カスタムToggleButtonGroupコンポーネント
 * 複数のトグルボタンをグループ化
 *
 * @example
 * ```tsx
 * import { ToggleButtonGroup } from '@/components/ui/toggle-button'
 *
 * // 排他的選択
 * <ToggleButtonGroup
 *   options={[
 *     { value: 'left', icon: <FormatAlignLeftIcon />, tooltip: '左揃え' },
 *     { value: 'center', icon: <FormatAlignCenterIcon />, tooltip: '中央揃え' },
 *     { value: 'right', icon: <FormatAlignRightIcon />, tooltip: '右揃え' },
 *   ]}
 *   value={alignment}
 *   exclusive
 *   onChange={setAlignment}
 * />
 *
 * // 複数選択
 * <ToggleButtonGroup
 *   options={[
 *     { value: 'bold', icon: <FormatBoldIcon />, tooltip: '太字' },
 *     { value: 'italic', icon: <FormatItalicIcon />, tooltip: '斜体' },
 *   ]}
 *   value={formats}
 *   onChange={setFormats}
 * />
 * ```
 */
export const ToggleButtonGroup = ({
  options,
  value,
  onChange,
  color = 'primary',
  exclusive,
  size = 'medium',
  sx,
  ...props
}: ToggleButtonGroupProps) => {
  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: string | string[] | null
  ) => {
    onChange?.(newValue)
  }

  return (
    <MuiToggleButtonGroup
      value={value}
      exclusive={exclusive}
      onChange={handleChange}
      size={size}
      color={color}
      sx={{
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          borderRadius: 1.5,
          // フォントサイズ: small=12px(0.86rem), medium=14px(1rem), large=16px(1.14rem)
          fontSize:
            size === 'small'
              ? '0.86rem'
              : size === 'large'
                ? '1.14rem'
                : '1rem',
          // 最小ヒットターゲット24px確保
          minHeight: size === 'small' ? 28 : size === 'large' ? 40 : 32,
          py: size === 'small' ? 0.375 : size === 'large' ? 0.75 : 0.5,
          px: size === 'small' ? 0.75 : size === 'large' ? 1.5 : 1,
          '& .MuiSvgIcon-root': {
            // アイコンサイズ: small=14px(1rem), medium=18px(1.29rem), large=20px(1.43rem)
            fontSize:
              size === 'small'
                ? '1rem'
                : size === 'large'
                  ? '1.43rem'
                  : '1.29rem',
          },
          '&:first-of-type': {
            borderTopLeftRadius: 6,
            borderBottomLeftRadius: 6,
          },
          '&:last-of-type': {
            borderTopRightRadius: 6,
            borderBottomRightRadius: 6,
          },
        },
        ...sx,
      }}
      {...props}>
      {options.map((option) => {
        const button = (
          <MuiToggleButton
            key={option.value}
            value={option.value}
            disabled={option.disabled}
            sx={{
              gap: option.icon && option.label ? 0.5 : 0,
            }}>
            {option.icon}
            {option.label}
          </MuiToggleButton>
        )

        if (option.tooltip) {
          return (
            <Tooltip key={option.value} title={option.tooltip} arrow>
              {button}
            </Tooltip>
          )
        }

        return button
      })}
    </MuiToggleButtonGroup>
  )
}

export default ToggleButton
