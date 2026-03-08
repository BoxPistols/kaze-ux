import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Switch,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material'

import { darkTheme, theme as lightTheme } from '@/themes/theme'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * ライト/ダークモード比較。
 *
 * 両テーマのトークン値とコンポーネント表示を並べて確認できる。
 * テーマ切替の影響範囲を視覚的に確認するためのリファレンス。
 */
const meta: Meta = {
  title: 'Design Tokens/Dark Mode',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'ライトモードとダークモードのデザイントークン比較。各カラートークンの両テーマでの値を並列表示する。',
      },
    },
  },
}
export default meta

type Story = StoryObj

// ---------------------------------------------------------------------------
// 共通型定義
// ---------------------------------------------------------------------------

/** カラートークンの定義 */
interface ColorTokenEntry {
  /** トークンパス（例: background.default） */
  label: string
  /** パレットから値を取得するアクセサ */
  getValue: (palette: Record<string, unknown>) => string
}

// ---------------------------------------------------------------------------
// ユーティリティ
// ---------------------------------------------------------------------------

/** ネストされたパレットオブジェクトから値を安全に取得する */
function resolvePaletteValue(
  palette: Record<string, unknown>,
  path: string
): string {
  const keys = path.split('.')
  let current: unknown = palette
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return ''
    current = (current as Record<string, unknown>)[key]
  }
  return typeof current === 'string' ? current : String(current ?? '')
}

// ---------------------------------------------------------------------------
// トークン定義
// ---------------------------------------------------------------------------

/** ColorTokens ストーリーで表示するトークン一覧 */
const COLOR_TOKEN_ENTRIES: ColorTokenEntry[] = [
  {
    label: 'background.default',
    getValue: (p) => resolvePaletteValue(p, 'background.default'),
  },
  {
    label: 'background.paper',
    getValue: (p) => resolvePaletteValue(p, 'background.paper'),
  },
  {
    label: 'text.primary',
    getValue: (p) => resolvePaletteValue(p, 'text.primary'),
  },
  {
    label: 'text.secondary',
    getValue: (p) => resolvePaletteValue(p, 'text.secondary'),
  },
  {
    label: 'text.disabled',
    getValue: (p) => resolvePaletteValue(p, 'text.disabled'),
  },
  { label: 'divider', getValue: (p) => resolvePaletteValue(p, 'divider') },
  {
    label: 'action.hover',
    getValue: (p) => resolvePaletteValue(p, 'action.hover'),
  },
  {
    label: 'action.selected',
    getValue: (p) => resolvePaletteValue(p, 'action.selected'),
  },
  {
    label: 'primary.main',
    getValue: (p) => resolvePaletteValue(p, 'primary.main'),
  },
  {
    label: 'secondary.main',
    getValue: (p) => resolvePaletteValue(p, 'secondary.main'),
  },
  {
    label: 'success.main',
    getValue: (p) => resolvePaletteValue(p, 'success.main'),
  },
  {
    label: 'error.main',
    getValue: (p) => resolvePaletteValue(p, 'error.main'),
  },
  {
    label: 'warning.main',
    getValue: (p) => resolvePaletteValue(p, 'warning.main'),
  },
  { label: 'info.main', getValue: (p) => resolvePaletteValue(p, 'info.main') },
]

// ---------------------------------------------------------------------------
// 1. ColorTokens - カラートークン比較
// ---------------------------------------------------------------------------

/** 片側のカラートークンパネル */
function TokenPanel({
  label,
  tokens,
  palette,
}: {
  label: string
  tokens: ColorTokenEntry[]
  palette: Record<string, unknown>
}) {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: '1.1rem',
          fontWeight: 700,
          mb: 3,
        }}>
        {label}
      </Typography>
      <Stack spacing={1.5}>
        {tokens.map((token) => {
          const value = token.getValue(palette)
          return (
            <Box
              key={token.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}>
              {/* カラースウォッチ */}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: value,
                  border: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0,
                }}
              />
              {/* トークン名と値 */}
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    lineHeight: 1.3,
                  }}>
                  {token.label}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    color: 'text.secondary',
                    lineHeight: 1.3,
                  }}>
                  {value}
                </Typography>
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Box>
  )
}

/** ColorTokens ストーリーの描画コンポーネント */
function ColorTokensContent() {
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 1 }}>
          カラートークン比較
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
          ライトテーマとダークテーマの主要カラートークンを並列で比較します。
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* ライトテーマ側 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ThemeProvider theme={lightTheme}>
            <Box
              sx={{
                bgcolor: 'background.default',
                color: 'text.primary',
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}>
              <TokenPanel
                label='Light Mode'
                tokens={COLOR_TOKEN_ENTRIES}
                palette={
                  lightTheme.palette as unknown as Record<string, unknown>
                }
              />
            </Box>
          </ThemeProvider>
        </Grid>

        {/* ダークテーマ側 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ThemeProvider theme={darkTheme}>
            <Box
              sx={{
                bgcolor: 'background.default',
                color: 'text.primary',
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}>
              <TokenPanel
                label='Dark Mode'
                tokens={COLOR_TOKEN_ENTRIES}
                palette={
                  darkTheme.palette as unknown as Record<string, unknown>
                }
              />
            </Box>
          </ThemeProvider>
        </Grid>
      </Grid>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// 2. ComponentComparison - コンポーネント表示比較
// ---------------------------------------------------------------------------

/** 両テーマで表示する共通コンポーネントセット */
function ComponentShowcase() {
  return (
    <Stack spacing={3}>
      {/* ボタン */}
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1.5 }}>
          Button
        </Typography>
        <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button variant='contained'>Contained</Button>
          <Button variant='outlined'>Outlined</Button>
        </Stack>
      </Box>

      {/* チップ */}
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1.5 }}>
          Chip
        </Typography>
        <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Chip label='Filled' color='primary' />
          <Chip label='Outlined' variant='outlined' />
        </Stack>
      </Box>

      {/* アラート */}
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1.5 }}>
          Alert
        </Typography>
        <Stack spacing={1}>
          <Alert severity='success'>Success</Alert>
          <Alert severity='error'>Error</Alert>
          <Alert severity='warning'>Warning</Alert>
          <Alert severity='info'>Info</Alert>
        </Stack>
      </Box>

      {/* テキストフィールド */}
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1.5 }}>
          TextField
        </Typography>
        <TextField
          label='入力ラベル'
          placeholder='テキストを入力'
          size='small'
          fullWidth
        />
      </Box>

      {/* カード */}
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1.5 }}>
          Card
        </Typography>
        <Card>
          <CardContent>
            <Typography variant='body2'>
              カードコンテンツのサンプルテキスト
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* スイッチ */}
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1.5 }}>
          Switch
        </Typography>
        <Stack direction='row' spacing={2} sx={{ alignItems: 'center' }}>
          <Switch defaultChecked />
          <Switch />
        </Stack>
      </Box>

      {/* プログレスバー */}
      <Box>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, mb: 1.5 }}>
          LinearProgress
        </Typography>
        <LinearProgress variant='determinate' value={65} />
      </Box>
    </Stack>
  )
}

/** ComponentComparison ストーリーの描画コンポーネント */
function ComponentComparisonContent() {
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 1 }}>
          コンポーネント表示比較
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
          同一のMUIコンポーネントをライト/ダーク両テーマで描画し、見た目の差異を確認します。
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* ライトテーマ側 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ThemeProvider theme={lightTheme}>
            <Box
              sx={{
                bgcolor: 'background.default',
                color: 'text.primary',
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 3 }}>
                Light Mode
              </Typography>
              <ComponentShowcase />
            </Box>
          </ThemeProvider>
        </Grid>

        {/* ダークテーマ側 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ThemeProvider theme={darkTheme}>
            <Box
              sx={{
                bgcolor: 'background.default',
                color: 'text.primary',
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}>
              <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 3 }}>
                Dark Mode
              </Typography>
              <ComponentShowcase />
            </Box>
          </ThemeProvider>
        </Grid>
      </Grid>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// 3. SurfaceLayers - サーフェス/エレベーション比較
// ---------------------------------------------------------------------------

/** エレベーション段階の一覧 */
const ELEVATION_LEVELS = [0, 1, 2, 3, 4] as const

/** サーフェスレイヤーパネル */
function SurfacePanel({ label }: { label: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, mb: 3 }}>
        {label}
      </Typography>
      <Stack spacing={2}>
        {ELEVATION_LEVELS.map((level) => (
          <Paper
            key={level}
            elevation={level}
            sx={{
              p: 3,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 600 }}>
              elevation={level}
            </Typography>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                color: 'text.secondary',
              }}>
              Paper
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

/** SurfaceLayers ストーリーの描画コンポーネント */
function SurfaceLayersContent() {
  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 5 }}>
        <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, mb: 1 }}>
          サーフェスレイヤー比較
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>
          Paper コンポーネントの elevation 0〜4 を両テーマで表示し、
          サーフェスの階層表現の違いを確認します。
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* ライトテーマ側 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ThemeProvider theme={lightTheme}>
            <Box
              sx={{
                bgcolor: 'background.default',
                color: 'text.primary',
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}>
              <SurfacePanel label='Light Mode' />
            </Box>
          </ThemeProvider>
        </Grid>

        {/* ダークテーマ側 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ThemeProvider theme={darkTheme}>
            <Box
              sx={{
                bgcolor: 'background.default',
                color: 'text.primary',
                p: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}>
              <SurfacePanel label='Dark Mode' />
            </Box>
          </ThemeProvider>
        </Grid>
      </Grid>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// ストーリーエクスポート
// ---------------------------------------------------------------------------

/** ライト/ダーク両テーマの主要カラートークンを並列比較 */
export const ColorTokens: Story = {
  name: 'カラートークン比較',
  render: () => <ColorTokensContent />,
}

/** 同一MUIコンポーネントを両テーマで描画し、外観の差異を確認 */
export const ComponentComparison: Story = {
  name: 'コンポーネント表示比較',
  render: () => <ComponentComparisonContent />,
}

/** Paper の elevation 段階を両テーマで表示し、サーフェス階層の違いを確認 */
export const SurfaceLayers: Story = {
  name: 'サーフェスレイヤー比較',
  render: () => <SurfaceLayersContent />,
}
