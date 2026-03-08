import { Box } from '@mui/material'
import { action } from 'storybook/actions'

import { SaveButton } from '@/components/ui/button/saveButton'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof SaveButton> = {
  title: 'Components/UI/Button/SaveButton',
  component: SaveButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'フォーム保存用のボタンコンポーネント。アウトライン形式で、ラベルのカスタマイズと無効化状態に対応。',
      },
    },
  },
  argTypes: {
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
type Story = StoryObj<typeof SaveButton>

export const Default: Story = {
  args: {
    label: '保存',
    onClick: action('onClick'),
  },
}
