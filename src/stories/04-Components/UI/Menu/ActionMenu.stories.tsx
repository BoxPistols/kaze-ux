import { Box } from '@mui/material'
import { action } from 'storybook/actions'

import {
  ActionMenu,
  type ActionMenuItem,
} from '@/components/ui/menu/actionMenu'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ActionMenu> = {
  title: 'Components/UI/Menu/ActionMenu',
  component: ActionMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '3点ドットメニュー形式のアクションメニュー。テーブル行やカードのコンテキストメニューとして使用。danger指定で削除等の危険操作を視覚的に区別する。',
      },
    },
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
type Story = StoryObj<typeof ActionMenu>

const defaultItems: ActionMenuItem[] = [
  { id: 'edit', label: '編集', onClick: action('編集') },
  { id: 'duplicate', label: '複製', onClick: action('複製') },
  {
    id: 'delete',
    label: '削除',
    onClick: action('削除'),
    danger: true,
  },
]

export const Default: Story = {
  args: {
    items: defaultItems,
  },
}
