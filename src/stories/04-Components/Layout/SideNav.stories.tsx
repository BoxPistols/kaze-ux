import { Box } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { action } from 'storybook/actions'

import { LAYOUT_CONSTANTS } from '@/constants/layout'
import { Header } from '@/layouts/header'
import { SideNav } from '@/layouts/sideNav'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof SideNav> = {
  title: 'Components/Layout/SideNav',
  component: SideNav,
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    noPadding: true,
    blockLinks: true,
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Box sx={{ display: 'flex', height: '100vh', position: 'relative' }}>
          <Header toggleDrawer={action('toggleDrawer')} open={false} />
          <Box
            sx={{
              mt: `${LAYOUT_CONSTANTS.HEADER.HEIGHT}px`,
              display: 'flex',
              flex: 1,
            }}>
            <Story />
          </Box>
        </Box>
      </BrowserRouter>
    ),
  ],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'サイドナビゲーションの開閉状態',
    },
    width: {
      control: { type: 'number', min: 40, max: 300, step: 10 },
      description: 'サイドナビゲーションの幅（ピクセル）',
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Closed: Story = {
  args: {
    open: false,
    width: LAYOUT_CONSTANTS.SIDEBAR.WIDTH_CLOSED,
  },
}

export const Open: Story = {
  args: {
    open: true,
    width: LAYOUT_CONSTANTS.SIDEBAR.WIDTH_OPENED,
  },
}

export const WideNav: Story = {
  args: {
    open: true,
    width: 240,
  },
}
