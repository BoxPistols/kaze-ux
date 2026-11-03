import { Box, Tab, Tabs, Typography } from '@mui/material'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode
  value: number
  index: number
}) {
  if (value !== index) return null

  return (
    <Box role='tabpanel' sx={{ p: 3 }}>
      {children}
    </Box>
  )
}

const meta: Meta<typeof Tabs> = {
  title: 'Components/UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['standard', 'scrollable', 'fullWidth'],
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    textColor: {
      control: 'select',
      options: ['primary', 'secondary', 'inherit'],
    },
    indicatorColor: {
      control: 'select',
      options: ['primary', 'secondary'],
    },
    centered: { control: 'boolean' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const DefaultDemo = () => {
      const [value, setValue] = useState(0)

      return (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={(_event, newValue: number) => setValue(newValue)}
              aria-label='基本タブ'>
              <Tab label='ホーム' />
              <Tab label='設定' />
              <Tab label='プロフィール' />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <Typography>ホームタブのコンテンツです。</Typography>
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Typography>設定タブのコンテンツです。</Typography>
          </TabPanel>
          <TabPanel value={value} index={2}>
            <Typography>プロフィールタブのコンテンツです。</Typography>
          </TabPanel>
        </Box>
      )
    }
    return <DefaultDemo />
  },
}
