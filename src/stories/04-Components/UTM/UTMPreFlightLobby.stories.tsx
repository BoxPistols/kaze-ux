/**
 * UTM Pre-Flight Lobby Storybook
 *
 * 飛行前準備ロビーページのデモ
 */

import { Box } from '@mui/material'
import { MemoryRouter } from 'react-router-dom'

import UTMPreFlightLobbyPage from '@/pages/UTMPreFlightLobbyPage'

import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof UTMPreFlightLobbyPage> = {
  title: 'Components/UTM/Pages/PreFlightLobby',
  component: UTMPreFlightLobbyPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## Pre-Flight Lobby

飛行前の準備状況を一覧表示するランディングページです。

### 主な機能

1. **飛行予定サマリー**
   - 本日の飛行予定件数
   - 準備完了件数
   - 注意事項あり件数
   - 要対応件数

2. **飛行カード**
   - 機体・パイロット情報
   - バッテリー/通信/気象/空域状態
   - プリフライトチェック進捗
   - アラート表示

3. **クイックアクション**
   - プリフライトチェック開始
   - 監視画面へ移動
   - 詳細表示

### UTM要件定義対応
- Pre-Flight Lobby ★★★★
- GPS状態表示 ★★★
- LTE通信状態 ★★★
- バッテリー警告システム ★★★★
- Geogauge（空域状態） ★★★★
        `,
      },
    },
  },
  tags: ['autodocs', 'utm', 'pages'],
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Box sx={{ minHeight: '100vh' }}>
          <Story />
        </Box>
      </MemoryRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof UTMPreFlightLobbyPage>

/**
 * 基本表示
 */
export const Default: Story = {
  name: '基本表示',
}
