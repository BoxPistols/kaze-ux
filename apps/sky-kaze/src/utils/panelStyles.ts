/**
 * フローティングパネル共通スタイル
 * DriverPanel / EventLog / TimelineBar / IncidentPanel で重複していたスタイルを統合
 */
import { alpha, type SxProps, type Theme } from '@mui/material'

import { elevation } from '@/themes/elevation'

/**
 * パネルの面色。
 *
 * 半透明なので、この上に置く文字色を決めるには下地との合成が要る。
 * 描画とコントラスト計算で別の値を持たないよう、ここを単一ソースにする。
 * 参照: readableStatusColor.ts
 */
export const PANEL_SURFACE = {
  dark: 'rgba(10, 15, 28, 0.92)',
  light: 'rgba(255, 255, 255, 0.94)',
} as const

export const PANEL_SURFACE_EMPHASIZED = {
  dark: 'rgba(10, 15, 28, 0.94)',
  light: 'rgba(255, 255, 255, 0.96)',
} as const

/** 標準パネル（backdropFilter + bgcolor + border + shadow） */
export const floatingPanelSx: SxProps<Theme> = {
  borderRadius: 2,
  backdropFilter: 'blur(16px)',
  bgcolor: (theme: Theme) => PANEL_SURFACE[theme.palette.mode],
  border: '1px solid',
  borderColor: (theme: Theme) => alpha(theme.palette.divider, 0.15),
  boxShadow: (theme: Theme) => theme.shadows[elevation.overlay],
  overflow: 'hidden',
}

/** 強調パネル（選択中ドライバー詳細など） */
export const floatingPanelEmphasizedSx: SxProps<Theme> = {
  ...floatingPanelSx,
  bgcolor: (theme: Theme) => PANEL_SURFACE_EMPHASIZED[theme.palette.mode],
}
