import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

import type { SxProps, Theme } from '@mui/material/styles'

export interface PageHeaderProps {
  /** ページタイトル */
  title: string
  /** サブタイトル（オプション） */
  subtitle?: string
  /** 追加コンテンツ（ボタンなど） */
  children?: ReactNode
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

/**
 * ページヘッダーコンポーネント
 * 見出しとサブタイトルを含む汎用的なページヘッダー
 */
export const PageHeader = ({
  title,
  subtitle,
  children,
  sx = {},
}: PageHeaderProps) => {
  return (
    <Box sx={{ mb: 6, ...sx }}>
      <Typography
        variant='xxl'
        component='h1'
        sx={{
          fontWeight: 'bold',
          mb: subtitle ? 1 : 0,
        }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
          {subtitle}
        </Typography>
      )}
      {children}
    </Box>
  )
}
