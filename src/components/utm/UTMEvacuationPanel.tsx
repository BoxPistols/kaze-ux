'use client'

import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  FlightTakeoff as FlightIcon,
  Home as HomeIcon,
  Place as PlaceIcon,
  PlayArrow as ContinueIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Battery20 as BatteryLowIcon,
  SignalCellularConnectedNoInternet0Bar as SignalLowIcon,
} from '@mui/icons-material'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Divider,
  Collapse,
  Tooltip,
  Alert,
  Stack,
  Chip,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useMemo, useCallback } from 'react'

import type {
  DroneFlightStatus,
  EvacuationPoint,
  DroneEvacuationStatus,
  EvacuationAction,
  UTMAlert,
} from '../../types/utmTypes'

// 距離計算用のユーティリティ関数（ハーバーサイン公式）
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000 // 地球の半径（メートル）
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// 距離のフォーマット
const formatDistance = (meters: number | null): string => {
  if (meters === null) return '-'
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(2)}km`
}

export interface UTMEvacuationPanelProps {
  // ドローンリスト
  drones: DroneFlightStatus[]
  // アラートリスト
  alerts: UTMAlert[]
  // 退避ポイント（ドローンIDをキーとしたマップ）
  evacuationPoints?: Map<string, EvacuationPoint>
  // ホームポイント（ドローンIDをキーとしたマップ）
  homePoints?: Map<string, EvacuationPoint>
  // パネルを閉じるコールバック
  onClose?: () => void
  // 退避アクション実行コールバック
  onEvacuationAction?: (droneId: string, action: EvacuationAction) => void
  // ドローン選択コールバック
  onDroneSelect?: (droneId: string) => void
  // パネルタイトル
  title?: string
  // 最大高さ
  maxHeight?: number | string
}

// 個別ドローンの退避情報カード
interface DroneEvacuationCardProps {
  status: DroneEvacuationStatus
  alerts: UTMAlert[]
  isExpanded: boolean
  onToggleExpand: () => void
  onAction: (action: EvacuationAction) => void
  onSelect: () => void
}

const DroneEvacuationCard = ({
  status,
  alerts,
  isExpanded,
  onToggleExpand,
  onAction,
  onSelect,
}: DroneEvacuationCardProps) => {
  const hasEmergency = status.warningLevel === 'emergency'
  const hasCritical = status.warningLevel === 'critical'
  const hasWarning = status.warningLevel === 'warning'

  // 警告レベルに応じた背景色
  const getBgColor = () => {
    if (hasEmergency) return 'error.dark'
    if (hasCritical) return 'error.main'
    if (hasWarning) return 'warning.main'
    return 'background.paper'
  }

  // 警告レベルに応じたテキスト色
  const getTextColor = () => {
    if (hasEmergency || hasCritical) return 'error.contrastText'
    if (hasWarning) return 'warning.contrastText'
    return 'text.primary'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}>
      <Paper
        elevation={status.hasWarning ? 4 : 1}
        sx={{
          mb: 1.5,
          overflow: 'hidden',
          border: status.hasWarning ? 2 : 0,
          borderColor: hasEmergency
            ? 'error.main'
            : hasCritical
              ? 'error.light'
              : 'warning.main',
          animation: hasEmergency ? 'pulse 1s infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': { opacity: 1 },
            '50%': { opacity: 0.7 },
          },
        }}>
        {/* ヘッダー部分 */}
        <Box
          sx={{
            bgcolor: getBgColor(),
            color: getTextColor(),
            px: 2,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
          }}
          onClick={onSelect}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlightIcon fontSize='small' />
            <Typography variant='subtitle1' fontWeight='bold'>
              {status.droneName}
            </Typography>
            {status.hasWarning && (
              <Chip
                size='small'
                icon={
                  hasEmergency || hasCritical ? <ErrorIcon /> : <WarningIcon />
                }
                label={hasEmergency ? '緊急' : hasCritical ? '重大' : '警告'}
                color={hasEmergency || hasCritical ? 'error' : 'warning'}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <IconButton
            size='small'
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand()
            }}
            sx={{ color: 'inherit' }}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        {/* 警告メッセージ（ある場合） */}
        {status.hasWarning && status.warningMessage && (
          <Alert
            severity={hasEmergency || hasCritical ? 'error' : 'warning'}
            icon={false}
            sx={{
              borderRadius: 0,
              py: 0.5,
              '& .MuiAlert-message': { width: '100%' },
            }}>
            <Typography variant='body2'>{status.warningMessage}</Typography>
          </Alert>
        )}

        {/* 距離情報 */}
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'background.default' }}>
          <Typography
            variant='caption'
            color='text.secondary'
            fontWeight='bold'
            sx={{ display: 'block', mb: 1 }}>
            各退避ポイントまでの距離
          </Typography>
          <Stack spacing={0.5}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='body2'>目的地まで:</Typography>
              <Typography variant='body2' fontWeight='medium'>
                {formatDistance(status.distanceToDestination)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='body2'>退避ポイントまで:</Typography>
              <Typography variant='body2' fontWeight='medium'>
                {formatDistance(status.distanceToEvacuation)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant='body2'>ホームポイントまで:</Typography>
              <Typography variant='body2' fontWeight='medium'>
                {formatDistance(status.distanceToHome)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* 展開時の詳細情報 */}
        <Collapse in={isExpanded}>
          <Divider />
          <Box sx={{ px: 2, py: 1.5 }}>
            {/* バッテリー・信号情報 */}
            <Stack direction='row' spacing={2} sx={{ mb: 2 }}>
              <Tooltip title='バッテリー残量'>
                <Chip
                  icon={<BatteryLowIcon />}
                  label={`${status.batteryLevel.toFixed(0)}%`}
                  size='small'
                  color={
                    status.batteryLevel < 20
                      ? 'error'
                      : status.batteryLevel < 50
                        ? 'warning'
                        : 'default'
                  }
                  variant='outlined'
                />
              </Tooltip>
              <Tooltip title='信号強度'>
                <Chip
                  icon={<SignalLowIcon />}
                  label={`${status.signalStrength.toFixed(0)}%`}
                  size='small'
                  color={
                    status.signalStrength < 30
                      ? 'error'
                      : status.signalStrength < 60
                        ? 'warning'
                        : 'default'
                  }
                  variant='outlined'
                />
              </Tooltip>
            </Stack>

            {/* 関連アラート */}
            {alerts.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  fontWeight='bold'>
                  関連アラート
                </Typography>
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  {alerts.slice(0, 3).map((alert) => (
                    <Typography
                      key={alert.id}
                      variant='caption'
                      color={
                        alert.severity === 'emergency' ||
                        alert.severity === 'critical'
                          ? 'error.main'
                          : 'warning.main'
                      }>
                      {alert.message}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            )}

            {/* アクションボタン */}
            <Stack spacing={1}>
              {status.availableActions.includes('go_to_evacuation') && (
                <Button
                  variant='contained'
                  color='error'
                  fullWidth
                  startIcon={<PlaceIcon />}
                  onClick={() => onAction('go_to_evacuation')}
                  sx={{ fontWeight: 'bold' }}>
                  退避ポイントへ移動
                </Button>
              )}
              {status.availableActions.includes('return_to_home') && (
                <Button
                  variant='contained'
                  color='primary'
                  fullWidth
                  startIcon={<HomeIcon />}
                  onClick={() => onAction('return_to_home')}
                  sx={{ fontWeight: 'bold' }}>
                  ホームポイントへ帰還
                </Button>
              )}
              {status.availableActions.includes('continue_flight') && (
                <Button
                  variant='outlined'
                  color='inherit'
                  fullWidth
                  startIcon={<ContinueIcon />}
                  onClick={() => onAction('continue_flight')}>
                  飛行を継続
                </Button>
              )}
            </Stack>
          </Box>
        </Collapse>
      </Paper>
    </motion.div>
  )
}

export const UTMEvacuationPanel = ({
  drones,
  alerts,
  evacuationPoints = new Map(),
  homePoints = new Map(),
  onClose,
  onEvacuationAction,
  onDroneSelect,
  title = '退避情報とエラー状況',
  maxHeight = '100vh',
}: UTMEvacuationPanelProps) => {
  // 展開状態の管理
  const [expandedDrones, setExpandedDrones] = React.useState<Set<string>>(
    new Set()
  )

  // ドローンごとの退避状況を計算
  const droneEvacuationStatuses = useMemo((): DroneEvacuationStatus[] => {
    return drones.map((drone) => {
      // ドローンに関連するアラートを取得
      const droneAlerts = alerts.filter(
        (alert) => alert.droneId === drone.droneId && !alert.acknowledged
      )

      // 警告レベルを決定
      let warningLevel: DroneEvacuationStatus['warningLevel'] = 'info'
      let warningMessage: string | undefined

      // アラートから警告レベルを決定
      const hasEmergency = droneAlerts.some((a) => a.severity === 'emergency')
      const hasCritical = droneAlerts.some((a) => a.severity === 'critical')
      const hasWarning = droneAlerts.some((a) => a.severity === 'warning')

      if (hasEmergency) {
        warningLevel = 'emergency'
        warningMessage = droneAlerts.find(
          (a) => a.severity === 'emergency'
        )?.message
      } else if (hasCritical) {
        warningLevel = 'critical'
        warningMessage = droneAlerts.find(
          (a) => a.severity === 'critical'
        )?.message
      } else if (hasWarning) {
        warningLevel = 'warning'
        warningMessage = droneAlerts.find(
          (a) => a.severity === 'warning'
        )?.message
      }

      // バッテリー低下チェック
      if (drone.batteryLevel < 20 && warningLevel !== 'emergency') {
        warningLevel = drone.batteryLevel < 10 ? 'critical' : 'warning'
        warningMessage = `バッテリー残量が少ないです。フェールセーフ動作を選択してください。`
      }

      // 距離計算
      const homePoint = homePoints.get(drone.droneId)
      const evacuationPoint = evacuationPoints.get(drone.droneId)

      // ホームポイントまでの距離（デフォルトは経路の最初のポイント）
      let distanceToHome = 0
      if (homePoint) {
        distanceToHome = calculateDistance(
          drone.position.latitude,
          drone.position.longitude,
          homePoint.position.latitude,
          homePoint.position.longitude
        )
      } else if (
        drone.plannedRoute?.waypoints &&
        drone.plannedRoute.waypoints.length > 0
      ) {
        const startPoint = drone.plannedRoute.waypoints[0]
        distanceToHome = calculateDistance(
          drone.position.latitude,
          drone.position.longitude,
          startPoint[1],
          startPoint[0]
        )
      }

      // 退避ポイントまでの距離
      let distanceToEvacuation: number | null = null
      if (evacuationPoint) {
        distanceToEvacuation = calculateDistance(
          drone.position.latitude,
          drone.position.longitude,
          evacuationPoint.position.latitude,
          evacuationPoint.position.longitude
        )
      }

      // 目的地までの距離（経路の最後のポイント）
      let distanceToDestination = 0
      if (
        drone.plannedRoute?.waypoints &&
        drone.plannedRoute.waypoints.length > 0
      ) {
        const endPoint =
          drone.plannedRoute.waypoints[drone.plannedRoute.waypoints.length - 1]
        distanceToDestination = calculateDistance(
          drone.position.latitude,
          drone.position.longitude,
          endPoint[1],
          endPoint[0]
        )
      }

      // 利用可能なアクションを決定
      const availableActions: EvacuationAction[] = []
      if (evacuationPoint) {
        availableActions.push('go_to_evacuation')
      }
      availableActions.push('return_to_home')
      if (warningLevel !== 'emergency') {
        availableActions.push('continue_flight')
      }

      return {
        droneId: drone.droneId,
        droneName: drone.droneName,
        hasWarning: warningLevel !== 'info',
        warningLevel,
        warningMessage,
        distanceToDestination,
        distanceToEvacuation,
        distanceToHome,
        availableActions,
        currentStatus: drone.status,
        batteryLevel: drone.batteryLevel,
        signalStrength: drone.signalStrength,
      }
    })
  }, [drones, alerts, evacuationPoints, homePoints])

  // 警告があるドローンを優先してソート
  const sortedStatuses = useMemo(() => {
    return [...droneEvacuationStatuses].sort((a, b) => {
      const severityOrder = { emergency: 0, critical: 1, warning: 2, info: 3 }
      return severityOrder[a.warningLevel] - severityOrder[b.warningLevel]
    })
  }, [droneEvacuationStatuses])

  // 警告があるドローンの数
  const warningCount = useMemo(() => {
    return droneEvacuationStatuses.filter((s) => s.hasWarning).length
  }, [droneEvacuationStatuses])

  // 展開/折りたたみトグル
  const handleToggleExpand = useCallback((droneId: string) => {
    setExpandedDrones((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(droneId)) {
        newSet.delete(droneId)
      } else {
        newSet.add(droneId)
      }
      return newSet
    })
  }, [])

  // アクション実行
  const handleAction = useCallback(
    (droneId: string, action: EvacuationAction) => {
      onEvacuationAction?.(droneId, action)
    },
    [onEvacuationAction]
  )

  // ドローン選択
  const handleSelect = useCallback(
    (droneId: string) => {
      onDroneSelect?.(droneId)
    },
    [onDroneSelect]
  )

  return (
    <Paper
      elevation={3}
      sx={{
        width: 360,
        maxHeight,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant='subtitle1' fontWeight='bold'>
            {title}
          </Typography>
          {warningCount > 0 && (
            <Chip
              size='small'
              label={warningCount}
              color='error'
              sx={{ height: 20, minWidth: 20 }}
            />
          )}
        </Box>
        {onClose && (
          <IconButton size='small' onClick={onClose} sx={{ color: 'inherit' }}>
            <CloseIcon fontSize='small' />
          </IconButton>
        )}
      </Box>

      {/* ドローンリスト */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 1.5,
          bgcolor: 'grey.100',
        }}>
        {sortedStatuses.length === 0 ? (
          <Typography
            variant='body2'
            color='text.secondary'
            textAlign='center'
            sx={{ py: 4 }}>
            飛行中のドローンがありません
          </Typography>
        ) : (
          <AnimatePresence>
            {sortedStatuses.map((status) => (
              <DroneEvacuationCard
                key={status.droneId}
                status={status}
                alerts={alerts.filter(
                  (a) => a.droneId === status.droneId && !a.acknowledged
                )}
                isExpanded={expandedDrones.has(status.droneId)}
                onToggleExpand={() => handleToggleExpand(status.droneId)}
                onAction={(action) => handleAction(status.droneId, action)}
                onSelect={() => handleSelect(status.droneId)}
              />
            ))}
          </AnimatePresence>
        )}
      </Box>

      {/* フッター（サマリー） */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}>
        <Typography variant='caption' color='text.secondary'>
          飛行中: {drones.length}機 / 警告: {warningCount}件
        </Typography>
      </Box>
    </Paper>
  )
}

export default UTMEvacuationPanel
