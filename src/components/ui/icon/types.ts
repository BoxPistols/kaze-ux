// src/components/ui/icon/types.ts
import type { SvgIconProps } from '@mui/material/SvgIcon'

/**
 * カスタムSVGアイコンコンポーネントの共通Props型
 *
 * MUI SvgIconPropsを継承することで、ダークモード対応を含む
 * MUIアイコンと同等のインターフェースを提供します。
 */
export type CustomIconProps = SvgIconProps & {
  /**
   * アイコンのバリアント
   * - filled: 塗りつぶし
   * - outlined: アウトライン
   */
  variant?: 'filled' | 'outlined'
}
