import { Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material'

import { bestContrast, contrastRatio } from '@/themes/contrast'

import {
  LOGO_CLEAR_SPACE_RATIO,
  LOGO_GRID,
  LOGO_MIN_SIZE,
  LOGO_PRODUCTS,
  type LogoProduct,
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
  /**
   * プロダクト。tone='brand' のときの面の色を決める。
   * 形は共通で、色だけがプロダクトを識別する
   */
  product?: LogoProduct
  /** クリアスペースを余白として実際に確保する */
  withClearSpace?: boolean
  /** アクセシブルな名前。装飾目的なら空文字を渡す */
  title?: string
  sx?: SxProps<Theme>
}

/** 塗り面に乗せる図形の色の候補。どちらを使うかは面の色から実測で決める */
const ON_SURFACE_INKS = ['#ffffff', '#0A0A0A'] as const

/**
 * シンボルの幾何。
 *
 * 水平の帯を、上下から半円が挟む。半円は互いに逆側へずらして置き、
 * 左右非対称の均衡をつくる。要素は矩形と円だけで、曲線を手で描いていない。
 *
 * - 帯: グリッド中央、高さ 1/8
 * - 半円: 半径 7、中心を帯の上辺 / 下辺に置く
 * - 上の半円は左寄り、下の半円は右寄り。この食い違いが流れを生む
 *
 * 角丸・影・グラデーションは持たない。装飾を足さず、構造だけで形にする。
 */
const BAND = { x: 4, y: 14, width: 24, height: 4 } as const
const ARC_RADIUS = 7
const SHAPES = [
  // 上の半円（左寄り）
  `M${BAND.x} ${BAND.y} A${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${BAND.x + ARC_RADIUS * 2} ${BAND.y} Z`,
  // 下の半円（右寄り）
  `M${BAND.x + BAND.width - ARC_RADIUS * 2} ${BAND.y + BAND.height} A${ARC_RADIUS} ${ARC_RADIUS} 0 0 0 ${BAND.x + BAND.width} ${BAND.y + BAND.height} Z`,
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
  product,
  title,
}: {
  size: number
  tone: LogoTone
  product: LogoProduct
  title?: string
}) => {
  const filled = tone === 'brand'
  const surface = LOGO_PRODUCTS[product]
  const strokeColor =
    tone === 'brand'
      ? bestContrast(surface, ON_SURFACE_INKS)
      : tone === 'inverse'
        ? '#ffffff'
        : tone === 'ink'
          ? '#0A0A0A'
          : // outline: 面を持たずブランド色で描く。テーマの primary に
            // 従わせるとロゴだけ別系統の色になり、ブランドが分裂する
            surface

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
      {filled && <rect width={LOGO_GRID} height={LOGO_GRID} fill={surface} />}
      <g fill={strokeColor}>
        <rect x={BAND.x} y={BAND.y} width={BAND.width} height={BAND.height} />
        {SHAPES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  )
}

const Wordmark = ({
  size,
  tone,
  hidden,
}: {
  size: number
  tone: LogoTone
  /** シンボルが名前を持つ場合、ワードマークは読み上げを重複させる */
  hidden?: boolean
}) => {
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
      aria-hidden={hidden || undefined}
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
  product = 'kaze',
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
      // title='' は「装飾」の意思表示。シンボルだけでなくワードマークも隠す
      aria-hidden={title === '' || undefined}
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
        <Symbol
          size={resolvedSize}
          tone={resolvedTone}
          product={product}
          title={title}
        />
      )}
      {variant !== 'symbol' && (
        <Wordmark
          size={resolvedSize}
          tone={resolvedTone}
          // horizontal ではシンボルの aria-label が名前を提供する
          hidden={variant === 'horizontal'}
        />
      )}
    </Box>
  )
}
