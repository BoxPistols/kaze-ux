import { Box } from '@mui/material'

import { PageBuilder } from '@/components/page-builder/PageBuilder'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Storybook 上で動作するビジュアルページ構成ツール。
 * コンポーネントをクリックで追加し、プロパティを GUI で編集。
 * 生成された JSX コードをそのままコピーできます。
 */
const meta: Meta = {
  title: 'Page Builder/Builder',
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
