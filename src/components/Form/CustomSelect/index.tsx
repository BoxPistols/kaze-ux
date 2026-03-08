import ClearIcon from '@mui/icons-material/Clear'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  useTheme,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useCallback, useState } from 'react'
import type { SelectProps } from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import type React from 'react'

// 定数定義
const CONSTANTS = {
  MENU_MAX_HEIGHT: 300,
  CLEAR_BUTTON_RIGHT_POSITION: 32,
  CLEAR_BUTTON_PADDING: 4,
  CLEAR_BUTTON_SPACE: 64,
  DEFAULT_BUTTON_SPACE: 32,
} as const

// ユーティリティ関数
const createInputId = (id: string | undefined, label: string) =>
  id || `custom-select-${label.replace(/\s/g, '-').toLowerCase()}`

const getInitialValue = (
  propValue: string | string[] | number | number[] | undefined,
  multiple: boolean
) => {
  if (propValue !== undefined) return propValue
  return multiple ? [] : ''
}

const hasValue = (
  val: string | string[] | number | number[],
  multiple: boolean
): boolean =>
  multiple
    ? Array.isArray(val) && val.length > 0
    : val !== undefined && val !== ''

// 拡張されたPropsの型定義
type CustomSelectProps = Omit<
  SelectProps,
  'label' | 'multiple' | 'value' | 'onChange'
> & {
  label: string
  tooltip?: string
  helperText?: string
  options: Array<{ value: string | number; label: string }>
  placeholder?: string
  multiple?: boolean
  value?: string | string[] | number | number[]
  onChange?: (
    event: SelectChangeEvent<unknown>,
    value: string | string[] | number | number[]
  ) => void
  required?: boolean
  error?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
  id?: string
  name?: string
  inputProps?: SelectProps['inputProps']
  clearable?: boolean // クリア機能の制御用prop
}

// スタイル付きコンポーネントの定義
const StyledFormControl = styled(FormControl)({
  width: '100%',
})

const StyledInputLabel = styled(InputLabel, {
  shouldForwardProp: (prop) => prop !== 'error' && prop !== 'size',
})<{ error?: boolean }>(({ theme, error }) => ({
  position: 'static',
  transform: 'none',
  transition: 'none',
  pointerEvents: 'auto',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  alignSelf: 'start',
  fontWeight: 'bold',
  marginBottom: '4px',
  color: error ? theme.palette.error.main : 'inherit',
}))

const RequiredMark = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  marginRight: theme.spacing(1),
  marginLeft: 0,
  fontSize: '1.2em',
  lineHeight: '1.25',
  verticalAlign: 'middle',
}))

const TooltipIcon = styled(HelpOutlineOutlinedIcon)<{
  size?: 'small' | 'medium'
}>(({ size }) => ({
  fontSize: size === 'small' ? '0.875rem' : '1rem',
  marginLeft: '4px',
  color: 'inherit',
  verticalAlign: 'middle',
}))

// クリアボタンのスタイル定義
const ClearButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: CONSTANTS.CLEAR_BUTTON_RIGHT_POSITION, // セレクトボックスの矢印アイコンの左に配置
  padding: `${CONSTANTS.CLEAR_BUTTON_PADDING}px`,
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
  },
}))

// カスタムフック：Select状態管理
const useSelectState = (
  propValue: string | string[] | number | number[] | undefined,
  multiple: boolean,
  required: boolean,
  onChange?: (
    event: SelectChangeEvent<unknown>,
    value: string | string[] | number | number[]
  ) => void
) => {
  // 状態管理の初期化
  const [value, setValue] = useState<string | string[] | number | number[]>(
    () => getInitialValue(propValue, multiple)
  )

  // 値変更のハンドラー
  const handleChange = useCallback(
    (event: SelectChangeEvent<unknown>) => {
      const newValue = event.target.value

      // 必須かつ複数選択の場合、空の配列を防ぐ
      if (
        multiple &&
        required &&
        Array.isArray(newValue) &&
        newValue.length === 0
      ) {
        return // 空の選択を防ぐ
      }

      // 型を適切に処理
      const processedValue = multiple
        ? (newValue as string[] | number[])
        : (newValue as string | number)

      setValue(processedValue)
      if (onChange) {
        onChange(event, processedValue)
      }
    },
    [multiple, required, onChange]
  )

  return { value, setValue, handleChange }
}

export const CustomSelect = ({
  label,
  tooltip,
  helperText,
  options,
  required,
  error,
  size = 'medium',
  fullWidth = false,
  id,
  name,
  inputProps,
  multiple = false,
  placeholder = multiple ? '複数の選択が可能です' : '選択してください',
  value: propValue = multiple ? [] : '',
  onChange,
  clearable = true,
  ...props
}: CustomSelectProps) => {
  const theme = useTheme()
  const inputId = createInputId(id, label)
  const inputName = name || inputId

  // カスタムフックを使用して状態管理を行う
  const { value, setValue, handleChange } = useSelectState(
    propValue,
    multiple,
    required || false,
    onChange
  )

  // クリア処理のハンドラーを汎用的に改善
  const handleClear = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      event.stopPropagation()

      // 必須かつ複数選択の場合、最後の1つは残す
      if (multiple && required && Array.isArray(value)) {
        const newValue = value.slice(0, 1) // 最初の選択を残す
        setValue(newValue)

        if (onChange) {
          const customEvent = {
            target: { value: newValue },
          } as SelectChangeEvent<unknown>
          onChange(customEvent, newValue)
        }
        return
      }

      // その他の場合（単一選択など）
      const newValue = multiple ? [] : ''
      setValue(newValue)

      if (onChange) {
        const customEvent = {
          target: { value: newValue },
        } as SelectChangeEvent<unknown>
        onChange(customEvent, newValue)
      }
    },
    [multiple, required, value, onChange, setValue]
  )

  // すべての選択を解除するためのカスタムコンポーネント
  const ClearAllOption = useCallback(() => {
    if (!multiple || !clearable || !hasValue(value, multiple) || required)
      return null

    return (
      <MenuItem
        onClick={handleClear}
        sx={{
          color: theme.palette.text.secondary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
          py: 1.5, // パディングを少し広めに
        }}>
        すべての選択を解除
      </MenuItem>
    )
  }, [multiple, clearable, value, required, handleClear, theme])

  // カスタムメニュー設定
  const customMenuProps = {
    ...props.MenuProps,
    PaperProps: {
      ...props.MenuProps?.PaperProps,
      sx: {
        ...(props.MenuProps?.PaperProps?.sx ?? {}),
        maxHeight: CONSTANTS.MENU_MAX_HEIGHT,
      },
    },
  }

  // 選択値の表示ロジックを分離
  const renderSelectedValue = useCallback(
    (selected: unknown) => {
      if (multiple) {
        if (!selected || (Array.isArray(selected) && selected.length === 0)) {
          return <em>{placeholder}</em>
        }
        return (Array.isArray(selected) ? selected : [selected])
          .map(
            (value) => options.find((option) => option.value === value)?.label
          )
          .join(', ')
      }

      if (!selected) {
        return <em>{placeholder}</em>
      }
      return options.find((option) => option.value === selected)?.label
    },
    [multiple, options, placeholder]
  )

  // クリアボタンの表示条件を改善
  const shouldShowClearButton = useCallback(() => {
    if (!clearable || !hasValue(value, multiple)) return false

    // 複数選択の場合、最低1つの選択を必須とする
    if (multiple && required) {
      return Array.isArray(value) && value.length > 1
    }

    // 単一選択の場合は必須項目ではクリア不可
    return !required
  }, [clearable, value, multiple, required])

  return (
    <StyledFormControl fullWidth={fullWidth} error={error} size={size}>
      <StyledInputLabel
        shrink
        htmlFor={inputId}
        error={error}
        size={size as 'small' | undefined}
        sx={{
          lineHeight: size === 'small' ? '1.5' : '1.75',
          color: theme.palette.text.primary,
          marginBottom: 0,
        }}>
        {required && (
          <RequiredMark
            aria-hidden='true'
            sx={{
              fontSize: size === 'small' ? '1.3em' : '1.5em',
              mr: 1,
              ml: 0,
              lineHeight: '1.25',
              color: theme.palette.error.main,
            }}>
            *
          </RequiredMark>
        )}
        {label}
        {tooltip && (
          <Tooltip
            title={tooltip}
            arrow
            sx={{
              fontSize: size === 'small' ? '1.3em' : '1.5em',
            }}>
            <TooltipIcon aria-label={`${label}についてのヘルプ`} size={size} />
          </Tooltip>
        )}
      </StyledInputLabel>
      <Select
        variant='outlined'
        {...props}
        multiple={multiple}
        id={inputId}
        name={inputName}
        label=''
        required={required}
        error={error}
        size={size}
        value={value}
        onChange={handleChange}
        displayEmpty
        aria-required={required ? 'true' : 'false'}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={
          helperText // helperText を直接参照
            ? `${inputId}-helper-text`
            : tooltip
              ? `${inputId}-tooltip`
              : undefined // どちらもない場合は undefined
        }
        renderValue={renderSelectedValue}
        // クリアボタンとアイコンの制御
        endAdornment={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {shouldShowClearButton() && (
              <ClearButton
                onClick={handleClear}
                size='small'
                aria-label={`${label}の選択を解除`}
                title='選択を解除'>
                <ClearIcon fontSize='small' />
              </ClearButton>
            )}
          </Box>
        }
        // メニューのカスタマイズ
        MenuProps={customMenuProps}
        inputProps={{
          ...inputProps,
          'aria-label': `${label}${required ? '（必須）' : ''}`,
        }}
        sx={{
          '& .MuiSelect-icon': {
            color: theme.palette.text.secondary,
          },
          '& .MuiSelect-select': {
            paddingTop: size === 'small' ? '8px' : '10px',
            paddingBottom: size === 'small' ? '6px' : '8px',
            height: 'auto',
            paddingRight:
              clearable && hasValue(value, multiple)
                ? `${CONSTANTS.CLEAR_BUTTON_SPACE}px`
                : `${CONSTANTS.DEFAULT_BUTTON_SPACE}px`, // クリアボタンのスペースを確保
          },
          '& .MuiSelect-select.MuiSelect-select': {
            color: hasValue(value, multiple)
              ? theme.palette.text.primary
              : theme.palette.text.secondary,
          },
        }}>
        {/* すべての選択を解除するオプション（複数選択時のみ） */}
        <ClearAllOption />
        {/* プレースホルダーと選択肢の表示 */}
        {placeholder && !multiple && (
          <MenuItem value='' disabled>
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {/* ヘルパーテキストとツールチップの表示 */}
      {helperText && ( // helperText が存在する場合のみ表示
        <FormHelperText id={`${inputId}-helper-text`} error={error}>
          {' '}
          {/* error prop を追加 */}
          {helperText}
        </FormHelperText>
      )}
      {tooltip &&
        !helperText && ( // tooltip があり、helperText がない場合のみ span を表示
          <span id={`${inputId}-tooltip`} style={{ display: 'none' }}>
            {tooltip}
          </span>
        )}
    </StyledFormControl>
  )
}
