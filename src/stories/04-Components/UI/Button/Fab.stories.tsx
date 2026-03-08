import AddIcon from '@mui/icons-material/Add'
import { Box } from '@mui/material'

import { Fab } from '@/components/ui/fab'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Fab> = {
  title: 'Components/UI/Button/Fab',
  component: Fab,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Floating Action Button。ローディング状態、表示/非表示アニメーション、固定位置配置をサポートするカスタムFabコンポーネント。',
      },
    },
  },
  argTypes: {
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'error',
        'warning',
        'info',
        'success',
        'default',
        'inherit',
      ],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    variant: {
      control: 'select',
      options: ['circular', 'extended'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    visible: { control: 'boolean' },
    position: {
      control: 'select',
      options: ['fixed', 'absolute', 'relative'],
    },
    placement: {
      control: 'select',
      options: [
        'bottom-right',
        'bottom-left',
        'bottom-center',
        'top-right',
        'top-left',
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
type Story = StoryObj<typeof Fab>

export const Default: Story = {
  args: {
    icon: <AddIcon />,
    tooltip: '追加',
  },
}
