import { Box, Typography, type SxProps, type Theme } from '@mui/material'

export interface EmptyStateProps {
  /** 何が無いのかを述べる。「データがありません」で終わらせない */
  title: string
  /** 次に何をすればよいかを述べる */
  description?: string
  /** 状態を表すアイコン。装飾なので支援技術からは隠す */
  icon?: React.ReactNode
  /** 次の一手。ボタンやリンクを渡す */
  action?: React.ReactNode
  /** 一覧の中に差し込むときは 'compact'、画面全体なら 'page' */
  size?: 'compact' | 'page'
  sx?: SxProps<Theme>
}

const SIZE = {
  compact: { py: 6, iconSize: 40, titleVariant: 'subtitle1' as const },
  page: { py: 10, iconSize: 56, titleVariant: 'h5' as const },
}

/**
 * 空の状態。
 *
 * 一覧が 0 件になったときに、ただ何も出さないと「読み込み中なのか」
 * 「壊れているのか」「本当に無いのか」が区別できない。何が無いのかと、
 * 次に何をすればよいかを必ず出す。
 *
 * kaze-eats のカート／検索結果、saas-dashboard の未割当リストが
 * それぞれ独自に組んでいたものを 1 つにまとめた。
 *
 * 404 のような「経路の誤り」には NotFoundView を使う。こちらは
 * 「経路は正しいが中身が無い」ときのもの。
 */
export const EmptyState = ({
  title,
  description,
  icon,
  action,
  size = 'page',
  sx,
}: EmptyStateProps) => {
  const s = SIZE[size]

  return (
    <Box
      sx={[
        { textAlign: 'center', px: 3, py: s.py },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}>
      {icon && (
        <Box
          aria-hidden='true'
          sx={{
            color: 'text.disabled',
            mb: 2,
            lineHeight: 0,
            '& .MuiSvgIcon-root': { fontSize: s.iconSize },
          }}>
          {icon}
        </Box>
      )}
      <Typography
        variant={s.titleVariant}
        sx={{ fontWeight: 700, mb: description ? 1 : 0 }}>
        {title}
      </Typography>
      {description && (
        <Typography
          variant='body2'
          color='text.secondary'
          sx={{ maxWidth: 360, mx: 'auto', lineHeight: 1.8 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 3 }}>{action}</Box>}
    </Box>
  )
}
