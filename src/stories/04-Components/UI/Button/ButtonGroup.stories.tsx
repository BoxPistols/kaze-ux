import { Box } from '@mui/material'
import { useState } from 'react'

import { ButtonGroup } from '@/components/ui/button-group'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ButtonGroup> = {
  title: 'Components/UI/Button/ButtonGroup',
  component: ButtonGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '選択式ボタングループ。単一選択・複数選択に対応し、アイコン付きオプションもサポート。ビュー切替や期間選択等に使用。',
      },
    },
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    variant: {
      control: 'select',
      options: ['outlined', 'contained', 'text'],
    },
    multiple: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    disabled: { control: 'boolean' },
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
type Story = StoryObj<typeof ButtonGroup>

const DefaultDemo = () => {
  const [value, setValue] = useState('month')
  return (
    <ButtonGroup
      options={[
        { value: 'month', label: '月' },
        { value: 'week', label: '週' },
        { value: 'day', label: '日' },
      ]}
      value={value}
      onChange={(v) => setValue(v as string)}
    />
  )
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}
