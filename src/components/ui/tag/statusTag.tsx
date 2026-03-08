// src/components/ui/tag/statusTag.tsx
// sdpf-frontend-nextに準拠したStatusTagコンポーネント
import { Chip, type SxProps, type Theme } from '@mui/material'

import { colorData } from '@/themes/colorToken'

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

// ステータスごとのスタイル定義
const statusStyles: Record<
  StatusType,
  { backgroundColor: string; color: string; borderColor: string }
> = {
  draft: {
    backgroundColor: colorData.background.default,
    color: colorData.primary.main,
    borderColor: colorData.primary.main,
  },
  submitted: {
    backgroundColor: colorData.primary.main,
    color: colorData.common.white,
    borderColor: colorData.primary.main,
  },
  approved: {
    backgroundColor: colorData.success.main,
    color: colorData.common.white,
    borderColor: colorData.success.main,
  },
  rejected: {
    backgroundColor: colorData.error.main,
    color: colorData.common.white,
    borderColor: colorData.error.main,
  },
  pending: {
    backgroundColor: colorData.warning.main,
    color: colorData.common.white,
    borderColor: colorData.warning.main,
  },
  active: {
    backgroundColor: colorData.success.light,
    color: colorData.success.dark,
    borderColor: colorData.success.main,
  },
  inactive: {
    backgroundColor: colorData.grey[200],
    color: colorData.grey[600],
    borderColor: colorData.grey[400],
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
