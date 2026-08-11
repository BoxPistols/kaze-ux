import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material'

import { contrastRatio } from '@/themes/contrast'

import {
  LOGO_CLEAR_SPACE_RATIO,
  LOGO_GRID,
  LOGO_MIN_SIZE,
  type LogoTone,
  type LogoVariant,
} from './logoRules'


export interface KazeLogoProps {
  /** 構成。既定はシンボルのみ */
  variant?: LogoVariant
  /**
   * 一辺の px。用途ごとの最小サイズを下回る指定は、
   * レギュレーション側の下限に丸められる
   */
  size?: number
  /** 配色。'auto' は背景の明度から ink / inverse を選ぶ */
  tone?: LogoTone | 'auto'
  /** クリアスペースを余白として実際に確保する */
  withClearSpace?: boolean
  /** アクセシブルな名前。装飾目的なら空文字を渡す */
  title?: string
  sx?: SxProps<Theme>
}

/**
 * ストロークの太さ。グリッドの 1/12。
 * これ以上細いと 16px で 1px を割り、太いと右端の抜けが潰れる。
 */
const STROKE = LOGO_GRID / 12

/**
 * 三本のストローク。
 *
 * 左端を揃え、長さを 短 / 長 / 中 と変える。右端は同じ半径・同じ角度で
 * 上へ抜き、同じ気流に乗っていることを示す。
 */
const STROKES = [
  // 上: 短い
  `M7 10.5 H16 a4 4 0 0 0 4-4`,
  // 中: 主線。最も長く、視覚的な重心を担う
  `M7 16 H21 a4.5 4.5 0 0 0 4.5-4.5`,
  // 下: 中間
  `M7 21.5 H18.5 a4 4 0 0 0 4-4`,
] as const

/** 背景の明度から、面を持たない単色トーンを選ぶ */
const resolveAutoTone = (background: string): LogoTone => {
  try {
    return contrastRatio('#0A0A0A', background) >=
      contrastRatio('#ffffff', background)
      ? 'ink'
      : 'inverse'
  } catch {
    return 'ink'
  }
}

const Symbol = ({
  size,
  tone,
  title,
}: {
  size: number
  tone: LogoTone
  title?: string
}) => {
  const theme = useTheme()

  const filled = tone === 'brand'
  const strokeColor =
    tone === 'brand'
      ? theme.palette.primary.contrastText
      : tone === 'inverse'
        ? '#ffffff'
        : tone === 'ink'
          ? '#0A0A0A'
          : theme.palette.primary.textContrast

  const labelled = title !== ''

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${LOGO_GRID} ${LOGO_GRID}`}
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? (title ?? 'Kaze') : undefined}
      aria-hidden={labelled ? undefined : true}
      focusable='false'>
      {filled && (
        <rect
          width={LOGO_GRID}
          height={LOGO_GRID}
          rx={LOGO_GRID / 5}
          fill={theme.palette.primary.main}
        />
      )}
      <g
        fill='none'
        stroke={strokeColor}
        strokeWidth={STROKE}
        strokeLinecap='round'>
        {STROKES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  )
}

const Wordmark = ({ size, tone }: { size: number; tone: LogoTone }) => {
  const theme = useTheme()

  const color =
    tone === 'inverse'
      ? '#ffffff'
      : tone === 'ink'
        ? '#0A0A0A'
        : theme.palette.text.primary

  return (
    <Box
      component='span'
      sx={{
        color,
        // シンボルの主線と光学的に揃うよう、グリッドに対する比で決める
        fontSize: `${size * 0.5}px`,
        fontWeight: 600,
        // 大きい文字ほど字間を詰める光学調整に合わせる
        letterSpacing: '-0.02em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
      Kaze
    </Box>
  )
}

/**
 * Kaze のロゴ。
 *
 * レギュレーション（`logoRules.ts`）を実装で強制する。縦横比・配色・
 * 角丸は props で変えられない。最小サイズを下回る指定は下限に丸める。
 *
 * @example
 * <KazeLogo />                                   // シンボル 24px
 * <KazeLogo variant='horizontal' size={32} />    // シンボル + ワードマーク
 * <KazeLogo tone='inverse' withClearSpace />     // 暗い面に、余白込みで
 */
export const KazeLogo = ({
  variant = 'symbol',
  size = LOGO_MIN_SIZE.ui,
  tone = 'brand',
  withClearSpace = false,
  title,
  sx,
}: KazeLogoProps) => {
  const theme = useTheme()

  // 規定を下回るサイズ指定は下限に丸める（縮小してまで置かない）
  const minimum =
    variant === 'symbol' ? LOGO_MIN_SIZE.icon : LOGO_MIN_SIZE.withWordmark
  const resolvedSize = Math.max(size, minimum)

  const resolvedTone =
    tone === 'auto' ? resolveAutoTone(theme.palette.background.default) : tone

  const clearSpace = withClearSpace ? resolvedSize * LOGO_CLEAR_SPACE_RATIO : 0

  return (
    <Box
      sx={[
        {
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${resolvedSize * 0.3}px`,
          padding: `${clearSpace}px`,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}>
      {variant !== 'wordmark' && (
        <Symbol size={resolvedSize} tone={resolvedTone} title={title} />
      )}
      {variant !== 'symbol' && (
        <Wordmark size={resolvedSize} tone={resolvedTone} />
      )}
    </Box>
  )
}
