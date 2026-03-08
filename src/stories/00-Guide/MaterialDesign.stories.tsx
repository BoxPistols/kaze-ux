import {
  Box,
  Button,
  Chip,
  Divider,
  Fab,
  Grid,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Plus } from 'lucide-react'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Guide/Material Design',
  parameters: {
    layout: 'padded',
    docs: { page: null },
  },
}

export default meta

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant='h4' sx={{ fontWeight: 800, letterSpacing: '-0.01em' }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

// ---------------------------------------------------------------------------
// メインコンテンツ
// ---------------------------------------------------------------------------

const MaterialDesignContent = () => {
  const theme = useTheme()

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }}>
      <Paper
        variant='outlined'
        sx={{
          px: 6,
          py: 5,
          mb: 6,
          borderRadius: 3,
          textAlign: 'center',
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(33,150,243,0.08) 0%, rgba(70,171,74,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(33,150,243,0.04) 0%, rgba(70,171,74,0.04) 100%)',
        }}>
        <Typography variant='h3' sx={{ fontWeight: 800, mb: 1 }}>
          Material Design 概要
        </Typography>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 2 }}>
          Googleの設計体系とSDPFでの活用
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          SDPFは MUI（Material UI）v7 を通じてMaterial Designをベースにしている
        </Typography>
      </Paper>

      {/* 3原則 */}
      <SectionHeader title='Material Design 3原則' />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {[
          {
            title: 'Material is the metaphor',
            desc: '物理的な紙・インクの比喩。Card, Paper, elevationで物理世界を表現する。',
            color: 'primary' as const,
          },
          {
            title: 'Bold, graphic, intentional',
            desc: '大胆で意図的なタイポグラフィ・色・空間。明確な色階層と8pxグリッド。',
            color: 'secondary' as const,
          },
          {
            title: 'Motion provides meaning',
            desc: '動きが意味を伝える。Fade/Slide遷移、ripple効果でフィードバック。',
            color: 'info' as const,
          },
        ].map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 4 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, height: '100%', borderRadius: 2 }}>
              <Chip
                label={item.title.split(' ')[0]}
                color={item.color}
                size='small'
                sx={{ mb: 1.5 }}
              />
              <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
                {item.title}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                {item.desc}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 5 }} />

      {/* Elevation デモ */}
      <SectionHeader
        title='Elevation（影の深度）'
        subtitle='物理的な高さで要素の優先度を伝える'
      />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[0, 1, 2, 4, 8, 16].map((elev) => (
          <Grid key={elev} size={{ xs: 6, sm: 4, md: 2 }}>
            <Paper
              elevation={elev}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2,
                border: elev === 0 ? '1px solid' : 'none',
                borderColor: 'divider',
              }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>
                {elev}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                elevation
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Paper
        variant='outlined'
        sx={{
          px: 3.5,
          py: 2.5,
          mb: 5,
          borderRadius: 2,
          borderColor: 'info.main',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(33,150,243,0.06)'
              : 'rgba(33,150,243,0.03)',
        }}>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
          SDPF方針
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Card = <strong>elevation 0（フラット）</strong> + outlined border
          を基本。 浮き上がりは意図的な場面（FAB、ドロップダウン）でのみ使用。
        </Typography>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* Ripple デモ */}
      <SectionHeader
        title='Ripple（波紋効果）'
        subtitle='タッチ/クリック時の視覚的フィードバック'
      />
      <Stack direction='row' spacing={2} sx={{ mb: 5 }} flexWrap='wrap'>
        <Button variant='contained'>Ripple あり</Button>
        <Button variant='outlined'>Outlined</Button>
        <Button variant='contained' color='error'>
          Error
        </Button>
        <Fab color='primary' size='small'>
          <Plus size={20} />
        </Fab>
      </Stack>

      <Divider sx={{ my: 5 }} />

      {/* 8pxグリッド */}
      <SectionHeader
        title='8px グリッドシステム'
        subtitle='全スペーシングを8の倍数で統一'
      />
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 3 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>MUI トークン</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>値</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>用途</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>ビジュアル</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { token: '0.5', px: '4px', use: 'アイコンとテキスト間' },
              { token: '1', px: '8px', use: '密接な要素間' },
              { token: '2', px: '16px', use: '標準の要素間隔' },
              { token: '3', px: '24px', use: 'セクション内の区切り' },
              { token: '4', px: '32px', use: 'セクション間' },
            ].map((item) => (
              <TableRow key={item.token}>
                <TableCell>
                  <Chip
                    label={`spacing(${item.token})`}
                    size='small'
                    variant='outlined'
                    sx={{ fontFamily: 'monospace' }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {item.px}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body1' color='text.secondary'>
                    {item.use}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: parseInt(item.px),
                      height: 16,
                      bgcolor: 'primary.main',
                      borderRadius: 0.5,
                      opacity: 0.6,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 5 }} />

      {/* 色システム */}
      <SectionHeader title='セマンティックカラーシステム' />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {[
          {
            name: 'Primary',
            color: theme.palette.primary.main,
            use: '主要アクション、ブランド',
          },
          {
            name: 'Secondary',
            color: theme.palette.secondary.main,
            use: '補助的な要素',
          },
          {
            name: 'Error',
            color: theme.palette.error.main,
            use: 'エラー、削除、警告',
          },
          {
            name: 'Warning',
            color: theme.palette.warning.main,
            use: '注意、確認が必要',
          },
          { name: 'Info', color: theme.palette.info.main, use: '情報、ヒント' },
          {
            name: 'Success',
            color: theme.palette.success.main,
            use: '成功、完了',
          },
        ].map((item) => (
          <Grid key={item.name} size={{ xs: 6, sm: 4, md: 2 }}>
            <Paper
              variant='outlined'
              sx={{ overflow: 'hidden', borderRadius: 2 }}>
              <Box sx={{ bgcolor: item.color, height: 48 }} />
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 600, fontSize: 12 }}>
                  {item.name}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {item.use}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* MUI v7 */}
      <SectionHeader title='MUI v7 の特徴' />
      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>機能</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>説明</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ['新Grid API', 'size={{ xs: 12 }} 形式。旧 item xs={12} は廃止'],
              [
                'sx prop',
                'インラインでテーマ対応スタイリング。レスポンシブ対応も可能',
              ],
              ['Pigment CSS', '新しいゼロランタイムCSSエンジン（オプション）'],
              ['React 19対応', '最新のReactと互換'],
              [
                'カスタムテーマ',
                'createTheme()でブランドカラー・タイポグラフィを一括設定',
              ],
            ].map((row) => (
              <TableRow key={row[0]}>
                <TableCell>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {row[0]}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body1' color='text.secondary'>
                    {row[1]}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 参考リンク */}
      <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1.5 }}>
          参考リンク
        </Typography>
        <Stack spacing={0.75}>
          <Link href='https://m3.material.io/' target='_blank' rel='noopener noreferrer' variant='body1' color='primary'>
            Material Design 3
          </Link>
          <Link href='https://mui.com/material-ui/react-paper/' target='_blank' rel='noopener noreferrer' variant='body1' color='primary'>
            MUI Paper (Elevation)
          </Link>
          <Link href='https://mui.com/material-ui/transitions/' target='_blank' rel='noopener noreferrer' variant='body1' color='primary'>
            MUI Transitions
          </Link>
        </Stack>
      </Box>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <MaterialDesignContent />,
}

// ---------------------------------------------------------------------------
// Elevation Playground（インタラクティブ）
// ---------------------------------------------------------------------------
interface ElevationArgs {
  elevation: number
  borderRadius: number
  showOutline: boolean
}

const ElevationPlayground = ({
  elevation,
  borderRadius,
  showOutline,
}: ElevationArgs) => (
  <Box sx={{ maxWidth: 600, mx: 'auto' }}>
    <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
      Elevation Playground
    </Typography>
    <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
      elevation / borderRadius / outline
      を変更して、Paperコンポーネントの見た目を体験
    </Typography>
    <Paper
      variant='outlined'
      sx={{
        px: 2,
        py: 1.5,
        mb: 4,
        borderRadius: 1.5,
        display: 'inline-block',
      }}>
      <Typography
        variant='body2'
        sx={{ fontFamily: 'monospace', fontSize: 13 }}>
        {`<Paper elevation={${elevation}} sx={{ borderRadius: ${borderRadius} }}${showOutline ? ' variant="outlined"' : ''}>`}
      </Typography>
    </Paper>
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <Paper
        elevation={showOutline ? 0 : elevation}
        variant={showOutline ? 'outlined' : 'elevation'}
        sx={{
          width: 280,
          height: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius,
          transition: 'all 0.3s ease',
        }}>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 0.5 }}>
          {elevation}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          elevation
        </Typography>
        <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
          borderRadius: {borderRadius * 8}px
        </Typography>
      </Paper>
    </Box>
    <Typography
      variant='body1'
      color='text.secondary'
      sx={{ textAlign: 'center' }}>
      SDPF方針: Card = elevation 0 + outlined
      を基本。浮き上がりはFAB・ドロップダウンのみ。
    </Typography>
  </Box>
)

export const ElevationDemo: StoryObj<ElevationArgs> = {
  name: 'Elevation Playground',
  args: {
    elevation: 4,
    borderRadius: 2,
    showOutline: false,
  },
  argTypes: {
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: '影の深度（0=フラット, 24=最大）',
    },
    borderRadius: {
      control: { type: 'range', min: 0, max: 6, step: 0.5 },
      description: '角丸（8px x n）',
    },
    showOutline: {
      control: 'boolean',
      description: 'outlined variant（SDPF推奨）',
    },
  },
  render: (args) => <ElevationPlayground {...args} />,
}

// ---------------------------------------------------------------------------
// Spacing Playground（インタラクティブ）
// ---------------------------------------------------------------------------
interface SpacingPlaygroundArgs {
  spacingValue: number
}

const SpacingDemoPlayground = ({ spacingValue }: SpacingPlaygroundArgs) => {
  const px = spacingValue * 8
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
        8px Grid Spacing
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
        MUI の spacing は 8px 基準。spacing({spacingValue}) = {px}px
      </Typography>
      <Paper
        variant='outlined'
        sx={{
          px: 2,
          py: 1.5,
          mb: 4,
          borderRadius: 1.5,
          display: 'inline-block',
        }}>
        <Typography
          variant='body2'
          sx={{ fontFamily: 'monospace', fontSize: 13 }}>
          {`sx={{ p: ${spacingValue} }}`} = padding: {px}px /{' '}
          {`sx={{ gap: ${spacingValue} }}`} = gap: {px}px
        </Typography>
      </Paper>
      <Stack spacing={3}>
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
            Padding のプレビュー
          </Typography>
          <Paper
            variant='outlined'
            sx={{
              p: spacingValue,
              borderRadius: 2,
              transition: 'all 0.3s ease',
            }}>
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                p: 2,
                borderRadius: 1,
                textAlign: 'center',
                fontWeight: 600,
              }}>
              spacing({spacingValue}) = {px}px padding
            </Box>
          </Paper>
        </Box>
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
            Gap のプレビュー
          </Typography>
          <Stack
            direction='row'
            spacing={spacingValue}
            sx={{ transition: 'all 0.3s ease' }}>
            {[1, 2, 3, 4].map((n) => (
              <Box
                key={n}
                sx={{
                  flex: 1,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  p: 1.5,
                  borderRadius: 1,
                  textAlign: 'center',
                  fontWeight: 600,
                }}>
                {n}
              </Box>
            ))}
          </Stack>
        </Box>
        <Box>
          <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
            バーで比較
          </Typography>
          <Box
            sx={{
              width: px,
              height: 24,
              bgcolor: 'primary.main',
              borderRadius: 0.5,
              transition: 'width 0.3s ease',
              minWidth: 4,
            }}
          />
          <Typography variant='caption' color='text.secondary'>
            {px}px
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}

export const SpacingDemo: StoryObj<SpacingPlaygroundArgs> = {
  name: '8px Spacing',
  args: {
    spacingValue: 2,
  },
  argTypes: {
    spacingValue: {
      control: { type: 'range', min: 0, max: 8, step: 0.5 },
      description: 'spacing 値（8px x n）',
    },
  },
  render: (args) => <SpacingDemoPlayground {...args} />,
}
