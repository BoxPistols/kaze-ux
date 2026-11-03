import { styled } from '@mui/material'
import {
  // useTheme,
  type CSSObject,
  AppBar as MuiAppBar,
  Drawer as MuiDrawer,
  type Theme,
} from '@mui/material'
import type React from 'react'

import { getLayoutValue } from '@/constants/layout'
import { LAYOUT_CONSTANTS } from '@/constants/layout'

import type { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar'

const drawerWidth = getLayoutValue(LAYOUT_CONSTANTS.SIDEBAR.WIDTH_OPENED)

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  // transition: 'none', // アニメーションを無効化
  overflowX: 'hidden',
})

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  // transition: 'none', // アニメーションを無効化
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7 * 2)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8 * 2)} + 1px)`,
  },
})

// AppBar
export const AppBar: React.ComponentType<AppBarProps> = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

// Drawer
interface DrawerProps {
  open?: boolean
  theme?: Theme
}

export const Drawer: React.ComponentType<DrawerProps> = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open',
})<DrawerProps>(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}))

// DrawerHeader
export const DrawerHeader: React.ComponentType = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 0),
  ...theme.mixins.toolbar,
}))
