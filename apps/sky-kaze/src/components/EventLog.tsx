/**
 * イベントログパネル — 左下フローティング
 * 配送完了・インシデント発生/解決・ジョブ割当・出発のタイムライン
 */
import { Box, Typography, alpha, useMediaQuery } from '@mui/material'

import {
  useSimulation,
  LOG_TYPE_COLOR,
  type LogEventType,
} from '~/data/simulation'

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const TYPE_ICON: Record<LogEventType, string> = {
  delivery_complete: '✓',
  incident_occurred: '!',
  incident_resolved: '→',
  job_assigned: '↻',
  driver_departed: '▸',
}

export const EventLog = () => {
  const isMobile = useMediaQuery('(max-width:768px)')
  const logs = useSimulation((s) => s.logs)
  const showLog = useSimulation((s) => s.showLog)

  if (!showLog || logs.length === 0) return null

  const recentLogs = [...logs].reverse().slice(0, 15)

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 72,
        left: 12,
        zIndex: 15,
        width: isMobile ? 'calc(100% - 24px)' : 320,
        maxHeight: 300,
        borderRadius: 2.5,
        backdropFilter: 'blur(16px)',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(10, 15, 28, 0.92)'
            : 'rgba(255,255,255,0.94)',
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.divider, 0.15),
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
          Event Log
        </Typography>
        <Typography
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            color: 'text.secondary',
          }}>
          {logs.length} events
        </Typography>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', py: 0.5 }}>
        {recentLogs.map((log) => {
          const color = LOG_TYPE_COLOR[log.type]
          return (
            <Box
              key={log.id}
              sx={{
                display: 'flex',
                gap: 1,
                px: 1.5,
                py: 0.5,
                fontSize: '12px',
                '&:hover': { bgcolor: 'action.hover' },
              }}>
              <Typography
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  color: 'text.disabled',
                  flexShrink: 0,
                  mt: 0.25,
                  width: 36,
                }}>
                {formatTime(log.timestamp)}
              </Typography>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(color, 0.15),
                  color,
                  fontSize: '12px',
                  fontWeight: 900,
                  flexShrink: 0,
                  mt: 0.1,
                }}>
                {TYPE_ICON[log.type]}
              </Box>
              <Typography
                sx={{
                  fontSize: '13px',
                  color: 'text.secondary',
                  lineHeight: 1.5,
                }}>
                {log.message}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}
