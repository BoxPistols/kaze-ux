import KeyboardIcon from '@mui/icons-material/Keyboard'
import SettingsIcon from '@mui/icons-material/Settings'
import {
  Box,
  Chip,
  Divider,
  Grid,
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
import { useMemo } from 'react'

import { isMacLike, shortcutLabel } from '../_shared/shortcutKeys'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Guide/How to Use',
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
    <Typography variant='h4' sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
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

const HowToUseContent = () => {
  const theme = useTheme()
  // 閲覧者の OS でキー表記を切り替える。判定は 1 回でよい
  const mac = useMemo(() => isMacLike(), [])
  const key = (command: string) => shortcutLabel(command, mac)

  const screenAreas = [
    {
      area: 'サイドバー',
      position: '左側',
      role: 'コンポーネントの一覧・検索',
    },
    {
      area: 'プレビュー',
      position: '中央',
      role: '選択したコンポーネントの表示',
    },
    {
      area: 'アドオンパネル',
      position: '下部',
      role: 'Controls、Actions、Accessibility などのタブ',
    },
  ]

  const controlTypes = [
    {
      type: 'テキスト',
      operation: '入力欄に文字を入力',
      example: 'label, title',
    },
    {
      type: 'ブーリアン',
      operation: 'チェックボックスでON/OFF',
      example: 'disabled, loading',
    },
    {
      type: 'セレクト',
      operation: 'ドロップダウンから選択',
      example: 'color, variant, size',
    },
    {
      type: '数値',
      operation: '数値入力またはスライダー',
      example: 'elevation, maxItems',
    },
    { type: 'カラー', operation: 'カラーピッカー', example: 'backgroundColor' },
  ]

  const faq = [
    {
      q: 'コンポーネントが見つからない',
      a: 'サイドバーの検索ボックスに英語名または日本語名を入力してください。',
    },
    {
      q: 'Controls が表示されない',
      a: 'Default ストーリーを選択して Canvas モードの Controls パネルを使ってください。Docs ページでは Controls テーブルが別形式で表示されます。',
    },
    {
      q: 'テーマを切り替えても色が変わらない',
      a: 'ブラウザのキャッシュをクリアしてリロードしてください（Ctrl+Shift+R / Mac は Cmd+Shift+R）。',
    },
    {
      q: 'コンポーネントの実際のコードを見たい',
      a: 'Docs ページで「Show code」ボタンをクリックするとストーリーのソースコードが表示されます。実際のコンポーネント実装は src/components/ にあります。',
    },
  ]

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }}>
      {/* 画面構成 */}
      <SectionHeader
        title='画面構成'
        subtitle='Storybook は3つのエリアで構成されています'
      />

      {/* 画面構成 SVG */}
      <Paper
        variant='outlined'
        sx={{ px: 3.5, py: 3, mb: 3, borderRadius: 2, overflow: 'hidden' }}>
        <svg viewBox='0 0 720 400' width='100%' style={{ display: 'block' }}>
          <defs>
            <style>{`
              .sb-text { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
              .sb-label { font-size: 13px; fill: ${theme.palette.text.primary}; }
              .sb-sublabel { font-size: 12px; fill: ${theme.palette.text.secondary}; }
              .sb-bold { font-size: 13px; font-weight: 700; fill: ${theme.palette.text.primary}; }
            `}</style>
          </defs>
          {/* Toolbar */}
          <rect
            x='0'
            y='0'
            width='720'
            height='48'
            rx='8'
            ry='8'
            fill={theme.palette.primary.main}
          />
          <rect
            x='0'
            y='24'
            width='720'
            height='24'
            fill={theme.palette.primary.main}
          />
          <text
            x='20'
            y='30'
            className='sb-text'
            style={{ fontSize: 14, fontWeight: 700, fill: '#fff' }}>
            Toolbar
          </text>
          <text
            x='200'
            y='30'
            className='sb-text'
            style={{ fontSize: 12, fill: 'rgba(255,255,255,0.8)' }}>
            Theme: Light / Dark
          </text>
          <text
            x='420'
            y='30'
            className='sb-text'
            style={{ fontSize: 12, fill: 'rgba(255,255,255,0.8)' }}>
            Padding: Standard / None
          </text>
          {/* 白 0.2 だと合成後の面が明るく、上に乗る白の歯車が 4.49:1 で
              4.5 に 0.01 届かない。面を少し暗くして前景の余裕を作る */}
          <rect
            x='670'
            y='12'
            width='24'
            height='24'
            rx='4'
            fill='rgba(255,255,255,0.15)'
          />
          <text
            x='676'
            y='29'
            className='sb-text'
            style={{ fontSize: 14, fill: '#fff' }}>
            &#9881;
          </text>

          {/* Sidebar */}
          <rect
            x='0'
            y='48'
            width='160'
            height='352'
            fill={theme.palette.mode === 'dark' ? '#1e1e2e' : '#f5f5f5'}
          />
          <rect
            x='0'
            y='380'
            width='160'
            height='20'
            rx='0'
            ry='0'
            fill={theme.palette.mode === 'dark' ? '#1e1e2e' : '#f5f5f5'}
          />
          <rect
            x='0'
            y='388'
            width='8'
            height='12'
            rx='0'
            ry='0'
            fill='transparent'
          />
          <text x='16' y='78' className='sb-text sb-bold'>
            Sidebar
          </text>
          <text x='20' y='108' className='sb-text sb-sublabel'>
            Guide
          </text>
          <text x='20' y='130' className='sb-text sb-sublabel'>
            Design Philosophy
          </text>
          <text x='20' y='152' className='sb-text sb-sublabel'>
            Design Tokens
          </text>
          <text x='20' y='174' className='sb-text sb-sublabel'>
            Components
          </text>
          <text x='20' y='196' className='sb-text sb-sublabel'>
            Patterns
          </text>

          {/* Preview */}
          <rect
            x='160'
            y='48'
            width='560'
            height='252'
            fill={theme.palette.background.default}
            stroke={theme.palette.divider}
            strokeWidth='1'
          />
          <text
            x='380'
            y='150'
            textAnchor='middle'
            className='sb-text sb-bold'
            style={{ fontSize: 16 }}>
            Preview
          </text>
          <text
            x='380'
            y='175'
            textAnchor='middle'
            className='sb-text sb-sublabel'>
            Canvas / Docs
          </text>
          <text
            x='380'
            y='205'
            textAnchor='middle'
            className='sb-text sb-sublabel'>
            ここにコンポーネントが表示される
          </text>

          {/* Addon Panel */}
          <rect
            x='160'
            y='300'
            width='560'
            height='100'
            fill={theme.palette.mode === 'dark' ? '#1e1e2e' : '#f8f8f8'}
            stroke={theme.palette.divider}
            strokeWidth='1'
          />
          <text x='180' y='328' className='sb-text sb-bold'>
            Addon Panel
          </text>
          {/* Tabs */}
          <rect
            x='180'
            y='340'
            width='90'
            height='28'
            rx='4'
            fill={theme.palette.primary.main}
          />
          <text
            x='195'
            y='359'
            className='sb-text'
            style={{ fontSize: 12, fill: '#fff' }}>
            Controls
          </text>
          <rect
            x='280'
            y='340'
            width='80'
            height='28'
            rx='4'
            fill={theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}
          />
          <text x='293' y='359' className='sb-text sb-sublabel'>
            Actions
          </text>
          <rect
            x='370'
            y='340'
            width='110'
            height='28'
            rx='4'
            fill={theme.palette.mode === 'dark' ? '#333' : '#e0e0e0'}
          />
          <text x='381' y='359' className='sb-text sb-sublabel'>
            Accessibility
          </text>

          {/* Border radius on outer */}
          <rect
            x='0'
            y='0'
            width='720'
            height='400'
            rx='8'
            ry='8'
            fill='none'
            stroke={theme.palette.divider}
            strokeWidth='2'
          />
        </svg>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 5 }}>
        {screenAreas.map((a) => (
          <Grid key={a.area} size={{ xs: 12, sm: 4 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
                {a.area}
              </Typography>
              <Chip
                label={a.position}
                size='small'
                variant='outlined'
                sx={{ mb: 1 }}
              />
              <Typography variant='body1' color='text.secondary'>
                {a.role}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 5 }} />

      {/* サイドバー操作 */}
      <SectionHeader title='サイドバーの操作' />
      <Stack spacing={2} sx={{ mb: 5 }}>
        <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2 }}>
          <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
            検索
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            サイドバー上部の検索ボックスに名前を入力するとコンポーネントを絞り込めます。
            例: 「Button」と入力すると、ボタン関連のストーリーだけ表示されます。
          </Typography>
        </Paper>
        <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2 }}>
          <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
            Docs と Canvas
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            各コンポーネントには「Docs」（ドキュメントページ。説明、使用例、プロパティ一覧）と
            「Default」（Canvas モード。Controls
            で操作可能）の2つのビューがあります。
          </Typography>
        </Paper>
      </Stack>

      <Divider sx={{ my: 5 }} />

      {/* Controls パネル */}
      <SectionHeader
        title='Controls パネル（最重要）'
        subtitle='Storybook の最も重要な機能'
      />

      <Paper
        sx={{
          px: 3.5,
          py: 3,
          mb: 3,
          borderRadius: 2,
          border: '2px solid',
          borderColor: 'primary.main',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(33,150,243,0.05)'
              : 'rgba(33,150,243,0.02)',
        }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          Controls パネルとは
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          コンポーネントに渡す
          props（設定値）を画面上で直接変更できるパネルです。
          コードを書かずに、variant、color、size
          など様々なバリエーションを試せます。
        </Typography>
      </Paper>

      <Box sx={{ mb: 2 }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          操作手順:
        </Typography>
        <Stack spacing={0.5} sx={{ pl: 2 }}>
          <Typography variant='body1' color='text.secondary'>
            1. サイドバーからコンポーネントの Default ストーリーを選択
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            2. 画面下部の Controls タブをクリック
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            3. 各プロパティの値を変更 → プレビューがリアルタイムに更新
          </Typography>
        </Stack>
      </Box>

      <TableContainer component={Paper} variant='outlined' sx={{ mb: 5 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>タイプ</TableCell>
              <TableCell>操作方法</TableCell>
              <TableCell>例</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {controlTypes.map((c) => (
              <TableRow key={c.type}>
                <TableCell>
                  <Typography variant='body2' sx={{ fontWeight: 400 }}>
                    {c.type}
                  </Typography>
                </TableCell>
                <TableCell>{c.operation}</TableCell>
                <TableCell>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {c.example}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 5 }} />

      {/* テーマ切り替え */}
      <SectionHeader title='テーマ切り替え（Dark Mode）' />
      <Paper variant='outlined' sx={{ px: 3, py: 2.5, borderRadius: 2, mb: 5 }}>
        <Stack spacing={1}>
          <Typography variant='body2'>
            1. 上部ツールバーの <strong>丸アイコン (Theme)</strong> をクリック
          </Typography>
          <Typography variant='body2'>
            2. <strong>Light</strong> または <strong>Dark</strong> を選択
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            全コンポーネントが選択したテーマで表示されます。 Design Tokens &gt;
            Color Palette で各テーマのカラー値も確認できます。
          </Typography>
        </Stack>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* キーボードショートカット */}
      <SectionHeader
        title='キーボードショートカット'
        subtitle='一覧は Storybook 自身が持っています。ここでは開き方だけ案内します'
      />

      <Paper variant='outlined' sx={{ px: 3.5, py: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 2 }}>
          <KeyboardIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant='body1' sx={{ fontWeight: 700 }}>
            ショートカット一覧の開き方
          </Typography>
        </Stack>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: 2 }}
            alignItems={{ xs: 'flex-start', sm: 'baseline' }}>
            <Typography
              variant='body1'
              sx={{ fontWeight: 700, minWidth: 116, flexShrink: 0 }}>
              キーボードから
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              <Chip
                label={key('shortcutsPage')}
                size='small'
                variant='outlined'
                sx={{ fontFamily: 'monospace', mr: 1 }}
              />
              を押します
            </Typography>
          </Stack>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 0.5, sm: 2 }}
            alignItems={{ xs: 'flex-start', sm: 'baseline' }}>
            <Typography
              variant='body1'
              sx={{ fontWeight: 700, minWidth: 116, flexShrink: 0 }}>
              画面から
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              サイドバー右上の歯車
              <SettingsIcon
                aria-hidden
                sx={{ fontSize: 16, verticalAlign: 'text-bottom', mx: 0.5 }}
              />
              から Keyboard shortcuts を選びます
            </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ my: 2.5 }} />
        <Typography variant='body1' color='text.secondary'>
          開いたページには、表示の切り替え（サイドバー・ツールバー・アドオンパネル・フルスクリーン）、
          ストーリーとコンポーネントの移動、検索が並んでいます。割り当ては自分で
          変更でき、Restore defaults で元に戻せます。
        </Typography>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 5 }}>
        {[
          {
            label: 'Show sidebar',
            shortcut: key('toggleNav'),
            description:
              'サイドバーの表示/非表示。プレビューを広く使いたい時にOFF。',
          },
          {
            label: 'Show toolbar',
            shortcut: key('toolbar'),
            description: 'ツールバー（テーマ切替など）の表示/非表示。',
          },
          {
            label: 'Show addons panel',
            shortcut: key('togglePanel'),
            description: 'Controls / Actions パネルの表示/非表示。',
          },
          {
            label: 'Collapse all',
            shortcut: key('collapseAll'),
            description: 'サイドバーの全カテゴリを折りたたむ。',
          },
        ].map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, borderRadius: 2, height: '100%' }}>
              <Stack
                direction='row'
                spacing={1.5}
                alignItems='center'
                sx={{ mb: 1 }}>
                <SettingsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant='body1' sx={{ fontWeight: 700 }}>
                  {item.label}
                </Typography>
                <Chip
                  label={item.shortcut}
                  size='small'
                  variant='outlined'
                  sx={{ fontFamily: 'monospace' }}
                />
              </Stack>
              <Typography variant='body1' color='text.secondary'>
                {item.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        sx={{
          px: 3.5,
          py: 3,
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
          画面が狭いと感じたら
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          サイドバー（{key('toggleNav')}）とアドオンパネル（{key('togglePanel')}
          ）を非表示にすると、プレビュー領域を最大化できます。プレゼンや
          デザインレビュー時に便利です。{key('fullScreen')}{' '}
          でフルスクリーンにすることもできます。
        </Typography>
      </Paper>

      {/* FAQ */}
      <SectionHeader title='よくある質問' />
      <Stack spacing={2}>
        {faq.map((f) => (
          <Paper
            key={f.q}
            variant='outlined'
            sx={{ px: 3.5, py: 3, borderRadius: 2 }}>
            <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
              Q: {f.q}
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              A: {f.a}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <HowToUseContent />,
}
