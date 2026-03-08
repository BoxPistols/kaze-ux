/**
 * UTM未来予測タイムライン
 * 風向・天気の短期予報を視覚的に表示
 */

import AirIcon from '@mui/icons-material/Air'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import NavigationIcon from '@mui/icons-material/Navigation'
import WarningIcon from '@mui/icons-material/Warning'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  alpha,
  useTheme,
  Collapse,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback, useMemo, memo } from 'react'

import { colors } from '@/styles/tokens'

interface ForecastPoint {
  time: Date
  temperature: number
  windSpeed: number
  windDirection: number
  precipitation: number
  precipitationProbability: number
  conditions: string
}

interface UTMForecastTimelineProps {
  forecasts?: ForecastPoint[]
  currentWindSpeed?: number
  currentWindDirection?: number
  updateInterval?: number
  forceCollapse?: boolean // 外部からの折りたたみ制御
}

// モック予報データを生成
const generateMockForecast = (): ForecastPoint[] => {
  const now = new Date()
  const baseTemp = 15 + Math.sin((now.getHours() / 24) * Math.PI * 2) * 5
  const baseWind = 3 + Math.random() * 4
  const baseDir = Math.floor(Math.random() * 360)

  return Array.from({ length: 12 }, (_, i) => {
    const minutesAhead = (i + 1) * 5 // 5分間隔
    const time = new Date(now.getTime() + minutesAhead * 60 * 1000)
    const windChange = Math.sin((i / 12) * Math.PI) * 3
    const dirChange = Math.sin((i / 6) * Math.PI) * 30

    return {
      time,
      temperature: baseTemp + (Math.random() - 0.5) * 2,
      windSpeed: Math.max(0, baseWind + windChange + (Math.random() - 0.5) * 2),
      windDirection:
        (baseDir + dirChange + (Math.random() - 0.5) * 20 + 360) % 360,
      precipitation: Math.random() < 0.1 ? Math.random() * 3 : 0,
      precipitationProbability: Math.floor(Math.random() * 30),
      conditions: Math.random() > 0.8 ? '曇り' : '晴れ',
    }
  })
}

// 風向変化の警告を検出
const detectWindChangeWarning = (
  forecasts: ForecastPoint[],
  currentDir: number
): { hasWarning: boolean; message: string; minutesUntil: number } | null => {
  for (let i = 0; i < forecasts.length; i++) {
    const dirDiff = Math.abs(forecasts[i].windDirection - currentDir)
    const normalizedDiff = Math.min(dirDiff, 360 - dirDiff)

    if (normalizedDiff > 45) {
      const minutesUntil = Math.round(
        (forecasts[i].time.getTime() - Date.now()) / 60000
      )
      return {
        hasWarning: true,
        message: `約${minutesUntil}分後に風向が${normalizedDiff.toFixed(0)}°変化`,
        minutesUntil,
      }
    }
  }
  return null
}

// 風速変化の警告を検出
const detectWindSpeedWarning = (
  forecasts: ForecastPoint[],
  currentSpeed: number
): { hasWarning: boolean; message: string; minutesUntil: number } | null => {
  for (let i = 0; i < forecasts.length; i++) {
    const speedIncrease = forecasts[i].windSpeed - currentSpeed

    if (speedIncrease > 3 || forecasts[i].windSpeed > 8) {
      const minutesUntil = Math.round(
        (forecasts[i].time.getTime() - Date.now()) / 60000
      )
      return {
        hasWarning: true,
        message:
          speedIncrease > 3
            ? `約${minutesUntil}分後に風速が${speedIncrease.toFixed(1)}m/s増加予測`
            : `約${minutesUntil}分後に風速${forecasts[i].windSpeed.toFixed(1)}m/sに達する予測`,
        minutesUntil,
      }
    }
  }
  return null
}

// タイムラインポイントコンポーネント
type TimelinePointProps = Readonly<{
  forecast: ForecastPoint
  index: number
  isNow: boolean
  prevDirection?: number
}>

const TimelinePointComponent = ({
  forecast,
  index,
  isNow,
  prevDirection,
}: TimelinePointProps) => {
  const timeStr = forecast.time.toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const directionChange =
    typeof prevDirection === 'number'
      ? Math.min(
          Math.abs(forecast.windDirection - prevDirection),
          360 - Math.abs(forecast.windDirection - prevDirection)
        )
      : 0

  const hasSignificantChange = directionChange > 30

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 50,
          px: 0.5,
        }}>
        {/* 時刻 */}
        <Typography
          variant='caption'
          sx={{
            fontSize: '0.625rem',
            color: isNow ? colors.primary[500] : 'text.secondary',
            fontWeight: isNow ? 700 : 400,
          }}>
          {isNow ? 'Now' : timeStr}
        </Typography>

        {/* 風向アイコン */}
        <Box
          sx={{
            position: 'relative',
            my: 0.5,
          }}>
          <motion.div
            animate={{ rotate: forecast.windDirection }}
            transition={{ duration: 0.3 }}>
            <NavigationIcon
              sx={{
                fontSize: 18,
                color: hasSignificantChange
                  ? colors.warning.main
                  : colors.info.main,
                filter: hasSignificantChange
                  ? `drop-shadow(0 0 3px ${colors.warning.main})`
                  : 'none',
              }}
            />
          </motion.div>
          {hasSignificantChange && (
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: colors.warning.main,
              }}
            />
          )}
        </Box>

        {/* 風速 */}
        <Typography
          variant='caption'
          sx={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color:
              forecast.windSpeed > 8
                ? colors.error.main
                : forecast.windSpeed > 5
                  ? colors.warning.main
                  : colors.success.main,
          }}>
          {forecast.windSpeed.toFixed(1)}
        </Typography>

        {/* 降水確率（0以上の場合のみ） */}
        {forecast.precipitationProbability > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            <WaterDropIcon
              sx={{ fontSize: 10, color: colors.info.main, opacity: 0.7 }}
            />
            <Typography
              variant='caption'
              sx={{ fontSize: '0.625rem', color: colors.info.main }}>
              {forecast.precipitationProbability}%
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  )
}

// TimelinePointをメモ化（forecastの値が同じなら再レンダリングをスキップ）
const areTimelinePointPropsEqual = (
  prevProps: TimelinePointProps,
  nextProps: TimelinePointProps
): boolean => {
  return (
    prevProps.forecast.time.getTime() === nextProps.forecast.time.getTime() &&
    prevProps.forecast.windSpeed === nextProps.forecast.windSpeed &&
    prevProps.forecast.windDirection === nextProps.forecast.windDirection &&
    prevProps.forecast.precipitationProbability ===
      nextProps.forecast.precipitationProbability &&
    prevProps.index === nextProps.index &&
    prevProps.isNow === nextProps.isNow &&
    prevProps.prevDirection === nextProps.prevDirection
  )
}

const TimelinePoint = memo(TimelinePointComponent, areTimelinePointPropsEqual)

const UTMForecastTimeline = ({
  forecasts: externalForecasts,
  currentWindSpeed = 5,
  currentWindDirection = 180,
  updateInterval = 30000, // 30秒間隔で更新
  forceCollapse = false,
}: UTMForecastTimelineProps) => {
  const theme = useTheme()
  const [forecasts, setForecasts] = useState<ForecastPoint[]>([])
  const [expanded, setExpanded] = useState(true)
  const [nowPointTime, setNowPointTime] = useState<Date>(() => new Date())

  // 外部からの折りたたみ制御（トグル）
  useEffect(() => {
    setExpanded(!forceCollapse)
  }, [forceCollapse])

  // 予報データを更新
  const updateForecasts = useCallback(() => {
    setNowPointTime(new Date())
    if (externalForecasts && externalForecasts.length > 0) {
      setForecasts(externalForecasts)
    } else {
      setForecasts(generateMockForecast())
    }
  }, [externalForecasts])

  useEffect(() => {
    updateForecasts()
    const interval = setInterval(updateForecasts, updateInterval)
    return () => clearInterval(interval)
  }, [updateForecasts, updateInterval])

  // 警告を検出
  const windDirWarning = useMemo(
    () => detectWindChangeWarning(forecasts, currentWindDirection),
    [forecasts, currentWindDirection]
  )

  const windSpeedWarning = useMemo(
    () => detectWindSpeedWarning(forecasts, currentWindSpeed),
    [forecasts, currentWindSpeed]
  )

  const hasWarning = windDirWarning || windSpeedWarning

  const timelineForecasts = useMemo<ForecastPoint[]>(() => {
    // Nowポイント（現在の風）を先頭に差し込む
    const nowPoint: ForecastPoint = {
      time: nowPointTime,
      temperature: forecasts[0]?.temperature ?? 0,
      windSpeed: currentWindSpeed,
      windDirection: currentWindDirection,
      precipitation: 0,
      precipitationProbability: 0,
      conditions: '',
    }

    return [nowPoint, ...forecasts]
  }, [nowPointTime, forecasts, currentWindSpeed, currentWindDirection])

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: 'hidden',
        borderRadius: 2,
        border: `1px solid ${alpha(hasWarning ? colors.warning.main : colors.gray[500], hasWarning ? 0.3 : 0.1)}`,
        background:
          theme.palette.mode === 'dark'
            ? alpha(colors.gray[900], 0.7)
            : alpha('#fff', 0.75),
        backdropFilter: 'blur(16px)',
        boxShadow: `0 4px 20px ${alpha('#000', 0.1)}`,
      }}>
      {/* ヘッダー */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: hasWarning
            ? alpha(colors.warning.main, 0.1)
            : alpha(colors.info.main, 0.05),
          borderBottom: expanded
            ? `1px solid ${alpha(colors.gray[500], 0.1)}`
            : 'none',
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasWarning ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}>
              <WarningIcon sx={{ fontSize: 18, color: colors.warning.main }} />
            </motion.div>
          ) : (
            <AirIcon sx={{ fontSize: 18, color: colors.info.main }} />
          )}
          <Typography variant='subtitle2' fontWeight={600}>
            短期予報
          </Typography>
        </Box>

        <IconButton size='small' onClick={() => setExpanded(!expanded)}>
          {expanded ? (
            <ExpandLessIcon fontSize='small' />
          ) : (
            <ExpandMoreIcon fontSize='small' />
          )}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 1.5 }}>
          {/* 警告表示 */}
          <AnimatePresence>
            {hasWarning && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}>
                <Box
                  sx={{
                    p: 1,
                    mb: 1.5,
                    borderRadius: 1,
                    bgcolor: alpha(colors.warning.main, 0.1),
                    border: `1px solid ${alpha(colors.warning.main, 0.3)}`,
                  }}>
                  {windDirWarning && (
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        color: colors.warning.main,
                        fontWeight: 500,
                      }}>
                      注意: {windDirWarning.message}
                    </Typography>
                  )}
                  {windSpeedWarning && (
                    <Typography
                      variant='caption'
                      sx={{
                        display: 'block',
                        color: colors.warning.main,
                        fontWeight: 500,
                      }}>
                      注意: {windSpeedWarning.message}
                    </Typography>
                  )}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* タイムライン */}
          <Box
            sx={{
              display: 'flex',
              gap: 0.5,
              overflowX: 'auto',
              pb: 0.5,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(colors.gray[500], 0.3),
                borderRadius: 2,
              },
            }}>
            {timelineForecasts.map((forecast, index) => (
              <TimelinePoint
                key={
                  index === 0 ? 'now' : `t-${forecast.time.getTime()}-${index}`
                }
                forecast={forecast}
                index={index}
                isNow={index === 0}
                prevDirection={
                  index > 0
                    ? timelineForecasts[index - 1]?.windDirection
                    : undefined
                }
              />
            ))}
          </Box>

          {/* 凡例 */}
          <Box
            sx={{
              mt: 1.5,
              pt: 1,
              borderTop: `1px solid ${alpha(colors.gray[500], 0.1)}`,
              display: 'flex',
              gap: 2,
              justifyContent: 'center',
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <NavigationIcon sx={{ fontSize: 12, color: colors.info.main }} />
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.625rem' }}>
                風向
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant='caption'
                sx={{ fontSize: '0.625rem', color: colors.success.main }}>
                ●
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.625rem' }}>
                {'<5m/s'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant='caption'
                sx={{ fontSize: '0.625rem', color: colors.warning.main }}>
                ●
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.625rem' }}>
                5-8m/s
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant='caption'
                sx={{ fontSize: '0.625rem', color: colors.error.main }}>
                ●
              </Typography>
              <Typography
                variant='caption'
                color='text.secondary'
                sx={{ fontSize: '0.625rem' }}>
                {'>8m/s'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  )
}

// メインコンポーネントもメモ化
const MemoizedUTMForecastTimeline = memo(UTMForecastTimeline)

export default MemoizedUTMForecastTimeline
