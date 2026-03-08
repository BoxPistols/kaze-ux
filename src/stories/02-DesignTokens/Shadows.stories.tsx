import {
  Box,
  Typography,
  Stack,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Tooltip,
  Button,
  Chip,
  ThemeProvider,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import { darkTheme } from '@/themes/theme'

import type { Meta, StoryObj } from '@storybook/react-vite'

// --- メタ定義 ---
const meta: Meta = {
  title: 'Design Tokens/Shadows & Elevation',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// --- 各elevation段階の使用場面の説明 ---
const elevationDescriptions: Record<number, string> = {
  0: 'フラットな要素。影なし。Paper, Card（デフォルト）',
  1: '微かな浮き上がり。ホバー前のカード、入力フィールド',
  2: '軽い浮き上がり。ホバー中のカード、アクティブなリスト項目',
  3: '中程度の浮き上がり。ドロップダウンメニュー、ポップオーバー',
  4: '高い浮き上がり。モーダル、ダイアログの手前要素',
  5: '最大級の浮き上がり。フルスクリーンに近いダイアログ',
  6: '最大の浮き上がり。最前面のオーバーレイ要素',
}

// --- 1. ElevationScale: 各elevation段階をカード形式で表示 ---
const ElevationScaleContent = () => {
  const theme = useTheme()
  // テーマから有効なシャドウ値のみ取得（0〜6）
  const elevations = [0, 1, 2, 3, 4, 5, 6]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Elevation スケール
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        プロジェクトで定義されているカスタムシャドウの一覧。0〜6の7段階で構成され、
        6以降は同一の値が適用されます。
      </Typography>

      <Grid container spacing={4}>
        {elevations.map((level) => {
          const shadowValue = theme.shadows[level]
          return (
            <Grid key={level} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Box
                sx={{
                  p: 4,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: shadowValue,
                  border: '1px solid',
                  borderColor: 'divider',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}>
                {/* Elevation値 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {level}
                  </Typography>
                  <Chip
                    label={`elevation={${level}}`}
                    size='small'
                    variant='outlined'
                    sx={{ fontFamily: 'monospace' }}
                  />
                </Box>

                {/* CSS値 */}
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'action.hover',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}>
                  <Typography
                    variant='caption'
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      lineHeight: 1.6,
                      wordBreak: 'break-all',
                      color: 'text.secondary',
                    }}>
                    {shadowValue === 'none'
                      ? 'box-shadow: none'
                      : `box-shadow: ${shadowValue}`}
                  </Typography>
                </Box>

                {/* 使用場面 */}
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 'auto' }}>
                  {elevationDescriptions[level]}
                </Typography>
              </Box>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

export const ElevationScale: StoryObj = {
  name: 'Elevation スケール',
  render: () => <ElevationScaleContent />,
}

// --- 2. ComponentElevation: コンポーネント別の推奨elevation ---
const ComponentElevationContent = () => {
  const theme = useTheme()

  // コンポーネント別の影情報
  const componentShadows = [
    {
      name: 'Card',
      borderRadius: 12,
      lightShadow:
        '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
      hoverShadow:
        '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
      description:
        'デフォルトelevation: 0。border + カスタムboxShadowで表現。ホバー時に影が強まる。',
    },
    {
      name: 'Dialog',
      borderRadius: 16,
      lightShadow:
        '0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)',
      hoverShadow: null,
      description:
        'デフォルトelevation: 0。最も大きなboxShadowを持つ。モーダル表示に適切な深さ。',
    },
    {
      name: 'Menu',
      borderRadius: 6,
      lightShadow: '0 4px 20px rgba(0,0,0,0.15)',
      hoverShadow: null,
      description:
        'コンテキストメニュー・ドロップダウン用。コンパクトな角丸と中程度の影。',
    },
    {
      name: 'Paper',
      borderRadius: 12,
      lightShadow: 'none',
      hoverShadow: null,
      description:
        'デフォルトelevation: 0。影なしのフラットな背景要素。角丸12pxが基本。',
    },
    {
      name: 'Tooltip',
      borderRadius: 6,
      lightShadow: '0 2px 8px rgba(0,0,0,0.15)',
      hoverShadow: null,
      description:
        '補助的な情報表示。暗い背景に白テキスト。コンパクトな影と角丸。',
    },
  ]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        コンポーネント別 Elevation
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        各コンポーネントに適用されている推奨影スタイルと、実際の表示例です。
      </Typography>

      <Stack spacing={6}>
        {/* Card */}
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
            Card
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title='サービスカード' subheader='通常状態の影' />
                <CardContent>
                  <Typography variant='body2' color='text.secondary'>
                    elevation: 0 + カスタムboxShadow。
                    ホバーすると影が強調されます。border付き。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
                  {componentShadows[0].description}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  borderRadius: {componentShadows[0].borderRadius}px
                </Typography>
                <br />
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  boxShadow: {componentShadows[0].lightShadow}
                </Typography>
                <br />
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  hover: {componentShadows[0].hoverShadow}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Dialog */}
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
            Dialog
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              {/* Dialogの静的プレビュー（開かずに影だけ確認） */}
              <Box
                sx={{
                  p: 0,
                  borderRadius: '16px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor:
                    theme.palette.mode === 'light'
                      ? 'rgba(0, 0, 0, 0.08)'
                      : 'rgba(255, 255, 255, 0.08)',
                  boxShadow:
                    theme.palette.mode === 'light'
                      ? '0 20px 40px rgba(0, 0, 0, 0.12), 0 8px 16px rgba(0, 0, 0, 0.08)'
                      : '0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.3)',
                  overflow: 'hidden',
                }}>
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}>
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    ダイアログタイトル
                  </Typography>
                </Box>
                <Box sx={{ px: 3, py: 3 }}>
                  <Typography variant='body2' color='text.secondary'>
                    ダイアログのコンテンツ領域です。
                    最も深い影が適用され、背景コンテンツとの視覚的な分離を実現します。
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 3,
                    py: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1.5,
                  }}>
                  <Button variant='outlined' size='small'>
                    キャンセル
                  </Button>
                  <Button variant='contained' size='small'>
                    確認
                  </Button>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
                  {componentShadows[1].description}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  borderRadius: {componentShadows[1].borderRadius}px
                </Typography>
                <br />
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  boxShadow: {componentShadows[1].lightShadow}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Menu */}
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
            Menu
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              {/* Menuの静的プレビュー */}
              <Box
                sx={{
                  display: 'inline-block',
                  borderRadius: '6px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  overflow: 'hidden',
                  minWidth: 200,
                }}>
                {['編集', 'コピー', '削除'].map((label, index) => (
                  <Box
                    key={label}
                    sx={{
                      px: 2,
                      py: 1,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      borderBottom: index < 2 ? '1px solid' : 'none',
                      borderColor: 'divider',
                    }}>
                    <Typography variant='body2'>{label}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
                  {componentShadows[2].description}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  borderRadius: {componentShadows[2].borderRadius}px
                </Typography>
                <br />
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  boxShadow: {componentShadows[2].lightShadow}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Paper */}
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
            Paper
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                variant='outlined'
                sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  Paperコンポーネント（elevation: 0, variant:
                  outlined）。影なしのフラットな背景要素として使用されます。
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
                  {componentShadows[3].description}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  borderRadius: {componentShadows[3].borderRadius}px
                </Typography>
                <br />
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  boxShadow: {componentShadows[3].lightShadow}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Tooltip */}
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
            Tooltip
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <Tooltip title='補足情報をここに表示します' open arrow>
                  <Button variant='outlined'>ツールチップの例</Button>
                </Tooltip>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
                  {componentShadows[4].description}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  borderRadius: {componentShadows[4].borderRadius}px
                </Typography>
                <br />
                <Typography
                  variant='caption'
                  sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                  boxShadow: {componentShadows[4].lightShadow}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Box>
  )
}

export const ComponentElevation: StoryObj = {
  name: 'コンポーネント別 Elevation',
  render: () => <ComponentElevationContent />,
}

// --- 3. BorderRadius: 角丸値の視覚的比較 ---
const BorderRadiusContent = () => {
  // プロジェクトで使用している角丸値とその用途
  const radiusValues = [
    {
      value: 6,
      label: '6px',
      usage: 'Button, Menu, Tooltip, Chip',
    },
    {
      value: 8,
      label: '8px',
      usage: 'shape.borderRadius（テーマデフォルト）, IconButton, Skeleton',
    },
    {
      value: 10,
      label: '10px',
      usage: 'Alert',
    },
    {
      value: 12,
      label: '12px',
      usage: 'Card, Paper, TableContainer',
    },
    {
      value: 16,
      label: '16px',
      usage: 'Dialog',
    },
  ]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        角丸（Border Radius）
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        プロジェクトで使用しているborderRadius値の一覧。
        コンポーネントの用途に応じて5段階の角丸を使い分けています。
      </Typography>

      <Grid container spacing={4}>
        {radiusValues.map((item) => (
          <Grid key={item.value} size={{ xs: 12, sm: 6, md: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}>
              {/* 角丸プレビュー */}
              <Box
                sx={{
                  width: 160,
                  height: 120,
                  bgcolor: 'primary.main',
                  borderRadius: `${item.value}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Typography
                  variant='h5'
                  sx={{ color: 'common.white', fontWeight: 700 }}>
                  {item.label}
                </Typography>
              </Box>

              {/* 説明 */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant='body2'
                  sx={{ fontWeight: 600, fontFamily: 'monospace', mb: 0.5 }}>
                  borderRadius: {item.value}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  {item.usage}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* 比較バー */}
      <Box sx={{ mt: 8 }}>
        <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
          横並び比較
        </Typography>
        <Stack
          direction='row'
          spacing={3}
          sx={{
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: 3,
          }}>
          {radiusValues.map((item) => (
            <Box
              key={item.value}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
              }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: `${item.value}px`,
                }}
              />
              <Typography
                variant='caption'
                sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

export const BorderRadius: StoryObj = {
  name: '角丸（Border Radius）',
  render: () => <BorderRadiusContent />,
}

// --- 4. ShadowComparison: Light vs Dark での影の見え方比較 ---
const ShadowComparisonContent = () => {
  const theme = useTheme()
  const elevations = [0, 1, 2, 3, 4, 5, 6]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Light / Dark シャドウ比較
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        同じelevation値でも、背景色によって影の視認性が大きく変わります。
        ダークモードではborderやopacityの調整が重要です。
      </Typography>

      <Grid container spacing={4}>
        {/* Lightモード */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
            Light Mode
          </Typography>
          <Box
            sx={{
              p: 3,
              bgcolor: 'action.hover',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}>
            <Stack spacing={3}>
              {elevations.map((level) => (
                <Box
                  key={level}
                  sx={{
                    p: 3,
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    boxShadow: theme.shadows[level],
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    Elevation {level}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      fontFamily: 'monospace',
                      color: 'text.secondary',
                      maxWidth: '60%',
                      textAlign: 'right',
                      wordBreak: 'break-all',
                    }}>
                    {theme.shadows[level] === 'none'
                      ? 'none'
                      : theme.shadows[level]}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>

        {/* Darkモード */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
            Dark Mode
          </Typography>
          <ThemeProvider theme={darkTheme}>
            <Box
              sx={{
                p: 3,
                bgcolor: 'background.default',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}>
              <Stack spacing={3}>
                {elevations.map((level) => (
                  <Box
                    key={level}
                    sx={{
                      p: 3,
                      bgcolor: 'background.paper',
                      borderRadius: 2,
                      boxShadow: theme.shadows[level],
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Typography
                      variant='body2'
                      sx={{ fontWeight: 600 }}
                      color='text.primary'>
                      Elevation {level}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{
                        fontFamily: 'monospace',
                        maxWidth: '60%',
                        textAlign: 'right',
                        wordBreak: 'break-all',
                      }}>
                      {theme.shadows[level] === 'none'
                        ? 'none'
                        : theme.shadows[level]}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </ThemeProvider>
        </Grid>
      </Grid>

      {/* コンポーネント比較 */}
      <Box sx={{ mt: 8 }}>
        <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
          コンポーネントの見え方比較
        </Typography>
        <Grid container spacing={4}>
          {/* Light Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 4,
                bgcolor: 'action.hover',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}>
              <Typography
                variant='subtitle2'
                sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                Light
              </Typography>
              <Card>
                <CardHeader title='カードタイトル' subheader='サブタイトル' />
                <CardContent>
                  <Typography variant='body2' color='text.secondary'>
                    ライトモードのカードです。微かな影とボーダーで浮き上がりを表現します。
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          {/* Dark Card */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ThemeProvider theme={darkTheme}>
              <Box
                sx={{
                  p: 4,
                  bgcolor: 'background.default',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                <Typography
                  variant='subtitle2'
                  color='text.secondary'
                  sx={{ fontWeight: 600, mb: 2 }}>
                  Dark
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow:
                      '0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.12)',
                    overflow: 'hidden',
                  }}>
                  <Box
                    sx={{
                      px: 2.5,
                      py: 2,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}>
                    <Typography
                      variant='subtitle2'
                      color='text.primary'
                      sx={{ fontWeight: 600 }}>
                      カードタイトル
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      sx={{ mt: 0.25, display: 'block' }}>
                      サブタイトル
                    </Typography>
                  </Box>
                  <Box sx={{ px: 2.5, py: 2.5 }}>
                    <Typography variant='body2' color='text.secondary'>
                      ダークモードのカードです。ボーダーの視認性が重要になり、影は背景に溶け込みやすくなります。
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </ThemeProvider>
          </Grid>
        </Grid>
      </Box>

      {/* 設計指針 */}
      <Box sx={{ mt: 8 }}>
        <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
          設計指針
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              title: 'Lightモードの影',
              description:
                'rgba(0, 0, 0, 0.04)〜rgba(0, 0, 0, 0.25) の範囲で透明度を調整。微かな影で奥行きを表現し、UIの階層構造を伝えます。',
            },
            {
              title: 'Darkモードの影',
              description:
                '暗い背景では影が見えにくいため、borderの活用が重要です。rgba(255, 255, 255, 0.08) のボーダーで要素の境界を明確にします。',
            },
            {
              title: 'ホバー時の変化',
              description:
                'Cardなどのインタラクティブ要素はホバー時に影を強調。transition で滑らかなアニメーションを実現しています。',
            },
          ].map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                variant='outlined'
                sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {item.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}

export const ShadowComparison: StoryObj = {
  name: 'Light / Dark 比較',
  render: () => <ShadowComparisonContent />,
}
