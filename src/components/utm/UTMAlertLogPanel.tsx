import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FilterListIcon from '@mui/icons-material/FilterList'
import FlightIcon from '@mui/icons-material/Flight'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Badge,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useMemo, useCallback } from 'react'

import { ALERT_TYPE_LABELS, ALERT_SEVERITY_COLORS } from '@/constants/utmLabels'
import { colors } from '@/styles/tokens'
import type { AlertLogEntry, AlertSeverity } from '@/types/utmTypes'

export interface UTMAlertLogPanelProps {
  /** アラートログ一覧 */
  alerts: AlertLogEntry[]
  /** アラート確認ハンドラ */
  onAcknowledge?: (alertId: string) => void
  /** 全アラート確認ハンドラ */
  onAcknowledgeAll?: (droneId: string) => void
  /** アラートクリックハンドラ（地図上で位置表示など） */
  onAlertClick?: (alert: AlertLogEntry) => void
  /** フィルタリングするドローンID（nullで全て表示） */
  filterDroneId?: string | null
  /** 高さ */
  height?: string | number
  /** カスタムスタイル */
  sx?: object
}

// ドローンごとにアラートをグループ化する関数
const groupAlertsByDrone = (alerts: AlertLogEntry[]) => {
  const grouped: Record<string, AlertLogEntry[]> = {}
  alerts.forEach((alert) => {
    if (!grouped[alert.droneId]) {
      grouped[alert.droneId] = []
    }
    grouped[alert.droneId].push(alert)
  })

  // 各ドローンのアラートを時系列でソート（新しい順）
  Object.keys(grouped).forEach((droneId) => {
    grouped[droneId].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  })

  return grouped
}

// 重大度に基づくアイコンの取得
const getSeverityIcon = (
  severity: AlertSeverity,
  type: 'warning' | 'alert'
) => {
  if (type === 'alert' || severity === 'emergency' || severity === 'critical') {
    return <ErrorOutlineIcon sx={{ color: colors.error.main }} />
  }
  return <WarningAmberIcon sx={{ color: colors.warning.main }} />
}

// 時刻フォーマット
const formatTime = (date: Date) => {
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 日付フォーマット
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * UTMAlertLogPanel - アラートログパネル
 *
 * 機体ごとにアラート/Warningを時系列でまとめて表示するコンポーネント
 */
export const UTMAlertLogPanel = ({
  alerts,
  onAcknowledge,
  onAcknowledgeAll,
  onAlertClick,
  filterDroneId = null,
  height = 500,
  sx,
}: UTMAlertLogPanelProps) => {
  const theme = useTheme()
  const [filterType, setFilterType] = useState<'all' | 'warning' | 'alert'>(
    'all'
  )
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>(
    'all'
  )
  const [expandedDrone, setExpandedDrone] = useState<string | false>(false)

  // フィルタリング
  const filteredAlerts = useMemo(() => {
    let result = alerts

    // ドローンIDでフィルタ
    if (filterDroneId) {
      result = result.filter((a) => a.droneId === filterDroneId)
    }

    // タイプでフィルタ
    if (filterType !== 'all') {
      result = result.filter((a) => a.type === filterType)
    }

    // 重大度でフィルタ
    if (filterSeverity !== 'all') {
      result = result.filter((a) => a.severity === filterSeverity)
    }

    return result
  }, [alerts, filterDroneId, filterType, filterSeverity])

  // ドローンごとにグループ化
  const groupedAlerts = useMemo(
    () => groupAlertsByDrone(filteredAlerts),
    [filteredAlerts]
  )

  // 未確認アラート数を取得
  const getUnacknowledgedCount = useCallback(
    (droneId: string) => {
      return groupedAlerts[droneId]?.filter((a) => !a.acknowledged).length ?? 0
    },
    [groupedAlerts]
  )

  // 最も深刻なアラートの重大度を取得
  const getHighestSeverity = useCallback(
    (droneId: string): AlertSeverity | null => {
      const droneAlerts = groupedAlerts[droneId]
      if (!droneAlerts?.length) return null

      const severityOrder: AlertSeverity[] = [
        'emergency',
        'critical',
        'warning',
        'info',
      ]
      for (const severity of severityOrder) {
        if (
          droneAlerts.some((a) => a.severity === severity && !a.acknowledged)
        ) {
          return severity
        }
      }
      return null
    },
    [groupedAlerts]
  )

  // グラスモーフィズムスタイル
  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.85)'
        : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
        : '0 8px 32px rgba(0, 0, 0, 0.12)',
  }

  // アラート数サマリー
  const alertSummary = useMemo(() => {
    const unacknowledged = filteredAlerts.filter((a) => !a.acknowledged)
    return {
      total: filteredAlerts.length,
      alerts: unacknowledged.filter((a) => a.type === 'alert').length,
      warnings: unacknowledged.filter((a) => a.type === 'warning').length,
    }
  }, [filteredAlerts])

  return (
    <Paper elevation={0} sx={{ ...glassStyle, borderRadius: 2, ...sx }}>
      {/* ヘッダー */}
      <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActiveIcon
              sx={{ fontSize: 20, color: theme.palette.primary.main }}
            />
            <Typography variant='subtitle1' fontWeight={600}>
              アラートログ
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {alertSummary.alerts > 0 && (
              <Chip
                icon={<ErrorOutlineIcon sx={{ fontSize: 14 }} />}
                label={`Alert: ${alertSummary.alerts}`}
                size='small'
                sx={{
                  bgcolor: alpha(colors.error.main, 0.15),
                  color: colors.error.main,
                  fontWeight: 600,
                }}
              />
            )}
            {alertSummary.warnings > 0 && (
              <Chip
                icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
                label={`Warning: ${alertSummary.warnings}`}
                size='small'
                sx={{
                  bgcolor: alpha(colors.warning.main, 0.15),
                  color: colors.warning.main,
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
        </Box>

        {/* フィルター */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <FilterListIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          <FormControl size='small' sx={{ minWidth: 100 }}>
            <InputLabel>タイプ</InputLabel>
            <Select
              value={filterType}
              label='タイプ'
              onChange={(e) =>
                setFilterType(e.target.value as 'all' | 'warning' | 'alert')
              }>
              <MenuItem value='all'>全て</MenuItem>
              <MenuItem value='alert'>Alert</MenuItem>
              <MenuItem value='warning'>Warning</MenuItem>
            </Select>
          </FormControl>
          <FormControl size='small' sx={{ minWidth: 100 }}>
            <InputLabel>重大度</InputLabel>
            <Select
              value={filterSeverity}
              label='重大度'
              onChange={(e) =>
                setFilterSeverity(e.target.value as AlertSeverity | 'all')
              }>
              <MenuItem value='all'>全て</MenuItem>
              <MenuItem value='emergency'>緊急</MenuItem>
              <MenuItem value='critical'>重大</MenuItem>
              <MenuItem value='warning'>警告</MenuItem>
              <MenuItem value='info'>情報</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* アラートリスト */}
      <Box sx={{ height, overflow: 'auto' }}>
        {Object.keys(groupedAlerts).length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              p: 4,
            }}>
            <CheckCircleOutlineIcon
              sx={{ fontSize: 48, color: colors.success.main, mb: 2 }}
            />
            <Typography color='text.secondary'>アラートはありません</Typography>
          </Box>
        ) : (
          Object.entries(groupedAlerts).map(([droneId, droneAlerts]) => {
            const unacknowledgedCount = getUnacknowledgedCount(droneId)
            const highestSeverity = getHighestSeverity(droneId)
            const droneName = droneAlerts[0]?.droneName ?? droneId

            return (
              <Accordion
                key={droneId}
                expanded={expandedDrone === droneId}
                onChange={(_, isExpanded) =>
                  setExpandedDrone(isExpanded ? droneId : false)
                }
                sx={{
                  bgcolor: 'transparent',
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    bgcolor: highestSeverity
                      ? alpha(ALERT_SEVERITY_COLORS[highestSeverity], 0.08)
                      : 'transparent',
                    '&:hover': {
                      bgcolor: highestSeverity
                        ? alpha(ALERT_SEVERITY_COLORS[highestSeverity], 0.12)
                        : alpha(theme.palette.action.hover, 0.04),
                    },
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      flex: 1,
                    }}>
                    <Badge
                      badgeContent={unacknowledgedCount}
                      color={
                        highestSeverity === 'emergency' ||
                        highestSeverity === 'critical'
                          ? 'error'
                          : 'warning'
                      }
                      invisible={unacknowledgedCount === 0}>
                      <FlightIcon
                        sx={{
                          fontSize: 20,
                          color: highestSeverity
                            ? ALERT_SEVERITY_COLORS[highestSeverity]
                            : theme.palette.text.secondary,
                        }}
                      />
                    </Badge>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant='subtitle2' fontWeight={600}>
                        {droneName}
                      </Typography>
                      <Typography variant='caption' color='text.secondary'>
                        {droneAlerts.length}件のアラート
                      </Typography>
                    </Box>
                    {onAcknowledgeAll && unacknowledgedCount > 0 && (
                      <Tooltip title='全て確認済みにする' arrow>
                        <IconButton
                          size='small'
                          onClick={(e) => {
                            e.stopPropagation()
                            onAcknowledgeAll(droneId)
                          }}
                          sx={{
                            mr: 1,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.2),
                            },
                          }}>
                          <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <List dense disablePadding>
                    <AnimatePresence>
                      {droneAlerts.map((alert, index) => (
                        <motion.div
                          key={alert.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}>
                          <ListItem
                            sx={{
                              py: 1,
                              px: 2,
                              bgcolor: alert.acknowledged
                                ? 'transparent'
                                : alpha(
                                    ALERT_SEVERITY_COLORS[alert.severity],
                                    0.05
                                  ),
                              borderLeft: `3px solid ${ALERT_SEVERITY_COLORS[alert.severity]}`,
                              '&:hover': {
                                bgcolor: alpha(
                                  theme.palette.action.hover,
                                  0.08
                                ),
                              },
                              cursor: onAlertClick ? 'pointer' : 'default',
                            }}
                            onClick={() => onAlertClick?.(alert)}>
                            <ListItemIcon sx={{ minWidth: 36 }}>
                              {getSeverityIcon(alert.severity, alert.type)}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}>
                                  <Typography
                                    variant='body2'
                                    fontWeight={alert.acknowledged ? 400 : 600}
                                    sx={{
                                      color: alert.acknowledged
                                        ? 'text.secondary'
                                        : 'text.primary',
                                    }}>
                                    {alert.message}
                                  </Typography>
                                  <Chip
                                    label={
                                      ALERT_TYPE_LABELS[alert.category] ||
                                      alert.category
                                    }
                                    size='small'
                                    sx={{
                                      height: 18,
                                      fontSize: '0.65rem',
                                      bgcolor: alpha(
                                        ALERT_SEVERITY_COLORS[alert.severity],
                                        0.15
                                      ),
                                      color:
                                        ALERT_SEVERITY_COLORS[alert.severity],
                                    }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mt: 0.5,
                                  }}>
                                  <Typography
                                    variant='caption'
                                    color='text.secondary'>
                                    {formatDate(alert.timestamp)}{' '}
                                    {formatTime(alert.timestamp)}
                                  </Typography>
                                  {alert.data?.value !== undefined &&
                                    alert.data?.threshold !== undefined && (
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'>
                                        (値: {alert.data.value}, 閾値:{' '}
                                        {alert.data.threshold})
                                      </Typography>
                                    )}
                                </Box>
                              }
                            />
                            {onAcknowledge && !alert.acknowledged && (
                              <Button
                                size='small'
                                variant='outlined'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onAcknowledge(alert.id)
                                }}
                                sx={{
                                  minWidth: 'auto',
                                  px: 1,
                                  py: 0.25,
                                  fontSize: '0.7rem',
                                  textTransform: 'none',
                                }}>
                                確認
                              </Button>
                            )}
                            {alert.acknowledged && (
                              <CheckCircleOutlineIcon
                                sx={{
                                  fontSize: 18,
                                  color: colors.success.main,
                                  ml: 1,
                                }}
                              />
                            )}
                          </ListItem>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </List>
                </AccordionDetails>
              </Accordion>
            )
          })
        )}
      </Box>
    </Paper>
  )
}

export default UTMAlertLogPanel
