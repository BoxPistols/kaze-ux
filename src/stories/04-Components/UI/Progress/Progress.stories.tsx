import { Box, CircularProgress } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof CircularProgress> = {
  title: 'Components/UI/Progress',
  component: CircularProgress,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
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
        'inherit',
      ],
    },
    variant: {
      control: 'select',
      options: ['determinate', 'indeterminate'],
    },
    value: {
      control: { type: 'range', min: 0, max: 100 },
    },
    size: {
      control: { type: 'number', min: 16, max: 120 },
    },
    thickness: {
      control: { type: 'number', min: 1, max: 10 },
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
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    color: 'primary',
    size: 40,
  },
}
