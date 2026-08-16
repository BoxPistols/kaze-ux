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
    slogan: '正直であることが、いちばん外側の品質',
    mission:
      '作り手の表現を縛らずに、誰にとっても読めて触れる土台を差し出しつづける',
    vision: [
      'できていないことを、できていないと言えること。それを言えるものだけが、できていることを信じてもらえる',
      '基盤は主張しない。風のように、作るものの背後に回る',
      '一貫性は、揃えることではなく、迷わせないこと',
    ],
    values: [
      {
        title: '正直',
        color: 'primary.textContrast',
        attributes: [
          '誇張しない',
          '弱点を先に出す',
          '数字を飾らない',
          '分からないと言える',
          '直す前に、まず認める',
        ],
      },
      {
        title: '謙虚',
        color: '#1dafc2',
        attributes: [
          '自分の目を疑う',
          '好みで決めない',
          '確かめてから言う',
          '例外を切り捨てない',
          '前提から間違えている可能性を残す',
        ],
      },
      {
        title: '敬意',
        color: '#46ab4a',
        attributes: [
          '読む人を迷わせない',
          '選び方を押し付けない',
          '誰にでも届く形にする',
          '後から来る人に残す',
          '人にも AI にも同じ顔を向ける',
        ],
      },
    ],
  }

  const designPrinciples = [
    {
      num: '01',
      title: '正直さは、機能である',
      description: '言っていることと、出来ているものを、一致させつづける',
      details:
        '仕様と実物がずれていても、たいてい何も起こらない。だからこそ、ずれを見つけたら書き換えるのではなく、ずれない形に作り替える',
    },
    {
      num: '02',
      title: '自由は、土台の上に立つ',
      description: '表現を縛らないために、譲れない下限だけを決める',
      details:
        '色も書体も余白も、選ぶのは作り手。読めること、触れられること、意味が伝わること。ここだけは誰の好みにも譲らない',
    },
    {
      num: '03',
      title: '風のように、邪魔をしない',
      description: '基盤は前に出ない。作るものの背後に回る',
      details:
        '良い土台は、使っているあいだ意識されない。覚えることを増やさず、選択肢を狭めず、必要なときにだけ姿を見せる',
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
                  transition: motionOf(['border-color'], 'short'),
                  '&:hover': {
                    borderColor: value.color,
                  },
                }}>
                {/* 3 つの価値を色で見分ける帯。
                    `background` は sx でパレット解決されないため、
                    `primary.textContrast` のようなトークン指定が無効な CSS 値として
                    無視され、1 枚目だけ帯が出ていなかった。bgcolor は解決される */}
                <Box
                  sx={{
                    height: 3,
                    bgcolor: value.color,
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
