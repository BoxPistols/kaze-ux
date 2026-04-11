import { Box, Typography } from '@mui/material'

import { ChatSupport } from '@/components/ui/ChatSupport/ChatSupport'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * プロジェクト全体で利用可能なチャットサポートウィジェット。
 * MUIコンポーネントを組み合わせて構築されており、ダークモードにも対応しています。
 *
 * この Story は `disableDecoratorChat: true` により、preview.tsx の Decorator 側で
 * 全 Story に注入される ChatSupport を**この Story でのみ無効化**します。
 * これにより、Story 自身が描画する `<ChatSupport />` との二重レンダリングを防止します。
 */
const meta: Meta<typeof ChatSupport> = {
  title: 'Components/UI/ChatSupport',
  component: ChatSupport,
  parameters: {
    layout: 'fullscreen',
    // Decorator 側の ChatSupport を無効化（二重レンダリング防止）
    disableDecoratorChat: true,
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
        <Typography variant='h6'>Kaze Dashboard</Typography>
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
