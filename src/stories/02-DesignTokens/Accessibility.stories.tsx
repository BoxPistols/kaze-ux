import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * アクセシビリティ関連のデザイントークンとガイドライン。
 *
 * WCAG AA準拠のコントラスト比、タッチターゲットサイズ、
 * フォントサイズの最小値などを確認できる。
 */
const meta: Meta = {
  title: 'Design Tokens/Accessibility',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'WCAG 2.1基準に基づくカラーコントラスト比の検証と、アクセシビリティガイドラインの一覧を表示するストーリー。',
      },
    },
  },
}
export default meta

// ---------------------------------------------------------------------------
// 1. ContrastRatios - コントラスト比
// ---------------------------------------------------------------------------

/** コントラスト比の表示ペア定義 */
interface ContrastPair {
  /** 前景色の説明 */
  foregroundLabel: string
  /** 前景色のパレットパス */
  foregroundColor: string
  /** 背景色の説明 */
  backgroundLabel: string
  /** 背景色の値 */
  backgroundColor: string
  /** WCAG AA基準（通常テキスト4.5:1, 大テキスト3:1）を満たすか */
  passesAA: boolean
  /** 補足説明 */
  note: string
}

function ContrastRatiosShowcase() {
  const theme = useTheme()

  const contrastPairs: ContrastPair[] = [
    {
      foregroundLabel: 'text.primary',
      foregroundColor: theme.palette.text.primary,
      backgroundLabel: 'background.default',
      backgroundColor: theme.palette.background.default,
      passesAA: true,
      note: '通常テキスト (4.5:1以上)',
    },
    {
      foregroundLabel: 'text.secondary',
      foregroundColor: theme.palette.text.secondary,
      backgroundLabel: 'background.default',
      backgroundColor: theme.palette.background.default,
      passesAA: true,
      note: '補助テキスト (4.5:1以上)',
    },
    {
      foregroundLabel: 'text.primary',
      foregroundColor: theme.palette.text.primary,
      backgroundLabel: 'background.paper',
      backgroundColor: theme.palette.background.paper,
      passesAA: true,
      note: 'カード・ペーパー上のテキスト (4.5:1以上)',
    },
    {
      foregroundLabel: 'primary.main',
      foregroundColor: theme.palette.primary.main,
      backgroundLabel: 'common.white',
      backgroundColor: theme.palette.common.white,
      passesAA: true,
      note: 'プライマリカラーのリンク・ボタン (4.5:1以上)',
    },
    {
      foregroundLabel: 'primary.contrastText',
      foregroundColor: theme.palette.primary.contrastText,
      backgroundLabel: 'primary.main',
      backgroundColor: theme.palette.primary.main,
      passesAA: true,
      note: 'プライマリボタン上のテキスト (4.5:1以上)',
    },
    {
      foregroundLabel: 'error.main',
      foregroundColor: theme.palette.error.main,
      backgroundLabel: 'common.white',
      backgroundColor: theme.palette.common.white,
      passesAA: true,
      note: 'エラーメッセージ (4.5:1以上)',
    },
    {
      foregroundLabel: 'success.main',
      foregroundColor: theme.palette.success.main,
      backgroundLabel: 'common.white',
      backgroundColor: theme.palette.common.white,
      passesAA: true,
      note: '成功メッセージ (大テキスト3:1以上)',
    },
    {
      foregroundLabel: 'warning.main',
      foregroundColor: theme.palette.warning.main,
      backgroundLabel: 'common.white',
      backgroundColor: theme.palette.common.white,
      passesAA: false,
      note: '警告色 - アイコンや大テキストとの併用を推奨',
    },
    {
      foregroundLabel: 'text.disabled',
      foregroundColor: theme.palette.text.disabled,
      backgroundLabel: 'background.default',
      backgroundColor: theme.palette.background.default,
      passesAA: false,
      note: '無効状態 - 意図的に低コントラスト（操作不可を示す）',
    },
  ]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        コントラスト比ガイドライン
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
        WCAG 2.1 AA準拠: 通常テキスト
        4.5:1以上、大テキスト(18px以上または14px太字) 3:1以上
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 5 }}>
        テーマのカラートークンはWCAG AA基準を満たすよう設計されている。
        以下の組み合わせで視覚的に確認できる。
      </Typography>

      <Paper variant='outlined' sx={{ overflow: 'hidden', borderRadius: 2 }}>
        {/* テーブルヘッダー */}
        <Box
          sx={{
            py: 2,
            px: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bgcolor: 'action.hover',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}>
          <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 60 }}>
            判定
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 200 }}>
            前景色 / 背景色
          </Typography>
          <Typography
            variant='caption'
            sx={{ fontWeight: 600, flex: 1, minWidth: 240 }}>
            表示サンプル
          </Typography>
          <Typography
            variant='caption'
            sx={{ fontWeight: 600, minWidth: 280, textAlign: 'right' }}>
            備考
          </Typography>
        </Box>

        {contrastPairs.map((pair, index) => (
          <Box
            key={index}
            sx={{
              py: 2.5,
              px: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&:last-child': { borderBottom: 'none' },
            }}>
            {/* 判定アイコン */}
            <Box
              sx={{
                minWidth: 60,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
              {pair.passesAA ? (
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
              ) : (
                <WarningIcon sx={{ color: 'warning.main', fontSize: 20 }} />
              )}
              <Typography
                variant='caption'
                sx={{
                  fontWeight: 600,
                  color: pair.passesAA ? 'success.main' : 'warning.main',
                }}>
                {pair.passesAA ? 'AA' : '参考'}
              </Typography>
            </Box>

            {/* 前景色 / 背景色 ラベル */}
            <Box sx={{ minWidth: 200 }}>
              <Typography
                variant='body2'
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: 'primary.main',
                }}>
                {pair.foregroundLabel}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                on {pair.backgroundLabel}
              </Typography>
            </Box>

            {/* 表示サンプル */}
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <Box
                sx={{
                  bgcolor: pair.backgroundColor,
                  color: pair.foregroundColor,
                  px: 3,
                  py: 1.5,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                }}>
                <Typography sx={{ fontSize: '1rem', fontWeight: 600 }}>
                  サンプルテキスト Aa
                </Typography>
                <Typography sx={{ fontSize: '0.857rem' }}>
                  補足テキスト 12px sample text
                </Typography>
              </Box>
            </Box>

            {/* 備考 */}
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ minWidth: 280, textAlign: 'right' }}>
              {pair.note}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* 補足情報 */}
      <Paper
        variant='outlined'
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 2,
          bgcolor: 'action.hover',
        }}>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
          WCAG AA コントラスト比の基準
        </Typography>
        <Stack spacing={1}>
          <Typography variant='caption' color='text.secondary'>
            - 通常テキスト（18px未満）: 4.5:1 以上
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            - 大テキスト（18px以上、または14px太字以上）: 3:1 以上
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            - UIコンポーネント・グラフィカルオブジェクト: 3:1 以上
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            - 無効状態の要素はコントラスト基準の対象外（WCAG 1.4.3）
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

export const ContrastRatios: StoryObj = {
  name: 'コントラスト比',
  render: () => <ContrastRatiosShowcase />,
}

// ---------------------------------------------------------------------------
// 2. TouchTargets - タッチターゲットサイズ
// ---------------------------------------------------------------------------

/** タッチターゲットサイズの定義 */
interface TouchTargetSpec {
  /** サイズ名 */
  label: string
  /** ピクセルサイズ */
  size: number
  /** 使用場面 */
  usage: string
  /** 具体例 */
  examples: string
  /** カラー */
  color: 'warning' | 'primary' | 'error'
}

function TouchTargetsShowcase() {
  const touchTargetSpecs: TouchTargetSpec[] = [
    {
      label: '最小サイズ',
      size: 44,
      usage: 'WCAG 2.5.5 準拠の最小タッチターゲット',
      examples: 'サイドバーアイコン、補助的なアクションボタン',
      color: 'warning',
    },
    {
      label: '推奨サイズ',
      size: 48,
      usage: 'Material Design 推奨のタッチターゲット',
      examples: 'ナビゲーションアイコン、ツールバーボタン、一般的な操作',
      color: 'primary',
    },
    {
      label: 'クリティカル操作',
      size: 56,
      usage: '安全上重要な操作のタッチターゲット',
      examples: '緊急停止、離陸/着陸、ミッション中止などのドローン制御',
      color: 'error',
    },
  ]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        タッチターゲットサイズ
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
        タッチ操作における最小ヒットエリアの基準
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 5 }}>
        ドローン運航プラットフォームでは、屋外環境やグローブ着用時の操作を考慮し、
        安全上重要なコントロールには大きなタッチターゲットを採用する。
      </Typography>

      <Stack spacing={4}>
        {touchTargetSpecs.map((spec) => (
          <Paper
            key={spec.label}
            variant='outlined'
            sx={{ borderRadius: 2, overflow: 'hidden' }}>
            {/* ヘッダー */}
            <Box
              sx={{
                px: 4,
                py: 2,
                bgcolor: 'action.hover',
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant='body2' sx={{ fontWeight: 700 }}>
                  {spec.label}
                </Typography>
                <Typography
                  variant='caption'
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: `${spec.color}.main`,
                    bgcolor: `${spec.color}.lighter`,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                  }}>
                  {spec.size}px x {spec.size}px
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                {spec.usage}
              </Typography>
            </Box>

            {/* コンテンツ */}
            <Box sx={{ p: 4 }}>
              <Grid container spacing={4} sx={{ alignItems: 'center' }}>
                {/* IconButton サンプル */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mb: 2, display: 'block' }}>
                    IconButton
                  </Typography>
                  <Box sx={{ display: 'inline-flex', position: 'relative' }}>
                    {/* ヒットエリアの点線ボーダー */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: spec.size,
                        height: spec.size,
                        border: '2px dashed',
                        borderColor: `${spec.color}.main`,
                        borderRadius: 2,
                        opacity: 0.5,
                        pointerEvents: 'none',
                      }}
                    />
                    <IconButton
                      sx={{
                        width: spec.size,
                        height: spec.size,
                        color: `${spec.color}.main`,
                      }}
                      aria-label={`${spec.label}のIconButtonサンプル`}>
                      <CheckCircleIcon />
                    </IconButton>
                  </Box>
                </Grid>

                {/* Button サンプル */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mb: 2, display: 'block' }}>
                    Button
                  </Typography>
                  <Box sx={{ display: 'inline-flex', position: 'relative' }}>
                    {/* ヒットエリアの点線ボーダー */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        height: spec.size,
                        border: '2px dashed',
                        borderColor: `${spec.color}.main`,
                        borderRadius: 2,
                        opacity: 0.5,
                        pointerEvents: 'none',
                      }}
                    />
                    <Button
                      variant='contained'
                      color={spec.color}
                      sx={{
                        minHeight: spec.size,
                      }}>
                      アクション
                    </Button>
                  </Box>
                </Grid>

                {/* 使用場面 */}
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ mb: 1, display: 'block' }}>
                    使用例
                  </Typography>
                  <Typography variant='body2'>{spec.examples}</Typography>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* サイズ比較図 */}
      <Paper variant='outlined' sx={{ mt: 4, p: 4, borderRadius: 2 }}>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 3 }}>
          サイズ比較
        </Typography>
        <Stack direction='row' spacing={4} sx={{ alignItems: 'flex-end' }}>
          {touchTargetSpecs.map((spec) => (
            <Box key={spec.label} sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: spec.size,
                  height: spec.size,
                  border: '2px solid',
                  borderColor: `${spec.color}.main`,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: `${spec.color}.lighter`,
                  mb: 1,
                }}>
                <Typography
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: `${spec.color}.main`,
                  }}>
                  {spec.size}
                </Typography>
              </Box>
              <Typography variant='caption' color='text.secondary'>
                {spec.label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      {/* 注意事項 */}
      <Paper
        variant='outlined'
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 2,
          bgcolor: 'action.hover',
        }}>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
          ドローン運航における注意事項
        </Typography>
        <Stack spacing={1}>
          <Typography variant='caption' color='text.secondary'>
            -
            緊急停止・離着陸などの安全上重要な操作は56px以上のタッチターゲットを使用する
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            - 屋外での直射日光下やグローブ着用時の操作性を考慮する
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            - タッチターゲット間の間隔は最低8px以上確保し、誤操作を防止する
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            - WCAG 2.5.5 (Target Size Enhanced) では44x44 CSS px以上を推奨
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

export const TouchTargets: StoryObj = {
  name: 'タッチターゲット',
  render: () => <TouchTargetsShowcase />,
}

// ---------------------------------------------------------------------------
// 3. FontSizes - フォントサイズスケール
// ---------------------------------------------------------------------------

/** フォントバリアント定義 */
interface FontVariantEntry {
  /** バリアント名 */
  variant: string
  /** ピクセルサイズ */
  px: number
  /** rem値 */
  rem: string
  /** 用途の説明 */
  usage: string
  /** 特記事項（最小サイズ・基本サイズなど） */
  highlight?: 'minimum' | 'base'
}

function FontSizesShowcase() {
  // 基本フォントサイズ: 14px (1rem = 14px)
  const baseFontSize = 14

  const fontVariants: FontVariantEntry[] = [
    {
      variant: 'displayLarge',
      px: 32,
      rem: `${(32 / baseFontSize).toFixed(2)}rem`,
      usage: 'ヒーローセクション、ランディングページの見出し',
    },
    {
      variant: 'displayMedium',
      px: 28,
      rem: `${(28 / baseFontSize).toFixed(2)}rem`,
      usage: 'ページタイトル（大）',
    },
    {
      variant: 'displaySmall',
      px: 24,
      rem: `${(24 / baseFontSize).toFixed(2)}rem`,
      usage: 'ページタイトル（中）',
    },
    {
      variant: 'xxl',
      px: 22,
      rem: `${(22 / baseFontSize).toFixed(2)}rem`,
      usage: 'h1相当、セクション見出し（大）',
    },
    {
      variant: 'xl',
      px: 20,
      rem: `${(20 / baseFontSize).toFixed(2)}rem`,
      usage: 'h2相当、セクション見出し（中）',
    },
    {
      variant: 'lg',
      px: 18,
      rem: `${(18 / baseFontSize).toFixed(2)}rem`,
      usage: 'h3相当、カードタイトル、ダイアログタイトル',
    },
    {
      variant: 'ml',
      px: 16,
      rem: `${(16 / baseFontSize).toFixed(2)}rem`,
      usage: 'h4相当、サブセクション見出し',
    },
    {
      variant: 'md',
      px: 14,
      rem: '1rem',
      usage: 'body1相当、基本テキスト、ボタンラベル、入力フィールド',
      highlight: 'base',
    },
    {
      variant: 'sm',
      px: 12,
      rem: `${(12 / baseFontSize).toFixed(2)}rem`,
      usage: 'body2/caption相当、補助テキスト、テーブルセル、チップ',
      highlight: 'minimum',
    },
    {
      variant: 'xs',
      px: 10,
      rem: `${(10 / baseFontSize).toFixed(2)}rem`,
      usage: '特殊用途のみ（バッジ、極小ラベル）- 通常は使用しない',
    },
  ]

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' sx={{ fontWeight: 700, mb: 1 }}>
        フォントサイズスケール
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 1 }}>
        基本フォントサイズ: {baseFontSize}px (1rem = {baseFontSize}px)
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 5 }}>
        MUIの標準16pxベースではなく14pxベースを採用。 htmlFontSize と fontSize
        の両方を14pxに設定し、rem計算の一貫性を保っている。
      </Typography>

      <Paper variant='outlined' sx={{ overflow: 'hidden', borderRadius: 2 }}>
        {/* テーブルヘッダー */}
        <Box
          sx={{
            py: 2,
            px: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            bgcolor: 'action.hover',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}>
          <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 130 }}>
            バリアント
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 70 }}>
            サイズ
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600, minWidth: 80 }}>
            rem値
          </Typography>
          <Typography variant='caption' sx={{ fontWeight: 600, flex: 1 }}>
            サンプル
          </Typography>
          <Typography
            variant='caption'
            sx={{ fontWeight: 600, minWidth: 240, textAlign: 'right' }}>
            用途
          </Typography>
        </Box>

        {fontVariants.map((entry) => {
          const isHighlighted = entry.highlight != null
          return (
            <Box
              key={entry.variant}
              sx={{
                py: 2.5,
                px: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                bgcolor: isHighlighted ? 'action.hover' : 'transparent',
                '&:last-child': { borderBottom: 'none' },
              }}>
              {/* バリアント名 */}
              <Box
                sx={{
                  minWidth: 130,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                <Typography
                  variant='body2'
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: 'primary.main',
                  }}>
                  {entry.variant}
                </Typography>
                {entry.highlight === 'base' && (
                  <Typography
                    variant='caption'
                    sx={{
                      fontWeight: 700,
                      color: 'primary.main',
                      bgcolor: 'primary.lighter',
                      px: 1,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontSize: '0.65rem',
                    }}>
                    BASE
                  </Typography>
                )}
                {entry.highlight === 'minimum' && (
                  <Typography
                    variant='caption'
                    sx={{
                      fontWeight: 700,
                      color: 'warning.main',
                      bgcolor: 'warning.lighter',
                      px: 1,
                      py: 0.25,
                      borderRadius: 0.5,
                      fontSize: '0.65rem',
                    }}>
                    MIN
                  </Typography>
                )}
              </Box>

              {/* ピクセルサイズ */}
              <Typography
                variant='body2'
                sx={{
                  fontFamily: 'monospace',
                  minWidth: 70,
                  color: 'text.secondary',
                }}>
                {entry.px}px
              </Typography>

              {/* rem値 */}
              <Typography
                variant='body2'
                sx={{
                  fontFamily: 'monospace',
                  minWidth: 80,
                  color: 'text.secondary',
                }}>
                {entry.rem}
              </Typography>

              {/* サンプルテキスト */}
              <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <Typography
                  sx={{
                    fontSize: `${entry.px}px`,
                    fontWeight: entry.px >= 18 ? 700 : 400,
                    lineHeight: 1.4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                  アクセシビリティ Accessibility
                </Typography>
              </Box>

              {/* 用途 */}
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ minWidth: 240, textAlign: 'right' }}>
                {entry.usage}
              </Typography>
            </Box>
          )
        })}
      </Paper>

      {/* MUI標準バリアントとの対応表 */}
      <Paper variant='outlined' sx={{ mt: 4, p: 4, borderRadius: 2 }}>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 3 }}>
          MUI標準バリアントとの対応
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant='caption'
              sx={{ fontWeight: 600, mb: 2, display: 'block' }}>
              見出し系
            </Typography>
            <Stack spacing={1}>
              {[
                { mui: 'h1', custom: 'xxl', px: 22 },
                { mui: 'h2', custom: 'xl', px: 20 },
                { mui: 'h3', custom: 'lg', px: 18 },
                { mui: 'h4', custom: 'ml', px: 16 },
                { mui: 'h5', custom: 'md', px: 14 },
                { mui: 'h6', custom: 'sm', px: 12 },
              ].map((mapping) => (
                <Box
                  key={mapping.mui}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}>
                  <Typography
                    variant='caption'
                    sx={{
                      fontFamily: 'monospace',
                      minWidth: 40,
                      color: 'text.secondary',
                    }}>
                    {mapping.mui}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    =
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'primary.main',
                    }}>
                    {mapping.custom} ({mapping.px}px)
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant='caption'
              sx={{ fontWeight: 600, mb: 2, display: 'block' }}>
              本文系
            </Typography>
            <Stack spacing={1}>
              {[
                { mui: 'body1', custom: 'md', px: 14 },
                { mui: 'body2', custom: 'sm', px: 12 },
                { mui: 'caption', custom: 'sm', px: 12 },
                { mui: 'button', custom: 'md', px: 14 },
                { mui: 'overline', custom: 'sm', px: 12 },
              ].map((mapping) => (
                <Box
                  key={mapping.mui}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}>
                  <Typography
                    variant='caption'
                    sx={{
                      fontFamily: 'monospace',
                      minWidth: 80,
                      color: 'text.secondary',
                    }}>
                    {mapping.mui}
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    =
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'primary.main',
                    }}>
                    {mapping.custom} ({mapping.px}px)
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 補足情報 */}
      <Paper
        variant='outlined'
        sx={{
          mt: 4,
          p: 4,
          borderRadius: 2,
          bgcolor: 'action.hover',
        }}>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
          フォントサイズの原則
        </Typography>
        <Stack spacing={1}>
          <Typography variant='caption' color='text.secondary'>
            -
            基本フォントサイズは14px。業務アプリケーションにおける情報密度と可読性のバランスを考慮
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            - 最小フォントサイズは12px (sm)。これを下回るとWCAG準拠が困難になる
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            - xs (10px)
            は特殊用途（バッジカウンターなど）に限定し、通常のUIテキストには使用しない
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            - フォントファミリー: Inter, Noto Sans JP, Helvetica, Arial,
            sans-serif
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}

export const FontSizes: StoryObj = {
  name: 'フォントサイズ',
  render: () => <FontSizesShowcase />,
}
