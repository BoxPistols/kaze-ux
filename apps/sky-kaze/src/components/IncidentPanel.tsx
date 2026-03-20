/**
 * インシデントアラート + 解決パネル
 */
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { Box, Typography, alpha, useMediaQuery } from '@mui/material'

import { DRIVERS } from '~/data/logistics'
import {
  useSimulation,
  INCIDENT_LABELS,
  INCIDENT_COLORS,
  INCIDENT_RESOLUTIONS,
} from '~/data/simulation'

export const IncidentPanel = () => {
  const isMobile = useMediaQuery('(max-width:768px)')
  const incidents = useSimulation((s) => s.incidents)
  const activeIncidentId = useSimulation((s) => s.activeIncidentId)
  const selectIncident = useSimulation((s) => s.selectIncident)
  const resolveIncident = useSimulation((s) => s.resolveIncident)

  const unresolvedIncidents = incidents.filter((i) => !i.resolved)
  const activeIncident = incidents.find((i) => i.id === activeIncidentId)

  if (unresolvedIncidents.length === 0 && !activeIncident) return null

  // 解決パネル表示中
  if (activeIncident && !activeIncident.resolved) {
    const driver = DRIVERS.find((d) => d.id === activeIncident.driverId)
    const color = INCIDENT_COLORS[activeIncident.type]
    const resolutions = INCIDENT_RESOLUTIONS[activeIncident.type]

    return (
      <>
        {/* 背景オーバーレイ — クリックで「後で対応する」 */}
        <Box
          onClick={() => selectIncident(null)}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 29,
            bgcolor: 'rgba(0, 0, 0, 0.4)',
            cursor: 'pointer',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 30,
            width: isMobile ? 'calc(100% - 24px)' : 380,
            borderRadius: 3,
            backdropFilter: 'blur(20px)',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(15, 23, 42, 0.95)'
                : 'rgba(255,255,255,0.97)',
            border: '2px solid',
            borderColor: color,
            boxShadow: `0 8px 40px ${alpha(color, 0.3)}`,
            overflow: 'hidden',
          }}>
          {/* ヘッダー */}
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              bgcolor: alpha(color, 0.1),
              borderBottom: '1px solid',
              borderColor: alpha(color, 0.2),
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
            <ErrorOutlineIcon sx={{ color, fontSize: 22 }} aria-hidden='true' />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '15px', color }}>
                {INCIDENT_LABELS[activeIncident.type]}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                {driver?.name} — {driver?.vehicle}
              </Typography>
            </Box>
          </Box>

          {/* 詳細 */}
          <Box sx={{ px: 2.5, py: 2 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '14px', mb: 0.5 }}>
              {activeIncident.title}
            </Typography>
            <Typography
              sx={{
                fontSize: '13px',
                color: 'text.secondary',
                lineHeight: 1.6,
                mb: 2,
              }}>
              {activeIncident.description}
            </Typography>

            {/* 対応選択肢 */}
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'text.secondary',
                mb: 1,
              }}>
              対応を選択
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {resolutions.map((r) => (
                <Box
                  key={r}
                  role='button'
                  tabIndex={0}
                  aria-label={`対応: ${r}`}
                  onClick={() => resolveIncident(activeIncident.id, r)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      resolveIncident(activeIncident.id, r)
                    }
                  }}
                  sx={{
                    px: 2,
                    py: 1.25,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: color,
                      bgcolor: alpha(color, 0.05),
                    },
                  }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                    {r}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* キャンセル */}
            <Typography
              role='button'
              tabIndex={0}
              aria-label='後で対応する'
              onClick={() => selectIncident(null)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  selectIncident(null)
                }
              }}
              sx={{
                fontSize: '12px',
                color: 'text.secondary',
                textAlign: 'center',
                mt: 1.5,
                cursor: 'pointer',
                '&:hover': { color: 'text.primary' },
              }}>
              後で対応する
            </Typography>
          </Box>
        </Box>
      </>
    )
  }

  // アラートバッジリスト（左上）
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 72,
        left: 12,
        zIndex: 15,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.75,
        maxWidth: isMobile ? 200 : 'none',
      }}>
      {unresolvedIncidents.map((incident) => {
        const color = INCIDENT_COLORS[incident.type]
        const driver = DRIVERS.find((d) => d.id === incident.driverId)
        return (
          <Box
            key={incident.id}
            role='button'
            tabIndex={0}
            aria-label={`${INCIDENT_LABELS[incident.type]}: ${incident.title}`}
            onClick={() => selectIncident(incident.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                selectIncident(incident.id)
              }
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              borderRadius: 2,
              backdropFilter: 'blur(14px)',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha('#15141e', 0.9)
                  : 'rgba(255,255,255,0.92)',
              border: '1px solid',
              borderColor: alpha(color, 0.4),
              boxShadow: `0 2px 12px ${alpha(color, 0.2)}`,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: color,
                boxShadow: `0 2px 16px ${alpha(color, 0.35)}`,
              },
              animation: 'slideIn 0.3s ease',
              '@keyframes slideIn': {
                from: { opacity: 0, transform: 'translateX(-16px)' },
                to: { opacity: 1, transform: 'translateX(0)' },
              },
            }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: color,
                animation: 'pulse-dot 1.5s infinite',
              }}
            />
            <Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 700, color }}>
                {INCIDENT_LABELS[incident.type]}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                {driver?.name} — {incident.title}
              </Typography>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
