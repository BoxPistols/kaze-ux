import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Avatar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'

import type { AccountMenuItem } from './types'

export type AccountMenuProps = {
  userName?: string
  userEmail?: string
  /** サイドバーの開閉状態 */
  isOpen?: boolean
  menuItems?: AccountMenuItem[]
}

const StyledAccountButton = styled(IconButton)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create(['background-color']),
  '&:hover': {
    transform: 'none !important', // ホバー時のサイズ変更を無効化
  },
}))

export const AccountMenu = ({
  userName = 'ユーザー名',
  userEmail = 'user@example.com',
  menuItems,
  isOpen = true,
}: AccountMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget)

  const handleClose = () => setAnchorEl(null)

  const handleMenuItemClick = (item: AccountMenuItem) => {
    handleClose()
    item.onClick()
  }

  return (
    <Box sx={{ width: '100%' }}>
      <StyledAccountButton
        onClick={handleClick}
        size='small'
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}
        sx={{
          width: '100%',
          justifyContent: isOpen ? 'flex-start' : 'center',
          p: 1,
        }}>
        <Avatar sx={{ width: 32, height: 32 }}>
          {userName.charAt(0).toUpperCase()}
        </Avatar>
        {isOpen && (
          <>
            <Box sx={{ flex: 1, minWidth: 0, ml: 1 }}>
              <Typography
                variant='body2'
                fontWeight='medium'
                noWrap
                color='text.primary'
                sx={{ textAlign: 'left', lineHeight: 1.2 }}>
                {userName}
              </Typography>
              <Typography
                component='p'
                variant='caption'
                noWrap
                color='text.secondary'
                sx={{ textAlign: 'left', lineHeight: 1.2 }}>
                {userEmail}
              </Typography>
            </Box>
            <ExpandMoreIcon
              fontSize='small'
              sx={{
                transition: 'transform 0.2s',
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </>
        )}
      </StyledAccountButton>

      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mb: 1.5,
              '&::before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                bottom: 0,
                ...(isOpen ? { right: 14 } : { left: 14 }),
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
        {menuItems?.map((item) => (
          <MenuItem key={item.id} onClick={() => handleMenuItemClick(item)}>
            <ListItemIcon
              sx={{
                '& .MuiSvgIcon-root': {
                  fontSize: '1.25rem',
                },
                '& svg': {
                  width: '1.25rem',
                  height: '1.25rem',
                },
              }}>
              {item.icon}
            </ListItemIcon>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  )
}
