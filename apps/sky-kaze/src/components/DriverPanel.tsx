/**
 * ドライバー監視パネル — 右側フローティング
 * 修正: ETA表示、shared定数使用、全6ドライバー表示
 */
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CloseIcon from '@mui/icons-material/Close'
import SpeedIcon from '@mui/icons-material/Speed'
import {
  Box,
  Typography,
  Chip,
  alpha,
  keyframes,
  useMediaQuery,
} from '@mui/material'
import { useMemo } from 'react'

// インシデント行の赤パルスアニメーション
const incidentPulse = keyframes`
  0%, 100% { background-color: transparent; }
  50% { background-color: rgba(239, 68, 68, 0.08); }
`

// 進捗バーのシマーアニメーション
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`

import { IconButton } from '@/components/ui/icon-button'

import {
  SHIPMENTS,
  DRIVERS,
  findHub,
  STATUS_LABELS,
  STATUS_COLORS,
} from '~/data/logistics'
import {
  useSimulation,
  DRIVER_STATUS_LABEL,
  DRIVER_STATUS_COLOR,
} from '~/data/simulation'
import { LOGI_ORANGE } from '~/theme/colors'
import { floatingPanelSx, floatingPanelEmphasizedSx } from '~/utils/panelStyles'

const formatEta = (seconds: number | null): string => {
  if (seconds === null) return '--:--'
  if (seconds <= 0) return '到着'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/** DRIVERS 配列をIDで引ける Map に変換（O(1)ルックアップ） */
const DRIVER_MAP = new Map(DRIVERS.map((d) => [d.id, d]))

export const DriverPanel = () => {
  const positions = useSimulation((s) => s.positions)
  const selectedDriverId = useSimulation((s) => s.selectedDriverId)
  const selectDriver = useSimulation((s) => s.selectDriver)
  const isMobile = useMediaQuery('(max-width:768px)')

  /** 配送IDで引ける Map（positions 変更時のみ再構築） */
  const shipmentMap = useMemo(
    () => new Map(SHIPMENTS.map((s) => [s.id, s])),
    []
  )

  const selected = positions.find((p) => p.driverId === selectedDriverId)
  const driver = selectedDriverId ? DRIVER_MAP.get(selectedDriverId) : undefined
  const shipment = selected?.shipmentId
    ? (shipmentMap.get(selected.shipmentId) ?? null)
    : null

  if (!selected || !driver) {
    // モバイル: ドライバー未選択時はパネル非表示
    if (isMobile) return null

    // 全ドライバーリスト（6名全員）
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 72,
          right: 12,
          zIndex: 15,
          width: 270,
          ...floatingPanelSx,
        }}>
        <Box
          sx={{
            px: 2,
            py: 1.25,
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
              letterSpacing: '0.04em',
            }}>
            Drivers ({positions.length})
          </Typography>
          <Typography
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: 'text.secondary',
            }}>
            {positions.filter((p) => p.status === 'moving').length} active
          </Typography>
        </Box>
        <Box sx={{ maxHeight: 420, overflow: 'auto' }}>
          {positions.map((dp) => {
            const d = DRIVER_MAP.get(dp.driverId)
            const color = DRIVER_STATUS_COLOR[dp.status]
            return (
              <Box
                key={dp.driverId}
                role='button'
                tabIndex={0}
                aria-label={`${d?.name ?? dp.driverId} — ${DRIVER_STATUS_LABEL[dp.status]}`}
                onClick={() => selectDriver(dp.driverId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    selectDriver(dp.driverId)
                  }
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  opacity: ['off_duty', 'break'].includes(dp.status) ? 0.55 : 1,
                  ...(dp.status === 'incident' && {
                    animation: `${incidentPulse} 1s ease-in-out infinite`,
                  }),
                }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: color,
                    flexShrink: 0,
                    ...(dp.status === 'incident' && {
                      animation: 'pulse-dot 1.5s infinite',
                    }),
                  }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                    {d?.name ?? dp.driverId}
                  </Typography>
                  <Typography
                    sx={{ fontSize: '12px', color: 'text.secondary' }}>
                    {d?.vehicle}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Chip
                    label={DRIVER_STATUS_LABEL[dp.status]}
                    size='small'
                    sx={{
                      height: 18,
                      fontSize: '12px',
                      fontWeight: 700,
                      bgcolor: alpha(color, 0.12),
                      color,
                    }}
                  />
                  {dp.eta !== null && dp.status === 'moving' && (
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '12px',
                        color: 'text.secondary',
                        mt: 0.25,
                      }}>
                      ETA {formatEta(dp.eta)}
                    </Typography>
                  )}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>
    )
  }

  // 選択中ドライバー詳細
  const originHub = shipment ? findHub(shipment.originHub) : null
  const destHub = shipment ? findHub(shipment.destinationHub) : null
  const color = DRIVER_STATUS_COLOR[selected.status]

  return (
    <Box
      sx={{
        position: 'absolute',
        zIndex: 15,
        ...floatingPanelEmphasizedSx,
        // モバイル: 下からスライドアップ
        ...(isMobile
          ? {
              bottom: 72,
              left: 12,
              right: 12,
              top: 'auto',
              width: 'auto',
              maxHeight: 360,
              overflowY: 'auto',
              animation: 'slideUp 0.25s ease',
              '@keyframes slideUp': {
                from: { opacity: 0, transform: 'translateY(24px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
            }
          : {
              top: 72,
              right: 12,
              width: 310,
            }),
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.25,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: color,
            }}
          />
          <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
            {driver.name}
          </Typography>
        </Box>
        <IconButton
          onClick={() => selectDriver(null)}
          tooltip='閉じる'
          size='small'>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        {/* ステータス + 速度 + ETA */}
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={DRIVER_STATUS_LABEL[selected.status]}
            size='small'
            sx={{
              height: 22,
              fontWeight: 700,
              fontSize: '12px',
              bgcolor: alpha(color, 0.12),
              color,
            }}
          />
          {selected.speed > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SpeedIcon
                sx={{ fontSize: 14, color: 'text.secondary' }}
                aria-hidden='true'
              />
              <Typography
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 600,
                }}>
                {Math.round(selected.speed)} km/h
              </Typography>
            </Box>
          )}
          {selected.eta !== null && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon
                sx={{ fontSize: 14, color: LOGI_ORANGE }}
                aria-hidden='true'
              />
              <Typography
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 700,
                  color: LOGI_ORANGE,
                }}>
                ETA {formatEta(selected.eta)}
              </Typography>
            </Box>
          )}
        </Box>

        {/* 車両 */}
        <Box
          sx={{
            p: 1.25,
            borderRadius: 1.5,
            bgcolor: 'action.hover',
            mb: 1.5,
          }}>
          <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
            {driver.vehicle} — {driver.licensePlate}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: 'text.disabled',
              mt: 0.25,
            }}>
            {selected.position.lat.toFixed(4)},{' '}
            {selected.position.lng.toFixed(4)}
          </Typography>
        </Box>

        {/* 進捗バー */}
        {selected.status === 'moving' && (
          <Box sx={{ mb: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mb: 0.5,
              }}>
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}>
                Progress
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  fontWeight: 700,
                }}>
                {Math.round(selected.routeProgress * 100)}%
              </Typography>
            </Box>
            <Box
              sx={{
                height: 5,
                borderRadius: 3,
                bgcolor: 'action.hover',
                overflow: 'hidden',
              }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${selected.routeProgress * 100}%`,
                  borderRadius: 3,
                  bgcolor: color,
                  transition: 'width 0.8s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                    animation: `${shimmer} 1.5s ease-in-out infinite`,
                  },
                }}
              />
            </Box>
          </Box>
        )}

        {/* 配送情報 */}
        {shipment && (
          <Box
            sx={{
              p: 1.25,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
            }}>
            <Typography
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: '12px',
                color: LOGI_ORANGE,
                mb: 0.5,
              }}>
              {shipment.trackingNo}
            </Typography>
            <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>
              {shipment.contents}
            </Typography>
            <Typography
              sx={{ fontSize: '13px', color: 'text.secondary', mt: 0.25 }}>
              {shipment.weight}kg — {shipment.dimensions}cm
            </Typography>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mt: 1,
              }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: '12px',
                  }}>
                  {shipment.originHub}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  {originHub?.city}
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  height: 1,
                  bgcolor: 'divider',
                  position: 'relative',
                }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: `${selected.routeProgress * 100}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: LOGI_ORANGE,
                  }}
                />
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: '12px',
                  }}>
                  {shipment.destinationHub}
                </Typography>
                <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                  {destHub?.city}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 1,
                pt: 0.75,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: 'text.secondary',
                  mb: 0.25,
                }}>
                送: {shipment.sender.company}
              </Typography>
              <Typography sx={{ fontSize: '12px', color: 'text.secondary' }}>
                届: {shipment.receiver.company}
              </Typography>
            </Box>

            <Chip
              label={STATUS_LABELS[shipment.status]}
              size='small'
              sx={{
                mt: 0.75,
                height: 18,
                fontSize: '12px',
                fontWeight: 700,
                bgcolor: alpha(STATUS_COLORS[shipment.status], 0.12),
                color: STATUS_COLORS[shipment.status],
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}
