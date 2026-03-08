import MapLibre from '@/components/MapLibre'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof MapLibre> = {
  title: 'Components/Maps/MapLibre',
  component: MapLibre,
  parameters: {
    docs: { disable: true },
    layout: 'fullscreen',
    fullscreenNoPadding: true, // フルスクリーン時のみパディングなし
  },
  tags: ['map', 'geolocation', 'interactive'],
  argTypes: {
    latitude: {
      control: { type: 'number', min: -90, max: 90, step: 0.000001 },
      description: '緯度',
    },
    longitude: {
      control: { type: 'number', min: -180, max: 180, step: 0.000001 },
      description: '経度',
    },
    zoom: {
      control: { type: 'number', min: 0, max: 22, step: 0.1 },
      description: 'ズームレベル',
    },
  },
}

export default meta

type Story = StoryObj<typeof MapLibre>

export const Default: Story = {
  args: {
    latitude: 35.6809591,
    longitude: 139.7673068,
    zoom: 6,
  },
}

export const LowZoom: Story = {
  args: {
    latitude: 35.6809591,
    longitude: 139.7673068,
    zoom: 4,
  },
}

export const NewYork: Story = {
  args: {
    latitude: 40.7128,
    longitude: -74.006,
    zoom: 3.5,
  },
}
