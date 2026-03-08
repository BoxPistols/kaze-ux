import { Alert, Box, Grid, Link, Paper, Stack, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { breakpointValues } from '@/themes/breakpoints'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Layout/Grid System',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'MUI v7 Gridシステムのレイアウトパターン。レスポンシブブレークポイント、ネスト、間隔設定の実装例を示す。',
      },
    },
  },
  tags: ['autodocs'],
}

export default meta

// 共通デモアイテム
const DemoItem = ({
  children,
  height,
}: {
  children: React.ReactNode
  height?: number
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      height: height || 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      bgcolor: 'primary.light',
      color: 'primary.contrastText',
      fontWeight: 600,
      fontSize: '0.857rem',
      borderRadius: 1.5,
    }}>
    {children}
  </Paper>
)

// --- 基本グリッド（インタラクティブ） ---

interface BasicGridArgs {
  columnSize: number
  spacing: number
  itemHeight: number
}

const BasicGridPlayground = ({
  columnSize,
  spacing,
  itemHeight,
}: BasicGridArgs) => {
  const count = Math.ceil(12 / Math.max(1, columnSize))
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
        12カラムグリッドシステム
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
        columnSize を変えてカラム分割を体験。12 / {columnSize} = {count} カラム
      </Typography>
      <Paper
        variant='outlined'
        sx={{
          px: 2,
          py: 1.5,
          mb: 3,
          borderRadius: 1.5,
          display: 'inline-block',
        }}>
        <Typography
          variant='body2'
          sx={{ fontFamily: 'monospace', fontSize: 13 }}>
          {`<Grid container spacing={${spacing}}>`}
          {' ... '}
          {`<Grid size={${columnSize}}>`}
          {` x${count}`}
        </Typography>
      </Paper>
      <Grid container spacing={spacing}>
        {Array.from({ length: count }, (_, i) => (
          <Grid key={i} size={columnSize as 1 | 2 | 3 | 4 | 6 | 12}>
            <DemoItem height={itemHeight}>{columnSize}</DemoItem>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export const BasicGrid: StoryObj<BasicGridArgs> = {
  name: '基本カラム分割',
  args: {
    columnSize: 3,
    spacing: 2,
    itemHeight: 60,
  },
  argTypes: {
    columnSize: {
      control: { type: 'select' },
      options: [1, 2, 3, 4, 6, 12],
      description: '各アイテムのカラム幅（12カラム中）',
    },
    spacing: {
      control: { type: 'range', min: 0, max: 8, step: 1 },
      description: 'Grid間のスペーシング',
    },
    itemHeight: {
      control: { type: 'range', min: 40, max: 200, step: 10 },
      description: 'アイテムの高さ (px)',
    },
  },
  render: (args) => <BasicGridPlayground {...args} />,
}

// --- レスポンシブ ---

const ResponsiveContent = () => {
  const theme = useTheme()

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        レスポンシブグリッド
      </Typography>

      <Alert severity='info' sx={{ mb: 4 }}>
        画面サイズを変更して、レスポンシブの動作を確認してください。
        カスタムブレークポイント: mobile(0), tablet({breakpointValues.tablet}
        px), laptop({breakpointValues.laptop}px), desktop(
        {breakpointValues.desktop}px)
      </Alert>

      <Stack spacing={5}>
        {/* パターン1: 1→2→4列 */}
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
            mobile: 1列 / tablet: 2列 / laptop: 4列
          </Typography>
          <Typography
            variant='caption'
            sx={{
              fontFamily: 'monospace',
              color: 'text.secondary',
              mb: 2,
              display: 'block',
            }}>
            {'size={{ xs: 12, sm: 6, md: 3 }}'}
          </Typography>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((n) => (
              <Grid key={n} size={{ xs: 12, sm: 6, md: 3 }}>
                <DemoItem height={80}>Item {n}</DemoItem>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* パターン2: 1→2→3列 */}
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
            mobile: 1列 / tablet: 2列 / laptop: 3列
          </Typography>
          <Typography
            variant='caption'
            sx={{
              fontFamily: 'monospace',
              color: 'text.secondary',
              mb: 2,
              display: 'block',
            }}>
            {'size={{ xs: 12, sm: 6, md: 4 }}'}
          </Typography>
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Grid key={n} size={{ xs: 12, sm: 6, md: 4 }}>
                <DemoItem height={60}>Item {n}</DemoItem>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* パターン3: サイドバーレイアウト */}
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
            サイドバーレイアウト（mobile: スタック / tablet以上:
            サイドバー+メイン）
          </Typography>
          <Typography
            variant='caption'
            sx={{
              fontFamily: 'monospace',
              color: 'text.secondary',
              mb: 2,
              display: 'block',
            }}>
            {
              'サイドバー: size={{ xs: 12, md: 3 }} / メイン: size={{ xs: 12, md: 9 }}'
            }
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <DemoItem height={200}>サイドバー</DemoItem>
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <DemoItem height={200}>メインコンテンツ</DemoItem>
            </Grid>
          </Grid>
        </Box>
      </Stack>

      {/* 参考リンク */}
      <Box
        sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1.5 }}>
          参考リンク
        </Typography>
        <Stack spacing={0.75}>
          <Link
            href='https://mui.com/material-ui/react-grid/'
            target='_blank'
            rel='noopener noreferrer'
            variant='body1'
            color='primary'>
            MUI Grid v7
          </Link>
          <Link
            href='https://mui.com/material-ui/customization/breakpoints/'
            target='_blank'
            rel='noopener noreferrer'
            variant='body1'
            color='primary'>
            MUI Breakpoints
          </Link>
        </Stack>
      </Box>

      {/* ブレークポイント参照 */}
      <Box sx={{ mt: 6 }}>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
          カスタムブレークポイント
        </Typography>
        <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
          <Stack spacing={1}>
            {Object.entries(theme.breakpoints.values).map(([name, value]) => (
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
        </Paper>
      </Box>
    </Box>
  )
}

export const Responsive: StoryObj = {
  name: 'レスポンシブ',
  render: () => <ResponsiveContent />,
}

// --- スペーシング（インタラクティブ） ---

interface SpacingArgs {
  spacing: number
  itemCount: number
  columns: number
}

const SpacingPlayground = ({ spacing, itemCount, columns }: SpacingArgs) => {
  const colSize = Math.max(1, Math.round(12 / columns)) as
    | 1
    | 2
    | 3
    | 4
    | 6
    | 12
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
        グリッドスペーシング
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
        下の Controls パネルで spacing / カラム数 / アイテム数
        を変更して動作を確認
      </Typography>
      <Paper
        variant='outlined'
        sx={{
          px: 2,
          py: 1.5,
          mb: 3,
          borderRadius: 1.5,
          display: 'inline-block',
        }}>
        <Typography
          variant='body2'
          sx={{ fontFamily: 'monospace', fontSize: 13 }}>
          {`<Grid container spacing={${spacing}}>`}
          {' ... '}
          {`<Grid size={${colSize}}>`}
          <Box component='span' sx={{ color: 'text.secondary', ml: 1 }}>
            = {spacing * 4}px gap / {columns}col / {itemCount} items
          </Box>
        </Typography>
      </Paper>
      <Grid container spacing={spacing}>
        {Array.from({ length: itemCount }, (_, i) => (
          <Grid key={i} size={colSize}>
            <DemoItem>{i + 1}</DemoItem>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export const Spacing: StoryObj<SpacingArgs> = {
  name: 'スペーシング',
  args: {
    spacing: 2,
    itemCount: 8,
    columns: 4,
  },
  argTypes: {
    spacing: {
      control: { type: 'range', min: 0, max: 12, step: 1 },
      description: 'Grid間のスペーシング（4px x n）',
    },
    itemCount: {
      control: { type: 'range', min: 1, max: 16, step: 1 },
      description: 'アイテム数',
    },
    columns: {
      control: { type: 'range', min: 1, max: 6, step: 1 },
      description: 'カラム数（12 / n）',
    },
  },
  render: (args) => <SpacingPlayground {...args} />,
}

// --- ネスト ---

const NestedContent = () => (
  <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
    <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
      ネストされたグリッド
    </Typography>

    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper
          variant='outlined'
          sx={{ p: 3, borderRadius: 2, height: '100%' }}>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
            メインエリア（8カラム）
          </Typography>
          <Grid container spacing={2}>
            {[1, 2, 3, 4].map((n) => (
              <Grid key={n} size={6}>
                <DemoItem height={60}>子 {n}</DemoItem>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper
          variant='outlined'
          sx={{ p: 3, borderRadius: 2, height: '100%' }}>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
            サイドエリア（4カラム）
          </Typography>
          <Grid container spacing={2}>
            {[1, 2].map((n) => (
              <Grid key={n} size={12}>
                <DemoItem height={60}>子 {n}</DemoItem>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  </Box>
)

export const Nested: StoryObj = {
  name: 'ネスト',
  render: () => <NestedContent />,
}
