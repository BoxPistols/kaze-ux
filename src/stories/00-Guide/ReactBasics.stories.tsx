import {
  Box,
  Chip,
  Divider,
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

import { CodeBlock } from '../_shared/CodeBlock'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Guide/React Basics',
  parameters: {
    layout: 'padded',
    docs: { page: null },
  },
}

export default meta

// ---------------------------------------------------------------------------
// 共通
// ---------------------------------------------------------------------------

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

const ReactBasicsContent = () => {
  const theme = useTheme()

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }}>
      {/* ヒーロー */}
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
              ? 'linear-gradient(135deg, rgba(97,218,251,0.08) 0%, rgba(33,150,243,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(97,218,251,0.04) 0%, rgba(33,150,243,0.04) 100%)',
        }}>
        <Typography variant='h3' sx={{ fontWeight: 800, mb: 1 }}>
          React 基礎
        </Typography>
        <Typography variant='h6' color='text.secondary' sx={{ mb: 2 }}>
          デザイナーが知っておくべきReactの核心概念
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          コードを書かなくても、コンポーネントの仕組みを理解することでエンジニアとの協業が変わる
        </Typography>
      </Paper>

      {/* 核心概念 */}
      <SectionHeader
        title='核心概念'
        subtitle='Reactは「UIを関数で構築する」ライブラリ'
      />

      <Grid container spacing={2} sx={{ mb: 5 }}>
        {[
          {
            title: 'コンポーネント',
            chip: '関数',
            desc: 'UIの再利用可能な部品。関数として定義し、入力(props)を受けてUIを返す。',
          },
          {
            title: 'Props',
            chip: '入力',
            desc: '外から受け取るデータ（読み取り専用）。Figmaのプロパティパネルに対応。',
          },
          {
            title: 'State',
            chip: '内部状態',
            desc: 'コンポーネント内部の状態。useStateで管理。変更でUIが自動更新される。',
          },
          {
            title: 'JSX',
            chip: '構文',
            desc: 'HTMLライクなUI記述構文。<Button variant="contained">送信</Button>',
          },
        ].map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, height: '100%', borderRadius: 2 }}>
              <Stack spacing={1}>
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Typography variant='body1' sx={{ fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Chip label={item.chip} size='small' variant='outlined' />
                </Stack>
                <Typography variant='body1' color='text.secondary'>
                  {item.desc}
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* コード例 */}
      <SectionHeader title='コンポーネントの構造' />
      <CodeBlock caption='Kaze UX: React.FC は禁止。通常の関数定義 + interface で型を定義'>
        {`// Kaze UXスタイルのコンポーネント定義
interface ServiceCardProps {
  title: string
  description: string
  status: 'active' | 'inactive' | 'pending'
  isHighlighted?: boolean
}

const ServiceCard = ({
  title,
  description,
  status,
  isHighlighted = false,
}: ServiceCardProps) => {
  return (
    <Card variant="outlined" sx={{ ... }}>
      <Typography variant="h6">{title}</Typography>
      <Chip label={status} color={...} />
    </Card>
  )
}`}
      </CodeBlock>

      <Divider sx={{ my: 5 }} />

      {/* デザイナーが知るべきポイント */}
      <SectionHeader title='デザイナーが知るべき3つのポイント' />
      <Stack spacing={3} sx={{ mb: 5 }}>
        {[
          {
            num: '1',
            title: '単方向データフロー',
            desc: 'データは常に親→子に流れる（propsで渡す）。子から親への通知はコールバック関数（onClickなど）で行う。',
            figma: 'Figmaのコンポーネント → インスタンスの関係に近い',
          },
          {
            num: '2',
            title: '宣言的UI',
            desc: '「この状態の時はこう見える」と宣言する。手続き的に「ここを隠して、あれを表示」とは書かない。',
            figma: 'Figmaのバリアント切替と同じ考え方',
          },
          {
            num: '3',
            title: '再レンダリング',
            desc: 'stateやpropsが変わると自動でUIが更新される。DOM操作を手動で行う必要がない。',
            figma:
              'FigmaのComponent Propertiesを変更すると自動で見た目が変わるのと同じ',
          },
        ].map((item) => (
          <Stack
            key={item.num}
            direction='row'
            spacing={2}
            alignItems='flex-start'>
            <Paper
              sx={{
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                borderRadius: '50%',
                flexShrink: 0,
              }}>
              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                {item.num}
              </Typography>
            </Paper>
            <Box>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {item.title}
              </Typography>
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{ mb: 0.5 }}>
                {item.desc}
              </Typography>
              <Typography
                variant='caption'
                sx={{
                  color: 'info.main',
                  fontWeight: 500,
                }}>
                Figma対応: {item.figma}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Stack>

      <Divider sx={{ my: 5 }} />

      {/* Figma↔React対応表 */}
      <SectionHeader title='FigmaとReactの対応' />
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 5 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Figma</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>React</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>説明</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              ['Component', 'コンポーネント（関数）', '再利用可能なUI部品'],
              ['Instance', 'JSX要素 <Button />', 'コンポーネントの使用箇所'],
              ['Component Properties', 'Props', '外部からの設定値'],
              ['Boolean Property', 'boolean prop', 'ON/OFF切替'],
              ['Variant', "Union型 ('outlined' | 'contained')", '見た目の切替'],
              ['Instance Swap', 'ReactNode prop', '別コンポーネントの差し替え'],
              ['Auto Layout', 'Stack / Grid', '自動レイアウト'],
              [
                'Controls タブ',
                'Storybook Controls',
                'propsをリアルタイムに変更',
              ],
            ].map((row) => (
              <TableRow key={row[0]}>
                <TableCell>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {row[0]}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={row[1]}
                    size='small'
                    variant='outlined'
                    sx={{ fontFamily: 'monospace', fontSize: 13 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body1' color='text.secondary'>
                    {row[2]}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Kaze UXルール */}
      <SectionHeader title='Kaze UXのReactルール' />
      <Paper
        variant='outlined'
        sx={{
          px: 3.5,
          py: 2.5,
          borderRadius: 2,
          borderColor: 'error.main',
          borderWidth: 1,
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(218,55,55,0.06)'
              : 'rgba(218,55,55,0.03)',
        }}>
        <Typography
          variant='body2'
          sx={{ fontWeight: 700, mb: 1, color: 'error.main' }}>
          禁止事項
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant='body2'>
            React の型エイリアス（FunctionalComponent系）は使用禁止
          </Typography>
          <Typography variant='body2'>
            <code>any</code> 型は原則禁止（TypeScript strict mode）
          </Typography>
          <Typography variant='body2'>
            MUI v7旧API <code>&lt;Grid item xs=&#123;12&#125;&gt;</code>{' '}
            は使用禁止
          </Typography>
        </Stack>
      </Paper>

      {/* 参考リンク */}
      <Box
        sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1.5 }}>
          参考リンク
        </Typography>
        <Stack spacing={0.75}>
          <Link
            href='https://react.dev/learn'
            target='_blank'
            rel='noopener noreferrer'
            variant='body1'
            color='primary'>
            React Documentation
          </Link>
          <Link
            href='https://react.dev/reference/react'
            target='_blank'
            rel='noopener noreferrer'
            variant='body1'
            color='primary'>
            React Hooks
          </Link>
        </Stack>
      </Box>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <ReactBasicsContent />,
}
