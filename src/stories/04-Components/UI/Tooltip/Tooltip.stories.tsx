import { Box, Button, Tooltip } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/UI/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text', description: 'ツールチップの内容' },
    placement: {
      control: 'select',
      options: [
        'top',
        'top-start',
        'top-end',
        'bottom',
        'bottom-start',
        'bottom-end',
        'left',
        'left-start',
        'left-end',
        'right',
        'right-start',
        'right-end',
      ],
      description: '表示位置',
    },
    arrow: { control: 'boolean', description: '矢印の表示' },
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 6 }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta

export const Default: StoryObj<typeof Tooltip> = {
  args: {
    title: 'ツールチップのテキスト',
    placement: 'top',
    arrow: true,
  },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant='outlined'>ホバーしてください</Button>
    </Tooltip>
  ),
}
