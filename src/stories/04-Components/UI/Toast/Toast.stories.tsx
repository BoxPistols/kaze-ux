import { Box, Button, Stack, Typography } from '@mui/material'
import { toast } from 'sonner'

import { CustomToaster } from '@/components/ui/toast/customToaster'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof CustomToaster> = {
  title: 'Components/UI/Toast',
  component: CustomToaster,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'sonnerベースのトースト通知コンポーネント。成功、エラー、警告、情報、ローディングの各バリエーションに対応。',
      },
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3 }}>
        <CustomToaster />
        <Story />
      </Box>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof CustomToaster>

export const Default: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant='body2' color='text.secondary'>
        各ボタンをクリックしてトーストを表示
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant='outlined'
          onClick={() => toast('デフォルトのトースト')}>
          デフォルト
        </Button>
        <Button
          variant='outlined'
          color='success'
          onClick={() => toast.success('正常に保存されました')}>
          成功
        </Button>
        <Button
          variant='outlined'
          color='error'
          onClick={() => toast.error('エラーが発生しました')}>
          エラー
        </Button>
        <Button
          variant='outlined'
          color='warning'
          onClick={() => toast.warning('注意が必要です')}>
          警告
        </Button>
        <Button
          variant='outlined'
          color='info'
          onClick={() => toast.info('情報をお知らせします')}>
          情報
        </Button>
      </Box>
    </Stack>
  ),
}
