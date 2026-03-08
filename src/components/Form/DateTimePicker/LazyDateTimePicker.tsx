// src/components/Form/DateTimePicker/LazyDateTimePicker.tsx
// SSR対応の遅延読み込みDateTimePickerコンポーネント
import { Box, Skeleton, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { lazy, Suspense } from 'react'

import type { DateTimePickerProps } from './index'

// 遅延読み込み
const DateTimePicker = lazy(() => import('./index'))

// ラベルコンテナ（ローディング表示用）
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

// ローディングプレースホルダー
interface LoadingPlaceholderProps {
  label: string
  required?: boolean
  size?: 'small' | 'medium'
  fullWidth?: boolean
}

const LoadingPlaceholder = ({
  label,
  required = false,
  size = 'medium',
  fullWidth = true,
}: LoadingPlaceholderProps) => {
  const height = size === 'small' ? 40 : 56

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <LabelContainer>
        <Typography
          component='label'
          variant='body2'
          sx={{ fontWeight: 500, color: 'text.primary' }}>
          {label}
          {required && <RequiredMark>*</RequiredMark>}
        </Typography>
      </LabelContainer>
      <Skeleton
        variant='rounded'
        width='100%'
        height={height}
        sx={{ borderRadius: 1.5 }}
      />
    </Box>
  )
}

/**
 * 遅延読み込み対応のDateTimePickerコンポーネント
 * Next.js SSR環境での使用を想定
 *
 * @example
 * ```tsx
 * import { LazyDateTimePicker } from '@/components/Form/DateTimePicker/LazyDateTimePicker'
 *
 * <LazyDateTimePicker
 *   label="開始日時"
 *   value={startDate}
 *   onChange={setStartDate}
 *   required
 * />
 * ```
 */
export const LazyDateTimePicker = (props: DateTimePickerProps) => {
  return (
    <Suspense
      fallback={
        <LoadingPlaceholder
          label={props.label}
          required={props.required}
          size={props.size}
          fullWidth={props.fullWidth}
        />
      }>
      <DateTimePicker {...props} />
    </Suspense>
  )
}

export default LazyDateTimePicker
