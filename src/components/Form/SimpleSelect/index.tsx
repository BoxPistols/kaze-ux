// src/components/Form/SimpleSelect/index.tsx
// シンプルなSelectコンポーネント
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select as MuiSelect,
  FormHelperText,
  type SxProps,
  type Theme,
} from '@mui/material'

export interface SimpleSelectProps {
  /** ラベル */
  label: string
  /** 選択肢（文字列配列） */
  items: string[]
  /** 現在の値 */
  value: string
  /** 値変更時のコールバック */
  onChange: (value: string) => void
  /** カスタムスタイル */
  sx?: SxProps<Theme>
  /** 全幅 */
  fullWidth?: boolean
  /** サイズ */
  size?: 'small' | 'medium'
  /** 無効化 */
  disabled?: boolean
  /** エラー状態 */
  error?: boolean
  /** ヘルパーテキスト */
  helperText?: string
  /** 必須 */
  required?: boolean
}

export const SimpleSelect = ({
  label,
  items,
  value,
  onChange,
  sx,
  fullWidth = true,
  size = 'medium',
  disabled = false,
  error = false,
  helperText,
  required = false,
}: SimpleSelectProps) => {
  return (
    <FormControl
      fullWidth={fullWidth}
      size={size}
      disabled={disabled}
      error={error}
      required={required}
      sx={sx}>
      <InputLabel>{label}</InputLabel>
      <MuiSelect
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}>
        {items.map((item) => (
          <MenuItem value={item} key={item}>
            {item}
          </MenuItem>
        ))}
      </MuiSelect>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
}

export default SimpleSelect
