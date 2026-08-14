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

/**
 * Storybook そのものが初見の人向けのページ。
 *
 * 既存の Guide は「Kaze UX の中身」の説明で、「Storybook とは何か・
 * どこを見るか」が抜けていた。最初に詰まるのはそこなので、画面の場所と
 * 対応させて説明する。
 */
const meta: Meta = {
  title: 'Guide/Getting Started',
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
  <Box sx={{ mb: 3 }}>
    <Typography variant='h4' sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
      {title}
    </Typography>
    {subtitle && (
      <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
)

/** 画面のどこを指しているかを、位置の言葉つきで示す */
const WhereChip = ({ children }: { children: React.ReactNode }) => (
  <Chip
    label={children}
    size='small'
    variant='outlined'
    sx={{ fontWeight: 700, fontSize: '0.86rem' }}
  />
)

const Step = ({
  n,
  title,
  where,
  children,
}: {
  n: number
  title: string
  where: string
  children: React.ReactNode
}) => {
  const theme = useTheme()
  return (
    <Paper
      variant='outlined'
      sx={{ p: 3, borderRadius: 2, height: '100%', bgcolor: 'transparent' }}>
      <Stack direction='row' spacing={1.5} alignItems='center' sx={{ mb: 1.5 }}>
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
            fontWeight: 700,
            fontSize: '0.875rem',
            flexShrink: 0,
          }}>
          {n}
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
          {title}
        </Typography>
      </Stack>
      <Box sx={{ mb: 1.5 }}>
        <WhereChip>{where}</WhereChip>
      </Box>
      <Typography
        variant='body2'
        color='text.secondary'
        sx={{ lineHeight: 1.9, color: theme.palette.text.secondary }}>
        {children}
      </Typography>
    </Paper>
  )
}

// ---------------------------------------------------------------------------

const GettingStartedContent = () => {
  const screenMap = [
    {
      area: '左のサイドバー',
      what: 'コンポーネントの一覧',
      detail:
        '番号つきのフォルダで並んでいます。00-Guide から順に読むと、思想 → トークン → 部品 の順で辿れます。',
    },
    {
      area: '上のタブ (Canvas / Docs)',
      what: '見え方の切り替え',
      detail:
        'Canvas は「その 1 パターンだけ」を大きく表示。Docs は「そのコンポーネントの全パターン + 説明 + props 表」を縦に並べたページです。',
    },
    {
      area: '下の Controls パネル',
      what: 'props をその場で変える',
      detail:
        'variant や size を切り替えると、上の表示が即座に変わります。コードを書かずに「この組み合わせはどう見えるか」を試せます。',
    },
    {
      area: '下の Accessibility タブ',
      what: 'コントラスト等の自動チェック',
      detail:
        '表示中のコンポーネントに対して axe が走ります。violations が 0 でないときは、その場で理由が読めます。',
    },
    {
      area: '上のツールバー',
      what: 'テーマ・画面幅の切り替え',
      detail:
        'Light / Dark (Dracula) / Dark (Kaze) の 3 モードと、モバイル〜デスクトップの幅を切り替えられます。',
    },
  ]

  const vocabulary = [
    {
      word: 'Story（ストーリー）',
      meaning:
        'コンポーネント 1 つの「ある状態」。Button なら Primary / Disabled / Loading がそれぞれ 1 story。',
    },
    {
      word: 'Canvas（キャンバス）',
      meaning: '1 つの story だけを表示する画面。実際に触って確かめる場所。',
    },
    {
      word: 'Docs（ドキュメント）',
      meaning:
        '1 コンポーネントの全 story と説明・props をまとめたページ。仕様を読む場所。',
    },
    {
      word: 'Controls（コントロール）',
      meaning: 'props を GUI で変えるパネル。値を変えると表示が追随する。',
    },
    {
      word: 'args（アーグス）',
      meaning:
        'story に渡している props の値そのもの。Controls で変えているのはこれ。',
    },
  ]

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto', py: 2 }}>
      <SectionHeader
        title='はじめての Storybook'
        subtitle='Storybook を触るのが初めての方へ。何ができる場所なのか、どこを見ればよいのかを 5 分で掴めるようにまとめました。'
      />

      <Paper
        variant='outlined'
        sx={{ p: 3, borderRadius: 2, mb: 5, bgcolor: 'transparent' }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>
          ひとことで言うと
        </Typography>
        <Typography color='text.secondary' sx={{ lineHeight: 1.9 }}>
          <strong>UI 部品のカタログであり、試着室です。</strong>
          アプリを起動しなくても、ボタンや入力欄を 1 つずつ取り出して、
          状態やサイズを変えながら実際の見た目と挙動を確かめられます。
          デザイナーは「どんな部品があるか」を探す場所として、
          エンジニアは「どう書けばその見た目になるか」を確かめる場所として使います。
        </Typography>
      </Paper>

      <SectionHeader
        title='画面のどこに何があるか'
        subtitle='この画面を見ながら読んでください。'
      />
      <TableContainer
        component={Paper}
        variant='outlined'
        sx={{ mb: 5, borderRadius: 2, bgcolor: 'transparent' }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: 220 }}>場所</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 200 }}>
                そこで何ができるか
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }}>詳細</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {screenMap.map((row) => (
              <TableRow key={row.area}>
                <TableCell>
                  <WhereChip>{row.area}</WhereChip>
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{row.what}</TableCell>
                <TableCell color='text.secondary'>{row.detail}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SectionHeader
        title='まずこの 4 つを試す'
        subtitle='読むより触るほうが早い部分です。'
      />
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Step n={1} title='部品を 1 つ開く' where='左のサイドバー'>
            <strong>04-Components</strong> を開いて、たとえば{' '}
            <strong>Button</strong> を選びます。
            右側に実物が表示されます。これが 1 つの story です。
          </Step>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Step n={2} title='props を変えてみる' where='下の Controls パネル'>
            <strong>variant</strong> や <strong>size</strong>{' '}
            を切り替えてください。 上の表示がその場で変わります。
            コードを書かずに組み合わせを試せます。
          </Step>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Step n={3} title='テーマを切り替える' where='上のツールバー'>
            Light / Dark を切り替えると、同じ部品がどう見えるか比べられます。
            <strong>色は自動で切り替わる前提</strong>
            で作ってあるので、ダークで壊れていたらそれは不具合です。
          </Step>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Step n={4} title='使い方のコードを取る' where='上のタブ → Docs'>
            <strong>Docs</strong> タブに切り替えると、各 story の下に{' '}
            <strong>Show code</strong> があります。 そこに出ている JSX
            がそのまま使える書き方です。
          </Step>
        </Grid>
      </Grid>

      <SectionHeader
        title='言葉の対応'
        subtitle='Storybook 特有の呼び名だけ、先に押さえておくと迷いません。'
      />
      <TableContainer
        component={Paper}
        variant='outlined'
        sx={{ mb: 5, borderRadius: 2, bgcolor: 'transparent' }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, width: 240 }}>用語</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>意味</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vocabulary.map((v) => (
              <TableRow key={v.word}>
                <TableCell sx={{ fontWeight: 700 }}>{v.word}</TableCell>
                <TableCell color='text.secondary'>{v.meaning}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 4 }} />

      <SectionHeader title='次に読むもの' subtitle='目的別に分かれています。' />
      <Grid container spacing={2.5}>
        {[
          {
            title: 'Introduction',
            for: '全体像を知りたい',
            detail: 'Kaze UX が何を提供しているかの概要。',
          },
          {
            title: 'For Designers',
            for: 'デザイナー',
            detail: 'トークンと Figma の対応、部品の探し方。',
          },
          {
            title: 'How to Use',
            for: 'エンジニア',
            detail: 'import パス、props、実装の手順。',
          },
          {
            title: 'Design Tokens',
            for: '色・余白の根拠を知りたい',
            detail: '色・型・余白・影が、どの値からどう決まっているか。',
          },
        ].map((n) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={n.title}>
            <Paper
              variant='outlined'
              sx={{
                p: 2.5,
                borderRadius: 2,
                height: '100%',
                bgcolor: 'transparent',
              }}>
              <Chip
                label={n.for}
                size='small'
                color='primary'
                sx={{ mb: 1.5, fontWeight: 700, fontSize: '0.86rem' }}
              />
              <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                {n.title}
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ lineHeight: 1.8 }}>
                {n.detail}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        variant='outlined'
        sx={{ p: 3, borderRadius: 2, mt: 5, bgcolor: 'transparent' }}>
        <Typography sx={{ fontWeight: 700, mb: 1 }}>
          分からないことがあったら
        </Typography>
        <Typography color='text.secondary' sx={{ lineHeight: 1.9 }}>
          画面の右下にチャットのボタンがあります。
          今見ているページを踏まえて答えるので、
          「この画面は何？」「このコンポーネントの使い方は？」とそのまま聞けます。
          API キーが未設定でも、内蔵の FAQ から答えます。
        </Typography>
      </Paper>
    </Box>
  )
}

type Story = StoryObj

export const Overview: Story = {
  render: () => <GettingStartedContent />,
}
