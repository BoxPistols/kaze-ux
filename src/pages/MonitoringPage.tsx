/**
 * MonitoringPage - 運航監視ページ（マルチサイト対応）
 *
 * 複数拠点での同時飛行を監視する包括的なモニタリングハブ
 * - マルチサイトタブナビゲーション
 * - 3列レイアウト（ドローンリスト | マップ | テレメトリー）
 * - リアルタイムテレメトリー
 * - 衝突アラート、気象更新
 */

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'

import { UTMSiteTabNavigation, UTMEnhancedAlertPanel } from '@/components/utm'
import {
  MonitoringSiteProvider,
  useMonitoringSite,
} from '@/contexts/MonitoringSiteContext'
import {
  createMultiSiteScenario,
  createDefaultScenario,
} from '@/mocks/utmMultiDroneScenarios'
import { getFlightSites, isSingleSiteFlight } from '@/utils/utmHelpers'

// モニタリングコンテンツ（MonitoringSiteProvider内で使用）
function MonitoringContent(): JSX.Element {
  const { activeDrones, selectedDrone, setSelectedDroneId } =
    useMonitoringSite()

  // 現在のサイトのドローンIDリスト
  const activeDroneIds = activeDrones.map((d) => d.droneId)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* メインコンテンツ */}
      <Grid container sx={{ flex: 1 }}>
        {/* 左カラム: ドローンリスト */}
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            height: { xs: '300px', md: '100%' },
            overflow: 'auto',
            borderRight: { md: 1 },
            borderColor: { md: 'divider' },
          }}>
          <Box sx={{ p: 2 }}>
            <Typography variant='h6' fontWeight='bold' gutterBottom>
              アクティブドローン
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              gutterBottom
              display='block'>
              {activeDrones.length}機飛行中
            </Typography>

            <Box
              sx={{
                mt: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}>
              {activeDrones.map((drone) => (
                <Card
                  key={drone.droneId}
                  variant='outlined'
                  sx={{
                    cursor: 'pointer',
                    bgcolor:
                      selectedDrone?.droneId === drone.droneId
                        ? 'action.selected'
                        : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Typography
                      variant='subtitle2'
                      fontWeight='bold'
                      gutterBottom>
                      {drone.droneName}
                    </Typography>
                    <Typography
                      variant='caption'
                      color='text.secondary'
                      gutterBottom
                      display='block'>
                      操縦者: {drone.pilotName}
                    </Typography>

                    <Grid container spacing={1} sx={{ mt: 0.5 }}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant='caption' color='text.secondary'>
                          バッテリー
                        </Typography>
                        <Typography variant='body2' fontWeight='bold'>
                          {drone.batteryLevel}%
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant='caption' color='text.secondary'>
                          高度
                        </Typography>
                        <Typography variant='body2' fontWeight='bold'>
                          {drone.position.altitude}m
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant='caption' color='text.secondary'>
                          速度
                        </Typography>
                        <Typography variant='body2' fontWeight='bold'>
                          {drone.position.speed}m/s
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant='caption' color='text.secondary'>
                          通信
                        </Typography>
                        <Typography variant='body2' fontWeight='bold'>
                          {drone.signalStrength}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </Grid>

        {/* 中央カラム: マップビュー */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            height: { xs: '400px', md: '100%' },
            position: 'relative',
            bgcolor: 'grey.100',
          }}>
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Typography variant='h6' color='text.secondary'>
              マップビュー（3D）
            </Typography>
            <Typography
              variant='caption'
              color='text.secondary'
              display='block'
              sx={{ mt: 1 }}>
              UTMMapPanel3D統合予定
            </Typography>
          </Box>
        </Grid>

        {/* 右カラム: テレメトリー */}
        <Grid
          size={{ xs: 12, md: 3 }}
          sx={{
            height: { xs: '300px', md: '100%' },
            overflow: 'auto',
            borderLeft: { md: 1 },
            borderColor: { md: 'divider' },
          }}>
          <Box sx={{ p: 2 }}>
            <Typography variant='h6' fontWeight='bold' gutterBottom>
              テレメトリー
            </Typography>

            {selectedDrone ? (
              <Box>
                <Typography variant='subtitle2' gutterBottom>
                  {selectedDrone.droneName}
                </Typography>
                <Typography variant='caption' color='text.secondary'>
                  選択されたドローンの詳細テレメトリー
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    gutterBottom
                    display='block'>
                    位置情報
                  </Typography>
                  <Typography variant='body2'>
                    緯度: {selectedDrone.position.latitude.toFixed(6)}
                  </Typography>
                  <Typography variant='body2'>
                    経度: {selectedDrone.position.longitude.toFixed(6)}
                  </Typography>
                  <Typography variant='body2'>
                    高度: {selectedDrone.position.altitude}m
                  </Typography>
                  <Typography variant='body2'>
                    方位: {selectedDrone.position.heading}°
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    gutterBottom
                    display='block'>
                    飛行モード
                  </Typography>
                  <Typography variant='body2'>
                    {selectedDrone.flightMode === 'auto'
                      ? '自動'
                      : selectedDrone.flightMode === 'manual'
                        ? '手動'
                        : selectedDrone.flightMode}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant='caption'
                    color='text.secondary'
                    gutterBottom
                    display='block'>
                    ステータス
                  </Typography>
                  <Typography variant='body2'>
                    {selectedDrone.status === 'in_flight'
                      ? '飛行中'
                      : selectedDrone.status === 'preflight'
                        ? 'プリフライト'
                        : selectedDrone.status}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Alert severity='info' sx={{ mt: 2 }}>
                <AlertTitle>ドローン未選択</AlertTitle>
                左のリストからドローンを選択してください
              </Alert>
            )}
          </Box>
        </Grid>
      </Grid>

      {/* 下部パネル: タイムラインとアラート */}
      <Box
        sx={{
          height: 200,
          borderTop: 1,
          borderColor: 'divider',
          display: 'flex',
          overflow: 'hidden',
        }}>
        {/* フライトタイムライン */}
        <Box
          sx={{
            flex: 1,
            borderRight: 1,
            borderColor: 'divider',
            p: 2,
            overflow: 'auto',
          }}>
          <Typography variant='subtitle2' fontWeight='bold' gutterBottom>
            フライトタイムライン
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            UTMFlightTimeline統合予定
          </Typography>
        </Box>

        {/* アラートパネル */}
        <Box sx={{ width: 300, overflow: 'hidden' }}>
          <UTMEnhancedAlertPanel
            height='100%'
            droneIds={activeDroneIds}
            onDroneSelect={(droneId) => setSelectedDroneId(droneId)}
          />
        </Box>
      </Box>
    </Box>
  )
}

function MonitoringPage(): JSX.Element {
  const { flightId } = useParams<{ flightId?: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const siteParam = searchParams.get('site')
  const droneParam = searchParams.get('drone')

  // フライトデータ取得（URLパラメータまたはデフォルト）
  const flight = useMemo(() => {
    if (flightId === 'multi-site-001') {
      const [multiSiteFlight] = createMultiSiteScenario()
      return multiSiteFlight
    }
    if (flightId) {
      // flightIdが指定されている場合はデフォルトシナリオから探す
      const [defaultFlight] = createDefaultScenario()
      return defaultFlight
    }
    // フライトID未指定の場合はマルチサイトシナリオを表示
    const [multiSiteFlight] = createMultiSiteScenario()
    return multiSiteFlight
  }, [flightId])

  const sites = useMemo(() => getFlightSites(flight), [flight])
  const isMultiSite = useMemo(() => !isSingleSiteFlight(flight), [flight])

  // サイト切替ハンドラ
  const handleSiteChange = (newSiteId: string): void => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('site', newSiteId)
    setSearchParams(newParams)
  }

  // 初期サイトID決定
  const initialSiteId = useMemo(() => {
    if (siteParam && sites.find((s) => s.id === siteParam)) {
      return siteParam
    }
    return flight.primarySiteId ?? sites[0]?.id ?? null
  }, [siteParam, sites, flight.primarySiteId])

  if (!flight) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity='error'>
          <AlertTitle>フライトが見つかりません</AlertTitle>
          <Typography variant='body2'>フライトID: {flightId}</Typography>
        </Alert>
      </Box>
    )
  }

  return (
    <MonitoringSiteProvider
      flight={flight}
      initialSiteId={initialSiteId}
      initialDroneId={droneParam}>
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* ヘッダーバー */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant='outlined'
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  borderColor: 'divider',
                },
              }}>
              戻る
            </Button>
            <Box>
              <Typography variant='h5' fontWeight='bold'>
                運航監視
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                フライトID: {flight.id}
              </Typography>
            </Box>
          </Box>
          <Button
            variant='contained'
            color='success'
            startIcon={<CheckCircleIcon />}
            onClick={() => navigate(`/postflight/${flightId ?? flight.id}`)}
            sx={{ minWidth: 160 }}>
            フライト完了
          </Button>
        </Box>

        {/* サイトタブナビゲーション（マルチサイトの場合のみ） */}
        {isMultiSite && sites.length > 1 && (
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <UTMSiteTabNavigation
              sites={sites}
              activeSiteId={initialSiteId ?? sites[0].id}
              onSiteChange={handleSiteChange}
              flightStatus='in_flight'
            />
          </Box>
        )}

        {/* メインコンテンツ */}
        <MonitoringContent />
      </Box>
    </MonitoringSiteProvider>
  )
}

export default MonitoringPage
