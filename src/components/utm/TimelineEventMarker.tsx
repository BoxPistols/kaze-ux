/**
 * タイムラインイベントマーカー
 * フライトタイムライン上にイベントを表示するマーカーコンポーネント
 */

import { Box, Tooltip, Typography, alpha } from '@mui/material'
import React, { useMemo, useCallback, memo } from 'react'

import type { FlightTimelineEvent } from '@/types/utmTypes'
import {
  getEventIcon,
  getEventTypeLabel,
  getSeverityColor,
  formatTime,
} from '@/utils'

// 静的なスタイル定義（再レンダリング時の再生成を防止）
const baseButtonStyles = {
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'transform 0.15s',
  pt: 0.25,
  border: 'none',
  background: 'none',
  padding: 0,
} as const

const markerLineStyles = {
  width: 2,
  height: 6,
} as const

const markerIconStyles = {
  width: 18,
  height: 18,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
} as const

const timeLabelStyles = {
  fontSize: '0.625rem',
  fontWeight: 600,
  mt: 0.25,
  whiteSpace: 'nowrap',
  textShadow: '0 0 2px rgba(255,255,255,0.8)',
} as const

const eventTypeLabelStyles = {
  fontSize: '0.625rem',
  color: 'text.secondary',
  whiteSpace: 'nowrap',
  maxWidth: 50,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const

interface TimelineEventMarkerProps {
  event: FlightTimelineEvent
  position: number // パーセンテージ（0-100）
  isSelected?: boolean
  onClick?: (event: FlightTimelineEvent) => void
}

const TimelineEventMarkerComponent = ({
  event,
  position,
  isSelected = false,
  onClick,
}: TimelineEventMarkerProps) => {
  // メモ化された値（毎レンダリング時の再計算を防止）
  const severityColor = useMemo(
    () => getSeverityColor(event.severity),
    [event.severity]
  )
  const icon = useMemo(() => getEventIcon(event.type), [event.type])
  const formattedTime = useMemo(
    () => formatTime(event.timestamp),
    [event.timestamp]
  )
  const eventTypeLabel = useMemo(
    () => getEventTypeLabel(event.type),
    [event.type]
  )

  // クリックハンドラーをメモ化
  const handleClick = useCallback(() => {
    onClick?.(event)
  }, [onClick, event])

  // キーボードハンドラーをメモ化
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // EnterキーまたはSpaceキーでクリックと同じ動作
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick?.(event)
      }
    },
    [onClick, event]
  )

  // 動的なスタイルをメモ化
  const buttonStyles = useMemo(
    () => ({
      ...baseButtonStyles,
      position: 'absolute' as const,
      left: `${position}%`,
      top: '100%',
      transform: 'translateX(-50%)',
      zIndex: isSelected ? 10 : 5,
      '&:hover': {
        transform: 'translateX(-50%) scale(1.1)',
        zIndex: 15,
      },
      '&:focus': {
        outline: `2px solid ${severityColor}`,
        outlineOffset: 2,
      },
    }),
    [position, isSelected, severityColor]
  )

  const markerLineDynamicStyles = useMemo(
    () => ({
      ...markerLineStyles,
      bgcolor: severityColor,
      opacity: isSelected ? 1 : 0.6,
    }),
    [severityColor, isSelected]
  )

  const markerIconDynamicStyles = useMemo(
    () => ({
      ...markerIconStyles,
      bgcolor: severityColor,
      boxShadow: isSelected
        ? `0 0 0 3px ${alpha(severityColor, 0.3)}`
        : `0 1px 3px ${alpha('#000', 0.3)}`,
      border: isSelected ? '2px solid #fff' : 'none',
    }),
    [severityColor, isSelected]
  )

  const timeLabelDynamicStyles = useMemo(
    () => ({
      ...timeLabelStyles,
      color: severityColor,
    }),
    [severityColor]
  )

  return (
    <Tooltip
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant='caption' fontWeight={700} display='block'>
            {event.title}
          </Typography>
          {event.description && (
            <Typography
              variant='caption'
              display='block'
              sx={{ mt: 0.5, opacity: 0.8 }}>
              {event.description}
            </Typography>
          )}
        </Box>
      }
      arrow
      placement='top'>
      <Box
        component='button'
        role='button'
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        sx={buttonStyles}>
        {/* マーカーの縦線 */}
        <Box sx={markerLineDynamicStyles} />
        {/* マーカーアイコン */}
        <Box sx={markerIconDynamicStyles}>{icon}</Box>
        {/* 時刻ラベル */}
        <Typography variant='caption' sx={timeLabelDynamicStyles}>
          {formattedTime}
        </Typography>
        {/* イベント種別ラベル */}
        <Typography variant='caption' sx={eventTypeLabelStyles}>
          {eventTypeLabel}
        </Typography>
      </Box>
    </Tooltip>
  )
}

// 浅い比較でpropsの変更を検出
const arePropsEqual = (
  prevProps: TimelineEventMarkerProps,
  nextProps: TimelineEventMarkerProps
): boolean => {
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.severity === nextProps.event.severity &&
    prevProps.event.type === nextProps.event.type &&
    prevProps.position === nextProps.position &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.onClick === nextProps.onClick
  )
}

// React.memoでラップしてエクスポート
export const TimelineEventMarker = memo(
  TimelineEventMarkerComponent,
  arePropsEqual
)
