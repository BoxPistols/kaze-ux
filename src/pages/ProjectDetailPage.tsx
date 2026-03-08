// src/pages/ProjectDetailPage.tsx
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DescriptionIcon from '@mui/icons-material/Description'
import DevicesIcon from '@mui/icons-material/Devices'
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff'
import HistoryIcon from '@mui/icons-material/History'
import InfoIcon from '@mui/icons-material/Info'
import MapIcon from '@mui/icons-material/Map'
import PeopleIcon from '@mui/icons-material/People'
import SaveIcon from '@mui/icons-material/Save'
import {
  Box,
  Button,
  Card,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material'
import {
  useState,
  useMemo,
  useEffect,
  useCallback,
  type SyntheticEvent,
} from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'

import MapApp from '@/features/map/App'
import { getFlightPlansByProjectId } from '@/mocks/utmMockData'
import useUTMStore from '@/store/utmStore'
import type { FlightPlanStatus } from '@/types/utmDataModel'

// map-auto-waypointからクローンしたアプリケーション
// @ts-expect-error - map-auto-waypointはJSXファイルのため型定義なし

// 飛行計画ステータスのラベル
const FLIGHT_PLAN_STATUS_LABELS: Record<FlightPlanStatus, string> = {
  draft: '下書き',
  pending: '承認待ち',
  approved: '承認済み',
  ready: '準備完了',
  in_flight: '飛行中',
  completed: '完了',
  aborted: '中止',
  cancelled: 'キャンセル',
}

// タブ定義（プロジェクトレベル）
const tabs = [
  { id: 'overview', label: '概要', icon: <InfoIcon /> },
  { id: 'flight-plans', label: '飛行計画', icon: <FlightTakeoffIcon /> },
  { id: 'area', label: 'エリア', icon: <MapIcon /> },
  { id: 'devices', label: 'デバイス', icon: <DevicesIcon /> },
  { id: 'members', label: 'メンバー', icon: <PeopleIcon /> },
  { id: 'logs', label: '飛行ログ', icon: <HistoryIcon /> },
  { id: 'notes', label: 'メモ', icon: <DescriptionIcon /> },
]

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // URLパラメータからタブを取得
  const tabParam = searchParams.get('tab') ?? 'overview'

  // 現在のタブ
  const [activeTab, setActiveTab] = useState(tabParam)

  // プロジェクトに紐づく飛行計画を取得
  const flightPlans = useMemo(() => {
    if (!id) return []
    return getFlightPlansByProjectId(id)
  }, [id])

  // スナックバー管理
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  // ストアからプロジェクトデータを取得
  const { projects, updateProjectFlightArea: _updateProjectFlightArea } =
    useUTMStore()
  const project = useMemo(
    () => projects.find((p) => p.id === id),
    [projects, id]
  )

  // 飛行エリアを保存
  const handleSaveFlightArea = useCallback(() => {
    if (!id) return

    // TODO: map-auto-waypointから飛行エリアデータを取得
    // 現在は仮のモック保存処理

    // 将来的な実装イメージ:
    // const mapData = mapAppRef.current?.getFlightAreaData()
    // const flightArea: FlightArea = {
    //   name: project?.name ?? '飛行エリア',
    //   type: 'polygon',
    //   coordinates: mapData.coordinates,
    //   maxAltitude: mapData.maxAltitude ?? 150,
    //   minAltitude: mapData.minAltitude ?? 0,
    //   color: '#3B82F6',
    // }
    // _updateProjectFlightArea(id, flightArea)

    setSnackbarMessage('飛行エリアを保存しました（開発中）')
    setSnackbarOpen(true)
  }, [id])

  // URL パラメータ同期
  useEffect(() => {
    const newParams = new URLSearchParams()
    if (activeTab && activeTab !== 'overview') {
      newParams.set('tab', activeTab)
    }
    setSearchParams(newParams, { replace: true })
  }, [activeTab, setSearchParams])

  const handleTabChange = (_event: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
  }

  // 現在のタブインデックスを取得
  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab)
  const tabValue = currentTabIndex >= 0 ? activeTab : 'preflight'

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ヘッダー + 水平タブ */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}>
        {/* ヘッダー行 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 1.5,
          }}>
          <Button
            variant='outlined'
            size='small'
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/project')}
            sx={{
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'divider',
              },
            }}>
            戻る
          </Button>
          <Typography variant='h6' fontWeight='bold'>
            プロジェクト詳細: {id}
          </Typography>
        </Box>

        {/* 水平タブナビゲーション */}
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant='scrollable'
          scrollButtons='auto'
          sx={{
            px: 2,
            minHeight: 48,
            '& .MuiTab-root': {
              minHeight: 48,
              textTransform: 'none',
              fontWeight: 500,
            },
          }}>
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              value={tab.id}
              label={tab.label}
              icon={tab.icon}
              iconPosition='start'
              sx={{ gap: 1 }}
            />
          ))}
        </Tabs>
      </Box>

      {/* コンテンツエリア（フル幅） */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {/* 概要タブ */}
        {activeTab === 'overview' && (
          <Box sx={{ p: 3 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant='h4' gutterBottom>
                概要
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                プロジェクトID: {id}
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
                作成日: 2026-02-01
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
                ステータス: {project?.status ?? '進行中'}
              </Typography>
              <Typography variant='body1' color='text.secondary' sx={{ mt: 1 }}>
                説明: {project?.description ?? '説明なし'}
              </Typography>
            </Card>
          </Box>
        )}

        {/* 飛行計画タブ */}
        {activeTab === 'flight-plans' && (
          <Box sx={{ p: 3 }}>
            <Card sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}>
                <Box>
                  <Typography variant='h4' gutterBottom>
                    飛行計画一覧
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    このプロジェクトに紐づく飛行計画の一覧です。各飛行計画をクリックすると詳細が表示されます。
                  </Typography>
                </Box>
                <Button
                  variant='contained'
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/project/${id}/flight-plan/new`)}
                  sx={{ minWidth: 140 }}>
                  新規作成
                </Button>
              </Box>

              {flightPlans.length === 0 ? (
                <Alert severity='info'>
                  このプロジェクトにはまだ飛行計画がありません。
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>飛行計画名</TableCell>
                        <TableCell>予定日</TableCell>
                        <TableCell>予定時刻</TableCell>
                        <TableCell>機体</TableCell>
                        <TableCell>ステータス</TableCell>
                        <TableCell>準備状況</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {flightPlans.map((plan) => (
                        <TableRow
                          key={plan.id}
                          hover
                          sx={{
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                          onClick={() => {
                            // TODO: 飛行計画詳細ページに遷移
                          }}>
                          <TableCell>{plan.name}</TableCell>
                          <TableCell>{plan.scheduledDate}</TableCell>
                          <TableCell>
                            {plan.scheduledStartTime} - {plan.scheduledEndTime}
                          </TableCell>
                          <TableCell>{plan.aircraftId}</TableCell>
                          <TableCell>
                            <Chip
                              label={FLIGHT_PLAN_STATUS_LABELS[plan.status]}
                              size='small'
                              color={
                                plan.status === 'approved' ||
                                plan.status === 'ready'
                                  ? 'success'
                                  : plan.status === 'in_flight'
                                    ? 'primary'
                                    : plan.status === 'completed'
                                      ? 'default'
                                      : plan.status === 'cancelled' ||
                                          plan.status === 'aborted'
                                        ? 'error'
                                        : 'warning'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={
                                plan.preflightStatus === 'completed'
                                  ? '準備完了'
                                  : plan.preflightStatus === 'in_progress'
                                    ? '準備中'
                                    : plan.preflightStatus === 'failed'
                                      ? '準備失敗'
                                      : '未着手'
                              }
                              size='small'
                              color={
                                plan.preflightStatus === 'completed'
                                  ? 'success'
                                  : plan.preflightStatus === 'in_progress'
                                    ? 'warning'
                                    : plan.preflightStatus === 'failed'
                                      ? 'error'
                                      : 'default'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Card>
          </Box>
        )}

        {/* エリアタブ */}
        {activeTab === 'area' && (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}>
            {/* マップツール（フルスクリーン） */}
            <Box
              className='map-auto-waypoint-wrapper'
              sx={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                // map-auto-waypointのスタイルを確実に適用
                '& .app': {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  overflow: 'visible !important',
                },
                '& .app .app-main': {
                  overflow: 'visible !important',
                },
                '& .app .map-section': {
                  overflow: 'visible !important',
                },
                // map-auto-waypointのサイドバー透明度修正
                '& .app .sidebar': {
                  backgroundColor:
                    'var(--color-bg-elevated, #1a1f2e) !important',
                  backdropFilter: 'none !important',
                  WebkitBackdropFilter: 'none !important',
                  opacity: '1 !important',
                },
                '& .app .sidebar.collapsed': {
                  backgroundColor:
                    'var(--color-bg-elevated, #1a1f2e) !important',
                },
                '& .app .app-header': {
                  backgroundColor: 'var(--color-bg, #0f1419) !important',
                  backdropFilter: 'none !important',
                  WebkitBackdropFilter: 'none !important',
                },
                '& .app .search-section': {
                  backgroundColor: 'transparent !important',
                },
                '& .app .panel-content': {
                  backgroundColor: 'transparent !important',
                },
                '& .app .sidebar-collapsed-content': {
                  backgroundColor:
                    'var(--color-bg-elevated, #1a1f2e) !important',
                },
                // MapLibreキャンバスのz-index調整
                '& .maplibregl-canvas-container': {
                  zIndex: 0,
                },
                '& .maplibregl-canvas': {
                  zIndex: 0,
                },
                // レイヤーコントロール（右上）を表示
                '& .app [class*="mapControls"]': {
                  display: 'flex !important',
                  visibility: 'visible !important',
                  opacity: '1 !important',
                  zIndex: 9000,
                  pointerEvents: 'auto !important',
                  backdropFilter: 'none !important',
                  WebkitBackdropFilter: 'none !important',
                },
              }}>
              <MapApp />
            </Box>

            {/* 保存ボタン */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9001,
              }}>
              <Button
                variant='contained'
                size='large'
                startIcon={<SaveIcon />}
                onClick={handleSaveFlightArea}
                sx={{
                  bgcolor: 'primary.main',
                  boxShadow: 3,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    boxShadow: 6,
                  },
                }}>
                飛行エリアを保存
              </Button>
            </Box>
          </Box>
        )}

        {/* デバイスタブ */}
        {activeTab === 'devices' && (
          <Box sx={{ p: 3 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant='h4' gutterBottom>
                デバイス
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                プロジェクトに割り当てられたデバイス一覧
              </Typography>
            </Card>
          </Box>
        )}

        {/* メンバータブ */}
        {activeTab === 'members' && (
          <Box sx={{ p: 3 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant='h4' gutterBottom>
                メンバー
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                プロジェクトメンバー・権限管理
              </Typography>
            </Card>
          </Box>
        )}

        {/* 飛行ログタブ */}
        {activeTab === 'logs' && (
          <Box sx={{ p: 3 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant='h4' gutterBottom>
                飛行ログ
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                飛行履歴・テレメトリデータ
              </Typography>
            </Card>
          </Box>
        )}

        {/* メモタブ */}
        {activeTab === 'notes' && (
          <Box sx={{ p: 3 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant='h4' gutterBottom>
                メモ
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                プロジェクトノート・コメント
              </Typography>
            </Card>
          </Box>
        )}
      </Box>

      {/* 保存完了通知 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity='success'
          variant='filled'>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ProjectDetailPage
