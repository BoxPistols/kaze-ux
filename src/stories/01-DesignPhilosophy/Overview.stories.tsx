import { Box, Typography, Grid, Stack } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'

import { motionOf } from '@/themes/motion'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design Philosophy/Overview',
  parameters: {
    layout: 'padded',
    docs: {
      page: null,
    },
  },
}

export default meta

const DesignPhilosophyOverview = () => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const brandIdentity = {
    slogan: 'デザインを、構造で支える',
    mission: '一貫した構造の上に、複数のプロダクトを置く',
    vision: [
      '共通の構造から、異なる表現が生まれる',
      '同じものは、同じ形で現れる',
      '見えないところに、精度がある',
    ],
    values: [
      {
        title: '精度',
        color: 'primary.textContrast',
        attributes: ['正確', '均質', '厳密', '再現', '一貫'],
      },
      {
        title: '簡潔',
        color: '#1dafc2',
        attributes: ['簡素', '余白', '抑制', '静穏', '無駄がない'],
      },
      {
        title: '中立',
        color: '#46ab4a',
        attributes: ['非依存', '汎用', '可搬', '開放', '継承'],
      },
    ],
  }

  const designPrinciples = [
    {
      num: '01',
      title: '単一の規則',
      description: 'すべての画面が、同じ規則の上にある',
      details: '用途が増えても、規則は増えない',
    },
    {
      num: '02',
      title: '最小の構成',
      description: '画面にあるものは、役割を持つ',
      details: '装飾は含まない',
    },
    {
      num: '03',
      title: '役割と形の一致',
      description: '同じ役割は、同じ形をとる',
      details: '例外を持たない',
    },
  ]

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto' }}>
      {/* ヒーロー */}
      <Box
        sx={{
          px: { xs: 4, sm: 7 },
          py: { xs: 7, sm: 10 },
          mb: 10,
          borderRadius: 4,
          position: 'relative',
          overflow: 'hidden',
          background: isDark
            ? 'linear-gradient(160deg, #1a1f3e 0%, #0f1628 40%, #131926 100%)'
            : 'linear-gradient(160deg, #f0f4ff 0%, #e8eeff 40%, #f5f0ff 100%)',
          border: 1,
          borderColor: isDark
            ? 'rgba(100,130,255,0.12)'
            : alpha(theme.palette.primary.main, 0.08),
        }}>
        {/* 装飾: グリッドドット */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 200,
            height: 200,
            opacity: isDark ? 0.06 : 0.04,
            backgroundImage:
              'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <Typography
          variant='overline'
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: isDark ? 'primary.light' : 'primary.main',
            mb: 2,
            display: 'block',
          }}>
          KAZE UX DESIGN SYSTEM
        </Typography>
        <Typography
          variant='h1'
          sx={{
            fontWeight: 700,
            fontSize: { xs: 32, sm: 44 },
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            mb: 3,
            color: isDark ? 'grey.50' : 'grey.900',
          }}>
          Design System
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 18, sm: 22 },
            fontWeight: 400,
            letterSpacing: '0.08em',
            color: isDark ? 'grey.400' : 'grey.600',
          }}>
          {brandIdentity.slogan}
        </Typography>
      </Box>

      {/* ミッション */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <Typography
          variant='overline'
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'primary.main',
            mb: 1.5,
            display: 'block',
          }}>
          MISSION
        </Typography>
        <Typography
          sx={{
            fontSize: { xs: 20, sm: 26 },
            fontWeight: 700,
            lineHeight: 1.6,
            letterSpacing: '-0.01em',
            color: isDark ? 'grey.100' : 'grey.900',
            maxWidth: 700,
          }}>
          {brandIdentity.mission}
        </Typography>
      </Box>

      {/* ビジョン */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <Typography
          variant='overline'
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'primary.main',
            mb: 4,
            display: 'block',
          }}>
          VISION
        </Typography>
        <Stack spacing={0}>
          {brandIdentity.vision.map((vision, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                gap: { xs: 2.5, sm: 4 },
                alignItems: 'baseline',
                py: 3.5,
                borderBottom: index < 2 ? 1 : 0,
                borderColor: isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.06)',
              }}>
              <Typography
                sx={{
                  fontSize: { xs: 28, sm: 36 },
                  fontWeight: 400,
                  color: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
                  lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                  minWidth: 36,
                }}>
                {index + 1}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 15, sm: 17 },
                  lineHeight: 1.85,
                  color: isDark ? 'grey.300' : 'grey.700',
                }}>
                {vision}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* ブランドパーソナリティ */}
      <Box sx={{ mb: 10, px: { xs: 1, sm: 2 } }}>
        <Typography
          variant='overline'
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'primary.main',
            mb: 1,
            display: 'block',
          }}>
          CORE VALUES
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            color: 'text.secondary',
            mb: 5,
          }}>
          価値観
        </Typography>
        <Grid container spacing={3}>
          {brandIdentity.values.map((value, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Box
                sx={{
                  height: '100%',
                  p: 0,
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  border: 1,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
                  transition: motionOf(['border-color'], 'short'),
                  '&:hover': {
                    borderColor: value.color,
                  },
                }}>
                <Box sx={{ px: 3.5, py: 3 }}>
                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 700,
                      mb: 2.5,
                      color: isDark ? 'grey.100' : 'grey.900',
                    }}>
                    {value.title}
                  </Typography>
                  <Stack spacing={1.5}>
                    {value.attributes.map((attr, attrIndex) => (
                      <Box
                        key={attrIndex}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}>
                        <Box
                          sx={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            bgcolor: value.color,
                            opacity: 0.5,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          sx={{
                            fontSize: 14,
                            color: isDark ? 'grey.400' : 'grey.600',
                            lineHeight: 1.5,
                          }}>
                          {attr}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* デザイン原則 */}
      <Box sx={{ px: { xs: 1, sm: 2 }, pb: 4 }}>
        <Typography
          variant='overline'
          sx={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'primary.main',
            mb: 1,
            display: 'block',
          }}>
          DESIGN PRINCIPLES
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            color: 'text.secondary',
            mb: 5,
          }}>
          めざす姿
        </Typography>
        <Grid container spacing={3}>
          {designPrinciples.map((principle, index) => (
            <Grid size={{ xs: 12, md: 4 }} key={index}>
              <Box
                sx={{
                  height: '100%',
                  px: 3.5,
                  py: 3.5,
                  borderRadius: 2.5,
                  border: 1,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
                  transition: motionOf(['border-color', 'box-shadow'], 'short'),
                  '&:hover': {
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.15)'
                      : 'rgba(0,0,0,0.15)',
                    boxShadow: isDark
                      ? '0 4px 24px rgba(0,0,0,0.3)'
                      : '0 4px 24px rgba(0,0,0,0.06)',
                  },
                }}>
                <Typography
                  sx={{
                    fontSize: 32,
                    fontWeight: 400,
                    color: isDark
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.07)',
                    lineHeight: 1,
                    mb: 2,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                  {principle.num}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 17,
                    fontWeight: 700,
                    mb: 1.5,
                    color: isDark ? 'grey.100' : 'grey.900',
                  }}>
                  {principle.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 400,
                    mb: 1.5,
                    color: isDark ? 'grey.300' : 'grey.700',
                    lineHeight: 1.7,
                  }}>
                  {principle.description}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 13,
                    color: isDark ? 'grey.500' : 'grey.500',
                    lineHeight: 1.8,
                  }}>
                  {principle.details}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

export const Default: StoryObj = {
  name: 'デザインフィロソフィー概要',
  render: () => <DesignPhilosophyOverview />,
}
