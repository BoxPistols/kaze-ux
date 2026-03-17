import { Box, Breadcrumbs, Link, Typography } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Components/UI/Breadcrumbs',
  component: Breadcrumbs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    maxItems: {
      control: { type: 'number', min: 1, max: 10 },
    },
    separator: { control: 'text' },
    itemsBeforeCollapse: { control: 'number' },
    itemsAfterCollapse: { control: 'number' },
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
type Story = StoryObj<typeof Breadcrumbs>

export const Default: Story = {
  args: {
    maxItems: 8,
    separator: '/',
  },
  render: (args) => (
    <Breadcrumbs {...args} aria-label='パンくずリスト'>
      <Link underline='hover' color='inherit' component='button'>
        ホーム
      </Link>
      <Link underline='hover' color='inherit' component='button'>
        プロジェクト
      </Link>
      <Link underline='hover' color='inherit' component='button'>
        タスク計画
      </Link>
      <Typography color='text.primary'>ルート編集</Typography>
    </Breadcrumbs>
  ),
}
