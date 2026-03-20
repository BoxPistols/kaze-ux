/**
 * アプリ切替ポップオーバーメニュー
 * 全アプリ共通で使える「アプリスイッチャー」
 */
import AirIcon from '@mui/icons-material/Air'
import AppsIcon from '@mui/icons-material/Apps'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import { Box, Chip, Popover, Typography } from '@mui/material'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { IconButton } from '@/components/ui/icon-button'
import { APP_LINKS } from '@/utils/appLinks'

type AppEntry = {
  id: string
  label: string
  desc: string
  icon: ReactNode
  getUrl: () => string
}

const APP_LIST: AppEntry[] = [
  {
    id: 'top',
    label: 'Kaze Design System',
    desc: 'トップページ',
    icon: <AirIcon />,
    getUrl: APP_LINKS.top,
  },
  {
    id: 'storybook',
    label: 'Storybook',
    desc: 'コンポーネント',
    icon: <AutoStoriesIcon />,
    getUrl: APP_LINKS.storybook,
  },
  {
    id: 'logistics',
    label: 'KazeLogistics',
    desc: '配送監視',
    icon: <LocalShippingIcon />,
    getUrl: APP_LINKS.skyKaze,
  },
  {
    id: 'ubereats',
    label: 'KazeEats',
    desc: 'フードデリバリー',
    icon: <RestaurantIcon />,
    getUrl: APP_LINKS.ubereats,
  },
  {
    id: 'saas',
    label: 'Kaze Dashboard',
    desc: 'SaaS管理',
    icon: <DashboardIcon />,
    getUrl: APP_LINKS.saas,
  },
]

type AppSwitcherProps = {
  /** 現在のアプリID */
  currentApp: string
}

export const AppSwitcher = ({ currentApp }: AppSwitcherProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const open = Boolean(anchorEl)

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleNavigate = (getUrl: () => string) => {
    handleClose()
    window.open(getUrl(), '_blank')
  }

  return (
    <>
      <IconButton
        onClick={handleOpen}
        tooltip='アプリ切替'
        aria-label='アプリ切替メニューを開く'
        size='small'
        sx={{ color: 'text.secondary' }}>
        <AppsIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              mt: 1,
              minWidth: 280,
              maxWidth: 340,
              boxShadow: 6,
            },
          },
        }}>
        <Box sx={{ p: 1.5 }}>
          <Typography
            sx={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'text.secondary',
              px: 1,
              pb: 1,
            }}>
            アプリ一覧
          </Typography>

          {APP_LIST.map((app) => {
            const isCurrent = app.id === currentApp
            return (
              <Box
                key={app.id}
                onClick={() => {
                  if (!isCurrent) handleNavigate(app.getUrl)
                }}
                role='button'
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (!isCurrent && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    handleNavigate(app.getUrl)
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: 1.5,
                  cursor: isCurrent ? 'default' : 'pointer',
                  bgcolor: isCurrent ? 'action.selected' : 'transparent',
                  '&:hover': {
                    bgcolor: isCurrent ? 'action.selected' : 'action.hover',
                  },
                  transition: 'background-color 0.15s ease',
                }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    bgcolor: isCurrent ? 'primary.main' : 'action.hover',
                    color: isCurrent
                      ? 'primary.contrastText'
                      : 'text.secondary',
                    flexShrink: 0,
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                  }}>
                  {app.icon}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      sx={{
                        fontSize: '14px',
                        fontWeight: isCurrent ? 700 : 500,
                        color: 'text.primary',
                        lineHeight: 1.3,
                      }}>
                      {app.label}
                    </Typography>
                    {isCurrent && (
                      <Chip
                        label='現在'
                        size='small'
                        color='primary'
                        sx={{
                          height: 20,
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '13px',
                      color: 'text.secondary',
                      lineHeight: 1.3,
                    }}>
                    {app.desc}
                  </Typography>
                </Box>
              </Box>
            )
          })}
        </Box>
      </Popover>
    </>
  )
}
