/**
 * フローティングパネル共通スタイル
 * DriverPanel / EventLog / TimelineBar / IncidentPanel で重複していたスタイルを統合
 */
import { alpha, type SxProps, type Theme } from '@mui/material'

import { elevation } from '@/themes/elevation'

/** 標準パネル（backdropFilter + bgcolor + border + shadow） */
export const floatingPanelSx: SxProps<Theme> = {
  borderRadius: 2,
  backdropFilter: 'blur(16px)',
  bgcolor: (theme: Theme) =>
    theme.palette.mode === 'dark'
      ? 'rgba(10, 15, 28, 0.92)'
      : 'rgba(255,255,255,0.94)',
  border: '1px solid',
  borderColor: (theme: Theme) => alpha(theme.palette.divider, 0.15),
  boxShadow: (theme: Theme) => theme.shadows[elevation.overlay],
  overflow: 'hidden',
}

/** 強調パネル（選択中ドライバー詳細など） */
export const floatingPanelEmphasizedSx: SxProps<Theme> = {
  ...floatingPanelSx,
  bgcolor: (theme: Theme) =>
    theme.palette.mode === 'dark'
      ? 'rgba(10, 15, 28, 0.94)'
      : 'rgba(255,255,255,0.96)',
}
