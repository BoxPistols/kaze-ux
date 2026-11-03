// MultiSelectAutocomplete: 視認性の良い複数選択フォームコンポーネント
import CheckIcon from '@mui/icons-material/Check'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import {
  Autocomplete,
  Box,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  TextField,
  Tooltip,
  useTheme,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useCallback, useState } from 'react'
import type { AutocompleteProps, ChipProps } from '@mui/material'
import type { SyntheticEvent } from 'react'

// オプションの型定義
export interface OptionType {
  value: string | number
  label: string
}

// renderTagsのgetTagProps関数の型定義（可読性向上のため分離）
type GetTagPropsFunction = Parameters<
  NonNullable<AutocompleteProps<OptionType, true, boolean, false>['renderTags']>
>[1]

// コンポーネントのprops型定義
interface MultiSelectAutocompleteProps extends Omit<
  AutocompleteProps<OptionType, true, boolean, false>,
  | 'renderInput'
  | 'multiple'
  | 'options'
  | 'value'
  | 'onChange'
  | 'getOptionLabel'
  | 'isOptionEqualToValue'
> {
  label: string
  options: OptionType[]
  value?: OptionType[]
  onChange?: (event: SyntheticEvent, value: OptionType[]) => void
  tooltip?: string
  helperText?: string
  required?: boolean
  error?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
  id?: string
  name?: string
  placeholder?: string
  chipColor?: ChipProps['color']
  chipVariant?: ChipProps['variant']
  limitTags?: number
}

// ユーティリティ関数
const createInputId = (id: string | undefined, label: string) =>
  id || `multi-select-autocomplete-${label.replace(/\s/g, '-').toLowerCase()}`

// スタイル付きコンポーネント
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

export const MultiSelectAutocomplete = ({
  label,
  options,
  value: propValue,
  onChange,
  tooltip,
  helperText,
  required,
  error,
  size = 'medium',
  fullWidth = true,
  id,
  name,
  placeholder = '選択してください',
  chipColor = 'primary',
  chipVariant = 'outlined',
  limitTags = 3,
  disabled,
  ...props
}: MultiSelectAutocompleteProps) => {
  const theme = useTheme()
  const inputId = createInputId(id, label)
  const inputName = name || inputId

  // 内部状態管理（制御コンポーネントと非制御コンポーネントの両方をサポート）
  const [internalValue, setInternalValue] = useState<OptionType[]>([])
  const currentValue = propValue !== undefined ? propValue : internalValue

  // 値変更のハンドラー
  // 必須項目の場合、選択済みの項目を全て削除しようとする操作を防ぐ
  // currentValue.length > 0 の条件により、初期状態（未選択）からの選択は許可される
  const handleChange = useCallback(
    (event: SyntheticEvent, newValue: OptionType[]) => {
      if (required && newValue.length === 0 && currentValue.length > 0) {
        return
      }

      setInternalValue(newValue)
      if (onChange) {
        onChange(event, newValue)
      }
    },
    [required, currentValue.length, onChange]
  )

  // オプションのラベルを取得
  const getOptionLabel = useCallback((option: OptionType) => option.label, [])

  // オプションの等価性を判定
  const isOptionEqualToValue = useCallback(
    (option: OptionType, value: OptionType) => option.value === value.value,
    []
  )

  // チップのレンダリング
  const renderTags = useCallback(
    (tagValue: OptionType[], getTagProps: GetTagPropsFunction) =>
      tagValue.map((option, index) => {
        const tagProps = getTagProps({ index })
        // onDeleteを条件付きで適用（required=trueで最後の1つの場合は削除不可）
        const isLastItem = required && tagValue.length === 1
        return (
          <Chip
            {...tagProps}
            key={option.value}
            label={option.label}
            color={chipColor}
            variant={chipVariant}
            size={size}
            onDelete={isLastItem ? undefined : tagProps.onDelete}
            disabled={disabled}
          />
        )
      }),
    [chipColor, chipVariant, size, required, disabled]
  )

  return (
    <StyledFormControl fullWidth={fullWidth} error={error} size={size}>
      {/* 静的ラベル（アニメーションなし） */}
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

      {/* Autocomplete本体 */}
      <Autocomplete
        {...props}
        multiple
        id={inputId}
        options={options}
        value={currentValue}
        onChange={handleChange}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={isOptionEqualToValue}
        renderTags={renderTags}
        limitTags={limitTags}
        disabled={disabled}
        disableCloseOnSelect
        renderInput={(params) => (
          <TextField
            {...params}
            name={inputName}
            placeholder={currentValue.length === 0 ? placeholder : undefined}
            error={error}
            required={required}
            size={size}
            aria-required={required ? 'true' : 'false'}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              helperText
                ? `${inputId}-helper-text`
                : tooltip
                  ? `${inputId}-tooltip`
                  : undefined
            }
            inputProps={{
              ...params.inputProps,
              'aria-label': `${label}${required ? '（必須）' : ''}`,
            }}
            sx={{
              '& .MuiInputBase-root': {
                paddingTop: size === 'small' ? '4px' : '6px',
                paddingBottom: size === 'small' ? '4px' : '6px',
              },
              '& .MuiAutocomplete-tag': {
                margin: '2px',
              },
            }}
          />
        )}
        renderOption={(optionProps, option, { selected }) => {
          // React 18以降、keyはrestOperatorで展開すべきではないため、分離して個別に渡す
          const { key, ...restOptionProps } = optionProps
          return (
            <Box
              component='li'
              key={key}
              {...restOptionProps}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
              <Box
                component='span'
                sx={{
                  width: 16,
                  height: 16,
                  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.action.disabled}`,
                  borderRadius: '2px',
                  backgroundColor: selected
                    ? theme.palette.primary.main
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mr: 1,
                }}>
                {selected && (
                  <CheckIcon
                    sx={{
                      color: theme.palette.primary.contrastText,
                      fontSize: '14px',
                    }}
                  />
                )}
              </Box>
              {option.label}
            </Box>
          )
        }}
        sx={{
          '& .MuiAutocomplete-clearIndicator': {
            visibility: disabled ? 'hidden' : 'visible',
          },
        }}
      />

      {/* ヘルパーテキストの表示 */}
      {helperText && (
        <FormHelperText id={`${inputId}-helper-text`} error={error}>
          {helperText}
        </FormHelperText>
      )}
      {tooltip && !helperText && (
        <span id={`${inputId}-tooltip`} style={{ display: 'none' }}>
          {tooltip}
        </span>
      )}
    </StyledFormControl>
  )
}
