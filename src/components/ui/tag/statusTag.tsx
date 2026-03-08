// src/components/ui/tag/statusTag.tsx
// StatusTagコンポーネント
import { Chip, type SxProps, type Theme } from '@mui/material'

/** ステータスの種類 */
export type StatusType =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'pending'
  | 'active'
  | 'inactive'

export interface StatusTagProps {
  /** 表示テキスト */
  text: string
  /** ステータス種類 */
  status: StatusType
  /** カスタムスタイル */
  sx?: SxProps<Theme>
}

// ステータスごとのスタイル定義（テーマパレット参照）
const statusStyles: Record<
  StatusType,
  { backgroundColor: string; color: string; borderColor: string }
> = {
  draft: {
    backgroundColor: 'background.default',
    color: 'primary.main',
    borderColor: 'primary.main',
  },
  submitted: {
    backgroundColor: 'primary.main',
    color: 'common.white',
    borderColor: 'primary.main',
  },
  approved: {
    backgroundColor: 'success.main',
    color: 'common.white',
    borderColor: 'success.main',
  },
  rejected: {
    backgroundColor: 'error.main',
    color: 'common.white',
    borderColor: 'error.main',
  },
  pending: {
    backgroundColor: 'warning.main',
    color: 'common.white',
    borderColor: 'warning.main',
  },
  active: {
    backgroundColor: 'success.light',
    color: 'success.dark',
    borderColor: 'success.main',
  },
  inactive: {
    backgroundColor: 'action.selected',
    color: 'text.secondary',
    borderColor: 'divider',
  },
}

export const StatusTag = ({ text, status, sx }: StatusTagProps) => {
  const style = statusStyles[status] || statusStyles.draft

  return (
    <Chip
      label={text}
      size='small'
      variant='outlined'
      sx={{
        ...style,
        borderRadius: '16px',
        borderWidth: '1px',
        fontSize: '10px',
        fontWeight: 'bold',
        height: 'auto',
        '& .MuiChip-label': {
          padding: '1px 6px',
        },
        ...sx,
      }}
    />
  )
}

export default StatusTag
