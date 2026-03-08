import {
  Box,
  Grid,
  Paper,
  Snackbar,
  ThemeProvider,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useCallback, useState } from 'react'

import { colorData } from '@/themes/colorToken'
import type { ColorSet, GreyShades, ThemeColors } from '@/themes/colorToken'
import { darkTheme, lightTheme } from '@/themes/theme'

import type { Meta, StoryObj } from '@storybook/react-vite'

// ---------------------------------------------------------------------------
// ユーティリティ関数
// ---------------------------------------------------------------------------

/** HEX文字列をRGB値に変換 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const cleaned = hex.replace('#', '')
  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16)
    const g = parseInt(cleaned[1] + cleaned[1], 16)
    const b = parseInt(cleaned[2] + cleaned[2], 16)
    return { r, g, b }
  }
  if (cleaned.length === 6) {
    const r = parseInt(cleaned.slice(0, 2), 16)
    const g = parseInt(cleaned.slice(2, 4), 16)
    const b = parseInt(cleaned.slice(4, 6), 16)
    return { r, g, b }
  }
  return null
}

/** 相対輝度を計算 (WCAG 2.1) */
const getRelativeLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

/** 2色間のコントラスト比を計算 */
const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  if (!rgb1 || !rgb2) return 0
  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** WCAG準拠レベルを判定 */
const getWcagLevel = (ratio: number): 'AAA' | 'AA' | 'Fail' => {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'Fail'
}

/** WCAGレベルに応じたテーマカラーキーを返す */
const getWcagColor = (level: 'AAA' | 'AA' | 'Fail'): string => {
  switch (level) {
    case 'AAA':
      return 'success.main'
    case 'AA':
      return 'warning.main'
    case 'Fail':
      return 'error.main'
  }
}

/** rgba文字列からHEX近似値を取得（表示用） */
const resolveColor = (color: string): string => {
  if (color.startsWith('#')) return color
  // rgba/rgb値の場合はそのまま返す
  return color
}

/** 色が有効なHEXかどうか判定 */
const isHex = (color: string): boolean =>
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(color)

// ---------------------------------------------------------------------------
// 共通コンポーネント
// ---------------------------------------------------------------------------

/** コピー通知用のSnackbar状態管理フック */
const useCopyNotification = () => {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')

  const notify = useCallback((text: string) => {
    void navigator.clipboard.writeText(text)
    setMessage(`${text} をコピーしました`)
    setOpen(true)
  }, [])

  const close = useCallback(() => setOpen(false), [])

  return { open, message, notify, close }
}

/** カラーチップカード */
const ColorChip = ({
  name,
  color,
  onCopy,
}: {
  name: string
  color: string
  onCopy: (text: string) => void
}) => {
  const theme = useTheme()
  const resolved = resolveColor(color)
  const hex = isHex(resolved)
  const contrastWhite = hex ? getContrastRatio(resolved, '#ffffff') : 0
  const contrastBlack = hex ? getContrastRatio(resolved, '#000000') : 0
  const wcagWhite = getWcagLevel(contrastWhite)
  const wcagBlack = getWcagLevel(contrastBlack)

  // テキスト色を背景色に応じて自動決定
  const textColor = hex
    ? contrastBlack > contrastWhite
      ? '#000000'
      : '#ffffff'
    : theme.palette.text.primary

  return (
    <Paper
      elevation={0}
      onClick={() => onCopy(resolved)}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transform: 'translateY(-1px)',
        },
      }}>
      {/* カラー表示領域 */}
      <Box
        sx={{
          height: 80,
          backgroundColor: color,
          display: 'flex',
          alignItems: 'flex-end',
          p: 2,
        }}>
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: textColor,
            opacity: 0.9,
          }}>
          {name}
        </Typography>
      </Box>
      {/* 情報領域 */}
      <Box sx={{ p: 2 }}>
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 1,
          }}>
          {resolved}
        </Typography>
        {hex && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: `1px solid ${theme.palette.divider}`,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  color: theme.palette.text.secondary,
                }}>
                {contrastWhite.toFixed(1)}:1
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: getWcagColor(wcagWhite),
                }}>
                {wcagWhite}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: '#000000',
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  color: theme.palette.text.secondary,
                }}>
                {contrastBlack.toFixed(1)}:1
              </Typography>
              <Typography
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: getWcagColor(wcagBlack),
                }}>
                {wcagBlack}
              </Typography>
            </Box>
          </Box>
        )}
        {!hex && (
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.65rem',
              color: theme.palette.text.disabled,
            }}>
            rgba (コントラスト比算出不可)
          </Typography>
        )}
      </Box>
    </Paper>
  )
}

/** セクションヘッダー */
const SectionHeader = ({
  title,
  description,
}: {
  title: string
  description?: string
}) => {
  const theme = useTheme()
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: theme.palette.text.primary,
          mb: description ? 1 : 0,
        }}>
        {title}
      </Typography>
      {description && (
        <Typography
          sx={{
            fontSize: '0.85rem',
            color: theme.palette.text.secondary,
          }}>
          {description}
        </Typography>
      )}
    </Box>
  )
}

/** セマンティックカラーのグラデーション行 */
const SemanticColorRow = ({
  name,
  colorSet,
  onCopy,
}: {
  name: string
  colorSet: ColorSet
  onCopy: (text: string) => void
}) => {
  const variants: { key: keyof ColorSet; label: string }[] = [
    { key: 'dark', label: 'dark' },
    { key: 'main', label: 'main' },
    { key: 'light', label: 'light' },
    { key: 'lighter', label: 'lighter' },
    { key: 'contrastText', label: 'contrastText' },
  ]
  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        sx={{
          fontSize: '0.95rem',
          fontWeight: 700,
          textTransform: 'capitalize',
          mb: 2,
        }}>
        {name}
      </Typography>
      <Grid container spacing={3}>
        {variants.map(({ key, label }) => {
          const value = colorSet[key]
          if (!value) return null
          return (
            <Grid key={label} size={{ xs: 6, sm: 4, md: 2.4 }}>
              <ColorChip
                name={`${name}.${label}`}
                color={value}
                onCopy={onCopy}
              />
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}

/** キー/バリュー形式のカラーセクション */
const ColorSection = ({
  title,
  description,
  colors,
  onCopy,
}: {
  title: string
  description?: string
  colors: Record<string, string>
  onCopy: (text: string) => void
}) => (
  <Box sx={{ mb: 6 }}>
    <SectionHeader title={title} description={description} />
    <Grid container spacing={3}>
      {Object.entries(colors).map(([key, value]) => (
        <Grid key={key} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
          <ColorChip name={key} color={value} onCopy={onCopy} />
        </Grid>
      ))}
    </Grid>
  </Box>
)

// ---------------------------------------------------------------------------
// セマンティックカラー名の定義
// ---------------------------------------------------------------------------

const SEMANTIC_NAMES = [
  'primary',
  'secondary',
  'success',
  'info',
  'warning',
  'error',
] as const

type SemanticName = (typeof SEMANTIC_NAMES)[number]

/** colorDataからセマンティックカラーを取得 */
const getSemanticColors = (
  source: ThemeColors
): Record<SemanticName, ColorSet> => {
  const result = {} as Record<SemanticName, ColorSet>
  for (const name of SEMANTIC_NAMES) {
    result[name] = source[name]
  }
  return result
}

/** colorDataからグレースケールを取得 */
const getGreyColors = (source: ThemeColors): GreyShades => source.grey

/** colorDataからテキストカラーを取得 */
const getTextColors = (source: ThemeColors): Record<string, string> => {
  const entries: Record<string, string> = {}
  for (const [key, value] of Object.entries(source.text)) {
    entries[`text.${key}`] = value
  }
  return entries
}

/** colorDataから背景カラーを取得 */
const getBackgroundColors = (source: ThemeColors): Record<string, string> => {
  const entries: Record<string, string> = {}
  for (const [key, value] of Object.entries(source.background)) {
    entries[`background.${key}`] = value
  }
  return entries
}

/** colorDataからアクションカラーを取得 */
const getActionColors = (source: ThemeColors): Record<string, string> => {
  const entries: Record<string, string> = {}
  for (const [key, value] of Object.entries(source.action)) {
    entries[`action.${key}`] = value
  }
  return entries
}

/** colorDataからサーフェスカラーを取得 */
const getSurfaceColors = (source: ThemeColors): Record<string, string> => {
  const entries: Record<string, string> = {}
  for (const [key, value] of Object.entries(source.surface)) {
    entries[`surface.${key}`] = value
  }
  return entries
}

/** colorDataからアイコンカラーを取得 */
const getIconColors = (source: ThemeColors): Record<string, string> => {
  const entries: Record<string, string> = {}
  for (const [key, value] of Object.entries(source.icon)) {
    entries[`icon.${key}`] = value
  }
  return entries
}

/** グレースケールを Record<string, string> に変換 */
const greyToRecord = (grey: GreyShades): Record<string, string> => {
  const entries: Record<string, string> = {}
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900]
  for (const shade of shades) {
    entries[`grey.${shade}`] = grey[shade]
  }
  return entries
}

// ---------------------------------------------------------------------------
// ストーリーコンポーネント
// ---------------------------------------------------------------------------

/** 1. Default: フルカラーパレット */
const FullColorPalette = () => {
  const theme = useTheme()
  const { open, message, notify, close } = useCopyNotification()

  // テーマモードに応じてデータソースを切り替え
  const source = theme.palette.mode === 'dark' ? colorData.dark : colorData
  const semanticColors = getSemanticColors(source)
  const greyColors = greyToRecord(getGreyColors(source))
  const textColors = getTextColors(source)
  const backgroundColors = getBackgroundColors(source)
  const actionColors = getActionColors(source)
  const surfaceColors = getSurfaceColors(source)
  const iconColors = getIconColors(source)

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1,
          }}>
          カラーパレット
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9rem',
            color: theme.palette.text.secondary,
            mb: 1,
          }}>
          KDDI Smart Drone Platform のデザイントークンカラー一覧。
          カラーチップをクリックすると値をコピーできます。
        </Typography>
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: theme.palette.text.disabled,
          }}>
          データソース: colorToken.ts + useTheme()
        </Typography>
      </Box>

      {/* セマンティックカラー */}
      <SectionHeader
        title='セマンティックカラー'
        description='primary / secondary / success / info / warning / error の5段階グラデーション'
      />
      {SEMANTIC_NAMES.map((name) => (
        <SemanticColorRow
          key={name}
          name={name}
          colorSet={semanticColors[name]}
          onCopy={notify}
        />
      ))}

      {/* グレースケール */}
      <ColorSection
        title='グレースケール'
        description='grey.50 - grey.900 の全階調'
        colors={greyColors}
        onCopy={notify}
      />

      {/* テキストカラー */}
      <ColorSection
        title='テキストカラー'
        description='テキスト用のカラートークン'
        colors={textColors}
        onCopy={notify}
      />

      {/* 背景カラー */}
      <ColorSection
        title='背景カラー'
        description='背景用のカラートークン'
        colors={backgroundColors}
        onCopy={notify}
      />

      {/* アクションカラー */}
      <ColorSection
        title='アクションカラー'
        description='インタラクション状態のカラートークン'
        colors={actionColors}
        onCopy={notify}
      />

      {/* サーフェスカラー */}
      <ColorSection
        title='サーフェスカラー'
        description='サーフェス（表面）のカラートークン'
        colors={surfaceColors}
        onCopy={notify}
      />

      {/* アイコンカラー */}
      <ColorSection
        title='アイコンカラー'
        description='アイコン用のカラートークン'
        colors={iconColors}
        onCopy={notify}
      />

      {/* Divider / Common */}
      <ColorSection
        title='その他'
        description='divider / common カラー'
        colors={{
          divider: source.divider,
          'common.black': source.common.black,
          'common.white': source.common.white,
        }}
        onCopy={notify}
      />

      <Snackbar
        open={open}
        autoHideDuration={1500}
        onClose={close}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

/** 2. SemanticColors: セマンティックカラー6色のみフォーカス */
const SemanticColorsView = () => {
  const theme = useTheme()
  const { open, message, notify, close } = useCopyNotification()
  const source = theme.palette.mode === 'dark' ? colorData.dark : colorData
  const semanticColors = getSemanticColors(source)

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1,
          }}>
          セマンティックカラー
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9rem',
            color: theme.palette.text.secondary,
          }}>
          意味を持つ6つのカラーグループ。各グループは dark / main / light /
          lighter / contrastText の5段階で構成されます。
        </Typography>
      </Box>

      {SEMANTIC_NAMES.map((name) => (
        <SemanticColorRow
          key={name}
          name={name}
          colorSet={semanticColors[name]}
          onCopy={notify}
        />
      ))}

      <Snackbar
        open={open}
        autoHideDuration={1500}
        onClose={close}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

/** 3. GreyScale: グレースケール全階調 */
const GreyScaleView = () => {
  const theme = useTheme()
  const { open, message, notify, close } = useCopyNotification()
  const source = theme.palette.mode === 'dark' ? colorData.dark : colorData
  const greyColors = getGreyColors(source)
  const shades = [50, 100, 200, 300, 400, 500, 600, 700, 800, 850, 900] as const

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1,
          }}>
          グレースケール
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9rem',
            color: theme.palette.text.secondary,
          }}>
          grey.50 から grey.900
          までの全11階調。UI要素の境界線、無効状態、背景などに使用します。
        </Typography>
      </Box>

      {/* グラデーションプレビュー */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          overflow: 'hidden',
          mb: 5,
        }}>
        <Box sx={{ display: 'flex', height: 48 }}>
          {shades.map((shade) => (
            <Box
              key={shade}
              sx={{
                flex: 1,
                backgroundColor: greyColors[shade],
              }}
            />
          ))}
        </Box>
      </Paper>

      {/* 個別チップ */}
      <Grid container spacing={3}>
        {shades.map((shade) => (
          <Grid key={shade} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <ColorChip
              name={`grey.${shade}`}
              color={greyColors[shade]}
              onCopy={notify}
            />
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={1500}
        onClose={close}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

/** 4. TextAndBackground: テキスト/背景/サーフェスカラー */
const TextAndBackgroundView = () => {
  const theme = useTheme()
  const { open, message, notify, close } = useCopyNotification()

  const source = theme.palette.mode === 'dark' ? colorData.dark : colorData
  const textColors = getTextColors(source)
  const backgroundColors = getBackgroundColors(source)
  const surfaceColors = getSurfaceColors(source)
  const actionColors = getActionColors(source)
  const iconColors = getIconColors(source)

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1,
          }}>
          テキスト / 背景 / サーフェス
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9rem',
            color: theme.palette.text.secondary,
          }}>
          テキスト、背景、サーフェス、アクション、アイコンのカラートークン。
        </Typography>
      </Box>

      <ColorSection
        title='テキストカラー'
        description='テキスト表示に使用するカラー'
        colors={textColors}
        onCopy={notify}
      />

      <ColorSection
        title='背景カラー'
        description='ページおよびカード背景に使用するカラー'
        colors={backgroundColors}
        onCopy={notify}
      />

      <ColorSection
        title='サーフェスカラー'
        description='表面レイヤーに使用するカラー'
        colors={surfaceColors}
        onCopy={notify}
      />

      <ColorSection
        title='アクションカラー'
        description='hover / selected / disabled / active 状態のカラー'
        colors={actionColors}
        onCopy={notify}
      />

      <ColorSection
        title='アイコンカラー'
        description='アイコン表示に使用するカラー'
        colors={iconColors}
        onCopy={notify}
      />

      <ColorSection
        title='その他'
        description='divider / common'
        colors={{
          divider: source.divider,
          'common.black': source.common.black,
          'common.white': source.common.white,
        }}
        onCopy={notify}
      />

      <Snackbar
        open={open}
        autoHideDuration={1500}
        onClose={close}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

/** 5. LightDarkComparison: Light vs Dark 並列比較 */
const LightDarkComparisonView = () => {
  const { open, message, notify, close } = useCopyNotification()

  // ライト/ダーク両方のデータソース
  const lightColors = colorData
  const darkColors = colorData.dark

  /** 片側のパネル */
  const ThemePanel = ({
    label,
    source,
    mode,
  }: {
    label: string
    source: ThemeColors
    mode: 'light' | 'dark'
  }) => {
    const targetTheme = mode === 'light' ? lightTheme : darkTheme
    return (
      <ThemeProvider theme={targetTheme}>
        <Paper
          elevation={0}
          sx={{
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 2,
            backgroundColor: (t) => t.palette.background.default,
            p: 4,
          }}>
          <Typography
            sx={{
              fontSize: '1.1rem',
              fontWeight: 700,
              color: (t) => t.palette.text.primary,
              mb: 4,
            }}>
            {label}
          </Typography>

          {/* セマンティックカラー */}
          {SEMANTIC_NAMES.map((name) => {
            const colorSet = source[name]
            const variants: { key: keyof ColorSet; label: string }[] = [
              { key: 'dark', label: 'dark' },
              { key: 'main', label: 'main' },
              { key: 'light', label: 'light' },
              { key: 'lighter', label: 'lighter' },
            ]
            return (
              <Box key={name} sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    color: (t) => t.palette.text.primary,
                    mb: 1,
                  }}>
                  {name}
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    borderRadius: 1,
                    overflow: 'hidden',
                  }}>
                  {variants.map(({ key }) => {
                    const value = colorSet[key]
                    if (!value) return null
                    return (
                      <Box
                        key={key}
                        onClick={() => notify(value)}
                        sx={{
                          flex: 1,
                          height: 36,
                          backgroundColor: value,
                          cursor: 'pointer',
                          '&:hover': { opacity: 0.85 },
                        }}
                      />
                    )
                  })}
                </Box>
              </Box>
            )
          })}

          {/* テキスト / 背景 */}
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: (t) => t.palette.text.primary,
              mt: 4,
              mb: 1,
            }}>
            テキスト / 背景
          </Typography>
          <Grid container spacing={2}>
            {Object.entries({
              ...getTextColors(source),
              ...getBackgroundColors(source),
            }).map(([key, value]) => (
              <Grid key={key} size={{ xs: 6 }}>
                <Box
                  onClick={() => notify(value)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: (t) => t.palette.action.hover,
                    },
                  }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      backgroundColor: value,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: (t) => t.palette.text.primary,
                      }}>
                      {key}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.65rem',
                        color: (t) => t.palette.text.secondary,
                      }}>
                      {resolveColor(value)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>

          {/* サーフェス / アイコン */}
          <Typography
            sx={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: (t) => t.palette.text.primary,
              mt: 3,
              mb: 1,
            }}>
            サーフェス / アイコン
          </Typography>
          <Grid container spacing={2}>
            {Object.entries({
              ...getSurfaceColors(source),
              ...getIconColors(source),
            }).map(([key, value]) => (
              <Grid key={key} size={{ xs: 6 }}>
                <Box
                  onClick={() => notify(value)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                    p: 1,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: (t) => t.palette.action.hover,
                    },
                  }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1,
                      backgroundColor: value,
                      border: (t) => `1px solid ${t.palette.divider}`,
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: (t) => t.palette.text.primary,
                      }}>
                      {key}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.65rem',
                        color: (t) => t.palette.text.secondary,
                      }}>
                      {resolveColor(value)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </ThemeProvider>
    )
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Box sx={{ mb: 6 }}>
        <Typography
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            mb: 1,
          }}>
          Light / Dark 比較
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9rem',
            color: 'text.secondary',
          }}>
          ライトモードとダークモードのカラートークンを並列比較します。
          カラーバーをクリックすると値をコピーできます。
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ThemePanel label='Light Mode' source={lightColors} mode='light' />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ThemePanel label='Dark Mode' source={darkColors} mode='dark' />
        </Grid>
      </Grid>

      <Snackbar
        open={open}
        autoHideDuration={1500}
        onClose={close}
        message={message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Storybookメタデータ
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Design Tokens/Color Palette',
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj

/** フルカラーパレット（セマンティック + グレースケール + テキスト + 背景 + アクション等） */
export const Default: Story = {
  render: () => <FullColorPalette />,
}

/** セマンティックカラー6色（primary / secondary / success / info / warning / error） */
export const SemanticColors: Story = {
  render: () => <SemanticColorsView />,
}

/** グレースケール全11階調 */
export const GreyScale: Story = {
  render: () => <GreyScaleView />,
}

/** テキスト / 背景 / サーフェス / アクション / アイコンカラー */
export const TextAndBackground: Story = {
  render: () => <TextAndBackgroundView />,
}

/** ライトモードとダークモードの並列比較 */
export const LightDarkComparison: Story = {
  render: () => <LightDarkComparisonView />,
}
