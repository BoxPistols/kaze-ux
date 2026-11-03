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

import { elevation } from '@/themes/elevation'
import { darkTheme, lightTheme } from '@/themes/theme'

import type { Meta, StoryObj } from '@storybook/react-vite'

// --- メタ定義 ---
const meta: Meta = {
  title: 'Design Tokens/Shadows & Elevation',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// --- セマンティック段の定義（src/themes/elevation.ts と対応） ---
const semanticLevels = [
  {
    token: 'resting',
    level: elevation.resting,
    label: '接地',
    description:
      '影を持たず、境界線と背景色差で分離する。表・リスト行・入れ子のカード',
  },
  {
    token: 'raised',
    level: elevation.raised,
    label: '微浮上',
    description: '面がひとつ手前にあることだけを示す。カード・パネル',
  },
  {
    token: 'floating',
    level: elevation.floating,
    label: '浮上',
    description: '操作に応じて持ち上がった状態。hover 中のカード・選択中の行',
  },
  {
    token: 'overlay',
    level: elevation.overlay,
    label: '重ね',
    description:
      '下のコンテンツを覆う一時的な面。ドロップダウン・ポップオーバー',
  },
  {
    token: 'popover',
    level: elevation.popover,
    label: '前面',
    description: '強い一時面。メニュー・ツールチップ・通知',
  },
  {
    token: 'modal',
    level: elevation.modal,
    label: '最前面',
    description: '背景を遮断する面。ダイアログ・ドロワー',
  },
]

/**
 * 影の実値を表示するチップ。
 * 直近の ThemeProvider から影を取るため、Dark プレビュー内では
 * ダークの影が正しく表示される。
 */
const ShadowValue = ({ level }: { level: number }) => {
  const theme = useTheme()
  const value = theme.shadows[level]

  return (
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
          fontSize: '0.86rem',
          lineHeight: 1.6,
          wordBreak: 'break-all',
          color: 'text.secondary',
        }}>
        {value === 'none' ? 'box-shadow: none' : `box-shadow: ${value}`}
      </Typography>
    </Box>
  )
}

// --- 1. ElevationScale: セマンティック段の一覧 ---
const ElevationScaleContent = () => {
  const theme = useTheme()

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        Elevation スケール
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
        影は 0〜24 の 25 段を単一の曲線から生成しています。数値を直接書くと
        「なぜ 4 なのか」が失われるため、UI
        の役割で段を選べるセマンティックトークンを用意しています。
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 5 }}>
        <code>
          import {'{ elevation }'} from &apos;@/themes/elevation&apos;
        </code>
      </Typography>

      <Grid container spacing={4}>
        {semanticLevels.map(({ token, level, label, description }) => (
          <Grid key={token} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Box
              sx={{
                p: 4,
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[level],
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                }}>
                <Box>
                  <Typography variant='h4' sx={{ fontWeight: 700 }}>
                    {label}
                  </Typography>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ fontFamily: 'monospace' }}>
                    elevation.{token}
                  </Typography>
                </Box>
                <Chip
                  label={level}
                  size='small'
                  variant='outlined'
                  sx={{ fontFamily: 'monospace' }}
                />
              </Box>

              <ShadowValue level={level} />

              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 'auto' }}>
                {description}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export const ElevationScale: StoryObj = {
  name: 'Elevation スケール',
  render: () => <ElevationScaleContent />,
}

// --- 2. ComponentElevation: コンポーネント別の割り当て ---
const componentAssignments = [
  {
    name: 'Card',
    borderRadius: 12,
    token: 'raised',
    level: elevation.raised,
    hoverToken: 'floating',
    hoverLevel: elevation.floating,
    description:
      'elevation.raised。border と組み合わせて面を示し、hover で floating に持ち上がる。',
  },
  {
    name: 'Dialog',
    borderRadius: 16,
    token: 'modal',
    level: elevation.modal,
    hoverToken: null,
    hoverLevel: null,
    description:
      'elevation.modal。背景コンテンツを遮断する最も深い段。角丸 16px。',
  },
  {
    name: 'Menu',
    borderRadius: 6,
    token: 'overlay',
    level: elevation.overlay,
    hoverToken: null,
    hoverLevel: null,
    description:
      'elevation.overlay。下のコンテンツを一時的に覆うドロップダウン用。',
  },
  {
    name: 'Paper',
    borderRadius: 12,
    token: 'resting',
    level: elevation.resting,
    hoverToken: null,
    hoverLevel: null,
    description:
      'elevation.resting。影を持たず、境界線と背景色差だけで分離する。',
  },
  {
    name: 'Tooltip',
    borderRadius: 6,
    token: 'popover',
    level: elevation.popover,
    hoverToken: null,
    hoverLevel: null,
    description: 'elevation.popover。短命だが最前面に出る補助表示。',
  },
]

const AssignmentPanel = ({
  assignment,
}: {
  assignment: (typeof componentAssignments)[number]
}) => {
  const theme = useTheme()

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        bgcolor: 'action.hover',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}>
      <Typography variant='body2' sx={{ fontWeight: 700, mb: 1 }}>
        {assignment.description}
      </Typography>
      <Typography
        variant='caption'
        sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
        borderRadius: {assignment.borderRadius}px
      </Typography>
      <br />
      <Typography
        variant='caption'
        sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
        boxShadow: {theme.shadows[assignment.level]}
      </Typography>
      {assignment.hoverLevel !== null && (
        <>
          <br />
          <Typography
            variant='caption'
            sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
            hover: {theme.shadows[assignment.hoverLevel]}
          </Typography>
        </>
      )}
    </Paper>
  )
}

const ComponentElevationContent = () => {
  const theme = useTheme()

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
      <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        コンポーネント別 Elevation
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
        各コンポーネントに割り当てたセマンティック段と、実際の表示例です。
        表示している CSS
        値はテーマから直接取得しているため、実装と必ず一致します。
      </Typography>

      <Stack spacing={6}>
        {/* Card */}
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
            Card
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader title='サービスカード' subheader='通常状態の影' />
                <CardContent>
                  <Typography variant='body2' color='text.secondary'>
                    elevation.raised + border。 ホバーすると floating
                    に持ち上がります。
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AssignmentPanel assignment={componentAssignments[0]} />
            </Grid>
          </Grid>
        </Box>

        {/* Dialog */}
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
            Dialog
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              {/* Dialog の静的プレビュー（開かずに影だけ確認） */}
              <Box
                sx={{
                  p: 0,
                  borderRadius: '16px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: theme.shadows[elevation.modal],
                  overflow: 'hidden',
                }}>
                <Box
                  sx={{
                    px: 3,
                    py: 2.5,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}>
                  <Typography variant='h6' sx={{ fontWeight: 700 }}>
                    ダイアログタイトル
                  </Typography>
                </Box>
                <Box sx={{ px: 3, py: 3 }}>
                  <Typography variant='body2' color='text.secondary'>
                    ダイアログのコンテンツ領域です。
                    最も深い段が適用され、背景コンテンツとの視覚的な分離を実現します。
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
              <AssignmentPanel assignment={componentAssignments[1]} />
            </Grid>
          </Grid>
        </Box>

        {/* Menu */}
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
            Menu
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              {/* Menu の静的プレビュー */}
              <Box
                sx={{
                  display: 'inline-block',
                  borderRadius: '6px',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  boxShadow: theme.shadows[elevation.overlay],
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
              <AssignmentPanel assignment={componentAssignments[2]} />
            </Grid>
          </Grid>
        </Box>

        {/* Paper */}
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
            Paper
          </Typography>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper
                elevation={0}
                variant='outlined'
                sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant='body2' color='text.secondary'>
                  Paper コンポーネント（elevation.resting, variant:
                  outlined）。影なしのフラットな背景要素として使用されます。
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <AssignmentPanel assignment={componentAssignments[3]} />
            </Grid>
          </Grid>
        </Box>

        {/* Tooltip */}
        <Box>
          <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
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
              <AssignmentPanel assignment={componentAssignments[4]} />
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
                  sx={{ fontWeight: 700, fontFamily: 'monospace', mb: 0.5 }}>
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
        <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
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
                sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
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

/**
 * 各段を 1 行で表示する。useTheme() は直近の ThemeProvider を見るため、
 * Dark プレビュー内に置けばダークの影が表示される。
 */
const ElevationRows = () => {
  const theme = useTheme()

  return (
    <Stack spacing={3}>
      {semanticLevels.map(({ token, level, label }) => (
        <Box
          key={token}
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
            gap: 2,
          }}>
          <Box>
            <Typography
              variant='body2'
              color='text.primary'
              sx={{ fontWeight: 700 }}>
              {label}
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontFamily: 'monospace' }}>
              elevation.{token} ({level})
            </Typography>
          </Box>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{
              fontFamily: 'monospace',
              maxWidth: '60%',
              textAlign: 'right',
              wordBreak: 'break-all',
            }}>
            {theme.shadows[level]}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

const SampleCard = () => (
  <Card>
    <CardHeader title='カードタイトル' subheader='サブタイトル' />
    <CardContent>
      <Typography variant='body2' color='text.secondary'>
        Card は elevation.raised を持ち、hover で floating
        に持ち上がります。影とボーダーの両方で面を示します。
      </Typography>
    </CardContent>
  </Card>
)

const ShadowComparisonContent = () => (
  <Box sx={{ maxWidth: 1400, mx: 'auto', p: 4 }}>
    <Typography variant='h3' gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
      Light / Dark シャドウ比較
    </Typography>
    <Typography variant='body1' color='text.secondary' sx={{ mb: 5 }}>
      影スケールはモードごとに別々に生成されます。ライトは寒色ニュートラルの影で
      「落とす」、ダークは影を濃くしたうえで上端のリムライトで「浮かせる」という
      別の戦略を取っています。下の 2
      列は実際のライト/ダークテーマから値を取得しています。
    </Typography>

    <Grid container spacing={4}>
      {/* Lightモード */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
          Light Mode
        </Typography>
        <ThemeProvider theme={lightTheme}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'background.default',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
            }}>
            <ElevationRows />
          </Box>
        </ThemeProvider>
      </Grid>

      {/* Darkモード */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
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
            <ElevationRows />
          </Box>
        </ThemeProvider>
      </Grid>
    </Grid>

    {/* コンポーネント比較 */}
    <Box sx={{ mt: 8 }}>
      <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
        コンポーネントの見え方比較
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <ThemeProvider theme={lightTheme}>
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
                sx={{ fontWeight: 700, mb: 2 }}>
                Light
              </Typography>
              <SampleCard />
            </Box>
          </ThemeProvider>
        </Grid>

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
                sx={{ fontWeight: 700, mb: 2 }}>
                Dark
              </Typography>
              <SampleCard />
            </Box>
          </ThemeProvider>
        </Grid>
      </Grid>
    </Box>

    {/* 設計指針 */}
    <Box sx={{ mt: 8 }}>
      <Typography variant='h5' sx={{ fontWeight: 700, mb: 3 }}>
        設計指針
      </Typography>
      <Grid container spacing={3}>
        {[
          {
            title: '影に色相を与える',
            description:
              '純黒の影は彩度がゼロで、色面に落ちるとくすんで「汚れ」に見えます。実世界の影は環境光を拾って寒色に転ぶため、ライトの影色は背景と同じ寒色ニュートラル slate-900 (#0f172a) を基準にしています。',
          },
          {
            title: 'ダークはリムライトで浮かせる',
            description:
              '暗い背景に暗い影を落としても見えません。ダークでは影を濃くしたうえで、面の上端が光を拾う inset ハイライト（最大 10%）を重ね、「浮き」を光で表現します。',
          },
          {
            title: '二層構造で空間に置く',
            description:
              '単層の影は「板が浮いている」だけに見えます。接地点を締める近接影と、距離を示す遠方影（負のスプレッドで裾を絞る）を重ね、面が空間に存在して見えるようにしています。',
          },
          {
            title: '25 段を単一の曲線から生成',
            description:
              '手打ちの配列は途中で設計思想が変わり、段の連続性が壊れます。オフセット・ブラー・不透明度を段数 n の関数として導出し、どの段を選んでも同じ物理の上に乗るようにしています。',
          },
          {
            title: 'ブラーはオフセットの 2.5 倍',
            description:
              '物理的な半影の広がりに合わせた比率です（整数への丸めがあるため実測比は 2.4〜2.7 に散ります）。遠方影は負のスプレッドで裾を絞り、影が要素より大きく広がって滲むのを防ぎます。',
          },
          {
            title: '濃度は緩やかにしか上げない',
            description:
              '高く浮くほど影は「薄く広く」なるのが物理ですが、UI では階層の識別性が要るため 1 段あたり 0.2〜0.4% だけ濃くします。急峻に濃くすると上位の段が黒く潰れます。',
          },
        ].map((item) => (
          <Grid key={item.title} size={{ xs: 12, md: 4 }}>
            <Paper
              elevation={0}
              variant='outlined'
              sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant='subtitle2' sx={{ fontWeight: 700, mb: 1 }}>
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

export const ShadowComparison: StoryObj = {
  name: 'Light / Dark 比較',
  render: () => <ShadowComparisonContent />,
}
