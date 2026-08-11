import { Box, Typography, Stack, Paper, Grid, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { KazeLogo } from '@/components/ui/logo'
import {
  LOGO_CLEAR_SPACE_RATIO,
  LOGO_MIN_SIZE,
  LOGO_PROHIBITIONS,
} from '@/components/ui/logo'
import { contrastRatioOf } from '@/themes/contrast'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design Tokens/Logo',
  parameters: { layout: 'padded' },
}

export default meta

const Section = ({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) => (
  <Box sx={{ mb: 8 }}>
    <Typography variant='h4' sx={{ fontWeight: 700, mb: 1 }}>
      {title}
    </Typography>
    {description && (
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        {description}
      </Typography>
    )}
    {children}
  </Box>
)

const Swatch = ({
  label,
  note,
  background,
  children,
}: {
  label: string
  note?: string
  background: string
  children: React.ReactNode
}) => (
  <Box>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        bgcolor: background,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        mb: 1,
      }}>
      {children}
    </Box>
    <Typography variant='body2' sx={{ fontWeight: 600 }}>
      {label}
    </Typography>
    {note && (
      <Typography variant='caption' color='text.secondary'>
        {note}
      </Typography>
    )}
  </Box>
)

// --- 1. 構成 ---
const CompositionContent = () => (
  <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
    <Typography variant='h3' sx={{ fontWeight: 700, mb: 2 }}>
      ロゴ
    </Typography>
    <Typography variant='body1' color='text.secondary' sx={{ mb: 6 }}>
      三本のストロークが左から右へ流れ、右端で上へ抜けます。「墨で書かれ、風で運ばれる」
      という世界観を、書の運筆（入り・送り・抜け）と風の上昇気流を重ね合わせて表しています。
      長さを 短 / 長 / 中 と変えるのは、均等な三本線が持つ記号的な硬さを避け、
      風の不均一さを与えるためです。
    </Typography>

    <Section
      title='構成'
      description='シンボル単体、シンボル + ワードマーク、ワードマーク単体の 3 種。用途に応じて選びます。'>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Swatch
            label='symbol'
            note='アプリアイコン・favicon・狭い場所'
            background='background.paper'>
            <KazeLogo size={64} title='Kaze' />
          </Swatch>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Swatch
            label='horizontal'
            note='ヘッダー・資料の表紙。既定の組み合わせ'
            background='background.paper'>
            <KazeLogo variant='horizontal' size={48} tone='ink' title='Kaze' />
          </Swatch>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Swatch
            label='wordmark'
            note='シンボルが別途示されている文脈'
            background='background.paper'>
            <KazeLogo variant='wordmark' size={48} tone='ink' />
          </Swatch>
        </Grid>
      </Grid>
    </Section>

    <Section
      title='配色'
      description='背景の明度で選びます。迷ったら tone="auto" を渡すと、背景から ink / inverse を判定します。'>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Swatch
            label='brand'
            note={`ティール地に墨 (${contrastRatioOf('#0A0A0A', '#0EADB8')}:1)`}
            background='background.paper'>
            <KazeLogo size={56} tone='brand' title='Kaze' />
          </Swatch>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Swatch label='ink' note='明るい面・印刷' background='#ffffff'>
            <KazeLogo size={56} tone='ink' title='Kaze' />
          </Swatch>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Swatch label='inverse' note='暗い面・写真の上' background='#0A0A0A'>
            <KazeLogo size={56} tone='inverse' title='Kaze' />
          </Swatch>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Swatch
            label='outline'
            note='他の要素と等価に並べる場合'
            background='background.paper'>
            <KazeLogo size={56} tone='outline' title='Kaze' />
          </Swatch>
        </Grid>
      </Grid>
    </Section>
  </Box>
)

export const Composition: StoryObj = {
  name: '構成と配色',
  render: () => <CompositionContent />,
}

// --- 2. 余白と最小サイズ ---
const SpacingContent = () => {
  const theme = useTheme()

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
      <Section
        title='クリアスペース'
        description={`シンボルの一辺の ${LOGO_CLEAR_SPACE_RATIO * 100}% を四辺に確保します。この内側には文字・罫線・他の図形を置きません。UI の最小行間 (4px / 16px) と一致させた値で、密なツールバーでも確保できる下限です。`}>
        <Box
          sx={{
            display: 'inline-flex',
            p: 4,
            bgcolor: 'action.hover',
            borderRadius: 2,
          }}>
          <Box
            sx={{
              position: 'relative',
              // クリアスペースを可視化する
              outline: `1px dashed ${theme.palette.primary.main}`,
              outlineOffset: 0,
            }}>
            <KazeLogo size={80} withClearSpace title='Kaze' />
          </Box>
        </Box>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ display: 'block', mt: 1.5 }}>
          破線がクリアスペースの外周。<code>withClearSpace</code>{' '}
          を渡すと余白が実際に確保されます。
        </Typography>
      </Section>

      <Section
        title='最小サイズ'
        description='ストローク幅がグリッドの 1/12 のため、これ以下では線が 1px を割って潰れます。指定が下限を割った場合、コンポーネントが下限に丸めます。'>
        <Stack direction='row' spacing={5} sx={{ alignItems: 'flex-end' }}>
          {(
            [
              ['icon', LOGO_MIN_SIZE.icon, 'favicon・アプリアイコン'],
              ['ui', LOGO_MIN_SIZE.ui, 'UI に置く場合'],
              ['withWordmark', LOGO_MIN_SIZE.withWordmark, 'ワードマーク併記'],
            ] as const
          ).map(([key, px, note]) => (
            <Box key={key} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  minHeight: 64,
                  mb: 1.5,
                }}>
                {key === 'withWordmark' ? (
                  <KazeLogo variant='horizontal' size={px} tone='ink' />
                ) : (
                  <KazeLogo size={px} title='Kaze' />
                )}
              </Box>
              <Chip
                label={`${px}px`}
                size='small'
                sx={{ fontFamily: 'monospace', mb: 0.5 }}
              />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ display: 'block' }}>
                {key}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {note}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Section>
    </Box>
  )
}

export const Spacing: StoryObj = {
  name: '余白と最小サイズ',
  render: () => <SpacingContent />,
}

// --- 3. 禁止事項 ---
const ProhibitionsContent = () => (
  <Box sx={{ maxWidth: 1200, mx: 'auto', p: 4 }}>
    <Typography variant='h3' sx={{ fontWeight: 700, mb: 2 }}>
      禁止事項
    </Typography>
    <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
      ロゴは最も小さく、最も多くの場所に置かれる意匠であり、一度崩れると全体の品位が落ちます。
      判断の余地を残さないよう、以下を数値と規則で固定しています。 これらは{' '}
      <code>KazeLogo</code> の API では表現できないようにしてあります
      （縦横比・色・角丸を props で変えられません）。
    </Typography>

    <Grid container spacing={3}>
      {LOGO_PROHIBITIONS.map((rule) => (
        <Grid key={rule.id} size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            variant='outlined'
            sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                aria-hidden
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  color: 'error.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                ×
              </Box>
              <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                {rule.title}
              </Typography>
            </Box>
            <Typography variant='body2' color='text.secondary'>
              {rule.reason}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>

    <Section title='' description=''>
      <Box sx={{ mt: 6 }}>
        <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
          やってはいけない例
        </Typography>
        <Grid container spacing={4}>
          {(
            [
              ['縦横比を変える', { transform: 'scaleX(1.6)' }],
              ['回転させる', { transform: 'rotate(-15deg)' }],
              [
                '影を加える',
                { filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' },
              ],
              ['背景に埋没させる', { opacity: 0.25 }],
            ] as const
          ).map(([label, style]) => (
            <Grid key={label} size={{ xs: 6, md: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 120,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'error.main',
                  mb: 1,
                  overflow: 'hidden',
                }}>
                <Box sx={style} aria-hidden>
                  <KazeLogo size={56} title='' />
                </Box>
              </Box>
              <Typography
                variant='caption'
                sx={{ color: 'error.textContrast', fontWeight: 600 }}>
                × {label}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Section>
  </Box>
)

export const Prohibitions: StoryObj = {
  name: '禁止事項',
  render: () => <ProhibitionsContent />,
}
