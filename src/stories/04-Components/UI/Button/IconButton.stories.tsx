import AddIcon from '@mui/icons-material/Add'
import { Box } from '@mui/material'

import { IconButton } from '@/components/ui/icon-button'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof IconButton> = {
  title: 'Components/UI/Button/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'カスタムIconButtonコンポーネント。default/outlined/filled/ghost の4バリアント、ローディング、アクティブ状態、ツールチップに対応。',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outlined', 'filled', 'ghost'],
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'error',
        'warning',
        'info',
        'success',
        'inherit',
      ],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    loading: { control: 'boolean' },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
    tooltip: { control: 'text' },
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
type Story = StoryObj<typeof IconButton>

export const Default: Story = {
  args: {
    children: <AddIcon />,
    tooltip: '追加',
  },
}

/**
 * 塗り面のバリアント。**全色を並べる。**
 *
 * variant='filled' を描画する story が 1 つも無かったため、実描画を測る
 * check:a11y も、見た目の退行を見る vrt も、この状態を一度も見ていなかった。
 * 前景色に common.white を固定していて 36 通り中 27 通りが 3:1 未満だった
 * (#139) のに、どちらの検査も緑を返していた。**検査は宣言した範囲しか見ない。**
 */
export const Filled: Story = {
  render: () => (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {(
        ['primary', 'secondary', 'error', 'warning', 'info', 'success'] as const
      ).map((color) => (
        <IconButton
          key={color}
          variant='filled'
          color={color}
          aria-label={color}>
          <AddIcon />
        </IconButton>
      ))}
      <IconButton variant='filled' color='inherit' aria-label='inherit'>
        <AddIcon />
      </IconButton>
    </Box>
  ),
}
