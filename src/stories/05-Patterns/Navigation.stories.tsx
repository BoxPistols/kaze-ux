import AssignmentIcon from '@mui/icons-material/Assignment'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FolderIcon from '@mui/icons-material/Folder'
import HomeIcon from '@mui/icons-material/Home'
import MapIcon from '@mui/icons-material/Map'
import MenuIcon from '@mui/icons-material/Menu'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NotificationsIcon from '@mui/icons-material/Notifications'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import StorageIcon from '@mui/icons-material/Storage'
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * ナビゲーションパターン。
 *
 * AppBar、Drawer、Breadcrumbsを組み合わせたアプリケーションナビゲーション。
 * テーマのAppBar、Toolbar、ListItemButton等のカスタマイズが反映された状態を確認できる。
 */
const meta: Meta = {
  title: 'Patterns/Navigation',
  parameters: {
    layout: 'fullscreen',
    noPadding: true,
    docs: {
      description: {
        component:
          'ナビゲーションパターン。AppBar、Drawer、Breadcrumbsを組み合わせたアプリケーションナビゲーションのレイアウト例。',
      },
    },
  },
}
export default meta

// ---------------------------------------------------------------------------
// ナビゲーション項目の定義
// ---------------------------------------------------------------------------

/** サイドバーに表示するナビゲーション項目 */
interface NavItem {
  icon: React.ReactNode
  label: string
  /** グループ区切りの先頭であるか */
  dividerBefore?: boolean
}

const navItems: NavItem[] = [
  { icon: <DashboardIcon />, label: 'ダッシュボード' },
  { icon: <AssignmentIcon />, label: 'タスク管理' },
  { icon: <MapIcon />, label: 'マップ' },
  { icon: <StorageIcon />, label: 'データ管理', dividerBefore: true },
  { icon: <SettingsIcon />, label: '設定' },
]

/** ドロワーの幅 */
const DRAWER_WIDTH = 240

// ---------------------------------------------------------------------------
// AppBar + Drawer アプリケーションシェル
// ---------------------------------------------------------------------------

const AppBarWithDrawerContent = () => {
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState(1)

  return (
    <Box
      sx={{
        height: 600,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
      {/* --- AppBar --- */}
      <AppBar
        position='static'
        elevation={1}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {/* ハンバーガーメニュー */}
          <IconButton
            edge='start'
            color='inherit'
            aria-label='メニューを開閉する'
            onClick={() => setDrawerOpen((prev) => !prev)}
            sx={{ mr: 2 }}>
            {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>

          {/* ロゴ */}
          <Typography variant='h6' sx={{ fontWeight: 700, letterSpacing: 2 }}>
            Kaze
          </Typography>

          {/* スペーサー */}
          <Box sx={{ flex: 1 }} />

          {/* 通知アイコン */}
          <Tooltip title='通知'>
            <IconButton color='inherit' aria-label='通知'>
              <Badge badgeContent={3} color='error'>
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* ユーザーアバター */}
          <Tooltip title='アカウント'>
            <IconButton sx={{ ml: 1 }} aria-label='アカウント'>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                <PersonIcon fontSize='small' />
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* --- メインエリア（Drawer + コンテンツ） --- */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* サイドバー Drawer */}
        <Drawer
          variant='persistent'
          anchor='left'
          open={drawerOpen}
          sx={{
            width: drawerOpen ? DRAWER_WIDTH : 0,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              position: 'relative',
              height: '100%',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}>
          {/* Drawer ヘッダー */}
          <Box sx={{ p: 2 }}>
            <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
              Kaze UX
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              管理システム
            </Typography>
          </Box>
          <Divider />

          {/* ナビゲーションリスト */}
          <List disablePadding sx={{ pt: 1 }}>
            {navItems.map((item, index) => (
              <Box key={item.label}>
                {item.dividerBefore && <Divider sx={{ my: 1 }} />}
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                  sx={{ mx: 1, borderRadius: 1, mb: 0.5 }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </Box>
            ))}
          </List>
        </Drawer>

        {/* メインコンテンツ */}
        <Box
          component='main'
          sx={{
            flex: 1,
            p: 3,
            bgcolor: 'action.hover',
            overflow: 'auto',
          }}>
          {/* パンくずリスト */}
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize='small' />}
            aria-label='パンくずリスト'
            sx={{ mb: 3 }}>
            <Link
              underline='hover'
              color='inherit'
              component='button'
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <HomeIcon fontSize='small' />
              ホーム
            </Link>
            <Link underline='hover' color='inherit' component='button'>
              タスク管理
            </Link>
            <Typography color='text.primary'>TSK-2024-042</Typography>
          </Breadcrumbs>

          {/* コンテンツ表示領域 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
              タスク TSK-2024-042
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              東京エリア 定期点検
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              {[
                { label: 'ステータス', value: '進行中' },
                { label: '担当デバイス', value: 'Alpha-01' },
                { label: '開始時刻', value: '2024-12-15 09:30' },
                { label: '予定終了', value: '2024-12-15 11:00' },
                { label: '担当者', value: '山田 太郎' },
              ].map((row) => (
                <Box key={row.label} sx={{ display: 'flex', gap: 2 }}>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ minWidth: 100 }}>
                    {row.label}
                  </Typography>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    {row.value}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export const AppBarWithDrawer: StoryObj = {
  name: 'AppBar + Drawer',
  render: () => <AppBarWithDrawerContent />,
}

// ---------------------------------------------------------------------------
// パンくずリストパターン集
// ---------------------------------------------------------------------------

const BreadcrumbPatternsContent = () => (
  <Box sx={{ maxWidth: 800, mx: 'auto' }}>
    <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
      パンくずリストパターン
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
      アプリケーション内で使用される代表的なBreadcrumbsのバリエーション。
    </Typography>

    <Stack spacing={3}>
      {/* --- 基本パターン --- */}
      <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
          基本パターン
        </Typography>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='基本パンくずリスト'>
          <Link underline='hover' color='inherit' component='button'>
            ホーム
          </Link>
          <Link underline='hover' color='inherit' component='button'>
            プロジェクト
          </Link>
          <Typography color='text.primary'>東京湾岸点検</Typography>
        </Breadcrumbs>
      </Paper>

      {/* --- アイコン付きパターン --- */}
      <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
          アイコン付きパターン
        </Typography>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='アイコン付きパンくずリスト'>
          <Link
            underline='hover'
            color='inherit'
            component='button'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HomeIcon fontSize='small' />
            ホーム
          </Link>
          <Link
            underline='hover'
            color='inherit'
            component='button'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <FolderIcon fontSize='small' />
            プロジェクト
          </Link>
          <Link
            underline='hover'
            color='inherit'
            component='button'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AssignmentIcon fontSize='small' />
            タスク管理
          </Link>
          <Typography
            color='text.primary'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <MapIcon fontSize='small' />
            ルート詳細
          </Typography>
        </Breadcrumbs>
      </Paper>

      {/* --- 折りたたみパターン --- */}
      <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
          折りたたみパターン（深い階層）
        </Typography>
        <Breadcrumbs
          maxItems={3}
          itemsBeforeCollapse={1}
          itemsAfterCollapse={2}
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='折りたたみパンくずリスト'>
          <Link underline='hover' color='inherit' component='button'>
            ホーム
          </Link>
          <Link underline='hover' color='inherit' component='button'>
            プロジェクト管理
          </Link>
          <Link underline='hover' color='inherit' component='button'>
            東京湾岸プロジェクト
          </Link>
          <Link underline='hover' color='inherit' component='button'>
            タスク計画
          </Link>
          <Link underline='hover' color='inherit' component='button'>
            FL-2024-042
          </Link>
          <Typography color='text.primary'>ルート編集</Typography>
        </Breadcrumbs>
      </Paper>

      {/* --- 現在ページChipパターン --- */}
      <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2 }}>
          現在ページ Chip パターン
        </Typography>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize='small' />}
          aria-label='Chip付きパンくずリスト'>
          <Link
            underline='hover'
            color='inherit'
            component='button'
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <HomeIcon fontSize='small' />
            ホーム
          </Link>
          <Link underline='hover' color='inherit' component='button'>
            タスク管理
          </Link>
          <Chip
            label='FL-2024-042'
            size='small'
            color='primary'
            variant='outlined'
            icon={<AssignmentIcon />}
          />
        </Breadcrumbs>
      </Paper>
    </Stack>
  </Box>
)

export const BreadcrumbPatterns: StoryObj = {
  name: 'パンくずリストパターン',
  render: () => <BreadcrumbPatternsContent />,
}
