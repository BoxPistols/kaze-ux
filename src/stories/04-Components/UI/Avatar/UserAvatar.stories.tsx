import { Box } from '@mui/material'

import { UserAvatar } from '@/components/ui/avatar/userAvatar'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UserAvatar> = {
  title: 'Components/UI/Avatar/UserAvatar',
  component: UserAvatar,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'text' },
    size: {
      control: 'radio',
      options: ['small', 'medium', 'large'],
    },
    maxChars: {
      control: { type: 'inline-radio' },
      options: [1, 2],
    },
    variant: {
      control: 'radio',
      options: ['circular', 'rounded', 'square'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'success', 'error', 'warning', 'info'],
    },
    src: { control: 'text' },
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
type Story = StoryObj<typeof UserAvatar>

export const Default: Story = {
  args: {
    name: 'Taro Yamada',
    size: 'medium',
    maxChars: 1,
    variant: 'circular',
    color: 'primary',
  },
}
