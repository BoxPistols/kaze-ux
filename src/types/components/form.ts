import type { SelectProps, TextFieldProps } from '@mui/material'

import type { FormFieldBaseProps } from './common'

/**
 * カスタムテキストフィールドのプロパティ
 */
export type CustomTextFieldProps = TextFieldProps &
  FormFieldBaseProps & {
    // TextFieldに特有のプロップ
    type?: string
    multiline?: boolean
    rows?: number
    maxRows?: number
  }

/**
 * カスタムセレクトのプロパティ
 */
export interface CustomSelectProps
  extends
    Omit<SelectProps, 'label' | 'multiple' | 'value' | 'onChange'>,
    FormFieldBaseProps {
  options: Array<{ value: string | number; label: string }>
  value: string | string[] | number | number[] | undefined

  onChange: (value: string | string[] | number | number[] | undefined) => void
  multiple?: boolean
}
