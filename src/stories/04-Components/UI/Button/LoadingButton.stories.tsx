import SaveIcon from '@mui/icons-material/Save'
import { Box } from '@mui/material'

import { LoadingButton } from '@/components/ui/button/loadingButton'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof LoadingButton> = {
  title: 'Components/UI/Button/LoadingButton',
  component: LoadingButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '非同期処理中のローディング表示に対応したボタン。保存・送信・アップロード等のフローで使用。成功状態やプログレス表示にも対応。',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['contained', 'outlined', 'text'],
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error', 'warning', 'info', 'success'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
    success: { control: 'boolean' },
    loadingPosition: {
      control: 'select',
      options: ['start', 'end', 'center'],
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
type Story = StoryObj<typeof LoadingButton>

export const Default: Story = {
  args: {
    children: '保存',
    startIcon: <SaveIcon />,
    loading: false,
  },
}

/**
 * 成功状態。
 *
 * success を描画する story が無かったため、塗り面の上の文字色が
 * 白固定で 3:1 に届いていなかった (#139) 間も、実描画を測る check:a11y は
 * この状態を一度も見ていなかった
 */
export const Success: Story = {
  args: {
    children: '保存しました',
    startIcon: <SaveIcon />,
    success: true,
  },
}
