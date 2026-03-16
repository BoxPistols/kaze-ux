import { Button } from '@/components/ui/Button'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * Pure Tailwind CSS + CVA で構築された Button コンポーネント。
 * MUI に依存せず、高速かつ軽量なスタイリングを提供します。
 * shadcn/ui にインスパイアされた設計です。
 */
const meta: Meta<typeof Button> = {
  title: 'Components/UI/Button/TailwindButton',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
      ],
      description: 'ボタンのスタイルバリアント',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'ボタンのサイズ',
    },
  },
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof Button>

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Destructive',
    variant: 'destructive',
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost',
    variant: 'ghost',
  },
}

export const Link: Story = {
  args: {
    children: 'Link',
    variant: 'link',
  },
}

export const Small: Story = {
  args: {
    children: 'Small',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large',
    size: 'lg',
  },
}

export const Icon: Story = {
  args: {
    children: '🔔',
    size: 'icon',
  },
}
