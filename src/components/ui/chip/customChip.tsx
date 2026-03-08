import { Chip, type ChipProps } from '@mui/material'

export type CustomChipProps = ChipProps

/**
 * カスタムチップコンポーネント
 * テーマスタイルを適用したシンプルなChipラッパー
 */
export const CustomChip = ({ ...props }: CustomChipProps) => {
  return <Chip size='medium' {...props} />
}
