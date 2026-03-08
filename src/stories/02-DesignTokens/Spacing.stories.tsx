import { Box, Typography, Stack, Paper, Grid, Chip } from '@mui/material'
import { useTheme } from '@mui/material/styles'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Design Tokens/Spacing',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'スペーシングトークンの一覧。MUIテーマのspacing値とTailwind CSSのgap/padding/marginユーティリティとの対応を表示する。',
      },
    },
  },
}

export default meta

// --- ストーリー1: スペーシングスケール ---

const SpacingScaleShowcase = () => {
  const theme = useTheme()

  // テーマのspacing関数: spacing(1) = 4px
  const baseUnit = Number.parseFloat(theme.spacing(1))

  const spacingValues = [
    { multiplier: 0, usage: 'なし' },
    { multiplier: 0.5, usage: '最小マージン (2px)' },
    { multiplier: 1, usage: '基本単位 (4px)' },
    { multiplier: 1.5, usage: '微小余白 (6px)' },
    { multiplier: 2, usage: 'インライン要素間 (8px)' },
    { multiplier: 3, usage: 'コンパクト余白 (12px)' },
    { multiplier: 4, usage: '標準余白 (16px)' },
    { multiplier: 5, usage: 'セクション内余白 (20px)' },
    { multiplier: 6, usage: 'カード内パディング (24px)' },
    { multiplier: 8, usage: 'セクション間 (32px)' },
    { multiplier: 10, usage: '大セクション間 (40px)' },
    { multiplier: 12, usage: 'ページセクション (48px)' },
    { multiplier: 16, usage: '大エリア間 (64px)' },
    { multiplier: 20, usage: 'ページ余白 (80px)' },
    { multiplier: 24, usage: '最大余白 (96px)' },
  ]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        スペーシングスケール
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
        基本単位: spacing(1) = {baseUnit}px
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 5 }}>
        MUIの sx prop では spacing 値を直接使用: p={'{2}'} = {baseUnit * 2}px,
        gap={'{4}'} = {baseUnit * 4}px
      </Typography>

      <Paper variant='outlined' sx={{ overflow: 'hidden', borderRadius: 2 }}>
        {/* ヘッダー */}
        <Box
          sx={{
            py: 2,
            px: 4,
            display: 'flex',
            gap: 3,
            bgcolor: 'action.hover',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}>
          <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 100 }}>
            トークン
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 80 }}>
            ピクセル値
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600, flex: 1 }}>
            ビジュアル
          </Typography>
          <Typography
            variant='caption'
            sx={{ fontWeight: 600, minWidth: 180, textAlign: 'right' }}>
            使用場面
          </Typography>
        </Box>

        {spacingValues.map(({ multiplier, usage }) => {
          const px = baseUnit * multiplier
          return (
            <Box
              key={multiplier}
              sx={{
                py: 2,
                px: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}>
              <Typography
                variant='body2'
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  minWidth: 100,
                  color: 'primary.main',
                }}>
                spacing({multiplier})
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  fontFamily: 'monospace',
                  minWidth: 80,
                  color: 'text.secondary',
                }}>
                {px}px
              </Typography>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                {px > 0 && (
                  <Box
                    sx={{
                      width: Math.min(px, 400),
                      height: 12,
                      bgcolor: 'primary.main',
                      borderRadius: 0.5,
                      opacity: 0.7,
                      transition: 'width 0.2s ease',
                    }}
                  />
                )}
              </Box>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ minWidth: 180, textAlign: 'right' }}>
                {usage}
              </Typography>
            </Box>
          )
        })}
      </Paper>
    </Box>
  )
}

export const Default: StoryObj = {
  name: 'スペーシングスケール',
  render: () => <SpacingScaleShowcase />,
}

// --- ストーリー2: パディングとマージンの使用例 ---

const SpacingUsageShowcase = () => {
  const theme = useTheme()

  // 共通スタイル: 内側のボックス
  const innerBoxSx = {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    borderRadius: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: 600,
    minHeight: 32,
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        スペーシングの使用例
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        パディング、マージン、ギャップの適用パターン
      </Typography>

      <Grid container spacing={4}>
        {/* パディング比較 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
            Padding
          </Typography>
          <Stack spacing={2}>
            {[1, 2, 3, 4, 6].map((p) => (
              <Paper
                key={p}
                variant='outlined'
                sx={{
                  p,
                  borderRadius: 2,
                  position: 'relative',
                }}>
                <Box sx={innerBoxSx}>
                  <Typography variant='caption' sx={{ color: 'inherit' }}>
                    p={'{'}
                    {p}
                    {'}'} = {Number.parseFloat(theme.spacing(p))}px
                  </Typography>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Grid>

        {/* ギャップ比較 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
            Gap (Stack spacing)
          </Typography>
          <Stack spacing={3}>
            {[1, 2, 3, 4].map((gap) => (
              <Paper
                key={gap}
                variant='outlined'
                sx={{ p: 3, borderRadius: 2 }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mb: 1, display: 'block' }}>
                  spacing={'{'}
                  {gap}
                  {'}'} = {Number.parseFloat(theme.spacing(gap))}px
                </Typography>
                <Stack spacing={gap} direction='row'>
                  {[1, 2, 3].map((i) => (
                    <Box
                      key={i}
                      sx={{
                        ...innerBoxSx,
                        width: 48,
                        height: 48,
                      }}>
                      {i}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

export const Usage: StoryObj = {
  name: 'パディングとギャップ',
  render: () => <SpacingUsageShowcase />,
}

// --- ストーリー3: レイアウトパターン ---

const LayoutPatternsShowcase = () => {
  // ダミーコンテンツ
  const Placeholder = ({
    label,
    height = 48,
  }: {
    label: string
    height?: number
  }) => (
    <Box
      sx={{
        bgcolor: 'primary.lighter',
        borderRadius: 1,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Typography variant='caption' sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  )

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        レイアウトスペーシングパターン
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        コンポーネント間の推奨スペーシング
      </Typography>

      <Grid container spacing={4}>
        {/* カードレイアウト */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
            カード内レイアウト
          </Typography>
          <Paper
            variant='outlined'
            sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* ヘッダー: p={4} */}
            <Box
              sx={{
                px: 5,
                py: 4,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}>
              <Stack
                direction='row'
                justifyContent='space-between'
                alignItems='center'>
                <Box>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    カードヘッダー
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    px: 5 (20px), py: 4 (16px)
                  </Typography>
                </Box>
                <Chip label='設定' size='small' variant='outlined' />
              </Stack>
            </Box>
            {/* コンテンツ: p={5} */}
            <Box sx={{ p: 5 }}>
              <Stack spacing={3}>
                <Placeholder label='コンテンツ行 1' />
                <Placeholder label='コンテンツ行 2' />
                <Placeholder label='コンテンツ行 3' />
              </Stack>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ mt: 2, display: 'block' }}>
                p: 5 (20px), 内部 spacing: 3 (12px)
              </Typography>
            </Box>
            {/* フッター: px={5}, py={3} */}
            <Box
              sx={{
                px: 5,
                py: 3,
                borderTop: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
              }}>
              <Chip label='キャンセル' size='small' variant='outlined' />
              <Chip label='保存' size='small' color='primary' />
            </Box>
          </Paper>
        </Grid>

        {/* フォームレイアウト */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
            フォームレイアウト
          </Typography>
          <Paper variant='outlined' sx={{ p: 5, borderRadius: 2 }}>
            <Stack spacing={4}>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  ラベル
                </Typography>
                <Placeholder label='入力フィールド' height={40} />
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mt: 0.5, display: 'block' }}>
                  ラベルとフィールド間: mb: 1 (4px)
                </Typography>
              </Box>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  ラベル
                </Typography>
                <Placeholder label='入力フィールド' height={40} />
              </Box>
              <Box>
                <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
                  ラベル
                </Typography>
                <Placeholder label='テキストエリア' height={80} />
              </Box>
            </Stack>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mt: 3, display: 'block' }}>
              フィールド間: spacing: 4 (16px)
            </Typography>
          </Paper>
        </Grid>

        {/* セクション間隔 */}
        <Grid size={{ xs: 12 }}>
          <Typography variant='h5' sx={{ fontWeight: 600, mb: 2 }}>
            セクション間隔の推奨値
          </Typography>
          <Paper variant='outlined' sx={{ p: 4, borderRadius: 2 }}>
            <Stack spacing={0}>
              {[
                {
                  spacing: 2,
                  label: 'インライン要素間',
                  example: 'ボタン同士、アイコンとテキスト',
                },
                {
                  spacing: 3,
                  label: 'コンパクトリスト',
                  example: 'テーブル行、メニュー項目',
                },
                {
                  spacing: 4,
                  label: 'フォームフィールド間',
                  example: '入力フィールド、チェックボックス',
                },
                {
                  spacing: 6,
                  label: 'セクション内グループ間',
                  example: 'カード内のコンテンツブロック',
                },
                {
                  spacing: 8,
                  label: 'セクション間',
                  example: 'ページ内の主要セクション',
                },
                {
                  spacing: 12,
                  label: 'ページセクション間',
                  example: 'ヘッダーとコンテンツ、フッター前',
                },
              ].map(({ spacing, label, example }) => (
                <Box
                  key={spacing}
                  sx={{
                    py: 2,
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}>
                  <Chip
                    label={`${spacing}`}
                    size='small'
                    color='primary'
                    sx={{ minWidth: 40 }}
                  />
                  <Typography
                    variant='body2'
                    sx={{ fontWeight: 600, minWidth: 180 }}>
                    {label}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {example}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export const LayoutPatterns: StoryObj = {
  name: 'レイアウトパターン',
  render: () => <LayoutPatternsShowcase />,
}
