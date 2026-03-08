import AddIcon from '@mui/icons-material/Add'
import { Box } from '@mui/material'

import { IconButton } from '@/components/ui/icon-button'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof IconButton> = {
  title: 'Components/UI/Button/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'カスタムIconButtonコンポーネント。default/outlined/filled/ghost の4バリアント、ローディング、アクティブ状態、ツールチップに対応。',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'filled', 'ghost'],
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'error',
        'warning',
        'info',
        'success',
        'inherit',
      ],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    loading: { control: 'boolean' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
    tooltip: { control: 'text' },
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
type Story = StoryObj<typeof IconButton>

export const Default: Story = {
  args: {
    children: <AddIcon />,
    tooltip: '追加',
  },
}
