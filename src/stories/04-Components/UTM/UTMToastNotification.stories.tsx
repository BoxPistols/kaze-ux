import { Box, Button, Stack } from '@mui/material'
import { useState, useCallback } from 'react'

import UTMToastNotification, {
  useToastNotifications,
} from '@/components/utm/UTMToastNotification'
import type {
  ToastNotification,
  ToastType,
} from '@/components/utm/UTMToastNotification'

import type { Meta, StoryObj } from '@storybook/react-vite'

const meta: Meta<typeof UTMToastNotification> = {
  title: 'Components/UTM/UTMToastNotification',
  component: UTMToastNotification,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
## トースト通知

ドローンのステータス変化やアラートを動的に通知するコンポーネントです。

### 主な機能
- ステータス変化通知（離陸、着陸、RTH等）
- アラート通知（低バッテリー、信号低下、区域侵入等）
- 重大度別の色分け表示（info/warning/error/success）
- 自動消去（3.5秒）
- アラート音の再生（オプション）

### 通知タイプ
- status_change: ドローンのステータス変化
- alert: アラート通知
- warning: 警告通知
- info: 情報通知
- success: 成功通知
- error: エラー通知

### 使用場面
- UTM監視ダッシュボードのグローバル通知として
- リアルタイムイベント通知として
        `,
      },
    },
  },
  tags: ['autodocs', 'implemented'],
  argTypes: {
    maxVisible: {
      control: { type: 'number', min: 1, max: 5 },
      description: '同時に表示する通知の最大数',
    },
  },
}

export default meta
type Story = StoryObj<typeof UTMToastNotification>

// モック通知生成
const createMockNotification = (
  type: ToastType,
  severity: 'info' | 'warning' | 'error' | 'success'
): ToastNotification => ({
  id: crypto.randomUUID(),
  type,
  title:
    type === 'status_change'
      ? 'ステータス変化'
      : type === 'alert'
        ? 'アラート'
        : type === 'warning'
          ? '警告'
          : type === 'error'
            ? 'エラー'
            : type === 'success'
              ? '成功'
              : '情報',
  message:
    severity === 'error'
      ? '緊急事態が発生しました！'
      : severity === 'warning'
        ? 'バッテリー残量が低下しています'
        : severity === 'success'
          ? '安全に着陸しました'
          : '飛行を開始しました',
  droneId: 'drone-1',
  droneName: '新十津川(845)',
  severity,
  timestamp: new Date(),
  autoHideDuration: 3500,
})

// インタラクティブデモ用のラッパーコンポーネント
const InteractiveDemo = () => {
  const { notifications, addNotification, removeNotification } =
    useToastNotifications()

  const handleAddInfo = useCallback(() => {
    addNotification({
      type: 'info',
      title: '情報',
      message: '新しい飛行計画が承認されました',
      droneName: '新十津川(845)',
      severity: 'info',
    })
  }, [addNotification])

  const handleAddSuccess = useCallback(() => {
    addNotification({
      type: 'status_change',
      title: 'ステータス変化',
      message: '安全に着陸しました',
      droneName: '浦安(949)',
      droneStatus: 'landed',
      severity: 'success',
    })
  }, [addNotification])

  const handleAddWarning = useCallback(() => {
    addNotification({
      type: 'warning',
      title: 'バッテリー低下',
      message: 'バッテリー残量が25%です。帰還を検討してください。',
      droneName: '秩父#1(945)',
      alertType: 'low_battery',
      severity: 'warning',
    })
  }, [addNotification])

  const handleAddError = useCallback(() => {
    addNotification({
      type: 'alert',
      title: '緊急アラート',
      message: '通信途絶の危険があります！',
      droneName: '奄美(940)',
      alertType: 'signal_loss',
      severity: 'error',
    })
  }, [addNotification])

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Stack spacing={2} direction='row'>
        <Button variant='contained' color='info' onClick={handleAddInfo}>
          情報通知
        </Button>
        <Button variant='contained' color='success' onClick={handleAddSuccess}>
          成功通知
        </Button>
        <Button variant='contained' color='warning' onClick={handleAddWarning}>
          警告通知
        </Button>
        <Button variant='contained' color='error' onClick={handleAddError}>
          エラー通知
        </Button>
      </Stack>
      <UTMToastNotification
        notifications={notifications}
        onClose={removeNotification}
        maxVisible={3}
      />
    </Box>
  )
}

// 静的表示用のラッパーコンポーネント
const StaticDemo = ({
  notifications,
}: {
  notifications: ToastNotification[]
}) => {
  const [notifs, setNotifs] = useState(notifications)

  const handleClose = useCallback((id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }, [])

  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
        position: 'relative',
      }}>
      <UTMToastNotification
        notifications={notifs}
        onClose={handleClose}
        maxVisible={3}
      />
    </Box>
  )
}

// ===== ストーリー =====

/**
 * インタラクティブデモ - ボタンをクリックして通知を追加
 */
export const Interactive: Story = {
  render: () => <InteractiveDemo />,
}

/**
 * 情報通知
 */
export const InfoNotification: Story = {
  render: () => (
    <StaticDemo notifications={[createMockNotification('info', 'info')]} />
  ),
}

/**
 * 成功通知
 */
export const SuccessNotification: Story = {
  render: () => (
    <StaticDemo
      notifications={[createMockNotification('status_change', 'success')]}
    />
  ),
}

/**
 * 警告通知
 */
export const WarningNotification: Story = {
  render: () => (
    <StaticDemo
      notifications={[createMockNotification('warning', 'warning')]}
    />
  ),
}

/**
 * エラー通知
 */
export const ErrorNotification: Story = {
  render: () => (
    <StaticDemo notifications={[createMockNotification('alert', 'error')]} />
  ),
}

/**
 * 複数通知
 */
export const MultipleNotifications: Story = {
  render: () => (
    <StaticDemo
      notifications={[
        createMockNotification('info', 'info'),
        createMockNotification('warning', 'warning'),
        createMockNotification('alert', 'error'),
      ]}
    />
  ),
}
