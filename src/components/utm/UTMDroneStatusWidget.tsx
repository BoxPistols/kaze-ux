/**
 * UTMドローンステータスウィジェット
 * 選択されたドローンのバッテリー・信号・高度をリアルタイムで表示
 */

import Battery30Icon from '@mui/icons-material/Battery30'
import Battery60Icon from '@mui/icons-material/Battery60'
import Battery80Icon from '@mui/icons-material/Battery80'
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert'
import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import CloseIcon from '@mui/icons-material/Close'
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExploreIcon from '@mui/icons-material/Explore'
import FlightIcon from '@mui/icons-material/Flight'
import HeightIcon from '@mui/icons-material/Height'
import HomeIcon from '@mui/icons-material/Home'
import RotateLeftIcon from '@mui/icons-material/RotateLeft'
import SignalCellular1BarIcon from '@mui/icons-material/SignalCellular1Bar'
import SignalCellular2BarIcon from '@mui/icons-material/SignalCellular2Bar'
import SignalCellular3BarIcon from '@mui/icons-material/SignalCellular3Bar'
import SignalCellular4BarIcon from '@mui/icons-material/SignalCellular4Bar'
import SignalCellularOffIcon from '@mui/icons-material/SignalCellularOff'
import SpeedIcon from '@mui/icons-material/Speed'
import ThreeSixtyIcon from '@mui/icons-material/ThreeSixty'
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Stack,
  Chip,
  alpha,
  useTheme,
  IconButton,
  Collapse,
  Tooltip,
} from '@mui/material'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'
import React, { useCallback, useEffect, useRef, memo, useMemo } from 'react'

import { colors } from '@/styles/tokens'
import { getDroneDisplayColor } from '@/utils'

import type { DroneFlightStatus } from '../../types/utmTypes'

type AttitudeVec3 = Readonly<{ x: number; y: number; z: number }>
type AttitudeVec2Z = Readonly<{ x: number; y: number; z: number }>

const attitudeDegToRad = (deg: number): number => (deg * Math.PI) / 180

const attitudeHexToRgba = (hex: string, a: number): string => {
  const normalized = hex.trim()
  const match = /^#([0-9a-fA-F]{6})$/.exec(normalized)
  if (!match) return `rgba(255,255,255,${Math.min(Math.max(a, 0), 1)})`
  const int = Number.parseInt(match[1], 16)
  const r = (int >> 16) & 0xff
  const g = (int >> 8) & 0xff
  const b = int & 0xff
  const alphaClamped = Math.min(Math.max(a, 0), 1)
  return `rgba(${r},${g},${b},${alphaClamped})`
}

const attitudeRotateBody = (
  v: AttitudeVec3,
  rollRad: number,
  pitchRad: number,
  yawRad: number
): AttitudeVec3 => {
  // 航空機の一般的な定義に合わせる:
  // - roll  : 機首方向(前方)軸まわり
  // - pitch : 右方向軸まわり
  // - yaw   : 上方向軸まわり（方位）
  // v' = Rz(yaw) * Ry(pitch) * Rx(roll) * v

  // roll (X)
  const cr = Math.cos(rollRad)
  const sr = Math.sin(rollRad)
  const x1 = v.x
  const y1 = v.y * cr - v.z * sr
  const z1 = v.y * sr + v.z * cr

  // pitch (Y)
  const cp = Math.cos(pitchRad)
  const sp = Math.sin(pitchRad)
  const x2 = x1 * cp + z1 * sp
  const y2 = y1
  const z2 = -x1 * sp + z1 * cp

  // yaw (Z)
  const cy = Math.cos(yawRad)
  const sy = Math.sin(yawRad)
  const x3 = x2 * cy - y2 * sy
  const y3 = x2 * sy + y2 * cy
  const z3 = z2

  return { x: x3, y: y3, z: z3 }
}

const attitudeProject = (
  v: AttitudeVec3,
  cx: number,
  cy: number,
  scale: number
): AttitudeVec2Z => {
  // 斜め上方視点からの3D投影（航空機ADI風）
  // カメラ位置: 斜め前方上から見下ろす
  const cameraAngle = Math.PI / 5 // 約36度の俯角
  const cosA = Math.cos(cameraAngle)
  const sinA = Math.sin(cameraAngle)

  // Y軸回転（カメラの俯角）を適用
  const y2 = v.y * cosA - v.z * sinA
  const z2 = v.y * sinA + v.z * cosA

  // 遠近法の適用（奥行きによるスケール）
  const perspective = 200
  const depthScale = perspective / (perspective + z2 * 0.5)

  const px = cx + v.x * scale * depthScale
  const py = cy - y2 * scale * depthScale

  return { x: px, y: py, z: z2 }
}

interface UTMDroneStatusWidgetProps {
  drone: DroneFlightStatus | null
  onClose?: () => void
  groundLevel?: number // 地上高（デモ用）
  collapsed?: boolean // 外部から制御する折りたたみ状態
  onCollapsedChange?: (collapsed: boolean) => void // 折りたたみ状態変更通知
  draggable?: boolean // ドラッグ可能にするか
  dragConstraints?:
    | React.RefObject<HTMLElement | null>
    | { top?: number; right?: number; bottom?: number; left?: number } // ドラッグ制約
  sx?: import('@mui/system').SxProps<import('@mui/material').Theme> // カスタムスタイル
}

// バッテリーアイコンを取得
const getBatteryIcon = (level: number) => {
  if (level >= 80) return <BatteryFullIcon />
  if (level >= 60) return <Battery80Icon />
  if (level >= 40) return <Battery60Icon />
  if (level >= 20) return <Battery30Icon />
  return <BatteryAlertIcon />
}

// バッテリー色を取得
const getBatteryColor = (level: number) => {
  if (level >= 60) return colors.success.main
  if (level >= 30) return colors.warning.main
  return colors.error.main
}

// 信号アイコンを取得
const getSignalIcon = (strength: number) => {
  if (strength >= 80) return <SignalCellular4BarIcon />
  if (strength >= 60) return <SignalCellular3BarIcon />
  if (strength >= 40) return <SignalCellular2BarIcon />
  if (strength >= 20) return <SignalCellular1BarIcon />
  return <SignalCellularOffIcon />
}

// 信号色を取得
const getSignalColor = (strength: number) => {
  if (strength >= 70) return colors.success.main
  if (strength >= 40) return colors.warning.main
  return colors.error.main
}

// 飛行モードラベル
const getFlightModeLabel = (mode: DroneFlightStatus['flightMode']) => {
  switch (mode) {
    case 'manual':
      return 'マニュアル'
    case 'auto':
      return '自動'
    case 'rth':
      return 'RTH'
    case 'hover':
      return 'ホバリング'
    case 'landing':
      return '着陸中'
    default:
      return mode
  }
}

// ステータスラベル
const getStatusLabel = (status: DroneFlightStatus['status']) => {
  switch (status) {
    case 'preflight':
      return '飛行前'
    case 'takeoff':
      return '離陸中'
    case 'in_flight':
      return '飛行中'
    case 'landing':
      return '着陸中'
    case 'landed':
      return '着陸済'
    case 'rth':
      return '帰還中'
    case 'hovering':
      return 'ホバリング'
    case 'emergency':
      return '緊急'
    default:
      return status
  }
}

// ステータス色
const getStatusColor = (status: DroneFlightStatus['status']) => {
  switch (status) {
    case 'in_flight':
      return colors.success.main
    case 'takeoff':
    case 'rth':
    case 'landing':
    case 'hovering':
      return colors.warning.main
    case 'emergency':
      return colors.error.main
    case 'landed':
      return colors.info.main
    default:
      return colors.gray[500]
  }
}

// 円形ゲージコンポーネント（メモ化）
const CircularGauge = memo(
  ({
    value,
    max,
    size = 56,
    thickness = 4,
    color,
    icon,
    label,
    unit,
    animated = true,
  }: {
    value: number
    max: number
    size?: number
    thickness?: number
    color: string
    icon: React.ReactNode
    label: string
    unit: string
    animated?: boolean
  }) => {
    const percentage = useMemo(
      () => Math.min((value / max) * 100, 100),
      [value, max]
    )

    return (
      <Box
        sx={{
          position: 'relative',
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <Box sx={{ position: 'relative', width: size, height: size }}>
          {/* 背景の円 */}
          <CircularProgress
            variant='determinate'
            value={100}
            size={size}
            thickness={thickness}
            sx={{
              color: alpha(color, 0.15),
              position: 'absolute',
            }}
          />
          {/* 値の円 */}
          <CircularProgress
            variant='determinate'
            value={animated ? percentage : 0}
            size={size}
            thickness={thickness}
            sx={{
              color,
              position: 'absolute',
              transition: animated ? 'all 0.5s ease-out' : 'none',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          {/* 中央のアイコンと値 */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              '& .MuiSvgIcon-root': {
                fontSize: 14,
              },
            }}>
            <Box sx={{ color, mb: -0.25 }}>{icon}</Box>
            <Typography
              variant='caption'
              fontWeight={700}
              sx={{ color, lineHeight: 1.1, fontSize: '0.7rem' }}>
              {value.toFixed(0)}
              <Typography
                component='span'
                variant='caption'
                sx={{ fontSize: '0.625rem' }}>
                {unit}
              </Typography>
            </Typography>
          </Box>
        </Box>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ mt: 0.25, fontSize: '0.625rem' }}>
          {label}
        </Typography>
      </Box>
    )
  }
)

CircularGauge.displayName = 'CircularGauge'

// 高度インジケーター（メモ化）
const AltitudeIndicator = memo(
  ({
    altitude,
    groundLevel = 0,
    maxAltitude = 150,
  }: {
    altitude: number
    groundLevel?: number
    maxAltitude?: number
  }) => {
    const agl = useMemo(() => altitude - groundLevel, [altitude, groundLevel])
    const percentage = useMemo(
      () => Math.min((altitude / maxAltitude) * 100, 100),
      [altitude, maxAltitude]
    )

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 1,
          borderRadius: 1.5,
          bgcolor: alpha(colors.info.main, 0.05),
          border: `1px solid ${alpha(colors.info.main, 0.2)}`,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <HeightIcon sx={{ fontSize: 14, color: colors.info.main }} />
          <Typography
            variant='caption'
            fontWeight={600}
            sx={{ fontSize: '0.7rem' }}>
            高度
          </Typography>
        </Box>

        {/* 高度バー */}
        <Box
          sx={{
            position: 'relative',
            width: 28,
            height: 60,
            bgcolor: alpha(colors.info.main, 0.1),
            borderRadius: 1.5,
            overflow: 'hidden',
          }}>
          {/* 地上レベルマーク */}
          {groundLevel > 0 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: `${(groundLevel / maxAltitude) * 100}%`,
                left: 0,
                right: 0,
                height: 1.5,
                bgcolor: colors.warning.main,
              }}
            />
          )}

          {/* 現在の高度 */}
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: `linear-gradient(to top, ${colors.info.main}, ${alpha(colors.info.main, 0.5)})`,
              borderRadius: '6px 6px 0 0',
            }}
          />

          {/* ドローンアイコン */}
          <motion.div
            animate={{ bottom: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translate(-50%, 50%)',
            }}>
            <FlightIcon
              sx={{
                fontSize: 12,
                color: '#fff',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
              }}
            />
          </motion.div>
        </Box>

        {/* 高度表示 */}
        <Stack spacing={0} alignItems='center' sx={{ mt: 0.5 }}>
          <Typography
            variant='body2'
            fontWeight={700}
            sx={{
              color: colors.info.main,
              lineHeight: 1,
              fontSize: '0.85rem',
            }}>
            {altitude.toFixed(0)}m
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.625rem' }}>
              MSL
            </Typography>
            {groundLevel > 0 && (
              <Typography
                variant='caption'
                sx={{ color: colors.warning.main, fontSize: '0.625rem' }}>
                AGL:{agl.toFixed(0)}m
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
    )
  }
)

AltitudeIndicator.displayName = 'AltitudeIndicator'

// 姿勢インジケーター（3Dジンバル風：roll / pitch / yaw）（メモ化）
// - 中央: 機体（姿勢＝roll/pitch/yaw）
// - 右上: XYZ固定ギズモ（ワールド軸）
const AttitudeIndicator = memo(
  ({
    roll,
    pitch,
    yaw,
    accentColor,
  }: {
    roll: number
    pitch: number
    yaw: number
    accentColor: string
  }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    // ピッチの色を決定（上昇/下降で色を変える）
    const getPitchColor = (p: number) => {
      if (Math.abs(p) < 5) return colors.success.main
      if (Math.abs(p) < 15) return colors.warning.main
      return colors.error.main
    }

    // ロールの色を決定
    const getRollColor = (r: number) => {
      if (Math.abs(r) < 10) return colors.success.main
      if (Math.abs(r) < 20) return colors.warning.main
      return colors.error.main
    }

    const normalizedYaw = ((yaw % 360) + 360) % 360

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr =
        typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
      const w = 96
      const h = 72

      const targetW = Math.round(w * dpr)
      const targetH = Math.round(h * dpr)
      if (canvas.width !== targetW) canvas.width = targetW
      if (canvas.height !== targetH) canvas.height = targetH
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      // CSSピクセル基準で描画
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const cx = w / 2
      const cy = h / 2
      const scale = 1.0

      const rollRad = attitudeDegToRad(roll)
      const pitchRad = attitudeDegToRad(pitch)
      // 方位（0°=北）を「画面上」に合わせ、時計回り増加に合わせて補正
      const yawRad = attitudeDegToRad(90 - normalizedYaw)

      // 人工水平儀風の背景（空と地面）
      ctx.save()
      ctx.beginPath()
      ctx.rect(0, 0, w, h)
      ctx.clip()

      // ロールとピッチに応じて地平線を描画
      const horizonOffset = pitch * 0.8 // ピッチによる地平線のオフセット
      const horizonY = cy + horizonOffset

      // 空（上半分）- ロールに応じて回転
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-rollRad)
      ctx.translate(-cx, -cy)

      // 空のグラデーション
      const skyGradient = ctx.createLinearGradient(
        0,
        horizonY - 60,
        0,
        horizonY
      )
      skyGradient.addColorStop(0, 'rgba(59, 130, 246, 0.4)')
      skyGradient.addColorStop(1, 'rgba(147, 197, 253, 0.3)')
      ctx.fillStyle = skyGradient
      ctx.fillRect(-w, horizonY - 100, w * 3, 100)

      // 地面のグラデーション
      const groundGradient = ctx.createLinearGradient(
        0,
        horizonY,
        0,
        horizonY + 60
      )
      groundGradient.addColorStop(0, 'rgba(161, 98, 7, 0.35)')
      groundGradient.addColorStop(1, 'rgba(120, 53, 15, 0.25)')
      ctx.fillStyle = groundGradient
      ctx.fillRect(-w, horizonY, w * 3, 100)

      // 地平線
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(-w, horizonY)
      ctx.lineTo(w * 2, horizonY)
      ctx.stroke()

      // ピッチスケール（水平線の目盛り）
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
      ctx.lineWidth = 1
      const pitchScales = [-20, -10, 10, 20]
      for (const ps of pitchScales) {
        const scaleY = horizonY - ps * 0.8
        const scaleWidth = Math.abs(ps) === 20 ? 12 : 18
        ctx.beginPath()
        ctx.moveTo(cx - scaleWidth, scaleY)
        ctx.lineTo(cx + scaleWidth, scaleY)
        ctx.stroke()
      }

      ctx.restore()
      ctx.restore()

      // モデル定義（ボディ座標）:
      // x = 前方（ノーズ方向）, y = 右, z = 上
      const arm = 20
      const bodyL = 16
      const bodyW = 9
      const bodyH = 4

      const motors: readonly AttitudeVec3[] = [
        { x: arm, y: arm, z: 0 },
        { x: -arm, y: arm, z: 0 },
        { x: -arm, y: -arm, z: 0 },
        { x: arm, y: -arm, z: 0 },
      ]

      const body: readonly AttitudeVec3[] = [
        { x: -bodyL / 2, y: -bodyW / 2, z: bodyH },
        { x: bodyL / 2, y: -bodyW / 2, z: bodyH },
        { x: bodyL / 2, y: bodyW / 2, z: bodyH },
        { x: -bodyL / 2, y: bodyW / 2, z: bodyH },
      ]

      // 底面（3D効果のため）
      const bodyBottom: readonly AttitudeVec3[] = [
        { x: -bodyL / 2, y: -bodyW / 2, z: 0 },
        { x: bodyL / 2, y: -bodyW / 2, z: 0 },
        { x: bodyL / 2, y: bodyW / 2, z: 0 },
        { x: -bodyL / 2, y: bodyW / 2, z: 0 },
      ]

      const nose: readonly AttitudeVec3[] = [
        { x: bodyL / 2 + 8, y: 0, z: bodyH * 0.7 },
        { x: bodyL / 2, y: 4, z: bodyH },
        { x: bodyL / 2, y: -4, z: bodyH },
      ]

      const transformPoint = (p: AttitudeVec3): AttitudeVec3 =>
        attitudeRotateBody(p, rollRad, pitchRad, yawRad)
      const to2d = (p: AttitudeVec3): AttitudeVec2Z =>
        attitudeProject(transformPoint(p), cx, cy, scale)

      // アーム（2本の対角線）
      const m2d = motors.map(to2d)
      const armPairs: readonly [number, number][] = [
        [0, 2],
        [1, 3],
      ]

      // アームを奥行き順でソート
      const armData = armPairs.map(([a, b]) => ({
        pair: [a, b] as [number, number],
        avgZ: (m2d[a].z + m2d[b].z) / 2,
      }))
      armData.sort((x, y) => x.avgZ - y.avgZ)

      ctx.save()
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      for (const { pair } of armData) {
        const [a, b] = pair
        // 奥行きに応じた太さと透明度
        const avgZ = (m2d[a].z + m2d[b].z) / 2
        const depthFactor = 0.6 + (avgZ + 20) / 60
        ctx.lineWidth = 3.5 * Math.max(0.5, depthFactor)
        ctx.strokeStyle = attitudeHexToRgba(
          accentColor,
          0.7 * Math.max(0.4, depthFactor)
        )
        ctx.shadowColor = 'rgba(0,0,0,0.4)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 2
        ctx.beginPath()
        ctx.moveTo(m2d[a].x, m2d[a].y)
        ctx.lineTo(m2d[b].x, m2d[b].y)
        ctx.stroke()
      }
      ctx.restore()

      // 胴体の側面（3D効果）
      const body2d = body.map(to2d)
      const bodyBottom2d = bodyBottom.map(to2d)

      // 側面を描画（見える面のみ）
      ctx.save()
      const sides: [number, number][] = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 0],
      ]
      for (const [i, j] of sides) {
        const topA = body2d[i]
        const topB = body2d[j]
        const botA = bodyBottom2d[i]
        const botB = bodyBottom2d[j]

        // 面の向きを計算（法線のZ成分で判定）
        const normalZ =
          (topB.x - topA.x) * (botA.y - topA.y) -
          (topB.y - topA.y) * (botA.x - topA.x)
        if (normalZ < 0) continue // 裏面はスキップ

        ctx.beginPath()
        ctx.moveTo(topA.x, topA.y)
        ctx.lineTo(topB.x, topB.y)
        ctx.lineTo(botB.x, botB.y)
        ctx.lineTo(botA.x, botA.y)
        ctx.closePath()
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)'
        ctx.fill()
        ctx.strokeStyle = attitudeHexToRgba(accentColor, 0.4)
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
      ctx.restore()

      // 胴体上面
      const avgZ =
        body2d.reduce((sum, p) => sum + p.z, 0) / Math.max(1, body2d.length)
      const topAlpha = 0.3 + Math.min(Math.max(avgZ / 30, -0.15), 0.15)

      ctx.save()
      ctx.beginPath()
      ctx.moveTo(body2d[0].x, body2d[0].y)
      ctx.lineTo(body2d[1].x, body2d[1].y)
      ctx.lineTo(body2d[2].x, body2d[2].y)
      ctx.lineTo(body2d[3].x, body2d[3].y)
      ctx.closePath()
      ctx.shadowColor = 'rgba(0,0,0,0.4)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 2
      ctx.fillStyle = 'rgba(17, 24, 39, 0.9)'
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.fillStyle = attitudeHexToRgba('#ffffff', topAlpha)
      ctx.fill()
      ctx.strokeStyle = attitudeHexToRgba(accentColor, 0.6)
      ctx.lineWidth = 1.2
      ctx.stroke()

      // 中央のドット
      ctx.beginPath()
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = attitudeHexToRgba('#ffffff', 0.85)
      ctx.fill()
      ctx.restore()

      // ノーズ（進行方向）
      const nose2d = nose.map(to2d)
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(nose2d[0].x, nose2d[0].y)
      ctx.lineTo(nose2d[1].x, nose2d[1].y)
      ctx.lineTo(nose2d[2].x, nose2d[2].y)
      ctx.closePath()
      ctx.fillStyle = attitudeHexToRgba(accentColor, 0.95)
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 6
      ctx.shadowOffsetY = 2
      ctx.fill()
      ctx.restore()

      // モーター（奥→手前の順で描画）
      const motorsSorted = m2d
        .map((p, idx) => ({ p, idx }))
        .sort((a, b) => a.p.z - b.p.z)

      for (const { p } of motorsSorted) {
        const depthFactor = 0.6 + (p.z + 20) / 60
        const r = 3.2 * Math.max(0.6, depthFactor)
        ctx.save()
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.85 * Math.max(0.5, depthFactor)})`
        ctx.strokeStyle = 'rgba(0,0,0,0.3)'
        ctx.lineWidth = 0.8
        ctx.shadowColor = 'rgba(0,0,0,0.3)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 1
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }

      // 固定のロールインジケーター（画面上部中央）
      ctx.save()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.lineWidth = 1.5

      // 中央の三角マーカー（機体の基準）
      ctx.beginPath()
      ctx.moveTo(cx, 6)
      ctx.lineTo(cx - 4, 2)
      ctx.lineTo(cx + 4, 2)
      ctx.closePath()
      ctx.fill()

      ctx.restore()
    }, [roll, pitch, normalizedYaw, accentColor])

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 1,
          borderRadius: 1.5,
          bgcolor: alpha(accentColor, 0.03),
          border: `1px solid ${alpha(accentColor, 0.12)}`,
        }}>
        {/* タイトル */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ThreeSixtyIcon sx={{ fontSize: 14, color: accentColor }} />
          <Typography
            variant='caption'
            fontWeight={600}
            sx={{ fontSize: '0.7rem' }}>
            姿勢
          </Typography>
        </Box>

        {/* 3Dジンバル風ビュー */}
        <Box
          sx={{
            position: 'relative',
            width: 96,
            height: 72,
            borderRadius: 1,
            overflow: 'hidden',
            border: `2px solid ${alpha(colors.gray[500], 0.3)}`,
            bgcolor: alpha(colors.gray[900], 0.95),
            alignSelf: 'center',
          }}>
          {/* 背景グリッド */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(${alpha('#fff', 0.06)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#fff', 0.06)} 1px, transparent 1px)`,
              backgroundSize: '12px 12px',
              opacity: 0.85,
            }}
          />

          {/* 機体（Canvas描画：方位と姿勢を安定して表示） */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}>
            <canvas
              ref={canvasRef}
              aria-label='drone attitude canvas'
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                pointerEvents: 'none',
              }}
            />
          </Box>
        </Box>

        {/* 数値表示 */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0.5,
            textAlign: 'center',
          }}>
          {/* ロール */}
          <Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.25,
              }}>
              <RotateLeftIcon
                sx={{ fontSize: 10, color: getRollColor(roll) }}
              />
              <Typography
                variant='caption'
                fontWeight={700}
                sx={{ fontSize: '0.65rem', color: getRollColor(roll) }}>
                {roll >= 0 ? '+' : ''}
                {roll.toFixed(1)}°
              </Typography>
            </Box>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.625rem' }}>
              Roll
            </Typography>
          </Box>

          {/* ピッチ */}
          <Box>
            <Typography
              variant='caption'
              fontWeight={700}
              sx={{ fontSize: '0.65rem', color: getPitchColor(pitch) }}>
              {pitch >= 0 ? '+' : ''}
              {pitch.toFixed(1)}°
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.625rem' }}>
              Pitch
            </Typography>
          </Box>

          {/* ヨー */}
          <Box>
            <Typography
              variant='caption'
              fontWeight={700}
              sx={{ fontSize: '0.65rem', color: colors.info.main }}>
              {normalizedYaw.toFixed(0)}°
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ fontSize: '0.625rem' }}>
              Yaw
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  }
)

AttitudeIndicator.displayName = 'AttitudeIndicator'

// ウィジェットの共通ヘッダー部分
interface WidgetHeaderProps {
  drone: DroneFlightStatus
  droneColor: { main: string; dark: string }
  statusColor: string
  collapsed: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  onClose?: () => void
  draggable: boolean
  startDrag?: (event: React.PointerEvent) => void
}

const WidgetHeader = ({
  drone,
  droneColor,
  statusColor,
  collapsed,
  onCollapsedChange,
  onClose,
  draggable,
  startDrag,
}: WidgetHeaderProps) => {
  const handleToggleCollapse = useCallback(() => {
    onCollapsedChange?.(!collapsed)
  }, [collapsed, onCollapsedChange])

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mb: collapsed ? 0 : 1.5,
        position: 'relative',
      }}>
      {/* ドラッグハンドル（draggable時のみ表示） */}
      {draggable && startDrag && (
        <Tooltip title='ドラッグして移動'>
          <Box
            onPointerDown={startDrag}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'grab',
              color: colors.gray[400],
              mr: 0.5,
              '&:hover': {
                color: colors.gray[600],
              },
              '&:active': {
                cursor: 'grabbing',
              },
            }}>
            <DragIndicatorIcon sx={{ fontSize: 18 }} />
          </Box>
        </Tooltip>
      )}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flex: 1,
          minWidth: 0,
          overflow: 'hidden',
        }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            flexShrink: 0,
            borderRadius: 1.5,
            background: `linear-gradient(135deg, ${droneColor.main}, ${droneColor.dark})`,
            boxShadow: `0 2px 10px ${alpha(droneColor.main, 0.35)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {drone.flightMode === 'rth' ? (
            <HomeIcon sx={{ color: '#fff', fontSize: 18 }} />
          ) : (
            <FlightIcon sx={{ color: '#fff', fontSize: 18 }} />
          )}
        </Box>
        <Box sx={{ minWidth: 0, overflow: 'hidden' }}>
          <Typography variant='subtitle2' fontWeight={700}>
            機体ステータス
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0.5,
            }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
              {drone.droneName}
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
              {drone.pilotName}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip
          label={getStatusLabel(drone.status)}
          size='small'
          sx={{
            bgcolor: alpha(statusColor, 0.15),
            color: statusColor,
            fontWeight: 600,
            fontSize: '0.65rem',
            height: 22,
          }}
        />
        {/* 折りたたみトグル */}
        <Tooltip title={collapsed ? '展開 (M)' : '折りたたむ (M)'}>
          <IconButton size='small' onClick={handleToggleCollapse}>
            {collapsed ? (
              <ExpandMoreIcon fontSize='small' />
            ) : (
              <ExpandLessIcon fontSize='small' />
            )}
          </IconButton>
        </Tooltip>
        {/* 閉じるボタン */}
        {onClose && (
          <IconButton
            size='small'
            onClick={onClose}
            sx={{
              bgcolor: alpha(colors.gray[500], 0.1),
              '&:hover': {
                bgcolor: alpha(colors.error.main, 0.1),
                color: colors.error.main,
              },
            }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}

// ウィジェットの展開時コンテンツ
interface WidgetExpandedContentProps {
  drone: DroneFlightStatus
  droneColor: { main: string; dark: string }
  batteryColor: string
  signalColor: string
  groundLevel: number
}

const WidgetExpandedContent = ({
  drone,
  droneColor,
  batteryColor,
  signalColor,
  groundLevel,
}: WidgetExpandedContentProps) => (
  <>
    {/* メイン情報: 縦積みレイアウト */}
    <Stack spacing={1} sx={{ mb: 1.5 }}>
      {/* バッテリー・信号ゲージ */}
      <Box
        sx={{
          display: 'flex',
          gap: 0.75,
          justifyContent: 'center',
        }}>
        <CircularGauge
          value={drone.batteryLevel}
          max={100}
          size={48}
          thickness={3.5}
          color={batteryColor}
          icon={getBatteryIcon(drone.batteryLevel)}
          label='バッテリー'
          unit='%'
        />
        <CircularGauge
          value={drone.signalStrength}
          max={100}
          size={48}
          thickness={3.5}
          color={signalColor}
          icon={getSignalIcon(drone.signalStrength)}
          label='信号'
          unit='%'
        />
      </Box>

      {/* 高度 */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <AltitudeIndicator
          altitude={drone.position.altitude}
          groundLevel={groundLevel}
        />
      </Box>

      {/* 姿勢 */}
      {drone.position.attitude && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <AttitudeIndicator
            roll={drone.position.attitude.roll}
            pitch={drone.position.attitude.pitch}
            yaw={drone.position.attitude.yaw}
            accentColor={droneColor.main}
          />
        </Box>
      )}
    </Stack>

    {/* 追加情報 */}
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 0.75,
      }}>
      {/* 速度 */}
      <Box
        sx={{
          p: 0.75,
          borderRadius: 1,
          bgcolor: alpha(droneColor.main, 0.06),
          textAlign: 'center',
        }}>
        <SpeedIcon sx={{ fontSize: 14, color: droneColor.main, mb: 0.25 }} />
        <Typography
          variant='caption'
          fontWeight={700}
          sx={{ display: 'block', fontSize: '0.75rem' }}>
          {drone.position.speed.toFixed(1)}
        </Typography>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ fontSize: '0.625rem' }}>
          m/s
        </Typography>
      </Box>

      {/* 方位 */}
      <Box
        sx={{
          p: 0.75,
          borderRadius: 1,
          bgcolor: alpha(droneColor.main, 0.06),
          textAlign: 'center',
        }}>
        <motion.div
          animate={{ rotate: drone.position.heading }}
          transition={{ duration: 0.3 }}>
          <ExploreIcon
            sx={{ fontSize: 14, color: droneColor.main, mb: 0.25 }}
          />
        </motion.div>
        <Typography
          variant='caption'
          fontWeight={700}
          sx={{ display: 'block', fontSize: '0.75rem' }}>
          {drone.position.heading.toFixed(0)}°
        </Typography>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ fontSize: '0.625rem' }}>
          方位
        </Typography>
      </Box>

      {/* 飛行モード */}
      <Box
        sx={{
          p: 0.75,
          borderRadius: 1,
          bgcolor: alpha(droneColor.main, 0.06),
          textAlign: 'center',
        }}>
        <FlightIcon sx={{ fontSize: 14, color: droneColor.main, mb: 0.25 }} />
        <Typography
          variant='caption'
          fontWeight={700}
          sx={{ display: 'block', fontSize: '0.65rem' }}>
          {getFlightModeLabel(drone.flightMode)}
        </Typography>
        <Typography
          variant='caption'
          color='text.secondary'
          sx={{ fontSize: '0.625rem' }}>
          モード
        </Typography>
      </Box>
    </Box>

    {/* 位置情報 */}
    <Box
      sx={{
        mt: 1.5,
        pt: 1.5,
        borderTop: `1px solid ${alpha(colors.gray[500], 0.1)}`,
      }}>
      <Typography variant='caption' color='text.secondary'>
        位置: {drone.position.latitude.toFixed(5)},{' '}
        {drone.position.longitude.toFixed(5)}
      </Typography>
    </Box>
  </>
)

// ウィジェットの折りたたみ時コンテンツ
interface WidgetCollapsedContentProps {
  drone: DroneFlightStatus
  batteryColor: string
  signalColor: string
}

const WidgetCollapsedContent = ({
  drone,
  batteryColor,
  signalColor,
}: WidgetCollapsedContentProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      mt: 0.75,
      '& .MuiSvgIcon-root': { fontSize: 14 },
    }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      {getBatteryIcon(drone.batteryLevel)}
      <Typography
        variant='caption'
        fontWeight={600}
        sx={{ color: batteryColor, fontSize: '0.7rem' }}>
        {drone.batteryLevel.toFixed(0)}%
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      {getSignalIcon(drone.signalStrength)}
      <Typography
        variant='caption'
        fontWeight={600}
        sx={{ color: signalColor, fontSize: '0.7rem' }}>
        {drone.signalStrength.toFixed(0)}%
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
      <HeightIcon sx={{ fontSize: 14, color: colors.info.main }} />
      <Typography
        variant='caption'
        fontWeight={600}
        sx={{ color: colors.info.main, fontSize: '0.7rem' }}>
        {drone.position.altitude.toFixed(0)}m
      </Typography>
    </Box>
  </Box>
)

const UTMDroneStatusWidget = ({
  drone,
  onClose,
  groundLevel = 0,
  collapsed = false,
  onCollapsedChange,
  draggable = true,
  dragConstraints,
  sx: externalSx,
}: UTMDroneStatusWidgetProps) => {
  const theme = useTheme()
  const dragControls = useDragControls()

  const startDrag = useCallback(
    (event: React.PointerEvent) => {
      if (draggable) {
        dragControls.start(event)
      }
    },
    [draggable, dragControls]
  )

  if (!drone) {
    return null
  }

  const droneColor = getDroneDisplayColor(
    drone.droneId,
    drone.plannedRoute?.color
  )
  const batteryColor = getBatteryColor(drone.batteryLevel)
  const signalColor = getSignalColor(drone.signalStrength)
  const statusColor = getStatusColor(drone.status)

  // 共通のスタイル
  const paperSx = [
    {
      p: 1.5,
      borderRadius: 2,
      border: `1px solid ${alpha(droneColor.main, 0.25)}`,
      background:
        theme.palette.mode === 'dark'
          ? alpha(colors.gray[900], 0.7)
          : alpha('#fff', 0.75),
      backdropFilter: 'blur(16px)',
      boxShadow: `0 4px 20px ${alpha('#000', 0.1)}`,
      width: 280,
      maxWidth: '100%',
      cursor: draggable ? 'default' : undefined,
    },
    ...(Array.isArray(externalSx) ? externalSx : [externalSx]),
  ]

  // 共通のコンテンツ部分
  const widgetContent = (
    <>
      <WidgetHeader
        drone={drone}
        droneColor={droneColor}
        statusColor={statusColor}
        collapsed={collapsed}
        onCollapsedChange={onCollapsedChange}
        onClose={onClose}
        draggable={draggable}
        startDrag={draggable ? startDrag : undefined}
      />

      {/* 折りたたみ可能なコンテンツ */}
      <Collapse in={!collapsed} timeout={300}>
        <WidgetExpandedContent
          drone={drone}
          droneColor={droneColor}
          batteryColor={batteryColor}
          signalColor={signalColor}
          groundLevel={groundLevel}
        />
      </Collapse>

      {/* 折りたたみ時のコンパクト表示 */}
      <Collapse in={collapsed} timeout={300}>
        <WidgetCollapsedContent
          drone={drone}
          batteryColor={batteryColor}
          signalColor={signalColor}
        />
      </Collapse>
    </>
  )

  // ドラッグ不可の場合は通常のPaperを使用
  if (!draggable) {
    return (
      <Paper elevation={0} sx={paperSx}>
        {widgetContent}
      </Paper>
    )
  }

  // ドラッグ可能な場合はmotion.divを使用
  return (
    <AnimatePresence>
      <Paper
        component={motion.div}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        drag={true}
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={false}
        dragElastic={0.05}
        dragTransition={{ bounceStiffness: 600, bounceDamping: 30 }}
        dragConstraints={
          dragConstraints || { top: -500, left: -500, right: 500, bottom: 500 }
        }
        whileDrag={{
          scale: 1.01,
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          cursor: 'grabbing',
        }}
        elevation={0}
        sx={paperSx}>
        {widgetContent}
      </Paper>
    </AnimatePresence>
  )
}

export default UTMDroneStatusWidget
