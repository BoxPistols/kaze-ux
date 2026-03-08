import CloseIcon from '@mui/icons-material/Close'
import DashboardIcon from '@mui/icons-material/Dashboard'
import FlightIcon from '@mui/icons-material/Flight'
import MapIcon from '@mui/icons-material/Map'
import SettingsIcon from '@mui/icons-material/Settings'
import StorageIcon from '@mui/icons-material/Storage'
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * MUI Drawerコンポーネント。
 *
 * サイドナビゲーション、フィルターパネル、詳細パネルなどに使用。
 * テーマのPaper設定（borderRadius 12, elevation 0）が適用される。
 */
const meta: Meta<typeof Drawer> = {
  title: 'Components/UI/Drawer',
  component: Drawer,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    anchor: {
      control: 'select',
      options: ['left', 'right', 'top', 'bottom'],
      description: 'ドロワーの表示位置',
    },
    variant: {
      control: 'select',
      options: ['temporary', 'persistent', 'permanent'],
      description: 'ドロワーのバリアント',
    },
  },
}

export default meta

// --- ナビゲーション項目の定義 ---

const navItems = [
  { icon: <DashboardIcon />, label: 'ダッシュボード' },
  { icon: <FlightIcon />, label: 'フライト管理' },
  { icon: <MapIcon />, label: 'マップ' },
  { icon: <StorageIcon />, label: 'データ管理' },
  { icon: <SettingsIcon />, label: '設定' },
]

// --- 表示位置 ---

type Anchor = 'left' | 'right' | 'top' | 'bottom'

const anchorLabels: Record<Anchor, string> = {
  left: '左',
  right: '右',
  top: '上',
  bottom: '下',
}

const AnchorsContent = () => {
  const [state, setState] = useState<Record<Anchor, boolean>>({
    left: false,
    right: false,
    top: false,
    bottom: false,
  })

  const toggleDrawer = (anchor: Anchor, open: boolean) => () => {
    setState((prev) => ({ ...prev, [anchor]: open }))
  }

  const drawerList = (anchor: Anchor) => (
    <Box
      role='presentation'
      sx={{
        width: anchor === 'top' || anchor === 'bottom' ? 'auto' : 280,
      }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
        }}>
        <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
          ナビゲーション
        </Typography>
        <IconButton
          onClick={toggleDrawer(anchor, false)}
          size='small'
          aria-label='閉じる'>
          <CloseIcon fontSize='small' />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItemButton
            key={item.label}
            onClick={toggleDrawer(anchor, false)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        表示位置
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Drawerは上下左右の4方向から表示できます。用途に応じて適切な位置を選択してください。
      </Typography>

      <Paper variant='outlined' sx={{ p: 4, borderRadius: 2 }}>
        <Stack direction='row' spacing={2} flexWrap='wrap' useFlexGap>
          {(['left', 'right', 'top', 'bottom'] as const).map((anchor) => (
            <Button
              key={anchor}
              variant='outlined'
              onClick={toggleDrawer(anchor, true)}>
              {anchorLabels[anchor]}から開く
            </Button>
          ))}
        </Stack>

        {(['left', 'right', 'top', 'bottom'] as const).map((anchor) => (
          <Drawer
            key={anchor}
            anchor={anchor}
            open={state[anchor]}
            onClose={toggleDrawer(anchor, false)}>
            {drawerList(anchor)}
          </Drawer>
        ))}
      </Paper>
    </Box>
  )
}

export const Anchors: StoryObj = {
  name: '表示位置',
  render: () => <AnchorsContent />,
}

// --- ナビゲーションドロワー ---

const NavigationDrawerContent = () => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        ナビゲーションドロワー
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        永続的なサイドナビゲーションとして使用するパターン。
        選択中の項目がハイライトされます。
      </Typography>

      <Paper variant='outlined' sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', minHeight: 400 }}>
          {/* ナビゲーション部分 */}
          <Box
            sx={{
              width: 260,
              borderRight: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}>
            {/* ヘッダー */}
            <Box sx={{ p: 2.5 }}>
              <Typography
                variant='h6'
                sx={{ fontWeight: 700, letterSpacing: 1 }}>
                SDPF
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                Smart Drone Platform
              </Typography>
            </Box>
            <Divider />

            {/* ナビゲーションリスト */}
            <List disablePadding sx={{ pt: 1 }}>
              {navItems.map((item, index) => (
                <ListItemButton
                  key={item.label}
                  selected={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                  sx={{ mx: 1, borderRadius: 1, mb: 0.5 }}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
          </Box>

          {/* メインコンテンツ部分 */}
          <Box sx={{ flex: 1, p: 3, bgcolor: 'action.hover' }}>
            <Typography variant='h6' sx={{ fontWeight: 600, mb: 1 }}>
              {navItems[selectedIndex].label}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              左のナビゲーションから項目を選択してください。
              選択された項目がハイライト表示されます。
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export const NavigationDrawer: StoryObj = {
  name: 'ナビゲーションドロワー',
  render: () => <NavigationDrawerContent />,
}

// --- 実用パターン ---

const PracticalPatternsContent = () => {
  const [filterOpen, setFilterOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        実用パターン
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        フィルターパネルや詳細情報パネルなど、業務アプリケーションでよく使われるパターン。
      </Typography>

      <Grid container spacing={3}>
        {/* フィルタードロワー */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
              フィルターパネル
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mb: 2 }}>
              一覧画面の絞り込み条件を設定するドロワー
            </Typography>
            <Button variant='outlined' onClick={() => setFilterOpen(true)}>
              フィルターを開く
            </Button>
          </Paper>
        </Grid>

        {/* 詳細パネルドロワー */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant='outlined' sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
              詳細情報パネル
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mb: 2 }}>
              選択したドローンの詳細情報を表示するドロワー
            </Typography>
            <Button variant='outlined' onClick={() => setDetailOpen(true)}>
              詳細を開く
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* フィルタードロワー */}
      <Drawer
        anchor='right'
        open={filterOpen}
        onClose={() => setFilterOpen(false)}>
        <Box
          sx={{
            width: 340,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}>
          {/* ヘッダー */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              フィルター条件
            </Typography>
            <IconButton
              onClick={() => setFilterOpen(false)}
              size='small'
              aria-label='閉じる'>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>

          {/* フィルターフォーム */}
          <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
            <Stack spacing={2.5}>
              <TextField
                label='キーワード'
                size='small'
                fullWidth
                placeholder='フライト名で検索'
              />
              <FormControl size='small' fullWidth>
                <InputLabel>ステータス</InputLabel>
                <Select label='ステータス' defaultValue=''>
                  <MenuItem value=''>すべて</MenuItem>
                  <MenuItem value='active'>運航中</MenuItem>
                  <MenuItem value='standby'>待機中</MenuItem>
                  <MenuItem value='maintenance'>メンテナンス</MenuItem>
                </Select>
              </FormControl>
              <FormControl size='small' fullWidth>
                <InputLabel>エリア</InputLabel>
                <Select label='エリア' defaultValue=''>
                  <MenuItem value=''>すべて</MenuItem>
                  <MenuItem value='tokyo'>東京</MenuItem>
                  <MenuItem value='osaka'>大阪</MenuItem>
                  <MenuItem value='nagoya'>名古屋</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label='開始日'
                type='date'
                size='small'
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label='終了日'
                type='date'
                size='small'
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </Box>

          {/* フッター */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
            }}>
            <Button
              variant='outlined'
              fullWidth
              onClick={() => setFilterOpen(false)}>
              リセット
            </Button>
            <Button
              variant='contained'
              fullWidth
              onClick={() => setFilterOpen(false)}>
              適用
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* 詳細パネルドロワー */}
      <Drawer
        anchor='right'
        open={detailOpen}
        onClose={() => setDetailOpen(false)}>
        <Box
          sx={{
            width: 380,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}>
          {/* ヘッダー */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
              ドローン詳細
            </Typography>
            <IconButton
              onClick={() => setDetailOpen(false)}
              size='small'
              aria-label='閉じる'>
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>

          {/* 詳細コンテンツ */}
          <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
            <Stack spacing={3}>
              {/* 機体情報 */}
              <Box>
                <Stack
                  direction='row'
                  alignItems='center'
                  spacing={1}
                  sx={{ mb: 1.5 }}>
                  <FlightIcon color='primary' />
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Drone-Alpha
                  </Typography>
                </Stack>
                <Chip label='運航中' color='success' size='small' />
              </Box>

              <Divider />

              {/* 基本情報 */}
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  基本情報
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { label: '機体ID', value: 'DRN-2024-001' },
                    { label: '機体モデル', value: 'Matrice 350 RTK' },
                    { label: '登録日', value: '2024-04-15' },
                    { label: '最終点検日', value: '2024-12-01' },
                  ].map((row) => (
                    <Box
                      key={row.label}
                      sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant='body2' color='text.secondary'>
                        {row.label}
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {row.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>

              <Divider />

              {/* 飛行情報 */}
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                  飛行情報
                </Typography>
                <Stack spacing={1.5}>
                  {[
                    { label: '現在地', value: '東京都港区' },
                    { label: '高度', value: '120m' },
                    { label: '速度', value: '8.5 m/s' },
                    { label: 'バッテリー', value: '78%' },
                    { label: '総飛行時間', value: '342時間' },
                  ].map((row) => (
                    <Box
                      key={row.label}
                      sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant='body2' color='text.secondary'>
                        {row.label}
                      </Typography>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {row.value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* フッター */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex',
              gap: 1,
            }}>
            <Button
              variant='outlined'
              fullWidth
              onClick={() => setDetailOpen(false)}>
              閉じる
            </Button>
            <Button variant='contained' fullWidth>
              編集
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  )
}

export const PracticalPatterns: StoryObj = {
  name: '実用パターン',
  render: () => <PracticalPatternsContent />,
}
