/**
 * タイムラインコントロールバー — 再生/停止/速度/経過時間/配送カウント/ログ切替
 */
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FastForwardIcon from '@mui/icons-material/FastForward'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { Box, Typography, alpha, useMediaQuery } from '@mui/material'

import { IconButton } from '@/components/ui/icon-button'

import { useSimulation, DRIVER_STATUS_COLOR } from '~/data/simulation'

const formatTime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const SPEEDS = [1, 2, 5, 10]

export const TimelineBar = () => {
  const isMobile = useMediaQuery('(max-width:768px)')
  const elapsed = useSimulation((s) => s.elapsedSeconds)
  const isPlaying = useSimulation((s) => s.isPlaying)
  const speed = useSimulation((s) => s.speed)
  const play = useSimulation((s) => s.play)
  const pause = useSimulation((s) => s.pause)
  const setSpeed = useSimulation((s) => s.setSpeed)
  const reset = useSimulation((s) => s.reset)
  const positions = useSimulation((s) => s.positions)
  const incidents = useSimulation((s) => s.incidents)
  const deliveryCount = useSimulation((s) => s.deliveryCount)
  const showLog = useSimulation((s) => s.showLog)
  const toggleLog = useSimulation((s) => s.toggleLog)

  const movingCount = positions.filter((p) => p.status === 'moving').length
  const incidentCount = incidents.filter((i) => !i.resolved).length

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 1 : 1.5,
        px: isMobile ? 1.5 : 2,
        py: 1,
        // モバイル: 画面幅に合わせる
        ...(isMobile
          ? {
              left: 12,
              width: 'calc(100% - 24px)',
            }
          : {
              left: '50%',
              transform: 'translateX(-50%)',
            }),
        borderRadius: 3,
        backdropFilter: 'blur(16px)',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(10, 15, 28, 0.92)'
            : 'rgba(255,255,255,0.94)',
        border: '1px solid',
        borderColor: (theme) => alpha(theme.palette.divider, 0.15),
        boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}>
      {/* 再生/停止 */}
      <IconButton
        onClick={isPlaying ? pause : play}
        tooltip={isPlaying ? '一時停止' : '再生'}
        size='small'
        sx={{
          bgcolor: isPlaying
            ? alpha(DRIVER_STATUS_COLOR.moving, 0.15)
            : alpha(DRIVER_STATUS_COLOR.delivering, 0.15),
          color: isPlaying
            ? DRIVER_STATUS_COLOR.moving
            : DRIVER_STATUS_COLOR.delivering,
          '&:hover': {
            bgcolor: isPlaying
              ? alpha(DRIVER_STATUS_COLOR.moving, 0.25)
              : alpha(DRIVER_STATUS_COLOR.delivering, 0.25),
          },
        }}>
        {isPlaying ? (
          <PauseIcon sx={{ fontSize: 20 }} />
        ) : (
          <PlayArrowIcon sx={{ fontSize: 20 }} />
        )}
      </IconButton>

      <IconButton onClick={reset} tooltip='リセット' size='small'>
        <ReplayIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* 経過時間 */}
      <Box
        sx={{
          px: 1.5,
          py: 0.25,
          borderRadius: 1.5,
          bgcolor: 'action.hover',
        }}>
        <Typography
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: '14px',
            letterSpacing: '0.05em',
          }}>
          {formatTime(elapsed)}
        </Typography>
      </Box>

      {/* 速度（モバイル非表示） */}
      {!isMobile && (
        <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
          {SPEEDS.map((s) => (
            <Box
              key={s}
              role='button'
              tabIndex={0}
              aria-label={`再生速度 ${s}倍`}
              onClick={() => setSpeed(s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setSpeed(s)
                }
              }}
              sx={{
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                fontSize: '13px',
                fontWeight: 700,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                bgcolor:
                  speed === s ? DRIVER_STATUS_COLOR.moving : 'transparent',
                color: speed === s ? '#fff' : 'text.secondary',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor:
                    speed === s ? DRIVER_STATUS_COLOR.moving : 'action.hover',
                },
              }}>
              {s}x
            </Box>
          ))}
          <FastForwardIcon
            sx={{ fontSize: 14, color: 'text.disabled', ml: 0.25 }}
            aria-hidden='true'
          />
        </Box>
      )}

      {!isMobile && <Box sx={{ width: 1, height: 24, bgcolor: 'divider' }} />}

      {/* ステータス */}
      {isMobile && <Box sx={{ width: 1, height: 24, bgcolor: 'divider' }} />}
      <Box
        sx={{
          display: 'flex',
          gap: isMobile ? 1 : 1.5,
          alignItems: 'center',
          flex: isMobile ? 1 : 'none',
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: DRIVER_STATUS_COLOR.moving,
            }}
          />
          <Typography
            sx={{
              fontSize: '13px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
            }}>
            {movingCount} 走行
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CheckCircleIcon
            sx={{ fontSize: 12, color: DRIVER_STATUS_COLOR.delivering }}
            aria-hidden='true'
          />
          <Typography
            sx={{
              fontSize: '13px',
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              color: DRIVER_STATUS_COLOR.delivering,
            }}>
            {deliveryCount} 完了
          </Typography>
        </Box>

        {incidentCount > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: DRIVER_STATUS_COLOR.incident,
                animation: 'pulse-dot 1.5s infinite',
              }}
            />
            <Typography
              sx={{
                fontSize: '13px',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                color: DRIVER_STATUS_COLOR.incident,
              }}>
              {incidentCount} 異常
            </Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ width: 1, height: 24, bgcolor: 'divider' }} />

      {/* ログ切替 */}
      <IconButton
        onClick={toggleLog}
        tooltip={showLog ? 'ログを閉じる' : 'イベントログ'}
        size='small'
        sx={{
          color: showLog ? DRIVER_STATUS_COLOR.loading : 'text.secondary',
          bgcolor: showLog
            ? alpha(DRIVER_STATUS_COLOR.loading, 0.1)
            : 'transparent',
        }}>
        <ListAltIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  )
}
