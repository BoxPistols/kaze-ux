/**
 * タイムラインイベント詳細パネル
 * 選択されたイベントの詳細情報を表示し、双方向リンクを提供
 */

import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import CloseIcon from '@mui/icons-material/Close'
import DescriptionIcon from '@mui/icons-material/Description'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import MapIcon from '@mui/icons-material/Map'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useEffect } from 'react'

import { colors } from '@/styles/tokens'
import type { FlightTimelineEvent } from '@/types/utmTypes'
import { getEventIcon, getEventTypeLabel, getSeverityColor } from '@/utils'

interface TimelineEventDetailPanelProps {
  event: FlightTimelineEvent | null
  onClose?: () => void
  onMapClick?: (event: FlightTimelineEvent) => void
  onFlightLogClick?: (flightLogId: string) => void
  onAlertClick?: (alertId: string) => void
  onIncidentClick?: (incidentId: string) => void
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

// 時刻フォーマット
const formatDateTime = (date: Date): string => {
  return date.toLocaleString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// 重要度の日本語ラベル
const getSeverityLabel = (
  severity: FlightTimelineEvent['severity']
): string => {
  const labels: Record<FlightTimelineEvent['severity'], string> = {
    info: '情報',
    success: '成功',
    warning: '警告',
    error: 'エラー',
    critical: '緊急',
  }
  return labels[severity]
}

export const TimelineEventDetailPanel = ({
  event,
  onClose,
  onMapClick,
  onFlightLogClick,
  onAlertClick,
  onIncidentClick,
  isOpen = false,
  onOpenChange,
}: TimelineEventDetailPanelProps) => {
  const theme = useTheme()

  // イベント選択時にパネルを開く
  useEffect(() => {
    if (event && !isOpen) {
      onOpenChange?.(true)
    }
  }, [event, isOpen, onOpenChange])

  // イベント未選択時は何も表示しない（スペースを節約）
  if (!event) {
    return null
  }

  const severityColor = getSeverityColor(event.severity)
  const icon = getEventIcon(event.type, 18)

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(colors.gray[500], 0.1)}`,
        background:
          theme.palette.mode === 'dark'
            ? alpha(colors.gray[900], 0.6)
            : alpha('#fff', 0.9),
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          borderBottom: `1px solid ${alpha(colors.gray[500], 0.1)}`,
          bgcolor: alpha(severityColor, 0.1),
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              bgcolor: severityColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}>
            {icon}
          </Box>
          <Box>
            <Typography variant='subtitle2' fontWeight={700}>
              {event.title}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {formatDateTime(event.timestamp)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={getSeverityLabel(event.severity)}
            size='small'
            sx={{
              bgcolor: alpha(severityColor, 0.15),
              color: severityColor,
              fontWeight: 600,
              fontSize: '0.65rem',
              height: 20,
            }}
          />
          {onClose && (
            <IconButton size='small' onClick={onClose}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* コンテンツ */}
      <Box sx={{ p: 1.5 }}>
        {/* イベント種別 */}
        <Box sx={{ mb: 1.5 }}>
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mb: 0.5 }}>
            イベント種別
          </Typography>
          <Typography variant='body2' fontWeight={600}>
            {getEventTypeLabel(event.type)}
          </Typography>
        </Box>

        {/* 説明 */}
        {event.description && (
          <Box sx={{ mb: 1.5 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ display: 'block', mb: 0.5 }}>
              詳細
            </Typography>
            <Typography variant='body2'>{event.description}</Typography>
          </Box>
        )}

        {/* データセクション */}
        {event.data && Object.keys(event.data).length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {/* バッテリー */}
              {event.data.batteryLevel !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <BatteryFullIcon
                    sx={{
                      fontSize: 14,
                      color:
                        event.data.batteryLevel < 20
                          ? colors.error.main
                          : event.data.batteryLevel < 40
                            ? colors.warning.main
                            : colors.success.main,
                    }}
                  />
                  <Typography variant='caption'>
                    {event.data.batteryLevel}%
                  </Typography>
                </Box>
              )}

              {/* 信号強度 */}
              {event.data.signalStrength !== undefined && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SignalCellularAltIcon
                    sx={{
                      fontSize: 14,
                      color:
                        event.data.signalStrength < 30
                          ? colors.error.main
                          : event.data.signalStrength < 60
                            ? colors.warning.main
                            : colors.success.main,
                    }}
                  />
                  <Typography variant='caption'>
                    {event.data.signalStrength}%
                  </Typography>
                </Box>
              )}

              {/* 位置情報 */}
              {event.data.position && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GpsFixedIcon
                    sx={{ fontSize: 14, color: colors.primary[500] }}
                  />
                  <Typography variant='caption'>
                    {event.data.position.altitude.toFixed(1)}m
                  </Typography>
                </Box>
              )}

              {/* ウェイポイント */}
              {event.data.waypointName && (
                <Chip
                  label={event.data.waypointName}
                  size='small'
                  sx={{ height: 18, fontSize: '0.625rem' }}
                />
              )}

              {/* 区域情報 */}
              {event.data.zoneName && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ReportProblemIcon
                    sx={{ fontSize: 14, color: colors.warning.main }}
                  />
                  <Typography variant='caption'>
                    {event.data.zoneName}
                    {event.data.distance !== undefined &&
                      ` (${event.data.distance}m)`}
                  </Typography>
                </Box>
              )}

              {/* 関連ドローン */}
              {event.data.relatedDroneName && (
                <Chip
                  label={`関連: ${event.data.relatedDroneName}`}
                  size='small'
                  color='warning'
                  sx={{ height: 18, fontSize: '0.625rem' }}
                />
              )}
            </Box>
          </>
        )}

        {/* アクションボタン */}
        {event.links && Object.keys(event.links).length > 0 && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {event.links.mapPosition && event.data?.position && (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<MapIcon sx={{ fontSize: 14 }} />}
                  onClick={() => onMapClick?.(event)}
                  sx={{
                    fontSize: '0.65rem',
                    py: 0.5,
                    textTransform: 'none',
                  }}>
                  マップで確認
                </Button>
              )}
              {event.links.flightLog && onFlightLogClick && (
                <Button
                  size='small'
                  variant='outlined'
                  startIcon={<DescriptionIcon sx={{ fontSize: 14 }} />}
                  onClick={() => onFlightLogClick(event.links?.flightLog ?? '')}
                  sx={{
                    fontSize: '0.65rem',
                    py: 0.5,
                    textTransform: 'none',
                  }}>
                  フライトログ
                </Button>
              )}
              {event.links.alert && onAlertClick && (
                <Button
                  size='small'
                  variant='outlined'
                  color='warning'
                  startIcon={<ReportProblemIcon sx={{ fontSize: 14 }} />}
                  onClick={() => onAlertClick(event.links?.alert ?? '')}
                  sx={{
                    fontSize: '0.65rem',
                    py: 0.5,
                    textTransform: 'none',
                  }}>
                  アラート詳細
                </Button>
              )}
              {event.links.incident && onIncidentClick && (
                <Button
                  size='small'
                  variant='outlined'
                  color='error'
                  startIcon={<ReportProblemIcon sx={{ fontSize: 14 }} />}
                  onClick={() => onIncidentClick(event.links?.incident ?? '')}
                  sx={{
                    fontSize: '0.65rem',
                    py: 0.5,
                    textTransform: 'none',
                  }}>
                  インシデント
                </Button>
              )}
            </Box>
          </>
        )}

        {/* 対応状況 */}
        {event.acknowledged && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                borderRadius: 1,
                bgcolor: alpha(colors.success.main, 0.1),
              }}>
              <Typography variant='caption' color='success.main'>
                確認済み
                {event.acknowledgedBy && `: ${event.acknowledgedBy}`}
                {event.acknowledgedAt &&
                  ` (${formatDateTime(event.acknowledgedAt)})`}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  )
}
