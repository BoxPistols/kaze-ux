import { Box } from '@mui/material'

import { ConnectionStatusChip } from '@/components/ui/chip/connectionStatusChip'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ConnectionStatusChip> = {
  title: 'Components/UI/Chip/ConnectionStatusChip',
  component: ConnectionStatusChip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '接続状態チップ。連携済み/未連携のステータスを色とアイコンで視覚的に表示する。',
      },
    },
  },
  argTypes: {
    connected: { control: 'boolean' },
    connectedLabel: { control: 'text' },
    disconnectedLabel: { control: 'text' },
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

type Story = StoryObj<typeof ConnectionStatusChip>

export const Default: Story = {
  args: {
    connected: true,
  },
}
