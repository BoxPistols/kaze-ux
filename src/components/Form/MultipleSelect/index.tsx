import {
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  type SxProps,
  type Theme,
} from '@mui/material'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}

export interface MultipleSelectProps {
  /** ラベル */
  label: string
  /** 選択肢リスト */
  items: string[]
  /** 選択された値のリスト */
  selectedItems: string[]
  /** 選択変更時のコールバック */
  onSelectedItemsChange: (selectedItems: string[]) => void
  /** カスタムスタイル */
  sx?: SxProps<Theme>
  /** エラー状態 */
  error?: boolean
  /** ヘルパーテキスト */
  helperText?: string
  /** 無効状態 */
  disabled?: boolean
  /** 必須 */
  required?: boolean
  /** サイズ */
  size?: 'small' | 'medium'
}

/**
 * 複数選択セレクトコンポーネント
 * チェックボックス付きのドロップダウンで複数選択が可能
 */
export const MultipleSelect = ({
  label,
  items,
  selectedItems,
  onSelectedItemsChange,
  sx,
  error = false,
  disabled = false,
  required = false,
  size = 'medium',
}: MultipleSelectProps) => {
  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event
    onSelectedItemsChange(typeof value === 'string' ? value.split(',') : value)
  }

  return (
    <FormControl fullWidth sx={{ ...sx }} error={error} disabled={disabled}>
      <InputLabel required={required}>{label}</InputLabel>
      <Select
        multiple
        value={selectedItems}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => selected.join(', ')}
        MenuProps={MenuProps}
        size={size}>
        {items.map((item) => (
          <MenuItem key={item} value={item}>
            <Checkbox checked={selectedItems.indexOf(item) > -1} />
            <ListItemText primary={item} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
