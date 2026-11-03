import MailIcon from '@mui/icons-material/Mail'
import { Badge, Box, IconButton } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Badge> = {
  title: 'Components/UI/Badge',
  component: Badge,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    badgeContent: { control: 'number' },
    color: {
      control: 'select',
      options: [
        'default',
        'primary',
        'secondary',
        'error',
        'info',
        'success',
        'warning',
      ],
    },
    variant: {
      control: 'select',
      options: ['standard', 'dot'],
    },
    max: { control: 'number' },
    invisible: { control: 'boolean' },
    showZero: { control: 'boolean' },
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
type Story = StoryObj<typeof Badge>

export const Default: Story = {
  args: {
    badgeContent: 4,
    color: 'primary',
    children: (
      <IconButton>
        <MailIcon />
      </IconButton>
    ),
  },
}
