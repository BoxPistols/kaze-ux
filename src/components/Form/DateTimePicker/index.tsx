// src/components/Form/DateTimePicker/index.tsx
// DateTimePickerコンポーネント
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { Box, FormHelperText, Tooltip, Typography } from '@mui/material'
import { styled, type SxProps, type Theme } from '@mui/material/styles'
import {
  DatePicker,
  DateTimePicker as MuiDateTimePicker,
  LocalizationProvider,
} from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/ja'

// ラベルコンテナ
const LabelContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  marginBottom: 4,
})

// 必須マーク
const RequiredMark = styled('span')(({ theme }) => ({
  color: theme.palette.error.main,
  marginLeft: 2,
}))

export interface DateTimePickerProps {
  /** ラベル */
  label: string
  /** 値（Dayjs形式） */
  value: Dayjs | null
  /** 値変更時のコールバック */
  onChange: (value: Dayjs | null) => void
  /** フォーマット文字列 (デフォルト: 'YYYY/MM/DD HH:mm') */
  format?: string
  /** 無効化 */
  disabled?: boolean
  /** 最小日時 */
  minDateTime?: Dayjs
  /** 最大日時 */
  maxDateTime?: Dayjs
  /** エラー状態 */
  error?: boolean
  /** ヘルパーテキスト */
  helperText?: string
  /** 必須項目 */
  required?: boolean
  /** ツールチップ */
  tooltip?: string
  /** カスタムスタイル */
  sx?: SxProps<Theme>
  /** サイズ */
  size?: 'small' | 'medium'
  /** 幅100% */
  fullWidth?: boolean
  /** プレースホルダー */
  placeholder?: string
}

export const DateTimePicker = ({
  label,
  value,
  onChange,
  format = 'YYYY/MM/DD HH:mm',
  disabled = false,
  minDateTime,
  maxDateTime,
  error = false,
  helperText,
  required = false,
  tooltip,
  sx,
  size = 'medium',
  fullWidth = true,
  placeholder,
}: DateTimePickerProps) => {
  // フォーマットに時間が含まれるかどうかで表示するピッカーを変える
  const hasTime =
    format.includes('H') || format.includes('h') || format.includes('m')

  const commonSlotProps = {
    textField: {
      size,
      fullWidth,
      error,
      placeholder,
      sx: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 1.5,
        },
      },
    },
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale='ja'>
      <Box sx={sx}>
        {/* ラベル部分 */}
        <LabelContainer>
          <Typography
            component='label'
            variant='body2'
            sx={{ fontWeight: 500, color: 'text.primary' }}>
            {label}
            {required && <RequiredMark>*</RequiredMark>}
          </Typography>
          {tooltip && (
            <Tooltip title={tooltip} arrow placement='top'>
              <HelpOutlineIcon
                sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }}
                aria-label={`${label}についてのヘルプ`}
              />
            </Tooltip>
          )}
        </LabelContainer>

        {/* ピッカー本体 */}
        {hasTime ? (
          <MuiDateTimePicker
            value={value}
            onChange={onChange}
            format={format}
            disabled={disabled}
            minDateTime={minDateTime}
            maxDateTime={maxDateTime}
            slotProps={commonSlotProps}
          />
        ) : (
          <DatePicker
            value={value}
            onChange={onChange}
            format={format}
            disabled={disabled}
            minDate={minDateTime}
            maxDate={maxDateTime}
            slotProps={commonSlotProps}
          />
        )}

        {/* ヘルパーテキスト */}
        {helperText && (
          <FormHelperText error={error} sx={{ mx: 0, mt: 0.5 }}>
            {helperText}
          </FormHelperText>
        )}
      </Box>
    </LocalizationProvider>
  )
}

// dayjsユーティリティもエクスポート
export { dayjs }
export type { Dayjs }

export default DateTimePicker
