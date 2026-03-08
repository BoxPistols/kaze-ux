import {
  Box,
  Typography,
  Paper,
  Chip,
  Stack,
  Divider,
  Grid,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import {
  breakpointValues,
  containerMaxWidth,
  touchTargets,
} from '@/themes/breakpoints'
import { fontSizesVariant, typographyOptions } from '@/themes/typography'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design Tokens/Token Overview',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          '全デザイントークンの一覧表示。カラー、タイポグラフィ、スペーシング等のトークン値をカテゴリ別に確認できる。',
      },
    },
  },
}

export default meta

// テーマの全デザイントークンを一覧表示するダッシュボード

const TokenOverview = () => {
  const theme = useTheme()
  const baseSpacing = Number.parseFloat(theme.spacing(1))

  // セマンティックカラー一覧
  const semanticColors = (
    ['primary', 'secondary', 'success', 'info', 'warning', 'error'] as const
  ).map((name) => {
    const palette = theme.palette[name]
    return { name, main: palette.main }
  })

  // グレースケール
  const greys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        デザイントークン概要
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        kaze-ux-themeで定義されている全デザイントークンの俯瞰。各カテゴリの詳細は個別ページを参照
      </Typography>

      <Grid container spacing={4}>
        {/* カラーパレット概要 */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            variant='outlined'
            sx={{ p: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
              カラーパレット
            </Typography>

            {/* セマンティックカラー */}
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5 }}>
              セマンティックカラー
            </Typography>
            <Stack direction='row' spacing={1} sx={{ mb: 3 }} flexWrap='wrap'>
              {semanticColors.map((c) => (
                <Box key={c.name} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: c.main,
                      borderRadius: 1.5,
                      mb: 0.5,
                    }}
                  />
                  <Typography
                    variant='caption'
                    sx={{ fontSize: '0.625rem', color: 'text.secondary' }}>
                    {c.name}
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* グレースケール */}
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5 }}>
              グレースケール
            </Typography>
            <Stack direction='row' spacing={0.5} sx={{ mb: 3 }}>
              {greys.map((shade) => (
                <Box
                  key={shade}
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: `grey.${shade}`,
                    borderRadius: 0.5,
                  }}
                />
              ))}
            </Stack>

            {/* テキスト・背景 */}
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5 }}>
              テキスト & 背景
            </Typography>
            <Stack direction='row' spacing={1}>
              {[
                { label: 'text.primary', color: theme.palette.text.primary },
                {
                  label: 'text.secondary',
                  color: theme.palette.text.secondary,
                },
                {
                  label: 'bg.default',
                  color: theme.palette.background.default,
                },
                { label: 'bg.paper', color: theme.palette.background.paper },
              ].map((t) => (
                <Box key={t.label} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 32,
                      bgcolor: t.color,
                      borderRadius: 0.5,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Typography
                    variant='caption'
                    sx={{ fontSize: '0.5625rem', color: 'text.secondary' }}>
                    {t.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* タイポグラフィ概要 */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper
            variant='outlined'
            sx={{ p: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
              タイポグラフィ
            </Typography>

            <Stack spacing={1} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2' color='text.secondary'>
                  フォントファミリー
                </Typography>
                <Typography variant='body2' sx={{ fontWeight: 500 }}>
                  Inter, Noto Sans JP
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2' color='text.secondary'>
                  基準フォントサイズ
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                  {typographyOptions.fontSize}px
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2' color='text.secondary'>
                  最小本文サイズ
                </Typography>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                  12px
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5 }}>
              サイズスケール
            </Typography>
            <Stack spacing={0.5}>
              {Object.entries(fontSizesVariant).map(([name, value]) => {
                const px = Math.round(
                  parseFloat(value) * (typographyOptions.htmlFontSize ?? 14)
                )
                return (
                  <Box
                    key={name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}>
                    <Typography
                      variant='caption'
                      sx={{
                        fontFamily: 'monospace',
                        minWidth: 100,
                        color: 'primary.main',
                      }}>
                      {name}
                    </Typography>
                    <Box
                      sx={{
                        width: px * 1.5,
                        height: 4,
                        bgcolor: 'primary.main',
                        borderRadius: 0.5,
                        opacity: 0.5,
                        minWidth: 4,
                      }}
                    />
                    <Typography
                      variant='caption'
                      sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                      {px}px
                    </Typography>
                  </Box>
                )
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* スペーシング概要 */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Paper
            variant='outlined'
            sx={{ p: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
              スペーシング
            </Typography>

            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              基本単位: {baseSpacing}px
            </Typography>

            <Stack spacing={1}>
              {[1, 2, 3, 4, 6, 8, 12].map((m) => (
                <Box
                  key={m}
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography
                    variant='caption'
                    sx={{ fontFamily: 'monospace', minWidth: 24 }}>
                    {m}
                  </Typography>
                  <Box
                    sx={{
                      width: baseSpacing * m,
                      height: 8,
                      bgcolor: 'primary.main',
                      borderRadius: 0.5,
                      opacity: 0.6,
                    }}
                  />
                  <Typography
                    variant='caption'
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                    {baseSpacing * m}px
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* シャドウ概要 */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <Paper
            variant='outlined'
            sx={{ p: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
              エレベーション
            </Typography>

            <Stack spacing={2}>
              {[0, 1, 2, 3, 4, 5].map((elevation) => (
                <Box
                  key={elevation}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 32,
                      bgcolor: 'background.paper',
                      borderRadius: 1,
                      boxShadow: theme.shadows[elevation],
                      border: elevation === 0 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    variant='caption'
                    sx={{ fontFamily: 'monospace' }}>
                    elevation {elevation}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5 }}>
              角丸
            </Typography>
            <Stack direction='row' spacing={1.5}>
              {[6, 8, 12, 16].map((r) => (
                <Box key={r} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'primary.lighter',
                      borderRadius: `${r}px`,
                    }}
                  />
                  <Typography
                    variant='caption'
                    sx={{ fontFamily: 'monospace', fontSize: '0.625rem' }}>
                    {r}px
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* ブレークポイント概要 */}
        <Grid size={{ xs: 12, md: 12, lg: 4 }}>
          <Paper
            variant='outlined'
            sx={{ p: 4, borderRadius: 2, height: '100%' }}>
            <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
              ブレークポイント
            </Typography>

            <Stack spacing={1} sx={{ mb: 3 }}>
              {Object.entries(breakpointValues).map(([name, value]) => (
                <Box
                  key={name}
                  sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {name}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                    {value}px
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5 }}>
              コンテナ幅
            </Typography>
            <Stack spacing={0.5}>
              {Object.entries(containerMaxWidth).map(([variant, value]) => (
                <Box
                  key={variant}
                  sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Chip label={variant} size='small' variant='outlined' />
                  <Typography
                    variant='caption'
                    sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                    {typeof value === 'number' ? `${value}px` : value}
                  </Typography>
                </Box>
              ))}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1.5 }}>
              タッチターゲット
            </Typography>
            <Stack direction='row' spacing={1.5}>
              {Object.entries(touchTargets).map(([name, size]) => (
                <Box key={name} sx={{ textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: size,
                      height: size,
                      borderRadius: '50%',
                      bgcolor: 'primary.lighter',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <Typography
                      variant='caption'
                      sx={{ fontFamily: 'monospace', fontSize: '0.5625rem' }}>
                      {size}
                    </Typography>
                  </Box>
                  <Typography
                    variant='caption'
                    sx={{ fontSize: '0.5625rem', color: 'text.secondary' }}>
                    {name}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export const Default: StoryObj = {
  name: 'トークン概要',
  render: () => <TokenOverview />,
}
