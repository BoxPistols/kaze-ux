import AccessTimeIcon from '@mui/icons-material/AccessTime'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'

import type { Meta, StoryObj } from '@storybook/react-vite'

/**
 * ダッシュボードUIパターン。
 *
 * 複数のMUIコンポーネントを組み合わせた実用的なダッシュボードレイアウト。
 * テーマのCard、Typography、Chip等のカスタマイズが反映された状態を確認できる。
 */
const meta: Meta = {
  title: 'Patterns/Dashboard',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'ダッシュボードUIパターン。KPIカード、チャート、アクティビティリスト等を組み合わせた実用的なレイアウト例。',
      },
    },
  },
}
export default meta

// ---------------------------------------------------------------------------
// 統計カード（KPI）
// ---------------------------------------------------------------------------

/** 個別KPIカードのデータ型 */
interface StatCardItem {
  icon: React.ReactNode
  label: string
  value: string
  change: string
  /** 変化の方向: positive / negative / neutral */
  trend: 'positive' | 'negative' | 'neutral'
}

const statCards: StatCardItem[] = [
  {
    icon: <AssignmentIcon />,
    label: '稼働機体数',
    value: '12',
    change: '先月比 +2',
    trend: 'positive',
  },
  {
    icon: <AccessTimeIcon />,
    label: '本日のタスク',
    value: '8',
    change: '3件 進行中',
    trend: 'neutral',
  },
  {
    icon: <TrendingUpIcon />,
    label: '月間稼働時間',
    value: '256h',
    change: '+18%',
    trend: 'positive',
  },
  {
    icon: <WarningAmberIcon />,
    label: 'アクティブアラート',
    value: '2',
    change: '要対応',
    trend: 'negative',
  },
]

/** 変化方向に対応する色を返す */
function trendColor(trend: StatCardItem['trend']): string {
  if (trend === 'positive') return 'success.main'
  if (trend === 'negative') return 'error.main'
  return 'text.secondary'
}

/** 変化方向に対応するアバター背景色を返す */
function avatarBgColor(trend: StatCardItem['trend']): string {
  if (trend === 'positive') return 'success.light'
  if (trend === 'negative') return 'error.light'
  return 'primary.light'
}

/** 変化方向に対応するアバターアイコン色を返す */
function avatarIconColor(trend: StatCardItem['trend']): string {
  if (trend === 'positive') return 'success.dark'
  if (trend === 'negative') return 'error.dark'
  return 'primary.dark'
}

const StatCardsContent = () => (
  <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
    <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
      KPI統計カード
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
      ダッシュボード上部に配置する主要KPIの一覧。Grid
      size指定によるレスポンシブ4カラムレイアウト。
    </Typography>

    <Grid container spacing={3}>
      {statCards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction='row' spacing={2} alignItems='flex-start'>
                {/* アイコン */}
                <Avatar
                  sx={{
                    bgcolor: avatarBgColor(card.trend),
                    color: avatarIconColor(card.trend),
                    width: 48,
                    height: 48,
                  }}>
                  {card.icon}
                </Avatar>

                {/* 数値とラベル */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    sx={{ display: 'block', mb: 0.5 }}>
                    {card.label}
                  </Typography>
                  <Typography
                    variant='h4'
                    sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                    {card.value}
                  </Typography>
                  <Typography
                    variant='caption'
                    sx={{ color: trendColor(card.trend), fontWeight: 500 }}>
                    {card.change}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
)

export const StatCards: StoryObj = {
  name: 'KPI統計カード',
  render: () => <StatCardsContent />,
}

// ---------------------------------------------------------------------------
// アクティビティフィード
// ---------------------------------------------------------------------------

/** アクティビティ1件のデータ型 */
interface ActivityItem {
  icon: React.ReactNode
  primary: string
  secondary: string
  chipLabel: string
  chipColor: 'success' | 'warning' | 'info' | 'error' | 'default'
}

const activities: ActivityItem[] = [
  {
    icon: <CheckCircleIcon />,
    primary: 'デバイスAlpha タスク完了',
    secondary: '5分前',
    chipLabel: '完了',
    chipColor: 'success',
  },
  {
    icon: <WarningAmberIcon />,
    primary: 'デバイスBeta メンテナンス開始',
    secondary: '15分前',
    chipLabel: 'メンテナンス',
    chipColor: 'warning',
  },
  {
    icon: <AssignmentIcon />,
    primary: 'プランTSK-042 承認',
    secondary: '30分前',
    chipLabel: '承認済み',
    chipColor: 'info',
  },
  {
    icon: <BatteryChargingFullIcon />,
    primary: 'デバイスGamma バッテリー低下',
    secondary: '1時間前',
    chipLabel: '警告',
    chipColor: 'error',
  },
  {
    icon: <AccessTimeIcon />,
    primary: '新規メンバー登録',
    secondary: '2時間前',
    chipLabel: '登録',
    chipColor: 'default',
  },
]

const ActivityFeedContent = () => (
  <Box sx={{ maxWidth: 640, mx: 'auto' }}>
    <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
      アクティビティフィード
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
      直近の操作履歴やイベントを時系列で表示するカード。
    </Typography>

    <Card>
      <CardHeader
        title='最近のアクティビティ'
        action={
          <IconButton size='small'>
            <MoreVertIcon />
          </IconButton>
        }
      />
      <List disablePadding>
        {activities.map((item, index) => (
          <Box key={item.primary}>
            <ListItem
              sx={{ px: 2.5, py: 1.5 }}
              secondaryAction={
                <Chip
                  label={item.chipLabel}
                  color={item.chipColor}
                  size='small'
                  variant='outlined'
                />
              }>
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor:
                      item.chipColor === 'default'
                        ? 'action.selected'
                        : `${item.chipColor}.light`,
                    color:
                      item.chipColor === 'default'
                        ? 'text.primary'
                        : `${item.chipColor}.dark`,
                    width: 40,
                    height: 40,
                  }}>
                  {item.icon}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={item.primary}
                secondary={item.secondary}
                primaryTypographyProps={{
                  variant: 'body2',
                  fontWeight: 500,
                }}
                secondaryTypographyProps={{
                  variant: 'caption',
                }}
                sx={{ pr: 8 }}
              />
            </ListItem>
            {index < activities.length - 1 && (
              <Divider variant='inset' component='li' />
            )}
          </Box>
        ))}
      </List>
    </Card>
  </Box>
)

export const ActivityFeed: StoryObj = {
  name: 'アクティビティフィード',
  render: () => <ActivityFeedContent />,
}

// ---------------------------------------------------------------------------
// 機体概況 (Fleet Overview)
// ---------------------------------------------------------------------------

/** 機体ステータス1件のデータ型 */
interface DeviceRow {
  name: string
  model: string
  battery: number
  status: string
  statusColor: 'success' | 'info' | 'warning' | 'error'
}

const devices: DeviceRow[] = [
  {
    name: 'Alpha-01',
    model: 'Model X-350',
    battery: 82,
    status: '稼働中',
    statusColor: 'success',
  },
  {
    name: 'Beta-03',
    model: 'Model Y-300',
    battery: 54,
    status: '待機中',
    statusColor: 'info',
  },
  {
    name: 'Gamma-07',
    model: 'Model Z-200',
    battery: 21,
    status: '充電中',
    statusColor: 'warning',
  },
]

/** スケジュール1件のデータ型 */
interface ScheduleItem {
  time: string
  route: string
  status: string
  statusColor: 'success' | 'info' | 'warning' | 'default'
}

const schedules: ScheduleItem[] = [
  {
    time: '09:00',
    route: '東京湾岸 - 調査タスク',
    status: '完了',
    statusColor: 'success',
  },
  {
    time: '11:30',
    route: '横浜港 - 点検タスク',
    status: '進行中',
    statusColor: 'info',
  },
  {
    time: '14:00',
    route: '千葉沿岸 - 配送テスト',
    status: '準備中',
    statusColor: 'warning',
  },
  {
    time: '16:30',
    route: '品川エリア - 定期巡回',
    status: '予定',
    statusColor: 'default',
  },
]

const FleetOverviewContent = () => (
  <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
    <Typography variant='h5' sx={{ fontWeight: 600, mb: 1 }}>
      機体概況
    </Typography>
    <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
      左カードに機体稼働状況、右カードに今日のスケジュールを並列配置。
    </Typography>

    <Grid container spacing={3}>
      {/* --- 機体稼働状況 --- */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title='機体稼働状況'
            action={
              <IconButton size='small'>
                <MoreVertIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Stack spacing={2.5}>
              {devices.map((device) => (
                <Box key={device.name}>
                  {/* 上段: 機体名 / モデル / ステータス */}
                  <Stack
                    direction='row'
                    alignItems='center'
                    justifyContent='space-between'
                    sx={{ mb: 1 }}>
                    <Box>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>
                        {device.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {device.model}
                      </Typography>
                    </Box>
                    <Chip
                      label={device.status}
                      color={device.statusColor}
                      size='small'
                    />
                  </Stack>

                  {/* 下段: バッテリー */}
                  <Stack direction='row' spacing={1.5} alignItems='center'>
                    <BatteryChargingFullIcon
                      fontSize='small'
                      color={
                        device.battery < 30
                          ? 'error'
                          : device.battery < 60
                            ? 'warning'
                            : 'success'
                      }
                    />
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress
                        variant='determinate'
                        value={device.battery}
                        color={
                          device.battery < 30
                            ? 'error'
                            : device.battery < 60
                              ? 'warning'
                              : 'success'
                        }
                        sx={{ borderRadius: 1, height: 6 }}
                      />
                    </Box>
                    <Typography
                      variant='caption'
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        minWidth: 36,
                        textAlign: 'right',
                      }}>
                      {device.battery}%
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* --- 今日のスケジュール --- */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ height: '100%' }}>
          <CardHeader
            title='今日のスケジュール'
            action={
              <IconButton size='small'>
                <MoreVertIcon />
              </IconButton>
            }
          />
          <List disablePadding>
            {schedules.map((item, index) => (
              <Box key={item.time}>
                <ListItem sx={{ px: 2.5, py: 1.5 }}>
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: 'action.hover',
                        color: 'text.primary',
                        width: 40,
                        height: 40,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        fontFamily: 'monospace',
                      }}>
                      {item.time}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.route}
                    secondary={
                      <Chip
                        label={item.status}
                        color={item.statusColor}
                        size='small'
                        variant='outlined'
                        sx={{ mt: 0.5 }}
                      />
                    }
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight: 500,
                    }}
                  />
                </ListItem>
                {index < schedules.length - 1 && (
                  <Divider variant='inset' component='li' />
                )}
              </Box>
            ))}
          </List>
        </Card>
      </Grid>
    </Grid>
  </Box>
)

export const FleetOverview: StoryObj = {
  name: '機体概況',
  render: () => <FleetOverviewContent />,
}
