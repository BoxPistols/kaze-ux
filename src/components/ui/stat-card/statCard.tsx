import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Box,
  LinearProgress,
  Typography,
  alpha,
  type SxProps,
  type Theme,
} from '@mui/material'

import { Card, CardContent } from '@/components/ui/Card'
import { elevation } from '@/themes/elevation'
import { KAZE_EYEBROW, KAZE_PRINT } from '@/themes/kazeMixins'
import { motionOf } from '@/themes/motion'

export interface StatCardTrend {
  /** 前期比などの向き。色と矢印がこれで決まる */
  direction: 'up' | 'down'
  /**
   * 増減の値だけ。「+12%」「-3 件」。
   *
   * **色を敷いた小片に入るのはここだけ。** 説明まで一緒に入れると、
   * カードが狭いときに小片の中で折り返して縦に伸びる（実測で 178px まで
   * 伸びた）。説明は caption 側に置いて外で折り返させる
   */
  value: string
  /**
   * 上向きが良いとは限らない（離脱率・インシデント数など）。
   * 既定は up=良い。反転させたいときに false を渡す
   */
  upIsGood?: boolean
  /** 「vs last month」のような but 期間の説明。小片の外に出す */
  caption?: string
}

export interface StatCardProgress {
  value: number
  max: number
}

export interface StatCardProps {
  /** 見出し。小さく置く前置きの語 */
  label: string
  /** 主役の数値。文字列も取る（`8/12` や `¥1,200,000` のため） */
  value: string | number
  /** 数値の下に置く補足。trend / progress と併用できる */
  caption?: string
  /** 前期比などの増減 */
  trend?: StatCardTrend
  /** 進捗。max が 0 なら 0% として扱う（0 除算で NaN を出さない） */
  progress?: StatCardProgress
  /** 右上に置くアイコン */
  icon?: React.ReactNode
  /**
   * 数値と進捗バーに使う色。
   *
   * **前景として置ける明度に補正済みの値を渡すこと。** ブランド色をそのまま
   * 渡すと、明るい色は白地で 3:1 に届かない。アプリ側に補正関数がある場合は
   * それを通した値を渡す。未指定なら本文色。
   */
  accentColor?: string
  /** hover で持ち上げる（一覧に並べて選ばせる用途） */
  interactive?: boolean
  sx?: SxProps<Theme>
}

/**
 * 数値ひとつを主役にするカード。
 *
 * ダッシュボードの KPI、進捗、集計結果のように「ラベル + 大きな数値 +
 * 補足」で成立する表示に使う。saas-dashboard と sky-kaze がそれぞれ
 * 独自に組んでいたものを 1 つにまとめた。
 *
 * 数値は等幅（KAZE_PRINT）で置く。桁が変わったときに横幅が跳ねると、
 * 並べたカードの端が揃わなくなる。
 */
export const StatCard = ({
  label,
  value,
  caption,
  trend,
  progress,
  icon,
  accentColor,
  interactive = false,
  sx,
}: StatCardProps) => {
  const pct =
    progress && progress.max > 0
      ? Math.min(100, Math.round((progress.value / progress.max) * 100))
      : 0

  const trendIsPositive = trend
    ? (trend.direction === 'up') === (trend.upIsGood ?? true)
    : false
  const trendColor = trendIsPositive ? 'success' : 'error'

  return (
    <Card
      sx={[
        interactive && {
          transition: motionOf(
            ['box-shadow', 'transform', 'border-color'],
            'short'
          ),
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: (theme: Theme) => theme.shadows[elevation.floating],
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}>
      <CardContent className='p-5'>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1,
          }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant='body2'
              sx={{ ...KAZE_EYEBROW, mb: 0.75, color: 'text.secondary' }}>
              {label}
            </Typography>
            <Typography
              component='p'
              sx={{
                ...KAZE_PRINT,
                fontSize: { xs: '1.9rem', sm: '2.2rem' },
                letterSpacing: '-0.025em',
                lineHeight: 1,
                color: accentColor ?? 'text.primary',
              }}>
              {value}
            </Typography>

            {trend && (
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mt: 1.5,
                  gap: 0.5,
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  // 面は淡く敷き、文字は前景用の段（textContrast）で置く。
                  // main をそのまま文字にすると淡い面の上で基準を割る
                  bgcolor: (theme) =>
                    alpha(theme.palette[trendColor].main, 0.08),
                }}>
                {trend.direction === 'up' ? (
                  <TrendingUpIcon
                    sx={{ fontSize: 16, color: `${trendColor}.textContrast` }}
                    aria-hidden='true'
                  />
                ) : (
                  <TrendingDownIcon
                    sx={{ fontSize: 16, color: `${trendColor}.textContrast` }}
                    aria-hidden='true'
                  />
                )}
                <Typography
                  variant='caption'
                  sx={{
                    color: `${trendColor}.textContrast`,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                  {trend.value}
                </Typography>
              </Box>
            )}

            {trend?.caption && (
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mt: 0.5, fontSize: '0.72rem' }}>
                {trend.caption}
              </Typography>
            )}

            {caption && !trend && (
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 1, fontSize: '0.9rem' }}>
                {caption}
              </Typography>
            )}
          </Box>

          {icon && <Box sx={{ flexShrink: 0, lineHeight: 0 }}>{icon}</Box>}
        </Box>

        {progress && (
          <LinearProgress
            variant='determinate'
            value={pct}
            // 進捗は視覚だけでなく値としても読めるようにする
            aria-label={`${label}: ${progress.value} / ${progress.max}`}
            sx={{
              mt: 1.5,
              height: 4,
              borderRadius: 2,
              bgcolor: (theme) =>
                alpha(accentColor ?? theme.palette.primary.main, 0.12),
              '& .MuiLinearProgress-bar': {
                borderRadius: 2,
                bgcolor: accentColor ?? 'primary.main',
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  )
}
