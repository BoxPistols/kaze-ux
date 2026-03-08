import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import {
  Box,
  Typography,
  Stack,
  Paper,
  Grid,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useState, useCallback, useRef, useEffect } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design Tokens/Motion',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// --- イージングカーブの可視化 ---

// ベジェ曲線の座標を計算するユーティリティ
// 簡易版: p0=0, p3=1 を前提とした3次ベジェ
const cubicBezier = (t: number, cp1: number, cp2: number): number => {
  const u = 1 - t
  return 3 * u * u * t * cp1 + 3 * u * t * t * cp2 + t * t * t
}

// ベジェ曲線のSVGパスを生成
const generateBezierPath = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number,
  height: number
): string => {
  const points: string[] = []
  const steps = 60

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = cubicBezier(t, x1, x2) * width
    // Y軸は反転（SVGは上が0）
    const y = height - cubicBezier(t, y1, y2) * height
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
  }

  return points.join(' ')
}

// ベジェ曲線の制御点をパースする
const parseCubicBezier = (value: string): [number, number, number, number] => {
  const match = value.match(/cubic-bezier\(([^)]+)\)/)
  if (!match) return [0, 0, 1, 1]
  const parts = match[1].split(',').map((s) => Number.parseFloat(s.trim()))
  return [parts[0], parts[1], parts[2], parts[3]]
}

// イージングカーブ可視化コンポーネント
const EasingCurveCard = ({
  name,
  value,
  description,
}: {
  name: string
  value: string
  description: string
}) => {
  const theme = useTheme()
  const [isAnimating, setIsAnimating] = useState(false)
  const [bezierPoints] = useState(() => parseCubicBezier(value))

  const svgWidth = 200
  const svgHeight = 200
  const padding = 20

  const path = generateBezierPath(
    bezierPoints[0],
    bezierPoints[1],
    bezierPoints[2],
    bezierPoints[3],
    svgWidth - padding * 2,
    svgHeight - padding * 2
  )

  const handlePlay = useCallback(() => {
    setIsAnimating(false)
    // requestAnimationFrameで次フレームに遅延させてアニメーションをリセット
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    })
  }, [])

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
      }}>
      <Stack spacing={2}>
        {/* ヘッダー */}
        <Box>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            {name}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {description}
          </Typography>
          <Typography
            variant='caption'
            sx={{
              fontFamily: 'monospace',
              color: 'primary.main',
              fontWeight: 600,
              display: 'block',
              mt: 0.5,
            }}>
            {value}
          </Typography>
        </Box>

        {/* SVGカーブ表示 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            borderRadius: 2,
            p: 1,
          }}>
          <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ overflow: 'visible' }}>
            {/* グリッド線 */}
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={svgHeight - padding}
              stroke={theme.palette.divider}
              strokeWidth='1'
              strokeDasharray='4 4'
            />
            <line
              x1={padding}
              y1={svgHeight - padding}
              x2={svgWidth - padding}
              y2={svgHeight - padding}
              stroke={theme.palette.divider}
              strokeWidth='1'
              strokeDasharray='4 4'
            />
            <line
              x1={svgWidth - padding}
              y1={padding}
              x2={svgWidth - padding}
              y2={svgHeight - padding}
              stroke={theme.palette.divider}
              strokeWidth='1'
              strokeDasharray='4 4'
            />
            <line
              x1={padding}
              y1={padding}
              x2={svgWidth - padding}
              y2={padding}
              stroke={theme.palette.divider}
              strokeWidth='1'
              strokeDasharray='4 4'
            />

            {/* 対角線（linear参考線） */}
            <line
              x1={padding}
              y1={svgHeight - padding}
              x2={svgWidth - padding}
              y2={padding}
              stroke={theme.palette.divider}
              strokeWidth='1'
            />

            {/* 軸ラベル */}
            <text
              x={svgWidth / 2}
              y={svgHeight - 2}
              textAnchor='middle'
              fontSize='10'
              fill={theme.palette.text.secondary}>
              時間
            </text>
            <text
              x={4}
              y={svgHeight / 2}
              textAnchor='middle'
              fontSize='10'
              fill={theme.palette.text.secondary}
              transform={`rotate(-90, 8, ${svgHeight / 2})`}>
              進捗
            </text>

            {/* ベジェ曲線 */}
            <g transform={`translate(${padding}, ${padding})`}>
              <path
                d={path}
                fill='none'
                stroke={theme.palette.primary.main}
                strokeWidth='3'
                strokeLinecap='round'
              />
            </g>

            {/* 制御点の表示 */}
            <g transform={`translate(${padding}, ${padding})`}>
              {/* P0 -> CP1 */}
              <line
                x1={0}
                y1={svgHeight - padding * 2}
                x2={bezierPoints[0] * (svgWidth - padding * 2)}
                y2={(1 - bezierPoints[1]) * (svgHeight - padding * 2)}
                stroke={theme.palette.error.main}
                strokeWidth='1'
                strokeDasharray='3 3'
                opacity={0.6}
              />
              <circle
                cx={bezierPoints[0] * (svgWidth - padding * 2)}
                cy={(1 - bezierPoints[1]) * (svgHeight - padding * 2)}
                r='4'
                fill={theme.palette.error.main}
              />

              {/* P3 -> CP2 */}
              <line
                x1={svgWidth - padding * 2}
                y1={0}
                x2={bezierPoints[2] * (svgWidth - padding * 2)}
                y2={(1 - bezierPoints[3]) * (svgHeight - padding * 2)}
                stroke={theme.palette.info.main}
                strokeWidth='1'
                strokeDasharray='3 3'
                opacity={0.6}
              />
              <circle
                cx={bezierPoints[2] * (svgWidth - padding * 2)}
                cy={(1 - bezierPoints[3]) * (svgHeight - padding * 2)}
                r='4'
                fill={theme.palette.info.main}
              />
            </g>
          </svg>
        </Box>

        {/* アニメーションデモ */}
        <Box>
          <Button
            size='small'
            variant='outlined'
            startIcon={<PlayArrowIcon />}
            onClick={handlePlay}
            sx={{ mb: 1.5 }}>
            再生
          </Button>
          <Box
            sx={{
              position: 'relative',
              height: 40,
              bgcolor: 'background.paper',
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
            }}>
            <Box
              sx={{
                position: 'absolute',
                top: 4,
                left: isAnimating ? 'calc(100% - 36px)' : '4px',
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                borderRadius: 1.5,
                transition: isAnimating ? `left 600ms ${value}` : 'none',
              }}
            />
          </Box>
        </Box>
      </Stack>
    </Paper>
  )
}

const EasingCurves = () => {
  const theme = useTheme()
  const easings = theme.transitions.easing

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        イージングカーブ
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        トランジションに使用するイージング関数の定義。ベジェ曲線の形状と実際のアニメーション効果を確認できます。
      </Typography>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <EasingCurveCard
            name='Sharp'
            value={easings.sharp}
            description='素早い応答が必要なUI操作に使用。加速・減速が均等で、キビキビとした印象を与えます。'
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <EasingCurveCard
            name='Smooth'
            value={easings.smooth}
            description='自然で滑らかな動きが必要な場面に使用。減速が緩やかで、エレガントな印象を与えます。'
          />
        </Grid>
      </Grid>

      {/* CSS値一覧テーブル */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 3,
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}>
        <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
          イージング値一覧 (CSS)
        </Typography>
        <Stack spacing={1.5}>
          {Object.entries(easings).map(([key, value]) => (
            <Box
              key={key}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1,
                px: 2,
                bgcolor: 'background.paper',
                borderRadius: 1.5,
              }}>
              <Chip
                label={key}
                size='small'
                color='primary'
                variant='outlined'
              />
              <Typography
                variant='body2'
                sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}

export const EasingCurvesStory: StoryObj = {
  name: 'イージングカーブ',
  render: () => <EasingCurves />,
}

// --- デュレーションスケール ---

// プログレスバーアニメーションコンポーネント
const DurationBar = ({
  label,
  durationMs,
  isFromTheme,
  isPlaying,
}: {
  label: string
  durationMs: number
  isFromTheme: boolean
  isPlaying: boolean
}) => {
  const theme = useTheme()

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: 'action.hover',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid',
        borderColor: isFromTheme ? 'primary.light' : 'divider',
        borderRadius: 2,
      }}>
      {/* ラベル */}
      <Box
        sx={{ minWidth: 120, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant='body2'
          sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
          {durationMs}ms
        </Typography>
        {isFromTheme && (
          <Chip
            label='テーマ定義'
            size='small'
            color='primary'
            sx={{ height: 20 }}
          />
        )}
      </Box>

      {/* ラベル説明 */}
      <Box sx={{ minWidth: 120 }}>
        <Typography variant='caption' color='text.secondary'>
          {label}
        </Typography>
      </Box>

      {/* プログレスバー */}
      <Box
        sx={{
          flex: 1,
          height: 28,
          bgcolor: 'background.paper',
          borderRadius: 1.5,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid',
          borderColor: 'divider',
        }}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: isPlaying ? '100%' : '0%',
            bgcolor: isFromTheme ? 'primary.main' : 'text.disabled',
            borderRadius: 1,
            transition: isPlaying
              ? `width ${durationMs}ms ${theme.transitions.easing.smooth}`
              : 'none',
          }}
        />
        {/* 時間表示 */}
        <Typography
          variant='caption'
          sx={{
            position: 'absolute',
            right: 8,
            top: '50%',
            transform: 'translateY(-50%)',
            fontFamily: 'monospace',
            fontWeight: 600,
            color: 'text.secondary',
            fontSize: '0.7rem',
            zIndex: 1,
            mixBlendMode: 'difference',
          }}>
          {durationMs}ms
        </Typography>
      </Box>
    </Paper>
  )
}

const DurationScale = () => {
  const theme = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)

  // テーマ定義のデュレーション
  const themeDurations = theme.transitions.duration

  // 表示するデュレーション一覧
  const durations = [
    {
      label: '参考値',
      durationMs: 100,
      isFromTheme: false,
    },
    {
      label: 'leavingScreen',
      durationMs: themeDurations.leavingScreen,
      isFromTheme: true,
    },
    {
      label: 'enteringScreen',
      durationMs: themeDurations.enteringScreen,
      isFromTheme: true,
    },
    {
      label: '参考値',
      durationMs: 300,
      isFromTheme: false,
    },
    {
      label: '参考値',
      durationMs: 500,
      isFromTheme: false,
    },
  ]

  const handlePlay = useCallback(() => {
    setIsPlaying(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsPlaying(true)
      })
    })
  }, [])

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        デュレーションスケール
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        トランジションに使用する時間の定義。テーマで定義された値と参考値を比較できます。
      </Typography>

      <Button
        variant='contained'
        startIcon={isPlaying ? <ReplayIcon /> : <PlayArrowIcon />}
        onClick={handlePlay}
        sx={{ mb: 3 }}>
        {isPlaying ? 'リプレイ' : '一斉再生'}
      </Button>

      <Stack spacing={1.5}>
        {durations.map((d, index) => (
          <DurationBar
            key={`${d.label}-${d.durationMs}-${index}`}
            label={d.label}
            durationMs={d.durationMs}
            isFromTheme={d.isFromTheme}
            isPlaying={isPlaying}
          />
        ))}
      </Stack>

      {/* テーマ定義値のサマリー */}
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 3,
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}>
        <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
          テーマ定義値
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(themeDurations).map(([key, value]) => (
            <Grid key={key} size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1,
                  px: 2,
                  bgcolor: 'background.paper',
                  borderRadius: 1.5,
                }}>
                <Chip
                  label={key}
                  size='small'
                  color='primary'
                  variant='outlined'
                />
                <Typography
                  variant='body2'
                  sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {value}ms
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  )
}

export const DurationScaleStory: StoryObj = {
  name: 'デュレーションスケール',
  render: () => <DurationScale />,
}

// --- インタラクティブデモ ---

const InteractiveDemo = () => {
  const theme = useTheme()
  const [selectedEasing, setSelectedEasing] = useState<string>('sharp')
  const [selectedDuration, setSelectedDuration] = useState<number>(
    theme.transitions.duration.enteringScreen
  )
  const [isAnimating, setIsAnimating] = useState(false)
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 利用可能なイージング
  const easingOptions: Record<string, string> = {
    sharp: theme.transitions.easing.sharp,
    smooth: theme.transitions.easing.smooth,
  }

  // 利用可能なデュレーション
  const durationOptions = [
    { label: '100ms (参考)', value: 100 },
    {
      label: `${theme.transitions.duration.leavingScreen}ms (leavingScreen)`,
      value: theme.transitions.duration.leavingScreen,
    },
    {
      label: `${theme.transitions.duration.enteringScreen}ms (enteringScreen)`,
      value: theme.transitions.duration.enteringScreen,
    },
    { label: '300ms (参考)', value: 300 },
    { label: '500ms (参考)', value: 500 },
  ]

  const currentEasingValue =
    easingOptions[selectedEasing] || easingOptions.sharp

  // アニメーション再生
  const handlePlay = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    setIsAnimating(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true)
      })
    })
  }, [])

  // アニメーションリセット
  const handleReset = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    setIsAnimating(false)
  }, [])

  // コンポーネントのアンマウント時にタイムアウトをクリア
  useEffect(() => {
    const timeoutId = animationTimeoutRef.current
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        インタラクティブデモ
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        イージングとデュレーションの組み合わせを試して、アニメーションの違いを確認できます。
      </Typography>

      <Grid container spacing={4}>
        {/* コントロールパネル */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            }}>
            <Typography variant='h6' sx={{ fontWeight: 600, mb: 3 }}>
              設定
            </Typography>

            <Stack spacing={3}>
              {/* イージング選択 */}
              <FormControl fullWidth size='small'>
                <InputLabel>イージング</InputLabel>
                <Select
                  value={selectedEasing}
                  label='イージング'
                  onChange={(e) => setSelectedEasing(e.target.value)}>
                  {Object.entries(easingOptions).map(([key, value]) => (
                    <MenuItem key={key} value={key}>
                      <Box>
                        <Typography variant='body2' sx={{ fontWeight: 600 }}>
                          {key}
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                          {value}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* デュレーション選択 */}
              <FormControl fullWidth size='small'>
                <InputLabel>デュレーション</InputLabel>
                <Select
                  value={selectedDuration}
                  label='デュレーション'
                  onChange={(e) => setSelectedDuration(Number(e.target.value))}>
                  {durationOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 現在の設定表示 */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'primary.light',
                  borderRadius: 2,
                }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ display: 'block', mb: 1 }}>
                  CSS transition値
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: 'primary.main',
                    wordBreak: 'break-all',
                  }}>
                  {`all ${selectedDuration}ms ${currentEasingValue}`}
                </Typography>
              </Paper>

              {/* 再生ボタン */}
              <Stack direction='row' spacing={1.5}>
                <Button
                  variant='contained'
                  startIcon={<PlayArrowIcon />}
                  onClick={handlePlay}
                  fullWidth>
                  再生
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<ReplayIcon />}
                  onClick={handleReset}
                  fullWidth>
                  リセット
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        {/* アニメーション表示エリア */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={3}>
            {/* メインアニメーションエリア */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
              }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
                横移動
              </Typography>
              <Box
                sx={{
                  position: 'relative',
                  height: 60,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                {/* トラックのガイドライン */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 12,
                    right: 12,
                    height: 2,
                    bgcolor: 'action.selected',
                    transform: 'translateY(-50%)',
                    borderRadius: 1,
                  }}
                />
                {/* アニメーションボックス */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: isAnimating ? 'calc(100% - 52px)' : '12px',
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: isAnimating
                      ? `left ${selectedDuration}ms ${currentEasingValue}`
                      : 'none',
                    boxShadow: 2,
                  }}>
                  <PlayArrowIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
              </Box>
            </Paper>

            {/* スケール変更アニメーション */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
              }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
                スケール変化
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 100,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: 'secondary.main',
                    borderRadius: 2,
                    transform: isAnimating ? 'scale(1.5)' : 'scale(1)',
                    transition: isAnimating
                      ? `transform ${selectedDuration}ms ${currentEasingValue}`
                      : 'none',
                    boxShadow: 2,
                  }}
                />
              </Box>
            </Paper>

            {/* 透明度アニメーション */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
              }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
                フェード
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 80,
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                <Box
                  sx={{
                    width: 120,
                    height: 48,
                    bgcolor: 'info.main',
                    borderRadius: 2,
                    opacity: isAnimating ? 1 : 0.15,
                    transition: isAnimating
                      ? `opacity ${selectedDuration}ms ${currentEasingValue}`
                      : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 2,
                  }}>
                  <Typography
                    variant='caption'
                    sx={{ color: 'white', fontWeight: 600 }}>
                    Fade In
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* 全イージング比較 */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: 'action.hover',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
              }}>
              <Typography variant='h6' sx={{ fontWeight: 600, mb: 2 }}>
                イージング比較 (同一デュレーション: {selectedDuration}ms)
              </Typography>
              <Stack spacing={2}>
                {Object.entries(easingOptions).map(([key, value]) => (
                  <Box key={key}>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ fontWeight: 600, mb: 0.5, display: 'block' }}>
                      {key}
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        height: 36,
                        bgcolor: 'background.paper',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 4,
                          left: isAnimating ? 'calc(100% - 32px)' : '4px',
                          width: 28,
                          height: 28,
                          bgcolor:
                            key === selectedEasing
                              ? 'primary.main'
                              : 'text.disabled',
                          borderRadius: 1,
                          transition: isAnimating
                            ? `left ${selectedDuration}ms ${value}`
                            : 'none',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export const InteractiveDemoStory: StoryObj = {
  name: 'インタラクティブデモ',
  render: () => <InteractiveDemo />,
}
