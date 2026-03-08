import { Box, Button } from '@mui/material'

import { CustomTooltip } from '@/components/ui/tooltip/customTooltip'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof CustomTooltip> = {
  title: 'Components/UI/Tooltip/CustomTooltip',
  component: CustomTooltip,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'カスタムスタイルのTooltipコンポーネント。MUI Tooltipをベースに、矢印付きのスタイリングを適用。',
      },
    },
  },
  argTypes: {
    title: { control: 'text', description: 'ツールチップのテキスト' },
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
      <Box sx={{ p: 6, display: 'flex', justifyContent: 'center' }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CustomTooltip>

export const Default: Story = {
  args: {
    title: 'これはツールチップです',
    placement: 'top',
    arrow: true,
  },
  render: (args) => (
    <CustomTooltip {...args}>
      <Button variant='outlined'>ホバーしてください</Button>
    </CustomTooltip>
  ),
}
