import {
  Box,
  Chip,
  Divider,
  Grid,
  Link,
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

import { CodeBlock } from '../_shared/CodeBlock'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Guide/Component Development',
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

const ComponentDevContent = () => {
  const theme = useTheme()

  const argTypeExamples = [
    { type: 'テキスト', syntax: "{ control: 'text' }", props: 'label, title' },
    {
      type: 'ブーリアン',
      syntax: "{ control: 'boolean' }",
      props: 'disabled, loading',
    },
    {
      type: 'セレクト',
      syntax: "{ control: 'select', options: [...] }",
      props: 'variant, color, size',
    },
    {
      type: '数値',
      syntax: "{ control: { type: 'number', min, max } }",
      props: 'maxItems, step',
    },
    {
      type: 'レンジ',
      syntax: "{ control: { type: 'range', min, max, step } }",
      props: 'elevation, opacity',
    },
    {
      type: 'アクション',
      syntax: "{ action: 'clicked' }",
      props: 'onClick, onChange',
    },
  ]

  const codingRules = [
    {
      rule: 'React.FC 禁止',
      detail: 'React.FC, FC, FunctionComponent は使用しない',
    },
    { rule: '日本語コメント', detail: 'コメントやドキュメントは日本語で記述' },
    { rule: 'pnpm 使用', detail: 'npm は使用禁止' },
    { rule: 'TypeScript strict', detail: 'any 型は原則禁止' },
  ]

  const checklist = [
    "tags: ['autodocs'] が設定されている",
    'docs.description.component に日本語の説明がある',
    'argTypes で主要な props が Controls に表示される',
    'Default ストーリーが args ベースで定義されている',
    'Light / Dark 両テーマで表示を確認',
    'pnpm lint でエラーがないこと',
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
              ? 'rgba(76,175,80,0.05)'
              : 'rgba(76,175,80,0.02)',
        }}>
        <Typography variant='h4' sx={{ fontWeight: 800, mb: 1 }}>
          コンポーネント開発ガイド
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Storybook でのストーリー作成ルールと開発手順を解説します。
        </Typography>
      </Paper>

      {/* 基本構成 */}
      <SectionHeader
        title='ストーリーファイルの基本構成'
        subtitle='Default + Controls で全バリエーションを確認できる構成にします'
      />

      <CodeBlock>
        {`import { Box } from '@mui/material'
import { MyComponent } from '@/components/ui/myComponent'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof MyComponent> = {
  title: 'Components/UI/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'コンポーネントの説明文（日本語）',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3 }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'サンプル',
    variant: 'primary',
    disabled: false,
  },
}`}
      </CodeBlock>

      <Divider sx={{ my: 5 }} />

      {/* Default + Controls 方針 */}
      <SectionHeader title='設計原則: Default + Controls' />

      <Grid container spacing={2} sx={{ mb: 3 }}>
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
              NG: 従来のアプローチ
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Sizes ストーリー、Colors ストーリー、Variants ストーリー... と
              バリエーションごとにストーリーを作成。ファイルが500行以上に膨張。
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
              borderColor: 'success.main',
              height: '100%',
            }}>
            <Typography
              variant='body1'
              sx={{ fontWeight: 700, mb: 1, color: 'success.main' }}>
              OK: 現在のアプローチ
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Default ストーリー1つ + argTypes で Controls パネルを充実。
              ファイルは50〜100行。全パターンを Controls で確認可能。
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2, mb: 5 }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1 }}>
          例外: 複数ストーリーが必要なケース
        </Typography>
        <Stack spacing={0.5} sx={{ pl: 1 }}>
          <Typography variant='body1' color='text.secondary'>
            - 1ファイルに複数コンポーネント がある場合（Calendar: MiniCalendar,
            CalendarControl, MonthView）
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            - 状態管理が異なる の場合（Dialog: ConfirmDialog, FormDialog）
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            - トリガー操作が必要 な場合（Toast: ボタンクリックで表示）
          </Typography>
        </Stack>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* argTypes */}
      <SectionHeader
        title='argTypes リファレンス'
        subtitle='Controls パネルの入力タイプを定義します'
      />
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 5 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>タイプ</TableCell>
              <TableCell>構文</TableCell>
              <TableCell>対象props例</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {argTypeExamples.map((a) => (
              <TableRow key={a.type}>
                <TableCell>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {a.type}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {a.syntax}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant='body2'
                    sx={{ fontFamily: 'monospace', fontSize: 13 }}>
                    {a.props}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 5 }} />

      {/* ステートフルコンポーネント */}
      <SectionHeader
        title='ステートフルなコンポーネント'
        subtitle='useState が必要な場合のパターン'
      />
      <CodeBlock>
        {`export const Default: Story = {
  args: {
    title: '確認',
    message: '本当に削除しますか？',
  },
  render: (args) => {
    // 必ず内部コンポーネントを定義する（lint対策）
    const Demo = () => {
      const [open, setOpen] = useState(false)
      return (
        <>
          <Button onClick={() => setOpen(true)}>開く</Button>
          <ConfirmDialog
            {...args}
            open={open}
            onClose={() => setOpen(false)}
          />
        </>
      )
    }
    return <Demo />
  },
}`}
      </CodeBlock>

      <Paper
        sx={{
          p: 2,
          mt: 2,
          mb: 5,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'warning.main',
          bgcolor:
            theme.palette.mode === 'dark'
              ? 'rgba(255,152,0,0.05)'
              : 'rgba(255,152,0,0.02)',
        }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 0.5 }}>
          注意
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          render 関数内で直接 useState を呼ぶと lint エラーになります。
          必ず内部コンポーネント（Demo）を定義してその中で useState
          を使ってください。
        </Typography>
      </Paper>

      <Divider sx={{ my: 5 }} />

      {/* ファイル配置 */}
      <SectionHeader title='ファイル配置ルール' />
      <CodeBlock>
        {`src/stories/
├── 00-Guide/              # ガイドページ
├── 01-DesignPhilosophy/   # デザイン哲学
├── 02-DesignTokens/       # デザイントークン
├── 03-Layout/             # レイアウト
├── 04-Components/         # コンポーネント
│   ├── UI/                # 汎用UIコンポーネント
│   │   ├── Button/
│   │   ├── Card/
│   │   ├── Dialog/
│   │   └── ...
│   ├── Form/              # フォームコンポーネント
│   └── Domain/            # ドメイン固有コンポーネント
└── 05-Patterns/           # レイアウトパターン`}
      </CodeBlock>

      <Divider sx={{ my: 5 }} />

      {/* コーディング規約 */}
      <SectionHeader title='コーディング規約' />
      <TableContainer component={Paper} variant='outlined' sx={{ mb: 3 }}>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>ルール</TableCell>
              <TableCell>詳細</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {codingRules.map((r) => (
              <TableRow key={r.rule}>
                <TableCell>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    {r.rule}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant='body1' color='text.secondary'>
                    {r.detail}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <SectionHeader title='import の順序' />
      <CodeBlock>
        {`// 1. 外部ライブラリ（MUI, React など）
import { Box, Button } from '@mui/material'
import { useState } from 'react'
import { action } from 'storybook/actions'

// 2. 内部コンポーネント（@/ エイリアス使用）
import { MyComponent } from '@/components/ui/myComponent'

// 3. 型定義（type import）
import type { Meta, StoryObj } from '@storybook/react-vite'`}
      </CodeBlock>

      <Divider sx={{ my: 5 }} />

      {/* チェックリスト */}
      <SectionHeader
        title='新規ストーリー作成チェックリスト'
        subtitle='提出前に全項目を確認してください'
      />
      <Paper variant='outlined' sx={{ px: 3.5, py: 3, borderRadius: 2 }}>
        <Stack spacing={1}>
          {checklist.map((item, i) => (
            <Stack key={i} direction='row' spacing={1.5} alignItems='center'>
              <Chip
                label={String(i + 1)}
                size='small'
                variant='outlined'
                sx={{ width: 28, height: 28 }}
              />
              <Typography variant='body2'>{item}</Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* 参考リンク */}
      <Box
        sx={{ mt: 6, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography variant='body1' sx={{ fontWeight: 700, mb: 1.5 }}>
          参考リンク
        </Typography>
        <Stack spacing={0.75}>
          <Link
            href='https://mui.com/material-ui/getting-started/'
            target='_blank'
            rel='noopener noreferrer'
            variant='body1'
            color='primary'>
            MUI Getting Started
          </Link>
          <Link
            href='https://storybook.js.org/docs/writing-stories'
            target='_blank'
            rel='noopener noreferrer'
            variant='body1'
            color='primary'>
            Storybook Writing Stories
          </Link>
          <Link
            href='https://react.dev/learn'
            target='_blank'
            rel='noopener noreferrer'
            variant='body1'
            color='primary'>
            React Documentation
          </Link>
        </Stack>
      </Box>
    </Box>
  )
}

export const Overview: StoryObj = {
  name: 'Overview',
  render: () => <ComponentDevContent />,
}
