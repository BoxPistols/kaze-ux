// Visual Editor — Storybook Story

import { VisualEditor } from './components/VisualEditor'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof VisualEditor> = {
  title: 'Tools/Visual Editor',
  component: VisualEditor,
  parameters: {
    layout: 'fullscreen',
    noPadding: true,
    fullscreenNoPadding: true,
    docs: {
      description: {
        component:
          'AIを使ってkaze-uxコンポーネントを組み合わせるビジュアルエディタ。自然言語でUIを記述すると、登録済みコンポーネントのみでレイアウトを生成します。',
      },
    },
  },
}

export default meta
type Story = StoryObj<typeof VisualEditor>

export const Default: Story = {}
