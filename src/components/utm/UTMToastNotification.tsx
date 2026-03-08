/**
 * UTMトースト通知コンポーネント
 * ドローンのステータス変化やアラートを動的に通知
 */

import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'
import CloseIcon from '@mui/icons-material/Close'
import ErrorIcon from '@mui/icons-material/Error'
import FlightIcon from '@mui/icons-material/Flight'
import FlightLandIcon from '@mui/icons-material/FlightLand'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import HomeIcon from '@mui/icons-material/Home'
import SignalCellularConnectedNoInternet0BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0Bar'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Alert,
  AlertTitle,
  Box,
  Typography,
  IconButton,
  alpha,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, useRef } from 'react'

import { colors } from '@/styles/tokens'

import type { DroneFlightStatus, UTMAlert } from '../../types/utmTypes'

// サウンド設定の型
export interface SoundSettings {
  enabled: boolean
  warningSound: boolean
  errorSound: boolean
  emergencySound: boolean
}

// 単一のAudioContextインスタンスを保持（メモリリーク防止）
let sharedAudioContext: AudioContext | null = null

const getAudioContext = (): AudioContext | null => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as never)['webkitAudioContext']
    if (!AudioContextClass) return null

    if (!sharedAudioContext) {
      sharedAudioContext = new AudioContextClass()
    }

    // suspended状態の場合はresumeする
    if (sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume()
    }

    return sharedAudioContext
  } catch {
    return null
  }
}

// アラート音を再生する関数（Web Audio API使用）
const playAlertSound = (severity: 'warning' | 'error' | 'emergency') => {
  try {
    const audioCtx = getAudioContext()
    if (!audioCtx) return

    // 警告レベルに応じた周波数とパターン
    const config =
      severity === 'emergency'
        ? { freq: 880, beeps: 3, duration: 0.15 } // 高音3回
        : severity === 'error'
          ? { freq: 660, beeps: 2, duration: 0.2 } // 中高音2回
          : { freq: 440, beeps: 1, duration: 0.25 } // 低音1回

    const { freq, beeps, duration } = config

    for (let i = 0; i < beeps; i++) {
      const startTime = audioCtx.currentTime + i * (duration + 0.1)

      // オシレーター（音源）
      const oscillator = audioCtx.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(freq, startTime)

      // ゲイン（音量）
      const gainNode = audioCtx.createGain()
      gainNode.gain.setValueAtTime(0, startTime)
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.02) // フェードイン
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + duration - 0.02)
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration) // フェードアウト

      oscillator.connect(gainNode)
      gainNode.connect(audioCtx.destination)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    }
  } catch {
    // オーディオ再生に失敗した場合は静かに無視
    console.debug('Alert sound playback failed')
  }
}

// トースト通知の種類
export type ToastType =
  | 'status_change'
  | 'alert'
  | 'warning'
  | 'info'
  | 'success'
  | 'error'

// トースト通知データ
export interface ToastNotification {
  id: string
  type: ToastType
  title: string
  message: string
  droneId?: string
  droneName?: string
  /** 通知の元になったドローンステータス（status_change用） */
  droneStatus?: DroneFlightStatus['status']
  /** 通知の元になったアラート種別（alert / warning系用） */
  alertType?: UTMAlert['type']
  severity?: 'info' | 'warning' | 'error' | 'success'
  autoHideDuration?: number
  timestamp: Date
}

interface UTMToastNotificationProps {
  notifications: ToastNotification[]
  onClose: (id: string) => void
  maxVisible?: number
}

// ステータス変化のアイコンを取得
const getStatusIcon = (
  status?: DroneFlightStatus['status'],
  alertType?: UTMAlert['type']
) => {
  if (alertType) {
    switch (alertType) {
      case 'low_battery':
        return <BatteryAlertIcon />
      case 'signal_loss':
        return <SignalCellularConnectedNoInternet0BarIcon />
      case 'zone_violation':
      case 'zone_approach':
        return <WarningAmberIcon />
      case 'collision_warning':
      case 'collision_alert':
        return <ErrorIcon />
      default:
        return <WarningAmberIcon />
    }
  }

  switch (status) {
    case 'takeoff':
      return <FlightTakeoffIcon />
    case 'landing':
    case 'landed':
      return <FlightLandIcon />
    case 'in_flight':
      return <FlightIcon />
    case 'rth':
      return <HomeIcon />
    case 'emergency':
      return <ErrorIcon />
    default:
      return <FlightIcon />
  }
}

const getToastIcon = (notification: ToastNotification) => {
  if (notification.alertType) {
    return getStatusIcon(undefined, notification.alertType)
  }
  if (notification.droneStatus) {
    return getStatusIcon(notification.droneStatus)
  }

  switch (notification.severity) {
    case 'error':
      return <ErrorIcon />
    case 'warning':
      return <WarningAmberIcon />
    case 'success':
      return <FlightIcon />
    default:
      return <FlightIcon />
  }
}

// ステータス変化のメッセージを取得
export const getStatusChangeMessage = (
  prevStatus: DroneFlightStatus['status'] | null,
  newStatus: DroneFlightStatus['status']
): string => {
  switch (newStatus) {
    case 'takeoff':
      return '離陸を開始しました'
    case 'in_flight':
      return prevStatus === 'takeoff'
        ? '飛行中に移行しました'
        : '飛行を再開しました'
    case 'landing':
      return '着陸を開始しました'
    case 'landed':
      return '安全に着陸しました'
    case 'rth':
      return 'RTH（帰還）モードに切り替わりました'
    case 'emergency':
      return '緊急事態が発生しました！'
    case 'preflight':
      return '飛行前チェック中です'
    default:
      return `ステータスが${newStatus}に変化しました`
  }
}

// 単一のトースト通知
const ToastItem = ({
  notification,
  onClose,
}: {
  notification: ToastNotification
  onClose: () => void
}) => {
  const [open, setOpen] = useState(true)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => onCloseRef.current(), 300)
  }

  // 自動消去タイマー（マウント時に一度だけ設定）
  useEffect(() => {
    const duration = notification.autoHideDuration || 3500
    const timer = setTimeout(() => {
      setOpen(false)
      setTimeout(() => onCloseRef.current(), 300)
    }, duration)

    return () => clearTimeout(timer)
    // notification.idで一意に識別し、一度だけタイマー設定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notification.id])

  const getSeverityColor = () => {
    switch (notification.severity) {
      case 'error':
        return colors.error.main
      case 'warning':
        return colors.warning.main
      case 'success':
        return colors.success.main
      default:
        return colors.info.main
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, y: 20 }}
      animate={{ opacity: open ? 1 : 0, x: open ? 0 : 50, y: 0 }}
      exit={{ opacity: 0, x: 50, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        marginTop: 8,
        pointerEvents: 'auto',
      }}>
      <Alert
        severity={notification.severity || 'info'}
        variant='filled'
        onClose={handleClose}
        sx={{
          minWidth: 320,
          maxWidth: 400,
          boxShadow: `0 4px 20px ${alpha(getSeverityColor(), 0.4)}`,
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          backgroundColor: alpha(getSeverityColor(), 0.82),
          '& .MuiAlert-icon': {
            fontSize: 24,
          },
          '& .MuiAlert-action': {
            pt: 0,
          },
        }}
        icon={getToastIcon(notification)}
        action={
          <IconButton
            size='small'
            color='inherit'
            onClick={handleClose}
            sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}>
            <CloseIcon fontSize='small' />
          </IconButton>
        }>
        <AlertTitle sx={{ fontWeight: 700, mb: 0.25 }}>
          {notification.title}
        </AlertTitle>
        <Typography variant='body2' sx={{ opacity: 0.9 }}>
          {notification.message}
        </Typography>
        {notification.droneName && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5,
              opacity: 0.8,
            }}>
            <FlightIcon sx={{ fontSize: 14 }} />
            <Typography variant='caption'>{notification.droneName}</Typography>
          </Box>
        )}
        <Typography
          variant='caption'
          sx={{ display: 'block', mt: 0.5, opacity: 0.6 }}>
          {notification.timestamp.toLocaleTimeString('ja-JP')}
        </Typography>
      </Alert>
    </motion.div>
  )
}

// トースト通知コンテナ
const UTMToastNotification = ({
  notifications,
  onClose,
  maxVisible = 1, // デフォルトは1つだけ表示（スタックしない）
}: UTMToastNotificationProps) => {
  // 最新の通知のみ表示
  const visibleNotifications = notifications.slice(-maxVisible)

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16, // 右下に配置
        right: 16,
        zIndex: 1400,
        pointerEvents: 'none',
      }}>
      <AnimatePresence mode='popLayout'>
        {visibleNotifications.map((notification) => (
          <ToastItem
            key={notification.id}
            notification={notification}
            onClose={() => onClose(notification.id)}
          />
        ))}
      </AnimatePresence>
    </Box>
  )
}

export default UTMToastNotification

// トースト通知を管理するカスタムフック
export const useToastNotifications = (soundSettings?: SoundSettings) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([])
  const lastSoundTimeRef = useRef<number>(0)

  // サウンド設定に基づいて音を再生するかどうかを判定
  const shouldPlaySound = useCallback(
    (severity: 'warning' | 'error', isEmergency: boolean): boolean => {
      if (!soundSettings?.enabled) return false

      if (isEmergency) {
        return soundSettings.emergencySound
      }
      if (severity === 'error') {
        return soundSettings.errorSound
      }
      if (severity === 'warning') {
        return soundSettings.warningSound
      }
      return false
    },
    [soundSettings]
  )

  const addNotification = useCallback(
    (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => {
      const newNotification: ToastNotification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      }
      setNotifications((prev) => [...prev, newNotification])

      // サウンド設定に基づいてアラート音を再生（連続再生防止: 1秒間隔）
      const now = Date.now()
      if (now - lastSoundTimeRef.current > 1000) {
        const isEmergency =
          notification.type === 'alert' ||
          notification.droneStatus === 'emergency'

        if (notification.severity === 'error') {
          if (shouldPlaySound('error', isEmergency)) {
            playAlertSound(isEmergency ? 'emergency' : 'error')
            lastSoundTimeRef.current = now
          }
        } else if (notification.severity === 'warning') {
          if (shouldPlaySound('warning', false)) {
            playAlertSound('warning')
            lastSoundTimeRef.current = now
          }
        }
      }
    },
    [shouldPlaySound]
  )

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // ドローンステータス変化を監視して通知を生成
  const notifyStatusChange = useCallback(
    (
      drone: DroneFlightStatus,
      prevStatus: DroneFlightStatus['status'] | null
    ) => {
      const message = getStatusChangeMessage(prevStatus, drone.status)
      let severity: ToastNotification['severity']

      switch (drone.status) {
        case 'emergency':
          severity = 'error'
          break
        case 'rth':
        case 'landing':
          severity = 'warning'
          break
        case 'landed':
          severity = 'success'
          break
        default:
          severity = 'info'
      }

      addNotification({
        type: 'status_change',
        title: 'ステータス変化',
        message,
        droneId: drone.droneId,
        droneName: drone.droneName,
        droneStatus: drone.status,
        severity,
        autoHideDuration: drone.status === 'emergency' ? 4000 : 3500, // 3.5秒で自動消去
      })
    },
    [addNotification]
  )

  // アラートを通知
  const notifyAlert = useCallback(
    (alert: UTMAlert) => {
      let severity: ToastNotification['severity']

      switch (alert.severity) {
        case 'emergency':
        case 'critical':
          severity = 'error'
          break
        case 'warning':
          severity = 'warning'
          break
        default:
          severity = 'info'
      }

      addNotification({
        type: 'alert',
        title: alert.type === 'zone_violation' ? '区域侵入警告' : 'アラート',
        message: alert.message,
        droneId: alert.droneId,
        droneName: alert.droneName,
        alertType: alert.type,
        severity,
        autoHideDuration:
          alert.severity === 'emergency' || alert.severity === 'critical'
            ? 4000
            : 3500, // 3.5秒で自動消去
      })
    },
    [addNotification]
  )

  // バッテリー低下警告
  const notifyLowBattery = useCallback(
    (drone: DroneFlightStatus) => {
      addNotification({
        type: 'warning',
        title: 'バッテリー低下',
        message: `バッテリー残量が${drone.batteryLevel.toFixed(0)}%です。帰還を検討してください。`,
        droneId: drone.droneId,
        droneName: drone.droneName,
        alertType: 'low_battery',
        severity: drone.batteryLevel < 15 ? 'error' : 'warning',
        autoHideDuration: 3500, // 3.5秒で自動消去
      })
    },
    [addNotification]
  )

  // 信号低下警告
  const notifyLowSignal = useCallback(
    (drone: DroneFlightStatus) => {
      addNotification({
        type: 'warning',
        title: '信号低下',
        message: `信号強度が${drone.signalStrength.toFixed(0)}%に低下しています。`,
        droneId: drone.droneId,
        droneName: drone.droneName,
        alertType: 'signal_loss',
        severity: drone.signalStrength < 30 ? 'error' : 'warning',
        autoHideDuration: 3500, // 3.5秒で自動消去
      })
    },
    [addNotification]
  )

  return {
    notifications,
    addNotification,
    removeNotification,
    notifyStatusChange,
    notifyAlert,
    notifyLowBattery,
    notifyLowSignal,
  }
}
