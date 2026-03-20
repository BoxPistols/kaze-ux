/**
 * タイムラインコントロールバー — 再生/停止/速度/経過時間/配送カウント/ログ切替
 */
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FastForwardIcon from '@mui/icons-material/FastForward'
import ListAltIcon from '@mui/icons-material/ListAlt'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { Box, Typography, alpha, keyframes, useMediaQuery } from '@mui/material'

import { IconButton } from '@/components/ui/icon-button'

import { useSimulation, DRIVER_STATUS_COLOR } from '~/data/simulation'
import { floatingPanelSx } from '~/utils/panelStyles'

const SPEEDS = [1, 2, 5, 10]

// コロン点滅アニメーション（再生中のみ使用）
const colonBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`

// 経過時間をHH:MM:SS形式で返す（コロンを独立spanで制御するためパーツ分割）
const formatTimeParts = (seconds: number) => {
  const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
  const s = String(Math.floor(seconds % 60)).padStart(2, '0')
  return { h, m, s }
}

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
        ...floatingPanelSx,
        borderRadius: 2,
      }}>
      {/* 再生/停止（medium相当のサイズ） */}
      <IconButton
        onClick={isPlaying ? pause : play}
        tooltip={isPlaying ? '一時停止' : '再生'}
        size='small'
        sx={{
          width: 36,
          height: 36,
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
          <PauseIcon sx={{ fontSize: 24 }} />
        ) : (
          <PlayArrowIcon sx={{ fontSize: 24 }} />
        )}
      </IconButton>

      <IconButton onClick={reset} tooltip='リセット' size='small'>
        <ReplayIcon sx={{ fontSize: 18 }} />
      </IconButton>

      {/* 経過時間（再生中はコロンが点滅） */}
      <Box
        sx={{
          px: 1.5,
          py: 0.25,
          borderRadius: 1.5,
          bgcolor: 'action.hover',
        }}>
        <Typography
          component='span'
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: '16px',
            letterSpacing: '0.05em',
            display: 'inline-flex',
            alignItems: 'center',
          }}>
          {(() => {
            const { h, m, s } = formatTimeParts(elapsed)
            const colonSx = isPlaying
              ? { animation: `${colonBlink} 1s step-end infinite` }
              : {}
            return (
              <>
                {h}
                <Box component='span' sx={colonSx}>
                  :
                </Box>
                {m}
                <Box component='span' sx={colonSx}>
                  :
                </Box>
                {s}
              </>
            )
          })()}
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
                fontSize: '14px',
                fontWeight: speed === s ? 800 : 700,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                bgcolor: 'transparent',
                color:
                  speed === s ? DRIVER_STATUS_COLOR.moving : 'text.secondary',
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: 'action.hover',
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
              fontSize: '14px',
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
              fontSize: '14px',
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
                fontSize: '14px',
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
