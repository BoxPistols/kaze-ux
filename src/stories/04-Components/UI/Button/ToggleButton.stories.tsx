import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter'
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify'
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft'
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight'
import { Box } from '@mui/material'
import { useState } from 'react'

import { ToggleButtonGroup } from '@/components/ui/toggle-button'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ToggleButtonGroup> = {
  title: 'Components/UI/Button/ToggleButton',
  component: ToggleButtonGroup,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'トグルボタングループ。排他的選択(exclusive)と複数選択に対応。アイコン、ラベル、水平/垂直レイアウトをサポート。',
      },
    },
  },
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
        'standard',
      ],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    exclusive: { control: 'boolean' },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
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
type Story = StoryObj<typeof ToggleButtonGroup>

const DefaultDemo = () => {
  const [alignment, setAlignment] = useState<string | null>('left')
  return (
    <ToggleButtonGroup
      options={[
        { value: 'left', icon: <FormatAlignLeftIcon />, tooltip: '左揃え' },
        {
          value: 'center',
          icon: <FormatAlignCenterIcon />,
          tooltip: '中央揃え',
        },
        { value: 'right', icon: <FormatAlignRightIcon />, tooltip: '右揃え' },
        {
          value: 'justify',
          icon: <FormatAlignJustifyIcon />,
          tooltip: '両端揃え',
        },
      ]}
      value={alignment}
      exclusive
      onChange={(v) => setAlignment(v as string | null)}
    />
  )
}

export const Default: Story = {
  render: () => <DefaultDemo />,
}
