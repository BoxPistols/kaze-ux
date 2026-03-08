/**
 * UTM周知パネル
 *
 * 有人機団体への周知状況を表示し、送信・確認操作を提供する
 */

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EmailIcon from '@mui/icons-material/Email'
import FaxIcon from '@mui/icons-material/Fax'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import PhoneIcon from '@mui/icons-material/Phone'
import RefreshIcon from '@mui/icons-material/Refresh'
import ReplayIcon from '@mui/icons-material/Replay'
import SendIcon from '@mui/icons-material/Send'
import SmsIcon from '@mui/icons-material/Sms'
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Chip,
  Stack,
  LinearProgress,
  Tooltip,
  Divider,
  Alert,
  AlertTitle,
  Collapse,
  alpha,
  useTheme,
} from '@mui/material'
import React, { useState } from 'react'

import type {
  NotificationLog,
  NotificationSummary,
  ContactMethod,
  NotificationStatus,
} from '../../types/utmTypes'

// 連絡方法のアイコン
const getMethodIcon = (method: ContactMethod): React.ReactNode => {
  switch (method) {
    case 'email':
      return <EmailIcon />
    case 'sms':
      return <SmsIcon />
    case 'fax':
      return <FaxIcon />
    case 'phone':
      return <PhoneIcon />
    case 'api':
      return <SendIcon />
    default:
      return <EmailIcon />
  }
}

// ステータスの色
const getStatusColor = (
  status: NotificationStatus
): 'success' | 'warning' | 'error' | 'info' | 'default' => {
  switch (status) {
    case 'confirmed':
      return 'success'
    case 'delivered':
      return 'success'
    case 'sent':
      return 'info'
    case 'sending':
    case 'pending':
      return 'warning'
    case 'failed':
    case 'bounced':
      return 'error'
    case 'expired':
      return 'default'
    default:
      return 'default'
  }
}

// ステータスラベル
const getStatusLabel = (status: NotificationStatus): string => {
  const labels: Record<NotificationStatus, string> = {
    pending: '送信待ち',
    sending: '送信中',
    sent: '送信済み',
    delivered: '配信確認',
    failed: '送信失敗',
    confirmed: '受信確認済',
    bounced: 'バウンス',
    expired: '期限切れ',
  }
  return labels[status] || status
}

// 日時フォーマット
const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Props定義
export interface UTMNotificationPanelProps {
  flightPlanId: string
  flightPlanName?: string
  notifications: NotificationLog[]
  summary?: NotificationSummary
  onSendAll?: () => void
  onRetry?: (logId: string) => void
  onConfirm?: (logId: string) => void
  onRefresh?: () => void
  loading?: boolean
  canSend?: boolean
}

export const UTMNotificationPanel = ({
  flightPlanId: _flightPlanId,
  flightPlanName,
  notifications,
  summary,
  onSendAll,
  onRetry,
  onConfirm,
  onRefresh,
  loading = false,
  canSend = true,
}: UTMNotificationPanelProps) => {
  const theme = useTheme()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // 進捗率計算
  const progressPercent = summary
    ? Math.round(
        ((summary.sent + summary.delivered + summary.confirmed) /
          summary.total) *
          100
      )
    : 0

  // 確認率計算
  const confirmPercent = summary
    ? Math.round((summary.confirmed / summary.total) * 100)
    : 0

  // 送信が必要な通知があるか
  const hasPendingNotifications =
    notifications.some((n) => n.status === 'pending') ||
    notifications.length === 0

  // 失敗した通知があるか
  const hasFailedNotifications = notifications.some(
    (n) => n.status === 'failed' || n.status === 'bounced'
  )

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        borderRadius: 2,
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}>
        <Box>
          <Typography variant='h6' fontWeight='bold'>
            事前周知
          </Typography>
          {flightPlanName && (
            <Typography variant='caption' color='text.secondary'>
              {flightPlanName}
            </Typography>
          )}
        </Box>
        <Stack direction='row' spacing={1}>
          <Tooltip title='更新'>
            <IconButton size='small' onClick={onRefresh} disabled={loading}>
              <RefreshIcon fontSize='small' />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* サマリー */}
      {summary && (
        <Box sx={{ mb: 2 }}>
          <Stack direction='row' spacing={2} sx={{ mb: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant='caption' color='text.secondary'>
                送信進捗
              </Typography>
              <LinearProgress
                variant='determinate'
                value={progressPercent}
                sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
              />
              <Typography variant='caption' color='text.secondary'>
                {summary.sent + summary.delivered + summary.confirmed}/
                {summary.total}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant='caption' color='text.secondary'>
                確認率
              </Typography>
              <LinearProgress
                variant='determinate'
                value={confirmPercent}
                color='success'
                sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
              />
              <Typography variant='caption' color='text.secondary'>
                {summary.confirmed}/{summary.total}
              </Typography>
            </Box>
          </Stack>

          <Stack direction='row' spacing={1} flexWrap='wrap' useFlexGap>
            <Chip size='small' label={`待機: ${summary.pending}`} />
            <Chip size='small' label={`送信済: ${summary.sent}`} color='info' />
            <Chip
              size='small'
              label={`配信確認: ${summary.delivered}`}
              color='success'
              variant='outlined'
            />
            <Chip
              size='small'
              label={`受信確認: ${summary.confirmed}`}
              color='success'
            />
            {summary.failed > 0 && (
              <Chip
                size='small'
                label={`失敗: ${summary.failed}`}
                color='error'
              />
            )}
          </Stack>
        </Box>
      )}

      {/* アクションエリア */}
      {canSend && (
        <Box sx={{ mb: 2 }}>
          {hasPendingNotifications && (
            <Button
              variant='contained'
              fullWidth
              startIcon={<SendIcon />}
              onClick={onSendAll}
              disabled={loading}>
              周知を一括送信
            </Button>
          )}
          {hasFailedNotifications && (
            <Alert severity='warning' sx={{ mt: 1 }}>
              <AlertTitle>送信失敗があります</AlertTitle>
              失敗した通知は個別に再送信できます
            </Alert>
          )}
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* 通知リスト */}
      <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
        周知先一覧
      </Typography>

      {notifications.length === 0 ? (
        <Alert severity='info'>
          周知対象がありません。空域判定を実行してください。
        </Alert>
      ) : (
        <List disablePadding>
          {notifications.map((notification) => (
            <React.Fragment key={notification.id}>
              <ListItem
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  bgcolor:
                    notification.status === 'failed' ||
                    notification.status === 'bounced'
                      ? alpha(theme.palette.error.main, 0.05)
                      : notification.status === 'confirmed'
                        ? alpha(theme.palette.success.main, 0.05)
                        : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.action.hover, 0.1),
                  },
                }}
                onClick={() =>
                  setExpandedId(
                    expandedId === notification.id ? null : notification.id
                  )
                }>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Tooltip title={notification.method.toUpperCase()}>
                    <Box
                      sx={{
                        color:
                          notification.status === 'confirmed'
                            ? 'success.main'
                            : notification.status === 'failed'
                              ? 'error.main'
                              : 'text.secondary',
                      }}>
                      {getMethodIcon(notification.method)}
                    </Box>
                  </Tooltip>
                </ListItemIcon>
                <ListItemText
                  primary={notification.orgName}
                  secondary={
                    <Stack direction='row' spacing={1} alignItems='center'>
                      <Chip
                        size='small'
                        label={getStatusLabel(notification.status)}
                        color={getStatusColor(notification.status)}
                        sx={{ height: 20 }}
                      />
                      {notification.sentAt && (
                        <Typography variant='caption' color='text.secondary'>
                          送信: {formatDateTime(notification.sentAt)}
                        </Typography>
                      )}
                    </Stack>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
                <ListItemSecondaryAction>
                  <Stack direction='row' spacing={0.5}>
                    {notification.status === 'confirmed' && (
                      <CheckCircleIcon color='success' fontSize='small' />
                    )}
                    {(notification.status === 'failed' ||
                      notification.status === 'bounced') && (
                      <Tooltip title='再送信'>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation()
                            onRetry?.(notification.id)
                          }}
                          disabled={loading}>
                          <ReplayIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                    {(notification.status === 'sent' ||
                      notification.status === 'delivered') && (
                      <Tooltip title='受信確認'>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation()
                            onConfirm?.(notification.id)
                          }}
                          disabled={loading}>
                          <CheckCircleIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                    {notification.status === 'pending' && (
                      <HourglassEmptyIcon color='action' fontSize='small' />
                    )}
                  </Stack>
                </ListItemSecondaryAction>
              </ListItem>

              {/* 詳細展開 */}
              <Collapse in={expandedId === notification.id}>
                <Box
                  sx={{
                    pl: 7,
                    pr: 2,
                    pb: 1,
                    bgcolor: alpha(theme.palette.action.hover, 0.05),
                    borderRadius: 1,
                    mb: 1,
                  }}>
                  <Stack spacing={0.5}>
                    <Typography variant='caption' color='text.secondary'>
                      送信方法: {notification.method.toUpperCase()}
                    </Typography>
                    {notification.sentAt && (
                      <Typography variant='caption' color='text.secondary'>
                        送信日時: {formatDateTime(notification.sentAt)}
                      </Typography>
                    )}
                    {notification.deliveredAt && (
                      <Typography variant='caption' color='text.secondary'>
                        配信確認: {formatDateTime(notification.deliveredAt)}
                      </Typography>
                    )}
                    {notification.confirmedAt && (
                      <Typography variant='caption' color='text.secondary'>
                        受信確認: {formatDateTime(notification.confirmedAt)}
                        {notification.confirmedBy &&
                          ` (${notification.confirmedBy})`}
                      </Typography>
                    )}
                    {notification.failureReason && (
                      <Typography variant='caption' color='error'>
                        失敗理由: {notification.failureReason}
                      </Typography>
                    )}
                    {notification.retryCount > 0 && (
                      <Typography variant='caption' color='text.secondary'>
                        再送回数: {notification.retryCount}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  )
}

export default UTMNotificationPanel
