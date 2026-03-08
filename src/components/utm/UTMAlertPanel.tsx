import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ClearAllIcon from '@mui/icons-material/ClearAll'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ErrorIcon from '@mui/icons-material/Error'
import FlightIcon from '@mui/icons-material/Flight'
import HomeIcon from '@mui/icons-material/Home'
import InfoIcon from '@mui/icons-material/Info'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Badge,
  Button,
  alpha,
  useTheme,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useMemo, memo } from 'react'

import { colors } from '@/styles/tokens'

import type { UTMAlert, AlertSeverity, AlertType } from '../../types/utmTypes'

// アラートの重要度に応じたスタイル（コンポーネント外で定義）
const getSeverityStyles = (severity: AlertSeverity) => {
  switch (severity) {
    case 'emergency':
      return {
        icon: <NotificationsActiveIcon />,
        color: colors.error.main,
        bgGradient: `linear-gradient(135deg, ${alpha(colors.error.main, 0.15)} 0%, ${alpha(colors.error.main, 0.05)} 100%)`,
        borderColor: colors.error.main,
        iconBg: `linear-gradient(135deg, ${colors.error.main}, ${colors.error.dark})`,
      }
    case 'critical':
      return {
        icon: <ErrorIcon />,
        color: colors.error.dark,
        bgGradient: `linear-gradient(135deg, ${alpha(colors.error.dark, 0.12)} 0%, ${alpha(colors.error.dark, 0.04)} 100%)`,
        borderColor: colors.error.dark,
        iconBg: `linear-gradient(135deg, ${colors.error.dark}, ${colors.error.main})`,
      }
    case 'warning':
      return {
        icon: <WarningAmberIcon />,
        color: colors.warning.dark,
        bgGradient: `linear-gradient(135deg, ${alpha(colors.warning.main, 0.15)} 0%, ${alpha(colors.warning.main, 0.05)} 100%)`,
        borderColor: colors.warning.main,
        iconBg: `linear-gradient(135deg, ${colors.warning.main}, ${colors.warning.dark})`,
      }
    case 'info':
    default:
      return {
        icon: <InfoIcon />,
        color: colors.info.main,
        bgGradient: `linear-gradient(135deg, ${alpha(colors.info.main, 0.12)} 0%, ${alpha(colors.info.main, 0.04)} 100%)`,
        borderColor: colors.info.main,
        iconBg: `linear-gradient(135deg, ${colors.info.main}, ${colors.info.dark})`,
      }
  }
}

// アラートタイプのラベル定数（コンポーネント外で定義）
const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  zone_violation: '区域侵入',
  zone_approach: '区域接近',
  collision_warning: '衝突警告',
  collision_alert: '衝突危険',
  low_battery: '低バッテリー',
  signal_loss: '信号喪失',
  geofence_breach: 'ジオフェンス',
  weather_warning: '気象警告',
  airspace_conflict: '空域競合',
  system_command: 'システム',
}

const getAlertTypeLabel = (type: AlertType): string => {
  return ALERT_TYPE_LABELS[type] || type
}

// 日時フォーマット（コンポーネント外で定義）
const formatTime = (date: Date): string => {
  return new Date(date).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

interface UTMAlertPanelProps {
  alerts: UTMAlert[]
  onAcknowledge: (alertId: string) => void
  onClear: (alertId: string) => void
  onClearAll: () => void
  onDroneClick?: (droneId: string) => void // ドローンをクリックした時のコールバック
  selectedDroneId?: string | null // 選択中のドローンID
  /** 選択中のアラートID（複数選択対応） */
  selectedAlertIds?: string[]
  /** アラートを選択した時のコールバック（複数選択対応） */
  onAlertSelect?: (alertIds: string[]) => void
  /** ホバリング指示のコールバック（緊急アラート用） */
  onHover?: (droneId: string) => void
  /** 緊急帰還（RTH）指示のコールバック（緊急アラート用） */
  onEmergencyReturn?: (droneId: string) => void
}

const UTMAlertPanelComponent = ({
  alerts,
  onAcknowledge,
  onClear,
  onClearAll,
  onDroneClick,
  selectedDroneId,
  selectedAlertIds = [],
  onAlertSelect,
  onHover,
  onEmergencyReturn,
}: UTMAlertPanelProps) => {
  const theme = useTheme()

  // 未確認アラート数（メモ化）- 1回のループで両方の値を計算
  const { unacknowledgedCount, criticalCount } = useMemo(() => {
    let unack = 0
    let crit = 0
    for (const a of alerts) {
      if (!a.acknowledged) {
        unack++
        if (a.severity === 'critical' || a.severity === 'emergency') {
          crit++
        }
      }
    }
    return { unacknowledgedCount: unack, criticalCount: crit }
  }, [alerts])

  const glassStyle = {
    background:
      theme.palette.mode === 'dark'
        ? 'rgba(30, 41, 59, 0.82)'
        : 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRadius: 3,
        ...glassStyle,
        boxShadow:
          theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.3)'
            : '0 8px 32px rgba(0, 0, 0, 0.08)',
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background:
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${alpha(colors.error.main, 0.1)} 0%, transparent 100%)`
              : `linear-gradient(135deg, ${alpha(colors.error.main, 0.05)} 0%, transparent 100%)`,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Badge
            badgeContent={unacknowledgedCount}
            color='error'
            sx={{
              '& .MuiBadge-badge': {
                fontWeight: 700,
                boxShadow: `0 2px 8px ${alpha(colors.error.main, 0.4)}`,
              },
            }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                background:
                  criticalCount > 0
                    ? `linear-gradient(135deg, ${colors.error.main}, ${colors.error.dark})`
                    : `linear-gradient(135deg, ${colors.gray[400]}, ${colors.gray[500]})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow:
                  criticalCount > 0
                    ? `0 4px 12px ${alpha(colors.error.main, 0.4)}`
                    : 'none',
              }}>
              <NotificationsActiveIcon
                sx={{
                  color: 'white',
                  fontSize: 20,
                  animation: criticalCount > 0 ? 'shake 0.5s infinite' : 'none',
                  '@keyframes shake': {
                    '0%, 100%': { transform: 'rotate(-5deg)' },
                    '50%': { transform: 'rotate(5deg)' },
                  },
                }}
              />
            </Box>
          </Badge>
          <Box>
            <Typography variant='h6' fontWeight={700}>
              アラート
            </Typography>
            {criticalCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}>
                <Chip
                  label={`緊急 ${criticalCount}件`}
                  size='small'
                  sx={{
                    mt: 0.5,
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22,
                    background: `linear-gradient(135deg, ${colors.error.main}, ${colors.error.dark})`,
                    color: 'white',
                    animation: 'pulse 2s infinite',
                    boxShadow: `0 2px 8px ${alpha(colors.error.main, 0.4)}`,
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.7 },
                    },
                  }}
                />
              </motion.div>
            )}
          </Box>
        </Box>
        {alerts.length > 0 && (
          <Tooltip title='全てクリア' arrow>
            <Button
              size='small'
              onClick={onClearAll}
              startIcon={<ClearAllIcon />}
              sx={{
                color: 'text.secondary',
                borderRadius: 2,
                px: 1.5,
                '&:hover': {
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  color: theme.palette.error.main,
                },
              }}>
              全削除
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* アラートリスト */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        {alerts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                color: 'text.secondary',
              }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${alpha(colors.success.main, 0.2)}, ${alpha(colors.success.main, 0.05)})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                }}>
                <CheckCircleIcon
                  sx={{ fontSize: 40, color: colors.success.main }}
                />
              </Box>
              <Typography variant='subtitle1' fontWeight={600}>
                アラートはありません
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                すべてのドローンが正常に運航中です
              </Typography>
            </Box>
          </motion.div>
        ) : (
          <List disablePadding>
            <AnimatePresence>
              {alerts.map((alert, index) => {
                const styles = getSeverityStyles(alert.severity)
                return (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}>
                    <ListItem
                      onClick={(e) => {
                        // アラート選択
                        if (onAlertSelect) {
                          const isSelected = selectedAlertIds.includes(alert.id)
                          // Cmd/Ctrl + クリックで複数選択トグル
                          if (e.metaKey || e.ctrlKey) {
                            if (isSelected) {
                              // 選択解除
                              onAlertSelect(
                                selectedAlertIds.filter((id) => id !== alert.id)
                              )
                            } else {
                              // 追加選択
                              onAlertSelect([...selectedAlertIds, alert.id])
                            }
                          } else {
                            // 通常クリックは単一選択（トグル）
                            onAlertSelect(isSelected ? [] : [alert.id])
                          }
                        }
                        // 該当ドローンにズーム（常に呼び出す）
                        onDroneClick?.(alert.droneId)
                      }}
                      sx={{
                        background: selectedAlertIds.includes(alert.id)
                          ? alpha(colors.primary[500], 0.2)
                          : selectedDroneId === alert.droneId
                            ? alpha(colors.primary[500], 0.1)
                            : alert.acknowledged
                              ? 'transparent'
                              : styles.bgGradient,
                        borderLeft: `3px solid ${
                          selectedAlertIds.includes(alert.id)
                            ? colors.primary[500]
                            : selectedDroneId === alert.droneId
                              ? alpha(colors.primary[500], 0.5)
                              : alert.acknowledged
                                ? 'transparent'
                                : styles.borderColor
                        }`,
                        opacity: alert.acknowledged ? 0.6 : 1,
                        py: 1,
                        px: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: selectedAlertIds.includes(alert.id)
                            ? alpha(colors.primary[500], 0.25)
                            : selectedDroneId === alert.droneId
                              ? alpha(colors.primary[500], 0.15)
                              : alert.acknowledged
                                ? alpha(theme.palette.action.hover, 0.05)
                                : styles.bgGradient,
                        },
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.05)}`,
                        ...(selectedAlertIds.includes(alert.id) && {
                          boxShadow: `inset 0 0 0 2px ${alpha(colors.primary[500], 0.4)}`,
                        }),
                      }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: 1.5,
                            background: alert.acknowledged
                              ? colors.gray[300]
                              : styles.iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: alert.acknowledged
                              ? 'none'
                              : `0 2px 8px ${alpha(styles.color, 0.25)}`,
                          }}>
                          <Box sx={{ color: 'white', display: 'flex' }}>
                            {React.cloneElement(styles.icon, {
                              sx: { fontSize: 16 },
                            })}
                          </Box>
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 1,
                            }}>
                            <Typography
                              variant='body2'
                              fontWeight={600}
                              sx={{
                                color: alert.acknowledged
                                  ? 'text.secondary'
                                  : 'text.primary',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                              {alert.message}
                            </Typography>
                            <Chip
                              label={getAlertTypeLabel(alert.type)}
                              size='small'
                              sx={{
                                height: 18,
                                fontSize: '0.65rem',
                                fontWeight: 600,
                                background: alert.acknowledged
                                  ? colors.gray[300]
                                  : styles.iconBg,
                                color: 'white',
                                '& .MuiChip-label': { px: 0.75 },
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: 'auto 1fr auto',
                              alignItems: 'center',
                              gap: 1,
                              mt: 0.5,
                            }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}>
                              <FlightIcon
                                sx={{
                                  fontSize: 12,
                                  color:
                                    selectedDroneId === alert.droneId
                                      ? colors.primary[600]
                                      : colors.primary[500],
                                }}
                              />
                              <Typography
                                variant='caption'
                                fontWeight={500}
                                sx={{
                                  color:
                                    selectedDroneId === alert.droneId
                                      ? colors.primary[600]
                                      : 'text.secondary',
                                  fontSize: '0.7rem',
                                }}>
                                {alert.droneName}
                              </Typography>
                            </Box>
                            {alert.position && (
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  justifyContent: 'center',
                                }}>
                                <LocationOnIcon
                                  sx={{ fontSize: 11, color: 'text.disabled' }}
                                />
                                <Typography
                                  variant='caption'
                                  color='text.disabled'
                                  sx={{ fontSize: '0.65rem' }}>
                                  {alert.position.latitude.toFixed(3)},
                                  {alert.position.longitude.toFixed(3)}
                                </Typography>
                              </Box>
                            )}
                            {!alert.position && <Box />}
                            <Typography
                              variant='caption'
                              color='text.disabled'
                              sx={{ fontSize: '0.65rem', textAlign: 'right' }}>
                              {formatTime(alert.timestamp)}
                            </Typography>
                          </Box>
                        }
                      />
                      <Stack direction='row' spacing={0.25}>
                        {/* 緊急アラート用アクション（emergency/criticalのみ） */}
                        {!alert.acknowledged &&
                          (alert.severity === 'emergency' ||
                            alert.severity === 'critical') && (
                            <>
                              {onHover && (
                                <Tooltip title='ホバリング指示' arrow>
                                  <IconButton
                                    size='small'
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onHover(alert.droneId)
                                    }}
                                    sx={{
                                      p: 0.5,
                                      bgcolor: alpha(colors.warning.main, 0.1),
                                      color: colors.warning.main,
                                      '&:hover': {
                                        bgcolor: alpha(
                                          colors.warning.main,
                                          0.2
                                        ),
                                      },
                                    }}>
                                    <PauseCircleIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {onEmergencyReturn && (
                                <Tooltip title='緊急帰還 (RTH)' arrow>
                                  <IconButton
                                    size='small'
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onEmergencyReturn(alert.droneId)
                                    }}
                                    sx={{
                                      p: 0.5,
                                      bgcolor: alpha(colors.error.main, 0.15),
                                      color: colors.error.main,
                                      '&:hover': {
                                        bgcolor: alpha(colors.error.main, 0.25),
                                      },
                                    }}>
                                    <HomeIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </>
                          )}
                        {!alert.acknowledged && (
                          <Tooltip title='確認' arrow>
                            <IconButton
                              size='small'
                              onClick={(e) => {
                                e.stopPropagation()
                                onAcknowledge(alert.id)
                              }}
                              sx={{
                                p: 0.5,
                                bgcolor: alpha(colors.success.main, 0.1),
                                color: colors.success.main,
                                '&:hover': {
                                  bgcolor: alpha(colors.success.main, 0.2),
                                },
                              }}>
                              <CheckCircleIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title='削除' arrow>
                          <IconButton
                            size='small'
                            onClick={(e) => {
                              e.stopPropagation()
                              onClear(alert.id)
                            }}
                            sx={{
                              p: 0.5,
                              color: 'text.secondary',
                              '&:hover': {
                                bgcolor: alpha(colors.error.main, 0.1),
                                color: colors.error.main,
                              },
                            }}>
                            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItem>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </List>
        )}
      </Box>
    </Paper>
  )
}

// 浅い比較でpropsの変更を検出
const arePropsEqual = (
  prevProps: UTMAlertPanelProps,
  nextProps: UTMAlertPanelProps
): boolean => {
  // アラートの数が変わった場合は再レンダリング
  if (prevProps.alerts.length !== nextProps.alerts.length) return false

  // アラートの内容が変わった場合（IDと確認状態のみチェック）
  for (let i = 0; i < prevProps.alerts.length; i++) {
    const prev = prevProps.alerts[i]
    const next = nextProps.alerts[i]
    if (
      prev.id !== next.id ||
      prev.acknowledged !== next.acknowledged ||
      prev.severity !== next.severity
    ) {
      return false
    }
  }

  // 選択状態
  if (prevProps.selectedDroneId !== nextProps.selectedDroneId) return false
  if (prevProps.selectedAlertIds?.length !== nextProps.selectedAlertIds?.length)
    return false
  if (
    prevProps.selectedAlertIds?.some(
      (id, i) => id !== nextProps.selectedAlertIds?.[i]
    )
  )
    return false

  return true
}

// React.memoでラップしてエクスポート
const UTMAlertPanel = memo(UTMAlertPanelComponent, arePropsEqual)

export default UTMAlertPanel
