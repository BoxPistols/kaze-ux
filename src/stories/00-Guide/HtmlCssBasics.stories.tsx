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
  title: 'Guide/HTML CSS Basics',
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
// Box Model デモ
// ---------------------------------------------------------------------------
const BoxModelDemo = () => {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
      <Box
        sx={{
          p: 0,
          bgcolor: theme.palette.mode === 'dark' ? '#4a3728' : '#fde4cb',
          borderRadius: 1,
          textAlign: 'center',
        }}>
        <Typography
          variant='caption'
          sx={{ display: 'block', p: 0.5, fontWeight: 600 }}>
          margin (外側余白)
        </Typography>
        <Box
          sx={{
            m: 2,
            bgcolor: theme.palette.mode === 'dark' ? '#2e4a28' : '#c8e6c9',
            borderRadius: 1,
          }}>
          <Typography
            variant='caption'
            sx={{ display: 'block', p: 0.5, fontWeight: 600 }}>
            border (境界線)
          </Typography>
          <Box
            sx={{
              m: 1,
              border: '3px solid',
              borderColor:
                theme.palette.mode === 'dark' ? '#66bb6a' : '#388e3c',
              bgcolor: theme.palette.mode === 'dark' ? '#1a3a5c' : '#bbdefb',
              borderRadius: 1,
            }}>
            <Typography
              variant='caption'
              sx={{ display: 'block', p: 0.5, fontWeight: 600 }}>
              padding (内側余白)
            </Typography>
            <Box
              sx={{
                m: 2,
                p: 2,
                bgcolor: theme.palette.mode === 'dark' ? '#37474f' : '#e3f2fd',
                borderRadius: 1,
                textAlign: 'center',
              }}>
              <Typography variant='caption' sx={{ fontWeight: 700 }}>
                content
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Flexbox デモ
// ---------------------------------------------------------------------------
const FlexboxDemo = () => {
  const boxSx = {
    width: 60,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    borderRadius: 0.5,
    fontSize: 12,
    fontWeight: 600,
  }

  const demos: { label: string; sx: Record<string, unknown> }[] = [
    {
      label: 'row (default)',
      sx: { display: 'flex', gap: 1, flexDirection: 'row' },
    },
    {
      label: 'row + space-between',
      sx: { display: 'flex', gap: 1, justifyContent: 'space-between' },
    },
    {
      label: 'column',
      sx: { display: 'flex', gap: 1, flexDirection: 'column' },
    },
    {
      label: 'wrap',
      sx: { display: 'flex', gap: 1, flexWrap: 'wrap', maxWidth: 160 },
    },
    {
      label: 'center (both)',
      sx: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 80,
        border: '1px dashed',
        borderColor: 'divider',
        borderRadius: 1,
      },
    },
  ]

  return (
    <Grid container spacing={2}>
      {demos.map((d) => (
        <Grid key={d.label} size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper variant='outlined' sx={{ px: 2.5, py: 2, borderRadius: 2 }}>
            <Typography
              variant='caption'
              sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
              {d.label}
            </Typography>
            <Box sx={d.sx}>
              <Box sx={boxSx}>A</Box>
              {d.label !== 'center (both)' && (
                <>
                  <Box sx={boxSx}>B</Box>
                  <Box sx={boxSx}>C</Box>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  )
}

// ---------------------------------------------------------------------------
// Grid デモ
// ---------------------------------------------------------------------------
const CssGridDemo = () => {
  const cellSx = {
    p: 1.5,
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    borderRadius: 0.5,
    fontSize: 12,
    fontWeight: 600,
    textAlign: 'center',
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper variant='outlined' sx={{ px: 2.5, py: 2, borderRadius: 2 }}>
          <Typography
            variant='caption'
            sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
            grid-template-columns: repeat(3, 1fr)
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
            }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Box key={n} sx={cellSx}>
                {n}
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper variant='outlined' sx={{ px: 2.5, py: 2, borderRadius: 2 }}>
          <Typography
            variant='caption'
            sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
            grid-template-columns: 200px 1fr 1fr
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 1fr',
              gap: 1,
            }}>
            <Box
              sx={{
                ...cellSx,
                gridRow: 'span 2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              Nav
            </Box>
            <Box sx={{ ...cellSx, gridColumn: 'span 2' }}>Header</Box>
            <Box sx={cellSx}>Main</Box>
            <Box sx={cellSx}>Side</Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  )
}

// ---------------------------------------------------------------------------
// メインコンテンツ
// ---------------------------------------------------------------------------

const HtmlCssContent = () => {
  const theme = useTheme()

  const semanticElements = [
    { tag: '<header>', usage: 'ページやセクションのヘッダー' },
    { tag: '<nav>', usage: 'ナビゲーションリンク群' },
    { tag: '<main>', usage: 'メインコンテンツ（1ページに1つ）' },
    { tag: '<article>', usage: '独立したコンテンツブロック' },
    { tag: '<section>', usage: 'テーマ別のコンテンツグループ' },
    { tag: '<aside>', usage: '補足情報、サイドバー' },
    { tag: '<footer>', usage: 'ページやセクションのフッター' },
    { tag: '<figure>', usage: '画像やコードブロック + キャプション' },
    { tag: '<dialog>', usage: 'モーダル / ダイアログ' },
    { tag: '<details>', usage: '折りたたみ可能な詳細情報' },
  ]

  const modernCssFeatures = [
    {
      feature: 'Container Queries',
      year: '2023',
      description:
        '親要素のサイズに基づくレスポンシブ。viewport ではなくコンテナ単位で制御。',
      syntax: '@container (min-width: 400px) { ... }',
    },
    {
      feature: 'CSS Nesting',
      year: '2023',
      description: 'セレクタのネスト記法。Sass なしでネスト可能に。',
      syntax: '.card { & .title { color: red; } }',
    },
    {
      feature: ':has() セレクタ',
      year: '2023',
      description: '「親セレクタ」として機能。子要素の状態で親をスタイリング。',
      syntax: '.card:has(img) { padding: 0; }',
    },
    {
      feature: 'Cascade Layers',
      year: '2022',
      description: '@layer で詳細度の制御。ライブラリとの競合を解決。',
      syntax: '@layer base, components, utilities;',
    },
    {
      feature: 'Subgrid',
      year: '2023',
      description: '親グリッドのトラック定義を子に継承。カード内の整列に有効。',
      syntax: 'grid-template-rows: subgrid;',
    },
    {
      feature: 'View Transitions API',
      year: '2024',
      description: 'ページ遷移やDOM変更にアニメーションを適用。SPA/MPAに対応。',
      syntax: 'document.startViewTransition(() => { ... })',
    },
    {
      feature: 'Anchor Positioning',
      year: '2024',
      description:
        '要素を別の要素に対して位置決め。ポップオーバーやツールチップに最適。',
      syntax: 'position-anchor: --my-anchor;',
    },
    {
      feature: 'Scroll-driven Animations',
      year: '2024',
      description:
        'スクロール量に連動するアニメーション。JS不要のパララックス。',
      syntax: 'animation-timeline: scroll();',
    },
    {
      feature: 'color-mix()',
      year: '2023',
      description: 'CSS内で色を混合。テーマの明暗バリエーション生成に便利。',
      syntax: 'color-mix(in srgb, blue 50%, white)',
    },
    {
      feature: 'oklch() / oklab()',
      year: '2023',
      description: '人間の知覚に基づく色空間。均一な明度変化を実現。',
      syntax: 'color: oklch(0.7 0.15 210);',
    },
  ]

  const positionTypes = [
    {
      type: 'static',
      description: '通常のフロー（デフォルト）',
      usage: '特別な配置が不要な要素',
    },
    {
      type: 'relative',
      description: '通常位置からの相対移動。子要素のposition基準。',
      usage: '子要素のabsolute基準、微調整',
    },
    {
      type: 'absolute',
      description: '最近のrelative/absolute親を基準に配置',
      usage: 'バッジ、オーバーレイ、ドロップダウン',
    },
    {
      type: 'fixed',
      description: 'ビューポートを基準に配置。スクロールしても固定',
      usage: 'ヘッダー、FAB、トースト',
    },
    {
      type: 'sticky',
      description: 'スクロール閾値まではrelative、超えるとfixed',
      usage: 'テーブルヘッダー、セクションタイトル',
    },
  ]

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
              ? 'linear-gradient(135deg, rgba(0,150,136,0.08) 0%, rgba(33,150,243,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(0,150,136,0.04) 0%, rgba(33,150,243,0.04) 100%)',
        }}>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1 }}>
          HTML / CSS 基礎と近年の動向
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          セマンティックHTML、ボックスモデル、Flexbox/Grid から、 Container
          Queries、CSS Nesting など最新仕様まで。
        </Typography>
      </Paper>

      {/* セマンティック HTML */}
      <SectionHeader
        title='セマンティック HTML'
        subtitle='意味のあるタグを使うことでアクセシビリティとSEOが向上する'
      />
      <Grid container spacing={1} sx={{ mb: 3 }}>
        {semanticElements.map((e) => (
          <Grid key={e.tag} size={{ xs: 12, sm: 6, md: 4 }}>
            <Stack
              direction='row'
              spacing={1}
              alignItems='center'
              sx={{
                p: 1,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
              }}>
              <Chip
                label={e.tag}
                size='small'
                variant='outlined'
                sx={{ fontFamily: 'monospace', fontSize: 13, minWidth: 90 }}
              />
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{ fontSize: 13 }}>
                {e.usage}
              </Typography>
            </Stack>
          </Grid>
        ))}
      </Grid>

      <CodeBlock language='html'>
        {`<!-- NG: div だけで構成 -->
<div class="header">...</div>
<div class="content">...</div>
<div class="footer">...</div>

<!-- OK: セマンティックタグ -->
<header>...</header>
<main>
  <section>...</section>
  <aside>...</aside>
</main>
<footer>...</footer>`}
      </CodeBlock>

      <Divider sx={{ my: 5 }} />

      {/* ボックスモデル */}
      <SectionHeader
        title='ボックスモデル'
        subtitle='全てのHTML要素は content + padding + border + margin で構成される'
      />
      <BoxModelDemo />

      <Paper
        variant='outlined'
        sx={{ px: 3, py: 2.5, borderRadius: 2, mb: 5, mt: 2 }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          box-sizing: border-box（推奨）
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          <code>border-box</code> を指定すると、width/height に padding と
          border が含まれる。 Tailwind CSS はデフォルトで全要素に適用済み。MUI
          も同様。
          <code>content-box</code>（デフォルト）では padding と border が width
          に加算されるため計算が複雑になる。
        </Typography>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* Flexbox */}
      <SectionHeader
        title='Flexbox'
        subtitle='1次元レイアウト（行 or 列）の配置を制御'
      />
      <FlexboxDemo />

      <Box sx={{ mt: 2, mb: 5 }}>
        <CodeBlock language='css'>
          {`/* Flexbox の主要プロパティ */
.container {
  display: flex;
  flex-direction: row | column;         /* 主軸の方向 */
  justify-content: center | space-between; /* 主軸の配置 */
  align-items: center | stretch;        /* 交差軸の配置 */
  gap: 8px;                             /* 子要素間の間隔 */
  flex-wrap: wrap;                      /* 折り返し */
}
.child {
  flex: 1;           /* 残りスペースを均等分割 */
  flex-shrink: 0;    /* 縮小しない */
}`}
        </CodeBlock>
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* CSS Grid */}
      <SectionHeader
        title='CSS Grid'
        subtitle='2次元レイアウト（行 + 列）の配置を制御'
      />
      <CssGridDemo />

      <Box sx={{ mt: 2, mb: 5 }}>
        <CodeBlock language='css'>
          {`/* Grid の主要プロパティ */
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);    /* 3等分 */
  grid-template-columns: 240px 1fr;         /* サイドバー + メイン */
  grid-template-rows: auto 1fr auto;        /* ヘッダー + メイン + フッター */
  gap: 16px;                                /* 行列間の間隔 */
}
.child {
  grid-column: span 2;    /* 2列分占有 */
  grid-row: span 2;       /* 2行分占有 */
}`}
        </CodeBlock>
      </Box>

      <Paper
        sx={{
          p: 2,
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
          Flexbox vs Grid の使い分け
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          <strong>Flexbox</strong>:
          1方向の配置（ナビバー、ボタングループ、カードの中身）。
          <strong>Grid</strong>:
          2方向の配置（ページレイアウト、ダッシュボード、カードグリッド）。
          迷ったら「行だけ or 列だけ → Flex」「行と列の両方 → Grid」。
        </Typography>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* Position */}
      <SectionHeader title='Position' subtitle='要素の配置方法を制御する' />
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 5 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>position</TableCell>
              <TableCell>動作</TableCell>
              <TableCell>用途</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positionTypes.map((p) => (
              <TableRow key={p.type}>
                <TableCell>
                  <Chip
                    label={p.type}
                    size='small'
                    variant='outlined'
                    sx={{ fontFamily: 'monospace', fontSize: 13 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body2' sx={{ fontSize: 13 }}>
                    {p.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant='body1'
                    color='text.secondary'
                    sx={{ fontSize: 13 }}>
                    {p.usage}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 5 }} />

      {/* 近年のCSS */}
      <SectionHeader
        title='近年の CSS 新機能（2022〜2025）'
        subtitle='ブラウザサポートが進んだ最新仕様'
      />
      <Stack spacing={1.5} sx={{ mb: 5 }}>
        {modernCssFeatures.map((f) => (
          <Paper
            key={f.feature}
            variant='outlined'
            sx={{ px: 2.5, py: 2, borderRadius: 2 }}>
            <Stack
              direction='row'
              spacing={1}
              alignItems='center'
              sx={{ mb: 0.5 }}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                {f.feature}
              </Typography>
              <Chip
                label={f.year}
                size='small'
                variant='outlined'
                sx={{ height: 20, fontSize: 11 }}
              />
            </Stack>
            <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
              {f.description}
            </Typography>
            <Typography
              variant='body2'
              sx={{
                fontFamily: 'monospace',
                fontSize: 13,
                bgcolor:
                  theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                p: 0.5,
                px: 1,
                borderRadius: 0.5,
                display: 'inline-block',
              }}>
              {f.syntax}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Divider sx={{ my: 5 }} />

      {/* CSS設計の傾向 */}
      <SectionHeader
        title='CSS設計の近年の傾向'
        subtitle='2020年代のベストプラクティス'
      />
      <Grid container spacing={2}>
        {[
          {
            title: 'ユーティリティファースト',
            description:
              'Tailwind CSS に代表される。小さなユーティリティクラスを組み合わせてスタイリング。BEMやCSS Modulesからの移行が進む。',
          },
          {
            title: 'CSS-in-JS の後退',
            description:
              'styled-components / Emotion のランタイムコストが問題視。ゼロランタイムCSS（Panda CSS, vanilla-extract）やTailwindへの移行。',
          },
          {
            title: 'デザイントークン',
            description:
              'CSS変数（Custom Properties）でカラー・スペーシング・フォントを一元管理。テーマ切替やブランド展開に対応。',
          },
          {
            title: 'コンテナクエリ',
            description:
              'メディアクエリ（viewport基準）からコンテナクエリ（親要素基準）へ。コンポーネント単位のレスポンシブが可能に。',
          },
          {
            title: 'レイヤー管理',
            description:
              '@layer で詳細度を制御。サードパーティCSS（MUI等）との競合を防ぐ。!important の乱用から脱却。',
          },
          {
            title: 'ネイティブネスト',
            description:
              'CSSネスト記法がブラウザネイティブに。Sass/Less への依存が減少。PostCSSプラグインも不要になりつつある。',
          },
        ].map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3, py: 2.5, borderRadius: 2, height: '100%' }}>
              <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
                {item.title}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                {item.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 参考リンク */}
      <Box
        sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1.5 }}>
          参考リンク
        </Typography>
        <Stack spacing={0.75}>
          <Link
            href='https://mui.com/material-ui/react-box/'
            target='_blank'
            rel='noopener noreferrer'
            variant='body1'
            color='primary'>
            MUI Box
          </Link>
          <Link
            href='https://mui.com/material-ui/react-grid/'
            target='_blank'
            rel='noopener noreferrer'
            variant='body1'
            color='primary'>
            MUI Grid
          </Link>
          <Link
            href='https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout'
            target='_blank'
            rel='noopener noreferrer'
            variant='body1'
            color='primary'>
            CSS Flexbox (MDN)
          </Link>
        </Stack>
      </Box>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <HtmlCssContent />,
}

// ---------------------------------------------------------------------------
// Flexbox Playground（インタラクティブ）
// ---------------------------------------------------------------------------
interface FlexboxPlaygroundArgs {
  direction: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  justifyContent:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  alignItems: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  gap: number
  wrap: boolean
  itemCount: number
}

const FlexboxPlaygroundContent = ({
  direction,
  justifyContent,
  alignItems,
  gap,
  wrap,
  itemCount,
}: FlexboxPlaygroundArgs) => {
  const itemSizes = [40, 60, 35, 50, 45, 55, 42, 48]
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
        Flexbox Playground
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
        Controls パネルで direction / justifyContent / alignItems / gap / wrap
        を変更して動作を体験
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
          {`display: flex; flex-direction: ${direction}; justify-content: ${justifyContent}; align-items: ${alignItems}; gap: ${gap * 8}px;${wrap ? ' flex-wrap: wrap;' : ''}`}
        </Typography>
      </Paper>
      <Paper
        variant='outlined'
        sx={{
          p: 2,
          minHeight: 200,
          borderRadius: 2,
          display: 'flex',
          flexDirection: direction,
          justifyContent,
          alignItems,
          gap: gap,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        }}>
        {Array.from({ length: itemCount }, (_, i) => {
          const h = itemSizes[i % itemSizes.length]
          return (
            <Paper
              key={i}
              elevation={0}
              sx={{
                width: direction.includes('column') ? '100%' : 60,
                minWidth: 60,
                height: alignItems === 'stretch' ? 'auto' : h,
                minHeight: h,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 1.5,
                flexShrink: 0,
              }}>
              {String.fromCharCode(65 + i)}
            </Paper>
          )
        })}
      </Paper>
    </Box>
  )
}

export const FlexboxPlayground: StoryObj<FlexboxPlaygroundArgs> = {
  name: 'Flexbox Playground',
  args: {
    direction: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 1,
    wrap: false,
    itemCount: 5,
  },
  argTypes: {
    direction: {
      control: { type: 'select' },
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
      description: '主軸の方向',
    },
    justifyContent: {
      control: { type: 'select' },
      options: [
        'flex-start',
        'center',
        'flex-end',
        'space-between',
        'space-around',
        'space-evenly',
      ],
      description: '主軸方向の配置',
    },
    alignItems: {
      control: { type: 'select' },
      options: ['flex-start', 'center', 'flex-end', 'stretch'],
      description: '交差軸方向の配置',
    },
    gap: {
      control: { type: 'range', min: 0, max: 6, step: 0.5 },
      description: '子要素間の間隔（8px x n）',
    },
    wrap: {
      control: 'boolean',
      description: '折り返しの有無',
    },
    itemCount: {
      control: { type: 'range', min: 1, max: 8, step: 1 },
      description: 'アイテム数',
    },
  },
  render: (args) => <FlexboxPlaygroundContent {...args} />,
}

// ---------------------------------------------------------------------------
// Box Model Playground（インタラクティブ）
// ---------------------------------------------------------------------------
interface BoxModelArgs {
  padding: number
  margin: number
  borderWidth: number
  contentWidth: number
}

const BoxModelPlayground = ({
  padding,
  margin,
  borderWidth,
  contentWidth,
}: BoxModelArgs) => {
  const theme = useTheme()
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
        Box Model Playground
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
        padding / margin / border を動かしてボックスモデルの各層を体験
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
          {`margin: ${margin * 8}px; padding: ${padding * 8}px; border: ${borderWidth}px solid; width: ${contentWidth}px;`}
        </Typography>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Box
          sx={{
            bgcolor: theme.palette.mode === 'dark' ? '#4a3728' : '#fde4cb',
            borderRadius: 1,
            p: `${margin * 8}px`,
            position: 'relative',
          }}>
          <Typography
            variant='caption'
            sx={{
              position: 'absolute',
              top: 4,
              left: 8,
              fontWeight: 600,
              opacity: 0.7,
            }}>
            margin: {margin * 8}px
          </Typography>
          <Box
            sx={{
              border: `${borderWidth}px solid`,
              borderColor:
                theme.palette.mode === 'dark' ? '#66bb6a' : '#388e3c',
              bgcolor: theme.palette.mode === 'dark' ? '#1a3a5c' : '#bbdefb',
              borderRadius: 1,
              p: `${padding * 8}px`,
              position: 'relative',
            }}>
            <Typography
              variant='caption'
              sx={{
                position: 'absolute',
                top: 4,
                left: 8,
                fontWeight: 600,
                opacity: 0.7,
              }}>
              padding: {padding * 8}px / border: {borderWidth}px
            </Typography>
            <Box
              sx={{
                width: contentWidth,
                height: 80,
                bgcolor: theme.palette.mode === 'dark' ? '#37474f' : '#e3f2fd',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Typography variant='body2' sx={{ fontWeight: 700 }}>
                content ({contentWidth}px)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export const BoxModelInteractive: StoryObj<BoxModelArgs> = {
  name: 'Box Model Playground',
  args: {
    padding: 3,
    margin: 2,
    borderWidth: 3,
    contentWidth: 200,
  },
  argTypes: {
    padding: {
      control: { type: 'range', min: 0, max: 8, step: 0.5 },
      description: '内側余白（8px x n）',
    },
    margin: {
      control: { type: 'range', min: 0, max: 6, step: 0.5 },
      description: '外側余白（8px x n）',
    },
    borderWidth: {
      control: { type: 'range', min: 0, max: 10, step: 1 },
      description: '境界線の太さ (px)',
    },
    contentWidth: {
      control: { type: 'range', min: 80, max: 400, step: 10 },
      description: 'コンテンツの幅 (px)',
    },
  },
  render: (args) => <BoxModelPlayground {...args} />,
}
