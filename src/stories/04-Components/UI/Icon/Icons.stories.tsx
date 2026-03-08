import { Box, Typography } from '@mui/material'

import { DroneIcon } from '@/components/ui/icon/droneIcon'
import { FixedCameraIcon } from '@/components/ui/icon/fixedCameraIcon'
import { ProjectRoleIcon } from '@/components/ui/icon/projectRoleIcon'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta = {
  title: 'Components/UI/Icon',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'カスタムSVGアイコンコンポーネント。DroneIcon、FixedCameraIcon、ProjectRoleIconを提供。MUI SvgIconベースでサイズ、カラー、バリアントに対応。',
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
          DroneIcon
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <DroneIcon sx={{ fontSize: 32 }} />
          <DroneIcon variant='outlined' sx={{ fontSize: 32 }} />
        </Box>
      </Box>
      <Box>
        <Typography variant='subtitle2' gutterBottom>
          FixedCameraIcon
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FixedCameraIcon sx={{ fontSize: 32 }} />
          <FixedCameraIcon variant='outlined' sx={{ fontSize: 32 }} />
        </Box>
      </Box>
      <Box>
        <Typography variant='subtitle2' gutterBottom>
          ProjectRoleIcon
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ProjectRoleIcon isAdmin={true} />
          <ProjectRoleIcon isAdmin={false} />
        </Box>
      </Box>
    </Box>
  ),
}
