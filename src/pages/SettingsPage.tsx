// src/pages/SettingsPage.tsx
import Brightness4Icon from '@mui/icons-material/Brightness4'
import Brightness7Icon from '@mui/icons-material/Brightness7'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import {
  Box,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'

import { WeekStartSelector } from '@/components/ui/calendar'
import { hookUseTheme } from '@/hooks/useTheme'

const SettingsPage = () => {
  const { mode, setMode } = hookUseTheme()

  return (
    <Box>
      {/* ページヘッダー */}
      <Box sx={{ mb: 3 }}>
        <Typography variant='h1'>設定</Typography>
      </Box>

      {/* 設定セクション */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          maxWidth: 600,
        }}>
        {/* テーマ設定 */}
        <Card>
          <CardContent>
            <Typography variant='h3' gutterBottom>
              テーマ設定
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              アプリケーションの外観を選択してください
            </Typography>
            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={(_, value) => value && setMode(value)}
              aria-label='テーマ選択'>
              <ToggleButton value='light' aria-label='ライトモード'>
                <Brightness7Icon sx={{ mr: 1 }} />
                Light
              </ToggleButton>
              <ToggleButton value='dark' aria-label='ダークモード'>
                <Brightness4Icon sx={{ mr: 1 }} />
                Dark
              </ToggleButton>
              <ToggleButton value='system' aria-label='システム設定'>
                <SettingsBrightnessIcon sx={{ mr: 1 }} />
                System
              </ToggleButton>
            </ToggleButtonGroup>
          </CardContent>
        </Card>

        {/* カレンダー設定 */}
        <Card>
          <CardContent>
            <Typography variant='h3' gutterBottom>
              カレンダー設定
            </Typography>
            <WeekStartSelector />
          </CardContent>
        </Card>

        {/* 通知設定 */}
        <Card>
          <CardContent>
            <Typography variant='h3' gutterBottom>
              通知設定
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='メール通知'
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='プッシュ通知'
              />
              <FormControlLabel control={<Switch />} label='SMS通知' />
            </Box>
          </CardContent>
        </Card>

        {/* 表示設定 */}
        <Card>
          <CardContent>
            <Typography variant='h3' gutterBottom>
              表示設定
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='コンパクト表示'
              />
              <FormControlLabel
                control={<Switch />}
                label='アニメーション無効化'
              />
            </Box>
          </CardContent>
        </Card>

        {/* セキュリティ設定 */}
        <Card>
          <CardContent>
            <Typography variant='h3' gutterBottom>
              セキュリティ
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='二要素認証'
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label='セッションタイムアウト'
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant='body2' color='text.secondary'>
              最終ログイン: 2024-01-15 09:00
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              IPアドレス: 192.168.1.xxx
            </Typography>
          </CardContent>
        </Card>

        {/* システム情報 */}
        <Card>
          <CardContent>
            <Typography variant='h3' gutterBottom>
              システム情報
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2' color='text.secondary'>
                  バージョン
                </Typography>
                <Typography variant='body2'>v1.0.0</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2' color='text.secondary'>
                  ビルド
                </Typography>
                <Typography variant='body2'>2024.01.15</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2' color='text.secondary'>
                  環境
                </Typography>
                <Typography variant='body2'>Development</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default SettingsPage
