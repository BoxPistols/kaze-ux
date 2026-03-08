import CloudIcon from '@mui/icons-material/Cloud'
import { Box } from '@mui/material'
import { action } from 'storybook/actions'

import { ServiceCard } from '@/components/ui/card/serviceCard'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ServiceCard> = {
  title: 'Components/UI/Card/ServiceCard',
  component: ServiceCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    connected: { control: 'boolean' },
    loading: { control: 'boolean' },
    registerButtonLabel: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3, maxWidth: 400 }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Cloud Hub',
    description: 'クラウド管理サービス',
    icon: <CloudIcon sx={{ fontSize: 28 }} />,
    connected: false,
    onRegisterClick: action('onRegisterClick'),
  },
}
