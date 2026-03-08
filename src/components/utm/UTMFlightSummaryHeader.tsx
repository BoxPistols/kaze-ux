/**
 * UTMFlightSummaryHeader - フライトサマリーヘッダー
 *
 * ポストフライトページで表示するフライト概要情報
 */

import FlightIcon from '@mui/icons-material/Flight'
import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material'
import { useMemo } from 'react'

import type { ScheduledFlight } from '@/mocks/utmMultiDroneScenarios'
import { getFlightSites, isSingleSiteFlight } from '@/utils/utmHelpers'

interface UTMFlightSummaryHeaderProps {
  flight: ScheduledFlight
}

/**
 * フライトサマリーヘッダーコンポーネント
 */
function UTMFlightSummaryHeader(
  props: UTMFlightSummaryHeaderProps
): JSX.Element {
  const { flight } = props

  const sites = useMemo(() => getFlightSites(flight), [flight])
  const isMultiSite = useMemo(() => !isSingleSiteFlight(flight), [flight])

  // フライト時間計算（モックデータの場合は仮の値）
  const flightDuration = useMemo(() => {
    // 実装では実際のフライト開始・終了時刻から計算
    // モックデータでは仮の値
    return 45 // 分
  }, [])

  // 総距離計算（モックデータの場合は仮の値）
  const totalDistance = useMemo(() => {
    // 実装では各ドローンの飛行距離を合計
    return 12.5 // km
  }, [])

  // ドローン数
  const droneCount = useMemo(() => {
    if (flight.drones) return flight.drones.length
    return 1
  }, [flight.drones])

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <FlightIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant='h5' fontWeight='bold' gutterBottom>
              フライトサマリー
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              フライトID: {flight.id}
            </Typography>
          </Box>
          <Chip
            label={flight.preflightStatus === 'completed' ? '完了' : '進行中'}
            color={
              flight.preflightStatus === 'completed' ? 'success' : 'primary'
            }
            size='small'
          />
        </Box>

        <Grid container spacing={3}>
          {/* フライト時間 */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              gutterBottom
              display='block'>
              飛行時間
            </Typography>
            <Typography variant='h6' fontWeight='bold'>
              {flightDuration}分
            </Typography>
          </Grid>

          {/* 総距離 */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              gutterBottom
              display='block'>
              総距離
            </Typography>
            <Typography variant='h6' fontWeight='bold'>
              {totalDistance}km
            </Typography>
          </Grid>

          {/* ドローン数 */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Typography
              variant='caption'
              color='text.secondary'
              gutterBottom
              display='block'>
              ドローン数
            </Typography>
            <Typography variant='h6' fontWeight='bold'>
              {droneCount}機
            </Typography>
          </Grid>

          {/* サイト数（マルチサイトの場合のみ） */}
          {isMultiSite && (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography
                variant='caption'
                color='text.secondary'
                gutterBottom
                display='block'>
                拠点数
              </Typography>
              <Typography variant='h6' fontWeight='bold'>
                {sites.length}拠点
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* フライト日時 */}
        <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant='caption'
                color='text.secondary'
                gutterBottom
                display='block'>
                予定開始日時
              </Typography>
              <Typography variant='body2'>
                {flight.estimatedStartTime
                  ? new Date(flight.estimatedStartTime).toLocaleString('ja-JP')
                  : '未設定'}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Typography
                variant='caption'
                color='text.secondary'
                gutterBottom
                display='block'>
                プリフライトステータス
              </Typography>
              <Typography variant='body2'>
                {flight.preflightStatus === 'completed'
                  ? '完了'
                  : flight.preflightStatus === 'in_progress'
                    ? '進行中'
                    : flight.preflightStatus === 'failed'
                      ? '失敗'
                      : '待機中'}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* マルチサイト情報 */}
        {isMultiSite && sites.length > 0 && (
          <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
            <Typography
              variant='caption'
              color='text.secondary'
              gutterBottom
              display='block'>
              飛行拠点
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {sites.map((site) => (
                <Chip
                  key={site.id}
                  label={`${site.name} (${site.drones.length}機)`}
                  size='small'
                  variant='outlined'
                />
              ))}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default UTMFlightSummaryHeader
