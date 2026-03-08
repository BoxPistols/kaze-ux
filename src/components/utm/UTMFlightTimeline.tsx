/**
 * UTMフライトタイムライン
 * 各ドローンの飛行計画と進捗をガントチャート形式で表示
 */

import EventNoteIcon from '@mui/icons-material/EventNote'
import FlightIcon from '@mui/icons-material/Flight'
import FlightLandIcon from '@mui/icons-material/FlightLand'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import HomeIcon from '@mui/icons-material/Home'
import PauseCircleIcon from '@mui/icons-material/PauseCircle'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import ScheduleIcon from '@mui/icons-material/Schedule'
import WarningIcon from '@mui/icons-material/Warning'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Typography,
  alpha,
  useTheme,
  Tooltip,
} from '@mui/material'
import { useEffect, useState, useMemo, useCallback, useRef, memo } from 'react'

import { colors } from '@/styles/tokens'
import type {
  DroneFlightStatus,
  FlightTimelineEvent,
  DroneTimelineEvents,
} from '@/types/utmTypes'
import {
  getDroneDisplayColor,
  formatTime,
  formatTimeShort,
  formatDuration,
} from '@/utils'

import { TimelineEventDetailPanel } from './TimelineEventDetailPanel'
import { TimelineEventMarker } from './TimelineEventMarker'

// ドローンステータスに応じた色を取得するヘルパー関数
type DroneStatus = DroneFlightStatus['status']
type DroneColorType = { main: string; dark: string }

/** タイムラインバーの背景色を取得 */
const getTimelineBackgroundColor = (
  status: DroneStatus,
  droneColor: DroneColorType
): string => {
  switch (status) {
    case 'landed':
      return alpha(colors.gray[500], 0.2)
    case 'hovering':
      return alpha(colors.warning.main, 0.2)
    case 'rth':
      return alpha(colors.error.main, 0.2)
    case 'emergency':
      return alpha(colors.error.main, 0.3)
    default:
      return alpha(droneColor.main, 0.2)
  }
}

/** タイムラインバーのボーダー色を取得 */
const getTimelineBorderColor = (
  status: DroneStatus,
  droneColor: DroneColorType
): string => {
  switch (status) {
    case 'landed':
      return alpha(colors.gray[500], 0.4)
    case 'hovering':
      return alpha(colors.warning.main, 0.6)
    case 'rth':
      return alpha(colors.error.main, 0.6)
    case 'emergency':
      return colors.error.main
    default:
      return alpha(droneColor.main, 0.4)
  }
}

/** 進捗バーの背景色を取得 */
const getProgressBarColor = (
  status: DroneStatus,
  droneColor: DroneColorType
): string => {
  switch (status) {
    case 'landed':
      return alpha(colors.gray[500], 0.5)
    case 'hovering':
      return alpha(colors.warning.main, 0.6)
    case 'rth':
      return alpha(colors.error.main, 0.6)
    case 'emergency':
      return alpha(colors.error.main, 0.8)
    default:
      return alpha(droneColor.main, 0.6)
  }
}

/** ステータスラベルを取得 */
const getStatusLabel = (status: DroneStatus): string => {
  const labels: Record<DroneStatus, string> = {
    in_flight: '飛行中',
    preflight: '飛行前',
    landed: '着陸済',
    takeoff: '離陸中',
    landing: '着陸中',
    hovering: 'ホバリング',
    rth: '緊急帰還',
    emergency: '緊急',
  }
  return labels[status] || status
}

interface UTMFlightTimelineProps {
  drones: DroneFlightStatus[]
  selectedDroneId: string | null
  onDroneSelect?: (droneId: string) => void
  /** タイムラインの表示範囲（時間） */
  timeRangeHours?: number
  /** ドローンごとのイベント一覧 */
  droneEvents?: DroneTimelineEvents[]
  /** 選択中のイベント */
  selectedEventId?: string | null
  /** イベント選択時のコールバック */
  onEventSelect?: (event: FlightTimelineEvent | null) => void
  /** マップで確認ボタン押下時のコールバック */
  onEventMapClick?: (event: FlightTimelineEvent) => void
  /** フライトログボタン押下時のコールバック */
  onFlightLogClick?: (flightLogId: string) => void
  /** アラートボタン押下時のコールバック */
  onAlertClick?: (alertId: string) => void
  /** インシデントボタン押下時のコールバック */
  onIncidentClick?: (incidentId: string) => void
  /** 詳細パネルの表示 */
  showDetailPanel?: boolean
  /** コンパクトモード（フルスクリーン時などで1-2行のみ表示） */
  compact?: boolean
}

const UTMFlightTimelineComponent = ({
  drones,
  selectedDroneId,
  onDroneSelect,
  timeRangeHours = 4,
  droneEvents = [],
  selectedEventId = null,
  onEventSelect,
  onEventMapClick,
  onFlightLogClick,
  onAlertClick,
  onIncidentClick,
  showDetailPanel = true,
  compact = false,
}: UTMFlightTimelineProps) => {
  const theme = useTheme()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false)

  // ズーム関連の状態
  const [zoomLevel, setZoomLevel] = useState(1) // 1 = 100%, 1.1 = 110%, etc. (max 10)
  const [panOffset, setPanOffset] = useState(0) // パン位置（ズーム時の横移動）
  const [isDragging, setIsDragging] = useState(false) // ドラッグ中フラグ
  const dragStartRef = useRef<{ x: number; panOffset: number } | null>(null)

  // ドローン行コンテナへの参照（スクロール用）
  const droneRowsContainerRef = useRef<HTMLDivElement>(null)
  // 各ドローン行への参照マップ
  const droneRowRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  // タイムラインコンテナへの参照（ホイールイベント用）
  const timelineContainerRef = useRef<HTMLDivElement>(null)

  // 選択中のイベントを取得
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null
    for (const droneEvent of droneEvents) {
      const event = droneEvent.events.find((e) => e.id === selectedEventId)
      if (event) return event
    }
    return null
  }, [selectedEventId, droneEvents])

  // イベント選択ハンドラ
  const handleEventClick = useCallback(
    (event: FlightTimelineEvent) => {
      onEventSelect?.(event)
      setIsDetailPanelOpen(true)
    },
    [onEventSelect]
  )

  // 詳細パネル閉じるハンドラ
  const handleDetailPanelClose = useCallback(() => {
    onEventSelect?.(null)
    setIsDetailPanelOpen(false)
  }, [onEventSelect])

  // 選択イベントと詳細パネルの同期
  useEffect(() => {
    if (selectedEventId && selectedEvent) {
      setIsDetailPanelOpen(true)
    }
  }, [selectedEventId, selectedEvent])

  // ドローンIDからイベントを取得
  const getEventsForDrone = useCallback(
    (droneId: string): FlightTimelineEvent[] => {
      const droneEvent = droneEvents.find((de) => de.droneId === droneId)
      return droneEvent?.events || []
    },
    [droneEvents]
  )

  // イベントが存在するかどうか
  const hasEvents =
    droneEvents.length > 0 && droneEvents.some((de) => de.events.length > 0)

  // コンパクトモード用: 表示するドローンを選択（選択中ドローンを優先、最大2行）
  const displayDrones = useMemo(() => {
    if (!compact) return drones

    const maxRows = 2
    const result: DroneFlightStatus[] = []

    // 選択中のドローンを最優先
    if (selectedDroneId) {
      const selectedDrone = drones.find((d) => d.droneId === selectedDroneId)
      if (selectedDrone) {
        result.push(selectedDrone)
      }
    }

    // 残りの枠を飛行中のドローンで埋める
    for (const drone of drones) {
      if (result.length >= maxRows) break
      if (result.some((d) => d.droneId === drone.droneId)) continue
      if (drone.status === 'in_flight' || drone.status === 'takeoff') {
        result.push(drone)
      }
    }

    // まだ枠があれば他のドローンを追加
    for (const drone of drones) {
      if (result.length >= maxRows) break
      if (result.some((d) => d.droneId === drone.droneId)) continue
      result.push(drone)
    }

    return result
  }, [compact, drones, selectedDroneId])

  // 1分ごとに現在時刻を更新（requestAnimationFrameベースで最適化）
  // 分単位でのみ更新し、秒単位の変更では再レンダリングしない
  useEffect(() => {
    let animationFrameId: number
    let lastMinute = currentTime.getMinutes()

    const checkTime = () => {
      const now = new Date()
      const currentMinute = now.getMinutes()

      // 分が変わった場合のみ状態を更新
      if (currentMinute !== lastMinute) {
        lastMinute = currentMinute
        setCurrentTime(now)
      }

      animationFrameId = requestAnimationFrame(checkTime)
    }

    // 初期状態で1秒後に開始（初回レンダリングの負荷軽減）
    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(checkTime)
    }, 1000)

    return () => {
      clearTimeout(timeoutId)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 選択ドローンが変更されたら、その行までスクロール
  useEffect(() => {
    if (!selectedDroneId) return

    const rowElement = droneRowRefs.current.get(selectedDroneId)
    const container = droneRowsContainerRef.current

    if (rowElement && container) {
      // 少し遅延を入れてDOMが確実に更新されてからスクロール
      requestAnimationFrame(() => {
        rowElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      })
    }
  }, [selectedDroneId])

  // タイムラインの時間範囲を計算
  const { timelineStart, timelineEnd, timeMarkers } = useMemo(() => {
    const now = currentTime
    const halfRange = (timeRangeHours / 2) * 60 * 60 * 1000
    const start = new Date(now.getTime() - halfRange)
    const end = new Date(now.getTime() + halfRange)

    // 30分刻みのマーカーを生成
    const markers: Date[] = []
    const markerStart = new Date(start)
    markerStart.setMinutes(Math.ceil(markerStart.getMinutes() / 30) * 30, 0, 0)

    while (markerStart <= end) {
      markers.push(new Date(markerStart))
      markerStart.setMinutes(markerStart.getMinutes() + 30)
    }

    return { timelineStart: start, timelineEnd: end, timeMarkers: markers }
  }, [currentTime, timeRangeHours])

  // ズームレベルに応じた時間マーカー間隔を計算
  const zoomedTimeMarkers = useMemo(() => {
    if (zoomLevel <= 1) return timeMarkers

    // ズームレベルに応じてマーカー間隔を調整
    // zoomLevel 2-3: 15分間隔, 4-6: 5分間隔, 7+: 1分間隔
    let intervalMinutes = 30
    if (zoomLevel >= 7) intervalMinutes = 1
    else if (zoomLevel >= 4) intervalMinutes = 5
    else if (zoomLevel >= 2) intervalMinutes = 15

    const markers: Date[] = []
    const markerStart = new Date(timelineStart)
    markerStart.setMinutes(
      Math.ceil(markerStart.getMinutes() / intervalMinutes) * intervalMinutes,
      0,
      0
    )

    while (markerStart <= timelineEnd) {
      markers.push(new Date(markerStart))
      markerStart.setMinutes(markerStart.getMinutes() + intervalMinutes)
    }

    return markers
  }, [timeMarkers, timelineStart, timelineEnd, zoomLevel])

  // パン制限を計算（ズームレベルに応じて移動可能範囲を制限）
  const getMaxPanOffset = useCallback((zoom: number) => {
    // ズーム1倍では移動不可、ズームが高いほど移動範囲が広がる
    return Math.max(0, (zoom - 1) * 50)
  }, [])

  // パンオフセットを制限範囲内に収める
  const clampPanOffset = useCallback(
    (offset: number, zoom: number) => {
      const maxOffset = getMaxPanOffset(zoom)
      return Math.max(-maxOffset, Math.min(maxOffset, offset))
    },
    [getMaxPanOffset]
  )

  // ズーム制御関数（10%刻み）
  const handleZoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(10, Math.round((prev + 0.1) * 10) / 10))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel((prev) => {
      const newLevel = Math.max(1, Math.round((prev - 0.1) * 10) / 10)
      if (newLevel === 1) setPanOffset(0)
      return newLevel
    })
  }, [])

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1)
    setPanOffset(0)
  }, [])

  // ホイールイベント（Shift+スクロールでズーム、Cmd/Ctrl+スクロールまたは横スクロールでパン）
  const handleWheel = useCallback(
    (event: WheelEvent) => {
      // Shift押下時: ズーム
      if (event.shiftKey) {
        event.preventDefault()
        // deltaYとdeltaXの両方をチェック（マウスとトラックパッド両対応）
        const delta = event.deltaY !== 0 ? event.deltaY : event.deltaX
        if (delta < 0) {
          // ズームイン
          setZoomLevel((prev) =>
            Math.min(10, Math.round((prev + 0.1) * 10) / 10)
          )
        } else if (delta > 0) {
          // ズームアウト
          setZoomLevel((prev) => {
            const newLevel = Math.max(1, Math.round((prev - 0.1) * 10) / 10)
            if (newLevel === 1) setPanOffset(0)
            return newLevel
          })
        }
        return
      }

      // Cmd/Ctrl + スクロール: 横移動（縦スクロールを横移動に変換）
      if ((event.metaKey || event.ctrlKey) && zoomLevel > 1) {
        event.preventDefault()
        setPanOffset((prev) => {
          const sensitivity = 0.5 / zoomLevel
          // deltaYを横移動に使用
          const newOffset = prev - event.deltaY * sensitivity
          return clampPanOffset(newOffset, zoomLevel)
        })
        return
      }

      // ズーム時、横スクロール（deltaX）のみでパン
      // 縦スクロール（deltaY）は通常のスクロール動作を維持（ドローンリスト）
      if (zoomLevel > 1 && Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
        event.preventDefault()
        setPanOffset((prev) => {
          const sensitivity = 0.5 / zoomLevel
          const newOffset = prev - event.deltaX * sensitivity
          return clampPanOffset(newOffset, zoomLevel)
        })
      }
    },
    [zoomLevel, clampPanOffset]
  )

  // ドラッグでパン（マウスダウン）
  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (zoomLevel <= 1) return
      // 左クリックのみ
      if (event.button !== 0) return
      setIsDragging(true)
      dragStartRef.current = { x: event.clientX, panOffset }
      event.preventDefault()
    },
    [zoomLevel, panOffset]
  )

  // ドラッグでパン（マウスムーブ）
  const handleMouseMove = useCallback(
    (event: React.MouseEvent) => {
      if (!isDragging || !dragStartRef.current) return
      const deltaX = event.clientX - dragStartRef.current.x
      const sensitivity = 0.3 / zoomLevel
      const newOffset = dragStartRef.current.panOffset + deltaX * sensitivity
      setPanOffset(clampPanOffset(newOffset, zoomLevel))
    },
    [isDragging, zoomLevel, clampPanOffset]
  )

  // ドラッグでパン（マウスアップ）
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStartRef.current = null
  }, [])

  // 時間マーカークリックでその時間を中央に移動
  const handleTimeMarkerClick = useCallback(
    (marker: Date) => {
      if (zoomLevel <= 1) return
      const totalRange = timelineEnd.getTime() - timelineStart.getTime()
      const position = marker.getTime() - timelineStart.getTime()
      const basePercent = (position / totalRange) * 100
      // その時間を中央（50%位置）に移動するためのオフセットを計算
      const targetOffset = (50 - basePercent) * zoomLevel
      setPanOffset(clampPanOffset(targetOffset, zoomLevel))
    },
    [zoomLevel, timelineStart, timelineEnd, clampPanOffset]
  )

  // ホイールイベントの登録
  useEffect(() => {
    const container = timelineContainerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  // グローバルマウスアップイベント（ドラッグ終了）
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('mouseleave', handleMouseUp)
      return () => {
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('mouseleave', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseUp])

  // キーボードショートカット（Shift+0でリセット、Shift++/-でズーム）
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // タイムラインコンテナにフォーカスがある場合のみ、またはShiftキー押下時
      if (!event.shiftKey) return

      // テキスト入力中は無視
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Shift+0 は US配列で ')' になる場合がある
      if (event.key === '0' || event.key === ')' || event.code === 'Digit0') {
        event.preventDefault()
        handleZoomReset()
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        handleZoomIn()
      } else if (event.key === '-') {
        event.preventDefault()
        handleZoomOut()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleZoomReset, handleZoomIn, handleZoomOut])

  // 時間をパーセンテージに変換（ズーム対応）
  const timeToPercent = useCallback(
    (time: Date): number => {
      const totalRange = timelineEnd.getTime() - timelineStart.getTime()
      const position = time.getTime() - timelineStart.getTime()
      const basePercent = (position / totalRange) * 100

      // ズーム適用: 表示範囲を拡大し、パンオフセットを適用
      const zoomedPercent = (basePercent - 50) * zoomLevel + 50 + panOffset
      return zoomedPercent
    },
    [timelineStart, timelineEnd, zoomLevel, panOffset]
  )

  // 現在時刻のパーセンテージ
  const currentTimePercent = timeToPercent(currentTime)

  // ズーム表示用のラベル
  const zoomLabel = zoomLevel === 1 ? '100%' : `${Math.round(zoomLevel * 100)}%`

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 0.75 : 1.5,
        borderRadius: compact ? 1 : 2,
        border: `1px solid ${alpha(colors.gray[500], 0.1)}`,
        background:
          theme.palette.mode === 'dark'
            ? alpha(colors.gray[900], 0.6)
            : alpha('#fff', 0.9),
        backdropFilter: 'blur(10px)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
      {/* ヘッダー - コンパクトモード時はミニマル表示 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: compact ? 0.5 : 1,
          px: 0.5,
        }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: compact ? 0.5 : 1,
          }}>
          <ScheduleIcon
            sx={{ fontSize: compact ? 14 : 18, color: colors.primary[500] }}
          />
          {!compact && (
            <Typography variant='subtitle2' fontWeight={700}>
              フライトタイムライン
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* ズームコントロール */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
              bgcolor: alpha(colors.gray[500], 0.08),
              borderRadius: 1,
              px: 0.5,
            }}>
            <Tooltip title='縮小 (Shift+Scroll↓)'>
              <IconButton
                size='small'
                onClick={handleZoomOut}
                disabled={zoomLevel <= 1}
                sx={{ p: 0.25 }}>
                <ZoomOutIcon
                  sx={{
                    fontSize: 16,
                    color: zoomLevel <= 1 ? 'text.disabled' : 'text.secondary',
                  }}
                />
              </IconButton>
            </Tooltip>
            <Typography
              variant='caption'
              fontWeight={600}
              sx={{
                minWidth: 40,
                textAlign: 'center',
                color: zoomLevel > 1 ? colors.primary[500] : 'text.secondary',
                fontSize: '0.65rem',
              }}>
              {zoomLabel}
            </Typography>
            <Tooltip title='拡大 (Shift+Scroll↑)'>
              <IconButton
                size='small'
                onClick={handleZoomIn}
                disabled={zoomLevel >= 10}
                sx={{ p: 0.25 }}>
                <ZoomInIcon
                  sx={{
                    fontSize: 16,
                    color: zoomLevel >= 10 ? 'text.disabled' : 'text.secondary',
                  }}
                />
              </IconButton>
            </Tooltip>
            <Tooltip title='リセット (Shift+0)'>
              <span>
                <IconButton
                  size='small'
                  onClick={handleZoomReset}
                  disabled={zoomLevel <= 1}
                  sx={{ p: 0.25 }}>
                  <RestartAltIcon
                    sx={{
                      fontSize: 14,
                      color:
                        zoomLevel <= 1 ? 'text.disabled' : colors.primary[500],
                    }}
                  />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          {hasEvents && showDetailPanel && selectedEvent && (
            <Tooltip
              title={
                isDetailPanelOpen
                  ? 'イベント詳細を閉じる'
                  : 'イベント詳細を表示'
              }>
              <IconButton
                size='small'
                onClick={() => setIsDetailPanelOpen(!isDetailPanelOpen)}
                sx={{
                  bgcolor: isDetailPanelOpen
                    ? alpha(colors.primary[500], 0.1)
                    : 'transparent',
                }}>
                <EventNoteIcon
                  sx={{
                    fontSize: 16,
                    color: isDetailPanelOpen
                      ? colors.primary[500]
                      : 'text.secondary',
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
          <Typography
            variant='caption'
            fontWeight={600}
            sx={{
              color: colors.primary[500],
              bgcolor: alpha(colors.primary[500], 0.1),
              px: 1,
              py: 0.25,
              borderRadius: 1,
            }}>
            {formatTime(currentTime)}
          </Typography>
        </Box>
      </Box>

      {/* タイムラインコンテナ */}
      <Box
        ref={timelineContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default',
          userSelect: isDragging ? 'none' : 'auto',
        }}>
        {/* 時間軸ヘッダー */}
        <Box
          sx={{
            display: 'flex',
            pl: compact ? '70px' : '100px', // ドローン名の幅
            position: 'relative',
            height: compact ? 18 : 24,
            borderBottom: `1px solid ${alpha(colors.gray[500], 0.15)}`,
            overflow: 'hidden',
          }}>
          {/* 時間マーカー（ズーム対応、クリックで移動） */}
          {zoomedTimeMarkers.map((marker, index) => {
            const percent = timeToPercent(marker)
            // 表示範囲外のマーカーはスキップ
            if (percent < -10 || percent > 110) return null
            const isHour = marker.getMinutes() === 0
            const is5Min = marker.getMinutes() % 5 === 0
            const isClickable = zoomLevel > 1
            return (
              <Box
                key={index}
                component={isClickable ? 'button' : 'div'}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                aria-label={
                  isClickable ? `${formatTimeShort(marker)}に移動` : undefined
                }
                onClick={(e: React.MouseEvent) => {
                  if (isClickable) {
                    e.stopPropagation()
                    handleTimeMarkerClick(marker)
                  }
                }}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    e.stopPropagation()
                    handleTimeMarkerClick(marker)
                  }
                }}
                sx={{
                  position: 'absolute',
                  left: `${percent}%`,
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  cursor: isClickable ? 'pointer' : 'default',
                  px: 0.5,
                  py: 0.25,
                  borderRadius: 0.5,
                  border: 'none',
                  background: 'none',
                  transition: 'background-color 0.15s',
                  '&:hover': isClickable
                    ? {
                        bgcolor: alpha(colors.primary[500], 0.1),
                      }
                    : {},
                  '&:focus': isClickable
                    ? {
                        outline: `2px solid ${colors.primary[500]}`,
                        outlineOffset: 1,
                      }
                    : {},
                }}>
                <Typography
                  variant='caption'
                  sx={{
                    fontSize: isHour ? '0.7rem' : '0.625rem',
                    fontWeight: isHour ? 600 : is5Min ? 500 : 400,
                    color: isHour
                      ? 'text.primary'
                      : is5Min
                        ? 'text.secondary'
                        : alpha(colors.gray[500], 0.7),
                  }}>
                  {formatTimeShort(marker)}
                </Typography>
              </Box>
            )
          })}

          {/* 現在時刻インジケーター（ヘッダー部分） */}
          <Box
            sx={{
              position: 'absolute',
              left: `${currentTimePercent}%`,
              top: 0,
              bottom: -1,
              width: 2,
              bgcolor: colors.error.main,
              zIndex: 2,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -4,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: `6px solid ${colors.error.main}`,
              },
            }}
          />
        </Box>

        {/* ドローン行 */}
        <Box
          ref={droneRowsContainerRef}
          sx={{
            flex: 1,
            minHeight: compact
              ? displayDrones.length > 0
                ? Math.min(displayDrones.length * 28, 56)
                : 28
              : drones.length > 0
                ? Math.min(drones.length * 36, 120)
                : 40,
            overflowY: compact ? 'hidden' : 'auto',
            overflowX: 'hidden',
            '&::-webkit-scrollbar': { width: 4 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(colors.gray[500], 0.3),
              borderRadius: 2,
            },
          }}>
          {displayDrones.map((drone) => {
            const droneColor = getDroneDisplayColor(
              drone.droneId,
              drone.plannedRoute?.color
            )
            const isSelected = selectedDroneId === drone.droneId
            const startPercent = timeToPercent(drone.startTime)
            const endPercent = drone.estimatedEndTime
              ? timeToPercent(drone.estimatedEndTime)
              : timeToPercent(
                  new Date(drone.startTime.getTime() + 2 * 60 * 60 * 1000)
                ) // デフォルト2時間

            // 進捗率を計算
            const progressPercent =
              drone.status === 'landed' || drone.status === 'preflight'
                ? drone.status === 'landed'
                  ? 100
                  : 0
                : Math.min(
                    100,
                    ((currentTime.getTime() - drone.startTime.getTime()) /
                      ((drone.estimatedEndTime?.getTime() ||
                        drone.startTime.getTime() + 2 * 60 * 60 * 1000) -
                        drone.startTime.getTime())) *
                      100
                  )

            // バーの表示範囲（タイムライン外は切り捨て）
            const barStart = Math.max(0, startPercent)
            const barEnd = Math.min(100, endPercent)
            const barWidth = barEnd - barStart

            // 表示範囲外かどうか
            const isOutOfRange = barWidth <= 0 || barEnd < 0 || barStart > 100

            // このドローンのイベント数（コンパクトモード時はイベント非表示のため判定不要）
            const droneHasEvents =
              !compact && getEventsForDrone(drone.droneId).length > 0

            return (
              <Box
                key={drone.droneId}
                ref={(el) => {
                  if (el) {
                    droneRowRefs.current.set(
                      drone.droneId,
                      el as HTMLDivElement
                    )
                  } else {
                    droneRowRefs.current.delete(drone.droneId)
                  }
                }}
                role='button'
                tabIndex={0}
                aria-label={`${drone.droneName}を選択`}
                aria-pressed={isSelected}
                onClick={() => onDroneSelect?.(drone.droneId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onDroneSelect?.(drone.droneId)
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  minHeight: compact ? 28 : droneHasEvents ? 70 : 36,
                  pt: compact ? 0.5 : 1,
                  cursor: 'pointer',
                  borderBottom: `1px solid ${alpha(colors.gray[500], 0.08)}`,
                  bgcolor: isSelected
                    ? alpha(droneColor.main, 0.08)
                    : 'transparent',
                  '&:hover': {
                    bgcolor: alpha(droneColor.main, 0.05),
                  },
                  '&:focus': {
                    outline: `2px solid ${droneColor.main}`,
                    outlineOffset: -2,
                  },
                  transition: 'background-color 0.15s',
                }}>
                {/* ドローン名 */}
                <Box
                  sx={{
                    width: compact ? 70 : 100,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: compact ? 0.25 : 0.5,
                    px: compact ? 0.5 : 1,
                    borderRight: `1px solid ${alpha(colors.gray[500], 0.1)}`,
                  }}>
                  <Box
                    sx={{
                      width: compact ? 16 : 20,
                      height: compact ? 16 : 20,
                      borderRadius: '50%',
                      bgcolor: droneColor.main,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                    <FlightIcon
                      sx={{ fontSize: compact ? 10 : 12, color: '#fff' }}
                    />
                  </Box>
                  <Typography
                    variant='caption'
                    fontWeight={600}
                    sx={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontSize: compact ? '0.625rem' : '0.65rem',
                    }}>
                    {drone.droneName.split(' ')[0]}
                  </Typography>
                </Box>

                {/* タイムラインバー */}
                <Box
                  sx={{
                    flex: 1,
                    position: 'relative',
                    height: compact ? 16 : 20,
                    overflow: 'visible',
                  }}>
                  {/* グリッド線 */}
                  {timeMarkers.map((marker, index) => {
                    const percent = timeToPercent(marker)
                    const isHour = marker.getMinutes() === 0
                    return (
                      <Box
                        key={index}
                        sx={{
                          position: 'absolute',
                          left: `${percent}%`,
                          top: 0,
                          bottom: 0,
                          width: 1,
                          bgcolor: alpha(
                            colors.gray[500],
                            isHour ? 0.15 : 0.08
                          ),
                        }}
                      />
                    )
                  })}

                  {/* 飛行バー */}
                  {!isOutOfRange && (
                    <Tooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant='caption' fontWeight={700}>
                            {drone.droneName}
                          </Typography>
                          <Typography variant='caption' display='block'>
                            開始: {formatTime(drone.startTime)}
                          </Typography>
                          {drone.estimatedEndTime && (
                            <Typography variant='caption' display='block'>
                              終了予定: {formatTime(drone.estimatedEndTime)}
                            </Typography>
                          )}
                          <Typography variant='caption' display='block'>
                            予定時間:{' '}
                            {formatDuration(
                              drone.startTime,
                              drone.estimatedEndTime ||
                                new Date(
                                  drone.startTime.getTime() + 2 * 60 * 60 * 1000
                                )
                            )}
                          </Typography>
                          <Typography variant='caption' display='block'>
                            進捗: {progressPercent.toFixed(0)}%
                          </Typography>
                        </Box>
                      }
                      arrow
                      placement='top'>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${barStart}%`,
                          width: `${barWidth}%`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          height: compact ? 14 : 18,
                          borderRadius: 1,
                          bgcolor: getTimelineBackgroundColor(
                            drone.status,
                            droneColor
                          ),
                          border: `1px solid ${getTimelineBorderColor(drone.status, droneColor)}`,
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                        {/* 進捗バー */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${Math.max(0, Math.min(100, progressPercent))}%`,
                            bgcolor: getProgressBarColor(
                              drone.status,
                              droneColor
                            ),
                            transition: 'width 0.3s ease',
                          }}
                        />
                        {/* ステータスアイコン（左端） */}
                        <Box
                          sx={{
                            position: 'absolute',
                            left: compact ? 1 : 2,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 1,
                          }}>
                          {drone.status === 'hovering' ? (
                            <PauseCircleIcon
                              sx={{
                                fontSize: compact ? 8 : 10,
                                color: colors.warning.main,
                              }}
                            />
                          ) : drone.status === 'rth' ? (
                            <HomeIcon
                              sx={{
                                fontSize: compact ? 8 : 10,
                                color: colors.error.main,
                              }}
                            />
                          ) : drone.status === 'emergency' ? (
                            <WarningIcon
                              sx={{
                                fontSize: compact ? 8 : 10,
                                color: colors.error.main,
                              }}
                            />
                          ) : (
                            <FlightTakeoffIcon
                              sx={{
                                fontSize: compact ? 8 : 10,
                                color:
                                  drone.status === 'landed'
                                    ? colors.gray[500]
                                    : drone.status === 'preflight'
                                      ? alpha(droneColor.main, 0.5)
                                      : droneColor.main,
                              }}
                            />
                          )}
                        </Box>
                        {/* ステータス表示 - コンパクトモードでは非表示 */}
                        {!compact && (
                          <Typography
                            variant='caption'
                            sx={{
                              position: 'absolute',
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '0.625rem',
                              fontWeight: 600,
                              color:
                                drone.status === 'landed'
                                  ? colors.gray[600]
                                  : theme.palette.mode === 'dark'
                                    ? '#fff'
                                    : droneColor.dark,
                              textShadow:
                                theme.palette.mode === 'dark'
                                  ? '0 1px 2px rgba(0,0,0,0.5)'
                                  : 'none',
                              whiteSpace: 'nowrap',
                              zIndex: 1,
                            }}>
                            {getStatusLabel(drone.status)}
                          </Typography>
                        )}
                        {/* 着陸アイコン（右端） */}
                        <Box
                          sx={{
                            position: 'absolute',
                            right: compact ? 1 : 2,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            display: 'flex',
                            alignItems: 'center',
                            zIndex: 1,
                          }}>
                          <FlightLandIcon
                            sx={{
                              fontSize: compact ? 8 : 10,
                              color:
                                drone.status === 'landed'
                                  ? colors.success.main
                                  : drone.status === 'landing'
                                    ? colors.warning.main
                                    : alpha(droneColor.main, 0.5),
                            }}
                          />
                        </Box>
                      </Box>
                    </Tooltip>
                  )}

                  {/* イベントマーカー - コンパクトモードでは非表示 */}
                  {!compact &&
                    getEventsForDrone(drone.droneId).map((event) => {
                      const eventPercent = timeToPercent(event.timestamp)
                      // タイムライン範囲外のイベントは表示しない
                      if (eventPercent < 0 || eventPercent > 100) return null
                      return (
                        <TimelineEventMarker
                          key={event.id}
                          event={event}
                          position={eventPercent}
                          isSelected={selectedEventId === event.id}
                          onClick={handleEventClick}
                        />
                      )
                    })}

                  {/* 現在時刻インジケーター */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: `${currentTimePercent}%`,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      bgcolor: colors.error.main,
                      zIndex: 2,
                    }}
                  />
                </Box>
              </Box>
            )
          })}

          {/* ドローンがない場合 */}
          {displayDrones.length === 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'text.secondary',
              }}>
              <Typography
                variant='caption'
                sx={{ fontSize: compact ? '0.625rem' : undefined }}>
                飛行中のドローンはありません
              </Typography>
            </Box>
          )}
        </Box>

        {/* イベント詳細パネル（コンパクトモード時は非表示） */}
        {!compact && showDetailPanel && hasEvents && selectedEvent && (
          <Collapse in={isDetailPanelOpen}>
            <Box
              sx={{
                mt: 1.5,
                pt: 1.5,
                borderTop: `1px solid ${alpha(colors.gray[500], 0.1)}`,
              }}>
              <TimelineEventDetailPanel
                event={selectedEvent}
                onClose={handleDetailPanelClose}
                onMapClick={onEventMapClick}
                onFlightLogClick={onFlightLogClick}
                onAlertClick={onAlertClick}
                onIncidentClick={onIncidentClick}
                isOpen={isDetailPanelOpen}
                onOpenChange={setIsDetailPanelOpen}
              />
            </Box>
          </Collapse>
        )}
      </Box>
    </Paper>
  )
}

// 浅い比較でpropsの変更を検出
const arePropsEqual = (
  prevProps: UTMFlightTimelineProps,
  nextProps: UTMFlightTimelineProps
): boolean => {
  // ドローン数が変わった場合
  if (prevProps.drones.length !== nextProps.drones.length) return false

  // ドローンの状態チェック（ID、ステータス、開始時刻のみ）
  for (let i = 0; i < prevProps.drones.length; i++) {
    const prev = prevProps.drones[i]
    const next = nextProps.drones[i]
    if (
      prev.droneId !== next.droneId ||
      prev.status !== next.status ||
      prev.startTime.getTime() !== next.startTime.getTime()
    ) {
      return false
    }
  }

  // 選択状態
  if (prevProps.selectedDroneId !== nextProps.selectedDroneId) return false

  // イベント数
  if (prevProps.droneEvents?.length !== nextProps.droneEvents?.length)
    return false

  // 選択イベント
  if (prevProps.selectedEventId !== nextProps.selectedEventId) return false

  // その他のprops
  if (prevProps.timeRangeHours !== nextProps.timeRangeHours) return false
  if (prevProps.showDetailPanel !== nextProps.showDetailPanel) return false
  if (prevProps.compact !== nextProps.compact) return false

  return true
}

// React.memoでラップしてエクスポート
export const UTMFlightTimeline = memo(UTMFlightTimelineComponent, arePropsEqual)
