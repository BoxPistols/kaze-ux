import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
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

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Guide/For Designers',
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

const ForDesignersContent = () => {
  const theme = useTheme()

  const checkSections = [
    {
      section: 'Design Tokens > Color Palette',
      purpose: '使用可能なカラー一覧',
    },
    {
      section: 'Design Tokens > Typography',
      purpose: 'フォントサイズ・ウェイトの定義',
    },
    { section: 'Design Tokens > Spacing', purpose: '余白の基準値' },
    {
      section: 'Components > UI',
      purpose: 'ボタン、カード、ダイアログなど',
    },
    {
      section: 'Components > Form',
      purpose: 'フォーム入力コンポーネント',
    },
    { section: 'Patterns', purpose: '実践的なレイアウトパターン' },
  ]

  const colorCategories = [
    {
      name: 'primary',
      description: 'メインカラー（青系）',
      usage: '主要なアクション、ブランド表現',
    },
    {
      name: 'secondary',
      description: 'セカンダリカラー',
      usage: '補助的なアクション',
    },
    {
      name: 'error',
      description: 'エラー（赤系）',
      usage: 'エラー状態、破壊的操作',
    },
    {
      name: 'warning',
      description: '警告（オレンジ系）',
      usage: '注意喚起',
    },
    {
      name: 'success',
      description: '成功（緑系）',
      usage: '成功状態、正常動作',
    },
    {
      name: 'info',
      description: '情報（水色系）',
      usage: '情報通知',
    },
    {
      name: 'grey',
      description: 'グレースケール',
      usage: 'テキスト、ボーダー、背景',
    },
  ]

  const spacingValues = [
    { value: '0.5', px: '4px', usage: '極小の余白' },
    { value: '1', px: '8px', usage: 'コンパクトな余白' },
    { value: '2', px: '16px', usage: '標準的な余白' },
    { value: '3', px: '24px', usage: 'セクション間' },
    { value: '4', px: '32px', usage: '大きなセクション間' },
  ]

  const dailyTasks = [
    {
      task: '新規設計前にコンポーネント確認',
      frequency: '毎回',
      purpose: '既存部品の再利用',
    },
    {
      task: 'Dark Mode での表示確認',
      frequency: '毎回',
      purpose: 'テーマ品質の担保',
    },
    {
      task: 'Design Tokens の確認',
      frequency: '必要に応じて',
      purpose: '正しいカラー・サイズの使用',
    },
    {
      task: '実装レビュー',
      frequency: 'PR ごと',
      purpose: 'デザイン意図との整合性確認',
    },
  ]

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 3 }}>
      {/* イントロ */}
      <Paper
        variant='outlined'
        sx={{
          px: 6,
          py: 5,
          mb: 6,
          borderRadius: 3,
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(156,39,176,0.05)'
              : 'rgba(156,39,176,0.02)',
        }}>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1 }}>
          デザイナー向けガイド
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Storybook はデザイナーにとって 実装済みコンポーネントの確認ツール
          であり、 デザインと実装の橋渡し の役割を果たします。
        </Typography>
      </Paper>

      {/* 新規設計前の確認 */}
      <SectionHeader
        title='新しい画面を設計する前に'
        subtitle='まず Storybook で使えるコンポーネントを確認しましょう'
      />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {checkSections.map((s) => (
          <Grid key={s.section} size={{ xs: 12, sm: 6 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, borderRadius: 2, height: '100%' }}>
              <Stack
                direction='row'
                spacing={1}
                alignItems='center'
                sx={{ mb: 0.5 }}>
                <CheckCircleOutlineIcon color='success' sx={{ fontSize: 18 }} />
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  {s.section}
                </Typography>
              </Stack>
              <Typography
                variant='body1'
                color='text.secondary'
                sx={{ pl: 3.5 }}>
                {s.purpose}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 5 }} />

      {/* Controls で確認すべきこと */}
      <SectionHeader
        title='Controls で確認すべきポイント'
        subtitle='各コンポーネントの Default ストーリーで以下を試してください'
      />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {[
          {
            prop: 'variant',
            description:
              '外見のバリエーション（contained, outlined, text など）',
          },
          {
            prop: 'color',
            description: '使用可能なカラー（primary, secondary, error など）',
          },
          {
            prop: 'size',
            description: 'サイズバリエーション（small, medium, large）',
          },
          { prop: 'disabled', description: '無効化状態の見た目' },
        ].map((item) => (
          <Grid key={item.prop} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              variant='outlined'
              sx={{ px: 3.5, py: 3, borderRadius: 2, height: '100%' }}>
              <Chip
                label={item.prop}
                size='small'
                color='primary'
                variant='outlined'
                sx={{ mb: 1, fontFamily: 'monospace' }}
              />
              <Typography variant='body1' color='text.secondary'>
                {item.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Divider sx={{ my: 5 }} />

      {/* カラー */}
      <SectionHeader
        title='カラーの読み方'
        subtitle='Color Palette ストーリーで全色を確認できます'
      />
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 5 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>カテゴリ</TableCell>
              <TableCell>説明</TableCell>
              <TableCell>使い分け</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {colorCategories.map((c) => (
              <TableRow key={c.name}>
                <TableCell>
                  <Chip
                    label={c.name}
                    size='small'
                    variant='outlined'
                    sx={{ fontFamily: 'monospace' }}
                  />
                </TableCell>
                <TableCell>{c.description}</TableCell>
                <TableCell>
                  <Typography variant='body1' color='text.secondary'>
                    {c.usage}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* スペーシング */}
      <SectionHeader title='スペーシング' subtitle='基準値は 8px です' />
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 5 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>値</TableCell>
              <TableCell>ピクセル</TableCell>
              <TableCell>用途</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {spacingValues.map((s) => (
              <TableRow key={s.value}>
                <TableCell>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {s.value}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction='row' spacing={1} alignItems='center'>
                    <Box
                      sx={{
                        width: parseInt(s.px),
                        height: 12,
                        bgcolor: 'primary.main',
                        borderRadius: 0.5,
                        minWidth: 4,
                      }}
                    />
                    <Typography variant='body2'>{s.px}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>{s.usage}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 5 }} />

      {/* エンジニアへのフィードバック */}
      <SectionHeader
        title='エンジニアへのフィードバック'
        subtitle='効果的な伝え方'
      />
      <Grid container spacing={2} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant='outlined'
            sx={{
              px: 3.5,
              py: 3,
              borderRadius: 2,
              borderColor: 'success.main',
              height: '100%',
            }}>
            <Typography
              variant='body1'
              sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
              良い例
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ fontStyle: 'italic' }}>
              「Button (contained, primary) の disabled 状態で、 Dark Mode
              時にテキストのコントラストが不足しています。 text.disabled の
              opacity を調整してください。」
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            variant='outlined'
            sx={{
              px: 3.5,
              py: 3,
              borderRadius: 2,
              borderColor: 'error.main',
              height: '100%',
            }}>
            <Typography
              variant='body1'
              sx={{ fontWeight: 700, mb: 1, color: 'error.main' }}>
              悪い例
            </Typography>
            <Typography
              variant='body1'
              color='text.secondary'
              sx={{ fontStyle: 'italic' }}>
              「ボタンが見づらい。」
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2, mb: 5 }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          フィードバックのポイント
        </Typography>
        <Stack spacing={0.5} sx={{ pl: 1 }}>
          <Typography variant='body1' color='text.secondary'>
            1. コンポーネント名を明示 - 「ボタン」ではなく「Button の contained
            / primary」
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            2. 状態を明示 - 「disabled のときの色が薄すぎる」
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            3. テーマを明示 - 「Dark Mode で背景とカードの区別がつかない」
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            4. トークン値で指示 - 「spacing を 2（16px）→ 3（24px）に変更」
          </Typography>
        </Stack>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* 日常タスク */}
      <SectionHeader title='日常の運用' />
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 5 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>やること</TableCell>
              <TableCell>頻度</TableCell>
              <TableCell>目的</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dailyTasks.map((t) => (
              <TableRow key={t.task}>
                <TableCell>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {t.task}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={t.frequency} size='small' variant='outlined' />
                </TableCell>
                <TableCell>
                  <Typography variant='body1' color='text.secondary'>
                    {t.purpose}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 5 }} />

      {/* Storybook-First ワークフロー */}
      <SectionHeader
        title='Storybook-First ワークフロー'
        subtitle='Storybook を信頼できる唯一の情報源(SSOT)として活用する運用ルール'
      />

      {/* ワークフロー図 */}
      <Paper
        variant='outlined'
        sx={{ px: 3.5, py: 3, mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <svg viewBox='0 0 720 180' width='100%' style={{ display: 'block' }}>
          {/* Step 1: Storybook */}
          <rect
            x='20'
            y='40'
            width='180'
            height='100'
            rx='12'
            fill={
              theme.palette.mode === 'dark'
                ? 'rgba(93,124,232,0.15)'
                : 'rgba(14,173,184,0.08)'
            }
            stroke={theme.palette.primary.main}
            strokeWidth='2'
          />
          <text
            x='110'
            y='78'
            textAnchor='middle'
            fill={theme.palette.primary.main}
            style={{
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'system-ui',
            }}>
            1. Storybook
          </text>
          <text
            x='110'
            y='100'
            textAnchor='middle'
            fill={theme.palette.text.secondary}
            style={{ fontSize: '11px', fontFamily: 'system-ui' }}>
            コンポーネント実装
          </text>
          <text
            x='110'
            y='118'
            textAnchor='middle'
            fill={theme.palette.text.secondary}
            style={{ fontSize: '11px', fontFamily: 'system-ui' }}>
            デザイントークン定義
          </text>

          {/* Arrow 1 */}
          <line
            x1='210'
            y1='90'
            x2='260'
            y2='90'
            stroke={theme.palette.text.secondary}
            strokeWidth='2'
            markerEnd='url(#arrowhead)'
          />

          {/* Step 2: Figma */}
          <rect
            x='270'
            y='40'
            width='180'
            height='100'
            rx='12'
            fill={
              theme.palette.mode === 'dark'
                ? 'rgba(125,148,236,0.12)'
                : 'rgba(14,173,184,0.04)'
            }
            stroke={theme.palette.divider}
            strokeWidth='1.5'
          />
          <text
            x='360'
            y='78'
            textAnchor='middle'
            fill={theme.palette.text.primary}
            style={{
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'system-ui',
            }}>
            2. Figma
          </text>
          <text
            x='360'
            y='100'
            textAnchor='middle'
            fill={theme.palette.text.secondary}
            style={{ fontSize: '11px', fontFamily: 'system-ui' }}>
            Storybook 参照で画面設計
          </text>
          <text
            x='360'
            y='118'
            textAnchor='middle'
            fill={theme.palette.text.secondary}
            style={{ fontSize: '11px', fontFamily: 'system-ui' }}>
            既存コンポーネント再利用
          </text>

          {/* Arrow 2 */}
          <line
            x1='460'
            y1='90'
            x2='510'
            y2='90'
            stroke={theme.palette.text.secondary}
            strokeWidth='2'
            markerEnd='url(#arrowhead)'
          />

          {/* Step 3: Implementation */}
          <rect
            x='520'
            y='40'
            width='180'
            height='100'
            rx='12'
            fill={
              theme.palette.mode === 'dark'
                ? 'rgba(124,208,127,0.12)'
                : 'rgba(70,171,74,0.06)'
            }
            stroke={theme.palette.success.main}
            strokeWidth='1.5'
          />
          <text
            x='610'
            y='78'
            textAnchor='middle'
            fill={theme.palette.success.main}
            style={{
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: 'system-ui',
            }}>
            3. 実装
          </text>
          <text
            x='610'
            y='100'
            textAnchor='middle'
            fill={theme.palette.text.secondary}
            style={{ fontSize: '11px', fontFamily: 'system-ui' }}>
            Storybook コンポーネントで組む
          </text>
          <text
            x='610'
            y='118'
            textAnchor='middle'
            fill={theme.palette.text.secondary}
            style={{ fontSize: '11px', fontFamily: 'system-ui' }}>
            デザインとの差分が最小化
          </text>

          {/* Arrowhead marker */}
          <defs>
            <marker
              id='arrowhead'
              markerWidth='10'
              markerHeight='7'
              refX='9'
              refY='3.5'
              orient='auto'>
              <polygon
                points='0 0, 10 3.5, 0 7'
                fill={theme.palette.text.secondary}
              />
            </marker>
          </defs>
        </svg>
      </Paper>

      {/* チェックリスト */}
      <SectionHeader title='新規画面設計チェックリスト' />
      <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2, mb: 5 }}>
        <Stack spacing={1.5}>
          {[
            {
              check:
                'Storybook の Components セクションで既存コンポーネントを確認した',
              required: true,
            },
            {
              check: 'Design Tokens のカラー・スペーシング値を参照した',
              required: true,
            },
            {
              check:
                '新規コンポーネントが必要な場合、エンジニアと事前に協議した',
              required: true,
            },
            { check: 'Dark Mode でのデザインも検討した', required: false },
            {
              check:
                'Figma 上で Storybook トークン名（primary.main 等）をレイヤー名に使用した',
              required: false,
            },
          ].map((item) => (
            <Stack
              key={item.check}
              direction='row'
              spacing={1.5}
              alignItems='flex-start'>
              <CheckCircleOutlineIcon
                sx={{
                  fontSize: 18,
                  mt: 0.2,
                  color: item.required ? 'error.main' : 'text.disabled',
                }}
              />
              <Box>
                <Typography variant='body2'>{item.check}</Typography>
                {item.required && (
                  <Typography variant='caption' color='error.main'>
                    必須
                  </Typography>
                )}
              </Box>
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* Storybook → Figma 変換手順 */}
      <SectionHeader
        title='Storybook → Figma 変換'
        subtitle='html.to.design プラグインを使った Figma コンポーネント生成'
      />
      <Stack spacing={2} sx={{ mb: 5 }}>
        {[
          {
            step: '1',
            title: 'html.to.design プラグインをインストール',
            description:
              'Figma の Plugins メニューから「html.to.design」を検索してインストール。無料で利用可能。',
          },
          {
            step: '2',
            title: 'Storybook のストーリー URL をコピー',
            description:
              '各コンポーネントの iframe URL を使用。例: localhost:6006/iframe.html?id=components-ui-button--default',
          },
          {
            step: '3',
            title: 'プラグインで URL を貼り付けて変換',
            description:
              'html.to.design に URL を入力するとレンダリング結果が編集可能な Figma フレームに変換される。',
          },
          {
            step: '4',
            title: 'Figma 上でコンポーネント化',
            description:
              '変換されたフレームを Figma コンポーネントとして登録。Auto Layout を適用して完成。',
          },
        ].map((item) => (
          <Paper
            key={item.step}
            variant='outlined'
            sx={{ px: 3.5, py: 2.5, borderRadius: 2 }}>
            <Stack direction='row' spacing={2} alignItems='flex-start'>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontWeight: 700,
                  fontSize: '0.85rem',
                }}>
                {item.step}
              </Box>
              <Box>
                <Typography variant='body1' sx={{ fontWeight: 700 }}>
                  {item.title}
                </Typography>
                <Typography
                  variant='body1'
                  color='text.secondary'
                  sx={{ mt: 0.25 }}>
                  {item.description}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Paper
        sx={{
          px: 3.5,
          py: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'info.main',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(0,172,193,0.05)'
              : 'rgba(0,172,193,0.02)',
        }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          デザイントークン JSON
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          <code>pnpm export-tokens</code> を実行すると{' '}
          <code>design-tokens/tokens.json</code> に W3C DTCG
          形式でカラー・タイポグラフィ・スペーシングなど全トークンが出力されます。
          Figma Variables REST API や対応プラグインで直接インポートできます。
        </Typography>
      </Paper>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <ForDesignersContent />,
}
