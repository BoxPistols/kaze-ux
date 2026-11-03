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
    kaze: {
      control: 'boolean',
      description:
        'Kaze 骨格を opt-in で適用（sharp radius / mono font / ease-kaze）',
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

/**
 * Kaze 骨格を opt-in で適用した Button。
 * 既存 variant (default/outline/secondary/...) と直交して動き、
 * 色はそのまま、radius / motion / font だけ骨格トークンに差し替わる。
 *
 * 適用される差分:
 * - borderRadius: var(--kaze-r-sharp) → 2px (sharp)
 * - fontFamily: var(--kaze-font-mono) → IBM Plex Mono
 * - letterSpacing: 0.08em + textTransform: uppercase
 * - transition: var(--kaze-dur-micro) var(--kaze-ease) → 120ms / cubic-bezier(0.33, 0, 0, 1)
 */
export const Kaze: Story = {
  args: {
    children: 'Request demo',
    variant: 'default',
    kaze: true,
  },
}

/**
 * kaze opt-in × 各 variant のマトリクス。
 * 色軸と骨格軸が orthogonal に組める。
 */
export const KazeMatrix: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, auto)',
        gap: 12,
        alignItems: 'center',
      }}>
      <Button variant='default' kaze>
        Default
      </Button>
      <Button variant='outline' kaze>
        Outline
      </Button>
      <Button variant='secondary' kaze>
        Secondary
      </Button>
      <Button variant='destructive' kaze>
        Destructive
      </Button>
      <Button variant='ghost' kaze>
        Ghost
      </Button>
      <Button variant='link' kaze>
        Link
      </Button>
    </div>
  ),
}
