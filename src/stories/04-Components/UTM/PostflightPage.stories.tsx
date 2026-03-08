/**
 * PostflightPage Storybook
 *
 * ポストフライト記録ページのデモ
 */

import { Box } from '@mui/material'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import PostflightPage from '@/pages/PostflightPage'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof PostflightPage> = {
  title: 'Components/UTM/Pages/PostflightPage',
  component: PostflightPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
ポストフライト記録ページ。

## 機能

### 1. フライトサマリー
- フライト基本情報表示
- 飛行時間、総距離、ドローン数
- マルチサイト情報（該当する場合）

### 2. サイト別レポート（マルチサイトの場合）
- アコーディオン形式で各拠点を表示
- サイトごとのインシデント記録
- サイトごとのノート

### 3. 全体レポート
- 全体インシデント記録
- 全体ノート
- 添付ファイルアップロード

### 4. 送信機能
- バリデーション
- 送信処理
- 成功メッセージ表示

### 5. ナビゲーション
- 戻るボタン
- キャンセル確認ダイアログ
- 送信後の自動遷移

## URL構造
- \`/postflight/:flightId\`

## 使用例

\`\`\`tsx
import { useNavigate } from 'react-router-dom'

// フライト完了後に遷移
navigate(\`/postflight/\${flightId}\`)
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs', 'utm', 'postflight', 'page'],
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/postflight/multi-site-001']}>
        <Routes>
          <Route path='/postflight/:flightId' element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof PostflightPage>

// マルチサイトフライト
export const MultiSiteFlight: Story = {
  name: 'マルチサイトフライト',
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/postflight/multi-site-001']}>
        <Routes>
          <Route path='/postflight/:flightId' element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  render: () => (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PostflightPage />
    </Box>
  ),
}

// シングルサイトフライト
export const SingleSiteFlight: Story = {
  name: 'シングルサイトフライト',
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/postflight/default-001']}>
        <Routes>
          <Route path='/postflight/:flightId' element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  render: () => (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PostflightPage />
    </Box>
  ),
}

// フライトID未指定（デフォルトでマルチサイト）
export const DefaultFlight: Story = {
  name: 'フライトID未指定',
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/postflight/']}>
        <Routes>
          <Route path='/postflight/:flightId?' element={<Story />} />
        </Routes>
      </MemoryRouter>
    ),
  ],
  render: () => (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PostflightPage />
    </Box>
  ),
}
