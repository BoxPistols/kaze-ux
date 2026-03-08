import AssignmentIcon from '@mui/icons-material/Assignment'
import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import FolderIcon from '@mui/icons-material/Folder'
import InboxIcon from '@mui/icons-material/Inbox'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import StarIcon from '@mui/icons-material/Star'
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Stack,
  Switch,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * MUIテーマでカスタマイズされたListコンポーネント。
 *
 * ListItemButton:
 * - hover: action.hover
 * - selected: primary.main背景 + contrastText色
 * - ListItemIcon: text.secondary、minWidth 40
 */
const meta: Meta<typeof List> = {
  title: 'Components/UI/List',
  component: List,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    dense: { control: 'boolean', description: 'コンパクト表示' },
    disablePadding: { control: 'boolean', description: 'パディングを無効化' },
  },
}

export default meta

// --- 基本リスト ---

const BasicContent = () => (
  <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
    <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
      基本リスト
    </Typography>

    <Grid container spacing={4}>
      {/* テキストのみ */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper variant='outlined' sx={{ borderRadius: 2 }}>
          <Typography
            variant='caption'
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              display: 'block',
              p: 2,
              pb: 0,
            }}>
            テキストのみ
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary='プラン一覧' />
            </ListItem>
            <ListItem>
              <ListItemText primary='デバイス管理' />
            </ListItem>
            <ListItem>
              <ListItemText
                primary='レポート'
                secondary='最終更新: 2024-01-15'
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>

      {/* アイコン付き */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper variant='outlined' sx={{ borderRadius: 2 }}>
          <Typography
            variant='caption'
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              display: 'block',
              p: 2,
              pb: 0,
            }}>
            アイコン付き
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary='受信トレイ' />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <StarIcon />
              </ListItemIcon>
              <ListItemText primary='お気に入り' />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <FolderIcon />
              </ListItemIcon>
              <ListItemText primary='アーカイブ' />
            </ListItem>
          </List>
        </Paper>
      </Grid>

      {/* アバター付き */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper variant='outlined' sx={{ borderRadius: 2 }}>
          <Typography
            variant='caption'
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              display: 'block',
              p: 2,
              pb: 0,
            }}>
            アバター付き
          </Typography>
          <List>
            {[
              { name: '田中太郎', role: 'オペレーター', initial: 'T' },
              { name: '鈴木花子', role: 'オペレーター', initial: 'S' },
              { name: '佐藤次郎', role: 'マネージャー', initial: 'J' },
            ].map((user) => (
              <ListItem key={user.name}>
                <ListItemAvatar>
                  <Avatar>{user.initial}</Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} secondary={user.role} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  </Box>
)

export const Basic: StoryObj = {
  name: '基本リスト',
  render: () => <BasicContent />,
}

// --- インタラクティブリスト ---

const InteractiveContent = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const menuItems = [
    { icon: <AssignmentIcon />, label: 'タスク管理', badge: 3 },
    { icon: <PersonIcon />, label: 'メンバー一覧', badge: 0 },
    { icon: <BatteryFullIcon />, label: 'デバイスステータス', badge: 1 },
    { icon: <SettingsIcon />, label: '設定', badge: 0 },
  ]

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        インタラクティブリスト
      </Typography>

      <Grid container spacing={4}>
        {/* 選択可能 */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                ナビゲーション（選択状態）
              </Typography>
            </Box>
            <List disablePadding>
              {menuItems.map((item, index) => (
                <ListItemButton
                  key={item.label}
                  selected={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                  {item.badge > 0 && (
                    <Chip label={item.badge} size='small' color='primary' />
                  )}
                </ListItemButton>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* セカンダリアクション */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ borderRadius: 2 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant='body2' sx={{ fontWeight: 600 }}>
                セカンダリアクション
              </Typography>
            </Box>
            <List disablePadding>
              {[
                { name: 'Device-Alpha', status: '稼働中' },
                { name: 'Device-Beta', status: '待機中' },
                { name: 'Device-Gamma', status: 'メンテナンス' },
              ].map((device) => (
                <ListItem
                  key={device.name}
                  secondaryAction={
                    <Stack direction='row' spacing={0.5}>
                      <IconButton size='small' aria-label='編集'>
                        <EditIcon fontSize='small' />
                      </IconButton>
                      <IconButton size='small' aria-label='削除'>
                        <DeleteIcon fontSize='small' />
                      </IconButton>
                    </Stack>
                  }>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor:
                          device.status === '稼働中'
                            ? 'success.main'
                            : device.status === '待機中'
                              ? 'info.main'
                              : 'warning.main',
                      }}>
                      <AssignmentIcon fontSize='small' />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={device.name}
                    secondary={device.status}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export const Interactive: StoryObj = {
  name: 'インタラクティブ',
  render: () => <InteractiveContent />,
}

// --- 設定リスト ---

const SettingsContent = () => {
  const [settings, setSettings] = useState({
    autoRun: true,
    geoFence: true,
    weatherAlert: false,
    darkMode: false,
  })

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        設定リスト
      </Typography>

      <Paper variant='outlined' sx={{ borderRadius: 2 }}>
        <List disablePadding>
          <ListItem>
            <ListItemText
              primary='自動実行モード'
              secondary='スケジュールに基づく自動実行を有効化'
            />
            <ListItemSecondaryAction>
              <Switch
                edge='end'
                checked={settings.autoRun}
                onChange={() => handleToggle('autoRun')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider component='li' />
          <ListItem>
            <ListItemText
              primary='ジオフェンス'
              secondary='制限区域の境界警告を有効化'
            />
            <ListItemSecondaryAction>
              <Switch
                edge='end'
                checked={settings.geoFence}
                onChange={() => handleToggle('geoFence')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider component='li' />
          <ListItem>
            <ListItemText
              primary='気象アラート'
              secondary='悪天候時の自動通知を有効化'
            />
            <ListItemSecondaryAction>
              <Switch
                edge='end'
                checked={settings.weatherAlert}
                onChange={() => handleToggle('weatherAlert')}
              />
            </ListItemSecondaryAction>
          </ListItem>
          <Divider component='li' />
          <ListItem>
            <ListItemText
              primary='ダークモード'
              secondary='暗い配色でUIを表示'
            />
            <ListItemSecondaryAction>
              <Switch
                edge='end'
                checked={settings.darkMode}
                onChange={() => handleToggle('darkMode')}
              />
            </ListItemSecondaryAction>
          </ListItem>
        </List>
      </Paper>
    </Box>
  )
}

export const Settings: StoryObj = {
  name: '設定リスト',
  render: () => <SettingsContent />,
}
