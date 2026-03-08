// src/components/ui/button/saveButton.tsx
// sdpf-frontend-nextに準拠したSaveButtonコンポーネント
import SaveIcon from '@mui/icons-material/Save'
import { Button, type SxProps, type Theme, Typography } from '@mui/material'

import { colorData } from '@/themes/colorToken'

export interface SaveButtonProps {
  /** 無効化状態 */
  disabled?: boolean
  /** クリック時のコールバック */
  onClick: () => void
  /** カスタムスタイル */
  sx?: SxProps<Theme>
  /** ボタンテキスト（デフォルト: 保存） */
  label?: string
}

export const SaveButton = ({
  disabled,
  onClick,
  sx,
  label = '保存',
}: SaveButtonProps) => {
  return (
    <Button
      variant='outlined'
      sx={{
        backgroundColor: colorData.background.default,
        padding: 0.5,
        overflow: 'hidden',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        ...(sx || {}),
      }}
      disabled={disabled}
      onClick={onClick}>
      <SaveIcon
        sx={{
          color: disabled ? colorData.grey[400] : colorData.primary.main,
          mr: '2px',
        }}
      />
      <Typography
        sx={{
          fontSize: '12px',
          fontWeight: 'bold',
          color: disabled ? colorData.grey[400] : colorData.primary.main,
        }}>
        {label}
      </Typography>
    </Button>
  )
}

export default SaveButton
