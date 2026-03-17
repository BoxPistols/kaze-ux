import { Box } from '@mui/material'

import { PageBuilder } from '@/components/page-builder/PageBuilder'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * コンポーネント一覧とコード生成の確認ページ。
 * コンポーネントをクリックで追加し、プロパティを GUI で編集。
 * 生成された JSX コードをそのままコピーできます。
 */
const meta: Meta = {
  title: 'Tools/Code Playground',
  tags: ['autodocs'],
}
export default meta

type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Box sx={{ height: 'calc(100vh - 40px)', display: 'flex' }}>
      <PageBuilder />
    </Box>
  ),
}
