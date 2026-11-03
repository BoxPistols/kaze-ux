import { Box } from '@mui/material'
import { useState } from 'react'

import { DateTimePicker, dayjs } from '@/components/Form/DateTimePicker'

import type { Meta, StoryObj } from '@storybook/react-vite'
import type { Dayjs } from 'dayjs'

const meta: Meta<typeof DateTimePicker> = {
  title: 'Components/Form/DateTimePicker',
  component: DateTimePicker,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '日時選択コンポーネント。MUI X DateTimePickerベースで、ラベル・ツールチップ・バリデーション機能を統合。',
      },
    },
  },
  args: {
    label: '日時を選択',
    size: 'small',
  },
  argTypes: {
    label: { control: 'text' },
    format: { control: 'text' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    helperText: { control: 'text' },
    required: { control: 'boolean' },
    tooltip: { control: 'text' },
    size: { control: 'radio', options: ['small', 'medium'] },
    fullWidth: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 400 }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof DateTimePicker>

const DateTimeDemo = (
  props: Omit<React.ComponentProps<typeof DateTimePicker>, 'value' | 'onChange'>
) => {
  const [value, setValue] = useState<Dayjs | null>(dayjs())
  return <DateTimePicker {...props} value={value} onChange={setValue} />
}

/** 基本的な日時選択ピッカー */
export const Default: Story = {
  args: {
    tooltip: '日時を選択してください',
  },
  render: (args) => <DateTimeDemo {...args} />,
}

/** 日付のみ（時間なし） */
export const DateOnly: Story = {
  args: {
    label: '日付を選択',
    format: 'YYYY/MM/DD',
    tooltip: '日付のみ選択',
  },
  render: (args) => <DateTimeDemo {...args} />,
}
