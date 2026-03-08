import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ContentCutIcon from '@mui/icons-material/ContentCut'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import ShareIcon from '@mui/icons-material/Share'
import {
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * MUIテーマでカスタマイズされたMenuコンポーネント。
 *
 * テーマ設定:
 * - Paper: borderRadius 6, boxShadow '0 4px 20px rgba(0,0,0,0.15)', border divider
 * - MenuItem: fontSize sm, padding '8px 16px', hover action.hover
 */
const meta: Meta<typeof Menu> = {
  title: 'Components/UI/Menu/Menu',
  component: Menu,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'MUI Menuコンポーネント。Paper borderRadius、boxShadow、MenuItemのフォントサイズ・パディングがテーマでカスタマイズされている。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: { control: 'boolean', description: 'メニューの開閉状態' },
    anchorOrigin: {
      control: 'object',
      description: 'アンカー位置',
    },
    transformOrigin: {
      control: 'object',
      description: '変換起点',
    },
  },
}

export default meta

// useMenu フック的パターン
const useMenuState = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  return { anchorEl, open, handleClick, handleClose }
}

// --- 基本 ---

const BasicContent = () => {
  const menu = useMenuState()

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        基本メニュー
      </Typography>

      <Paper variant='outlined' sx={{ p: 4, borderRadius: 2 }}>
        <Button variant='outlined' onClick={menu.handleClick}>
          メニューを開く
        </Button>
        <Menu
          anchorEl={menu.anchorEl}
          open={menu.open}
          onClose={menu.handleClose}>
          <MenuItem onClick={menu.handleClose}>フライト一覧</MenuItem>
          <MenuItem onClick={menu.handleClose}>機体管理</MenuItem>
          <MenuItem onClick={menu.handleClose}>レポート</MenuItem>
          <MenuItem onClick={menu.handleClose}>設定</MenuItem>
        </Menu>
      </Paper>
    </Box>
  )
}

export const Basic: StoryObj = {
  name: '基本',
  render: () => <BasicContent />,
}

// --- アイコン付き ---

const WithIconsContent = () => {
  const menu = useMenuState()

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        アイコン付きメニュー
      </Typography>

      <Paper variant='outlined' sx={{ p: 4, borderRadius: 2 }}>
        <IconButton onClick={menu.handleClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={menu.anchorEl}
          open={menu.open}
          onClose={menu.handleClose}>
          <MenuItem onClick={menu.handleClose}>
            <ListItemIcon>
              <EditIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>編集</ListItemText>
          </MenuItem>
          <MenuItem onClick={menu.handleClose}>
            <ListItemIcon>
              <ContentCopyIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>複製</ListItemText>
          </MenuItem>
          <MenuItem onClick={menu.handleClose}>
            <ListItemIcon>
              <ShareIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>共有</ListItemText>
          </MenuItem>
          <MenuItem onClick={menu.handleClose}>
            <ListItemIcon>
              <FileDownloadIcon fontSize='small' />
            </ListItemIcon>
            <ListItemText>エクスポート</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={menu.handleClose} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize='small' color='error' />
            </ListItemIcon>
            <ListItemText>削除</ListItemText>
          </MenuItem>
        </Menu>
      </Paper>
    </Box>
  )
}

export const WithIcons: StoryObj = {
  name: 'アイコン付き',
  render: () => <WithIconsContent />,
}

// テーブル行メニューコンポーネント（Hooks違反回避）
const TableRowMenu = ({ name }: { name: string }) => {
  const rowMenu = useMenuState()
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 2,
        py: 1.5,
      }}>
      <Typography variant='body2'>{name}</Typography>
      <IconButton size='small' onClick={rowMenu.handleClick}>
        <MoreVertIcon fontSize='small' />
      </IconButton>
      <Menu
        anchorEl={rowMenu.anchorEl}
        open={rowMenu.open}
        onClose={rowMenu.handleClose}>
        <MenuItem onClick={rowMenu.handleClose}>詳細</MenuItem>
        <MenuItem onClick={rowMenu.handleClose}>編集</MenuItem>
        <MenuItem onClick={rowMenu.handleClose}>複製</MenuItem>
        <Divider />
        <MenuItem onClick={rowMenu.handleClose} sx={{ color: 'error.main' }}>
          削除
        </MenuItem>
      </Menu>
    </Box>
  )
}

// --- 実用パターン ---

const PracticalContent = () => {
  const editMenu = useMenuState()
  const contextMenu = useMenuState()

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        実用パターン
      </Typography>

      <Grid container spacing={3}>
        {/* 編集メニュー */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
              編集メニュー
            </Typography>
            <Button
              variant='outlined'
              size='small'
              onClick={editMenu.handleClick}>
              編集
            </Button>
            <Menu
              anchorEl={editMenu.anchorEl}
              open={editMenu.open}
              onClose={editMenu.handleClose}>
              <MenuItem onClick={editMenu.handleClose}>
                <ListItemIcon>
                  <ContentCutIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>切り取り</ListItemText>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ ml: 2 }}>
                  Ctrl+X
                </Typography>
              </MenuItem>
              <MenuItem onClick={editMenu.handleClose}>
                <ListItemIcon>
                  <ContentCopyIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>コピー</ListItemText>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ ml: 2 }}>
                  Ctrl+C
                </Typography>
              </MenuItem>
              <MenuItem onClick={editMenu.handleClose}>
                <ListItemIcon>
                  <ContentPasteIcon fontSize='small' />
                </ListItemIcon>
                <ListItemText>貼り付け</ListItemText>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ ml: 2 }}>
                  Ctrl+V
                </Typography>
              </MenuItem>
            </Menu>
          </Paper>
        </Grid>

        {/* ユーザーアクション */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
              ユーザーメニュー
            </Typography>
            <Button variant='text' onClick={contextMenu.handleClick}>
              アカウント設定
            </Button>
            <Menu
              anchorEl={contextMenu.anchorEl}
              open={contextMenu.open}
              onClose={contextMenu.handleClose}>
              <MenuItem onClick={contextMenu.handleClose}>
                <ListItemIcon>
                  <PersonAddIcon fontSize='small' />
                </ListItemIcon>
                メンバーを招待
              </MenuItem>
              <MenuItem onClick={contextMenu.handleClose}>
                プロフィール編集
              </MenuItem>
              <MenuItem onClick={contextMenu.handleClose}>通知設定</MenuItem>
              <Divider />
              <MenuItem onClick={contextMenu.handleClose}>ログアウト</MenuItem>
            </Menu>
          </Paper>
        </Grid>

        {/* テーブル行メニュー */}
        <Grid size={{ xs: 12 }}>
          <Paper variant='outlined' sx={{ borderRadius: 2 }}>
            <Typography
              variant='body2'
              sx={{
                fontWeight: 600,
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
              }}>
              テーブル行のコンテキストメニュー
            </Typography>
            <Stack divider={<Divider />}>
              <TableRowMenu name='FL-001 東京湾岸調査' />
              <TableRowMenu name='FL-002 河川敷点検' />
              <TableRowMenu name='FL-003 農地モニタリング' />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export const PracticalPatterns: StoryObj = {
  name: '実用パターン',
  render: () => <PracticalContent />,
}
