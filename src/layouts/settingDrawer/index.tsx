import { Drawer } from '@mui/material'
import { Box } from '@mui/material'
import { styled } from '@mui/material/styles'
import type { ReactNode } from 'react'

import { LAYOUT_CONSTANTS, getLayoutValue } from '@/constants/layout'

type SettingDrawerProps = {
  open: boolean
  sideNavWidth: number
  drawerContent?: ReactNode
}

const SettingDrawerStyled = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: getLayoutValue(LAYOUT_CONSTANTS.SETTING_DRAWER.WIDTH),
    position: 'fixed',
    top: getLayoutValue(LAYOUT_CONSTANTS.HEADER.HEIGHT),
    transition: theme.transitions.create(['left'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}))

export const SettingDrawer = ({
  open,
  sideNavWidth,
  drawerContent,
}: SettingDrawerProps) => {
  const leftPosition = sideNavWidth

  return (
    <SettingDrawerStyled
      variant='persistent'
      anchor='left'
      open={open}
      PaperProps={{
        style: { left: getLayoutValue(leftPosition) },
      }}>
      <Box className='p-6'>{drawerContent}</Box>
    </SettingDrawerStyled>
  )
}
