/**
 * UTMパイロットHUD（ヘッドアップディスプレイ）
 * 航空機/ドローンパイロット向けのリアルタイム飛行情報表示
 */

import { Box, Typography, Tooltip } from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

import { useProjectSettingsOptional } from '@/contexts/ProjectSettingsContext'

import type { DroneFlightStatus, WeatherData } from '../../types/utmTypes'

interface UTMPilotHUDProps {
  drone: DroneFlightStatus | null
  weather?: WeatherData | null
  visible?: boolean
  leftDockWidth?: number
}

// HUDカラーパレット
const HUD_COLORS = {
  primary: '#00ff88', // HUDグリーン
  warning: '#ffaa00',
  danger: '#ff4444',
  info: '#00aaff',
  dim: 'rgba(0, 255, 136, 0.3)',
  background: 'rgba(0, 0, 0, 0.7)',
}

const HUD_TAPE_WIDTH = 45
type HudDockSide = 'left' | 'right'

// ツールチップ共通設定
const TOOLTIP_DELAY = 300 // hoverで気づける速度にする

// HUD用ツールチップスタイル
const hudTooltipProps = {
  enterDelay: TOOLTIP_DELAY,
  enterNextDelay: TOOLTIP_DELAY,
  arrow: true,
  placement: 'top' as const,
  slotProps: {
    tooltip: {
      sx: {
        bgcolor: 'rgba(0, 0, 0, 0.9)',
        border: `1px solid ${HUD_COLORS.primary}`,
        '& .MuiTooltip-arrow': {
          color: HUD_COLORS.primary,
        },
        fontSize: '0.75rem',
        maxWidth: 200,
      },
    },
  },
}

// 高度テープ（右側）
const AltitudeTape = ({
  altitude,
  maxAltitude = 150,
  dockSide = 'right',
  unitLabel = 'm',
  formattedValue,
}: {
  altitude: number
  maxAltitude?: number
  dockSide?: HudDockSide
  unitLabel?: string
  formattedValue?: string
}) => {
  const ticks = useMemo(() => {
    const step = 20
    const range = 60
    const centerAlt = Math.round(altitude / step) * step
    const result = []
    for (let i = centerAlt + range; i >= centerAlt - range; i -= step) {
      if (i >= 0 && i <= maxAltitude + 20) {
        result.push(i)
      }
    }
    return result
  }, [altitude, maxAltitude])

  const offset = (altitude % 20) * 2.5

  return (
    <Tooltip
      title={`ALT（高度）- 現在の飛行高度 [${unitLabel}]。上部の数値が現在高度です。`}
      {...hudTooltipProps}
      placement={dockSide === 'left' ? 'right' : 'left'}>
      <Box
        sx={{
          position: 'relative',
          width: 90,
          height: 180,
          overflow: 'visible',
          pointerEvents: 'auto',
          cursor: 'help',
        }}>
        {/* 現在値表示（目盛の上に縦積み） */}
        <Box
          sx={{
            position: 'absolute',
            left:
              dockSide === 'left'
                ? HUD_TAPE_WIDTH / 2
                : `calc(100% - ${HUD_TAPE_WIDTH / 2}px)`,
            top: -26,
            transform: 'translateX(-50%)',
            bgcolor: HUD_COLORS.background,
            border: `1px solid ${HUD_COLORS.primary}`,
            px: 1,
            py: 0.125,
            borderRadius: 0.5,
            minWidth: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: HUD_COLORS.primary,
              lineHeight: 1.2,
              fontVariantNumeric: 'tabular-nums',
            }}>
            {formattedValue ?? altitude.toFixed(0)}
          </Typography>
        </Box>

        {/* テープ表示領域（ここだけクリップする） */}
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* テープ背景 */}
          <Box
            sx={{
              position: 'absolute',
              ...(dockSide === 'left' ? { left: 0 } : { right: 0 }),
              top: 0,
              bottom: 0,
              width: HUD_TAPE_WIDTH,
              bgcolor: HUD_COLORS.background,
              ...(dockSide === 'left'
                ? { borderRight: `1px solid ${HUD_COLORS.dim}` }
                : { borderLeft: `1px solid ${HUD_COLORS.dim}` }),
              borderRadius: 1,
            }}
          />

          {/* 目盛り */}
          <motion.div
            animate={{ y: offset }}
            transition={{ duration: 0.1, ease: 'linear' }}
            style={{
              position: 'absolute',
              ...(dockSide === 'left' ? { left: 0 } : { right: 0 }),
              top: '50%',
              transform: 'translateY(-50%)',
              width: HUD_TAPE_WIDTH,
            }}>
            {ticks.map((tick, index) => {
              const y = (index - Math.floor(ticks.length / 2)) * 45
              return (
                <Box
                  key={tick}
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: y,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.65rem',
                      color: HUD_COLORS.primary,
                      textShadow: `0 0 4px ${HUD_COLORS.primary}`,
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                    {tick}
                  </Typography>
                  <Box
                    sx={{
                      width: 6,
                      height: 1,
                      bgcolor: HUD_COLORS.primary,
                      flexShrink: 0,
                    }}
                  />
                </Box>
              )
            })}
          </motion.div>

          {/* 中央インジケーター */}
          <Box
            sx={{
              position: 'absolute',
              ...(dockSide === 'left'
                ? { left: HUD_TAPE_WIDTH }
                : { right: HUD_TAPE_WIDTH }),
              top: '50%',
              transform: 'translateY(-50%)',
            }}>
            <Box
              sx={{
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                ...(dockSide === 'left'
                  ? { borderRight: `8px solid ${HUD_COLORS.primary}` }
                  : { borderLeft: `8px solid ${HUD_COLORS.primary}` }),
                filter: `drop-shadow(0 0 3px ${HUD_COLORS.primary})`,
              }}
            />
          </Box>

          {/* 現在値表示（上部に配置して余白を詰める） */}
          {/* ラベル */}
          <Typography
            sx={{
              position: 'absolute',
              ...(dockSide === 'left' ? { left: 4 } : { right: 4 }),
              bottom: 4,
              fontFamily: 'monospace',
              fontSize: '0.625rem',
              color: HUD_COLORS.dim,
            }}>
            ALT
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  )
}

// 速度テープ（左側）
const SpeedTape = ({
  speed,
  maxSpeed = 20,
  dockSide = 'left',
  unitLabel = 'm/s',
  formattedValue,
}: {
  speed: number
  maxSpeed?: number
  dockSide?: HudDockSide
  unitLabel?: string
  formattedValue?: string
}) => {
  const ticks = useMemo(() => {
    const step = 2
    const range = 6
    const centerSpd = Math.round(speed / step) * step
    const result = []
    for (let i = centerSpd + range; i >= centerSpd - range; i -= step) {
      if (i >= 0 && i <= maxSpeed + 4) {
        result.push(i)
      }
    }
    return result
  }, [speed, maxSpeed])

  const offset = (speed % 2) * 22.5

  return (
    <Tooltip
      title={`SPD（対地速度）- 現在の速度 [${unitLabel}]。上部の数値が現在速度です。`}
      {...hudTooltipProps}
      placement={dockSide === 'left' ? 'right' : 'left'}>
      <Box
        sx={{
          position: 'relative',
          width: 90,
          height: 180,
          overflow: 'visible',
          pointerEvents: 'auto',
          cursor: 'help',
        }}>
        {/* 現在値表示（目盛の上に縦積み） */}
        <Box
          sx={{
            position: 'absolute',
            left:
              dockSide === 'left'
                ? HUD_TAPE_WIDTH / 2
                : `calc(100% - ${HUD_TAPE_WIDTH / 2}px)`,
            top: -26,
            transform: 'translateX(-50%)',
            bgcolor: HUD_COLORS.background,
            border: `1px solid ${HUD_COLORS.primary}`,
            px: 1,
            py: 0.125,
            borderRadius: 0.5,
            minWidth: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: HUD_COLORS.primary,
              lineHeight: 1.2,
              fontVariantNumeric: 'tabular-nums',
            }}>
            {formattedValue ?? speed.toFixed(1)}
          </Typography>
        </Box>

        {/* テープ表示領域（ここだけクリップする） */}
        <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          {/* テープ背景 */}
          <Box
            sx={{
              position: 'absolute',
              ...(dockSide === 'left' ? { left: 0 } : { right: 0 }),
              top: 0,
              bottom: 0,
              width: HUD_TAPE_WIDTH,
              bgcolor: HUD_COLORS.background,
              ...(dockSide === 'left'
                ? { borderRight: `1px solid ${HUD_COLORS.dim}` }
                : { borderLeft: `1px solid ${HUD_COLORS.dim}` }),
              borderRadius: 1,
            }}
          />

          {/* 目盛り */}
          <motion.div
            animate={{ y: offset }}
            transition={{ duration: 0.1, ease: 'linear' }}
            style={{
              position: 'absolute',
              ...(dockSide === 'left' ? { left: 0 } : { right: 0 }),
              top: '50%',
              transform: 'translateY(-50%)',
              width: HUD_TAPE_WIDTH,
            }}>
            {ticks.map((tick, index) => {
              const y = (index - Math.floor(ticks.length / 2)) * 45
              return (
                <Box
                  key={tick}
                  sx={{
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: y,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.65rem',
                      color: HUD_COLORS.primary,
                      textShadow: `0 0 4px ${HUD_COLORS.primary}`,
                      lineHeight: 1,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                    {tick}
                  </Typography>
                  <Box
                    sx={{
                      width: 6,
                      height: 1,
                      bgcolor: HUD_COLORS.primary,
                      flexShrink: 0,
                    }}
                  />
                </Box>
              )
            })}
          </motion.div>

          {/* 中央インジケーター */}
          <Box
            sx={{
              position: 'absolute',
              ...(dockSide === 'left'
                ? { left: HUD_TAPE_WIDTH }
                : { right: HUD_TAPE_WIDTH }),
              top: '50%',
              transform: 'translateY(-50%)',
            }}>
            <Box
              sx={{
                width: 0,
                height: 0,
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                ...(dockSide === 'left'
                  ? { borderRight: `8px solid ${HUD_COLORS.primary}` }
                  : { borderLeft: `8px solid ${HUD_COLORS.primary}` }),
                filter: `drop-shadow(0 0 3px ${HUD_COLORS.primary})`,
              }}
            />
          </Box>

          {/* ラベル */}
          <Typography
            sx={{
              position: 'absolute',
              ...(dockSide === 'left' ? { left: 4 } : { right: 4 }),
              bottom: 4,
              fontFamily: 'monospace',
              fontSize: '0.625rem',
              color: HUD_COLORS.dim,
            }}>
            SPD
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  )
}

// ヘディングインジケーター（上部）
const HeadingIndicator = ({ heading }: { heading: number }) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  const ticks = useMemo(() => {
    const result = []
    for (let i = 0; i < 360; i += 10) {
      result.push(i)
    }
    return result
  }, [])

  return (
    <Tooltip
      title='HDG（機首方位）- 0〜360°（真北基準）。N/E/S/Wは方位。中央が現在方位です。'
      {...hudTooltipProps}
      placement='bottom'>
      <Box
        sx={{
          position: 'relative',
          width: 260,
          height: 45,
          overflow: 'hidden',
          pointerEvents: 'auto',
          cursor: 'help',
        }}>
        {/* 背景 */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 32,
            bgcolor: HUD_COLORS.background,
            borderBottom: `1px solid ${HUD_COLORS.dim}`,
            borderRadius: 1,
          }}
        />

        {/* コンパステープ */}
        <motion.div
          animate={{ x: -heading * 1.8 + 130 }}
          transition={{ duration: 0.1, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: 4,
            display: 'flex',
            width: 720 * 2,
          }}>
          {[...ticks, ...ticks].map((tick, index) => {
            const dirIndex = tick / 45
            const isCardinal = tick % 90 === 0
            const isOrdinal = tick % 45 === 0 && !isCardinal

            return (
              <Box
                key={`${tick}-${index}`}
                sx={{
                  position: 'relative',
                  width: 18,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}>
                <Box
                  sx={{
                    width: 1,
                    height: isCardinal ? 12 : isOrdinal ? 8 : 5,
                    bgcolor: HUD_COLORS.primary,
                  }}
                />
                {(isCardinal || isOrdinal) && (
                  <Typography
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: isCardinal ? '0.625rem' : '0.625rem',
                      color: HUD_COLORS.primary,
                      fontWeight: isCardinal ? 700 : 400,
                      lineHeight: 1,
                      mt: 0.25,
                    }}>
                    {isCardinal ? directions[dirIndex] : tick}
                  </Typography>
                )}
              </Box>
            )
          })}
        </motion.div>

        {/* 中央マーカー */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 0,
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: `8px solid ${HUD_COLORS.primary}`,
          }}
        />

        {/* 現在値表示 */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            bottom: 0,
            transform: 'translateX(-50%)',
            bgcolor: HUD_COLORS.background,
            border: `1px solid ${HUD_COLORS.primary}`,
            px: 1,
            py: 0.125,
            borderRadius: 0.5,
          }}>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: HUD_COLORS.primary,
              lineHeight: 1.2,
            }}>
            {heading.toFixed(0).padStart(3, '0')}°
          </Typography>
        </Box>
      </Box>
    </Tooltip>
  )
}

// 風向風速インジケーター
const WindIndicator = ({
  windSpeed,
  windDirection,
  droneHeading,
  formattedWindSpeed,
  unitLabel = 'm/s',
}: {
  windSpeed: number
  windDirection: number
  droneHeading: number
  formattedWindSpeed?: string
  unitLabel?: string
}) => {
  const relativeWind = (windDirection - droneHeading + 360) % 360

  return (
    <Tooltip
      title={`WIND（風）- 数値は風速 [${unitLabel}]。矢印は「風が吹いてくる向き」（機体基準）です。`}
      {...hudTooltipProps}
      placement='left'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 1,
          bgcolor: HUD_COLORS.background,
          borderRadius: 1,
          pointerEvents: 'auto',
          cursor: 'help',
        }}>
        <Box
          sx={{
            position: 'relative',
            width: 50,
            height: 50,
          }}>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              border: `1px solid ${HUD_COLORS.dim}`,
              borderRadius: '50%',
            }}
          />
          <motion.div
            animate={{ rotate: relativeWind }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}>
            <Box
              sx={{
                width: 2,
                height: 20,
                bgcolor: HUD_COLORS.info,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -5,
                  left: -3,
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderBottom: `6px solid ${HUD_COLORS.info}`,
                },
              }}
            />
          </motion.div>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 8,
              height: 8,
              bgcolor: HUD_COLORS.primary,
              borderRadius: '50%',
            }}
          />
        </Box>

        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.65rem',
            color: HUD_COLORS.info,
            mt: 0.5,
            lineHeight: 1,
          }}>
          {formattedWindSpeed ?? `${windSpeed.toFixed(1)}m/s`}
        </Typography>
        <Typography
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.625rem',
            color: HUD_COLORS.dim,
            lineHeight: 1,
          }}>
          WIND
        </Typography>
      </Box>
    </Tooltip>
  )
}

// ステータスラベルを日本語に
const getStatusLabel = (status: string) => {
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
      return '着陸'
    case 'rth':
      return 'RTH'
    case 'emergency':
      return '緊急'
    default:
      return status
  }
}

// バッテリー・信号インジケーター
const StatusBar = ({
  battery,
  signal,
  status,
}: {
  battery: number
  signal: number
  status: string
}) => {
  const getBatteryColor = () => {
    if (battery >= 50) return HUD_COLORS.primary
    if (battery >= 20) return HUD_COLORS.warning
    return HUD_COLORS.danger
  }

  const getSignalColor = () => {
    if (signal >= 60) return HUD_COLORS.primary
    if (signal >= 30) return HUD_COLORS.warning
    return HUD_COLORS.danger
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 1.5,
        py: 0.5,
        height: 32,
        bgcolor: HUD_COLORS.background,
        borderRadius: 1,
        pointerEvents: 'auto',
      }}>
      {/* バッテリー */}
      <Tooltip
        title='BAT（バッテリー残量）- [%]。目安: 緑=50%以上 / 黄=20〜50% / 赤=20%未満。'
        {...hudTooltipProps}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'help',
          }}>
          <Box
            sx={{
              width: 24,
              height: 12,
              border: `1px solid ${getBatteryColor()}`,
              borderRadius: 0.5,
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                right: -3,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 2,
                height: 5,
                bgcolor: getBatteryColor(),
                borderRadius: '0 1px 1px 0',
              },
            }}>
            <Box
              sx={{
                position: 'absolute',
                left: 1,
                top: 1,
                bottom: 1,
                width: `${Math.min(battery, 100)}%`,
                bgcolor: getBatteryColor(),
                borderRadius: 0.25,
              }}
            />
          </Box>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.65rem',
              color: getBatteryColor(),
              minWidth: 28,
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}>
            {battery.toFixed(0)}%
          </Typography>
        </Box>
      </Tooltip>

      {/* 信号 */}
      <Tooltip
        title='SIG（通信品質）- 送信機とのリンク強度 [%]。低下すると遅延/途絶の恐れがあります。'
        {...hudTooltipProps}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'help',
          }}>
          <Box sx={{ display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
            {[1, 2, 3, 4].map((i) => (
              <Box
                key={i}
                sx={{
                  width: 3,
                  height: 3 + i * 2,
                  bgcolor: signal >= i * 25 ? getSignalColor() : HUD_COLORS.dim,
                  borderRadius: 0.25,
                }}
              />
            ))}
          </Box>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.65rem',
              color: getSignalColor(),
              minWidth: 28,
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}>
            {signal.toFixed(0)}%
          </Typography>
        </Box>
      </Tooltip>

      {/* ステータス */}
      <Tooltip
        title='STATUS（機体状態）- 現在の飛行状態。RTH=Return To Home（自動帰還）'
        {...hudTooltipProps}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 52,
            px: 1,
            py: 0.25,
            borderRadius: 999,
            border: `1px solid ${
              status === 'in_flight' ? HUD_COLORS.primary : HUD_COLORS.warning
            }`,
            bgcolor: HUD_COLORS.background,
            cursor: 'help',
          }}>
          <Typography
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.65rem',
              color:
                status === 'in_flight'
                  ? HUD_COLORS.primary
                  : HUD_COLORS.warning,
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}>
            {getStatusLabel(status)}
          </Typography>
        </Box>
      </Tooltip>
    </Box>
  )
}

const UTMPilotHUD = ({
  drone,
  weather,
  visible = true,
  leftDockWidth = 0,
}: UTMPilotHUDProps) => {
  const { formatters, settings } = useProjectSettingsOptional()

  if (!drone || !visible) return null

  const hudInset = 8

  // 単位ラベルの取得
  const altitudeLabel = settings.units.altitude === 'feet' ? 'ft' : 'm'
  const speedLabel = formatters.units.labels.speed

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 20,
        }}>
        {/* ヘディング（上部中央） */}
        <Box
          sx={{
            position: 'absolute',
            top: hudInset,
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
          <HeadingIndicator heading={drone.position.heading} />
        </Box>

        {/* 速度テープ（左） */}
        <Box
          sx={{
            position: 'absolute',
            left: hudInset + leftDockWidth,
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
          <SpeedTape
            speed={drone.position.speed}
            dockSide='left'
            unitLabel={speedLabel}
            formattedValue={formatters.units.speed(drone.position.speed, 1)}
          />
        </Box>

        {/* 高度テープ（右側） */}
        <Box
          sx={{
            position: 'absolute',
            right: hudInset,
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
          <AltitudeTape
            altitude={drone.position.altitude}
            dockSide='right'
            unitLabel={altitudeLabel}
            formattedValue={formatters.units.altitude(
              drone.position.altitude,
              0
            )}
          />
        </Box>

        {/* 風向インジケーター（右下） */}
        {weather && (
          <Box
            sx={{
              position: 'absolute',
              right: 110,
              bottom: 56,
            }}>
            <WindIndicator
              windSpeed={weather.current.windSpeed}
              windDirection={weather.current.windDirection}
              droneHeading={drone.position.heading}
              formattedWindSpeed={formatters.units.speed(
                weather.current.windSpeed,
                1
              )}
              unitLabel={speedLabel}
            />
          </Box>
        )}

        {/* ステータスバー（下部） */}
        <Box
          sx={{
            position: 'absolute',
            bottom: hudInset,
            left: '50%',
            transform: 'translateX(-50%)',
          }}>
          <StatusBar
            battery={drone.batteryLevel}
            signal={drone.signalStrength}
            status={drone.status}
          />
        </Box>

        {/* 機体名（左上） */}
        <Tooltip
          title='機体名 - 現在選択中のドローン'
          {...hudTooltipProps}
          placement='right'>
          <Box
            sx={{
              position: 'absolute',
              top: hudInset,
              left: leftDockWidth + 110,
              bgcolor: HUD_COLORS.background,
              px: 1,
              py: 0.5,
              borderRadius: 0.5,
              pointerEvents: 'auto',
              maxWidth: 140,
              cursor: 'help',
            }}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                color: HUD_COLORS.primary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
              {drone.droneName}
            </Typography>
          </Box>
        </Tooltip>

        {/* 座標（右上） */}
        <Tooltip
          title='GPS（緯度/経度）- WGS84（小数点以下は概ねメートル級の精度表示）'
          {...hudTooltipProps}
          placement='left'>
          <Box
            sx={{
              position: 'absolute',
              top: hudInset,
              right: 110,
              bgcolor: HUD_COLORS.background,
              px: 1,
              py: 0.5,
              borderRadius: 0.5,
              pointerEvents: 'auto',
              cursor: 'help',
            }}>
            <Typography
              sx={{
                fontFamily: 'monospace',
                fontSize: '0.625rem',
                color: HUD_COLORS.dim,
                lineHeight: 1.3,
                whiteSpace: 'pre-line',
              }}>
              {
                formatters.units.coordinate(
                  drone.position.latitude,
                  drone.position.longitude
                ).combined
              }
            </Typography>
          </Box>
        </Tooltip>
      </motion.div>
    </AnimatePresence>
  )
}

export default UTMPilotHUD
