import { MoreHoriz } from '@mui/icons-material'
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material'
import { useState, type ReactNode, type MouseEvent } from 'react'

export interface ActionMenuItem {
  /** メニューアイテムのID */
  id: string
  /** 表示ラベル */
  label: string
  /** アイコン（オプション） */
  icon?: ReactNode
  /** クリック時のコールバック */
  onClick: () => void
  /** 無効化状態 */
  disabled?: boolean
  /** 危険なアクション（削除など）- 赤色で表示 */
  danger?: boolean
  /** 区切り線を表示（このアイテムの後に） */
  divider?: boolean
}

export interface ActionMenuProps {
  /** メニューアイテム配列 */
  items: ActionMenuItem[]
  /** カスタムアイコン */
  icon?: ReactNode
  /** ボタンサイズ */
  size?: 'small' | 'medium' | 'large'
  /** 無効化状態 */
  disabled?: boolean
  /** aria-label */
  ariaLabel?: string
}

/**
 * アクションメニューコンポーネント
 * 三点メニュー（MoreHoriz）をクリックして操作メニューを表示
 */
export const ActionMenu = ({
  items,
  icon,
  size = 'small',
  disabled = false,
  ariaLabel = '操作メニュー',
}: ActionMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleItemClick = (item: ActionMenuItem) => {
    handleClose()
    item.onClick()
  }

  return (
    <>
      <IconButton
        size={size}
        onClick={handleClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-controls={open ? 'action-menu' : undefined}
        aria-haspopup='true'
        aria-expanded={open ? 'true' : undefined}>
        {icon || <MoreHoriz />}
      </IconButton>
      <Menu
        id='action-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}>
        {items.map((item) => (
          <div key={item.id}>
            <MenuItem
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              sx={{
                color: item.danger ? 'error.main' : 'inherit',
              }}>
              {item.icon && (
                <ListItemIcon sx={{ color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
              )}
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
            {item.divider && <Divider />}
          </div>
        ))}
      </Menu>
    </>
  )
}
