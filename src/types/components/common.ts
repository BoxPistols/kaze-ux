import type { ReactNode } from 'react'

/**
 * すべてのフォームフィールドコンポーネントで共有される基本プロパティ
 */
export interface FormFieldBaseProps {
  label: string
  tooltip?: string
  helperText?: string
  required?: boolean
  error?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
  disabled?: boolean
}

/**
 * 子要素を含むコンポーネントのプロパティ
 */
export interface WithChildrenProps {
  children: ReactNode
}

/**
 * クラス名を受け取るコンポーネントのプロパティ
 */
export interface WithClassNameProps {
  className?: string
}
