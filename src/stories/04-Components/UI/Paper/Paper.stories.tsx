import { Paper, Typography } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Paper> = {
  title: 'Components/UI/Paper',
  component: Paper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevation', 'outlined'],
      description: 'バリアント',
    },
    elevation: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: 'エレベーション',
    },
    square: { control: 'boolean', description: '角丸を無効にする' },
  },
}

export default meta

export const Default: StoryObj<typeof Paper> = {
  args: {
    variant: 'elevation',
    elevation: 2,
    square: false,
  },
  render: (args) => (
    <Paper {...args} sx={{ p: 4, maxWidth: 400 }}>
      <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
        Paper コンテンツ
      </Typography>
      <Typography variant='body2' color='text.secondary'>
        Controlsパネルでvariant、elevation、squareを変更できます。
      </Typography>
    </Paper>
  ),
}
