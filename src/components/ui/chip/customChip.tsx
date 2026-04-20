import { Chip, type ChipProps } from '@mui/material'

import { KAZE_MONO_LABEL, KAZE_SHARP_UI } from '@/themes/kazeMixins'

export interface CustomChipProps extends ChipProps {
  /**
   * Kaze 骨格を opt-in で適用（token は #38-#39 参照）。
   * - border-radius: var(--kaze-r-sharp) (2px, skeleton 定義どおり)
   * - transition: var(--kaze-dur-micro) var(--kaze-ease)
   * - font: Plex Mono + letter-spacing + uppercase
   */
  kaze?: boolean
}

/**
 * カスタムチップコンポーネント
 * テーマスタイルを適用したシンプルなChipラッパー
 */
export const CustomChip = ({
  kaze = false,
  sx,
  ...props
}: CustomChipProps) => {
  return (
    <Chip
      size='medium'
      sx={kaze ? [{ ...KAZE_SHARP_UI, ...KAZE_MONO_LABEL }, sx ?? false] : sx}
      {...props}
    />
  )
}
