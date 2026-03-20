import { ChevronRight as ExpandIcon } from '@mui/icons-material'
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Link } from 'react-router-dom'
import type React from 'react'

import type { MenuItem } from './types'

/**
 * メニューアイテムボタンコンポーネントのProps型定義
 */
interface MenuItemButtonProps {
  /** メニューアイテムデータ */
  item: MenuItem
  /** アクティブ状態 */
  isActive: boolean
  /** サイドバーの開閉状態 */
  isOpen: boolean
  /** サブメニューの有無 */
  hasChildren: boolean
  /** 展開状態 */
  isExpanded: boolean
  /** 閉じるコールバック */
  onClose: () => void
  /** 展開切り替えコールバック */
  onToggleExpanded: (itemId: string) => void
}

/**
 * メニューアイテムボタンコンポーネント
 * サイドバー内の個別メニューアイテムを表示し、クリック処理を管理する
 */
export const MenuItemButton = ({
  item,
  isActive,
  isOpen,
  hasChildren,
  isExpanded,
  onClose,
  onToggleExpanded,
}: MenuItemButtonProps) => {
  // ツールチップはサイドバーが閉じている時（アイコンのみ表示）のみ表示
  const showTooltip = !isOpen
  const tooltipTitle = item.label

  // 共通のListItemButtonスタイル
  const listItemButtonSx = {
    minHeight: 36,
    height: 36,
    px: isOpen ? 2.5 : 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'action.hover',
    },
    '&.Mui-selected': {
      backgroundColor: 'primary.main',
      color: 'primary.contrastText',
      '& .MuiListItemIcon-root': {
        color: 'primary.contrastText',
        '& .MuiSvgIcon-root': {
          color: 'primary.contrastText',
        },
      },
      '&:hover': {
        backgroundColor: 'primary.dark',
      },
    },
  }

  // 共通のListItemIconスタイル
  const listItemIconSx = {
    minWidth: 0,
    mr: isOpen ? 2 : 0,
    justifyContent: 'center',
    display: 'flex',
    alignItems: 'center',
    width: isOpen ? 'auto' : '100%',
    color: 'text.secondary',
    '& .MuiSvgIcon-root': {
      fontSize: '1.25rem',
    },
    '& svg': {
      width: '1.25rem',
      height: '1.25rem',
    },
  }

  const menuButton =
    hasChildren && isOpen ? (
      // hasChildren && isOpen が true のブランチ
      <ListItemButton
        component='div'
        onClick={() => onToggleExpanded(item.id)}
        selected={isActive}
        sx={listItemButtonSx}>
        <ListItemIcon sx={listItemIconSx}>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} />
        <IconButton
          size='small'
          sx={{
            color: 'inherit',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}>
          <ExpandIcon sx={{ fontSize: '1rem' }} />
        </IconButton>
      </ListItemButton>
    ) : (
      // 子メニューなし、または閉じた状態のブランチ
      // 外部リンク（http始まり）は<a>タグ、内部リンクは<Link>を使う
      (() => {
        const isExternal = item.href.startsWith('http')
        const Wrapper = isExternal
          ? ({ children }: { children: React.ReactNode }) => (
              <a
                href={item.href}
                style={{ textDecoration: 'none', color: 'inherit' }}>
                {children}
              </a>
            )
          : ({ children }: { children: React.ReactNode }) => (
              <Link
                to={item.href}
                style={{ textDecoration: 'none', color: 'inherit' }}>
                {children}
              </Link>
            )
        return (
          <Wrapper>
            <ListItemButton
              onClick={onClose}
              selected={isActive}
              sx={listItemButtonSx}>
              <ListItemIcon sx={listItemIconSx}>{item.icon}</ListItemIcon>
              {isOpen && <ListItemText primary={item.label} />}
            </ListItemButton>
          </Wrapper>
        )
      })()
    )

  return (
    <ListItem
      disablePadding
      sx={{ mb: 0.5, backgroundColor: 'transparent', display: 'block' }}>
      {showTooltip ? (
        <Tooltip
          title={tooltipTitle}
          placement='right'
          enterDelay={500}
          leaveDelay={200}>
          {menuButton}
        </Tooltip>
      ) : (
        menuButton
      )}
    </ListItem>
  )
}
