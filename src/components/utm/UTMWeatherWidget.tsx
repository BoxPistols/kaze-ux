/**
 * UTM気象情報ウィジェット
 * リアルタイム気象データと飛行適性を表示
 */

import AirIcon from '@mui/icons-material/Air'
import CloudIcon from '@mui/icons-material/Cloud'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import NavigationIcon from '@mui/icons-material/Navigation'
import RefreshIcon from '@mui/icons-material/Refresh'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import VisibilityIcon from '@mui/icons-material/Visibility'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import WaterDropIcon from '@mui/icons-material/WaterDrop'
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  Stack,
  Chip,
  alpha,
  useTheme,
  Collapse,
} from '@mui/material'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useCallback, memo } from 'react'

import { useProjectSettingsOptional } from '@/contexts/ProjectSettingsContext'
import {
  fetchWeatherData,
  getWindDirection,
  DEFAULT_WEATHER_THRESHOLDS,
} from '@/services/weatherService'
import { colors } from '@/styles/tokens'

import type { WeatherData } from '../../types/utmTypes'

interface UTMWeatherWidgetProps {
  latitude?: number
  longitude?: number
  apiKey?: string
  updateInterval?: number // ミリ秒
  compact?: boolean
  forceCollapse?: boolean // 外部からの折りたたみ制御
}

// 飛行適性のステータスカラー
const getStatusColor = (status: WeatherData['flightCondition']['status']) => {
  switch (status) {
    case 'excellent':
      return colors.success.main
    case 'good':
      return colors.success.light
    case 'caution':
      return colors.warning.main
    case 'warning':
      return colors.warning.dark
    case 'dangerous':
      return colors.error.main
    default:
      return colors.gray[500]
  }
}

// 飛行適性のステータスラベル
const getStatusLabel = (status: WeatherData['flightCondition']['status']) => {
  switch (status) {
    case 'excellent':
      return '最適'
    case 'good':
      return '良好'
    case 'caution':
      return '注意'
    case 'warning':
      return '警告'
    case 'dangerous':
      return '危険'
    default:
      return '不明'
  }
}

// 風向アイコンコンポーネント（メモ化）
const WindDirectionIndicator = memo(({ degrees }: { degrees: number }) => (
  <Box
    component={motion.div}
    animate={{ rotate: degrees }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
    }}>
    <NavigationIcon sx={{ fontSize: 18, color: colors.primary[500] }} />
  </Box>
))

// 風速ゲージ（メモ化）
const WindSpeedGauge = memo(
  ({
    speed,
    maxSpeed = DEFAULT_WEATHER_THRESHOLDS.maxWindSpeed,
    formattedSpeed,
  }: {
    speed: number
    maxSpeed?: number
    formattedSpeed?: string
  }) => {
    const percentage = Math.min((speed / maxSpeed) * 100, 100)
    const color =
      speed >= maxSpeed
        ? colors.error.main
        : speed >= maxSpeed * 0.7
          ? colors.warning.main
          : colors.success.main

    return (
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant='caption' color='text.secondary'>
            風速
          </Typography>
          <Typography variant='caption' fontWeight={600} sx={{ color }}>
            {formattedSpeed ?? `${speed.toFixed(1)} m/s`}
          </Typography>
        </Box>
        <LinearProgress
          variant='determinate'
          value={percentage}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: alpha(color, 0.2),
            '& .MuiLinearProgress-bar': {
              bgcolor: color,
              borderRadius: 3,
            },
          }}
        />
      </Box>
    )
  }
)

// 短期予報アイテム（メモ化）
const ForecastItem = memo(
  ({
    time,
    temp,
    windSpeed,
    precipProb,
    formattedTime,
    formattedTemp,
    formattedWindSpeed,
  }: {
    time: Date
    temp: number
    windSpeed: number
    precipProb: number
    formattedTime?: string
    formattedTemp?: string
    formattedWindSpeed?: string
  }) => {
    const timeStr =
      formattedTime ??
      time.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      })

    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          bgcolor: alpha(colors.primary[500], 0.05),
          minWidth: 52,
        }}>
        <Typography variant='caption' color='text.secondary' fontWeight={500}>
          {timeStr}
        </Typography>
        <Typography variant='body2' fontWeight={600}>
          {formattedTemp ?? `${temp.toFixed(0)}°`}
        </Typography>
        <Stack direction='row' spacing={0.5} alignItems='center'>
          <AirIcon sx={{ fontSize: 10, color: colors.info.main }} />
          <Typography variant='caption' sx={{ fontSize: '0.65rem' }}>
            {formattedWindSpeed ?? windSpeed.toFixed(0)}
          </Typography>
        </Stack>
        {precipProb > 0 && (
          <Stack direction='row' spacing={0.5} alignItems='center'>
            <WaterDropIcon sx={{ fontSize: 10, color: colors.info.main }} />
            <Typography variant='caption' sx={{ fontSize: '0.65rem' }}>
              {precipProb}%
            </Typography>
          </Stack>
        )}
      </Box>
    )
  }
)

const UTMWeatherWidget = ({
  latitude = 35.6812, // 東京駅デフォルト
  longitude = 139.7671,
  apiKey,
  updateInterval = 60000, // 1分
  compact = false,
  forceCollapse = false,
}: UTMWeatherWidgetProps) => {
  const theme = useTheme()
  const { formatters } = useProjectSettingsOptional()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(!compact)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // 外部からの折りたたみ制御（トグル）
  useEffect(() => {
    setExpanded(!forceCollapse)
  }, [forceCollapse])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchWeatherData(latitude, longitude, apiKey)
      setWeather(data)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Weather fetch error:', error)
    } finally {
      setLoading(false)
    }
  }, [latitude, longitude, apiKey])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, updateInterval)
    return () => clearInterval(interval)
  }, [fetchData, updateInterval])

  if (!weather) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 2,
          border: `1px solid ${alpha(colors.gray[500], 0.1)}`,
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudIcon sx={{ color: colors.gray[400] }} />
          <Typography color='text.secondary'>
            気象データ読み込み中...
          </Typography>
        </Box>
        <LinearProgress sx={{ mt: 1 }} />
      </Paper>
    )
  }

  const statusColor = getStatusColor(weather.flightCondition.status)

  return (
    <Paper
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      elevation={0}
      sx={{
        overflow: 'hidden',
        borderRadius: 2,
        border: `1px solid ${alpha(statusColor, 0.2)}`,
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
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: expanded
            ? `1px solid ${alpha(colors.gray[500], 0.1)}`
            : 'none',
          background: alpha(statusColor, 0.08),
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {weather.flightCondition.status === 'dangerous' ||
          weather.flightCondition.status === 'warning' ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}>
              <WarningAmberIcon sx={{ color: statusColor }} />
            </motion.div>
          ) : (
            <FlightTakeoffIcon sx={{ color: statusColor }} />
          )}
          <Box>
            <Typography variant='subtitle2' fontWeight={700}>
              飛行条件
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {weather.location.name}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={getStatusLabel(weather.flightCondition.status)}
            size='small'
            sx={{
              bgcolor: alpha(statusColor, 0.15),
              color: statusColor,
              fontWeight: 700,
              fontSize: '0.7rem',
            }}
          />
          <Tooltip title='更新'>
            <IconButton size='small' onClick={fetchData} disabled={loading}>
              <RefreshIcon
                fontSize='small'
                sx={{
                  animation: loading ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </IconButton>
          </Tooltip>
          <IconButton size='small' onClick={() => setExpanded(!expanded)}>
            {expanded ? (
              <ExpandLessIcon fontSize='small' />
            ) : (
              <ExpandMoreIcon fontSize='small' />
            )}
          </IconButton>
        </Box>
      </Box>

      {/* メインコンテンツ */}
      <Collapse in={expanded}>
        <Box sx={{ p: 2 }}>
          {/* 飛行条件メッセージ */}
          <Typography
            variant='body2'
            sx={{ mb: 2, color: statusColor, fontWeight: 500 }}>
            {weather.flightCondition.message}
          </Typography>

          {/* 現在の気象データ */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
              mb: 2,
            }}>
            {/* 気温 */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(colors.primary[500], 0.05),
                textAlign: 'center',
              }}>
              <ThermostatIcon
                sx={{ fontSize: 20, color: colors.error.light, mb: 0.5 }}
              />
              <Typography variant='h6' fontWeight={700}>
                {formatters.units.temperature(weather.current.temperature, 1)}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                気温
              </Typography>
            </Box>

            {/* 湿度 */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(colors.primary[500], 0.05),
                textAlign: 'center',
              }}>
              <WaterDropIcon
                sx={{ fontSize: 20, color: colors.info.main, mb: 0.5 }}
              />
              <Typography variant='h6' fontWeight={700}>
                {weather.current.humidity}%
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                湿度
              </Typography>
            </Box>

            {/* 視程 */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(colors.primary[500], 0.05),
                textAlign: 'center',
              }}>
              <VisibilityIcon
                sx={{ fontSize: 20, color: colors.success.main, mb: 0.5 }}
              />
              <Typography variant='h6' fontWeight={700}>
                {weather.current.visibility.toFixed(0)}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                視程 km
              </Typography>
            </Box>
          </Box>

          {/* 風速 */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: alpha(colors.primary[500], 0.05),
              mb: 2,
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AirIcon sx={{ color: colors.info.main }} />
                <Typography variant='subtitle2' fontWeight={600}>
                  風況
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <WindDirectionIndicator
                  degrees={weather.current.windDirection}
                />
                <Typography variant='caption' color='text.secondary'>
                  {getWindDirection(weather.current.windDirection)} (
                  {weather.current.windDirection}°)
                </Typography>
              </Box>
            </Box>
            <WindSpeedGauge
              speed={weather.current.windSpeed}
              formattedSpeed={formatters.units.speed(
                weather.current.windSpeed,
                1
              )}
            />
            {weather.current.windGust && (
              <Typography
                variant='caption'
                color='warning.main'
                sx={{ display: 'block', mt: 0.5 }}>
                突風: {formatters.units.speed(weather.current.windGust, 1)}
              </Typography>
            )}
          </Box>

          {/* 注意事項 */}
          {weather.flightCondition.factors.length > 0 &&
            weather.flightCondition.factors[0] !== '良好' && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mb: 0.5, display: 'block' }}>
                  注意事項
                </Typography>
                <Stack direction='row' spacing={0.5} flexWrap='wrap' gap={0.5}>
                  {weather.flightCondition.factors.map((factor, index) => (
                    <Chip
                      key={index}
                      label={factor}
                      size='small'
                      variant='outlined'
                      sx={{
                        fontSize: '0.65rem',
                        height: 22,
                        borderColor: alpha(statusColor, 0.5),
                        color: statusColor,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            )}

          {/* 短期予報 */}
          {weather.shortTermForecast &&
            weather.shortTermForecast.length > 0 && (
              <Box>
                <Typography
                  variant='caption'
                  color='text.secondary'
                  sx={{ mb: 1, display: 'block' }}>
                  短期予報
                </Typography>
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
                  <AnimatePresence>
                    {weather.shortTermForecast
                      .slice(0, 6)
                      .map((forecast, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}>
                          <ForecastItem
                            time={forecast.time}
                            temp={forecast.temperature}
                            windSpeed={forecast.windSpeed}
                            precipProb={forecast.precipitationProbability}
                            formattedTime={formatters.time(forecast.time)}
                            formattedTemp={formatters.units.temperature(
                              forecast.temperature,
                              0
                            )}
                            formattedWindSpeed={formatters.units.convert
                              .speed(forecast.windSpeed)
                              .toFixed(0)}
                          />
                        </motion.div>
                      ))}
                  </AnimatePresence>
                </Box>
              </Box>
            )}

          {/* 最終更新時刻 */}
          <Typography
            variant='caption'
            color='text.secondary'
            sx={{ display: 'block', mt: 2, textAlign: 'right' }}>
            更新: {lastUpdate ? formatters.time(lastUpdate) : '-'}
          </Typography>
        </Box>
      </Collapse>

      {/* コンパクト表示時のサマリー */}
      {!expanded && (
        <Box
          sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ThermostatIcon sx={{ fontSize: 16, color: colors.gray[400] }} />
            <Typography variant='caption'>
              {formatters.units.temperature(weather.current.temperature, 0)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AirIcon sx={{ fontSize: 16, color: colors.gray[400] }} />
            <Typography variant='caption'>
              {formatters.units.speed(weather.current.windSpeed, 1)}
            </Typography>
          </Box>
          <Typography variant='caption' color='text.secondary'>
            {weather.current.conditions}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

// メインコンポーネントもメモ化
const MemoizedUTMWeatherWidget = memo(UTMWeatherWidget)

export default MemoizedUTMWeatherWidget
