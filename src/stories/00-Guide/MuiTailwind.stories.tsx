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
  title: 'Guide/MUI + Tailwind CSS',
  parameters: {
    layout: 'padded',
    docs: { page: null },
  },
}

export default meta

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

const MuiTailwindContent = () => {
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
          background:
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(33,150,243,0.08) 0%, rgba(76,175,80,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(33,150,243,0.04) 0%, rgba(76,175,80,0.04) 100%)',
        }}>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1 }}>
          MUI + Tailwind CSS 統合ガイド
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          このプロジェクトでは MUI v7 と Tailwind CSS v3 を CSS変数
          を介して統合しています。
          カラー、スペーシング、ブレークポイントが両方のシステムで共有されます。
        </Typography>
      </Paper>

      {/* アーキテクチャ図 */}
      <SectionHeader
        title='統合アーキテクチャ'
        subtitle='CSS変数が MUI と Tailwind の橋渡し'
      />
      <Paper
        variant='outlined'
        sx={{ px: 3.5, py: 3, mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <svg viewBox='0 0 720 380' width='100%' style={{ display: 'block' }}>
          <defs>
            <style>{`
              .at-text { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
              .at-title { font-size: 14px; font-weight: 700; fill: #fff; }
              .at-file { font-size: 11px; fill: rgba(255,255,255,0.7); font-family: ui-monospace, monospace; }
              .at-label { font-size: 12px; fill: ${theme.palette.text.primary}; }
              .at-code { font-size: 11px; fill: ${theme.palette.text.secondary}; font-family: ui-monospace, monospace; }
              .at-arrow { stroke: ${theme.palette.primary.main}; stroke-width: 2.5; fill: none; marker-end: url(#arrowhead); }
            `}</style>
            <marker
              id='arrowhead'
              markerWidth='8'
              markerHeight='6'
              refX='8'
              refY='3'
              orient='auto'>
              <polygon
                points='0 0, 8 3, 0 6'
                fill={theme.palette.primary.main}
              />
            </marker>
          </defs>

          {/* MUI Theme Box */}
          <rect
            x='10'
            y='10'
            width='200'
            height='70'
            rx='10'
            fill={theme.palette.primary.main}
          />
          <text x='110' y='38' textAnchor='middle' className='at-text at-title'>
            MUI Theme
          </text>
          <text x='110' y='58' textAnchor='middle' className='at-text at-file'>
            src/themes/theme.ts
          </text>

          {/* CSS Variables Box */}
          <rect
            x='260'
            y='10'
            width='200'
            height='70'
            rx='10'
            fill={theme.palette.success.main}
          />
          <text x='360' y='38' textAnchor='middle' className='at-text at-title'>
            CSS Variables
          </text>
          <text x='360' y='58' textAnchor='middle' className='at-text at-file'>
            src/index.css
          </text>

          {/* Tailwind Config Box */}
          <rect
            x='510'
            y='10'
            width='200'
            height='70'
            rx='10'
            fill={theme.palette.info.main}
          />
          <text x='610' y='38' textAnchor='middle' className='at-text at-title'>
            Tailwind Config
          </text>
          <text x='610' y='58' textAnchor='middle' className='at-text at-file'>
            tailwind.config.js
          </text>

          {/* Arrows between boxes */}
          <line x1='210' y1='45' x2='258' y2='45' className='at-arrow' />
          <line x1='508' y1='45' x2='462' y2='45' className='at-arrow' />

          {/* Mapping rows - background */}
          <rect
            x='10'
            y='100'
            width='700'
            height='180'
            rx='8'
            fill={
              theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.03)'
                : 'rgba(0,0,0,0.02)'
            }
            stroke={theme.palette.divider}
            strokeWidth='1'
          />

          {/* Column headers */}
          <text
            x='110'
            y='125'
            textAnchor='middle'
            className='at-text at-label'
            style={{ fontWeight: 700 }}>
            MUI sx prop
          </text>
          <text
            x='360'
            y='125'
            textAnchor='middle'
            className='at-text at-label'
            style={{ fontWeight: 700 }}>
            CSS Variable
          </text>
          <text
            x='610'
            y='125'
            textAnchor='middle'
            className='at-text at-label'
            style={{ fontWeight: 700 }}>
            Tailwind class
          </text>

          {/* Separator */}
          <line
            x1='30'
            y1='135'
            x2='690'
            y2='135'
            stroke={theme.palette.divider}
            strokeWidth='1'
          />

          {/* Row 1 - primary */}
          <circle cx='40' cy='160' r='6' fill={theme.palette.primary.main} />
          <text x='55' y='164' className='at-text at-code'>
            palette.primary.main
          </text>
          <text x='290' y='164' className='at-text at-code'>
            --color-primary
          </text>
          <text x='540' y='164' className='at-text at-code'>
            bg-primary
          </text>

          {/* Row 2 - error */}
          <circle cx='40' cy='195' r='6' fill={theme.palette.error.main} />
          <text x='55' y='199' className='at-text at-code'>
            palette.error.main
          </text>
          <text x='290' y='199' className='at-text at-code'>
            --color-error
          </text>
          <text x='540' y='199' className='at-text at-code'>
            bg-error
          </text>

          {/* Row 3 - success */}
          <circle cx='40' cy='230' r='6' fill={theme.palette.success.main} />
          <text x='55' y='234' className='at-text at-code'>
            palette.success.main
          </text>
          <text x='290' y='234' className='at-text at-code'>
            --color-success
          </text>
          <text x='540' y='234' className='at-text at-code'>
            bg-success
          </text>

          {/* Row 4 - background */}
          <circle
            cx='40'
            cy='265'
            r='6'
            fill={theme.palette.background.default}
            stroke={theme.palette.divider}
            strokeWidth='1'
          />
          <text x='55' y='269' className='at-text at-code'>
            palette.background
          </text>
          <text x='290' y='269' className='at-text at-code'>
            --color-background
          </text>
          <text x='540' y='269' className='at-text at-code'>
            bg-background
          </text>

          {/* Usage section */}
          <text
            x='110'
            y='320'
            textAnchor='middle'
            className='at-text at-label'
            style={{ fontWeight: 700 }}>
            Usage
          </text>
          <text
            x='360'
            y='320'
            textAnchor='middle'
            className='at-text at-label'
            style={{ fontWeight: 700 }}>
            Usage
          </text>
          <text
            x='610'
            y='320'
            textAnchor='middle'
            className='at-text at-label'
            style={{ fontWeight: 700 }}>
            Usage
          </text>

          <rect
            x='20'
            y='332'
            width='180'
            height='34'
            rx='6'
            fill={theme.palette.mode === 'dark' ? '#1e1e2e' : '#f5f5f5'}
          />
          <text x='110' y='354' textAnchor='middle' className='at-text at-code'>
            {"sx={{ color: 'primary.main' }}"}
          </text>

          <rect
            x='270'
            y='332'
            width='180'
            height='34'
            rx='6'
            fill={theme.palette.mode === 'dark' ? '#1e1e2e' : '#f5f5f5'}
          />
          <text x='360' y='354' textAnchor='middle' className='at-text at-code'>
            var(--color-primary)
          </text>

          <rect
            x='520'
            y='332'
            width='180'
            height='34'
            rx='6'
            fill={theme.palette.mode === 'dark' ? '#1e1e2e' : '#f5f5f5'}
          />
          <text x='610' y='354' textAnchor='middle' className='at-text at-code'>
            className=&quot;bg-primary&quot;
          </text>
        </svg>
      </Paper>

      <Paper
        sx={{
          px: 3,
          py: 2.5,
          mb: 5,
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'primary.main',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(33,150,243,0.05)'
              : 'rgba(33,150,243,0.02)',
        }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
          ポイント
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          <code>src/index.css</code> でCSS変数を定義し、<code>:root</code>
          （Light）と
          <code>.dark</code>（Dark）で値を切り替えています。 MUI テーマと
          Tailwind
          設定の両方がこのCSS変数を参照するため、テーマ切替が自動的に連動します。
        </Typography>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* 使い分けルール */}
      <SectionHeader title='使い分けルール' subtitle='どちらを使うべきか' />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant='outlined'
            sx={{
              px: 3.5,
              py: 3,
              borderRadius: 2,
              height: '100%',
              borderColor: 'primary.main',
            }}>
            <Stack
              direction='row'
              spacing={1}
              alignItems='center'
              sx={{ mb: 1.5 }}>
              <Chip label='MUI sx prop' color='primary' size='small' />
              <Typography variant='body1' sx={{ fontWeight: 600 }}>
                推奨
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {[
                'MUI コンポーネントのスタイリング',
                'テーマ値の参照（palette, spacing, typography）',
                'レスポンシブ値（breakpoint対応）',
                'コンポーネント固有のスタイル',
              ].map((item) => (
                <Typography key={item} variant='body1' color='text.secondary'>
                  - {item}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant='outlined'
            sx={{
              px: 3.5,
              py: 3,
              borderRadius: 2,
              height: '100%',
              borderColor: 'success.main',
            }}>
            <Stack
              direction='row'
              spacing={1}
              alignItems='center'
              sx={{ mb: 1.5 }}>
              <Chip label='Tailwind className' color='success' size='small' />
              <Typography variant='body1' sx={{ fontWeight: 600 }}>
                補助的に使用
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {[
                '純HTML要素のレイアウト（div, span）',
                'ユーティリティクラス（flex, gap, grid）',
                'shadcn風のコンポーネント',
                'MUIを使わない箇所のスタイリング',
              ].map((item) => (
                <Typography key={item} variant='body1' color='text.secondary'>
                  - {item}
                </Typography>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        sx={{
          p: 2,
          mb: 5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'warning.main',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,152,0,0.05)'
              : 'rgba(255,152,0,0.02)',
        }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
          原則: MUIコンポーネントには sx を使う
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {`<Button>, <Box>, <Paper> など MUI コンポーネントには sx prop を優先してください。
Tailwind の className は純HTML要素や、MUI を使わない箇所で使用します。
同じ要素に sx と className を混在させないでください。`}
        </Typography>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* 具体例 */}
      <SectionHeader title='コード例' />

      <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
        MUI sx prop（推奨パターン）
      </Typography>
      <CodeBlock>
        {`// MUI コンポーネント → sx prop を使用
<Box sx={{ display: 'flex', gap: 2, p: 3 }}>
  <Button variant="contained" sx={{ minWidth: 120 }}>
    保存
  </Button>
</Box>

// テーマ値の参照
<Paper sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
  <Typography sx={{ color: 'primary.main', fontWeight: 600 }}>
    テーマカラー参照
  </Typography>
</Paper>

// レスポンシブ
<Box sx={{ p: { xs: 2, md: 4 }, display: { xs: 'block', md: 'flex' } }}>
  コンテンツ
</Box>`}
      </CodeBlock>

      <Box sx={{ mt: 3 }} />

      <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
        Tailwind className（純HTML要素での使用）
      </Typography>
      <CodeBlock>
        {`// 純HTML要素 → Tailwind className を使用
<div className="flex gap-2 p-6">
  <span className="text-primary font-semibold">
    Tailwindカラー
  </span>
</div>

// cn() ユーティリティで条件付きクラス結合
import { cn } from '@/utils/className'

<div className={cn(
  'rounded-lg border p-4',
  isActive && 'bg-primary text-white',
  isDisabled && 'opacity-50 pointer-events-none'
)}>
  条件付きスタイル
</div>`}
      </CodeBlock>

      <Box sx={{ mt: 3 }} />

      <Typography
        variant='body1'
        sx={{ fontWeight: 700, mb: 1, color: 'error.main' }}>
        NG: 混在パターン
      </Typography>
      <CodeBlock>
        {`// NG: MUIコンポーネントに Tailwind className を混在
<Button className="p-4 text-red-500" sx={{ mt: 2 }}>
  混在は避ける
</Button>

// OK: どちらか一方に統一
<Button sx={{ p: 2, color: 'error.main', mt: 2 }}>
  sx に統一
</Button>`}
      </CodeBlock>

      <Divider sx={{ my: 5 }} />

      {/* CSS変数 */}
      <SectionHeader
        title='CSS変数一覧'
        subtitle='src/index.css で定義。Light / Dark で自動切替'
      />

      <TableContainer component={Paper} variant='outlined' sx={{ mb: 3 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>CSS変数</TableCell>
              <TableCell>Tailwind クラス</TableCell>
              <TableCell>MUI sx</TableCell>
              <TableCell>
                <Stack direction='row' spacing={0.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#ffffff',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Typography variant='caption'>Light</Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <Stack direction='row' spacing={0.5}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: '#313035',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Typography variant='caption'>Dark</Typography>
                </Stack>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              {
                cssVar: '--color-primary',
                tw: 'bg-primary',
                sx: 'palette.primary.main',
                light: '#0e0d6a',
                dark: '#4f4ea7',
              },
              {
                cssVar: '--color-error',
                tw: 'bg-error',
                sx: 'palette.error.main',
                light: '#da3737',
                dark: '#ef5350',
              },
              {
                cssVar: '--color-success',
                tw: 'bg-success',
                sx: 'palette.success.main',
                light: '#46ab4a',
                dark: '#66bb6a',
              },
              {
                cssVar: '--color-warning',
                tw: 'bg-warning',
                sx: 'palette.warning.main',
                light: '#eb8117',
                dark: '#ffa726',
              },
              {
                cssVar: '--color-info',
                tw: 'bg-info',
                sx: 'palette.info.main',
                light: '#1dafc2',
                dark: '#00acc1',
              },
              {
                cssVar: '--color-background',
                tw: 'bg-background',
                sx: 'palette.background.default',
                light: '#ffffff',
                dark: '#313035',
              },
              {
                cssVar: '--color-foreground',
                tw: 'text-foreground',
                sx: 'palette.text.primary',
                light: '#223354',
                dark: '#ffffff',
              },
            ].map((row) => (
              <TableRow key={row.cssVar}>
                <TableCell>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {row.cssVar}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.tw}
                    size='small'
                    variant='outlined'
                    sx={{ fontFamily: 'monospace', fontSize: 13 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {row.sx}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction='row' spacing={0.5} alignItems='center'>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 0.5,
                        bgcolor: row.light,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <Typography
                      variant='caption'
                      sx={{ fontFamily: 'monospace' }}>
                      {row.light}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction='row' spacing={0.5} alignItems='center'>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 0.5,
                        bgcolor: row.dark,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    />
                    <Typography
                      variant='caption'
                      sx={{ fontFamily: 'monospace' }}>
                      {row.dark}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 5 }} />

      {/* スペーシング対応表 */}
      <SectionHeader
        title='スペーシング対応表'
        subtitle='MUI spacing(4px単位) と Tailwind spacing の対応'
      />

      <TableContainer component={Paper} variant='outlined' sx={{ mb: 5 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>MUI sx</TableCell>
              <TableCell>Tailwind</TableCell>
              <TableCell>ピクセル値</TableCell>
              <TableCell>プレビュー</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              { muiSx: 'p: 0.5', tw: 'p-0.5', px: '2px' },
              { muiSx: 'p: 1', tw: 'p-1', px: '4px' },
              { muiSx: 'p: 2', tw: 'p-2', px: '8px' },
              { muiSx: 'p: 3', tw: 'p-3', px: '12px' },
              { muiSx: 'p: 4', tw: 'p-4', px: '16px' },
              { muiSx: 'p: 6', tw: 'p-6', px: '24px' },
              { muiSx: 'p: 8', tw: 'p-8', px: '32px' },
            ].map((row) => (
              <TableRow key={row.muiSx}>
                <TableCell>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {`sx={{ ${row.muiSx} }}`}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={row.tw}
                    size='small'
                    variant='outlined'
                    sx={{ fontFamily: 'monospace', fontSize: 13 }}
                  />
                </TableCell>
                <TableCell>{row.px}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      width: parseInt(row.px),
                      height: 12,
                      bgcolor: 'primary.main',
                      borderRadius: 0.5,
                      minWidth: 2,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Paper
        sx={{
          px: 3,
          py: 2.5,
          mb: 5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'info.main',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(0,172,193,0.05)'
              : 'rgba(0,172,193,0.02)',
        }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
          注意: spacing の基準値が異なる
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          MUI の <code>theme.spacing</code> は 4px 単位です（
          <code>spacing(1) = 4px</code>）。 Tailwind のデフォルトは 4px 単位（
          <code>p-1 = 4px</code>）で同じです。 ただし <code>sxToClassName</code>{' '}
          ユーティリティでは MUI の慣習（<code>p: 1 = 8px</code>）に
          合わせたマッピングも提供しています。
        </Typography>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* cn() ユーティリティ */}
      <SectionHeader
        title='cn() ユーティリティ'
        subtitle='src/utils/className.ts'
      />

      <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          cn() とは
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          <code>clsx</code>（条件付きクラス結合）と <code>tailwind-merge</code>
          （重複クラス解決）を 組み合わせたユーティリティ関数です。shadcn/ui
          のパターンを採用しています。
        </Typography>
      </Paper>

      <CodeBlock>
        {`import { cn } from '@/utils/className'

// 基本的な使い方
cn('flex gap-2', 'p-4')
// => "flex gap-2 p-4"

// 条件付きクラス
cn('rounded-lg border', isActive && 'border-primary', !isActive && 'border-gray-200')
// isActive=true => "rounded-lg border border-primary"

// クラスの上書き（tailwind-merge が解決）
cn('p-4', 'p-6')
// => "p-6" (後から指定した方が優先)`}
      </CodeBlock>

      <Divider sx={{ my: 5 }} />

      {/* ファイル構成 */}
      <SectionHeader title='関連ファイル一覧' />

      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>ファイル</TableCell>
              <TableCell>役割</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              {
                file: 'src/index.css',
                role: 'CSS変数定義（Light/Dark）、Tailwind ディレクティブ',
              },
              {
                file: 'tailwind.config.js',
                role: 'Tailwind 設定。CSS変数を参照するカラー定義',
              },
              {
                file: 'src/themes/theme.ts',
                role: 'MUI テーマ定義。パレット、コンポーネントスタイル',
              },
              {
                file: 'src/themes/colorToken.ts',
                role: 'カラー値の元データ（colorData）',
              },
              {
                file: 'src/themes/breakpoints.ts',
                role: 'ブレークポイント定義（MUI + Tailwind 互換）',
              },
              {
                file: 'src/utils/className.ts',
                role: 'cn() ユーティリティ、sx → className 変換',
              },
              {
                file: 'postcss.config.cjs',
                role: 'PostCSS 設定（tailwindcss + autoprefixer）',
              },
            ].map((row) => (
              <TableRow key={row.file}>
                <TableCell>
                  <Typography
                    variant='body2'
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: 500,
                    }}>
                    {row.file}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body1' color='text.secondary'>
                    {row.role}
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
          <Link href='https://mui.com/system/getting-started/the-sx-prop/' target='_blank' rel='noopener noreferrer' variant='body1' color='primary'>
            MUI sx prop
          </Link>
          <Link href='https://mui.com/material-ui/customization/theming/' target='_blank' rel='noopener noreferrer' variant='body1' color='primary'>
            MUI Theming
          </Link>
          <Link href='https://tailwindcss.com/docs/configuration' target='_blank' rel='noopener noreferrer' variant='body1' color='primary'>
            Tailwind CSS Configuration
          </Link>
        </Stack>
      </Box>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <MuiTailwindContent />,
}

// ---------------------------------------------------------------------------
// sx prop Playground（インタラクティブ）
// ---------------------------------------------------------------------------
interface SxPlaygroundArgs {
  padding: number
  borderRadius: number
  bgColor:
    | 'primary.main'
    | 'secondary.main'
    | 'error.main'
    | 'success.main'
    | 'info.main'
    | 'warning.main'
  variant: 'outlined' | 'elevation'
  elevation: number
}

const SxPlayground = ({
  padding,
  borderRadius,
  bgColor,
  variant,
  elevation,
}: SxPlaygroundArgs) => {
  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
        MUI sx prop Playground
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
        Controls でリアルタイムにスタイルを変更。sx prop の動作を体験
      </Typography>
      <Paper
        variant='outlined'
        sx={{ px: 2, py: 1.5, mb: 3, borderRadius: 1.5 }}>
        <Typography
          variant='body2'
          sx={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 }}>
          {`<Paper ${variant === 'outlined' ? 'variant="outlined"' : `elevation={${elevation}}`} sx={{ p: ${padding}, borderRadius: ${borderRadius} }}>`}
          <br />
          {'  '}
          {`<Box sx={{ bgcolor: '${bgColor}', color: '${bgColor.replace('.main', '.contrastText')}' }}>`}
        </Typography>
      </Paper>
      <Paper
        variant={variant}
        elevation={variant === 'elevation' ? elevation : 0}
        sx={{
          p: padding,
          borderRadius,
          transition: 'all 0.3s ease',
        }}>
        <Box
          sx={{
            bgcolor: bgColor,
            color: bgColor.replace('.main', '.contrastText'),
            p: 3,
            borderRadius: Math.max(0, borderRadius - 0.5),
            textAlign: 'center',
            transition: 'all 0.3s ease',
          }}>
          <Typography variant='h6' sx={{ fontWeight: 700 }}>
            {bgColor.split('.')[0]}
          </Typography>
          <Typography variant='body2' sx={{ opacity: 0.8 }}>
            padding: {padding * 8}px / radius: {borderRadius * 8}px
          </Typography>
        </Box>
      </Paper>
      <Stack
        direction='row'
        spacing={2}
        sx={{ mt: 2, justifyContent: 'center' }}>
        <Typography variant='caption' color='text.secondary'>
          MUI: sx={'{{'} p: {padding} {'}}'}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          Tailwind: p-{padding * 2}
        </Typography>
        <Typography variant='caption' color='text.secondary'>
          CSS: {padding * 8}px
        </Typography>
      </Stack>
    </Box>
  )
}

export const SxPropPlayground: StoryObj<SxPlaygroundArgs> = {
  name: 'sx prop Playground',
  args: {
    padding: 2,
    borderRadius: 2,
    bgColor: 'primary.main',
    variant: 'outlined',
    elevation: 4,
  },
  argTypes: {
    padding: {
      control: { type: 'range', min: 0, max: 8, step: 0.5 },
      description: 'padding（8px x n）',
    },
    borderRadius: {
      control: { type: 'range', min: 0, max: 6, step: 0.5 },
      description: '角丸（8px x n）',
    },
    bgColor: {
      control: { type: 'select' },
      options: [
        'primary.main',
        'secondary.main',
        'error.main',
        'success.main',
        'info.main',
        'warning.main',
      ],
      description: 'セマンティックカラー',
    },
    variant: {
      control: { type: 'select' },
      options: ['outlined', 'elevation'],
      description: 'Paper のバリアント',
    },
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: 'elevation（variant=elevation時のみ有効）',
    },
  },
  render: (args) => <SxPlayground {...args} />,
}
