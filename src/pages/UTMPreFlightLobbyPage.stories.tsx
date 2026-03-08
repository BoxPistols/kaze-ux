/**
 * UTMPreFlightLobbyPage Stories
 *
 * 飛行前準備ページのStorybookストーリー
 */

import { MemoryRouter } from 'react-router-dom'

import UTMPreFlightLobbyPage from './UTMPreFlightLobbyPage'

import type { Meta, StoryObj } from '@storybook/react'

const meta = {
  title: 'Pages/UTM/PreFlightLobbyPage',
  component: UTMPreFlightLobbyPage,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 飛行前準備ページ

飛行前に必要なすべての確認事項を管理するページです。

### 機能概要

- **5タブ構成**: 気象・空域、機体状態、許可・資格、デコンフリクション、クルー確認
- **チェックリスト**: 各項目の確認状態を管理
- **マップ表示**: 飛行エリアの可視化
- **進捗管理**: 全項目完了で飛行監視へ遷移可能

### 画面遷移

\`\`\`
申請管理 → 飛行前準備 → 飛行監視
\`\`\`

### 確認項目

| タブ | 確認内容 |
|:-----|:---------|
| 気象・空域 | 風速、気温、視程、NOTAM、TFR |
| 機体状態 | GPS、リモートID、校正、ファームウェア |
| 許可・資格 | DIPS、飛行許可、保険、操縦資格 |
| デコンフリクション | 他機との干渉確認 |
| クルー確認 | 操縦者、補助者、安全管理者 |
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof UTMPreFlightLobbyPage>

export default meta
type Story = StoryObj<typeof meta>

/**
 * デフォルト表示
 *
 * 飛行前準備ページの標準的な表示状態
 */
export const Default: Story = {}
