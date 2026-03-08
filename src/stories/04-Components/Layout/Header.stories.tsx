import { Box } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'

import { LAYOUT_CONSTANTS } from '@/constants/layout'
import { Header } from '@/layouts/header'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof Header> = {
  title: 'Components/Layout/Header',
  component: Header,
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    noPadding: true,
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Box sx={{ height: '100vh' }}>
          <Story />
          <Box
            sx={{
              height: `calc(100vh - ${LAYOUT_CONSTANTS.HEADER.HEIGHT}px)`,
              mt: `${LAYOUT_CONSTANTS.HEADER.HEIGHT}px`,
              bgcolor: 'background.default',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
              border: '1px dashed',
              borderColor: 'divider',
            }}>
            コンテンツエリア
          </Box>
        </Box>
      </BrowserRouter>
    ),
  ],
  argTypes: {
    toggleDrawer: { action: 'toggleDrawer clicked' },
    open: {
      control: 'boolean',
      description: 'ドロワーの開閉状態（矢印の向きに影響）',
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const DrawerClosed: Story = {
  args: {
    open: false,
  },
}

export const DrawerOpen: Story = {
  args: {
    open: true,
  },
}
