import { Box, Button } from '@mui/material'

import type { ButtonProps } from '@mui/material/Button'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<ButtonProps> = {
  title: 'Components/UI/Button/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
    },
    color: {
      control: 'select',
      options: [
        'inherit',
        'primary',
        'secondary',
        'error',
        'warning',
        'info',
        'success',
      ],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'MUI Buttonコンポーネント。contained / outlined / text の3バリアント、6カラー、3サイズをテーマカスタマイズ付きで表示する。',
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
type Story = StoryObj<ButtonProps>

export const Default: Story = {
  args: {
    children: 'ボタン',
    variant: 'contained',
    color: 'primary',
    size: 'medium',
  },
}
