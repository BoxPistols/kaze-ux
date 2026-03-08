/**
 * UTMプリフライトチェックパネル（マルチサイト対応）
 *
 * マルチサイトフライトのプリフライトチェック表示
 * - サイトごとのチェックリスト
 * - ドローンステータスカード（バッテリー、GPS、通信）
 * - 気象状況
 * - 空域ステータス
 * - 進捗バー（全体およびサイトごと）
 */

import BatteryFullIcon from '@mui/icons-material/BatteryFull'
import CloudIcon from '@mui/icons-material/Cloud'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import PublicIcon from '@mui/icons-material/Public'
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useMemo, useState } from 'react'

import {
  getAllDronesForFlight,
  getDronesBySite,
  getFlightSites,
  isSingleSiteFlight,
} from '../../utils/utmHelpers'

import type { ScheduledFlight } from '../../mocks/utmMultiDroneScenarios'
import type { SiteInfo } from '../../types/utmTypes'

interface UTMPreflightCheckPanelProps {
  flight: ScheduledFlight
  siteId?: string // 省略時は全サイト表示
  onCheckComplete?: (siteId: string) => void
}

// ドローンステータスカード
function DroneStatusCard(props: {
  drone: ScheduledFlight['drone']
}): JSX.Element {
  const { drone } = props
  const theme = useTheme()

  const getBatteryColor = (level: number): string => {
    if (level >= 80) return theme.palette.success.main
    if (level >= 50) return theme.palette.warning.main
    return theme.palette.error.main
  }

  const getSignalColor = (strength: number): string => {
    if (strength >= 80) return theme.palette.success.main
    if (strength >= 50) return theme.palette.warning.main
    return theme.palette.error.main
  }

  return (
    <Card
      variant='outlined'
      sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.5),
        borderColor: alpha(theme.palette.divider, 0.1),
      }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
          {drone.droneName}
        </Typography>
        <Typography
          variant='caption'
          color='text.secondary'
          gutterBottom
          display='block'>
          操縦者: {drone.pilotName}
        </Typography>

        <Stack spacing={1.5} sx={{ mt: 1.5 }}>
          {/* バッテリー */}
          <Box>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 0.5 }}>
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <BatteryFullIcon
                  sx={{
                    fontSize: 16,
                    color: getBatteryColor(drone.batteryLevel),
                  }}
                />
                <Typography variant='caption'>バッテリー</Typography>
              </Stack>
              <Typography
                variant='caption'
                fontWeight='bold'
                sx={{ color: getBatteryColor(drone.batteryLevel) }}>
                {drone.batteryLevel}%
              </Typography>
            </Stack>
            <LinearProgress
              variant='determinate'
              value={drone.batteryLevel}
              sx={{
                height: 6,
                borderRadius: 1,
                backgroundColor: alpha(
                  getBatteryColor(drone.batteryLevel),
                  0.2
                ),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getBatteryColor(drone.batteryLevel),
                },
              }}
            />
          </Box>

          {/* 通信 */}
          <Box>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'
              sx={{ mb: 0.5 }}>
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <SignalCellularAltIcon
                  sx={{
                    fontSize: 16,
                    color: getSignalColor(drone.signalStrength),
                  }}
                />
                <Typography variant='caption'>通信</Typography>
              </Stack>
              <Typography
                variant='caption'
                fontWeight='bold'
                sx={{ color: getSignalColor(drone.signalStrength) }}>
                {drone.signalStrength}%
              </Typography>
            </Stack>
            <LinearProgress
              variant='determinate'
              value={drone.signalStrength}
              sx={{
                height: 6,
                borderRadius: 1,
                backgroundColor: alpha(
                  getSignalColor(drone.signalStrength),
                  0.2
                ),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: getSignalColor(drone.signalStrength),
                },
              }}
            />
          </Box>

          {/* GPS */}
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'>
            <Stack direction='row' spacing={0.5} alignItems='center'>
              <GpsFixedIcon
                sx={{ fontSize: 16, color: theme.palette.success.main }}
              />
              <Typography variant='caption'>GPS</Typography>
            </Stack>
            <Chip
              label='良好'
              size='small'
              color='success'
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Stack>

          {/* ステータス */}
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'>
            <Typography variant='caption'>ステータス</Typography>
            <Chip
              label={
                drone.status === 'preflight'
                  ? 'プリフライト'
                  : drone.status === 'in_flight'
                    ? '飛行中'
                    : '待機中'
              }
              size='small'
              color={drone.status === 'preflight' ? 'warning' : 'default'}
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

// サイト別プリフライトセクション
function SitePreflightSection(props: {
  site: SiteInfo
  drones: ScheduledFlight['drone'][]
  weather: ScheduledFlight['weather']
  airspaceStatus: ScheduledFlight['airspaceStatus']
  preflightProgress: number
  expanded: boolean
  onToggle: () => void
}): JSX.Element {
  const {
    site,
    drones,
    weather,
    airspaceStatus,
    preflightProgress,
    expanded,
    onToggle,
  } = props
  const theme = useTheme()

  const getWeatherColor = (status: string): 'success' | 'warning' | 'error' => {
    if (status === 'good') return 'success'
    if (status === 'caution') return 'warning'
    return 'error'
  }

  const getWeatherLabel = (status: string): string => {
    const labels: Record<string, string> = {
      good: '良好',
      caution: '注意',
      warning: '警告',
      prohibited: '飛行禁止',
    }
    return labels[status] || status
  }

  return (
    <Accordion
      expanded={expanded}
      onChange={onToggle}
      sx={{
        bgcolor: alpha(theme.palette.background.paper, 0.7),
        '&:before': { display: 'none' },
      }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack
          direction='row'
          spacing={2}
          alignItems='center'
          sx={{ width: '100%', pr: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant='subtitle1' fontWeight='bold'>
              {site.name}
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              ドローン数: {drones.length}機
            </Typography>
          </Box>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Typography variant='caption' color='text.secondary'>
              進捗:
            </Typography>
            <Typography variant='caption' fontWeight='bold'>
              {preflightProgress}%
            </Typography>
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {/* 進捗バー */}
          <Box>
            <LinearProgress
              variant='determinate'
              value={preflightProgress}
              sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
              }}
            />
          </Box>

          {/* ドローンステータス */}
          <Box>
            <Typography variant='subtitle2' gutterBottom>
              ドローンステータス
            </Typography>
            <Grid container spacing={1.5}>
              {drones.map((drone) => (
                <Grid key={drone.droneId} size={{ xs: 12, sm: 6, md: 4 }}>
                  <DroneStatusCard drone={drone} />
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* 気象状況 */}
          <Box>
            <Typography variant='subtitle2' gutterBottom>
              気象状況
            </Typography>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.3),
              }}>
              <Stack spacing={1}>
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  alignItems='center'>
                  <Stack direction='row' spacing={0.5} alignItems='center'>
                    <CloudIcon sx={{ fontSize: 18 }} />
                    <Typography variant='body2'>飛行適性</Typography>
                  </Stack>
                  <Chip
                    label={getWeatherLabel(weather.status)}
                    size='small'
                    color={getWeatherColor(weather.status)}
                  />
                </Stack>
                <Divider />
                <Stack direction='row' spacing={2}>
                  <Typography variant='caption' color='text.secondary'>
                    気温: {weather.temperature}°C
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    風速: {weather.windSpeed}m/s
                  </Typography>
                  <Typography variant='caption' color='text.secondary'>
                    視程: {weather.visibility}km
                  </Typography>
                </Stack>
                <Typography variant='caption' color='text.secondary'>
                  {weather.description}
                </Typography>
              </Stack>
            </Paper>
          </Box>

          {/* 空域ステータス */}
          <Box>
            <Typography variant='subtitle2' gutterBottom>
              空域ステータス
            </Typography>
            <Paper
              variant='outlined'
              sx={{
                p: 2,
                bgcolor: alpha(theme.palette.background.paper, 0.3),
              }}>
              <Stack spacing={1}>
                <Stack
                  direction='row'
                  justifyContent='space-between'
                  alignItems='center'>
                  <Stack direction='row' spacing={0.5} alignItems='center'>
                    <PublicIcon sx={{ fontSize: 18 }} />
                    <Typography variant='body2'>空域状態</Typography>
                  </Stack>
                  <Chip
                    label={
                      airspaceStatus.notamActive ? 'NOTAM申請済み' : 'NOTAM不要'
                    }
                    size='small'
                    color={airspaceStatus.notamActive ? 'primary' : 'default'}
                  />
                </Stack>
                <Divider />
                <Stack direction='row' spacing={1} flexWrap='wrap'>
                  {airspaceStatus.inDID && (
                    <Chip
                      label='人口集中地区'
                      size='small'
                      variant='outlined'
                    />
                  )}
                  {airspaceStatus.nearAirport && (
                    <Chip
                      label='空港周辺'
                      size='small'
                      variant='outlined'
                      color='warning'
                    />
                  )}
                  {airspaceStatus.inRedZone && (
                    <Chip
                      label='レッドゾーン'
                      size='small'
                      variant='outlined'
                      color='error'
                    />
                  )}
                  {airspaceStatus.inYellowZone && (
                    <Chip
                      label='イエローゾーン'
                      size='small'
                      variant='outlined'
                      color='warning'
                    />
                  )}
                </Stack>
                <Typography variant='caption' color='text.secondary'>
                  {airspaceStatus.summary}
                </Typography>
              </Stack>
            </Paper>
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  )
}

function UTMPreflightCheckPanel(
  props: UTMPreflightCheckPanelProps
): JSX.Element {
  const { flight, siteId } = props
  const theme = useTheme()

  const sites = useMemo(() => getFlightSites(flight), [flight])
  const isSingleSite = useMemo(() => isSingleSiteFlight(flight), [flight])

  // サイトIDが指定されている場合は該当サイトのみ、それ以外は全サイト
  const targetSites = useMemo(() => {
    if (siteId) {
      const targetSite = sites.find((s) => s.id === siteId)
      return targetSite ? [targetSite] : []
    }
    return sites
  }, [sites, siteId])

  // 展開状態管理（最初のサイトをデフォルトで展開）
  const [expandedSiteId, setExpandedSiteId] = useState<string | null>(
    targetSites[0]?.id ?? null
  )

  // シングルサイトまたはサイト指定なしの場合は全ドローン、サイト指定ありの場合はサイトごと
  const dronesForDisplay = useMemo(() => {
    if (isSingleSite || !siteId) {
      return getAllDronesForFlight(flight)
    }
    return getDronesBySite(flight, siteId)
  }, [flight, isSingleSite, siteId])

  const handleToggleSite = (site: SiteInfo): void => {
    setExpandedSiteId((prev) => (prev === site.id ? null : site.id))
  }

  // マルチサイトでサイト指定なしの場合
  if (!isSingleSite && !siteId && targetSites.length > 0) {
    return (
      <Box>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant='h6' fontWeight='bold' gutterBottom>
            プリフライトチェック（全拠点）
          </Typography>
          <Stack direction='row' spacing={1} alignItems='center'>
            <Chip
              label={`${targetSites.length}拠点`}
              size='small'
              color='primary'
            />
            <Chip label={`${dronesForDisplay.length}機`} size='small' />
          </Stack>
        </Paper>

        <Stack spacing={1}>
          {targetSites.map((site) => {
            const siteDrones = getDronesBySite(flight, site.id)
            return (
              <SitePreflightSection
                key={site.id}
                site={site}
                drones={siteDrones}
                weather={flight.weather}
                airspaceStatus={flight.airspaceStatus}
                preflightProgress={flight.preflightProgress}
                expanded={expandedSiteId === site.id}
                onToggle={() => handleToggleSite(site)}
              />
            )
          })}
        </Stack>

        {flight.alerts.length > 0 && (
          <Alert severity='warning' sx={{ mt: 2 }}>
            <AlertTitle>注意事項</AlertTitle>
            {flight.alerts.map((alert) => (
              <Typography key={alert.id} variant='body2'>
                {alert.message}
              </Typography>
            ))}
          </Alert>
        )}
      </Box>
    )
  }

  // シングルサイトまたはサイト指定ありの場合
  const displaySite = targetSites[0]
  if (!displaySite) {
    return (
      <Alert severity='info'>
        <AlertTitle>サイト情報なし</AlertTitle>
        <Typography variant='body2'>
          表示可能なサイト情報がありません。
        </Typography>
      </Alert>
    )
  }

  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant='h6' fontWeight='bold' gutterBottom>
          プリフライトチェック
          {!isSingleSite && ` - ${displaySite.name}`}
        </Typography>
        <Stack direction='row' spacing={1} alignItems='center' sx={{ mb: 1.5 }}>
          <Chip
            label={
              flight.preflightStatus === 'completed'
                ? '完了'
                : flight.preflightStatus === 'in_progress'
                  ? '進行中'
                  : flight.preflightStatus === 'failed'
                    ? '失敗'
                    : '未開始'
            }
            size='small'
            color={
              flight.preflightStatus === 'completed'
                ? 'success'
                : flight.preflightStatus === 'in_progress'
                  ? 'warning'
                  : flight.preflightStatus === 'failed'
                    ? 'error'
                    : 'default'
            }
          />
          <Chip label={`${dronesForDisplay.length}機`} size='small' />
        </Stack>

        {/* 進捗バー */}
        <Box>
          <Stack
            direction='row'
            justifyContent='space-between'
            alignItems='center'
            sx={{ mb: 0.5 }}>
            <Typography variant='caption' color='text.secondary'>
              全体進捗
            </Typography>
            <Typography variant='caption' fontWeight='bold'>
              {flight.preflightProgress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant='determinate'
            value={flight.preflightProgress}
            sx={{
              height: 8,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
            }}
          />
        </Box>
      </Paper>

      {/* ドローンステータス */}
      <Box sx={{ mb: 2 }}>
        <Typography variant='subtitle2' gutterBottom>
          ドローンステータス
        </Typography>
        <Grid container spacing={1.5}>
          {dronesForDisplay.map((drone) => (
            <Grid key={drone.droneId} size={{ xs: 12, sm: 6, md: 4 }}>
              <DroneStatusCard drone={drone} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 気象状況 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant='subtitle2' gutterBottom>
          気象状況
        </Typography>
        <Paper
          variant='outlined'
          sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
          <Stack spacing={1}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'>
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <CloudIcon sx={{ fontSize: 18 }} />
                <Typography variant='body2'>飛行適性</Typography>
              </Stack>
              <Chip
                label={
                  flight.weather.status === 'good'
                    ? '良好'
                    : flight.weather.status === 'caution'
                      ? '注意'
                      : flight.weather.status === 'warning'
                        ? '警告'
                        : '飛行禁止'
                }
                size='small'
                color={
                  flight.weather.status === 'good'
                    ? 'success'
                    : flight.weather.status === 'caution'
                      ? 'warning'
                      : 'error'
                }
              />
            </Stack>
            <Divider />
            <Stack direction='row' spacing={2}>
              <Typography variant='caption' color='text.secondary'>
                気温: {flight.weather.temperature}°C
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                風速: {flight.weather.windSpeed}m/s
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                視程: {flight.weather.visibility}km
              </Typography>
            </Stack>
            <Typography variant='caption' color='text.secondary'>
              {flight.weather.description}
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* 空域ステータス */}
      <Box sx={{ mb: 2 }}>
        <Typography variant='subtitle2' gutterBottom>
          空域ステータス
        </Typography>
        <Paper
          variant='outlined'
          sx={{ p: 2, bgcolor: alpha(theme.palette.background.paper, 0.5) }}>
          <Stack spacing={1}>
            <Stack
              direction='row'
              justifyContent='space-between'
              alignItems='center'>
              <Stack direction='row' spacing={0.5} alignItems='center'>
                <PublicIcon sx={{ fontSize: 18 }} />
                <Typography variant='body2'>空域状態</Typography>
              </Stack>
              <Chip
                label={
                  flight.airspaceStatus.notamActive
                    ? 'NOTAM申請済み'
                    : 'NOTAM不要'
                }
                size='small'
                color={
                  flight.airspaceStatus.notamActive ? 'primary' : 'default'
                }
              />
            </Stack>
            <Divider />
            <Stack direction='row' spacing={1} flexWrap='wrap'>
              {flight.airspaceStatus.inDID && (
                <Chip label='人口集中地区' size='small' variant='outlined' />
              )}
              {flight.airspaceStatus.nearAirport && (
                <Chip
                  label='空港周辺'
                  size='small'
                  variant='outlined'
                  color='warning'
                />
              )}
              {flight.airspaceStatus.inRedZone && (
                <Chip
                  label='レッドゾーン'
                  size='small'
                  variant='outlined'
                  color='error'
                />
              )}
              {flight.airspaceStatus.inYellowZone && (
                <Chip
                  label='イエローゾーン'
                  size='small'
                  variant='outlined'
                  color='warning'
                />
              )}
            </Stack>
            <Typography variant='caption' color='text.secondary'>
              {flight.airspaceStatus.summary}
            </Typography>
          </Stack>
        </Paper>
      </Box>

      {/* アラート */}
      {flight.alerts.length > 0 && (
        <Alert severity='warning'>
          <AlertTitle>注意事項</AlertTitle>
          {flight.alerts.map((alert) => (
            <Typography key={alert.id} variant='body2'>
              {alert.message}
            </Typography>
          ))}
        </Alert>
      )}
    </Box>
  )
}

export default UTMPreflightCheckPanel
