import DevicesIcon from '@mui/icons-material/Devices'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import { Box, Typography } from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Components/UI/Icon',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'MUI標準アイコンコンポーネントの使用例。SvgIconベースでサイズ、カラーに対応。',
      },
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ p: 3 }}>
        <Story />
      </Box>
    ),
  ],
}

export default meta

export const Default: StoryObj = {
  render: () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography variant='subtitle2' gutterBottom>
          DevicesIcon
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DevicesIcon sx={{ fontSize: 32 }} />
          <DevicesIcon sx={{ fontSize: 32 }} color='primary' />
          <DevicesIcon sx={{ fontSize: 32 }} color='secondary' />
        </Box>
      </Box>
      <Box>
        <Typography variant='subtitle2' gutterBottom>
          PersonIcon
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <PersonIcon sx={{ fontSize: 32 }} />
          <PersonIcon sx={{ fontSize: 32 }} color='primary' />
          <PersonIcon sx={{ fontSize: 32 }} color='secondary' />
        </Box>
      </Box>
      <Box>
        <Typography variant='subtitle2' gutterBottom>
          SettingsIcon
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 32 }} />
          <SettingsIcon sx={{ fontSize: 32 }} color='primary' />
          <SettingsIcon sx={{ fontSize: 32 }} color='secondary' />
        </Box>
      </Box>
    </Box>
  ),
}
