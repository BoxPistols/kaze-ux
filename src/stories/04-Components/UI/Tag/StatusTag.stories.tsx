import { Box } from '@mui/material'

import { StatusTag } from '@/components/ui/tag/statusTag'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof StatusTag> = {
  title: 'Components/UI/Tag/StatusTag',
  component: StatusTag,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'ステータスを視覚的に表現するタグコンポーネント。MUI Chipベースで、ステータスに応じた配色を自動適用する。',
      },
    },
  },
  argTypes: {
    text: { control: 'text' },
    status: {
      control: 'select',
      options: [
        'draft',
        'submitted',
        'approved',
        'rejected',
        'pending',
        'active',
        'inactive',
      ],
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
type Story = StoryObj<typeof StatusTag>

export const Default: Story = {
  args: {
    text: '有効',
    status: 'active',
  },
}
