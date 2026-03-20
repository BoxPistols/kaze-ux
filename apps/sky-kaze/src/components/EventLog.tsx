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
import { formatShortTime } from '~/utils/format'
import { floatingPanelSx } from '~/utils/panelStyles'

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
        ...floatingPanelSx,
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
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
          Event Log
        </Typography>
        <Typography
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '13px',
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
                  fontSize: '13px',
                  color: 'text.disabled',
                  flexShrink: 0,
                  mt: 0.25,
                  width: 40,
                }}>
                {formatShortTime(log.timestamp)}
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
                  fontSize: '14px',
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
