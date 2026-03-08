import { Box, Typography } from '@mui/material'

import { ChatSupport } from '@/components/ui/ChatSupport/ChatSupport'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * プロジェクト全体で利用可能なチャットサポートウィジェット。
 * MUIコンポーネントを組み合わせて構築されており、ダークモードにも対応しています。
 */
const meta: Meta<typeof ChatSupport> = {
  title: 'Components/UI/ChatSupport',
  component: ChatSupport,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ChatSupport>

export const Default: Story = {
  render: () => (
    <Box sx={{ height: '600px', p: 4, position: 'relative' }}>
      <Typography variant='h5' gutterBottom>
        チャットサポートのデモ
      </Typography>
      <Typography variant='body1'>
        右下のメッセージアイコンをクリックしてチャットを開始してください。
      </Typography>
      <ChatSupport />
    </Box>
  ),
}

/**
 * 実際のページレイアウト内での見え方を確認するためのストーリー
 */
export const InLayout: Story = {
  render: () => (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          p: 3,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
        }}>
        <Typography variant='h6'>SDPF Dashboard</Typography>
      </Box>
      <Box sx={{ p: 4 }}>
        <Typography variant='h4' gutterBottom>
          Welcome to the Dashboard
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          チャットサポートウィジェットは画面の最前面に表示されます。
        </Typography>
      </Box>
      <ChatSupport />
    </Box>
  ),
}
