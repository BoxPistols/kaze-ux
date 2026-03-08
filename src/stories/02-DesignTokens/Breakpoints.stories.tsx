import {
  Box,
  Typography,
  Stack,
  Paper,
  Grid,
  Chip,
  Divider,
  Alert,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useCallback, useEffect, useState } from 'react'

import {
  breakpointValues,
  containerMaxWidth,
  muiBreakpoints,
  touchTargets,
} from '@/themes/breakpoints'
import type { BreakpointKey } from '@/themes/breakpoints'

import type { Meta, StoryObj } from '@storybook/react-vite'

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Design Tokens/Breakpoints',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// ---------------------------------------------------------------------------
// ブレークポイント情報の定義
// ---------------------------------------------------------------------------

/** カスタムブレークポイントの表示情報 */
const breakpointInfo: {
  key: BreakpointKey
  label: string
  description: string
}[] = [
  {
    key: 'mobile',
    label: 'Mobile',
    description: 'スマートフォン（緊急時確認用）',
  },
  {
    key: 'tablet',
    label: 'Tablet',
    description: 'タブレット（将来対応）',
  },
  {
    key: 'laptop',
    label: 'Laptop',
    description: 'ノートPC最小基準（メインターゲット）',
  },
  {
    key: 'desktop',
    label: 'Desktop',
    description: 'デスクトップ推奨環境（メインターゲット）',
  },
]

/** 現在のウィンドウ幅がどのブレークポイントに該当するか判定する */
const getCurrentBreakpoint = (width: number): BreakpointKey => {
  const keys = Object.keys(breakpointValues) as BreakpointKey[]
  // 降順で探索して最初に width >= value となるキーを返す
  for (let i = keys.length - 1; i >= 0; i--) {
    if (width >= breakpointValues[keys[i]]) {
      return keys[i]
    }
  }
  return 'mobile'
}

/** ブレークポイントの範囲上限を取得 */
const getUpperBound = (key: BreakpointKey): string => {
  const keys = Object.keys(breakpointValues) as BreakpointKey[]
  const idx = keys.indexOf(key)
  if (idx === keys.length - 1) return ''
  return `${breakpointValues[keys[idx + 1]] - 1}px`
}

// ---------------------------------------------------------------------------
// useWindowWidth フック
// ---------------------------------------------------------------------------

/** ウィンドウ幅を動的に取得するフック */
const useWindowWidth = () => {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  )

  const handleResize = useCallback(() => {
    setWidth(window.innerWidth)
  }, [])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [handleResize])

  return width
}

// ---------------------------------------------------------------------------
// 1. BreakpointScale ストーリー
// ---------------------------------------------------------------------------

/** スケール全体の最大値（バー表示用） */
const SCALE_MAX = 2560

const BreakpointScaleDemo = () => {
  const theme = useTheme()
  const windowWidth = useWindowWidth()
  const currentBp = getCurrentBreakpoint(windowWidth)

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        ブレークポイント
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        最低解像度 1366x768、推奨解像度 1920x1080
        を基準としたブレークポイント設計
      </Typography>

      {/* 現在のウィンドウ幅表示 */}
      <Alert severity='info' sx={{ mb: 5 }}>
        現在のウィンドウ幅:{' '}
        <Typography
          component='span'
          sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {windowWidth}px
        </Typography>
        {' / 該当ブレークポイント: '}
        <Chip
          label={currentBp}
          color='primary'
          size='small'
          sx={{ fontWeight: 600, ml: 0.5 }}
        />
      </Alert>

      {/* ----- カスタムブレークポイント一覧 ----- */}
      <Typography variant='h5' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        カスタムブレークポイント
      </Typography>

      <Stack spacing={2} sx={{ mb: 6 }}>
        {breakpointInfo.map(({ key, label, description }) => {
          const value = breakpointValues[key]
          const upper = getUpperBound(key)
          const isActive = currentBp === key
          const barWidth = Math.min((value / SCALE_MAX) * 100, 100)

          return (
            <Paper
              key={key}
              elevation={0}
              sx={{
                p: 2,
                bgcolor: isActive ? 'primary.lighter' : 'action.hover',
                border: isActive ? 2 : 1,
                borderColor: isActive ? 'primary.main' : 'divider',
                borderStyle: 'solid',
                borderRadius: 1,
                transition: 'all 0.3s ease',
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant='body1' sx={{ fontWeight: 700 }}>
                    {label}
                  </Typography>
                  {isActive && (
                    <Chip
                      label='ACTIVE'
                      color='primary'
                      size='small'
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {value}px{upper ? ` - ${upper}` : '+'}
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 1.5 }}>
                {description}
              </Typography>

              {/* ビジュアルバー */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 12,
                  bgcolor: 'action.selected',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}>
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${barWidth}%`,
                    bgcolor: isActive
                      ? theme.palette.primary.main
                      : 'text.disabled',
                    borderRadius: 1,
                    transition: 'background-color 0.3s ease',
                  }}
                />
              </Box>
            </Paper>
          )
        })}
      </Stack>

      <Divider sx={{ mb: 5 }} />

      {/* ----- MUI ブレークポイントマッピング ----- */}
      <Typography variant='h5' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        MUI ブレークポイントマッピング
      </Typography>

      <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover', mb: 6 }}>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block', mb: 2 }}>
          MUI 標準キーとカスタムキーの対応
        </Typography>
        <Grid container spacing={2}>
          {(Object.entries(muiBreakpoints.values) as [string, number][]).map(
            ([key, value]) => (
              <Grid key={key} size={{ xs: 6, md: 4, lg: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: 1,
                    borderColor: 'divider',
                  }}>
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {key}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                    {value}px
                  </Typography>
                </Box>
              </Grid>
            )
          )}
        </Grid>
      </Paper>

      {/* ----- 全体スケールバー（セグメント表示） ----- */}
      <Typography variant='h5' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        ブレークポイントスケール
      </Typography>

      <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover' }}>
        {/* セグメント化されたバー */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 48,
            display: 'flex',
            borderRadius: 1,
            overflow: 'hidden',
            mb: 2,
          }}>
          {breakpointInfo.map(({ key, label }, idx) => {
            const value = breakpointValues[key]
            const nextValue =
              idx < breakpointInfo.length - 1
                ? breakpointValues[breakpointInfo[idx + 1].key]
                : SCALE_MAX
            const segmentWidth = ((nextValue - value) / SCALE_MAX) * 100
            const isActive = currentBp === key

            // セグメントカラー（グラデーション調）
            const colors = [
              theme.palette.primary.light,
              theme.palette.info.main,
              theme.palette.success.main,
              theme.palette.primary.main,
            ]

            return (
              <Box
                key={key}
                sx={{
                  width: `${segmentWidth}%`,
                  height: '100%',
                  bgcolor: isActive ? colors[idx] : 'action.disabled',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight:
                    idx < breakpointInfo.length - 1
                      ? '2px solid white'
                      : 'none',
                  opacity: isActive ? 1 : 0.5,
                  transition: 'all 0.3s ease',
                }}>
                <Typography
                  variant='caption'
                  sx={{
                    fontWeight: 700,
                    color: isActive ? 'white' : 'text.secondary',
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                  }}>
                  {label}
                </Typography>
              </Box>
            )
          })}

          {/* 現在のウィンドウ位置インジケーター */}
          <Box
            sx={{
              position: 'absolute',
              left: `${Math.min((windowWidth / SCALE_MAX) * 100, 100)}%`,
              top: -4,
              bottom: -4,
              width: 3,
              bgcolor: 'error.main',
              zIndex: 1,
              transition: 'left 0.15s ease',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: -6,
                left: -4,
                width: 0,
                height: 0,
                borderLeft: '5.5px solid transparent',
                borderRight: '5.5px solid transparent',
                borderTop: '6px solid',
                borderTopColor: 'error.main',
              },
            }}
          />
        </Box>

        {/* ラベル */}
        <Box sx={{ position: 'relative', width: '100%', height: 24 }}>
          {breakpointInfo.map(({ key }) => {
            const value = breakpointValues[key]
            const pos = (value / SCALE_MAX) * 100
            return (
              <Typography
                key={key}
                variant='caption'
                sx={{
                  position: 'absolute',
                  left: `${pos}%`,
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  color: 'text.secondary',
                  transform: 'translateX(-50%)',
                }}>
                {value}px
              </Typography>
            )
          })}
        </Box>
      </Paper>
    </Box>
  )
}

export const BreakpointScale: StoryObj = {
  name: 'ブレークポイントスケール',
  render: () => <BreakpointScaleDemo />,
}

// ---------------------------------------------------------------------------
// 2. ContainerWidths ストーリー
// ---------------------------------------------------------------------------

const ContainerWidthsDemo = () => {
  const theme = useTheme()

  const variants: {
    key: string
    label: string
    value: number | string
    description: string
    color: string
  }[] = [
    {
      key: 'narrow',
      label: 'Narrow',
      value: containerMaxWidth.narrow,
      description: '読みやすさ重視（フォーム、記事など）',
      color: theme.palette.info.main,
    },
    {
      key: 'standard',
      label: 'Standard',
      value: containerMaxWidth.standard,
      description: '標準コンテンツエリア（サイドバー付きページなど）',
      color: theme.palette.primary.main,
    },
    {
      key: 'wide',
      label: 'Wide',
      value: containerMaxWidth.wide,
      description: '広いコンテンツエリア（ダッシュボード、テーブルなど）',
      color: theme.palette.success.main,
    },
    {
      key: 'full',
      label: 'Full',
      value: containerMaxWidth.full,
      description: '全幅表示（マップ、フルスクリーンなど）',
      color: theme.palette.warning.main,
    },
  ]

  /** バー描画の基準幅 */
  const referenceWidth = 1920

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        コンテナ最大幅
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        レスポンシブレイアウトで使用する標準的な最大幅バリアント
      </Typography>

      <Stack spacing={3}>
        {variants.map(({ key, label, value, description, color }) => {
          const numericValue =
            typeof value === 'number' ? value : referenceWidth
          const barPercent = Math.min(
            (numericValue / referenceWidth) * 100,
            100
          )

          return (
            <Paper
              key={key}
              elevation={0}
              sx={{ p: 3, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body1' sx={{ fontWeight: 700 }}>
                    {label}
                  </Typography>
                  <Chip
                    label={key}
                    size='small'
                    variant='outlined'
                    sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                  />
                </Box>
                <Typography
                  variant='body2'
                  sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {typeof value === 'number' ? `${value}px` : value}
                </Typography>
              </Box>

              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 2 }}>
                {description}
              </Typography>

              {/* ビジュアルバー */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 24,
                  bgcolor: 'action.selected',
                  borderRadius: 1,
                  overflow: 'hidden',
                }}>
                <Box
                  sx={{
                    height: '100%',
                    width: `${barPercent}%`,
                    bgcolor: color,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pr: 1,
                  }}>
                  <Typography
                    variant='caption'
                    sx={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.65rem',
                    }}>
                    {typeof value === 'number' ? `${value}px` : '100%'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )
        })}
      </Stack>

      {/* サイズ比較 */}
      <Box sx={{ mt: 6 }}>
        <Typography variant='h5' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          サイズ比較
        </Typography>
        <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover' }}>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}>
            {variants
              .filter((v) => typeof v.value === 'number')
              .map(({ key, label, value, color }) => {
                const numValue = value as number
                const percent = (numValue / referenceWidth) * 100
                return (
                  <Box
                    key={key}
                    sx={{
                      width: `${Math.min(percent, 100)}%`,
                      height: 36,
                      bgcolor: color,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      px: 2,
                      opacity: 0.85,
                    }}>
                    <Typography
                      variant='caption'
                      sx={{
                        color: 'white',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}>
                      {label} ({numValue}px)
                    </Typography>
                  </Box>
                )
              })}
          </Box>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
            基準: {referenceWidth}px (desktop)
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export const ContainerWidths: StoryObj = {
  name: 'コンテナ最大幅',
  render: () => <ContainerWidthsDemo />,
}

// ---------------------------------------------------------------------------
// 3. TouchTargets ストーリー
// ---------------------------------------------------------------------------

const TouchTargetsDemo = () => {
  const theme = useTheme()

  const targets: {
    key: string
    label: string
    value: number
    description: string
    color: string
  }[] = [
    {
      key: 'minimum',
      label: 'Minimum',
      value: touchTargets.minimum,
      description: '最小推奨サイズ（グローブ着用時）',
      color: theme.palette.warning.main,
    },
    {
      key: 'recommended',
      label: 'Recommended',
      value: touchTargets.recommended,
      description: '推奨サイズ（一般的な操作）',
      color: theme.palette.success.main,
    },
    {
      key: 'critical',
      label: 'Critical',
      value: touchTargets.critical,
      description: '重要なアクション（緊急停止など）',
      color: theme.palette.error.main,
    },
  ]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        タッチターゲットサイズ
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
        ドローン操作環境を考慮した推奨タッチターゲットサイズ。
        グローブ着用時や屋外での利用を想定しています。
      </Typography>
      <Alert severity='warning' sx={{ mb: 5 }}>
        以下の円・正方形は実寸大で表示されています。ディスプレイの DPI
        によって見た目のサイズは異なります。
      </Alert>

      <Grid container spacing={4}>
        {targets.map(({ key, label, value, description, color }) => (
          <Grid key={key} size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'action.hover',
                borderRadius: 1,
                textAlign: 'center',
              }}>
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
                {label}
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  mb: 1,
                }}>
                {value}px
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', mb: 3 }}>
                {description}
              </Typography>

              {/* 実寸大の円 */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  mb: 2,
                }}>
                <Box
                  sx={{
                    width: value,
                    height: value,
                    borderRadius: '50%',
                    bgcolor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 0 4px ${color}33`,
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}>
                  <Typography
                    variant='caption'
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.6rem',
                    }}>
                    {value}
                  </Typography>
                </Box>

                {/* 実寸大の正方形 */}
                <Box
                  sx={{
                    width: value,
                    height: value,
                    borderRadius: 1,
                    bgcolor: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 0 4px ${color}33`,
                    opacity: 0.7,
                  }}>
                  <Typography
                    variant='caption'
                    sx={{
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.6rem',
                    }}>
                    {value}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 横並び比較 */}
      <Box sx={{ mt: 6 }}>
        <Typography variant='h5' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          サイズ比較
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: 'action.hover',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: 4,
          }}>
          {targets.map(({ key, label, value, color }) => (
            <Box key={key} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: value,
                  height: value,
                  borderRadius: '50%',
                  bgcolor: color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 1.5,
                  boxShadow: `0 0 0 4px ${color}33`,
                }}>
                <Typography
                  variant='caption'
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.6rem',
                  }}>
                  {value}
                </Typography>
              </Box>
              <Typography variant='caption' sx={{ fontWeight: 600 }}>
                {label}
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block', fontFamily: 'monospace' }}>
                {value}px
              </Typography>
            </Box>
          ))}
        </Paper>
      </Box>
    </Box>
  )
}

export const TouchTargets: StoryObj = {
  name: 'タッチターゲット',
  render: () => <TouchTargetsDemo />,
}

// ---------------------------------------------------------------------------
// 4. ResponsiveDemo ストーリー
// ---------------------------------------------------------------------------

const ResponsiveDemoView = () => {
  const theme = useTheme()
  const windowWidth = useWindowWidth()
  const currentBp = getCurrentBreakpoint(windowWidth)

  /** デモカード */
  const DemoCard = ({ title, index }: { title: string; index: number }) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.info.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.primary.dark,
    ]
    const bg = colors[index % colors.length]

    return (
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          height: 120,
          bgcolor: bg,
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 1,
        }}>
        <Typography variant='body2' sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
      </Paper>
    )
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        レスポンシブデモ
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        ウィンドウサイズを変更して、Grid の列数変化を確認してください
      </Typography>

      <Alert severity='info' sx={{ mb: 5 }}>
        現在のウィンドウ幅:{' '}
        <Typography
          component='span'
          sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
          {windowWidth}px
        </Typography>
        {' / ブレークポイント: '}
        <Chip
          label={currentBp}
          color='primary'
          size='small'
          sx={{ fontWeight: 600, ml: 0.5 }}
        />
      </Alert>

      {/* ----- パターン 1: xs=12, md=6, lg=4 ----- */}
      <Typography variant='h5' gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        パターン 1
      </Typography>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ display: 'block', mb: 2, fontFamily: 'monospace' }}>
        {'Grid size={{ xs: 12, md: 6, lg: 4 }}'}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        mobile: 1列 / tablet(md): 2列 / laptop(lg): 3列
      </Typography>
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Grid key={n} size={{ xs: 12, md: 6, lg: 4 }}>
            <DemoCard title={`Card ${n}`} index={n - 1} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 5 }} />

      {/* ----- パターン 2: xs=12, sm=6, md=4, lg=3 ----- */}
      <Typography variant='h5' gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        パターン 2
      </Typography>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ display: 'block', mb: 2, fontFamily: 'monospace' }}>
        {'Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}'}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        mobile: 1列 / sm: 2列 / tablet(md): 3列 / laptop(lg): 4列
      </Typography>
      <Grid container spacing={2} sx={{ mb: 6 }}>
        {[1, 2, 3, 4].map((n) => (
          <Grid key={n} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <DemoCard title={`Item ${n}`} index={n - 1} />
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ mb: 5 }} />

      {/* ----- パターン 3: サイドバーレイアウト ----- */}
      <Typography variant='h5' gutterBottom sx={{ fontWeight: 600, mb: 1 }}>
        パターン 3 (サイドバーレイアウト)
      </Typography>
      <Typography
        variant='caption'
        color='text.secondary'
        sx={{ display: 'block', mb: 2, fontFamily: 'monospace' }}>
        {'メイン: size={{ xs: 12, lg: 8 }} / サイド: size={{ xs: 12, lg: 4 }}'}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        mobile-tablet: 縦積み / laptop以上: サイドバー付き
      </Typography>
      <Grid container spacing={2} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: 200,
              bgcolor: theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
            }}>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              メインコンテンツ (xs:12 / lg:8)
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: 200,
              bgcolor: theme.palette.info.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1,
            }}>
            <Typography variant='h6' sx={{ fontWeight: 700 }}>
              サイドバー (xs:12 / lg:4)
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* ----- ブレークポイント別カラム数リファレンス ----- */}
      <Typography variant='h5' gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        ブレークポイント別カラム数リファレンス
      </Typography>
      <Paper elevation={0} sx={{ p: 3, bgcolor: 'action.hover' }}>
        <Grid container spacing={2}>
          {(
            [
              { bp: 'xs (mobile)', value: '0px', cols: '1列 (12/12)' },
              { bp: 'sm', value: '640px', cols: '2列 (6/12)' },
              { bp: 'md (tablet)', value: '768px', cols: '2-3列 (6/12, 4/12)' },
              {
                bp: 'lg (laptop)',
                value: '1366px',
                cols: '3-4列 (4/12, 3/12)',
              },
              { bp: 'xl (desktop)', value: '1920px', cols: '4-6列' },
            ] as const
          ).map((item) => (
            <Grid key={item.bp} size={{ xs: 12, md: 6, lg: 4 }}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}>
                <Typography variant='body2' sx={{ fontWeight: 700 }}>
                  {item.bp}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  {item.value} - {item.cols}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  )
}

export const ResponsiveDemo: StoryObj = {
  name: 'レスポンシブデモ',
  render: () => <ResponsiveDemoView />,
}
