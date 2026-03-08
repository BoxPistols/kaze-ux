import {
  Box,
  Chip,
  Divider,
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

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Guide/CSS Reference',
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
// プロパティ一覧テーブル
// ---------------------------------------------------------------------------
const PropertyTable = ({
  rows,
}: {
  rows: { property: string; values: string; description: string }[]
}) => (
  <TableContainer component={Paper} variant='outlined'>
    <Table size='small'>
      <TableHead>
        <TableRow>
          <TableCell sx={{ minWidth: 160 }}>プロパティ</TableCell>
          <TableCell sx={{ minWidth: 200 }}>主な値</TableCell>
          <TableCell>説明</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.property}>
            <TableCell>
              <Typography
                variant='body2'
                sx={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 600 }}>
                {r.property}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                variant='body2'
                sx={{ fontFamily: 'monospace', fontSize: 11 }}>
                {r.values}
              </Typography>
            </TableCell>
            <TableCell>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ fontSize: 12 }}>
                {r.description}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

// ---------------------------------------------------------------------------
// ビジュアルデモ
// ---------------------------------------------------------------------------

const BorderRadiusDemo = () => (
  <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
    {[
      { r: '0', label: '0' },
      { r: '4px', label: '4px' },
      { r: '8px', label: '8px' },
      { r: '12px', label: '12px' },
      { r: '16px', label: '16px' },
      { r: '50%', label: '50%' },
      { r: '9999px', label: '9999px' },
    ].map((b) => (
      <Box key={b.label} sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            bgcolor: 'primary.main',
            borderRadius: b.r,
            mx: 'auto',
            mb: 0.5,
          }}
        />
        <Typography
          variant='caption'
          sx={{ fontFamily: 'monospace', fontSize: 10 }}>
          {b.label}
        </Typography>
      </Box>
    ))}
  </Stack>
)

const ShadowDemo = () => {
  const theme = useTheme()
  return (
    <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
      {[
        { shadow: 'none', label: 'none' },
        { shadow: '0 1px 2px rgba(0,0,0,0.05)', label: 'sm' },
        {
          shadow: '0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
          label: 'default',
        },
        { shadow: '0 4px 6px rgba(0,0,0,0.1)', label: 'md' },
        { shadow: '0 10px 15px rgba(0,0,0,0.1)', label: 'lg' },
        { shadow: '0 20px 25px rgba(0,0,0,0.1)', label: 'xl' },
      ].map((s) => (
        <Box key={s.label} sx={{ textAlign: 'center' }}>
          <Paper
            elevation={0}
            sx={{
              width: 64,
              height: 48,
              boxShadow: s.shadow,
              borderRadius: 1,
              mx: 'auto',
              mb: 0.5,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : '#fff',
              border: s.shadow === 'none' ? '1px dashed' : 'none',
              borderColor: 'divider',
            }}
          />
          <Typography
            variant='caption'
            sx={{ fontFamily: 'monospace', fontSize: 10 }}>
            {s.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

const TransitionDemo = () => {
  return (
    <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
      {[
        { easing: 'linear', label: 'linear' },
        { easing: 'ease', label: 'ease' },
        { easing: 'ease-in', label: 'ease-in' },
        { easing: 'ease-out', label: 'ease-out' },
        { easing: 'ease-in-out', label: 'ease-in-out' },
        { easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)', label: 'bounce' },
      ].map((t) => (
        <Box key={t.label} sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              borderRadius: 1,
              mx: 'auto',
              mb: 0.5,
              transition: `transform 0.4s ${t.easing}`,
              '&:hover': { transform: 'scale(1.3)' },
              cursor: 'pointer',
            }}
          />
          <Typography
            variant='caption'
            sx={{ fontFamily: 'monospace', fontSize: 10 }}>
            {t.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

const OpacityDemo = () => (
  <Stack direction='row' spacing={1.5} flexWrap='wrap' useFlexGap>
    {[0, 0.1, 0.25, 0.5, 0.75, 0.9, 1].map((o) => (
      <Box key={o} sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            width: 48,
            height: 36,
            bgcolor: 'primary.main',
            borderRadius: 0.5,
            opacity: o,
            mx: 'auto',
            mb: 0.5,
          }}
        />
        <Typography
          variant='caption'
          sx={{ fontFamily: 'monospace', fontSize: 10 }}>
          {o}
        </Typography>
      </Box>
    ))}
  </Stack>
)

// ---------------------------------------------------------------------------
// メインコンテンツ
// ---------------------------------------------------------------------------

const CssReferenceContent = () => {
  const theme = useTheme()

  return (
    <Box sx={{ maxWidth: 1060, mx: 'auto' }}>
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
              ? 'linear-gradient(135deg, rgba(103,58,183,0.08) 0%, rgba(0,150,136,0.08) 100%)'
              : 'linear-gradient(135deg, rgba(103,58,183,0.04) 0%, rgba(0,150,136,0.04) 100%)',
        }}>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1 }}>
          CSS プロパティ リファレンス
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          主要な CSS プロパティを網羅的に整理。ビジュアルデモ付き。
        </Typography>
      </Paper>

      {/* ========== レイアウト ========== */}
      <SectionHeader title='1. レイアウト (Layout)' />
      <PropertyTable
        rows={[
          {
            property: 'display',
            values:
              'block | inline | flex | grid | inline-flex | none | contents',
            description: '表示形式。flex/grid が主要',
          },
          {
            property: 'position',
            values: 'static | relative | absolute | fixed | sticky',
            description: '配置方法',
          },
          {
            property: 'top / right / bottom / left',
            values: '0 | 50% | auto | 10px',
            description: 'position要素のオフセット',
          },
          {
            property: 'z-index',
            values: '0 | 10 | 50 | 1000 | auto',
            description: '重なり順。管理ルール必須',
          },
          {
            property: 'float',
            values: 'left | right | none',
            description: '回り込み。現在は非推奨（flex/grid推奨）',
          },
          {
            property: 'overflow',
            values: 'visible | hidden | scroll | auto',
            description: 'はみ出し制御',
          },
          {
            property: 'overflow-x / overflow-y',
            values: 'visible | hidden | scroll | auto',
            description: '軸別のはみ出し制御',
          },
          {
            property: 'visibility',
            values: 'visible | hidden | collapse',
            description: '非表示にするがレイアウト空間は残る',
          },
        ]}
      />

      <Divider sx={{ my: 5 }} />

      {/* ========== Flexbox ========== */}
      <SectionHeader title='2. Flexbox' />
      <PropertyTable
        rows={[
          {
            property: 'flex-direction',
            values: 'row | row-reverse | column | column-reverse',
            description: '主軸の方向',
          },
          {
            property: 'flex-wrap',
            values: 'nowrap | wrap | wrap-reverse',
            description: '折り返し制御',
          },
          {
            property: 'justify-content',
            values:
              'flex-start | center | flex-end | space-between | space-around | space-evenly',
            description: '主軸方向の配置',
          },
          {
            property: 'align-items',
            values: 'stretch | flex-start | center | flex-end | baseline',
            description: '交差軸方向の配置',
          },
          {
            property: 'align-self',
            values: 'auto | stretch | flex-start | center | flex-end',
            description: '個別の交差軸配置',
          },
          {
            property: 'gap',
            values: '8px | 1rem | 8px 16px',
            description: '子要素間の間隔',
          },
          {
            property: 'flex',
            values: '1 | 0 1 auto | none',
            description: 'grow shrink basis の短縮形',
          },
          {
            property: 'flex-grow',
            values: '0 | 1 | 2',
            description: '余白の分配比率',
          },
          {
            property: 'flex-shrink',
            values: '0 | 1',
            description: '縮小比率。0で縮小防止',
          },
          {
            property: 'flex-basis',
            values: 'auto | 0 | 200px | 50%',
            description: '初期サイズ',
          },
          {
            property: 'order',
            values: '0 | -1 | 1 | 2',
            description: '表示順序の変更',
          },
        ]}
      />

      <Divider sx={{ my: 5 }} />

      {/* ========== Grid ========== */}
      <SectionHeader title='3. Grid' />
      <PropertyTable
        rows={[
          {
            property: 'grid-template-columns',
            values: '1fr 1fr | repeat(3, 1fr) | 200px 1fr | auto-fill',
            description: '列の定義',
          },
          {
            property: 'grid-template-rows',
            values: 'auto | 1fr 2fr | minmax(100px, auto)',
            description: '行の定義',
          },
          {
            property: 'grid-column',
            values: 'span 2 | 1 / 3 | 1 / -1',
            description: '列の占有範囲',
          },
          {
            property: 'grid-row',
            values: 'span 2 | 1 / 3',
            description: '行の占有範囲',
          },
          {
            property: 'grid-auto-flow',
            values: 'row | column | dense',
            description: '自動配置の方向',
          },
          {
            property: 'place-items',
            values: 'center | start end',
            description: 'align-items + justify-items 短縮形',
          },
          {
            property: 'place-content',
            values: 'center | space-between',
            description: 'align-content + justify-content 短縮形',
          },
        ]}
      />

      <Divider sx={{ my: 5 }} />

      {/* ========== サイズ ========== */}
      <SectionHeader title='4. サイズ (Sizing)' />
      <PropertyTable
        rows={[
          {
            property: 'width / height',
            values: '100px | 50% | 100vw | auto | fit-content',
            description: '幅と高さ',
          },
          {
            property: 'min-width / min-height',
            values: '0 | 300px | 100vh',
            description: '最小サイズ',
          },
          {
            property: 'max-width / max-height',
            values: 'none | 1200px | 100%',
            description: '最大サイズ',
          },
          {
            property: 'aspect-ratio',
            values: '16 / 9 | 1 / 1 | auto',
            description: 'アスペクト比を維持',
          },
          {
            property: 'object-fit',
            values: 'contain | cover | fill | none | scale-down',
            description: '置換要素(img等)のフィット方法',
          },
          {
            property: 'object-position',
            values: 'center | top | 50% 50%',
            description: '置換要素の位置',
          },
        ]}
      />

      <Divider sx={{ my: 5 }} />

      {/* ========== スペーシング ========== */}
      <SectionHeader title='5. スペーシング (Spacing)' />
      <PropertyTable
        rows={[
          {
            property: 'margin',
            values: '0 | 8px | auto | 8px 16px',
            description: '外側の余白。auto で中央配置',
          },
          {
            property: 'padding',
            values: '0 | 8px | 8px 16px 8px 16px',
            description: '内側の余白',
          },
          {
            property: 'margin-inline / padding-inline',
            values: 'auto | 16px',
            description: '論理方向（横書き: 左右）の余白',
          },
          {
            property: 'margin-block / padding-block',
            values: '8px | 16px',
            description: '論理方向（横書き: 上下）の余白',
          },
          {
            property: 'box-sizing',
            values: 'content-box | border-box',
            description: 'サイズ計算方法。border-box推奨',
          },
        ]}
      />

      <Divider sx={{ my: 5 }} />

      {/* ========== タイポグラフィ ========== */}
      <SectionHeader title='6. タイポグラフィ (Typography)' />
      <PropertyTable
        rows={[
          {
            property: 'font-family',
            values: "'Inter', sans-serif",
            description: 'フォントファミリー',
          },
          {
            property: 'font-size',
            values: '14px | 1rem | clamp(14px, 2vw, 18px)',
            description: 'フォントサイズ',
          },
          {
            property: 'font-weight',
            values: '400 | 500 | 600 | 700 | normal | bold',
            description: 'フォントウェイト',
          },
          {
            property: 'line-height',
            values: '1.5 | 1.6 | 24px | normal',
            description: '行間',
          },
          {
            property: 'letter-spacing',
            values: '0 | 0.5px | -0.025em | 0.1em',
            description: '文字間隔',
          },
          {
            property: 'text-align',
            values: 'left | center | right | justify',
            description: 'テキスト揃え',
          },
          {
            property: 'text-decoration',
            values: 'none | underline | line-through',
            description: 'テキスト装飾',
          },
          {
            property: 'text-transform',
            values: 'none | uppercase | lowercase | capitalize',
            description: '大文字小文字変換',
          },
          {
            property: 'text-overflow',
            values: 'clip | ellipsis',
            description: 'はみ出しテキストの処理',
          },
          {
            property: 'white-space',
            values: 'normal | nowrap | pre | pre-wrap | pre-line',
            description: '空白・改行の処理',
          },
          {
            property: 'word-break',
            values: 'normal | break-all | keep-all',
            description: '単語の折り返し（CJKに重要）',
          },
          {
            property: 'overflow-wrap',
            values: 'normal | break-word | anywhere',
            description: '長い単語の折り返し',
          },
        ]}
      />

      <Divider sx={{ my: 5 }} />

      {/* ========== 色・背景 ========== */}
      <SectionHeader title='7. 色と背景 (Color & Background)' />
      <PropertyTable
        rows={[
          {
            property: 'color',
            values: '#333 | rgb() | hsl() | oklch() | var(--)',
            description: 'テキスト色',
          },
          {
            property: 'background-color',
            values: '#fff | rgba(0,0,0,0.5) | transparent',
            description: '背景色',
          },
          {
            property: 'background',
            values: 'linear-gradient() | url() | radial-gradient()',
            description: '背景の短縮形',
          },
          {
            property: 'background-size',
            values: 'cover | contain | 100% auto',
            description: '背景画像のサイズ',
          },
          {
            property: 'background-position',
            values: 'center | top right | 50% 50%',
            description: '背景画像の位置',
          },
          {
            property: 'background-repeat',
            values: 'repeat | no-repeat | repeat-x',
            description: '背景画像の繰り返し',
          },
          {
            property: 'background-clip',
            values: 'border-box | padding-box | text',
            description: '背景の描画範囲',
          },
          {
            property: 'opacity',
            values: '0 | 0.5 | 1',
            description: '要素全体の透過度',
          },
        ]}
      />

      <Box sx={{ mt: 2, mb: 5 }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          opacity ビジュアル
        </Typography>
        <Paper variant='outlined' sx={{ px: 2.5, py: 2, borderRadius: 2 }}>
          <OpacityDemo />
        </Paper>
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* ========== ボーダー ========== */}
      <SectionHeader title='8. ボーダーと角丸 (Border)' />
      <PropertyTable
        rows={[
          {
            property: 'border',
            values: '1px solid #e0e0e0 | 2px dashed',
            description: 'ボーダーの短縮形',
          },
          {
            property: 'border-width',
            values: '0 | 1px | 2px',
            description: 'ボーダー幅',
          },
          {
            property: 'border-style',
            values: 'solid | dashed | dotted | none',
            description: 'ボーダースタイル',
          },
          {
            property: 'border-color',
            values: '#e0e0e0 | rgba(0,0,0,0.12)',
            description: 'ボーダー色',
          },
          {
            property: 'border-radius',
            values: '0 | 4px | 8px | 12px | 50% | 9999px',
            description: '角丸。50%で円',
          },
          {
            property: 'outline',
            values: '2px solid blue | none',
            description: 'フォーカスリング等',
          },
          {
            property: 'outline-offset',
            values: '0 | 2px | -1px',
            description: 'アウトラインのオフセット',
          },
        ]}
      />

      <Box sx={{ mt: 2, mb: 5 }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          border-radius ビジュアル
        </Typography>
        <Paper variant='outlined' sx={{ px: 2.5, py: 2, borderRadius: 2 }}>
          <BorderRadiusDemo />
        </Paper>
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* ========== 影 ========== */}
      <SectionHeader title='9. 影 (Shadow)' />
      <PropertyTable
        rows={[
          {
            property: 'box-shadow',
            values: '0 1px 3px rgba(0,0,0,0.1) | inset 0 2px 4px ...',
            description: 'ボックスの影',
          },
          {
            property: 'text-shadow',
            values: '0 1px 2px rgba(0,0,0,0.1)',
            description: 'テキストの影',
          },
          {
            property: 'filter: drop-shadow()',
            values: 'drop-shadow(0 4px 3px rgba(0,0,0,0.07))',
            description: 'PNG等透過画像の影',
          },
        ]}
      />

      <Box sx={{ mt: 2, mb: 5 }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          box-shadow ビジュアル
        </Typography>
        <Paper variant='outlined' sx={{ px: 2.5, py: 2, borderRadius: 2 }}>
          <ShadowDemo />
        </Paper>
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* ========== トランジション・アニメーション ========== */}
      <SectionHeader title='10. トランジション / アニメーション' />
      <PropertyTable
        rows={[
          {
            property: 'transition',
            values: 'all 0.3s ease | color 0.2s, transform 0.3s',
            description: 'プロパティ変化の補間',
          },
          {
            property: 'transition-property',
            values: 'all | color | transform | opacity',
            description: '対象プロパティ',
          },
          {
            property: 'transition-duration',
            values: '0.15s | 0.3s | 300ms',
            description: '持続時間（150-300msが最適）',
          },
          {
            property: 'transition-timing-function',
            values: 'ease | ease-in-out | cubic-bezier()',
            description: 'イージング関数',
          },
          {
            property: 'animation',
            values: 'name 0.3s ease infinite',
            description: 'キーフレームアニメーション',
          },
          {
            property: '@keyframes',
            values: 'from { } to { } | 0% { } 50% { } 100% { }',
            description: 'アニメーション定義',
          },
          {
            property: 'animation-fill-mode',
            values: 'none | forwards | backwards | both',
            description: '終了後の状態',
          },
          {
            property: 'will-change',
            values: 'transform | opacity | auto',
            description: 'GPU最適化ヒント（乱用禁止）',
          },
        ]}
      />

      <Box sx={{ mt: 2, mb: 5 }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          timing-function ビジュアル（ホバーで拡大）
        </Typography>
        <Paper variant='outlined' sx={{ px: 2.5, py: 2, borderRadius: 2 }}>
          <TransitionDemo />
        </Paper>
      </Box>

      <Divider sx={{ my: 5 }} />

      {/* ========== Transform ========== */}
      <SectionHeader title='11. Transform' />
      <PropertyTable
        rows={[
          {
            property: 'transform',
            values: 'translate() | scale() | rotate() | skew()',
            description: '要素の変形（レイアウトに影響しない）',
          },
          {
            property: 'translate',
            values: '10px 20px | 50% | 0 -100%',
            description: '移動（個別プロパティ）',
          },
          {
            property: 'scale',
            values: '1.1 | 0.5 | 1.5 2',
            description: '拡大縮小',
          },
          {
            property: 'rotate',
            values: '45deg | 0.25turn | -90deg',
            description: '回転',
          },
          {
            property: 'transform-origin',
            values: 'center | top left | 50% 50%',
            description: '変形の基準点',
          },
        ]}
      />

      <Divider sx={{ my: 5 }} />

      {/* ========== その他 ========== */}
      <SectionHeader title='12. その他' />
      <PropertyTable
        rows={[
          {
            property: 'cursor',
            values: 'pointer | default | grab | not-allowed | text',
            description: 'マウスカーソル形状',
          },
          {
            property: 'user-select',
            values: 'none | text | all | auto',
            description: 'テキスト選択の可否',
          },
          {
            property: 'pointer-events',
            values: 'auto | none',
            description: 'クリック・ホバーの有効/無効',
          },
          {
            property: 'scroll-behavior',
            values: 'auto | smooth',
            description: 'スクロールの挙動',
          },
          {
            property: 'scroll-snap-type',
            values: 'x mandatory | y proximity',
            description: 'スクロールスナップ',
          },
          {
            property: 'resize',
            values: 'none | both | horizontal | vertical',
            description: 'リサイズ可能にする',
          },
          {
            property: 'appearance',
            values: 'none | auto',
            description: 'ネイティブUIの外観をリセット',
          },
          {
            property: 'accent-color',
            values: 'auto | #0e0d6a | var(--color-primary)',
            description: 'チェックボックス等のアクセントカラー',
          },
          {
            property: 'container-type',
            values: 'inline-size | size | normal',
            description: 'コンテナクエリの対象',
          },
          {
            property: 'content-visibility',
            values: 'auto | visible | hidden',
            description: 'レンダリング最適化',
          },
          {
            property: 'isolation',
            values: 'auto | isolate',
            description: 'Stacking Context を明示的に作成',
          },
          {
            property: 'mix-blend-mode',
            values: 'normal | multiply | screen | overlay',
            description: '要素のブレンドモード',
          },
          {
            property: 'backdrop-filter',
            values: 'blur(8px) | brightness(0.8)',
            description: '背面のぼかし・フィルター',
          },
          {
            property: 'clip-path',
            values: 'circle(50%) | polygon() | inset()',
            description: '要素のクリッピング',
          },
        ]}
      />

      <Divider sx={{ my: 5 }} />

      {/* 単位 */}
      <SectionHeader
        title='CSS 単位リファレンス'
        subtitle='用途に応じた単位の選択'
      />
      <TableContainer component={Paper} variant='outlined'>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>単位</TableCell>
              <TableCell>種別</TableCell>
              <TableCell>説明</TableCell>
              <TableCell>推奨用途</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[
              {
                unit: 'px',
                type: '絶対',
                desc: 'ピクセル',
                usage: 'ボーダー、アイコンサイズ',
              },
              {
                unit: 'rem',
                type: '相対',
                desc: 'ルート要素のfont-size基準',
                usage: 'フォントサイズ、スペーシング',
              },
              {
                unit: 'em',
                type: '相対',
                desc: '親要素のfont-size基準',
                usage: 'コンポーネント内の相対サイズ',
              },
              {
                unit: '%',
                type: '相対',
                desc: '親要素のサイズ基準',
                usage: 'レスポンシブ幅、位置',
              },
              {
                unit: 'vw / vh',
                type: '相対',
                desc: 'ビューポート幅/高さの1%',
                usage: 'フルスクリーンレイアウト',
              },
              {
                unit: 'dvh / svh / lvh',
                type: '相対',
                desc: '動的/小/大ビューポート高さ',
                usage: 'モバイルアドレスバー対応',
              },
              {
                unit: 'ch',
                type: '相対',
                desc: '"0"の幅基準',
                usage: '行の長さ制限（max-width: 75ch）',
              },
              {
                unit: 'fr',
                type: 'Grid専用',
                desc: '余剰スペースの比率',
                usage: 'Grid列/行の分配',
              },
              {
                unit: 'clamp()',
                type: '関数',
                desc: 'min, preferred, maxの3値',
                usage: 'レスポンシブフォントサイズ',
              },
            ].map((u) => (
              <TableRow key={u.unit}>
                <TableCell>
                  <Chip
                    label={u.unit}
                    size='small'
                    variant='outlined'
                    sx={{ fontFamily: 'monospace', fontSize: 11 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant='body2' sx={{ fontSize: 12 }}>
                    {u.type}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body2' sx={{ fontSize: 12 }}>
                    {u.desc}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ fontSize: 12 }}>
                    {u.usage}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <CssReferenceContent />,
}
