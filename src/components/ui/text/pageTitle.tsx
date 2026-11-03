import { Typography, type TypographyProps } from '@mui/material'

type PageTitleSize =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'xxl'
  | 'xl'
  | 'lg'
  | 'ml'
  | 'md'
  | 'sm'
  | 'xs'

type PageTitleColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'warning'
  | 'error'
  | 'text.primary'
  | 'text.secondary'
  | 'text.disabled'
  | 'text.white'

export type PageTitleProps = Omit<TypographyProps, 'variant' | 'color'> & {
  size?: PageTitleSize
  color?: PageTitleColor | string
  className?: string
}

/**
 * ページタイトルコンポーネント
 * 複数のサイズとカラーバリアントをサポート
 */
export const PageTitle = ({
  children,
  size = 'xl',
  color = 'text.primary',
  className,
  ...props
}: PageTitleProps) => {
  return (
    <Typography
      variant={size}
      display='block'
      color={color}
      className={className}
      {...props}>
      {children}
    </Typography>
  )
}
