/**
 * DIDMap Storybook ストーリー
 *
 * 日本の人口集中地区（DID）、飛行禁止区域、空港空域を表示する地図コンポーネント
 */

import { DIDMap } from '@/components/DIDMap'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof DIDMap> = {
  title: 'Components/Maps/DIDMap',
  component: DIDMap,
  parameters: {
    docs: { disable: true },
    layout: 'fullscreen',
    fullscreenNoPadding: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['map', 'geolocation', 'drone', 'did', 'japan'],
  argTypes: {
    center: {
      control: 'object',
      description: '初期中心座標 [経度, 緯度]',
    },
    zoom: {
      control: { type: 'number', min: 0, max: 22, step: 0.5 },
      description: 'ズームレベル',
    },
    baseMap: {
      control: 'select',
      options: ['osm', 'gsi', 'pale', 'photo'],
      description: 'ベースマップの種類',
    },
    darkMode: {
      control: 'boolean',
      description: 'ダークモード',
    },
    showLayerPanel: {
      control: 'boolean',
      description: 'レイヤーパネルの表示',
    },
    enableCoordinateDisplay: {
      control: 'boolean',
      description: '座標表示の有効化',
    },
  },
}

export default meta

type Story = StoryObj<typeof DIDMap>

/**
 * デフォルト表示
 * 日本全体を表示し、レイヤーパネルからDIDや飛行禁止区域を選択可能
 */
export const Default: Story = {
  args: {
    center: [137.0, 36.5],
    zoom: 5,
    baseMap: 'osm',
    darkMode: false,
    showLayerPanel: true,
    enableCoordinateDisplay: true,
  },
}

/**
 * 東京周辺
 * 東京都心を中心に表示
 */
export const Tokyo: Story = {
  args: {
    center: [139.7673, 35.6809],
    zoom: 10,
    baseMap: 'osm',
    darkMode: false,
    showLayerPanel: true,
    enableCoordinateDisplay: true,
  },
}

/**
 * 大阪周辺
 * 大阪市を中心に表示
 */
export const Osaka: Story = {
  args: {
    center: [135.5023, 34.6937],
    zoom: 10,
    baseMap: 'osm',
    darkMode: false,
    showLayerPanel: true,
    enableCoordinateDisplay: true,
  },
}

/**
 * 名古屋周辺
 * 名古屋市を中心に表示
 */
export const Nagoya: Story = {
  args: {
    center: [136.9066, 35.1815],
    zoom: 10,
    baseMap: 'osm',
    darkMode: false,
    showLayerPanel: true,
    enableCoordinateDisplay: true,
  },
}

/**
 * 地理院地図
 * 国土地理院の地図を使用
 */
export const GSIMap: Story = {
  args: {
    center: [137.0, 36.5],
    zoom: 5,
    baseMap: 'gsi',
    darkMode: false,
    showLayerPanel: true,
    enableCoordinateDisplay: true,
  },
}

/**
 * 航空写真
 * 航空写真ベースマップを使用
 */
export const PhotoMap: Story = {
  args: {
    center: [139.7673, 35.6809],
    zoom: 12,
    baseMap: 'photo',
    darkMode: false,
    showLayerPanel: true,
    enableCoordinateDisplay: true,
  },
}

/**
 * レイヤーパネル非表示
 * レイヤーパネルを非表示にしたシンプルな地図
 */
export const NoLayerPanel: Story = {
  args: {
    center: [137.0, 36.5],
    zoom: 5,
    baseMap: 'osm',
    darkMode: false,
    showLayerPanel: false,
    enableCoordinateDisplay: true,
  },
}

/**
 * 能登半島
 * 2024年震災被害地域
 */
export const Noto: Story = {
  args: {
    center: [136.98, 37.4],
    zoom: 10,
    baseMap: 'osm',
    darkMode: false,
    showLayerPanel: true,
    enableCoordinateDisplay: true,
  },
}
