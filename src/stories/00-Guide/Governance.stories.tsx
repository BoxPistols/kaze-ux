import {
  Alert,
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

import adoption from './ds-adoption.generated.json'
import { CodeBlock } from '../_shared/CodeBlock'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Guide/Governance',
  parameters: {
    layout: 'padded',
    docs: { page: null },
  },
}

export default meta

// ---------------------------------------------------------------------------
// 数字はすべて ds-adoption.generated.json から読む。
// このページに直書きすると、書いた直後のコミットで古くなる。
// ---------------------------------------------------------------------------

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) => (
  <Box sx={{ mb: 3, mt: 6 }}>
    {/* theme が h2〜h6 variant を div にマップしている（視覚スケールと文書
        構造を分離する方針）。見出しにするなら component を明示する */}
    <Typography
      variant='h5'
      component='h2'
      sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

const Layer = ({
  n,
  when,
  what,
  detail,
}: {
  n: string
  when: string
  what: string
  detail: string
}) => {
  const theme = useTheme()
  return (
    <Paper
      variant='outlined'
      sx={{
        p: 2.5,
        flex: 1,
        minWidth: 240,
        borderColor: 'divider',
        bgcolor:
          theme.palette.mode === 'dark' ? 'transparent' : 'background.paper',
      }}>
      <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1 }}>
        <Chip size='small' label={n} color='primary' />
        <Typography variant='caption' color='text.secondary'>
          {when}
        </Typography>
      </Stack>
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{what}</Typography>
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ lineHeight: 1.7 }}>
        {detail}
      </Typography>
    </Paper>
  )
}

const Governance = () => {
  const { totals, apps, dsOnly, violations, command } = adoption

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', pb: 10 }}>
      <Typography
        variant='h4'
        component='h1'
        sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 1 }}>
        プロダクトを追加しても、同じ部品と同じ定義しか使えない
      </Typography>
      <Typography color='text.secondary' sx={{ lineHeight: 1.8 }}>
        デザインシステムが崩れるのは、部品の設計が悪いからではなく
        「使わなくても書けてしまう」からです。ここでは、それが起きないことを
        実測値で示します。数字はすべて計測スクリプトの出力で、このページに
        直書きしていません。
      </Typography>

      {/* ------------------------------------------------------------- */}
      <SectionHeader
        title='現在の準拠率'
        subtitle='DS に同等品がある部品について、実際に DS を使っている割合'
      />

      <Stack direction='row' spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Paper
          variant='outlined'
          sx={{ p: 3, minWidth: 200, borderColor: 'primary.main' }}>
          <Typography variant='caption' color='text.secondary'>
            全プロダクト合計
          </Typography>
          <Typography
            sx={{ fontWeight: 700, fontSize: 40, lineHeight: 1.1, my: 0.5 }}
            color='primary.main'>
            {totals.rate}%
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            DS {totals.dsUse} 箇所 / MUI 直 {totals.bypass} 箇所
          </Typography>
        </Paper>
        <Paper variant='outlined' sx={{ p: 3, minWidth: 200 }}>
          <Typography variant='caption' color='text.secondary'>
            未準拠の箇所
          </Typography>
          <Typography
            sx={{ fontWeight: 700, fontSize: 40, lineHeight: 1.1, my: 0.5 }}>
            {violations.length}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            0 でなければファイルと行を名指しします
          </Typography>
        </Paper>
      </Stack>

      <TableContainer component={Paper} variant='outlined' sx={{ mb: 2 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>プロダクト</TableCell>
              <TableCell align='right'>DS 使用</TableCell>
              <TableCell align='right'>MUI 直</TableCell>
              <TableCell align='right'>準拠率</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apps.map((a) => (
              <TableRow key={a.app}>
                <TableCell>{a.app}</TableCell>
                <TableCell align='right'>{a.dsUse}</TableCell>
                <TableCell align='right'>{a.bypass}</TableCell>
                <TableCell align='right' sx={{ fontWeight: 700 }}>
                  {a.rate === null ? '—' : `${a.rate}%`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
        この表は <code>{command}</code> の出力を読み込んでいます。同じコマンドで
        いつでも再現できます。
      </Typography>

      {/* ------------------------------------------------------------- */}
      <SectionHeader
        title='なぜ守られるのか — 3 つの層'
        subtitle='規約を配るのではなく、規約から外れたコードが進まない状態にする'
      />

      <Stack direction='row' spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
        <Layer
          n='1'
          when='書いた瞬間'
          what='ESLint が error で止める'
          detail='DS に同等品がある MUI 部品の直 import を no-restricted-imports が禁止します。警告ではなく error なので、エディタ上で赤くなり、そのままではコミットも通りません。'
        />
        <Layer
          n='2'
          when='push したとき'
          what='CI が落ちる'
          detail='同じ ESLint が CI で走ります。手元で無視しても、リポジトリには入りません。'
        />
        <Layer
          n='3'
          when='いつでも'
          what='計測が場所を名指しする'
          detail='準拠率を数え、未準拠があればファイル名・行番号・「代わりに使うべき部品」まで出します。--strict を付ければ 1 件でも exit 1 になります。'
        />
      </Stack>

      {/* ------------------------------------------------------------- */}
      <SectionHeader
        title='実際に破ってみる'
        subtitle='以下は主張ではなく、違反コードを置いて実行した出力そのものです'
      />

      <Typography variant='body2' sx={{ mb: 1.5 }}>
        DS に <code>CustomTextField</code> があるのに、MUI の{' '}
        <code>TextField</code> を直接使うコードをアプリに置きます。
      </Typography>

      <CodeBlock language='tsx' caption='apps/saas-dashboard/src/probe.tsx'>
        {`import { TextField } from '@mui/material'

export const Probe = () => <TextField label='テスト' />`}
      </CodeBlock>

      <Typography variant='body2' sx={{ mt: 3, mb: 1.5 }}>
        層 1（書いた瞬間）:
      </Typography>
      <CodeBlock language='bash' caption='pnpm lint'>
        {`  1:10  error  'TextField' import from '@mui/material' is restricted.
                DS の CustomTextField を使ってください。
                レイアウト原始要素 (Box / Grid / Stack / Typography 等) は対象外です。
                no-restricted-imports

✖ 1 problem (1 error, 0 warnings)`}
      </CodeBlock>

      <Typography variant='body2' sx={{ mt: 3, mb: 1.5 }}>
        層 3（計測）:
      </Typography>
      <CodeBlock language='bash' caption='pnpm ds:adoption'>
        {`saas-dashboard     204       1        99.5%
kaze-eats          95        0        100.0%
sky-kaze           57        0        100.0%

  合計: DS 356 / MUI 直 1 → 99.7%

== 未準拠の箇所 ==
  apps/saas-dashboard/src/probe.tsx:3
    <TextField> → CustomTextField`}
      </CodeBlock>

      <Alert severity='info' sx={{ mt: 3 }}>
        指摘が「どこで・何を・何に置き換えるか」まで出るので、受け取った側が
        調べ直す必要がありません。規約を覚えていなくても直せます。
      </Alert>

      {/* ------------------------------------------------------------- */}
      <SectionHeader
        title='定義の単一ソース'
        subtitle='同じ画面で MUI と Tailwind の色が食い違わないようにする'
      />

      <Typography variant='body2' sx={{ mb: 2, lineHeight: 1.9 }}>
        MUI の palette と Tailwind の <code>--color-*</code> は、どちらも同じ{' '}
        <code>ThemeColors</code> から生成します。片方だけを直すと画面の中で色が
        割れるため、
        <strong>CSS に色を手で書くことを禁止し、テストで検査</strong>
        しています。
      </Typography>

      <CodeBlock language='bash'>
        {`ThemeColors (単一ソース)
   ├─ createBrandTheme()      → MUI palette
   └─ generateCssVars()       → Tailwind の --color-*

app-themes.test.ts が「index.css に --color-* の手打ちが無いこと」を検査`}
      </CodeBlock>

      {/* ------------------------------------------------------------- */}
      <SectionHeader
        title='新しいプロダクトを足すとどうなるか'
        subtitle='後から仕組みを入れるのではなく、最初から効いている'
      />

      <Typography variant='body2' sx={{ mb: 2, lineHeight: 1.9 }}>
        ESLint の対象は <code>apps/*/src</code> なので、
        <strong>新しいアプリを作った時点で既に効いています</strong>。 DS
        を使わないコードは書いた瞬間に赤くなり、CI も通りません。 現在{' '}
        {apps.filter((a) => a.dsUse > 0).length} プロダクトが
        この状態で並んでいます。
      </Typography>

      <Typography variant='body2' sx={{ mb: 2, lineHeight: 1.9 }}>
        DS に部品を足したときに更新するのは{' '}
        <code>scripts/ds-equivalents.mjs</code> の 1 箇所だけです。ESLint
        と計測が 同じ表を読むので、片方だけ古くなることがありません。
      </Typography>

      <Divider sx={{ my: 5 }} />

      {/* ------------------------------------------------------------- */}
      <SectionHeader
        title='対象にしていないもの'
        subtitle='数字を大きく見せないために、何を数えていないかを明示します'
      />

      <Typography variant='body2' sx={{ mb: 2, lineHeight: 1.9 }}>
        <code>Box</code> / <code>Grid</code> / <code>Stack</code> /{' '}
        <code>Typography</code> のようなレイアウト原始要素は DS
        に同等品が無いため
        対象外です。直接使うのが正しい姿で、これを分母に入れると準拠率が実態と
        無関係な数字になります。
      </Typography>

      <Typography variant='body2' sx={{ mb: 2, lineHeight: 1.9 }}>
        逆に、MUI に同等品が無い DS 固有の部品（PageHeader / SectionTitle 等）の
        利用 {dsOnly} 箇所も分子には数えていません。「DS を使っている」と言える
        箇所を増やす方向の水増しをしないためです。
      </Typography>

      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ lineHeight: 1.9 }}>
        また、この Storybook 自身と DS 本体（<code>src/components</code>）は
        ESLint の対象外です。DS を作る場所で DS
        の利用を強制すると成立しないため、
        境界はプロダクトのコードに置いています。
      </Typography>
    </Box>
  )
}

type Story = StoryObj

export const Overview: Story = {
  render: () => <Governance />,
}
