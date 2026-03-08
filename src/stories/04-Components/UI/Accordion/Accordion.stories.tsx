import { Box, Typography } from '@mui/material'

import { CustomAccordion } from '@/components/ui/accordion'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof CustomAccordion> = {
  title: 'Components/UI/Accordion',
  component: CustomAccordion,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'カスタムアコーディオン。アイコン、バッジ、ネスト対応のExpandable/Collapsibleパネルコンポーネント。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    highlight: { control: 'boolean', description: 'ハイライト表示' },
    canExpand: { control: 'boolean', description: '展開可能かどうか' },
    defaultExpanded: { control: 'boolean', description: '初期展開状態' },
    onSelect: { action: 'selected' },
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
    summary: <Typography fontWeight={500}>クリックして展開</Typography>,
    details: (
      <Typography color='text.secondary'>
        アコーディオンの詳細コンテンツです。展開アイコンをクリックすることで表示されます。
      </Typography>
    ),
    canExpand: true,
    highlight: false,
    defaultExpanded: false,
  },
}
