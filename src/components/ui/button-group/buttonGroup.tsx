// src/components/ui/button-group/buttonGroup.tsx
// カスタムButtonGroupコンポーネント
import {
  Button,
  ButtonGroup as MuiButtonGroup,
  type ButtonGroupProps as MuiButtonGroupProps,
  type SxProps,
  type Theme,
} from '@mui/material'
import { type ReactNode } from 'react'

export interface ButtonGroupOption {
  /** オプションの値 */
  value: string
  /** 表示ラベル */
  label: string
  /** アイコン */
  icon?: ReactNode
  /** 無効化 */
  disabled?: boolean
}

export interface ButtonGroupProps extends Omit<
  MuiButtonGroupProps,
  'onChange' | 'children'
> {
  /** オプション配列 */
  options: ButtonGroupOption[]
  /** 選択された値 */
  value?: string | string[]
  /** 複数選択を許可 */
  multiple?: boolean
  /** 値変更時のコールバック */
  onChange?: (value: string | string[]) => void
  /** ボタンの色 */
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success'
  /** ボタンのサイズ */
  size?: 'small' | 'medium' | 'large'
  /** フルワイド */
  fullWidth?: boolean
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

/**
 * カスタムButtonGroupコンポーネント
 * 単一選択・複数選択に対応したボタングループ
 *
 * @example
 * ```tsx
 * import { ButtonGroup } from '@/components/ui/button-group'
 *
 * // 単一選択
 * <ButtonGroup
 *   options={[
 *     { value: 'month', label: '月' },
 *     { value: 'week', label: '週' },
 *     { value: 'day', label: '日' },
 *   ]}
 *   value={view}
 *   onChange={setView}
 * />
 *
 * // 複数選択
 * <ButtonGroup
 *   options={[
 *     { value: 'bold', label: 'B', icon: <FormatBoldIcon /> },
 *     { value: 'italic', label: 'I', icon: <FormatItalicIcon /> },
 *   ]}
 *   value={formats}
 *   multiple
 *   onChange={setFormats}
 * />
 * ```
 */
export const ButtonGroup = ({
  options,
  value,
  multiple = false,
  onChange,
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  variant = 'outlined',
  sx,
  ...props
}: ButtonGroupProps) => {
  // 選択状態を配列として正規化
  const selectedValues = multiple
    ? Array.isArray(value)
      ? value
      : value
        ? [value]
        : []
    : typeof value === 'string'
      ? [value]
      : []

  const handleClick = (optionValue: string) => {
    if (!onChange) return

    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue]
      onChange(newValues)
    } else {
      onChange(optionValue)
    }
  }

  const isSelected = (optionValue: string) =>
    selectedValues.includes(optionValue)

  return (
    <MuiButtonGroup
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      sx={{
        '& .MuiButton-root': {
          textTransform: 'none',
          fontWeight: 500,
          // フォントサイズ: small=12px(0.86rem), medium=14px(1rem), large=16px(1.14rem)
          // 最小12px（A11yルール）
          fontSize:
            size === 'small'
              ? '0.86rem'
              : size === 'large'
                ? '1.14rem'
                : '1rem',
          // 最小ヒットターゲット24px確保
          minWidth: size === 'small' ? 36 : size === 'large' ? 56 : 44,
          minHeight: size === 'small' ? 28 : size === 'large' ? 40 : 32,
          py: size === 'small' ? 0.375 : size === 'large' ? 0.75 : 0.5,
          px: size === 'small' ? 1 : size === 'large' ? 2 : 1.5,
        },
        ...sx,
      }}
      {...props}>
      {options.map((option) => (
        <Button
          key={option.value}
          onClick={() => handleClick(option.value)}
          disabled={option.disabled}
          variant={isSelected(option.value) ? 'contained' : variant}
          startIcon={option.icon}
          sx={{
            transition: 'all 0.2s ease-in-out',
            ...(isSelected(option.value) && {
              boxShadow: 'none',
            }),
          }}>
          {option.label}
        </Button>
      ))}
    </MuiButtonGroup>
  )
}

export default ButtonGroup
