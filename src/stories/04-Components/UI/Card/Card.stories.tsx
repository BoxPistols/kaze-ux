import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull'
import DevicesIcon from '@mui/icons-material/Devices'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SpeedIcon from '@mui/icons-material/Speed'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * MUIテーマでカスタマイズされたCardコンポーネント。
 *
 * テーマ設定:
 * - elevation: 0（デフォルト）
 * - borderRadius: 12
 * - border: 1px solid rgba(0,0,0,0.08) / rgba(255,255,255,0.08)
 * - boxShadow: 軽い影（hover時に増強）
 * - transition: box-shadow, border-color 0.2s ease-in-out
 * - CardHeader: padding 16px 20px, border-bottom, title fontWeight 600
 * - CardContent: padding 20px
 * - CardActions: padding 12px 20px, border-top, gap 8
 */
const meta: Meta<typeof Card> = {
  title: 'Components/UI/Card/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevation', 'outlined'],
      description: 'カードのバリアント',
    },
    elevation: {
      control: { type: 'range', min: 0, max: 24 },
      description: 'エレベーション（影の深さ）',
    },
    square: { control: 'boolean', description: '角丸を無効化' },
  },
}

export default meta

// --- 基本カード ---

const BasicContent = () => (
  <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
    <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
      基本カード
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
      テーマ設定: elevation 0, borderRadius 12, hover時の影増強アニメーション。
      CardHeader/CardContent/CardActionsにカスタムpadding。
    </Typography>

    <Grid container spacing={3}>
      {/* シンプル */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant='body2' sx={{ fontWeight: 600, mb: 1 }}>
              シンプルカード
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              最小構成のカード。ContentのみでHeaderやActionsなし。
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Header + Content */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardHeader title='ヘッダー付き' subheader='2024年1月15日' />
          <CardContent>
            <Typography variant='body2' color='text.secondary'>
              CardHeaderにはborder-bottomが適用され、セクション分離が明確。
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Full構成 */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardHeader
            avatar={<Avatar sx={{ bgcolor: 'primary.main' }}>K</Avatar>}
            action={
              <IconButton size='small'>
                <MoreVertIcon />
              </IconButton>
            }
            title='フル構成'
            subheader='アバター + アクション'
          />
          <CardContent>
            <Typography variant='body2' color='text.secondary'>
              avatar, action, title, subheaderの全propを使用したフル構成。
            </Typography>
          </CardContent>
          <CardActions>
            <Button size='small'>詳細</Button>
            <Button size='small' variant='contained'>
              編集
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  </Box>
)

export const Basic: StoryObj = {
  name: '基本カード',
  render: () => <BasicContent />,
}

// --- デバイスステータスカード ---

const DeviceStatusContent = () => {
  const devices = [
    {
      name: 'Device-Alpha',
      status: '稼働中',
      statusColor: 'success' as const,
      battery: 78,
      altitude: 120,
      speed: 8.5,
      location: '東京湾岸エリア',
    },
    {
      name: 'Device-Beta',
      status: '待機中',
      statusColor: 'info' as const,
      battery: 95,
      altitude: 0,
      speed: 0,
      location: '横浜基地',
    },
    {
      name: 'Device-Gamma',
      status: 'メンテナンス',
      statusColor: 'warning' as const,
      battery: 42,
      altitude: 0,
      speed: 0,
      location: '千葉整備場',
    },
  ]

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
        デバイスステータスカード
      </Typography>

      <Grid container spacing={3}>
        {devices.map((device) => (
          <Grid key={device.name} size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar sx={{ bgcolor: `${device.statusColor}.main` }}>
                    <DevicesIcon />
                  </Avatar>
                }
                action={
                  <Chip
                    label={device.status}
                    color={device.statusColor}
                    size='small'
                  />
                }
                title={device.name}
                subheader={device.location}
              />
              <CardContent>
                <Stack spacing={2}>
                  {/* バッテリー */}
                  <Box>
                    <Stack
                      direction='row'
                      justifyContent='space-between'
                      alignItems='center'
                      sx={{ mb: 0.5 }}>
                      <Stack direction='row' spacing={0.5} alignItems='center'>
                        <BatteryChargingFullIcon
                          fontSize='small'
                          color={device.battery < 50 ? 'warning' : 'success'}
                        />
                        <Typography variant='caption'>バッテリー</Typography>
                      </Stack>
                      <Typography
                        variant='caption'
                        sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {device.battery}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant='determinate'
                      value={device.battery}
                      color={device.battery < 50 ? 'warning' : 'success'}
                      sx={{ borderRadius: 1, height: 6 }}
                    />
                  </Box>

                  {/* メトリクス */}
                  <Grid container spacing={2}>
                    <Grid size={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: 'action.hover',
                          borderRadius: 1.5,
                          textAlign: 'center',
                        }}>
                        <LocationOnIcon
                          fontSize='small'
                          color='action'
                          sx={{ mb: 0.5 }}
                        />
                        <Typography
                          variant='caption'
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            display: 'block',
                          }}>
                          {device.altitude}m
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ fontSize: '0.625rem' }}>
                          高度
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={6}>
                      <Box
                        sx={{
                          p: 1.5,
                          bgcolor: 'action.hover',
                          borderRadius: 1.5,
                          textAlign: 'center',
                        }}>
                        <SpeedIcon
                          fontSize='small'
                          color='action'
                          sx={{ mb: 0.5 }}
                        />
                        <Typography
                          variant='caption'
                          sx={{
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            display: 'block',
                          }}>
                          {device.speed}m/s
                        </Typography>
                        <Typography
                          variant='caption'
                          color='text.secondary'
                          sx={{ fontSize: '0.625rem' }}>
                          速度
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
              <CardActions>
                <Button size='small'>詳細</Button>
                {device.status === '稼働中' && (
                  <Button size='small' variant='contained' color='error'>
                    緊急停止
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export const DeviceStatus: StoryObj = {
  name: 'デバイスステータス',
  render: () => <DeviceStatusContent />,
}

// --- レイアウトパターン ---

const LayoutPatternsContent = () => (
  <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
    <Typography variant='h5' sx={{ fontWeight: 600, mb: 3 }}>
      レイアウトパターン
    </Typography>

    <Stack spacing={4}>
      {/* ダッシュボードグリッド */}
      <Box>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
          ダッシュボードグリッド
        </Typography>
        <Grid container spacing={3}>
          {[
            { label: '総タスク数', value: '1,234', change: '+12%' },
            { label: '稼働デバイス', value: '8', change: '+2' },
            { label: '今月の稼働時間', value: '156h', change: '+8%' },
            { label: 'インシデント', value: '0', change: '-' },
          ].map((stat) => (
            <Grid key={stat.label} size={{ xs: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant='caption' color='text.secondary'>
                    {stat.label}
                  </Typography>
                  <Typography variant='h5' sx={{ fontWeight: 700, my: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{
                      color: stat.change.startsWith('+')
                        ? 'success.main'
                        : 'text.secondary',
                      fontWeight: 500,
                    }}>
                    {stat.change}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 横並びカード */}
      <Box>
        <Typography variant='body2' sx={{ fontWeight: 600, mb: 2 }}>
          横レイアウトカード
        </Typography>
        <Card>
          <Box sx={{ display: 'flex' }}>
            <Box
              sx={{
                width: 120,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
              <DevicesIcon sx={{ color: 'white', fontSize: 40 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant='body2' sx={{ fontWeight: 600 }}>
                  タスクプラン TSK-2024-0042
                </Typography>
                <Typography
                  variant='body2'
                  color='text.secondary'
                  sx={{ mt: 0.5 }}>
                  東京エリア調査 | 予定: 2024-02-15 10:00 | 所要時間: 45分
                </Typography>
              </CardContent>
              <CardActions>
                <Button size='small'>詳細</Button>
                <Button size='small' variant='contained'>
                  承認
                </Button>
              </CardActions>
            </Box>
          </Box>
        </Card>
      </Box>
    </Stack>
  </Box>
)

export const LayoutPatterns: StoryObj = {
  name: 'レイアウトパターン',
  render: () => <LayoutPatternsContent />,
}
