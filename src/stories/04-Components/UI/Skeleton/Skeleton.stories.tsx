import { Box, Skeleton } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Skeleton> = {
  title: 'Components/UI/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['text', 'circular', 'rectangular', 'rounded'],
    },
    animation: {
      control: 'select',
      options: ['pulse', 'wave', false],
    },
    width: { control: 'text' },
    height: { control: 'number' },
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
    variant: 'rounded',
    animation: 'pulse',
    width: 200,
    height: 60,
  },
}
