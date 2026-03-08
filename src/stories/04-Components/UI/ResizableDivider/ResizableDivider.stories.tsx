import { Box, Paper, Typography } from '@mui/material'
import { useState } from 'react'

import { ResizableDivider } from '@/components/ui/ResizableDivider'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof ResizableDivider> = {
  title: 'Components/UI/ResizableDivider',
  component: ResizableDivider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'ドラッグでパネル幅を調整できるリサイズ用ディバイダー。水平/垂直方向に対応し、最小/最大幅の制約を設定可能。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: 'radio',
      options: ['vertical', 'horizontal'],
      description: 'ディバイダーの方向',
    },
    onResize: { action: 'resized' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

/**
 * パネルの共通コンテンツ
 */
const PanelContent = ({ label, size }: { label: string; size: number }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      flexDirection: 'column',
      gap: 1,
    }}>
    <Typography variant='subtitle2' color='text.secondary'>
      {label}
    </Typography>
    <Typography variant='h6' color='text.primary'>
      {Math.round(size)}px
    </Typography>
  </Box>
)

// --- 垂直方向リサイズのデモコンポーネント ---

const VerticalDemo = () => {
  const [leftWidth, setLeftWidth] = useState(300)
  const minWidth = 100
  const maxWidth = 500

  const handleResize = (delta: number) => {
    setLeftWidth((prev) => {
      const next = prev - delta
      return Math.max(minWidth, Math.min(maxWidth, next))
    })
  }

  return (
    <Paper
      variant='outlined'
      sx={{
        display: 'flex',
        height: 300,
        overflow: 'hidden',
      }}>
      {/* 左パネル */}
      <Box
        sx={{
          width: leftWidth,
          flexShrink: 0,
          bgcolor: 'action.hover',
        }}>
        <PanelContent label='左パネル' size={leftWidth} />
      </Box>

      <ResizableDivider onResize={handleResize} orientation='vertical' />

      {/* 右パネル */}
      <Box
        sx={{
          flex: 1,
          bgcolor: 'background.default',
        }}>
        <PanelContent label='右パネル（自動調整）' size={0} />
      </Box>
    </Paper>
  )
}

/**
 * 垂直方向のリサイズ
 *
 * 左右に並んだ2つのパネルの間に垂直ディバイダーを配置し、
 * ドラッグで幅を調整できるデモです。
 */
export const Vertical: Story = {
  render: () => <VerticalDemo />,
}

// --- 水平方向リサイズのデモコンポーネント ---

const HorizontalDemo = () => {
  const [topHeight, setTopHeight] = useState(150)
  const minHeight = 60
  const maxHeight = 340

  const handleResize = (delta: number) => {
    setTopHeight((prev) => {
      const next = prev - delta
      return Math.max(minHeight, Math.min(maxHeight, next))
    })
  }

  return (
    <Paper
      variant='outlined'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 400,
        overflow: 'hidden',
      }}>
      {/* 上パネル */}
      <Box
        sx={{
          height: topHeight,
          flexShrink: 0,
          bgcolor: 'action.hover',
        }}>
        <PanelContent label='上パネル' size={topHeight} />
      </Box>

      <ResizableDivider onResize={handleResize} orientation='horizontal' />

      {/* 下パネル */}
      <Box
        sx={{
          flex: 1,
          bgcolor: 'background.default',
        }}>
        <PanelContent label='下パネル（自動調整）' size={0} />
      </Box>
    </Paper>
  )
}

/**
 * 水平方向のリサイズ
 *
 * 上下に重ねた2つのパネルの間に水平ディバイダーを配置し、
 * ドラッグで高さを調整できるデモです。
 */
export const Horizontal: Story = {
  render: () => <HorizontalDemo />,
}

// --- 両方向リサイズのデモコンポーネント ---

const BothDirectionsDemo = () => {
  const [leftWidth, setLeftWidth] = useState(240)
  const [topHeight, setTopHeight] = useState(160)

  const handleHorizontalResize = (delta: number) => {
    setLeftWidth((prev) => Math.max(120, Math.min(400, prev - delta)))
  }

  const handleVerticalResize = (delta: number) => {
    setTopHeight((prev) => Math.max(60, Math.min(300, prev - delta)))
  }

  return (
    <Paper
      variant='outlined'
      sx={{
        display: 'flex',
        height: 400,
        overflow: 'hidden',
      }}>
      {/* 左パネル */}
      <Box
        sx={{
          width: leftWidth,
          flexShrink: 0,
          bgcolor: 'action.hover',
        }}>
        <PanelContent label='左パネル' size={leftWidth} />
      </Box>

      {/* 垂直ディバイダー（左右分割） */}
      <ResizableDivider
        onResize={handleHorizontalResize}
        orientation='vertical'
      />

      {/* 右側: 上下分割 */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
        {/* 右上パネル */}
        <Box
          sx={{
            height: topHeight,
            flexShrink: 0,
            bgcolor: 'background.default',
          }}>
          <PanelContent label='右上パネル' size={topHeight} />
        </Box>

        {/* 水平ディバイダー（上下分割） */}
        <ResizableDivider
          onResize={handleVerticalResize}
          orientation='horizontal'
        />

        {/* 右下パネル */}
        <Box
          sx={{
            flex: 1,
            bgcolor: 'action.selected',
          }}>
          <PanelContent label='右下パネル（自動調整）' size={0} />
        </Box>
      </Box>
    </Paper>
  )
}

/**
 * 両方向のリサイズ
 *
 * 垂直ディバイダーで左右を分割し、さらに右側を水平ディバイダーで上下に分割した
 * 複合レイアウトのデモです。両方の方向でリサイズが可能です。
 */
export const BothDirections: Story = {
  render: () => <BothDirectionsDemo />,
}
