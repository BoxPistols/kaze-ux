import { Box } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import { action } from 'storybook/actions'

import { LAYOUT_CONSTANTS } from '@/constants/layout'
import { Header } from '@/layouts/header'
import { SideNav } from '@/layouts/sideNav'

import type { Meta, StoryObj } from '@storybook/react-vite'

interface LayoutDemoProps {
  open?: boolean
  onToggle?: () => void
  sideNavWidth?: number
  children?: React.ReactNode
}

const LayoutDemo = ({
  open = false,
  onToggle,
  sideNavWidth = LAYOUT_CONSTANTS.SIDEBAR.WIDTH_CLOSED,
  children,
}: LayoutDemoProps) => {
  const handleToggle = onToggle || action('toggleDrawer')

  return (
    <Box sx={{ display: 'flex' }}>
      <Header toggleDrawer={handleToggle} open={open} />
      <SideNav open={open} width={sideNavWidth} />
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: open ? '32px' : 0,
          marginTop: `${LAYOUT_CONSTANTS.HEADER.HEIGHT}px`,
          transition: 'margin-left 0.3s',
          height: `calc(100vh - ${LAYOUT_CONSTANTS.HEADER.HEIGHT}px)`,
          overflow: 'auto',
        }}>
        {children || (
          <Box
            sx={{
              p: 3,
              ml: `${sideNavWidth}px`,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              minHeight: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}>
            メインコンテンツエリア
          </Box>
        )}
      </Box>
    </Box>
  )
}

const meta: Meta<typeof LayoutDemo> = {
  title: 'Components/Layout/Layout',
  component: LayoutDemo,
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    noPadding: true,
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'サイドナビゲーションの開閉状態',
    },
    onToggle: { action: 'toggled' },
    sideNavWidth: {
      control: { type: 'number', min: 64, max: 300, step: 8 },
      description: 'サイドナビゲーションの幅',
    },
  },
}

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    open: false,
    sideNavWidth: LAYOUT_CONSTANTS.SIDEBAR.WIDTH_CLOSED,
  },
}

export const OpenNav: Story = {
  args: {
    open: true,
    sideNavWidth: LAYOUT_CONSTANTS.SIDEBAR.WIDTH_OPENED,
  },
}

export const WithContent: Story = {
  args: {
    open: true,
    sideNavWidth: LAYOUT_CONSTANTS.SIDEBAR.WIDTH_OPENED,
  },
  render: (args) => (
    <LayoutDemo {...args}>
      <Box sx={{ p: 3, pl: `${LAYOUT_CONSTANTS.SIDEBAR.WIDTH_OPENED}px` }}>
        <p>
          このエリアにアプリケーションのメインコンテンツが表示されます。
          サイドナビゲーションのオープン/クローズ状態により、
          表示領域の幅が調整されます。
        </p>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 3,
            mt: 3,
          }}>
          {[1, 2, 3, 4].map((item) => (
            <Box
              key={item}
              sx={{
                bgcolor: 'background.paper',
                p: 3,
                borderRadius: 1,
                boxShadow: 1,
                minHeight: 160,
                color: 'text.secondary',
              }}>
              カード {item}
            </Box>
          ))}
        </Box>
      </Box>
    </LayoutDemo>
  ),
}
