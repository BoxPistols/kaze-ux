import { BrowserRouter } from 'react-router-dom'

import { NotFoundView } from '@/components/ui/feedback/notFoundView'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof NotFoundView> = {
  title: 'Components/UI/Feedback/NotFoundView',
  component: NotFoundView,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          '404ページ用のビューコンポーネント。「ホームに戻る」「前のページに戻る」ボタンを提供する。',
      },
    },
    layout: 'fullscreen',
    noPadding: true,
  },
  argTypes: {
    homePath: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof NotFoundView>

/** デフォルト（ホームパス: /） */
export const Default: Story = {
  args: {
    homePath: '/',
  },
}

/** カスタムホームパス */
export const CustomHomePath: Story = {
  args: {
    homePath: '/dashboard',
  },
}
