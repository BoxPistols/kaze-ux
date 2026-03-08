/**
 * Restriction Layers Storybook
 * 制限区域レイヤーのStorybookストーリー
 */

import { Box, Paper, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import Map from 'react-map-gl/maplibre'

import 'maplibre-gl/dist/maplibre-gl.css'

import {
  LayerControlPanel,
  RestrictionLegend,
  RestrictionMapLayers,
  StatusIndicators,
  ZoneStatusChip,
} from '@/components/utm/components'
import { useRestrictionLayers, useKeyboardShortcuts } from '@/lib/map/hooks'
import type { LayerVisibility } from '@/lib/map/hooks'

import type { Meta, StoryObj } from '@storybook/react-vite'

// マップスタイル
const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

// 東京中心
const TOKYO_CENTER = { latitude: 35.6812, longitude: 139.7671, zoom: 10 }

// ============================================
// Wrapper Components for Stories
// ============================================

interface RestrictionMapDemoProps {
  initialVisibility?: Partial<LayerVisibility>
  compact?: boolean
  mapStyle?: string
  initialZoom?: number
}

function RestrictionMapDemo({
  initialVisibility,
  compact = false,
  mapStyle = MAP_STYLE,
  initialZoom = 10,
}: RestrictionMapDemoProps) {
  const { visibility, toggleLayer, toggleAllLayers, geoJsonData, isLoading } =
    useRestrictionLayers({
      initialVisibility,
    })

  useKeyboardShortcuts({
    onToggleLayer: toggleLayer,
    onToggleAllLayers: toggleAllLayers,
  })

  return (
    <Box sx={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Map
        initialViewState={{ ...TOKYO_CENTER, zoom: initialZoom }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}>
        <RestrictionMapLayers
          visibility={visibility}
          geoJsonData={geoJsonData}
        />
      </Map>

      {/* レイヤーコントロール */}
      <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <LayerControlPanel
          visibility={visibility}
          onToggleLayer={toggleLayer}
          onToggleAllLayers={toggleAllLayers}
          compact={compact}
        />
      </Box>

      {/* 凡例 */}
      <Box sx={{ position: 'absolute', bottom: 16, left: 16, zIndex: 10 }}>
        <RestrictionLegend visibility={visibility} compact={compact} />
      </Box>

      {/* ローディング表示 */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 10,
          }}>
          <Paper sx={{ p: 1 }}>
            <Typography variant='caption'>データ読み込み中...</Typography>
          </Paper>
        </Box>
      )}
    </Box>
  )
}

function UIComponentsDemo() {
  const [visibility, setVisibility] = useState<LayerVisibility>({
    noFlyZones: true,
    airports: true,
    did: false,
    emergency: false,
    remoteId: false,
    mannedAircraft: false,
    heliports: true,
    radioInterference: false,
  })

  const toggleLayer = (layer: keyof LayerVisibility) => {
    setVisibility((prev) => ({ ...prev, [layer]: !prev[layer] }))
  }

  const toggleAllLayers = () => {
    const allVisible = Object.values(visibility).every((v) => v)
    const newValue = !allVisible
    setVisibility({
      noFlyZones: newValue,
      airports: newValue,
      did: newValue,
      emergency: newValue,
      remoteId: newValue,
      mannedAircraft: newValue,
      heliports: newValue,
      radioInterference: newValue,
    })
  }

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant='h5' gutterBottom>
        UIコンポーネント一覧
      </Typography>

      <Stack spacing={4}>
        {/* LayerControlPanel */}
        <Box>
          <Typography variant='h6' gutterBottom>
            LayerControlPanel
          </Typography>
          <Stack direction='row' spacing={2}>
            <LayerControlPanel
              visibility={visibility}
              onToggleLayer={toggleLayer}
              onToggleAllLayers={toggleAllLayers}
            />
            <LayerControlPanel
              visibility={visibility}
              onToggleLayer={toggleLayer}
              compact
              defaultExpanded={false}
            />
          </Stack>
        </Box>

        {/* RestrictionLegend */}
        <Box>
          <Typography variant='h6' gutterBottom>
            RestrictionLegend
          </Typography>
          <Stack direction='row' spacing={2}>
            <RestrictionLegend visibility={visibility} />
            <RestrictionLegend visibility={visibility} compact />
            <RestrictionLegend visibility={visibility} horizontal />
          </Stack>
        </Box>

        {/* StatusIndicators */}
        <Box>
          <Typography variant='h6' gutterBottom>
            StatusIndicators
          </Typography>
          <Stack spacing={2}>
            <Typography variant='subtitle2'>通常状態</Typography>
            <Stack direction='row' spacing={2}>
              <StatusIndicators
                gpsSignal={85}
                gpsSatellites={12}
                lteSignal={72}
                battery={65}
                agl={85}
                msl={120}
              />
            </Stack>

            <Typography variant='subtitle2'>
              バッテリー警告（30%閾値）
            </Typography>
            <Stack direction='row' spacing={2}>
              <StatusIndicators
                gpsSignal={75}
                gpsSatellites={10}
                lteSignal={60}
                battery={28}
                batteryWarningThreshold={30}
                agl={45}
              />
              <StatusIndicators
                gpsSignal={45}
                lteSignal={30}
                battery={12}
                batteryCriticalThreshold={15}
                agl={25}
              />
            </Stack>

            <Typography variant='subtitle2'>高度警告（低/高）</Typography>
            <Stack direction='row' spacing={2}>
              <StatusIndicators gpsSignal={80} battery={50} agl={5} />
              <StatusIndicators gpsSignal={80} battery={50} agl={180} />
            </Stack>

            <Typography variant='subtitle2'>コンパクトモード</Typography>
            <Stack direction='row' spacing={2}>
              <StatusIndicators
                gpsSignal={85}
                lteSignal={72}
                battery={65}
                agl={100}
                compact
              />
            </Stack>
          </Stack>
        </Box>

        {/* ZoneStatusChip */}
        <Box>
          <Typography variant='h6' gutterBottom>
            ZoneStatusChip
          </Typography>
          <Stack direction='row' spacing={2}>
            <ZoneStatusChip inZone={false} />
            <ZoneStatusChip inZone zoneType='red' zoneName='皇居周辺' />
            <ZoneStatusChip inZone zoneType='yellow' zoneName='官邸周辺' />
            <ZoneStatusChip inZone zoneType='did' zoneName='港区' />
            <ZoneStatusChip inZone zoneType='airport' zoneName='羽田空港' />
          </Stack>
        </Box>
      </Stack>
    </Box>
  )
}

// ============================================
// Storybook Meta
// ============================================

const meta: Meta<typeof RestrictionMapDemo> = {
  title: 'Components/UTM/RestrictionLayers',
  component: RestrictionMapDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## 制限区域レイヤー

ドローン飛行管理用の制限区域レイヤーコンポーネント群です。

### 含まれるコンポーネント

1. **RestrictionMapLayers** - MapLibre用の制限区域レイヤー
2. **LayerControlPanel** - レイヤー表示切り替えUI
3. **RestrictionLegend** - 凡例表示
4. **StatusIndicators** - GPS/LTE状態表示
5. **ZoneStatusChip** - ゾーン判定結果チップ

### レイヤー種類

| レイヤー | 色 | ショートカット |
|---------|-----|----------------|
| 飛行禁止区域（レッド） | 赤 | R |
| 要許可区域（イエロー） | 黄 | R |
| 空港制限区域 | 紫 | A |
| DID | ピンク | D |
| 緊急用務空域 | オレンジ | E |
| リモートID区域 | 薄紫 | I |
| 有人機発着 | 水色 | M |
| ヘリポート | 青 | H |
| 電波干渉区域 | 黄色 | F |

### キーボードショートカット
- 各レイヤーは上記のキーで個別にトグル可能
- **L** キーで全レイヤーを一括トグル
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
}

export default meta
type Story = StoryObj<typeof RestrictionMapDemo>

// ============================================
// Stories
// ============================================

/**
 * 基本的なレイヤー表示
 */
export const Default: Story = {
  render: () => (
    <RestrictionMapDemo
      initialVisibility={{
        noFlyZones: true,
        airports: true,
        heliports: true,
      }}
    />
  ),
}

/**
 * コンパクトモード
 */
export const Compact: Story = {
  render: () => (
    <RestrictionMapDemo
      initialVisibility={{
        noFlyZones: true,
        airports: true,
        heliports: true,
      }}
      compact
    />
  ),
}

/**
 * 全レイヤー表示
 */
export const AllLayers: Story = {
  render: () => (
    <RestrictionMapDemo
      initialVisibility={{
        noFlyZones: true,
        airports: true,
        did: false, // DIDはGeoJSONが必要
        emergency: true,
        remoteId: true,
        mannedAircraft: true,
        heliports: true,
        radioInterference: true,
      }}
      initialZoom={8}
    />
  ),
}

/**
 * UIコンポーネントのみ（マップなし）
 */
export const UIComponentsOnly: Story = {
  render: () => <UIComponentsDemo />,
}
