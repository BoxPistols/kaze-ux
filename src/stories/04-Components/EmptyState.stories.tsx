import InboxIcon from '@mui/icons-material/Inbox'
import SearchIcon from '@mui/icons-material/Search'
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'
import { Box, Paper } from '@mui/material'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/feedback'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Components/Feedback/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          '一覧が 0 件のときに出す。',
          '',
          'ただ何も出さないと「読み込み中なのか」「壊れているのか」「本当に無いのか」が',
          '区別できない。**何が無いのか**と**次に何をすればよいか**を必ず出す。',
          '',
          '404 のような「経路の誤り」には NotFoundView を使う。',
          'こちらは「経路は正しいが中身が無い」ときのもの。',
        ].join('\n'),
      },
    },
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    size: { control: 'inline-radio', options: ['compact', 'page'] },
  },
  args: {
    title: 'まだ履歴がありません',
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** 説明と次の一手まで置いた形。基本はこれを使う */
export const WithAction: Story = {
  args: {
    icon: <ShoppingCartOutlinedIcon />,
    title: 'カートは空です',
    description: '店舗から商品を追加すると、ここに表示されます',
    action: <Button variant='default'>店舗を探す</Button>,
  },
}

/** 検索結果が 0 件。条件を戻す導線を必ず添える */
export const NoSearchResult: Story = {
  args: {
    icon: <SearchIcon />,
    title: '該当する店舗がありません',
    description: '検索語やカテゴリを変えてみてください',
    action: <Button variant='outline'>条件をクリア</Button>,
  },
}

/** カードやパネルの中に差し込むときは compact */
export const Compact: Story = {
  args: {
    icon: <InboxIcon />,
    title: '未割当のタスクはありません',
    size: 'compact',
  },
  render: (args) => (
    <Paper variant='outlined' sx={{ maxWidth: 480, borderRadius: 2 }}>
      <EmptyState {...args} />
    </Paper>
  ),
}

/** 説明が無いときは詰めて出す（空きだけが残らないように） */
export const TitleOnly: Story = {
  args: { title: 'データがありません', size: 'compact' },
  render: (args) => (
    <Box sx={{ maxWidth: 480 }}>
      <EmptyState {...args} />
    </Box>
  ),
}
