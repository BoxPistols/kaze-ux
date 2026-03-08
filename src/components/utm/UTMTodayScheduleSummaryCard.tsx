/**
 * UTMTodayScheduleSummaryCard - 今日の予定サマリーカード
 *
 * 今日予定されているフライトを表示するサマリーカード
 * - ステータス別グループ化（プリフライト、飛行中、完了）
 * - クイックアクションボタン
 * - 色分けされたステータスインジケーター
 */

import FlightIcon from '@mui/icons-material/Flight'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import RefreshIcon from '@mui/icons-material/Refresh'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  getScenarioFlights,
  type ScheduledFlight,
} from '@/mocks/utmMultiDroneScenarios'
import { getFlightSites } from '@/utils/utmHelpers'

interface FlightGroup {
  status: 'preflight' | 'in_flight' | 'completed'
  label: string
  color: 'primary' | 'success' | 'default'
  flights: ScheduledFlight[]
}

/**
 * 今日の予定サマリーカードコンポーネント
 */
function UTMTodayScheduleSummaryCard(): JSX.Element {
  const navigate = useNavigate()
  const [lastRefresh, setLastRefresh] = useState(new Date())

  // 今日のフライトを取得（次の24時間）
  const todayFlights = useMemo(() => {
    const allFlights = getScenarioFlights('default')
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

    return allFlights.filter((flight) => {
      const flightTime = new Date(flight.estimatedStartTime)
      return flightTime >= now && flightTime <= tomorrow
    })
    // lastRefreshは手動更新のトリガーとして使用
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastRefresh])

  // ステータス別にグループ化
  const groupedFlights = useMemo<FlightGroup[]>(() => {
    const groups: FlightGroup[] = [
      {
        status: 'preflight',
        label: 'プリフライト',
        color: 'primary',
        flights: [],
      },
      {
        status: 'in_flight',
        label: '飛行中',
        color: 'success',
        flights: [],
      },
      {
        status: 'completed',
        label: '完了',
        color: 'default',
        flights: [],
      },
    ]

    todayFlights.forEach((flight) => {
      if (flight.preflightStatus === 'completed') {
        // プリフライト完了 = 飛行中または完了
        // ここでは簡易的に全て飛行中として扱う
        groups[1].flights.push(flight)
      } else {
        // プリフライト中
        groups[0].flights.push(flight)
      }
    })

    return groups.filter((group) => group.flights.length > 0)
  }, [todayFlights])

  // リフレッシュハンドラ
  const handleRefresh = (): void => {
    setLastRefresh(new Date())
  }

  // フライトクリックハンドラ
  const handleFlightClick = (flight: ScheduledFlight, status: string): void => {
    if (status === 'preflight') {
      // プリフライトタブへ
      navigate(`/project/${flight.id}?tab=preflight`)
    } else if (status === 'in_flight') {
      // モニタリングページへ
      navigate(`/monitoring/${flight.id}`)
    } else if (status === 'completed') {
      // ポストフライトページへ
      navigate(`/postflight/${flight.id}`)
    }
  }

  // クイックアクションボタン
  const getQuickAction = (
    flight: ScheduledFlight,
    status: string
  ): JSX.Element | null => {
    if (status === 'preflight') {
      return (
        <Button
          size='small'
          variant='outlined'
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/project/${flight.id}?tab=preflight`)
          }}>
          開始
        </Button>
      )
    } else if (status === 'in_flight') {
      return (
        <Button
          size='small'
          variant='contained'
          color='success'
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/monitoring/${flight.id}`)
          }}>
          監視
        </Button>
      )
    } else if (status === 'completed') {
      return (
        <Button
          size='small'
          variant='outlined'
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/postflight/${flight.id}`)
          }}>
          レポート
        </Button>
      )
    }
    return null
  }

  if (todayFlights.length === 0) {
    return (
      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}>
            <Typography variant='h6' fontWeight='bold'>
              今日の予定
            </Typography>
            <IconButton
              size='small'
              onClick={handleRefresh}
              aria-label='リフレッシュ'>
              <RefreshIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              py: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}>
            <FlightIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography variant='body2' color='text.secondary'>
              今日の予定フライトはありません
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        {/* ヘッダー */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}>
          <Box>
            <Typography variant='h6' fontWeight='bold'>
              今日の予定
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              {todayFlights.length}件のフライト
            </Typography>
          </Box>
          <IconButton
            size='small'
            onClick={handleRefresh}
            aria-label='リフレッシュ'>
            <RefreshIcon />
          </IconButton>
        </Box>

        {/* ステータス別グループ */}
        {groupedFlights.map((group, groupIndex) => (
          <Box key={group.status}>
            {groupIndex > 0 && <Divider sx={{ my: 2 }} />}

            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip label={group.label} size='small' color={group.color} />
              <Typography variant='caption' color='text.secondary'>
                {group.flights.length}件
              </Typography>
            </Box>

            <List disablePadding>
              {group.flights.map((flight) => {
                const sites = getFlightSites(flight)
                const isMultiSite = sites.length > 1

                return (
                  <ListItem
                    key={flight.id}
                    disablePadding
                    secondaryAction={getQuickAction(flight, group.status)}>
                    <ListItemButton
                      onClick={() => handleFlightClick(flight, group.status)}
                      sx={{ borderRadius: 1 }}>
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}>
                            <Typography variant='body2' fontWeight='bold'>
                              {flight.id}
                            </Typography>
                            {isMultiSite && (
                              <Chip
                                label='マルチサイト'
                                size='small'
                                variant='outlined'
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography
                              variant='caption'
                              color='text.secondary'>
                              開始予定:{' '}
                              {new Date(
                                flight.estimatedStartTime
                              ).toLocaleTimeString('ja-JP', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                            {isMultiSite && (
                              <Typography
                                variant='caption'
                                color='text.secondary'
                                sx={{ ml: 2 }}>
                                {sites.length}拠点 •{' '}
                                {flight.drones?.length ?? 1}機
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        ))}

        {/* フッター: 全フライト表示リンク */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            fullWidth
            variant='text'
            startIcon={<FlightTakeoffIcon />}
            onClick={() => navigate('/schedule')}>
            すべてのフライトを表示
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default UTMTodayScheduleSummaryCard
