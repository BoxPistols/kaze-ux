// src/components/SettingDrawerWithTrigger.tsx
import ArrowCircleLeftTwoToneIcon from '@mui/icons-material/ArrowCircleLeftTwoTone'
import ArrowCircleRightTwoToneIcon from '@mui/icons-material/ArrowCircleRightTwoTone'
import { Box, useTheme } from '@mui/material'
import type { ReactNode } from 'react'

import { LAYOUT_CONSTANTS } from '@/constants/layout'
import { useSettingDrawerState } from '@/hooks/useSettingDrawerState'

import { SettingDrawer } from './SettingDrawer'

interface SettingDrawerWithTriggerProps {
  sideNavWidth: number
  children: ReactNode
}

export const SettingDrawerWithTrigger = ({
  sideNavWidth,
  children,
}: SettingDrawerWithTriggerProps) => {
  const theme = useTheme()
  const { open: isSettingDrawerOpen, toggleDrawer } = useSettingDrawerState()

  const settingDrawerWidth = LAYOUT_CONSTANTS.SETTING_DRAWER.WIDTH

  const totalDrawerWidth =
    sideNavWidth + (isSettingDrawerOpen ? settingDrawerWidth : 0)

  const iconStyle = {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    borderRadius: '50%',
    width: '40px',
    height: '40px',
  }

  return (
    <>
      <SettingDrawer
        drawerOpen={isSettingDrawerOpen}
        width={settingDrawerWidth}
        left={sideNavWidth}
        top={LAYOUT_CONSTANTS.HEADER.HEIGHT}>
        {children}
      </SettingDrawer>

      <Box
        onClick={toggleDrawer}
        sx={{
          position: 'fixed',
          top: LAYOUT_CONSTANTS.HEADER.HEIGHT + 8,
          left: totalDrawerWidth - 16,
          zIndex: theme.zIndex.drawer + 1,
          cursor: 'pointer',
        }}>
        {isSettingDrawerOpen ? (
          <ArrowCircleLeftTwoToneIcon sx={iconStyle} />
        ) : (
          <ArrowCircleRightTwoToneIcon sx={iconStyle} />
        )}
      </Box>
    </>
  )
}

// totalDrawerWidth を取得する関数（カスタムフックの代替）
export const useTotalDrawerWidth = (sideNavWidth: number) => {
  const { open: isSettingDrawerOpen } = useSettingDrawerState()
  const settingDrawerWidth = LAYOUT_CONSTANTS.SETTING_DRAWER.WIDTH
  return sideNavWidth + (isSettingDrawerOpen ? settingDrawerWidth : 0)
}
