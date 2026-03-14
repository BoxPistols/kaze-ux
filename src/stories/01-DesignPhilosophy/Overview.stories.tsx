import { Box, Typography, Grid, Stack } from '@mui/material'
import { useTheme } from '@mui/material/styles'

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
    slogan: 'デザインの力で、つなぐ',
    mission: 'テクノロジーと人の調和で社会の仕組みをデザインする',
    vision: [
      '世界の優れた技術と共に、隔たりを超えて、人と現場、人とモノとの新たなつながりを創造する',
      'テクノロジーと人の調和で社会の仕組みをデザインする',
      'もっと身近に、もっと自然に',
    ],
    values: [
      {
        title: '信頼感',
        color: '#0EADB8',
        attributes: ['安心感', '分かりやすさ', '高品質', '責任感', '現場目線'],
      },
      {
        title: '革新性',
        color: '#1dafc2',
        attributes: [
          '先進的',
          '専門性',
          'スタイリッシュ',
          '開拓',
          'プロフェッショナル',
        ],
      },
      {
        title: '共創',
        color: '#46ab4a',
        attributes: [
          '冒険的',
          '受け入れられやすい',
          '親しみやすさ',
          '身近にある',
          '自分事化',
        ],
      },
    ],
  }

  const designPrinciples = [
    {
      num: '01',
      title: 'フレキシブルな構造',
      description: 'ユーザーやシーンに応じてデザインする',
      details:
        '汎用的に使えるデザインやコンポーネントにし、変化に強い設計を実現',
    },
    {
      num: '02',
      title: '直感的でシンプル',
      description: '情報量を絞り、シンプルな構成にする',
      details: '認知負荷を低くし、迷わないユーザー体験を提供',
    },
    {
      num: '03',
      title: '世界観を統一する',
      description: '一貫性のあるデザインをする',
      details: '明瞭でクリアに見え、印象が良いデザインシステムを構築',
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
            : 'rgba(14,173,184,0.08)',
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
            fontWeight: 600,
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
            fontWeight: 800,
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
            fontWeight: 300,
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
            fontSize: 11,
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
            fontSize: 11,
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
                  fontWeight: 200,
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
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: 'primary.main',
            mb: 1,
            display: 'block',
          }}>
          BRAND PERSONALITY
        </Typography>
        <Typography
          sx={{
            fontSize: 14,
            color: 'text.secondary',
            mb: 5,
          }}>
          サービス&ldquo;らしさ&rdquo;の定義
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
                  transition: 'border-color 0.2s',
                  '&:hover': {
                    borderColor: value.color,
                  },
                }}>
                {/* カラーバー */}
                <Box
                  sx={{
                    height: 3,
                    background: value.color,
                  }}
                />
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
            fontSize: 11,
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
          デザインする上で大事にしたいこと
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
                  transition: 'border-color 0.2s, box-shadow 0.2s',
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
                    fontWeight: 200,
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
                    fontWeight: 500,
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
