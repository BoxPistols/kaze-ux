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
    slogan: '決めたことが、守られている',
    mission:
      'デザインの決めごとを、人にも AI にも同じように読める形で配り、守られていることを測れるようにする',
    vision: [
      '「規約を決めた」と「規約が守られている」は別物で、その差は毎回測ってはじめて分かる',
      '手で書いた一覧は必ず実装から遅れる。遅れてもエラーは出ない',
      '見た目は縛らない。守るのは原則だけ',
    ],
    values: [
      {
        title: '実測',
        color: 'primary.textContrast',
        attributes: [
          '描画して数える',
          '壊して確かめる',
          '推測で断定しない',
          '例外は件数ごと出す',
          '緑だけでは信用しない',
        ],
      },
      {
        title: '単一ソース',
        color: '#1dafc2',
        attributes: [
          '仕様は生成物にする',
          '手で書き写さない',
          '古くなったら落とす',
          '二重管理をやめる',
          '黙って減らさない',
        ],
      },
      {
        title: '開かれた仕様',
        color: '#46ab4a',
        attributes: [
          '機械可読で配る',
          'UI ライブラリに縛られない',
          '他所へ持っていける',
          'プロダクトごとに拡張できる',
          '強制手段を必ず持つ',
        ],
      },
    ],
  }

  const designPrinciples = [
    {
      num: '01',
      title: '決めごとは、守らせ方まで含めて決める',
      description: '何が違反を止めるのかを、ルールと一緒に持つ',
      details:
        '止める仕組みの無いルールは「なし」と明示する。書いてあるだけのルールは、読んだ人にも AI にも嘘の仕様になる',
    },
    {
      num: '02',
      title: '仕様は、人と AI が同じものを読む',
      description: 'トークン・部品・禁止事項を機械可読な単一ソースから配る',
      details:
        '説明を読んだ AI は従い、コードを読んだ AI は真似る。両者が食い違うと、どちらが正しいか判断できない',
    },
    {
      num: '03',
      title: '見た目は縛らない。原則だけを縛る',
      description: 'どんな意匠になるかは自由。守るのは可読性と一貫性の下限',
      details:
        '色・書体・余白の選び方は各プロダクトのもの。コントラスト・操作対象の寸法・トークン参照といった土台だけを共通で保証する',
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
