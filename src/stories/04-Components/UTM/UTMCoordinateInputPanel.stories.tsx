/**
 * UTM座標入力パネル Storybook
 *
 * キーワード検索、Excel取込、地図選択による座標入力の自動化機能をデモ
 */

import { Box, Container, Typography, Paper, Stack, Chip } from '@mui/material'
import { useState } from 'react'

import UTMCoordinateInputPanel from '@/components/utm/UTMCoordinateInputPanel'
import type { CoordinateData } from '@/types/utmTypes'

import type { Meta, StoryObj } from '@storybook/react'

// デモコンポーネント
const UTMCoordinateInputPanelDemo = () => {
  const [coordinates, setCoordinates] = useState<CoordinateData[]>([])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 3,
      }}>
      <Container maxWidth='lg'>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            座標入力自動化パネル
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            曖昧なキーワードから座標を自動取得、Excel取込、地図クリック、手動入力に対応
          </Typography>
          <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
            <Chip
              label='Fuse.js曖昧検索'
              size='small'
              color='primary'
              variant='outlined'
            />
            <Chip
              label='国土地理院API'
              size='small'
              color='info'
              variant='outlined'
            />
            <Chip
              label='MapLibre GL'
              size='small'
              color='success'
              variant='outlined'
            />
            <Chip
              label='ポリゴン外周生成'
              size='small'
              color='warning'
              variant='outlined'
            />
          </Stack>
        </Paper>

        <UTMCoordinateInputPanel
          coordinates={coordinates}
          onCoordinatesChange={setCoordinates}
        />
      </Container>
    </Box>
  )
}

// 初期データありのデモ
const UTMCoordinateInputPanelWithDataDemo = () => {
  const initialCoordinates: CoordinateData[] = [
    {
      latitude: 35.6585805,
      longitude: 139.7454329,
      name: '東京タワー 頂点1',
      type: 'polygon_vertex',
      order: 0,
    },
    {
      latitude: 35.6595805,
      longitude: 139.7454329,
      name: '東京タワー 頂点2',
      type: 'polygon_vertex',
      order: 1,
    },
    {
      latitude: 35.6595805,
      longitude: 139.7464329,
      name: '東京タワー 頂点3',
      type: 'polygon_vertex',
      order: 2,
    },
    {
      latitude: 35.6585805,
      longitude: 139.7464329,
      name: '東京タワー 頂点4',
      type: 'polygon_vertex',
      order: 3,
    },
    {
      latitude: 35.6590805,
      longitude: 139.7459329,
      name: '離陸地点',
      type: 'takeoff',
      order: 4,
    },
    {
      latitude: 35.6590805,
      longitude: 139.7459329,
      name: '着陸地点',
      type: 'landing',
      order: 5,
    },
  ]

  const [coordinates, setCoordinates] =
    useState<CoordinateData[]>(initialCoordinates)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 3,
      }}>
      <Container maxWidth='lg'>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            座標データあり状態
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            東京タワー周辺のポリゴン頂点と離着陸地点が登録済みの状態
          </Typography>
        </Paper>

        <UTMCoordinateInputPanel
          coordinates={coordinates}
          onCoordinatesChange={setCoordinates}
        />
      </Container>
    </Box>
  )
}

// 読み取り専用デモ
const UTMCoordinateInputPanelReadOnlyDemo = () => {
  const initialCoordinates: CoordinateData[] = [
    {
      latitude: 35.5493,
      longitude: 139.7798,
      name: '羽田空港 頂点1',
      type: 'polygon_vertex',
      order: 0,
    },
    {
      latitude: 35.5593,
      longitude: 139.7798,
      name: '羽田空港 頂点2',
      type: 'polygon_vertex',
      order: 1,
    },
    {
      latitude: 35.5593,
      longitude: 139.7898,
      name: '羽田空港 頂点3',
      type: 'polygon_vertex',
      order: 2,
    },
    {
      latitude: 35.5493,
      longitude: 139.7898,
      name: '羽田空港 頂点4',
      type: 'polygon_vertex',
      order: 3,
    },
  ]

  const [coordinates] = useState<CoordinateData[]>(initialCoordinates)

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 3,
      }}>
      <Container maxWidth='lg'>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            読み取り専用モード
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            承認済みの飛行計画など、編集不可の状態での表示
          </Typography>
        </Paper>

        <UTMCoordinateInputPanel
          coordinates={coordinates}
          onCoordinatesChange={() => {}}
          readOnly
        />
      </Container>
    </Box>
  )
}

// Storybook設定
const meta: Meta<typeof UTMCoordinateInputPanelDemo> = {
  title: 'Components/UTM/Workflow/UTMCoordinateInputPanel',
  component: UTMCoordinateInputPanelDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
座標入力自動化パネルは、飛行計画作成時の座標入力を効率化するためのコンポーネントです。

## 機能

### 1. キーワード検索
- **Fuse.js曖昧検索**: 「なりた」「とうきょうたわー」など、ひらがな・部分一致でも検索可能
- **国土地理院API**: 住所・地名から座標を取得
- **ポリゴン外周生成**: ランドマーク選択時に8頂点の外周座標を自動生成

### 2. Excel取込
- NOTAMや飛行計画のExcelファイルから座標を自動抽出
- 10進度、度分秒など様々な形式に対応

### 3. 地図選択
- MapLibre GLによる地図表示
- クリックで座標を追加
- 登録済み座標のマーカー表示

### 4. 手動入力
- 緯度・経度を直接入力

## 使用例

\`\`\`tsx
import UTMCoordinateInputPanel from '@/components/utm/UTMCoordinateInputPanel'

const [coordinates, setCoordinates] = useState<CoordinateData[]>([])

<UTMCoordinateInputPanel
  coordinates={coordinates}
  onCoordinatesChange={setCoordinates}
/>
\`\`\`
        `,
      },
    },
  },
  tags: ['autodocs', 'utm', 'workflow'],
}

export default meta
type Story = StoryObj<typeof UTMCoordinateInputPanelDemo>

// 基本のストーリー
export const Default: Story = {
  name: '基本',
  render: () => <UTMCoordinateInputPanelDemo />,
}

// データあり状態
export const WithData: Story = {
  name: '座標データあり',
  render: () => <UTMCoordinateInputPanelWithDataDemo />,
}

// 読み取り専用
export const ReadOnly: Story = {
  name: '読み取り専用',
  render: () => <UTMCoordinateInputPanelReadOnlyDemo />,
}

// キーワード検索のデモ用説明
export const SearchDemo: Story = {
  name: 'キーワード検索デモ',
  render: () => (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 3,
      }}>
      <Container maxWidth='lg'>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            キーワード検索デモ
          </Typography>
          <Typography variant='body2' color='text.secondary' paragraph>
            以下のキーワードで検索を試してください:
          </Typography>
          <Stack spacing={1}>
            <Typography variant='body2'>
              - 「東京タワー」→ ポリゴン外周（8頂点）を追加
            </Typography>
            <Typography variant='body2'>
              - 「なりた」→ 成田空港（ファジー検索）
            </Typography>
            <Typography variant='body2'>
              - 「はねだ」→ 羽田空港（ひらがな対応）
            </Typography>
            <Typography variant='body2'>
              - 「皇居」→ 皇居外苑（ポリゴン外周対応）
            </Typography>
            <Typography variant='body2'>
              - 「渋谷」→ 渋谷駅（住所検索はGSI APIボタンで）
            </Typography>
          </Stack>
        </Paper>

        <UTMCoordinateInputPanelDemo />
      </Container>
    </Box>
  ),
}

// 制限区域レイヤー付きデモ
const UTMCoordinateInputPanelWithRestrictionLayersDemo = () => {
  const [coordinates, setCoordinates] = useState<CoordinateData[]>([])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        py: 3,
      }}>
      <Container maxWidth='lg'>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant='h5' fontWeight='bold' gutterBottom>
            制限区域レイヤー付き
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            飛行禁止区域、空港空域、ヘリポートなどの制限区域をオーバーレイ表示
          </Typography>
          <Stack direction='row' spacing={1} sx={{ mt: 2 }}>
            <Chip
              label='キーボード: R/A/D/E/I/M/H/F'
              size='small'
              color='secondary'
              variant='outlined'
            />
            <Chip
              label='L: 全レイヤー切替'
              size='small'
              color='warning'
              variant='outlined'
            />
          </Stack>
        </Paper>

        <UTMCoordinateInputPanel
          coordinates={coordinates}
          onCoordinatesChange={setCoordinates}
          showRestrictionLayers
        />
      </Container>
    </Box>
  )
}

// 制限区域レイヤー付き
export const WithRestrictionLayers: Story = {
  name: '制限区域レイヤー付き',
  render: () => <UTMCoordinateInputPanelWithRestrictionLayersDemo />,
}
