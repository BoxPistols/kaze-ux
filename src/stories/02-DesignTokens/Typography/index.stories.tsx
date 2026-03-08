import {
  Box,
  Typography,
  Divider,
  Stack,
  Paper,
  Grid,
  Chip,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { fontSizesVariant, typographyOptions } from '@/themes/typography'

import type { TypographyProps } from '@mui/material/Typography'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design Tokens/Typography',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// --- 共通ヘルパー ---

type ShowcaseVariant = NonNullable<TypographyProps['variant']>

type TypeRowProps = {
  variant: ShowcaseVariant
  label: string
  usage: string
  semantic?: string
}

// rem値をpx換算付きで表示
const formatFontSize = (size: unknown, htmlFontSize: number): string => {
  if (typeof size !== 'string') return ''
  const remValue = parseFloat(size)
  if (Number.isNaN(remValue)) return String(size)
  const pxValue = Math.round(remValue * htmlFontSize)
  return `${size} (${pxValue}px)`
}

// --- ストーリー1: タイプスケール全体 ---

const TypeScaleShowcase = () => {
  const theme = useTheme()

  const sampleJa = 'サンプルテキスト'
  const sampleEn = 'Sample Text 123'
  const sampleMixed = `${sampleJa} ${sampleEn}`

  const headings: TypeRowProps[] = [
    {
      variant: 'displayLarge',
      label: 'Display Large',
      usage: 'ヒーローセクション',
      semantic: '32px',
    },
    {
      variant: 'displayMedium',
      label: 'Display Medium',
      usage: 'ページヒーロー',
      semantic: '28px',
    },
    {
      variant: 'displaySmall',
      label: 'Display Small',
      usage: 'セクションヒーロー',
      semantic: '24px',
    },
    { variant: 'h1', label: 'H1', usage: 'ページタイトル', semantic: '22px' },
    { variant: 'h2', label: 'H2', usage: 'セクション見出し', semantic: '20px' },
    { variant: 'h3', label: 'H3', usage: 'サブセクション', semantic: '18px' },
    { variant: 'h4', label: 'H4', usage: 'カード見出し', semantic: '16px' },
    { variant: 'h5', label: 'H5', usage: 'リスト見出し', semantic: '14px' },
    { variant: 'h6', label: 'H6', usage: '最小見出し', semantic: '12px' },
  ]

  const bodyTexts: TypeRowProps[] = [
    { variant: 'body1', label: 'Body 1', usage: '本文（標準）14px' },
    { variant: 'body2', label: 'Body 2', usage: '本文（小）12px' },
    { variant: 'subtitle1', label: 'Subtitle 1', usage: 'サブタイトル' },
    { variant: 'subtitle2', label: 'Subtitle 2', usage: 'サブタイトル（小）' },
    { variant: 'caption', label: 'Caption', usage: '注釈・補足' },
    { variant: 'overline', label: 'Overline', usage: 'ラベル' },
    { variant: 'button', label: 'Button', usage: 'ボタンラベル' },
  ]

  const customSizes: TypeRowProps[] = [
    { variant: 'xxl', label: 'XXL', usage: '特大表示 22px' },
    { variant: 'xl', label: 'XL', usage: '大表示 20px' },
    { variant: 'lg', label: 'LG', usage: '中大表示 18px' },
    { variant: 'ml', label: 'ML', usage: '中表示 16px' },
    { variant: 'md', label: 'MD', usage: '標準 14px（基準）' },
    { variant: 'sm', label: 'SM', usage: '小 12px（最小本文）' },
    { variant: 'xs', label: 'XS', usage: '最小 10px（特殊用途）' },
  ]

  const TypeRow = ({ variant, label, usage }: TypeRowProps) => {
    const style = theme.typography[variant as keyof typeof theme.typography]
    const fontSize =
      typeof style === 'object' && 'fontSize' in style
        ? (style.fontSize as string)
        : ''
    const fontWeight =
      typeof style === 'object' && 'fontWeight' in style
        ? String(style.fontWeight)
        : ''
    const lineHeight =
      typeof style === 'object' && 'lineHeight' in style
        ? String(style.lineHeight)
        : ''

    return (
      <Box
        sx={{
          py: 3,
          px: 4,
          display: 'flex',
          alignItems: 'baseline',
          gap: 4,
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:last-child': { borderBottom: 'none' },
        }}>
        <Box sx={{ minWidth: 180, flexShrink: 0 }}>
          <Typography
            variant='body2'
            sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
            {label}
          </Typography>
          <Stack direction='row' spacing={1} flexWrap='wrap'>
            <Typography
              variant='caption'
              sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
              {formatFontSize(fontSize, theme.typography.htmlFontSize)}
            </Typography>
            {fontWeight && (
              <Typography
                variant='caption'
                sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                w{fontWeight}
              </Typography>
            )}
            {lineHeight && (
              <Typography
                variant='caption'
                sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                lh{lineHeight}
              </Typography>
            )}
          </Stack>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant={variant} noWrap>
            {sampleMixed}
          </Typography>
        </Box>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ minWidth: 120, textAlign: 'right', flexShrink: 0 }}>
          {usage}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        タイポグラフィスケール
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
        基準フォントサイズ: {theme.typography.fontSize}px | フォントファミリー:{' '}
        {typographyOptions.fontFamily}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 5 }}>
        1rem = {theme.typography.htmlFontSize}px
        換算。最小本文サイズ12px原則に準拠
      </Typography>

      {/* 見出しスケール */}
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
        見出し (Headings)
      </Typography>
      <Paper
        variant='outlined'
        sx={{ mb: 6, overflow: 'hidden', borderRadius: 2 }}>
        {headings.map((h) => (
          <TypeRow key={h.variant} {...h} />
        ))}
      </Paper>

      {/* 本文・ユーティリティ */}
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
        本文・ユーティリティ (Body & Utility)
      </Typography>
      <Paper
        variant='outlined'
        sx={{ mb: 6, overflow: 'hidden', borderRadius: 2 }}>
        {bodyTexts.map((b) => (
          <TypeRow key={b.variant} {...b} />
        ))}
      </Paper>

      {/* カスタムサイズ */}
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
        カスタムサイズバリアント
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        プロジェクト固有のサイズバリアント。コンポーネント内のテキストサイズ指定に使用
      </Typography>
      <Paper
        variant='outlined'
        sx={{ mb: 6, overflow: 'hidden', borderRadius: 2 }}>
        {customSizes.map((c) => (
          <TypeRow key={c.variant} {...c} />
        ))}
      </Paper>
    </Box>
  )
}

export const Default: StoryObj = {
  name: 'タイプスケール',
  render: () => <TypeScaleShowcase />,
}

// --- ストーリー2: フォントウェイト ---

const FontWeightShowcase = () => {
  const weights = [
    {
      value: 300,
      label: 'Light',
      token: 'fontWeightLight',
      usage: '装飾テキスト',
    },
    {
      value: 400,
      label: 'Regular',
      token: 'fontWeightRegular',
      usage: '本文テキスト',
    },
    {
      value: 500,
      label: 'Medium',
      token: 'fontWeightMedium',
      usage: 'ラベル・強調',
    },
    { value: 600, label: 'SemiBold', token: '-', usage: '見出し・重要ラベル' },
    { value: 700, label: 'Bold', token: 'fontWeightBold', usage: '見出し' },
  ]

  const sampleText = '空を舞台に人とテクノロジーの調和で The quick brown fox'

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        フォントウェイト
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        使用するフォントウェイトとその用途
      </Typography>

      <Paper variant='outlined' sx={{ overflow: 'hidden', borderRadius: 2 }}>
        {weights.map((w) => (
          <Box
            key={w.value}
            sx={{
              py: 3,
              px: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': { borderBottom: 'none' },
            }}>
            <Box sx={{ minWidth: 140, flexShrink: 0 }}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {w.label}
              </Typography>
              <Typography
                variant='caption'
                sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                {w.value} | {w.token}
              </Typography>
            </Box>
            <Typography
              sx={{
                flex: 1,
                fontSize: '1.25rem',
                fontWeight: w.value,
              }}>
              {sampleText}
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ minWidth: 100, textAlign: 'right', flexShrink: 0 }}>
              {w.usage}
            </Typography>
          </Box>
        ))}
      </Paper>
    </Box>
  )
}

export const FontWeights: StoryObj = {
  name: 'フォントウェイト',
  render: () => <FontWeightShowcase />,
}

// --- ストーリー3: 行間 (Line Height) ---

const LineHeightShowcase = () => {
  const lineHeights = [
    { value: 1.4, label: 'Small (1.4)', usage: '見出し・短いテキスト' },
    { value: 1.6, label: 'Medium (1.6)', usage: '本文・標準テキスト' },
    { value: 1.8, label: 'Large (1.8)', usage: '長文・読みやすさ重視' },
  ]

  const longText =
    '空を舞台に人とテクノロジーの調和で社会の仕組みをデザインする。世界の優れた技術と共に、空間の隔たりを超えて、人と現場、人とモノとの新たなつながりを創造する。'

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        行間 (Line Height)
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        テキストの可読性を左右する行間設定
      </Typography>

      <Grid container spacing={3}>
        {lineHeights.map((lh) => (
          <Grid size={{ xs: 12, md: 4 }} key={lh.value}>
            <Paper
              variant='outlined'
              sx={{ p: 3, height: '100%', borderRadius: 2 }}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'
                sx={{ mb: 2 }}>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {lh.label}
                </Typography>
                <Chip label={lh.usage} size='small' variant='outlined' />
              </Stack>
              <Divider sx={{ mb: 2 }} />
              <Typography
                sx={{
                  lineHeight: lh.value,
                  fontSize: '0.875rem',
                }}>
                {longText}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export const LineHeights: StoryObj = {
  name: '行間',
  render: () => <LineHeightShowcase />,
}

// --- ストーリー4: サイズトークン一覧 ---

const SizeTokenTable = () => {
  const theme = useTheme()
  const tokens = Object.entries(fontSizesVariant) as [string, string][]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        サイズトークン
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        fontSizesVariant のすべてのトークン値
      </Typography>

      <Paper variant='outlined' sx={{ overflow: 'hidden', borderRadius: 2 }}>
        {/* ヘッダー */}
        <Box
          sx={{
            py: 2,
            px: 4,
            display: 'flex',
            gap: 4,
            bgcolor: 'action.hover',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}>
          <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 120 }}>
            トークン名
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 140 }}>
            rem値 (px換算)
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600, flex: 1 }}>
            プレビュー
          </Typography>
        </Box>

        {tokens.map(([name, value]) => {
          const remVal = parseFloat(value)
          const pxVal = Math.round(remVal * theme.typography.htmlFontSize)
          return (
            <Box
              key={name}
              sx={{
                py: 2,
                px: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}>
              <Typography
                variant='body2'
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  minWidth: 120,
                  color: 'primary.main',
                }}>
                {name}
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  fontFamily: 'monospace',
                  minWidth: 140,
                  color: 'text.secondary',
                }}>
                {value} ({pxVal}px)
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}>
                <Box
                  sx={{
                    width: pxVal * 2,
                    height: 8,
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    opacity: 0.6,
                    minWidth: 8,
                  }}
                />
                <Typography sx={{ fontSize: value }}>Aa</Typography>
              </Box>
            </Box>
          )
        })}
      </Paper>
    </Box>
  )
}

export const SizeTokens: StoryObj = {
  name: 'サイズトークン',
  render: () => <SizeTokenTable />,
}

// --- ストーリー5: フォントファミリー ---

const FontFamilyShowcase = () => {
  const families = [
    {
      name: 'Inter',
      role: 'プライマリ（欧文）',
      sample: 'The quick brown fox jumps over the lazy dog 0123456789',
      description:
        '高い可読性と豊富なウェイトを持つサンセリフ書体。UI設計に最適化されたメトリクス',
    },
    {
      name: 'Noto Sans JP',
      role: 'プライマリ（和文）',
      sample: 'あいうえおアイウエオ漢字表示 空を舞台に人とテクノロジーの調和',
      description:
        'Google Notoファミリーの日本語書体。Interとの視覚的調和を重視',
    },
    {
      name: 'monospace',
      role: 'コード・データ表示',
      sample: 'console.log("Hello") // 0xABCDEF #2642BE',
      description:
        '等幅フォント。コードスニペット、HEXカラー値、数値データの表示に使用',
    },
  ]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        フォントファミリー
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
        フォントスタック: {typographyOptions.fontFamily}
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 5 }}>
        欧文Inter + 和文Noto Sans JPの組み合わせ。フォールバックにHelvetica,
        Arial, sans-serif
      </Typography>

      <Stack spacing={3}>
        {families.map((f) => (
          <Paper key={f.name} variant='outlined' sx={{ p: 4, borderRadius: 2 }}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 2 }}>
              <Typography variant='h5' sx={{ fontWeight: 600 }}>
                {f.name}
              </Typography>
              <Chip
                label={f.role}
                size='small'
                color='primary'
                variant='outlined'
              />
            </Stack>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
              {f.description}
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Typography
              sx={{
                fontFamily:
                  f.name === 'monospace'
                    ? 'monospace'
                    : `${f.name}, sans-serif`,
                fontSize: '1.125rem',
                lineHeight: 1.8,
              }}>
              {f.sample}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export const FontFamilies: StoryObj = {
  name: 'フォントファミリー',
  render: () => <FontFamilyShowcase />,
}
